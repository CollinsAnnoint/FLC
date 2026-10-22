/* ============================================================================
   FAITH LEARNING CENTRE — the administrator's website editing bar
   Signs in as the administrator and a bar appears at the foot of the public
   website: change the layout (any of the eight designs), the photographs, the
   words and the fonts, then publish. Everything is written to the school's
   server, so visitors see the change straight away.
   ========================================================================= */
(function () {
  "use strict";

  const TOKEN_KEY = "flc_portal_token";
  const HIDE_KEY = "flc_edit_bar_hidden";

  const PHOTOS = [
    ["/assets/hero-1.jpg", "Campus approach"],
    ["/assets/hero-2.jpg", "ICT hub"],
    ["/assets/hero-3.jpg", "Learners on campus"],
    ["/assets/classroom.jpg", "Classroom"],
    ["/assets/library.jpg", "Library"],
    ["/assets/sports.jpg", "Games field"],
    ["/assets/assembly.jpg", "Assembly"],
    ["/assets/community.jpg", "Community day"]
  ];

  const DESIGNS = [
    ["1", "Classic Heritage — dimmed slider"],
    ["2", "Split Panel — corporate panel"],
    ["3", "Editorial Broadsheet"],
    ["4", "Minimal Corporate"],
    ["5", "Bento Mosaic"],
    ["6", "Academic Register"],
    ["7", "Modern Grid"],
    ["8", "Collegiate Showcase — band and essays"]
  ];

  const SCALES = [["compact", "Compact"], ["normal", "Normal"], ["large", "Large"]];

  const FONTS = [
    ["rubik", "Rubik — the school's face"],
    ["rubik-tight", "Rubik, tighter headlines"],
    ["rubik-wide", "Rubik, wider spacing"],
    ["rubik-system", "Rubik with system fallback"]
  ];

  function token() {
    try { return sessionStorage.getItem(TOKEN_KEY) || localStorage.getItem(TOKEN_KEY); } catch (e) { return null; }
  }

  function api(path, method, body) {
    const opts = { method: method || "GET", headers: { "Content-Type": "application/json" } };
    const t = token();
    if (t) opts.headers["X-FLC-Token"] = t;
    if (body) opts.body = JSON.stringify(body);
    return fetch(path, opts).then(async (r) => {
      const data = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(data.error || "Request failed (" + r.status + ")");
      return data;
    });
  }

  function esc(v) {
    return String(v == null ? "" : v).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  }

  function boot() {
    const t = token();
    if (!t) return;
    let hidden = false;
    try { hidden = sessionStorage.getItem(HIDE_KEY) === "1"; } catch (e) {}

    api("/api/auth/session?token=" + encodeURIComponent(t))
      .then((session) => {
        if (!session.ok || !session.user || session.user.role !== "admin") return;
        const data = api("/api/bootstrap").then((db) => ({ session, db }));
        return data;
      })
      .then((ctx) => {
        if (!ctx) return;
        render(ctx.session.user, ctx.db, hidden);
      })
      .catch(() => {});
  }

  function render(user, db, hidden) {
    const sc = Object.assign(
      {
        heroKicker: "", heroTitle: "", heroSub: "", bandQuestion: "", bandSub: "",
        heroImages: []
      },
      (db.systemConfig && db.systemConfig.siteContent) || {}
    );
    const typo = (db.systemConfig && db.systemConfig.typography) || { preset: "baskerville", scale: "normal" };
    const design = String((db.systemConfig.branding && db.systemConfig.branding.homeDesign) || "8");

    const bar = document.createElement("div");
    bar.className = "edit-bar";
    bar.id = "flc-edit-bar";
    bar.innerHTML = `
      <div class="edit-bar-in">
        <strong>Website editor</strong>
        <span class="eb-note">signed in as ${esc(user.name)}</span>
        <div class="eb-group">
          <div class="eb-field"><label for="eb-design">Layout</label>
            <select id="eb-design">${DESIGNS.map(([id, label]) => `<option value="${id}" ${id === design ? "selected" : ""}>${esc(label)}</option>`).join("")}</select>
          </div>
          <div class="eb-field"><label for="eb-font">Fonts</label>
            <select id="eb-font">${FONTS.map(([id, label]) => `<option value="${id}" ${id === typo.preset ? "selected" : ""}>${esc(label)}</option>`).join("")}</select>
          </div>
          <div class="eb-field"><label for="eb-scale">Text size</label>
            <select id="eb-scale">${SCALES.map(([id, label]) => `<option value="${id}" ${id === typo.scale ? "selected" : ""}>${esc(label)}</option>`).join("")}</select>
          </div>
        </div>
        <div class="eb-group eb-words">
          <div class="eb-field"><label for="eb-title">Headline</label>
            <input id="eb-title" value="${esc(sc.heroTitle)}" placeholder="Leave blank to keep the current headline" />
          </div>
          <div class="eb-field"><label for="eb-q">Call-out line</label>
            <input id="eb-q" value="${esc(sc.bandQuestion)}" placeholder="The line above the buttons" />
          </div>
        </div>
        <div class="eb-group">
          <div class="eb-field"><label for="eb-photo">Hero photographs</label>
            <select id="eb-photo" multiple size="1" title="Pick up to four — hold Ctrl (or ⌘) to choose more">
              ${PHOTOS.map(([src, label]) => `<option value="${src}" ${(sc.heroImages || []).includes(src) ? "selected" : ""}>${esc(label)}</option>`).join("")}
            </select>
          </div>
        </div>
        <div class="eb-actions">
          <button class="eb-btn" id="eb-publish">Publish to the website</button>
          <a class="eb-btn ghost" href="/colours" style="text-decoration:none">Colours</a>
          <a class="eb-btn ghost" href="/app" style="text-decoration:none">Open the portal</a>
          <button class="eb-btn ghost" id="eb-hide">${hidden ? "Show" : "Hide"} bar</button>
          <span class="eb-note" id="eb-status"></span>
        </div>
      </div>`;

    if (!hidden) document.body.appendChild(bar);
    document.body.classList.toggle("has-edit-bar", !hidden);

    const status = (msg) => {
      const el = bar.querySelector("#eb-status");
      if (el) el.textContent = msg;
    };

    bar.querySelector("#eb-hide").addEventListener("click", () => {
      let isHidden = bar.parentNode !== null;
      try { sessionStorage.setItem(HIDE_KEY, isHidden ? "1" : "0"); } catch (e) {}
      if (isHidden) {
        bar.remove();
        document.body.classList.remove("has-edit-bar");
      } else {
        document.body.appendChild(bar);
        document.body.classList.add("has-edit-bar");
      }
      bar.querySelector("#eb-hide").textContent = (isHidden ? "Show" : "Hide") + " bar";
    });

    // fonts preview live, before publishing
    const liveType = () => {
      if (window.FLC && FLC.applyTypography) {
        FLC.applyTypography({ preset: bar.querySelector("#eb-font").value, scale: bar.querySelector("#eb-scale").value });
      }
    };
    bar.querySelector("#eb-font").addEventListener("change", liveType);
    bar.querySelector("#eb-scale").addEventListener("change", liveType);

    bar.querySelector("#eb-publish").addEventListener("click", async () => {
      status("Publishing…");
      const selected = [...bar.querySelector("#eb-photo").selectedOptions].map((o) => o.value).slice(0, 4);
      const siteContent = {
        heroTitle: bar.querySelector("#eb-title").value.trim(),
        bandQuestion: bar.querySelector("#eb-q").value.trim(),
        heroImages: selected
      };
      try {
        const design = bar.querySelector("#eb-design").value;
        await api("/api/config/site", "PUT", {
          siteContent,
          typography: { preset: bar.querySelector("#eb-font").value, scale: bar.querySelector("#eb-scale").value }
        });
        if (design !== String((db.systemConfig.branding && db.systemConfig.branding.homeDesign) || "8")) {
          await api("/api/config/home-design", "PUT", { design });
        }
        status("Published — reloading…");
        setTimeout(() => window.location.reload(), 500);
      } catch (e) {
        status(e.message);
      }
    });
  }

  window.FLCEditBar = { presetNames: ["rubik", "rubik-tight", "rubik-wide", "rubik-system"], boot: boot };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
