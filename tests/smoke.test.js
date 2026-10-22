/**
 * Smoke test for FAITH LEARNING CENTRE ERP
 * Loads the real frontend (index.html + app.js) inside jsdom against the running
 * backend, then exercises every route for every role and reports any JS errors.
 *
 * Usage: node tests/smoke.test.js   (requires the server running on PORT 3000)
 */
const { JSDOM, VirtualConsole } = require("jsdom");
const fs = require("fs");
const path = require("path");

const BASE = process.env.BASE_URL || "http://localhost:3000";
const PUBLIC = path.join(__dirname, "..", "public");

const errors = [];

async function main() {
  const html = fs.readFileSync(path.join(PUBLIC, "app.html"), "utf8");
  const virtualConsole = new VirtualConsole();
  virtualConsole.on("jsdomError", (e) => errors.push("jsdomError: " + e.message));
  virtualConsole.on("error", (m) => errors.push("console.error: " + m));

  const dom = new JSDOM(html, {
    url: BASE + "/",
    runScripts: "outside-only",
    pretendToBeVisual: true,
    virtualConsole
  });
  const { window } = dom;

  // Give jsdom a working relative-URL fetch backed by Node's fetch
  window.fetch = (url, opts) => fetch(new URL(url, BASE).toString(), opts);
  window.confirm = () => true;
  window.alert = () => {};
  window.print = () => {};
  window.scrollTo = () => {};
  window.URL.createObjectURL = () => "blob:test";

  // The portals now open on a sign-in screen — authenticate as the administrator first
  const login = await fetch(BASE + "/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "leadex44@gmail.com", password: "12345678" })
  }).then((r) => r.json());
  if (!login.ok) {
    console.log("Could not sign in for the smoke test:", login.error || login);
    process.exit(1);
  }
  window.sessionStorage.setItem("flc_portal_token", login.token);

  // Execute the application script
  for (const file of ["brand.js", "app.js", "terms.js", "parent-portal.js"]) {
    try {
      window.eval(fs.readFileSync(path.join(PUBLIC, file), "utf8"));
    } catch (e) {
      errors.push(`Failed to evaluate ${file}: ` + e.message);
    }
  }

  // Wait for DOMContentLoaded bootstrap (fetch is async)
  await new Promise((r) => setTimeout(r, 800));
  await new Promise((r) => setTimeout(r, 600));

  const app = window.document.getElementById("app");
  if (!app.innerHTML.includes("sidebar")) errors.push("Sidebar not rendered after bootstrap");
  if (!app.innerHTML.includes("FAITH LEARNING CENTRE")) errors.push("School name missing from rendered shell");

  const routes = ["dashboard", "students", "attendance", "academics", "reportcards", "timetable",
    "finance", "staff", "transport", "boarding", "library", "discipline", "communications",
    "reports", "profile", "help", "customizer"];
  const roles = ["admin", "teacher", "finance", "parent"];

  for (const role of roles) {
    window.FLC.setRole(role);
    for (const route of routes) {
      try {
        window.FLC.go(route);
        const el = window.document.getElementById("page");
        if (!el || el.innerHTML.length < 120) {
          errors.push(`[${role}/${route}] page rendered empty (${el ? el.innerHTML.length : 0} chars)`);
        }
      } catch (e) {
        errors.push(`[${role}/${route}] render threw: ${e.message}`);
      }
    }
  }

  // Exercise the Backend Customization Zone tabs as admin
  window.FLC.setRole("admin");
  for (const tab of ["branding", "modules", "academic", "grading", "customfields", "finance", "permissions", "legal", "security", "data"]) {
    try {
      window.FLC.sub("customizer", tab);
      const body = window.document.getElementById("customizer-body");
      if (!body || body.innerHTML.length < 200) errors.push(`[customizer/${tab}] rendered empty`);
    } catch (e) {
      errors.push(`[customizer/${tab}] threw: ${e.message}`);
    }
  }

  // Exercise modals
  try {
    const db = window.State.db;
    window.FLC.openPaymentModal(db.students[0].id);
    if (!window.document.getElementById("pay-amount")) errors.push("Payment modal did not render");
    window.FLC.closeModal();
    window.FLC.openReportCard(db.students[0].id);
    if (!window.document.querySelector(".official-doc")) errors.push("Report card modal did not render");
    window.FLC.closeModal();
    window.FLC.openStudentModal(db.students[0].id);
    if (!window.document.getElementById("st-firstName")) errors.push("Student modal did not render");
    window.FLC.closeModal();
    window.FLC.printAllReportCards();
    window.FLC.closeModal();
    window.FLC.openStaffModal();
    window.FLC.closeModal();
    window.FLC.editTimetableModal();
    window.FLC.closeModal();
  } catch (e) {
    errors.push("Modal exercise threw: " + e.message);
  }

  // Verify CBC grading engine maths
  try {
    const s = window.recordScore({ sba: 80, exam: 60 }); // 40/60 weighting => 68
    if (s !== 68) errors.push(`Grading engine wrong: expected 68, got ${s}`);
    const g = window.gradeFor(68);
    if (!g.cbc || g.cbc.code !== "ME") errors.push(`CBC rubric wrong for 68%: ${JSON.stringify(g.cbc)}`);
  } catch (e) {
    errors.push("Grading engine threw: " + e.message);
  }

  console.log("Routes exercised:", routes.length * roles.length + 10, "routes, roles and customizer tabs");
  if (errors.length) {
    console.log("\n❌ FAILURES (" + errors.length + "):");
    errors.forEach((e) => console.log(" - " + e));
    process.exit(1);
  }
  console.log("\n✅ All smoke tests passed — every portal, module and customizer tab renders cleanly.");
  process.exit(0);
}

main().catch((e) => {
  console.error("Smoke test crashed:", e);
  process.exit(1);
});
