"""Builds a single labelled contact sheet of the seven home-page design options."""
from PIL import Image, ImageDraw, ImageFont
import os

F = "/usr/share/fonts/truetype/dejavu/"
sans = lambda s: ImageFont.truetype(F + "DejaVuSans.ttf", s)
sansb = lambda s: ImageFont.truetype(F + "DejaVuSans-Bold.ttf", s)
serifb = lambda s: ImageFont.truetype(F + "DejaVuSerif-Bold.ttf", s)

NAVY, NAVY2, GOLD, WHITE = (11, 31, 58), (16, 48, 94), (217, 119, 6), (255, 255, 255)
S100, S400, S500 = (241, 245, 249), (148, 163, 184), (100, 116, 139)
GOLD_L = (243, 220, 180)

META = [
    ("1", "Classic Heritage", "Institutional · centred",
     "Dimmed photo slider, centred serif headline, statistics band."),
    ("2", "Split Panel", "Corporate · balanced",
     "Navy information panel beside a full-bleed photograph."),
    ("3", "Editorial Broadsheet", "Print · authoritative",
     "Newspaper masthead, banner photo, columns and noticeboard."),
    ("4", "Minimal Corporate", "Restrained · spacious",
     "White space, hairline gold rules, short hero, airy grid."),
    ("5", "Bento Mosaic", "Modern · visual",
     "Photographic tile mosaic hero plus a bento card grid."),
    ("6", "Premium Dark", "Dark · exclusive",
     "Deep navy throughout with gold hairlines and a photo strip."),
    ("7", "Admissions Focused", "Conversion · practical",
     "Quick Apply in the hero, fee table and a sticky apply bar."),
]

COLS, PW, GAP = 4, 500, 28
PANEL_H = int(PW * 2000 / 1500)
LAB_H = 86
HEAD = 150
FOOT = 96
W = GAP + COLS * (PW + GAP)
rows = 2
H = HEAD + GAP + rows * (PANEL_H + LAB_H) + (rows - 1) * GAP + FOOT

sheet = Image.new("RGB", (W, H), S100)
d = ImageDraw.Draw(sheet)
d.rectangle([0, 0, W, HEAD], fill=NAVY)
d.rectangle([0, HEAD, W, HEAD + 5], fill=GOLD)
d.text((GAP + 6, 34), "SEVEN HOME PAGE DESIGNS — FAITH LEARNING CENTRE", font=serifb(34), fill=WHITE)
d.text((GAP + 6, 84), "Preview images of each option. The chosen design becomes the live school website; nothing has been changed on the running system.",
       font=sans(16), fill=(206, 220, 236))
d.text((W - GAP, 104), "Design 1 is the page in use today", font=sansb(15), fill=GOLD_L, anchor="ra")

for i, (num, name, tone, blurb) in enumerate(META):
    r, c = divmod(i, COLS)
    x = GAP + c * (PW + GAP)
    y = HEAD + GAP + r * (PANEL_H + LAB_H + GAP)
    img = Image.open(f"home-designs/design-{num}.jpg").resize((PW, PANEL_H), Image.LANCZOS)
    sheet.paste(img, (x, y))
    d.rectangle([x, y, x + PW - 1, y + PANEL_H + LAB_H], outline=(210, 220, 232))
    d.rectangle([x, y + PANEL_H, x + PW, y + PANEL_H + LAB_H], fill=WHITE)
    d.rectangle([x, y + PANEL_H, x + 62, y + PANEL_H + LAB_H], fill=NAVY)
    d.text((x + 31, y + PANEL_H + LAB_H // 2), num, font=serifb(28), fill=WHITE, anchor="mm")
    d.text((x + 78, y + PANEL_H + 16), name, font=sansb(17), fill=NAVY)
    d.text((x + 78, y + PANEL_H + 40), tone, font=sansb(11), fill=(180, 83, 9))
    d.text((x + 78, y + PANEL_H + 58), blurb, font=sans(12), fill=S500)

# filler panel for the eighth cell
r, c = 1, 3
x = GAP + c * (PW + GAP)
y = HEAD + GAP + r * (PANEL_H + LAB_H + GAP)
d.rectangle([x, y, x + PW, y + PANEL_H + LAB_H], fill=NAVY2)
d.text((x + 28, y + 34), "HOW TO CHOOSE", font=sansb(13), fill=GOLD)
lines = [
    ("1.", "Look through the seven images on this sheet."),
    ("2.", "Tell me the number you want (e.g. \"Design 5\")."),
    ("3.", "That design is then built as the live home page —"),
    ("", "   with your real data: fees, term dates, events,"),
    ("", "   notices and the school photographs."),
    ("", ""),
    ("Every option keeps:", ""),
    ("+", "Terms & Conditions links and the acceptance"),
    ("", "   checkbox on the enquiry form"),
    ("+", "The four portals: admin, teacher, bursar, parent"),
    ("+", "Mobile layouts and the navy / gold palette"),
]
yy = y + 70
for tag, txt in lines:
    if tag in ("1.", "2.", "3.", "+"):
        d.text((x + 28, yy), tag, font=sansb(13), fill=GOLD)
        d.text((x + 56, yy), txt, font=sans(13), fill=(226, 234, 244))
    else:
        d.text((x + 28, yy), txt, font=sans(13), fill=(226, 234, 244) if txt else (0, 0, 0))
    yy += 26

d.rectangle([0, H - FOOT, W, H], fill=NAVY)
d.text((GAP + 6, H - FOOT + 34), "Full-size preview of each option is saved as home-designs/design-1.jpg … design-7.jpg",
       font=sansb(15), fill=WHITE)
d.text((W - GAP, H - FOOT + 34), "Photography: real, openly-licensed Kenyan school images (Wikimedia Commons)",
       font=sans(14), fill=S400, anchor="ra")

sheet.save("home-designs/all-seven-designs.jpg", "JPEG", quality=86, optimize=True)
print("contact sheet:", sheet.size, os.path.getsize("home-designs/all-seven-designs.jpg") // 1024, "KB")
