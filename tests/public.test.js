/**
 * Front page + Terms & Conditions test for FAITH LEARNING CENTRE
 * Verifies: public website rendering, enquiry submission, login gate, terms document,
 * portal-side acceptance enforcement and the customizer Legal tab.
 *
 * Usage: node tests/public.test.js   (requires the server running on PORT 3000)
 */
const { JSDOM, VirtualConsole } = require("jsdom");
const fs = require("fs");
const path = require("path");

const BASE = process.env.BASE_URL || "http://localhost:3000";
const PUBLIC = path.join(__dirname, "..", "public");
const ROOT = path.join(__dirname, "..");
const errors = [];

function boot(page, urlPath) {
  const vc = new VirtualConsole();
  const defaultUrl = page === "index.html" ? "/" : page === "designs.html" ? "/designs" : "/app";
  const dom = new JSDOM(fs.readFileSync(path.join(PUBLIC, page), "utf8"), {
    url: BASE + (urlPath || defaultUrl),
    runScripts: "outside-only",
    pretendToBeVisual: true,
    virtualConsole: vc
  });
  const { window } = dom;
  window.fetch = (u, o) => fetch(new URL(u, BASE).toString(), o);
  window.scrollTo = () => {};
  window.print = () => {};
  window.confirm = () => true;
  window.URL.createObjectURL = () => "blob:test";
  vc.on("jsdomError", (e) => {
    if (!/scrollTo|Not implemented/.test(e.message)) errors.push(page + " jsdomError: " + e.message);
  });
  vc.on("error", (m) => errors.push(page + " console.error: " + m));
  return window;
}

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

async function testLanding() {
  // Design 2 (Split Panel) is pinned so this suite always covers that page.
  const w = boot("index.html", "/?design=2");
  for (const f of ["brand.js", "app.js", "terms.js", "landing.js", "home.js", "homes.js"]) {
    try { w.eval(fs.readFileSync(path.join(PUBLIC, f), "utf8")); }
    catch (e) { errors.push("landing eval " + f + ": " + e.message); }
  }
  await wait(1800);
  const html = w.document.getElementById("landing-root").innerHTML;
  const checks = [
    ["split-panel hero renders", html.includes("hs-split-panel") && html.includes("hs-split-photo")],
    ["headline photo is shown undimmed", !html.includes("hero-dim")],
    ["live figures band", html.includes("hs-stats") && html.includes("hs-stat-v")],
    ["hero photograph plus a gallery of real school photographs", html.includes("hero-1") && ["classroom", "library", "sports", "assembly", "community"].filter((i) => html.includes(i)).length >= 3],
    ["design engine is in charge of the pinned design", w.__flcRenderedHome === "2" && !!w.Homes && w.Homes.DESIGNS.length === 8],
    ["academics programmes", html.includes("Competency-Based Curriculum") && html.includes("Junior School")],
    ["term dates from config", html.includes("Term 3") && html.includes("2026")],
    ["events listed", html.includes("Candidates") && html.includes("Dedication")],
    ["admissions process", html.includes("Joining") && html.includes("Requirements")],
    ["admission enquiry form", html.includes("Online Admission Enquiry")],
    ["terms acceptance on enquiry form", html.includes("enq-terms-2")],
    ["terms links in header and footer", (html.match(/FLCTerms.open/g) || []).length >= 3],
    ["faq accordion", html.includes("hs-faq")],
    ["photo credit retained", html.includes("Wikimedia Commons")],
    ["no purple hex codes", !/#(8b5cf6|a855f7|7c3aed|4338ca|6366f1|4f46e5|9333ea|d946ef|ec4899|ddd6fe|f3e8ff|818cf8|a5b4fc|e0e7ff|c7d2fe|f5f3ff|c4b5fd|e9d5ff)/i.test(html)]
  ];
  checks.forEach(([name, ok]) => { if (!ok) errors.push("landing: " + name + " FAILED"); });

  // Enquiry form must be blocked without T&C acceptance
  w.document.getElementById("enq-parent-2").value = "Test Parent";
  w.document.getElementById("enq-phone-2").value = "+254700111222";
  await w.Home.submitEnquiry({ preventDefault() {} }, "2");
  if (w.document.getElementById("enq-card-2").innerHTML.includes("Enquiry received")) {
    errors.push("landing: enquiry was submitted without accepting the Terms & Conditions");
  }
  w.document.getElementById("enq-terms-2").checked = true;
  await w.Home.submitEnquiry({ preventDefault() {} }, "2");
  await wait(600);
  if (!w.document.getElementById("enq-card-2").innerHTML.includes("Enquiry received")) {
    errors.push("landing: enquiry did not submit after accepting the Terms");
  }

  // Login gate (modal is shared with the portal)
  w.Landing.openLogin("parent");
  const modal = w.document.getElementById("modal-root").innerHTML;
  if (!modal.includes("Secure Portal Sign In")) errors.push("landing: login modal did not open");
  if (!modal.includes("login-terms")) errors.push("landing: login modal missing Terms acceptance checkbox");
  w.document.getElementById("login-user").value = "test.parent@example.com";
  w.document.getElementById("login-pass").value = "secret123";
  await w.Landing.submitLogin({ preventDefault() {} });
  if (!w.document.getElementById("login-error").innerHTML.includes("accept")) {
    errors.push("landing: login proceeded without accepting the Terms");
  }
  w.document.getElementById("login-terms").checked = true;

  // Terms document
  w.Landing.openTerms();
  const termsHtml = w.document.getElementById("modal-root").innerHTML;
  ["Introduction", "Fees, Payment Terms and Refunds", "Data Protection and Privacy", "Child Protection", "Governing"].forEach((c) => {
    if (!termsHtml.includes(c)) errors.push("terms document missing clause: " + c);
  });
  if (!/Version 2\.1/.test(termsHtml)) errors.push("terms document missing version stamp");
  // The design configured on the server must be what visitors get at /
  const live = await fetch(BASE + "/api/bootstrap").then((r) => r.json());
  const configured = String(live.systemConfig.branding.homeDesign || "2");
  const w2 = boot("index.html");
  for (const f of ["brand.js", "app.js", "terms.js", "landing.js", "home.js", "homes.js"]) {
    try { w2.eval(fs.readFileSync(path.join(PUBLIC, f), "utf8")); }
    catch (e) { errors.push("live page eval " + f + ": " + e.message); }
  }
  await wait(1500);
  if (w2.__flcRenderedHome !== configured) {
    errors.push("live page: configured design " + configured + " is not what renders at / (got " + w2.__flcRenderedHome + ")");
  }
  const liveHtml = w2.document.getElementById("landing-root").innerHTML;
  if (!liveHtml.includes("FAITH LEARNING CENTRE")) errors.push("live page: school name missing");
  if (!liveHtml.includes("FLCTerms.open")) errors.push("live page: Terms & Conditions not linked");
  const markers = DESIGN_MARKERS[configured] || [];
  for (const m of markers) {
    if (m.startsWith("!")) {
      if (liveHtml.includes(m.slice(1))) errors.push("live page: removed element \"" + m.slice(1) + "\" is still present");
    } else if (!liveHtml.includes(m)) {
      errors.push("live page: design " + configured + " signature element \"" + m + "\" missing");
    }
  }
  console.log("\u2713 Configured home page (design 8) verified and the configured design (" + configured + ") serves at /");

  console.log("\u2713 Live home page: live figures, enquiry gate, login gate and Terms document verified");
}

async function testPortalGate() {
  const w = boot("app.html");
  // sign in first — the Terms gate appears on entering the portal, after authentication
  const login = await fetch(BASE + "/api/auth/login", {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "leadex44@gmail.com", password: "12345678" })
  }).then((r) => r.json());
  w.sessionStorage.setItem("flc_portal_token", login.token);
  for (const f of ["brand.js", "themes.js", "app.js", "terms.js", "parent-portal.js"]) {
    try { w.eval(fs.readFileSync(path.join(PUBLIC, f), "utf8")); }
    catch (e) { errors.push("portal eval " + f + ": " + e.message); }
  }
  await wait(1800);
  const gate = w.document.getElementById("modal-root").innerHTML;
  if (!gate.includes("acceptance required")) errors.push("portal: Terms acceptance gate did not appear on first entry");
  if (!gate.includes("terms-gate-check")) errors.push("portal: gate missing acceptance checkbox");
  // Accept through the gate
  w.document.getElementById("terms-gate-check").checked = true;
  await w.FLCTerms.confirmGate();
  await wait(400);
  if (w.document.getElementById("modal-root").innerHTML.includes("acceptance required")) {
    errors.push("portal: gate did not close after acceptance");
  }
  if (!w.FLCTerms.isAccepted(w.State.db)) errors.push("portal: acceptance was not persisted locally");

  // Legal tab in the Backend Customization Zone
  w.FLC.setRole("admin");
  w.FLC.sub("customizer", "legal");
  const legal = w.document.getElementById("customizer-body").innerHTML;
  if (!legal.includes("Terms &amp; Conditions") && !legal.includes("Terms & Conditions")) errors.push("customizer: Legal tab missing terms config");
  if (!legal.includes("Acceptance Registry")) errors.push("customizer: acceptance registry missing");
  if (!legal.includes("Website Admission Enquiries")) errors.push("customizer: website enquiries panel missing");
  console.log("✓ Portal acceptance gate, persistence and Legal & Policies tab verified");
}

async function testApi() {
  const boot2 = await fetch(BASE + "/api/bootstrap").then((r) => r.json());
  if (!boot2.systemConfig.terms || boot2.systemConfig.terms.version !== "2.1") errors.push("api: terms config missing from bootstrap");
  if (!Array.isArray(boot2.events) || !boot2.events.length) errors.push("api: events missing from bootstrap");
  const consents = await fetch(BASE + "/api/consents", {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ role: "teacher", portal: "Teacher Portal", name: "auto.test@flc.ac.ke" })
  }).then((r) => r.json());
  if (!consents.ok) errors.push("api: consent recording failed");
  const page = await fetch(BASE + "/").then((r) => r.text());
  if (!page.includes("landing-root")) errors.push("api: public front page is not served at /");
  const appPage = await fetch(BASE + "/app").then((r) => r.text());
  if (!appPage.includes('id="app"')) errors.push("api: portal shell is not served at /app");
  console.log("✓ Backend endpoints, consent recording and page routing verified");
}


const DESIGN_MARKERS = {
  "1": ["hero-dim", "back-top"],
  "2": ["hs-split-panel"],
  "3": ["d3-masthead"],
  "4": ["d4-hero"],
  "5": ["d5-grid"],
  "6": ["d6-hero"],
  "7": ["d7-quick", "quick-terms"],
  "8": ["d8-hero", "d8-band", "d8-progs", "!d8-hero-card"]
};

async function testSevenDesigns() {
  const purple = /#(8b5cf6|a855f7|7c3aed|4338ca|6366f1|4f46e5|9333ea|d946ef|ec4899|ddd6fe|f3e8ff|818cf8|a5b4fc|e0e7ff|c7d2fe|f5f3ff|c4b5fd|e9d5ff)/i;
  const boot2 = await fetch(BASE + "/api/bootstrap").then((r) => r.json());
  const liveDesign = String(boot2.systemConfig.branding.homeDesign || "1");
  for (const id of ["1", "2", "3", "4", "5", "6", "7", "8"]) {
    const w = boot("index.html", "/?design=" + id);
    for (const f of ["brand.js", "app.js", "terms.js", "landing.js", "home.js", "homes.js"]) {
      try { w.eval(fs.readFileSync(path.join(PUBLIC, f), "utf8")); }
      catch (e) { errors.push("design " + id + " eval " + f + ": " + e.message); }
    }
    await wait(1500);
    const root = w.document.getElementById("landing-root");
    const html = root ? root.innerHTML : "";
    const label = "design " + id + ": ";
    if (w.__flcRenderedHome !== id) errors.push(label + "dispatcher rendered \"" + w.__flcRenderedHome + "\" instead");
    if (html.length < 4000) errors.push(label + "page content is too thin (" + html.length + " chars)");
    if (!html.includes("FAITH LEARNING CENTRE")) errors.push(label + "school name missing");
    if (!/\/assets\/[a-z0-9-]+\.jpg/.test(html)) errors.push(label + "no real school photograph referenced");
    if (!html.includes("FLCTerms.open")) errors.push(label + "Terms & Conditions not linked");
    if (purple.test(html)) errors.push(label + "unprofessional purple colour present");
    for (const marker of DESIGN_MARKERS[id]) {
      if (marker.startsWith("!")) {
        if (html.includes(marker.slice(1))) errors.push(label + "removed element \"" + marker.slice(1) + "\" is still present");
      } else if (!html.includes(marker)) {
        errors.push(label + "signature element \"" + marker + "\" missing");
      }
    }
    if (id === "8" && html.indexOf('class="d8-band"') > html.indexOf('class="hx-sec d8-progs-sec"')) {
      errors.push(label + "the call-out band must sit above the programme cards, as in the reference layout");
    }
  }
  console.log("\u2713 All eight home page designs render from the live school data (live design: " + liveDesign + ")");
}

async function testChooserPage() {
  const w = boot("designs.html");
  for (const f of ["app.js", "terms.js", "landing.js", "homes.js"]) {
    try { w.eval(fs.readFileSync(path.join(PUBLIC, f), "utf8")); }
    catch (e) { errors.push("chooser eval " + f + ": " + e.message); }
  }
  await wait(1200);
  const grid = w.document.getElementById("design-grid");
  const html = grid ? grid.innerHTML : "";
  const cards = w.document.querySelectorAll(".design-card");
  if (cards.length !== 8) errors.push("chooser: expected 8 design cards, found " + cards.length);
  const frames = [...w.document.querySelectorAll(".design-card iframe")];
  for (const id of ["1", "2", "3", "4", "5", "6", "7", "8"]) {
    const src = frames.map((f) => f.getAttribute("src") || "").find((v) => v.startsWith("/?design=" + id + "&"));
    if (src !== "/?design=" + id + "&embed=1") errors.push("chooser: live preview for design " + id + " missing (found: " + src + ")");
    if (!html.includes("Homes.choose('" + id + "')")) errors.push("chooser: \"use this design\" action for design " + id + " missing");
  }
  const page = await fetch(BASE + "/designs").then((r) => r.text());
  if (!page.includes('id="design-grid"')) errors.push("chooser: /designs route is not serving the chooser page");
  console.log("\u2713 Design chooser page previews and publishes all eight designs");
}

async function testColourOptions() {
  // Every colour combination must be previewable on the live page and applicable through the API.
  const js = await fetch(BASE + "/themes.js").then((r) => r.text());
  const ids = [...js.matchAll(/id: "([a-z]+)"/g)].map((m) => m[1]);
  if (ids.length < 6) errors.push("colours: expected at least 6 combinations, found " + ids.length);
  const page = await fetch(BASE + "/colours").then((r) => r.text());
  if (!page.includes("option-grid")) errors.push("colours: /colours is not serving the options page");
  const boot2 = await fetch(BASE + "/api/bootstrap").then((r) => r.json());
  const live = boot2.systemConfig.branding;

  // preview a combination without saving it
  const w = boot("index.html", "/?theme=teal");
  for (const f of ["app.js", "themes.js", "terms.js", "landing.js", "home.js", "homes.js"]) {
    try { w.eval(fs.readFileSync(path.join(PUBLIC, f), "utf8")); }
    catch (e) { errors.push("colours eval " + f + ": " + e.message); }
  }
  await wait(1400);
  if (w.document.documentElement.getAttribute("data-theme-preview") !== "teal") {
    errors.push("colours: ?theme=teal did not apply the preview");
  }
  if (!w.document.getElementById("theme-preview-bar")) errors.push("colours: preview bar did not appear");
  const after = await fetch(BASE + "/api/bootstrap").then((r) => r.json());
  const b2 = after.systemConfig.branding;
  if (b2.primaryColor !== live.primaryColor || b2.accentColor !== live.accentColor) {
    errors.push("colours: previewing a combination must not change what is saved on the server");
  }
  console.log("\u2713 " + ids.length + " colour combinations previewable without saving, options page served at /colours");
}

async function testBrandAndRows() {
  // the logo mark: a real vector file plus the inline mark on every live page
  const logo = await fetch(BASE + "/assets/logo.svg");
  const logoSvg = await logo.text();
  if (!logo.ok || !logoSvg.includes("<svg")) errors.push("logo: /assets/logo.svg is not served as vector art");
  const brandJs = await fetch(BASE + "/brand.js");
  if (!brandJs.ok) errors.push("logo: brand.js is not served");
  for (const page of ["/", "/app", "/designs", "/colours"]) {
    const pageHtml = await fetch(BASE + page).then((r) => r.text());
    if (!pageHtml.includes("/brand.js")) errors.push("logo: " + page + " does not load the logo mark");
    if (!pageHtml.includes('rel="icon"')) errors.push("logo: " + page + " has no tab icon");
  }

  // the home page alternates the image side down the alternating band
  const w = boot("index.html", "/");
  for (const f of ["brand.js", "app.js", "terms.js", "landing.js", "home.js", "homes.js"]) {
    try { w.eval(fs.readFileSync(path.join(PUBLIC, f), "utf8")); }
    catch (e) { errors.push("rows eval " + f + ": " + e.message); }
  }
  await wait(1800);
  const root = w.document.getElementById("landing-root");
  const html = root ? root.innerHTML : "";
  const doc = w.document;
  const rows = [...doc.querySelectorAll(".d8-alt")];
  if (rows.length < 3) errors.push("rows: the home page should alternate at least three photo rows (found " + rows.length + ")");
  const sides = rows.map((r) => (r.classList.contains("rev") ? "left" : "right"));
  if (sides.every((s) => s === sides[0]) && sides.length > 1) errors.push("rows: every photograph sits on the same side — they must alternate");
  const photos = rows.map((r) => r.querySelector(".d8-alt-photo img")?.getAttribute("src") || "");
  if (photos.some((p) => !/^\/assets\/[a-z0-9-]+\.jpg$/.test(p))) errors.push("rows: a row uses something other than a credited school photograph");
  if (new Set(photos).size !== photos.length) errors.push("rows: the same photograph repeats down the alternating band");
  if (photos.length && sides.length && sides.join() === sides.map((_, i) => (i % 2 ? "left" : "right")).join()) {
    // alternating strictly, which is what was asked for
  } else if (rows.length > 1) {
    errors.push("rows: the rows do not alternate strictly (got " + sides.join(", ") + ")");
  }
  if (!html.includes("svg class=\"brand-mark\"")) errors.push("logo: the home page header does not draw the new logo mark");

  // the hero and the alternating band carry transitioning (cross-fading) images
  const heroLayers = [...doc.querySelectorAll(".d8-slides-hero img")];
  if (heroLayers.length < 3) errors.push("hero: the home page hero should cross-fade between at least three photographs (found " + heroLayers.length + ")");
  if (heroLayers.some((i) => !/^\/assets\/[a-z0-9-]+\.jpg$/.test(i.getAttribute("src") || ""))) {
    errors.push("hero: the slideshow uses something other than the credited school photographs");
  }
  const pairRows = rows.filter((r) => r.querySelectorAll(".d8-alt-photo img").length >= 2);
  if (pairRows.length !== rows.length) {
    errors.push("rows: every alternating row should cross-fade between two photographs (" + pairRows.length + " of " + rows.length + ")");
  }
  const homesCss = fs.readFileSync(path.join(PUBLIC, "homes.css"), "utf8");
  for (const needle of ["@keyframes d8-fade-cycle", "@keyframes d8-fade-pair", "prefers-reduced-motion"]) {
    if (!homesCss.includes(needle)) errors.push("transitions: \"" + needle + "\" missing from homes.css");
  }

  // the type system: Rubik, self-hosted, on both stylesheets
  const sheet = ["styles.css", "site.css"].map((f) => fs.readFileSync(path.join(PUBLIC, f), "utf8")).join("\n");
  if (!/--serif:\s*"Rubik"/.test(sheet)) errors.push("fonts: the display face is not Rubik");
  if (!/--sans:\s*"Rubik"/.test(sheet)) errors.push("fonts: the body face is not Rubik");
  for (const old of ["Baskerville", "Candara", "Palatino Linotype", "Iowan Old Style"]) {
    if (sheet.includes(old)) errors.push("fonts: the previous " + old + " stack is still set");
  }
  const faces = await fetch(BASE + "/rubik.css").then((r) => (r.ok ? r.text() : ""));
  if (!/@font-face/.test(faces) || !/Rubik/.test(faces)) errors.push("fonts: the self-hosted Rubik faces are not served");
  const font = await fetch(BASE + "/assets/fonts/rubik-latin.woff2");
  if (font.status !== 200) errors.push("fonts: the Rubik font file is not served");

  // light layouts are pure white: no grey or cream washes on static surfaces
  const sweep = ["site.css", "styles.css", "homes.css"].map((f) => fs.readFileSync(path.join(PUBLIC, f), "utf8")).join("\n");
  const washing = ["#f5f5f2", "#f4f4f4", "#f2f2f2", "#f8f8f6"];
  const stillGrey = washing.filter((c) => new RegExp("background(-color)?:\\s*" + c, "i").test(sweep));
  if (stillGrey.length) errors.push("white: these light surfaces are not pure white (" + stillGrey.join(", ") + ")");
  if (!/\.hx-sec\.alt[^{]*\{[^}]*background(-color)?:\s*(#ffffff|var\(--white\))/.test(sweep)) {
    errors.push("white: the alternating website sections are not pure white");
  }
  // the school brief: location, mission and vision, right under the call-out band
  for (const needle of ["d8-brief", "Location", "Our mission", "Our vision", "Registered with the Ministry of Education"]) {
    if (!html.includes(needle)) errors.push("brief: the home page brief is missing " + needle);
  }
  const briefIdx = html.indexOf("d8-brief");
  const progsIdx = html.indexOf("d8-progs-sec");
  if (briefIdx < 0 || progsIdx < 0 || briefIdx > progsIdx) {
    errors.push("brief: the brief should sit above the programme cards, straight after the call-out band");
  }
  const addr = (w.State.db.systemConfig.branding.address || "");
  if (addr && !html.includes(addr.split(",")[0])) errors.push("brief: the school's location is not shown");

  // the ten school-life photographs
  const brief = await fetch(BASE + "/api/bootstrap").then((r) => r.json());
  const life = [...html.matchAll(/\/assets\/(students-[a-z0-9-]+)\.jpg/g)].map((m) => m[1]);
  const uniqueLife = [...new Set(life)];
  if (uniqueLife.length < 10) {
    errors.push("photographs: the gallery should use ten school-life photographs (found " + uniqueLife.length + ")");
  }
  for (const group of ["Learning", "Group discussion", "Eating together", "Playing", "Prayer", "Parading", "Awarding"]) {
    if (!html.includes(group)) errors.push("photographs: no school-life photograph for " + group);
  }
  for (const file of uniqueLife) {
    const res = await fetch(BASE + "/assets/" + file + ".jpg");
    if (res.status !== 200) errors.push("photographs: " + file + ".jpg is not served");
  }
  const credits = await fetch(BASE + "/assets/CREDITS.md").then((r) => (r.ok ? r.text() : ""));
  for (const file of uniqueLife) {
    if (!credits.includes(file + ".jpg")) errors.push("photographs: " + file + ".jpg is not in the media register");
  }

  console.log("\u2713 New logo mark, tab icon, Rubik type system, pure-white light surfaces, the school brief (location, mission, vision), ten credited school-life photographs, " + rows.length + " alternating photo rows and " + heroLayers.length + "-image cross-fading hero verified");
}

async function testAuth() {
  const admin = { email: "leadex44@gmail.com", password: "12345678" };
  const post = (path, body) => fetch(BASE + path, {
    method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body)
  }).then(async (r) => ({ status: r.status, body: await r.json().catch(() => ({})) }));

  // 1. a wrong password is refused
  const bad = await post("/api/auth/login", { email: admin.email, password: "not-the-password" });
  if (bad.status !== 401 || bad.body.ok) errors.push("auth: a wrong password must be refused");

  // 2. an unknown account is refused
  const ghost = await post("/api/auth/login", { email: "nobody@example.com", password: admin.password });
  if (ghost.status !== 401 || ghost.body.ok) errors.push("auth: an unknown email must be refused");

  // 3. the school's administrator account signs in (email is case-insensitive)
  const good = await post("/api/auth/login", { email: admin.email.toUpperCase(), password: admin.password });
  if (!good.body.ok || !good.body.token) errors.push("auth: the administrator account could not sign in");
  if (good.body.user && good.body.user.role !== "admin") errors.push("auth: the administrator account must open the admin portal");

  // 4. the session is valid, then revoked on sign-out
  const session = await fetch(BASE + "/api/auth/session?token=" + encodeURIComponent(good.body.token)).then((r) => r.json());
  if (!session.ok || session.user.email !== admin.email) errors.push("auth: the issued session is not recognised");
  await post("/api/auth/logout", { token: good.body.token });
  const after = await fetch(BASE + "/api/auth/session?token=" + encodeURIComponent(good.body.token));
  if (after.status !== 401) errors.push("auth: signing out must revoke the session");

  // 5. the sign-in screen carries the form and the Terms acceptance checkbox
  const page = await fetch(BASE + "/app").then((r) => r.text());
  if (!page.includes("/app.js")) errors.push("auth: the portal page does not load the application");
  const w = boot("app.html", "/app");
  for (const f of ["brand.js", "app.js", "terms.js", "parent-portal.js"]) {
    try { w.eval(fs.readFileSync(path.join(PUBLIC, f), "utf8")); }
    catch (e) { errors.push("auth eval " + f + ": " + e.message); }
  }
  await wait(1400);
  const app = w.document.getElementById("app").innerHTML;
  if (!app.includes("signin-form") || !app.includes("signin-email") || !app.includes("signin-password")) {
    errors.push("auth: the portal must open on a sign-in screen");
  }
  if (!app.includes("signin-terms")) errors.push("auth: the sign-in screen must carry the Terms acceptance checkbox");
  if (app.includes("sidebar-nav")) errors.push("auth: the portal shell must not render before sign-in");

  // 6. signing in through that form reveals the shell
  w.document.getElementById("signin-email").value = admin.email;
  w.document.getElementById("signin-password").value = admin.password;
  w.document.getElementById("signin-terms").checked = true;
  await w.FLC.signIn({ preventDefault() {} });
  await wait(900);
  const shell = w.document.getElementById("app").innerHTML;
  if (!shell.includes("sidebar-nav")) errors.push("auth: signing in must open the portal");
  if (!w.document.querySelector(".user-chip")) errors.push("auth: the signed-in user should be named in the top bar");

  // 7. every portal still has an account behind it
  const bootstrap = await fetch(BASE + "/api/bootstrap").then((r) => r.json());
  const roles = bootstrap.portalRoles || (bootstrap.accounts || []).map((a) => a.role);
  for (const role of ["admin", "teacher", "finance", "parent"]) {
    if (!roles.includes(role)) errors.push("auth: no account exists for the " + role + " portal");
  }
  for (const account of bootstrap.accounts || []) {
    if (account.passwordHash || account.salt || account.password) {
      errors.push("auth: the bootstrap response must never expose password material for " + account.email);
    }
  }

  console.log("\u2713 Portal sign-in: bad credentials refused, admin account admitted, session revoked on sign-out, Terms checkbox on the form");
}

async function testHelpCentre() {
  // 1. the knowledge base ships with the system
  const boot = await fetch(BASE + "/api/bootstrap").then((r) => r.json());
  const arts = boot.helpArticles || [];
  if (arts.length < 8) errors.push("help: the Help Centre needs a knowledge base (found " + arts.length + " articles)");
  for (const cat of ["Accounts & passwords", "Fees & payments", "ICT support"]) {
    if (!arts.some((a) => a.category === cat)) errors.push("help: no articles in the " + cat + " category");
  }
  if (!arts.some((a) => ((a.title || "") + " " + (a.body || "")).toLowerCase().includes("forgotten"))) {
    errors.push("help: the forgotten-password article is missing");
  }

  // 2. the reset queue is private until the administrator signs in
  const anon = await fetch(BASE + "/api/help/requests");
  if (anon.status !== 401) errors.push("help: the password-reset queue must not be public");

  const login = await fetch(BASE + "/api/auth/login", {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "leadex44@gmail.com", password: "12345678" })
  }).then((r) => r.json());
  const token = login.token;
  const queue = await fetch(BASE + "/api/help/requests", { headers: { "X-FLC-Token": token } }).then((r) => r.json());
  if (!queue.ok) errors.push("help: the administrator cannot read the reset queue");

  // 3. a visitor can raise a forgotten-password request, and the office can action it
  const asked = await fetch(BASE + "/api/auth/forgot", {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "teacher@faithlearningcentre.ac.ke", note: "test" })
  }).then((r) => r.json());
  if (!asked.ok) errors.push("help: a forgotten-password request could not be raised");
  const after = await fetch(BASE + "/api/help/requests", { headers: { "X-FLC-Token": token } }).then((r) => r.json());
  const open = (after.requests || []).find((r) => r.email === "teacher@faithlearningcentre.ac.ke" && r.status === "open");
  if (!open) errors.push("help: the request did not reach the administrator's queue");
  if (open) {
    const res = await fetch(BASE + "/api/help/requests/" + open.id + "/resolve", {
      method: "POST", headers: { "Content-Type": "application/json", "X-FLC-Token": token }, body: "{}"
    }).then((r) => r.json());
    if (!res.ok || !/^FLC-/.test(res.tempPassword || "")) errors.push("help: no temporary password was issued");
    const signed = await fetch(BASE + "/api/auth/login", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "teacher@faithlearningcentre.ac.ke", password: res.tempPassword })
    }).then((r) => r.json());
    if (!signed.ok) errors.push("help: the temporary password does not sign in");
    if (signed.user && signed.user.mustChangePassword !== true) errors.push("help: a temporary password must force a change");
    // put the demonstration account back the way it was
    await fetch(BASE + "/api/help/requests/" + open.id + "/dismiss", {
      method: "POST", headers: { "Content-Type": "application/json", "X-FLC-Token": token }, body: "{}"
    });
    await fetch(BASE + "/api/auth/password", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: signed.token, currentPassword: res.tempPassword, newPassword: "Teacher@2026" })
    });
  }

  // 4. the security checklist
  const sec = await fetch(BASE + "/api/security/status", { headers: { "X-FLC-Token": token } }).then((r) => r.json());
  if (!sec.ok || (sec.checklist || []).length < 8) errors.push("help: the security checklist did not load");
  if (!sec.signIn || !/scrypt/.test(sec.signIn.passwordStorage || "")) errors.push("help: the security status must report how passwords are stored");

  // 5. payment channels: E-Citizen and the temporary Pochi la Biashara number
  const fc = boot.systemConfig.financeConfig;
  const channels = fc.paymentChannels || [];
  const pochi = channels.find((c) => c.kind === "mpesa" && c.temporary);
  if (!pochi) errors.push("payments: the temporary M-Pesa Pochi la Biashara channel is missing");
  else {
    if (!String(pochi.detail || "").includes("0769679217")) errors.push("payments: the Pochi la Biashara number 0769679217 is not published");
    if (pochi.temporary !== true) errors.push("payments: the Pochi la Biashara channel must be flagged temporary so it can be switched off");
  }
  if (!channels.some((c) => c.kind === "government")) errors.push("payments: E-Citizen is missing from the payment channels");
  if (!channels.every((c) => typeof c.enabled === "boolean")) errors.push("payments: every channel needs an on/off switch");

  // the channels reach the website's fee section and the portal's payment form
  const site = await fetch(BASE + "/").then((r) => r.text());
  if (!site.includes("homes.js")) errors.push("payments: the website does not load the home page scripts");
  const admin = await fetch(BASE + "/admin-bar.js");
  if (admin.status !== 200) errors.push("website: the administrator's editing bar is not served");

  console.log("\u2713 Help Centre (articles, forgotten-password resets, security checklist) and the payment channels — E-Citizen and the temporary Pochi la Biashara — verified");
}

async function testOperations() {
  // 1. liveness probe and the running version — for the school's hosting and monitoring
  const health = await fetch(BASE + "/healthz").then((r) => r.json());
  if (!health.ok || !health.version) errors.push("ops: /healthz must report the service and version");
  if (typeof health.uptimeSeconds !== "number") errors.push("ops: /healthz must report uptime");
  const meta = await fetch(BASE + "/version.js").then((r) => r.text());
  if (!/window\.FLC_META\s*=\s*\{[^}]*version/.test(meta)) errors.push("ops: /version.js must publish the app version");
  const pkg = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "package.json"), "utf8"));
  if (!/^\d+\.\d+\.\d+$/.test(pkg.version)) errors.push("ops: package.json needs a semantic version");

  // 2. it installs on a phone or tablet like an app
  const manifest = await fetch(BASE + "/manifest.json");
  const man = await manifest.json().catch(() => ({}));
  if (!manifest.ok || man.start_url !== "/app") errors.push("ops: the web app manifest is missing or wrong");
  for (const icon of man.icons || []) {
    const res = await fetch(BASE + icon.src);
    if (res.status !== 200) errors.push("ops: the icon " + icon.src + " is not served");
  }

  // 3. /healthz must not leak anything sensitive
  const rawHealth = JSON.stringify(health);
  for (const secret of ["passwordHash", "salt", "scrypt", "students", "staff"]) {
    if (rawHealth.includes(secret)) errors.push("ops: /healthz leaks " + secret);
  }

  const login = await fetch(BASE + "/api/auth/login", {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "leadex44@gmail.com", password: "12345678" })
  }).then((r) => r.json());
  const token = login.token;
  const auth = { "X-FLC-Token": token };

  // 4. system status is administrator-only and reports the live system
  if ((await fetch(BASE + "/api/system/status")).status !== 401) errors.push("ops: system status must require a signed-in account");
  const status = await fetch(BASE + "/api/system/status", { headers: auth }).then((r) => r.json());
  if (!status.ok || !status.counts || typeof status.counts.students !== "number") errors.push("ops: system status did not report the database counts");
  if (!status.databasePath || !/db\.json$/.test(status.databasePath)) errors.push("ops: system status must name the database file");
  if (!status.lastBackup || !status.lastBackup.file) errors.push("ops: no automatic backup has been recorded");
  if (!Array.isArray(status.temporaryChannels)) errors.push("ops: system status should list the temporary payment channels");

  // 5. a manual backup can be taken and is recorded
  const backup = await fetch(BASE + "/api/system/backup", {
    method: "POST", headers: Object.assign({ "Content-Type": "application/json" }, auth), body: "{}"
  }).then((r) => r.json());
  if (!backup.ok || !/^db-.*\.json$/.test(backup.file || "")) errors.push("ops: taking a manual backup failed");
  const after = await fetch(BASE + "/healthz").then((r) => r.json());
  if (!after.lastBackup || after.lastBackup.file !== backup.file) errors.push("ops: the new backup was not recorded");

  // 6. devices: this session is listed, others can be signed out
  const devices = await fetch(BASE + "/api/auth/sessions", { headers: auth }).then((r) => r.json());
  if (!devices.ok || !devices.sessions.some((d) => d.current)) errors.push("ops: the device list must show this device");
  if (devices.sessions.some((d) => /^[0-9a-f]{48}$/.test(d.token))) errors.push("security: full session tokens must never be listed");
  const revoked = await fetch(BASE + "/api/auth/sessions/revoke", {
    method: "POST", headers: Object.assign({ "Content-Type": "application/json" }, auth), body: JSON.stringify({ others: true })
  }).then((r) => r.json());
  if (!revoked.ok) errors.push("ops: signing out the other devices failed");

  // 7. the interface carries the finish-pass features
  const appJs = await fetch(BASE + "/app.js").then((r) => r.text());
  for (const needle of ["goLiveChecks", "renderPalette", "toggleNav", "revokeDevice", "takeBackup", "humanDuration"]) {
    if (!appJs.includes(needle)) errors.push("ui: " + needle + " is missing from the portal");
  }
  if (!appJs.includes("That screen could not be drawn")) errors.push("ui: a page that throws must not blank the screen");
  const css = await fetch(BASE + "/styles.css").then((r) => r.text());
  for (const needle of [".palette-backdrop", ".golive-list", ".nav-toggle", "body.nav-open", ":focus-visible", ".skip-link"]) {
    if (!css.includes(needle)) errors.push("ui: the stylesheet is missing " + needle);
  }
  if (!/\@media print[\s\S]{0,600}sidebar/.test(css)) errors.push("ui: printing must hide the navigation chrome");

  // leave the system tidy for the people using it
  await fetch(BASE + "/api/auth/logout", {
    method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token })
  });

  console.log("\u2713 Operations: health probe, version, installable app, live system status, rotating backups, device management and the finish-pass interface verified");
}

async function testTokenCoverage() {
  // Tokens painted at runtime by the theme engine.
  const RUNTIME = new Set(["--navy-950", "--navy-900", "--navy-800", "--navy-700", "--navy-600",
    "--gold-500", "--gold-600", "--gold-300", "--gold-100", "--primary", "--accent", "--tracking"]);
  const sheets = ["styles.css", "site.css", "homes.css", "home.css"];
  const sources = {};
  for (const f of sheets) {
    try { sources[f] = fs.readFileSync(path.join(PUBLIC, f), "utf8"); }
    catch (e) { sources[f] = ""; }
  }
  const definedAnywhere = new Set();
  for (const f of sheets) {
    for (const m of sources[f].matchAll(/(--[a-z0-9-]+)\s*:/gi)) definedAnywhere.add(m[1].toLowerCase());
  }

  // what each page actually loads, and therefore what has to resolve there
  const pages = {
    "app.html": ["styles.css"],                 // the portals
    "index.html": ["site.css", "homes.css"],    // the website and the eight designs
    "designs.html": ["site.css", "homes.css"],
    "colours.html": ["site.css"]
  };

  const missing = {};
  for (const [page, list] of Object.entries(pages)) {
    const definedHere = new Set();
    const usedHere = new Set();
    for (const f of list) {
      for (const m of sources[f].matchAll(/(--[a-z0-9-]+)\s*:/gi)) definedHere.add(m[1].toLowerCase());
      for (const m of sources[f].matchAll(/var\(\s*(--[a-z0-9-]+)/gi)) usedHere.add(m[1].toLowerCase());
    }
    for (const token of usedHere) {
      if (!definedHere.has(token) && !RUNTIME.has(token)) (missing[page] = missing[page] || []).push(token);
    }
  }
  const broken = Object.entries(missing);
  if (broken.length) {
    errors.push("tokens: these colour tokens are used but never defined — " +
      broken.map(([page, list]) => page + ": " + list.join(", ")).join(" | "));
  }

  // the bridge the finish-pass panels depend on
  const portal = sources["styles.css"];
  for (const token of ["--line:", "--white:", "--text:", "--navy-900:", "--gold-500:", "--ink:", "--slate-500:"]) {
    if (!portal.includes(token)) errors.push("tokens: the portal stylesheet is missing " + token);
  }
  // and the page-level guard: the palette and the editing bar must be able to paint
  const paletteRules = [...portal.matchAll(/\.palette[a-z-]*\s*\{[^}]*\}/g)].map((m) => m[0]).join("\n");
  if (/var\(--line\)/.test(paletteRules) && !portal.includes("--line:")) {
    errors.push("tokens: the command palette has no hairline colour to draw with");
  }

  console.log("\u2713 Design tokens: every token used by the websites and the portals is defined, and the finish-pass panels have a colour to paint with");
}

async function testPremiumPalette() {
  const css = ["styles.css", "site.css", "homes.css", "home.css"]
    .map((f) => fs.readFileSync(path.join(PUBLIC, f), "utf8")).join("\n");
  const cheap = ["#1e40af", "#1e3a8a", "#d97706", "#b45309", "#f1f5f9", "#e2e8f0", "#0f172a", "#e8eff7", "#eef4fb", "#cfe0f0"];
  const found = cheap.filter((c) => css.toLowerCase().includes(c));
  if (found.length) errors.push("palette: generic colours still present (" + found.join(", ") + ")");
  for (const token of ["#e4002b", "#141316", "#3a1119"]) {
    if (!css.toLowerCase().includes(token)) errors.push("palette: premium token " + token + " missing");
  }
  const boot2 = await fetch(BASE + "/api/bootstrap").then((r) => r.json());
  const b = boot2.systemConfig.branding;
  const themesJs = await fetch(BASE + "/themes.js").then((r) => r.text());
  const themePrimaries = [...themesJs.matchAll(/navy900: "([#0-9a-fA-F]+)"/g)].map((m) => m[1].toLowerCase());
  if (!/^#[0-9a-f]{6}$/i.test(b.primaryColor || "") || !/^#[0-9a-f]{6}$/i.test(b.accentColor || "")) {
    errors.push("palette: branding colours are not valid hex values (" + b.primaryColor + " / " + b.accentColor + ")");
  } else if (!themePrimaries.includes(String(b.primaryColor).toLowerCase())) {
    errors.push("palette: saved colour " + b.primaryColor + " is not one of the system's combinations");
  }
  if (!["onyx", "navy", "steel", "graphite", "teal", "green", "burgundy", "light"].includes(b.sidebarTheme)) {
    errors.push("palette: unknown sidebar theme \"" + b.sidebarTheme + "\"");
  }
  const token = await fetch(BASE + "/api/auth/login", {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "leadex44@gmail.com", password: "12345678" })
  }).then((r) => r.json()).then((d) => d.token);
  const anonPut = await fetch(BASE + "/api/config/home-design", {
    method: "PUT", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ design: "3" })
  });
  if (anonPut.status !== 401) errors.push("security: a visitor must not be able to change the home page design");
  const put = await fetch(BASE + "/api/config/home-design", {
    method: "PUT", headers: { "Content-Type": "application/json", "X-FLC-Token": token },
    body: JSON.stringify({ design: "3" })
  }).then((r) => r.json());
  if (!put.ok || put.homeDesign !== "3") errors.push("api: choosing a home page design failed");
  const restore = await fetch(BASE + "/api/config/home-design", {
    method: "PUT", headers: { "Content-Type": "application/json", "X-FLC-Token": token },
    body: JSON.stringify({ design: String(b.homeDesign || "2") })
  }).then((r) => r.json());
  if (restore.homeDesign !== String(b.homeDesign || "2")) errors.push("api: home page design was not restored after the test");
  console.log("\u2713 Corporate palette applied and the design choice persists on the server");
}

/* ---- the public header controls: theme, refresh and log out ---------------- */
async function testHeaderControls() {
  const PUBLIC_FILES = ["brand.js", "themes.js", "app.js", "terms.js", "landing.js", "home.js", "homes.js", "controls.js"];

  // the two new files must be served, and every page must load them
  for (const file of ["controls.js", "mode.css"]) {
    const res = await fetch(BASE + "/" + file);
    if (res.status !== 200) errors.push("controls: " + file + " is not served");
  }
  for (const page of ["index.html", "designs.html", "colours.html"]) {
    const html = fs.readFileSync(path.join(PUBLIC, page), "utf8");
    if (!html.includes("controls.js")) errors.push("controls: " + page + " does not load controls.js");
    if (!html.includes("mode.css")) errors.push("controls: " + page + " does not load mode.css");
  }
  for (const page of ["designs.html", "colours.html"]) {
    if (!fs.readFileSync(path.join(PUBLIC, page), "utf8").includes("data-flc-controls")) {
      errors.push("controls: " + page + " has no header slot for the control group");
    }
  }
  const portal = fs.readFileSync(path.join(PUBLIC, "app.html"), "utf8");
  if (portal.includes("controls.js")) errors.push("controls: the portal must keep its own Sync / sign out controls");

  // the dark theme is opt-in and complete: every key light surface has a counterpart
  const modeCss = fs.readFileSync(path.join(PUBLIC, "mode.css"), "utf8");
  if (!modeCss.includes(':root[data-mode="dark"]')) errors.push("controls: mode.css has no dark theme block");
  for (const surface of ["body.public-site", ".site-footer", ".hx-header", ".hx-table tr:hover td",
    ".d8-brief", ".d8-life", ".hs-life-card", ".hs-table-wrap", ".terms-scroll", ".about-media-card",
    ".hx-form-card", ".hx-table th", ".site-header.scrolled"]) {
    if (!modeCss.includes(surface)) errors.push("controls: the dark theme has no rule for " + surface);
  }
  if (modeCss.includes("--paper: #0d0c0e") === false) errors.push("controls: the dark theme does not use the supplied onyx page colour");

  // a real browser boot of the front page: mount, theme, refresh, log out
  const vc = new VirtualConsole();
  const dom = new JSDOM(fs.readFileSync(path.join(PUBLIC, "index.html"), "utf8"), {
    url: BASE + "/", runScripts: "outside-only", pretendToBeVisual: true, virtualConsole: vc
  });
  const w = dom.window;
  const calls = [];
  w.fetch = (u, o) => { calls.push({ url: String(u), method: (o && o.method) || "GET", body: o && o.body }); return fetch(new URL(u, BASE).toString(), o); };
  w.scrollTo = () => {}; w.print = () => {}; w.confirm = () => true;
  w.URL.createObjectURL = () => "blob:test";
  vc.on("jsdomError", () => {}); vc.on("error", () => {});

  // sign in through the API, then hand the page that session
  const login = await fetch(BASE + "/api/auth/login", {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "leadex44@gmail.com", password: "12345678" })
  }).then((r) => r.json());
  if (!login.ok) errors.push("controls: could not sign in to test the log out control");
  w.sessionStorage.setItem("flc_portal_token", login.token);

  for (const file of PUBLIC_FILES) {
    try { w.eval(fs.readFileSync(path.join(PUBLIC, file), "utf8")); } catch (e) { /* harness limit */ }
  }
  await wait(2500);

  if (typeof w.FLControls !== "object") errors.push("controls: FLControls was not published");
  const group = w.document.querySelector("#flc-controls");
  if (!group) errors.push("controls: the control group never mounted into the header");
  else if (!group.closest("header") && !group.closest(".d8-top-right, .site-header-actions")) {
    errors.push("controls: the control group mounted outside the site header");
  }
  for (const id of ["flc-mode-btn", "flc-refresh-btn", "flc-logout-btn"]) {
    if (!w.document.getElementById(id)) errors.push("controls: " + id + " is missing");
  }
  const logoutBtn = w.document.getElementById("flc-logout-btn");
  if (logoutBtn && logoutBtn.hidden) errors.push("controls: log out should appear for a signed-in visitor");

  // theme: light -> dark, remembered, announced, and reversible
  if (w.document.documentElement.getAttribute("data-mode") !== "light") {
    errors.push("controls: the site should open in the light theme by default");
  }
  w.FLControls.toggleMode();
  const html = w.document.documentElement;
  if (html.getAttribute("data-mode") !== "dark") errors.push("controls: toggling did not switch to the dark theme");
  if (w.localStorage.getItem("flc_appearance") !== "dark") errors.push("controls: the theme choice was not remembered on the device");
  const modeBtn = w.document.getElementById("flc-mode-btn");
  if (modeBtn && modeBtn.getAttribute("aria-pressed") !== "true") errors.push("controls: the theme control does not report its pressed state");
  w.FLControls.toggleMode();
  if (html.getAttribute("data-mode") !== "light" || w.localStorage.getItem("flc_appearance") !== "light") {
    errors.push("controls: the theme control does not switch back to light");
  }
  if (w.document.querySelector(".flc-toast") === null && !w.document.getElementById("flc-toast")) {
    errors.push("controls: no feedback was shown when the theme changed");
  }

  // refresh: re-reads the school data over the network
  const fetchesBefore = calls.filter((c) => c.url.includes("/api/bootstrap")).length;
  await w.FLControls.refresh();
  const fetchesAfter = calls.filter((c) => c.url.includes("/api/bootstrap")).length;
  if (fetchesAfter <= fetchesBefore) errors.push("controls: the refresh control did not re-read the school data");

  // log out: the device token is cleared and the server session is revoked
  await w.FLControls.logout();
  await wait(600);
  const posted = calls.find((c) => c.url.includes("/api/auth/logout") && c.method === "POST");
  if (!posted) errors.push("controls: log out never reached the server");
  if (posted && !String(posted.body).includes(login.token)) {
    errors.push("controls: log out did not send the session token, so the session would survive");
  }
  if (w.sessionStorage.getItem("flc_portal_token") !== null) errors.push("controls: log out left the device token behind");
  if (w.FLControls.signedIn()) errors.push("controls: log out left the session reported as signed in");
  const logoutAfter = w.document.getElementById("flc-logout-btn");   // the header is re-rendered, so re-query
  if (logoutAfter && !logoutAfter.hidden) errors.push("controls: log out stayed visible after signing out");
  const after = await fetch(BASE + "/api/auth/sessions", { headers: { "X-FLC-Token": login.token } });
  if (after.status !== 401) errors.push("controls: the server session was not revoked by log out");

  console.log("\u2713 Header controls: theme (light/dark, remembered), refresh from the server and a real log out verified");
}

/* ---- the public / private data boundary, and honest 404s -------------------- */
async function testDataBoundary() {
  // 1. an anonymous visitor must never receive the school's records
  const anon = await fetch(BASE + "/api/bootstrap").then((r) => r.json());
  const forbidden = ["accounts", "sessions", "auditLogs", "passwordResetRequests", "enquiries",
    "consents", "payments", "expenses", "disciplineMerits"];
  for (const key of forbidden) {
    if (anon[key] !== undefined) errors.push("privacy: /api/bootstrap must not publish " + key + " to anonymous visitors");
  }
  const raw = JSON.stringify(anon);
  for (const needle of ["passwordHash", "salt\"", "tempPassword", "guardianPhone", "guardianEmail", "grossSalary"]) {
    if (raw.includes(needle)) errors.push("privacy: the public payload contains " + needle);
  }
  const learner = (anon.students || [])[0] || {};
  for (const field of ["firstName", "lastName", "guardianName", "guardianPhone", "admNo", "dob"]) {
    if (learner[field] !== undefined) errors.push("privacy: learner field " + field + " is public");
  }
  if (!anon.portalRoles || !anon.portalRoles.length) errors.push("privacy: the public payload should still name the portals that exist");
  if (!anon.systemConfig || !anon.systemConfig.branding) errors.push("privacy: the public payload must keep the school's branding");

  // 2. the same request with a session returns the records the portal needs
  const login = await fetch(BASE + "/api/auth/login", {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "leadex44@gmail.com", password: "12345678" })
  }).then((r) => r.json());
  const mine = await fetch(BASE + "/api/bootstrap", { headers: { "X-FLC-Token": login.token } }).then((r) => r.json());
  if (mine.scope !== "session") errors.push("privacy: a signed-in bootstrap should be marked as a session payload");
  if (!Array.isArray(mine.enquiries)) errors.push("privacy: the portal cannot see the enquiries it must answer");
  if (!Array.isArray(mine.payments)) errors.push("privacy: the bursar cannot see payments");
  if (JSON.stringify(mine).includes("passwordHash")) errors.push("privacy: password hashes must never leave the server");
  if ((mine.sessions || []).length) errors.push("privacy: session tokens must not be shipped in the payload");
  await fetch(BASE + "/api/auth/logout", {
    method: "POST", headers: { "Content-Type": "application/json", "X-FLC-Token": login.token },
    body: JSON.stringify({ token: login.token })
  });

  // 3. unknown URLs answer honestly instead of serving the portal shell with 200
  for (const path of ["/no-such-page", "/server.js", "/data/db.json", "/admin"]) {
    const res = await fetch(BASE + path);
    if (res.status !== 404) errors.push("routing: " + path + " should return 404 (got " + res.status + ")");
  }
  const api404 = await fetch(BASE + "/api/no-such-endpoint");
  if (api404.status !== 404) errors.push("routing: unknown API paths should return 404");
  if (!(api404.headers.get("content-type") || "").includes("json")) errors.push("routing: unknown API paths should answer in JSON");

  // 4. the enquiry form refuses nonsense before it reaches the database
  const before = (await fetch(BASE + "/api/bootstrap").then((r) => r.json()));
  const shortPhone = await fetch(BASE + "/api/enquiries", {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ parentName: "Boundary Test", phone: "12" })
  });
  if (shortPhone.status !== 400) errors.push("enquiries: an incomplete phone number should be refused");

  console.log("\u2713 Data boundary: anonymous visitors get the public school data only, sessions get the records, unknown URLs 404");
}

/* ---- who may change what, and what the API refuses ------------------------- */
async function testPermissionsAndValidation() {
  const creds = {
    admin: ["leadex44@gmail.com", "12345678"],
    teacher: ["teacher@faithlearningcentre.ac.ke", "Teacher@2026"],
    finance: ["bursar@faithlearningcentre.ac.ke", "Bursar@2026"],
    parent: ["parent@faithlearningcentre.ac.ke", "Parent@2026"]
  };
  const token = {};
  for (const [role, [email, password]] of Object.entries(creds)) {
    const r = await fetch(BASE + "/api/auth/login", {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, password })
    }).then((x) => x.json());
    token[role] = r.token;
    if (!r.ok) errors.push("permissions: the " + role + " account cannot sign in");
  }
  const call = (role, method, path, body) => fetch(BASE + path, {
    method, headers: { "Content-Type": "application/json", "X-FLC-Token": token[role] },
    body: body === undefined ? undefined : JSON.stringify(body)
  });

  // 1. only the administrator may touch configuration, the reset queue or the register
  const officeOnly = [
    ["PUT", "/api/config/branding", {}], ["PUT", "/api/config/terms", {}], ["PUT", "/api/config/home-design", {}],
    ["GET", "/api/help/requests", undefined], ["POST", "/api/students", {}], ["POST", "/api/staff", {}]
  ];
  for (const [method, path, body] of officeOnly) {
    for (const role of ["teacher", "finance", "parent"]) {
      const res = await call(role, method, path, body);
      if (res.status !== 403) errors.push("permissions: a " + role + " was allowed to " + method + " " + path + " (" + res.status + ")");
    }
  }
  // the destructive one: nobody but the administrator, ever
  for (const role of ["teacher", "finance", "parent"]) {
    const res = await call(role, "POST", "/api/config/reset", {});
    if (res.status !== 403) errors.push("permissions: a " + role + " was allowed to reset the database");
  }
  // and the password-reset queue is not readable by anyone else
  if ((await call("teacher", "GET", "/api/help/requests")).status !== 403) errors.push("permissions: the reset queue is not administrator-only");

  // 2. the staff who may write records are the ones who need them
  if ((await call("teacher", "POST", "/api/attendance", {})).status === 403) errors.push("permissions: a teacher must be able to mark attendance");
  if ((await call("finance", "POST", "/api/payments", {})).status === 403) errors.push("permissions: the bursar must be able to record a payment");
  if ((await call("finance", "POST", "/api/attendance", {})).status !== 403) errors.push("permissions: the bursar should not mark attendance");

  // 3. an authorised request with an empty body is refused by validation, not by permission
  for (const [path, label] of [["/api/students", "a learner"], ["/api/payments", "a payment"],
                               ["/api/communications", "a message"], ["/api/attendance", "a register"], ["/api/staff", "a staff record"]]) {
    const res = await call("admin", "POST", path, {});
    if (res.status !== 400) errors.push("validation: " + label + " can be created from an empty form (" + res.status + ")");
  }

  // 4. the office can work the enquiry list — and a test enquiry cleans itself up
  const made = await fetch(BASE + "/api/enquiries", {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ parentName: "Permission Probe", phone: "0700000001", email: "probe@example.test",
                           learnerName: "Probe", gradeOfInterest: "Grade 7 (JSS)", message: "automated audit probe", termsAccepted: true })
  }).then((r) => r.json());
  if (!made.ok) errors.push("enquiries: the form could not record a valid enquiry");
  const id = made.enquiry && made.enquiry.id;
  if (id) {
    const moved = await call("admin", "PUT", "/api/enquiries/" + id, { status: "Contacted" });
    if (moved.status !== 200) errors.push("enquiries: the office cannot move an enquiry along (" + moved.status + ")");
    const nonsense = await call("admin", "PUT", "/api/enquiries/" + id, { status: "Nonsense" });
    if (nonsense.status !== 400) errors.push("enquiries: an unknown status was accepted");
    if ((await call("teacher", "DELETE", "/api/enquiries/" + id)).status !== 403) errors.push("enquiries: a teacher was allowed to delete an enquiry");
    const removed = await call("admin", "DELETE", "/api/enquiries/" + id);
    if (removed.status !== 200) errors.push("enquiries: the office cannot remove an enquiry (" + removed.status + ")");
  }

  // 5. nothing above may have moved the school's real settings
  const live = await fetch(BASE + "/api/bootstrap").then((r) => r.json());
  if (live.systemConfig.branding.schoolName !== "FAITH LEARNING CENTRE") errors.push("permissions: a probe changed the school name");
  if (String(live.systemConfig.branding.homeDesign) !== "8") errors.push("permissions: a probe changed the published home design");

  console.log("\u2713 Permissions: configuration and the reset queue are administrator-only, every office role keeps the writes it needs, empty forms are refused, enquiries can be worked and removed");
}

/* ---- the learner profile route exists and renders -------------------------- */
async function testLearnerProfile() {
  const app = fs.readFileSync(path.join(ROOT, "public", "app.js"), "utf8");
  if (!/profile:\s*pageProfile/.test(app)) errors.push("portal: the Learner Profile page is not registered, so the menu item paints the dashboard instead");
  if (!/function pageProfile\(/.test(app)) errors.push("portal: pageProfile is missing");
  if (!/push\("profile"/.test(app)) errors.push("portal: the parent menu no longer offers the learner profile");

  const login = await fetch(BASE + "/api/auth/login", {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "parent@faithlearningcentre.ac.ke", password: "Parent@2026" })
  }).then((r) => r.json());

  const vc = new VirtualConsole();
  const consoleErrors = [];
  vc.on("jsdomError", () => {});
  vc.on("error", (...a) => consoleErrors.push(a.map(String).join(" ")));
  const dom = new JSDOM(fs.readFileSync(path.join(ROOT, "public", "app.html"), "utf8"), {
    url: BASE + "/app", runScripts: "outside-only", pretendToBeVisual: true, virtualConsole: vc
  });
  const w = dom.window;
  w.fetch = (u, o) => fetch(new URL(u, BASE).toString(), o);
  w.scrollTo = () => {}; w.print = () => {}; w.confirm = () => true;
  const store = () => { const m = {}; return { getItem: (k) => (k in m ? m[k] : null), setItem: (k, v) => { m[k] = String(v); }, removeItem: (k) => { delete m[k]; } }; };
  Object.defineProperty(w, "localStorage", { value: store(), configurable: true });
  Object.defineProperty(w, "sessionStorage", { value: store(), configurable: true });
  w.sessionStorage.setItem("flc_portal_token", login.token);
  for (const f of ["brand.js", "themes.js", "app.js", "terms.js", "parent-portal.js"]) {
    try { w.eval(fs.readFileSync(path.join(ROOT, "public", f), "utf8")); } catch (e) {}
  }
  await wait(1800);
  if (!w.State) { errors.push("portal: the parent portal did not boot"); console.log("\u2713 Learner profile: source checked"); return; }

  w.State.user = login.user;
  w.State.role = "parent";
  w.State.db = await fetch(BASE + "/api/bootstrap", { headers: { "X-FLC-Token": login.token } }).then((r) => r.json());
  w.FLC.go("profile");
  await wait(500);
  const html = w.document.getElementById("page").innerHTML;
  if (html.includes("could not be drawn")) errors.push("portal: the learner profile crashed while drawing");
  for (const section of ["Learner Bio-Data", "Guardian", "NEMIS"]) {
    if (!html.includes(section)) errors.push("portal: the learner profile is missing the " + section + " section");
  }
  const before = html;
  if (w.FLC.setParentStudent) {
    w.FLC.setParentStudent("stu_03");
    await wait(400);
    if (w.document.getElementById("page").innerHTML === before) errors.push("portal: switching learner does not change the profile");
  }
  const dash = (() => { w.FLC.go("dashboard"); return w.document.getElementById("page").innerHTML.length; })();
  if (Math.abs(dash - before.length) < 50) errors.push("portal: the learner profile still paints the dashboard");
  if (consoleErrors.length) errors.push("portal: the learner profile logged " + consoleErrors[0].slice(0, 80));

  console.log("\u2713 Learner profile: registered as its own route, renders bio-data, guardian details and switches learner");
}

/* ---- accessibility and the mobile header ----------------------------------- */
async function testAccessibility() {
  // every public page starts with a skip link
  for (const page of ["index.html", "designs.html", "colours.html"]) {
    const html = fs.readFileSync(path.join(ROOT, "public", page), "utf8");
    if (!/class="skip-link"/.test(html)) errors.push("a11y: " + page + " has no skip link");
    const first = (html.split("<body")[1] || "").replace(/^[^>]*>/, "").trimStart();
    if (!first.startsWith("<a class=\"skip-link\"")) errors.push("a11y: " + page + " does not put the skip link first");
  }
  // every enquiry field carries a label bound to it
  for (const file of ["homes.js", "home.js", "landing.js"]) {
    const js = fs.readFileSync(path.join(ROOT, "public", file), "utf8");
    const labels = [...js.matchAll(/<label>([^<]{1,60})<\/label>/g)].map((m) => m[1]);
    if (labels.length) errors.push("a11y: " + file + " still has " + labels.length + " unbound label(s), e.g. " + labels[0]);
  }
  // the phone rules hide the words, never the buttons
  const css = fs.readFileSync(path.join(ROOT, "public", "mode.css"), "utf8");
  const block = (css.match(/@media \(max-width: 720px\) \{([\s\S]*?)\n\}/) || [])[1] || "";
  for (const rule of block.matchAll(/([^{}]+)\{([^}]*)\}/g)) {
    if (!/display:\s*none/.test(rule[2])) continue;
    const selectors = rule[1].split(",").map((x) => x.trim()).filter(Boolean);
    for (const sel of selectors) {
      if (/\.flc-ctl-logout\s*$/.test(sel) || /\.flc-ctl-text\s*$/.test(sel)) {
        errors.push("a11y: on a phone, " + sel + " hides the whole Log out button instead of just its label");
      }
    }
  }
  const controls = fs.readFileSync(path.join(ROOT, "public", "controls.js"), "utf8");
  if (/class="flc-ctl flc-ctl-text flc-ctl-logout"/.test(controls)) errors.push("a11y: the Log out button still carries the hide-on-phones class");
  if (!/aria-label="Log out"/.test(controls)) errors.push("a11y: the Log out button has no accessible name for icon-only mode");

  // no remote asset may sneak back in
  for (const file of fs.readdirSync(path.join(ROOT, "public"))) {
    if (!/\.(html|js|css)$/.test(file)) continue;
    const text = fs.readFileSync(path.join(ROOT, "public", file), "utf8");
    if (/<(script|link|img)[^>]+(src|href)="https?:\/\//i.test(text)) errors.push("privacy: " + file + " loads an asset from another domain");
  }

  console.log("\u2713 Accessibility: skip links on every page, labelled forms, accessible icon-only controls, Log out survives a 390 px screen, no third-party assets");
}

(async () => {
  await testApi();
  await testLanding();
  await testSevenDesigns();   // all designs, 1-8
  await testChooserPage();
  await testPremiumPalette();
  await testColourOptions();
  await testBrandAndRows();
  await testPortalGate();
  await testAuth();
  await testHelpCentre();
  await testOperations();
  await testTokenCoverage();
  await testHeaderControls();
  await testDataBoundary();
  await testPermissionsAndValidation();
  await testLearnerProfile();
  await testAccessibility();
  if (errors.length) {
    console.log("\n❌ FAILURES (" + errors.length + "):");
    errors.forEach((e) => console.log(" - " + e));
    process.exit(1);
  }
  console.log("\n✅ Front page, eight designs, chooser, colour options, corporate palette, Terms & Conditions enforcement and routing all passed.");
  process.exit(0);
})().catch((e) => { console.error("test crashed:", e); process.exit(1); });
