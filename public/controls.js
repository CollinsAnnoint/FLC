/* ============================================================================
   FAITH LEARNING CENTRE — public site header controls
   Three controls that every visitor sees in the website header:
     · the appearance theme  — light (the school's default look) or dark, remembered
       on the device and shareable with a ?mode=dark link. Nothing is written back
       to the server, so a visitor can never change the school's official colours.
     · refresh               — re-reads the school's data from the server and
       repaints the live page without losing the visitor's place.
     · log out               — appears only when a portal session exists on this
       device, and signs it out for real (server session revoked).

   The module mounts itself into whichever header the current design rendered, so
   all eight home page designs get the controls without changing their templates.
   ========================================================================= */
(function () {
  "use strict";

  const MODE_KEY = "flc_appearance";
  const TOKEN_KEY = "flc_portal_token";
  const GROUP_ID = "flc-controls";
  const root = document.documentElement;

  const ICONS = {
    sun: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="4.2"/><path d="M12 2.6v2.2M12 19.2v2.2M2.6 12h2.2M19.2 12h2.2M5.4 5.4l1.6 1.6M17 17l1.6 1.6M18.6 5.4L17 7M7 17l-1.6 1.6"/></svg>',
    moon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M20 14.4A8.6 8.6 0 0 1 9.6 4a8.6 8.6 0 1 0 10.4 10.4z"/></svg>',
    refresh: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M20.4 11.2A8.4 8.4 0 1 0 12 20.4a8.4 8.4 0 0 0 7.6-4.8"/><path d="M20.8 4.4v6h-6"/></svg>',
    logout: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M15 4.6h3.4a1.6 1.6 0 0 1 1.6 1.6v11.6a1.6 1.6 0 0 1-1.6 1.6H15"/><path d="M10.4 8.2 6.6 12l3.8 3.8M6.6 12h9"/></svg>'
  };

  function storage(store, key, value) {
    try {
      if (value === undefined) return store.getItem(key);
      if (value === null) store.removeItem(key);
      else store.setItem(key, value);
    } catch (e) { /* private mode */ }
    return null;
  }

  /* ------------------------------ appearance ------------------------------ */
  function queryMode() {
    const m = new URLSearchParams(location.search).get("mode");
    return m === "dark" || m === "light" ? m : null;
  }
  function prefersDark() {
    try { return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches; }
    catch (e) { return false; }
  }
  function mode() {
    return storage(localStorage, MODE_KEY) || queryMode() || (prefersDark() ? "dark" : "light");
  }
  function applyMode(next, remember) {
    const m = next === "dark" ? "dark" : "light";
    root.setAttribute("data-mode", m);
    if (remember) storage(localStorage, MODE_KEY, m);
    paintModeButtons();
    window.dispatchEvent(new CustomEvent("flc:appearance", { detail: { mode: m } }));
    return m;
  }
  function setMode(next) {
    const from = root.getAttribute("data-mode") || mode();
    const to = applyMode(next, true);
    if (from !== to) toast(to === "dark" ? "Dark theme on" : "Light theme on", "info");
  }
  function toggleMode() {
    setMode((root.getAttribute("data-mode") || mode()) === "dark" ? "light" : "dark");
  }
  applyMode(mode(), Boolean(queryMode()));      // applied at parse time: no flash

  /* -------------------------------- helpers ------------------------------- */
  function toast(message, kind) {
    let el = document.getElementById("flc-toast");
    if (!el) {
      el = document.createElement("div");
      el.id = "flc-toast";
      el.className = "flc-toast";
      el.setAttribute("role", "status");
      el.setAttribute("aria-live", "polite");
      document.body.appendChild(el);
    }
    el.textContent = message;
    el.className = "flc-toast" + (kind === "error" ? " error" : "");
    requestAnimationFrame(() => el.classList.add("show"));
    clearTimeout(el.__hide);
    el.__hide = setTimeout(() => el.classList.remove("show"), kind === "error" ? 5200 : 3200);
  }

  function token() {
    return storage(sessionStorage, TOKEN_KEY) || storage(localStorage, TOKEN_KEY);
  }
  function signedIn() {
    return Boolean(token());
  }
  function clearSession() {
    [sessionStorage, localStorage].forEach((store) => {
      [TOKEN_KEY, "flc_portal_role", "flc_portal_user"].forEach((k) => storage(store, k, null));
    });
  }

  async function api(path, options) {
    const res = await fetch(path, Object.assign({ headers: { "Content-Type": "application/json" } }, options));
    if (!res.ok) {
      let msg = "The server refused the request (" + res.status + ")";
      try { const body = await res.json(); if (body && body.error) msg = body.error; } catch (e) {}
      throw new Error(msg);
    }
    return res.json();
  }

  /* ------------------------------- the markup ----------------------------- */
  function html() {
    const dark = (root.getAttribute("data-mode") || mode()) === "dark";
    return `
      <span class="flc-controls" id="${GROUP_ID}" role="group" aria-label="Website controls">
        <button type="button" class="flc-ctl" id="flc-mode-btn" onclick="FLControls.toggleMode()"
                title="Switch between the light and dark theme" aria-label="Switch between the light and dark theme" aria-pressed="${dark}">
          <span class="flc-ic flc-ic-moon"${dark ? "" : " hidden"}>${ICONS.moon}</span>
          <span class="flc-ic flc-ic-sun"${dark ? " hidden" : ""}>${ICONS.sun}</span>
          <span class="flc-ctl-label">${dark ? "Light" : "Dark"}</span>
        </button>
        <button type="button" class="flc-ctl" id="flc-refresh-btn" onclick="FLControls.refresh()"
                title="Reload the page content from the school server" aria-label="Reload the page content from the school server">${ICONS.refresh}<span class="flc-ctl-label">Refresh</span></button>
        <button type="button" class="flc-ctl flc-ctl-logout" id="flc-logout-btn" onclick="FLControls.logout()"
                title="Sign out of the portal on this device" aria-label="Log out"${signedIn() ? "" : " hidden"}>${ICONS.logout}<span class="flc-ctl-label">Log out</span></button>
      </span>`;
  }

  function paintModeButtons() {
    const dark = (root.getAttribute("data-mode") || mode()) === "dark";
    const btn = document.getElementById("flc-mode-btn");
    if (btn) {
      btn.setAttribute("aria-pressed", String(dark));
      const moon = btn.querySelector(".flc-ic-moon");
      const sun = btn.querySelector(".flc-ic-sun");
      const label = btn.querySelector(".flc-ctl-label");
      if (moon) moon.hidden = !dark;
      if (sun) sun.hidden = dark;
      if (label) label.textContent = dark ? "Light" : "Dark";
    }
  }


  /* Keep in-page links landing below the fixed header, whatever the design. */
  function syncAnchorOffset() {
    const header = document.querySelector("header");
    if (!header) return;
    const h = Math.round(header.getBoundingClientRect().height || 0);
    if (h > 0) document.documentElement.style.setProperty("--flc-anchor-offset", (h + 14) + "px");
  }

  /* Mount into whichever header the current design rendered. */
  function container() {
    return document.querySelector("[data-flc-controls]")
      || document.querySelector(".d8-top-right")
      || document.querySelector(".site-header-actions")
      || document.querySelector(".hx-actions, .hs-actions")
      || (function () {
        const login = Array.prototype.slice.call(document.querySelectorAll('[onclick*="openLogin"]'))
          .find((el) => el.closest("header") || el.closest(".d8-top, .hx-nav, .site-header-actions"));
        return login ? login.parentElement : null;
      })();
  }
  function mount() {
    const box = container();
    if (!box || box.querySelector("#" + GROUP_ID)) return false;
    box.insertAdjacentHTML("beforeend", html());
    paintModeButtons();
    syncAnchorOffset();
    return true;
  }
  function watch() {
    mount();
    if (!window.MutationObserver) return;
    let queued = false;
    new MutationObserver(() => {
      if (queued) return;
      queued = true;
      setTimeout(() => { queued = false; mount(); paintModeButtons(); }, 120);
    }).observe(document.body, { childList: true, subtree: true });
  }

  /* -------------------------------- refresh ------------------------------- */
  function repaint(fresh) {
    if (fresh) {
      window.State = window.State || {};
      window.State.db = fresh;
      window.__flcDb = fresh;
    }
    if (window.Homes && typeof window.Homes.render === "function" && window.__flcRenderedHome) {
      window.Homes.render(window.Homes.current ? window.Homes.current() : undefined);
      return true;
    }
    if (window.Home && typeof window.Home.render === "function" && window.__flcRenderedHome) {
      window.Home.render();
      return true;
    }
    if (window.Landing && typeof window.Landing.renderSite === "function") {
      window.Landing.renderSite();
      return true;
    }
    return false;
  }

  async function refresh() {
    const btn = document.getElementById("flc-refresh-btn");
    if (btn) btn.classList.add("spinning");
    try {
      const fresh = await api("/api/bootstrap");
      repaint(fresh);
      toast("Page reloaded from the school server", "info");
    } catch (e) {
      toast("Could not refresh: " + e.message, "error");
    } finally {
      setTimeout(() => { if (btn) btn.classList.remove("spinning"); }, 600);
      mount();
      paintModeButtons();
    }
  }

  /* --------------------------------- logout ------------------------------- */
  async function logout() {
    const t = token();
    clearSession();
    const btn = document.getElementById("flc-logout-btn");
    if (btn) btn.hidden = true;
    try {
      if (t) {
        /* the server reads the session token from the body (see /api/auth/logout) */
        await fetch("/api/auth/logout", {
          method: "POST",
          headers: { "Content-Type": "application/json", "X-FLC-Token": t },
          body: JSON.stringify({ token: t })
        });
      }
    } catch (e) { /* the local session is already cleared */ }
    toast("Signed out of the portal on this device", "info");
    if (location.pathname.indexOf("/app") === 0) { location.href = "/"; return; }
    repaint(null);
    mount();
  }

  window.FLControls = {
    html, mount, mode, setMode, toggleMode, isDark: () => (root.getAttribute("data-mode") || mode()) === "dark",
    refresh, logout, toast, signedIn, ICONS
  };

  if (document.readyState === "loading") window.addEventListener("DOMContentLoaded", watch);
  else watch();

  /* Keep the whole page in step when a home page design is switched or re-rendered. */
  window.addEventListener("flc:appearance", paintModeButtons);
  window.addEventListener("resize", syncAnchorOffset, { passive: true });
  window.addEventListener("DOMContentLoaded", syncAnchorOffset);
  window.addEventListener("storage", (e) => { if (e.key === MODE_KEY) applyMode(e.newValue || "light", false); });
})();
