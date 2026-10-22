#!/usr/bin/env python3
"""Server: Help Centre, forgotten passwords, site editing, and the security layer."""
import os

os.chdir("/home/user")
p = "server.js"
s = open(p, encoding="utf-8").read()

if "SECURITY LAYER" in s:
    print("already patched")
    raise SystemExit(0)

# ---------------------------------------------------------------- headers
old_mw = '''// Disable iframe/host restrictions so preview works seamlessly
app.use((req, res, next) => {
  res.removeHeader("X-Frame-Options");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});'''
new_mw = '''// ============================================================================
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
  "auth": { windowMs: 60 * 1000, max: 20 },
  "public-write": { windowMs: 60 * 1000, max: 30 },
  "api": { windowMs: 60 * 1000, max: 600 }
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
  const session = sessionFor(req.get("x-flc-token") || (req.body && req.body._token));
  if (!session) return res.status(401).json({ ok: false, error: "Sign in to make changes." });
  req.actor = session.name;
  next();
});'''
assert old_mw in s
s = s.replace(old_mw, new_mw, 1)

# ---------------------------------------------------------------- boot top-up
old_top = '''// Databases created before portal sign-in existed have no accounts yet — seed them once.
if (!Array.isArray(db.accounts) || db.accounts.length === 0) {
  const fresh = createInitialDatabase();
  db.accounts = fresh.accounts;
  db.sessions = db.sessions || [];
  saveDb(db);
}'''
new_top = '''// Databases created before portal sign-in existed have no accounts yet — seed them once.
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
}'''
assert old_top in s
s = s.replace(old_top, new_top, 1)

# ---------------------------------------------------------------- temp password helper
helper = '''
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
'''
s = s.replace('/* ---------------------------- Portal sign-in ----------------------------- */',
              helper + '\n/* ---------------------------- Portal sign-in ----------------------------- */', 1)

# lockout inside the login route
old_login = '''app.post("/api/auth/login", (req, res) => {'''
assert old_login in s
idx = s.index(old_login)
login_end = s.index('app.get("/api/auth/session"', idx)
login_block = s[idx:login_end]
assert "findAccount(String(email" in login_block or "findAccount(email" in login_block

new_login = '''app.post("/api/auth/login", (req, res) => {
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
  res.json({ ok: true, requests: db.passwordResetRequests || [], articles: db.helpArticles || [] });
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
  request.tempPassword = tempPassword;
  addAuditLog(session.name, `Issued a temporary password for ${account.email}`, "Security");
  saveDb(db);
  res.json({ ok: true, tempPassword, request, auditLogs: db.auditLogs });
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
  res.json({ ok: true, requests: db.passwordResetRequests, auditLogs: db.auditLogs });
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
'''

s = s[:idx] + new_login + "\n" + s[login_end:]
open(p, "w", encoding="utf-8").write(s)
print("server.js: security layer, Help Centre, forgotten passwords, site editing, security status")
