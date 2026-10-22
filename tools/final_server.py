#!/usr/bin/env python3
"""Senior-developer operations layer: atomic writes, rotating backups, health and
status endpoints, session management, graceful shutdown, request logging."""
import os

os.chdir("/home/user")
p = "server.js"
s = open(p, encoding="utf-8").read()

if "OPERATIONS LAYER" in s:
    print("already patched")
    raise SystemExit(0)


def sub(old, new, why):
    global s
    assert old in s, "anchor missing: " + why
    s = s.replace(old, new, 1)


# ------------------------------------------------------------- version + paths
sub('''const app = express();
const PORT = process.env.PORT || 3000;
const DB_PATH = path.join(__dirname, "data", "db.json");''',
'''const app = express();
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
}''', "paths")

# ------------------------------------------------------------- atomic saveDb
sub('''function saveDb(data) {
  fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), "utf8");
}''',
'''function saveDb(data) {
  fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
  const tmp = DB_PATH + ".tmp";
  fs.writeFileSync(tmp, JSON.stringify(data, null, 2), "utf8");
  fs.renameSync(tmp, DB_PATH);   // atomic: readers never see a half-written file
}''', "saveDb")

# ------------------------------------------------------- request log + static
sub('''// Serve static frontend files
app.use(express.static(path.join(__dirname, "public")));''',
'''// A line per mutating API call — who changed what, how long it took, and how it ended.
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
app.use(express.static(path.join(__dirname, "public"), { etag: true, maxAge: 0 }));''', "static")

# ------------------------------------------------------------ actor for logs
sub('''  const session = sessionFor(req.get("x-flc-token") || (req.body && req.body._token));
  if (!session) return res.status(401).json({ ok: false, error: "Sign in to make changes." });
  req.actor = session.name;
  next();''',
'''  const session = sessionFor(req.get("x-flc-token") || (req.body && req.body._token));
  if (!session) return res.status(401).json({ ok: false, error: "Sign in to make changes." });
  req.actor = session.name;
  res.locals.actor = session.name;
  next();''', "actor")

# --------------------------------------------------------- health + status API
sub('''// ============================================================================
// BACKEND CUSTOMIZATION ZONE APIs
// ============================================================================''',
'''// Liveness probe for the school's hosting and monitoring (no secrets in it).
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
// ============================================================================''', "health")

sub('''/* --------------------------- Security status ----------------------------- */''',
'''/* ---------------------- System status (administrator) -------------------- */
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

/* --------------------------- Security status ----------------------------- */''', "system status")

# ------------------------------------------------------- session management
sub('''/* ------------------- Website editing bar (layout & words) ---------------- */''',
'''/* ------------------------ Active sessions (devices) ---------------------- */
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

/* ------------------- Website editing bar (layout & words) ---------------- */''', "sessions")

# ------------------------------------- backups before destructive operations
sub('''app.post("/api/config/reset", (req, res) => {
  db = createInitialDatabase();''',
'''app.post("/api/config/reset", (req, res) => {
  backupDb("before-reset");            // never destroy data without a copy
  db = createInitialDatabase();''', "reset backup")

sub('''app.post("/api/config/import", (req, res) => {
  const imported = req.body;
  if (!imported || !imported.systemConfig || !imported.students) {
    return res.status(400).json({ error: "Invalid school database JSON structure" });
  }
  db = imported;''',
'''app.post("/api/config/import", (req, res) => {
  const imported = req.body;
  if (!imported || !imported.systemConfig || !imported.students) {
    return res.status(400).json({ error: "Invalid school database JSON structure" });
  }
  backupDb("before-import");
  db = imported;''', "import backup")

# ------------------------------- password change clears demo hints + flags
sub('''  account.salt = crypto.randomBytes(12).toString("hex");
  account.passwordHash = crypto.scryptSync(String(newPassword), account.salt, 32).toString("hex");
  account.passwordChangedAt = new Date().toISOString().replace("T", " ").slice(0, 16);
  db.sessions = db.sessions.filter((s) => s.email !== account.email || s.token === token); // keep this device signed in
  addAuditLog(account.name, "Changed the portal password", "Security");
  saveDb(db);
  res.json({ ok: true, passwordChangedAt: account.passwordChangedAt, auditLogs: db.auditLogs });''',
'''  account.salt = crypto.randomBytes(12).toString("hex");
  account.passwordHash = crypto.scryptSync(String(newPassword), account.salt, 32).toString("hex");
  account.passwordChangedAt = new Date().toISOString().replace("T", " ").slice(0, 16);
  account.mustChangePassword = false;
  // a password the account owner has chosen is never published as a demonstration hint
  account.demoPassword = null;
  db.sessions = db.sessions.filter((s) => s.email !== account.email || s.token === token); // keep this device signed in
  addAuditLog(account.name, "Changed the portal password", "Security");
  saveDb(db);
  res.json({ ok: true, passwordChangedAt: account.passwordChangedAt, auditLogs: db.auditLogs });''', "password hygiene")

# ------------------------------------------------ boot backup + daily rotation
sub('''if (!db.systemConfig.financeConfig.paymentChannels) {
  db.systemConfig.financeConfig.paymentChannels = createInitialDatabase().systemConfig.financeConfig.paymentChannels;
  saveDb(db);
}''',
'''if (!db.systemConfig.financeConfig.paymentChannels) {
  db.systemConfig.financeConfig.paymentChannels = createInitialDatabase().systemConfig.financeConfig.paymentChannels;
  saveDb(db);
}

// A copy on every boot, then one a day while the server is up.
backupDb("boot");
setInterval(() => backupDb("daily"), 24 * 60 * 60 * 1000).unref();''', "boot backup")

# --------------------------------------------------------------- shutdown
sub('''app.listen(PORT, "0.0.0.0", () => {''',
'''process.on("SIGINT", shutdown);
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

const server = app.listen(PORT, HOST, () => {''', "shutdown")

sub('''  console.log(`FAITH LEARNING CENTRE ERP Server running at http://0.0.0.0:${PORT}`);''',
'''  console.log(`FAITH LEARNING CENTRE ERP v${APP_VERSION} running at http://${HOST}:${PORT}`);
  console.log(`[boot] database ${path.relative(__dirname, DB_PATH)} (${dbSizeKb()} kB) · backups kept: ${BACKUP_KEEP}`);''', "boot log")

open(p, "w", encoding="utf-8").write(s)
print("server.js: operations layer added")
