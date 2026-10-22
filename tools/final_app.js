#!/usr/bin/env python3
"""Senior-developer front-end pass: go-live readiness panel, command palette,
device management, error boundary, accessibility, mobile navigation, version."""
import os

os.chdir("/home/user")
p = "public/app.js"
s = open(p, encoding="utf-8").read()
if "goLiveChecks" in s:
    print("already patched")
    raise SystemExit(0)


def sub(old, new, why):
    global s
    assert old in s, "anchor missing: " + why
    s = s.replace(old, new, 1)


# ------------------------------------------------------------- state
sub('''  helpTab: "articles",       // articles | password | security | ict
  helpQuery: "",
  securityStatus: null''',
'''  helpTab: "articles",       // articles | password | security | ict
  helpQuery: "",
  securityStatus: null,
  systemStatus: null,
  sessions: [],
  palette: { open: false, query: "", index: 0 }''', "state")

# ------------------------------------------------------ error boundary + render
sub('''  host.innerHTML = (map[State.route] || pageDashboard)();''',
'''  try {
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
  }''', "error boundary")

# ----------------------------------------------------------------- toasts a11y
sub('''function toast(msg, type = "info") {
  const root = document.getElementById("toast-root");
  const div = document.createElement("div");
  div.className = "toast";''',
'''function toast(msg, type = "info") {
  const root = document.getElementById("toast-root");
  if (!root) return;
  const div = document.createElement("div");
  div.className = "toast";
  div.setAttribute("role", type === "error" ? "alert" : "status");''', "toast")

# ------------------------------------------------------------ shell: skip link
sub('''  document.getElementById("app").innerHTML = `
    <aside class="sidebar">''',
'''  document.getElementById("app").innerHTML = `
    <a class="skip-link" href="#page">Skip to the page content</a>
    <div class="nav-scrim" onclick="FLC.toggleNav(false)" aria-hidden="true"></div>
    <aside class="sidebar" id="portal-sidebar">''', "skip link")

# sidebar footer gains the version
sub('''        <div>${esc(db.systemConfig.academicConfig.currentTerm)} ${esc(db.systemConfig.academicConfig.currentYear)} · CBC Engine</div>''',
'''        <div>${esc(db.systemConfig.academicConfig.currentTerm)} ${esc(db.systemConfig.academicConfig.currentYear)} · CBC Engine</div>
        <div class="sidebar-version">v${esc((window.FLC_META && FLC_META.version) || "1.1.0")} · ${esc(State.user ? State.user.name : "signed in")}</div>''', "version")

# ------------------------------------------------------------ topbar: nav + palette
sub('''  <header class="topbar">
    <div class="topbar-left">
      <span class="school-pill">${icon("building", 14)} ${esc(b.shortName)} · KNEC ${esc(b.knecCode)}</span>''',
'''  <header class="topbar">
    <div class="topbar-left">
      <button class="nav-toggle" onclick="FLC.toggleNav()" aria-label="Open the menu" title="Menu">${icon("layers", 16)}<span class="nav-toggle-label">Menu</span></button>
      <button class="palette-btn" onclick="FLC.openPalette()" title="Search the whole system (Ctrl + K)">
        ${icon("search", 14)}<span class="palette-btn-label">Search everything</span><kbd>⌘K</kbd>
      </button>
      <span class="school-pill">${icon("building", 14)} ${esc(b.shortName)} · KNEC ${esc(b.knecCode)}</span>''', "topbar")

# ---------------------------------------------------------------- go-live panel
GOLIVE = '''
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

'''
sub('''/* ---------------------------- Dashboard Page ------------------------------ */''',
    GOLIVE + '''/* ---------------------------- Dashboard Page ------------------------------ */''', "go-live block")

# the panel sits at the top of the admin dashboard
sub('''  const body = `
    <div class="kpi-grid">''',
'''  const body = `
    ${State.role === "admin" ? goLivePanel() : ""}
    <div class="kpi-grid">''', "dashboard panel")

# ------------------------------------------------------------------ device list
sub('''          <h4 class="help-cat">Recent security events</h4>''',
'''          <h4 class="help-cat">Devices signed in${State.sessions.length ? " (" + State.sessions.length + ")" : ""}</h4>
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
          <h4 class="help-cat">Recent security events</h4>''', "devices")

sub('''    if (!sec) setTimeout(() => FLC.loadSecurity(), 60);''',
'''    if (!sec) setTimeout(() => FLC.loadSecurity(), 60);
    if (!State.sessions.length) setTimeout(() => FLC.loadSessions(), 80);
    if (!State.systemStatus) setTimeout(() => FLC.loadSystemStatus(), 90);''', "loaders")

# ------------------------------------------------------------------ command palette
PALETTE = '''
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

'''
sub('''/* --------------------------- Help Centre ---------------------------------- */''',
    PALETTE + '''/* --------------------------- Help Centre ---------------------------------- */''', "palette block")

# ------------------------------------------------------------------- FLC exports
sub('''  helpTab(tab) {''',
'''  /* --- mobile navigation --- */
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
  helpTab(tab) {''', "FLC exports")

# --------------------------------------------- palette root in the shell + hotkey
sub('''      <div class="page-content" id="page"></div>
    </main>`;''',
'''      <div class="page-content" id="page"></div>
    </main>
    <div id="palette-root"></div>`;''', "palette root")

sub('''async function bootstrapApplication() {''',
'''/* Ctrl/⌘+K reaches the command palette from anywhere in the portal. */
document.addEventListener("keydown", (event) => {
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

async function bootstrapApplication() {''', "hotkey")

open(p, "w", encoding="utf-8").write(s)
print("app.js: readiness panel, palette, devices, error boundary, mobile nav")
