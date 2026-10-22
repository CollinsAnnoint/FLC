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

