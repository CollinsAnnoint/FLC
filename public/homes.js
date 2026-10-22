/* ============================================================================
   FAITH LEARNING CENTRE — Home page design system (8 selectable designs)
   ----------------------------------------------------------------------------
   Design 1  Classic Heritage      landing.js  (dimmed slider, centred serif)
   Design 2  Split Panel           home.js     (corporate navy panel + full-bleed photo)
   Design 3  Editorial Broadsheet  this file   (nameplate, columns, noticeboard)
   Design 4  Minimal Corporate     this file   (whitespace, hairlines, short hero)
   Design 5  Bento Mosaic          this file   (mosaic tiles, bento cards)
   Design 6  Premium Dark          this file   (deep corporate navy, steel hairlines)
   Design 7  Admissions Focused    this file   (quick apply, fee table, sticky bar)
   Design 8  Collegiate Showcase   this file   (utility strip, centred hero, call-out band, card row)

   Every design is generated from the live configuration (branding, academic
   engine, fees, events, notices, contacts), uses the real school photographs in
   /assets, and keeps the Terms & Conditions gate on the enquiry and login forms.
   ========================================================================= */
(function () {
  "use strict";

  /* ------------------------------- Imagery -------------------------------- */
  const IMG = {
    campus: "/assets/hero-1.jpg",
    ict: "/assets/hero-2.jpg",
    learners: "/assets/hero-3.jpg",
    classroom: "/assets/classroom.jpg",
    library: "/assets/library.jpg",
    sports: "/assets/sports.jpg",
    assembly: "/assets/assembly.jpg",
    community: "/assets/community.jpg",
    /* school life — the ten photographs added to the gallery */
    learning1: "/assets/students-learning-1.jpg?v=15",
    learning2: "/assets/students-learning-2.jpg?v=15",
    discussion: "/assets/students-discussion.jpg?v=16",
    eating: "/assets/students-eating.jpg?v=15",
    praying: "/assets/students-praying.jpg?v=15",
    parading: "/assets/students-parading.jpg?v=15",
    award1: "/assets/students-award-1.jpg?v=15",
    award2: "/assets/students-award-2.jpg?v=15",
    playing1: "/assets/students-playing-1.jpg?v=16",
    playing2: "/assets/students-playing-2.jpg?v=15"
  };

  /* The captioned school-life gallery: learning, eating, playing, praying,
     parading, awarding and group discussion. */
  const LIFE = [
    ["learning1", "A lesson under way in a Senior High classroom", "Learning"],
    ["learning2", "Focused work at the desks", "Learning"],
    ["discussion", "Working through a task together at the computer", "Group discussion"],
    ["eating", "Lunch on the school timetable", "Eating together"],
    ["playing1", "Sports day — the relay on the running track", "Playing"],
    ["playing2", "Basketball practice after class", "Playing"],
    ["praying", "The school chapel", "Prayer"],
    ["parading", "The scout troop on parade at a school event", "Parading"],
    ["award1", "A winning team with the trophy and certificates", "Awarding"],
    ["award2", "The prize table on awards day", "Awarding"],
  ];
  const GALLERY = [
    [IMG.assembly, "Parade, scouts and co-curricular activities"],
    [IMG.classroom, "Learners at work in class"],
    [IMG.library, "Library and reading programme"],
    [IMG.sports, "Games and physical education"],
    [IMG.ict, "ICT hub and digital literacy"],
    [IMG.community, "Community service learning"],
    [IMG.campus, "Campus grounds and classroom blocks"],
    [IMG.learners, "The journey to school each morning"]
  ];

  /* ------------------------------ Data layer ------------------------------ */
  const db = () => (window.State && State.db) || null;
  const brand = () => (db() ? db().systemConfig.branding : {});
  const academic = () => (db() ? db().systemConfig.academicConfig : {});
  const fees = () => (db() ? db().systemConfig.financeConfig : {});
  const terms = () => (db() ? db().systemConfig.terms : {});
  const M = (n) => (typeof window.money === "function" ? money(n) : "KES " + Number(n || 0).toLocaleString("en-KE"));
  const E = (s) => (typeof window.esc === "function" ? esc(s) : String(s == null ? "" : s));

  function schoolMean() {
    const d = db();
    if (!d || !d.students.length || typeof studentAverage !== "function") return 0;
    return Math.round(d.students.reduce((s, x) => s + studentAverage(x.id), 0) / d.students.length);
  }
  function attendanceMean() {
    const d = db();
    if (!d || !d.students.length) return 0;
    return Math.round(d.students.reduce((s, x) => s + (x.attendanceRate || 0), 0) / d.students.length);
  }

  /* ------------------------------- Content -------------------------------- */
  function statsData() {
    const d = db();
    return [
      ["Learners Enrolled", d.students.length, ""],
      ["Teaching & Support Staff", d.staff.length, ""],
      ["School Mean Score", schoolMean(), "%"],
      ["Average Attendance", attendanceMean(), "%"],
      ["CBC Learning Areas", academic().learningAreas.filter((l) => l.active).length, ""],
      ["Dormitory Houses", d.boardingHouses.length, ""]
    ];
  }

  function programmeData() {
    const d = db();
    const ac = academic();
    const mk = (id, label, test, blurb) => {
      const grades = ac.gradeLevels.filter(test);
      const fee = d.feeStructures.find((f) => grades.some((g) => f.grades.includes(g))) || null;
      return {
        id, label, grades, blurb, fee,
        learners: d.students.filter((s) => grades.includes(s.grade)).length
      };
    };
    return [
      mk("ecde", "Pre-Primary (ECDE)", (g) => g.startsWith("PP"),
        "Activity-based literacy, numeracy and psychomotor development in bright, safe classrooms."),
      mk("lower", "Lower Primary", (g) => /^Grade [1-3]$/.test(g),
        "Continuous assessment in literacy and numeracy so every child reads, writes and reasons confidently."),
      mk("upper", "Upper Primary", (g) => /^Grade [4-6]$/.test(g),
        "Subject-specialist teaching across the learning areas with practical science and KPSEA preparation."),
      mk("jss", "Junior School (JSS)", (g) => g.includes("JSS") || g.includes("Grade 7") || g.includes("Grade 8") || g.includes("Grade 9"),
        "Laboratory science, pre-technical studies, community service learning and talent pathways.")
    ];
  }

  const faqsData = () => ([
    ["How do I pay school fees?",
      `Fees are payable through M-Pesa Paybill ${fees().mpesaPaybill} using the account format ${fees().mpesaAccountPrefix}-[ADMISSION NUMBER], by bank transfer to ${fees().bankName}, or at the Bursar's office. Every payment is receipted and confirmed by SMS.`],
    ["Can my child join mid-term?",
      "Yes, where a vacancy exists. Term fees are payable in full, and joining instructions are issued upon clearance. Learners joining mid-term receive catch-up support from the class teacher."],
    ["Is boarding available for all grades?",
      `Boarding is available from Grade 4 upwards, subject to bed availability. The school runs ${(db().boardingHouses || []).length} supervised houses with resident matrons and patrons.`],
    ["Which transport routes are served?",
      `${(db().transportRoutes || []).map((r) => r.routeName).join("; ")}. Seats are allocated against payment of the termly transport fee.`],
    ["How is learner progress reported?",
      `Learners are assessed through School-Based Assessment and termly examinations (${academic().sbaWeight}% / ${academic().examWeight}%). Report cards are issued each term through the parent portal with competency levels, grades and the teacher's remarks.`],
    ["Why do I have to accept the Terms & Conditions?",
      "The Terms govern admission, fees, attendance, conduct, safeguarding, data protection and use of the school's digital platforms. Acceptance is recorded against your name and the document version for accountability."]
  ]);

  function stepsData() {
    return [
      ["Enquire &amp; Book a Visit", "Submit the online enquiry or call the school office. You will be invited for a campus tour and a meeting with the admissions team."],
      ["Submit the Application", "Complete the admission form and attach the learner's birth certificate, NEMIS UPI, previous school report, transfer letter and immunisation record."],
      ["Assessment &amp; Interview", "The learner sits a friendly readiness or placement assessment; parents meet the class teacher and, for boarders, the matron or patron."],
      ["Offer, Fees &amp; Joining", "On admission, settle the deposit and term fees through M-Pesa or bank, accept the school Terms &amp; Conditions, and receive the joining instructions."]
    ];
  }

  const requirements = () => ([
    "Birth certificate &amp; NEMIS UPI", "Latest school report card", "Transfer or leaving certificate",
    "Immunisation / clinic card", "Passport photographs (2)", "Parent / guardian ID copies"
  ]);

  const noticesList = () => (db().communications || []).slice(0, 4);
  const eventsList = () => (db().events || []).slice(0, 4);
  const values = () => ["Faith", "Integrity", "Excellence", "Discipline", "Service", "Compassion"];

  const eventDate = (iso) => {
    const dd = new Date(iso);
    return {
      day: (iso || "").slice(8, 10),
      month: isNaN(dd) ? "" : dd.toLocaleString("en-GB", { month: "short" })
    };
  };

  /* --------------------------- Shared partials ---------------------------- */
  const navLinks = () => ([
    ["about", "About Us"], ["academics", "Academics"], ["life", "School Life"],
    ["calendar", "Term Dates"], ["admissions", "Admissions"], ["faq", "FAQs"], ["contact", "Contact"]
  ]);

  function brandMark(cls) {
    const b = brand();
    return `<span class="hx-brand ${cls || ""}">
      <span class="hx-crest" data-brand-mark="shield">${window.FLCBrand ? FLCBrand.mark(b.crestStyle || "shield", 30) : ""}</span>
      <span class="hx-brand-t"><strong>${E(b.schoolName || "School")}</strong><em>${E(b.motto || "")}</em></span>
    </span>`;
  }

  function navHtml(cls) {
    return `<nav class="hx-nav ${cls || ""}" id="hx-nav">
      ${navLinks().map(([id, l]) => `<a href="#${id}">${l}</a>`).join("")}
      <a href="javascript:void(0)" onclick="Landing.openTerms()">Terms</a>
    </nav>`;
  }

  function loginButtons(cls, compact) {
    if (compact) {
      return `<button class="hx-btn hx-btn-gold" onclick="Landing.openLogin()">Portal Login</button>`;
    }
    return `<button class="hx-btn hx-btn-gold" onclick="Landing.openLogin('parent')">Parent &amp; Student</button>
      <button class="hx-btn hx-btn-outline" onclick="Landing.openLogin('teacher')">Teacher</button>
      <button class="hx-btn hx-btn-outline" onclick="Landing.openLogin('finance')">Bursar</button>
      <button class="hx-btn hx-btn-outline" onclick="Landing.openLogin('admin')">Admin</button>`;
  }

  function statsRow(cls, count) {
    const list = statsData().slice(0, count || 6);
    return `<div class="hx-stats ${cls || ""}">
      ${list.map(([l, v, s]) => `<div class="hx-stat">
        <div class="hx-stat-v"><span data-count="${v}">0</span>${s}</div>
        <div class="hx-stat-l">${E(l)}</div>
      </div>`).join("")}
    </div>`;
  }

  /* canonical enquiry form — every design reuses this so the T&C gate and the
     admissions workflow stay identical */
  function enquiryForm(opts) {
    const o = opts || {};
    const ac = academic();
    return `<div class="enquiry-card hx-form-card" id="enquiry-card">
      <h3>${o.title || "Online Admission Enquiry"}</h3>
      <p class="enquiry-sub">${o.sub || "Complete this form and the admissions office will respond within one working day."}</p>
      <form id="enquiry-form" onsubmit="Landing.submitEnquiry(event)">
        <div class="form-row">
          <div class="form-group"><label for="enq-parent">Parent / Guardian Name *</label><input class="input" id="enq-parent" required /></div>
          <div class="form-group"><label for="enq-phone">Phone Number *</label><input class="input" id="enq-phone" placeholder="+254 7XX XXX XXX" required /></div>
        </div>
        <div class="form-row">
          <div class="form-group"><label for="enq-email">Email Address</label><input class="input" id="enq-email" type="email" /></div>
          <div class="form-group"><label for="enq-learner">Learner's Name</label><input class="input" id="enq-learner" /></div>
        </div>
        <div class="form-row">
          <div class="form-group"><label for="enq-grade">Grade of Interest</label>
            <select class="select" id="enq-grade">${ac.gradeLevels.map((g) => `<option>${E(g)}</option>`).join("")}</select></div>
          <div class="form-group"><label for="enq-boarding">Boarding Preference</label>
            <select class="select" id="enq-boarding"><option>Day Scholar</option><option>Boarding</option><option>Undecided</option></select></div>
        </div>
        <div class="form-group"><label for="enq-message">Message / Questions</label>
          <textarea class="textarea" id="enq-message" rows="3" placeholder="Tell us about your learner and what you would like to know."></textarea></div>
        ${FLCTerms.acceptanceCheckboxHtml(db(), "enq-terms")}
        <button type="submit" class="hx-btn hx-btn-primary hx-btn-block">Submit Enquiry</button>
        <div class="form-note">Your information is processed in line with the Data Protection Act, 2019 and used only for admissions purposes.</div>
      </form>
    </div>`;
  }

  function stepsHtml(cls) {
    return `<div class="hx-steps ${cls || ""}">
      ${stepsData().map(([t, b], i) => `<div class="hx-step">
        <div class="hx-step-num">${String(i + 1).padStart(2, "0")}</div>
        <h3>${t}</h3><p>${b}</p>
      </div>`).join("")}
    </div>`;
  }

  function requirementsHtml(cls) {
    return `<div class="hx-req ${cls || ""}">
      <h4>Requirements checklist</h4>
      <ul class="hx-ticks">${requirements().map((r) => `<li>${r}</li>`).join("")}</ul>
      <div class="hx-req-note">Admission is confirmed only upon acceptance of the
        <a href="javascript:void(0)" onclick="Landing.openTerms()">School Terms &amp; Conditions</a>.</div>
    </div>`;
  }

  function galleryHtml(cls, count, withCaptions) {
    const items = GALLERY.slice(0, count || 4);
    return `<div class="hx-gallery ${cls || ""}">
      ${items.map(([src, cap], i) => `<figure class="hx-shot ${i === 0 && (count || 4) % 2 === 1 ? "wide" : ""}" data-full="${src}">
        <img src="${src}" alt="${E(cap)}" loading="lazy" />
        ${withCaptions === false ? "" : `<figcaption>${E(cap)}</figcaption>`}
      </figure>`).join("")}
    </div>`;
  }

  function eventsHtml(cls) {
    return `<div class="hx-events ${cls || ""}">
      ${eventsList().map((e) => {
        const d = eventDate(e.date);
        return `<div class="hx-event">
          <div class="hx-ev-date"><strong>${E(d.day)}</strong><span>${E(d.month)}</span></div>
          <div><strong>${E(e.title)}</strong><p>${E(e.description || "")}</p>
            <div class="hx-ev-meta">${E(e.time || "")} · ${E(e.venue || "")}</div></div>
        </div>`;
      }).join("")}
    </div>`;
  }

  function noticesHtml(cls, max) {
    return `<div class="hx-notices ${cls || ""}">
      ${noticesList().slice(0, max || 4).map((n) => `<div class="hx-notice">
        <strong>${E(n.title)}</strong><span>${E(n.date || "")} · ${E(n.channel || "Notice")}</span>
        <p>${E(String(n.message || "").slice(0, 140))}${String(n.message || "").length > 140 ? "…" : ""}</p>
      </div>`).join("")}
    </div>`;
  }

  function termHtml(cls) {
    const a = academic();
    const t = terms();
    return `<div class="hx-term ${cls || ""}">
      <h4>${E(a.currentTerm)} ${E(a.currentYear)}</h4>
      <div class="hx-term-rows">
        <div><span>Term opens</span><strong>${E(a.termStartDate)}</strong></div>
        <div><span>Term closes</span><strong>${E(a.termEndDate)}</strong></div>
        <div><span>Next term opens</span><strong>${E(a.nextTermOpening)}</strong></div>
        <div><span>Assessment in force</span><strong>${E(a.activeExamType)}</strong></div>
        <div><span>Fee deadline</span><strong>${E(t.feeDeadlineWeek || "Week 3 of term")}</strong></div>
      </div>
    </div>`;
  }

  function faqHtml(cls) {
    return `<div class="hx-faqs ${cls || ""}">
      ${faqsData().map(([q, a], i) => `<div class="faq-item ${i === 0 ? "open" : ""}">
        <button class="faq-q" onclick="Landing.toggleFaq(this)"><span>${E(q)}</span><span class="faq-sign">+</span></button>
        <div class="faq-a"><p>${E(a)}</p></div>
      </div>`).join("")}
    </div>`;
  }

  function feeTable(cls) {
    const d = db();
    return `<div class="hx-table-wrap ${cls || ""}">
      <table class="hx-table">
        <thead><tr>
          <th>Level group</th><th>Grades</th><th class="num">Tuition</th><th class="num">Meals</th>
          <th class="num">CBC &amp; activities</th><th class="num">ICT &amp; library</th>
          <th class="num">Day total</th><th class="num">Boarding total</th>
        </tr></thead>
        <tbody>
          ${d.feeStructures.map((f) => `<tr>
            <td><strong>${E(f.levelGroup)}</strong></td>
            <td class="gr">${f.grades.map((g) => `<span>${E(g)}</span>`).join("")}</td>
            <td class="num">${M(f.tuition)}</td>
            <td class="num">${M(f.meals)}</td>
            <td class="num">${M(f.activityCbc)}</td>
            <td class="num">${M(f.ictLibrary)}</td>
            <td class="num strong">${M(f.totalDay)}</td>
            <td class="num strong">${f.boardingFee ? M(f.totalBoarding) : "—"}</td>
          </tr>`).join("")}
        </tbody>
      </table>
    </div>`;
  }

  function contactCards(cls) {
    const b = brand();
    return `<div class="hx-contact ${cls || ""}">
      <div class="hx-card">
        <h3>School Office</h3>
        <div class="hx-crow"><span>Address</span><strong>${E(b.address || "")}</strong></div>
        <div class="hx-crow"><span>Telephone</span><strong>${E(b.phone || "")}</strong></div>
        <div class="hx-crow"><span>Email</span><strong>${E(b.email || "")}</strong></div>
        <div class="hx-crow"><span>Website</span><strong>${E(b.website || "")}</strong></div>
        <div class="hx-crow"><span>Office hours</span><strong>Mon – Fri, 7:30 AM – 4:30 PM</strong></div>
        <div class="hx-crow"><span>Principal</span><strong>${E(b.principalName || "")}</strong></div>
      </div>
      <div class="hx-card">
        <h3>Portals</h3>
        <p class="hx-note">Existing parents, learners and staff sign in to the school portal. Access is issued by the
          school administration and is subject to the <a href="javascript:void(0)" onclick="Landing.openTerms()">Terms &amp; Conditions</a>.</p>
        <div class="hx-portals">${loginButtons()}</div>
      </div>
      <div class="hx-card">
        <h3>Fee payment</h3>
        <div class="hx-crow"><span>M-Pesa Paybill</span><strong>${E(fees().mpesaPaybill)}</strong></div>
        <div class="hx-crow"><span>Account number</span><strong>${E(fees().mpesaAccountPrefix)}-ADMNO</strong></div>
        <div class="hx-crow"><span>Bank</span><strong>${E(fees().bankName)}</strong></div>
        <div class="hx-crow"><span>Account</span><strong>${E(fees().bankAccount)}</strong></div>
        <div class="hx-crow"><span>Deadline</span><strong>${E(terms().feeDeadlineWeek || "Week 3")}</strong></div>
      </div>
    </div>`;
  }

  function footerHtml(cls) {
    const b = brand();
    const t = terms();
    return `<footer class="hx-footer ${cls || ""}">
      <div class="hx-in hx-footer-in">
        <div>
          <div class="hx-fbrand">${brandMark("light")}</div>
          <p class="hx-ftext">A Ministry of Education registered Competency-Based Curriculum institution offering
            Pre-Primary, Primary and Junior School education in Nairobi, Kenya.</p>
          <div class="hx-fbadges">
            <span>KNEC ${E(b.knecCode || "—")}</span>
            <span>NEMIS ${E(b.nemisCode || "—")}</span>
            <span>Reg ${E(b.regNumber || "—")}</span>
          </div>
          <p class="hx-fcredit">Campus and school-life photography: real, openly-licensed images from Wikimedia Commons
            (CC BY 2.0, CC BY-SA 3.0/4.0, CC0 and public domain) — individual credits in the school media register.</p>
        </div>
        <div>
          <h4>Quick links</h4>
          ${navLinks().map(([id, l]) => `<a href="#${id}">${l}</a>`).join("")}
        </div>
        <div>
          <h4>Portals</h4>
          <a href="javascript:void(0)" onclick="Landing.openLogin('parent')">Parent &amp; Student</a>
          <a href="javascript:void(0)" onclick="Landing.openLogin('teacher')">Teacher</a>
          <a href="javascript:void(0)" onclick="Landing.openLogin('finance')">Bursar / Finance</a>
          <a href="javascript:void(0)" onclick="Landing.openLogin('admin')">Administrator</a>
          <a href="javascript:void(0)" onclick="Landing.openTerms()">Terms &amp; Conditions v${E(String(t.version || "1.0"))}</a>
          <a href="/designs">Home page designs</a>
        </div>
        <div>
          <h4>Contact</h4>
          <div class="hx-ftext">${E(b.address || "")}</div>
          <div class="hx-ftext">Tel: ${E(b.phone || "")}</div>
          <div class="hx-ftext">Email: ${E(b.email || "")}</div>
        </div>
      </div>
      <div class="hx-in hx-fbottom">
        <div>© ${new Date().getFullYear()} ${E(b.schoolName || "")}. All rights reserved.</div>
        <div class="hx-flegal">
          <a href="javascript:void(0)" onclick="Landing.openTerms()">Terms &amp; Conditions</a><span>·</span>
          <a href="javascript:void(0)" onclick="Landing.openTerms()">Data Protection &amp; Privacy</a><span>·</span>
          <a href="/app">Portal login</a>
        </div>
      </div>
    </footer>`;
  }

  function backTop() {
    return `<button class="back-top" aria-label="Back to top" onclick="window.scrollTo({top:0,behavior:'smooth'})">↑</button>`;
  }

  /* ========================= DESIGN 3 — Editorial Broadsheet ============== */
  function design3() {
    const b = brand();
    const a = academic();
    const progs = programmeData();
    const today = new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
    return `
    <div class="site hx d3" id="home">
      <div class="d3-topline">
        <div class="hx-in d3-topline-in">
          <span>${E(a.currentTerm)} · ${E(a.currentYear)}</span>
          <span>${E(today)}</span>
          <span>${E(b.address || "")}</span>
          <span>KNEC ${E(b.knecCode || "—")}</span>
        </div>
      </div>
      <div class="d3-masthead">
        <div class="hx-in">
          <h1>${E(b.schoolName || "")}</h1>
          <p>${E(b.motto || "")}</p>
          <div class="d3-rules"></div>
        </div>
      </div>
      <nav class="d3-nav">
        <div class="hx-in d3-nav-in">
          ${navLinks().map(([id, l]) => `<a href="#${id}">${l}</a>`).join("")}
          <a href="javascript:void(0)" onclick="Landing.openTerms()">Terms &amp; Conditions</a>
          <button class="hx-btn hx-btn-primary hx-btn-sm" onclick="Landing.openLogin()">Portal Login</button>
        </div>
      </nav>

      <section class="d3-banner">
        <img src="${IMG.learners}" alt="Learners at Faith Learning Centre" />
        <div class="d3-banner-dim"></div>
        <div class="hx-in d3-banner-in">
          <span class="d3-stamp">Established institution · PP1 – Grade 9</span>
          <h2>Rooted in faith. Prepared for the future.</h2>
          <p>${E(b.mission || "")}</p>
          <div class="hx-actions">
            <a href="#admissions" class="hx-btn hx-btn-gold hx-btn-lg">Admissions open — apply</a>
            <button class="hx-btn hx-btn-outline-light hx-btn-lg" onclick="Landing.openLogin()">Portal login</button>
          </div>
        </div>
      </section>

      <section class="hx-sec d3-cols" id="about">
        <div class="hx-in d3-col-grid">
          <article class="d3-lead">
            <span class="hx-kick">From the institution</span>
            <h2 class="d3-headline">An ordered campus where faith and competence grow together</h2>
            ${statsRow("d3-inline-stats", 3)}
            <div class="d3-dropcap">
              <p>${E(b.schoolName || "")} is a private basic education institution offering the Competency-Based
                Curriculum from Pre-Primary to Junior School in a disciplined, caring and technology-supported
                environment. Class sizes are kept small, teachers are subject specialists, and every learner is known
                by name.</p>
            </div>
            <div class="d3-article-grid">
              <div><h4>Our Vision</h4><p>${E(b.vision || "")}</p></div>
              <div><h4>Our Mission</h4><p>${E(b.mission || "")}</p></div>
            </div>
            <div class="hx-chips">${values().map((v) => `<span class="hx-chip">${v}</span>`).join("")}</div>
          </article>

          <aside class="d3-life">
            <span class="hx-kick">Campus Life</span>
            ${GALLERY.slice(0, 3).map(([src, cap]) => `<figure class="d3-life-photo" data-full="${src}">
              <img src="${src}" alt="${E(cap)}" loading="lazy" /><figcaption>${E(cap)}</figcaption></figure>`).join("")}
            <div class="d3-facts">
              <div><span>Boarding houses</span><strong>${db().boardingHouses.length}</strong></div>
              <div><span>Transport routes</span><strong>${db().transportRoutes.length}</strong></div>
              <div><span>Club pathways</span><strong>${((db().systemConfig.customFields || []).find((c) => c.key === "talentClub") || { options: [] }).options.length}</strong></div>
            </div>
          </aside>

          <aside class="d3-board">
            <span class="hx-kick">Noticeboard</span>
            ${noticesHtml("d3-notices", 3)}
            ${termHtml("d3-term")}
            <div class="d3-board-events">
              <h4>Coming up</h4>
              ${eventsHtml("d3-events")}
            </div>
          </aside>
        </div>
      </section>

      <section class="hx-sec alt" id="academics">
        <div class="hx-in">
          <div class="d3-section-rule">
            <span class="hx-kick">Academics</span>
            <h2>Programmes, learning areas and fees</h2>
            <p>Assessed through School-Based Assessment and termly examinations weighted
              ${E(String(academic().sbaWeight))}% / ${E(String(academic().examWeight))}%, reported on official CBC progress reports.</p>
          </div>
          <div class="d3-index">
            ${progs.map((p, i) => `<div class="d3-index-row">
              <div class="d3-index-num">${String(i + 1).padStart(2, "0")}</div>
              <div class="d3-index-main">
                <h3>${E(p.label)}</h3>
                <p>${E(p.blurb)}</p>
                <div class="hx-tags">${p.grades.map((g) => `<span class="hx-tag">${E(g)}</span>`).join("")}</div>
              </div>
              <div class="d3-index-facts">
                <div><span>Learners</span><strong>${p.learners}</strong></div>
                <div><span>Term fee (day)</span><strong>${p.fee ? M(p.fee.totalDay) : "—"}</strong></div>
                ${p.fee && p.fee.boardingFee ? `<div><span>Boarding</span><strong>${M(p.fee.totalBoarding)}</strong></div>` : ""}
              </div>
            </div>`).join("")}
          </div>
          <div class="d3-learning-areas">
            <h4>Learning areas offered</h4>
            <div class="hx-tags">${academic().learningAreas.filter((l) => l.active).map((l) => `<span class="hx-tag">${E(l.name)}</span>`).join("")}</div>
          </div>
        </div>
      </section>

      <section class="hx-sec" id="life">
        <div class="hx-in">
          <div class="d3-section-rule">
            <span class="hx-kick">Gallery</span>
            <h2>School life in pictures</h2>
            <p>Parade and co-curricular activities, lessons, the library, games and community service.</p>
          </div>
          ${galleryHtml("d3-gallery", 6)}
        </div>
      </section>

      <section class="hx-sec alt" id="admissions">
        <div class="hx-in">
          <div class="d3-section-rule">
            <span class="hx-kick">Admissions</span>
            <h2>Joining ${E(b.shortName || "the school")}</h2>
            <p>Admissions remain open while vacancies exist. Boarding places are limited and allocated on payment of the deposit.</p>
          </div>
          <div class="d3-admissions">
            <div>
              ${stepsHtml("d3-steps")}
              ${requirementsHtml("d3-req")}
            </div>
            ${enquiryForm({ sub: "Complete this form and the admissions office will respond within one working day." })}
          </div>
        </div>
      </section>

      <section class="hx-sec" id="faq">
        <div class="hx-in">
          <div class="d3-section-rule"><span class="hx-kick">Frequently asked</span><h2>Questions parents ask us</h2></div>
          <div class="d3-faq-2col">${faqHtml("d3-faqs")}</div>
        </div>
      </section>

      <section class="hx-sec alt" id="calendar">
        <div class="hx-in d3-cal">
          ${termHtml()}
          <div class="hx-card"><h3>Upcoming events</h3>${eventsHtml()}</div>
          <div class="hx-card"><h3>Noticeboard</h3>${noticesHtml("", 3)}</div>
        </div>
      </section>

      <section class="hx-sec" id="contact">
        <div class="hx-in">
          <div class="d3-section-rule"><span class="hx-kick">Contact</span><h2>Visit, call or write to us</h2></div>
          ${contactCards("d3-contact")}
        </div>
      </section>

      ${footerHtml()}
      ${backTop()}
    </div>`;
  }

  /* ========================= DESIGN 4 — Minimal Corporate ================= */
  function design4() {
    const b = brand();
    const progs = programmeData();
    return `
    <div class="site hx d4" id="home">
      <header class="hx-header d4-header" id="hx-header">
        <div class="hx-in hx-header-in">
          ${brandMark()}
          ${navHtml("d4-nav")}
          <div class="hx-actions">
            <a href="#admissions" class="hx-btn hx-btn-quiet">Apply</a>
            <button class="hx-btn hx-btn-primary" onclick="Landing.openLogin()">Portal Login</button>
            <button class="hx-burger" aria-label="Menu" onclick="document.getElementById('hx-nav').classList.toggle('open')">☰</button>
          </div>
        </div>
      </header>

      <section class="d4-hero">
        <img src="${IMG.campus}" alt="Faith Learning Centre campus" />
        <div class="d4-hero-dim"></div>
        <div class="hx-in d4-hero-in">
          <span class="hx-kick light">Ministry of Education registered · CBC · Nairobi</span>
          <h1>${E(b.schoolName || "")}</h1>
          <p>${E(b.mission || "")}</p>
          <div class="hx-actions">
            <a href="#admissions" class="hx-btn hx-btn-primary hx-btn-lg">Apply for admission</a>
            <button class="hx-btn hx-btn-outline-light hx-btn-lg" onclick="Landing.openLogin()">Portal login</button>
          </div>
        </div>
      </section>

      <div class="d4-statrow">${statsRow("d4-stats", 6)}</div>

      <section class="hx-sec d4-sec" id="about">
        <div class="hx-in d4-row">
          <div class="d4-rail">
            <span class="hx-kick">About us</span>
            <h2>Faith, order and measurable progress</h2>
          </div>
          <div class="d4-body">
            <p class="hx-lead">${E(b.schoolName || "")} is a private basic education institution offering the
              Competency-Based Curriculum from Pre-Primary to Junior School in a disciplined, caring and
              technology-supported environment.</p>
            <div class="d4-pairs">
              <div><h4>Vision</h4><p>${E(b.vision || "")}</p></div>
              <div><h4>Mission</h4><p>${E(b.mission || "")}</p></div>
            </div>
            <div class="hx-chips light">${values().map((v) => `<span class="hx-chip">${v}</span>`).join("")}</div>
            <div class="d4-facts">
              <div><span>Registration</span><strong>${E(b.regNumber || "—")}</strong></div>
              <div><span>KNEC centre</span><strong>${E(b.knecCode || "—")}</strong></div>
              <div><span>Head of institution</span><strong>${E(b.principalName || "—")}</strong></div>
              <div><span>Campus</span><strong>${E(b.address || "—")}</strong></div>
            </div>
          </div>
        </div>
      </section>

      <section class="hx-sec d4-sec" id="academics">
        <div class="hx-in">
          <div class="d4-rail wide">
            <span class="hx-kick">Academics</span>
            <h2>Four programmes, one standard</h2>
            <p>Competency-Based Curriculum from Pre-Primary to Grade 9, assessed through School-Based Assessment and
              termly examinations.</p>
          </div>
          <div class="d4-cards">
            ${progs.map((p, i) => `<article class="d4-card">
              <div class="d4-card-num">${String(i + 1).padStart(2, "0")}</div>
              <h3>${E(p.label)}</h3>
              <p>${E(p.blurb)}</p>
              <div class="hx-tags">${p.grades.map((g) => `<span class="hx-tag">${E(g)}</span>`).join("")}</div>
              <div class="d4-card-foot">
                <span>${p.fee ? M(p.fee.totalDay) + " per term" : "Fee on request"}</span>
                <span>${p.learners} learners</span>
              </div>
            </article>`).join("")}
          </div>
        </div>
      </section>

      <section class="hx-sec d4-sec" id="life">
        <div class="hx-in">
          <div class="d4-rail wide"><span class="hx-kick">School life</span><h2>Beyond the classroom</h2>
            <p>Boarding, transport, clubs and service learning — a well-rounded week for every learner.</p></div>
          ${galleryHtml("d4-gallery", 4)}
          <div class="d4-life">
            <div><h4>Boarding</h4><p>${db().boardingHouses.length} supervised houses ·
              ${db().boardingHouses.reduce((s, h) => s + h.capacity, 0)} beds</p>
              <ul class="hx-plain">${db().boardingHouses.map((h) => `<li>${E(h.name)} — ${E(h.matron)}</li>`).join("")}</ul></div>
            <div><h4>Transport</h4><p>Serviced buses with pupil assistants</p>
              <ul class="hx-plain">${db().transportRoutes.map((r) => `<li>${E(r.routeName)} · ${M(r.termFee)}</li>`).join("")}</ul></div>
            <div><h4>Clubs &amp; societies</h4><p>CBC talent pathways</p>
              <ul class="hx-plain">${((db().systemConfig.customFields || []).find((c) => c.key === "talentClub") || { options: [] }).options.map((o) => `<li>${E(o)}</li>`).join("")}</ul></div>
          </div>
        </div>
      </section>

      <section class="hx-sec d4-sec alt" id="calendar">
        <div class="hx-in d4-cal">
          ${termHtml("d4-term")}
          <div class="d4-events"><h4>Upcoming events</h4>${eventsHtml()}</div>
          <div class="d4-notices"><h4>Notices</h4>${noticesHtml("", 3)}</div>
        </div>
      </section>

      <section class="hx-sec d4-sec" id="admissions">
        <div class="hx-in d4-adm">
          <div class="d4-rail">
            <span class="hx-kick">Admissions</span>
            <h2>Joining ${E(b.shortName || "the school")}</h2>
            <p>Admissions remain open while vacancies exist. Boarding places are limited and allocated on payment of the deposit.</p>
            ${requirementsHtml("d4-req")}
          </div>
          <div class="d4-adm-form">${enquiryForm({})}</div>
        </div>
      </section>

      <section class="hx-sec d4-sec" id="faq">
        <div class="hx-in d4-row">
          <div class="d4-rail"><span class="hx-kick">FAQs</span><h2>Questions parents ask us</h2></div>
          <div class="d4-body">${faqHtml()}</div>
        </div>
      </section>

      <section class="hx-sec d4-sec" id="contact">
        <div class="hx-in">
          <div class="d4-rail wide"><span class="hx-kick">Contact</span><h2>Visit, call or write to us</h2></div>
          ${contactCards()}
        </div>
      </section>

      ${footerHtml()}
      ${backTop()}
    </div>`;
  }

  /* ========================== DESIGN 5 — Bento Mosaic ===================== */
  function design5() {
    const b = brand();
    const progs = programmeData();
    return `
    <div class="site hx d5" id="home">
      <header class="d5-topbar">
        <div class="hx-in d5-topbar-in">
          ${brandMark("dark")}
          <div class="hx-actions">
            <a href="#admissions" class="hx-btn hx-btn-gold hx-btn-sm">Apply</a>
            <button class="hx-btn hx-btn-outline-light hx-btn-sm" onclick="Landing.openLogin()">Portal</button>
            <button class="hx-burger light" aria-label="Menu" onclick="document.getElementById('hx-nav').classList.toggle('open')">☰</button>
          </div>
        </div>
        ${navHtml("d5-nav")}
      </header>

      <section class="d5-bento">
        <div class="hx-in d5-grid">
          <div class="d5-tile photo hero">
            <img src="${IMG.campus}" alt="Campus" />
            <div class="d5-tile-dim"></div>
            <div class="d5-tile-copy">
              <span class="hx-kick light">Ministry of Education registered · KNEC ${E(b.knecCode || "—")}</span>
              <h1>${E(b.schoolName || "")}</h1>
              <p>${E(b.motto || "")}</p>
              <div class="hx-actions">
                <a href="#admissions" class="hx-btn hx-btn-gold">Apply for admission</a>
                <button class="hx-btn hx-btn-outline-light" onclick="Landing.openLogin()">Portal login</button>
              </div>
            </div>
          </div>
          <div class="d5-tile navy motto">
            <span class="hx-kick gold">Our promise</span>
            <p>${E(b.vision || "")}</p>
            <div class="hx-chips dark">${values().slice(0, 4).map((v) => `<span class="hx-chip">${v}</span>`).join("")}</div>
          </div>
          <div class="d5-tile gold stat">
            <strong><span data-count="${schoolMean()}">0</span>%</strong>
            <span>School mean score</span>
          </div>
          <figure class="d5-tile photo" data-full="${IMG.ict}"><img src="${IMG.ict}" alt="ICT hub" loading="lazy" /></figure>
          <figure class="d5-tile photo" data-full="${IMG.sports}"><img src="${IMG.sports}" alt="Games" loading="lazy" /></figure>
          <div class="d5-tile light cta">
            <h3>Admissions open</h3>
            <p>Limited boarding places for Grade 4 – 9. Replies within one working day.</p>
            <a href="#admissions" class="hx-btn hx-btn-primary hx-btn-sm">Start an enquiry</a>
          </div>
        </div>
      </section>

      <section class="hx-sec d5-sec" id="about">
        <div class="hx-in">
          <div class="d5-head"><span class="hx-kick">About us</span><h2>A school you can walk into and recognise</h2></div>
          <div class="d5-about">
            <div class="d5-card wide">
              <h3>Who we are</h3>
              <p>${E(b.schoolName || "")} is a private basic education institution offering the Competency-Based
                Curriculum from Pre-Primary to Junior School in a disciplined, caring and technology-supported
                environment.</p>
              <div class="d5-med">
                <figure data-full="${IMG.classroom}"><img src="${IMG.classroom}" alt="Classroom" loading="lazy" /></figure>
                <div>
                  <div class="hx-crow"><span>Registration</span><strong>${E(b.regNumber || "—")}</strong></div>
                  <div class="hx-crow"><span>Head</span><strong>${E(b.principalName || "—")}</strong></div>
                  <div class="hx-crow"><span>Campus</span><strong>${E(b.address || "—")}</strong></div>
                </div>
              </div>
            </div>
            <div class="d5-card">
              <h3>Vision</h3><p>${E(b.vision || "")}</p>
            </div>
            <div class="d5-card">
              <h3>Mission</h3><p>${E(b.mission || "")}</p>
            </div>
            <div class="d5-card stats-card">
              ${statsRow("d5-stats", 4)}
            </div>
          </div>
        </div>
      </section>

      <section class="hx-sec d5-sec" id="academics">
        <div class="hx-in">
          <div class="d5-head"><span class="hx-kick">Academics</span><h2>Four programmes, one standard</h2></div>
          <div class="d5-progs">
            ${progs.map((p) => `<article class="d5-prog">
              <h3>${E(p.label)}</h3>
              <p>${E(p.blurb)}</p>
              <div class="hx-tags">${p.grades.map((g) => `<span class="hx-tag">${E(g)}</span>`).join("")}</div>
              <div class="d5-prog-facts">
                <span>${p.fee ? M(p.fee.totalDay) + " / term" : "Fee on request"}</span>
                <span>${p.learners} learners</span>
              </div>
            </article>`).join("")}
          </div>
        </div>
      </section>

      <section class="hx-sec d5-sec" id="life">
        <div class="hx-in">
          <div class="d5-head"><span class="hx-kick">School life</span><h2>Boarding, sport, service and talent</h2></div>
          ${galleryHtml("d5-mosaic", 5)}
        </div>
      </section>

      <section class="hx-sec d5-sec" id="calendar">
        <div class="hx-in d5-cal">
          ${termHtml("d5-term")}
          <div class="d5-card"><h3>Upcoming events</h3>${eventsHtml()}</div>
          <div class="d5-card"><h3>Noticeboard</h3>${noticesHtml("", 3)}</div>
        </div>
      </section>

      <section class="hx-sec d5-sec" id="admissions">
        <div class="hx-in d5-adm">
          <div>
            <span class="hx-kick">Admissions</span>
            <h2>Joining ${E(b.shortName || "the school")}</h2>
            ${stepsHtml("d5-steps")}
            ${requirementsHtml("d5-req")}
          </div>
          ${enquiryForm({})}
        </div>
      </section>

      <section class="hx-sec d5-sec" id="faq">
        <div class="hx-in">
          <div class="d5-head"><span class="hx-kick">FAQs</span><h2>Questions parents ask us</h2></div>
          <div class="d5-faq">${faqHtml()}</div>
        </div>
      </section>

      <section class="hx-sec d5-sec" id="contact">
        <div class="hx-in">
          <div class="d5-head"><span class="hx-kick">Contact</span><h2>Visit, call or write to us</h2></div>
          ${contactCards("d5-contact")}
        </div>
      </section>

      ${footerHtml()}
      ${backTop()}
    </div>`;
  }

  /* ========================= DESIGN 6 — Premium Dark ====================== */
  function design6() {
    const b = brand();
    const progs = programmeData();
    return `
    <div class="site hx d6" id="home">
      <header class="hx-header d6-header" id="hx-header">
        <div class="hx-in hx-header-in">
          ${brandMark("light")}
          ${navHtml("d6-nav")}
          <div class="hx-actions">
            <a href="#admissions" class="hx-btn hx-btn-gold hx-btn-sm">Apply</a>
            <button class="hx-btn hx-btn-outline-light hx-btn-sm" onclick="Landing.openLogin()">Portal</button>
            <button class="hx-burger light" aria-label="Menu" onclick="document.getElementById('hx-nav').classList.toggle('open')">☰</button>
          </div>
        </div>
      </header>

      <section class="d6-hero">
        <div class="hx-in d6-hero-in">
          <div class="d6-hero-copy">
            <span class="hx-kick gold">Ministry of Education registered · CBC · Nairobi</span>
            <h1>${E(b.schoolName || "")}</h1>
            <div class="d6-rule"></div>
            <p class="d6-motto">${E(b.motto || "")}</p>
            <p class="hx-lead dark">${E(b.vision || "")}</p>
            <div class="hx-actions">
              <a href="#admissions" class="hx-btn hx-btn-gold hx-btn-lg">Apply for admission</a>
              <button class="hx-btn hx-btn-outline-light hx-btn-lg" onclick="Landing.openLogin()">Portal login</button>
            </div>
            <div class="d6-facts">
              ${statsData().slice(0, 4).map(([l, v, s]) => `<div>
                <strong><span data-count="${v}">0</span>${s}</strong><span>${E(l)}</span></div>`).join("")}
            </div>
          </div>
          <div class="d6-hero-strip">
            ${[IMG.campus, IMG.learners, IMG.classroom].map((src, i) => `<figure data-full="${src}">
              <img src="${src}" alt="Faith Learning Centre" loading="lazy" /></figure>`).join("")}
          </div>
        </div>
      </section>

      <section class="hx-sec d6-sec" id="about">
        <div class="hx-in d6-about">
          <div>
            <span class="hx-kick gold">About us</span>
            <h2>An institution built on character</h2>
            <p class="hx-lead dark">${E(b.mission || "")}</p>
            <div class="hx-chips dark">${values().map((v) => `<span class="hx-chip">${v}</span>`).join("")}</div>
            <div class="d6-facts wide">
              <div><strong>${E(b.regNumber || "—")}</strong><span>MoE registration</span></div>
              <div><strong>${E(b.knecCode || "—")}</strong><span>KNEC centre</span></div>
              <div><strong>${E(b.nemisCode || "—")}</strong><span>NEMIS code</span></div>
            </div>
          </div>
          <figure class="d6-about-photo" data-full="${IMG.assembly}">
            <img src="${IMG.assembly}" alt="School parade" loading="lazy" />
            <figcaption>${E(b.shortName || "FLC")} · PP1 – Grade 9 (Junior School)</figcaption>
          </figure>
        </div>
      </section>

      <section class="hx-sec d6-sec alt" id="academics">
        <div class="hx-in">
          <div class="d6-head"><span class="hx-kick gold">Academics</span>
            <h2>Competency-Based Curriculum, PP1 to Grade 9</h2>
            <p class="hx-lead dark">Nine learning areas assessed through School-Based Assessment and termly examinations
              weighted ${E(String(academic().sbaWeight))}% / ${E(String(academic().examWeight))}%.</p></div>
          <div class="d6-progs">
            ${progs.map((p, i) => `<article class="d6-prog">
              <div class="d6-num">${String(i + 1).padStart(2, "0")}</div>
              <h3>${E(p.label)}</h3>
              <p>${E(p.blurb)}</p>
              <div class="hx-tags dark">${p.grades.map((g) => `<span class="hx-tag">${E(g)}</span>`).join("")}</div>
              <div class="d6-prog-foot"><span>${p.fee ? M(p.fee.totalDay) + " per term" : "On request"}</span><span>${p.learners} learners</span></div>
            </article>`).join("")}
          </div>
        </div>
      </section>

      <section class="hx-sec d6-sec" id="life">
        <div class="hx-in">
          <div class="d6-head"><span class="hx-kick gold">School life</span><h2>Boarding, sport and service</h2></div>
          ${galleryHtml("d6-gallery", 4)}
          <div class="d6-life">
            <div><h4>Boarding</h4><p>${db().boardingHouses.length} houses ·
              ${db().boardingHouses.reduce((s, h) => s + h.capacity, 0)} beds</p>
              <ul class="hx-plain">${db().boardingHouses.map((h) => `<li>${E(h.name)} — ${E(h.matron)}</li>`).join("")}</ul></div>
            <div><h4>Transport</h4><p>${db().transportRoutes.length} routes across Nairobi</p>
              <ul class="hx-plain">${db().transportRoutes.map((r) => `<li>${E(r.routeName)} · ${M(r.termFee)}</li>`).join("")}</ul></div>
            <div><h4>Talent pathways</h4>
              <ul class="hx-plain">${((db().systemConfig.customFields || []).find((c) => c.key === "talentClub") || { options: [] }).options.map((o) => `<li>${E(o)}</li>`).join("")}</ul></div>
          </div>
        </div>
      </section>

      <section class="hx-sec d6-sec alt" id="calendar">
        <div class="hx-in d6-cal">
          ${termHtml("d6-term")}
          <div class="d6-panel"><h3>Upcoming events</h3>${eventsHtml()}</div>
          <div class="d6-panel"><h3>Noticeboard</h3>${noticesHtml("", 3)}</div>
        </div>
      </section>

      <section class="hx-sec d6-sec" id="admissions">
        <div class="hx-in d6-adm">
          <div>
            <span class="hx-kick gold">Admissions</span>
            <h2>Joining ${E(b.shortName || "the school")}</h2>
            ${stepsHtml("d6-steps")}
            ${requirementsHtml("d6-req")}
          </div>
          <div class="d6-form-holder">${enquiryForm({})}</div>
        </div>
      </section>

      <section class="hx-sec d6-sec alt" id="faq">
        <div class="hx-in d6-faq-wrap">
          <div class="d6-head"><span class="hx-kick gold">FAQs</span><h2>Questions parents ask us</h2></div>
          ${faqHtml()}
        </div>
      </section>

      <section class="hx-sec d6-sec" id="contact">
        <div class="hx-in">
          <div class="d6-head"><span class="hx-kick gold">Contact</span><h2>Visit, call or write to us</h2></div>
          ${contactCards("d6-contact")}
        </div>
      </section>

      ${footerHtml()}
      ${backTop()}
    </div>`;
  }

  /* ====================== DESIGN 7 — Admissions Focused =================== */
  function design7() {
    const b = brand();
    const t = terms();
    const f = fees();
    return `
    <div class="site hx d7" id="home">
      <header class="hx-header d7-header" id="hx-header">
        <div class="hx-in hx-header-in">
          ${brandMark()}
          <div class="d7-header-mid">
            <a href="tel:${E(String(b.phone || "").replace(/\\s/g, ""))}">${E(b.phone || "")}</a>
            <span>Admissions open · replies in one working day</span>
          </div>
          <div class="hx-actions">
            <button class="hx-btn hx-btn-outline hx-btn-sm" onclick="Landing.openLogin()">Portal</button>
            <a href="#admissions" class="hx-btn hx-btn-gold hx-btn-sm">Apply now</a>
          </div>
        </div>
      </header>

      <section class="d7-hero">
        <div class="hx-in d7-hero-in">
          <div class="d7-hero-copy">
            <span class="hx-kick light">Admissions open · ${E(academic().currentTerm)} ${E(academic().currentYear)}</span>
            <h1>Give your child a place at ${E(b.schoolName || "our school")}</h1>
            <p class="hx-lead light">Competency-Based Curriculum from PP1 to Grade 9 · day and boarding ·
              ${db().transportRoutes.length} bus routes · secure, disciplined campus on Ngong Road, Nairobi.</p>
            <ul class="d7-bullets">
              <li>Limited boarding places — allocated on payment of the deposit</li>
              <li>Assessment and interview scheduled within one week of enquiry</li>
              <li>Fees payable by M-Pesa Paybill ${E(f.mpesaPaybill)} or bank transfer</li>
              <li>Admission confirmed on acceptance of the school Terms &amp; Conditions</li>
            </ul>
            <div class="d7-hero-stats">${statsRow("d7-stats", 4)}</div>
          </div>

          <div class="d7-quick" id="quick-card">
            <div class="d7-quick-head">
              <span class="hx-kick gold">Quick apply</span>
              <h3>Request a call back today</h3>
              <p>Three details is all we need. The admissions office responds within one working day.</p>
            </div>
            <form onsubmit="Homes.submitQuick(event)">
              <div class="form-group"><label for="quick-parent">Parent / Guardian name *</label>
                <input class="input" id="quick-parent" required /></div>
              <div class="form-group"><label for="quick-phone">Phone number *</label>
                <input class="input" id="quick-phone" placeholder="+254 7XX XXX XXX" required /></div>
              <div class="form-group"><label for="quick-grade">Grade of interest</label>
                <select class="select" id="quick-grade">${academic().gradeLevels.map((g) => `<option>${E(g)}</option>`).join("")}</select></div>
              <label class="d7-check">
                <input type="checkbox" id="quick-terms" />
                <span>I accept the <a href="javascript:void(0)" onclick="Landing.openTerms()">School Terms &amp; Conditions</a>
                  (v${E(String(t.version || "1.0"))}) and consent to being contacted.</span>
              </label>
              <button type="submit" class="hx-btn hx-btn-primary hx-btn-block hx-btn-lg">Request a call back</button>
              <div class="form-note">Or call the office on ${E(b.phone || "")} · Mon – Fri, 7:30 AM – 4:30 PM.</div>
            </form>
          </div>
        </div>
      </section>

      <span class="hx-anchor" id="academics" aria-hidden="true"></span>
      <section class="hx-sec d7-sec" id="fees">
        <div class="hx-in">
          <div class="d7-head"><span class="hx-kick">School fees</span><h2>Term fees by level — fully itemised</h2>
            <p>Payable by ${E(t.feeDeadlineWeek || "Week 3 of every term")} through M-Pesa Paybill ${E(f.mpesaPaybill)}
              (account ${E(f.mpesaAccountPrefix)}-ADMNO) or ${E(f.bankName)}. Every payment is receipted.</p></div>
          ${feeTable()}
          <div class="d7-fee-note">
            <div><h4>Payment channels</h4>
              <ul class="hx-plain">
                ${(f.paymentChannels || []).filter((c) => c.enabled).map((c) => `<li>${E(c.label)} — <strong>${E(c.detail || "")}</strong>${c.temporary ? " <span class=\"d8-temp\">temporary</span>" : ""}</li>`).join("")}
                ${(f.paymentChannels || []).length ? "" : `<li>M-Pesa Paybill <strong>${E(f.mpesaPaybill)}</strong>, account <strong>${E(f.mpesaAccountPrefix)}-ADMNO</strong></li>
                <li>${E(f.bankName)} · account ${E(f.bankAccount)}</li>`}
              </ul></div>
            <div><h4>Refunds &amp; withdrawal</h4>
              <p class="hx-note">Refunds are processed within ${E(String(t.refundNoticeDays || 14))} working days of written
                notice of withdrawal, in line with the <a href="javascript:void(0)" onclick="Landing.openTerms()">Terms &amp; Conditions</a>.</p></div>
          </div>
        </div>
      </section>

      <section class="hx-sec d7-sec alt" id="process">
        <div class="hx-in">
          <div class="d7-head"><span class="hx-kick">How it works</span><h2>From enquiry to first day — four steps</h2></div>
          <div class="d7-timeline">${stepsHtml("d7-steps")}</div>
          ${requirementsHtml("d7-req")}
        </div>
      </section>

      <section class="hx-sec d7-sec" id="about">
        <div class="hx-in d7-why">
          <div>
            <span class="hx-kick">Why families choose ${E(b.shortName || "us")}</span>
            <h2>A disciplined, faith-based campus</h2>
            <p class="hx-lead">${E(b.vision || "")}</p>
            <div class="d7-pillars">
              <div><h4>Small classes</h4><p>Every learner is known by name and tracked individually.</p></div>
              <div><h4>CBC specialists</h4><p>Subject teachers for all nine learning areas, PP1 – Grade 9.</p></div>
              <div><h4>Boarding &amp; transport</h4><p>${db().boardingHouses.length} supervised houses and ${db().transportRoutes.length} bus routes.</p></div>
              <div><h4>Reporting</h4><p>Termly CBC report cards through the parent portal.</p></div>
            </div>
          </div>
          <figure class="d7-photo" data-full="${IMG.learners}">
            <img src="${IMG.learners}" alt="Learners at Faith Learning Centre" loading="lazy" />
            <figcaption>${E(b.motto || "")}</figcaption>
          </figure>
        </div>
      </section>

      <section class="hx-sec d7-sec alt" id="life">
        <div class="hx-in">
          <div class="d7-head"><span class="hx-kick">School life</span><h2>A week that balances study, faith and play</h2></div>
          ${galleryHtml("d7-gallery", 3)}
        </div>
      </section>

      <section class="hx-sec d7-sec" id="calendar">
        <div class="hx-in d7-cal">
          ${termHtml("d7-term")}
          <div class="d7-events"><h3>Upcoming events for parents</h3>${eventsHtml()}</div>
          <div class="d7-notices"><h3>Latest notices</h3>${noticesHtml("", 3)}</div>
        </div>
      </section>

      <section class="hx-sec d7-sec alt" id="admissions">
        <div class="hx-in d7-adm">
          <div>
            <span class="hx-kick">Admissions office</span>
            <h2>Send us the full enquiry</h2>
            <p class="hx-lead">Prefer to write it all down? Complete the enquiry form and we will call you back with
              availability, the assessment date and the joining pack.</p>
            <div class="d7-contact-mini">
              <div><span>Telephone</span><strong>${E(b.phone || "")}</strong></div>
              <div><span>Email</span><strong>${E(b.email || "")}</strong></div>
              <div><span>Office hours</span><strong>Mon – Fri, 7:30 AM – 4:30 PM</strong></div>
            </div>
          </div>
          ${enquiryForm({ title: "Online Admission Enquiry" })}
        </div>
      </section>

      <section class="hx-sec d7-sec" id="faq">
        <div class="hx-in">
          <div class="d7-head"><span class="hx-kick">FAQs</span><h2>Questions parents ask us</h2></div>
          <div class="d7-faq">${faqHtml()}</div>
        </div>
      </section>

      <section class="hx-sec d7-sec alt" id="contact">
        <div class="hx-in">
          <div class="d7-head"><span class="hx-kick">Contact</span><h2>Visit, call or write to us</h2></div>
          ${contactCards()}
        </div>
      </section>

      <div class="d7-sticky" id="d7-sticky">
        <span>Admissions open — limited boarding places</span>
        <div>
          <a href="#admissions" class="hx-btn hx-btn-gold hx-btn-sm">Apply now</a>
          <a href="tel:${E(String(b.phone || "").replace(/\\s/g, ""))}" class="hx-btn hx-btn-outline-light hx-btn-sm">Call the office</a>
          <button class="hx-btn hx-btn-outline-light hx-btn-sm" onclick="Homes.payInfo()">Pay fees</button>
        </div>
      </div>

      ${footerHtml()}
      ${backTop()}
    </div>`;
  }

  /* Design 8 — Collegiate Showcase
     The layout chosen from the reference: a thin utility strip over a light
     header with a horizontal nav and an accent Apply button, a full-bleed
     centred hero with an uppercase headline and chip row, an overlapping
     tour card, a deep call-out band with a serif question, and four
     programme cards. Colours come from the theme, so it reads corporate
     navy & steel by default and mirrors the reference exactly when the
     corporate burgundy combination is selected. Below the programme cards an
     alternating band walks through the campus, the classroom, the games field
     and the library with the photograph swapping sides row by row. The hero and
     every band photograph cross-fade between two pictures on a staggered cycle. */
  /* The website words the administrator can rewrite from the editing bar. */
  function sc() {
    const fallback = {
      heroKicker: "Admissions open · {term} {year}",
      heroTitle: "Get ready to excel in faith, competence & character",
      heroSub: "A Ministry of Education registered Competency-Based Curriculum school on Ngong Road, Nairobi — Pre-Primary to Junior School, day and boarding.",
      bandQuestion: "Think a quality CBC education is out of reach?",
      bandSub: "Day fees from {fromFee} a term, with sibling concessions, instalment plans and bursary guidance from the bursar — every payment receipted and posted to the parent portal.",
      heroImages: ["/assets/hero-1.jpg", "/assets/hero-3.jpg", "/assets/classroom.jpg", "/assets/sports.jpg"]
    };
    const saved = (db().systemConfig && db().systemConfig.siteContent) || {};
    const out = {};
    Object.keys(fallback).forEach((k) => {
      const v = saved[k];
      if (Array.isArray(fallback[k])) {
        // the hero photograph list stays a list of image paths
        out[k] = Array.isArray(v) && v.length ? v.slice() : fallback[k];
      } else {
        out[k] = (v && String(v).trim()) || fallback[k];
      }
    });
    return out;
  }

  /* Replaces {term}, {year}, {fromFee} and {school} in the administrator's words. */
  /* The cheapest day-school fee on the current structure — used by the call-out line. */
  function cheapestFee() {
    const dayFees = (db().feeStructures || []).map((x) => Number(x.totalDay || x.totalBoarding || 0)).filter((n) => n > 0);
    return dayFees.length ? Math.min.apply(null, dayFees) : 0;
  }

  function words(text) {
    const ac = academic();
    return String(text)
      .replace(/\{term\}/g, ac.currentTerm || "")
      .replace(/\{year\}/g, ac.currentYear || "")
      .replace(/\{school\}/g, brand().schoolName || "")
      .replace(/\{fromFee\}/g, money(cheapestFee()));
  }

  function design8() {
    const SC = sc();
    const b = brand();
    const t = terms();
    const f = fees();
    const ac = academic();
    const progs = programmeData();
    const today = new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
    const dayFees = db().feeStructures.map((x) => Number(x.totalDay || x.totalBoarding || 0)).filter((n) => n > 0);
    const fromFee = dayFees.length ? M(Math.min.apply(null, dayFees)) : M(0);
    const progPhoto = { ecde: IMG.classroom, lower: IMG.library, upper: IMG.ict, jss: IMG.sports };
    return `
    <div class="site hx d8" id="home">
      <header class="hx-header d8-header" id="hx-header">
        <div class="d8-top">
          <div class="hx-in d8-top-in">
            <span class="d8-top-left">${E(b.regNumber || "Ministry of Education registered")} · KNEC centre ${E(b.knecCode || "")}</span>
            <span class="d8-top-right">
              <a href="tel:${E(String(b.phone || "").replace(/\s/g, ""))}">${E(b.phone || "")}</a>
              <a href="mailto:${E(b.email || "")}" class="d8-hide-sm">${E(b.email || "")}</a>
              <a href="javascript:void(0)" onclick="Landing.openTerms()" class="d8-hide-sm">Terms &amp; Conditions</a>
              <button type="button" class="d8-top-btn" onclick="Landing.openLogin()">Portal login</button>
            </span>
          </div>
        </div>
        <div class="hx-in hx-header-in d8-header-in">
          ${brandMark()}
          ${navHtml("d8-nav")}
          <a href="#admissions" class="hx-btn hx-btn-gold hx-btn-sm d8-apply">Apply</a>
          <button class="hx-burger" type="button" aria-label="Menu" onclick="document.getElementById('hx-nav').classList.toggle('open')">☰</button>
        </div>
      </header>

      <section class="d8-hero">
        <div class="d8-slides d8-slides-hero" aria-hidden="true">
          ${(Array.isArray(SC.heroImages) && SC.heroImages.length ? SC.heroImages : [IMG.campus, IMG.learners, IMG.classroom, IMG.sports])
            .slice(0, 4)
            .map((src, i) => `<img src="${E(src)}" alt="" loading="eager" style="animation-delay:${i * 9}s" />`).join("")}
        </div>
        <div class="d8-hero-scrim"></div>
        <div class="hx-in d8-hero-in">
          <span class="d8-kicker">${E(words(SC.heroKicker))}</span>
          <h1>${E(words(SC.heroTitle))}</h1>
          <div class="d8-hero-rule"></div>
          <p class="d8-hero-sub">${E(words(SC.heroSub))}</p>
          <div class="d8-chips">
            <a class="d8-chip accent" href="#admissions">Apply now</a>
            <a class="d8-chip" href="#life">Visit the campus</a>
            <a class="d8-chip" href="#fees">Fee structure</a>
            <a class="d8-chip" href="#contact">Request information</a>
          </div>
        </div>
      </section>

      <section class="d8-band">
        <div class="hx-in d8-band-in">
          <p class="d8-q">${E(words(SC.bandQuestion))}</p>
          <p class="d8-band-sub">${E(words(SC.bandSub))}</p>
          <div class="hx-actions">
            <a href="#admissions" class="hx-btn hx-btn-gold">Apply now</a>
            <a href="#fees" class="hx-btn hx-btn-outline-light">See the fee structure</a>
          </div>
        </div>
      </section>

      <section class="d8-brief" id="brief">
        <div class="hx-in">
          <div class="d8-brief-head">
            <span class="d8-eyebrow">The school in brief</span>
            <div class="d8-head-rule"></div>
            <h2>Where we are, and what we stand for</h2>
          </div>
          <div class="d8-brief-grid">
            <article class="d8-brief-card">
              <h3>Location</h3>
              <p>${E(b.address || "Ngong Road, Nairobi, Kenya")}</p>
              <ul class="hx-plain">
                <li>${E(db().transportRoutes.length)} school bus routes across Nairobi and the surrounding estates</li>
                <li>Day and boarding places, both on the one campus</li>
                <li>Office open Monday to Friday, 8:00 AM – 4:30 PM</li>
              </ul>
            </article>
            <article class="d8-brief-card">
              <h3>Our mission</h3>
              <p>${E(b.mission || "")}</p>
              <p class="d8-brief-sub">Every child is known by name, taught in a small class and followed up on personally — in class, on the field and at home.</p>
            </article>
            <article class="d8-brief-card">
              <h3>Our vision</h3>
              <p>${E(b.vision || "")}</p>
              <p class="d8-brief-sub">Rooted in faith, excelling in competence and character.</p>
            </article>
          </div>
          <p class="d8-brief-facts">
            Registered with the Ministry of Education · ${E(db().students.length)} learners · ${E(db().staff.length)} staff ·
            ${E(ac.learningAreas.filter((l) => l.active).length)} active CBC learning areas ·
            ${E(db().boardingHouses.length)} boarding houses · ${E(db().transportRoutes.length)} bus routes ·
            mean score ${E(String(schoolMean()))}% last term
          </p>
        </div>
      </section>

      <section class="hx-sec d8-gallery-sec" id="life">
        <div class="hx-in">
          <div class="d8-head left">
            <span class="d8-eyebrow">School life</span>
            <div class="d8-head-rule"></div>
            <h2>Learning, eating, playing, praying, parading and awards</h2>
            <p class="hx-lead">Ten photographs from African school life, openly licensed and credited in the
              school media register — shown here so a family can see how the day actually runs.</p>
          </div>
          <div class="d8-life-grid">
            ${LIFE.map(([key, cap, group]) => `
              <figure class="d8-life" data-full="${IMG[key]}">
                <img src="${IMG[key]}" alt="${E(cap)}" loading="lazy" />
                <figcaption><span>${E(group)}</span>${E(cap)}</figcaption>
              </figure>`).join("")}
          </div>
        </div>
      </section>

      <section class="hx-sec d8-progs-sec" id="academics">
        <div class="hx-in">
          <div class="d8-head">
            <span class="d8-eyebrow">Explore our programmes</span>
            <div class="d8-head-rule"></div>
            <p class="hx-lead">Four levels, one curriculum thread — every learner placed with the right teachers and
              learning areas, with the fees itemised level by level.</p>
          </div>
          <div class="d8-progs">
            ${progs.map((p) => `<article class="d8-prog">
              <img src="${progPhoto[p.id] || IMG.classroom}" alt="${E(p.label)}" loading="lazy" />
              <div class="d8-prog-body">
                <h3>${E(p.label)}</h3>
                <p>${E(p.blurb)}</p>
                <div class="d8-prog-meta"><span>${p.learners} learners</span><span>${p.grades.length} grades</span></div>
                <a class="d8-prog-link" href="#fees">Learn more →</a>
              </div>
            </article>`).join("")}
          </div>
        </div>
      </section>


      <section class="hx-sec d8-alt-sec" id="campus">
        <div class="hx-in">
          <div class="d8-head left">
            <span class="d8-eyebrow">Life &amp; learning</span>
            <div class="d8-head-rule"></div>
            <h2>The campus, the classroom and everything after the bell</h2>
          </div>
          ${[
            {
              img: IMG.campus, img2: IMG.learners, cap: "The Ngong Road campus", cap2: "Learners on campus", kick: "The campus",
              title: "A campus built for the whole day",
              body: `Day and boarding learners share one compound on Ngong Road — ${ac.learningAreas.filter((l) => l.active).length} active CBC learning areas, ${db().boardingHouses.length} supervised boarding houses and ${db().transportRoutes.length} bus routes feeding the classrooms.`,
              href: "#life", cta: "See school life"
            },
            {
              img: IMG.classroom, img2: IMG.assembly, cap: "Learners at work", cap2: "Morning assembly", kick: "Inside the classroom",
              title: "Small classes, taught by specialists",
              body: `Every class stays small enough for the teacher to know each learner by name. Subject specialists cover all ${ac.learningAreas.filter((l) => l.active).length} learning areas, and the marks a teacher records reach the parents' portal the same day.`,
              href: "#academics", cta: "Programmes and levels"
            },
            {
              img: IMG.sports, img2: IMG.community, cap: "Games and athletics", cap2: "Community service day", kick: "Beyond the classroom",
              title: "Sport, music, scouting and service",
              body: `Games afternoons, music and drama festivals, scouts and community service days — ${db().events.length} school events sit on the calendar this term, and every one of them is on the portal.`,
              href: "#calendar", cta: "See the term calendar"
            },
            {
              img: IMG.library, img2: IMG.ict, cap: "The school library", cap2: "The ICT hub", kick: "Reading &amp; research",
              title: "A library that stays open",
              body: `The library runs ${db().libraryBooks.length} catalogued titles across the reading schemes, with borrowing tracked on the same card learners use for the gate, the dining hall and the sick bay.`,
              href: "#about", cta: "More about us"
            }
          ].map((r, i) => `
          <article class="d8-alt${i % 2 === 1 ? " rev" : ""}">
            <figure class="d8-alt-photo" data-full="${r.img}">
              <div class="d8-slides d8-slides-pair">
                <img src="${r.img}" alt="${E(r.cap)}" loading="lazy" />
                <img src="${r.img2}" alt="${E(r.cap2)}" loading="lazy" style="animation-delay:${9 + i * 1.5}s" />
              </div>
              <figcaption>${E(r.cap)}</figcaption>
            </figure>
            <div class="d8-alt-body">
              <span class="d8-eyebrow">${r.kick}</span>
              <h3>${E(r.title)}</h3>
              <p>${r.body}</p>
              <a class="d8-alt-cta" href="${r.href}">${E(r.cta)} →</a>
            </div>
          </article>`).join("")}
        </div>
      </section>

      <section class="hx-sec alt d8-figures">
        <div class="hx-in">
          ${statsRow("d8-stats", 6)}
          <p class="d8-figures-note">Live figures straight from the school management system · updated ${E(today)}</p>
        </div>
      </section>

      <section class="hx-sec d8-about" id="about">
        <div class="hx-in d8-about-in">
          <div>
            <span class="hx-kick">About ${E(b.shortName || "us")}</span>
            <h2>${E(b.mission || "A caring, learner-centred campus")}</h2>
            <p class="hx-lead">${E(b.vision || "")}</p>
            <div class="d8-pillars">
              <div><h4>Faith &amp; character</h4><p>Devotion, mentorship and service learning woven through the week.</p></div>
              <div><h4>Small classes</h4><p>Every learner known by name and tracked individually on the portal.</p></div>
              <div><h4>CBC specialists</h4><p>Subject teachers across all ${ac.learningAreas.filter((l) => l.active).length} active learning areas.</p></div>
              <div><h4>Boarding &amp; transport</h4><p>${db().boardingHouses.length} supervised houses and ${db().transportRoutes.length} bus routes.</p></div>
            </div>
          </div>
          <figure class="d8-photo" data-full="${IMG.assembly}">
            <img src="${IMG.assembly}" alt="School assembly" loading="lazy" />
            <figcaption>${E(b.motto || "")}</figcaption>
          </figure>
        </div>
      </section>

      <section class="hx-sec alt d8-fees" id="fees">
        <div class="hx-in">
          <div class="d8-head left">
            <span class="d8-eyebrow">School fees</span>
            <div class="d8-head-rule"></div>
            <p class="hx-lead">Payable by ${E(t.feeDeadlineWeek || "Week 3 of every term")} through M-Pesa Paybill
              ${E(f.mpesaPaybill)} (account ${E(f.mpesaAccountPrefix)}-ADMNO) or ${E(f.bankName)}.</p>
          </div>
          ${feeTable()}
          <div class="d8-fee-note">
            <div><h4>Payment channels</h4>
              <ul class="hx-plain">
                <li>M-Pesa Paybill <strong>${E(f.mpesaPaybill)}</strong>, account <strong>${E(f.mpesaAccountPrefix)}-ADMNO</strong></li>
                <li>${E(f.bankName)} · account ${E(f.bankAccount)}</li>
                <li>Bursar's office, Mon – Fri 8:00 AM – 4:00 PM</li>
              </ul></div>
            <div><h4>Refunds &amp; withdrawal</h4>
              <p class="hx-note">Refunds are processed within ${E(String(t.refundNoticeDays || 14))} working days of written
                notice of withdrawal, in line with the
                <a href="javascript:void(0)" onclick="Landing.openTerms()">Terms &amp; Conditions</a>.</p></div>
          </div>
        </div>
      </section>

      <section class="hx-sec alt d8-cal" id="calendar">
        <div class="hx-in d8-cal-in">
          ${termHtml("d8-term")}
          <div class="d8-panel"><h3>Upcoming events</h3>${eventsHtml()}</div>
          <div class="d8-panel"><h3>Latest notices</h3>${noticesHtml("", 3)}</div>
        </div>
      </section>

      <section class="hx-sec d8-adm" id="admissions">
        <div class="hx-in">
          <div class="d8-head left">
            <span class="d8-eyebrow">Admissions</span>
            <div class="d8-head-rule"></div>
            <p class="hx-lead">Four steps from enquiry to the first day of term.</p>
          </div>
          ${stepsHtml("d8-steps")}
          <div class="d8-adm-grid">
            <div>
              ${requirementsHtml("d8-req")}
              <div class="d8-contact-mini">
                <div><span>Admissions office</span><strong>${E(b.phone || "")}</strong></div>
                <div><span>Email</span><strong>${E(b.email || "")}</strong></div>
                <div><span>Office hours</span><strong>Mon – Fri, 7:30 AM – 4:30 PM</strong></div>
              </div>
            </div>
            ${enquiryForm({ title: "Online Admission Enquiry" })}
          </div>
        </div>
      </section>

      <section class="hx-sec alt d8-faq" id="faq">
        <div class="hx-in d8-faq-in">
          <div class="d8-head left"><span class="d8-eyebrow">FAQs</span><div class="d8-head-rule"></div></div>
          ${faqHtml()}
        </div>
      </section>

      <section class="hx-sec d8-contact" id="contact">
        <div class="hx-in">
          <div class="d8-head left">
            <span class="d8-eyebrow">Contact</span><div class="d8-head-rule"></div>
            <p class="hx-lead">Visit, call or write to us — the office is open Monday to Friday.</p>
          </div>
          ${contactCards()}
        </div>
      </section>

      ${footerHtml()}
      ${backTop()}
    </div>`;
  }

  /* --------------------------- Design registry ---------------------------- */
  const DESIGNS = [
    { id: "1", name: "Classic Heritage", tone: "Institutional · centred",
      blurb: "Dimmed photographic slider with a centred serif headline and an authority statistics band.",
      bullets: ["Full-width dimmed photo slider", "Centred serif headline", "Statistics band", "Classic school-website feel"],
      tags: ["Photo slider", "Centred serif", "Stats band"] },
    { id: "2", name: "Split Panel", tone: "Corporate · balanced",
      blurb: "Corporate navy information panel beside a full-bleed photograph, with a light figures band and steel-blue rules.",
      bullets: ["Split hero: navy panel + photo", "Light figures band", "About, academics, fees", "Steel-blue section rules"],
      tags: ["Split hero", "Full-bleed photo", "Figures band"] },
    { id: "3", name: "Editorial Broadsheet", tone: "Print · authoritative",
      blurb: "A newspaper nameplate with date rules, a banner photograph and a three-column front page with a noticeboard.",
      bullets: ["Masthead with date and term line", "Three-column front page", "Noticeboard column", "Programme index with fees"],
      tags: ["Masthead", "Multi-column", "Noticeboard"] },
    { id: "4", name: "Minimal Corporate", tone: "Restrained · spacious",
      blurb: "Generous white space, hairline rules, a short hero photograph and quiet typography.",
      bullets: ["Short 58vh hero", "Hairline rules, no boxes", "Four programme cards", "Airy two-column sections"],
      tags: ["Minimal", "Hairlines", "Airy grid"] },
    { id: "5", name: "Bento Mosaic", tone: "Modern · visual",
      blurb: "A mosaic of real photographs, statistics and cards in a modern bento grid.",
      bullets: ["Mosaic hero tiles", "Bento cards for every section", "Steel accent tile", "Rounded, modern feel"],
      tags: ["Mosaic", "Bento grid", "Rounded cards"] },
    { id: "6", name: "Premium Dark", tone: "Dark · exclusive",
      blurb: "Deep corporate navy throughout with steel-blue hairlines, a portrait photo strip and a calm premium tone.",
      bullets: ["Deep corporate navy theme", "Steel hairlines and numerals", "Portrait photograph strip", "Formal, prestigious feel"],
      tags: ["Dark theme", "Steel accents", "Photo strip"] },
    { id: "7", name: "Admissions Focused", tone: "Conversion · practical",
      blurb: "Quick apply card in the hero, itemised fee table, four-step timeline and a sticky call-to-action bar.",
      bullets: ["Quick apply form in the hero", "Itemised fee table up front", "Four-step admissions timeline", "Sticky apply bar"],
      tags: ["Quick apply", "Fee table", "Sticky bar"] },
    { id: "8", name: "Collegiate Showcase", tone: "Collegiate · classic",
      blurb: "The reference layout: utility strip and light header, full-bleed centred hero with a chip row and tour card, a deep call-out band with a serif question, then four programme cards.",
      bullets: ["Utility strip + light header", "Centred uppercase hero", "Call-out band with serif question", "Four programme cards"],
      tags: ["Collegiate", "Centred hero", "Programme cards"] },
  ];

  const byId = (id) => DESIGNS.find((d) => d.id === String(id));

  /* ------------------------------ Rendering ------------------------------- */
  const COMPOSERS = { "1": () => Landing.renderSite(), "2": () => window.Home.render(), "3": design3, "4": design4, "5": design5, "6": design6, "7": design7, "8": design8 };

  function render(id) {
    const design = byId(id) ? String(id) : "1";
    const root = document.getElementById("landing-root");
    if (!root) return false;
    try {
      if (design === "1" || design === "2") {
        COMPOSERS[design]();              // landing.js / home.js render into #landing-root themselves
      } else {
        root.innerHTML = COMPOSERS[design]();   // designs 3-7 return their markup
      }
    } catch (e) {
      if (typeof toast === "function") toast("Could not render design " + design + ": " + e.message, "error");
      return false;
    }
    if (design !== "1" && design !== "2") initPage(design);
    else initShared();
    window.__flcRenderedHome = design;
    document.documentElement.setAttribute("data-home-design", design);
    document.body.setAttribute("data-home-design", design);
    return true;
  }

  /* ---------------------------- Interactions ------------------------------ */
  let scrollHandler = null;

  function initCounters(scope) {
    const counters = (scope || document).querySelectorAll("[data-count]");
    const run = (el) => {
      if (el.dataset.done) return;
      el.dataset.done = "1";
      const target = Number(el.dataset.count) || 0;
      const start = performance.now();
      const tick = (now) => {
        const p = Math.min(1, (now - start) / 1100);
        el.textContent = String(Math.round(target * (1 - Math.pow(1 - p, 3))));
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    };
    if ("IntersectionObserver" in window) {
      const io = new IntersectionObserver((es) => es.forEach((e) => {
        if (e.isIntersecting) { run(e.target); io.unobserve(e.target); }
      }), { threshold: 0.25 });
      counters.forEach((c) => io.observe(c));
    } else counters.forEach(run);
  }

  function initReveal(scope) {
    const els = (scope || document).querySelectorAll(".reveal");
    if (!els.length) return;
    if (!("IntersectionObserver" in window)) { els.forEach((e) => e.classList.add("visible")); return; }
    const io = new IntersectionObserver((es) => es.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add("visible"); io.unobserve(e.target); }
    }), { threshold: 0.12 });
    els.forEach((e) => io.observe(e));
  }

  function initGallery(scope) {
    (scope || document).querySelectorAll("[data-full]").forEach((fig) => {
      if (fig.dataset.bound) return;
      fig.dataset.bound = "1";
      fig.style.cursor = "zoom-in";
      fig.addEventListener("click", () => {
        const ov = document.createElement("div");
        ov.className = "lightbox";
        ov.innerHTML = `<img src="${fig.dataset.full}" alt="" /><div class="lightbox-close">✕</div>`;
        ov.addEventListener("click", () => ov.remove());
        document.body.appendChild(ov);
      });
    });
  }

  function initHeader() {
    const header = document.getElementById("hx-header");
    const sticky = document.getElementById("d7-sticky");
    const top = document.querySelector(".back-top");
    if (scrollHandler) window.removeEventListener("scroll", scrollHandler);
    scrollHandler = () => {
      const y = window.scrollY || 0;
      if (header) header.classList.toggle("scrolled", y > 40);
      if (sticky) sticky.classList.toggle("show", y > 520);
      if (top) top.classList.toggle("show", y > 700);
    };
    window.addEventListener("scroll", scrollHandler, { passive: true });
    scrollHandler();
  }

  function initTabs(scope) {
    (scope || document).querySelectorAll("[data-tab]").forEach((tab) => {
      tab.addEventListener("click", () => {
        const group = tab.getAttribute("data-tab");
        (scope || document).querySelectorAll(`[data-tab="${group}"]`).forEach((t) => t.classList.remove("active"));
        (scope || document).querySelectorAll(`[data-panel^="${group}-"]`).forEach((p) => p.classList.remove("active"));
        tab.classList.add("active");
        const panel = (scope || document).querySelector(`[data-panel="${tab.dataset.panelId}"]`);
        if (panel) panel.classList.add("active");
      });
    });
  }

  function initPage(design) {
    const root = document.querySelector(`.hx.d${design}`);
    initCounters(root);
    initReveal(root);
    initGallery(root);
    initTabs(root);
    initHeader();
    root.querySelectorAll(".hx-nav a").forEach((a) => a.addEventListener("click", () => {
      const nav = document.getElementById("hx-nav");
      if (nav) nav.classList.remove("open");
    }));
  }

  function initShared() {
    initHeader();
    initGallery(document);
  }

  /* --------------------------- Extra actions ------------------------------ */
  async function submitQuick(event) {
    event.preventDefault();
    const check = document.getElementById("quick-terms");
    const card = document.getElementById("quick-card");
    const parent = document.getElementById("quick-parent").value.trim();
    const phone = document.getElementById("quick-phone").value.trim();
    if (!check.checked) return toast("Please accept the School Terms & Conditions before submitting.", "error");
    if (!parent || !phone) return toast("Parent name and phone number are required.", "error");
    try {
      const res = await api("/api/enquiries", "POST", {
        parentName: parent, phone,
        gradeOfInterest: document.getElementById("quick-grade").value,
        boardingPreference: "Undecided",
        message: "Quick apply request submitted from the home page.",
        source: "Quick apply (home page)"
      });
      card.innerHTML = `
        <div class="enquiry-success">
          <div class="success-mark">✓</div>
          <h3>Request received</h3>
          <p>Thank you, ${E(parent)}. Your request is logged as reference
            <strong>${E(String(res.enquiry.id).toUpperCase())}</strong>.</p>
          <p>The admissions office will call <strong>${E(phone)}</strong> within one working day.</p>
          <div class="enquiry-next">
            <button class="hx-btn hx-btn-outline" onclick="Landing.openTerms()">Read the Terms</button>
            <a class="hx-btn hx-btn-primary" href="#admissions">Complete the full enquiry</a>
          </div>
        </div>`;
      toast("Request received — the admissions office will call you back.", "success");
    } catch (e) {
      toast(e.message, "error");
    }
  }

  function payInfo() {
    const f = fees();
    const t = terms();
    document.getElementById("modal-root").innerHTML = `
      <div class="modal-backdrop" onclick="if(event.target===this) Landing.closeModal()">
        <div class="modal-box" style="max-width:540px">
          <div class="modal-header" style="background:#141316;color:#fff">
            <div><div style="font-size:0.72rem;letter-spacing:0.08em;text-transform:uppercase;opacity:0.75">${E(brand().schoolName || "")}</div>
              <h3 style="font-size:1.02rem;font-weight:800">Pay school fees</h3></div>
            <button class="btn btn-outline btn-sm" onclick="Landing.closeModal()">✕</button>
          </div>
          <div class="modal-body">
            <div class="hx-crow"><span>M-Pesa Paybill</span><strong>${E(f.mpesaPaybill)}</strong></div>
            <div class="hx-crow"><span>Account number</span><strong>${E(f.mpesaAccountPrefix)}-ADMNO</strong></div>
            <div class="hx-crow"><span>Bank</span><strong>${E(f.bankName)}</strong></div>
            <div class="hx-crow"><span>Account</span><strong>${E(f.bankAccount)}</strong></div>
            <div class="hx-crow"><span>Fee deadline</span><strong>${E(t.feeDeadlineWeek || "Week 3 of term")}</strong></div>
            <p class="hx-note" style="margin-top:0.9rem">Always use the learner's admission number as the M-Pesa account.
              Receipts are issued by the Bursar's office and payments appear on the parent portal fee statement.
              Refunds follow the <a href="javascript:void(0)" onclick="Landing.openTerms()">Terms &amp; Conditions</a>.</p>
          </div>
        </div>
      </div>`;
  }

  /* ------------------------- Design chooser logic ------------------------- */
  function chooserCards() {
    const grid = document.getElementById("design-grid");
    if (!grid) return;
    const current = String((db() && db().systemConfig.branding.homeDesign) || "1");
    grid.innerHTML = DESIGNS.map((d) => `
      <article class="design-card ${d.id === current ? "active" : ""}" data-design="${d.id}">
        <div class="design-frame">
          <iframe src="/?design=${d.id}&embed=1" title="${E(d.name)} preview" loading="lazy" tabindex="-1"></iframe>
          <span class="design-num">${d.id}</span>
        </div>
        <div class="design-body">
          <div class="design-title"><h3>${E(d.name)}</h3><span class="design-tone">${E(d.tone)}</span></div>
          <p>${E(d.blurb)}</p>
          <ul class="design-bullets">${d.bullets.map((b) => `<li>${E(b)}</li>`).join("")}</ul>
          <div class="hx-tags">${d.tags.map((t) => `<span class="hx-tag">${E(t)}</span>`).join("")}</div>
          <div class="design-actions">
            <button class="hx-btn hx-btn-primary" onclick="Homes.choose('${d.id}')">
              ${d.id === current ? "Re-apply this design" : "Use this design"}</button>
            <a class="hx-btn hx-btn-outline" href="/?design=${d.id}" target="_blank" rel="noopener">Open full size</a>
          </div>
          ${d.id === current ? `<div class="design-current">Currently live on the website</div>` : ""}
        </div>
      </article>`).join("");
  }

  async function choose(id) {
    try {
      const res = await api("/api/config/home-design", "PUT", { design: String(id) });
      if (db() && res.branding) db().systemConfig.branding.homeDesign = String(id);
      toast(`${res.designName} is now the live home page design.`, "success");
      setTimeout(() => { window.location.href = "/"; }, 900);
    } catch (e) {
      toast(e.message, "error");
    }
  }

  /* ------------------------------ Bootstrap ------------------------------- */
  const query = new URLSearchParams(location.search);
  const previewId = query.get("design");
  const embed = query.get("embed") === "1";
  let chosen = "1";

  function pickDesign() {
    if (previewId && byId(previewId)) return String(previewId);          // ?design=N (preview)
    const key = "flc_home_design";
    let saved = null;
    try { saved = localStorage.getItem(key); } catch (e) {}
    const configured = db() && db().systemConfig.branding.homeDesign;     // backend choice
    if (saved && byId(saved) && !configured) return String(saved);
    if (configured && byId(configured)) return String(configured);
    if (saved && byId(saved)) return String(saved);
    return "1";
  }

  function waitForDb(ms) {
    return new Promise((resolve) => {
      const until = Date.now() + ms;
      const tick = () => {
        if (db()) return resolve(true);
        if (Date.now() > until) return resolve(false);
        setTimeout(tick, 90);
      };
      tick();
    });
  }

  async function fetchDb() {
    try {
      const res = await fetch("/api/bootstrap");
      if (!res.ok) return false;
      const data = await res.json();
      window.State = window.State || {};
      window.State.db = data;
      window.__flcDb = data;
      return true;
    } catch (e) { return false; }
  }

  let started = false;
  async function start() {
    if (started) return;
    started = true;
    if (window.__flcInitThemePreview) window.__flcInitThemePreview();
    window.__flcHomeWillRender = true;
    window.__flcRenderedHome = window.__flcRenderedHome || "pending";
    if (embed) document.body.classList.add("embed");
    if (previewId && byId(previewId)) {
      try { localStorage.setItem("flc_home_design", String(previewId)); } catch (e) {}
    }
    const root = document.getElementById("landing-root");
    if (root) {
      if (!(await waitForDb(9000))) await fetchDb();
    } else if (!db()) {
      await fetchDb();
    }
    if (root && db()) {
      chosen = pickDesign();
      if (!render(chosen)) { chosen = "1"; if (window.Landing) Landing.renderSite(); }
      try { localStorage.setItem("flc_home_design", chosen); } catch (e) {}
      window.__flcRenderedHome = chosen;
      // the colours saved on the server repaint the public site too
      if (window.FLC && FLC.applyTypography) FLC.applyTypography(db().systemConfig.typography);
      if (!window.__flcThemePreviewed && window.FLCThemes) {
        FLCThemes.applyBrandingColours(brand().primaryColor, brand().accentColor);
      }
    } else if (root && window.Landing) {
      chosen = "1";
      Landing.renderSite();
      window.__flcRenderedHome = "1";
    }
    chooserCards();
  }

  function boot() { start(); }
  if (document.readyState === "loading") window.addEventListener("DOMContentLoaded", boot);
  else boot();

  window.Homes = {
    DESIGNS, render, choose, submitQuick, payInfo,
    current: () => chosen,
    renderChooser: chooserCards
  };
  window.__flcDispatcher = start;
})();
