#!/usr/bin/env python3
"""Styling, installability and the version endpoint for the finish pass."""
import os
import re

os.chdir("/home/user")

# ---------------------------------------------------- server: /version.js
p = "server.js"
s = open(p, encoding="utf-8").read()
if "/version.js" not in s:
    old = '''// Liveness probe for the school's hosting and monitoring (no secrets in it).'''
    new = '''// The running version, from package.json — one source of truth, read by the pages.
app.get("/version.js", (req, res) => {
  res.type("application/javascript").send(
    `window.FLC_META = { version: ${JSON.stringify(APP_VERSION)}, built: ${JSON.stringify(STARTED_AT.toISOString())}, service: "faith-learning-centre-erp" };`
  );
});

// Liveness probe for the school's hosting and monitoring (no secrets in it).'''
    assert old in s
    s = s.replace(old, new, 1)
    open(p, "w", encoding="utf-8").write(s)
    print("server.js: /version.js route")

# -------------------------------------------------------------- package.json
p = "package.json"
s = open(p, encoding="utf-8").read()
s = s.replace('"version": "1.0.0"', '"version": "1.1.0"')
s = s.replace('''  "scripts": {
    "start": "node server.js",
    "dev": "node server.js",
    "test": "node tests/smoke.test.js"
  },''',
'''  "scripts": {
    "start": "node server.js",
    "dev": "node server.js",
    "test": "node tests/smoke.test.js && node tests/public.test.js",
    "test:smoke": "node tests/smoke.test.js",
    "test:public": "node tests/public.test.js",
    "licences": "python3 tools/audit_image_licences.py"
  },''')
s = s.replace('''  "license": "MIT",''',
'''  "license": "MIT",
  "private": true,
  "engines": {
    "node": ">=20"
  },
  "type": "commonjs",''')
open(p, "w", encoding="utf-8").write(s)
print("package.json: v1.1.0, scripts, engines")

# ------------------------------------------------------------------- styles
p = "public/styles.css"
s = open(p, encoding="utf-8").read()
if ".palette{" not in s.replace("\n", "").replace("  ", ""):
    s += '''
/* ============================================================================
   FINISH PASS — readiness, command palette, devices, mobile navigation
   ========================================================================= */
.skip-link { position: absolute; left: -9999px; top: 0; z-index: 2000; background: var(--sidebar-bg); color: #fff;
  padding: 0.6rem 1rem; border-radius: 0 0 8px 0; font-size: 0.85rem; }
.skip-link:focus { left: 0; }

:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; border-radius: 6px; }
.btn:focus-visible, .nav-btn:focus-visible, .subtab-btn:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }

.sidebar-version { margin-top: 0.35rem; font-size: 0.7rem; opacity: 0.7; letter-spacing: 0.04em; }
.error-trace { margin: 0.6rem 0 0; padding: 0.7rem 0.8rem; background: #ffffff; border: 1px solid var(--line);
  border-left: 3px solid var(--danger); border-radius: 8px; font-family: var(--mono); font-size: 0.78rem;
  color: var(--text-muted); overflow-x: auto; white-space: pre-wrap; }

/* --- go-live readiness --- */
.golive { border: 1px solid var(--line); border-top: 3px solid var(--accent); }
.golive-list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 0.55rem; }
.golive-list li { display: grid; grid-template-columns: 26px 1fr auto; gap: 0.7rem; align-items: start;
  padding: 0.65rem 0.7rem; border: 1px solid var(--line); border-radius: 10px; background: #ffffff; }
.golive-tick { width: 22px; height: 22px; border-radius: 50%; display: grid; place-items: center; font-size: 0.75rem;
  font-weight: 800; background: #e4f0e9; color: var(--success); }
.golive-list li.todo .golive-tick { background: var(--accent-light); color: var(--accent); }
.golive-body strong { font-size: 0.88rem; }
.golive-body p { margin: 0.2rem 0 0; font-size: 0.8rem; line-height: 1.55; color: var(--text-muted); }
.golive-list li.done .golive-body strong { color: var(--success); }

/* --- devices --- */
.device-list { display: flex; flex-direction: column; }
.device-row { display: flex; justify-content: space-between; align-items: center; gap: 0.8rem;
  padding: 0.6rem 0; border-top: 1px solid var(--line); flex-wrap: wrap; }
.device-row:first-child { border-top: none; }

/* --- command palette --- */
.palette-backdrop { position: fixed; inset: 0; z-index: 1200; background: rgba(6, 6, 8, 0.55);
  display: flex; align-items: flex-start; justify-content: center; padding: 8vh 1rem 1rem; }
.palette { width: min(680px, 100%); background: #ffffff; border-radius: 14px; overflow: hidden;
  box-shadow: 0 40px 90px -40px rgba(6, 6, 8, 0.7); border: 1px solid var(--line); }
.palette-input { display: flex; align-items: center; gap: 0.6rem; padding: 0.8rem 0.9rem; border-bottom: 1px solid var(--line); }
.palette-input input { flex: 1; border: none; outline: none; font: inherit; font-size: 0.98rem; color: var(--text-main); background: transparent; }
.palette-input kbd, .palette-btn kbd { font-family: var(--mono); font-size: 0.68rem; border: 1px solid var(--line);
  border-radius: 5px; padding: 0.1rem 0.35rem; color: var(--text-muted); background: #ffffff; }
.palette-list { max-height: 52vh; overflow-y: auto; }
.palette-item { display: grid; grid-template-columns: 78px 1fr auto; gap: 0.7rem; align-items: center; width: 100%;
  text-align: left; padding: 0.62rem 0.95rem; background: none; border: none; border-bottom: 1px solid var(--line);
  cursor: pointer; font: inherit; }
.palette-item:last-child { border-bottom: none; }
.palette-item.active { background: var(--accent-light); }
.palette-kind { font-size: 0.66rem; letter-spacing: 0.1em; text-transform: uppercase; color: var(--text-muted); font-weight: 700; }
.palette-label { font-size: 0.9rem; font-weight: 600; }
.palette-hint { font-size: 0.76rem; color: var(--text-muted); }
.palette-empty { padding: 1.1rem; font-size: 0.86rem; color: var(--text-muted); }
.palette-foot { display: flex; gap: 1rem; padding: 0.5rem 0.95rem; border-top: 1px solid var(--line);
  font-size: 0.72rem; color: var(--text-muted); background: #ffffff; }

.palette-btn { display: inline-flex; align-items: center; gap: 0.45rem; background: #ffffff; border: 1px solid var(--line);
  border-radius: 8px; padding: 0.4rem 0.6rem; font: inherit; font-size: 0.82rem; color: var(--text-muted); cursor: pointer; }
.palette-btn:hover { border-color: var(--accent); color: var(--text-main); }

/* --- mobile navigation --- */
.nav-toggle { display: none; align-items: center; gap: 0.4rem; background: #ffffff; border: 1px solid var(--line);
  border-radius: 8px; padding: 0.4rem 0.6rem; font: inherit; font-size: 0.82rem; cursor: pointer; }
.nav-scrim { display: none; }
@media (max-width: 960px) {
  .nav-toggle { display: inline-flex; }
  .nav-toggle-label, .palette-btn-label { display: none; }
  .sidebar { position: fixed; top: 0; bottom: 0; left: 0; z-index: 1100; width: min(84vw, 320px);
    transform: translateX(-102%); transition: transform 0.22s ease; box-shadow: 0 30px 70px -30px rgba(6, 6, 8, 0.7); }
  body.nav-open .sidebar { transform: translateX(0); }
  body.nav-open .nav-scrim { display: block; position: fixed; inset: 0; z-index: 1050; background: rgba(6, 6, 8, 0.5); }
  .app-shell, body { overflow-x: hidden; }
}

/* --- print: what the office hands to a parent --- */
@media print {
  .sidebar, .topbar, .page-header, .filter-bar, .modal-header, .modal-footer, .no-print,
  .edit-bar, .palette-backdrop, .nav-scrim, .skip-link, .toast, .role-switcher { display: none !important; }
  body, .main-area, .page-content { background: #fff !important; padding: 0 !important; margin: 0 !important; }
  .card { box-shadow: none !important; border: 1px solid #ddd !important; break-inside: avoid; }
  .table th { background: #fff !important; }
  a[href]::after { content: ""; }
}
'''
    open(p, "w", encoding="utf-8").write(s)
    print("styles.css: finish-pass styles")

# ------------------------------------------------------ pages: meta + manifest
for page in ["index.html", "app.html", "designs.html", "colours.html"]:
    p = os.path.join("public", page)
    s = open(p, encoding="utf-8").read()
    changed = False
    if 'name="theme-color"' not in s:
        s = s.replace('<link rel="icon"', '<meta name="theme-color" content="#141316" />\n<link rel="manifest" href="/manifest.json" />\n<link rel="apple-touch-icon" href="/assets/icon-192.png" />\n<link rel="icon"', 1)
        changed = True
    if "/version.js" not in s and "<script" in s:
        m = re.search(r'\n(\s*)<script src="/brand\.js[^"]*"></script>', s)
        if m:
            s = s[:m.start()] + f'\n{m.group(1)}<script src="/version.js"></script>' + s[m.start():]
        else:
            s = s.replace("</body>", '  <script src="/version.js"></script>\n</body>', 1)
        changed = True
    if changed:
        open(p, "w", encoding="utf-8").write(s)
        print(page + ": meta, manifest, version.js")

# --------------------------------------------------------------- manifest
manifest = '''{
  "name": "Faith Learning Centre — School Portal",
  "short_name": "FLC Portal",
  "description": "The administration, teaching, bursary and parent portals of Faith Learning Centre.",
  "start_url": "/app",
  "scope": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#141316",
  "icons": [
    { "src": "/assets/icon-192.png", "sizes": "192x192", "type": "image/png", "purpose": "any" },
    { "src": "/assets/icon-512.png", "sizes": "512x512", "type": "image/png", "purpose": "any" }
  ]
}
'''
open("public/manifest.json", "w", encoding="utf-8").write(manifest)
print("manifest.json written")

# ------------------------------------------------------- home-screen icons
import cairosvg
ONYX, CRIMSON, CREAM = "#141316", "#e4002b", "#f5f5f2"
SHIELD = "M34 6 60.5 15.2v20.4c0 15.6-10.4 28.4-26.5 34.6C17.9 64 7.5 51.2 7.5 35.6V15.2Z"
INNER = "M34 10.6 56.6 18.2v17.2c0 13.1-8.7 23.9-22.6 29.4C20.1 59.3 11.4 48.5 11.4 35.4V18.2Z"
FLAME = "M34 27.4c3.1 4.1 4.5 6.9 4.5 9.3a4.5 4.5 0 0 1-9 0c0-2.4 1.4-5.2 4.5-9.3Z"
for size in (192, 512):
    pad = round(size * 0.18)
    inner_size = size - pad * 2
    svg = (
        f'<svg viewBox="0 0 {size} {size}" xmlns="http://www.w3.org/2000/svg">'
        f'<rect width="{size}" height="{size}" fill="{ONYX}"/>'
        f'<g transform="translate({pad},{pad}) scale({inner_size / 68:.4f})">'
        f'<path d="{SHIELD}" fill="{ONYX}"/><path d="{INNER}" fill="none" stroke="{CRIMSON}" stroke-width="1.6"/>'
        f'<rect x="32.4" y="15.2" width="3.2" height="11.6" fill="{CREAM}"/>'
        f'<rect x="28.5" y="19" width="11" height="3.2" fill="{CREAM}"/>'
        f'<path d="{FLAME}" fill="{CRIMSON}"/>'
        f'<path d="M34 47.2c-5.1-2.7-9.6-2.7-14.1-.7v12.9c4.5-2 9-2 14.1.7Z" fill="{CREAM}"/>'
        f'<path d="M34 47.2c5.1-2.7 9.6-2.7 14.1-.7v12.9c-4.5-2-9-2-14.1.7Z" fill="{CREAM}"/>'
        f'<path d="M34 47.2v12.9" stroke="{CRIMSON}" stroke-width="2.2" stroke-linecap="round"/>'
        f'</g></svg>'
    )
    cairosvg.svg2png(bytestring=svg.encode(), write_to=f"public/assets/icon-{size}.png",
                     output_width=size, output_height=size)
    print(f"icon-{size}.png written")

# the edit bar should not sit over the print or the palette
p = "public/admin-bar.js"
s = open(p, encoding="utf-8").read()
if "version" not in s:
    s = s.replace('  window.FLCEditBar = {', '  /* eslint-disable no-unused-vars */\n  window.FLCEditBar = {')
    open(p, "w", encoding="utf-8").write(s)
    print("admin-bar.js touched")
