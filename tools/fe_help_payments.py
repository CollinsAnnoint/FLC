#!/usr/bin/env python3
"""Front end: session tokens on every change, forgotten-password flow, Help Centre,
payment channels (E-Citizen + the temporary Pochi la Biashara), channel editor."""
import os

os.chdir("/home/user")
p = "public/app.js"
s = open(p, encoding="utf-8").read()
if "pageHelpCentre" in s:
    print("already patched")
    raise SystemExit(0)


def sub(old, new, why):
    global s
    assert old in s, "anchor missing: " + why
    s = s.replace(old, new, 1)


# 1 ---------------------------------------------------------------- token helper
sub('''async function api(path, method = "GET", body) {
  const opts = { method, headers: { "Content-Type": "application/json" } };
  if (body) opts.body = JSON.stringify(body);''',
'''/* The signed-in session token. The server requires it for every change to the
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
  if (body) opts.body = JSON.stringify(body);''', "api()")

# 2 ------------------------------------------------------- session storage/restore
sub('''async function restoreSession() {
  let token = null;
  try { token = sessionStorage.getItem(SESSION_KEY); } catch (e) {}
  if (!token) return null;''',
'''async function restoreSession() {
  const token = portalToken();
  if (!token) return null;''', "restoreSession")

sub('''  try {
    const res = await fetch("/api/auth/session?token=" + encodeURIComponent(token));
    if (!res.ok) { try { sessionStorage.removeItem(SESSION_KEY); } catch (e) {} return null; }''',
'''  try {
    const res = await fetch("/api/auth/session?token=" + encodeURIComponent(token));
    if (!res.ok) {
      try { sessionStorage.removeItem(SESSION_KEY); localStorage.removeItem(SESSION_KEY); } catch (e) {}
      return null;
    }''', "restoreSession remove")

sub('''async function signOut() {
  let token = null;
  try { token = sessionStorage.getItem(SESSION_KEY); } catch (e) {}''',
'''async function signOut() {
  const token = portalToken();''', "signOut head")

sub('''  try { sessionStorage.removeItem(SESSION_KEY); } catch (e) {}
  State.user = null;''',
'''  try {
    sessionStorage.removeItem(SESSION_KEY);
    localStorage.removeItem(SESSION_KEY);
  } catch (e) {}
  State.user = null;''', "signOut remove")

sub('''async function changePassword(event) {
  if (event) event.preventDefault();
  let token = null;
  try { token = sessionStorage.getItem(SESSION_KEY); } catch (e) {}''',
'''async function changePassword(event) {
  if (event) event.preventDefault();
  const token = portalToken();''', "changePassword head")

# 3 ------------------------------------------------------------- sign-in success
sub('''    try { sessionStorage.setItem(SESSION_KEY, data.token); } catch (e) {}
    State.user = data.user;''',
'''    try {
      sessionStorage.setItem(SESSION_KEY, data.token);
      // shared with the design chooser, the colour picker and the website editing bar
      localStorage.setItem(SESSION_KEY, data.token);
    } catch (e) {}
    State.user = data.user;''', "sign-in token")

sub('''    toast(`Welcome back, ${data.user.name}`, "success");
    render();''',
'''    toast(`Welcome back, ${data.user.name}`, "success");
    if (data.user.mustChangePassword) {
      setTimeout(() => toast("You are signed in with a temporary password — change it under Backend Customization Zone → Sign-in & Security.", "error"), 1200);
    }
    render();''', "temp password notice")

# 4 ------------------------------------------------------- forgotten password UI
sub('''        <button class="btn btn-primary" type="submit" style="width:100%;justify-content:center">Sign in</button>
      </form>
      ${demo ? ''',
'''        <button class="btn btn-primary" type="submit" style="width:100%;justify-content:center">Sign in</button>
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
      ${demo ? ''', "forgot form")

# 5 ----------------------------------------------------- forgot-password handlers
sub('''async function restoreSession() {''',
'''function toggleForgot() {
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

async function restoreSession() {''', "forgot handlers")

# 6 ------------------------------------------------------------ Help Centre nav
sub('''  push("communications", "SMS & Notices Hub", "message", ["admin", "teacher", "finance", "parent"], "communications");''',
'''  push("communications", "SMS & Notices Hub", "message", ["admin", "teacher", "finance", "parent"], "communications");
  push("help", r === "admin" ? "Help Centre & ICT" : "Help Centre", "help", ["admin", "teacher", "finance", "parent"]);''',
    "nav push")

sub('''    profile: pageProfile,
    customizer: pageCustomizer''',
'''    profile: pageProfile,
    help: pageHelpCentre,
    customizer: pageCustomizer''', "route map")

# 7 ------------------------------------------------------- Help Centre page body
HELP_PAGE = '''
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
                  <div class="help-note">${c.state === "on" ? "Active" : "Requires the school's hosting (HTTPS, off-server backups)"}</div></div>
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
          <h4 class="help-cat">Recent security events</h4>
          <ul class="sec-log">${(sec.auditLogs || []).slice(0, 12).map((l) => `<li><span>${esc(l.timestamp)}</span> ${esc(l.action)} <em>(${esc(l.actor)})</em></li>`).join("")}</ul>`
        : `<p class="empty-note">Loading the security checklist…</p>`}
      </div>`;
    if (!sec) setTimeout(() => FLC.loadSecurity(), 60);
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

'''
sub("/* ------------------------- Backend Customizer ---------------------------- */",
    HELP_PAGE + "/* ------------------------- Backend Customizer ---------------------------- */",
    "help page insert") if "/* ------------------------- Backend Customizer ---------------------------- */" in s else None
if "pageHelpCentre" not in s:
    # fall back: insert before the customizer page function
    anchor = "function pageCustomizer("
    assert anchor in s
    s = s.replace(anchor, HELP_PAGE + anchor, 1)

# 8 ------------------------------------------------------------- state additions
sub('''  parentStudentId: "stu_01",
  filters: {}''',
'''  parentStudentId: "stu_01",
  filters: {},
  helpTab: "articles",       // articles | password | security | ict
  helpQuery: "",
  securityStatus: null''', "state")

# 9 --------------------------------------------------------- payment method list
sub('''        <div class="form-group"><label>Payment Method</label>
          <select class="select" id="pay-method">
            <option>M-Pesa Paybill</option><option>M-Pesa STK Push</option><option>Bank Transfer (EFT)</option>
            <option>KCB Bank Deposit</option><option>Cash (Bursar Office)</option><option>Cheque</option>
          </select></div>''',
'''        <div class="form-group"><label>Payment Method</label>
          <select class="select" id="pay-method" onchange="FLC.payChannelNote(this.value)">
            ${(fc.paymentChannels || []).filter((c) => c.enabled).map((c) => `<option value="${esc(c.label)}">${esc(c.label)}${c.temporary ? " (temporary)" : ""}</option>`).join("")}
            <option>M-Pesa STK Push</option><option>Bank Transfer (EFT)</option><option>Cheque</option>
          </select>
          <div id="pay-channel-note" class="help-note" style="margin-top:0.35rem">${esc((fc.paymentChannels || [])[0] ? (fc.paymentChannels[0].detail || "") : "")}</div></div>''',
    "payment methods")

# 10 --------------------------------------------- finance tab: payment channels
sub('''        <button class="btn btn-primary" style="margin-top:0.9rem" onclick="FLC.saveFinance()">${icon("check", 14)} Save Gateway Settings</button>''',
'''        <button class="btn btn-primary" style="margin-top:0.9rem" onclick="FLC.saveFinance()">${icon("check", 14)} Save Gateway Settings</button>
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
        </div>''',
    "finance channels")

# 11 ------------------------------------------------------------------ FLC exports
sub('''  setRole(role) {''',
'''  helpTab(tab) {
    State.helpTab = tab;
    if (tab === "security") State.securityStatus = null;
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
  setRole(role) {''', "FLC exports")

# 12 ------------------------------------------------------- help icon + bootstrap
sub('''    clipboard: "M9 2h6a1 1 0 0 1 1 1v1h3a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h3V3a1 1 0 0 1 1-1zm1 2v1h4V4h-4z",''',
'''    clipboard: "M9 2h6a1 1 0 0 1 1 1v1h3a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h3V3a1 1 0 0 1 1-1zm1 2v1h4V4h-4z",
    help: "M12 2a10 10 0 1 1 0 20 10 10 0 0 1 0-20zm0 2a8 8 0 1 0 0 16 8 8 0 0 0 0-16zm1 12.2a1.3 1.3 0 1 1-2.6 0 1.3 1.3 0 0 1 2.6 0zM12.9 6.4c1.9 0 3.4 1.3 3.4 3 0 1.1-.6 1.9-1.5 2.5-.8.5-1.1.9-1.1 1.6v.4h-2.2v-.6c0-1.2.5-1.9 1.4-2.5.7-.5 1.2-.9 1.2-1.5 0-.7-.6-1.2-1.4-1.2-.8 0-1.4.5-1.5 1.3H8.9c.1-1.8 1.6-3 4-3z",''',
    "help icon")

# 13 ------------------------------------- Help Centre data arrives with bootstrap
sub('''function syncFrom(payload) {
  if (!payload) return;''',
'''function syncFrom(payload) {
  if (!payload) return;
  if (payload.helpArticles) State.db.helpArticles = payload.helpArticles;
  if (payload.passwordResetRequests) State.db.passwordResetRequests = payload.passwordResetRequests;''',
    "syncFrom help")

open(p, "w", encoding="utf-8").write(s)
print("app.js patched")
