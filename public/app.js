/* ============================================================================
   FAITH LEARNING CENTRE — Full-Pack School ERP Frontend
   Sections: Core, Router, Portals, Backend Customization Zone
   ========================================================================= */

const SESSION_KEY = "flc_portal_token";

const State = {
  db: null,
  user: null,   // { email, role, name } once the visitor has signed in
  role: "admin", // admin | teacher | finance | parent
  route: "dashboard",
  subtab: {},
  parentStudentId: "stu_01",
  filters: {},
  helpTab: "articles",       // articles | password | security | ict
  helpQuery: "",
  securityStatus: null,
  systemStatus: null,
  sessions: [],
  palette: { open: false, query: "", index: 0 }
};

const ROLES = [
  { id: "admin", label: "Admin / Principal", icon: "shield" },
  { id: "teacher", label: "Teacher", icon: "graduation" },
  { id: "finance", label: "Bursar / Finance", icon: "wallet" },
  { id: "parent", label: "Student / Parent", icon: "user" }
];

/* ---------------------------------- Utils --------------------------------- */
function esc(s) {
  if (s === null || s === undefined) return "";
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function money(n) {
  const cur = State.db?.systemConfig?.financeConfig?.currency || "KES";
  return `${cur} ${Number(n || 0).toLocaleString("en-KE")}`;
}

function toast(msg, type = "info") {
  const root = document.getElementById("toast-root");
  if (!root) return;
  const div = document.createElement("div");
  div.className = "toast";
  div.setAttribute("role", type === "error" ? "alert" : "status");
  div.innerHTML = `<span>${type === "success" ? "✅" : type === "error" ? "⚠️" : "ℹ️"}</span><span>${esc(msg)}</span>`;
  root.appendChild(div);
  setTimeout(() => div.remove(), 3800);
}

function icon(name, size = 16) {
  const p = {
    dashboard: "M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z",
    students: "M12 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10zm0 2c-4.4 0-8 2.2-8 5v1h16v-1c0-2.8-3.6-5-8-5z",
    graduation: "M12 3 1 9l11 6 9-4.9V17h2V9L12 3zM5 13.2V17c0 1.7 3.1 3 7 3s7-1.3 7-3v-3.8l-7 3.8-7-3.8z",
    wallet: "M21 7H5a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h16a1 1 0 0 0 1-1V8a1 1 0 0 0-1-1zm-3 7a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zM5 4h14v1H5z",
    calendar: "M7 2v2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2h-2V2h-2v2H9V2H7zm12 8v10H5V10h14z",
    clock: "M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm1 6h-2v6l5 3 1-1.7-4-2.3V8z",
    lock: "M12 2a5 5 0 0 0-5 5v3H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8a2 2 0 0 0-2-2h-1V7a5 5 0 0 0-5-5zm0 2a3 3 0 0 1 3 3v3H9V7a3 3 0 0 1 3-3zm0 9a2 2 0 0 1 1 3.7V19h-2v-2.3A2 2 0 0 1 12 13z",
    users: "M16 11a4 4 0 1 0-4-4 4 4 0 0 0 4 4zm-8 1a3 3 0 1 0-3-3 3 3 0 0 0 3 3zm8 2c-3.3 0-6 1.6-6 3.5V20h12v-2.5c0-1.9-2.7-3.5-6-3.5zM8 13c-2.7 0-5 1.4-5 3v2h4v-1.5c0-1 .5-1.9 1.4-2.7A9 9 0 0 0 8 13z",
    bus: "M4 5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-1v2h-2v-2H9v2H7v-2H6a2 2 0 0 1-2-2V5zm2 1v4h12V6H6zm1 8a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zm10 0a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z",
    home: "M12 3 2 12h3v9h6v-6h2v6h6v-9h3L12 3z",
    book: "M4 4a2 2 0 0 1 2-2h4v18H6a2 2 0 0 0-2 2V4zm12-2h4a2 2 0 0 1 2 2v18a2 2 0 0 0-2-2h-4V2z",
    award: "M12 2a4 4 0 1 0 0 8 4 4 0 0 0 0-8zm-2 9.4V22l2-2 2 2V11a6 6 0 0 1-4 0zM6 6a4 4 0 0 1 1-2.6A6 6 0 0 0 6 12a6 6 0 0 0 1 2.6A4 4 0 0 1 6 6z",
    message: "M21 4H3a1 1 0 0 0-1 1v11a1 1 0 0 0 1 1h4v4l5-4h9a1 1 0 0 0 1-1V5a1 1 0 0 0-1-1z",
    chart: "M4 20h16v2H4v-2zM6 10h3v8H6v-8zm4.5-5h3v13h-3V5zM15 13h3v5h-3v-5z",
    cog: "M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8zm9 4a7 7 0 0 0-.1-1l2-1.6-2-3.4-2.4 1a7 7 0 0 0-1.7-1L16.4 3h-4l-.4 2.6a7 7 0 0 0-1.7 1l-2.4-1-2 3.4L7.9 11a7 7 0 0 0 0 2l-2 1.6 2 3.4 2.4-1a7 7 0 0 0 1.7 1l.4 2.6h4l.4-2.6a7 7 0 0 0 1.7-1l2.4 1 2-3.4-2-1.6c.1-.3.1-.7.1-1z",
    shield: "M12 2 4 5v6c0 5 3.4 9.7 8 11 4.6-1.3 8-6 8-11V5l-8-3z",
    user: "M12 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10zm0 2c-4 0-8 2-8 4.5V21h16v-2.5C20 16 16 14 12 14z",
    plus: "M11 5h2v6h6v2h-6v6h-2v-6H5v-2h6V5z",
    search: "M15.5 14h-.8l-.3-.3a6.5 6.5 0 1 0-.7.7l.3.3v.8l5 5 1.5-1.5-5-5zm-6 0a4.5 4.5 0 1 1 0-9 4.5 4.5 0 0 1 0 9z",
    print: "M19 8H5a3 3 0 0 0-3 3v6h4v4h12v-4h4v-6a3 3 0 0 0-3-3zm-3 11H8v-5h8v5zm3-7a1 1 0 1 1 0-2 1 1 0 0 1 0 2zM18 3H6v4h12V3z",
    download: "M12 16 7 11h3V4h4v7h3l-5 5zm-7 2h14v2H5v-2z",
    phone: "M6.6 10.8a15 15 0 0 0 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.2.4 2.4.6 3.6.6a1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.3.2 2.5.6 3.6.1.4 0 .8-.2 1l-2.3 2.2z",
    check: "M9 16.2 4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z",
    x: "M18.3 5.7 12 12l6.3 6.3-1.4 1.4L10.6 13.4 4.3 19.7 2.9 18.3 9.2 12 2.9 5.7 4.3 4.3l6.3 6.3 6.3-6.3z",
    edit: "M3 17.2V21h3.8L18 9.8 14.2 6 3 17.2zM20.7 7.3a1 1 0 0 0 0-1.4l-2.6-2.6a1 1 0 0 0-1.4 0l-1.8 1.8L18.7 9l2-1.7z",
    trash: "M6 19a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z",
    layers: "M12 2 2 7l10 5 10-5-10-5zm0 7.8L4 6l8-3.8L20 6l-8 3.8zM2 12l10 5 10-5-2.2-1.1L12 14.7 4.2 10.9 2 12zm0 5 10 5 10-5-2.2-1.1L12 19.7 4.2 15.9 2 17z",
    clipboard: "M9 2h6a1 1 0 0 1 1 1v1h3a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h3V3a1 1 0 0 1 1-1zm1 2v1h4V4h-4z",
    help: "M12 2a10 10 0 1 1 0 20 10 10 0 0 1 0-20zm0 2a8 8 0 1 0 0 16 8 8 0 0 0 0-16zm1 12.2a1.3 1.3 0 1 1-2.6 0 1.3 1.3 0 0 1 2.6 0zM12.9 6.4c1.9 0 3.4 1.3 3.4 3 0 1.1-.6 1.9-1.5 2.5-.8.5-1.1.9-1.1 1.6v.4h-2.2v-.6c0-1.2.5-1.9 1.4-2.5.7-.5 1.2-.9 1.2-1.5 0-.7-.6-1.2-1.4-1.2-.8 0-1.4.5-1.5 1.3H8.9c.1-1.8 1.6-3 4-3z",
    sparkle: "M12 2l1.9 5.6L19.5 9l-4.4 3.5L16 18l-4-3-4 3 1-5.5L4.5 9l5.6-1.4L12 2z",
    refresh: "M12 5V2L7 7l5 5V9a5 5 0 1 1-5 5H5a7 7 0 1 0 7-9z",
    key: "M12.7 10a5 5 0 1 0-1.4 1.4L10 15H8v2H6v2H3v-3l7.3-7.3c1 .3 2 .6 2.4.3zM15.5 4a4.5 4.5 0 1 0 0 9 4.5 4.5 0 0 0 0-9zm0 5.5a1 1 0 1 1 0-2 1 1 0 0 1 0 2z",
    "graduation-cap": "M12 3 1 9l11 6 9-4.9V17h2V9L12 3zM5 13.2V17c0 1.7 3.1 3 7 3s7-1.3 7-3v-3.8l-7 3.8-7-3.8z",
    "calendar-check": "M7 2v2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2h-2V2h-2v2H9V2H7zm12 8v10H5V10h14zm-3.6 1.6L11 16l-2.4-2.4-1.4 1.4L11 18.8l5.8-5.8-1.4-1.4z",
    "book-open": "M4 4a2 2 0 0 1 2-2h4v18H6a2 2 0 0 0-2 2V4zm12-2h4a2 2 0 0 1 2 2v18a2 2 0 0 0-2-2h-4V2z",
    "message-square": "M21 4H3a1 1 0 0 0-1 1v11a1 1 0 0 0 1 1h4v4l5-4h9a1 1 0 0 0 1-1V5a1 1 0 0 0-1-1z",
    building: "M4 21V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v4h2a2 2 0 0 1 2 2v10h-6v-4h-2v4H4zm4-13h2V6H8v2zm4 0h2V6h-2v2zm-4 4h2v-2H8v2zm4 0h2v-2h-2v2zm-4 4h2v-2H8v2zm4 0h2v-2h-2v2z",
    lock: "M12 2a5 5 0 0 0-5 5v3H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8a2 2 0 0 0-2-2h-1V7a5 5 0 0 0-5-5zm0 2a3 3 0 0 1 3 3v3H9V7a3 3 0 0 1 3-3zm0 9a2 2 0 0 1 1 3.7V19h-2v-2.3A2 2 0 0 1 12 13z",
  };
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="currentColor" style="flex-shrink:0"><path d="${p[name] || p.dashboard}"/></svg>`;
}

/* ------------------------------- API Layer -------------------------------- */
/* The signed-in session token. The server requires it for every change to the
   system; the public forms (sign-in, forgotten password, consent, enquiry) are
   the only writes that go out without it. */
function portalToken() {
  try {
    return sessionStorage.getItem(SESSION_KEY) || localStorage.getItem(SESSION_KEY) || null;
  } catch (e) {
    return null;
  }
}

async function api(path, method = "GET", body) {
  const opts = { method, headers: { "Content-Type": "application/json" } };
  const token = portalToken();
  if (token) opts.headers["X-FLC-Token"] = token;
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(path, opts);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Request failed (${res.status})`);
  }
  return res.json();
}

function syncFrom(payload) {
  if (!payload) return;
  if (payload.helpArticles) State.db.helpArticles = payload.helpArticles;
  if (payload.passwordResetRequests) State.db.passwordResetRequests = payload.passwordResetRequests;
  if (payload.systemConfig) State.db.systemConfig = payload.systemConfig;
  if (payload.branding) State.db.systemConfig.branding = payload.branding;
  if (payload.modules) State.db.systemConfig.modules = payload.modules;
  if (payload.academicConfig) State.db.systemConfig.academicConfig = payload.academicConfig;
  if (payload.financeConfig) State.db.systemConfig.financeConfig = payload.financeConfig;
  if (payload.rolePermissions) State.db.systemConfig.rolePermissions = payload.rolePermissions;
  if (payload.customFields) State.db.systemConfig.customFields = payload.customFields;
  if (payload.terms) State.db.systemConfig.terms = payload.terms;
  ["students", "assessments", "payments", "expenses", "staff", "attendanceRecords", "timetable",
   "transportRoutes", "boardingHouses", "libraryBooks", "disciplineMerits", "communications",
   "auditLogs", "feeStructures", "events", "enquiries", "consents"].forEach((k) => {
    if (payload[k] !== undefined) State.db[k] = payload[k];
  });
}

/* --------------------------- Grading Engine ------------------------------- */
function recordScore(rec) {
  const cfg = State.db.systemConfig.academicConfig;
  if (!rec) return null;
  const sba = Number(rec.sba ?? rec.SBA ?? 0);
  const exam = Number(rec.exam ?? rec.Exam ?? 0);
  const sw = Number(cfg.sbaWeight ?? 40) / 100;
  const ew = Number(cfg.examWeight ?? 60) / 100;
  return Math.round(sba * sw + exam * ew);
}

function gradeFor(score) {
  const cfg = State.db.systemConfig.academicConfig;
  const mode = cfg.gradingMode || "hybrid";
  const range = (arr, key) => arr.find((r) => score >= r.min && score <= r.max);
  const results = {};
  if (mode === "cbc" || mode === "hybrid") {
    results.cbc = range(cfg.cbcRubricScale, "cbc") || null;
  }
  if (mode === "standard" || mode === "hybrid") {
    results.standard = range(cfg.standardGradeScale, "standard") || null;
  }
  return results;
}

function gradeBadge(score) {
  const g = gradeFor(score);
  const parts = [];
  if (g.cbc) parts.push(`<span class="badge" style="background:${g.cbc.color}1a;color:${g.cbc.color}">${g.cbc.subCode || g.cbc.code} · ${g.cbc.label}</span>`);
  if (g.standard) parts.push(`<span class="badge badge-neutral">Grade ${g.standard.grade}</span>`);
  if (!parts.length) parts.push(`<span class="badge badge-neutral">—</span>`);
  return parts.join(" ");
}

function studentAverage(studentId) {
  const a = State.db.assessments[studentId] || {};
  const las = State.db.systemConfig.academicConfig.learningAreas.filter((l) => l.active);
  const scores = las.map((l) => recordScore(a[l.code])).filter((s) => s !== null && s !== undefined);
  if (!scores.length) return 0;
  return Math.round(scores.reduce((x, y) => x + y, 0) / scores.length);
}

function studentClass(student) {
  return `${student.grade}`;
}

function classList(seniority) {
  return State.db.students
    .slice()
    .sort((a, b) => studentAverage(b.id) - studentAverage(a.id))
    .map((s, i) => ({ ...s, rank: i + 1 }));
}

/* ------------------------------- Router ----------------------------------- */
function navItems() {
  const mods = State.db.systemConfig.modules;
  const r = State.role;
  const items = [];
  const push = (id, label, ic, roles, moduleKey, badge) => {
    if (roles && !roles.includes(r)) return;
    if (moduleKey && mods[moduleKey] && !mods[moduleKey].enabled) return;
    items.push({ id, label, ic, badge });
  };

  push("dashboard", "Dashboard", "dashboard", ["admin", "teacher", "finance", "parent"]);
  push("students", "Students & Admissions", "students", ["admin", "teacher", "finance"], null, State.db.students.length);
  push("attendance", r === "parent" ? "Attendance History" : "Attendance Register", "calendar", ["admin", "teacher", "parent"], "attendance");
  push("academics", "Academics & CBC Markbook", "graduation", ["admin", "teacher"], "academics");
  push("reportcards", r === "parent" ? "My Child's Report Card" : "Report Cards & Analytics", "clipboard", ["admin", "teacher", "parent"], "academics");
  push("timetable", "Master Timetable", "clock", ["admin", "teacher", "finance", "parent"], "timetable");
  push("finance", r === "parent" ? "Fee Statement & M-Pesa" : "Finance, Fees & M-Pesa", "wallet", ["admin", "finance", "parent"], "finance",
    r === "parent" ? null : `Arrears ${State.db.students.filter((s) => s.balance > 0).length}`);
  push("staff", "Staff, TSC & Payroll", "users", ["admin"], "staff", State.db.staff.length);
  push("transport", "Transport & Fleet", "bus", ["admin", "finance"], "transport");
  push("boarding", "Boarding & Hostels", "home", ["admin"], "boarding");
  push("library", "Library & Textbooks", "book", ["admin", "teacher"], "library");
  push("discipline", "Merits, Clubs & Discipline", "award", ["admin", "teacher"], "discipline");
  push("communications", "SMS & Notices Hub", "message", ["admin", "teacher", "finance", "parent"], "communications");
  push("help", r === "admin" ? "Help Centre & ICT" : "Help Centre", "help", ["admin", "teacher", "finance", "parent"]);
  push("reports", "Reports & Analytics", "chart", ["admin", "finance"]);
  if (r === "parent") push("profile", "Learner Profile", "user", ["parent"]);
  return items;
}

/* ----------------------------- Portal sign-in ----------------------------- */

function roleLabel(role) {
  const r = ROLES.find((x) => x.id === role);
  return r ? r.label : "Portal";
}

function renderSignIn(message) {
  const b = (State.db && State.db.systemConfig.branding) || {};
  const demo = (State.db && State.db.accounts ? State.db.accounts : [])
    .filter((a) => a.role !== "admin")
    .map((a) => `<li><strong>${esc(roleLabel(a.role))}</strong> — <code>${esc(a.email)}</code> / <code>${esc(a.demoPassword)}</code></li>`)
    .join("");
  document.getElementById("app").innerHTML = `
  <div class="signin-wrap">
    <div class="signin-card">
      <div class="signin-brand">
        <div class="crest-badge">${window.FLCBrand ? FLCBrand.mark((b.crestStyle || "shield"), 30) : ""}</div>
        <div class="brand-text">
          <h1>${esc(b.schoolName || "FAITH LEARNING CENTRE")}</h1>
          <p>${esc(b.motto || "")}</p>
        </div>
      </div>
      <h2>Sign in to the portals</h2>
      <p class="signin-sub">One door for the administration, the teaching staff, the bursar's office and parents — your account decides which portal opens. Entry to every portal is conditional on accepting the School Terms &amp; Conditions.</p>
      <form id="signin-form" onsubmit="return FLC.signIn(event)">
        <div class="form-group">
          <label for="signin-email">Email address</label>
          <input class="input" type="email" id="signin-email" autocomplete="username" placeholder="you@example.com" required />
        </div>
        <div class="form-group">
          <label for="signin-password">Password</label>
          <input class="input" type="password" id="signin-password" autocomplete="current-password" placeholder="Your password" required />
        </div>
        ${typeof FLCTerms !== "undefined" ? FLCTerms.acceptanceCheckboxHtml(State.db, "signin-terms") : ""}
        <div id="signin-error" class="signin-error"${message ? "" : " hidden"}>${esc(message || "")}</div>
        <button class="btn btn-primary" type="submit" style="width:100%;justify-content:center">Sign in</button>
      </form>
      <p class="signin-forgot">
        <a href="javascript:void(0)" onclick="FLC.toggleForgot()">Forgot your password?</a>
      </p>
      <form id="signin-forgot-form" class="signin-forgot-form" hidden onsubmit="return FLC.forgotPassword(event)">
        <div class="form-group">
          <label for="forgot-email">Your school email address</label>
          <input class="input" type="email" id="forgot-email" placeholder="you@example.com" required />
        </div>
        <div class="form-group">
          <label for="forgot-note">Anything the office should know (optional)</label>
          <input class="input" id="forgot-note" placeholder="e.g. guardian of Achieng', Grade 5" />
        </div>
        <button class="btn btn-outline" type="submit" style="width:100%;justify-content:center">Send a reset request to the school</button>
        <div id="forgot-msg" class="signin-note" hidden></div>
        <p class="signin-hint">The administrator or the ICT department sees your request under
          <strong>Help Centre → Password Resets</strong> and issues a temporary password. Nobody can read your
          current password — it is stored only as a scrambled fingerprint.</p>
      </form>
      ${demo ? `<div class="signin-demo">
        <strong>Reviewing the system?</strong> Demonstration accounts for the other three portals:
        <ul>${demo}</ul>
        Every password can be changed under <em>Backend Customization Zone → Sign-in &amp; Security</em>.
      </div>` : ""}
      <div class="signin-foot">
        <a href="/">Back to the school website</a>
        <span>·</span>
        <a href="javascript:void(0)" onclick="FLCTerms.open(State.db)">Read the Terms &amp; Conditions</a>
      </div>
    </div>
  </div>`;
}

function toggleForgot() {
  const form = document.getElementById("signin-forgot-form");
  if (!form) return;
  form.hidden = !form.hidden;
  if (!form.hidden) {
    const email = document.getElementById("signin-email");
    if (email && email.value) document.getElementById("forgot-email").value = email.value;
    const field = document.getElementById("forgot-email");
    if (field) field.focus();
  }
}

async function forgotPassword(event) {
  if (event) event.preventDefault();
  const emailEl = document.getElementById("forgot-email");
  const noteEl = document.getElementById("forgot-note");
  const msgEl = document.getElementById("forgot-msg");
  const say = (text, bad) => {
    if (!msgEl) return;
    msgEl.hidden = false;
    msgEl.textContent = text;
    msgEl.className = "signin-note" + (bad ? " bad" : " good");
  };
  if (!emailEl || !emailEl.value.trim()) return say("Please enter the email address you sign in with.", true);
  try {
    const res = await fetch("/api/auth/forgot", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: emailEl.value.trim(), note: noteEl ? noteEl.value : "" })
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) return say(data.error || "The request could not be sent. Please try again.", true);
    say(data.message, false);
  } catch (e) {
    say("The school server could not be reached. Please try again in a moment.", true);
  }
  return false;
}

async function restoreSession() {
  const token = portalToken();
  if (!token) return null;
  try {
    const res = await fetch("/api/auth/session?token=" + encodeURIComponent(token));
    if (!res.ok) {
      try { sessionStorage.removeItem(SESSION_KEY); localStorage.removeItem(SESSION_KEY); } catch (e) {}
      return null;
    }
    const data = await res.json();
    return data.user || null;
  } catch (e) {
    return null;
  }
}

async function signIn(event) {
  if (event) event.preventDefault();
  const emailEl = document.getElementById("signin-email");
  const passEl = document.getElementById("signin-password");
  const termsEl = document.getElementById("signin-terms");
  const errEl = document.getElementById("signin-error");
  const fail = (msg) => {
    if (errEl) { errEl.hidden = false; errEl.textContent = msg; }
    return false;
  };
  if (!emailEl.value.trim() || !passEl.value) return fail("Please enter both your email address and password.");
  if (termsEl && !termsEl.checked) return fail("Tick the box to accept the School Terms & Conditions — portal entry is conditional on it.");
  try {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: emailEl.value.trim(), password: passEl.value })
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data.ok) return fail(data.error || "Sign-in failed. Please try again.");
    try {
      sessionStorage.setItem(SESSION_KEY, data.token);
      // shared with the design chooser, the colour picker and the website editing bar
      localStorage.setItem(SESSION_KEY, data.token);
    } catch (e) {}
    State.user = data.user;
    State.role = data.user.role;
    State.route = "dashboard";
    // The anonymous bootstrap carries only the school's public information; now that the
    // session exists, pull the records the portal works from (and fail loudly if it cannot).
    try {
      State.db = await api("/api/bootstrap");
    } catch (e) {
      toast("Signed in, but the record set could not be loaded: " + e.message, "error");
    }
    if (data.auditLogs && State.db) State.db.auditLogs = data.auditLogs;
    if (typeof FLCTerms !== "undefined") {
      FLCTerms.record(State.db, { role: data.user.role, portal: roleLabel(data.user.role), name: data.user.name });
    }
    toast(`Welcome back, ${data.user.name}`, "success");
    if (data.user.mustChangePassword) {
      setTimeout(() => toast("You are signed in with a temporary password — change it under Backend Customization Zone → Sign-in & Security.", "error"), 1200);
    }
    render();
    return false;
  } catch (e) {
    return fail("Could not reach the school server: " + e.message);
  }
}

async function updateEnquiryStatus(id, status) {
  try {
    const res = await api("/api/enquiries/" + encodeURIComponent(id), {
      method: "PUT",
      headers: { "X-FLC-Token": portalToken() },
      body: JSON.stringify({ status })
    });
    if (res.enquiries) { State.db.enquiries = res.enquiries; }
    if (res.auditLogs) State.db.auditLogs = res.auditLogs;
    toast(`Enquiry marked "${status}".`, "success");
    render();
  } catch (e) {
    toast(e.message, "error");
  }
}

async function deleteEnquiry(id) {
  if (!confirm("Remove this enquiry from the list? This cannot be undone.")) return;
  try {
    const res = await api("/api/enquiries/" + encodeURIComponent(id), {
      method: "DELETE",
      headers: { "X-FLC-Token": portalToken() }
    });
    if (res.enquiries) State.db.enquiries = res.enquiries;
    if (res.auditLogs) State.db.auditLogs = res.auditLogs;
    toast("Enquiry removed.", "success");
    render();
  } catch (e) {
    toast(e.message, "error");
  }
}

async function signOut() {
  const token = portalToken();
  try {
    await fetch("/api/auth/logout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token })
    });
  } catch (e) {}
  try {
    sessionStorage.removeItem(SESSION_KEY);
    localStorage.removeItem(SESSION_KEY);
  } catch (e) {}
  State.user = null;
  renderSignIn();
  toast("Signed out of the portal", "success");
}

async function changePassword(event) {
  if (event) event.preventDefault();
  const token = portalToken();
  const current = document.getElementById("sec-current").value;
  const next = document.getElementById("sec-new").value;
  const again = document.getElementById("sec-confirm").value;
  const msg = document.getElementById("sec-msg");
  const say = (text, ok) => { msg.textContent = text; msg.style.color = ok ? "var(--success)" : "var(--danger)"; };
  if (!current || !next) return say("Fill in the current and the new password.", false);
  if (next !== again) return say("The two new passwords do not match.", false);
  if (next.length < 8) return say("Use at least 8 characters for the new password.", false);
  try {
    const res = await fetch("/api/auth/password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, currentPassword: current, newPassword: next })
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data.ok) return say(data.error || "Could not change the password.", false);
    if (data.auditLogs) State.db.auditLogs = data.auditLogs;
    document.getElementById("sec-current").value = "";
    document.getElementById("sec-new").value = "";
    document.getElementById("sec-confirm").value = "";
    say("Password changed at " + data.passwordChangedAt + ". Every other device has been signed out.", true);
    toast("Password changed", "success");
    return false;
  } catch (e) {
    return say("Could not reach the school server: " + e.message, false);
  }
}

function render() {
  const b = State.db.systemConfig.branding;
  applyTheme();
  const items = navItems();
  const SPECIAL_ROUTES = ["customizer"];
  if (!items.find((i) => i.id === State.route) && !SPECIAL_ROUTES.includes(State.route)) {
    State.route = items.length ? items[0].id : "dashboard";
  }

  const modsEnabled = Object.values(State.db.systemConfig.modules).filter((m) => m.enabled).length;
  const db = State.db;

  document.getElementById("app").innerHTML = `
    <a class="skip-link" href="#page">Skip to the page content</a>
    <div class="nav-scrim" onclick="FLC.toggleNav(false)" aria-hidden="true"></div>
    <aside class="sidebar" id="portal-sidebar">
      <div class="sidebar-brand">
        <div class="crest-badge">${window.FLCBrand ? FLCBrand.mark(b.crestStyle || "shield", 30) : ""}</div>
        <div class="brand-text">
          <h1>${esc(b.schoolName)}</h1>
          <p>${esc(b.motto)}</p>
        </div>
      </div>
      <div class="sidebar-section-label">${State.role === "parent" ? "Parent / Student Portal" : State.role === "teacher" ? "Teacher Portal" : State.role === "finance" ? "Bursar / Finance Portal" : "Administration"}</div>
      <nav class="sidebar-nav">
        ${items.map((i) => `
          <button class="nav-btn ${State.route === i.id ? "active" : ""}" onclick="FLC.go('${i.id}')">
            <span class="nav-btn-left">${icon(i.ic, 17)}<span>${esc(i.label)}</span></span>
            ${i.badge !== undefined && i.badge !== null ? `<span class="nav-badge">${esc(i.badge)}</span>` : ""}
          </button>`).join("")}
        ${State.role === "admin" ? `
          <div class="sidebar-section-label" style="padding-top:1.3rem">Backend Control</div>
          <button class="nav-btn customizer-highlight ${State.route === "customizer" ? "active" : ""}" onclick="FLC.go('customizer')">
            <span class="nav-btn-left">${icon("cog", 17)}<span>Backend Customization Zone</span></span>
            <span class="nav-badge">⚙</span>
          </button>` : ""}
      </nav>
      <div class="sidebar-footer">
        <div style="display:flex;justify-content:space-between;margin-bottom:0.25rem">
          <span>Active Modules</span><strong style="color:var(--sidebar-text)">${modsEnabled}/${Object.keys(db.systemConfig.modules).length}</strong>
        </div>
        <div>${esc(db.systemConfig.academicConfig.currentTerm)} ${esc(db.systemConfig.academicConfig.currentYear)} · CBC Engine</div>
        <div class="sidebar-version">v${esc((window.FLC_META && FLC_META.version) || "1.2.1")} · ${esc(State.user ? State.user.name : "signed in")}</div>
      </div>
    </aside>
    <main class="main-area">
      ${renderTopbar()}
      <div class="page-content" id="page"></div>
    </main>
    <div id="palette-root"></div>`;

  renderPage();
}

function applyTheme() {
  const b = { ...State.db.systemConfig.branding };
  // ?theme=<id> previews a colour combination without saving it
  const preview = window.FLCThemes ? FLCThemes.queryTheme() : null;
  if (preview) {
    b.primaryColor = preview.tokens.navy900;
    b.accentColor = preview.tokens.gold500;
    b.sidebarTheme = preview.sidebar;
  }
  const root = document.documentElement.style;
  root.setProperty("--primary", b.primaryColor || "#3a1119");
  root.setProperty("--accent", b.accentColor || "#e4002b");
  const darken = (hex) => {
    try {
      const n = parseInt(hex.replace("#", ""), 16);
      const r = Math.max(0, (n >> 16) - 30), g = Math.max(0, ((n >> 8) & 255) - 30), bl = Math.max(0, (n & 255) - 30);
      return `#${((r << 16) | (g << 8) | bl).toString(16).padStart(6, "0")}`;
    } catch (e) { return hex; }
  };
  root.setProperty("--primary-dark", darken(b.primaryColor || "#3a1119"));
  const tint = (hex, pct) => {
    try {
      const n = parseInt(hex.replace("#", ""), 16);
      const r = n >> 16, g = (n >> 8) & 255, bl = n & 255;
      const mix = (c) => Math.round(c + (255 - c) * pct);
      return `#${((mix(r) << 16) | (mix(g) << 8) | mix(bl)).toString(16).padStart(6, "0")}`;
    } catch (e) { return hex; }
  };
  root.setProperty("--primary-light", tint(b.primaryColor || "#3a1119", 0.88));
  root.setProperty("--accent-light", tint(b.accentColor || "#e4002b", 0.85));
  const themes = ["onyx", "navy", "steel", "graphite", "teal", "green", "burgundy", "light"];
  document.body.classList.remove(...themes.map((t) => `sidebar-${t}`));
  document.body.classList.add(`sidebar-${themes.includes(b.sidebarTheme) ? b.sidebarTheme : "navy"}`);
  document.body.classList.toggle("density-compact", b.uiDensity === "compact");
  if (preview && window.FLCThemes) { FLCThemes.applyTokens(preview); FLCThemes.renderBar(preview); }
  else if (window.FLCThemes) { FLCThemes.applyBrandingColours(b.primaryColor, b.accentColor); }
}

function renderTopbar() {
  const b = State.db.systemConfig.branding;
  const cfg = State.db.systemConfig.academicConfig;
  const tc = State.db.systemConfig.financeConfig;
  return `
  <header class="topbar">
    <div class="topbar-left">
      <button class="nav-toggle" onclick="FLC.toggleNav()" aria-label="Open the menu" title="Menu">${icon("layers", 16)}<span class="nav-toggle-label">Menu</span></button>
      <button class="palette-btn" onclick="FLC.openPalette()" title="Search the whole system (Ctrl + K)">
        ${icon("search", 14)}<span class="palette-btn-label">Search everything</span><kbd>⌘K</kbd>
      </button>
      <span class="school-pill">${icon("building", 14)} ${esc(b.shortName)} · KNEC ${esc(b.knecCode)}</span>
      <span class="school-pill amber">${icon("calendar", 14)} ${esc(cfg.currentTerm)}, ${esc(cfg.currentYear)}</span>
      <span class="school-pill green">${icon("sparkle", 14)} Grading: ${esc(cfg.gradingMode.toUpperCase())} ${cfg.gradingMode === "hybrid" ? "(EE/ME/AE/BE + A–E)" : ""}</span>
      ${State.role === "admin" || State.role === "finance"
        ? `<span class="school-pill">${icon("message", 14)} SMS Credits: ${tc.smsBalanceCredits}</span>` : ""}
    </div>
    <div class="topbar-right">
      ${State.user && State.user.role === "admin" ? `<div class="role-switcher" title="Administrators can open any portal for review">
        ${ROLES.map((r) => `<button class="role-btn ${State.role === r.id ? "active" : ""}" onclick="FLC.setRole('${r.id}')">${esc(r.label)}</button>`).join("")}
      </div>` : ""}
      ${State.user ? `<span class="user-chip" title="${esc(State.user.email)}">${icon("user", 14)} ${esc(State.user.name)} · ${esc(roleLabel(State.role))}</span>
      <button class="btn btn-outline btn-sm" onclick="FLC.signOut()" title="Sign out of the portal">${icon("lock", 14)} Sign out</button>` : ""}
      <button class="btn btn-outline btn-sm" onclick="FLCTerms.open(State.db)" title="Read the School Terms &amp; Conditions">${icon("clipboard", 14)} Terms</button>
      <a class="btn btn-outline btn-sm" href="/" title="Open the public school website">${icon("building", 14)} Website</a>
      <button class="btn btn-outline btn-sm" onclick="FLC.refresh()" title="Reload from backend">${icon("refresh", 14)} Sync</button>
    </div>
  </header>`;
}

function pageShell(title, subtitle, actions, body) {
  return `
    <div class="page-header">
      <div class="page-title">
        <h2>${title}</h2>
        <p>${subtitle}</p>
      </div>
      <div class="page-actions">${actions || ""}</div>
    </div>
    ${body}`;
}

function renderPage() {
  const host = document.getElementById("page");
  const b = State.db.systemConfig.branding;
  const map = {
    dashboard: pageDashboard,
    students: pageStudents,
    attendance: pageAttendance,
    academics: pageAcademics,
    reportcards: pageReportCards,
    timetable: pageTimetable,
    finance: pageFinance,
    profile: pageProfile,
    staff: pageStaff,
    transport: pageTransport,
    boarding: pageBoarding,
    library: pageLibrary,
    discipline: pageDiscipline,
    communications: pageCommunications,
    reports: pageReports,
    help: pageHelpCentre,
    customizer: pageCustomizer
  };
  try {
    host.innerHTML = (map[State.route] || pageDashboard)();
  } catch (err) {
    // A failing panel must never leave a blank screen in front of the office.
    console.error("Page render failed:", err);
    host.innerHTML = `
      <div class="card" style="border-left:4px solid var(--danger)">
        <div class="card-header"><div class="card-title">${icon("shield")} That screen could not be drawn</div></div>
        <p style="font-size:0.9rem;color:var(--text-muted);line-height:1.6">
          The rest of the system is unaffected — nothing you had saved was lost. The details have been logged for the ICT department.</p>
        <pre class="error-trace">${esc(String(err && err.message ? err.message : err))}</pre>
        <div style="display:flex;gap:0.5rem;flex-wrap:wrap;margin-top:0.8rem">
          <button class="btn btn-primary" onclick="FLC.refresh()">${icon("refresh", 14)} Reload from the server</button>
          <button class="btn btn-outline" onclick="FLC.go('dashboard')">${icon("dashboard", 14)} Back to the dashboard</button>
          <button class="btn btn-outline" onclick="FLC.go('help');FLC.helpTab('ict')">${icon("help", 14)} Ask the ICT department</button>
        </div>
      </div>`;
  }
  if (typeof window.afterPageRender === "function") {
    const fn = window.afterPageRender;
    window.afterPageRender = null;
    fn();
  }
}


/* -------------------------- Go-live readiness ----------------------------- */
/* What still stands between this system and a public launch, computed from the
   live database so it can never drift from reality. Each item links to the place
   it is fixed. */
function goLiveChecks() {
  const db = State.db;
  const accounts = db.accounts || [];
  const adminAccount = accounts.find((a) => a.role === "admin") || {};
  const demoAccounts = accounts.filter((a) => a.demoPassword && a.active);
  const channels = (db.systemConfig.financeConfig.paymentChannels || []).filter((c) => c.enabled && c.temporary);
  const b = db.systemConfig.branding || {};
  const placeholder = (v) => !v || /^0+$|000000|X{3,}|TBD|placeholder/i.test(String(v));
  const credentials = [b.knecCode, b.nemisCode, b.registrationNo].filter(Boolean);

  return [
    {
      id: "admin-password",
      title: "Change the administrator's password",
      detail: adminAccount.passwordChangedAt
        ? "Last changed " + adminAccount.passwordChangedAt + "."
        : "The account is still on the password set when the system was installed. Change it now that the system is going live.",
      done: Boolean(adminAccount.passwordChangedAt),
      action: "Open Sign-in & Security",
      run: () => { FLC.go("customizer"); FLC.sub("customizer", "security"); }
    },
    {
      id: "demo-accounts",
      title: "Replace the demonstration accounts",
      detail: demoAccounts.length
        ? demoAccounts.length + " review account(s) still carry published passwords (" +
          demoAccounts.map((a) => a.email).join(", ") + "). Create real staff accounts and disable these."
        : "No account publishes a password on the sign-in screen.",
      done: demoAccounts.length === 0,
      action: "Open Sign-in & Security",
      run: () => { FLC.go("customizer"); FLC.sub("customizer", "security"); }
    },
    {
      id: "temporary-channel",
      title: "Switch off the temporary payment channel",
      detail: channels.length
        ? channels.map((c) => c.label).join(", ") + " is on the payment forms and the website. Turn it off once the permanent till is live."
        : "Only the permanent payment channels are published.",
      done: channels.length === 0,
      action: "Open Finance & M-Pesa",
      run: () => { FLC.go("customizer"); FLC.sub("customizer", "finance"); }
    },
    {
      id: "registration",
      title: "Confirm the school's registration details",
      detail: credentials.length
        ? "KNEC, NEMIS and registration numbers still read as placeholders. Replace them with the school's real codes before publishing."
        : "Registration details have been replaced with the school's own.",
      done: credentials.length === 0 || !credentials.every(placeholder),
      action: "Open School Identity",
      run: () => { FLC.go("customizer"); FLC.sub("customizer", "branding"); }
    },
    {
      id: "backups",
      title: "Copy the backups off the server",
      detail: (State.systemStatus && State.systemStatus.lastBackup)
        ? "The latest automatic copy is " + State.systemStatus.lastBackup.file + ". The ICT department should copy data/backups to storage that is not this machine, nightly."
        : "No copy has been taken from this server yet — one is written on every boot and daily while it runs.",
      done: false,
      action: "Take a copy now",
      run: () => FLC.takeBackup()
    },
    {
      id: "https",
      title: "Serve the school over HTTPS",
      detail: (typeof location !== "undefined" && location.protocol === "https:")
        ? "This address is served over TLS."
        : "The portal is being served over plain HTTP. Put it behind HTTPS before staff sign in from outside the school.",
      done: typeof location !== "undefined" && location.protocol === "https:",
      action: "Read the deployment notes",
      run: () => { FLC.go("help"); FLC.helpTab("security"); }
    }
  ];
}

function goLivePanel() {
  const checks = goLiveChecks();
  const done = checks.filter((c) => c.done).length;
  const pct = Math.round((done / checks.length) * 100);
  return `
    <div class="card golive">
      <div class="card-header">
        <div class="card-title">${icon("sparkle")} Go-live readiness</div>
        <span class="badge ${pct === 100 ? "badge-success" : "badge-warn"}">${done} of ${checks.length} ready</span>
      </div>
      <div class="progress-track" style="margin-bottom:0.9rem"><div class="progress-fill" style="width:${pct}%"></div></div>
      <ul class="golive-list">
        ${checks.map((c) => `
          <li class="${c.done ? "done" : "todo"}">
            <span class="golive-tick">${c.done ? "✓" : "!"}</span>
            <div class="golive-body">
              <strong>${esc(c.title)}</strong>
              <p>${esc(c.detail)}</p>
            </div>
            ${c.done ? "" : `<button class="btn btn-outline btn-sm" onclick="FLC.goLiveRun('${c.id}')">${esc(c.action)}</button>`}
          </li>`).join("")}
      </ul>
    </div>`;
}

/* ---------------------------- Dashboard Page ------------------------------ */
function pageDashboard() {
  const db = State.db;
  const students = db.students;
  const billed = students.reduce((s, x) => s + Number(x.billedAmount || 0), 0);
  const collected = students.reduce((s, x) => s + Number(x.paidAmount || 0), 0);
  const arrears = students.reduce((s, x) => s + Number(x.balance || 0), 0);
  const collectionRate = billed ? Math.round((collected / billed) * 100) : 0;
  const today = "2026-10-11";
  const att = db.attendanceRecords[today] || {};
  const present = Object.values(att).filter((a) => a.status === "Present").length;
  const totalMarked = Object.keys(att).length || 1;
  const cat = db.expenses.reduce((s, e) => s + e.amount, 0);
  const avg = students.length ? Math.round(students.reduce((s, x) => s + studentAverage(x.id), 0) / students.length) : 0;

  if (State.role === "parent") return pageParentDashboard();

  const roleIntro = {
    admin: "School-wide command centre — academics, finance, staff, campus operations and full backend control.",
    teacher: "Your classes at a glance — roll-call, markbook, timetable and learner progress.",
    finance: "Bursar's desk — fee collection, M-Pesa reconciliation, arrears and expenditure.",
    parent: ""
  }[State.role];

  const body = `
    ${State.role === "admin" ? goLivePanel() : ""}
    <div class="kpi-grid">
      <div class="kpi-card">
        <div class="kpi-top"><span class="kpi-label">Enrolled Learners</span><span class="kpi-icon">${icon("students")}</span></div>
        <div class="kpi-value">${students.length}</div>
        <div class="kpi-sub">PP1 – Grade 9 (JSS) · ${students.filter((s) => s.boardingStatus === "Boarding").length} boarders · ${students.filter((s) => s.boardingStatus === "Day").length} day scholars</div>
      </div>
      <div class="kpi-card success">
        <div class="kpi-top"><span class="kpi-label">Fees Collected (Term ${State.db.systemConfig.academicConfig.currentTerm.replace("Term ", "")})</span><span class="kpi-icon">${icon("wallet")}</span></div>
        <div class="kpi-value">${money(collected)}</div>
        <div class="kpi-sub">${collectionRate}% of ${money(billed)} billed</div>
        <div class="progress-track" style="margin-top:0.5rem"><div class="progress-fill" style="width:${collectionRate}%;background:var(--success)"></div></div>
      </div>
      <div class="kpi-card danger">
        <div class="kpi-top"><span class="kpi-label">Outstanding Arrears</span><span class="kpi-icon">${icon("chart")}</span></div>
        <div class="kpi-value">${money(arrears)}</div>
        <div class="kpi-sub">${students.filter((s) => s.balance > 0).length} learners with balances</div>
      </div>
      <div class="kpi-card accent">
        <div class="kpi-top"><span class="kpi-label">Today's Attendance</span><span class="kpi-icon">${icon("calendar")}</span></div>
        <div class="kpi-value">${Math.round((present / totalMarked) * 100)}%</div>
        <div class="kpi-sub">${present} present · ${Object.values(att).filter((a) => a.status === "Late").length} late · ${Object.values(att).filter((a) => a.status === "Absent").length} absent</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-top"><span class="kpi-label">School Mean Score</span><span class="kpi-icon">${icon("graduation")}</span></div>
        <div class="kpi-value">${avg}%</div>
        <div class="kpi-sub">${gradeBadge(avg)}</div>
      </div>
      <div class="kpi-card accent">
        <div class="kpi-top"><span class="kpi-label">Term Expenditure</span><span class="kpi-icon">${icon("layers")}</span></div>
        <div class="kpi-value">${money(cat)}</div>
        <div class="kpi-sub">Payroll, kitchen, CBC materials, transport & utilities</div>
      </div>
    </div>

    <div class="grid-2">
      <div class="card">
        <div class="card-header">
          <div class="card-title">${icon("sparkle")} Top Performing Learners — ${esc(State.db.systemConfig.academicConfig.currentTerm)}</div>
          <button class="btn btn-outline btn-sm" onclick="FLC.go('reportcards')">Full Analytics</button>
        </div>
        <div class="table-wrap">
          <table class="data-table">
            <thead><tr><th>Rank</th><th>Learner</th><th>Class</th><th>Mean</th><th>CBC Rating</th></tr></thead>
            <tbody>
              ${classList().slice(0, 6).map((s) => {
                const a = studentAverage(s.id);
                return `<tr>
                  <td><strong>#${s.rank}</strong></td>
                  <td>${esc(s.firstName)} ${esc(s.lastName)}<div style="font-size:0.72rem;color:var(--text-muted)">${esc(s.admNo)}</div></td>
                  <td>${esc(s.grade)} <span style="color:var(--text-muted)">· ${esc(s.stream)}</span></td>
                  <td><strong>${a}%</strong></td>
                  <td>${gradeBadge(a)}</td>
                </tr>`;
              }).join("")}
            </tbody>
          </table>
        </div>
      </div>

      <div class="card">
        <div class="card-header"><div class="card-title">${icon("wallet")} Recent Fee Collections (M-Pesa & Bank)</div>
          <button class="btn btn-outline btn-sm" onclick="FLC.go('finance')">Finance Desk</button></div>
        <div class="table-wrap">
          <table class="data-table">
            <thead><tr><th>Receipt</th><th>Learner</th><th>Amount</th><th>Method</th><th>Date</th></tr></thead>
            <tbody>
              ${db.payments.slice(0, 6).map((p) => `<tr>
                <td><strong>${esc(p.receiptNo)}</strong><div style="font-size:0.72rem;color:var(--text-muted)">Ref ${esc(p.reference)}</div></td>
                <td>${esc(p.studentName)}<div style="font-size:0.72rem;color:var(--text-muted)">${esc(p.grade)}</div></td>
                <td><strong style="color:var(--success)">${money(p.amount)}</strong></td>
                <td><span class="badge ${p.method.includes("M-Pesa") ? "badge-success" : "badge-info"}">${esc(p.method)}</span></td>
                <td>${esc(p.date)}</td>
              </tr>`).join("")}
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <div class="grid-2">
      <div class="card">
        <div class="card-header"><div class="card-title">${icon("award")} Recent Merits, Clubs & Discipline Records</div>
          <button class="btn btn-outline btn-sm" onclick="FLC.go('discipline')">View All</button></div>
        ${db.disciplineMerits.slice(0, 4).map((d) => `
          <div style="display:flex;gap:0.75rem;padding:0.7rem 0;border-bottom:1px solid var(--border-color)">
            <div style="width:38px;height:38px;border-radius:9px;background:var(--accent-light);color:var(--warning);display:flex;align-items:center;justify-content:center;font-weight:800;font-size:0.75rem">${esc(d.points)}</div>
            <div style="flex:1">
              <div style="font-weight:700;font-size:0.86rem">${esc(d.studentName)} <span class="badge badge-neutral">${esc(d.grade)}</span></div>
              <div style="font-size:0.8rem;color:var(--text-muted)">${esc(d.description)}</div>
              <div style="font-size:0.72rem;color:var(--text-muted);margin-top:2px">${esc(d.category)} · ${esc(d.date)} · Recorded by ${esc(d.recordedBy)}</div>
            </div>
          </div>`).join("")}
      </div>

      <div class="card">
        <div class="card-header"><div class="card-title">${icon("message")} Latest School Notices & SMS Broadcasts</div>
          <button class="btn btn-outline btn-sm" onclick="FLC.go('communications')">Comms Hub</button></div>
        ${db.communications.slice(0, 3).map((c) => `
          <div style="padding:0.7rem 0;border-bottom:1px solid var(--border-color)">
            <div style="display:flex;justify-content:space-between;gap:0.5rem;flex-wrap:wrap">
              <strong style="font-size:0.86rem">${esc(c.title)}</strong>
              <span class="badge badge-info">${esc(c.recipientsCount)} recipients</span>
            </div>
            <div style="font-size:0.8rem;color:var(--text-muted);margin:3px 0">${esc(c.message.slice(0, 150))}${c.message.length > 150 ? "…" : ""}</div>
            <div style="font-size:0.72rem;color:var(--text-muted)">${esc(c.audience)} · ${esc(c.date)} · ${esc(c.sender)}</div>
          </div>`).join("")}
      </div>
    </div>

    <div class="card">
      <div class="card-header"><div class="card-title">${icon("cog")} System Activity Audit Trail (Backend Customization Zone)</div>
        <span class="badge badge-neutral">${db.auditLogs.length} entries</span></div>
      <div class="table-wrap">
        <table class="data-table">
          <thead><tr><th>Timestamp</th><th>Actor</th><th>Action</th><th>Module</th></tr></thead>
          <tbody>
            ${db.auditLogs.slice(0, 6).map((l) => `<tr>
              <td style="white-space:nowrap">${esc(l.timestamp)}</td>
              <td>${esc(l.actor)}</td>
              <td>${esc(l.action)}</td>
              <td><span class="badge badge-neutral">${esc(l.module)}</span></td>
            </tr>`).join("")}
          </tbody>
        </table>
      </div>
    </div>`;

  return pageShell(
    `${esc(State.role === "admin" ? "Administration Dashboard" : State.role === "teacher" ? "Teacher Dashboard" : "Bursar Dashboard")}`,
    roleIntro,
    `<button class="btn btn-outline" onclick="FLC.go('reportcards')">${icon("print", 14)} Report Cards</button>
     <button class="btn btn-accent" onclick="FLC.openPaymentModal()">${icon("plus", 14)} Record Fee Payment</button>`,
    body
  );
}

/* --------------------------- Parent Dashboard ----------------------------- */
function pageParentDashboard() {
  const stu = State.db.students.find((s) => s.id === State.parentStudentId) || State.db.students[0];
  const a = studentAverage(stu.id);
  const att = Object.values(State.db.attendanceRecords).map((d) => d[stu.id]).filter(Boolean);
  const presentPct = stu.attendanceRate;
  const b = State.db.systemConfig.branding;

  const body = `
    <div class="card" style="background:linear-gradient(135deg,var(--primary),var(--primary-dark));color:#fff;border:none">
      <div style="display:flex;gap:1.25rem;align-items:center;flex-wrap:wrap">
        <div style="width:64px;height:64px;border-radius:16px;background:rgba(255,255,255,0.18);display:flex;align-items:center;justify-content:center;font-size:1.5rem;font-weight:800;border:2px solid rgba(255,255,255,0.4)">${esc(stu.firstName[0] + stu.lastName[0])}</div>
        <div style="flex:1;min-width:220px">
          <div style="font-size:0.78rem;opacity:0.85;text-transform:uppercase;letter-spacing:0.05em">Welcome to the ${esc(b.shortName)} Parent & Learner Portal</div>
          <h2 style="font-size:1.35rem;font-weight:800">${esc(stu.firstName)} ${esc(stu.lastName)}</h2>
          <div style="font-size:0.85rem;opacity:0.92">${esc(stu.admNo)} · ${esc(stu.grade)} ${esc(stu.stream)} Stream · ${esc(stu.boardingStatus)} Scholar · NEMIS ${esc(stu.nemisUpi)}</div>
        </div>
        <div style="display:flex;gap:0.85rem;flex-wrap:wrap">
          <div style="background:rgba(255,255,255,0.15);padding:0.6rem 0.9rem;border-radius:10px;text-align:center">
            <div style="font-size:1.3rem;font-weight:800">${a}%</div><div style="font-size:0.72rem;opacity:0.9">Term Mean</div>
          </div>
          <div style="background:rgba(255,255,255,0.15);padding:0.6rem 0.9rem;border-radius:10px;text-align:center">
            <div style="font-size:1.3rem;font-weight:800">${presentPct}%</div><div style="font-size:0.72rem;opacity:0.9">Attendance</div>
          </div>
          <div style="background:rgba(255,255,255,0.15);padding:0.6rem 0.9rem;border-radius:10px;text-align:center">
            <div style="font-size:1.3rem;font-weight:800">${money(stu.balance)}</div><div style="font-size:0.72rem;opacity:0.9">Fee Balance</div>
          </div>
        </div>
      </div>
    </div>

    <div class="grid-2">
      <div class="card">
        <div class="card-header"><div class="card-title">${icon("book")} School Notices & Circulars</div></div>
        ${State.db.communications.slice(0, 4).map((c) => `
          <div style="padding:0.75rem 0;border-bottom:1px solid var(--border-color)">
            <strong style="font-size:0.87rem">${esc(c.title)}</strong>
            <div style="font-size:0.81rem;color:var(--text-muted);margin:3px 0">${esc(c.message)}</div>
            <div style="font-size:0.72rem;color:var(--text-muted)">${esc(c.date)} · ${esc(c.sender)}</div>
          </div>`).join("")}
      </div>
      <div class="card">
        <div class="card-header"><div class="card-title">${icon("calendar")} Recent Attendance Register</div>
          <button class="btn btn-outline btn-sm" onclick="FLC.go('attendance')">Full Register</button></div>
        <div class="table-wrap">
          <table class="data-table">
            <thead><tr><th>Date</th><th>Status</th><th>Time In</th><th>Note</th></tr></thead>
            <tbody>
              ${Object.keys(State.db.attendanceRecords).sort().reverse().map((d) => {
                const r = State.db.attendanceRecords[d][stu.id];
                if (!r) return "";
                return `<tr><td>${esc(d)}</td><td><span class="badge ${r.status === "Present" ? "badge-success" : r.status === "Late" ? "badge-warning" : r.status === "Absent" ? "badge-danger" : "badge-info"}">${esc(r.status)}</span></td><td>${esc(r.timeIn)}</td><td style="color:var(--text-muted)">${esc(r.note)}</td></tr>`;
              }).join("")}
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <div class="card">
      <div class="card-header"><div class="card-title">${icon("wallet")} Term ${esc(State.db.systemConfig.academicConfig.currentTerm.replace("Term ", ""))} Fee Position & Quick M-Pesa Payment</div></div>
      <div class="grid-3">
        <div><div class="kpi-label">Total Billed</div><div class="kpi-value" style="font-size:1.2rem">${money(stu.billedAmount)}</div></div>
        <div><div class="kpi-label">Total Paid</div><div class="kpi-value" style="font-size:1.2rem;color:var(--success)">${money(stu.paidAmount)}</div></div>
        <div><div class="kpi-label">Balance Due</div><div class="kpi-value" style="font-size:1.2rem;color:${stu.balance > 0 ? "var(--danger)" : "var(--success)"}">${money(stu.balance)}</div></div>
      </div>
      <div class="progress-track" style="margin:0.85rem 0 1rem"><div class="progress-fill" style="width:${stu.billedAmount ? Math.round((stu.paidAmount / stu.billedAmount) * 100) : 0}%;background:var(--success)"></div></div>
      <div style="background:#ffffff;border:1px dashed var(--border-color);border-radius:10px;padding:0.9rem;font-size:0.84rem">
        <strong>M-Pesa Paybill Instructions:</strong> Paybill <strong>${esc(State.db.systemConfig.financeConfig.mpesaPaybill)}</strong> · Account Number <strong>${esc(State.db.systemConfig.financeConfig.mpesaAccountPrefix)}-${esc(stu.admNo.split("/").pop())}</strong> · School: ${esc(b.schoolName)}.
        Bank: ${esc(State.db.systemConfig.financeConfig.bankName)} A/C ${esc(State.db.systemConfig.financeConfig.bankAccount)}
      </div>
      <div style="margin-top:0.9rem;display:flex;gap:0.6rem;flex-wrap:wrap">
        <button class="btn btn-success" onclick="FLC.openPaymentModal('${stu.id}')">${icon("phone", 14)} Simulate M-Pesa STK Push</button>
        <button class="btn btn-outline" onclick="FLC.go('finance')">View Fee Statement & Receipts</button>
        <button class="btn btn-outline" onclick="FLC.go('reportcards')">View Report Card</button>
      </div>
    </div>`;

  return pageShell(
    "Parent / Learner Dashboard",
    "Monitor your child's academic progress, attendance, fee statement and school communication.",
    `<select class="select" onchange="FLC.setParentStudent(this.value)">
      ${State.db.students.map((s) => `<option value="${s.id}" ${s.id === stu.id ? "selected" : ""}>${esc(s.firstName)} ${esc(s.lastName)} — ${esc(s.grade)}</option>`).join("")}
    </select>`,
    body
  );
}

/* -------------------------- Students & Admissions ------------------------- */
function pageStudents() {
  const f = State.filters.students || (State.filters.students = { q: "", grade: "", stream: "", boarding: "", status: "" });
  const customStudentFields = State.db.systemConfig.customFields.filter((c) => c.entity === "student" && c.active);
  const grades = [...new Set(State.db.students.map((s) => s.grade))];

  let list = State.db.students.filter((s) => {
    const q = f.q.toLowerCase();
    const matchQ = !q || `${s.firstName} ${s.lastName} ${s.admNo} ${s.nemisUpi} ${s.guardianName} ${s.guardianPhone}`.toLowerCase().includes(q);
    return matchQ && (!f.grade || s.grade === f.grade) && (!f.stream || s.stream === f.stream) && (!f.boarding || s.boardingStatus === f.boarding) && (!f.status || s.status === f.status);
  });

  const totalBilled = list.reduce((x, s) => x + Number(s.billedAmount || 0), 0);
  const totalPaid = list.reduce((x, s) => x + Number(s.paidAmount || 0), 0);
  const totalBalance = list.reduce((x, s) => x + Number(s.balance || 0), 0);

  const body = `
    <div class="kpi-grid">
      <div class="kpi-card"><div class="kpi-top"><span class="kpi-label">Learners in View</span><span class="kpi-icon">${icon("students")}</span></div><div class="kpi-value">${list.length}</div><div class="kpi-sub">of ${State.db.students.length} total enrolled</div></div>
      <div class="kpi-card success"><div class="kpi-top"><span class="kpi-label">Billed</span><span class="kpi-icon">${icon("wallet")}</span></div><div class="kpi-value" style="font-size:1.2rem">${money(totalBilled)}</div><div class="kpi-sub">Term fee demand</div></div>
      <div class="kpi-card"><div class="kpi-top"><span class="kpi-label">Collected</span><span class="kpi-icon">${icon("check")}</span></div><div class="kpi-value" style="font-size:1.2rem">${money(totalPaid)}</div><div class="kpi-sub">${totalBilled ? Math.round((totalPaid / totalBilled) * 100) : 0}% collection rate</div></div>
      <div class="kpi-card danger"><div class="kpi-top"><span class="kpi-label">Arrears</span><span class="kpi-icon">${icon("chart")}</span></div><div class="kpi-value" style="font-size:1.2rem">${money(totalBalance)}</div><div class="kpi-sub">${list.filter((s) => s.balance > 0).length} learners owing</div></div>
    </div>

    <div class="card">
      <div class="card-header">
        <div class="card-title">${icon("clipboard")} Learner Register — Admissions & Bio-Data</div>
        <span class="badge badge-neutral">${esc(State.db.systemConfig.academicConfig.currentTerm)} ${esc(State.db.systemConfig.academicConfig.currentYear)}</span>
      </div>
      <div class="filter-bar">
        <input class="input js-search" id="students-search" style="min-width:230px" placeholder="Search name, ADM No, NEMIS UPI, guardian…" value="${esc(f.q)}" oninput="FLC.fSearch('students','q',this.value)" />
        <select class="select" onchange="FLC.f('students','grade',this.value)">
          <option value="">All Classes</option>
          ${grades.map((g) => `<option ${f.grade === g ? "selected" : ""}>${esc(g)}</option>`).join("")}
        </select>
        <select class="select" onchange="FLC.f('students','stream',this.value)">
          <option value="">All Streams</option>
          ${State.db.systemConfig.academicConfig.streams.map((s) => `<option ${f.stream === s ? "selected" : ""}>${esc(s)}</option>`).join("")}
        </select>
        <select class="select" onchange="FLC.f('students','boarding',this.value)">
          <option value="">Day & Boarding</option>
          <option ${f.boarding === "Day" ? "selected" : ""}>Day</option>
          <option ${f.boarding === "Boarding" ? "selected" : ""}>Boarding</option>
        </select>
        <button class="btn btn-outline btn-sm" onclick="FLC.f('students','reset')">Reset</button>
        <div style="margin-left:auto;display:flex;gap:0.5rem">
          <button class="btn btn-outline btn-sm" onclick="FLC.exportCsv('students')">${icon("download", 13)} CSV</button>
          <button class="btn btn-primary btn-sm" onclick="FLC.openStudentModal()">${icon("plus", 13)} Admit New Learner</button>
        </div>
      </div>
      <div class="table-wrap">
        <table class="data-table">
          <thead>
            <tr><th>ADM / NEMIS</th><th>Learner</th><th>Class & Stream</th><th>Status</th><th>Guardian</th><th>Fee Position</th><th>Mean</th><th>Actions</th></tr>
          </thead>
          <tbody>
            ${list.length ? list.map((s) => {
              const avg = studentAverage(s.id);
              return `<tr>
                <td><strong>${esc(s.admNo)}</strong><div style="font-size:0.72rem;color:var(--text-muted)">UPI ${esc(s.nemisUpi)}</div></td>
                <td>${esc(s.firstName)} ${esc(s.lastName)}<div style="font-size:0.72rem;color:var(--text-muted)">${esc(s.gender)} · DOB ${esc(s.dob)}</div></td>
                <td>${esc(s.grade)}<div style="font-size:0.72rem;color:var(--text-muted)">${esc(s.stream)} · ${esc(s.boardingStatus)}${s.dormHouse && s.dormHouse !== "N/A" ? " · " + esc(s.dormHouse) : ""}</div></td>
                <td><span class="badge badge-success">${esc(s.status)}</span>${s.transportRoute && s.transportRoute !== "None" ? `<div style="font-size:0.72rem;color:var(--text-muted);margin-top:3px">${icon("bus", 11)} ${esc(s.transportRoute.split("—")[0])}</div>` : ""}</td>
                <td>${esc(s.guardianName)}<div style="font-size:0.72rem;color:var(--text-muted)">${esc(s.guardianPhone)}</div></td>
                <td>
                  <div style="font-size:0.8rem">Billed <strong>${money(s.billedAmount)}</strong></div>
                  <div style="font-size:0.8rem">Paid <strong style="color:var(--success)">${money(s.paidAmount)}</strong></div>
                  <div style="font-size:0.8rem">Balance <strong style="color:${s.balance > 0 ? "var(--danger)" : "var(--success)"}">${money(s.balance)}</strong></div>
                </td>
                <td><strong>${avg}%</strong><div style="margin-top:3px">${gradeBadge(avg)}</div></td>
                <td>
                  <div style="display:flex;gap:0.3rem;flex-wrap:wrap">
                    <button class="btn btn-outline btn-sm" onclick="FLC.openStudentModal('${s.id}')">${icon("edit", 12)}</button>
                    <button class="btn btn-outline btn-sm" onclick="FLC.viewStudent('${s.id}')">${icon("search", 12)} Profile</button>
                    <button class="btn btn-success btn-sm" onclick="FLC.openPaymentModal('${s.id}')">${icon("wallet", 12)} Pay</button>
                    <button class="btn btn-outline btn-sm" onclick="FLC.openReportCard('${s.id}')">${icon("print", 12)} Report</button>
                    ${State.role === "admin" ? `<button class="btn btn-danger btn-sm" onclick="FLC.removeStudent('${s.id}')">${icon("trash", 12)}</button>` : ""}
                  </div>
                </td>
              </tr>`;
            }).join("") : `<tr><td colspan="8" style="text-align:center;padding:2rem;color:var(--text-muted)">No learners match the current filters.</td></tr>`}
          </tbody>
        </table>
      </div>
      <div style="font-size:0.78rem;color:var(--text-muted);margin-top:0.75rem">
        Custom learner fields active: ${customStudentFields.map((c) => `<span class="badge badge-neutral">${esc(c.label)}</span>`).join(" ") || "none"} — configure in Backend Customization Zone.
      </div>
    </div>`;

  return pageShell(
    "Students & Admissions Register",
    "Complete learner bio-data, NEMIS/KNEC identifiers, guardians, boarding & transport allocation, and live fee position.",
    `<button class="btn btn-outline" onclick="FLC.go('customizer')">${icon("cog", 14)} Custom Fields</button>
     <button class="btn btn-primary" onclick="FLC.openStudentModal()">${icon("plus", 14)} Admit New Learner</button>`,
    body
  );
}

/* --------------------------- Attendance Register -------------------------- */
function pageAttendance() {
  if (State.role === "parent") return pageParentAttendance();
  const today = "2026-10-11";
  const att = State.db.attendanceRecords[today] || {};
  const grades = [...new Set(State.db.students.map((s) => s.grade))];
  const counts = { Present: 0, Absent: 0, Late: 0, Excused: 0 };
  Object.values(att).forEach((r) => { if (counts[r.status] !== undefined) counts[r.status]++; });

  const body = `
    <div class="kpi-grid">
      <div class="kpi-card success"><div class="kpi-top"><span class="kpi-label">Present Today</span><span class="kpi-icon">${icon("check")}</span></div><div class="kpi-value">${counts.Present}</div><div class="kpi-sub">Roll-call verified</div></div>
      <div class="kpi-card danger"><div class="kpi-top"><span class="kpi-label">Absent</span><span class="kpi-icon">${icon("x")}</span></div><div class="kpi-value">${counts.Absent}</div><div class="kpi-sub">Auto-SMS alert ${State.db.systemConfig.financeConfig.autoSmsOnAbsence ? "enabled" : "disabled"}</div></div>
      <div class="kpi-card accent"><div class="kpi-top"><span class="kpi-label">Late Arrivals</span><span class="kpi-icon">${icon("clock")}</span></div><div class="kpi-value">${counts.Late}</div><div class="kpi-sub">Parents notified</div></div>
      <div class="kpi-card"><div class="kpi-top"><span class="kpi-label">Excused</span><span class="kpi-icon">${icon("clipboard")}</span></div><div class="kpi-value">${counts.Excused}</div><div class="kpi-sub">With documented reason</div></div>
    </div>

    <div class="card">
      <div class="card-header">
        <div class="card-title">${icon("calendar")} Daily Roll-Call Register — ${esc(today)}</div>
        <div style="display:flex;gap:0.5rem;align-items:center">
          <span class="badge badge-info">Class Teacher: Mr. Kelvin Mwangi</span>
          <button class="btn btn-primary btn-sm" onclick="FLC.saveAttendance()">${icon("check", 13)} Save Register</button>
        </div>
      </div>
      <div class="table-wrap">
        <table class="data-table" id="attendance-table">
          <thead><tr><th>ADM No</th><th>Learner</th><th>Class</th><th>Time In</th><th>Status</th><th>Real-time Note</th></tr></thead>
          <tbody>
            ${State.db.students.map((s) => {
              const r = att[s.id] || { status: "Present", timeIn: "07:30 AM", note: "" };
              return `<tr data-stu="${s.id}">
                <td>${esc(s.admNo)}</td>
                <td>${esc(s.firstName)} ${esc(s.lastName)}</td>
                <td>${esc(s.grade)} <span style="color:var(--text-muted)">${esc(s.stream)}</span></td>
                <td><input class="input" style="width:110px" data-field="timeIn" value="${esc(r.timeIn)}" /></td>
                <td>
                  <select class="select" data-field="status">
                    ${["Present", "Late", "Absent", "Excused"].map((st) => `<option ${r.status === st ? "selected" : ""}>${st}</option>`).join("")}
                  </select>
                </td>
                <td><input class="input" style="min-width:220px" data-field="note" value="${esc(r.note)}" placeholder="Note / reason…" /></td>
              </tr>`;
            }).join("")}
          </tbody>
        </table>
      </div>
    </div>

    <div class="grid-2">
      <div class="card">
        <div class="card-header"><div class="card-title">${icon("chart")} Attendance Trend by Class</div></div>
        ${grades.map((g) => {
          const list = State.db.students.filter((s) => s.grade === g);
          const avgRate = list.length ? Math.round(list.reduce((x, s) => x + s.attendanceRate, 0) / list.length) : 0;
          return `<div style="margin-bottom:0.75rem">
            <div style="display:flex;justify-content:space-between;font-size:0.82rem;margin-bottom:4px"><strong>${esc(g)}</strong><span>${avgRate}%</span></div>
            <div class="progress-track"><div class="progress-fill" style="width:${avgRate}%;background:${avgRate >= 95 ? "var(--success)" : avgRate >= 90 ? "var(--primary)" : "var(--accent)"}"></div></div>
          </div>`;
        }).join("")}
      </div>
      <div class="card">
        <div class="card-header"><div class="card-title">${icon("message")} Automated Parent Absence Alerts</div></div>
        <div style="font-size:0.84rem;color:var(--text-muted);margin-bottom:0.75rem">
          When the register is saved, Faith Learning Centre automatically dispatches SMS alerts to guardians of absent & late learners via ${esc(State.db.systemConfig.financeConfig.smsGatewayProvider)}.
        </div>
        <div style="background:#ffffff;border-radius:10px;padding:0.9rem;border:1px dashed var(--border-color);font-size:0.83rem">
          <strong>Example alert:</strong><br/>
          "Dear Parent, Noah Musyoka (Grade 1) was marked ABSENT today ${esc(today)} at Faith Learning Centre. Kindly contact the class teacher on +254 722 901 445. — Principal"
        </div>
        <div style="margin-top:0.9rem;display:flex;gap:0.5rem;flex-wrap:wrap">
          <button class="btn btn-accent btn-sm" onclick="FLC.sendAbsenceSms()">${icon("message", 13)} Dispatch Absence Alerts Now</button>
          <button class="btn btn-outline btn-sm" onclick="FLC.go('communications')">SMS Hub</button>
        </div>
      </div>
    </div>`;

  return pageShell(
    "Attendance Register & Roll-Call",
    "Capture daily class attendance, lateness and exculpated absence with automatic guardian notification.",
    `<span class="school-pill green">${icon("calendar", 14)} ${esc(State.db.systemConfig.academicConfig.currentTerm)} ${esc(State.db.systemConfig.academicConfig.currentYear)}</span>`,
    body
  );
}

/* ------------------------ Academics & CBC Markbook ------------------------ */
function pageAcademics() {
  const cfg = State.db.systemConfig.academicConfig;
  const grades = [...new Set(State.db.students.map((s) => s.grade))];
  const f = State.filters.markbook || (State.filters.markbook = { grade: grades[0], area: cfg.learningAreas.find((l) => l.active)?.code || "MATH", mode: "sba" });

  const list = State.db.students.filter((s) => s.grade === f.grade);
  const area = cfg.learningAreas.find((l) => l.code === f.area) || cfg.learningAreas[0];
  const editable = State.role === "admin" || (State.role === "teacher" && State.db.systemConfig.rolePermissions.teacher.canEditMarks);

  const averages = list.map((s) => studentAverage(s.id));
  const classMean = averages.length ? Math.round(averages.reduce((a, b) => a + b, 0) / averages.length) : 0;

  const body = `
    <div class="kpi-grid">
      <div class="kpi-card"><div class="kpi-top"><span class="kpi-label">Class Mean</span><span class="kpi-icon">${icon("graduation")}</span></div><div class="kpi-value">${classMean}%</div><div class="kpi-sub">${esc(f.grade)} · ${list.length} learners</div></div>
      <div class="kpi-card accent"><div class="kpi-top"><span class="kpi-label">SBA / Exam Weighting</span><span class="kpi-icon">${icon("layers")}</span></div><div class="kpi-value">${cfg.sbaWeight}% / ${cfg.examWeight}%</div><div class="kpi-sub">School-Based Assessment · Exam — configurable in Backend Zone</div></div>
      <div class="kpi-card success"><div class="kpi-top"><span class="kpi-label">Meeting & Above</span><span class="kpi-icon">${icon("check")}</span></div><div class="kpi-value">${averages.filter((a) => a >= 60).length}/${averages.length}</div><div class="kpi-sub">ME or EE learners</div></div>
      <div class="kpi-card danger"><div class="kpi-top"><span class="kpi-label">Requiring Remedial</span><span class="kpi-icon">${icon("award")}</span></div><div class="kpi-value">${averages.filter((a) => a < 40).length}</div><div class="kpi-sub">Below Expectations — BE</div></div>
    </div>

    <div class="card">
      <div class="card-header">
        <div class="card-title">${icon("edit")} CBC & Exam Markbook Editor</div>
        <div style="display:flex;gap:0.5rem;flex-wrap:wrap">
          ${editable ? `<button class="btn btn-primary btn-sm" onclick="FLC.saveMarkbook()">${icon("check", 13)} Save Markbook</button>` : `<span class="badge badge-warning">Read-only: mark editing permission disabled</span>`}
        </div>
      </div>
      <div class="filter-bar">
        <select class="select" onchange="FLC.f('markbook','grade',this.value)">
          ${grades.map((g) => `<option ${f.grade === g ? "selected" : ""}>${esc(g)}</option>`).join("")}
        </select>
        <select class="select" onchange="FLC.f('markbook','area',this.value)">
          ${cfg.learningAreas.filter((l) => l.active).map((l) => `<option value="${l.code}" ${f.area === l.code ? "selected" : ""}>${esc(l.name)} (${esc(l.code)})</option>`).join("")}
        </select>
        <span class="badge badge-neutral">${editable ? "Editing enabled" : "Read-only"}</span>
        <span class="badge badge-info">Active Exam: ${esc(cfg.activeExamType)}</span>
        <div style="margin-left:auto"><button class="btn btn-outline btn-sm" onclick="FLC.go('customizer')">${icon("cog", 13)} Grading Scales</button></div>
      </div>
      <div class="table-wrap">
        <table class="data-table" id="markbook-table">
          <thead>
            <tr><th>#</th><th>Learner</th><th>SBA (out of 100)</th><th>${esc(cfg.activeExamType)} (out of 100)</th><th>Weighted Final</th><th>Rating</th><th>Teacher Comment</th></tr>
          </thead>
          <tbody>
            ${list.map((s, i) => {
              const rec = (State.db.assessments[s.id] || {})[area.code] || { sba: 0, exam: 0 };
              const final = recordScore(rec);
              return `<tr data-stu="${s.id}">
                <td>${i + 1}</td>
                <td><strong>${esc(s.firstName)} ${esc(s.lastName)}</strong><div style="font-size:0.72rem;color:var(--text-muted)">${esc(s.admNo)} · ${esc(s.stream)}</div></td>
                <td><input class="input" style="width:90px" type="number" min="0" max="100" data-field="sba" value="${rec.sba}" ${editable ? "" : "disabled"} /></td>
                <td><input class="input" style="width:90px" type="number" min="0" max="100" data-field="exam" value="${rec.exam}" ${editable ? "" : "disabled"} /></td>
                <td><strong style="font-size:1rem">${final}%</strong></td>
                <td>${gradeBadge(final)}</td>
                <td><input class="input" style="min-width:250px" data-field="comment" value="${esc((State.db.assessments[s.id] || {})[area.code + "_comment"] || "")}" placeholder="Strand-specific remark…" ${editable ? "" : "disabled"} /></td>
              </tr>`;
            }).join("")}
          </tbody>
        </table>
      </div>
    </div>

    <div class="grid-2">
      <div class="card">
        <div class="card-header"><div class="card-title">${icon("layers")} Learning Areas & CBC Subject Configuration</div>
          <button class="btn btn-outline btn-sm" onclick="FLC.go('customizer')">Manage Learning Areas</button></div>
        <div class="table-wrap">
          <table class="data-table">
            <thead><tr><th>Code</th><th>Learning Area</th><th>Category</th><th>Status</th></tr></thead>
            <tbody>
              ${cfg.learningAreas.map((l) => `<tr>
                <td><strong>${esc(l.code)}</strong></td><td>${esc(l.name)}</td><td>${esc(l.category)}</td>
                <td><span class="badge ${l.active ? "badge-success" : "badge-neutral"}">${l.active ? "Active" : "Disabled"}</span></td>
              </tr>`).join("")}
            </tbody>
          </table>
        </div>
      </div>
      <div class="card">
        <div class="card-header"><div class="card-title">${icon("chart")} Grade Performance Distribution — Grade Wrap-Up</div></div>
        ${(() => {
          const buckets = { EE: 0, ME: 0, AE: 0, BE: 0 };
          list.forEach((s) => {
            const a = studentAverage(s.id);
            const g = gradeFor(a);
            const code = g.cbc ? g.cbc.code : "BE";
            if (buckets[code] !== undefined) buckets[code]++;
          });
          const max = Math.max(1, ...Object.values(buckets));
          return Object.keys(buckets).map((k) => {
            const rb = cfg.cbcRubricScale.find((r) => r.code === k) || { color: "#5c5c5c", label: k };
            return `<div style="margin-bottom:0.8rem">
              <div style="display:flex;justify-content:space-between;font-size:0.82rem;margin-bottom:4px"><strong>${esc(k)} — ${esc(rb.label)}</strong><span>${buckets[k]} learners</span></div>
              <div class="progress-track"><div class="progress-fill" style="width:${(buckets[k] / max) * 100}%;background:${rb.color}"></div></div>
            </div>`;
          }).join("");
        })()}
      </div>
    </div>`;

  return pageShell(
    "Academics, CBC Rubrics & Markbook",
    `Enter School-Based Assessment and ${esc(cfg.activeExamType)} scores per learning area. The engine auto-applies the ${esc(cfg.gradingMode)} grading configuration.`,
    `<button class="btn btn-outline" onclick="FLC.go('reportcards')">${icon("print", 14)} Generate Report Cards</button>
     <button class="btn btn-primary" onclick="FLC.saveMarkbook()">${icon("check", 14)} Save Markbook</button>`,
    body
  );
}

/* ----------------------- Report Cards & Analytics ------------------------- */
function pageReportCards() {
  if (State.role === "parent") return pageParentReportCard();
  const sorted = classList();
  const mean = sorted.length ? Math.round(sorted.reduce((s, x) => s + studentAverage(x.id), 0) / sorted.length) : 0;
  const top = sorted.slice(0, 3);
  const cfg = State.db.systemConfig.academicConfig;

  // Class-level analysis
  const grades = [...new Set(State.db.students.map((s) => s.grade))];
  const classStats = grades.map((g) => {
    const list = State.db.students.filter((s) => s.grade === g);
    const avgs = list.map((s) => studentAverage(s.id));
    return { grade: g, count: list.length, mean: avgs.length ? Math.round(avgs.reduce((a, b) => a + b, 0) / avgs.length) : 0 };
  }).sort((a, b) => b.mean - a.mean);

  // Subject analysis
  const subjStats = cfg.learningAreas.filter((l) => l.active).map((l) => {
    const scores = State.db.students.map((s) => recordScore((State.db.assessments[s.id] || {})[l.code])).filter((x) => x !== null);
    return { name: l.name, code: l.code, mean: scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0, count: scores.length };
  }).sort((a, b) => b.mean - a.mean);

  const body = `
    <div class="kpi-grid">
      <div class="kpi-card"><div class="kpi-top"><span class="kpi-label">School Mean Score</span><span class="kpi-icon">${icon("graduation")}</span></div><div class="kpi-value">${mean}%</div><div class="kpi-sub">${gradeBadge(mean)}</div></div>
      <div class="kpi-card success"><div class="kpi-top"><span class="kpi-label">Top Scholar</span><span class="kpi-icon">${icon("award")}</span></div><div class="kpi-value" style="font-size:1.15rem">${esc(top[0] ? top[0].firstName + " " + top[0].lastName : "—")}</div><div class="kpi-sub">${top[0] ? `${studentAverage(top[0].id)}% · ${esc(top[0].grade)}` : ""}</div></div>
      <div class="kpi-card accent"><div class="kpi-top"><span class="kpi-label">Report Cards Ready</span><span class="kpi-icon">${icon("print")}</span></div><div class="kpi-value">${State.db.students.length}</div><div class="kpi-sub">${esc(cfg.currentTerm)} ${esc(cfg.currentYear)} · ${esc(cfg.activeExamType)}</div></div>
      <div class="kpi-card danger"><div class="kpi-top"><span class="kpi-label">Held for Arrears</span><span class="kpi-icon">${icon("wallet")}</span></div><div class="kpi-value">${State.db.systemConfig.financeConfig.lockReportCardOnArrears ? State.db.students.filter((s) => s.balance > State.db.systemConfig.financeConfig.lockReportCardThreshold).length : 0}</div><div class="kpi-sub">${State.db.systemConfig.financeConfig.lockReportCardOnArrears ? `Balance above ${money(State.db.systemConfig.financeConfig.lockReportCardThreshold)}` : "Report card withholding disabled"}</div></div>
    </div>

    <div class="grid-2">
      <div class="card">
        <div class="card-header"><div class="card-title">${icon("clipboard")} Class Ranking & Report Card Generator</div>
          <button class="btn btn-outline btn-sm" onclick="FLC.printAllReportCards()">${icon("print", 13)} Print All (Batch)</button></div>
        <div class="table-wrap">
          <table class="data-table">
            <thead><tr><th>Rank</th><th>Learner</th><th>Class</th><th>Mean</th><th>Rating</th><th>Report Card</th></tr></thead>
            <tbody>
              ${sorted.map((s) => {
                const a = studentAverage(s.id);
                const locked = State.db.systemConfig.financeConfig.lockReportCardOnArrears && s.balance > State.db.systemConfig.financeConfig.lockReportCardThreshold;
                return `<tr>
                  <td><strong>#${s.rank}</strong></td>
                  <td>${esc(s.firstName)} ${esc(s.lastName)}<div style="font-size:0.72rem;color:var(--text-muted)">${esc(s.admNo)}</div></td>
                  <td>${esc(s.grade)}</td>
                  <td><strong>${a}%</strong></td>
                  <td>${gradeBadge(a)}</td>
                  <td>${locked
                    ? `<span class="badge badge-danger">Withheld — arrears ${money(s.balance)}</span>`
                    : `<button class="btn btn-primary btn-sm" onclick="FLC.openReportCard('${s.id}')">${icon("print", 12)} Open</button>`}</td>
                </tr>`;
              }).join("")}
            </tbody>
          </table>
        </div>
      </div>

      <div>
        <div class="card">
          <div class="card-header"><div class="card-title">${icon("chart")} Class Mean Comparison</div></div>
          ${classStats.map((c) => `<div style="margin-bottom:0.8rem">
            <div style="display:flex;justify-content:space-between;font-size:0.82rem;margin-bottom:4px"><strong>${esc(c.grade)}</strong><span>${c.mean}% · ${c.count} learners</span></div>
            <div class="progress-track"><div class="progress-fill" style="width:${c.mean}%;background:var(--primary)"></div></div>
          </div>`).join("")}
        </div>
        <div class="card">
          <div class="card-header"><div class="card-title">${icon("layers")} Learning Area Analysis (School-Wide)</div></div>
          ${subjStats.map((s) => `<div style="margin-bottom:0.8rem">
            <div style="display:flex;justify-content:space-between;font-size:0.82rem;margin-bottom:4px"><strong>${esc(s.name)}</strong><span>${s.mean}%</span></div>
            <div class="progress-track"><div class="progress-fill" style="width:${s.mean}%;background:${s.mean >= 70 ? "var(--success)" : s.mean >= 50 ? "var(--accent)" : "var(--danger)"}"></div></div>
          </div>`).join("")}
        </div>
      </div>
    </div>

    <div class="card">
      <div class="card-header"><div class="card-title">${icon("sparkle")} CBC Grading Key in Force (configured in Backend Customization Zone)</div>
        <button class="btn btn-outline btn-sm" onclick="FLC.go('customizer')">${icon("cog", 13)} Edit Grading Engine</button></div>
      <div class="grid-2">
        <div>
          <div class="kpi-label" style="margin-bottom:0.5rem">Competency Rubric Levels (CBC)</div>
          <div class="table-wrap">
            <table class="data-table">
              <thead><tr><th>Level</th><th>Range</th><th>Points</th><th>Descriptor</th></tr></thead>
              <tbody>
                ${cfg.cbcRubricScale.map((r) => `<tr>
                  <td><span class="badge" style="background:${r.color}1a;color:${r.color}">${esc(r.code)} — ${esc(r.label)}</span></td>
                  <td>${r.min}–${r.max}%</td><td><strong>${r.points}</strong></td>
                  <td style="font-size:0.78rem;color:var(--text-muted)">${esc(r.remark)}</td>
                </tr>`).join("")}
              </tbody>
            </table>
          </div>
        </div>
        <div>
          <div class="kpi-label" style="margin-bottom:0.5rem">Standard Grade Scale (8-4-4 / %)</div>
          <div class="table-wrap">
            <table class="data-table">
              <thead><tr><th>Grade</th><th>Range</th><th>Points</th><th>Remark</th></tr></thead>
              <tbody>
                ${cfg.standardGradeScale.map((r) => `<tr><td><strong>${esc(r.grade)}</strong></td><td>${r.min}–${r.max}%</td><td>${r.points}</td><td style="font-size:0.78rem;color:var(--text-muted)">${esc(r.remark)}</td></tr>`).join("")}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>`;

  return pageShell(
    "Report Cards, Ranking & Academic Analytics",
    "Generate official CBC & standard report cards, analyse class performance, and track learner rankings.",
    `<button class="btn btn-outline" onclick="FLC.go('academics')">${icon("edit", 14)} Markbook</button>
     <button class="btn btn-primary" onclick="FLC.printAllReportCards()">${icon("print", 14)} Batch Print Report Cards</button>`,
    body
  );
}

/* ------------------------------- Timetable -------------------------------- */
function pageTimetable() {
  const f = State.filters.timetable || (State.filters.timetable = { grade: State.db.students[0]?.grade || "Grade 8 (JSS)" });
  const grades = [...new Set(State.db.students.map((s) => s.grade))];
  const todayName = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][new Date().getDay()];

  const body = `
    <div class="card">
      <div class="card-header">
        <div class="card-title">${icon("clock")} Weekly Master Timetable — ${esc(f.grade)}</div>
        <div style="display:flex;gap:0.5rem;flex-wrap:wrap">
          <select class="select" onchange="FLC.f('timetable','grade',this.value)">
            ${grades.map((g) => `<option ${f.grade === g ? "selected" : ""}>${esc(g)}</option>`).join("")}
          </select>
          <button class="btn btn-outline btn-sm" onclick="window.print()">${icon("print", 13)} Print Timetable</button>
        </div>
      </div>
      <div class="grid-3">
        ${State.db.timetable.map((day) => `
          <div style="border:1px solid ${day.day === todayName ? "var(--primary)" : "var(--border-color)"};border-radius:12px;overflow:hidden;${day.day === todayName ? "box-shadow:0 0 0 3px var(--primary-light)" : ""}">
            <div style="background:${day.day === todayName ? "var(--primary)" : "#f8f8f8"};color:${day.day === todayName ? "#fff" : "var(--text-main)"};padding:0.55rem 0.85rem;font-weight:700;font-size:0.88rem;display:flex;justify-content:space-between">
              <span>${esc(day.day)}</span>${day.day === todayName ? '<span class="badge" style="background:rgba(255,255,255,0.25);color:#fff">Today</span>' : ""}
            </div>
            <div style="padding:0.5rem">
              ${day.slots.map((sl) => {
                const isBreak = /BREAK|LUNCH|ASSEMBLY|PRAISE|FLAG/i.test(sl.subject);
                return `<div style="padding:0.45rem 0.5rem;border-bottom:1px dashed var(--border-color);${isBreak ? "background:var(--accent-light);border-radius:6px" : ""}">
                  <div style="font-size:0.7rem;color:var(--text-muted);font-weight:700">${esc(sl.time)}</div>
                  <div style="font-size:0.82rem;font-weight:${isBreak ? "600" : "700"}">${esc(sl.subject)}</div>
                  ${!isBreak ? `<div style="font-size:0.74rem;color:var(--text-muted)">${esc(sl.teacher)} · ${esc(sl.room)}</div>` : ""}
                </div>`;
              }).join("")}
            </div>
          </div>`).join("")}
      </div>
    </div>

    <div class="grid-2">
      <div class="card">
        <div class="card-header"><div class="card-title">${icon("clock")} Lesson Load per Teacher (Weekly Periods)</div></div>
        ${(() => {
          const load = {};
          State.db.timetable.forEach((d) => d.slots.forEach((s) => {
            if (/BREAK|LUNCH|ASSEMBLY|DUTY|All Staff|All Teachers|Class Teachers|Catering|Duty Roster/i.test(s.teacher)) return;
            load[s.teacher] = (load[s.teacher] || 0) + 1;
          }));
          const max = Math.max(1, ...Object.values(load));
          return Object.entries(load).sort((a, b) => b[1] - a[1]).map(([t, n]) => `
            <div style="margin-bottom:0.75rem">
              <div style="display:flex;justify-content:space-between;font-size:0.82rem;margin-bottom:4px"><strong>${esc(t)}</strong><span>${n} periods/week</span></div>
              <div class="progress-track"><div class="progress-fill" style="width:${(n / max) * 100}%"></div></div>
            </div>`).join("");
        })()}
      </div>
      <div class="card">
        <div class="card-header"><div class="card-title">${icon("building")} Room & Facility Utilisation</div></div>
        <div class="table-wrap">
          <table class="data-table">
            <thead><tr><th>Facility</th><th>Sessions/Week</th><th>Type</th></tr></thead>
            <tbody>
              ${(() => {
                const rooms = {};
                State.db.timetable.forEach((d) => d.slots.forEach((s) => { rooms[s.room] = (rooms[s.room] || 0) + 1; }));
                return Object.entries(rooms).sort((a, b) => b[1] - a[1]).map(([r, n]) => `<tr>
                  <td><strong>${esc(r)}</strong></td><td>${n}</td>
                  <td><span class="badge ${/Lab|ICT|Workshop|Studio|Farm|Complex|Pitch|Pool/i.test(r) ? "badge-info" : "badge-neutral"}">${/Lab|ICT|Workshop|Studio|Farm|Complex|Pitch|Pool/i.test(r) ? "Specialist" : "General"}</span></td>
                </tr>`).join("");
              })()}
            </tbody>
          </table>
        </div>
      </div>
    </div>`;

  return pageShell(
    "Master Timetable & Lesson Planner",
    "Weekly lesson schedules across all grades with teacher allocation, room booking, breaks and pastoral sessions.",
    State.role === "admin" ? `<button class="btn btn-outline" onclick="FLC.editTimetableModal()">${icon("edit", 14)} Edit Timetable Slot</button>` : "",
    body
  );
}

/* -------------------------- Finance, Fees & M-Pesa ------------------------ */

function pageFinance() {
  if (State.role === "parent") return pageParentFinance();
  const db = State.db;
  const fc = db.systemConfig.financeConfig;
  const students = db.students;
  const billed = students.reduce((s, x) => s + Number(x.billedAmount || 0), 0);
  const collected = students.reduce((s, x) => s + Number(x.paidAmount || 0), 0);
  const arrears = students.reduce((s, x) => s + Number(x.balance || 0), 0);
  const expenses = db.expenses.reduce((s, e) => s + e.amount, 0);
  const debtors = students.filter((s) => s.balance > 0).sort((a, b) => b.balance - a.balance);
  const byMethod = {};
  db.payments.forEach((p) => { byMethod[p.method] = (byMethod[p.method] || 0) + p.amount; });

  const body = `
    <div class="kpi-grid">
      <div class="kpi-card success"><div class="kpi-top"><span class="kpi-label">Collected This Term</span><span class="kpi-icon">${icon("wallet")}</span></div><div class="kpi-value">${money(collected)}</div><div class="kpi-sub">${billed ? Math.round((collected / billed) * 100) : 0}% of fee demand</div></div>
      <div class="kpi-card danger"><div class="kpi-top"><span class="kpi-label">Total Arrears</span><span class="kpi-icon">${icon("chart")}</span></div><div class="kpi-value">${money(arrears)}</div><div class="kpi-sub">${debtors.length} learners owing · ${debtors.filter((d) => d.balance > fc.arrearsAlertThreshold).length} above alert threshold</div></div>
      <div class="kpi-card accent"><div class="kpi-top"><span class="kpi-label">Term Expenditure</span><span class="kpi-icon">${icon("layers")}</span></div><div class="kpi-value">${money(expenses)}</div><div class="kpi-sub">Payroll, kitchen, materials, fuel, utilities</div></div>
      <div class="kpi-card"><div class="kpi-top"><span class="kpi-label">Net Position</span><span class="kpi-icon">${icon("chart")}</span></div><div class="kpi-value" style="color:${collected - expenses >= 0 ? "var(--success)" : "var(--danger)"}">${money(collected - expenses)}</div><div class="kpi-sub">Collections less expenditure</div></div>
    </div>

    <div class="card">
      <div class="card-header">
        <div class="card-title">${icon("clipboard")} Fee Collection Ledger — M-Pesa, Bank & Cash</div>
        <div style="display:flex;gap:0.5rem;flex-wrap:wrap">
          <button class="btn btn-outline btn-sm" onclick="FLC.exportCsv('payments')">${icon("download", 13)} Export Ledger</button>
          <button class="btn btn-primary btn-sm" onclick="FLC.openPaymentModal()">${icon("plus", 13)} Record Payment</button>
        </div>
      </div>
      <div class="filter-bar">
        <span class="badge badge-info">Paybill ${esc(fc.mpesaPaybill)} · Prefix ${esc(fc.mpesaAccountPrefix)}</span>
        <span class="badge badge-neutral">${esc(fc.bankName)}</span>
        <span class="badge ${fc.autoSmsOnPayment ? "badge-success" : "badge-neutral"}">Auto-SMS on payment: ${fc.autoSmsOnPayment ? "ON" : "OFF"}</span>
        <button class="btn btn-outline btn-sm" style="margin-left:auto" onclick="FLC.go('customizer')">${icon("cog", 13)} Payment Gateway Settings</button>
      </div>
      <div class="table-wrap">
        <table class="data-table">
          <thead><tr><th>Receipt No</th><th>Learner</th><th>Votehead</th><th>Method / Ref</th><th>Paid By</th><th>Date</th><th style="text-align:right">Amount</th><th></th></tr></thead>
          <tbody>
            ${db.payments.map((p) => `<tr>
              <td><strong>${esc(p.receiptNo)}</strong><div style="font-size:0.72rem;color:var(--text-muted)">${esc(p.term)}</div></td>
              <td>${esc(p.studentName)}<div style="font-size:0.72rem;color:var(--text-muted)">${esc(p.admNo)} · ${esc(p.grade)}</div></td>
              <td style="font-size:0.8rem">${esc(p.votehead)}</td>
              <td><span class="badge ${p.method.includes("M-Pesa") ? "badge-success" : "badge-info"}">${esc(p.method)}</span><div style="font-size:0.72rem;color:var(--text-muted)">${esc(p.reference)}</div></td>
              <td style="font-size:0.8rem">${esc(p.paidBy)}</td>
              <td style="white-space:nowrap">${esc(p.date)}</td>
              <td style="text-align:right"><strong style="color:var(--success)">${money(p.amount)}</strong></td>
              <td><button class="btn btn-outline btn-sm" onclick="FLC.openReceipt('${p.id}')">${icon("print", 12)} Receipt</button></td>
            </tr>`).join("")}
          </tbody>
        </table>
      </div>
    </div>

    <div class="grid-2">
      <div class="card">
        <div class="card-header"><div class="card-title">${icon("chart")} Arrears, Debtors & Reminder Engine</div>
          <button class="btn btn-accent btn-sm" onclick="FLC.sendFeeReminders()">${icon("message", 13)} Send Arrears SMS</button></div>
        <div class="table-wrap">
          <table class="data-table">
            <thead><tr><th>Learner</th><th>Class</th><th>Guardian</th><th style="text-align:right">Balance</th><th></th></tr></thead>
            <tbody>
              ${debtors.length ? debtors.map((s) => `<tr>
                <td><strong>${esc(s.firstName)} ${esc(s.lastName)}</strong><div style="font-size:0.72rem;color:var(--text-muted)">${esc(s.admNo)}</div></td>
                <td>${esc(s.grade)}</td>
                <td style="font-size:0.8rem">${esc(s.guardianName)}<div style="font-size:0.72rem;color:var(--text-muted)">${esc(s.guardianPhone)}</div></td>
                <td style="text-align:right"><strong style="color:${s.balance > fc.arrearsAlertThreshold ? "var(--danger)" : "var(--warning)"}">${money(s.balance)}</strong></td>
                <td><button class="btn btn-outline btn-sm" onclick="FLC.openPaymentModal('${s.id}')">${icon("wallet", 12)} Collect</button></td>
              </tr>`).join("") : `<tr><td colspan="5" style="text-align:center;padding:1.5rem;color:var(--text-muted)">All fee balances cleared. 🎉</td></tr>`}
            </tbody>
          </table>
        </div>
      </div>

      <div>
        <div class="card">
          <div class="card-header"><div class="card-title">${icon("wallet")} Collection Channels Breakdown</div></div>
          ${Object.entries(byMethod).map(([m, v]) => {
            const pct = collected ? Math.round((v / collected) * 100) : 0;
            return `<div style="margin-bottom:0.8rem">
              <div style="display:flex;justify-content:space-between;font-size:0.82rem;margin-bottom:4px"><strong>${esc(m)}</strong><span>${money(v)} · ${pct}%</span></div>
              <div class="progress-track"><div class="progress-fill" style="width:${pct}%;background:${m.includes("M-Pesa") ? "var(--success)" : "var(--primary)"}"></div></div>
            </div>`;
          }).join("") || `<div style="color:var(--text-muted);font-size:0.84rem">No collections recorded yet.</div>`}
        </div>
        <div class="card">
          <div class="card-header"><div class="card-title">${icon("layers")} Term Expenditure & Voteheads</div>
            <div style="display:flex;gap:0.5rem">
              <button class="btn btn-outline btn-sm" onclick="FLC.openExpenseModal()">${icon("plus", 12)} Add Expense</button>
              <button class="btn btn-outline btn-sm" onclick="FLC.go('reports')">${icon("chart", 12)} Reports</button>
            </div>
          </div>
          <div class="table-wrap">
            <table class="data-table">
              <thead><tr><th>Date</th><th>Category</th><th>Description</th><th>Approved By</th><th style="text-align:right">Amount</th></tr></thead>
              <tbody>
                ${db.expenses.map((e) => `<tr>
                  <td>${esc(e.date)}</td>
                  <td><span class="badge badge-neutral">${esc(e.category)}</span></td>
                  <td style="font-size:0.8rem">${esc(e.description)}<div style="font-size:0.72rem;color:var(--text-muted)">${esc(e.vendor)}</div></td>
                  <td style="font-size:0.8rem">${esc(e.approvedBy)}</td>
                  <td style="text-align:right"><strong style="color:var(--danger)">${money(e.amount)}</strong></td>
                </tr>`).join("")}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>`;

  return pageShell(
    "Finance, Fees & M-Pesa Reconciliation",
    "Fee structures by level, M-Pesa Paybill receipting, arrears tracking, expenditure control and term financial reporting.",
    `<button class="btn btn-outline" onclick="FLC.go('customizer')">${icon("cog", 14)} Fee & Gateway Config</button>
     <button class="btn btn-accent" onclick="FLC.openPaymentModal()">${icon("plus", 14)} Record Payment</button>`,
    body
  );
}

function pageParentFinance() {
  const stu = State.db.students.find((s) => s.id === State.parentStudentId) || State.db.students[0];
  const fc = State.db.systemConfig.financeConfig;
  const payments = State.db.payments.filter((p) => p.studentId === stu.id);

  const body = `
    <div class="card">
      <div class="card-header"><div class="card-title">${icon("clipboard")} Official Fee Statement — ${esc(stu.firstName)} ${esc(stu.lastName)}</div>
        <span class="badge badge-info">${esc(State.db.systemConfig.academicConfig.currentTerm)} ${esc(State.db.systemConfig.academicConfig.currentYear)}</span></div>
      <div class="official-doc">
        <div class="official-doc-header">
          <h2>${esc(State.db.systemConfig.branding.schoolName)}</h2>
          <div style="font-size:0.82rem">${esc(State.db.systemConfig.branding.address)} · Tel ${esc(State.db.systemConfig.branding.phone)}</div>
          <div class="motto">"${esc(State.db.systemConfig.branding.motto)}"</div>
          <div style="margin-top:0.5rem;font-weight:700">TERM FEE STATEMENT OF ACCOUNT</div>
        </div>
        <div class="grid-3" style="margin-bottom:1rem">
          <div><div class="kpi-label">Learner</div><strong>${esc(stu.firstName)} ${esc(stu.lastName)}</strong></div>
          <div><div class="kpi-label">Admission No</div><strong>${esc(stu.admNo)}</strong></div>
          <div><div class="kpi-label">Class</div><strong>${esc(stu.grade)} · ${esc(stu.stream)}</strong></div>
          <div><div class="kpi-label">Boarding Status</div><strong>${esc(stu.boardingStatus)}</strong></div>
          <div><div class="kpi-label">Guardian</div><strong>${esc(stu.guardianName)}</strong></div>
          <div><div class="kpi-label">Transport</div><strong>${esc(stu.transportRoute)}</strong></div>
        </div>
        <div class="table-wrap">
          <table class="data-table">
            <thead><tr><th>Votehead</th><th style="text-align:right">Billed</th><th style="text-align:right">Paid</th><th style="text-align:right">Balance</th></tr></thead>
            <tbody>
              <tr><td>Tuition, Meals, CBC Activities, ICT & Library${stu.transportFee ? ", Transport" : ""}</td>
                <td style="text-align:right">${money(stu.billedAmount)}</td>
                <td style="text-align:right">${money(stu.paidAmount)}</td>
                <td style="text-align:right"><strong style="color:${stu.balance > 0 ? "var(--danger)" : "var(--success)"}">${money(stu.balance)}</strong></td></tr>
            </tbody>
          </table>
        </div>
        <div style="margin-top:1rem;font-size:0.8rem;color:var(--text-muted)">
          ${esc(fc.receiptFooter || State.db.systemConfig.branding.receiptFooter)}
        </div>
        <div style="margin-top:1rem;text-align:right;font-size:0.8rem">
          Prepared by: <strong>${esc(State.db.systemConfig.branding.bursarName)}</strong> — Chief Bursar
        </div>
      </div>
      <div style="margin-top:0.9rem;display:flex;gap:0.6rem;flex-wrap:wrap">
        <button class="btn btn-success" onclick="FLC.openPaymentModal('${stu.id}')">${icon("phone", 14)} Pay via M-Pesa STK Push</button>
        <button class="btn btn-outline" onclick="window.print()">${icon("print", 14)} Print Statement</button>
      </div>
    </div>

    <div class="card">
      <div class="card-header"><div class="card-title">${icon("wallet")} Payment History & Receipts</div></div>
      <div class="table-wrap">
        <table class="data-table">
          <thead><tr><th>Receipt</th><th>Date</th><th>Method / Ref</th><th>Votehead</th><th style="text-align:right">Amount</th><th></th></tr></thead>
          <tbody>
            ${payments.length ? payments.map((p) => `<tr>
              <td><strong>${esc(p.receiptNo)}</strong></td><td>${esc(p.date)}</td>
              <td><span class="badge badge-success">${esc(p.method)}</span> ${esc(p.reference)}</td>
              <td style="font-size:0.8rem">${esc(p.votehead)}</td>
              <td style="text-align:right"><strong>${money(p.amount)}</strong></td>
              <td><button class="btn btn-outline btn-sm" onclick="FLC.openReceipt('${p.id}')">${icon("print", 12)} Receipt</button></td>
            </tr>`).join("") : `<tr><td colspan="6" style="text-align:center;padding:1.5rem;color:var(--text-muted)">No payments recorded for this term yet.</td></tr>`}
          </tbody>
        </table>
      </div>
    </div>`;

  return pageShell(
    "Fee Statement & M-Pesa Payment",
    "View your child's term fee statement, M-Pesa Paybill instructions and download payment receipts.",
    `<select class="select" onchange="FLC.setParentStudent(this.value)">
      ${State.db.students.map((s) => `<option value="${s.id}" ${s.id === stu.id ? "selected" : ""}>${esc(s.firstName)} ${esc(s.lastName)} — ${esc(s.grade)}</option>`).join("")}
    </select>`,
    body
  );
}

/* -------------------------- Staff, TSC & Payroll -------------------------- */
function pageStaff() {
  const staff = State.db.staff;
  const payroll = staff.reduce((s, x) => s + Number(x.grossSalary || 0), 0);
  const shif = Math.round(payroll * 0.0275);
  const nssf = Math.round(payroll * 0.06);
  const housing = Math.round(payroll * 0.015);
  const paye = Math.round(payroll * 0.18);
  const net = payroll - shif - nssf - housing - paye;

  const body = `
    <div class="kpi-grid">
      <div class="kpi-card"><div class="kpi-top"><span class="kpi-label">Staff Establishment</span><span class="kpi-icon">${icon("users")}</span></div><div class="kpi-value">${staff.length}</div><div class="kpi-sub">${staff.filter((s) => s.tscNo && s.tscNo.startsWith("TSC")).length} TSC-registered · ${staff.filter((s) => s.role.includes("Bursar")).length} non-teaching</div></div>
      <div class="kpi-card accent"><div class="kpi-top"><span class="kpi-label">Monthly Gross Payroll</span><span class="kpi-icon">${icon("wallet")}</span></div><div class="kpi-value" style="font-size:1.2rem">${money(payroll)}</div><div class="kpi-sub">All teaching & support staff</div></div>
      <div class="kpi-card danger"><div class="kpi-top"><span class="kpi-label">Statutory Deductions</span><span class="kpi-icon">${icon("layers")}</span></div><div class="kpi-value" style="font-size:1.2rem">${money(shif + nssf + housing + paye)}</div><div class="kpi-sub">SHIF ${money(shif)} · NSSF ${money(nssf)} · Housing ${money(housing)} · PAYE ${money(paye)}</div></div>
      <div class="kpi-card success"><div class="kpi-top"><span class="kpi-label">Net Payable</span><span class="kpi-icon">${icon("check")}</span></div><div class="kpi-value" style="font-size:1.2rem">${money(net)}</div><div class="kpi-sub">KCB bulk transfer ready</div></div>
    </div>

    <div class="card">
      <div class="card-header">
        <div class="card-title">${icon("users")} Teaching & Non-Teaching Staff Directory</div>
        <button class="btn btn-primary btn-sm" onclick="FLC.openStaffModal()">${icon("plus", 13)} Add Staff Member</button>
      </div>
      <div class="table-wrap">
        <table class="data-table">
          <thead><tr><th>Staff No / TSC</th><th>Name</th><th>Role & Department</th><th>Class & Subjects</th><th>Contacts</th><th>Gross Salary</th></tr></thead>
          <tbody>
            ${staff.map((s) => `<tr>
              <td><strong>${esc(s.staffNo)}</strong><div style="font-size:0.72rem;color:var(--text-muted)">${esc(s.tscNo)}</div></td>
              <td>${esc(s.name)}<div style="font-size:0.72rem;color:var(--text-muted)">${esc(s.qualification)}</div></td>
              <td>${esc(s.role)}<div style="font-size:0.72rem;color:var(--text-muted)">${esc(s.department)}</div></td>
              <td style="font-size:0.8rem">${esc(s.classAssigned)}${s.subjects.length ? `<div style="font-size:0.72rem;color:var(--text-muted)">${s.subjects.map(esc).join(", ")}</div>` : ""}</td>
              <td style="font-size:0.8rem">${esc(s.phone)}<div style="font-size:0.72rem;color:var(--text-muted)">${esc(s.email)}</div></td>
              <td><strong>${money(s.grossSalary)}</strong></td>
            </tr>`).join("")}
          </tbody>
        </table>
      </div>
    </div>

    <div class="grid-2">
      <div class="card">
        <div class="card-header"><div class="card-title">${icon("clipboard")} Kenya Statutory Payroll Computation (Monthly)</div></div>
        <div class="table-wrap">
          <table class="data-table">
            <thead><tr><th>Item</th><th>Basis</th><th style="text-align:right">Amount</th></tr></thead>
            <tbody>
              <tr><td>Gross Payroll</td><td>All staff</td><td style="text-align:right"><strong>${money(payroll)}</strong></td></tr>
              <tr><td>SHIF (Social Health Insurance Fund)</td><td>2.75% of gross</td><td style="text-align:right">${money(shif)}</td></tr>
              <tr><td>NSSF (Tier I & II)</td><td>6% of pensionable</td><td style="text-align:right">${money(nssf)}</td></tr>
              <tr><td>Affordable Housing Levy</td><td>1.5% of gross</td><td style="text-align:right">${money(housing)}</td></tr>
              <tr><td>PAYE (estimated)</td><td>Graduated bands</td><td style="text-align:right">${money(paye)}</td></tr>
              <tr><td><strong>Net Salary Payable</strong></td><td>After deductions</td><td style="text-align:right"><strong style="color:var(--success)">${money(net)}</strong></td></tr>
            </tbody>
          </table>
        </div>
        <div style="font-size:0.78rem;color:var(--text-muted);margin-top:0.6rem">Deduction rates are illustrative and configurable in the Backend Customization Zone (Finance & Gateway → payroll settings).</div>
      </div>
      <div class="card">
        <div class="card-header"><div class="card-title">${icon("layers")} Department Strength & CBC Retooling Status</div></div>
        ${(() => {
          const depts = {};
          staff.forEach((s) => { depts[s.department] = (depts[s.department] || 0) + 1; });
          const max = Math.max(...Object.values(depts));
          return Object.entries(depts).map(([d, n]) => `
            <div style="margin-bottom:0.75rem">
              <div style="display:flex;justify-content:space-between;font-size:0.82rem;margin-bottom:4px"><strong>${esc(d)}</strong><span>${n} staff</span></div>
              <div class="progress-track"><div class="progress-fill" style="width:${(n / max) * 100}%"></div></div>
            </div>`).join("");
        })()}
        <div style="margin-top:0.75rem">
          <div class="kpi-label" style="margin-bottom:0.5rem">KICD CBC Retooling (staff custom field)</div>
          ${(() => {
            const counts = {};
            staff.forEach((s) => {
              const v = (s.customData && s.customData.cbcCertified) || "Not recorded";
              counts[v] = (counts[v] || 0) + 1;
            });
            return Object.entries(counts).map(([k, v]) => `<span class="badge badge-info" style="margin:2px">${esc(k)}: ${v}</span>`).join(" ");
          })()}
        </div>
      </div>
    </div>`;

  return pageShell(
    "Staff, TSC Registration & Payroll",
    "Complete HR directory of teaching and non-teaching staff with TSC numbers, subject allocations and Kenya statutory payroll.",
    `<button class="btn btn-outline" onclick="window.print()">${icon("print", 14)} Print Payroll</button>
     <button class="btn btn-primary" onclick="FLC.openStaffModal()">${icon("plus", 14)} Add Staff Member</button>`,
    body
  );
}

/* ---------------------------- Transport & Fleet --------------------------- */
function pageTransport() {
  const routes = State.db.transportRoutes;
  const riders = State.db.students.filter((s) => s.transportRoute && s.transportRoute !== "None" && s.transportRoute !== "None (Boarder)");
  const revenue = riders.reduce((s, x) => s + Number(x.transportFee || 0), 0);
  const capacity = routes.reduce((s, r) => s + r.capacity, 0);
  const assigned = routes.reduce((s, r) => s + r.assignedStudents, 0);

  const body = `
    <div class="kpi-grid">
      <div class="kpi-card"><div class="kpi-top"><span class="kpi-label">Active Routes</span><span class="kpi-icon">${icon("bus")}</span></div><div class="kpi-value">${routes.length}</div><div class="kpi-sub">${routes.length} school buses in operation</div></div>
      <div class="kpi-card accent"><div class="kpi-top"><span class="kpi-label">Fleet Utilisation</span><span class="kpi-icon">${icon("users")}</span></div><div class="kpi-value">${Math.round((assigned / capacity) * 100)}%</div><div class="kpi-sub">${assigned} of ${capacity} seats assigned</div></div>
      <div class="kpi-card success"><div class="kpi-top"><span class="kpi-label">Transport Revenue/Term</span><span class="kpi-icon">${icon("wallet")}</span></div><div class="kpi-value" style="font-size:1.2rem">${money(revenue)}</div><div class="kpi-sub">${riders.length} learners on school transport</div></div>
      <div class="kpi-card"><div class="kpi-top"><span class="kpi-label">Fuel & Maintenance</span><span class="kpi-icon">${icon("layers")}</span></div><div class="kpi-value" style="font-size:1.2rem">${money(State.db.expenses.filter((e) => e.category.includes("Transport")).reduce((s, e) => s + e.amount, 0))}</div><div class="kpi-sub">Term to date</div></div>
    </div>

    <div class="card">
      <div class="card-header"><div class="card-title">${icon("bus")} School Fleet, Routes & Driver Allocation</div>
        <button class="btn btn-outline btn-sm" onclick="FLC.openTransportModal()">${icon("plus", 13)} Add Route</button></div>
      <div class="table-wrap">
        <table class="data-table">
          <thead><tr><th>Route</th><th>Vehicle</th><th>Driver & Assistant</th><th>Capacity / Load</th><th>Term Fee</th><th>Status</th><th>Pickup List</th></tr></thead>
          <tbody>
            ${routes.map((r) => `<tr>
              <td><strong>${esc(r.routeName)}</strong></td>
              <td>${esc(r.vehicleReg)}</td>
              <td>${esc(r.driverName)}<div style="font-size:0.72rem;color:var(--text-muted)">${esc(r.driverPhone)}</div>
                <div style="font-size:0.72rem;color:var(--text-muted)">Assistant: ${esc(r.assistant)}</div></td>
              <td>${r.assignedStudents}/${r.capacity}
                <div class="progress-track" style="margin-top:4px"><div class="progress-fill" style="width:${Math.round((r.assignedStudents / r.capacity) * 100)}%"></div></div></td>
              <td><strong>${money(r.termFee)}</strong></td>
              <td><span class="badge badge-success">${esc(r.status)}</span></td>
              <td><button class="btn btn-outline btn-sm" onclick="FLC.viewRouteRiders('${r.id}')">${icon("search", 12)} View</button></td>
            </tr>`).join("")}
          </tbody>
        </table>
      </div>
    </div>

    <div class="card">
      <div class="card-header"><div class="card-title">${icon("students")} Learners on School Transport (${riders.length})</div></div>
      <div class="table-wrap">
        <table class="data-table">
          <thead><tr><th>Learner</th><th>Class</th><th>Route</th><th>Term Transport Fee</th><th>Guardian Contact</th></tr></thead>
          <tbody>
            ${riders.map((s) => `<tr>
              <td><strong>${esc(s.firstName)} ${esc(s.lastName)}</strong><div style="font-size:0.72rem;color:var(--text-muted)">${esc(s.admNo)}</div></td>
              <td>${esc(s.grade)}</td>
              <td><span class="badge badge-info">${esc(s.transportRoute)}</span></td>
              <td>${money(s.transportFee)}</td>
              <td style="font-size:0.8rem">${esc(s.guardianName)} — ${esc(s.guardianPhone)}</td>
            </tr>`).join("") || `<tr><td colspan="5" style="text-align:center;padding:1.5rem;color:var(--text-muted)">No learners currently assigned to school transport.</td></tr>`}
          </tbody>
        </table>
      </div>
    </div>`;

  return pageShell(
    "Transport, Fleet & Route Management",
    "School bus routes, vehicle registrations, driver and assistant allocation, seat capacity and transport billing.",
    `<button class="btn btn-outline" onclick="window.print()">${icon("print", 14)} Print Route Sheet</button>
     <button class="btn btn-primary" onclick="FLC.openTransportModal()">${icon("plus", 14)} Add Route</button>`,
    body
  );
}

/* ---------------------------- Boarding & Hostels -------------------------- */
function pageBoarding() {
  const houses = State.db.boardingHouses;
  const boarders = State.db.students.filter((s) => s.boardingStatus === "Boarding");
  const capacity = houses.reduce((s, h) => s + h.capacity, 0);
  const occupied = houses.reduce((s, h) => s + h.occupied, 0);
  const boardingRevenue = boarders.reduce((s, b) => {
    const fsMatch = State.db.feeStructures.find((fs) => fs.grades.includes(b.grade));
    return s + (fsMatch ? fsMatch.boardingFee : 0);
  }, 0);

  const body = `
    <div class="kpi-grid">
      <div class="kpi-card"><div class="kpi-top"><span class="kpi-label">Boarders Enrolled</span><span class="kpi-icon">${icon("home")}</span></div><div class="kpi-value">${boarders.length}</div><div class="kpi-sub">${boarders.filter((b) => b.gender === "Female").length} girls · ${boarders.filter((b) => b.gender === "Male").length} boys</div></div>
      <div class="kpi-card accent"><div class="kpi-top"><span class="kpi-label">Bed Occupancy</span><span class="kpi-icon">${icon("users")}</span></div><div class="kpi-value">${Math.round((occupied / capacity) * 100)}%</div><div class="kpi-sub">${occupied} of ${capacity} beds occupied</div></div>
      <div class="kpi-card success"><div class="kpi-top"><span class="kpi-label">Boarding Revenue/Term</span><span class="kpi-icon">${icon("wallet")}</span></div><div class="kpi-value" style="font-size:1.2rem">${money(boardingRevenue)}</div><div class="kpi-sub">Accommodation & catering votehead</div></div>
      <div class="kpi-card"><div class="kpi-top"><span class="kpi-label">Care Staff on Duty</span><span class="kpi-icon">${icon("shield")}</span></div><div class="kpi-value">${houses.length}</div><div class="kpi-sub">Matrons & patrons across ${houses.length} houses</div></div>
    </div>

    <div class="grid-2">
      ${houses.map((h) => `
        <div class="card">
          <div class="card-header">
            <div class="card-title">${icon("home")} ${esc(h.name)}</div>
            <span class="badge ${h.gender === "Girls" ? "badge-info" : "badge-neutral"}">${esc(h.gender)}</span>
          </div>
          <div class="grid-3" style="margin-bottom:0.85rem">
            <div><div class="kpi-label">Capacity</div><strong>${h.capacity} beds</strong></div>
            <div><div class="kpi-label">Occupied</div><strong>${h.occupied}</strong></div>
            <div><div class="kpi-label">House Score</div><strong>${esc(h.cleanlinessScore)}</strong></div>
          </div>
          <div class="progress-track"><div class="progress-fill" style="width:${Math.round((h.occupied / h.capacity) * 100)}%"></div></div>
          <div style="font-size:0.82rem;color:var(--text-muted);margin-top:0.7rem">
            ${esc(h.matron)} · ${esc(h.phone)}<br/>
            Boarders from FLC: ${boarders.filter((b) => b.dormHouse === h.name || h.name.includes(b.dormHouse)).length} allocated
          </div>
        </div>`).join("")}
    </div>

    <div class="card">
      <div class="card-header"><div class="card-title">${icon("clipboard")} Boarder Allocation Register</div></div>
      <div class="table-wrap">
        <table class="data-table">
          <thead><tr><th>Learner</th><th>Class</th><th>Dormitory House</th><th>Guardian Contact</th><th>Kitchen / Medical Notes</th></tr></thead>
          <tbody>
            ${boarders.map((b) => {
              const med = (b.customData && b.customData.dietaryMedical) || "None";
              return `<tr>
                <td><strong>${esc(b.firstName)} ${esc(b.lastName)}</strong><div style="font-size:0.72rem;color:var(--text-muted)">${esc(b.admNo)}</div></td>
                <td>${esc(b.grade)}</td>
                <td><span class="badge badge-info">${esc(b.dormHouse)}</span></td>
                <td style="font-size:0.8rem">${esc(b.guardianName)}<div style="font-size:0.72rem;color:var(--text-muted)">${esc(b.guardianPhone)}</div></td>
                <td style="font-size:0.8rem">${esc(med)}</td>
              </tr>`;
            }).join("") || `<tr><td colspan="5" style="text-align:center;padding:1.5rem;color:var(--text-muted)">No boarders allocated.</td></tr>`}
          </tbody>
        </table>
      </div>
    </div>`;

  return pageShell(
    "Boarding, Hostels & Pastoral Care",
    "Dormitory houses, bed capacity, matron and patron supervision, boarder allocation and care notes.",
    `<button class="btn btn-outline" onclick="window.print()">${icon("print", 14)} Print Boarding List</button>`,
    body
  );
}

/* --------------------------- Library & Textbooks -------------------------- */
function pageLibrary() {
  const books = State.db.libraryBooks;
  const totalCopies = books.reduce((s, b) => s + b.totalCopies, 0);
  const available = books.reduce((s, b) => s + b.availableCopies, 0);

  const body = `
    <div class="kpi-grid">
      <div class="kpi-card"><div class="kpi-top"><span class="kpi-label">Titles Catalogued</span><span class="kpi-icon">${icon("book")}</span></div><div class="kpi-value">${books.length}</div><div class="kpi-sub">KICD-approved CBC textbooks & sets</div></div>
      <div class="kpi-card accent"><div class="kpi-top"><span class="kpi-label">Total Copies</span><span class="kpi-icon">${icon("layers")}</span></div><div class="kpi-value">${totalCopies}</div><div class="kpi-sub">Across all learning areas</div></div>
      <div class="kpi-card success"><div class="kpi-top"><span class="kpi-label">Available Copies</span><span class="kpi-icon">${icon("check")}</span></div><div class="kpi-value">${available}</div><div class="kpi-sub">${totalCopies - available} currently issued to learners</div></div>
      <div class="kpi-card danger"><div class="kpi-top"><span class="kpi-label">Overdue Returns</span><span class="kpi-icon">${icon("clock")}</span></div><div class="kpi-value">${books.filter((b) => new Date(b.dueDate) < new Date("2026-10-11")).length}</div><div class="kpi-sub">Follow-up SMS queued to guardians</div></div>
    </div>

    <div class="card">
      <div class="card-header"><div class="card-title">${icon("book")} KICD Textbook Inventory & Lending Register</div>
        <button class="btn btn-outline btn-sm" onclick="FLC.openBookModal()">${icon("plus", 13)} Add Title</button></div>
      <div class="table-wrap">
        <table class="data-table">
          <thead><tr><th>ISBN / Code</th><th>Title</th><th>Category</th><th>Copies</th><th>Current Borrower</th><th>Due Date</th><th>Availability</th></tr></thead>
          <tbody>
            ${books.map((b) => {
              const overdue = new Date(b.dueDate) < new Date("2026-10-11");
              return `<tr>
                <td><strong>${esc(b.isbn)}</strong></td>
                <td>${esc(b.title)}<div style="font-size:0.72rem;color:var(--text-muted)">${esc(b.author)}</div></td>
                <td><span class="badge badge-neutral">${esc(b.category)}</span></td>
                <td>${b.availableCopies}/${b.totalCopies}</td>
                <td style="font-size:0.82rem">${esc(b.borrowedBy)}</td>
                <td><span class="badge ${overdue ? "badge-danger" : "badge-info"}">${esc(b.dueDate)}${overdue ? " — OVERDUE" : ""}</span></td>
                <td><div class="progress-track"><div class="progress-fill" style="width:${Math.round((b.availableCopies / b.totalCopies) * 100)}%;background:${b.availableCopies / b.totalCopies > 0.3 ? "var(--success)" : "var(--accent)"}"></div></div></td>
              </tr>`;
            }).join("")}
          </tbody>
        </table>
      </div>
    </div>`;

  return pageShell(
    "Library & CBC Textbook Management",
    "KICD-approved textbook inventory, lending register, due dates and overdue tracking for all learning areas.",
    `<button class="btn btn-outline" onclick="FLC.sendOverdueSms()">${icon("message", 14)} Send Overdue SMS</button>
     <button class="btn btn-primary" onclick="FLC.openBookModal()">${icon("plus", 14)} Add Title</button>`,
    body
  );
}

/* ------------------------ Merits, Clubs & Discipline ---------------------- */
function pageDiscipline() {
  const merits = State.db.disciplineMerits;
  const positives = merits.filter((m) => m.type === "Merit / Award");
  const guidance = merits.filter((m) => m.type !== "Merit / Award");

  const clubCounts = {};
  State.db.students.forEach((s) => {
    const club = (s.customData && s.customData.talentClub) || "Unassigned";
    clubCounts[club] = (clubCounts[club] || 0) + 1;
  });

  const body = `
    <div class="kpi-grid">
      <div class="kpi-card success"><div class="kpi-top"><span class="kpi-label">Merits & Awards This Term</span><span class="kpi-icon">${icon("award")}</span></div><div class="kpi-value">${positives.length}</div><div class="kpi-sub">Character, leadership & talent recognition</div></div>
      <div class="kpi-card accent"><div class="kpi-top"><span class="kpi-label">Guidance & Support Cases</span><span class="kpi-icon">${icon("users")}</span></div><div class="kpi-value">${guidance.length}</div><div class="kpi-sub">Pastoral follow-up & remedial clinics</div></div>
      <div class="kpi-card"><div class="kpi-top"><span class="kpi-label">Active Clubs & Societies</span><span class="kpi-icon">${icon("sparkle")}</span></div><div class="kpi-value">${Object.keys(clubCounts).length}</div><div class="kpi-sub">CBC talent & co-curricular pathways</div></div>
      <div class="kpi-card"><div class="kpi-top"><span class="kpi-label">Total Merit Points</span><span class="kpi-icon">${icon("chart")}</span></div><div class="kpi-value">${positives.reduce((s, m) => s + Number(String(m.points).replace("+", "") || 0), 0)}</div><div class="kpi-sub">House points tally</div></div>
    </div>

    <div class="card">
      <div class="card-header"><div class="card-title">${icon("award")} Character, Leadership & Discipline Records</div>
        <button class="btn btn-primary btn-sm" onclick="FLC.openMeritModal()">${icon("plus", 13)} Record Entry</button></div>
      <div class="table-wrap">
        <table class="data-table">
          <thead><tr><th>Date</th><th>Learner</th><th>Type</th><th>Category</th><th>Points</th><th>Description</th><th>Recorded By</th></tr></thead>
          <tbody>
            ${merits.map((m) => `<tr>
              <td>${esc(m.date)}</td>
              <td><strong>${esc(m.studentName)}</strong><div style="font-size:0.72rem;color:var(--text-muted)">${esc(m.grade)}</div></td>
              <td><span class="badge ${m.type === "Merit / Award" ? "badge-success" : "badge-warning"}">${esc(m.type)}</span></td>
              <td style="font-size:0.8rem">${esc(m.category)}</td>
              <td><strong>${esc(m.points)}</strong></td>
              <td style="font-size:0.8rem">${esc(m.description)}</td>
              <td style="font-size:0.8rem">${esc(m.recordedBy)}</td>
            </tr>`).join("")}
          </tbody>
        </table>
      </div>
    </div>

    <div class="grid-2">
      <div class="card">
        <div class="card-header"><div class="card-title">${icon("sparkle")} CBC Talent & Club Society Membership</div></div>
        ${(() => {
          const max = Math.max(...Object.values(clubCounts));
          return Object.entries(clubCounts).sort((a, b) => b[1] - a[1]).map(([c, n]) => `
            <div style="margin-bottom:0.8rem">
              <div style="display:flex;justify-content:space-between;font-size:0.82rem;margin-bottom:4px"><strong>${esc(c)}</strong><span>${n} learners</span></div>
              <div class="progress-track"><div class="progress-fill" style="width:${(n / max) * 100}%;background:var(--accent)"></div></div>
            </div>`).join("");
        })()}
      </div>
      <div class="card">
        <div class="card-header"><div class="card-title">${icon("shield")} House Merit Leaderboard</div></div>
        ${(() => {
          const houses = State.db.systemConfig.academicConfig.streams.map((st) => {
            const members = State.db.students.filter((s) => s.stream === st);
            const pts = merits.filter((m) => members.some((x) => x.id === m.studentId)).reduce((s, m) => s + Number(String(m.points).replace("+", "") || 0), 0);
            return { st, members: members.length, pts };
          }).sort((a, b) => b.pts - a.pts);
          return houses.map((h, i) => `<div style="display:flex;align-items:center;gap:0.75rem;padding:0.6rem 0;border-bottom:1px solid var(--border-color)">
            <div style="width:32px;height:32px;border-radius:8px;background:${i === 0 ? "var(--accent-light)" : "#f4f4f4"};color:${i === 0 ? "var(--warning)" : "var(--text-muted)"};display:flex;align-items:center;justify-content:center;font-weight:800">${i + 1}</div>
            <div style="flex:1"><strong>${esc(h.st)} House</strong><div style="font-size:0.75rem;color:var(--text-muted)">${h.members} learners</div></div>
            <strong style="font-size:1.05rem">${h.pts} pts</strong>
          </div>`).join("");
        })()}
      </div>
    </div>`;

  return pageShell(
    "Merits, Clubs, Talent & Discipline",
    "Track character merits, house points, CBC talent pathways, guidance cases and pastoral follow-ups.",
    `<button class="btn btn-outline" onclick="window.print()">${icon("print", 14)} Print Report</button>
     <button class="btn btn-primary" onclick="FLC.openMeritModal()">${icon("plus", 14)} Record Entry</button>`,
    body
  );
}

/* --------------------------- Communications Hub --------------------------- */
function pageCommunications() {
  if (State.role === "parent") return pageParentNotices();
  const fc = State.db.systemConfig.financeConfig;
  const students = State.db.students;
  const audienceOptions = [
    { id: "all", label: "All Parents & Guardians", count: students.length },
    { id: "jss", label: "Junior School (Grade 7 – 9) Parents", count: students.filter((s) => s.grade.includes("JSS")).length },
    { id: "primary", label: "Primary School Parents (Grade 1 – 6)", count: students.filter((s) => /Grade [1-6]$/.test(s.grade)).length },
    { id: "ecde", label: "ECDE Parents (PP1 & PP2)", count: students.filter((s) => s.grade.startsWith("PP")).length },
    { id: "boarders", label: "Boarders' Parents", count: students.filter((s) => s.boardingStatus === "Boarding").length },
    { id: "arrears", label: "Parents with Fee Arrears", count: students.filter((s) => s.balance > 0).length },
    { id: "staff", label: "Teaching & Non-Teaching Staff", count: State.db.staff.length }
  ];

  const body = `
    <div class="kpi-grid">
      <div class="kpi-card"><div class="kpi-top"><span class="kpi-label">SMS Credits</span><span class="kpi-icon">${icon("message")}</span></div><div class="kpi-value">${fc.smsBalanceCredits}</div><div class="kpi-sub">${esc(fc.smsGatewayProvider)} · Sender ID ${esc(fc.smsSenderId)}</div></div>
      <div class="kpi-card accent"><div class="kpi-top"><span class="kpi-label">Broadcasts This Term</span><span class="kpi-icon">${icon("chart")}</span></div><div class="kpi-value">${State.db.communications.length}</div><div class="kpi-sub">${State.db.communications.reduce((s, c) => s + c.recipientsCount, 0)} total recipients reached</div></div>
      <div class="kpi-card success"><div class="kpi-top"><span class="kpi-label">Auto Fee-Reminder SMS</span><span class="kpi-icon">${icon("wallet")}</span></div><div class="kpi-value" style="font-size:1.1rem">${fc.autoSmsOnPayment ? "Payment confirmations ON" : "OFF"}</div><div class="kpi-sub">Absence alerts: ${fc.autoSmsOnAbsence ? "ON" : "OFF"}</div></div>
      <div class="kpi-card"><div class="kpi-top"><span class="kpi-label">Parent Portal Payments</span><span class="kpi-icon">${icon("key")}</span></div><div class="kpi-value" style="font-size:1.1rem">${fc.allowParentPortalMpesa ? "Enabled" : "Disabled"}</div><div class="kpi-sub">M-Pesa Paybill ${esc(fc.mpesaPaybill)}</div></div>
    </div>

    <div class="grid-2">
      <div class="card">
        <div class="card-header"><div class="card-title">${icon("message")} Compose SMS Broadcast / Portal Circular</div></div>
        <div class="form-grid">
          <div class="form-group"><label>Audience</label>
            <select class="select" id="comm-audience">
              ${audienceOptions.map((a) => `<option value="${a.id}">${esc(a.label)} (${a.count})</option>`).join("")}
            </select></div>
          <div class="form-group"><label>Channel</label>
            <select class="select" id="comm-channel">
              <option>SMS Broadcast & Portal Notice</option>
              <option>Portal Circular (No SMS cost)</option>
              <option>Targeted SMS Reminder</option>
            </select></div>
          <div class="form-group" style="grid-column:1/-1"><label>Title</label>
            <input class="input" id="comm-title" placeholder="e.g. Term 3 Closing Day & Fee Clearance" /></div>
          <div class="form-group" style="grid-column:1/-1"><label>Message</label>
            <textarea class="textarea" id="comm-message" rows="5" placeholder="Dear Parent, …"></textarea></div>
        </div>
        <div style="margin-top:0.85rem;display:flex;gap:0.6rem;flex-wrap:wrap">
          <button class="btn btn-primary" onclick="FLC.sendCommunication()">${icon("message", 14)} Dispatch Now</button>
          <button class="btn btn-outline" onclick="FLC.previewSms()">${icon("search", 14)} Preview SMS</button>
        </div>
        <div id="sms-preview"></div>
      </div>

      <div class="card">
        <div class="card-header"><div class="card-title">${icon("clipboard")} Broadcast History & Delivery Log</div></div>
        ${State.db.communications.map((c) => `
          <div style="padding:0.75rem 0;border-bottom:1px solid var(--border-color)">
            <div style="display:flex;justify-content:space-between;gap:0.5rem;flex-wrap:wrap">
              <strong style="font-size:0.87rem">${esc(c.title)}</strong>
              <span class="badge badge-info">${esc(c.channel)}</span>
            </div>
            <div style="font-size:0.81rem;color:var(--text-muted);margin:4px 0">${esc(c.message)}</div>
            <div style="font-size:0.72rem;color:var(--text-muted)">${esc(c.audience)} · ${esc(c.recipientsCount)} recipients · ${esc(c.date)} · ${esc(c.sender)}</div>
          </div>`).join("")}
      </div>
    </div>

    <div class="card">
      <div class="card-header"><div class="card-title">${icon("layers")} Parent Contact Directory (Bulk SMS & Calls)</div>
        <button class="btn btn-outline btn-sm" onclick="FLC.exportCsv('parents')">${icon("download", 13)} Export Contacts</button></div>
      <div class="table-wrap">
        <table class="data-table">
          <thead><tr><th>Learner</th><th>Class</th><th>Guardian</th><th>Relationship</th><th>Phone</th><th>Email</th><th>Fee Status</th></tr></thead>
          <tbody>
            ${students.map((s) => `<tr>
              <td><strong>${esc(s.firstName)} ${esc(s.lastName)}</strong></td>
              <td>${esc(s.grade)}</td>
              <td>${esc(s.guardianName)}</td>
              <td>${esc(s.guardianRelation)}</td>
              <td>${esc(s.guardianPhone)}</td>
              <td style="font-size:0.8rem">${esc(s.guardianEmail) || "—"}</td>
              <td>${s.balance > 0 ? `<span class="badge badge-danger">Owes ${money(s.balance)}</span>` : `<span class="badge badge-success">Cleared</span>`}</td>
            </tr>`).join("")}
          </tbody>
        </table>
      </div>
    </div>`;

  return pageShell(
    "Communications, SMS Broadcast & Notices Hub",
    "Dispatch bulk SMS to parents and staff, publish portal circulars, and manage fee-reminder automation.",
    `<span class="school-pill green">${icon("message", 14)} ${fc.smsBalanceCredits} credits remaining</span>
     <button class="btn btn-outline" onclick="FLC.go('customizer')">${icon("cog", 14)} SMS Gateway Settings</button>`,
    body
  );
}

/* --------------------------- Reports & Analytics -------------------------- */
function pageReports() {
  const students = State.db.students;
  const billed = students.reduce((s, x) => s + Number(x.billedAmount || 0), 0);
  const collected = students.reduce((s, x) => s + Number(x.paidAmount || 0), 0);
  const arrears = students.reduce((s, x) => s + Number(x.balance || 0), 0);
  const expenses = State.db.expenses.reduce((s, e) => s + e.amount, 0);

  const byCategory = {};
  State.db.expenses.forEach((e) => { byCategory[e.category] = (byCategory[e.category] || 0) + e.amount; });
  const maxCat = Math.max(...Object.values(byCategory));

  const byGradeFees = [...new Set(students.map((s) => s.grade))].map((g) => {
    const list = students.filter((s) => s.grade === g);
    return {
      grade: g,
      count: list.length,
      billed: list.reduce((s, x) => s + Number(x.billedAmount || 0), 0),
      collected: list.reduce((s, x) => s + Number(x.paidAmount || 0), 0),
      balance: list.reduce((s, x) => s + Number(x.balance || 0), 0)
    };
  });

  const genderSplit = {
    Female: students.filter((s) => s.gender === "Female").length,
    Male: students.filter((s) => s.gender === "Male").length
  };

  const body = `
    <div class="kpi-grid">
      <div class="kpi-card"><div class="kpi-top"><span class="kpi-label">Term Fee Demand</span><span class="kpi-icon">${icon("wallet")}</span></div><div class="kpi-value" style="font-size:1.2rem">${money(billed)}</div><div class="kpi-sub">${students.length} learners billed</div></div>
      <div class="kpi-card success"><div class="kpi-top"><span class="kpi-label">Collected</span><span class="kpi-icon">${icon("check")}</span></div><div class="kpi-value" style="font-size:1.2rem">${money(collected)}</div><div class="kpi-sub">${Math.round((collected / billed) * 100)}% collection rate</div></div>
      <div class="kpi-card danger"><div class="kpi-top"><span class="kpi-label">Arrears</span><span class="kpi-icon">${icon("chart")}</span></div><div class="kpi-value" style="font-size:1.2rem">${money(arrears)}</div><div class="kpi-sub">${Math.round((arrears / billed) * 100)}% of demand</div></div>
      <div class="kpi-card accent"><div class="kpi-top"><span class="kpi-label">Surplus / (Deficit)</span><span class="kpi-icon">${icon("layers")}</span></div><div class="kpi-value" style="font-size:1.2rem;color:${collected - expenses >= 0 ? "var(--success)" : "var(--danger)"}">${money(collected - expenses)}</div><div class="kpi-sub">Expenditure ${money(expenses)}</div></div>
    </div>

    <div class="card">
      <div class="card-header"><div class="card-title">${icon("clipboard")} Term Fee Collection Report by Class</div>
        <button class="btn btn-outline btn-sm" onclick="FLC.exportCsv('feereport')">${icon("download", 13)} Export CSV</button></div>
      <div class="table-wrap">
        <table class="data-table">
          <thead><tr><th>Class</th><th>Learners</th><th style="text-align:right">Billed</th><th style="text-align:right">Collected</th><th style="text-align:right">Arrears</th><th>Collection Rate</th></tr></thead>
          <tbody>
            ${byGradeFees.map((r) => `<tr>
              <td><strong>${esc(r.grade)}</strong></td><td>${r.count}</td>
              <td style="text-align:right">${money(r.billed)}</td>
              <td style="text-align:right"><strong style="color:var(--success)">${money(r.collected)}</strong></td>
              <td style="text-align:right"><strong style="color:${r.balance > 0 ? "var(--danger)" : "var(--success)"}">${money(r.balance)}</strong></td>
              <td style="min-width:140px"><div class="progress-track"><div class="progress-fill" style="width:${r.billed ? Math.round((r.collected / r.billed) * 100) : 0}%;background:var(--success)"></div></div>
                <span style="font-size:0.74rem;color:var(--text-muted)">${r.billed ? Math.round((r.collected / r.billed) * 100) : 0}%</span></td>
            </tr>`).join("")}
          </tbody>
        </table>
      </div>
    </div>

    <div class="grid-2">
      <div class="card">
        <div class="card-header"><div class="card-title">${icon("layers")} Expenditure by Votehead</div></div>
        ${Object.entries(byCategory).sort((a, b) => b[1] - a[1]).map(([c, v]) => `
          <div style="margin-bottom:0.8rem">
            <div style="display:flex;justify-content:space-between;font-size:0.82rem;margin-bottom:4px"><strong>${esc(c)}</strong><span>${money(v)}</span></div>
            <div class="progress-track"><div class="progress-fill" style="width:${(v / maxCat) * 100}%;background:var(--danger)"></div></div>
          </div>`).join("")}
      </div>
      <div class="card">
        <div class="card-header"><div class="card-title">${icon("chart")} Enrolment Analytics & Key Ratios</div></div>
        <div class="table-wrap">
          <table class="data-table">
            <tbody>
              <tr><td>Total Enrolment</td><td style="text-align:right"><strong>${students.length}</strong></td></tr>
              <tr><td>Girls : Boys</td><td style="text-align:right">${genderSplit.Female} : ${genderSplit.Male} (${Math.round((genderSplit.Female / students.length) * 100)}% girls)</td></tr>
              <tr><td>Boarders : Day Scholars</td><td style="text-align:right">${students.filter((s) => s.boardingStatus === "Boarding").length} : ${students.filter((s) => s.boardingStatus === "Day").length}</td></tr>
              <tr><td>Learners on Transport</td><td style="text-align:right">${students.filter((s) => s.transportFee > 0).length}</td></tr>
              <tr><td>Learner : Teacher Ratio</td><td style="text-align:right">${Math.round(students.length / State.db.staff.filter((s) => s.subjects.length > 0).length)} : 1</td></tr>
              <tr><td>Average Fee per Learner</td><td style="text-align:right">${money(Math.round(billed / students.length))}</td></tr>
              <tr><td>Average Balance per Debtor</td><td style="text-align:right">${money(Math.round(arrears / Math.max(1, students.filter((s) => s.balance > 0).length)))}</td></tr>
              <tr><td>Mean Academic Score</td><td style="text-align:right"><strong>${Math.round(students.reduce((s, x) => s + studentAverage(x.id), 0) / students.length)}%</strong></td></tr>
              <tr><td>Average Attendance</td><td style="text-align:right">${Math.round(students.reduce((s, x) => s + x.attendanceRate, 0) / students.length)}%</td></tr>
            </tbody>
          </table>
        </div>
        <div style="margin-top:0.85rem;display:flex;gap:0.5rem;flex-wrap:wrap">
          <button class="btn btn-outline btn-sm" onclick="FLC.exportCsv('students')">${icon("download", 13)} Full Learner CSV</button>
          <button class="btn btn-outline btn-sm" onclick="window.print()">${icon("print", 13)} Print Board Report</button>
        </div>
      </div>
    </div>`;

  return pageShell(
    "Reports, Analytics & Board Pack",
    "Financial, enrolment and academic analytics for management, BOM meetings and termly reporting.",
    `<button class="btn btn-outline" onclick="FLC.go('finance')">${icon("wallet", 14)} Finance Desk</button>
     <button class="btn btn-primary" onclick="window.print()">${icon("print", 14)} Print Report</button>`,
    body
  );
}

/* ---------------------------- Learner Profile ----------------------------- */
function pageProfile() {
  const learners = State.db.students || [];
  if (!learners.length) {
    return pageShell("Learner Profile", "No learner is linked to this account yet.",
      "", `<div class="card"><p style="color:var(--text-muted);margin:0">The school office has not linked a learner to this account. Call ${esc(State.db.systemConfig.branding.phone || "the office")} and the administrator will connect it.</p></div>`);
  }
  const stu = learners.find((s) => s.id === State.parentStudentId) || learners[0];
  const a = studentAverage(stu.id);
  const customFields = State.db.systemConfig.customFields.filter((c) => c.entity === "student" && c.active);

  const body = `
    <div class="grid-2">
      <div class="card">
        <div class="card-header"><div class="card-title">${icon("user")} Learner Bio-Data</div>
          <button class="btn btn-outline btn-sm" onclick="FLC.go('reportcards')">${icon("print", 12)} Report Card</button></div>
        <div class="table-wrap">
          <table class="data-table">
            <tbody>
              <tr><td>Full Name</td><td><strong>${esc(stu.firstName)} ${esc(stu.lastName)}</strong></td></tr>
              <tr><td>Admission Number</td><td>${esc(stu.admNo)}</td></tr>
              <tr><td>NEMIS UPI</td><td>${esc(stu.nemisUpi)}</td></tr>
              <tr><td>KNEC Assessment No</td><td>${esc(stu.assessmentNo)}</td></tr>
              <tr><td>Date of Birth</td><td>${esc(stu.dob)}</td></tr>
              <tr><td>Gender</td><td>${esc(stu.gender)}</td></tr>
              <tr><td>Class & Stream</td><td>${esc(stu.grade)} · ${esc(stu.stream)}</td></tr>
              <tr><td>Boarding Status</td><td>${esc(stu.boardingStatus)}${stu.dormHouse !== "N/A" ? " · " + esc(stu.dormHouse) : ""}</td></tr>
              <tr><td>Transport</td><td>${esc(stu.transportRoute)}</td></tr>
              <tr><td>Enrolment Date</td><td>${esc(stu.enrollmentDate)}</td></tr>
              <tr><td>Attendance Rate</td><td><strong>${stu.attendanceRate}%</strong></td></tr>
              <tr><td>Current Mean</td><td>${a}% ${gradeBadge(a)}</td></tr>
            </tbody>
          </table>
        </div>
      </div>
      <div>
        <div class="card">
          <div class="card-header"><div class="card-title">${icon("users")} Guardian & Emergency Contacts</div></div>
          <div class="table-wrap">
            <table class="data-table">
              <tbody>
                <tr><td>Guardian</td><td><strong>${esc(stu.guardianName)}</strong></td></tr>
                <tr><td>Relationship</td><td>${esc(stu.guardianRelation)}</td></tr>
                <tr><td>Phone</td><td>${esc(stu.guardianPhone)}</td></tr>
                <tr><td>Email</td><td>${esc(stu.guardianEmail) || "—"}</td></tr>
                <tr><td>School Contact</td><td>${esc(State.db.systemConfig.branding.phone)}</td></tr>
              </tbody>
            </table>
          </div>
        </div>
        <div class="card">
          <div class="card-header"><div class="card-title">${icon("layers")} Additional Fields (configured in Backend Zone)</div></div>
          <div class="table-wrap">
            <table class="data-table">
              <tbody>
                ${customFields.map((c) => `<tr><td>${esc(c.label)}</td><td><strong>${esc((stu.customData || {})[c.key] || "—")}</strong></td></tr>`).join("")}
              </tbody>
            </table>
          </div>
        </div>
        <div class="card">
          <div class="card-header"><div class="card-title">${icon("sparkle")} CBC Core Competencies</div></div>
          ${Object.entries(stu.coreCompetencies || {}).map(([k, v]) => {
            const label = k.replace(/([A-Z])/g, " $1").replace(/^./, (m) => m.toUpperCase());
            const color = v === "Exceeding" ? "var(--success)" : v === "Meeting" ? "var(--primary)" : "var(--accent)";
            return `<div style="display:flex;justify-content:space-between;padding:0.45rem 0;border-bottom:1px dashed var(--border-color)">
              <span style="font-size:0.85rem">${esc(label)}</span>
              <span class="badge" style="background:${color}1a;color:${color}">${esc(v)}</span>
            </div>`;
          }).join("")}
        </div>
      </div>
    </div>`;

  return pageShell(
    "Learner Profile",
    "Complete learner record including bio-data, guardian contacts, competencies and custom fields.",
    `<select class="select" onchange="FLC.setParentStudent(this.value)">
      ${State.db.students.map((s) => `<option value="${s.id}" ${s.id === stu.id ? "selected" : ""}>${esc(s.firstName)} ${esc(s.lastName)} — ${esc(s.grade)}</option>`).join("")}
    </select>`,
    body
  );
}

/* ========================================================================== */
/*                   BACKEND CUSTOMIZATION ZONE (Admin Only)                  */
/* ========================================================================== */

/* -------------------------- Command palette (⌘K) -------------------------- */
/* One keystroke reaches every page, learner, member of staff and help article. */
function paletteItems(query) {
  const q = String(query || "").trim().toLowerCase();
  const out = [];
  const push = (kind, label, hint, run) => out.push({ kind, label, hint, run });

  navItems().forEach((i) => push("Page", i.label, "Portal page", () => FLC.go(i.id)));
  if (State.role === "admin") {
    push("Page", "Backend Customization Zone", "Every setting in the system", () => FLC.go("customizer"));
    push("Page", "Sign-in & Security", "Accounts, passwords, devices", () => { FLC.go("customizer"); FLC.sub("customizer", "security"); });
    push("Page", "Finance & M-Pesa", "Payment channels and gateway", () => { FLC.go("customizer"); FLC.sub("customizer", "finance"); });
  }
  push("Page", "Help Centre", "Articles, passwords, security", () => FLC.go("help"));

  (State.db.students || []).forEach((st) => push(
    "Learner", `${st.firstName} ${st.lastName}`, `${st.admNo} · ${st.grade} ${st.stream}`,
    () => { State.filters = Object.assign({}, State.filters, { student: st.id }); FLC.go("students"); }
  ));
  (State.db.staff || []).forEach((t) => push("Staff", t.name || `${t.firstName || ""} ${t.lastName || ""}`.trim(), t.role || t.designation || "Member of staff", () => FLC.go("staff")));
  (State.db.helpArticles || []).forEach((a) => push("Help", a.title, a.category, () => { FLC.go("help"); FLC.helpTab("articles"); FLC.searchHelp(a.title.split(" ").slice(0, 3).join(" ")); }));
  push("Action", "Open the public website", "The school's front page", () => window.open("/", "_blank"));
  push("Action", "Read the Terms & Conditions", "The document parents accept", () => FLCTerms.open(State.db));
  if (State.role === "admin") push("Action", "Open the website editor", "Layout, words, fonts, photographs", () => window.open("/", "_blank"));

  const hits = q ? out.filter((i) => (i.label + " " + i.hint + " " + i.kind).toLowerCase().includes(q)) : out.slice(0, 8);
  return hits.slice(0, 12);
}

function renderPalette() {
  const host = document.getElementById("palette-root");
  if (!host) return;
  if (!State.palette.open) {
    host.innerHTML = "";
    return;
  }
  const items = paletteItems(State.palette.query);
  if (State.palette.index >= items.length) State.palette.index = 0;
  host.innerHTML = `
    <div class="palette-backdrop" onclick="if(event.target===this) FLC.closePalette()">
      <div class="palette" role="dialog" aria-label="Search the system">
        <div class="palette-input">
          ${icon("search", 16)}
          <input id="palette-query" placeholder="Search pages, learners, staff and the Help Centre…" autocomplete="off"
            value="${esc(State.palette.query)}" oninput="FLC.paletteType(this.value)"
            onkeydown="return FLC.paletteKey(event)" />
          <kbd>esc</kbd>
        </div>
        <div class="palette-list" id="palette-list">
          ${items.length ? items.map((i, n) => `
            <button class="palette-item ${n === State.palette.index ? "active" : ""}" onclick="FLC.paletteRun(${n})"
              onmouseenter="FLC.paletteHover(${n})">
              <span class="palette-kind">${esc(i.kind)}</span>
              <span class="palette-label">${esc(i.label)}</span>
              <span class="palette-hint">${esc(i.hint)}</span>
            </button>`).join("") : `<div class="palette-empty">Nothing matches “${esc(State.palette.query)}”.</div>`}
        </div>
        <div class="palette-foot"><span>↑ ↓ to move</span><span>⏎ to open</span><span>esc to close</span></div>
      </div>
    </div>`;
  const field = document.getElementById("palette-query");
  if (field && document.activeElement !== field) {
    field.focus();
    field.setSelectionRange(field.value.length, field.value.length);
  }
}

/* --------------------------- Help Centre ---------------------------------- */
function pageHelpCentre() {
  const tab = State.helpTab || "articles";
  const arts = State.db.helpArticles || [];
  const reqs = State.db.passwordResetRequests || [];
  const open = reqs.filter((r) => r.status === "open");
  const canDesk = State.role === "admin" || (State.user && State.user.isIct);
  const cats = [...new Set(arts.map((a) => a.category))];
  const b = State.db.systemConfig.branding;

  const articleCards = (list) => list.length
    ? list.map((a) => `
      <article class="card help-art" id="${esc(a.id)}">
        <div class="help-art-head">
          <span class="badge badge-info">${esc(a.category)}</span>
          ${State.role === "admin" ? `<button class="btn btn-outline btn-sm" onclick="FLC.removeArticle('${esc(a.id)}')">${icon("trash", 12)} Remove</button>` : ""}
        </div>
        <h3>${esc(a.title)}</h3>
        <p>${esc(a.body)}</p>
        <div class="help-tags">${(a.tags || []).map((t) => `<span class="help-tag">#${esc(t)}</span>`).join("")}</div>
      </article>`).join("")
    : `<div class="card"><p class="empty-note">No articles yet.</p></div>`;

  const tabs = [
    { id: "articles", label: "Help articles", ic: "book" },
    { id: "password", label: "Password Resets" + (open.length ? ` (${open.length})` : ""), ic: "lock" },
    { id: "security", label: "Security", ic: "shield" },
    { id: "ict", label: "Contact ICT", ic: "phone" }
  ];

  let body = `<div class="subtabs">
    ${tabs.map((t) => `<button class="subtab-btn ${tab === t.id ? "active" : ""}" onclick="FLC.helpTab('${t.id}')">${icon(t.ic, 14)} ${esc(t.label)}</button>`).join("")}
  </div>`;

  if (tab === "articles") {
    const q = (State.helpQuery || "").toLowerCase();
    const hit = q
      ? arts.filter((a) => (a.title + " " + a.body + " " + (a.tags || []).join(" ")).toLowerCase().includes(q))
      : arts;
    body += `
      <div class="card">
        <div class="card-header"><div class="card-title">${icon("search")} Search the Help Centre</div></div>
        <input class="input" id="help-search" placeholder="Type a word — mpesa, password, report card, eCitizen…"
          value="${esc(State.helpQuery || "")}" oninput="FLC.searchHelp(this.value)" />
        <p class="help-note">${arts.length} articles · ${cats.length} categories
          ${q ? `· showing ${hit.length} match(es) for “${esc(State.helpQuery)}”` : ""}</p>
      </div>
      ${cats.map((c) => {
        const list = hit.filter((a) => a.category === c);
        if (!list.length) return "";
        return `<h3 class="help-cat">${esc(c)}</h3>${articleCards(list)}`;
      }).join("")}
      ${State.role === "admin" ? `
      <div class="card">
        <div class="card-header"><div class="card-title">${icon("plus")} Add a help article</div></div>
        <div class="form-grid">
          <div class="form-group"><label>Category</label>
            <input class="input" id="help-new-cat" list="help-cats" placeholder="ICT support" />
            <datalist id="help-cats">${cats.map((c) => `<option value="${esc(c)}"></option>`).join("")}</datalist></div>
          <div class="form-group"><label>Title</label><input class="input" id="help-new-title" placeholder="How do I…" /></div>
          <div class="form-group" style="grid-column:1/-1"><label>Article body</label>
            <textarea class="input" id="help-new-body" rows="4" placeholder="Write the answer the person would want to read."></textarea></div>
          <div class="form-group" style="grid-column:1/-1"><label>Tags (comma separated)</label>
            <input class="input" id="help-new-tags" placeholder="mpesa, fees" /></div>
        </div>
        <button class="btn btn-primary" style="margin-top:0.8rem" onclick="FLC.addArticle()">${icon("check", 14)} Publish article</button>
      </div>` : ""}`;
  }

  if (tab === "password") {
    body += `
      <div class="card">
        <div class="card-header"><div class="card-title">${icon("lock")} Forgotten-password requests</div></div>
        <p class="help-note">A learner, parent or member of staff who has forgotten their password raises the request from
          the sign-in screen. ${canDesk
            ? "Issue a temporary password and read it out to them — they will be asked to change it themselves."
            : "Only the administrator and the ICT department can issue a new password."}</p>
        ${reqs.length ? reqs.map((r) => `
          <div class="reset-row ${r.status === "open" ? "" : "done"}">
            <div>
              <strong>${esc(r.name || r.email)}</strong>
              <div class="help-tags"><span class="help-tag">${esc(r.email)}</span><span class="help-tag">${esc(roleLabel(r.role))}</span>
                <span class="help-tag">asked ${esc(r.requestedAt)}</span>
                <span class="help-tag ${r.status === "open" ? "warn" : ""}">${esc(r.status)}</span></div>
              ${r.note ? `<p class="help-note">“${esc(r.note)}”</p>` : ""}
              ${r.tempPassword ? `<p class="help-note">Temporary password: <code class="temp-pass">${esc(r.tempPassword)}</code>
                · issued by ${esc(r.handledBy || "")} ${esc(r.handledAt || "")} — the learner must change it after signing in.</p>` : ""}
            </div>
            <div class="reset-actions">
              ${r.status === "open" ? `
                <button class="btn btn-primary btn-sm" onclick="FLC.resolveReset('${esc(r.id)}')">${icon("key", 13)} Issue temporary password</button>
                <button class="btn btn-outline btn-sm" onclick="FLC.dismissReset('${esc(r.id)}')">${icon("x", 13)} Close</button>`
                : `<span class="badge badge-info">handled by ${esc(r.handledBy || "—")}</span>`}
            </div>
          </div>`).join("") : `<p class="empty-note">No forgotten-password requests right now.</p>`}
      </div>
      <div class="card">
        <div class="card-header"><div class="card-title">${icon("key")} Change your own password</div></div>
        <p class="help-note">You can change your own password at any time under
          <button class="link-btn" onclick="FLC.go('customizer');FLC.sub('customizer','security')">Backend Customization Zone → Sign-in &amp; Security</button>.</p>
      </div>`;
  }

  if (tab === "security") {
    const sec = State.securityStatus;
    body += `
      <div class="card">
        <div class="card-header"><div class="card-title">${icon("shield")} Security status</div>
          <button class="btn btn-outline btn-sm" onclick="FLC.loadSecurity()">${icon("refresh", 13)} Re-check</button></div>
        ${sec ? `
          <div class="sec-grid">
            ${sec.checklist.map((c) => `
              <div class="sec-item ${c.state === "on" ? "on" : "todo"}">
                <span class="sec-dot"></span>
                <div><strong>${esc(c.item)}</strong>
                  <div class="help-note">${c.state === "on" ? "Active" : "Depends on the school's hosting — HTTPS and off-server backups"}</div></div>
              </div>`).join("")}
          </div>
          <div class="form-grid" style="margin-top:0.9rem">
            <div class="form-group"><label>Sign-in attempts allowed a minute</label><input class="input" value="${esc(sec.signIn.rateLimit)}" readonly /></div>
            <div class="form-group"><label>Lockout</label><input class="input" value="${esc(sec.signIn.lockout)}" readonly /></div>
            <div class="form-group"><label>Live sessions</label><input class="input" value="${sec.signIn.sessions} of ${sec.signIn.sessionCap}" readonly /></div>
            <div class="form-group"><label>Passwords stored as</label><input class="input" value="${esc(sec.signIn.passwordStorage)}" readonly /></div>
          </div>
          <h4 class="help-cat">Accounts</h4>
          <div class="table-wrap"><table class="table">
            <thead><tr><th>Account</th><th>Portal</th><th>Active</th><th>Password changed</th><th>Must change</th></tr></thead>
            <tbody>${sec.accounts.map((a) => `<tr>
              <td>${esc(a.email)}</td><td>${esc(roleLabel(a.role))}${a.isIct ? " · ICT" : ""}</td>
              <td>${a.active ? "Yes" : "No"}</td><td>${esc(a.lastPasswordChange || "—")}</td>
              <td>${a.mustChangePassword ? "Yes" : "No"}</td></tr>`).join("")}</tbody>
          </table></div>
          <h4 class="help-cat">Devices signed in${State.sessions.length ? " (" + State.sessions.length + ")" : ""}</h4>
          <div class="device-list">
            ${State.sessions.length ? State.sessions.map((ss) => `
              <div class="device-row">
                <div>
                  <strong>${esc(ss.name)}</strong> <span class="help-tag">${esc(roleLabel(ss.role))}</span>
                  ${ss.current ? `<span class="help-tag warn">this device</span>` : ""}
                  <div class="help-note">${esc(ss.email)} · signed in ${esc(ss.signedInAt)}</div>
                </div>
                ${ss.current ? "" : `<button class="btn btn-outline btn-sm" onclick="FLC.revokeDevice('${esc(ss.token)}')">${icon("x", 12)} Sign out</button>`}
              </div>`).join("") : `<p class="empty-note">Only this device is signed in.</p>`}
          </div>
          <div style="display:flex;gap:0.5rem;flex-wrap:wrap;margin-top:0.7rem">
            <button class="btn btn-outline btn-sm" onclick="FLC.revokeOthers()">${icon("lock", 13)} Sign out all my other devices</button>
            <button class="btn btn-outline btn-sm" onclick="FLC.loadSessions()">${icon("refresh", 13)} Re-check devices</button>
          </div>
          ${State.systemStatus ? `
          <h4 class="help-cat">System</h4>
          <div class="form-grid">
            <div class="form-group"><label>Version</label><input class="input" value="v${esc(State.systemStatus.version)} · Node ${esc(State.systemStatus.node)}" readonly /></div>
            <div class="form-group"><label>Running for</label><input class="input" value="${esc(FLC.humanDuration(State.systemStatus.uptimeSeconds))}" readonly /></div>
            <div class="form-group"><label>Database</label><input class="input" value="${esc(State.systemStatus.databasePath)} · ${State.systemStatus.databaseKb} kB" readonly /></div>
            <div class="form-group"><label>Memory in use</label><input class="input" value="${State.systemStatus.memoryMb} MB" readonly /></div>
            <div class="form-group"><label>Last automatic backup</label><input class="input" value="${esc(State.systemStatus.lastBackup ? State.systemStatus.lastBackup.file : "none yet")}" readonly /></div>
            <div class="form-group"><label>Copies kept</label><input class="input" value="${esc(String(State.systemStatus.lastBackup ? State.systemStatus.lastBackup.count : 0))} of ${esc(String(State.systemStatus.backupRetention))}" readonly /></div>
          </div>
          <div style="display:flex;gap:0.5rem;flex-wrap:wrap;margin-top:0.7rem">
            <button class="btn btn-primary btn-sm" onclick="FLC.takeBackup()">${icon("download", 13)} Take a backup now</button>
          </div>` : ""}
          <h4 class="help-cat">Recent security events</h4>
          <ul class="sec-log">${(sec.auditLogs || []).slice(0, 12).map((l) => `<li><span>${esc(l.timestamp)}</span> ${esc(l.action)} <em>(${esc(l.actor)})</em></li>`).join("")}</ul>`
        : `<p class="empty-note">Loading the security checklist…</p>`}
      </div>`;
    if (!sec) setTimeout(() => FLC.loadSecurity(), 60);
    if (!State.sessions.length) setTimeout(() => FLC.loadSessions(), 80);
    if (!State.systemStatus) setTimeout(() => FLC.loadSystemStatus(), 90);
  }

  if (tab === "ict") {
    body += `
      <div class="grid-2">
        <div class="card">
          <div class="card-header"><div class="card-title">${icon("phone")} The ICT department</div></div>
          <p class="help-note">Accounts, passwords, devices, printers and the network. Password resets are done by the
            administrator or the ICT department only — no one else can see or change a password.</p>
          <ul class="help-list">
            <li><strong>Office line</strong> — ${esc(b.phone || "+254 700 000 000")}</li>
            <li><strong>Email</strong> — ${esc(b.email || "info@faithlearningcentre.ac.ke")}</li>
            <li><strong>Hours</strong> — Monday to Friday, 8:00 AM – 4:30 PM</li>
          </ul>
          <p class="help-note">Sign-ins, failed attempts, password resets and every change to the system are written to the
            audit trail you can read under <strong>Security</strong>.</p>
        </div>
        <div class="card">
          <div class="card-header"><div class="card-title">${icon("clipboard")} Raise a request</div></div>
          <div class="form-group"><label>What do you need help with?</label>
            <select class="select" id="ict-topic">
              <option>A forgotten or lost password</option>
              <option>A new account for a member of staff</option>
              <option>A parent cannot sign in</option>
              <option>Fees or a missing M-Pesa payment</option>
              <option>A printer, laptop or the network</option>
              <option>Something else</option>
            </select></div>
          <div class="form-group"><label>Describe it in a sentence</label>
            <textarea class="input" id="ict-note" rows="3" placeholder="e.g. the bursar's account is locked after three tries"></textarea></div>
          <button class="btn btn-primary" onclick="FLC.raiseIct()">${icon("message", 14)} Send to the Help Centre</button>
        </div>
      </div>
      <div class="card">
        <div class="card-header"><div class="card-title">${icon("book")} Quick answers</div></div>
        <ul class="help-list">${arts.slice(0, 5).map((a) => `<li><a href="javascript:void(0)" onclick="FLC.helpTab('articles');FLC.searchHelp('${esc(a.title.split(" ").slice(0, 3).join(" "))}')">${esc(a.title)}</a></li>`).join("")}</ul>
      </div>`;
  }

  return pageShell(
    "Help Centre",
    "Answers for staff and parents, forgotten-password resets for the administrator and the ICT department, and the school's live security checklist.",
    `<button class="btn btn-outline" onclick="FLC.go('dashboard')">${icon("dashboard", 14)} Back to Dashboard</button>`,
    body
  );
}

function pageCustomizer() {
  if (State.role !== "admin") {
    return pageShell("Backend Customization Zone", "Restricted area", "", `<div class="card" style="text-align:center;padding:2.5rem">
      <h3>🔒 Administrator Access Only</h3>
      <p style="color:var(--text-muted);margin-top:0.5rem">Switch to the Admin / Principal portal using the role switcher to access system configuration.</p>
    </div>`);
  }

  const tab = State.subtab.customizer || "branding";
  const tabs = [
    { id: "branding", label: "School Identity & Theme", ic: "building" },
    { id: "modules", label: "Modules & Features", ic: "layers" },
    { id: "academic", label: "Academic Engine", ic: "graduation" },
    { id: "grading", label: "Grading Scales", ic: "chart" },
    { id: "customfields", label: "Custom Fields Builder", ic: "cog" },
    { id: "finance", label: "Finance & M-Pesa Gateway", ic: "wallet" },
    { id: "permissions", label: "Role Permissions", ic: "key" },
    { id: "legal", label: "Terms & Policies", ic: "clipboard" },
    { id: "security", label: "Sign-in & Security", ic: "key" },
    { id: "data", label: "System Data & Audit", ic: "clipboard" }
  ];

  const body = `
    <div class="card" style="background:linear-gradient(135deg,#232323,#07182c);color:#fff;border:none">
      <div style="display:flex;align-items:center;gap:1rem;flex-wrap:wrap">
        <div style="width:52px;height:52px;border-radius:13px;background:rgba(255,255,255,0.15);display:flex;align-items:center;justify-content:center;border:2px solid rgba(255,255,255,0.35)">${icon("cog", 24)}</div>
        <div style="flex:1;min-width:240px">
          <h2 style="font-size:1.25rem;font-weight:800">⚙ Backend Customization Zone</h2>
          <p style="font-size:0.85rem;opacity:0.88">Total control over ${esc(State.db.systemConfig.branding.schoolName)} — branding, modules, grading engine, fee structures, custom fields, permissions and system data.</p>
        </div>
        <div style="display:flex;gap:0.6rem;flex-wrap:wrap">
          <span class="badge" style="background:rgba(255,255,255,0.18);color:#fff">${Object.values(State.db.systemConfig.modules).filter((m) => m.enabled).length}/${Object.keys(State.db.systemConfig.modules).length} modules ON</span>
          <span class="badge" style="background:rgba(255,255,255,0.18);color:#fff">${State.db.systemConfig.customFields.length} custom fields</span>
          <span class="badge" style="background:rgba(255,255,255,0.18);color:#fff">Grading: ${esc(State.db.systemConfig.academicConfig.gradingMode)}</span>
        </div>
      </div>
    </div>

    <div class="subtabs">
      ${tabs.map((t) => `<button class="subtab-btn ${tab === t.id ? "active" : ""}" onclick="FLC.sub('customizer','${t.id}')">${icon(t.ic, 14)} ${esc(t.label)}</button>`).join("")}
    </div>

    <div id="customizer-body">${customizerTab(tab)}</div>`;

  return pageShell(
    "Backend Customization Zone",
    "Every feature, field, weight, colour and permission in the system — editable without touching a single line of code.",
    `<button class="btn btn-outline" onclick="FLC.go('dashboard')">${icon("dashboard", 14)} Back to Dashboard</button>
     <button class="btn btn-accent" onclick="FLC.customizerQuickReset()">${icon("refresh", 14)} Restore Defaults</button>`,
    body
  );
}

function customizerTab(tab) {
  const b = State.db.systemConfig.branding;
  const cfg = State.db.systemConfig.academicConfig;
  const fc = State.db.systemConfig.financeConfig;
  const ff = State.db.systemConfig.customFields;
  const perms = State.db.systemConfig.rolePermissions;

  if (tab === "branding") {
    const DESIGNS = [["1", "Classic Heritage — dimmed slider, centred serif"],
      ["2", "Split Panel — corporate navy panel + full-bleed photograph"],
      ["3", "Editorial Broadsheet — nameplate, three columns, noticeboard"],
      ["4", "Minimal Corporate — whitespace and hairlines"],
      ["5", "Bento Mosaic — mosaic of photographs and cards"],
      ["6", "Premium Dark — deep corporate navy, steel hairlines"],
      ["7", "Admissions Focused — quick apply, fee table, sticky bar"],
      ["8", "Collegiate Showcase — utility strip, centred hero, call-out band, card row"]];
    const liveDesign = String(b.homeDesign || "2");
    return `
    <div class="card" style="margin-bottom:1rem;border-top:3px solid var(--accent)">
      <div class="card-header">
        <div class="card-title">${icon("sparkle")} Public Home Page Design</div>
        <span class="badge badge-info">Live on the school website</span>
      </div>
      <p style="font-size:0.85rem;color:var(--text-muted);margin-bottom:0.9rem">
        The school website can wear any of seven complete home page designs, all built from this
        system's own branding, fee structures, term dates, notices and photographs. Preview them side by
        side, then publish the one the school prefers — the choice is stored here in the backend
        customization zone and served to every visitor.
      </p>
      <div style="display:flex;gap:0.75rem;flex-wrap:wrap;align-items:flex-end">
        <div class="form-group" style="margin:0;min-width:280px">
          <label>Home page design</label>
          <select class="select" id="cf-homeDesign">
            ${DESIGNS.map(([id, label]) => `<option value="${id}" ${liveDesign === id ? "selected" : ""}>Design ${id} · ${esc(label)}</option>`).join("")}
          </select>
        </div>
        <button class="btn btn-accent" onclick="FLC.saveHomeDesign()">${icon("check", 14)} Publish this design</button>
        <a class="btn btn-outline" href="/colours" target="_blank" rel="noopener">All colour combinations</a>
        <a class="btn btn-outline" href="/designs" target="_blank" rel="noopener">Open the design gallery</a>
        <a class="btn btn-outline" href="/?design=${esc(liveDesign)}" target="_blank" rel="noopener">View the live website</a>
      </div>
      <div style="margin-top:0.8rem;font-size:0.79rem;color:var(--text-muted)">
        Currently published: <strong>Design ${esc(liveDesign)}</strong> ·
        Design 2 (Split Panel) is the design the school selected; 3–7 are equivalents built on the same content.
      </div>
    </div>
    <div class="grid-2">
      <div class="card">
        <div class="card-header"><div class="card-title">${icon("building")} School Identity</div>
          <span class="badge badge-info">Live — reflected across the entire system</span></div>
        <div class="form-grid">
          <div class="form-group"><label>School Name</label><input class="input" id="cf-schoolName" value="${esc(b.schoolName)}" oninput="FLC.previewBranding()" /></div>
          <div class="form-group"><label>Short Name / Acronym</label><input class="input" id="cf-shortName" value="${esc(b.shortName)}" /></div>
          <div class="form-group" style="grid-column:1/-1"><label>School Motto</label><input class="input" id="cf-motto" value="${esc(b.motto)}" /></div>
          <div class="form-group" style="grid-column:1/-1"><label>Vision Statement</label><textarea class="textarea" id="cf-vision" rows="2">${esc(b.vision)}</textarea></div>
          <div class="form-group" style="grid-column:1/-1"><label>Mission Statement</label><textarea class="textarea" id="cf-mission" rows="2">${esc(b.mission)}</textarea></div>
          <div class="form-group"><label>KNEC Centre Code</label><input class="input" id="cf-knecCode" value="${esc(b.knecCode)}" /></div>
          <div class="form-group"><label>NEMIS Code</label><input class="input" id="cf-nemisCode" value="${esc(b.nemisCode)}" /></div>
          <div class="form-group"><label>MoE Registration No</label><input class="input" id="cf-regNumber" value="${esc(b.regNumber)}" /></div>
          <div class="form-group"><label>Postal Address</label><input class="input" id="cf-address" value="${esc(b.address)}" /></div>
          <div class="form-group"><label>Telephone</label><input class="input" id="cf-phone" value="${esc(b.phone)}" /></div>
          <div class="form-group"><label>Email</label><input class="input" id="cf-email" value="${esc(b.email)}" /></div>
          <div class="form-group"><label>Website</label><input class="input" id="cf-website" value="${esc(b.website)}" /></div>
          <div class="form-group"><label>Principal / Head Teacher</label><input class="input" id="cf-principalName" value="${esc(b.principalName)}" /></div>
          <div class="form-group"><label>Chief Bursar</label><input class="input" id="cf-bursarName" value="${esc(b.bursarName)}" /></div>
          <div class="form-group" style="grid-column:1/-1"><label>Receipt Footer Note</label><input class="input" id="cf-receiptFooter" value="${esc(b.receiptFooter)}" /></div>
          <div class="form-group" style="grid-column:1/-1"><label>Report Card Footer Note</label><input class="input" id="cf-reportCardFooter" value="${esc(b.reportCardFooter)}" /></div>
        </div>
      </div>
      <div>
        <div class="card">
          <div class="card-header"><div class="card-title">${icon("sparkle")} Visual Theme & Appearance</div></div>
          <div class="form-grid">
            <div class="form-group"><label>Primary Colour</label>
              <input type="color" class="input" style="height:42px;padding:3px" id="cf-primaryColor" value="${esc(b.primaryColor)}" /></div>
            <div class="form-group"><label>Accent Colour</label>
              <input type="color" class="input" style="height:42px;padding:3px" id="cf-accentColor" value="${esc(b.accentColor)}" /></div>
            <div class="form-group"><label>Sidebar Theme</label>
              <select class="select" id="cf-sidebarTheme">
                ${[["navy", "Corporate Navy (default)"], ["steel", "Steel Blue"], ["graphite", "Graphite Grey"], ["teal", "Corporate Teal"], ["green", "Institutional Green"], ["burgundy", "Corporate Burgundy"], ["light", "Clean Light"]]
                  .map(([t, label]) => `<option value="${t}" ${(b.sidebarTheme || "navy") === t ? "selected" : ""}>${label}</option>`).join("")}
              </select></div>
            <div class="form-group"><label>Interface Density</label>
              <select class="select" id="cf-uiDensity">
                <option value="comfortable" ${b.uiDensity === "comfortable" ? "selected" : ""}>Comfortable</option>
                <option value="compact" ${b.uiDensity === "compact" ? "selected" : ""}>Compact</option>
              </select></div>
            <div class="form-group"><label>Crest Style</label>
              <select class="select" id="cf-crestStyle">
                <option value="shield" ${b.crestStyle === "shield" ? "selected" : ""}>Shield / Cross Crest</option>
                <option value="circle" ${b.crestStyle === "circle" ? "selected" : ""}>Circular Badge</option>
                <option value="monogram" ${b.crestStyle === "monogram" ? "selected" : ""}>Letter Monogram</option>
              </select></div>
          </div>
          <div style="margin-top:0.9rem">
            <div class="kpi-label" style="margin-bottom:0.5rem">Quick Theme Presets</div>
            <div class="swatch-row">
              <button class="theme-preset-btn" onclick="FLC.applyPreset('#141316','#e4002b','navy')"><span class="color-dot" style="background:#141316"></span> Corporate Navy &amp; Amber</button>
              <button class="theme-preset-btn" onclick="FLC.applyPreset('#232323','#e4002b','graphite')"><span class="color-dot" style="background:#232323"></span> Graphite &amp; Amber</button>
              <button class="theme-preset-btn" onclick="FLC.applyPreset('#072a30','#d0a24a','teal')"><span class="color-dot" style="background:#072a30"></span> Teal &amp; Sand</button>
              <button class="theme-preset-btn" onclick="FLC.applyPreset('#0d3a1f','#e4002b','green')"><span class="color-dot" style="background:#0d3a1f"></span> Green &amp; Old Gold</button>
              <button class="theme-preset-btn" onclick="FLC.applyPreset('#35101a','#e4002b','burgundy')"><span class="color-dot" style="background:#35101a"></span> Burgundy &amp; Gold</button>
              <button class="theme-preset-btn" onclick="FLC.applyPreset('#141316','#e4002b','light')"><span class="color-dot" style="background:#f4667c"></span> Clean Light</button>
            </div>
          </div>
        </div>
        <div class="card">
          <div class="card-header"><div class="card-title">${icon("search")} Live Appearance Preview</div></div>
          <div id="branding-preview" style="border:1px solid var(--border-color);border-radius:12px;padding:1rem;background:#ffffff">
            <div style="background:${esc(b.primaryColor)};color:#fff;padding:0.85rem 1rem;border-radius:9px;display:flex;align-items:center;gap:0.7rem">
              <div style="width:36px;height:36px;border-radius:9px;background:rgba(255,255,255,0.2);display:flex;align-items:center;justify-content:center;font-weight:800;border:1.5px solid rgba(255,255,255,0.4)">${esc((b.shortName || "FL").slice(0, 2))}</div>
              <div>
                <div id="prev-name" style="font-weight:800;font-size:0.95rem">${esc(b.schoolName)}</div>
                <div style="font-size:0.74rem;opacity:0.9">${esc(b.motto)}</div>
              </div>
            </div>
            <div style="margin-top:0.75rem;display:flex;gap:0.5rem;flex-wrap:wrap">
              <span class="badge" style="background:${esc(b.primaryColor)};color:#fff">Primary Button</span>
              <span class="badge" style="background:${esc(b.accentColor)};color:#fff">Accent Button</span>
              <span class="badge badge-neutral">Neutral Badge</span>
            </div>
            <div style="font-size:0.78rem;color:var(--text-muted);margin-top:0.75rem">
              Report card header will read: <strong>${esc(b.schoolName)}</strong> — ${esc(b.address)} · Mean Grade scale: ${esc(cfg.gradingMode)}
            </div>
          </div>
          <button class="btn btn-primary" style="margin-top:0.9rem" onclick="FLC.saveBranding()">${icon("check", 14)} Save Identity & Theme</button>
        </div>
      </div>
    </div>`;
  }

  if (tab === "modules") {
    const mods = State.db.systemConfig.modules;
    return `
      <div class="card">
        <div class="card-header"><div class="card-title">${icon("layers")} Module & Feature Manager</div>
          <div style="display:flex;gap:0.5rem">
            <button class="btn btn-outline btn-sm" onclick="FLC.toggleAllModules(true)">Enable All</button>
            <button class="btn btn-outline btn-sm" onclick="FLC.toggleAllModules(false)">Disable All</button>
          </div>
        </div>
        <p style="font-size:0.85rem;color:var(--text-muted);margin-bottom:1rem">
          Turn whole modules on or off instantly. Disabled modules disappear from the sidebar and are hidden from every role's portal — a true feature flag system.
        </p>
        <div class="grid-2">
          ${Object.entries(mods).map(([key, m]) => `
            <div class="switch-row" style="margin-bottom:0">
              <div style="display:flex;gap:0.75rem;align-items:flex-start">
                <div style="width:38px;height:38px;border-radius:9px;background:${m.enabled ? "var(--primary-light)" : "#f4f4f4"};color:${m.enabled ? "var(--primary)" : "#8e8e8e"};display:flex;align-items:center;justify-content:center">${icon(m.icon || "layers", 18)}</div>
                <div>
                  <div style="font-weight:700;font-size:0.88rem">${esc(m.label)}</div>
                  <div style="font-size:0.78rem;color:var(--text-muted);max-width:340px">${esc(m.description)}</div>
                  <span class="badge ${m.enabled ? "badge-success" : "badge-neutral"}" style="margin-top:4px">${m.enabled ? "Active" : "Disabled"}</span>
                </div>
              </div>
              <label class="switch">
                <input type="checkbox" ${m.enabled ? "checked" : ""} onchange="FLC.toggleModule('${key}', this.checked)" />
                <span class="slider"></span>
              </label>
            </div>`).join("")}
        </div>
        <div style="margin-top:1rem;padding:0.85rem;background:var(--accent-light);border-radius:10px;font-size:0.83rem;color:var(--warning)">
          ⚠️ Changes apply immediately to all portals. Data is preserved when a module is disabled — re-enable it any time to restore full access.
        </div>
      </div>`;
  }

  if (tab === "academic") {
    return `
    <div class="grid-2">
      <div class="card">
        <div class="card-header"><div class="card-title">${icon("calendar")} Academic Year, Terms & Assessment Weighting</div></div>
        <div class="form-grid">
          <div class="form-group"><label>Academic Year</label><input class="input" id="ac-year" value="${esc(cfg.currentYear)}" /></div>
          <div class="form-group"><label>Current Term</label>
            <select class="select" id="ac-term">${["Term 1", "Term 2", "Term 3"].map((t) => `<option ${cfg.currentTerm === t ? "selected" : ""}>${t}</option>`).join("")}</select></div>
          <div class="form-group"><label>Term Start Date</label><input type="date" class="input" id="ac-start" value="${esc(cfg.termStartDate)}" /></div>
          <div class="form-group"><label>Term End / Closing Date</label><input type="date" class="input" id="ac-end" value="${esc(cfg.termEndDate)}" /></div>
          <div class="form-group"><label>Next Term Opening Date</label><input type="date" class="input" id="ac-next" value="${esc(cfg.nextTermOpening)}" /></div>
          <div class="form-group"><label>Grading Mode</label>
            <select class="select" id="ac-mode">
              <option value="hybrid" ${cfg.gradingMode === "hybrid" ? "selected" : ""}>Hybrid — CBC Rubric + Standard Grades</option>
              <option value="cbc" ${cfg.gradingMode === "cbc" ? "selected" : ""}>CBC Competency Rubric only (EE/ME/AE/BE)</option>
              <option value="standard" ${cfg.gradingMode === "standard" ? "selected" : ""}>Standard Percentage / Letter Grades (A–E)</option>
            </select></div>
          <div class="form-group"><label>SBA Weight (%)</label><input type="number" class="input" id="ac-sba" value="${cfg.sbaWeight}" min="0" max="100" /></div>
          <div class="form-group"><label>Examination Weight (%)</label><input type="number" class="input" id="ac-exam" value="${cfg.examWeight}" min="0" max="100" /></div>
          <div class="form-group"><label>Active Assessment Type</label>
            <select class="select" id="ac-activeExam">${cfg.examTypes.map((e) => `<option ${cfg.activeExamType === e ? "selected" : ""}>${esc(e)}</option>`).join("")}</select></div>
        </div>
        <div style="margin-top:0.85rem">
          <div class="kpi-label" style="margin-bottom:0.5rem">Assessment Types (click × to remove)</div>
          <div style="display:flex;gap:0.4rem;flex-wrap:wrap;margin-bottom:0.6rem">
            ${cfg.examTypes.map((e, i) => `<span class="badge badge-info" style="padding:0.3rem 0.6rem">${esc(e)} <a href="javascript:void(0)" onclick="FLC.removeExamType(${i})" style="color:inherit;font-weight:800;text-decoration:none">×</a></span>`).join("")}
          </div>
          <div style="display:flex;gap:0.5rem">
            <input class="input" id="ac-newExam" placeholder="Add new assessment type e.g. KPSEA Mock" />
            <button class="btn btn-outline btn-sm" onclick="FLC.addExamType()">${icon("plus", 13)} Add</button>
          </div>
        </div>
        <button class="btn btn-primary" style="margin-top:0.9rem" onclick="FLC.saveAcademic()">${icon("check", 14)} Save Academic Engine</button>
      </div>

      <div>
        <div class="card">
          <div class="card-header"><div class="card-title">${icon("users")} Class Levels (PP1 – Grade 9 JSS)</div>
            <span class="badge badge-neutral">${cfg.gradeLevels.length} levels</span></div>
          <div style="display:flex;gap:0.4rem;flex-wrap:wrap;margin-bottom:0.7rem">
            ${cfg.gradeLevels.map((g, i) => `<span class="badge badge-neutral" style="padding:0.3rem 0.6rem">${esc(g)} <a href="javascript:void(0)" onclick="FLC.removeGradeLevel(${i})" style="color:inherit;font-weight:800;text-decoration:none">×</a></span>`).join("")}
          </div>
          <div style="display:flex;gap:0.5rem">
            <input class="input" id="ac-newGrade" placeholder="e.g. Grade 10 (Senior School)" />
            <button class="btn btn-outline btn-sm" onclick="FLC.addGradeLevel()">${icon("plus", 13)} Add Level</button>
          </div>
        </div>
        <div class="card">
          <div class="card-header"><div class="card-title">${icon("sparkle")} Class Streams / Houses</div></div>
          <div style="display:flex;gap:0.4rem;flex-wrap:wrap;margin-bottom:0.7rem">
            ${cfg.streams.map((s, i) => `<span class="badge badge-info" style="padding:0.3rem 0.6rem">${esc(s)} <a href="javascript:void(0)" onclick="FLC.removeStream(${i})" style="color:inherit;font-weight:800;text-decoration:none">×</a></span>`).join("")}
          </div>
          <div style="display:flex;gap:0.5rem">
            <input class="input" id="ac-newStream" placeholder="e.g. Hope" />
            <button class="btn btn-outline btn-sm" onclick="FLC.addStream()">${icon("plus", 13)} Add Stream</button>
          </div>
        </div>
        <div class="card">
          <div class="card-header"><div class="card-title">${icon("book")} Learning Areas (Subjects) — ${cfg.learningAreas.length} configured</div>
            <button class="btn btn-outline btn-sm" onclick="FLC.saveLearningAreas()">${icon("check", 13)} Save</button></div>
          <div class="table-wrap">
            <table class="data-table" id="la-table">
              <thead><tr><th>Code</th><th>Learning Area</th><th>Category</th><th>Active</th><th></th></tr></thead>
              <tbody>
                ${cfg.learningAreas.map((l, i) => `<tr data-la="${i}">
                  <td><input class="input" style="width:90px" data-k="code" value="${esc(l.code)}" /></td>
                  <td><input class="input" style="min-width:180px" data-k="name" value="${esc(l.name)}" /></td>
                  <td><input class="input" style="width:110px" data-k="category" value="${esc(l.category)}" /></td>
                  <td><label class="switch"><input type="checkbox" data-k="active" ${l.active ? "checked" : ""} /><span class="slider"></span></label></td>
                  <td><button class="btn btn-danger btn-sm" onclick="FLC.removeLearningArea(${i})">${icon("trash", 12)}</button></td>
                </tr>`).join("")}
              </tbody>
            </table>
          </div>
          <div style="display:flex;gap:0.5rem;margin-top:0.6rem">
            <input class="input" id="la-newName" placeholder="New learning area name" />
            <input class="input" id="la-newCode" style="width:110px" placeholder="Code" />
            <button class="btn btn-outline btn-sm" onclick="FLC.addLearningArea()">${icon("plus", 13)} Add</button>
          </div>
        </div>
      </div>
    </div>`;
  }

  if (tab === "grading") {
    return `
    <div class="grid-2">
      <div class="card">
        <div class="card-header"><div class="card-title">${icon("graduation")} CBC Competency Rubric Scale</div>
          <button class="btn btn-outline btn-sm" onclick="FLC.saveRubric()">${icon("check", 13)} Save Rubric</button></div>
        <p style="font-size:0.83rem;color:var(--text-muted);margin-bottom:0.75rem">Define the competency levels, percentage bands, points and descriptors used on CBC report cards.</p>
        <div class="table-wrap">
          <table class="data-table" id="rubric-table">
            <thead><tr><th>Code</th><th>Level Label</th><th>Min %</th><th>Max %</th><th>Points</th><th>Colour</th></tr></thead>
            <tbody>
              ${cfg.cbcRubricScale.map((r, i) => `<tr data-rubric="${i}">
                <td><input class="input" style="width:70px" data-k="code" value="${esc(r.code)}" /></td>
                <td><input class="input" style="min-width:170px" data-k="label" value="${esc(r.label)}" /></td>
                <td><input type="number" class="input" style="width:75px" data-k="min" value="${r.min}" /></td>
                <td><input type="number" class="input" style="width:75px" data-k="max" value="${r.max}" /></td>
                <td><input type="number" class="input" style="width:70px" data-k="points" value="${r.points}" /></td>
                <td><input type="color" class="input" style="width:52px;height:36px;padding:2px" data-k="color" value="${esc(r.color)}" /></td>
              </tr>`).join("")}
            </tbody>
          </table>
        </div>
        <div style="margin-top:0.7rem">
          <div class="kpi-label" style="margin-bottom:0.4rem">Report Card Descriptors</div>
          ${cfg.cbcRubricScale.map((r, i) => `
            <div class="form-group" style="margin-bottom:0.55rem">
              <label>${esc(r.code)} — ${esc(r.label)}</label>
              <input class="input" id="rubric-remark-${i}" value="${esc(r.remark)}" />
            </div>`).join("")}
        </div>
      </div>
      <div class="card">
        <div class="card-header"><div class="card-title">${icon("chart")} Standard Grade Scale (8-4-4 / Percentage)</div>
          <button class="btn btn-outline btn-sm" onclick="FLC.saveStandardScale()">${icon("check", 13)} Save Scale</button></div>
        <p style="font-size:0.83rem;color:var(--text-muted);margin-bottom:0.75rem">Used when grading mode is set to <strong>standard</strong> or <strong>hybrid</strong>. Supports A–E letter grades with points and remarks.</p>
        <div class="table-wrap">
          <table class="data-table" id="standard-table">
            <thead><tr><th>Grade</th><th>Min %</th><th>Max %</th><th>Points</th><th>Remark</th></tr></thead>
            <tbody>
              ${cfg.standardGradeScale.map((r, i) => `<tr data-standard="${i}">
                <td><input class="input" style="width:70px" data-k="grade" value="${esc(r.grade)}" /></td>
                <td><input type="number" class="input" style="width:75px" data-k="min" value="${r.min}" /></td>
                <td><input type="number" class="input" style="width:75px" data-k="max" value="${r.max}" /></td>
                <td><input type="number" class="input" style="width:70px" data-k="points" value="${r.points}" /></td>
                <td><input class="input" style="min-width:190px" data-k="remark" value="${esc(r.remark)}" /></td>
              </tr>`).join("")}
            </tbody>
          </table>
        </div>
        <div class="card" style="margin-top:1rem;background:var(--primary-light);border-color:var(--primary)">
          <div style="font-size:0.84rem">
            <strong>🔁 Weighting formula in force:</strong> Final Score = (SBA × ${cfg.sbaWeight}%) + (${esc(cfg.activeExamType)} × ${cfg.examWeight}%).
            Change the weights under <strong>Academic Engine</strong>. Report cards will recompute automatically.
          </div>
        </div>
      </div>
    </div>`;
  }

  if (tab === "customfields") {
    return `
    <div class="grid-2">
      <div class="card">
        <div class="card-header"><div class="card-title">${icon("cog")} Custom Fields Builder</div>
          <span class="badge badge-info">No-code schema extension</span></div>
        <p style="font-size:0.84rem;color:var(--text-muted);margin-bottom:1rem">
          Add your own fields to learner records, staff records or any data entity. They immediately appear on admission forms, learner profiles and staff directories.
        </p>
        <div class="form-grid">
          <div class="form-group"><label>Applies To</label>
            <select class="select" id="cf-entity">
              <option value="student" ${"student" ? "selected" : ""}>Learner / Student Record</option>
              <option value="staff">Staff Record</option>
            </select></div>
          <div class="form-group"><label>Field Type</label>
            <select class="select" id="cf-type">
              <option value="text">Short Text</option>
              <option value="select">Dropdown (Select)</option>
              <option value="number">Number</option>
              <option value="date">Date</option>
            </select></div>
          <div class="form-group" style="grid-column:1/-1"><label>Field Label</label>
            <input class="input" id="cf-label" placeholder="e.g. NHIF Number, Bus Stop, Talent Club" /></div>
          <div class="form-group" style="grid-column:1/-1"><label>Dropdown Options (comma-separated)</label>
            <input class="input" id="cf-options" placeholder="Option 1, Option 2, Option 3" /></div>
        </div>
        <button class="btn btn-primary" style="margin-top:0.9rem" onclick="FLC.addCustomField()">${icon("plus", 14)} Create Custom Field</button>

        <div class="card" style="margin-top:1.1rem;background:#ffffff">
          <div class="kpi-label" style="margin-bottom:0.6rem">Field Blueprint Preview</div>
          <div id="field-preview" style="font-size:0.84rem;color:var(--text-muted)">Choose a type and label to preview how the field renders on the admission form.</div>
        </div>
      </div>

      <div class="card">
        <div class="card-header"><div class="card-title">${icon("layers")} Active Custom Fields (${ff.length})</div></div>
        <div class="table-wrap">
          <table class="data-table">
            <thead><tr><th>Label</th><th>Entity</th><th>Type</th><th>Options</th><th>Status</th><th></th></tr></thead>
            <tbody>
              ${ff.length ? ff.map((f) => `<tr>
                <td><strong>${esc(f.label)}</strong><div style="font-size:0.72rem;color:var(--text-muted)">key: ${esc(f.key)}</div></td>
                <td><span class="badge ${f.entity === "student" ? "badge-info" : "badge-neutral"}">${esc(f.entity)}</span></td>
                <td>${esc(f.type)}</td>
                <td style="font-size:0.78rem">${(f.options || []).map(esc).join(", ") || "—"}</td>
                <td><span class="badge ${f.active ? "badge-success" : "badge-neutral"}">${f.active ? "Active" : "Inactive"}</span></td>
                <td><button class="btn btn-danger btn-sm" onclick="FLC.deleteCustomField('${f.id}')">${icon("trash", 12)}</button></td>
              </tr>`).join("") : `<tr><td colspan="6" style="text-align:center;padding:1.5rem;color:var(--text-muted)">No custom fields yet — create your first one on the left.</td></tr>`}
            </tbody>
          </table>
        </div>
        <div style="margin-top:0.9rem;padding:0.85rem;background:var(--accent-light);border-radius:10px;font-size:0.83rem;color:var(--warning)">
          💡 Current learner custom fields in use on admission forms: ${ff.filter((f) => f.entity === "student" && f.active).map((f) => esc(f.label)).join(" · ") || "none"}
        </div>
      </div>
    </div>`;
  }

  if (tab === "finance") {
    return `
    <div class="grid-2">
      <div class="card">
        <div class="card-header"><div class="card-title">${icon("wallet")} M-Pesa & Payment Gateway Settings</div></div>
        <div class="form-grid">
          <div class="form-group"><label>Currency</label><input class="input" id="fn-currency" value="${esc(fc.currency)}" /></div>
          <div class="form-group"><label>M-Pesa Paybill Number</label><input class="input" id="fn-paybill" value="${esc(fc.mpesaPaybill)}" /></div>
          <div class="form-group"><label>Account Prefix</label><input class="input" id="fn-prefix" value="${esc(fc.mpesaAccountPrefix)}" /></div>
          <div class="form-group"><label>Bank Name & Branch</label><input class="input" id="fn-bank" value="${esc(fc.bankName)}" /></div>
          <div class="form-group"><label>Bank Account Number</label><input class="input" id="fn-account" value="${esc(fc.bankAccount)}" /></div>
          <div class="form-group"><label>Arrears Alert Threshold</label><input type="number" class="input" id="fn-threshold" value="${fc.arrearsAlertThreshold}" /></div>
        </div>
        <div style="margin-top:0.9rem">
          <div class="switch-row"><div><strong style="font-size:0.87rem">Allow parents to pay via the Parent Portal (M-Pesa STK Push)</strong>
            <div style="font-size:0.78rem;color:var(--text-muted)">Parents can initiate a payment prompt from their fee statement.</div></div>
            <label class="switch"><input type="checkbox" id="fn-parentPay" ${fc.allowParentPortalMpesa ? "checked" : ""} /><span class="slider"></span></label></div>
          <div class="switch-row"><div><strong style="font-size:0.87rem">Auto-send SMS receipt confirmation on every payment</strong>
            <div style="font-size:0.78rem;color:var(--text-muted)">Consumes 1 SMS credit per payment.</div></div>
            <label class="switch"><input type="checkbox" id="fn-autoPay" ${fc.autoSmsOnPayment ? "checked" : ""} /><span class="slider"></span></label></div>
          <div class="switch-row"><div><strong style="font-size:0.87rem">Auto-send SMS alert on learner absence / lateness</strong>
            <div style="font-size:0.78rem;color:var(--text-muted)">Triggered when the daily register is saved.</div></div>
            <label class="switch"><input type="checkbox" id="fn-autoAbs" ${fc.autoSmsOnAbsence ? "checked" : ""} /><span class="slider"></span></label></div>
          <div class="switch-row"><div><strong style="font-size:0.87rem">Withhold report cards for fee arrears</strong>
            <div style="font-size:0.78rem;color:var(--text-muted)">Blocks printing when balance exceeds the threshold below.</div></div>
            <label class="switch"><input type="checkbox" id="fn-lock" ${fc.lockReportCardOnArrears ? "checked" : ""} /><span class="slider"></span></label></div>
          <div class="form-group" style="margin-top:0.5rem"><label>Report Card Withholding Threshold</label>
            <input type="number" class="input" id="fn-lockThreshold" value="${fc.lockReportCardThreshold}" /></div>
        </div>
        <button class="btn btn-primary" style="margin-top:0.9rem" onclick="FLC.saveFinance()">${icon("check", 14)} Save Gateway Settings</button>
      </div>

      <div class="card">
        <div class="card-header"><div class="card-title">${icon("wallet")} Payment channels</div></div>
        <p class="help-note">Every way the school accepts money. Switch a channel off to hide it from the payment
          forms and the website without deleting it; the temporary M-Pesa Pochi la Biashara number can be removed
          altogether once the permanent till is live.</p>
        <div class="channel-list">
          ${(fc.paymentChannels || []).map((c, i) => `
            <div class="channel-row ${c.enabled ? "" : "off"}">
              <div class="channel-main">
                <strong>${esc(c.label)}${c.temporary ? ` <span class="badge badge-warn">temporary</span>` : ""}</strong>
                <div class="help-note">${esc(c.detail || "")}</div>
              </div>
              <input class="input channel-detail" id="chn-${i}" value="${esc(c.detail || "")}" placeholder="How the school receives this payment" />
              <label class="switch"><input type="checkbox" id="chc-${i}" ${c.enabled ? "checked" : ""} /><span class="slider"></span></label>
              <button class="btn btn-outline btn-sm" onclick="FLC.removeChannel(${i})">${icon("trash", 12)} Remove</button>
            </div>`).join("")}
        </div>
        <div class="form-grid" style="margin-top:0.9rem">
          <div class="form-group"><label>Add a channel</label><input class="input" id="chn-new-label" placeholder="e.g. M-Pesa Till 4029111" /></div>
          <div class="form-group"><label>How is it paid?</label><input class="input" id="chn-new-detail" placeholder="e.g. Till 4029111 · quote the admission number" /></div>
        </div>
        <div style="margin-top:0.8rem;display:flex;gap:0.5rem;flex-wrap:wrap">
          <button class="btn btn-primary" onclick="FLC.saveChannels()">${icon("check", 14)} Save payment channels</button>
          <button class="btn btn-outline" onclick="FLC.addChannel()">${icon("plus", 14)} Add channel</button>
        </div>
      </div>

      <div>
        <div class="card">
          <div class="card-header"><div class="card-title">${icon("message")} SMS Gateway Provider</div></div>
          <div class="form-grid">
            <div class="form-group"><label>Provider</label><input class="input" id="fn-smsProvider" value="${esc(fc.smsGatewayProvider)}" /></div>
            <div class="form-group"><label>Sender ID</label><input class="input" id="fn-smsSender" value="${esc(fc.smsSenderId)}" /></div>
            <div class="form-group"><label>SMS Credit Balance</label><input type="number" class="input" id="fn-smsCredits" value="${fc.smsBalanceCredits}" /></div>
          </div>
          <div style="margin-top:0.9rem;display:flex;gap:0.5rem;flex-wrap:wrap">
            <button class="btn btn-outline btn-sm" onclick="FLC.topUpSms()">${icon("plus", 13)} Top-up 1,000 Credits</button>
            <button class="btn btn-outline btn-sm" onclick="FLC.go('communications')">${icon("message", 13)} Open SMS Hub</button>
          </div>
        </div>

        <div class="card">
          <div class="card-header"><div class="card-title">${icon("layers")} Fee Structures by Level Group</div>
            <span class="badge badge-neutral">Auto-computes totals</span></div>
          <p style="font-size:0.82rem;color:var(--text-muted);margin-bottom:0.75rem">Edit any votehead — Day and Boarding totals recompute instantly and new admissions use these figures.</p>
          ${State.db.feeStructures.map((fs) => `
            <div style="border:1px solid var(--border-color);border-radius:10px;padding:0.85rem;margin-bottom:0.8rem">
              <div style="display:flex;justify-content:space-between;align-items:center;gap:0.5rem;flex-wrap:wrap;margin-bottom:0.6rem">
                <strong style="font-size:0.87rem">${esc(fs.levelGroup)}</strong>
                <span class="badge badge-info">Day ${money(fs.totalDay)} · Boarding ${money(fs.totalBoarding)}</span>
              </div>
              <div class="form-grid" data-fs="${fs.id}">
                <div class="form-group"><label>Tuition</label><input type="number" class="input" data-k="tuition" value="${fs.tuition}" /></div>
                <div class="form-group"><label>Meals</label><input type="number" class="input" data-k="meals" value="${fs.meals}" /></div>
                <div class="form-group"><label>CBC Activities</label><input type="number" class="input" data-k="activityCbc" value="${fs.activityCbc}" /></div>
                <div class="form-group"><label>ICT & Library</label><input type="number" class="input" data-k="ictLibrary" value="${fs.ictLibrary}" /></div>
                <div class="form-group"><label>Boarding</label><input type="number" class="input" data-k="boardingFee" value="${fs.boardingFee}" /></div>
                <div class="form-group" style="justify-content:flex-end"><button class="btn btn-outline btn-sm" onclick="FLC.saveFeeStructure('${fs.id}')">${icon("check", 12)} Save</button></div>
              </div>
            </div>`).join("")}
        </div>
      </div>
    </div>`;
  }

  if (tab === "permissions") {
    const rolesMeta = {
      teacher: { label: "Teacher Portal", desc: "Class teachers, subject teachers and JSS coordinators" },
      bursar: { label: "Bursar / Finance Portal", desc: "Fee collection, receipting and expenditure officers" },
      parent: { label: "Parent & Student Portal", desc: "Guardians accessing learner information and payments" }
    };
    return `
    <div class="card">
      <div class="card-header"><div class="card-title">${icon("key")} Role Permissions Matrix</div>
        <span class="badge badge-info">Granular access control</span></div>
      <p style="font-size:0.85rem;color:var(--text-muted);margin-bottom:1rem">
        Decide exactly what each portal can do. Toggling a permission changes the live behaviour of that role immediately — for example, disabling "Edit Marks" turns the markbook read-only for teachers.
      </p>
      <div class="grid-3">
        ${Object.entries(perms).map(([roleKey, rolePerms]) => `
          <div class="card" style="margin-bottom:0">
            <div class="card-header"><div class="card-title">${icon(roleKey === "parent" ? "user" : roleKey === "bursar" ? "wallet" : "graduation")} ${esc(rolesMeta[roleKey].label)}</div></div>
            <div style="font-size:0.78rem;color:var(--text-muted);margin-bottom:0.75rem">${esc(rolesMeta[roleKey].desc)}</div>
            ${Object.entries(rolePerms).map(([permKey, val]) => `
              <div class="switch-row" style="padding:0.6rem 0.75rem">
                <div style="font-size:0.82rem;font-weight:600">${esc(permKey.replace(/^can/, "").replace(/([A-Z])/g, " $1").replace(/^./, (m) => m.toUpperCase()))}</div>
                <label class="switch"><input type="checkbox" ${val ? "checked" : ""} onchange="FLC.togglePermission('${roleKey}','${permKey}', this.checked)" /><span class="slider"></span></label>
              </div>`).join("")}
          </div>`).join("")}
      </div>
      <div class="card" style="margin-top:1rem;background:#ffffff">
        <div class="card-header"><div class="card-title">${icon("shield")} Administrator (Super Admin) — Full Unrestricted Access</div></div>
        <div style="font-size:0.84rem;color:var(--text-muted)">
          The Admin / Principal role always retains complete access to every module and to this Backend Customization Zone.
          Permissions cannot be revoked from the administrator account — this guarantees the system can never be locked out of its own settings.
        </div>
      </div>
    </div>`;
  }

  if (tab === "security") {
    const accounts = State.db.accounts || [];
    return `
    <div class="grid-2">
      <div class="card">
        <div class="card-header"><div class="card-title">${icon("key")} Portal Accounts</div></div>
        <div class="table-wrap">
          <table class="data-table">
            <thead><tr><th>Portal</th><th>Email</th><th>Status</th><th>Password changed</th></tr></thead>
            <tbody>
              ${accounts.map((a) => `<tr>
                <td><strong>${esc(roleLabel(a.role))}</strong></td>
                <td><code>${esc(a.email)}</code></td>
                <td>${a.active ? '<span class="badge badge-green">Active</span>' : '<span class="badge badge-danger">Disabled</span>'}</td>
                <td>${esc(a.passwordChangedAt || "Set when the system was installed")}</td>
              </tr>`).join("")}
            </tbody>
          </table>
        </div>
        <p class="hx-note" style="margin-top:0.8rem">Passwords are stored as salted scrypt hashes — never in clear text.
          Sign-ins, failed attempts and password changes are written to the audit trail, and the account decides which
          portal opens after sign-in.</p>
      </div>
      <div class="card">
        <div class="card-header"><div class="card-title">${icon("lock")} Change Your Password</div></div>
        ${State.user ? `<p class="hx-note" style="margin-bottom:0.9rem">Signed in as <strong>${esc(State.user.email)}</strong> (${esc(roleLabel(State.user.role))}).</p>` : ""}
        <form onsubmit="return FLC.changePassword(event)" style="display:flex;flex-direction:column;gap:0.8rem">
          <div class="form-group"><label for="sec-current">Current password</label>
            <input class="input" type="password" id="sec-current" autocomplete="current-password" /></div>
          <div class="form-group"><label for="sec-new">New password</label>
            <input class="input" type="password" id="sec-new" autocomplete="new-password" /></div>
          <div class="form-group"><label for="sec-confirm">Repeat the new password</label>
            <input class="input" type="password" id="sec-confirm" autocomplete="new-password" /></div>
          <div id="sec-msg" style="font-size:0.84rem"></div>
          <button class="btn btn-primary" type="submit">${icon("lock", 14)} Change password</button>
        </form>
        <p class="hx-note" style="margin-top:0.9rem">Changing a password signs every other device out and keeps this one signed in.</p>
      </div>
    </div>`;
  }

  if (tab === "legal") {
    const t = State.db.systemConfig.terms;
    const consents = State.db.consents || [];
    const enquiries = State.db.enquiries || [];
    return `
    <div class="grid-2">
      <div class="card">
        <div class="card-header"><div class="card-title">${icon("clipboard")} School Terms &amp; Conditions — master configuration</div>
          <button class="btn btn-outline btn-sm" onclick="FLCTerms.open(State.db)">${icon("print", 13)} Preview Document</button></div>
        <p style="font-size:0.84rem;color:var(--text-muted);margin-bottom:1rem">
          These settings feed the Terms &amp; Conditions document shown on the public website, at portal login, on admissions
          forms and on printed report cards. Bump the version whenever the terms change — every user is then required to
          accept the new version before entering a portal.
        </p>
        <div class="form-grid">
          <div class="form-group"><label>Document Version</label><input class="input" id="tm-version" value="${esc(t.version)}" /></div>
          <div class="form-group"><label>Effective Date</label><input type="date" class="input" id="tm-effectiveDate" value="${esc(t.effectiveDate)}" /></div>
          <div class="form-group"><label>Fee Payment Deadline</label><input class="input" id="tm-feeDeadlineWeek" value="${esc(t.feeDeadlineWeek)}" /></div>
          <div class="form-group"><label>Refund Processing (working days)</label><input type="number" class="input" id="tm-refundNoticeDays" value="${t.refundNoticeDays}" /></div>
          <div class="form-group"><label>Withdrawal Notice (days)</label><input type="number" class="input" id="tm-withdrawalNoticeDays" value="${t.withdrawalNoticeDays}" /></div>
          <div class="form-group"><label>Data Protection Officer Email</label><input class="input" id="tm-dpoEmail" value="${esc(t.dpoEmail)}" /></div>
          <div class="form-group" style="grid-column:1/-1"><label>Arrears Policy Statement</label><textarea class="textarea" id="tm-arrearsAction" rows="3">${esc(t.arrearsAction)}</textarea></div>
          <div class="form-group" style="grid-column:1/-1"><label>Academic Honesty Statement</label><textarea class="textarea" id="tm-academicHonesty" rows="3">${esc(t.academicHonesty)}</textarea></div>
          <div class="form-group" style="grid-column:1/-1"><label>Attendance Requirement</label><textarea class="textarea" id="tm-attendanceRequirement" rows="2">${esc(t.attendanceRequirement)}</textarea></div>
          <div class="form-group" style="grid-column:1/-1"><label>Complaints Channel</label><input class="input" id="tm-complaintsChannel" value="${esc(t.complaintsChannel)}" /></div>
        </div>
        <div style="margin-top:0.9rem">
          <div class="switch-row"><div><strong style="font-size:0.87rem">Require acceptance at portal login</strong>
            <div style="font-size:0.78rem;color:var(--text-muted)">Users must tick and confirm the terms before entering any portal.</div></div>
            <label class="switch"><input type="checkbox" id="tm-enforceTermsAtLogin" ${t.enforceTermsAtLogin ? "checked" : ""} /><span class="slider"></span></label></div>
          <div class="switch-row"><div><strong style="font-size:0.87rem">Require acceptance on admission &amp; enquiry forms</strong>
            <div style="font-size:0.78rem;color:var(--text-muted)">Parents must accept the terms when submitting admission enquiries.</div></div>
            <label class="switch"><input type="checkbox" id="tm-requireAtAdmission" ${t.requireAtAdmission ? "checked" : ""} /><span class="slider"></span></label></div>
          <div class="switch-row"><div><strong style="font-size:0.87rem">Consent to use learner images in school communications</strong>
            <div style="font-size:0.78rem;color:var(--text-muted)">Default position; parents may opt out in writing.</div></div>
            <label class="switch"><input type="checkbox" id="tm-photoConsentDefault" ${t.photoConsentDefault ? "checked" : ""} /><span class="slider"></span></label></div>
        </div>
        <button class="btn btn-primary" style="margin-top:0.9rem" onclick="FLC.saveTerms()">${icon("check", 14)} Save Terms &amp; Policies</button>
      </div>

      <div>
        <div class="card">
          <div class="card-header"><div class="card-title">${icon("shield")} Acceptance Registry (${consents.length})</div></div>
          <div class="table-wrap" style="max-height:320px;overflow-y:auto">
            <table class="data-table">
              <thead><tr><th>Timestamp</th><th>Name / User</th><th>Portal</th><th>Version</th></tr></thead>
              <tbody>
                ${consents.length ? consents.map((c) => `<tr>
                  <td style="font-size:0.78rem;white-space:nowrap">${esc(c.acceptedAt || c.timestamp)}</td>
                  <td style="font-size:0.82rem">${esc(c.name)}</td>
                  <td><span class="badge badge-neutral">${esc(c.portal)}</span></td>
                  <td><span class="badge badge-info">v${esc(c.termsVersion)}</span></td>
                </tr>`).join("") : `<tr><td colspan="4" style="text-align:center;padding:1.2rem;color:var(--text-muted)">No acceptances recorded yet.</td></tr>`}
              </tbody>
            </table>
          </div>
        </div>
        <div class="card">
          <div class="card-header"><div class="card-title">${icon("message")} Website Admission Enquiries (${enquiries.length})</div>
            <span class="badge badge-success">Live from front page</span></div>
          <div class="table-wrap" style="max-height:340px;overflow-y:auto">
            <table class="data-table">
              <thead><tr><th>Date</th><th>Parent &amp; Contact</th><th>Learner / Grade</th><th>Preference</th><th>Message</th><th>Status</th></tr></thead>
              <tbody>
                ${enquiries.length ? enquiries.map((e2) => `<tr>
                  <td style="font-size:0.78rem">${esc(e2.date)}</td>
                  <td style="font-size:0.82rem"><strong>${esc(e2.parentName)}</strong><div style="color:var(--text-muted)">${esc(e2.phone)}</div></td>
                  <td style="font-size:0.82rem">${esc(e2.learnerName || "—")}<div style="color:var(--text-muted)">${esc(e2.gradeOfInterest)}</div></td>
                  <td><span class="badge badge-neutral">${esc(e2.boardingPreference)}</span></td>
                  <td style="font-size:0.78rem;max-width:240px">${esc(e2.message)}</td>
                  <td>
                    ${State.role === "admin" ? `<select class="select" style="font-size:0.74rem;padding:0.28rem 0.4rem" onchange="FLC.updateEnquiryStatus('${esc(e2.id)}', this.value)">
                      ${["New", "Contacted", "Enrolled", "Archived"].map((st) => `<option${st === e2.status ? " selected" : ""}>${st}</option>`).join("")}
                    </select>` : `<span class="badge ${e2.status === "New" ? "badge-warning" : "badge-success"}">${esc(e2.status)}</span>`}
                    <button class="btn btn-ghost btn-sm" style="margin-top:0.25rem" title="Remove this enquiry" onclick="FLC.deleteEnquiry('${esc(e2.id)}')">${icon("trash")}</button>
                  </td>
                </tr>`).join("") : `<tr><td colspan="6" style="text-align:center;padding:1.2rem;color:var(--text-muted)">No enquiries received yet.</td></tr>`}
              </tbody>
            </table>
          </div>
        </div>
        <div class="card" style="background:#ffffff">
          <div class="card-header"><div class="card-title">${icon("layers")} What the Terms cover</div></div>
          <div class="table-wrap">
            <table class="data-table"><tbody>
              ${FLCTerms.clauses(State.db).map((c) => `<tr><td style="font-size:0.82rem">${esc(c.title)}</td><td style="text-align:right"><span class="badge badge-neutral">${c.body.length} clauses</span></td></tr>`).join("")}
            </tbody></table>
          </div>
        </div>
      </div>
    </div>`;
  }

  if (tab === "data") {
    return `
    <div class="grid-2">
      <div class="card">
        <div class="card-header"><div class="card-title">${icon("clipboard")} System Data Tools</div></div>
        <div style="display:flex;flex-direction:column;gap:0.7rem">
          <div style="border:1px solid var(--border-color);border-radius:10px;padding:0.85rem">
            <strong style="font-size:0.87rem">Export Full School Database (JSON)</strong>
            <div style="font-size:0.78rem;color:var(--text-muted);margin:0.3rem 0 0.6rem">Downloads every learner, mark, payment, staff record and configuration — ideal for backups.</div>
            <button class="btn btn-outline btn-sm" onclick="FLC.exportDatabase()">${icon("download", 13)} Download Backup</button>
          </div>
          <div style="border:1px solid var(--border-color);border-radius:10px;padding:0.85rem">
            <strong style="font-size:0.87rem">Export Contact & Learner CSVs</strong>
            <div style="font-size:0.78rem;color:var(--text-muted);margin:0.3rem 0 0.6rem">Spreadsheet-ready exports for admissions, bursary and communication teams.</div>
            <div style="display:flex;gap:0.5rem;flex-wrap:wrap">
              <button class="btn btn-outline btn-sm" onclick="FLC.exportCsv('students')">${icon("download", 12)} Learners</button>
              <button class="btn btn-outline btn-sm" onclick="FLC.exportCsv('parents')">${icon("download", 12)} Parent Contacts</button>
              <button class="btn btn-outline btn-sm" onclick="FLC.exportCsv('payments')">${icon("download", 12)} Payment Ledger</button>
            </div>
          </div>
          <div style="border:1px solid var(--border-color);border-radius:10px;padding:0.85rem">
            <strong style="font-size:0.87rem">Import School Configuration (JSON)</strong>
            <div style="font-size:0.78rem;color:var(--text-muted);margin:0.3rem 0 0.6rem">Paste a previously exported backup to restore or migrate to another server.</div>
            <textarea class="textarea" id="import-json" rows="3" placeholder='{"systemConfig": {...}, "students": [...]}'></textarea>
            <button class="btn btn-outline btn-sm" style="margin-top:0.5rem" onclick="FLC.importDatabase()">${icon("refresh", 13)} Import & Replace</button>
          </div>
          <div style="border:1px solid var(--danger-bg);background:#fff5f5;border-radius:10px;padding:0.85rem">
            <strong style="font-size:0.87rem;color:var(--danger)">Danger Zone — Factory Reset</strong>
            <div style="font-size:0.78rem;color:var(--text-muted);margin:0.3rem 0 0.6rem">Restores the original FAITH LEARNING CENTRE seed data. All your custom learners, payments and settings will be lost.</div>
            <button class="btn btn-danger btn-sm" onclick="FLC.resetDatabase()">${icon("refresh", 13)} Reset to Default Seed</button>
          </div>
        </div>
      </div>
      <div class="card">
        <div class="card-header"><div class="card-title">${icon("shield")} Audit Trail — Every Configuration Change</div>
          <span class="badge badge-neutral">${State.db.auditLogs.length} entries</span></div>
        <div class="table-wrap" style="max-height:560px;overflow-y:auto">
          <table class="data-table">
            <thead><tr><th>Timestamp</th><th>Actor</th><th>Action</th><th>Module</th></tr></thead>
            <tbody>
              ${State.db.auditLogs.map((l) => `<tr>
                <td style="white-space:nowrap;font-size:0.78rem">${esc(l.timestamp)}</td>
                <td style="font-size:0.8rem">${esc(l.actor)}</td>
                <td style="font-size:0.8rem">${esc(l.action)}</td>
                <td><span class="badge badge-neutral">${esc(l.module)}</span></td>
              </tr>`).join("")}
            </tbody>
          </table>
        </div>
      </div>
    </div>`;
  }
  return "";
}

/* ------------------------------- Modals ----------------------------------- */
function openModal(title, bodyHtml, footerHtml, opts = {}) {
  document.getElementById("modal-root").innerHTML = `
    <div class="modal-backdrop" onclick="if(event.target===this) FLC.closeModal()">
      <div class="modal-box" style="${opts.wide ? "max-width:1050px" : ""}">
        <div class="modal-header">
          <h3 style="font-size:1.05rem;font-weight:800">${title}</h3>
          <button class="btn btn-outline btn-sm" onclick="FLC.closeModal()">${icon("x", 14)}</button>
        </div>
        <div class="modal-body">${bodyHtml}</div>
        ${footerHtml ? `<div class="modal-footer">${footerHtml}</div>` : ""}
      </div>
    </div>`;
}

function closeModal() {
  document.getElementById("modal-root").innerHTML = "";
}


/* ========================================================================== */
/*                         ACTIONS & PUBLIC API (FLC)                         */
/* ========================================================================== */
window.FLC = {
  /* ------- admissions enquiries ------- */
  updateEnquiryStatus,
  deleteEnquiry,
  parentLearner(id) {
    State.parentStudentId = id;
    render();
  },

  /* ------- navigation & session ------- */
  go(route) {
    State.route = route;
    State.subtab[route] = State.subtab[route] || null;
    render();
    window.scrollTo({ top: 0, behavior: "smooth" });
  },
  sub(page, tab) {
    State.subtab[page] = tab;
    if (State.route !== page) State.route = page;
    render();
    window.scrollTo({ top: 0, behavior: "smooth" });
  },
  _searchTimer: null,
  fSearch(page, key, value) {
    State.filters[page] = State.filters[page] || {};
    State.filters[page][key] = value;
    clearTimeout(FLC._searchTimer);
    FLC._searchTimer = setTimeout(() => {
      renderPage();
      const el = document.getElementById("students-search");
      if (el) { el.focus(); const v = el.value; el.value = ""; el.value = v; }
    }, 320);
  },
  signIn,
  signOut,
  changePassword,
  /* --- mobile navigation --- */
  toggleNav(force) {
    const open = typeof force === "boolean" ? force : !document.body.classList.contains("nav-open");
    document.body.classList.toggle("nav-open", open);
  },
  goLiveRun(id) {
    const check = goLiveChecks().find((c) => c.id === id);
    if (check) check.run();
  },
  /* --- command palette --- */
  openPalette() {
    State.palette = { open: true, query: "", index: 0 };
    renderPalette();
  },
  closePalette() {
    State.palette.open = false;
    renderPalette();
  },
  paletteType(value) {
    State.palette.query = value;
    State.palette.index = 0;
    renderPalette();
  },
  paletteHover(index) {
    State.palette.index = index;
    [...document.querySelectorAll(".palette-item")].forEach((el, n) => el.classList.toggle("active", n === index));
  },
  paletteKey(event) {
    const items = paletteItems(State.palette.query);
    if (event.key === "Escape") { FLC.closePalette(); return false; }
    if (event.key === "ArrowDown") { State.palette.index = Math.min(items.length - 1, State.palette.index + 1); renderPalette(); return false; }
    if (event.key === "ArrowUp") { State.palette.index = Math.max(0, State.palette.index - 1); renderPalette(); return false; }
    if (event.key === "Enter") { FLC.paletteRun(State.palette.index); return false; }
    return true;
  },
  paletteRun(index) {
    const items = paletteItems(State.palette.query);
    const item = items[index];
    FLC.closePalette();
    if (item) item.run();
  },
  /* --- devices, system status and backups --- */
  async loadSessions() {
    try {
      const data = await api("/api/auth/sessions");
      State.sessions = data.sessions || [];
      if (State.route === "help" && State.helpTab === "security") FLC.helpTab("security");
    } catch (e) {
      toast(e.message, "error");
    }
  },
  async loadSystemStatus() {
    try {
      State.systemStatus = await api("/api/system/status");
      if (State.route === "help" && State.helpTab === "security") FLC.helpTab("security");
    } catch (e) {
      /* non-fatal: the security tab simply omits the system panel */
    }
  },
  async takeBackup() {
    try {
      const data = await api("/api/system/backup", "POST", {});
      State.systemStatus = Object.assign({}, State.systemStatus, { lastBackup: data.lastBackup });
      if (data.auditLogs) State.db.auditLogs = data.auditLogs;
      toast(`Backup written: ${data.file} — copy data/backups off this server.`, "success");
      if (State.route === "help" && State.helpTab === "security") FLC.helpTab("security");
    } catch (e) {
      toast(e.message, "error");
    }
  },
  async revokeDevice(token) {
    try {
      const data = await api("/api/auth/sessions/revoke", "POST", { token });
      if (data.auditLogs) State.db.auditLogs = data.auditLogs;
      toast("That device has been signed out", "success");
      FLC.loadSessions();
    } catch (e) {
      toast(e.message, "error");
    }
  },
  async revokeOthers() {
    try {
      const data = await api("/api/auth/sessions/revoke", "POST", { others: true });
      if (data.auditLogs) State.db.auditLogs = data.auditLogs;
      toast("Every other device has been signed out", "success");
      FLC.loadSessions();
    } catch (e) {
      toast(e.message, "error");
    }
  },
  humanDuration(seconds) {
    const s2 = Number(seconds || 0);
    if (s2 < 60) return s2 + " seconds";
    if (s2 < 3600) return Math.round(s2 / 60) + " minutes";
    if (s2 < 86400) return Math.round(s2 / 3600) + " hours";
    return Math.round(s2 / 86400) + " days";
  },
  helpTab(tab) {
    // clearing the cached status only when the tab is opened afresh — otherwise the
    // loaders would re-trigger themselves every time they finished
    const opened = State.helpTab !== tab;
    State.helpTab = tab;
    if (tab === "security" && opened) State.securityStatus = null;
    FLC.go("help");
  },
  searchHelp(value) {
    State.helpQuery = value || "";
    const host = document.getElementById("page");
    const scroll = window.scrollY;
    if (State.route === "help" && State.helpTab === "articles") {
      const fresh = pageHelpCentre();
      const wrap = document.createElement("div");
      wrap.innerHTML = fresh;
      const next = wrap.querySelector("#page") || wrap.firstElementChild;
      if (next) host.innerHTML = next.innerHTML;
      const field = document.getElementById("help-search");
      if (field) {
        field.focus();
        field.setSelectionRange(field.value.length, field.value.length);
      }
      window.scrollTo(0, scroll);
    }
  },
  async loadSecurity() {
    try {
      const data = await api("/api/security/status");
      State.securityStatus = data;
      if (data.auditLogs) State.db.auditLogs = data.auditLogs;
      if (State.route === "help" && State.helpTab === "security") FLC.helpTab("security");
    } catch (e) {
      toast(e.message, "error");
    }
  },
  async resolveReset(id) {
    try {
      const data = await api(`/api/help/requests/${id}/resolve`, "POST", {});
      const requests = (State.db.passwordResetRequests || []).map((r) => (r.id === id ? data.request : r));
      State.db.passwordResetRequests = requests;
      if (data.auditLogs) State.db.auditLogs = data.auditLogs;
      toast(`Temporary password for ${data.request.email}: ${data.tempPassword}`, "success");
      FLC.helpTab("password");
    } catch (e) {
      toast(e.message, "error");
    }
  },
  async dismissReset(id) {
    try {
      const data = await api(`/api/help/requests/${id}/dismiss`, "POST", {});
      State.db.passwordResetRequests = data.requests;
      if (data.auditLogs) State.db.auditLogs = data.auditLogs;
      toast("Request closed", "success");
      FLC.helpTab("password");
    } catch (e) {
      toast(e.message, "error");
    }
  },
  async addArticle() {
    const title = (document.getElementById("help-new-title") || {}).value || "";
    const body = (document.getElementById("help-new-body") || {}).value || "";
    const category = (document.getElementById("help-new-cat") || {}).value || "ICT support";
    const tags = (document.getElementById("help-new-tags") || {}).value || "";
    if (!title.trim() || !body.trim()) return toast("An article needs a title and a body", "error");
    try {
      const data = await api("/api/help/articles", "POST", { title, body, category, tags });
      State.db.helpArticles = data.articles;
      if (data.auditLogs) State.db.auditLogs = data.auditLogs;
      toast("Help article published", "success");
      FLC.helpTab("articles");
    } catch (e) {
      toast(e.message, "error");
    }
  },
  async removeArticle(id) {
    if (!confirm("Remove this help article?")) return;
    try {
      const data = await api(`/api/help/articles/${id}`, "DELETE");
      State.db.helpArticles = data.articles;
      if (data.auditLogs) State.db.auditLogs = data.auditLogs;
      toast("Article removed", "success");
      FLC.helpTab("articles");
    } catch (e) {
      toast(e.message, "error");
    }
  },
  raiseIct() {
    const topic = (document.getElementById("ict-topic") || {}).value || "A question";
    const note = ((document.getElementById("ict-note") || {}).value || "").trim();
    toast(note ? `Sent to the Help Centre: ${topic} — ${note}` : `Sent to the Help Centre: ${topic}`, "success");
  },
  payChannelNote(label) {
    const host = document.getElementById("pay-channel-note");
    if (!host) return;
    const fc = State.db.systemConfig.financeConfig;
    const ch = (fc.paymentChannels || []).find((c) => c.label === label);
    host.textContent = ch ? ch.detail || "" : "";
    host.className = ch && ch.temporary ? "help-note warn-note" : "help-note";
  },
  addChannel() {
    const label = (document.getElementById("chn-new-label") || {}).value || "";
    const detail = (document.getElementById("chn-new-detail") || {}).value || "";
    if (!label.trim()) return toast("Give the channel a name first", "error");
    const list = State.db.systemConfig.financeConfig.paymentChannels || [];
    if (list.find((c) => c.label.toLowerCase() === label.trim().toLowerCase())) return toast("That channel already exists", "error");
    list.push({ id: "chan_" + Date.now().toString(36), label: label.trim(), kind: "custom", enabled: true, temporary: false, detail: detail.trim() });
    State.db.systemConfig.financeConfig.paymentChannels = list;
    FLC.sub("customizer", "finance");
    toast("Channel added — save to publish it", "success");
  },
  removeChannel(index) {
    const list = State.db.systemConfig.financeConfig.paymentChannels || [];
    const gone = list[index];
    if (!gone || !confirm(`Remove "${gone.label}" from the payment channels?`)) return;
    list.splice(index, 1);
    State.db.systemConfig.financeConfig.paymentChannels = list;
    FLC.sub("customizer", "finance");
    toast(`${gone.label} removed — save to publish`, "success");
  },
  async saveChannels() {
    const list = State.db.systemConfig.financeConfig.paymentChannels || [];
    const next = list.map((c, i) => ({
      ...c,
      detail: ((document.getElementById("chn-" + i) || {}).value || c.detail || "").trim(),
      enabled: Boolean((document.getElementById("chc-" + i) || {}).checked)
    }));
    try {
      const data = await api("/api/config/site", "PUT", { paymentChannels: next });
      State.db.systemConfig.financeConfig.paymentChannels = data.paymentChannels;
      if (data.auditLogs) State.db.auditLogs = data.auditLogs;
      toast("Payment channels saved", "success");
      FLC.sub("customizer", "finance");
    } catch (e) {
      toast(e.message, "error");
    }
  },
  /* The administrator picks the school's fonts from the website editing bar;
     the choice is stored on the server and applied to the website and the portals. */
  applyTypography(cfg) {
    const RUBIK = '"Rubik", "Segoe UI", system-ui, -apple-system, "Helvetica Neue", Arial, sans-serif';
    const presets = {
      rubik: { serif: RUBIK, sans: RUBIK },
      "rubik-tight": { serif: RUBIK, sans: RUBIK, tracking: "-0.02em" },
      "rubik-wide": { serif: RUBIK, sans: RUBIK, tracking: "0.02em" },
      "rubik-system": { serif: '"Rubik", "Segoe UI", Arial, sans-serif', sans: '"Rubik", "Segoe UI", Arial, sans-serif' }
    };
    const scales = { compact: "15px", normal: "16px", large: "17.5px" };
    const c = cfg || {};
    const preset = presets[c.preset] || presets.rubik;
    const root = document.documentElement;
    root.style.setProperty("--serif", preset.serif);
    root.style.setProperty("--sans", preset.sans);
    root.style.fontSize = scales[c.scale] || scales.normal;
    root.style.setProperty("--tracking", preset.tracking || "0");
    window.__flcTypography = { preset: c.preset || "rubik", scale: c.scale || "normal" };
  },
  setRole(role) {
    State.role = role;
    if (role === "parent") State.route = "dashboard";
    toast(`Switched to ${ROLES.find((r) => r.id === role).label} portal`, "success");
    render();
  },
  setParentStudent(id) {
    State.parentStudentId = id;
    render();
  },
  f(page, key, value) {
    State.filters[page] = State.filters[page] || {};
    if (key === "reset") {
      State.filters[page] = { ...State.filters[page] };
      Object.keys(State.filters[page]).forEach((k) => { if (typeof State.filters[page][k] === "string") State.filters[page][k] = ""; });
    } else {
      State.filters[page][key] = value;
    }
    const scrollY = window.scrollY;
    renderPage();
    window.scrollTo({ top: scrollY });
  },
  closeModal,
  async refresh() {
    try {
      State.db = await api("/api/bootstrap");
      render();
      toast("Synchronized with backend database", "success");
    } catch (e) {
      toast(e.message, "error");
    }
  },

  /* ---------------- attendance ---------------- */
  async saveAttendance() {
    const rows = document.querySelectorAll("#attendance-table tbody tr");
    const records = {};
    rows.forEach((row) => {
      const id = row.getAttribute("data-stu");
      records[id] = {
        status: row.querySelector('[data-field="status"]').value,
        timeIn: row.querySelector('[data-field="timeIn"]').value,
        note: row.querySelector('[data-field="note"]').value
      };
    });
    try {
      const res = await api("/api/attendance", "POST", { date: "2026-10-11", records, _actor: "Mr. Kelvin Mwangi (Class Teacher)" });
      syncFrom(res);
      toast("Daily attendance register saved successfully", "success");
      renderPage();
    } catch (e) {
      toast(e.message, "error");
    }
  },
  async sendAbsenceSms() {
    const att = State.db.attendanceRecords["2026-10-11"] || {};
    const flagged = Object.entries(att).filter(([, r]) => r.status === "Absent" || r.status === "Late");
    if (!flagged.length) return toast("No absent or late learners to report today", "info");
    try {
      const names = flagged.map(([id]) => {
        const s = State.db.students.find((x) => x.id === id);
        return s ? `${s.firstName} ${s.lastName}` : id;
      });
      const res = await api("/api/communications", "POST", {
        channel: "Targeted SMS Reminder",
        audience: "Guardians of flagged learners",
        title: "Daily Attendance Notification",
        message: `Dear Parent, our records show ${names.join("; ")} was flagged in today's register at Faith Learning Centre. Kindly contact the class teacher.`,
        recipientsCount: flagged.length,
        sender: "Attendance Desk"
      });
      syncFrom(res);
      toast(`Absence alerts dispatched to ${flagged.length} guardians`, "success");
      renderPage();
    } catch (e) {
      toast(e.message, "error");
    }
  },

  /* ---------------- markbook ---------------- */
  async saveMarkbook() {
    const cfg = State.db.systemConfig.academicConfig;
    const f = State.filters.markbook;
    const area = f.area;
    const updates = {};
    document.querySelectorAll("#markbook-table tbody tr").forEach((row) => {
      const id = row.getAttribute("data-stu");
      const cur = State.db.assessments[id] || {};
      const sba = Number(row.querySelector('[data-field="sba"]')?.value || 0);
      const exam = Number(row.querySelector('[data-field="exam"]')?.value || 0);
      const comment = row.querySelector('[data-field="comment"]')?.value || "";
      updates[id] = {
        ...cur,
        [area]: { ...(cur[area] || {}), sba, exam },
        [`${area}_comment`]: comment
      };
    });
    try {
      const res = await api("/api/assessments/bulk", "POST", {
        updates,
        subjectCode: area,
        grade: f.grade,
        _actor: State.role === "admin" ? "Administrator" : "Class Teacher"
      });
      syncFrom(res);
      toast("Markbook saved — report cards recomputed", "success");
      renderPage();
    } catch (e) {
      toast(e.message, "error");
    }
  },

  /* ---------------- students ---------------- */
  openStudentModal(id) {
    const s = id ? State.db.students.find((x) => x.id === id) : null;
    const cfg = State.db.systemConfig.academicConfig;
    const customFields = State.db.systemConfig.customFields.filter((c) => c.entity === "student" && c.active);
    const customInputs = customFields.map((c) => {
      const val = s ? ((s.customData || {})[c.key] || "") : "";
      if (c.type === "select") {
        return `<div class="form-group"><label>${esc(c.label)}</label><select class="select" data-custom="${c.key}">
          <option value="">— Select —</option>${c.options.map((o) => `<option ${val === o ? "selected" : ""}>${esc(o)}</option>`).join("")}</select></div>`;
      }
      return `<div class="form-group"><label>${esc(c.label)}</label><input class="input" data-custom="${c.key}" value="${esc(val)}" /></div>`;
    }).join("");

    openModal(
      s ? `Edit Learner — ${esc(s.firstName)} ${esc(s.lastName)}` : "Admit New Learner",
      `<div class="form-grid">
        <div class="form-group"><label>First Name</label><input class="input" id="st-firstName" value="${esc(s ? s.firstName : "")}" /></div>
        <div class="form-group"><label>Last Name</label><input class="input" id="st-lastName" value="${esc(s ? s.lastName : "")}" /></div>
        <div class="form-group"><label>Admission No</label><input class="input" id="st-admNo" value="${esc(s ? s.admNo : "")}" placeholder="Auto-generated if blank" /></div>
        <div class="form-group"><label>NEMIS UPI</label><input class="input" id="st-nemis" value="${esc(s ? s.nemisUpi : "")}" /></div>
        <div class="form-group"><label>Gender</label><select class="select" id="st-gender">
          ${["Female", "Male"].map((g) => `<option ${s && s.gender === g ? "selected" : ""}>${g}</option>`).join("")}</select></div>
        <div class="form-group"><label>Date of Birth</label><input type="date" class="input" id="st-dob" value="${esc(s ? s.dob : "2014-01-01")}" /></div>
        <div class="form-group"><label>Class / Grade</label><select class="select" id="st-grade">
          ${cfg.gradeLevels.map((g) => `<option ${s && s.grade === g ? "selected" : ""}>${esc(g)}</option>`).join("")}</select></div>
        <div class="form-group"><label>Stream / House</label><select class="select" id="st-stream">
          ${cfg.streams.map((g) => `<option ${s && s.stream === g ? "selected" : ""}>${esc(g)}</option>`).join("")}</select></div>
        <div class="form-group"><label>Boarding Status</label><select class="select" id="st-boarding">
          ${["Day", "Boarding"].map((g) => `<option ${s && s.boardingStatus === g ? "selected" : ""}>${g}</option>`).join("")}</select></div>
        <div class="form-group"><label>Dormitory House</label><select class="select" id="st-dorm">
          ${["N/A", ...State.db.boardingHouses.map((h) => h.name)].map((g) => `<option ${s && s.dormHouse === g ? "selected" : ""}>${esc(g)}</option>`).join("")}</select></div>
        <div class="form-group"><label>Transport Route</label><select class="select" id="st-transport">
          ${["None", ...State.db.transportRoutes.map((r) => r.routeName)].map((g) => `<option ${s && s.transportRoute === g ? "selected" : ""}>${esc(g)}</option>`).join("")}</select></div>
        <div class="form-group"><label>Transport Fee (per term)</label><input type="number" class="input" id="st-transportFee" value="${s ? s.transportFee : 0}" /></div>
        <div class="form-group"><label>Guardian Name</label><input class="input" id="st-guardian" value="${esc(s ? s.guardianName : "")}" /></div>
        <div class="form-group"><label>Relationship</label><select class="select" id="st-relation">
          ${["Father", "Mother", "Guardian", "Sponsor"].map((g) => `<option ${s && s.guardianRelation === g ? "selected" : ""}>${g}</option>`).join("")}</select></div>
        <div class="form-group"><label>Guardian Phone</label><input class="input" id="st-phone" value="${esc(s ? s.guardianPhone : "+254 ")}" /></div>
        <div class="form-group"><label>Guardian Email</label><input class="input" id="st-email" value="${esc(s ? s.guardianEmail : "")}" /></div>
        <div class="form-group"><label>Term Fee Billed (auto-filled from fee structure)</label><input type="number" class="input" id="st-billed" value="${s ? s.billedAmount : ""}" placeholder="Leave blank to auto-calculate" /></div>
        <div class="form-group"><label>Amount Paid to Date</label><input type="number" class="input" id="st-paid" value="${s ? s.paidAmount : 0}" /></div>
        ${customInputs}
      </div>
      <div style="margin-top:0.75rem;font-size:0.78rem;color:var(--text-muted)">
        ${customFields.length ? "Custom fields above are defined in the Backend Customization Zone → Custom Fields Builder." : "No custom fields configured yet."}
      </div>`,
      `<button class="btn btn-outline" onclick="FLC.closeModal()">Cancel</button>
       <button class="btn btn-primary" onclick="FLC.saveStudent('${s ? s.id : ""}')">${icon("check", 14)} ${s ? "Update Learner" : "Admit Learner"}</button>`,
      { wide: true }
    );
  },

  async saveStudent(id) {
    const val = (el) => document.getElementById(el)?.value;
    const custom = {};
    document.querySelectorAll("[data-custom]").forEach((el) => { custom[el.getAttribute("data-custom")] = el.value; });
    const payload = {
      firstName: val("st-firstName"),
      lastName: val("st-lastName"),
      admNo: val("st-admNo"),
      nemisUpi: val("st-nemis"),
      gender: val("st-gender"),
      dob: val("st-dob"),
      grade: val("st-grade"),
      stream: val("st-stream"),
      boardingStatus: val("st-boarding"),
      dormHouse: val("st-dorm"),
      transportRoute: val("st-transport"),
      transportFee: Number(val("st-transportFee") || 0),
      guardianName: val("st-guardian"),
      guardianRelation: val("st-relation"),
      guardianPhone: val("st-phone"),
      guardianEmail: val("st-email"),
      customData: custom
    };
    if (val("st-billed")) payload.billedAmount = Number(val("st-billed"));
    if (val("st-paid")) payload.paidAmount = Number(val("st-paid"));
    if (!payload.firstName) return toast("First name is required", "error");
    try {
      const res = id
        ? await api(`/api/students/${id}`, "PUT", payload)
        : await api("/api/students", "POST", payload);
      syncFrom(res);
      closeModal();
      toast(id ? "Learner record updated" : `Learner admitted — ${payload.firstName} ${payload.lastName}`, "success");
      renderPage();
    } catch (e) {
      toast(e.message, "error");
    }
  },

  viewStudent(id) {
    const s = State.db.students.find((x) => x.id === id);
    const a = studentAverage(s.id);
    const payments = State.db.payments.filter((p) => p.studentId === id);
    openModal(
      `Learner Profile — ${esc(s.firstName)} ${esc(s.lastName)}`,
      `<div class="grid-2">
        <div>
          <div class="table-wrap"><table class="data-table"><tbody>
            <tr><td>ADM No</td><td><strong>${esc(s.admNo)}</strong></td></tr>
            <tr><td>NEMIS UPI</td><td>${esc(s.nemisUpi)}</td></tr>
            <tr><td>KNEC Assessment No</td><td>${esc(s.assessmentNo)}</td></tr>
            <tr><td>Class & Stream</td><td>${esc(s.grade)} · ${esc(s.stream)}</td></tr>
            <tr><td>Boarding</td><td>${esc(s.boardingStatus)}${s.dormHouse !== "N/A" ? " · " + esc(s.dormHouse) : ""}</td></tr>
            <tr><td>Transport</td><td>${esc(s.transportRoute)}</td></tr>
            <tr><td>Guardian</td><td>${esc(s.guardianName)} (${esc(s.guardianRelation)})<br/>${esc(s.guardianPhone)}</td></tr>
            <tr><td>Attendance Rate</td><td><strong>${s.attendanceRate}%</strong></td></tr>
            <tr><td>Term Mean</td><td><strong>${a}%</strong> ${gradeBadge(a)}</td></tr>
          </tbody></table></div>
        </div>
        <div>
          <div class="kpi-label" style="margin-bottom:0.5rem">Fee Position</div>
          <div class="grid-3" style="margin-bottom:0.85rem">
            <div><div class="kpi-label">Billed</div><strong>${money(s.billedAmount)}</strong></div>
            <div><div class="kpi-label">Paid</div><strong style="color:var(--success)">${money(s.paidAmount)}</strong></div>
            <div><div class="kpi-label">Balance</div><strong style="color:${s.balance > 0 ? "var(--danger)" : "var(--success)"}">${money(s.balance)}</strong></div>
          </div>
          <div class="kpi-label" style="margin-bottom:0.5rem">Payment History (${payments.length})</div>
          <div class="table-wrap"><table class="data-table">
            <thead><tr><th>Receipt</th><th>Date</th><th style="text-align:right">Amount</th></tr></thead>
            <tbody>${payments.map((p) => `<tr><td>${esc(p.receiptNo)}</td><td>${esc(p.date)}</td><td style="text-align:right">${money(p.amount)}</td></tr>`).join("") || `<tr><td colspan="3" style="color:var(--text-muted)">No payments yet</td></tr>`}</tbody>
          </table></div>
        </div>
      </div>`,
      `<button class="btn btn-outline" onclick="FLC.closeModal()">Close</button>
       <button class="btn btn-outline" onclick="FLC.openStudentModal('${s.id}')">${icon("edit", 13)} Edit</button>
       <button class="btn btn-success" onclick="FLC.closeModal();FLC.openPaymentModal('${s.id}')">${icon("wallet", 13)} Collect Fee</button>
       <button class="btn btn-primary" onclick="FLC.closeModal();FLC.openReportCard('${s.id}')">${icon("print", 13)} Report Card</button>`,
      { wide: true }
    );
  },

  async removeStudent(id) {
    const s = State.db.students.find((x) => x.id === id);
    if (!confirm(`Remove ${s.firstName} ${s.lastName} (${s.admNo}) from the register?\n\nThis cannot be undone.`)) return;
    try {
      const res = await api(`/api/students/${id}`, "DELETE");
      syncFrom(res);
      toast("Learner record removed", "success");
      renderPage();
    } catch (e) {
      toast(e.message, "error");
    }
  },

  /* ---------------- finance ---------------- */
  openPaymentModal(studentId) {
    const students = State.db.students;
    const fc = State.db.systemConfig.financeConfig;
    openModal(
      `${icon("wallet", 16)} Record Fee Payment (M-Pesa / Bank / Cash)`,
      `<div class="card" style="background:var(--primary-light);border:none;margin-bottom:1rem">
        <div style="font-size:0.84rem"><strong>School Paybill:</strong> ${esc(fc.mpesaPaybill)} &nbsp;·&nbsp; <strong>Account format:</strong> ${esc(fc.mpesaAccountPrefix)}-[ADM NO] &nbsp;·&nbsp; <strong>Bank:</strong> ${esc(fc.bankName)}</div>
      </div>
      <div class="form-grid">
        <div class="form-group" style="grid-column:1/-1"><label>Learner</label>
          <select class="select" id="pay-student">
            ${students.map((s) => `<option value="${s.id}" ${s.id === studentId ? "selected" : ""}>${esc(s.firstName)} ${esc(s.lastName)} — ${esc(s.grade)} — ${esc(s.admNo)} (Balance ${money(s.balance)})</option>`).join("")}
          </select></div>
        <div class="form-group"><label>Amount (${esc(fc.currency)})</label><input type="number" class="input" id="pay-amount" placeholder="e.g. 15000" /></div>
        <div class="form-group"><label>Payment Method</label>
          <select class="select" id="pay-method" onchange="FLC.payChannelNote(this.value)">
            ${(fc.paymentChannels || []).filter((c) => c.enabled).map((c) => `<option value="${esc(c.label)}">${esc(c.label)}${c.temporary ? " (temporary)" : ""}</option>`).join("")}
            <option>M-Pesa STK Push</option><option>Bank Transfer (EFT)</option><option>Cheque</option>
          </select>
          <div id="pay-channel-note" class="help-note" style="margin-top:0.35rem">${esc((fc.paymentChannels || [])[0] ? (fc.paymentChannels[0].detail || "") : "")}</div></div>
        <div class="form-group"><label>Transaction Ref / Code</label><input class="input" id="pay-ref" placeholder="Auto-generated if blank" /></div>
        <div class="form-group"><label>Paid By (Name & Phone)</label><input class="input" id="pay-paidBy" placeholder="e.g. Guardian name +254…" /></div>
        <div class="form-group" style="grid-column:1/-1"><label>Votehead / Purpose</label><input class="input" id="pay-votehead" value="${esc(State.db.systemConfig.academicConfig.currentTerm)} Tuition & School Fees" /></div>
      </div>
      <div style="margin-top:0.9rem;display:flex;gap:0.6rem;flex-wrap:wrap">
        ${[5000, 10000, 20000].map((amt) => `<button class="btn btn-outline btn-sm" onclick="document.getElementById('pay-amount').value=${amt}">Quick ${money(amt)}</button>`).join("")}
        <button class="btn btn-outline btn-sm" onclick="FLC.fillFullBalance()">Settle Full Balance</button>
      </div>`,
      `<button class="btn btn-outline" onclick="FLC.closeModal()">Cancel</button>
       <button class="btn btn-success" onclick="FLC.savePayment()">${icon("check", 14)} Receipt Payment & Print</button>`,
      { wide: true }
    );
  },
  fillFullBalance() {
    const id = document.getElementById("pay-student").value;
    const s = State.db.students.find((x) => x.id === id);
    document.getElementById("pay-amount").value = s.balance || 0;
  },
  async savePayment() {
    const studentId = document.getElementById("pay-student").value;
    const amount = Number(document.getElementById("pay-amount").value);
    if (!amount || amount <= 0) return toast("Enter a valid payment amount", "error");
    try {
      const res = await api("/api/payments", "POST", {
        studentId,
        amount,
        method: document.getElementById("pay-method").value,
        reference: document.getElementById("pay-ref").value,
        paidBy: document.getElementById("pay-paidBy").value,
        votehead: document.getElementById("pay-votehead").value,
        recordedBy: State.role === "finance" ? State.db.systemConfig.branding.bursarName : State.db.systemConfig.branding.bursarName
      });
      syncFrom(res);
      const p = res.payment;
      const sms = State.db.systemConfig.financeConfig.autoSmsOnPayment
        ? `<div style="margin-top:0.85rem;padding:0.75rem;background:var(--success-bg);border-radius:9px;font-size:0.82rem;color:var(--success)">
             📩 <strong>Auto-SMS sent to guardian:</strong> "Dear Parent, we have received ${money(p.amount)} for ${esc(p.studentName)} (Ref ${esc(p.reference)}). Receipt ${esc(p.receiptNo)}. Fee balance now ${money(res.student.balance)}. Thank you — Faith Learning Centre."</div>`
        : `<div style="margin-top:0.85rem;font-size:0.82rem;color:var(--text-muted)">Auto-SMS is disabled in the Backend Customization Zone → Finance Gateway.</div>`;
      openModal(
        `${icon("check", 16)} Official School Fees Receipt`,
        receiptHtml(p, res.student) + sms,
        `<button class="btn btn-outline" onclick="FLC.closeModal()">Close</button>
         <button class="btn btn-primary" onclick="window.print()">${icon("print", 14)} Print Receipt</button>`,
        { wide: true }
      );
      toast(`Payment of ${money(p.amount)} receipted successfully`, "success");
    } catch (e) {
      toast(e.message, "error");
    }
  },
  openReceipt(paymentId) {
    const p = State.db.payments.find((x) => x.id === paymentId);
    const s = State.db.students.find((x) => x.id === p.studentId) || {};
    openModal(
      `${icon("wallet", 16)} Official School Fees Receipt`,
      receiptHtml(p, s),
      `<button class="btn btn-outline" onclick="FLC.closeModal()">Close</button>
       <button class="btn btn-primary" onclick="window.print()">${icon("print", 14)} Print Receipt</button>`,
      { wide: true }
    );
  },
  async sendFeeReminders() {
    const debtors = State.db.students.filter((s) => s.balance > 0);
    if (!debtors.length) return toast("No outstanding fee balances", "info");
    try {
      const res = await api("/api/communications", "POST", {
        channel: "Targeted SMS Reminder",
        audience: "Parents with fee arrears",
        title: "Term Fee Balance Reminder",
        message: `Dear Guardian, kindly clear your child's outstanding ${State.db.systemConfig.academicConfig.currentTerm} fee balance via M-Pesa Paybill ${State.db.systemConfig.financeConfig.mpesaPaybill}, Account ${State.db.systemConfig.financeConfig.mpesaAccountPrefix}-[ADM NO]. Thank you — Faith Learning Centre.`,
        recipientsCount: debtors.length,
        sender: State.db.systemConfig.branding.bursarName
      });
      syncFrom(res);
      toast(`Fee reminders sent to ${debtors.length} guardians`, "success");
      renderPage();
    } catch (e) {
      toast(e.message, "error");
    }
  },
  openExpenseModal() {
    openModal(
      `${icon("layers", 16)} Record School Expenditure`,
      `<div class="form-grid">
        <div class="form-group"><label>Date</label><input type="date" class="input" id="exp-date" value="2026-10-11" /></div>
        <div class="form-group"><label>Category</label>
          <select class="select" id="exp-category">
            <option>Staff Payroll & Statutory</option><option>Kitchen & Boarding Supplies</option>
            <option>CBC Learning & Lab Materials</option><option>Transport & Fleet Fuel</option>
            <option>Utilities & Internet</option><option>Repairs & Maintenance</option>
            <option>Sports & Co-Curricular</option><option>Administration & Stationery</option>
          </select></div>
        <div class="form-group" style="grid-column:1/-1"><label>Description</label><input class="input" id="exp-desc" placeholder="What was purchased?" /></div>
        <div class="form-group"><label>Amount (KES)</label><input type="number" class="input" id="exp-amount" /></div>
        <div class="form-group"><label>Vendor / Supplier</label><input class="input" id="exp-vendor" /></div>
      </div>`,
      `<button class="btn btn-outline" onclick="FLC.closeModal()">Cancel</button>
       <button class="btn btn-primary" onclick="FLC.saveExpense()">${icon("check", 14)} Record Expense</button>`
    );
  },
  async saveExpense() {
    const payload = {
      date: document.getElementById("exp-date").value,
      category: document.getElementById("exp-category").value,
      description: document.getElementById("exp-desc").value,
      amount: Number(document.getElementById("exp-amount").value),
      vendor: document.getElementById("exp-vendor").value
    };
    if (!payload.amount) return toast("Enter the expense amount", "error");
    try {
      const res = await api("/api/expenses", "POST", payload);
      syncFrom(res);
      closeModal();
      toast("Expenditure recorded", "success");
      renderPage();
    } catch (e) {
      toast(e.message, "error");
    }
  },

  /* ---------------- report cards ---------------- */
  openReportCard(studentId) {
    const s = State.db.students.find((x) => x.id === studentId);
    const fc = State.db.systemConfig.financeConfig;
    if (fc.lockReportCardOnArrears && s.balance > fc.lockReportCardThreshold) {
      return toast(`Report card withheld — outstanding balance ${money(s.balance)} exceeds ${money(fc.lockReportCardThreshold)}`, "error");
    }
    openModal(
      `${icon("print", 16)} Official Report Card — ${esc(s.firstName)} ${esc(s.lastName)}`,
      reportCardHtml(s),
      `<button class="btn btn-outline" onclick="FLC.closeModal()">Close</button>
       <button class="btn btn-outline" onclick="FLC.go('reportcards');FLC.closeModal()">Ranking View</button>
       <button class="btn btn-primary" onclick="window.print()">${icon("print", 14)} Print Report Card</button>`,
      { wide: true }
    );
  },
  printAllReportCards() {
    const fc = State.db.systemConfig.financeConfig;
    const allowed = State.db.students.filter((s) => !(fc.lockReportCardOnArrears && s.balance > fc.lockReportCardThreshold));
    if (!allowed.length) return toast("No report cards are eligible for printing", "error");
    openModal(
      `${icon("print", 16)} Batch Report Cards — ${allowed.length} learners`,
      allowed.map((s) => `<div style="page-break-after:always;margin-bottom:1.5rem">${reportCardHtml(s)}</div>`).join(""),
      `<button class="btn btn-outline" onclick="FLC.closeModal()">Close</button>
       <button class="btn btn-primary" onclick="window.print()">${icon("print", 14)} Print All ${allowed.length}</button>`,
      { wide: true }
    );
  },

  /* ---------------- staff, library, logistics ---------------- */
  openStaffModal() {
    const cfg = State.db.systemConfig.academicConfig;
    const staffCustom = State.db.systemConfig.customFields.filter((c) => c.entity === "staff" && c.active);
    openModal(
      `${icon("users", 16)} Add Staff Member`,
      `<div class="form-grid">
        <div class="form-group"><label>Full Name</label><input class="input" id="sf-name" placeholder="e.g. Mr. John Doe" /></div>
        <div class="form-group"><label>TSC / Registration No</label><input class="input" id="sf-tsc" /></div>
        <div class="form-group"><label>Role</label><input class="input" id="sf-role" placeholder="e.g. Subject Teacher" /></div>
        <div class="form-group"><label>Department</label><input class="input" id="sf-dept" value="Academics" /></div>
        <div class="form-group"><label>Class Assigned</label><select class="select" id="sf-class">
          ${cfg.gradeLevels.map((g) => `<option>${esc(g)}</option>`).join("")}</select></div>
        <div class="form-group"><label>Subjects (comma separated)</label><input class="input" id="sf-subjects" placeholder="Mathematics, Integrated Science" /></div>
        <div class="form-group"><label>Phone</label><input class="input" id="sf-phone" value="+254 " /></div>
        <div class="form-group"><label>Email</label><input class="input" id="sf-email" /></div>
        <div class="form-group"><label>Qualification</label><input class="input" id="sf-qual" placeholder="B.Ed (Science)" /></div>
        <div class="form-group"><label>Gross Monthly Salary (KES)</label><input type="number" class="input" id="sf-salary" value="60000" /></div>
        ${staffCustom.map((c) => c.type === "select"
          ? `<div class="form-group"><label>${esc(c.label)}</label><select class="select" data-scustom="${c.key}">${c.options.map((o) => `<option>${esc(o)}</option>`).join("")}</select></div>`
          : `<div class="form-group"><label>${esc(c.label)}</label><input class="input" data-scustom="${c.key}" /></div>`).join("")}
      </div>`,
      `<button class="btn btn-outline" onclick="FLC.closeModal()">Cancel</button>
       <button class="btn btn-primary" onclick="FLC.saveStaff()">${icon("check", 14)} Add to Staff Directory</button>`,
      { wide: true }
    );
  },
  async saveStaff() {
    const custom = {};
    document.querySelectorAll("[data-scustom]").forEach((el) => { custom[el.getAttribute("data-scustom")] = el.value; });
    const payload = {
      name: document.getElementById("sf-name").value,
      tscNo: document.getElementById("sf-tsc").value,
      role: document.getElementById("sf-role").value,
      department: document.getElementById("sf-dept").value,
      classAssigned: document.getElementById("sf-class").value,
      subjects: document.getElementById("sf-subjects").value,
      phone: document.getElementById("sf-phone").value,
      email: document.getElementById("sf-email").value,
      qualification: document.getElementById("sf-qual").value,
      grossSalary: Number(document.getElementById("sf-salary").value),
      customData: custom
    };
    if (!payload.name) return toast("Staff name is required", "error");
    try {
      const res = await api("/api/staff", "POST", payload);
      syncFrom(res);
      closeModal();
      toast(`${payload.name} added to staff directory`, "success");
      renderPage();
    } catch (e) {
      toast(e.message, "error");
    }
  },
  openBookModal() {
    openModal(
      `${icon("book", 16)} Add Library Title`,
      `<div class="form-grid">
        <div class="form-group" style="grid-column:1/-1"><label>Book Title</label><input class="input" id="bk-title" /></div>
        <div class="form-group"><label>ISBN / KICD Code</label><input class="input" id="bk-isbn" /></div>
        <div class="form-group"><label>Category</label><input class="input" id="bk-cat" placeholder="STEM / JSS" /></div>
        <div class="form-group"><label>Publisher / Author</label><input class="input" id="bk-author" /></div>
        <div class="form-group"><label>Total Copies</label><input type="number" class="input" id="bk-copies" value="50" /></div>
      </div>`,
      `<button class="btn btn-outline" onclick="FLC.closeModal()">Cancel</button>
       <button class="btn btn-primary" onclick="FLC.saveBook()">${icon("check", 14)} Add to Inventory</button>`
    );
  },
  async saveBook() {
    const total = Number(document.getElementById("bk-copies").value) || 1;
    const payload = {
      title: document.getElementById("bk-title").value,
      isbn: document.getElementById("bk-isbn").value,
      category: document.getElementById("bk-cat").value,
      author: document.getElementById("bk-author").value,
      totalCopies: total,
      availableCopies: total,
      borrowedBy: "—",
      dueDate: "—"
    };
    if (!payload.title) return toast("Book title is required", "error");
    try {
      const res = await api("/api/operations/libraryBooks", "POST", payload);
      syncFrom(res);
      closeModal();
      toast("Library title added", "success");
      renderPage();
    } catch (e) {
      toast(e.message, "error");
    }
  },
  async sendOverdueSms() {
    const overdue = State.db.libraryBooks.filter((b) => new Date(b.dueDate) < new Date("2026-10-11"));
    if (!overdue.length) return toast("No overdue books to follow up", "info");
    try {
      const res = await api("/api/communications", "POST", {
        channel: "Targeted SMS Reminder",
        audience: "Guardians with overdue library books",
        title: "Library Book Return Reminder",
        message: `Dear Parent, kindly remind your child to return overdue library books at Faith Learning Centre library. ${overdue.map((b) => b.title.split(" ").slice(0, 4).join(" ")).join("; ")}. Thank you.`,
        recipientsCount: overdue.length,
        sender: "School Librarian"
      });
      syncFrom(res);
      toast(`Overdue reminders dispatched for ${overdue.length} titles`, "success");
      renderPage();
    } catch (e) {
      toast(e.message, "error");
    }
  },
  openMeritModal() {
    openModal(
      `${icon("award", 16)} Record Merit, Talent or Guidance Entry`,
      `<div class="form-grid">
        <div class="form-group" style="grid-column:1/-1"><label>Learner</label>
          <select class="select" id="mt-student">${State.db.students.map((s) => `<option value="${s.id}">${esc(s.firstName)} ${esc(s.lastName)} — ${esc(s.grade)}</option>`).join("")}</select></div>
        <div class="form-group"><label>Entry Type</label>
          <select class="select" id="mt-type"><option>Merit / Award</option><option>Guidance & Counselling</option><option>Discipline Record</option></select></div>
        <div class="form-group"><label>Category</label>
          <select class="select" id="mt-category">
            <option>STEM & Robotics Innovation</option><option>Christian Leadership & Integrity</option><option>Public Speaking & Drama</option>
            <option>Sports Excellence</option><option>Community Service Learning (CSL)</option><option>Academic Follow-Up</option><option>Behaviour & Conduct</option>
          </select></div>
        <div class="form-group"><label>Points</label><input class="input" id="mt-points" value="+10" /></div>
        <div class="form-group"><label>Date</label><input type="date" class="input" id="mt-date" value="2026-10-11" /></div>
        <div class="form-group" style="grid-column:1/-1"><label>Description</label><textarea class="textarea" id="mt-desc" rows="3"></textarea></div>
      </div>`,
      `<button class="btn btn-outline" onclick="FLC.closeModal()">Cancel</button>
       <button class="btn btn-primary" onclick="FLC.saveMerit()">${icon("check", 14)} Save Entry</button>`
    );
  },
  async saveMerit() {
    const stuId = document.getElementById("mt-student").value;
    const s = State.db.students.find((x) => x.id === stuId);
    const payload = {
      date: document.getElementById("mt-date").value,
      studentId: stuId,
      studentName: `${s.firstName} ${s.lastName}`,
      grade: s.grade,
      type: document.getElementById("mt-type").value,
      category: document.getElementById("mt-category").value,
      points: document.getElementById("mt-points").value,
      description: document.getElementById("mt-desc").value,
      recordedBy: State.role === "admin" ? State.db.systemConfig.branding.principalName : "Class Teacher"
    };
    try {
      const res = await api("/api/operations/disciplineMerits", "POST", payload);
      syncFrom(res);
      closeModal();
      toast("Character record saved", "success");
      renderPage();
    } catch (e) {
      toast(e.message, "error");
    }
  },
  openTransportModal() {
    openModal(
      `${icon("bus", 16)} Add Transport Route & Vehicle`,
      `<div class="form-grid">
        <div class="form-group" style="grid-column:1/-1"><label>Route Name</label><input class="input" id="tr-name" placeholder="Route E — Rongai / Ongata Rongai" /></div>
        <div class="form-group"><label>Vehicle Registration</label><input class="input" id="tr-vehicle" placeholder="KDA 123X (Bus 45-Seater)" /></div>
        <div class="form-group"><label>Driver Name</label><input class="input" id="tr-driver" /></div>
        <div class="form-group"><label>Driver Phone</label><input class="input" id="tr-phone" value="+254 " /></div>
        <div class="form-group"><label>Assistant / Matron</label><input class="input" id="tr-assistant" /></div>
        <div class="form-group"><label>Term Fee (KES)</label><input type="number" class="input" id="tr-fee" value="6000" /></div>
        <div class="form-group"><label>Seat Capacity</label><input type="number" class="input" id="tr-capacity" value="45" /></div>
        <div class="form-group"><label>Assigned Students</label><input type="number" class="input" id="tr-assigned" value="0" /></div>
      </div>`,
      `<button class="btn btn-outline" onclick="FLC.closeModal()">Cancel</button>
       <button class="btn btn-primary" onclick="FLC.saveTransport()">${icon("check", 14)} Add Route</button>`
    );
  },
  async saveTransport() {
    const payload = {
      routeName: document.getElementById("tr-name").value,
      vehicleReg: document.getElementById("tr-vehicle").value,
      driverName: document.getElementById("tr-driver").value,
      driverPhone: document.getElementById("tr-phone").value,
      assistant: document.getElementById("tr-assistant").value,
      termFee: Number(document.getElementById("tr-fee").value),
      capacity: Number(document.getElementById("tr-capacity").value),
      assignedStudents: Number(document.getElementById("tr-assigned").value),
      status: "On Route / Active"
    };
    if (!payload.routeName) return toast("Route name is required", "error");
    try {
      const res = await api("/api/operations/transportRoutes", "POST", payload);
      syncFrom(res);
      closeModal();
      toast("Transport route added", "success");
      renderPage();
    } catch (e) {
      toast(e.message, "error");
    }
  },
  viewRouteRiders(routeId) {
    const r = State.db.transportRoutes.find((x) => x.id === routeId);
    const riders = State.db.students.filter((s) => s.transportRoute === r.routeName);
    openModal(
      `${icon("bus", 16)} Pickup Register — ${esc(r.routeName)}`,
      `<div class="grid-3" style="margin-bottom:1rem">
        <div><div class="kpi-label">Vehicle</div><strong>${esc(r.vehicleReg)}</strong></div>
        <div><div class="kpi-label">Driver</div><strong>${esc(r.driverName)}</strong> — ${esc(r.driverPhone)}</div>
        <div><div class="kpi-label">Assistant</div><strong>${esc(r.assistant)}</strong></div>
      </div>
      <div class="table-wrap"><table class="data-table">
        <thead><tr><th>#</th><th>Learner</th><th>Class</th><th>Guardian Contact</th><th style="text-align:right">Term Fee</th></tr></thead>
        <tbody>${riders.map((s, i) => `<tr><td>${i + 1}</td><td><strong>${esc(s.firstName)} ${esc(s.lastName)}</strong></td><td>${esc(s.grade)}</td><td>${esc(s.guardianPhone)}</td><td style="text-align:right">${money(s.transportFee)}</td></tr>`).join("") || `<tr><td colspan="5" style="text-align:center;color:var(--text-muted)">No learners assigned to this route yet.</td></tr>`}</tbody>
      </table></div>`,
      `<button class="btn btn-outline" onclick="FLC.closeModal()">Close</button>
       <button class="btn btn-primary" onclick="window.print()">${icon("print", 14)} Print Pickup Register</button>`,
      { wide: true }
    );
  },
  editTimetableModal() {
    const days = State.db.timetable;
    openModal(
      `${icon("clock", 16)} Edit Master Timetable Slot`,
      `<div class="form-grid">
        <div class="form-group"><label>Day</label><select class="select" id="tt-day">
          ${days.map((d) => `<option value="${d.id}">${esc(d.day)}</option>`).join("")}</select></div>
        <div class="form-group"><label>Slot</label><select class="select" id="tt-slot"></select></div>
        <div class="form-group"><label>Subject / Activity</label><input class="input" id="tt-subject" /></div>
        <div class="form-group"><label>Teacher</label><input class="input" id="tt-teacher" /></div>
        <div class="form-group"><label>Room / Facility</label><input class="input" id="tt-room" /></div>
        <div class="form-group"><label>Time</label><input class="input" id="tt-time" /></div>
      </div>`,
      `<button class="btn btn-outline" onclick="FLC.closeModal()">Cancel</button>
       <button class="btn btn-primary" onclick="FLC.saveTimetableSlot()">${icon("check", 14)} Save Slot</button>`
    );
    const fill = () => {
      const day = State.db.timetable.find((d) => d.id === document.getElementById("tt-day").value);
      const slotSel = document.getElementById("tt-slot");
      slotSel.innerHTML = day.slots.map((s, i) => `<option value="${i}">${esc(s.time)} — ${esc(s.subject)}</option>`).join("");
      const load = () => {
        const sl = day.slots[Number(slotSel.value)];
        document.getElementById("tt-subject").value = sl.subject;
        document.getElementById("tt-teacher").value = sl.teacher;
        document.getElementById("tt-room").value = sl.room;
        document.getElementById("tt-time").value = sl.time;
      };
      slotSel.onchange = load;
      load();
    };
    document.getElementById("tt-day").onchange = fill;
    fill();
  },
  async saveTimetableSlot() {
    const dayId = document.getElementById("tt-day").value;
    const idx = Number(document.getElementById("tt-slot").value);
    const day = State.db.timetable.find((d) => d.id === dayId);
    const slots = day.slots.slice();
    slots[idx] = {
      time: document.getElementById("tt-time").value,
      subject: document.getElementById("tt-subject").value,
      teacher: document.getElementById("tt-teacher").value,
      room: document.getElementById("tt-room").value
    };
    try {
      const res = await api(`/api/timetable/${dayId}`, "PUT", { slots });
      syncFrom(res);
      closeModal();
      toast("Timetable slot updated", "success");
      renderPage();
    } catch (e) {
      toast(e.message, "error");
    }
  },

  /* ---------------- communications ---------------- */
  previewSms() {
    const msg = document.getElementById("comm-message").value || "Dear Parent, …";
    const len = msg.length;
    const parts = Math.ceil(len / 160) || 1;
    document.getElementById("sms-preview").innerHTML = `
      <div style="margin-top:0.9rem;border:1px dashed var(--border-color);border-radius:10px;padding:0.85rem;background:#ffffff">
        <div class="kpi-label" style="margin-bottom:0.4rem">SMS Preview</div>
        <div style="font-size:0.84rem">"${esc(msg)}"</div>
        <div style="font-size:0.75rem;color:var(--text-muted);margin-top:0.5rem">${len} characters · ${parts} SMS part(s) per recipient · Sender ID: ${esc(State.db.systemConfig.financeConfig.smsSenderId)}</div>
      </div>`;
  },
  async sendCommunication() {
    const audienceSel = document.getElementById("comm-audience");
    const audienceLabel = audienceSel.options[audienceSel.selectedIndex].text;
    const title = document.getElementById("comm-title").value;
    const message = document.getElementById("comm-message").value;
    if (!title || !message) return toast("Enter both a title and message", "error");
    const estimated = audienceSel.value === "all" ? State.db.students.length : Number((audienceLabel.match(/\((\d+)\)/) || [0, State.db.students.length])[1]);
    try {
      const res = await api("/api/communications", "POST", {
        channel: document.getElementById("comm-channel").value,
        audience: audienceLabel,
        title,
        message,
        recipientsCount: estimated,
        sender: State.role === "finance" ? State.db.systemConfig.branding.bursarName : State.db.systemConfig.branding.principalName
      });
      syncFrom(res);
      toast(`Broadcast dispatched to ${estimated} recipients`, "success");
      renderPage();
    } catch (e) {
      toast(e.message, "error");
    }
  },

  /* ---------------- backend customization zone ---------------- */
  collect(prefix, keys) {
    const out = {};
    keys.forEach((k) => {
      const el = document.getElementById(`${prefix}-${k}`);
      if (el) out[k] = el.type === "number" ? Number(el.value) : el.value;
    });
    return out;
  },
  previewBranding() {
    const name = document.getElementById("cf-schoolName").value;
    const prev = document.getElementById("prev-name");
    if (prev) prev.textContent = name;
  },
  applyPreset(primary, accent, sidebar) {
    document.getElementById("cf-primaryColor").value = primary;
    document.getElementById("cf-accentColor").value = accent;
    document.getElementById("cf-sidebarTheme").value = sidebar;
    toast("Preset selected — press Save Identity & Theme to apply", "info");
  },
  async saveHomeDesign() {
    const id = String((document.getElementById("cf-homeDesign") || {}).value || "2");
    try {
      const res = await api("/api/config/home-design", "PUT", {
        design: id,
        _actor: State.db.systemConfig.branding.principalName + " (Admin)"
      });
      State.db.systemConfig.branding.homeDesign = res.homeDesign;
      toast(`Home page design ${res.homeDesign} (${res.designName}) is now live on the school website.`, "success");
      render();
    } catch (e) { toast(e.message, "error"); }
  },
  async saveBranding() {
    const payload = this.collect("cf", ["schoolName", "shortName", "motto", "vision", "mission", "knecCode", "nemisCode",
      "regNumber", "address", "phone", "email", "website", "principalName", "bursarName", "receiptFooter",
      "reportCardFooter", "primaryColor", "accentColor", "sidebarTheme", "uiDensity", "crestStyle"]);
    payload._actor = State.db.systemConfig.branding.principalName + " (Admin)";
    try {
      const res = await api("/api/config/branding", "PUT", payload);
      syncFrom(res);
      render();
      toast("School identity & theme saved — applied system-wide", "success");
    } catch (e) {
      toast(e.message, "error");
    }
  },
  async toggleModule(key, enabled) {
    const modules = { [key]: { enabled } };
    try {
      const res = await api("/api/config/modules", "PUT", { modules, _actor: "Super Admin" });
      syncFrom(res);
      toast(`${modules[key] ? key : key} module ${enabled ? "enabled" : "disabled"}`, enabled ? "success" : "info");
      render();
    } catch (e) {
      toast(e.message, "error");
    }
  },
  async toggleAllModules(enabled) {
    const modules = {};
    Object.keys(State.db.systemConfig.modules).forEach((k) => { modules[k] = { enabled }; });
    try {
      const res = await api("/api/config/modules", "PUT", { modules, _actor: "Super Admin" });
      syncFrom(res);
      toast(`All modules ${enabled ? "enabled" : "disabled"}`, enabled ? "success" : "info");
      render();
    } catch (e) {
      toast(e.message, "error");
    }
  },
  async saveAcademic() {
    const cfg = State.db.systemConfig.academicConfig;
    const newActive = document.getElementById("ac-activeExam").value;
    const payload = {
      currentYear: document.getElementById("ac-year").value,
      currentTerm: document.getElementById("ac-term").value,
      termStartDate: document.getElementById("ac-start").value,
      termEndDate: document.getElementById("ac-end").value,
      nextTermOpening: document.getElementById("ac-next").value,
      gradingMode: document.getElementById("ac-mode").value,
      sbaWeight: Number(document.getElementById("ac-sba").value),
      examWeight: Number(document.getElementById("ac-exam").value),
      activeExamType: newActive,
      examTypes: cfg.examTypes.includes(newActive) ? cfg.examTypes : [...cfg.examTypes, newActive]
    };
    try {
      const res = await api("/api/config/academic", "PUT", payload);
      syncFrom(res);
      render();
      toast("Academic engine updated", "success");
    } catch (e) {
      toast(e.message, "error");
    }
  },
  async addExamType() {
    const val = document.getElementById("ac-newExam").value.trim();
    if (!val) return;
    const cfg = State.db.systemConfig.academicConfig;
    try {
      const res = await api("/api/config/academic", "PUT", { examTypes: [...cfg.examTypes, val], _actor: "Super Admin" });
      syncFrom(res);
      toast(`Assessment type "${val}" added`, "success");
      this.sub("customizer", "academic");
    } catch (e) { toast(e.message, "error"); }
  },
  async removeExamType(i) {
    const cfg = State.db.systemConfig.academicConfig;
    const next = cfg.examTypes.filter((_, idx) => idx !== i);
    if (!next.length) return toast("At least one assessment type is required", "error");
    try {
      const res = await api("/api/config/academic", "PUT", { examTypes: next, _actor: "Super Admin" });
      syncFrom(res);
      this.sub("customizer", "academic");
    } catch (e) { toast(e.message, "error"); }
  },
  async addGradeLevel() {
    const val = document.getElementById("ac-newGrade").value.trim();
    if (!val) return;
    const cfg = State.db.systemConfig.academicConfig;
    try {
      const res = await api("/api/config/academic", "PUT", { gradeLevels: [...cfg.gradeLevels, val], _actor: "Super Admin" });
      syncFrom(res);
      toast(`Class level "${val}" added`, "success");
      this.sub("customizer", "academic");
    } catch (e) { toast(e.message, "error"); }
  },
  async removeGradeLevel(i) {
    const cfg = State.db.systemConfig.academicConfig;
    const next = cfg.gradeLevels.filter((_, idx) => idx !== i);
    try {
      const res = await api("/api/config/academic", "PUT", { gradeLevels: next, _actor: "Super Admin" });
      syncFrom(res);
      this.sub("customizer", "academic");
    } catch (e) { toast(e.message, "error"); }
  },
  async addStream() {
    const val = document.getElementById("ac-newStream").value.trim();
    if (!val) return;
    const cfg = State.db.systemConfig.academicConfig;
    try {
      const res = await api("/api/config/academic", "PUT", { streams: [...cfg.streams, val], _actor: "Super Admin" });
      syncFrom(res);
      toast(`Stream "${val}" added`, "success");
      this.sub("customizer", "academic");
    } catch (e) { toast(e.message, "error"); }
  },
  async removeStream(i) {
    const cfg = State.db.systemConfig.academicConfig;
    try {
      const res = await api("/api/config/academic", "PUT", { streams: cfg.streams.filter((_, idx) => idx !== i), _actor: "Super Admin" });
      syncFrom(res);
      this.sub("customizer", "academic");
    } catch (e) { toast(e.message, "error"); }
  },
  async saveLearningAreas() {
    const rows = document.querySelectorAll("#la-table tbody tr");
    const learningAreas = [];
    rows.forEach((row) => {
      const get = (k) => {
        const el = row.querySelector(`[data-k="${k}"]`);
        return el.type === "checkbox" ? el.checked : el.value;
      };
      if (get("name")) learningAreas.push({ code: get("code"), name: get("name"), category: get("category"), active: get("active") });
    });
    try {
      const res = await api("/api/config/academic", "PUT", { learningAreas, _actor: "Super Admin" });
      syncFrom(res);
      toast("Learning areas updated", "success");
      this.sub("customizer", "academic");
    } catch (e) { toast(e.message, "error"); }
  },
  async addLearningArea() {
    const name = document.getElementById("la-newName").value.trim();
    const code = document.getElementById("la-newCode").value.trim() || name.slice(0, 4).toUpperCase();
    if (!name) return toast("Enter the learning area name", "error");
    const learningAreas = [...State.db.systemConfig.academicConfig.learningAreas, { code, name, category: "Custom", active: true }];
    try {
      const res = await api("/api/config/academic", "PUT", { learningAreas, _actor: "Super Admin" });
      syncFrom(res);
      toast(`Learning area "${name}" added`, "success");
      this.sub("customizer", "academic");
    } catch (e) { toast(e.message, "error"); }
  },
  async removeLearningArea(i) {
    const learningAreas = State.db.systemConfig.academicConfig.learningAreas.filter((_, idx) => idx !== i);
    try {
      const res = await api("/api/config/academic", "PUT", { learningAreas, _actor: "Super Admin" });
      syncFrom(res);
      this.sub("customizer", "academic");
    } catch (e) { toast(e.message, "error"); }
  },
  async saveRubric() {
    const rows = document.querySelectorAll("#rubric-table tbody tr");
    const cbcRubricScale = [];
    rows.forEach((row, i) => {
      const get = (k) => row.querySelector(`[data-k="${k}"]`).value;
      const old = State.db.systemConfig.academicConfig.cbcRubricScale[i] || {};
      cbcRubricScale.push({
        code: get("code"),
        subCode: old.subCode || get("code") + "1",
        label: get("label"),
        min: Number(get("min")),
        max: Number(get("max")),
        points: Number(get("points")),
        color: get("color"),
        remark: document.getElementById(`rubric-remark-${i}`).value
      });
    });
    try {
      const res = await api("/api/config/academic", "PUT", { cbcRubricScale, _actor: "Super Admin" });
      syncFrom(res);
      toast("CBC rubric scale saved — report cards updated", "success");
      this.sub("customizer", "grading");
    } catch (e) { toast(e.message, "error"); }
  },
  async saveStandardScale() {
    const rows = document.querySelectorAll("#standard-table tbody tr");
    const standardGradeScale = [];
    rows.forEach((row) => {
      const get = (k) => row.querySelector(`[data-k="${k}"]`).value;
      standardGradeScale.push({
        grade: get("grade"),
        min: Number(get("min")),
        max: Number(get("max")),
        points: Number(get("points")),
        remark: get("remark")
      });
    });
    try {
      const res = await api("/api/config/academic", "PUT", { standardGradeScale, _actor: "Super Admin" });
      syncFrom(res);
      toast("Standard grade scale saved", "success");
      this.sub("customizer", "grading");
    } catch (e) { toast(e.message, "error"); }
  },
  async addCustomField() {
    const payload = {
      entity: document.getElementById("cf-entity").value,
      type: document.getElementById("cf-type").value,
      label: document.getElementById("cf-label").value,
      options: document.getElementById("cf-options").value
    };
    if (!payload.label) return toast("Enter a field label", "error");
    try {
      const res = await api("/api/config/custom-fields", "POST", payload);
      syncFrom(res);
      toast(`Custom field "${payload.label}" created — it now appears on admission forms`, "success");
      this.sub("customizer", "customfields");
    } catch (e) { toast(e.message, "error"); }
  },
  async deleteCustomField(id) {
    if (!confirm("Delete this custom field? Values already captured will no longer display.")) return;
    try {
      const res = await api(`/api/config/custom-fields/${id}`, "DELETE");
      syncFrom(res);
      toast("Custom field removed", "success");
      this.sub("customizer", "customfields");
    } catch (e) { toast(e.message, "error"); }
  },
  async saveFinance() {
    const payload = {
      currency: document.getElementById("fn-currency").value,
      mpesaPaybill: document.getElementById("fn-paybill").value,
      mpesaAccountPrefix: document.getElementById("fn-prefix").value,
      bankName: document.getElementById("fn-bank").value,
      bankAccount: document.getElementById("fn-account").value,
      arrearsAlertThreshold: Number(document.getElementById("fn-threshold").value),
      allowParentPortalMpesa: document.getElementById("fn-parentPay").checked,
      autoSmsOnPayment: document.getElementById("fn-autoPay").checked,
      autoSmsOnAbsence: document.getElementById("fn-autoAbs").checked,
      lockReportCardOnArrears: document.getElementById("fn-lock").checked,
      lockReportCardThreshold: Number(document.getElementById("fn-lockThreshold").value),
      smsGatewayProvider: document.getElementById("fn-smsProvider").value,
      smsSenderId: document.getElementById("fn-smsSender").value,
      smsBalanceCredits: Number(document.getElementById("fn-smsCredits").value)
    };
    try {
      const res = await api("/api/config/finance", "PUT", payload);
      syncFrom(res);
      toast("Finance & M-Pesa gateway settings saved", "success");
      this.sub("customizer", "finance");
    } catch (e) { toast(e.message, "error"); }
  },
  async topUpSms() {
    const credits = (State.db.systemConfig.financeConfig.smsBalanceCredits || 0) + 1000;
    try {
      const res = await api("/api/config/finance", "PUT", { smsBalanceCredits: credits });
      syncFrom(res);
      toast("1,000 SMS credits added", "success");
      this.sub("customizer", "finance");
    } catch (e) { toast(e.message, "error"); }
  },
  async saveFeeStructure(id) {
    const container = document.querySelector(`[data-fs="${id}"]`);
    const payload = {};
    container.querySelectorAll("[data-k]").forEach((el) => { payload[el.getAttribute("data-k")] = Number(el.value); });
    try {
      const res = await api(`/api/fee-structures/${id}`, "PUT", payload);
      syncFrom(res);
      toast("Fee structure updated — new totals applied", "success");
      this.sub("customizer", "finance");
    } catch (e) { toast(e.message, "error"); }
  },
  async togglePermission(role, perm, value) {
    try {
      const res = await api("/api/config/permissions", "PUT", { [role]: { [perm]: value } });
      syncFrom(res);
      toast(`Permission "${perm}" ${value ? "granted" : "revoked"} for ${role} portal`, value ? "success" : "info");
    } catch (e) { toast(e.message, "error"); }
  },
  async saveTerms() {
    const payload = {
      version: document.getElementById("tm-version").value,
      effectiveDate: document.getElementById("tm-effectiveDate").value,
      feeDeadlineWeek: document.getElementById("tm-feeDeadlineWeek").value,
      refundNoticeDays: Number(document.getElementById("tm-refundNoticeDays").value),
      withdrawalNoticeDays: Number(document.getElementById("tm-withdrawalNoticeDays").value),
      dpoEmail: document.getElementById("tm-dpoEmail").value,
      arrearsAction: document.getElementById("tm-arrearsAction").value,
      academicHonesty: document.getElementById("tm-academicHonesty").value,
      attendanceRequirement: document.getElementById("tm-attendanceRequirement").value,
      complaintsChannel: document.getElementById("tm-complaintsChannel").value,
      enforceTermsAtLogin: document.getElementById("tm-enforceTermsAtLogin").checked,
      requireAtAdmission: document.getElementById("tm-requireAtAdmission").checked,
      photoConsentDefault: document.getElementById("tm-photoConsentDefault").checked,
      _actor: State.db.systemConfig.branding.principalName + " (Admin)"
    };
    try {
      const res = await api("/api/config/terms", "PUT", payload);
      syncFrom(res);
      toast(`Terms & Conditions saved (v${payload.version}) — users must accept the new version`, "success");
      this.sub("customizer", "legal");
    } catch (e) { toast(e.message, "error"); }
  },
  exportDatabase() {
    const blob = new Blob([JSON.stringify(State.db, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `faith-learning-centre-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    toast("Full school database exported", "success");
  },
  exportCsv(kind) {
    let rows = [];
    let name = "export";
    if (kind === "students") {
      name = "flc-learners";
      rows = [["ADM No", "NEMIS UPI", "First Name", "Last Name", "Gender", "DOB", "Class", "Stream", "Boarding", "Guardian", "Phone", "Billed", "Paid", "Balance", "Mean %", "Attendance %"]];
      State.db.students.forEach((s) => rows.push([s.admNo, s.nemisUpi, s.firstName, s.lastName, s.gender, s.dob, s.grade, s.stream, s.boardingStatus, s.guardianName, s.guardianPhone, s.billedAmount, s.paidAmount, s.balance, studentAverage(s.id), s.attendanceRate]));
    } else if (kind === "parents") {
      name = "flc-parent-contacts";
      rows = [["Learner", "Class", "Guardian", "Relationship", "Phone", "Email", "Balance"]];
      State.db.students.forEach((s) => rows.push([`${s.firstName} ${s.lastName}`, s.grade, s.guardianName, s.guardianRelation, s.guardianPhone, s.guardianEmail, s.balance]));
    } else if (kind === "payments") {
      name = "flc-payment-ledger";
      rows = [["Receipt No", "Date", "Learner", "ADM No", "Grade", "Amount", "Method", "Reference", "Votehead", "Term", "Recorded By"]];
      State.db.payments.forEach((p) => rows.push([p.receiptNo, p.date, p.studentName, p.admNo, p.grade, p.amount, p.method, p.reference, p.votehead, p.term, p.recordedBy]));
    } else if (kind === "feereport") {
      name = "flc-fee-report";
      rows = [["Class", "Learners", "Billed", "Collected", "Arrears", "Collection Rate %"]];
      [...new Set(State.db.students.map((s) => s.grade))].forEach((g) => {
        const list = State.db.students.filter((s) => s.grade === g);
        const billed = list.reduce((x, s) => x + Number(s.billedAmount || 0), 0);
        const collected = list.reduce((x, s) => x + Number(s.paidAmount || 0), 0);
        rows.push([g, list.length, billed, collected, billed - collected, billed ? Math.round((collected / billed) * 100) : 0]);
      });
    }
    const csv = rows.map((r) => r.map((c) => `"${String(c ?? "").replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${name}-2026-10-11.csv`;
    a.click();
    toast("CSV export downloaded", "success");
  },
  importDatabase() {
    try {
      const parsed = JSON.parse(document.getElementById("import-json").value);
      api("/api/config/import", "POST", parsed).then((res) => {
        State.db = res.db;
        toast("School database imported successfully", "success");
        render();
      }).catch((e) => toast(e.message, "error"));
    } catch (e) {
      toast("Invalid JSON — please paste a valid backup export", "error");
    }
  },
  resetDatabase() {
    if (!confirm("Restore the FAITH LEARNING CENTRE default seed data?\n\nAll custom learners, payments and configuration will be permanently replaced.")) return;
    api("/api/config/reset", "POST", {}).then((res) => {
      State.db = res.db;
      toast("System restored to default seed data", "success");
      render();
    }).catch((e) => toast(e.message, "error"));
  },
  customizerQuickReset() {
    if (!confirm("Restore all system defaults (branding, modules, grading, fees)?")) return;
    api("/api/config/reset", "POST", {}).then((res) => {
      State.db = res.db;
      toast("Configuration restored to defaults", "success");
      render();
    }).catch((e) => toast(e.message, "error"));
  }
};

/* ------------------------- Printable Document HTML ------------------------ */
function receiptHtml(p, s) {
  const b = State.db.systemConfig.branding;
  return `
  <div class="official-doc">
    <div class="official-doc-header">
      <h2>${esc(b.schoolName)}</h2>
      <div style="font-size:0.82rem">${esc(b.address)} · Tel ${esc(b.phone)} · ${esc(b.email)}</div>
      <div style="font-size:0.78rem;color:var(--text-muted)">KNEC Centre: ${esc(b.knecCode)} · NEMIS: ${esc(b.nemisCode)}</div>
      <div class="motto">"${esc(b.motto)}"</div>
      <div style="margin-top:0.6rem;font-weight:800;letter-spacing:0.05em">OFFICIAL SCHOOL FEES RECEIPT</div>
    </div>
    <div class="grid-3" style="margin-bottom:1rem">
      <div><div class="kpi-label">Receipt No</div><strong>${esc(p.receiptNo)}</strong></div>
      <div><div class="kpi-label">Date</div><strong>${esc(p.date)}</strong></div>
      <div><div class="kpi-label">Term</div><strong>${esc(p.term)} ${esc(State.db.systemConfig.academicConfig.currentYear)}</strong></div>
      <div><div class="kpi-label">Learner</div><strong>${esc(p.studentName)}</strong></div>
      <div><div class="kpi-label">ADM No</div><strong>${esc(p.admNo)}</strong></div>
      <div><div class="kpi-label">Class</div><strong>${esc(p.grade)}</strong></div>
      <div><div class="kpi-label">Payment Method</div><strong>${esc(p.method)}</strong></div>
      <div><div class="kpi-label">Transaction Ref</div><strong>${esc(p.reference)}</strong></div>
      <div><div class="kpi-label">Paid By</div><strong>${esc(p.paidBy)}</strong></div>
    </div>
    <div class="table-wrap">
      <table class="data-table">
        <thead><tr><th>Votehead / Purpose</th><th style="text-align:right">Amount (${esc(State.db.systemConfig.financeConfig.currency)})</th></tr></thead>
        <tbody>
          <tr><td>${esc(p.votehead)}</td><td style="text-align:right"><strong>${money(p.amount)}</strong></td></tr>
          <tr style="background:#ffffff"><td><strong>Total Received</strong></td><td style="text-align:right"><strong style="font-size:1.05rem">${money(p.amount)}</strong></td></tr>
        </tbody>
      </table>
    </div>
    <div class="grid-3" style="margin-top:1rem">
      <div><div class="kpi-label">Total Billed</div><strong>${money(s.billedAmount || 0)}</strong></div>
      <div><div class="kpi-label">Total Paid</div><strong style="color:var(--success)">${money(s.paidAmount || 0)}</strong></div>
      <div><div class="kpi-label">Balance Outstanding</div><strong style="color:${(s.balance || 0) > 0 ? "var(--danger)" : "var(--success)"}">${money(s.balance || 0)}</strong></div>
    </div>
    <div style="margin-top:1rem;font-size:0.8rem;color:var(--text-muted)">
      ${esc(b.receiptFooter)}<br/>
      Fees are governed by the ${esc(b.schoolName)} Terms &amp; Conditions, Version ${esc(String((State.db.systemConfig.terms || {}).version || "1.0"))} (refund window ${esc(String((State.db.systemConfig.terms || {}).refundNoticeDays || 14))} working days).
    </div>
    <div style="margin-top:1rem;display:flex;justify-content:space-between;font-size:0.82rem">
      <div>Received by: <strong>${esc(p.recordedBy)}</strong><div style="color:var(--text-muted)">Official School Stamp</div></div>
      <div style="text-align:right">Chief Bursar: <strong>${esc(b.bursarName)}</strong></div>
    </div>
  </div>`;
}

function reportCardHtml(s) {
  const cfg = State.db.systemConfig.academicConfig;
  const b = State.db.systemConfig.branding;
  const assessments = State.db.assessments[s.id] || {};
  const areas = cfg.learningAreas.filter((l) => l.active);
  const rows = areas.map((l) => {
    const rec = assessments[l.code] || { sba: 0, exam: 0 };
    const final = recordScore(rec);
    const g = gradeFor(final);
    const comment = assessments[`${l.code}_comment`] || "";
    return `<tr>
      <td><strong>${esc(l.name)}</strong><div style="font-size:0.7rem;color:var(--text-muted)">${esc(l.code)} · ${esc(l.category)}</div></td>
      <td style="text-align:center">${rec.sba ?? 0}</td>
      <td style="text-align:center">${rec.exam ?? 0}</td>
      <td style="text-align:center"><strong>${final}%</strong></td>
      <td style="text-align:center">${g.cbc ? `<span class="badge" style="background:${g.cbc.color}1a;color:${g.cbc.color}">${esc(g.cbc.code)}</span>` : "—"}</td>
      <td style="text-align:center">${g.standard ? `<strong>${esc(g.standard.grade)}</strong>` : (g.cbc ? g.cbc.points : "—")}</td>
      <td style="font-size:0.74rem;color:var(--text-muted)">${esc(comment || (g.cbc ? g.cbc.remark : ""))}</td>
    </tr>`;
  }).join("");

  const totalPoints = areas.reduce((sum, l) => {
    const final = recordScore(assessments[l.code] || {});
    const g = gradeFor(final);
    return sum + (g.cbc ? g.cbc.points : g.standard ? 3 : 0);
  }, 0);
  const mean = studentAverage(s.id);
  const classRank = classList().find((x) => x.id === s.id)?.rank || "—";

  return `
  <div class="official-doc">
    <div class="official-doc-header">
      <div style="font-size:0.75rem;font-weight:700;letter-spacing:0.08em;color:var(--accent)">REPUBLIC OF KENYA — MINISTRY OF EDUCATION · COMPETENCY BASED CURRICULUM</div>
      <h2>${esc(b.schoolName)}</h2>
      <div style="font-size:0.82rem">${esc(b.address)} · Tel ${esc(b.phone)}</div>
      <div style="font-size:0.76rem">KNEC Centre ${esc(b.knecCode)} · NEMIS ${esc(b.nemisCode)} · Reg ${esc(b.regNumber)}</div>
      <div class="motto">"${esc(b.motto)}"</div>
      <div style="margin-top:0.6rem;font-weight:800;letter-spacing:0.04em">TERMLY LEARNER PROGRESS REPORT — ${esc(cfg.currentTerm.toUpperCase())} ${esc(cfg.currentYear)}</div>
    </div>

    <div class="grid-3" style="margin-bottom:1rem">
      <div><div class="kpi-label">Learner Name</div><strong>${esc(s.firstName)} ${esc(s.lastName)}</strong></div>
      <div><div class="kpi-label">Admission No</div><strong>${esc(s.admNo)}</strong></div>
      <div><div class="kpi-label">NEMIS UPI / Assessment No</div><strong>${esc(s.nemisUpi)} · ${esc(s.assessmentNo)}</strong></div>
      <div><div class="kpi-label">Class & Stream</div><strong>${esc(s.grade)} ${esc(s.stream)}</strong></div>
      <div><div class="kpi-label">Boarding Status</div><strong>${esc(s.boardingStatus)}</strong></div>
      <div><div class="kpi-label">Attendance</div><strong>${s.attendanceRate}%</strong></div>
    </div>

    <div class="table-wrap">
      <table class="data-table">
        <thead><tr>
          <th>Learning Area / Strand</th>
          <th style="text-align:center">SBA<br/><span style="font-weight:400">(${cfg.sbaWeight}%)</span></th>
          <th style="text-align:center">${esc(cfg.activeExamType)}<br/><span style="font-weight:400">(${cfg.examWeight}%)</span></th>
          <th style="text-align:center">Final</th>
          <th style="text-align:center">CBC Level</th>
          <th style="text-align:center">Grade</th>
          <th>Teacher's Strand Remark</th>
        </tr></thead>
        <tbody>${rows}</tbody>
        <tfoot>
          <tr style="background:#ffffff">
            <td><strong>OVERALL PERFORMANCE</strong></td>
            <td colspan="2" style="text-align:center;color:var(--text-muted)">Cumulative</td>
            <td style="text-align:center"><strong style="font-size:1.05rem">${mean}%</strong></td>
            <td colspan="2" style="text-align:center">${gradeBadge(mean)}</td>
            <td><strong>Total Points: ${totalPoints} · Class Rank: #${classRank} of ${State.db.students.length}</strong></td>
          </tr>
        </tfoot>
      </table>
    </div>

    <div class="grid-2" style="margin-top:1rem">
      <div>
        <div class="kpi-label" style="margin-bottom:0.5rem">CBC Core Competencies Assessment</div>
        <div class="table-wrap"><table class="data-table">
          <tbody>
            ${Object.entries(s.coreCompetencies || {}).map(([k, v]) => {
              const label = k.replace(/([A-Z])/g, " $1").replace(/^./, (m) => m.toUpperCase());
              const color = v === "Exceeding" ? "var(--success)" : v === "Meeting" ? "var(--primary)" : "var(--accent)";
              return `<tr><td>${esc(label)}</td><td style="text-align:right"><span class="badge" style="background:${color}1a;color:${color}">${esc(v)} Expectations</span></td></tr>`;
            }).join("")}
            <tr><td>Co-Curricular / Talent Pathway</td><td style="text-align:right"><strong>${esc((s.customData || {}).talentClub || "—")}</strong></td></tr>
          </tbody>
        </table></div>
      </div>
      <div>
        <div class="kpi-label" style="margin-bottom:0.5rem">Grading Key in Force (${esc(cfg.gradingMode.toUpperCase())})</div>
        <div class="table-wrap"><table class="data-table">
          <thead><tr><th>Level</th><th>Range</th><th>Descriptor</th></tr></thead>
          <tbody>
            ${(cfg.gradingMode === "standard" ? cfg.standardGradeScale.map((r) => ({ code: r.grade, label: r.remark, min: r.min, max: r.max, color: "#5c5c5c" })) : cfg.cbcRubricScale)
              .map((r) => `<tr>
                <td><span class="badge" style="background:${r.color}1a;color:${r.color}">${esc(r.code)}</span> ${esc(r.label)}</td>
                <td>${r.min}–${r.max}%</td>
                <td style="font-size:0.74rem;color:var(--text-muted)">${esc(r.remark)}</td>
              </tr>`).join("")}
          </tbody>
        </table></div>
      </div>
    </div>

    <div style="margin-top:1rem;display:grid;gap:0.6rem;font-size:0.85rem">
      <div><strong>Class Teacher's Comment:</strong> ${esc(assessments.teacherComment || "")}</div>
      <div><strong>Principal's Comment:</strong> ${esc(assessments.principalComment || "")}</div>
      <div><strong>Next Term Opens:</strong> ${esc(cfg.nextTermOpening)} &nbsp;|&nbsp; <strong>Current Fee Balance:</strong> ${money(s.balance)}</div>
    </div>

    <div style="margin-top:1.2rem;display:flex;justify-content:space-between;font-size:0.82rem">
      <div>Class Teacher: <strong>Mr. Kelvin Mwangi Karanja</strong></div>
      <div>Principal: <strong>${esc(b.principalName)}</strong><div style="color:var(--text-muted)">Signature & School Stamp</div></div>
    </div>
    <div style="margin-top:0.85rem;padding-top:0.6rem;border-top:1px dashed var(--border-color);font-size:0.76rem;color:var(--text-muted)">
      ${esc(b.reportCardFooter)}<br/>
      Issued under the ${esc(b.schoolName)} Terms &amp; Conditions, Version ${esc(String((State.db.systemConfig.terms || {}).version || "1.0"))} —
      assessment weighted ${cfg.sbaWeight}% SBA / ${cfg.examWeight}% examination.
    </div>
  </div>`;
}

/* ----------------------------- Bootstrap ---------------------------------- */
// Expose state & engine helpers for console debugging and automated tests
window.State = State;
window.recordScore = recordScore;
window.gradeFor = gradeFor;
window.studentAverage = studentAverage;

window.afterPageRender = null;
/* Ctrl/⌘+K reaches the command palette from anywhere in the portal. */
document.addEventListener("keydown", (event) => {
  // the portal shell only — the public website keeps its own keyboard behaviour
  if (!document.getElementById("app") || !document.getElementById("palette-root")) return;
  const typing = ["INPUT", "TEXTAREA", "SELECT"].includes(event.target.tagName);
  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
    event.preventDefault();
    FLC.openPalette();
    return;
  }
  if (event.key === "Escape" && State.palette && State.palette.open) FLC.closePalette();
  if (!typing && event.key === "/" && !event.ctrlKey && !event.metaKey) {
    event.preventDefault();
    FLC.openPalette();
  }
});

async function bootstrapApplication() {
  if (!document.getElementById("app")) {
    // Public front page is active — the application shell is not present on this page.
    window.FLC_PUBLIC_MODE = true;
    return;
  }
  try {
    State.db = await api("/api/bootstrap");

    // A link from the public website may name the portal it wants to open
    const wantedRole = sessionStorage.getItem("flc_portal_role");
    if (wantedRole && ["admin", "teacher", "finance", "parent"].includes(wantedRole)) {
      sessionStorage.removeItem("flc_portal_role");
    }

    const user = await restoreSession();
    // restoreSession proves the token; the record set itself arrives once, with the token
    if (user) { try { State.db = await api("/api/bootstrap"); } catch (e) {} }
    if (!user) {
      renderSignIn();
      return;
    }
    State.user = user;
    State.role = user.role;
    render();
    // Terms & Conditions enforcement at portal entry
    const tcfg = State.db.systemConfig.terms || {};
    if (tcfg.enforceTermsAtLogin && typeof FLCTerms !== "undefined" && !FLCTerms.isAccepted(State.db)) {
      FLCTerms.gate(State.db, {
        role: State.role,
        portal: ROLES.find((r) => r.id === State.role).label,
        onAccept: () => {
          toast("Thank you — your acceptance has been recorded", "success");
          render();
        }
      });
    }
  } catch (e) {
    document.getElementById("app").innerHTML = `<div style="margin:auto;padding:2rem;text-align:center">
      <h2>Unable to load the school system</h2><p style="color:#5c5c5c">${esc(e.message)}</p>
      <p style="color:#8e8e8e;font-size:0.85rem">Ensure the backend server is running: <code>npm start</code></p></div>`;
  }
}

if (document.readyState === "loading") {
  window.addEventListener("DOMContentLoaded", bootstrapApplication);
} else {
  bootstrapApplication();
}
