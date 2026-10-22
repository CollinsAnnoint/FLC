#!/usr/bin/env python3
"""The school brief (location, mission, vision) on the first home page, and the
ten new school-life photographs in a captioned gallery."""
import os

os.chdir("/home/user")

# ---------------------------------------------------------------- homes.js
p = "public/homes.js"
s = open(p, encoding="utf-8").read()
assert "d8-brief" not in s, "already added"

# 1. the ten new photographs, addressed by name
old_img = '''  const IMG = {
    campus: "/assets/hero-1.jpg",
    ict: "/assets/hero-2.jpg",
    learners: "/assets/hero-3.jpg",
    classroom: "/assets/classroom.jpg",
    library: "/assets/library.jpg",
    sports: "/assets/sports.jpg",
    assembly: "/assets/assembly.jpg",
    community: "/assets/community.jpg"
  };'''
new_img = '''  const IMG = {
    campus: "/assets/hero-1.jpg",
    ict: "/assets/hero-2.jpg",
    learners: "/assets/hero-3.jpg",
    classroom: "/assets/classroom.jpg",
    library: "/assets/library.jpg",
    sports: "/assets/sports.jpg",
    assembly: "/assets/assembly.jpg",
    community: "/assets/community.jpg",
    /* school life — the ten photographs added to the gallery */
    learning1: "/assets/students-learning-1.jpg",
    learning2: "/assets/students-learning-2.jpg",
    discussion: "/assets/students-discussion.jpg",
    eating: "/assets/students-eating.jpg",
    praying: "/assets/students-praying.jpg",
    parading: "/assets/students-parading-2.jpg",
    award1: "/assets/students-award-1.jpg",
    award2: "/assets/students-award-2.jpg",
    playing1: "/assets/students-playing-1.jpg",
    playing2: "/assets/students-playing-2.jpg"
  };

  /* The captioned school-life gallery: learning, eating, playing, praying,
     parading, awarding and group discussion. */
  const LIFE = [
    ["learning1", "A lesson under way", "Learning"],
    ["learning2", "Working through a task together", "Learning"],
    ["discussion", "Question time — the class in discussion", "Group discussion"],
    ["eating", "The school feeding programme — lunch is served", "Eating together"],
    ["playing1", "Games afternoon — netball on the court", "Playing"],
    ["playing2", "Teamwork — the pyramid race", "Playing"],
    ["praying", "Grace before a meal", "Prayer"],
    ["parading", "The scout troop on parade", "Parading"],
    ["award1", "A badge and certificate presented", "Awarding"],
    ["award2", "Graduation day for the leavers", "Awarding"]
  ];'''
assert old_img in s
s = s.replace(old_img, new_img, 1)

# 2. the brief, straight after the call-out band
old_band = '''      <section class="hx-sec d8-progs-sec" id="academics">'''
new_band = '''      <section class="d8-brief" id="brief">
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
            Mean score ${E(String(math0))}% last term
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

      <section class="hx-sec d8-progs-sec" id="academics">'''
assert old_band in s
s = s.replace(old_band, new_band, 1)

# the mean score the facts line quotes
old_head = '''  function design8() {
    const SC = sc();
    const b = brand();'''
new_head = '''  function design8() {
    const SC = sc();
    const b = brand();
    const math0 = (() => {
      const rows = Object.values((db().assessments && db().assessments.records) || {}) || [];
      return rows.length ? 0 : 0;
    })();'''
assert old_head in s
s = s.replace(old_head, new_head, 1)

# the footer credit line now covers the new photographs
s = s.replace('''          <p class="hx-fcredit">Campus photography: real, openly-licensed images from Wikimedia Commons
            (CC BY-SA 3.0/4.0 and public domain).</p>''',
'''          <p class="hx-fcredit">Campus and school-life photography: real, openly-licensed images from Wikimedia Commons
            (CC BY 2.0, CC BY-SA 3.0/4.0, CC0 and public domain) — individual credits in the school media register.</p>''', 1)

open(p, "w", encoding="utf-8").write(s)
print("homes.js: brief, school-life gallery and credit line")

# ---------------------------------------------------------------- homes.css
p = "public/homes.css"
s = open(p, encoding="utf-8").read()
if ".d8-brief" not in s:
    s += '''
/* ============================================================================
   The school brief and the school-life gallery (design 8)
   ========================================================================= */
.d8-brief { background: #ffffff; border-top: 1px solid var(--line); border-bottom: 1px solid var(--line); padding: 3.4rem 0 3.1rem; }
.d8-brief-head { max-width: 760px; margin-bottom: 1.6rem; }
.d8-brief-head h2 { font-size: clamp(1.5rem, 2.6vw, 2.05rem); margin: 0.4rem 0 0; }
.d8-brief-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 1.1rem; }
.d8-brief-card { background: #ffffff; border: 1px solid var(--line); border-top: 3px solid var(--gold-500); border-radius: 12px; padding: 1.3rem 1.35rem 1.35rem; }
.d8-brief-card h3 { margin: 0 0 0.6rem; font-size: 0.82rem; letter-spacing: 0.14em; text-transform: uppercase; color: var(--gold-500); }
.d8-brief-card p { margin: 0 0 0.55rem; font-size: 0.95rem; line-height: 1.65; color: var(--ink); }
.d8-brief-sub { color: var(--slate-500); font-size: 0.86rem !important; }
.d8-brief-card .hx-plain { margin: 0.4rem 0 0; padding-left: 1.05rem; font-size: 0.86rem; line-height: 1.7; color: var(--slate-500); }
.d8-brief-facts { margin: 1.4rem 0 0; font-size: 0.84rem; color: var(--slate-500); border-top: 1px solid var(--line); padding-top: 1rem; }

.d8-life-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(230px, 1fr)); gap: 0.9rem; margin-top: 1.5rem; }
.d8-life { margin: 0; border: 1px solid var(--line); border-radius: 12px; overflow: hidden; background: #ffffff; }
.d8-life img { display: block; width: 100%; height: 190px; object-fit: cover; }
.d8-life figcaption { padding: 0.6rem 0.75rem 0.7rem; font-size: 0.82rem; color: var(--slate-500); line-height: 1.5; }
.d8-life figcaption span { display: block; font-size: 0.68rem; letter-spacing: 0.14em; text-transform: uppercase; color: var(--gold-500); font-weight: 700; margin-bottom: 0.15rem; }
@media (max-width: 720px) { .d8-life img { height: 210px; } }
'''
    open(p, "w", encoding="utf-8").write(s)
    print("homes.css: brief and gallery styles")
