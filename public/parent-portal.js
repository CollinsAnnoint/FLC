/* ============================================================================
   FAITH LEARNING CENTRE — Parent & Student Portal views
   Restricted, child-focused views loaded alongside app.js
   ========================================================================= */

function currentChild() {
  return State.db.students.find((s) => s.id === State.parentStudentId) || State.db.students[0];
}

function childSelectorBar(child) {
  return `<select class="select" onchange="FLC.setParentStudent(this.value)">
      ${State.db.students.map((s) => `<option value="${s.id}" ${s.id === child.id ? "selected" : ""}>${esc(s.firstName)} ${esc(s.lastName)} — ${esc(s.grade)}</option>`).join("")}
    </select>`;
}

function pageParentAttendance() {
  const stu = currentChild();
  const days = Object.keys(State.db.attendanceRecords)
    .sort()
    .reverse()
    .map((d) => ({ date: d, rec: (State.db.attendanceRecords[d] || {})[stu.id] }))
    .filter((d) => d.rec);
  const count = (st) => days.filter((d) => d.rec.status === st).length;

  const body = `
    <div class="kpi-grid">
      <div class="kpi-card success"><div class="kpi-top"><span class="kpi-label">Present</span><span class="kpi-icon">${icon("check")}</span></div><div class="kpi-value">${count("Present")}</div><div class="kpi-sub">Days recorded on time</div></div>
      <div class="kpi-card accent"><div class="kpi-top"><span class="kpi-label">Late Arrivals</span><span class="kpi-icon">${icon("clock")}</span></div><div class="kpi-value">${count("Late")}</div><div class="kpi-sub">Marked late by class teacher</div></div>
      <div class="kpi-card danger"><div class="kpi-top"><span class="kpi-label">Absent</span><span class="kpi-icon">${icon("x")}</span></div><div class="kpi-value">${count("Absent")}</div><div class="kpi-sub">Unexplained absence</div></div>
      <div class="kpi-card"><div class="kpi-top"><span class="kpi-label">Excused</span><span class="kpi-icon">${icon("clipboard")}</span></div><div class="kpi-value">${count("Excused")}</div><div class="kpi-sub">Term attendance rate ${stu.attendanceRate}%</div></div>
    </div>
    <div class="card">
      <div class="card-header">
        <div class="card-title">${icon("calendar")} ${esc(stu.firstName)}'s Attendance Record</div>
        <span class="badge badge-info">${esc(State.db.systemConfig.academicConfig.currentTerm)} ${esc(State.db.systemConfig.academicConfig.currentYear)}</span>
      </div>
      <div class="table-wrap">
        <table class="data-table">
          <thead><tr><th>Date</th><th>Status</th><th>Time In</th><th>Teacher's Note</th></tr></thead>
          <tbody>
            ${days.length ? days.map((d) => `<tr>
              <td>${esc(d.date)}</td>
              <td><span class="badge ${d.rec.status === "Present" ? "badge-success" : d.rec.status === "Late" ? "badge-warning" : d.rec.status === "Absent" ? "badge-danger" : "badge-info"}">${esc(d.rec.status)}</span></td>
              <td>${esc(d.rec.timeIn)}</td>
              <td style="color:var(--text-muted);font-size:0.82rem">${esc(d.rec.note)}</td>
            </tr>`).join("") : `<tr><td colspan="4" style="text-align:center;padding:1.5rem;color:var(--text-muted)">No attendance records published yet.</td></tr>`}
          </tbody>
        </table>
      </div>
      <div style="margin-top:0.9rem;font-size:0.82rem;color:var(--text-muted)">
        The register is marked daily by the class teacher. Guardians of absent or late learners automatically receive an SMS alert from Faith Learning Centre.
      </div>
    </div>`;

  return pageShell("Attendance History", "Daily roll-call record for your child, marked by the class teacher.", childSelectorBar(stu), body);
}

function pageParentReportCard() {
  const stu = currentChild();
  const cfg = State.db.systemConfig.academicConfig;
  const assessments = State.db.assessments[stu.id] || {};
  const areas = cfg.learningAreas.filter((l) => l.active);
  const mean = studentAverage(stu.id);
  const rank = classList().find((x) => x.id === stu.id)?.rank || "—";
  const classSize = State.db.students.filter((s) => s.grade === stu.grade).length;
  const fc = State.db.systemConfig.financeConfig;
  const locked = fc.lockReportCardOnArrears && stu.balance > fc.lockReportCardThreshold;
  const ranked = areas.map((l) => ({ n: l.name, v: recordScore(assessments[l.code] || {}) })).sort((a, b) => b.v - a.v);

  const body = `
    <div class="kpi-grid">
      <div class="kpi-card"><div class="kpi-top"><span class="kpi-label">Term Mean</span><span class="kpi-icon">${icon("graduation")}</span></div><div class="kpi-value">${mean}%</div><div class="kpi-sub">${gradeBadge(mean)}</div></div>
      <div class="kpi-card accent"><div class="kpi-top"><span class="kpi-label">Class Position</span><span class="kpi-icon">${icon("award")}</span></div><div class="kpi-value">#${rank}</div><div class="kpi-sub">of ${classSize} learners in ${esc(stu.grade)}</div></div>
      <div class="kpi-card success"><div class="kpi-top"><span class="kpi-label">Strongest Area</span><span class="kpi-icon">${icon("sparkle")}</span></div><div class="kpi-value" style="font-size:1.02rem">${esc(ranked[0] ? ranked[0].n : "—")}</div><div class="kpi-sub">${ranked[0] ? ranked[0].v + "%" : ""}</div></div>
      <div class="kpi-card danger"><div class="kpi-top"><span class="kpi-label">Needs Support</span><span class="kpi-icon">${icon("book")}</span></div><div class="kpi-value" style="font-size:1.02rem">${esc(ranked.length ? ranked[ranked.length - 1].n : "—")}</div><div class="kpi-sub">${ranked.length ? ranked[ranked.length - 1].v + "%" : ""}</div></div>
    </div>

    <div class="card">
      <div class="card-header">
        <div class="card-title">${icon("clipboard")} Learning Area Performance — ${esc(cfg.currentTerm)} ${esc(cfg.currentYear)}</div>
        ${locked
          ? `<span class="badge badge-danger">Report card withheld — clear arrears of ${money(stu.balance)}</span>`
          : `<button class="btn btn-primary btn-sm" onclick="FLC.openReportCard('${stu.id}')">${icon("print", 13)} Open Official Report Card</button>`}
      </div>
      <div class="table-wrap">
        <table class="data-table">
          <thead><tr><th>Learning Area</th><th style="text-align:center">SBA (${cfg.sbaWeight}%)</th><th style="text-align:center">${esc(cfg.activeExamType)} (${cfg.examWeight}%)</th><th style="text-align:center">Final</th><th style="text-align:center">CBC Level</th><th>Teacher's Remark</th></tr></thead>
          <tbody>
            ${areas.map((l) => {
              const rec = assessments[l.code] || { sba: 0, exam: 0 };
              const final = recordScore(rec);
              const g = gradeFor(final);
              return `<tr>
                <td><strong>${esc(l.name)}</strong></td>
                <td style="text-align:center">${rec.sba}</td>
                <td style="text-align:center">${rec.exam}</td>
                <td style="text-align:center"><strong>${final}%</strong></td>
                <td style="text-align:center">${g.cbc ? `<span class="badge" style="background:${g.cbc.color}1a;color:${g.cbc.color}">${esc(g.cbc.code)} — ${esc(g.cbc.label)}</span>` : "—"}</td>
                <td style="font-size:0.78rem;color:var(--text-muted)">${esc(assessments[l.code + "_comment"] || (g.cbc ? g.cbc.remark : ""))}</td>
              </tr>`;
            }).join("")}
          </tbody>
        </table>
      </div>
    </div>

    <div class="grid-2">
      <div class="card">
        <div class="card-header"><div class="card-title">${icon("message")} Class Teacher & Principal Comments</div></div>
        <div style="font-size:0.87rem;margin-bottom:0.85rem"><strong>Class Teacher:</strong><br/>${esc(assessments.teacherComment || "—")}</div>
        <div style="font-size:0.87rem"><strong>Principal:</strong><br/>${esc(assessments.principalComment || "—")}</div>
        <div style="margin-top:1rem;font-size:0.83rem;color:var(--text-muted)">
          Next term opens: <strong>${esc(cfg.nextTermOpening)}</strong> &nbsp;|&nbsp; Current fee balance: <strong>${money(stu.balance)}</strong>
        </div>
      </div>
      <div class="card">
        <div class="card-header"><div class="card-title">${icon("sparkle")} CBC Core Competencies</div></div>
        ${Object.entries(stu.coreCompetencies || {}).map(([k, v]) => {
          const label = k.replace(/([A-Z])/g, " $1").replace(/^./, (m) => m.toUpperCase());
          const color = v === "Exceeding" ? "var(--success)" : v === "Meeting" ? "var(--primary)" : "var(--accent)";
          return `<div style="display:flex;justify-content:space-between;padding:0.5rem 0;border-bottom:1px dashed var(--border-color)">
            <span style="font-size:0.86rem">${esc(label)}</span>
            <span class="badge" style="background:${color}1a;color:${color}">${esc(v)} Expectations</span>
          </div>`;
        }).join("")}
      </div>
    </div>`;

  return pageShell("Report Card & Academic Progress", "Your child's competency-based assessment, class ranking and teacher remarks.", childSelectorBar(stu), body);
}

function pageParentNotices() {
  const body = `
    <div class="card">
      <div class="card-header">
        <div class="card-title">${icon("message")} School Notices, Circulars & SMS Alerts</div>
        <span class="badge badge-info">${State.db.communications.length} notices</span>
      </div>
      ${State.db.communications.map((c) => `
        <div style="padding:0.9rem 0;border-bottom:1px solid var(--border-color)">
          <div style="display:flex;justify-content:space-between;gap:0.5rem;flex-wrap:wrap">
            <strong style="font-size:0.92rem">${esc(c.title)}</strong>
            <span class="badge badge-neutral">${esc(c.date)}</span>
          </div>
          <div style="font-size:0.85rem;color:var(--text-muted);margin:5px 0">${esc(c.message)}</div>
          <div style="font-size:0.73rem;color:var(--text-muted)">${esc(c.audience)} · Sent by ${esc(c.sender)}</div>
        </div>`).join("")}
    </div>
    <div class="card" style="background:var(--primary-light);border-color:var(--primary)">
      <div style="font-size:0.85rem">
        <strong>Need to reach the school?</strong> Call ${esc(State.db.systemConfig.branding.phone)} or email ${esc(State.db.systemConfig.branding.email)}.
        For fee enquiries, the bursar's office is open Monday to Friday, 8:00 AM – 4:30 PM.
      </div>
    </div>`;
  return pageShell("School Notices & Alerts", "Official circulars, announcements and SMS notifications from Faith Learning Centre.", "", body);
}
