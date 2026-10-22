const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { createInitialDatabase } = require("./data/seed");

const app = express();
// Trust the first reverse-proxy hop (Render, Railway, Fly.io, nginx) so req.ip
// reflects the real visitor IP for rate-limiting and req.secure reflects HTTPS.
app.set("trust proxy", 1);
const PORT = Number(process.env.PORT || 3000);
const HOST = process.env.HOST || "0.0.0.0";
const DB_PATH = process.env.FLC_DB_PATH || path.join(__dirname, "data", "db.json");
const BACKUP_DIR = path.join(path.dirname(DB_PATH), "backups");
const BACKUP_KEEP = 14;
const APP_VERSION = require("./package.json").version;
const STARTED_AT = new Date();

// ============================================================================
// OPERATIONS LAYER — safe writes, backups, health, logging
// ============================================================================
// The school's whole database is one JSON document. It is written atomically
// (temp file + rename) so a crash mid-write cannot truncate it, and a rotating
// copy is kept in data/backups — the ICT department copies that folder off the
// server nightly (see README, Security).
function backupDb(reason) {
  try {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
    const stamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
    const file = path.join(BACKUP_DIR, `db-${stamp}-${String(reason || "manual").replace(/[^a-z0-9-]/gi, "")}.json`);
    fs.writeFileSync(file, JSON.stringify(db, null, 2), "utf8");
    const keep = fs.readdirSync(BACKUP_DIR).filter((f) => f.endsWith(".json")).sort();
    while (keep.length > BACKUP_KEEP) {
      fs.unlinkSync(path.join(BACKUP_DIR, keep.shift()));
    }
    return file;
  } catch (err) {
    console.error("[backup] could not write a backup:", err.message);
    return null;
  }
}

function lastBackup() {
  try {
    const files = fs.readdirSync(BACKUP_DIR).filter((f) => f.endsWith(".json")).sort();
    if (!files.length) return null;
    const stat = fs.statSync(path.join(BACKUP_DIR, files[files.length - 1]));
    return { file: files[files.length - 1], at: stat.mtime.toISOString(), count: files.length };
  } catch (err) {
    return null;
  }
}

function dbSizeKb() {
  try {
    return Math.round(fs.statSync(DB_PATH).size / 1024);
  } catch (err) {
    return 0;
  }
}

function uptimeSeconds() {
  return Math.round((Date.now() - STARTED_AT.getTime()) / 1000);
}

app.use(cors());
app.use(express.json({ limit: "2mb" }));

// ============================================================================
// SECURITY LAYER
// ============================================================================
// Frame embedding is deliberately allowed (the school's own hosting embeds the
// public page); everything else is hardened. See Help Centre -> Security for the
// live checklist and GET /api/security/status for the machine-readable version.
app.use((req, res, next) => {
  res.removeHeader("X-Frame-Options");
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("X-Permitted-Cross-Domain-Policies", "none");
  res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=(), payment=()");
  res.setHeader("Cross-Origin-Resource-Policy", "same-origin");
  // Inline scripts/styles are needed by the existing portal pages; frame-ancestors
  // keeps the public site embeddable while blocking every other origin.
  res.setHeader(
    "Content-Security-Policy",
    [
      "default-src 'self'",
      "img-src 'self' data:",
      "style-src 'self' 'unsafe-inline'",
      "script-src 'self' 'unsafe-inline'",
      "connect-src 'self'",
      "form-action 'self'",
      "base-uri 'self'",
      "frame-ancestors *"
    ].join("; ")
  );
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, X-FLC-Token");
  if (req.method === "OPTIONS") return res.sendStatus(204);
  next();
});

// --- Rate limiting (in memory; the school server is the only entry point) ---
const RATE_LIMIT = {
  // A school office or ICT lab shares one public address, so the per-device ceiling has to
  // be generous; the real brute-force defence is the per-account lockout below.
  "auth": { windowMs: 60 * 1000, max: 60 },
  "public-write": { windowMs: 60 * 1000, max: 30 },
  "api": { windowMs: 60 * 1000, max: 600 },
  "enquiry": { windowMs: 10 * 60 * 1000, max: 5 }
};
const rateBuckets = new Map();

function rateLimited(bucketName, key) {
  const rule = RATE_LIMIT[bucketName];
  const now = Date.now();
  const bucketKey = bucketName + ":" + key;
  const hits = (rateBuckets.get(bucketKey) || []).filter((t) => now - t < rule.windowMs);
  hits.push(now);
  rateBuckets.set(bucketKey, hits);
  if (rateBuckets.size > 5000) rateBuckets.clear();
  return hits.length > rule.max;
}

function clientKey(req) {
  return (req.ip || req.socket.remoteAddress || "unknown") + "|" + String((req.body && req.body.email) || "").toLowerCase();
}

// --- Account lockout after repeated failed sign-ins ---
const LOCKOUT = { threshold: 6, minutes: 10 };
const failedSignIns = new Map();

function lockState(email) {
  const rec = failedSignIns.get(String(email || "").toLowerCase());
  if (!rec) return { locked: false, failures: 0 };
  if (rec.lockedUntil && rec.lockedUntil > Date.now()) {
    return { locked: true, failures: rec.failures, minutesLeft: Math.ceil((rec.lockedUntil - Date.now()) / 60000) };
  }
  return { locked: false, failures: rec.failures };
}

function noteFailedSignIn(email) {
  const key = String(email || "").toLowerCase();
  const rec = failedSignIns.get(key) || { failures: 0, lockedUntil: 0 };
  rec.failures += 1;
  if (rec.failures >= LOCKOUT.threshold) rec.lockedUntil = Date.now() + LOCKOUT.minutes * 60000;
  failedSignIns.set(key, rec);
  return rec;
}

function clearFailedSignIns(email) {
  failedSignIns.delete(String(email || "").toLowerCase());
}

// --- Signed-in session helpers used by the routes below ---
function requireSession(req, res) {
  const token = req.get("x-flc-token") || req.query.token || (req.body && req.body._token);
  const session = sessionFor(token);
  if (!session) {
    res.status(401).json({ ok: false, error: "Sign in to continue." });
    return null;
  }
  return session;
}

// Every change to the system must come from a signed-in account. Only the public
// intake routes (sign-in, forgotten password, consent and enquiry forms) are open.
const PUBLIC_WRITES = new Set([
  "/api/auth/login",
  "/api/auth/forgot",
  "/api/auth/session",
  "/api/auth/logout",
  "/api/consents",
  "/api/enquiries"
]);

app.use((req, res, next) => {
  const mutating = ["POST", "PUT", "PATCH", "DELETE"].includes(req.method);
  if (!mutating || !req.path.startsWith("/api/") || PUBLIC_WRITES.has(req.path)) return next();
  if (rateLimited("api", clientKey(req))) {
    return res.status(429).json({ ok: false, error: "Too many requests. Please slow down." });
  }
  /* These three prove ownership by the token in their own body — signing out or
     changing your own password must work from any account. */
  if (["/api/auth/logout", "/api/auth/password", "/api/auth/session"].includes(req.path)) return next();

  const session = sessionFor(req.get("x-flc-token") || (req.body && (req.body._token || req.body.token)));
  if (!session) return res.status(401).json({ ok: false, error: "Sign in to make changes." });

  /* Not every signed-in person may change everything. The office roles are scoped:
     only an administrator (or ICT) may touch the school's configuration, its data
     files or the accounts; teachers write learning records; the bursar writes money
     records. Anything not listed here falls back to administrators only. */
  const role = session.role;
  const isAdmin = role === "admin" || role === "Administrator" || session.isIct;
  const ALLOWED = [
    { test: (p) => p.startsWith("/api/auth/"), roles: ["admin", "teacher", "finance", "parent", "Administrator"] },
    { test: (p) => p.startsWith("/api/assessments"), roles: ["teacher", "admin", "Administrator"] },
    { test: (p) => p.startsWith("/api/attendance"), roles: ["teacher", "admin", "Administrator"] },
    { test: (p) => p.startsWith("/api/timetable"), roles: ["teacher", "admin", "Administrator"] },
    { test: (p) => p.startsWith("/api/payments") || p.startsWith("/api/expenses") || p.startsWith("/api/fee-structures"),
      roles: ["finance", "admin", "Administrator"] },
    { test: (p) => p.startsWith("/api/communications"), roles: ["teacher", "admin", "Administrator"] },
    { test: (p) => p.startsWith("/api/students") || p.startsWith("/api/staff") || p.startsWith("/api/operations"),
      roles: ["admin", "Administrator"] }
  ];
  const rule = ALLOWED.find((r) => r.test(req.path));
  const permitted = rule ? rule.roles.includes(role) || isAdmin : isAdmin;
  if (!permitted) {
    addAuditLog(session.name, `Blocked an unauthorised ${req.method} ${req.path} (role: ${role})`, "Security");
    saveDb(db);
    return res.status(403).json({
      ok: false,
      error: "Your account does not have permission to make this change. Ask the administrator."
    });
  }

  req.actor = session.name;
  res.locals.actor = session.name;
  next();
});

// Load or initialize persistent database
function loadDb() {
  try {
    if (fs.existsSync(DB_PATH)) {
      const raw = fs.readFileSync(DB_PATH, "utf8");
      return JSON.parse(raw);
    }
    const bundledDb = path.join(__dirname, "data", "db.json");
    if (path.resolve(DB_PATH) !== path.resolve(bundledDb) && fs.existsSync(bundledDb)) {
      const seeded = JSON.parse(fs.readFileSync(bundledDb, "utf8"));
      saveDb(seeded);
      console.log(`[boot] initialised ${DB_PATH} from bundled data/db.json`);
      return seeded;
    }
  } catch (err) {
    console.error("Error reading db.json, recreating from seed:", err.message);
  }
  const initial = createInitialDatabase();
  saveDb(initial);
  return initial;
}

function saveDb(data) {
  fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
  const tmp = DB_PATH + ".tmp";
  fs.writeFileSync(tmp, JSON.stringify(data, null, 2), "utf8");
  fs.renameSync(tmp, DB_PATH);   // atomic: readers never see a half-written file
}

let db = loadDb();

// Databases created before portal sign-in existed have no accounts yet — seed them once.
if (!Array.isArray(db.accounts) || db.accounts.length === 0) {
  const fresh = createInitialDatabase();
  db.accounts = fresh.accounts;
  db.sessions = db.sessions || [];
  saveDb(db);
}

// Databases created before the Help Centre existed have no knowledge base yet.
if (!Array.isArray(db.helpArticles) || !db.helpArticles.length) {
  const fresh = createInitialDatabase();
  db.helpArticles = fresh.helpArticles;
  db.passwordResetRequests = db.passwordResetRequests || [];
  saveDb(db);
}
if (!db.systemConfig.siteContent) {
  db.systemConfig.siteContent = createInitialDatabase().systemConfig.siteContent;
  saveDb(db);
}
if (!db.systemConfig.financeConfig.paymentChannels) {
  db.systemConfig.financeConfig.paymentChannels = createInitialDatabase().systemConfig.financeConfig.paymentChannels;
  saveDb(db);
}

// A copy on every boot, then one a day while the server is up.
backupDb("boot");
setInterval(() => backupDb("daily"), 24 * 60 * 60 * 1000).unref();

function addAuditLog(actor, action, moduleName) {
  const now = new Date();
  const formatted = now.toISOString().replace("T", " ").slice(0, 16);
  db.auditLogs.unshift({
    id: "log_" + Date.now() + "_" + Math.random().toString(36).slice(2, 6),
    timestamp: formatted,
    actor: actor || "System Admin",
    action,
    module: moduleName || "System"
  });
  if (db.auditLogs.length > 60) {
    db.auditLogs = db.auditLogs.slice(0, 60);
  }
}


/* ------------------------ Temporary password issue ----------------------- */
// A readable temporary password the office can dictate over the phone. It is hashed
// into the account immediately; the readable copy lives only on the reset request.
function makeTempPassword() {
  const letters = "ABCDEFGHJKLMNPQRSTUVWXYZ";
  const digits = "23456789";
  let out = "FLC-";
  for (let i = 0; i < 3; i += 1) out += letters[crypto.randomInt(letters.length)];
  for (let i = 0; i < 4; i += 1) out += digits[crypto.randomInt(digits.length)];
  return out;
}

function setAccountPassword(account, password) {
  account.salt = crypto.randomBytes(12).toString("hex");
  account.passwordHash = crypto.scryptSync(String(password), account.salt, 32).toString("hex");
  account.passwordChangedAt = new Date().toISOString().replace("T", " ").slice(0, 16);
}

function canHelpDesk(session) {
  return Boolean(session) && (session.role === "admin" || session.isIct);
}

/* ---------------------------- Portal sign-in ----------------------------- */
const SESSION_LIMIT = 25;

function findAccount(email) {
  const needle = String(email || "").trim().toLowerCase();
  return (db.accounts || []).find((a) => String(a.email).toLowerCase() === needle);
}

function passwordMatches(account, password) {
  if (!account || !password) return false;
  const candidate = crypto.scryptSync(String(password), String(account.salt), 32);
  const stored = Buffer.from(String(account.passwordHash), "hex");
  return candidate.length === stored.length && crypto.timingSafeEqual(candidate, stored);
}

function issueSession(account) {
  const token = crypto.randomBytes(24).toString("hex");
  db.sessions = (db.sessions || []).filter((s) => s.token !== token);
  db.sessions.unshift({
    token,
    email: account.email,
    role: account.role,
    name: account.name,
    signedInAt: new Date().toISOString().replace("T", " ").slice(0, 16)
  });
  db.sessions = db.sessions.slice(0, SESSION_LIMIT);
  return token;
}

/* Temporary passwords are shown to the help desk once and never written to disk. */
const issuedTempPasswords = new Map(); // requestId -> { tempPassword, at }

/* Strip credential material from any payload that echoes the database. */
function sanitizeDb(source) {
  const copy = JSON.parse(JSON.stringify(source || {}));
  (copy.accounts || []).forEach((a) => { delete a.salt; delete a.passwordHash; delete a.demoPassword; });
  (copy.passwordResetRequests || []).forEach((r) => { delete r.tempPassword; });
  copy.sessions = [];
  return copy;
}

function sessionFor(token) {
  return (db.sessions || []).find((s) => s.token === token) || null;
}

app.post("/api/auth/login", (req, res) => {
  const { email, password } = req.body || {};
  if (rateLimited("auth", clientKey(req))) {
    return res.status(429).json({ ok: false, error: "Too many sign-in attempts from this device. Please wait a minute." });
  }
  const lock = lockState(email);
  if (lock.locked) {
    addAuditLog("Security", `Blocked a sign-in attempt for a locked account (${email})`, "Security");
    return res.status(429).json({
      ok: false,
      error: `Too many failed attempts. This account is locked for ${lock.minutesLeft} more minute(s).`
    });
  }
  const account = findAccount(email);
  if (!account || !account.active || !passwordMatches(account, password)) {
    const rec = noteFailedSignIn(email);
    const left = Math.max(0, LOCKOUT.threshold - rec.failures);
    addAuditLog("Security", `Refused a sign-in for ${email || "an unknown address"}`, "Security");
    return res.status(401).json({
      ok: false,
      error: left > 0 && left <= 2
        ? `Those details do not match an active account. ${left} attempt(s) left before the account locks.`
        : "Those details do not match an active account."
    });
  }
  clearFailedSignIns(email);
  const token = issueSession(account);
  addAuditLog(account.name, `Signed in to the ${account.role} portal`, "Security");
  saveDb(db);
  res.json({
    ok: true,
    token,
    user: {
      email: account.email,
      role: account.role,
      name: account.name,
      isIct: Boolean(account.isIct),
      mustChangePassword: Boolean(account.mustChangePassword)
    },
    auditLogs: db.auditLogs
  });
});

/* ------------------------ Forgotten password request --------------------- */
app.post("/api/auth/forgot", (req, res) => {
  if (rateLimited("auth", clientKey(req))) {
    return res.status(429).json({ ok: false, error: "Too many requests. Please wait a minute and try again." });
  }
  const email = String((req.body && req.body.email) || "").trim();
  const account = findAccount(email);
  let requestId = null;
  if (account) {
    const open = (db.passwordResetRequests || []).find((r) => r.email === account.email && r.status === "open");
    if (!open) {
      requestId = "rst_" + Date.now().toString(36);
      db.passwordResetRequests.unshift({
        id: requestId,
        email: account.email,
        role: account.role,
        name: account.name,
        requestedAt: new Date().toISOString().replace("T", " ").slice(0, 16),
        status: "open",
        handledBy: null,
        handledAt: null,
        tempPassword: null,
        note: String((req.body && req.body.note) || "").slice(0, 300)
      });
      if (db.passwordResetRequests.length > 60) db.passwordResetRequests = db.passwordResetRequests.slice(0, 60);
    }
    addAuditLog("Portal", `Password reset requested for ${account.email}`, "Security");
    saveDb(db);
  }
  // The same answer either way, so the screen cannot be used to discover school accounts.
  res.json({
    ok: true,
    requestId,
    message:
      "If that address belongs to a school account, the administrator or the ICT department can see the request now. " +
      "They will set a temporary password and tell you what it is. Check the Help Centre for what to do next."
  });
});

/* ------------------------- Help Centre endpoints ------------------------- */
app.get("/api/help/requests", (req, res) => {
  const session = requireSession(req, res);
  if (!session) return;
  if (!canHelpDesk(session)) {
    return res.status(403).json({ ok: false, error: "Only the administrator or the ICT department can see password-reset requests." });
  }
  const now = Date.now();
  for (const [id, rec] of issuedTempPasswords) if (now - rec.at > 30 * 60 * 1000) issuedTempPasswords.delete(id);
  const requests = (db.passwordResetRequests || []).map((r) => {
    const live = issuedTempPasswords.get(r.id);
    const copy = { ...r };
    delete copy.tempPassword;
    if (live && r.status === "issued") copy.tempPassword = live.tempPassword;
    return copy;
  });
  res.json({ ok: true, requests, articles: db.helpArticles || [] });
});

app.post("/api/help/requests/:id/resolve", (req, res) => {
  const session = requireSession(req, res);
  if (!session || !canHelpDesk(session)) {
    return res.status(403).json({ ok: false, error: "Only the administrator or the ICT department can reset passwords." });
  }
  const request = (db.passwordResetRequests || []).find((r) => r.id === req.params.id);
  if (!request) return res.status(404).json({ ok: false, error: "That reset request is no longer on the list." });
  const account = findAccount(request.email);
  if (!account) return res.status(404).json({ ok: false, error: "That account no longer exists." });
  const tempPassword = makeTempPassword();
  setAccountPassword(account, tempPassword);
  account.mustChangePassword = true;
  account.demoPassword = null; // never publish a real password on the public sign-in screen
  db.sessions = (db.sessions || []).filter((x) => x.email !== account.email); // sign every device out
  request.status = "issued";
  request.handledBy = session.name;
  request.handledAt = new Date().toISOString().replace("T", " ").slice(0, 16);
  issuedTempPasswords.set(request.id, { tempPassword, at: Date.now() });
  addAuditLog(session.name, `Issued a temporary password for ${account.email}`, "Security");
  saveDb(db);
  res.json({ ok: true, tempPassword, request: { ...request, tempPassword }, auditLogs: db.auditLogs });
});

app.post("/api/help/requests/:id/dismiss", (req, res) => {
  const session = requireSession(req, res);
  if (!session || !canHelpDesk(session)) {
    return res.status(403).json({ ok: false, error: "Only the administrator or the ICT department can close reset requests." });
  }
  const request = (db.passwordResetRequests || []).find((r) => r.id === req.params.id);
  if (!request) return res.status(404).json({ ok: false, error: "That reset request is no longer on the list." });
  request.status = "dismissed";
  request.handledBy = session.name;
  request.handledAt = new Date().toISOString().replace("T", " ").slice(0, 16);
  addAuditLog(session.name, `Closed a password reset request for ${request.email}`, "Security");
  saveDb(db);
  res.json({ ok: true, requests: (db.passwordResetRequests || []).map(({ tempPassword, ...r }) => r), auditLogs: db.auditLogs });
});

app.post("/api/help/articles", (req, res) => {
  const session = requireSession(req, res);
  if (!session || session.role !== "admin") {
    return res.status(403).json({ ok: false, error: "Only the administrator can edit Help Centre articles." });
  }
  const { title, body, category, tags } = req.body || {};
  if (!title || !body) return res.status(400).json({ ok: false, error: "An article needs a title and a body." });
  const article = {
    id: "help_" + Date.now().toString(36),
    category: category || "ICT support",
    title: String(title).slice(0, 160),
    body: String(body).slice(0, 4000),
    tags: Array.isArray(tags) ? tags.slice(0, 8) : String(tags || "").split(",").map((t) => t.trim()).filter(Boolean).slice(0, 8),
    updatedAt: new Date().toISOString().replace("T", " ").slice(0, 16),
    updatedBy: session.name
  };
  db.helpArticles.unshift(article);
  addAuditLog(session.name, `Added the Help Centre article "${article.title}"`, "Help Centre");
  saveDb(db);
  res.json({ ok: true, article, articles: db.helpArticles, auditLogs: db.auditLogs });
});

app.delete("/api/help/articles/:id", (req, res) => {
  const session = requireSession(req, res);
  if (!session || session.role !== "admin") {
    return res.status(403).json({ ok: false, error: "Only the administrator can edit Help Centre articles." });
  }
  const before = (db.helpArticles || []).length;
  db.helpArticles = (db.helpArticles || []).filter((a) => a.id !== req.params.id);
  if (db.helpArticles.length === before) return res.status(404).json({ ok: false, error: "That article is already gone." });
  addAuditLog(session.name, "Removed a Help Centre article", "Help Centre");
  saveDb(db);
  res.json({ ok: true, articles: db.helpArticles, auditLogs: db.auditLogs });
});

/* ------------------------ Active sessions (devices) ---------------------- */
app.get("/api/auth/sessions", (req, res) => {
  const session = requireSession(req, res);
  if (!session) return;
  const mine = req.get("x-flc-token") || req.query.token;
  const all = (db.sessions || []).map((s) => ({
    token: s.token.slice(0, 8) + "…",
    email: s.email,
    role: s.role,
    name: s.name,
    signedInAt: s.signedInAt,
    current: s.token === mine
  }));
  res.json({
    ok: true,
    sessions: session.role === "admin" ? all : all.filter((s) => s.email === session.email)
  });
});

app.post("/api/auth/sessions/revoke", (req, res) => {
  const session = requireSession(req, res);
  if (!session) return;
  const { token, others } = req.body || {};
  const mine = req.get("x-flc-token") || (req.body && req.body._token);

  if (others) {
    // sign every device out except this one
    db.sessions = (db.sessions || []).filter((s) => s.email !== session.email || s.token === mine);
    addAuditLog(session.name, "Signed out all of their other devices", "Security");
    saveDb(db);
    return res.json({ ok: true, signedOut: "all other devices", sessions: (db.sessions || []).length, auditLogs: db.auditLogs });
  }

  const target = (db.sessions || []).find((s) => s.token === token || s.token.startsWith(String(token || "").replace("…", "")));
  if (!target) return res.status(404).json({ ok: false, error: "That device is no longer signed in." });
  if (session.role !== "admin" && target.email !== session.email) {
    return res.status(403).json({ ok: false, error: "Only the administrator can sign out another person's device." });
  }
  db.sessions = db.sessions.filter((s) => s !== target);
  addAuditLog(session.name, `Signed out a device (${target.email})`, "Security");
  saveDb(db);
  res.json({ ok: true, sessions: (db.sessions || []).length, auditLogs: db.auditLogs });
});

/* ------------------- Website editing bar (layout & words) ---------------- */
app.put("/api/config/site", (req, res) => {
  const session = requireSession(req, res);
  if (!session || session.role !== "admin") {
    return res.status(403).json({ ok: false, error: "Only the administrator can change the website." });
  }
  const { siteContent, typography, paymentChannels } = req.body || {};
  if (siteContent) {
    db.systemConfig.siteContent = {
      ...db.systemConfig.siteContent,
      ...siteContent,
      updatedAt: new Date().toISOString().replace("T", " ").slice(0, 16),
      updatedBy: session.name
    };
  }
  if (typography) {
    db.systemConfig.typography = {
      ...db.systemConfig.typography,
      ...typography,
      updatedAt: new Date().toISOString().replace("T", " ").slice(0, 16)
    };
  }
  if (Array.isArray(paymentChannels)) {
    db.systemConfig.financeConfig.paymentChannels = paymentChannels.slice(0, 12);
  }
  addAuditLog(session.name, `Updated the website content (${Object.keys(siteContent || {}).join(", ") || "typography"})`, "Website");
  saveDb(db);
  res.json({
    ok: true,
    siteContent: db.systemConfig.siteContent,
    typography: db.systemConfig.typography,
    paymentChannels: db.systemConfig.financeConfig.paymentChannels,
    auditLogs: db.auditLogs
  });
});

/* ---------------------- System status (administrator) -------------------- */
app.get("/api/system/status", (req, res) => {
  const session = requireSession(req, res);
  if (!session) return;
  const accounts = db.accounts || [];
  res.json({
    ok: true,
    version: APP_VERSION,
    node: process.version,
    platform: process.platform,
    uptimeSeconds: uptimeSeconds(),
    startedAt: STARTED_AT.toISOString(),
    memoryMb: Math.round(process.memoryUsage().rss / 1024 / 1024),
    databaseKb: dbSizeKb(),
    databasePath: path.relative(__dirname, DB_PATH),
    lastBackup: lastBackup(),
    backupRetention: BACKUP_KEEP,
    counts: {
      students: (db.students || []).length,
      staff: (db.staff || []).length,
      payments: (db.payments || []).length,
      accounts: accounts.length,
      sessions: (db.sessions || []).length,
      auditEntries: (db.auditLogs || []).length,
      helpArticles: (db.helpArticles || []).length,
      openPasswordResets: (db.passwordResetRequests || []).filter((r) => r.status === "open").length
    },
    temporaryChannels: (db.systemConfig.financeConfig.paymentChannels || []).filter((c) => c.enabled && c.temporary).map((c) => c.label)
  });
});

app.post("/api/system/backup", (req, res) => {
  const session = requireSession(req, res);
  if (!session) return;
  const file = backupDb("manual-" + session.role);
  if (!file) return res.status(500).json({ ok: false, error: "The backup could not be written. Check the server's disk space and permissions." });
  addAuditLog(session.name, "Took a manual backup of the school database", "System");
  saveDb(db);
  res.json({ ok: true, file: path.basename(file), lastBackup: lastBackup(), auditLogs: db.auditLogs });
});

/* --------------------------- Security status ----------------------------- */
app.get("/api/security/status", (req, res) => {
  const session = requireSession(req, res);
  if (!session) return;
  const accounts = db.accounts || [];
  res.json({
    ok: true,
    headers: {
      "Content-Security-Policy": "default-src 'self'; frame-ancestors *",
      "X-Content-Type-Options": "nosniff",
      "Referrer-Policy": "strict-origin-when-cross-origin",
      "Permissions-Policy": "camera=(), microphone=(), geolocation=(), payment=()",
      "Cross-Origin-Resource-Policy": "same-origin"
    },
    signIn: {
      passwordStorage: "salted scrypt (32-byte hash, per-account salt)",
      rateLimit: RATE_LIMIT.auth.max + " sign-in attempts a minute per device",
      lockout: LOCKOUT.threshold + " failed attempts locks the account for " + LOCKOUT.minutes + " minutes",
      lockedAccounts: [...failedSignIns.entries()].filter(([, r]) => r.lockedUntil > Date.now()).map(([e]) => e),
      sessions: (db.sessions || []).length,
      sessionCap: SESSION_LIMIT
    },
    accounts: accounts.map((a) => ({
      email: a.email,
      role: a.role,
      active: a.active,
      isIct: Boolean(a.isIct),
      mustChangePassword: Boolean(a.mustChangePassword),
      lastPasswordChange: a.passwordChangedAt || null
    })),
    openResetRequests: (db.passwordResetRequests || []).filter((r) => r.status === "open").length,
    checklist: [
      { item: "Passwords hashed with scrypt + per-account salt", state: "on" },
      { item: "Password material never sent to the browser", state: "on" },
      { item: "Sign-in rate limiting", state: "on" },
      { item: "Account lockout on repeated failures", state: "on" },
      { item: "Signed-in account required for every change", state: "on" },
      { item: "Sessions capped, revoked on sign-out and on password change", state: "on" },
      { item: "Security headers (CSP, nosniff, referrer, permissions)", state: "on" },
      { item: "Audit trail of sign-ins, failures and changes", state: "on" },
      { item: "HTTPS/TLS on the public address", state: "deployment" },
      { item: "Automatic off-server backups of data/db.json", state: "deployment" }
    ],
    auditLogs: (db.auditLogs || []).slice(0, 40)
  });
});

app.get("/api/auth/session", (req, res) => {
  const session = sessionFor(req.query.token);
  if (!session) return res.status(401).json({ ok: false, error: "Session expired. Please sign in again." });
  res.json({ ok: true, user: { email: session.email, role: session.role, name: session.name }, signedInAt: session.signedInAt });
});

app.post("/api/auth/logout", (req, res) => {
  const token = (req.body || {}).token;
  const session = sessionFor(token);
  if (session) {
    db.sessions = db.sessions.filter((s) => s.token !== token);
    addAuditLog(session.name, "Signed out", "Security");
    saveDb(db);
  }
  res.json({ ok: true });
});

app.post("/api/auth/password", (req, res) => {
  const { token, currentPassword, newPassword } = req.body || {};
  const session = sessionFor(token);
  if (!session) return res.status(401).json({ ok: false, error: "Session expired. Please sign in again." });
  const account = findAccount(session.email);
  if (!account || !passwordMatches(account, currentPassword)) {
    return res.status(403).json({ ok: false, error: "The current password is not correct." });
  }
  if (String(newPassword || "").length < 8) {
    return res.status(400).json({ ok: false, error: "Use at least 8 characters for the new password." });
  }
  account.salt = crypto.randomBytes(12).toString("hex");
  account.passwordHash = crypto.scryptSync(String(newPassword), account.salt, 32).toString("hex");
  account.passwordChangedAt = new Date().toISOString().replace("T", " ").slice(0, 16);
  account.mustChangePassword = false;
  // a password the account owner has chosen is never published as a demonstration hint
  account.demoPassword = null;
  db.sessions = db.sessions.filter((s) => s.email !== account.email || s.token === token); // keep this device signed in
  addAuditLog(account.name, "Changed the portal password", "Security");
  saveDb(db);
  res.json({ ok: true, passwordChangedAt: account.passwordChangedAt, auditLogs: db.auditLogs });
});

// Public front page (home) and protected application shell
app.get("/", (req, res) => res.sendFile(path.join(__dirname, "public", "index.html")));
app.get("/app", (req, res) => res.sendFile(path.join(__dirname, "public", "app.html")));

// Home-page design chooser (public) — /designs, plus a bare /preview alias
app.get("/designs", (req, res) => res.sendFile(path.join(__dirname, "public", "designs.html")));
app.get("/preview", (req, res) => res.sendFile(path.join(__dirname, "public", "index.html")));
app.get("/colours", (req, res) => res.sendFile(path.join(__dirname, "public", "colours.html")));

// A line per mutating API call — who changed what, how long it took, and how it ended.
app.use((req, res, next) => {
  if (!["POST", "PUT", "PATCH", "DELETE"].includes(req.method) || !req.path.startsWith("/api/")) return next();
  const began = Date.now();
  res.on("finish", () => {
    const actor = res.locals.actor || (req.body && req.body.email) || "-";
    console.log(`[api] ${req.method} ${req.path} ${res.statusCode} ${Date.now() - began}ms actor=${actor}`);
  });
  next();
});

// Serve static frontend files. The school's images and fonts never change under
// the same name, so they are cached hard; the pages themselves are not.
app.use("/assets", express.static(path.join(__dirname, "public", "assets"), { maxAge: "30d", immutable: true }));
app.use(express.static(path.join(__dirname, "public"), { etag: true, maxAge: 0 }));

// ============================================================================
// BOOTSTRAP & OVERVIEW API
// ============================================================================
/* ----------------------------------------------------------------------------
   Bootstrap payloads.

   The website and the portal both start from /api/bootstrap, but they must not
   receive the same data. An anonymous visitor gets the school's published
   information and the non-identifying slices the live figures are computed from;
   the record itself — guardians' contacts, staff salaries, payment history,
   audit trail, reset requests and account material — is only sent to a valid
   session. This is the boundary that keeps pupil and staff data off the public
   web (Kenya Data Protection Act, 2019).
   -------------------------------------------------------------------------- */
const PUBLIC_CONFIG_KEYS = ["branding", "siteContent", "typography", "academicConfig", "financeConfig", "terms", "modules", "customFields"];

function publicBootstrap() {
  const cfg = {};
  PUBLIC_CONFIG_KEYS.forEach((k) => {
    if (db.systemConfig && db.systemConfig[k] !== undefined) cfg[k] = db.systemConfig[k];
  });
  return {
    service: "faith-learning-centre-erp",
    scope: "public",
    systemConfig: cfg,
    // published by the school: fees, dates, routes, houses, notices, help articles
    feeStructures: db.feeStructures || [],
    events: db.events || [],
    communications: (db.communications || []).map((c) => ({
      id: c.id, date: c.date, channel: c.channel, audience: c.audience,
      title: c.title, message: c.message, sender: c.sender
    })),
    transportRoutes: db.transportRoutes || [],
    boardingHouses: db.boardingHouses || [],
    helpArticles: db.helpArticles || [],
    libraryBooks: (db.libraryBooks || []).map((b) => ({ title: b.title })),
    portalRoles: [...new Set((db.accounts || []).map((a) => a.role))],
    // non-identifying slices: the live figures are computed from these
    students: (db.students || []).map((st) => ({
      id: st.id, grade: st.grade, stream: st.stream, gender: st.gender,
      status: st.status, boardingStatus: st.boardingStatus, attendanceRate: st.attendanceRate
    })),
    staff: (db.staff || []).map((st) => ({ id: st.id, role: st.role, department: st.department, status: st.status })),
    assessments: db.assessments || {}
  };
}

function sessionBootstrap(session) {
  const isAdmin = session && (session.role === "admin" || session.role === "Administrator" || session.isIct);
  const accounts = (db.accounts || []).map((a) => ({
    id: a.id, email: a.email, role: a.role, name: a.name, active: a.active,
    demoPassword: a.demoPassword || null, passwordChangedAt: a.passwordChangedAt || null
  }));
  const payload = { ...db, scope: "session", accounts, sessions: [] };
  if (!isAdmin) {
    // only an administrator/ICT hands out temporary passwords
    payload.passwordResetRequests = (db.passwordResetRequests || []).map((r) => ({ ...r, tempPassword: undefined }));
  }
  return payload;
}

app.get("/api/bootstrap", (req, res) => {
  const token = req.get("x-flc-token") || req.query.token;
  const session = token ? sessionFor(token) : null;
  res.json(session ? sessionBootstrap(session) : publicBootstrap());
});

// The running version, from package.json — one source of truth, read by the pages.
app.get("/version.js", (req, res) => {
  res.type("application/javascript").send(
    `window.FLC_META = { version: ${JSON.stringify(APP_VERSION)}, built: ${JSON.stringify(STARTED_AT.toISOString())}, service: "faith-learning-centre-erp" };`
  );
});

// Liveness probe for the school's hosting and monitoring (no secrets in it).
app.get("/healthz", (req, res) => {
  res.json({
    ok: true,
    service: "faith-learning-centre-erp",
    version: APP_VERSION,
    uptimeSeconds: uptimeSeconds(),
    databaseKb: dbSizeKb(),
    lastBackup: lastBackup(),
    time: new Date().toISOString()
  });
});

// ============================================================================
// BACKEND CUSTOMIZATION ZONE APIs
// ============================================================================

// 1. Update School Branding & Visual Theme
app.put("/api/config/branding", (req, res) => {
  db.systemConfig.branding = {
    ...db.systemConfig.branding,
    ...req.body
  };
  addAuditLog(
    req.body._actor || "Super Admin",
    `Updated school branding & theme (${db.systemConfig.branding.schoolName})`,
    "Backend Customization Zone"
  );
  saveDb(db);
  res.json({ ok: true, branding: db.systemConfig.branding, auditLogs: db.auditLogs });
});

// 2. Toggle / Configure System Modules
app.put("/api/config/modules", (req, res) => {
  const { modules } = req.body;
  if (modules && typeof modules === "object") {
    Object.keys(modules).forEach((key) => {
      if (db.systemConfig.modules[key]) {
        db.systemConfig.modules[key] = {
          ...db.systemConfig.modules[key],
          ...modules[key]
        };
      } else {
        db.systemConfig.modules[key] = modules[key];
      }
    });
  }
  addAuditLog(
    req.body._actor || "Super Admin",
    "Updated active system modules in Feature Manager",
    "Backend Customization Zone"
  );
  saveDb(db);
  res.json({ ok: true, modules: db.systemConfig.modules, auditLogs: db.auditLogs });
});

// 3. Update Academic & Grading Engine Config
app.put("/api/config/academic", (req, res) => {
  db.systemConfig.academicConfig = {
    ...db.systemConfig.academicConfig,
    ...req.body
  };
  addAuditLog(
    req.body._actor || "Super Admin",
    `Updated academic engine (${db.systemConfig.academicConfig.gradingMode.toUpperCase()} mode, ${db.systemConfig.academicConfig.currentTerm} ${db.systemConfig.academicConfig.currentYear})`,
    "Backend Customization Zone"
  );
  saveDb(db);
  res.json({ ok: true, academicConfig: db.systemConfig.academicConfig, auditLogs: db.auditLogs });
});

// 4. Custom Fields Schema Builder (Create / Toggle / Delete)
app.post("/api/config/custom-fields", (req, res) => {
  const { entity, label, type, options, required } = req.body;
  if (!label) {
    return res.status(400).json({ error: "Field label is required" });
  }
  const key =
    label
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "_")
      .replace(/^_|_$/g, "") +
    "_" +
    Date.now().toString().slice(-3);

  const newField = {
    id: "cf_" + Date.now(),
    entity: entity || "student",
    key,
    label,
    type: type || "text",
    options: Array.isArray(options)
      ? options
      : typeof options === "string" && options.trim()
      ? options.split(",").map((s) => s.trim()).filter(Boolean)
      : [],
    required: !!required,
    active: true
  };
  db.systemConfig.customFields.push(newField);
  addAuditLog(
    "Super Admin",
    `Added custom ${newField.entity} field "${newField.label}" (${newField.type})`,
    "Backend Customization Zone"
  );
  saveDb(db);
  res.json({ ok: true, customFields: db.systemConfig.customFields, auditLogs: db.auditLogs });
});

app.delete("/api/config/custom-fields/:id", (req, res) => {
  const { id } = req.params;
  const target = db.systemConfig.customFields.find((f) => f.id === id);
  db.systemConfig.customFields = db.systemConfig.customFields.filter((f) => f.id !== id);
  addAuditLog(
    "Super Admin",
    `Removed custom field "${target ? target.label : id}"`,
    "Backend Customization Zone"
  );
  saveDb(db);
  res.json({ ok: true, customFields: db.systemConfig.customFields, auditLogs: db.auditLogs });
});

// 5. Update Finance, M-Pesa & SMS Gateway Config
app.put("/api/config/finance", (req, res) => {
  db.systemConfig.financeConfig = {
    ...db.systemConfig.financeConfig,
    ...req.body
  };
  addAuditLog(
    "Super Admin",
    `Updated Finance & M-Pesa Paybill (${db.systemConfig.financeConfig.mpesaPaybill}) settings`,
    "Backend Customization Zone"
  );
  saveDb(db);
  res.json({ ok: true, financeConfig: db.systemConfig.financeConfig, auditLogs: db.auditLogs });
});

// 6. Update Role Permissions Matrix
app.put("/api/config/permissions", (req, res) => {
  db.systemConfig.rolePermissions = {
    ...db.systemConfig.rolePermissions,
    ...req.body
  };
  addAuditLog(
    "Super Admin",
    "Updated role permissions matrix for Teacher, Bursar & Parent portals",
    "Backend Customization Zone"
  );
  saveDb(db);
  res.json({ ok: true, rolePermissions: db.systemConfig.rolePermissions, auditLogs: db.auditLogs });
});

// 7. Reset or Import Database
app.post("/api/config/reset", (req, res) => {
  backupDb("before-reset");            // never destroy data without a copy
  const actorSession = sessionFor(req.get("x-flc-token") || (req.body && req.body._token));
  db = createInitialDatabase();
  // The administrator who pressed the button stays signed in; nobody else survives.
  if (actorSession) {
    db.sessions = [actorSession];
    const account = findAccount(actorSession.email);
    if (account) { account.demoPassword = null; }
  }
  addAuditLog(actorSession ? actorSession.name : "Super Admin", "Restored FAITH LEARNING CENTRE default system snapshot", "Backend Customization Zone");
  saveDb(db);
  res.json({ ok: true, restored: true, summary: { students: db.students.length, staff: db.staff.length, accounts: db.accounts.length }, auditLogs: db.auditLogs });
});

app.post("/api/config/import", (req, res) => {
  const imported = req.body;
  if (!imported || !imported.systemConfig || !imported.students) {
    return res.status(400).json({ error: "Invalid school database JSON structure" });
  }
  backupDb("before-import");
  const actorSession = sessionFor(req.get("x-flc-token") || (req.body && req.body._token));
  db = imported;
  if (actorSession) db.sessions = [actorSession];
  addAuditLog(actorSession ? actorSession.name : "Super Admin", "Imported full school configuration & database JSON", "Backend Customization Zone");
  saveDb(db);
  res.json({ ok: true, imported: true, summary: { students: db.students.length, staff: db.staff.length, accounts: db.accounts.length }, auditLogs: db.auditLogs });
});

// 8. Terms & Conditions / Policy Configuration
app.put("/api/config/terms", (req, res) => {
  db.systemConfig.terms = {
    ...db.systemConfig.terms,
    ...req.body,
    lastUpdated: new Date().toISOString().slice(0, 10)
  };
  addAuditLog(
    req.body._actor || "Super Admin",
    `Updated Terms & Conditions (v${db.systemConfig.terms.version}) and school policies`,
    "Backend Customization Zone"
  );
  saveDb(db);
  res.json({ ok: true, terms: db.systemConfig.terms, auditLogs: db.auditLogs });
});

// 8b. Choose which of the seven home-page designs the school publishes
app.put("/api/config/home-design", (req, res) => {
  const DESIGN_NAMES = {
    "1": "Classic Heritage",
    "2": "Split Panel",
    "3": "Editorial Broadsheet",
    "4": "Minimal Corporate",
    "5": "Bento Mosaic",
    "6": "Premium Dark",
    "7": "Admissions Focused",
    "8": "Collegiate Showcase"
  };
  const id = String(req.body.id ?? req.body.homeDesign ?? req.body.design ?? "").trim();
  if (!DESIGN_NAMES[id]) {
    return res.status(400).json({
      ok: false,
      error: `Unknown home page design "${id}". Available: ${Object.keys(DESIGN_NAMES).join(", ")}.`
    });
  }
  db.systemConfig.branding = { ...db.systemConfig.branding, homeDesign: id };
  addAuditLog(
    req.body._actor || "Super Admin",
    `Changed the public home page design to ${id} — ${DESIGN_NAMES[id]}`,
    "Backend Customization Zone"
  );
  saveDb(db);
  res.json({
    ok: true,
    homeDesign: id,
    name: DESIGN_NAMES[id],
    designName: DESIGN_NAMES[id],
    branding: db.systemConfig.branding,
    auditLogs: db.auditLogs
  });
});

// 9. Record Terms & Conditions acceptance (from public site or portal)
app.post("/api/consents", (req, res) => {
  if (rateLimited("api", clientKey(req))) {
    return res.status(429).json({ ok: false, error: "Too many requests. Please slow down." });
  }
  const clip = (v, n) => String(v == null ? "" : v).trim().slice(0, n);
  const { role, portal, termsVersion, ip } = req.body;
  const name = clip(req.body.name, 120);
  const previous = (db.consents || []).find(
    (c) => c.name === name && c.role === role && c.termsVersion === termsVersion
  );
  if (previous) {
    return res.json({ ok: true, alreadyAccepted: true, recordedAt: previous.acceptedAt || previous.timestamp });
  }
  const consent = {
    id: "cns_" + Date.now(),
    timestamp: new Date().toISOString().replace("T", " ").slice(0, 16),
    role: role || "parent",
    portal: portal || "Parent & Student Portal",
    name: name || "Portal User",
    termsVersion: termsVersion || db.systemConfig.terms.version,
    acceptedAt: new Date().toISOString().replace("T", " ").slice(0, 16),
    ip: ip || req.ip || "unavailable"
  };
  db.consents = db.consents || [];
  db.consents.unshift(consent);
  addAuditLog(
    consent.name,
    `Accepted the School Terms & Conditions v${consent.termsVersion} (${consent.portal})`,
    "Terms & Compliance"
  );
  saveDb(db);
  // a visitor receives their own receipt only — never the whole acceptance register
  res.json({
    ok: true,
    consent: { id: consent.id, name: consent.name, role: consent.role, portal: consent.portal, acceptedAt: consent.acceptedAt, termsVersion: consent.termsVersion }
  });
});

// 9b. The admissions office works the enquiry list: move it along, or remove spam
app.put("/api/enquiries/:id", (req, res) => {
  const enquiry = (db.enquiries || []).find((e) => e.id === req.params.id);
  if (!enquiry) return res.status(404).json({ ok: false, error: "That enquiry is no longer on the list." });
  const STATUSES = ["New", "Contacted", "Enrolled", "Archived"];
  const status = String((req.body || {}).status || "");
  if (!STATUSES.includes(status)) {
    return res.status(400).json({ ok: false, error: "Status must be one of: " + STATUSES.join(", ") + "." });
  }
  enquiry.status = status;
  enquiry.updatedAt = new Date().toISOString().replace("T", " ").slice(0, 16);
  if ((req.body || {}).note) enquiry.note = String(req.body.note).slice(0, 500);
  addAuditLog(req.actor || "Admissions", `Moved the enquiry from ${enquiry.parentName} to "${status}"`, "Admissions");
  saveDb(db);
  res.json({ ok: true, enquiry, enquiries: db.enquiries, auditLogs: db.auditLogs });
});

app.delete("/api/enquiries/:id", (req, res) => {
  const before = (db.enquiries || []).length;
  const gone = (db.enquiries || []).find((e) => e.id === req.params.id);
  db.enquiries = (db.enquiries || []).filter((e) => e.id !== req.params.id);
  if (db.enquiries.length === before) return res.status(404).json({ ok: false, error: "That enquiry is already gone." });
  addAuditLog(req.actor || "Admissions", `Removed the enquiry from ${gone.parentName}`, "Admissions");
  saveDb(db);
  res.json({ ok: true, enquiries: db.enquiries, auditLogs: db.auditLogs });
});

// 10. Public admissions enquiry (front page form)
app.post("/api/enquiries", (req, res) => {
  if (rateLimited("enquiry", clientKey(req))) {
    return res.status(429).json({ ok: false, error: "Too many enquiries from this device. Please try again later, or call the school office." });
  }
  const clip = (v, n) => String(v == null ? "" : v).trim().slice(0, n);
  const parentName = clip(req.body.parentName, 120);
  const phone = clip(req.body.phone, 40);
  const email = clip(req.body.email, 160);
  const learnerName = clip(req.body.learnerName, 120);
  const gradeOfInterest = clip(req.body.gradeOfInterest, 60);
  const boardingPreference = clip(req.body.boardingPreference, 40);
  const message = clip(req.body.message, 2000);
  if (!parentName || !phone) {
    return res.status(400).json({ error: "Parent name and phone number are required" });
  }
  if (phone.replace(/\D/g, "").length < 9) {
    return res.status(400).json({ error: "That phone number does not look complete — please include the full number." });
  }
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
    return res.status(400).json({ error: "That email address does not look complete." });
  }
  const enquiry = {
    id: "enq_" + Date.now(),
    date: new Date().toISOString().slice(0, 10),
    parentName,
    phone,
    email: email || "",
    learnerName: learnerName || "",
    gradeOfInterest: gradeOfInterest || "Not specified",
    boardingPreference: boardingPreference || "Day Scholar",
    message: message || "",
    status: "New"
  };
  db.enquiries = db.enquiries || [];
  db.enquiries.unshift(enquiry);
  addAuditLog("Public Website", `New admission enquiry from ${parentName} (${phone}) for ${gradeOfInterest || "unspecified grade"}`, "Admissions Enquiries");
  saveDb(db);
  res.json({ ok: true, enquiry });
});

// ============================================================================
// STUDENT INFORMATION SYSTEM (SIS) APIs
// ============================================================================
app.post("/api/students", (req, res) => {
  const body = req.body || {};
  // A learner must at least have a name and a class — never create a placeholder record.
  const missing = ["firstName", "lastName", "grade"].filter((k) => !String(body[k] == null ? "" : body[k]).trim());
  if (missing.length) {
    return res.status(400).json({ ok: false, error: "A learner needs " + missing.join(", ") + "." });
  }
  const count = db.students.length + 1;
  const admNo = body.admNo || `${db.systemConfig.financeConfig.mpesaAccountPrefix}/2026/${String(count).padStart(3, "0")}`;

  // Determine default billed amount from feeStructure
  let defaultBilled = Number(body.billedAmount) || 35000;
  if (!body.billedAmount) {
    const fsMatch = db.feeStructures.find((fs) => fs.grades.includes(body.grade));
    if (fsMatch) {
      defaultBilled = body.boardingStatus === "Boarding" ? fsMatch.totalBoarding : fsMatch.totalDay;
    }
  }
  const transportFee = Number(body.transportFee) || 0;
  const totalBilled = defaultBilled + transportFee;
  const paidAmount = Number(body.paidAmount) || 0;

  const newStudent = {
    id: "stu_" + Date.now(),
    admNo,
    nemisUpi: body.nemisUpi || `KEM-${Math.floor(100000 + Math.random() * 900000)}X`,
    assessmentNo: body.assessmentNo || `KNEC-${Math.floor(1000000 + Math.random() * 9000000)}`,
    firstName: body.firstName || "New",
    lastName: body.lastName || "Learner",
    gender: body.gender || "Female",
    dob: body.dob || "2014-01-01",
    grade: body.grade || "Grade 7 (JSS)",
    stream: body.stream || "Faith",
    boardingStatus: body.boardingStatus || "Day",
    dormHouse: body.dormHouse || "N/A",
    transportRoute: body.transportRoute || "None",
    transportFee,
    guardianName: body.guardianName || "Guardian",
    guardianRelation: body.guardianRelation || "Parent",
    guardianPhone: body.guardianPhone || "+254 700 000 000",
    guardianEmail: body.guardianEmail || "",
    billedAmount: totalBilled,
    paidAmount,
    balance: Math.max(0, totalBilled - paidAmount),
    status: body.status || "Active",
    enrollmentDate: new Date().toISOString().slice(0, 10),
    attendanceRate: 100,
    coreCompetencies: body.coreCompetencies || {
      communication: "Meeting",
      criticalThinking: "Meeting",
      digitalLiteracy: "Meeting",
      citizenship: "Exceeding",
      selfEfficacy: "Meeting"
    },
    customData: body.customData || {}
  };

  db.students.unshift(newStudent);

  // Initialize default assessment scores for active learning areas
  const defaultAssess = {
    teacherComment: `${newStudent.firstName} has settled well into ${newStudent.grade} and shows positive attitude.`,
    principalComment: "Welcome to Faith Learning Centre! Keep striving for excellence."
  };
  db.systemConfig.academicConfig.learningAreas.forEach((la) => {
    defaultAssess[la.code] = { sba: 75, exam: 75 };
  });
  db.assessments[newStudent.id] = defaultAssess;

  addAuditLog(
    "Admissions Office",
    `Admitted learner ${newStudent.firstName} ${newStudent.lastName} (${newStudent.admNo}) into ${newStudent.grade}`,
    "Students & Admissions"
  );
  saveDb(db);
  res.json({ ok: true, student: newStudent, students: db.students, assessments: db.assessments, auditLogs: db.auditLogs });
});

app.put("/api/students/:id", (req, res) => {
  const { id } = req.params;
  const idx = db.students.findIndex((s) => s.id === id);
  if (idx === -1) return res.status(404).json({ error: "Student not found" });

  const updated = {
    ...db.students[idx],
    ...req.body,
    customData: {
      ...(db.students[idx].customData || {}),
      ...(req.body.customData || {})
    }
  };
  updated.billedAmount = Number(updated.billedAmount) || 0;
  updated.paidAmount = Number(updated.paidAmount) || 0;
  updated.balance = Math.max(0, updated.billedAmount - updated.paidAmount);

  db.students[idx] = updated;
  addAuditLog(
    "Admissions Office",
    `Updated profile for ${updated.firstName} ${updated.lastName} (${updated.admNo})`,
    "Students & Admissions"
  );
  saveDb(db);
  res.json({ ok: true, student: updated, students: db.students, auditLogs: db.auditLogs });
});

app.delete("/api/students/:id", (req, res) => {
  const { id } = req.params;
  const target = db.students.find((s) => s.id === id);
  db.students = db.students.filter((s) => s.id !== id);
  addAuditLog(
    "Admin",
    `Removed student record ${target ? target.firstName + " " + target.lastName : id}`,
    "Students & Admissions"
  );
  saveDb(db);
  res.json({ ok: true, students: db.students, auditLogs: db.auditLogs });
});

// ============================================================================
// ACADEMICS, CBC RUBRICS & MARKBOOK APIs
// ============================================================================
app.put("/api/assessments/:studentId", (req, res) => {
  const { studentId } = req.params;
  db.assessments[studentId] = {
    ...(db.assessments[studentId] || {}),
    ...req.body
  };
  const stu = db.students.find((s) => s.id === studentId);
  addAuditLog(
    req.body._actor || "Class Teacher",
    `Updated CBC & Exam assessment marks for ${stu ? stu.firstName + " " + stu.lastName : studentId}`,
    "Academics & CBC"
  );
  saveDb(db);
  res.json({ ok: true, assessments: db.assessments, auditLogs: db.auditLogs });
});

app.post("/api/assessments/bulk", (req, res) => {
  const { updates, subjectCode, grade } = req.body;
  if (updates && typeof updates === "object") {
    Object.keys(updates).forEach((studentId) => {
      if (!db.assessments[studentId]) db.assessments[studentId] = {};
      db.assessments[studentId] = {
        ...db.assessments[studentId],
        ...updates[studentId]
      };
    });
  }
  addAuditLog(
    req.body._actor || "Subject Teacher",
    `Saved markbook scores for ${grade || "Class"} (${subjectCode || "All Subjects"})`,
    "Academics & CBC"
  );
  saveDb(db);
  res.json({ ok: true, assessments: db.assessments, auditLogs: db.auditLogs });
});

// ============================================================================
// FINANCE, M-PESA & FEE STRUCTURES APIs
// ============================================================================
app.post("/api/payments", (req, res) => {
  const { studentId, amount, method, reference, paidBy, votehead } = req.body || {};
  if (!studentId || !(Number(amount) > 0)) {
    return res.status(400).json({ ok: false, error: "A payment needs a learner and an amount greater than zero." });
  }
  const stuIdx = db.students.findIndex((s) => s.id === studentId);
  if (stuIdx === -1) return res.status(404).json({ error: "Student not found" });

  const numAmount = Number(amount) || 0;
  if (numAmount <= 0) return res.status(400).json({ error: "Payment amount must be positive" });

  const stu = db.students[stuIdx];
  stu.paidAmount = (Number(stu.paidAmount) || 0) + numAmount;
  stu.balance = Math.max(0, (Number(stu.billedAmount) || 0) - stu.paidAmount);

  const randomCode =
    "UK" +
    String.fromCharCode(65 + Math.floor(Math.random() * 26)) +
    Math.floor(10 + Math.random() * 89) +
    Math.random().toString(36).substring(2, 7).toUpperCase();

  const payment = {
    id: "pay_" + Date.now(),
    receiptNo: `${db.systemConfig.financeConfig.mpesaAccountPrefix}-RCP-${db.systemConfig.academicConfig.currentYear}-${100 + db.payments.length + 1}`,
    studentId: stu.id,
    studentName: `${stu.firstName} ${stu.lastName}`,
    admNo: stu.admNo,
    grade: stu.grade,
    amount: numAmount,
    method: method || "M-Pesa Paybill",
    reference: reference || randomCode,
    paidBy: paidBy || `${stu.guardianName} (${stu.guardianPhone})`,
    date: new Date().toISOString().slice(0, 10),
    term: db.systemConfig.academicConfig.currentTerm,
    votehead: votehead || `${db.systemConfig.academicConfig.currentTerm} Tuition & School Fees`,
    recordedBy: req.body.recordedBy || db.systemConfig.branding.bursarName
  };

  db.payments.unshift(payment);

  // If autoSmsOnPayment is enabled, log SMS confirmation
  if (db.systemConfig.financeConfig.autoSmsOnPayment) {
    db.systemConfig.financeConfig.smsBalanceCredits = Math.max(
      0,
      (db.systemConfig.financeConfig.smsBalanceCredits || 1000) - 1
    );
  }

  addAuditLog(
    payment.recordedBy,
    `Received ${db.systemConfig.financeConfig.currency} ${numAmount.toLocaleString()} via ${payment.method} (${payment.reference}) for ${stu.firstName} ${stu.lastName}`,
    "Finance & M-Pesa"
  );
  saveDb(db);
  res.json({
    ok: true,
    payment,
    student: stu,
    students: db.students,
    payments: db.payments,
    financeConfig: db.systemConfig.financeConfig,
    auditLogs: db.auditLogs
  });
});

app.put("/api/fee-structures/:id", (req, res) => {
  const { id } = req.params;
  const idx = db.feeStructures.findIndex((fs) => fs.id === id);
  if (idx === -1) return res.status(404).json({ error: "Fee structure not found" });

  const updated = {
    ...db.feeStructures[idx],
    ...req.body
  };
  updated.tuition = Number(updated.tuition) || 0;
  updated.meals = Number(updated.meals) || 0;
  updated.activityCbc = Number(updated.activityCbc) || 0;
  updated.ictLibrary = Number(updated.ictLibrary) || 0;
  updated.boardingFee = Number(updated.boardingFee) || 0;
  updated.totalDay = updated.tuition + updated.meals + updated.activityCbc + updated.ictLibrary;
  updated.totalBoarding = updated.totalDay + updated.boardingFee;

  db.feeStructures[idx] = updated;
  addAuditLog(
    "Bursar",
    `Updated fee structure for ${updated.levelGroup} (Day: ${updated.totalDay.toLocaleString()}, Boarding: ${updated.totalBoarding.toLocaleString()})`,
    "Finance & M-Pesa"
  );
  saveDb(db);
  res.json({ ok: true, feeStructures: db.feeStructures, auditLogs: db.auditLogs });
});

app.post("/api/expenses", (req, res) => {
  const exp = {
    id: "exp_" + Date.now(),
    date: req.body.date || new Date().toISOString().slice(0, 10),
    category: req.body.category || "Operations",
    description: req.body.description || "School expense",
    amount: Number(req.body.amount) || 0,
    vendor: req.body.vendor || "Supplier",
    approvedBy: req.body.approvedBy || db.systemConfig.branding.principalName,
    status: "Paid"
  };
  db.expenses.unshift(exp);
  addAuditLog("Bursar", `Recorded expense: ${exp.description} (${exp.amount.toLocaleString()})`, "Finance & Expenses");
  saveDb(db);
  res.json({ ok: true, expenses: db.expenses, auditLogs: db.auditLogs });
});

// ============================================================================
// ATTENDANCE REGISTER API
// ============================================================================
app.post("/api/attendance", (req, res) => {
  const { date, records } = req.body || {};
  if (!date || !Array.isArray(records) || !records.length) {
    return res.status(400).json({ ok: false, error: "An attendance register needs a date and at least one learner." });
  }
  const targetDate = date || "2026-10-11";
  db.attendanceRecords[targetDate] = {
    ...(db.attendanceRecords[targetDate] || {}),
    ...(records || {})
  };
  addAuditLog(
    req.body._actor || "Class Teacher",
    `Saved daily attendance register for ${targetDate}`,
    "Attendance"
  );
  saveDb(db);
  res.json({ ok: true, attendanceRecords: db.attendanceRecords, auditLogs: db.auditLogs });
});

// ============================================================================
// STAFF, TIMETABLE, CAMPUS OPERATIONS & COMMUNICATIONS APIs
// ============================================================================
app.post("/api/staff", (req, res) => {
  const body = req.body || {};
  const missing = ["name", "role"].filter((k) => !String(body[k] == null ? "" : body[k]).trim());
  if (missing.length) {
    return res.status(400).json({ ok: false, error: "A staff record needs a " + missing.join(" and ") + "." });
  }
  const newStaff = {
    id: "stf_" + Date.now(),
    staffNo: body.staffNo || `FLC-STF-00${db.staff.length + 1}`,
    tscNo: body.tscNo || `TSC-${Math.floor(400000 + Math.random() * 500000)}`,
    name: body.name || "New Teacher",
    role: body.role || "Subject Teacher",
    department: body.department || "Academics",
    classAssigned: body.classAssigned || "Grade 7 (JSS)",
    subjects: Array.isArray(body.subjects)
      ? body.subjects
      : typeof body.subjects === "string"
      ? body.subjects.split(",").map((s) => s.trim()).filter(Boolean)
      : ["Mathematics"],
    phone: body.phone || "+254 700 000 000",
    email: body.email || "staff@faithlearningcentre.ac.ke",
    qualification: body.qualification || "B.Ed",
    grossSalary: Number(body.grossSalary) || 60000,
    status: "Active",
    customData: body.customData || {}
  };
  db.staff.push(newStaff);
  addAuditLog("HR / Principal", `Added staff member ${newStaff.name} (${newStaff.role})`, "Staff & Payroll");
  saveDb(db);
  res.json({ ok: true, staff: db.staff, auditLogs: db.auditLogs });
});

app.put("/api/timetable/:dayId", (req, res) => {
  const { dayId } = req.params;
  const idx = db.timetable.findIndex((d) => d.id === dayId);
  if (idx === -1) return res.status(404).json({ error: "Day not found" });
  db.timetable[idx] = {
    ...db.timetable[idx],
    ...req.body
  };
  addAuditLog("Academic Master", `Updated Master Timetable for ${db.timetable[idx].day}`, "Timetable");
  saveDb(db);
  res.json({ ok: true, timetable: db.timetable, auditLogs: db.auditLogs });
});

app.post("/api/operations/:collection", (req, res) => {
  const { collection } = req.params;
  const valid = ["transportRoutes", "boardingHouses", "libraryBooks", "disciplineMerits"];
  if (!valid.includes(collection)) {
    return res.status(400).json({ error: "Invalid collection" });
  }
  const item = {
    id: collection.slice(0, 2) + "_" + Date.now(),
    ...req.body
  };
  db[collection].unshift(item);
  addAuditLog("Admin", `Added new record in ${collection}`, "Campus Operations");
  saveDb(db);
  res.json({ ok: true, [collection]: db[collection], auditLogs: db.auditLogs });
});

app.post("/api/communications", (req, res) => {
  const { channel, audience, recipientsCount, sender } = req.body || {};
  const title = String((req.body || {}).title || "").trim().slice(0, 160);
  const message = String((req.body || {}).message || "").trim().slice(0, 4000);
  if (!title || !message) {
    return res.status(400).json({ ok: false, error: "A message needs a title and a body before it can be sent." });
  }
  const comm = {
    id: "comm_" + Date.now(),
    date: new Date().toISOString().replace("T", " ").slice(0, 16),
    channel: channel || "SMS Broadcast & Portal Notice",
    audience: audience || "All Parents & Guardians",
    title: title || "School Announcement",
    message: message || "",
    recipientsCount: Number(recipientsCount) || db.students.length,
    sender: sender || db.systemConfig.branding.principalName
  };
  db.communications.unshift(comm);
  db.systemConfig.financeConfig.smsBalanceCredits = Math.max(
    0,
    (db.systemConfig.financeConfig.smsBalanceCredits || 1000) - comm.recipientsCount
  );
  addAuditLog(
    comm.sender,
    `Sent ${comm.channel}: "${comm.title}" to ${comm.recipientsCount} recipients`,
    "Communications Hub"
  );
  saveDb(db);
  res.json({
    ok: true,
    communications: db.communications,
    financeConfig: db.systemConfig.financeConfig,
    auditLogs: db.auditLogs
  });
});

/* Anything else is a genuine 404. Serving the application shell for unknown
   URLs looked like a working page to search engines and uptime monitors. */
const NOT_FOUND_PAGE = `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1"/><meta name="robots" content="noindex"/>
<title>Page not found — FAITH LEARNING CENTRE</title>
<style>
  :root{color-scheme:light}
  body{margin:0;min-height:100vh;display:grid;place-items:center;background:#fff;color:#151215;
       font:16px/1.55 Rubik,"Segoe UI",system-ui,sans-serif}
  main{max-width:34rem;padding:2.5rem 1.5rem;text-align:center}
  .mark{width:52px;height:52px;border-radius:12px;margin:0 auto 1.2rem;
        background:linear-gradient(140deg,#3a1119,#e4002b)}
  h1{font-size:1.6rem;margin:0 0 .4rem}
  p{color:#5c5c5c;margin:.2rem 0 1.4rem}
  a{display:inline-block;margin:.25rem;padding:.6rem 1rem;border-radius:8px;text-decoration:none;
    font-weight:600;border:1px solid #d8d8d8;color:#151215}
  a.primary{background:#151215;border-color:#151215;color:#fff}
</style></head><body><main>
  <div class="mark"></div>
  <h1>That page could not be found</h1>
  <p>The link may be out of date. Everything the school publishes is one click away:</p>
  <a class="primary" href="/">The school website</a>
  <a href="/app">School portal</a>
  <a href="/#admissions">Admissions</a>
  <a href="/#contact">Contact us</a>
</main></body></html>`;

app.use((req, res) => {
  if (req.path.startsWith("/api/")) {
    return res.status(404).json({ ok: false, error: "No such endpoint" });
  }
  res.status(404).type("html").send(NOT_FOUND_PAGE);
});

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
process.on("uncaughtException", (err) => {
  console.error("[fatal] uncaught exception:", err && err.stack ? err.stack : err);
  try {
    saveDb(db);
    backupDb("crash");
  } catch (e) {}
  process.exit(1);
});
process.on("unhandledRejection", (reason) => {
  console.error("[warn] unhandled promise rejection:", reason);
});

let shuttingDown = false;
function shutdown(signal) {
  if (shuttingDown) return;
  shuttingDown = true;
  console.log(`[stop] ${signal} received — saving the school database and stopping.`);
  try {
    saveDb(db);
    backupDb("shutdown");
  } catch (err) {
    console.error("[stop] could not save on shutdown:", err.message);
  }
  server.close(() => process.exit(0));
  setTimeout(() => process.exit(0), 3000).unref();
}

const server = app.listen(PORT, HOST, () => {
  console.log(`FAITH LEARNING CENTRE ERP v${APP_VERSION} running at http://${HOST}:${PORT}`);
  console.log(`[boot] database ${path.relative(__dirname, DB_PATH)} (${dbSizeKb()} kB) · backups kept: ${BACKUP_KEEP}`);
});
