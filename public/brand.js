/* ============================================================================
   FAITH LEARNING CENTRE — the school's logo mark  (crest v2)
   Drawn here as vector art — an original work, no third-party artwork:
   a heraldic shield with a cross, a flame and an open book in the school's
   colours (onyx #141316, crimson #e4002b, cream #f5f5f2).
   Two tones: "dark" for white surfaces, "light" for the onyx surfaces.
   ========================================================================= */
(function () {
  "use strict";

  const ONYX = "var(--navy-900, #141316)";
  const CRIMSON = "var(--gold-500, #e4002b)";
  const CREAM = "#f5f5f2";

  const SHIELD = "M32 3 58.5 12.2v20.4c0 15.6-10.4 28.4-26.5 34.6C15.9 61 5.5 48.2 5.5 32.6V12.2Z";
  const SHIELD_INNER = "M32 7.6 54.6 15.2v17.2c0 13.1-8.7 23.9-22.6 29.4C18.1 56.3 9.4 45.5 9.4 32.4V15.2Z";
  const FLAME = "M32 24.4c3.1 4.1 4.5 6.9 4.5 9.3a4.5 4.5 0 0 1-9 0c0-2.4 1.4-5.2 4.5-9.3Z";

  function shieldBody(ink, plate) {
    return (
      `<path d="${SHIELD}" fill="${plate}"/>` +
      `<path d="${SHIELD_INNER}" fill="none" stroke="${CRIMSON}" stroke-width="1.6"/>` +
      `<rect x="30.4" y="12.2" width="3.2" height="11.6" fill="${ink}"/>` +
      `<rect x="26.5" y="16" width="11" height="3.2" fill="${ink}"/>` +
      `<path d="${FLAME}" fill="${CRIMSON}"/>` +
      `<path d="M32 44.2c-5.1-2.7-9.6-2.7-14.1-.7v12.9c4.5-2 9-2 14.1.7Z" fill="${ink}"/>` +
      `<path d="M32 44.2c5.1-2.7 9.6-2.7 14.1-.7v12.9c-4.5-2-9-2-14.1.7Z" fill="${ink}"/>` +
      `<path d="M32 44.2v12.9" stroke="${CRIMSON}" stroke-width="2.2" stroke-linecap="round"/>` +
      `<path d="M20.6 46.6c3.5-1.2 7.2-1 11.4 1.4M43.4 46.6c-3.5-1.2-7.2-1-11.4 1.4" fill="none" stroke="${CRIMSON}" stroke-width="1.1" opacity=".55"/>`
    );
  }

  function shield(tone) {
    const ink = tone === "light" ? ONYX : CREAM;
    const plate = tone === "light" ? CREAM : ONYX;
    return { inner: shieldBody(ink, plate), box: "0 0 64 72" };
  }

  /* Circular seal — for the backend's "Circular Badge" crest style */
  function circle(tone) {
    const ink = tone === "light" ? ONYX : CREAM;
    const plate = tone === "light" ? CREAM : ONYX;
    return {
      inner:
        `<circle cx="32" cy="36" r="33" fill="${plate}"/>` +
        `<circle cx="32" cy="36" r="29.4" fill="none" stroke="${CRIMSON}" stroke-width="2"/>` +
        `<rect x="29" y="15" width="6" height="7" fill="${ink}"/>` +
        `<rect x="28.4" y="15.6" width="7.2" height="6.4" fill="${ink}"/>` +
        `<path d="M32 25.6c3.4 4.5 5 7.5 5 10.2a5 5 0 0 1-10 0c0-2.7 1.6-5.7 5-10.2Z" fill="${CRIMSON}"/>` +
        `<path d="M32 46.4c-5.6-3-10.5-3-15.4-.8v13.2c4.9-2.2 9.8-2.2 15.4.8Z" fill="${ink}"/>` +
        `<path d="M32 46.4c5.6-3 10.5-3 15.4-.8v13.2c-4.9-2.2-9.8-2.2-15.4.8Z" fill="${ink}"/>` +
        `<path d="M32 46.4v13.2" stroke="${CRIMSON}" stroke-width="2.2" stroke-linecap="round"/>`,
      box: "0 0 64 72"
    };
  }

  /* Letter monogram — for the backend's "Letter Monogram" crest style */
  function monogram(tone) {
    const ink = tone === "light" ? ONYX : CREAM;
    const plate = tone === "light" ? CREAM : ONYX;
    return {
      inner:
        `<rect x="4" y="6" width="56" height="60" rx="14" fill="${plate}"/>` +
        `<rect x="8.6" y="10.6" width="46.8" height="50.8" rx="10" fill="none" stroke="${CRIMSON}" stroke-width="2"/>` +
        `<text x="32" y="41" text-anchor="middle" font-family="Baskerville, Georgia, 'Times New Roman', serif" font-size="21" letter-spacing="1.2" fill="${ink}">FLC</text>` +
        `<path d="M32 46.5c2.1 2.8 3.1 4.7 3.1 6.4a3.1 3.1 0 0 1-6.2 0c0-1.7 1-3.6 3.1-6.4Z" fill="${CRIMSON}"/>`,
      box: "0 0 64 72"
    };
  }

  const VARIANTS = { shield: shield, circle: circle, monogram: monogram };

  function mark(variant, size, tone) {
    const build = VARIANTS[variant] || VARIANTS.shield;
    const v = build(tone === "light" ? "light" : "dark");
    const px = size || 32;
    return (
      `<svg class="brand-mark" viewBox="${v.box}" width="${px}" height="${Math.round(px * 72 / 64)}" ` +
      `role="img" aria-label="Faith Learning Centre crest" xmlns="http://www.w3.org/2000/svg" focusable="false">${v.inner}</svg>`
    );
  }

  /* Crest and school name together, for headers and the sign-in card */
  function lockup(name, motto, size, tone) {
    return (
      mark("shield", size || 44, tone) +
      `<span class="brand-lockup-text"><strong>${name || "FAITH LEARNING CENTRE"}</strong>` +
      (motto ? `<em>${motto}</em>` : "") +
      `</span>`
    );
  }

  /* Standing file for the browser tab and anything that needs a real file */
  const stand = mark("shield", 64, "dark");
  window.FLCBrand = {
    mark: mark,
    lockup: lockup,
    variants: Object.keys(VARIANTS),
    file: "/assets/logo.svg",
    inline: stand
  };

  /* Any element marked data-brand-mark draws the crest once the page is ready.
     data-brand-tone="light" draws the cream-on-onyx version for dark surfaces. */
  function paint() {
    document.querySelectorAll("[data-brand-mark]").forEach((el) => {
      const variant = el.getAttribute("data-brand-mark") || "shield";
      const tone = el.getAttribute("data-brand-tone") || "dark";
      const size = Number(el.getAttribute("data-brand-size") || 32);
      const name = el.getAttribute("data-brand-name");
      el.innerHTML = name ? lockup(name, el.getAttribute("data-brand-motto"), size, tone) : mark(variant, size, tone);
    });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", paint);
  else paint();
})();
