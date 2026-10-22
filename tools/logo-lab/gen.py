import cairosvg
from PIL import Image

ONYX, CRIMSON, CREAM, GREY, MAROON = "#141316", "#e4002b", "#f5f5f2", "#e4e4e6", "#780d1c"

# Crest v2 — a solid shield, white open book, crimson flame and a small cross.
# Drawn on a 64x72 grid so the shield can carry a proper heraldic proportion.
SHIELD = "M32 3 58.5 12.2v20.4c0 15.6-10.4 28.4-26.5 34.6C15.9 61 5.5 48.2 5.5 32.6V12.2Z"

CROSS = ('<rect x="30.4" y="12.6" width="3.2" height="11.4" fill="%s"/>'
         '<rect x="26.6" y="16.4" width="10.8" height="3.2" fill="%s"/>') % (CREAM, CREAM)

FLAME = "M32 25.6c3.6 4.4 5.2 7.6 5.2 10.4a5.2 5.2 0 0 1-10.4 0c0-2.8 1.6-6 5.2-10.4Z"

BOOK = ('<path d="M32 40.6c-4.9-2.4-9.1-2.4-13.4-.6v13.6c4.3-1.8 8.5-1.8 13.4.6Z" fill="%s"/>'
        '<path d="M32 40.6c4.9-2.4 9.1-2.4 13.4-.6v13.6c-4.3-1.8-8.5-1.8-13.4.6Z" fill="%s"/>'
        '<path d="M32 40.6v13.6" stroke="%s" stroke-width="2.4" stroke-linecap="round"/>') % (CREAM, CREAM, CRIMSON)

CHEVRON = '<path d="M18 33.2 32 39.6 46 33.2" fill="none" stroke="%s" stroke-width="2.6" stroke-linecap="round"/>' % CRIMSON

def shield_v2(tone="dark"):
    body = ONYX if tone == "dark" else CREAM
    detail_ink = CREAM if tone == "dark" else ONYX
    return (
        '<svg viewBox="0 0 64 72" xmlns="http://www.w3.org/2000/svg">'
        f'<path d="{SHIELD}" fill="{body}"/>'
        f'<path d="{SHIELD}" fill="none" stroke="{CRIMSON}" stroke-width="2.4"/>'
        + CROSS.replace(CREAM, detail_ink if tone == "light" else CREAM)
        + CROSS.replace(CREAM, CREAM if tone == "dark" else ONYX).replace(CREAM, CREAM if tone == "dark" else ONYX).replace(CREAM, detail_ink if tone == "light" else CREAM)
        + f'<path d="{FLAME}" fill="{CRIMSON}"/>'
        + BOOK
        + CHEVRON
        + "</svg>"
    )

# simpler: build explicitly to avoid replace gymnastics
def crest(tone="dark"):
    ink = CREAM if tone == "dark" else ONYX
    plate = ONYX if tone == "dark" else CREAM
    return (
        '<svg viewBox="0 0 64 72" xmlns="http://www.w3.org/2000/svg">'
        f'<path d="{SHIELD}" fill="{plate}"/>'
        f'<path d="{SHIELD}" fill="none" stroke="{CRIMSON}" stroke-width="2.6"/>'
        f'<rect x="30.3" y="12.4" width="3.4" height="12" fill="{ink}"/>'
        f'<rect x="26.4" y="16.3" width="11.2" height="3.4" fill="{ink}"/>'
        f'<path d="{FLAME}" fill="{CRIMSON}"/>'
        f'<path d="M32 41.4c-5-2.6-9.3-2.6-13.7-.7v13.9c4.4-1.9 8.7-1.9 13.7.7Z" fill="{ink}"/>'
        f'<path d="M32 41.4c5-2.6 9.3-2.6 13.7-.7v13.9c-4.4-1.9-8.7-1.9-13.7.7Z" fill="{ink}"/>'
        f'<path d="M32 41.4v13.9" stroke="{CRIMSON}" stroke-width="2.4" stroke-linecap="round"/>'
        f'<path d="M18.6 33.6 32 39.8l13.4-6.2" fill="none" stroke="{CRIMSON}" stroke-width="2.6" stroke-linecap="round"/>'
        "</svg>"
    )

for tone, bg in (("dark", "#ffffff"), ("light", ONYX)):
    svg = crest(tone)
    open(f"{tone}.svg", "w").write(svg)
    cairosvg.svg2png(bytestring=svg.encode(), write_to=f"{tone}.png", output_width=256, output_height=288, background_color=bg)

# a strip: white / onyx / greys, at 3 sizes, to judge legibility
canvas = Image.new("RGB", (1180, 420), "#ffffff")
xs = 20
for tone, bg in (("dark", "#ffffff"), ("light", ONYX), ("dark", GREY), ("light", MAROON)):
    for size in (192, 96, 40, 20):
        png = f"/tmp/crest_{tone}_{size}.png"
        cairosvg.svg2png(bytestring=crest(tone).encode(), write_to=png, output_width=size, output_height=int(size * 72 / 64), background_color=bg)
        im = Image.open(png)
        tile = Image.new("RGB", (im.width + 16, 400), bg)
        tile.paste(im, (8, 8))
        canvas.paste(tile, (xs, 10))
        xs += tile.width
    xs += 14
canvas.save("/home/user/tools/logo-lab/crest-v2-strip.png")
print("rendered")
