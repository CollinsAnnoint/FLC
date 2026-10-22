#!/usr/bin/env python3
"""Rebuild colour-options.html from public/themes.js so the board always matches the system."""
import re, os

os.chdir("/home/user")
src = open("public/themes.js", encoding="utf-8").read()

amber = dict(re.findall(r'(gold\w+):\s*"([^"]+)"', re.search(r'const AMBER = \{([^}]*)\}', src).group(1)))

blocks = re.findall(r'\{\s*id:\s*"([^"]+)",\s*name:\s*"([^"]+)",\s*tone:\s*"([^"]+)",\s*'
                    r'blurb:\s*"([^"]+)",\s*sidebar:\s*"([^"]+)",\s*tokens:\s*\{([^}]*)\}\s*\}', src)
assert len(blocks) >= 8, len(blocks)

themes = []
for tid, name, tone, blurb, sidebar, toks in blocks:
    t = dict(re.findall(r'(\w+):\s*"([^"]+)"', toks))
    for k, v in amber.items():
        t.setdefault(k, v)
    themes.append(dict(id=tid, name=name, tone=tone, blurb=blurb, sidebar=sidebar, t=t))

live = themes[0]                                  # the first entry is the live combination
order = [live] + [t for t in themes[1:]]

SERIF = "Rubik,'Segoe UI',system-ui,-apple-system,Arial,sans-serif"
SANS = "Rubik,'Segoe UI',system-ui,-apple-system,Arial,sans-serif"
MONO = "ui-monospace,Consolas,monospace"


def card(t, is_live):
    tok = t["t"]
    swatches = "".join('<span style="flex:1;background:%s;height:56px;"></span>' % tok[k]
                       for k in ("navy950", "navy900", "navy800", "gold500", "gold100"))
    values = " · ".join('<span style="font-family:%s;font-size:0.74rem;color:#5c5c5c;">%s</span>' % (MONO, tok[k])
                        for k in ("navy950", "navy900", "navy800", "gold500"))
    if is_live:
        badge = '<span style="font-size:0.68rem;letter-spacing:0.08em;text-transform:uppercase;font-weight:800;color:#b00021;">Live across the system now</span>'
    elif t["id"] == "navy":
        badge = '<span style="font-size:0.68rem;letter-spacing:0.08em;text-transform:uppercase;font-weight:800;color:#5c5c5c;">Superseded — available to switch back</span>'
    else:
        badge = '<span style="font-size:0.68rem;letter-spacing:0.08em;text-transform:uppercase;font-weight:800;color:#5c5c5c;">%s</span>' % t["tone"]
    return f'''
      <div style="border:1px solid #e4e4e6;border-radius:14px;background:#fff;overflow:hidden;box-shadow:0 14px 34px -30px rgba(20,19,22,0.5);">
        <div style="display:flex;">{swatches}</div>
        <div style="padding:1rem 1.1rem 1.15rem;">
          <div style="display:flex;justify-content:space-between;align-items:baseline;gap:0.6rem;flex-wrap:wrap;">
            <strong style="font-family:{SERIF};font-size:1.05rem;color:#141316;">{t["name"].replace("&", "&amp;")}</strong>
            {badge}
          </div>
          <p style="font-size:0.86rem;color:#3f3f3f;margin:0.45rem 0 0.6rem;">{t["blurb"]}</p>
          <div style="margin-bottom:0.7rem;">{values}</div>
          <div style="background:#fafafa;border:1px solid #e4e4e6;border-radius:9px;padding:0.55rem 0.7rem;font-size:0.8rem;color:#3f3f3f;">
            See it on the live site: append <span style="font-family:{MONO};">?theme={t["id"]}</span>
            to the web address — e.g. <span style="font-family:{MONO};">/?theme={t["id"]}</span> for the website
            and <span style="font-family:{MONO};">/app?theme={t["id"]}</span> for the portals.
          </div>
        </div>
      </div>'''


cards = "".join(card(t, t is live) for t in order)

html = f'''<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<link rel="icon" type="image/svg+xml" href="/assets/logo.svg" />
<title>System colours — FAITH LEARNING CENTRE</title>
</head>
<body style="margin:0;background:#ffffff;color:#232323;font-family:{SANS};line-height:1.6;">

  <div style="background:linear-gradient(180deg,#141316,#060608);color:#f5f5f2;padding:2.3rem 2rem 2.1rem;border-bottom:3px solid #e4002b;">
    <div style="font-family:{SERIF};font-size:0.72rem;letter-spacing:0.22em;text-transform:uppercase;color:#f4667c;font-weight:700;">Backend customization zone · Visual theme</div>
    <h1 style="margin:0.5rem 0 0.4rem;font-family:{SERIF};font-size:1.95rem;">Onyx &amp; Crimson is now live — and seven more combinations to choose from</h1>
    <p style="margin:0;max-width:880px;color:rgba(245,245,242,0.86);font-size:0.95rem;">
      The colours come straight from the reference board supplied by the school: <strong style="color:#f4667c;">onyx black</strong>
      surfaces, the <strong style="color:#f4667c;">deep maroon</strong> mid-tone and a <strong style="color:#f4667c;">crimson</strong>
      accent (#e4002b), over off-white and light grey. It repaints the four portals, the public website and all eight home
      page designs. Any of the others can be swapped in the same way — preview live first, then apply. The colours below are
      the real values; nothing here is a mock-up.
    </p>
  </div>

  <div style="max-width:1180px;margin:0 auto;padding:1.7rem 1.4rem 3rem;">
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(330px,1fr));gap:1.1rem;">{cards}
    </div>

    <div style="margin-top:1.6rem;background:#fff;border:1px solid #e4e4e6;border-left:3px solid #e4002b;border-radius:12px;padding:1rem 1.15rem;font-size:0.87rem;color:#3f3f3f;">
      <strong style="color:#141316;">Two ways to switch.</strong>
      <ol style="margin:0.5rem 0 0;padding-left:1.2rem;">
        <li style="margin-bottom:0.3rem;"><strong>Open the live picker:</strong> <span style="font-family:{MONO};">/colours</span>
          on the running system — every tile there has a <em>Preview</em> and an <em>Apply</em> button, and applying
          writes the choice to the school server.</li>
        <li><strong>Or from the admin console:</strong> Backend Customization Zone → Branding → <em>Primary / Accent
          Colour</em>, <em>Sidebar Theme</em> and the <em>Quick Theme Presets</em> (which carry these same combinations).</li>
      </ol>
      A preview never changes what visitors see until you press Apply — the preview bar always says so.
    </div>

    <div style="margin-top:1rem;background:#fff;border:1px solid #e4e4e6;border-radius:12px;padding:1rem 1.15rem;font-size:0.87rem;color:#3f3f3f;">
      <strong style="color:#141316;">Also changed with this palette:</strong> the school logo is now a drawn crest
      (shield, open book and flame) in the same onyx and crimson, and the home page walks down the campus with
      alternating photographs — see <span style="font-family:{MONO};">logo-preview.html</span>.
    </div>
  </div>
</body>
</html>
'''
open("colour-options.html", "w", encoding="utf-8").write(html)
print("colour-options.html rebuilt:", len(themes), "combinations, live =", live["name"])
