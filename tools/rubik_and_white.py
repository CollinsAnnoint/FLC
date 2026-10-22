#!/usr/bin/env python3
"""Rubik becomes the school's typeface, and every light surface becomes pure white."""
import os
import re

os.chdir("/home/user")

# ---------------------------------------------------------------- 1. the font
TOKENS = {
    "--serif": '"Rubik", "Segoe UI", system-ui, -apple-system, "Helvetica Neue", Arial, sans-serif',
    "--sans": '"Rubik", "Segoe UI", system-ui, -apple-system, "Helvetica Neue", Arial, sans-serif',
}

site = "public/site.css"
s = open(site, encoding="utf-8").read()
old_comment = """  /* Type system: Baskerville-lineage display serif, humanist rounded UI sans
     (Candara / Optima), monospace for codes. Every family is installed on the
     machine, so the site renders identically offline. */
  --serif: Baskerville, "Baskerville Old Face", "Libre Baskerville", "Times New Roman", Cambria, Georgia, serif;
  --sans: "Candara", Optima, "Segoe UI", "Trebuchet MS", system-ui, -apple-system, Arial, sans-serif;
  --mono: Consolas, Menlo, "Roboto Mono", "SF Mono", ui-monospace, "Courier New", monospace;"""
new_comment = """  /* Type system: Rubik, self-hosted from /assets/fonts (SIL Open Font License),
     so the site looks the same in the portals, on the website and offline.
     Monospace is kept for codes and figures that must line up in columns. */
  --serif: "Rubik", "Segoe UI", system-ui, -apple-system, "Helvetica Neue", Arial, sans-serif;
  --sans: "Rubik", "Segoe UI", system-ui, -apple-system, "Helvetica Neue", Arial, sans-serif;
  --mono: Consolas, Menlo, "Roboto Mono", "SF Mono", ui-monospace, "Courier New", monospace;"""
assert old_comment in s, "site.css type tokens"
s = s.replace(old_comment, new_comment, 1)

# headings set in Rubik want a tighter, heavier treatment than a serif did
if "/* Rubik typography tuning */" not in s:
    s += """
/* Rubik typography tuning — the face carries the headings at a heavier weight
   and a tighter measure, which is how a geometric sans reads as institutional. */
h1, h2, h3, .hx-h1, .d8-hero h1, .d8-head h2, .d8-alt-body h3 { font-weight: 600; letter-spacing: -0.012em; }
h4, h5, h6, .hx-eyebrow, .d8-eyebrow, .d8-kicker { font-weight: 500; letter-spacing: 0.02em; }
.hx-lead, .d8-hero-sub, .d8-band-sub { font-weight: 400; }
.hx-stat-v, .d8-stats .hx-stat-v { font-weight: 700; letter-spacing: -0.02em; }
"""
open(site, "w", encoding="utf-8").write(s)
print("site.css: type tokens now Rubik")

# styles.css (the portals) keeps its own copy of the tokens
styles = "public/styles.css"
s = open(styles, encoding="utf-8").read()
if '"Rubik"' not in s:
    pat = re.compile(r"--serif:\s*[^;]+;")
    found = pat.findall(s)
    s = pat.sub('--serif: "Rubik", "Segoe UI", system-ui, -apple-system, "Helvetica Neue", Arial, sans-serif;', s, count=1)
    s = re.sub(r"--sans:\s*[^;]+;", '--sans: "Rubik", "Segoe UI", system-ui, -apple-system, "Helvetica Neue", Arial, sans-serif;', s, count=1)
    open(styles, "w", encoding="utf-8").write(s)
    print("styles.css: portal tokens now Rubik (" + str(len(found)) + " serif token)")

# ------------------------------------------------------------------ 2. pages
for page in ["index.html", "app.html", "designs.html", "colours.html"]:
    p = os.path.join("public", page)
    if not os.path.exists(p):
        continue
    s = open(p, encoding="utf-8").read()
    if "/rubik.css" in s:
        continue
    m = re.search(r'\n(\s*)<link rel="stylesheet" href="/(site|styles)\.css[^"]*"\s*/?>', s)
    assert m, page + ": no stylesheet link found"
    indent = m.group(1)
    s = s[:m.start()] + f'\n{indent}<link rel="stylesheet" href="/rubik.css?v=1" />' + s[m.start():]
    open(p, "w", encoding="utf-8").write(s)
    print(page + ": rubik.css linked")

# ------------------------------------------- 3. the administrator's font list
p = "public/admin-bar.js"
s = open(p, encoding="utf-8").read()
s = s.replace('''  const FONTS = [
    ["baskerville", "Baskerville & Candara"],
    ["georgia", "Georgia & Segoe UI"],
    ["cambria", "Cambria & Verdana"],
    ["modern", "Candara-led modern"]
  ];''',
'''  const FONTS = [
    ["rubik", "Rubik — the school's face"],
    ["rubik-tight", "Rubik, tighter headlines"],
    ["rubik-wide", "Rubik, wider spacing"],
    ["rubik-system", "Rubik with system fallback"]
  ];''')
open(p, "w", encoding="utf-8").write(s)
print("admin-bar.js: Rubik presets")

# the presets the typing engine applies
p = "public/app.js"
s = open(p, encoding="utf-8").read()
old = """    const presets = {
      baskerville: {
        serif: 'Baskerville, "Baskerville Old Face", "Libre Baskerville", "Times New Roman", Cambria, Georgia, serif',
        sans: 'Candara, Optima, "Segoe UI", "Trebuchet MS", system-ui, -apple-system, Arial, sans-serif'
      },
      georgia: { serif: 'Georgia, "Times New Roman", Cambria, serif', sans: '"Segoe UI", Tahoma, Verdana, Geneva, sans-serif' },
      cambria: { serif: 'Cambria, Georgia, "Times New Roman", serif', sans: 'Verdana, Geneva, "Segoe UI", sans-serif' },
      modern: { serif: 'Candara, Optima, "Segoe UI", system-ui, sans-serif', sans: '"Segoe UI", system-ui, -apple-system, Arial, sans-serif' }
    };"""
new = """    const RUBIK = '"Rubik", "Segoe UI", system-ui, -apple-system, "Helvetica Neue", Arial, sans-serif';
    const presets = {
      rubik: { serif: RUBIK, sans: RUBIK },
      "rubik-tight": { serif: RUBIK, sans: RUBIK, tracking: "-0.02em" },
      "rubik-wide": { serif: RUBIK, sans: RUBIK, tracking: "0.02em" },
      "rubik-system": { serif: '"Rubik", "Segoe UI", Arial, sans-serif', sans: '"Rubik", "Segoe UI", Arial, sans-serif' }
    };"""
assert old in s, "app.js typography presets"
s = s.replace(old, new, 1)
s = s.replace('''    const preset = presets[c.preset] || presets.baskerville;''',
              '''    const preset = presets[c.preset] || presets.rubik;''', 1)
s = s.replace('''    root.style.fontSize = scales[c.scale] || scales.normal;''',
              '''    root.style.fontSize = scales[c.scale] || scales.normal;
    root.style.setProperty("--tracking", preset.tracking || "0");''', 1)
s = s.replace('''    window.__flcTypography = { preset: c.preset || "baskerville", scale: c.scale || "normal" };''',
              '''    window.__flcTypography = { preset: c.preset || "rubik", scale: c.scale || "normal" };''', 1)
open(p, "w", encoding="utf-8").write(s)
print("app.js: typography presets are Rubik")

# the saved default on the server
p = "data/seed.js"
s = open(p, encoding="utf-8").read()
if 'preset: "baskerville"' in s:
    s = s.replace('''    typography: {
      preset: "baskerville",''', '''    typography: {
      preset: "rubik",''', 1)
    open(p, "w", encoding="utf-8").write(s)
    print("seed.js: default typography preset is rubik")

# ------------------------------------------------- 4. the colour preview bar
p = "public/themes.js"
s = open(p, encoding="utf-8").read()
s = s.replace('font-family: "Segoe UI Variable Text", "Segoe UI", system-ui, -apple-system, Roboto, Arial, sans-serif;',
              'font-family: "Rubik", "Segoe UI", system-ui, -apple-system, Roboto, Arial, sans-serif;', 1)
s = s.replace('.theme-preview-bar strong { font-family: "Iowan Old Style", "Palatino Linotype", Palatino, Georgia, serif;',
              '.theme-preview-bar strong { font-family: "Rubik", "Segoe UI", system-ui, sans-serif;', 1)
open(p, "w", encoding="utf-8").write(s)
print("themes.js: preview bar in Rubik")

# ---------------------------------------------------- 5. pure white surfaces
NEUTRAL = ["#fafafa", "#f9f9f9", "#f8f8f8", "#f8f8f6", "#f8f8f7", "#f7f7f7", "#f6f6f6", "#f5f5f2",
           "#f5f5f5", "#f4f4f4", "#f3f3f3", "#f2f2f2", "#f1f1f1", "#efefef", "#ededed", "#eceae6",
           "#fbfbfb", "#fcfcfc", "#f7f5f0", "#f6f4ef"]
VARS = {"--primary-light", "--info-bg", "--slate-100", "--bg-body", "--bg-card", "--paper", "--paper-warm",
        "--white", "--surface", "--surface-2", "--line-soft"}

changed = {}
for fname in ["public/site.css", "public/styles.css", "public/homes.css", "public/home.css"]:
    if not os.path.exists(fname):
        continue
    src = open(fname, encoding="utf-8").read()
    out = []
    count = 0
    for block in re.split(r"(?<=\})", src):
        selector = block.split("{")[0] if "{" in block else block
        interactive = re.search(r":hover|:focus|:active|\.is-open|\[aria-expanded", selector)
        if "{" not in block or interactive:
            out.append(block)
            continue
        fixed = block
        for grey in NEUTRAL:
            fixed = re.sub(r"background(-color)?:\s*" + re.escape(grey) + r"\b", r"background\1: #ffffff", fixed, flags=re.I)
        fixed = re.sub(r"background(-color)?:\s*var\((--primary-light|--info-bg)\)", r"background\1: #ffffff", fixed)
        # token definitions that paint a light surface
        fixed = re.sub(r"(--primary-light|--info-bg|--surface|--surface-2|--line-soft):\s*" + "|".join(re.escape(g) for g in NEUTRAL), r"\1: #ffffff", fixed)
        if fixed != block:
            count += len(re.findall(r"#ffffff", fixed)) - len(re.findall(r"#ffffff", block))
        out.append(fixed)
    result = "".join(out)
    if result != src:
        open(fname, "w", encoding="utf-8").write(result)
        changed[fname] = count
print("white sweep:", changed if changed else "nothing to change")

# the public site's alternating section used a grey wash
p = "public/site.css"
s = open(p, encoding="utf-8").read()
s = re.sub(r"(\.hx-sec\.alt[^{]*\{[^}]*?)background:\s*[^;]+;", r"\1background: #ffffff;", s)
open(p, "w", encoding="utf-8").write(s)
print("site.css: alternating sections are white")
