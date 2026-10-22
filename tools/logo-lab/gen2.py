import cairosvg
from PIL import Image

ONYX, CRIMSON, CREAM, GREY, MAROON = "#141316", "#e4002b", "#f5f5f2", "#e4e4e6", "#780d1c"
SHIELD = "M32 3 58.5 12.2v20.4c0 15.6-10.4 28.4-26.5 34.6C15.9 61 5.5 48.2 5.5 32.6V12.2Z"

def crest(tone="dark"):
    ink = CREAM if tone == "dark" else ONYX
    plate = ONYX if tone == "dark" else CREAM
    # smaller flame, clear gap above the book; no chevron
    flame = "M32 24.4c3.1 4.1 4.5 6.9 4.5 9.3a4.5 4.5 0 0 1-9 0c0-2.4 1.4-5.2 4.5-9.3Z"
    return (
        '<svg viewBox="0 0 64 72" xmlns="http://www.w3.org/2000/svg">'
        f'<path d="{SHIELD}" fill="{plate}"/>'
        f'<path d="{SHIELD}" fill="none" stroke="{CRIMSON}" stroke-width="2.6"/>'
        f'<path d="{SHIELD}" fill="none" stroke="{ink}" stroke-width="1.1" opacity=".5" transform="translate(0,0) scale(.93) translate(2.3,2.6)"/>'
        f'<rect x="30.4" y="12.2" width="3.2" height="11.6" fill="{ink}"/>'
        f'<rect x="26.5" y="16" width="11" height="3.2" fill="{ink}"/>'
        f'<path d="{flame}" fill="{CRIMSON}"/>'
        # book: two pages with a crimson spine, sitting on the lower field
        f'<path d="M32 44.2c-5.1-2.7-9.6-2.7-14.1-.7v12.9c4.5-2 9-2 14.1.7Z" fill="{ink}"/>'
        f'<path d="M32 44.2c5.1-2.7 9.6-2.7 14.1-.7v12.9c-4.5-2-9-2-14.1.7Z" fill="{ink}"/>'
        f'<path d="M32 44.2v12.9" stroke="{CRIMSON}" stroke-width="2.2" stroke-linecap="round"/>'
        f'<path d="M20.6 46.6c3.5-1.2 7.2-1 11.4 1.4M43.4 46.6c-3.5-1.2-7.2-1-11.4 1.4" fill="none" stroke="{CRIMSON}" stroke-width="1.1" opacity=".55"/>'
        "</svg>"
    )

for tone, bg in (("dark", "#ffffff"), ("light", ONYX)):
    svg = crest(tone)
    open(f"{tone}.svg", "w").write(svg)
    cairosvg.svg2png(bytestring=svg.encode(), write_to=f"{tone}.png", output_width=256, output_height=288, background_color=bg)

canvas = Image.new("RGB", (1180, 430), "#ffffff")
xs = 16
for tone, bg in (("dark", "#ffffff"), ("light", ONYX), ("dark", GREY), ("light", MAROON)):
    for size in (200, 96, 44, 22, 16):
        png = f"/tmp/c2_{tone}_{size}.png"
        cairosvg.svg2png(bytestring=crest(tone).encode(), write_to=png, output_width=size, output_height=int(size * 72 / 64), background_color=bg)
        im = Image.open(png)
        tile = Image.new("RGB", (im.width + 14, 410), bg)
        tile.paste(im, (7, 10))
        canvas.paste(tile, (xs, 10)); xs += tile.width
    xs += 12
canvas.save("crest-v2-strip.png")
print("ok")
