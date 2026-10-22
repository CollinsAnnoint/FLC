#!/usr/bin/env python3
"""themes.js sends the session token; styles for the Help Centre, channels and the editing bar;
typography presets; and the website words wired into the live design."""
import os

os.chdir("/home/user")

# ----------------------------------------------------------------- themes.js
p = "public/themes.js"
s = open(p, encoding="utf-8").read()
if "X-FLC-Token" not in s:
    old = '''      const res = await fetch("/api/config/branding", {
        method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({'''
    new = '''      const token = (() => {
        try { return sessionStorage.getItem("flc_portal_token") || localStorage.getItem("flc_portal_token"); } catch (e) { return null; }
      })();
      const res = await fetch("/api/config/branding", {
        method: "PUT",
        headers: token
          ? { "Content-Type": "application/json", "X-FLC-Token": token }
          : { "Content-Type": "application/json" },
        body: JSON.stringify({'''
    assert old in s, "themes.js apply anchor"
    s = s.replace(old, new, 1)
    old2 = '''      if (!res.ok) throw new Error("The server rejected the change (" + res.status + ")");'''
    new2 = '''      if (res.status === 401) {
        throw new Error("Sign in as the administrator first — the colour applies to the live system and the server only accepts it from a signed-in account.");
      }
      if (!res.ok) throw new Error("The server rejected the change (" + res.status + ")");'''
    assert old2 in s
    s = s.replace(old2, new2, 1)
    open(p, "w", encoding="utf-8").write(s)
    print("themes.js: apply() now carries the session token")

# ------------------------------------------------------------------ styles.css
p = "public/styles.css"
s = open(p, encoding="utf-8").read()
if ".help-art" not in s:
    s += '''
/* ============================================================================
   Help Centre, payment channels and the website editing bar
   ========================================================================= */
.signin-forgot { text-align: right; margin: -0.35rem 0 0.6rem; }
.signin-forgot a { font-size: 0.83rem; font-weight: 600; text-decoration: none; border-bottom: 1px solid currentColor; }
.signin-forgot-form { border-top: 1px solid var(--line); padding-top: 0.9rem; margin-top: 0.35rem; }
.signin-note { font-size: 0.82rem; padding: 0.6rem 0.75rem; border-radius: 8px; background: #f6f6f6; border: 1px solid var(--line); margin-top: 0.6rem; }
.signin-note.good { background: #eef6ee; border-color: #cfe3cf; }
.signin-note.bad { background: #fdecef; border-color: #f3c9d1; }
.signin-hint { font-size: 0.76rem; color: var(--text-muted); margin-top: 0.6rem; line-height: 1.5; }

.help-cat { margin: 1.1rem 0 0.5rem; font-size: 0.95rem; text-transform: uppercase; letter-spacing: 0.08em; color: var(--text-muted); }
.help-art h3 { margin: 0.35rem 0 0.4rem; font-size: 1.02rem; }
.help-art-head { display: flex; justify-content: space-between; align-items: center; gap: 0.6rem; }
.help-tags { display: flex; gap: 0.35rem; flex-wrap: wrap; margin-top: 0.5rem; }
.help-tag { font-size: 0.72rem; padding: 0.15rem 0.5rem; border-radius: 999px; background: #f2f2f2; border: 1px solid var(--line); color: var(--text-muted); }
.help-tag.warn { background: var(--accent); border-color: var(--accent); color: #fff; }
.help-note { font-size: 0.8rem; color: var(--text-muted); line-height: 1.55; }
.help-note.warn-note { color: var(--accent); font-weight: 600; }
.help-list { margin: 0.5rem 0 0; padding-left: 1.1rem; font-size: 0.86rem; line-height: 1.7; }
.empty-note { font-size: 0.86rem; color: var(--text-muted); }
.link-btn { background: none; border: none; padding: 0; color: var(--accent); font: inherit; font-weight: 600; cursor: pointer; text-decoration: underline; }
.temp-pass { background: #fdecef; border: 1px dashed var(--accent); padding: 0.1rem 0.4rem; border-radius: 6px; font-weight: 700; letter-spacing: 0.04em; }

.reset-row { display: flex; gap: 1rem; justify-content: space-between; align-items: flex-start; padding: 0.85rem 0; border-top: 1px solid var(--line); flex-wrap: wrap; }
.reset-row.done { opacity: 0.72; }
.reset-actions { display: flex; gap: 0.45rem; flex-wrap: wrap; }

.sec-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 0.5rem; }
.sec-item { display: flex; gap: 0.6rem; align-items: flex-start; padding: 0.55rem 0.7rem; border: 1px solid var(--line); border-radius: 9px; }
.sec-item strong { font-size: 0.84rem; }
.sec-dot { width: 9px; height: 9px; border-radius: 50%; margin-top: 5px; flex-shrink: 0; background: #2e7d32; }
.sec-item.todo .sec-dot { background: #b98600; }
.sec-log { margin: 0.4rem 0 0; padding-left: 1rem; font-size: 0.8rem; color: var(--text-muted); line-height: 1.7; }
.sec-log span { font-variant-numeric: tabular-nums; color: var(--text); }
.sec-log em { font-style: normal; opacity: 0.75; }

.channel-list { display: flex; flex-direction: column; gap: 0.5rem; }
.channel-row { display: grid; grid-template-columns: minmax(190px, 1.2fr) minmax(180px, 1.6fr) auto auto; gap: 0.6rem; align-items: center; padding: 0.6rem 0; border-top: 1px solid var(--line); }
.channel-row.off { opacity: 0.6; }
.channel-main strong { font-size: 0.86rem; }
.channel-detail { min-width: 0; }

/* The administrator's editing bar on the public website */
.edit-bar { position: fixed; left: 0; right: 0; bottom: 0; z-index: 900; background: var(--navy-900); color: #fff;
  border-top: 3px solid var(--gold-500); box-shadow: 0 -10px 30px rgba(0,0,0,0.35); font-family: var(--sans); }
.edit-bar-in { max-width: 1240px; margin: 0 auto; padding: 0.7rem 1.1rem; display: flex; gap: 0.9rem; align-items: center; flex-wrap: wrap; }
.edit-bar strong { font-size: 0.82rem; letter-spacing: 0.06em; text-transform: uppercase; }
.edit-bar label { font-size: 0.74rem; text-transform: uppercase; letter-spacing: 0.06em; opacity: 0.75; display: block; margin-bottom: 0.15rem; }
.edit-bar select, .edit-bar input { background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.24); color: #fff;
  border-radius: 7px; padding: 0.35rem 0.5rem; font-size: 0.82rem; font-family: inherit; min-width: 130px; }
.edit-bar select option { color: #111; }
.edit-bar .eb-group { display: flex; gap: 0.5rem; flex-wrap: wrap; align-items: flex-end; }
.edit-bar .eb-field { display: flex; flex-direction: column; }
.edit-bar .eb-actions { margin-left: auto; display: flex; gap: 0.5rem; align-items: center; flex-wrap: wrap; }
.edit-bar .eb-btn { background: var(--gold-500); color: #fff; border: none; border-radius: 7px; padding: 0.45rem 0.85rem;
  font-weight: 700; font-size: 0.82rem; cursor: pointer; font-family: inherit; }
.edit-bar .eb-btn.ghost { background: transparent; border: 1px solid rgba(255,255,255,0.35); color: #fff; font-weight: 600; }
.edit-bar .eb-btn:hover { filter: brightness(1.08); }
.edit-bar .eb-note { font-size: 0.74rem; opacity: 0.8; }
.edit-bar .eb-words { max-width: 320px; }
.edit-bar .eb-words input { width: 100%; }
body.has-edit-bar { padding-bottom: 108px; }
@media (max-width: 900px) { .edit-bar-in { gap: 0.6rem; } .edit-bar .eb-actions { margin-left: 0; } }
'''
    open(p, "w", encoding="utf-8").write(s)
    print("styles.css: Help Centre, channels and editing bar styles")

# ------------------------------------------------------------------ homes.js
p = "public/homes.js"
s = open(p, encoding="utf-8").read()
if "siteContent" not in s:
    # 1. helper that reads the administrator's saved website words
    old = '''  function design8() {'''
    new = '''  /* The website words the administrator can rewrite from the editing bar. */
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
    Object.keys(fallback).forEach((k) => { out[k] = (saved[k] && String(saved[k]).trim()) || fallback[k]; });
    return out;
  }

  /* Replaces {term}, {year}, {fromFee} and {school} in the administrator's words. */
  function words(text) {
    const ac = academic();
    return String(text)
      .replace(/\\{term\\}/g, ac.currentTerm || "")
      .replace(/\\{year\\}/g, ac.currentYear || "")
      .replace(/\\{school\\}/g, brand().schoolName || "")
      .replace(/\\{fromFee\\}/g, money(cheapestFee()));
  }

  function design8() {'''
    assert old in s
    s = s.replace(old, new, 1)

    # 2. hero: the administrator's words and images
    old = '''      <section class="d8-hero">
        <div class="d8-slides d8-slides-hero" aria-hidden="true">
          ${[IMG.campus, IMG.learners, IMG.classroom, IMG.sports]
            .map((src, i) => `<img src="${src}" alt="" loading="eager" style="animation-delay:${i * 9}s" />`).join("")}
        </div>
        <div class="d8-hero-scrim"></div>
        <div class="hx-in d8-hero-in">
          <span class="d8-kicker">Admissions open · ${E(ac.currentTerm)} ${E(ac.currentYear)}</span>
          <h1>Get ready to excel in faith, competence &amp; character</h1>
          <div class="d8-hero-rule"></div>
          <p class="d8-hero-sub">A Ministry of Education registered Competency-Based Curriculum school on Ngong Road,
            Nairobi — Pre-Primary to Junior School, day and boarding, ${db().transportRoutes.length} bus routes and a
            secure, disciplined campus.</p>'''
    new = '''      <section class="d8-hero">
        <div class="d8-slides d8-slides-hero" aria-hidden="true">
          ${(SC.heroImages && SC.heroImages.length ? SC.heroImages : [IMG.campus, IMG.learners, IMG.classroom, IMG.sports])
            .slice(0, 4)
            .map((src, i) => `<img src="${E(src)}" alt="" loading="eager" style="animation-delay:${i * 9}s" />`).join("")}
        </div>
        <div class="d8-hero-scrim"></div>
        <div class="hx-in d8-hero-in">
          <span class="d8-kicker">${E(words(SC.heroKicker))}</span>
          <h1>${E(words(SC.heroTitle))}</h1>
          <div class="d8-hero-rule"></div>
          <p class="d8-hero-sub">${E(words(SC.heroSub))}</p>'''
    assert old in s, "design8 hero anchor"
    s = s.replace(old, new, 1)

    # 3. the call-out band
    old = '''          <p class="d8-q">Think a quality CBC education is out of reach?</p>
          <p class="d8-band-sub">Day fees from <strong>${fromFee}</strong> a term, with sibling concessions, instalment
            plans and bursary guidance from the bursar — every payment receipted and posted to the parent portal.</p>'''
    new = '''          <p class="d8-q">${E(words(SC.bandQuestion))}</p>
          <p class="d8-band-sub">${E(words(SC.bandSub))}</p>'''
    assert old in s, "design8 band anchor"
    s = s.replace(old, new, 1)

    # 4. SC has to exist inside design8's scope
    old = '''  function design8() {
    const b = brand();'''
    new = '''  function design8() {
    const SC = sc();
    const b = brand();'''
    assert old in s, "design8 head"
    s = s.replace(old, new, 1)

    open(p, "w", encoding="utf-8").write(s)
    print("homes.js: hero, band and hero images wired to the administrator's words")

# ------------------------------------------------- homes.js: apply typography
p = "public/homes.js"
s = open(p, encoding="utf-8").read()
if "applyTypography" not in s:
    old = '''      if (!window.__flcThemePreviewed && window.FLCThemes) {'''
    new = '''      if (window.FLC && FLC.applyTypography) FLC.applyTypography(db().systemConfig.typography);
      if (!window.__flcThemePreviewed && window.FLCThemes) {'''
    assert old in s
    s = s.replace(old, new, 1)
    open(p, "w", encoding="utf-8").write(s)
    print("homes.js: typography applied on the public site")
