/* ============================================================================
   FAITH LEARNING CENTRE — Public Front Page (Corporate School Website)
   Interactive, data-driven and fully branded from the live system configuration.
   ========================================================================= */
(function () {
  const IMAGES = {
    campus: "/assets/hero-1.jpg",
    ict: "/assets/hero-2.jpg",
    learners: "/assets/hero-3.jpg",
    classroom: "/assets/classroom.jpg",
    library: "/assets/library.jpg",
    sports: "/assets/sports.jpg",
    assembly: "/assets/assembly.jpg",
    community: "/assets/community.jpg"
  };

  const SLIDES = [
    {
      img: IMAGES.campus,
      caption: "Our campus — safe, well-kept grounds and purpose-built classrooms",
      lead: "Faith. Competence. Character."
    },
    {
      img: IMAGES.ict,
      caption: "Digital literacy from the early grades in our ICT laboratory",
      lead: "Every learner known by name."
    },
    {
      img: IMAGES.learners,
      caption: "A school community that walks together — learners, staff and parents",
      lead: "Order that shapes character."
    }
  ];

  function db() {
    return window.State ? window.State.db : null;
  }
  function cfg() {
    const d = db();
    return d ? d.systemConfig : null;
  }
  function brand() {
    return cfg() ? cfg().branding : {};
  }
  function academic() {
    return cfg() ? cfg().academicConfig : {};
  }
  function fees() {
    return cfg() ? cfg().financeConfig : {};
  }
  function terms() {
    return cfg() ? cfg().terms : {};
  }

  function schoolMean() {
    const d = db();
    if (!d || !d.students.length) return 0;
    const total = d.students.reduce((s, x) => s + studentAverage(x.id), 0);
    return Math.round(total / d.students.length);
  }
  function attendanceMean() {
    const d = db();
    if (!d || !d.students.length) return 0;
    return Math.round(d.students.reduce((s, x) => s + (x.attendanceRate || 0), 0) / d.students.length);
  }

  /* ------------------------------- Sections ------------------------------- */
  function headerHtml() {
    const b = brand();
    const links = [
      ["home", "Home"],
      ["about", "About Us"],
      ["academics", "Academics"],
      ["life", "School Life"],
      ["calendar", "Term Dates"],
      ["admissions", "Admissions"],
      ["contact", "Contact"]
    ];
    return `
      <header class="site-header" id="site-header">
        <div class="site-header-inner">
          <a class="site-brand" href="#home">
            <span class="site-crest">${window.FLCBrand ? FLCBrand.mark(b.crestStyle || "shield", 30) : ""}</span>
            <span class="site-brand-text">
              <strong>${esc(b.schoolName || "School")}</strong>
              <em>${esc(b.motto || "")}</em>
            </span>
          </a>
          <nav class="site-nav" id="site-nav">
            ${links.map(([id, label]) => `<a href="#${id}" class="site-nav-link">${label}</a>`).join("")}
            <a href="javascript:void(0)" class="site-nav-link" onclick="Landing.openTerms()">Terms &amp; Conditions</a>
          </nav>
          <div class="site-header-actions">
            <a href="#admissions" class="btn btn-ghost-light">Apply Online</a>
            <button class="btn btn-gold" onclick="Landing.openLogin()">Portal Login</button>
            <button class="site-burger" aria-label="Menu" onclick="document.getElementById('site-nav').classList.toggle('open')">☰</button>
          </div>
        </div>
      </header>`;
  }

  function heroHtml() {
    const b = brand();
    return `
      <section class="hero" id="home">
        <div class="hero-media">
          ${SLIDES.map((s, i) => `<div class="hero-slide ${i === 0 ? "active" : ""}" style="background-image:url('${s.img}')"></div>`).join("")}
        </div>
        <div class="hero-dim"></div>
        <div class="hero-grain"></div>
        <div class="hero-inner">
          <div class="hero-eyebrow reveal">
            <span class="dot"></span> Ministry of Education Registered · KNEC Centre ${esc(b.knecCode || "—")} · NEMIS ${esc(b.nemisCode || "—")}
          </div>
          <h1 class="reveal">${esc(b.schoolName || "School")}</h1>
          <p class="hero-lead reveal">${esc(SLIDES[0].lead)}</p>
          <p class="hero-sub reveal">
            ${esc(b.mission || "")}
          </p>
          <div class="hero-actions reveal">
            <a href="#admissions" class="btn btn-gold btn-lg">Apply for Admission</a>
            <button class="btn btn-outline-light btn-lg" onclick="Landing.openLogin()">Parent &amp; Student Portal</button>
          </div>
          <div class="hero-caption reveal" id="hero-caption">${esc(SLIDES[0].caption)}</div>
        </div>
        <div class="hero-dots">
          ${SLIDES.map((s, i) => `<button class="hero-dot ${i === 0 ? "active" : ""}" data-slide="${i}" aria-label="Slide ${i + 1}"></button>`).join("")}
        </div>
      </section>`;
  }

  function statsHtml() {
    const d = db();
    const stats = [
      { label: "Learners Enrolled", value: d.students.length, suffix: "" },
      { label: "Teaching & Support Staff", value: d.staff.length, suffix: "" },
      { label: "School Mean Score", value: schoolMean(), suffix: "%" },
      { label: "Average Attendance", value: attendanceMean(), suffix: "%" },
      { label: "Learning Areas (CBC)", value: academic().learningAreas.filter((l) => l.active).length, suffix: "" },
      { label: "Dormitory Houses", value: d.boardingHouses.length, suffix: "" }
    ];
    return `
      <section class="stats-band">
        <div class="stats-inner">
          ${stats.map((s) => `
            <div class="stat-cell">
              <div class="stat-value"><span data-count="${s.value}">0</span>${s.suffix}</div>
              <div class="stat-label">${esc(s.label)}</div>
            </div>`).join("")}
        </div>
      </section>`;
  }

  function aboutHtml() {
    const b = brand();
    return `
      <section class="site-section" id="about">
        <div class="section-head reveal">
          <span class="section-kicker">About Us</span>
          <h2>An institution founded on faith, ordered for excellence</h2>
          <p>${esc(b.schoolName || "")} is a private basic education institution offering the Competency-Based Curriculum
             from Pre-Primary to Junior School, in a disciplined, caring and technology-supported environment.</p>
        </div>
        <div class="about-grid">
          <div class="about-copy reveal">
            <div class="about-block">
              <h3>Our Vision</h3>
              <p>${esc(b.vision || "")}</p>
            </div>
            <div class="about-block">
              <h3>Our Mission</h3>
              <p>${esc(b.mission || "")}</p>
            </div>
            <div class="about-block">
              <h3>Our Core Values</h3>
              <div class="value-chips">
                ${["Faith", "Integrity", "Excellence", "Discipline", "Service", "Compassion"].map((v) => `<span class="value-chip">${v}</span>`).join("")}
              </div>
            </div>
            <div class="about-facts">
              <div><span>Registration</span><strong>${esc(b.regNumber || "—")}</strong></div>
              <div><span>Head of Institution</span><strong>${esc(b.principalName || "—")}</strong></div>
              <div><span>Campus</span><strong>${esc(b.address || "—")}</strong></div>
            </div>
          </div>
          <div class="about-media reveal">
            <img src="${IMAGES.classroom}" alt="Classroom learning at Faith Learning Centre" />
            <div class="about-media-card">
              <strong>${esc(b.shortName || "FLC")} at a glance</strong>
              <div>PP1 – PP2 · Grade 1 – 6 · Grade 7 – 9 (Junior School)</div>
              <div>Day scholars &amp; boarders · Four house streams</div>
              <div>Modern science laboratory, ICT hub &amp; library</div>
            </div>
          </div>
        </div>
      </section>`;
  }

  function academicsHtml() {
    const d = db();
    const acfg = academic();
    const programmes = [
      {
        id: "ecde",
        label: "Pre-Primary (ECDE)",
        grades: acfg.gradeLevels.filter((g) => g.startsWith("PP")),
        blurb:
          "A play- and activity-based foundation in literacy, numeracy and psychomotor development, delivered by trained early childhood educators in bright, safe classrooms.",
        highlights: ["Language & literacy readiness", "Number work and patterns", "Music, movement and creative play", "Character habits and courtesy"]
      },
      {
        id: "lower",
        label: "Lower Primary",
        grades: acfg.gradeLevels.filter((g) => /^Grade [1-3]$/.test(g)),
        blurb:
          "Competency-driven literacy and numeracy with continuous assessment, so that every child reads, writes and reasons with confidence before upper primary.",
        highlights: ["Kiswahili, English & Kenya Sign considerations", "Numeracy mastery clinics", "Environmental & hygiene activities", "Reading culture from Grade 1"]
      },
      {
        id: "upper",
        label: "Upper Primary",
        grades: acfg.gradeLevels.filter((g) => /^Grade [4-6]$/.test(g)),
        blurb:
          "Subject specialist teaching across nine learning areas, strengthened by hands-on agriculture, practical science and structured KPSEA preparation.",
        highlights: ["Science practical work", "Agriculture & nutrition projects", "KPSEA readiness programme", "Digital literacy & coding"]
      },
      {
        id: "jss",
        label: "Junior School (JSS)",
        grades: acfg.gradeLevels.filter((g) => g.includes("JSS")),
        blurb:
          "Grade 7 to 9 Junior School with laboratory science, pre-technical studies, community service learning and talent pathways that prepare learners for senior school.",
        highlights: ["Integrated Science laboratory", "Pre-Technical & Computer Studies", "Community Service Learning (CSL)", "Robotics, ball games & swimming"]
      }
    ];
    const levelFees = {};
    d.feeStructures.forEach((f) => f.grades.forEach((g) => { levelFees[g] = f; }));

    return `
      <section class="site-section alt" id="academics">
        <div class="section-head reveal">
          <span class="section-kicker">Academics</span>
          <h2>Competency-Based Curriculum, PP1 to Grade 9</h2>
          <p>Nine learning areas, School-Based Assessment and termly examinations weighted
             ${academic().sbaWeight}% / ${academic().examWeight}%, reported on official CBC progress reports.</p>
        </div>
        <div class="program-tabs reveal">
          ${programmes.map((p, i) => `<button class="program-tab ${i === 0 ? "active" : ""}" data-program="${p.id}">${esc(p.label)}</button>`).join("")}
        </div>
        <div class="program-panels">
          ${programmes.map((p, i) => `
            <div class="program-panel ${i === 0 ? "active" : ""}" data-panel="${p.id}">
              <div class="program-copy">
                <div class="program-grades">${p.grades.map((g) => `<span class="grade-chip">${esc(g)}</span>`).join("")}</div>
                <p>${esc(p.blurb)}</p>
                <ul class="tick-list">
                  ${p.highlights.map((h) => `<li>${esc(h)}</li>`).join("")}
                </ul>
                <div class="program-fee">
                  Term fees from <strong>${p.grades[0] && levelFees[p.grades[0]] ? money(levelFees[p.grades[0]].totalDay) : "—"}</strong>
                  (day scholar)${p.grades[0] && levelFees[p.grades[0]] && levelFees[p.grades[0]].boardingFee ? ` · <strong>${money(levelFees[p.grades[0]].totalBoarding)}</strong> (boarder)` : ""}
                </div>
              </div>
              <div class="program-side">
                <h4>Learning areas offered</h4>
                <div class="subject-tags">
                  ${academic().learningAreas.filter((l) => l.active).map((l) => `<span class="subject-tag">${esc(l.name)}</span>`).join("")}
                </div>
                <div class="program-note">
                  Assessment engine currently in force: <strong>${esc((academic().gradingMode || "hybrid").toUpperCase())}</strong>
                  (CBC rubric levels EE / ME / AE / BE with standard grade equivalents).
                </div>
              </div>
            </div>`).join("")}
        </div>
      </section>`;
  }

  function whyHtml() {
    const features = [
      ["Competency-Based Learning", "Every strand assessed against CBC learning outcomes, with SBA portfolios and practical work."],
      ["Disciplined & Caring Ethos", "Guidance-first discipline, chaplaincy and pastoral care led by dedicated matrons and patrons."],
      ["Digital Markbook & Portals", "Marks, attendance, fees and reports are captured digitally and available to parents in real time."],
      ["Boarding Facilities", "Four supervised dormitory houses with a resident matron or patron and a health clinic."],
      ["School Transport", "Four serviced bus routes across Nairobi with trained drivers and pupil assistants."],
      ["Talent & Co-Curricular", "Robotics, music, drama, ball games, swimming and 4-K agriculture clubs."],
      ["Convenient Fee Payment", "M-Pesa Paybill and bank transfer receipting, with instant SMS confirmation."],
      ["Transparent Reporting", "Termly report cards, academic clinics and open communication with every parent."]
    ];
    return `
      <section class="site-section" id="why">
        <div class="section-head reveal">
          <span class="section-kicker">Why Faith Learning Centre</span>
          <h2>Structured systems behind every learner's progress</h2>
        </div>
        <div class="feature-grid">
          ${features.map(([t, d]) => `
            <div class="feature-card reveal">
              <div class="feature-mark"></div>
              <h3>${esc(t)}</h3>
              <p>${esc(d)}</p>
            </div>`).join("")}
        </div>
      </section>`;
  }

  function lifeHtml() {
    const d = db();
    const gallery = [
      [IMAGES.campus, "Classroom blocks and school grounds"],
      [IMAGES.ict, "ICT laboratory — digital literacy lessons"],
      [IMAGES.library, "Library and reading programme"],
      [IMAGES.classroom, "Learners at work in class"],
      [IMAGES.sports, "Games, sports and physical education"],
      [IMAGES.assembly, "Parade, scouts and co-curricular activities"],
      [IMAGES.community, "Community service learning and outreach"],
      [IMAGES.learners, "The journey to school, every morning"]
    ];
    return `
      <section class="site-section alt" id="life">
        <div class="section-head reveal">
          <span class="section-kicker">School Life</span>
          <h2>Learning, faith, sport and service</h2>
          <p>A well-rounded week: lessons, chapel and assembly, clubs, games and community service.</p>
        </div>
        <div class="gallery-grid">
          ${gallery.map(([src, caption], i) => `
            <figure class="gallery-item reveal ${i === 0 ? "wide" : ""}" data-full="${src}">
              <img src="${src}" alt="${esc(caption)}" loading="lazy" />
              <figcaption>${esc(caption)}</figcaption>
            </figure>`).join("")}
        </div>
        <div class="life-cards">
          <div class="life-card reveal">
            <h3>Boarding</h3>
            <p>${d.boardingHouses.length} dormitory houses · ${d.boardingHouses.reduce((s, h) => s + h.capacity, 0)} bed capacity</p>
            <ul class="mini-list">
              ${d.boardingHouses.map((h) => `<li><strong>${esc(h.name)}</strong><span>${esc(h.matron)}</span></li>`).join("")}
            </ul>
          </div>
          <div class="life-card reveal">
            <h3>Transport Routes</h3>
            <p>Serviced school buses with pupil assistants on every route</p>
            <ul class="mini-list">
              ${d.transportRoutes.map((r) => `<li><strong>${esc(r.routeName)}</strong><span>${esc(r.vehicleReg)} · ${money(r.termFee)} / term</span></li>`).join("")}
            </ul>
          </div>
          <div class="life-card reveal">
            <h3>Clubs &amp; Societies</h3>
            <p>CBC talent pathways across the school</p>
            <ul class="mini-list">
              ${((cfg().customFields || []).find((c) => c.key === "talentClub") || { options: [] }).options.map((o) => `<li><strong>${esc(o)}</strong></li>`).join("")}
            </ul>
          </div>
        </div>
      </section>`;
  }

  function calendarHtml() {
    const d = db();
    const acfg = academic();
    const notices = (d.communications || []).slice(0, 3);
    return `
      <section class="site-section" id="calendar">
        <div class="section-head reveal">
          <span class="section-kicker">Term Dates &amp; Calendar</span>
          <h2>Current term, upcoming events and school notices</h2>
        </div>
        <div class="calendar-grid">
          <div class="calendar-card reveal">
            <h3>${esc(acfg.currentTerm)} ${esc(acfg.currentYear)}</h3>
            <div class="term-rows">
              <div><span>Term opens</span><strong>${esc(acfg.termStartDate)}</strong></div>
              <div><span>Term closes</span><strong>${esc(acfg.termEndDate)}</strong></div>
              <div><span>Next term opens</span><strong>${esc(acfg.nextTermOpening)}</strong></div>
              <div><span>Active assessment</span><strong>${esc(acfg.activeExamType)}</strong></div>
              <div><span>Fee deadline</span><strong>${esc(terms().feeDeadlineWeek || "Week 3 of the term")}</strong></div>
            </div>
            <div class="calendar-note">Term dates may be adjusted in line with Ministry of Education circulars; changes are published through the portal and SMS.</div>
          </div>
          <div class="events-card reveal">
            <h3>Upcoming School Events</h3>
            ${(d.events || []).map((e) => `
              <div class="event-row">
                <div class="event-date"><strong>${esc(e.date.slice(8, 10))}</strong><span>${esc(new Date(e.date).toLocaleString("en-GB", { month: "short" }))}</span></div>
                <div class="event-body">
                  <strong>${esc(e.title)}</strong>
                  <p>${esc(e.description)}</p>
                  <div class="event-meta">${esc(e.time)} · ${esc(e.venue)} · ${esc(e.audience)}</div>
                </div>
              </div>`).join("")}
          </div>
        </div>
        ${notices.length ? `
        <div class="notice-strip reveal">
          <span class="notice-strip-label">Latest notices</span>
          ${notices.map((n) => `<div class="notice-chip"><strong>${esc(n.title)}</strong><span>${esc(n.date)}</span></div>`).join("")}
        </div>` : ""}
      </section>`;
  }

  function admissionsHtml() {
    const acfg = academic();
    const steps = [
      ["Enquire &amp; Book a Visit", "Submit the online enquiry below or call the school office. You will be invited for a campus tour and a meeting with the admissions team."],
      ["Submit the Application", "Complete the admission form and attach the learner's birth certificate, NEMIS UPI, previous school report, transfer letter and immunisation record."],
      ["Assessment &amp; Interview", "The learner sits a friendly readiness or placement assessment; parents meet the class teacher and, for boarders, the matron or patron."],
      ["Offer, Fees &amp; Joining", "On admission, settle the deposit and term fees through M-Pesa or bank, sign the school Terms &amp; Conditions, and receive the joining instructions."]
    ];
    return `
      <section class="site-section alt" id="admissions">
        <div class="section-head reveal">
          <span class="section-kicker">Admissions</span>
          <h2>Joining Faith Learning Centre</h2>
          <p>Admissions remain open while vacancies exist. Boarding places are limited and allocated on payment of the deposit.</p>
        </div>
        <div class="admissions-grid">
          <div class="admissions-process reveal">
            ${steps.map(([t, d], i) => `
              <div class="process-step">
                <div class="process-num">${String(i + 1).padStart(2, "0")}</div>
                <div><h3>${t}</h3><p>${d}</p></div>
              </div>`).join("")}
            <div class="requirements-box">
              <h4>Requirements checklist</h4>
              <ul class="tick-list two-col">
                <li>Birth certificate &amp; NEMIS UPI</li>
                <li>Latest school report card</li>
                <li>Transfer or leaving certificate</li>
                <li>Immunisation / clinic card</li>
                <li>Passport photographs (2)</li>
                <li>Parent / guardian ID copies</li>
              </ul>
              <div class="requirements-note">
                Admission is confirmed only upon acceptance of the
                <a href="javascript:void(0)" onclick="Landing.openTerms()">School Terms &amp; Conditions</a>.
              </div>
            </div>
          </div>

          <div class="enquiry-card reveal" id="enquiry-card">
            <h3>Online Admission Enquiry</h3>
            <p class="enquiry-sub">Complete this form and the admissions office will respond within one working day.</p>
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
                  <select class="select" id="enq-grade">
                    ${academic().gradeLevels.map((g) => `<option>${esc(g)}</option>`).join("")}
                  </select></div>
                <div class="form-group"><label for="enq-boarding">Boarding Preference</label>
                  <select class="select" id="enq-boarding">
                    <option>Day Scholar</option><option>Boarding</option><option>Undecided</option>
                  </select></div>
              </div>
              <div class="form-group"><label for="enq-message">Message / Questions</label>
                <textarea class="textarea" id="enq-message" rows="3" placeholder="Tell us about your learner and what you would like to know."></textarea></div>
              ${FLCTerms.acceptanceCheckboxHtml(db(), "enq-terms")}
              <button type="submit" class="btn btn-primary btn-lg" style="width:100%">Submit Enquiry</button>
              <div class="form-note">Your information is processed in line with the Data Protection Act, 2019 and used only for admissions purposes.</div>
            </form>
          </div>
        </div>
      </section>`;
  }

  function faqHtml() {
    const faqs = [
      ["How do I pay school fees?", `Fees are payable through M-Pesa Paybill ${fees().mpesaPaybill} using the account format ${fees().mpesaAccountPrefix}-[ADMISSION NUMBER], by bank transfer to ${fees().bankName}, or at the Bursar's office. Every payment is receipted and confirmed by SMS.`],
      ["Can my child join mid-term?", "Yes, where a vacancy exists. Term fees are payable in full, and joining instructions are issued upon clearance. Learners joining mid-term receive catch-up support from the class teacher."],
      ["Is boarding available for all grades?", "Boarding is available from Grade 4 upwards, subject to bed availability. Junior learners board in supervised wings with resident matrons and patrons."],
      ["Which transport routes are served?", `The school operates ${(db().transportRoutes || []).length} routes: ${(db().transportRoutes || []).map((r) => r.routeName.split("—")[1] || r.routeName).join(", ")}. Seats are allocated against payment of the termly transport fee.`],
      ["How is learner progress reported?", "Learners are assessed through School-Based Assessment and termly examinations. Report cards are issued each term through the parent portal, showing competency levels, grades and teacher's remarks."],
      ["Why do I have to accept the Terms & Conditions?", "The Terms govern admission, fees, attendance, conduct, safeguarding, data protection and use of the school's digital platforms. Acceptance is recorded against your name and the document version for accountability."]
    ];
    return `
      <section class="site-section" id="faq">
        <div class="section-head reveal">
          <span class="section-kicker">Frequently Asked</span>
          <h2>Questions parents ask us</h2>
        </div>
        <div class="faq-list reveal">
          ${faqs.map(([q, a], i) => `
            <div class="faq-item ${i === 0 ? "open" : ""}">
              <button class="faq-q" onclick="Landing.toggleFaq(this)">
                <span>${esc(q)}</span><span class="faq-sign">+</span>
              </button>
              <div class="faq-a"><p>${esc(a)}</p></div>
            </div>`).join("")}
        </div>
      </section>`;
  }

  function contactHtml() {
    const b = brand();
    return `
      <section class="site-section alt" id="contact">
        <div class="section-head reveal">
          <span class="section-kicker">Contact &amp; Location</span>
          <h2>Visit, call or write to us</h2>
        </div>
        <div class="contact-grid">
          <div class="contact-card reveal">
            <h3>School Office</h3>
            <div class="contact-row"><span>Address</span><strong>${esc(b.address || "")}</strong></div>
            <div class="contact-row"><span>Telephone</span><strong>${esc(b.phone || "")}</strong></div>
            <div class="contact-row"><span>Email</span><strong>${esc(b.email || "")}</strong></div>
            <div class="contact-row"><span>Website</span><strong>${esc(b.website || "")}</strong></div>
            <div class="contact-row"><span>Office Hours</span><strong>Mon – Fri, 7:30 AM – 4:30 PM</strong></div>
            <div class="contact-row"><span>Principal</span><strong>${esc(b.principalName || "")}</strong></div>
          </div>
          <div class="contact-card reveal">
            <h3>Portals</h3>
            <p class="contact-note">Existing parents, learners and staff sign in to the school portal. Access is issued by the school administration and is subject to the Terms &amp; Conditions.</p>
            <div class="portal-buttons">
              <button class="btn btn-gold" onclick="Landing.openLogin('parent')">Parent / Student Login</button>
              <button class="btn btn-outline" onclick="Landing.openLogin('teacher')">Teacher Login</button>
              <button class="btn btn-outline" onclick="Landing.openLogin('finance')">Bursar / Finance Login</button>
              <button class="btn btn-outline" onclick="Landing.openLogin('admin')">Administrator Login</button>
            </div>
            <div class="portal-terms">
              <span>Terms &amp; Conditions in force:</span>
              <button class="link-btn" onclick="Landing.openTerms()">Version ${esc(String(terms().version || "1.0"))} — read the document</button>
            </div>
          </div>
          <div class="contact-card reveal map-card">
            <h3>Campus Location</h3>
            <div class="map-art">
              <svg viewBox="0 0 320 180" width="100%" height="100%" role="img" aria-label="Stylised campus map">
                <rect width="320" height="180" fill="#0e2a4d"></rect>
                <path d="M0 130 L320 96" stroke="#e4002b" stroke-width="10" fill="none"></path>
                <path d="M60 180 L140 0" stroke="#173f70" stroke-width="14" fill="none"></path>
                <rect x="150" y="42" width="118" height="52" rx="4" fill="#3a1119" stroke="#2f6cab"></rect>
                <rect x="170" y="54" width="78" height="8" fill="#2f6cab"></rect>
                <rect x="170" y="68" width="58" height="8" fill="#2f6cab"></rect>
                <circle cx="86" cy="70" r="18" fill="#9c0021" stroke="#e4002b" stroke-width="3"></circle>
                <text x="86" y="75" font-size="11" text-anchor="middle" fill="#f8f8f8" font-family="sans-serif">FLC</text>
                <text x="209" y="110" font-size="10" text-anchor="middle" fill="#9db8d6" font-family="sans-serif">Ngong Road</text>
              </svg>
            </div>
            <div class="contact-note">${esc(b.address || "")}</div>
          </div>
        </div>
      </section>`;
  }

  function footerHtml() {
    const b = brand();
    const t = terms();
    return `
      <footer class="site-footer">
        <div class="footer-inner">
          <div class="footer-col">
            <div class="footer-brand">
              <span class="site-crest small">${window.FLCBrand ? FLCBrand.mark(b.crestStyle || "shield", 30) : ""}</span>
              <div>
                <strong>${esc(b.schoolName || "")}</strong>
                <em>${esc(b.motto || "")}</em>
              </div>
            </div>
            <p class="footer-text">
              A Ministry of Education registered Competency-Based Curriculum institution offering
              Pre-Primary, Primary and Junior School education in Nairobi, Kenya.
            </p>
            <div class="footer-badges">
              <span>KNEC ${esc(b.knecCode || "—")}</span>
              <span>NEMIS ${esc(b.nemisCode || "—")}</span>
              <span>Reg ${esc(b.regNumber || "—")}</span>
            </div>
            <div class="footer-credit">
              Campus photography: openly licensed images from Wikimedia Commons
              (CC BY-SA 3.0/4.0 and public domain) — credited in the school media register.
            </div>
          </div>
          <div class="footer-col">
            <h4>Quick Links</h4>
            <a href="#about">About the School</a>
            <a href="#academics">Academic Programmes</a>
            <a href="#life">School Life &amp; Boarding</a>
            <a href="#calendar">Term Dates &amp; Events</a>
            <a href="#admissions">Admissions</a>
            <a href="#faq">Parent FAQs</a>
          </div>
          <div class="footer-col">
            <h4>Portals</h4>
            <a href="javascript:void(0)" onclick="Landing.openLogin('parent')">Parent &amp; Student Portal</a>
            <a href="javascript:void(0)" onclick="Landing.openLogin('teacher')">Teacher Portal</a>
            <a href="javascript:void(0)" onclick="Landing.openLogin('finance')">Bursar / Finance Portal</a>
            <a href="javascript:void(0)" onclick="Landing.openLogin('admin')">Administrator Portal</a>
            <a href="javascript:void(0)" onclick="Landing.openTerms()">School Terms &amp; Conditions v${esc(String(t.version || "1.0"))}</a>
          </div>
          <div class="footer-col">
            <h4>Contact</h4>
            <div class="footer-text">${esc(b.address || "")}</div>
            <div class="footer-text">Tel: ${esc(b.phone || "")}</div>
            <div class="footer-text">Email: ${esc(b.email || "")}</div>
            <div class="footer-text">Fee Paybill: <strong>${esc(fees().mpesaPaybill || "")}</strong> (${esc(fees().mpesaAccountPrefix || "")}-ADMNO)</div>
          </div>
        </div>
        <div class="footer-bottom">
          <div>© ${new Date().getFullYear()} ${esc(b.schoolName || "")}. All rights reserved.</div>
          <div class="footer-legal">
            <a href="javascript:void(0)" onclick="Landing.openTerms()">Terms &amp; Conditions</a>
            <span>·</span>
            <a href="javascript:void(0)" onclick="Landing.openTerms()">Data Protection &amp; Privacy</a>
            <span>·</span>
            <a href="javascript:void(0)" onclick="Landing.openLogin()">Portal Login</a>
          </div>
        </div>
      </footer>`;
  }

  /* ------------------------------ Interactions ---------------------------- */
  function initSlider() {
    const slides = document.querySelectorAll(".hero-slide");
    const dots = document.querySelectorAll(".hero-dot");
    const caption = document.getElementById("hero-caption");
    if (!slides.length) return;
    let i = 0;
    const go = (n) => {
      slides[i].classList.remove("active");
      if (dots[i]) dots[i].classList.remove("active");
      i = (n + slides.length) % slides.length;
      slides[i].classList.add("active");
      if (dots[i]) dots[i].classList.add("active");
      if (caption) caption.textContent = SLIDES[i].caption;
    };
    dots.forEach((d) => d.addEventListener("click", () => go(Number(d.dataset.slide))));
    if (window.__flcSlider) clearInterval(window.__flcSlider);
    window.__flcSlider = setInterval(() => go(i + 1), 6500);
  }

  function initReveal() {
    const els = document.querySelectorAll(".reveal");
    if (!("IntersectionObserver" in window)) {
      els.forEach((e) => e.classList.add("visible"));
      return;
    }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) {
          en.target.classList.add("visible");
          io.unobserve(en.target);
        }
      });
    }, { threshold: 0.12 });
    els.forEach((e) => io.observe(e));
  }

  function initCounters() {
    const counters = document.querySelectorAll("[data-count]");
    const run = (el) => {
      const target = Number(el.dataset.count) || 0;
      const dur = 1100;
      const start = performance.now();
      const tick = (now) => {
        const p = Math.min(1, (now - start) / dur);
        el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3)));
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    };
    if (!("IntersectionObserver" in window)) return counters.forEach(run);
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) { run(en.target); io.unobserve(en.target); }
      });
    }, { threshold: 0.3 });
    counters.forEach((c) => io.observe(c));
  }

  function initHeader() {
    const onScroll = () => {
      const h = document.getElementById("site-header");
      const top = document.querySelector(".back-top");
      if (h) h.classList.toggle("scrolled", window.scrollY > 40);
      if (top) top.classList.toggle("show", window.scrollY > 600);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    document.querySelectorAll(".site-nav-link").forEach((a) =>
      a.addEventListener("click", () => document.getElementById("site-nav").classList.remove("open"))
    );
  }

  function initProgramTabs() {
    document.querySelectorAll(".program-tab").forEach((tab) => {
      tab.addEventListener("click", () => {
        document.querySelectorAll(".program-tab").forEach((t) => t.classList.remove("active"));
        document.querySelectorAll(".program-panel").forEach((p) => p.classList.remove("active"));
        tab.classList.add("active");
        const panel = document.querySelector(`.program-panel[data-panel="${tab.dataset.program}"]`);
        if (panel) panel.classList.add("active");
      });
    });
  }

  function initGallery() {
    document.querySelectorAll(".gallery-item").forEach((fig) => {
      fig.addEventListener("click", () => {
        const overlay = document.createElement("div");
        overlay.className = "lightbox";
        overlay.innerHTML = `<img src="${fig.dataset.full}" alt="" /><div class="lightbox-close">✕</div>`;
        overlay.addEventListener("click", () => overlay.remove());
        document.body.appendChild(overlay);
      });
    });
  }

  /* ------------------------------- Login ---------------------------------- */
  const PORTALS = {
    parent: { label: "Parent / Student", portal: "Parent & Student Portal", hint: "Use the phone number or email registered with the school." },
    teacher: { label: "Teacher", portal: "Teacher Portal", hint: "Use your school email address issued by the administration." },
    finance: { label: "Bursar / Finance", portal: "Bursar / Finance Portal", hint: "Finance office access only. Activity is audited." },
    admin: { label: "Administrator", portal: "Administrator Portal", hint: "Restricted to the Principal and system administrators." }
  };

  function openLogin(role) {
    const active = PORTALS[role] ? role : "parent";
    const d = db();
    const t = terms();
    document.getElementById("modal-root").innerHTML = `
      <div class="modal-backdrop" onclick="if(event.target===this) Landing.closeModal()">
        <div class="modal-box" style="max-width:520px">
          <div class="modal-header" style="background:#141316;color:#fff">
            <div>
              <div style="font-size:0.72rem;letter-spacing:0.08em;text-transform:uppercase;opacity:0.75">${esc((brand().schoolName || "School"))}</div>
              <h3 style="font-size:1.02rem;font-weight:800">Secure Portal Sign In</h3>
            </div>
            <button class="btn btn-outline btn-sm" onclick="Landing.closeModal()">✕</button>
          </div>
          <div class="modal-body">
            <div class="login-tabs">
              ${Object.entries(PORTALS).map(([k, v]) => `<button class="login-tab ${k === active ? "active" : ""}" data-portal="${k}">${esc(v.label)}</button>`).join("")}
            </div>
            <form onsubmit="Landing.submitLogin(event)">
              <div class="form-group"><label for="login-user">Email / Username</label><input class="input" id="login-user" autocomplete="username" /></div>
              <div class="form-group"><label for="login-pass">Password</label><input class="input" type="password" id="login-pass" autocomplete="current-password" /></div>
              <div id="login-hint" class="login-hint">${esc(PORTALS[active].hint)}</div>
              ${FLCTerms.acceptanceCheckboxHtml(d, "login-terms")}
              <div id="login-error" class="terms-error" style="display:none"></div>
              <button type="submit" class="btn btn-primary btn-lg" style="width:100%;margin-top:0.4rem">Sign in to ${esc(PORTALS[active].portal)}</button>
            </form>
            <div class="login-foot">
              <div>Credentials are issued by the school administration. Lost your password? Call ${esc(brand().phone || "the school office")}.</div>
              <div class="login-terms-line">
                Terms &amp; Conditions v${esc(String(t.version || "1.0"))} · effective ${esc(t.effectiveDate || "—")}
                <button class="link-btn" onclick="Landing.openTerms()">Read the document</button>
              </div>
            </div>
          </div>
        </div>
      </div>`;
    document.querySelectorAll(".login-tab").forEach((tab) => {
      tab.addEventListener("click", () => {
        const sel = tab.dataset.portal;
        document.querySelectorAll(".login-tab").forEach((t2) => t2.classList.remove("active"));
        tab.classList.add("active");
        document.getElementById("login-hint").textContent = PORTALS[sel].hint;
        document.querySelector("#modal-root form button[type=submit]").textContent = `Sign in to ${PORTALS[sel].portal}`;
        window.__flcLoginRole = sel;
      });
    });
    window.__flcLoginRole = active;
  }

  async function submitLogin(event) {
    event.preventDefault();
    const user = document.getElementById("login-user").value.trim();
    const pass = document.getElementById("login-pass").value;
    const termsCheck = document.getElementById("login-terms");
    const err = document.getElementById("login-error");
    const role = window.__flcLoginRole || "parent";
    const fail = (msg) => { err.style.display = "block"; err.textContent = msg; };
    if (!user || !pass) return fail("Please enter both your email address and password.");
    if (!termsCheck.checked) return fail("You must read and accept the School Terms & Conditions to sign in.");
    err.style.display = "none";
    let result = {};
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: user, password: pass })
      });
      result = await res.json().catch(() => ({}));
      if (!res.ok || !result.ok) return fail(result.error || "Sign-in failed — check the email address and password.");
    } catch (e) {
      return fail("Could not reach the school server: " + e.message);
    }
    await FLCTerms.record(db(), { role: result.user.role, portal: PORTALS[result.user.role].portal, name: result.user.name });
    if (typeof toast === "function") toast("Welcome back, " + result.user.name + " — opening the " + PORTALS[result.user.role].portal, "success");
    try { sessionStorage.setItem("flc_portal_token", result.token); } catch (e) {}
    sessionStorage.setItem("flc_portal_role", result.user.role);
    sessionStorage.setItem("flc_portal_user", result.user.email);
    setTimeout(() => { window.location.href = "/app"; }, 700);
  }

  function closeModal() {
    document.getElementById("modal-root").innerHTML = "";
  }

  function openTerms() {
    FLCTerms.open(db());
  }

  /* ------------------------------ Enquiry --------------------------------- */
  async function submitEnquiry(event) {
    event.preventDefault();
    const termsCheck = document.getElementById("enq-terms");
    if (!termsCheck.checked) {
      toast("Please accept the School Terms & Conditions before submitting.", "error");
      return;
    }
    const payload = {
      parentName: document.getElementById("enq-parent").value.trim(),
      phone: document.getElementById("enq-phone").value.trim(),
      email: document.getElementById("enq-email").value.trim(),
      learnerName: document.getElementById("enq-learner").value.trim(),
      gradeOfInterest: document.getElementById("enq-grade").value,
      boardingPreference: document.getElementById("enq-boarding").value,
      message: document.getElementById("enq-message").value.trim()
    };
    if (!payload.parentName || !payload.phone) {
      toast("Parent name and phone number are required.", "error");
      return;
    }
    try {
      const res = await api("/api/enquiries", "POST", payload);
      const card = document.getElementById("enquiry-card");
      card.innerHTML = `
        <div class="enquiry-success">
          <div class="success-mark">✓</div>
          <h3>Enquiry received</h3>
          <p>Thank you, ${esc(payload.parentName)}. Your enquiry regarding
             <strong>${esc(payload.learnerName || "your learner")}</strong> (${esc(payload.gradeOfInterest)}) has been logged
             as reference <strong>${esc(res.enquiry.id.toUpperCase())}</strong>.</p>
          <p>The admissions office will contact you on <strong>${esc(payload.phone)}</strong> within one working day.
             For urgent matters call ${esc(brand().phone || "the school office")}.</p>
          <div class="enquiry-next">
            <button class="btn btn-outline" onclick="Landing.openTerms()">Read the Terms &amp; Conditions</button>
            <button class="btn btn-primary" onclick="location.reload()">Submit another enquiry</button>
          </div>
        </div>`;
      toast("Admission enquiry submitted successfully.", "success");
    } catch (e) {
      toast(e.message, "error");
    }
  }

  /* ------------------------------- Render --------------------------------- */
  function renderSite() {
    const root = document.getElementById("landing-root");
    if (!root) return;
    // the administrator's saved fonts apply to these two layouts as well
    if (window.FLC && FLC.applyTypography) {
      FLC.applyTypography((db().systemConfig && db().systemConfig.typography) || null);
    }
    root.innerHTML = `
      <div class="site">
        ${headerHtml()}
        <main>
          ${heroHtml()}
          ${statsHtml()}
          ${aboutHtml()}
          ${academicsHtml()}
          ${whyHtml()}
          ${lifeHtml()}
          ${calendarHtml()}
          ${admissionsHtml()}
          ${faqHtml()}
          ${contactHtml()}
        </main>
        ${footerHtml()}
        <button class="back-top" aria-label="Back to top" onclick="window.scrollTo({top:0,behavior:'smooth'})">↑</button>
      </div>`;
    initSlider();
    initReveal();
    initCounters();
    initHeader();
    initProgramTabs();
    initGallery();
  }

  function toggleFaq(btn) {
    const item = btn.closest(".faq-item");
    const wasOpen = item.classList.contains("open");
    document.querySelectorAll(".faq-item").forEach((f) => f.classList.remove("open"));
    if (!wasOpen) item.classList.add("open");
  }

  function switchProgram() {}

  window.Landing = { openLogin, closeModal, openTerms, submitEnquiry, submitLogin, toggleFaq, renderSite };

  async function bootstrapLanding() {
    const root = document.getElementById("landing-root");
    if (!root) return;
    try {
      window.State = window.State || { db: null };
      State.db = await api("/api/bootstrap");
      window.__flcDb = State.db;
      // home.js owns the live home page; landing.js renders only as a fallback.
      if (window.__flcHomeWillRender && window.Home) {
        setTimeout(() => { if (!window.__flcRenderedHome) renderSite(); }, 3000);
      } else {
        renderSite();
      }
    } catch (e) {
      root.innerHTML = `<div style="padding:4rem;text-align:center;font-family:sans-serif">
        <h2>School website temporarily unavailable</h2>
        <p style="color:#5c5c5c">${esc(e.message)}</p></div>`;
    }
  }

  if (document.readyState === "loading") {
    window.addEventListener("DOMContentLoaded", bootstrapLanding);
  } else {
    bootstrapLanding();
  }
})();
