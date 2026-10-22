/* ============================================================================
   FAITH LEARNING CENTRE — colour combinations
   One shared list drives: the live preview (?theme=<id>), the preview bar, the
   /colours options page and the backend branding picker.

   Each option carries the full public-site token set, so previewing a colour
   repaints the whole system — sidebar, top bars, hero, call-out band, footer —
   on both the portals and the public website, without saving anything until the
   school presses "Apply".
   ========================================================================= */
(function () {
  "use strict";

  const AMBER = { gold500: "#c9902f", gold600: "#a9741f", gold300: "#e3c078", gold100: "#f7efdd" };

  const THEMES = [
    {
      id: "onyx", name: "Onyx & Crimson", tone: "Live across the system now",
      blurb: "Near-black onyx surfaces with a crimson accent over white and light grey — the strongest, most formal of the set.",
      sidebar: "onyx",
      tokens: { navy950: "#060608", navy900: "#141316", navy800: "#3a1119", navy700: "#591524", navy600: "#7c2536", gold500: "#e4002b", gold600: "#b00021", gold300: "#f4667c", gold100: "#fdecef" }
    },
    {
      id: "navy", name: "Corporate Navy & Amber", tone: "Classic · institutional",
      blurb: "Deep navy surfaces with amber gold rules and buttons — the complementary pair, crisp white paper.",
      sidebar: "navy",
      tokens: { navy950: "#040f1e", navy900: "#081e38", navy800: "#0b2947", navy700: "#0f3355", navy600: "#123a63", ...AMBER }
    },
    {
      id: "graphite", name: "Graphite & Amber", tone: "Modern · understated",
      blurb: "Near-black graphite chrome with the same amber accent — the most restrained of the set.",
      sidebar: "graphite",
      tokens: { navy950: "#0d1117", navy900: "#141a22", navy800: "#1c242e", navy700: "#26303c", navy600: "#333f4e", ...AMBER }
    },
    {
      id: "teal", name: "Teal & Sand", tone: "Fresh · distinctive",
      blurb: "Deep teal surfaces with a sand-gold accent — cooler than navy, still institutional.",
      sidebar: "teal",
      tokens: { navy950: "#03181c", navy900: "#072a30", navy800: "#0b3b42", navy700: "#0f4d56", navy600: "#14626d",
                gold500: "#d0a24a", gold600: "#b3862f", gold300: "#e6c98a", gold100: "#f6efdd" }
    },
    {
      id: "green", name: "Green & Old Gold", tone: "Traditional · collegiate",
      blurb: "Deep institutional green with old gold — the classic crest combination for schools.",
      sidebar: "green",
      tokens: { navy950: "#072b16", navy900: "#0d3a1f", navy800: "#11492a", navy700: "#165c36", navy600: "#1c7043", ...AMBER }
    },
    {
      id: "burgundy", name: "Burgundy & Gold", tone: "Formal · prestigious",
      blurb: "Oxblood burgundy surfaces with gold — warm, formal and unmistakably academic.",
      sidebar: "burgundy",
      tokens: { navy950: "#240a11", navy900: "#35101a", navy800: "#461624", navy700: "#581d2e", navy600: "#6d2539", ...AMBER }
    },
    {
      id: "royal", name: "Royal Blue & Silver", tone: "Bright · corporate",
      blurb: "Livelier royal blue with a silver-slate accent — a brighter, more commercial read.",
      sidebar: "navy",
      tokens: { navy950: "#05173a", navy900: "#0a2f6b", navy800: "#11408a", navy700: "#1a52a8", navy600: "#2565c4",
                gold500: "#7f9dc4", gold600: "#5f7fa8", gold300: "#c3d3e6", gold100: "#eef2f8" }
    },
    {
      id: "light", name: "Clean Light", tone: "Lightest · clinical",
      blurb: "White chrome throughout with navy type and amber action — the lightest option available.",
      sidebar: "light",
      tokens: { navy950: "#081e38", navy900: "#081e38", navy800: "#0b2947", navy700: "#0f3355", navy600: "#123a63", ...AMBER }
    }
  ];

  const byId = (id) => THEMES.find((t) => t.id === String(id)) || null;

  /* Tokens are applied to :root, so the public website and every design repaint. */
  function applyTokens(theme) {
    const root = document.documentElement.style;
    const t = theme.tokens;
    root.setProperty("--navy-950", t.navy950);
    root.setProperty("--navy-900", t.navy900);
    root.setProperty("--navy-800", t.navy800);
    root.setProperty("--navy-700", t.navy700);
    root.setProperty("--navy-600", t.navy600);
    root.setProperty("--gold-500", t.gold500);
    root.setProperty("--gold-600", t.gold600);
    root.setProperty("--gold-300", t.gold300);
    root.setProperty("--gold-100", t.gold100);
    root.setProperty("--primary", t.navy900);
    root.setProperty("--accent", t.gold500);
    document.documentElement.setAttribute("data-theme-preview", theme.id);
  }


  /* ---- colour maths: derive a full token ramp from the saved branding pair ---- */
  function hexToRgb(hex) {
    const n = parseInt(String(hex || "").replace("#", ""), 16);
    return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
  }
  function toHex(r, g, b) {
    return "#" + ((Math.round(r) << 16) | (Math.round(g) << 8) | Math.round(b)).toString(16).padStart(6, "0");
  }
  function mix(hex, target, pct) {
    const c = hexToRgb(hex);
    return toHex(c.r + (target - c.r) * pct, c.g + (target - c.g) * pct, c.b + (target - c.b) * pct);
  }
  const lighten = (hex, pct) => mix(hex, 255, pct);
  const darken = (hex, pct) => mix(hex, 0, pct);

  /* Makes the public website and every design follow the colours saved on the
     server, so applying a combination repaints the whole system — not just the
     portals. Derives the ramp from the two colours, so hand-picked colours in
     the branding tab work too. */
  function applyBrandingColours(primary, accent) {
    if (!primary || !accent) return false;
    const norm = (v) => String(v || "").trim().toLowerCase();
    // when the saved pair is one of the shipped combinations, use its exact hand-tuned tokens
    const exact = THEMES.find((t) => norm(t.tokens.navy900) === norm(primary) && norm(t.tokens.gold500) === norm(accent));
    if (exact) {
      applyTokens(exact);
      document.documentElement.setAttribute("data-branding-colours", "on");
      return true;
    }
    const root = document.documentElement.style;
    root.setProperty("--navy-900", primary);
    root.setProperty("--navy-950", darken(primary, 0.55));
    root.setProperty("--navy-800", lighten(primary, 0.14));
    root.setProperty("--navy-700", lighten(primary, 0.28));
    root.setProperty("--navy-600", lighten(primary, 0.44));
    root.setProperty("--gold-500", accent);
    root.setProperty("--gold-600", darken(accent, 0.16));
    root.setProperty("--gold-300", lighten(accent, 0.42));
    root.setProperty("--gold-100", lighten(accent, 0.88));
    root.setProperty("--primary", primary);
    root.setProperty("--accent", accent);
    document.documentElement.setAttribute("data-branding-colours", "on");
    return true;
  }

  function queryTheme() {
    try { return byId(new URLSearchParams(location.search).get("theme")); } catch (e) { return null; }
  }

  /* Injected once — keeps the bar self-contained, no stylesheet needed. */
  function ensureStyles() {
    if (document.getElementById("flc-theme-preview-style")) return;
    const s = document.createElement("style");
    s.id = "flc-theme-preview-style";
    s.textContent = `
.theme-preview-bar {
  position: fixed; inset: auto 0 0 0; z-index: 200; display: flex; align-items: center; gap: 0.9rem;
  flex-wrap: wrap; justify-content: space-between; padding: 0.65rem 1.1rem;
  background: linear-gradient(180deg, var(--navy-800, #0b2947), var(--navy-950, #040f1e));
  color: #fff; border-top: 3px solid var(--gold-500, #c9902f);
  font-family: "Rubik", "Segoe UI", system-ui, -apple-system, Roboto, Arial, sans-serif;
  font-size: 0.86rem; box-shadow: 0 -12px 30px rgba(4, 15, 30, 0.35);
}
.theme-preview-bar strong { font-family: "Rubik", "Segoe UI", system-ui, sans-serif; letter-spacing: 0.02em; }
.theme-preview-bar .tpb-note { color: rgba(255, 255, 255, 0.72); font-size: 0.79rem; }
.theme-preview-bar .tpb-actions { display: flex; gap: 0.5rem; flex-wrap: wrap; }
.theme-preview-bar a, .theme-preview-bar button {
  font: inherit; font-size: 0.82rem; font-weight: 700; cursor: pointer; text-decoration: none;
  padding: 0.42rem 0.8rem; border-radius: 7px; border: 1px solid transparent;
}
.theme-preview-bar .tpb-apply { background: var(--gold-500, #c9902f); color: #fff; border-color: var(--gold-500, #c9902f); }
.theme-preview-bar .tpb-apply:hover { background: var(--gold-600, #a9741f); }
.theme-preview-bar .tpb-ghost { background: transparent; color: #fff; border-color: rgba(255, 255, 255, 0.5); }
.theme-preview-bar .tpb-ghost:hover { background: rgba(255, 255, 255, 0.14); }
body { padding-bottom: 4.4rem; }
@media (max-width: 700px) { .theme-preview-bar { font-size: 0.8rem; } body { padding-bottom: 6.5rem; } }
`;
    document.head.appendChild(s);
  }

  function renderBar(theme) {
    ensureStyles();
    let bar = document.getElementById("theme-preview-bar");
    if (!bar) {
      bar = document.createElement("div");
      bar.id = "theme-preview-bar";
      bar.className = "theme-preview-bar";
      document.body.appendChild(bar);
    }
    bar.innerHTML = `
      <div>
        <strong>Previewing: ${theme.name}</strong>
        <div class="tpb-note">${theme.tone} — not saved yet. The live website still shows the current colour.</div>
      </div>
      <div class="tpb-actions">
        <button type="button" class="tpb-apply" onclick="FLCThemes.apply('${theme.id}')">Apply this colour to the whole system</button>
        <a class="tpb-ghost" href="/colours">See all options</a>
        <button type="button" class="tpb-ghost" onclick="FLCThemes.exit()">Exit preview</button>
      </div>`;
  }

  function exit() {
    const url = new URL(location.href);
    url.searchParams.delete("theme");
    location.href = url.toString();
  }

  /* Applies the combination to the whole system: portals, website and all designs. */
  async function apply(id) {
    const theme = byId(id);
    if (!theme) return;
    try {
      const token = (() => {
        try { return sessionStorage.getItem("flc_portal_token") || localStorage.getItem("flc_portal_token"); } catch (e) { return null; }
      })();
      const res = await fetch("/api/config/branding", {
        method: "PUT",
        headers: token
          ? { "Content-Type": "application/json", "X-FLC-Token": token }
          : { "Content-Type": "application/json" },
        body: JSON.stringify({
          primaryColor: theme.tokens.navy900,
          accentColor: theme.tokens.gold500,
          sidebarTheme: theme.sidebar,
          _actor: "Colour options"
        })
      });
      if (res.status === 401) {
        throw new Error("Sign in as the administrator first — the colour applies to the live system and the server only accepts it from a signed-in account.");
      }
      if (!res.ok) throw new Error("The server rejected the change (" + res.status + ")");
      if (typeof toast === "function") toast(`${theme.name} is now the school's colour combination.`, "success");
      setTimeout(() => exit(), 700);
    } catch (e) {
      if (typeof toast === "function") toast(e.message, "error");
      else alert("Could not apply the colour: " + e.message);
    }
  }

  window.FLCThemes = { THEMES, byId, apply, exit, applyTokens, applyBrandingColours, renderBar, queryTheme, preview: queryTheme };

  /* Public pages call this from their bootstrap; portals call it after applyTheme(). */
  function initPreview() {
    const theme = queryTheme();
    if (!theme || window.__flcThemePreviewed) return false;
    window.__flcThemePreviewed = true;
    applyTokens(theme);
    if (document.body) renderBar(theme);
    else document.addEventListener("DOMContentLoaded", () => renderBar(theme));
    return true;
  }
  window.__flcInitThemePreview = initPreview;

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", initPreview);
  else initPreview();
})();
