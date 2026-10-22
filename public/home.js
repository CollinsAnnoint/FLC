/* ============================================================================
   FAITH LEARNING CENTRE - home page ("Split Panel" design)
   Navy information panel beside a full-bleed photograph, a white figures band and
   crisp sections with steel-blue rules. Every section is generated from the live
   configuration (branding, term dates, fees, events, notices, contacts), and the
   Terms & Conditions gate is enforced on the enquiry form.
   ========================================================================= */
(function () {
  const IMG = {
    campus: "/assets/hero-1.jpg",
    ict: "/assets/hero-2.jpg",
    learners: "/assets/hero-3.jpg",
    classroom: "/assets/classroom.jpg",
    library: "/assets/library.jpg",
    sports: "/assets/sports.jpg",
    assembly: "/assets/assembly.jpg",
    community: "/assets/community.jpg"
  };

  const GALLERY = [
    [IMG.campus, "Classroom blocks and school grounds"],
    [IMG.ict, "ICT laboratory — digital literacy lessons"],
    [IMG.library, "Library and reading programme"],
    [IMG.classroom, "Learners at work in class"],
    [IMG.sports, "Games, sports and physical education"],
    [IMG.assembly, "Parade, scouts and co-curricular activities"],
    [IMG.community, "Community service learning and outreach"],
    [IMG.learners, "The journey to school, every morning"]
  ];

  /* ------------------------------ Data layer ------------------------------ */
  function db() { return window.State && State.db ? State.db : null; }
  function B() { const d = db(); return d ? d.systemConfig.branding : {}; }
  function AC() { const d = db(); return d ? d.systemConfig.academicConfig : {}; }
  function FI() { const d = db(); return d ? d.systemConfig.financeConfig : {}; }
  function TR() { const d = db(); return d ? d.systemConfig.terms : {}; }

  function mean() {
    const d = db();
    if (!d || !d.students.length) return 0;
    return Math.round(d.students.reduce((s, x) => s + studentAverage(x.id), 0) / d.students.length);
  }
  function attendance() {
    const d = db();
    if (!d || !d.students.length) return 0;
    return Math.round(d.students.reduce((s, x) => s + (x.attendanceRate || 0), 0) / d.students.length);
  }
  function levelFee(grade) {
    const d = db();
    if (!d) return null;
    return d.feeStructures.find((f) => f.grades.includes(grade)) || null;
  }
  function termsLink(label) {
    return `<button class="hs-link" onclick="FLCTerms.open(window.State.db)">${label || "Terms &amp; Conditions"}</button>`;
  }
  function loginBtn(cls, label) {
    return `<button class="btn ${cls || "btn-gold"}" onclick="Landing.openLogin()">${label || "Portal Login"}</button>`;
  }

  /* ------------------------------ Building blocks ------------------------- */
  function navBar(d, dark) {
    const b = B();
    const links = [["#about", "About"], ["#academics", "Academics"], ["#life", "School Life"],
      ["#calendar", "Term Dates"], ["#admissions", "Admissions"], ["#faq", "FAQs"], ["#contact", "Contact"]];
    return `
      <header class="hs-header ${dark ? "dark" : ""}" id="hs-header">
        <div class="hs-header-in">
          <a class="hs-brand" href="#top">
            <span class="hs-crest">${window.FLCBrand ? FLCBrand.mark(b.crestStyle || "shield", 30) : ""}</span>
            <span class="hs-brand-t"><strong>${esc(b.schoolName || "School")}</strong><em>${esc(b.motto || "")}</em></span>
          </a>
          <nav class="hs-nav" id="hs-nav">
            ${links.map(([h, l]) => `<a href="${h}">${l}</a>`).join("")}
            <a href="javascript:void(0)" onclick="FLCTerms.open(window.State.db)">Terms</a>
          </nav>
          <div class="hs-actions">
            <a class="btn btn-ghost-light hs-hide-sm" href="#admissions">Apply</a>
            ${loginBtn("btn-gold", "Portal")}
            <button class="hs-burger" aria-label="Menu" onclick="document.getElementById('hs-nav').classList.toggle('open')">☰</button>
          </div>
        </div>
      </header>`;
  }

  function stats(items, cls) {
    return `<div class="hs-stats ${cls || ""}">
      ${items.map(([v, l, suf]) => `<div class="hs-stat"><div class="hs-stat-v"><span data-count="${v}">0</span>${suf || ""}</div><div class="hs-stat-l">${esc(l)}</div></div>`).join("")}
    </div>`;
  }

  function statItems() {
    const d = db();
    return [
      [d.students.length, "Learners enrolled", ""],
      [d.staff.length, "Staff members", ""],
      [mean(), "School mean score", "%"],
      [attendance(), "Average attendance", "%"],
      [AC().learningAreas.filter((l) => l.active).length, "CBC learning areas", ""],
      [d.boardingHouses.length, "Dormitory houses", ""]
    ];
  }

  function aboutSec(d) {
    const b = B();
    return `<section class="hs-sec" id="about">
      <div class="hs-in">
        <div class="hs-sec-head">
          <span class="hs-kicker">About Us</span>
          <h2>An institution founded on faith, ordered for excellence</h2>
          <p>${esc(b.schoolName || "")} is a private basic education institution offering the Competency-Based
             Curriculum from Pre-Primary to Junior School in a disciplined, caring and technology-supported environment.</p>
        </div>
        <div class="hs-about">
          <div class="hs-about-copy">
            <div class="hs-block"><h3>Our Vision</h3><p>${esc(b.vision || "")}</p></div>
            <div class="hs-block"><h3>Our Mission</h3><p>${esc(b.mission || "")}</p></div>
            <div class="hs-chips">
              ${["Faith", "Integrity", "Excellence", "Discipline", "Service", "Compassion"].map((v) => `<span class="hs-chip">${v}</span>`).join("")}
            </div>
            <div class="hs-facts">
              <div><span>Registration</span><strong>${esc(b.regNumber || "—")}</strong></div>
              <div><span>KNEC Centre</span><strong>${esc(b.knecCode || "—")}</strong></div>
              <div><span>Head of Institution</span><strong>${esc(b.principalName || "—")}</strong></div>
            </div>
          </div>
          <figure class="hs-about-media">
            <img src="${IMG.classroom}" alt="Learners at Faith Learning Centre" loading="lazy" />
            <figcaption>${esc(b.shortName || "FLC")} · PP1 – Grade 9 (Junior School)</figcaption>
          </figure>
        </div>
      </div>
    </section>`;
  }

  function programmes() {
    const ac = AC();
    const d = db();
    const mk = (id, label, test) => ({ id, label, grades: ac.gradeLevels.filter(test) });
    const list = [
      mk("ecde", "Pre-Primary (ECDE)", (g) => g.startsWith("PP")),
      mk("lower", "Lower Primary", (g) => /^Grade [1-3]$/.test(g)),
      mk("upper", "Upper Primary", (g) => /^Grade [4-6]$/.test(g)),
      mk("jss", "Junior School", (g) => g.includes("JSS"))
    ];
    const copy = {
      ecde: "Activity-based literacy, numeracy and psychomotor development in bright, safe classrooms.",
      lower: "Continuous assessment in literacy and numeracy so every child reads, writes and reasons confidently.",
      upper: "Subject specialist teaching across nine learning areas with practical science and KPSEA preparation.",
      jss: "Laboratory science, pre-technical studies, community service learning and talent pathways."
    };
    return list.map((p) => {
      const f = p.grades[0] ? levelFee(p.grades[0]) : null;
      return { ...p, blurb: copy[p.id], fee: f, learners: d.students.filter((s) => p.grades.includes(s.grade)).length };
    });
  }

  function academicsSec(d) {
    const ac = AC();
    const progs = programmes();
    return `<section class="hs-sec ${d === "6" ? "dark" : "alt"}" id="academics">
      <div class="hs-in">
        <div class="hs-sec-head">
          <span class="hs-kicker">Academics</span>
          <h2>Competency-Based Curriculum, PP1 to Grade 9</h2>
          <p>Nine learning areas assessed through School-Based Assessment and termly examinations weighted
             ${ac.sbaWeight}% / ${ac.examWeight}%, reported on official CBC progress reports.</p>
        </div>
        <div class="hs-tabs" data-tabs="${d}">
          ${progs.map((p, i) => `<button class="hs-tab ${i === 0 ? "active" : ""}" data-tab="${d}-${p.id}">${esc(p.label)}</button>`).join("")}
        </div>
        ${progs.map((p, i) => `
          <div class="hs-panel ${i === 0 ? "active" : ""}" data-panel="${d}-${p.id}">
            <div class="hs-panel-main">
              <div class="hs-grade-row">${p.grades.map((g) => `<span class="hs-grade">${esc(g)}</span>`).join("")}</div>
              <p class="hs-lead">${esc(p.blurb)}</p>
              <div class="hs-panel-facts">
                <div><span>Learners</span><strong>${p.learners}</strong></div>
                <div><span>Term fee (day)</span><strong>${p.fee ? money(p.fee.totalDay) : "—"}</strong></div>
                ${p.fee && p.fee.boardingFee ? `<div><span>Term fee (boarding)</span><strong>${money(p.fee.totalBoarding)}</strong></div>` : ""}
              </div>
            </div>
            <div class="hs-panel-side">
              <h4>Learning areas</h4>
              <div class="hs-tags">${ac.learningAreas.filter((l) => l.active).map((l) => `<span class="hs-tag">${esc(l.name)}</span>`).join("")}</div>
            </div>
          </div>`).join("")}
      </div>
    </section>`;
  }

  function lifeSec(d) {
    const d0 = db();
    return `<section class="hs-sec" id="life">
      <div class="hs-in">
        <div class="hs-sec-head">
          <span class="hs-kicker">School Life</span>
          <h2>Learning, faith, sport and service</h2>
          <p>A well-rounded week: lessons, chapel and assembly, clubs, games and community service.</p>
        </div>
        <div class="hs-gallery ${d === "4" || d === "6" ? "compact" : ""}">
          ${GALLERY.slice(0, d === "4" ? 4 : 6).map(([src, cap], i) => `
            <figure class="hs-shot ${i === 0 && d !== "4" ? "wide" : ""}" data-full="${src}">
              <img src="${src}" alt="${esc(cap)}" loading="lazy" /><figcaption>${esc(cap)}</figcaption>
            </figure>`).join("")}
        </div>
        <div class="hs-life-cards">
          <div class="hs-life-card">
            <h3>Boarding</h3>
            <p>${d0.boardingHouses.length} houses · ${d0.boardingHouses.reduce((s, h) => s + h.capacity, 0)} beds</p>
            <ul>${d0.boardingHouses.map((h) => `<li><strong>${esc(h.name)}</strong><span>${esc(h.matron)}</span></li>`).join("")}</ul>
          </div>
          <div class="hs-life-card">
            <h3>Transport</h3>
            <p>Serviced school buses with pupil assistants</p>
            <ul>${d0.transportRoutes.map((r) => `<li><strong>${esc(r.routeName)}</strong><span>${esc(r.vehicleReg)} · ${money(r.termFee)}/term</span></li>`).join("")}</ul>
          </div>
          <div class="hs-life-card">
            <h3>Clubs &amp; Societies</h3>
            <p>CBC talent pathways across the school</p>
            <ul>${((db().systemConfig.customFields || []).find((c) => c.key === "talentClub") || { options: [] }).options.map((o) => `<li><strong>${esc(o)}</strong></li>`).join("")}</ul>
          </div>
        </div>
      </div>
    </section>`;
  }

  function calendarSec(d) {
    const ac = AC();
    const d0 = db();
    const t = TR();
    return `<section class="hs-sec ${d === "6" ? "dark" : "alt"}" id="calendar">
      <div class="hs-in">
        <div class="hs-sec-head">
          <span class="hs-kicker">Term Dates &amp; Calendar</span>
          <h2>Current term, key dates and school notices</h2>
        </div>
        <div class="hs-cal">
          <div class="hs-term">
            <h3>${esc(ac.currentTerm)} ${esc(ac.currentYear)}</h3>
            <div class="hs-term-rows">
              <div><span>Term opens</span><strong>${esc(ac.termStartDate)}</strong></div>
              <div><span>Term closes</span><strong>${esc(ac.termEndDate)}</strong></div>
              <div><span>Next term opens</span><strong>${esc(ac.nextTermOpening)}</strong></div>
              <div><span>Assessment in force</span><strong>${esc(ac.activeExamType)}</strong></div>
              <div><span>Fee deadline</span><strong>${esc(t.feeDeadlineWeek || "Week 3 of term")}</strong></div>
            </div>
          </div>
          <div class="hs-events">
            <h3>Upcoming events</h3>
            ${d0.events.map((e) => `<div class="hs-event">
              <div class="hs-ev-date"><strong>${esc(e.date.slice(8, 10))}</strong><span>${esc(new Date(e.date).toLocaleString("en-GB", { month: "short" }))}</span></div>
              <div><strong>${esc(e.title)}</strong><p>${esc(e.description)}</p><div class="hs-ev-meta">${esc(e.time)} · ${esc(e.venue)}</div></div>
            </div>`).join("")}
          </div>
          <div class="hs-notices">
            <h3>Noticeboard</h3>
            ${d0.communications.slice(0, 4).map((c) => `<div class="hs-notice"><strong>${esc(c.title)}</strong><span>${esc(c.date)}</span><p>${esc(c.message.slice(0, 110))}${c.message.length > 110 ? "…" : ""}</p></div>`).join("")}
          </div>
        </div>
      </div>
    </section>`;
  }

  function admissionsSec(d, opts) {
    const ac = AC();
    const steps = [
      ["Enquire &amp; visit", "Submit an enquiry or call the office for a campus tour and a meeting with the admissions team."],
      ["Submit the application", "Admission form with the learner's birth certificate, NEMIS UPI, previous report, transfer letter and immunisation card."],
      ["Assessment &amp; interview", "A readiness or placement assessment, plus a meeting with the class teacher and, for boarders, the matron or patron."],
      ["Offer, fees &amp; joining", "On admission, settle the deposit and term fees and accept the school Terms &amp; Conditions to receive joining instructions."]
    ];
    const form = opts && opts.inline ? "" : enquiryForm(d);
    return `<section class="hs-sec ${d === "6" ? "dark" : "alt"}" id="admissions">
      <div class="hs-in">
        <div class="hs-sec-head">
          <span class="hs-kicker">Admissions</span>
          <h2>Joining Faith Learning Centre</h2>
          <p>Admissions remain open while vacancies exist. Boarding places are limited and allocated on payment of the deposit.</p>
        </div>
        <div class="hs-steps">
          ${steps.map(([t, b], i) => `<div class="hs-step"><div class="hs-step-num">${String(i + 1).padStart(2, "0")}</div><div><h3>${t}</h3><p>${b}</p></div></div>`).join("")}
        </div>
        <div class="hs-require">
          <h4>Requirements checklist</h4>
          <ul class="hs-ticks">
            ${["Birth certificate &amp; NEMIS UPI", "Latest school report card", "Transfer or leaving certificate",
               "Immunisation / clinic card", "Passport photographs (2)", "Parent / guardian ID copies"].map((x) => `<li>${x}</li>`).join("")}
          </ul>
          <div class="hs-require-note">Admission is confirmed only upon acceptance of the ${termsLink("School Terms &amp; Conditions")}.</div>
        </div>
        ${form}
      </div>
    </section>`;
  }

  function enquiryForm(d, compact) {
    const ac = AC();
    return `<div class="hs-enquiry ${compact ? "compact" : ""}" id="enq-card-${d}">
      <h3>${compact ? "Quick Apply" : "Online Admission Enquiry"}</h3>
      <p class="hs-enq-sub">${compact ? "The admissions office responds within one working day." : "Complete this form and the admissions office will respond within one working day."}</p>
      <form onsubmit="Homes.submitEnquiry(event, '${d}')">
        <div class="hs-frow">
          <div class="form-group"><label for="enq-parent-${d}">Parent / Guardian Name *</label><input class="input" id="enq-parent-${d}" required /></div>
          <div class="form-group"><label for="enq-phone-${d}">Phone Number *</label><input class="input" id="enq-phone-${d}" placeholder="+254 7XX XXX XXX" required /></div>
        </div>
        <div class="hs-frow">
          <div class="form-group"><label for="enq-learner-${d}">Learner's Name</label><input class="input" id="enq-learner-${d}" /></div>
          <div class="form-group"><label for="enq-grade-${d}">Grade of Interest</label>
            <select class="select" id="enq-grade-${d}">${ac.gradeLevels.map((g) => `<option>${esc(g)}</option>`).join("")}</select></div>
        </div>
        ${compact ? "" : `<div class="hs-frow">
          <div class="form-group"><label for="enq-email-${d}">Email</label><input class="input" id="enq-email-${d}" type="email" /></div>
          <div class="form-group"><label for="enq-boarding-${d}">Boarding Preference</label>
            <select class="select" id="enq-boarding-${d}"><option>Day Scholar</option><option>Boarding</option><option>Undecided</option></select></div>
        </div>`}
        <div class="form-group"><label for="enq-message-${d}">Message</label><textarea class="textarea" id="enq-message-${d}" rows="${compact ? 2 : 3}" placeholder="Tell us about your learner and what you would like to know."></textarea></div>
        ${FLCTerms.acceptanceCheckboxHtml(db(), `enq-terms-${d}`)}
        <button type="submit" class="btn btn-primary btn-lg" style="width:100%">Submit Enquiry</button>
        <div class="hs-form-note">Processed under the Data Protection Act, 2019 for admissions purposes only.</div>
      </form>
    </div>`;
  }

  function faqSec(d) {
    const faqs = [
      ["How do I pay school fees?", `Fees are payable via M-Pesa Paybill ${FI().mpesaPaybill} using account ${FI().mpesaAccountPrefix}-[ADMISSION NUMBER], by bank transfer to ${FI().bankName}, or at the Bursar's office. Every payment is receipted and confirmed by SMS.`],
      ["Can my child join mid-term?", "Yes, where a vacancy exists. Term fees are payable in full and learners joining mid-term receive catch-up support from the class teacher."],
      ["Is boarding available?", `Boarding is available from Grade 4 upwards subject to bed availability. We operate ${db().boardingHouses.length} supervised houses with resident matrons and patrons.`],
      ["How is progress reported?", `Learners are assessed through SBA and termly examinations (${AC().sbaWeight}% / ${AC().examWeight}%). Report cards are issued each term through the parent portal with competency levels, grades and teacher's remarks.`],
      ["Which transport routes are served?", `${db().transportRoutes.map((r) => r.routeName).join("; ")}. Seats are allocated against payment of the termly transport fee.`],
      ["Why must I accept the Terms & Conditions?", "The Terms govern admission, fees, attendance, conduct, safeguarding, data protection and use of school digital platforms. Acceptance is recorded against your name and the document version."]
    ];
    return `<section class="hs-sec" id="faq">
      <div class="hs-in">
        <div class="hs-sec-head">
          <span class="hs-kicker">Frequently Asked</span>
          <h2>Questions parents ask us</h2>
        </div>
        <div class="hs-faqs">
          ${faqs.map(([q, a], i) => `<div class="hs-faq ${i === 0 ? "open" : ""}">
            <button class="hs-faq-q" onclick="Homes.toggleFaq(this)"><span>${esc(q)}</span><span class="hs-faq-sign">+</span></button>
            <div class="hs-faq-a"><p>${esc(a)}</p></div>
          </div>`).join("")}
        </div>
      </div>
    </section>`;
  }

  function contactSec(d) {
    const b = B();
    return `<section class="hs-sec ${d === "6" ? "dark" : "alt"}" id="contact">
      <div class="hs-in">
        <div class="hs-sec-head">
          <span class="hs-kicker">Contact &amp; Location</span>
          <h2>Visit, call or write to us</h2>
        </div>
        <div class="hs-contact">
          <div class="hs-contact-card">
            <h3>School Office</h3>
            <div class="hs-crow"><span>Address</span><strong>${esc(b.address || "")}</strong></div>
            <div class="hs-crow"><span>Telephone</span><strong>${esc(b.phone || "")}</strong></div>
            <div class="hs-crow"><span>Email</span><strong>${esc(b.email || "")}</strong></div>
            <div class="hs-crow"><span>Office hours</span><strong>Mon – Fri, 7:30 AM – 4:30 PM</strong></div>
            <div class="hs-crow"><span>Principal</span><strong>${esc(b.principalName || "")}</strong></div>
          </div>
          <div class="hs-contact-card">
            <h3>Portals</h3>
            <p class="hs-cnote">Parents, learners and staff sign in to the school portal. Access is issued by the administration and subject to the ${termsLink("Terms &amp; Conditions")}.</p>
            <div class="hs-portals">
              <button class="btn btn-gold" onclick="Landing.openLogin('parent')">Parent / Student</button>
              <button class="btn btn-outline" onclick="Landing.openLogin('teacher')">Teacher</button>
              <button class="btn btn-outline" onclick="Landing.openLogin('finance')">Bursar</button>
              <button class="btn btn-outline" onclick="Landing.openLogin('admin')">Administrator</button>
            </div>
          </div>
          <div class="hs-contact-card" id="fees">
            <h3>Fee Payment</h3>
            <div class="hs-crow"><span>M-Pesa Paybill</span><strong>${esc(FI().mpesaPaybill)}</strong></div>
            <div class="hs-crow"><span>Account</span><strong>${esc(FI().mpesaAccountPrefix)}-ADMNO</strong></div>
            <div class="hs-crow"><span>Bank</span><strong>${esc(FI().bankName)}</strong></div>
            <div class="hs-crow"><span>Account No</span><strong>${esc(FI().bankAccount)}</strong></div>
            <div class="hs-crow"><span>Deadline</span><strong>${esc(TR().feeDeadlineWeek || "Week 3")}</strong></div>
          </div>
        </div>
      </div>
    </section>`;
  }

  function footerBar() {
    const b = B();
    const t = TR();
    return `<footer class="hs-footer">
      <div class="hs-in hs-footer-in">
        <div>
          <div class="hs-fbrand"><span class="hs-crest">${window.FLCBrand ? FLCBrand.mark(b.crestStyle || "shield", 30) : ""}</span>
            <div><strong>${esc(b.schoolName || "")}</strong><em>${esc(b.motto || "")}</em></div></div>
          <p class="hs-ftext">A Ministry of Education registered Competency-Based Curriculum institution offering Pre-Primary, Primary and Junior School education in Nairobi, Kenya.</p>
          <div class="hs-fbadges"><span>KNEC ${esc(b.knecCode || "—")}</span><span>NEMIS ${esc(b.nemisCode || "—")}</span><span>Reg ${esc(b.regNumber || "—")}</span></div>
          <p class="hs-fcredit">Campus photography: openly licensed images from Wikimedia Commons (CC BY-SA 3.0/4.0 and public domain).</p>
        </div>
        <div><h4>Quick links</h4>
          ${[["#about", "About the school"], ["#academics", "Academic programmes"], ["#fees", "School fees"], ["#life", "School life"], ["#calendar", "Term dates"], ["#admissions", "Admissions"], ["#faq", "Parent FAQs"]]
            .map(([h, l]) => `<a href="${h}">${l}</a>`).join("")}
        </div>
        <div><h4>Portals</h4>
          <a href="javascript:void(0)" onclick="Landing.openLogin('parent')">Parent &amp; Student</a>
          <a href="javascript:void(0)" onclick="Landing.openLogin('teacher')">Teacher</a>
          <a href="javascript:void(0)" onclick="Landing.openLogin('finance')">Bursar / Finance</a>
          <a href="javascript:void(0)" onclick="Landing.openLogin('admin')">Administrator</a>
          <a href="javascript:void(0)" onclick="FLCTerms.open(window.State.db)">Terms &amp; Conditions v${esc(String(t.version || "1.0"))}</a>
        </div>
        <div><h4>Contact</h4>
          <div class="hs-ftext">${esc(b.address || "")}</div>
          <div class="hs-ftext">Tel: ${esc(b.phone || "")}</div>
          <div class="hs-ftext">Email: ${esc(b.email || "")}</div>
        </div>
      </div>
      <div class="hs-in hs-fbottom">
        <div>© ${new Date().getFullYear()} ${esc(b.schoolName || "")}. All rights reserved.</div>
        <div class="hs-flegal">
          ${termsLink("Terms &amp; Conditions")} <span>·</span>
          ${termsLink("Data Protection &amp; Privacy")} <span>·</span>
          <a href="javascript:void(0)" onclick="Landing.openLogin()">Portal login</a>
        </div>
      </div>
    </footer>`;
  }

  function heroSplit() {
    const b = B();
    return `<section class="hs-hero hs-hero-split">
      <div class="hs-split-panel">
        <span class="hs-eyebrow">Ministry of Education registered · KNEC ${esc(b.knecCode || "—")}</span>
        <h1>${esc(b.schoolName || "School")}</h1>
        <p class="hs-hero-lead">${esc(b.motto || "")}</p>
        <p class="hs-hero-sub">${esc(b.mission || "")}</p>
        <div class="hs-hero-actions">
          <a class="btn btn-gold btn-lg" href="#admissions">Apply for Admission</a>
          ${loginBtn("btn-outline-light btn-lg", "Parent &amp; Student Portal")}
        </div>
        <div class="hs-split-facts">
          ${statItems().slice(0, 3).map(([v, l, s]) => `<div><strong><span data-count="${v}">0</span>${s || ""}</strong><span>${esc(l)}</span></div>`).join("")}
        </div>
      </div>
      <div class="hs-split-photo">
        <img src="${IMG.campus}" alt="Faith Learning Centre campus" />
        <div class="hs-photo-tag">Ngong Road · Nairobi</div>
      </div>
    </section>`;
  }

  /* ------------------------------ Interactions ---------------------------- */
  function wire(id) {
    const root = document.querySelector(`.d${id}`);
    if (!root) return;

    // counters
    const counters = root.querySelectorAll("[data-count]");
    const runCount = (el) => {
      const target = Number(el.dataset.count) || 0;
      const start = performance.now();
      const tick = (now) => {
        const p = Math.min(1, (now - start) / 1100);
        el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3)));
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    };
    if ("IntersectionObserver" in window) {
      const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { runCount(e.target); io.unobserve(e.target); } }), { threshold: 0.3 });
      counters.forEach((c) => io.observe(c));
    } else counters.forEach(runCount);

    // staggered reveal
    root.querySelectorAll(".hs-sec, .hs-life-card, .hs-contact-card, .hs-shot, .hs-step, .hs-table-wrap").forEach((el, i) => {
      el.classList.add("hs-fade");
      setTimeout(() => el.classList.add("in"), Math.min(i * 45, 600));
    });

    // programme tabs
    root.querySelectorAll(".hs-tab").forEach((tab) => tab.addEventListener("click", () => {
      root.querySelectorAll(".hs-tab").forEach((t) => t.classList.remove("active"));
      root.querySelectorAll(".hs-panel").forEach((p) => p.classList.remove("active"));
      tab.classList.add("active");
      const panel = root.querySelector(`[data-panel="${tab.dataset.tab}"]`);
      if (panel) panel.classList.add("active");
    }));

    // gallery lightbox
    root.querySelectorAll(".hs-shot").forEach((fig) => fig.addEventListener("click", () => {
      const ov = document.createElement("div");
      ov.className = "lightbox";
      ov.innerHTML = `<img src="${fig.dataset.full}" alt="" /><div class="lightbox-close">✕</div>`;
      ov.addEventListener("click", () => ov.remove());
      document.body.appendChild(ov);
    }));

    // header state
    const header = document.getElementById("hs-header");
    const backTop = root.querySelector(".back-top");
    const onScroll = () => {
      if (header) header.classList.toggle("scrolled", window.scrollY > 40);
      if (backTop) backTop.classList.toggle("show", window.scrollY > 500);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    root.querySelectorAll(".hs-nav a").forEach((a) => a.addEventListener("click", () => {
      const n = document.getElementById("hs-nav"); if (n) n.classList.remove("open");
    }));

    // dark design keeps the header dark
    if (header && (id === "6" || id === "5" || id === "3")) header.classList.add("stay-dark");
  }

  function toggleFaq(btn) {
    const item = btn.closest(".hs-faq");
    const open = item.classList.contains("open");
    document.querySelectorAll(".hs-faq").forEach((f) => f.classList.remove("open"));
    if (!open) item.classList.add("open");
  }

  async function submitEnquiry(event, d) {
    event.preventDefault();
    const v = (id) => { const el = document.getElementById(id); return el ? el.value.trim() : ""; };
    const check = document.getElementById(`enq-terms-${d}`);
    if (!check || !check.checked) return toast("Please accept the School Terms & Conditions before submitting.", "error");
    const payload = {
      parentName: v(`enq-parent-${d}`),
      phone: v(`enq-phone-${d}`),
      email: v(`enq-email-${d}`),
      learnerName: v(`enq-learner-${d}`),
      gradeOfInterest: v(`enq-grade-${d}`),
      boardingPreference: v(`enq-boarding-${d}`) || "Day Scholar",
      message: v(`enq-message-${d}`)
    };
    if (!payload.parentName || !payload.phone) return toast("Parent name and phone number are required.", "error");
    try {
      const res = await api("/api/enquiries", "POST", payload);
      const card = document.getElementById(`enq-card-${d}`);
      if (card) card.innerHTML = `
        <div class="enquiry-success">
          <div class="success-mark">✓</div>
          <h3>Enquiry received</h3>
          <p>Thank you, ${esc(payload.parentName)}. Your enquiry for <strong>${esc(payload.learnerName || "your learner")}</strong>
             (${esc(payload.gradeOfInterest)}) is logged as reference <strong>${esc(res.enquiry.id.toUpperCase())}</strong>.</p>
          <p>The admissions office will call <strong>${esc(payload.phone)}</strong> within one working day.</p>
          <div class="enquiry-next">
            <button class="btn btn-outline" onclick="FLCTerms.open(window.State.db)">Read the Terms</button>
            <button class="btn btn-primary" onclick="location.reload()">Send another</button>
          </div>
        </div>`;
      toast("Admission enquiry submitted successfully.", "success");
    } catch (e) { toast(e.message, "error"); }
  }

  /* ------------------------------ Page render ----------------------------- */
  function page() {
    return [
      navBar("2"), heroSplit(), stats(statItems(), "band light"),
      aboutSec("2"), academicsSec("2"), calendarSec("2"), lifeSec("2"),
      admissionsSec("2"), faqSec("2"), contactSec("2"), footerBar()
    ].join("");
  }

  function render() {
    const root = document.getElementById("landing-root");
    if (!root) return;
    root.innerHTML = `<div class="site home hs-root d2" id="top">${page()}
      <button class="back-top" onclick="window.scrollTo({top:0,behavior:'smooth'})">\u2191</button></div>`;
    window.__flcRenderedHome = true;
    wire("2");
  }

  /* ------------------------------- Bootstrap ------------------------------ */
  // Tell landing.js to hand the home-page render to this module (avoids a double render).
  window.__flcHomeWillRender = true;

  async function init() {
    const root = document.getElementById("landing-root");
    if (!root) return;
    // homes.js (the seven-design dispatcher) owns the page when it is loaded.
    if (window.__flcDispatcher) return;
    for (let i = 0; i < 60 && !(window.State && State.db); i++) await new Promise((r) => setTimeout(r, 100));
    if (!(window.State && State.db)) { if (!window.__flcRenderedHome) Landing.renderSite(); return; }
    render();
  }

  window.Home = { render, toggleFaq, submitEnquiry, IMG };
  if (document.readyState === "loading") window.addEventListener("DOMContentLoaded", init);
  else init();
})();
