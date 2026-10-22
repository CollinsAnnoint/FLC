/* ============================================================================
   FAITH LEARNING CENTRE — Shared Terms & Conditions / Policy module
   Used by the public front page and by every portal inside the system.
   Exposes: window.FLCTerms
   ========================================================================= */
(function () {
  const STORAGE_PREFIX = "flc_terms_accepted_v";

  function cfgOf(db) {
    return (db && db.systemConfig && db.systemConfig.terms) || {};
  }
  function brandOf(db) {
    return (db && db.systemConfig && db.systemConfig.branding) || {};
  }
  function version(db) {
    return cfgOf(db).version || "1.0";
  }
  function key(db) {
    return STORAGE_PREFIX + version(db);
  }

  function isAccepted(db) {
    try {
      return !!localStorage.getItem(key(db));
    } catch (e) {
      return false;
    }
  }

  function acceptedRecord(db) {
    try {
      return JSON.parse(localStorage.getItem(key(db)) || "null");
    } catch (e) {
      return null;
    }
  }

  async function record(db, { role, portal, name }) {
    const payload = {
      role: role || "parent",
      portal: portal || "Parent & Student Portal",
      name: name || "Portal User",
      termsVersion: version(db)
    };
    try {
      localStorage.setItem(key(db), JSON.stringify({ ...payload, at: new Date().toISOString() }));
    } catch (e) {}
    try {
      const res = await fetch("/api/consents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const receipt = await res.json();
      // The portal no longer receives (or needs) the whole register; this session's
      // acceptance is recorded locally and merged where the compliance table is drawn.
      if (receipt && receipt.ok) {
        try {
          const ledger = JSON.parse(localStorage.getItem("flc_consent_log") || "[]");
          ledger.unshift({ ...receipt.consent, local: true });
          localStorage.setItem("flc_consent_log", JSON.stringify(ledger.slice(0, 50)));
        } catch (e) {}
      }
      return receipt;
    } catch (e) {
      return { ok: false };
    }
  }

  /* --------------------------- Document content --------------------------- */
  function clauses(db) {
    const t = cfgOf(db);
    const b = brandOf(db);
    const school = esc(b.schoolName || "the School");
    return [
      {
        title: "1. Introduction and Acceptance of Terms",
        body: [
          `${school} ("the School") is a Ministry of Education registered basic education institution operating under Registration No. ${b.regNumber || "—"}, KNEC Centre Code ${b.knecCode || "—"} and NEMIS Code ${b.nemisCode || "—"}.`,
          `These Terms and Conditions ("the Terms") govern the admission, enrolment, attendance, conduct, fee payment and use of school services and digital platforms by every learner, parent and guardian. By signing an admission form, accepting these Terms electronically, or accessing the Parent, Teacher or Bursar portal, you confirm that you have read, understood and agreed to be bound by them.`,
          `Where the learner is a minor, the parent or guardian accepts these Terms on the learner's behalf and undertakes to ensure compliance.`
        ]
      },
      {
        title: "2. Admission and Enrolment",
        body: [
          `Admission is granted at the absolute discretion of the School and is confirmed only upon issuance of an admission letter, completion of the learner's bio-data record (including NEMIS UPI and, where applicable, KNEC assessment number) and settlement of the admission deposit.`,
          `The parent or guardian warrants that all information supplied is true and accurate. Material misrepresentation may result in cancellation of admission without refund.`,
          `Enrolment continues from term to term unless the learner is withdrawn in accordance with Clause 16, or the School terminates enrolment under Clause 10.`
        ]
      },
      {
        title: "3. Fees, Payment Terms and Refunds",
        body: [
          `All fees must be paid by ${t.feeDeadlineWeek || "Week 3 of every term"} using M-Pesa Paybill ${(db.systemConfig.financeConfig || {}).mpesaPaybill || "—"} (Account: ${(db.systemConfig.financeConfig || {}).mpesaAccountPrefix || "ADM"}-[ADMISSION NUMBER]), bank transfer to ${(db.systemConfig.financeConfig || {}).bankName || "—"} or at the Bursar's office. Official receipts are issued for every payment and are available on the parent portal.`,
          `A place is reserved against the fee payable. ${t.arrearsAction || ""}`,
          `Refund of fees, less the non-refundable deposit and any consumed term costs, shall be processed within ${t.refundNoticeDays || 14} working days following written notice of withdrawal. No refund is payable for a learner who is suspended or expelled for disciplinary reasons.`,
          `The School reserves the right to review the fee structure at the beginning of any academic year, with written notice to parents through the official portal and SMS channels.`
        ]
      },
      {
        title: "4. Uniform, Learning Materials and Personal Property",
        body: [
          `Learners must attend in the correct school uniform as prescribed, present a neat appearance, and carry only equipment required for learning.`,
          `KICD-approved textbooks and learning materials issued on loan remain the property of the School. Lost or wilfully damaged items must be replaced or paid for at replacement cost.`,
          `The School does not accept liability for money, electronics or valuables brought to school; mobile phones and unauthorised devices are not permitted except where expressly authorised by the Principal.`
        ]
      },
      {
        title: "5. Attendance and Punctuality",
        body: [
          `Learners must report to school by 7:45 AM on every school day. ${t.attendanceRequirement || ""}`,
          `Parents or guardians of absent and late learners will receive automated notifications through SMS or the portal for their records and follow-up.`,
          `Absences in excess of fifteen (15) school days in a term without satisfactory explanation may result in the learner being required to repeat a level.`
        ]
      },
      {
        title: "6. Health, Safety, Medical Care and Emergency Consent",
        body: [
          `By accepting these Terms, the parent or guardian authorises the School, in case of emergency, to obtain such first aid, medical or hospital treatment as may be reasonably necessary, with costs borne by the parent or guardian.`,
          `Allergies, chronic conditions and medication must be disclosed in writing at admission and updated whenever they change. Boarders' medication is kept and administered by the school clinic.`,
          `The School maintains accident and public liability procedures, and every visitor and learner must observe all campus safety rules.`
        ]
      },
      {
        title: "7. Boarding and Pastoral Care",
        body: [
          `Boarding is available to approved learners only. Dormitory allocation, visitation days, exeat and prohibited-items rules are published and must be observed.`,
          `The School provides pastoral care, chaplaincy and guidance services. Parents are expected to cooperate with matrons, patrons and the guidance department on any pastoral follow-up.`
        ]
      },
      {
        title: "8. School Transport",
        body: [
          `School transport is offered for approved routes on payment of the termly transport fee. Seats are allocated on a first-come, first-served basis against the route capacity.`,
          `Learners must board and alight at the designated pickup points, observe the driver's and assistant's instructions, and maintain acceptable conduct aboard the school buses. Transport services may be withdrawn for persistent indiscipline.`
        ]
      },
      {
        title: "9. Learner Conduct and Discipline",
        body: [
          `Every learner is expected to uphold the School Code of Conduct, which is founded on respect, integrity, diligence and Christian values.`,
          `Discipline is administered through a graduated system of guidance, counselling, written warnings, parent conferences and, where warranted, a disciplinary panel convened in accordance with the Basic Education Act, 2013.`,
          `Corporal punishment is prohibited in the School. Serious offences, including violence, theft, substance abuse, bullying, examination malpractice or possession of weapons, may attract suspension or expulsion. ${t.academicHonesty || ""}`
        ]
      },
      {
        title: "10. Child Protection and Safeguarding",
        body: [
          `The School is committed to the protection of every child and complies with the Children Act and applicable safeguarding regulations. All staff are vetted and trained on child protection.`,
          `Any safeguarding concern should be reported immediately to the Designated Safeguarding Lead at the Principal's office. The School will act on every report and, where required, involve the relevant authorities.`
        ]
      },
      {
        title: "11. Data Protection and Privacy",
        body: [
          `The School processes learner, parent and staff personal data lawfully and transparently in line with the Data Protection Act, 2019, and solely for educational, administrative, pastoral, safety and statutory reporting purposes (including NEMIS and KNEC submissions).`,
          `Images and video recorded during school activities may be processed for internal reports, learning records and the School's controlled communications. Parents may opt out of non-essential photography in writing through the Data Protection Officer (${t.dpoEmail || "the school office"}).`,
          `The School does not sell personal data. Data is retained only for as long as necessary for statutory and academic record-keeping.`
        ]
      },
      {
        title: "12. Communications and Digital Platforms",
        body: [
          `SMS notifications, portal notices and e-mail form part of official school communication. Parents are responsible for keeping contact details current, and for reading notices issued through the portal.`,
          `Portal login credentials are confidential and issued to specific named users. Sharing credentials is prohibited. Users must accept these Terms on first login and are bound by the School's Acceptable Use Policy.`,
          `Misuse of school systems, including unauthorised access, data extraction or impairment of the system, is a disciplinary and legal offence.`
        ]
      },
      {
        title: "13. Academic Assessment and Reporting",
        body: [
          `Learning is assessed under the Competency-Based Curriculum through School-Based Assessment (SBA) and termly examinations, weighted ${(db.systemConfig.academicConfig || {}).sbaWeight || 40}% and ${(db.systemConfig.academicConfig || {}).examWeight || 60}% respectively, as configured by the School.`,
          `Report cards are issued each term and reflect a learner's competency levels, grades and teacher's remarks. National assessments (KPSEA and KJSEA) are administered at the prescribed levels and are governed by KNEC regulations.`,
          `The School's grading scales and assessment calendar are published in the portal and may be reviewed from year to year.`
        ]
      },
      {
        title: "14. Complaints and Dispute Resolution",
        body: [
          `Any complaint should first be raised with the class teacher, and thereafter with the relevant Head of Department, and if unresolved, with the Principal (${t.complaintsChannel || "in writing to the Principal's office"}).`,
          `The School will acknowledge every complaint within 5 working days and provide a written response within 14 working days. Unresolved matters may be escalated to the Board of Management.`
        ]
      },
      {
        title: "15. Withdrawal and Transfer",
        body: [
          `A parent or guardian wishing to withdraw a learner must give ${t.withdrawalNoticeDays || 30} days' written notice and obtain a Clearance Form confirming settlement of fees and return of school property, before a transfer letter or academic records are released.`,
          `The School shall issue the learner's academic records, including the NEMIS UPI and assessment records, within 10 working days of clearance.`
        ]
      },
      {
        title: "16. Amendments and Governing Law",
        body: [
          `The School may amend these Terms to reflect changes in law, regulation or school policy. The current version, effective date and change history are published on the portal, and continued enrolment after the effective date constitutes acceptance.`,
          `These Terms are governed by the Laws of Kenya, and any dispute shall be subject to the exclusive jurisdiction of the courts of Kenya.`
        ]
      }
    ];
  }

  function documentHtml(db) {
    const t = cfgOf(db);
    const b = brandOf(db);
    return `
      <div class="terms-doc">
        <div class="terms-header">
          <div class="terms-crest">${window.FLCBrand ? FLCBrand.mark("shield", 34) : ""}</div>
          <div>
            <h2>${esc(b.schoolName || "School")}</h2>
            <div class="terms-sub">${esc(b.address || "")}</div>
            <div class="terms-sub">${esc(b.phone || "")} · ${esc(b.email || "")}</div>
          </div>
        </div>
        <div class="terms-meta">
          <span class="badge badge-neutral">Document: School Terms &amp; Conditions</span>
          <span class="badge badge-info">Version ${esc(String(t.version || "1.0"))}</span>
          <span class="badge badge-neutral">Effective ${esc(t.effectiveDate || "—")}</span>
          <span class="badge badge-neutral">Last updated ${esc(t.lastUpdated || "—")}</span>
        </div>
        <p class="terms-preamble">
          Please read these Terms and Conditions carefully before enrolling a learner, paying fees, or using any
          Faith Learning Centre digital platform. Acceptance is recorded against your name, the portal used and
          the document version shown above.
        </p>
        ${clauses(db).map((c) => `
          <section class="terms-clause">
            <h4>${esc(c.title)}</h4>
            ${c.body.map((p) => `<p>${p}</p>`).join("")}
          </section>`).join("")}
        <div class="terms-footer">
          <div>
            <strong>Acknowledged by the School:</strong><br/>
            ${esc(b.principalName || "Principal")} — Principal<br/>
            <span class="terms-sub">${esc(b.schoolName || "")}</span>
          </div>
          <div style="text-align:right">
            <strong>Enquiries:</strong><br/>
            ${esc(b.phone || "")}<br/>
            <span class="terms-sub">${esc(t.dpoEmail || b.email || "")}</span>
          </div>
        </div>
      </div>`;
  }

  /* ------------------------------ Modal UI -------------------------------- */
  function modalHost() {
    return document.getElementById("modal-root") || document.body;
  }

  function open(db, opts = {}) {
    const t = cfgOf(db);
    modalHost().innerHTML = `
      <div class="modal-backdrop" onclick="if(event.target===this) FLCTerms.close()">
        <div class="modal-box" style="max-width:900px">
          <div class="modal-header">
            <h3 style="font-size:1.05rem;font-weight:800">School Terms &amp; Conditions — Version ${esc(String(t.version || "1.0"))}</h3>
            <button class="btn btn-outline btn-sm" onclick="FLCTerms.close()">✕ Close</button>
          </div>
          <div class="modal-body">${documentHtml(db)}</div>
          <div class="modal-footer">
            <button class="btn btn-outline" onclick="window.print()">Print / Save PDF</button>
            <button class="btn btn-primary" onclick="FLCTerms.close()">I have read these Terms</button>
          </div>
        </div>
      </div>`;
  }

  function close() {
    const host = modalHost();
    if (host && host.id === "modal-root") host.innerHTML = "";
  }

  /* ------------------------- Blocking acceptance gate --------------------- */
  function gate(db, opts = {}) {
    const t = cfgOf(db);
    const role = opts.role || "admin";
    const portalName = opts.portal || "Portal";
    modalHost().innerHTML = `
      <div class="modal-backdrop terms-gate">
        <div class="modal-box" style="max-width:920px">
          <div class="modal-header" style="background:#141316;color:#fff">
            <h3 style="font-size:1.02rem;font-weight:800">Terms &amp; Conditions — acceptance required</h3>
            <span class="badge" style="background:rgba(255,255,255,0.18);color:#fff">v${esc(String(t.version || "1.0"))}</span>
          </div>
          <div class="modal-body">
            <div class="terms-gate-note">
              Access to the ${esc(portalName)} is conditional upon acceptance of the School Terms &amp; Conditions
              (Version ${esc(String(t.version || "1.0"))}, effective ${esc(t.effectiveDate || "—")}).
              Please review the document and confirm your acceptance to continue.
            </div>
            <div class="terms-scroll">${documentHtml(db)}</div>
            <label class="terms-accept-row">
              <input type="checkbox" id="terms-gate-check" onchange="document.getElementById('terms-gate-btn').disabled = !this.checked" />
              <span>I confirm that I have read, understood and accept the School Terms &amp; Conditions on my own behalf and, where applicable, on behalf of the learner.</span>
            </label>
            <div id="terms-gate-error" class="terms-error" style="display:none">Please tick the acceptance box to continue.</div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-outline" onclick="window.print()">Print / Save PDF</button>
            <button class="btn btn-primary" id="terms-gate-btn" disabled onclick="FLCTerms.confirmGate()">Accept &amp; Continue</button>
          </div>
        </div>
      </div>`;
    window.__flcGateRole = role;
    window.__flcGatePortal = portalName;
    window.__flcGateCallback = opts.onAccept || null;
  }

  async function confirmGate() {
    const check = document.getElementById("terms-gate-check");
    const err = document.getElementById("terms-gate-error");
    if (!check || !check.checked) {
      if (err) err.style.display = "block";
      return;
    }
    const db = (window.State && window.State.db) || null;
    const role = window.__flcGateRole || "parent";
    const portal = window.__flcGatePortal || "Portal";
    if (db) await record(db, { role, portal, name: (window.State && window.State.db ? "Portal User" : "Portal User") });
    close();
    if (typeof window.__flcGateCallback === "function") window.__flcGateCallback();
  }

  /* -------------------- Reusable checkbox markup for forms ---------------- */
  function acceptanceCheckboxHtml(db, id) {
    const t = cfgOf(db);
    return `
      <label class="terms-accept-row compact">
        <input type="checkbox" id="${id}" />
        <span>I have read and accept the
          <a href="javascript:void(0)" onclick="FLCTerms.open(window.State ? window.State.db : window.__flcDb)">School Terms &amp; Conditions</a>
          (v${esc(String(t.version || "1.0"))}) on my own behalf and on behalf of the learner.</span>
      </label>`;
  }

  window.FLCTerms = {
    open,
    close,
    gate,
    confirmGate,
    documentHtml,
    clauses,
    acceptanceCheckboxHtml,
    version,
    isAccepted,
    acceptedRecord,
    record
  };
})();
