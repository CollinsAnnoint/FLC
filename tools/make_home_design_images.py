"""
Renders seven home-page design previews (PNG/JPG images) for FAITH LEARNING CENTRE.
Uses the school's own openly-licensed photographs + the institutional navy/gold palette.
Output: home-designs/design-1..7.jpg  (1500 x 2000 "page preview" images)
"""
import os
from PIL import Image, ImageDraw, ImageFont, ImageFilter

A = "public/assets"
OUT = "home-designs"
W, H = 1500, 2000

# ---------------------------------------------------------------- palette
NAVY = (11, 31, 58)
NAVY2 = (16, 48, 94)
NAVY3 = (22, 64, 110)
BLUE = (29, 79, 143)
DARKER = (6, 20, 38)
GOLD = (217, 119, 6)
GOLD_D = (180, 83, 9)
GOLD_L = (243, 220, 180)
WHITE = (255, 255, 255)
CREAM = (253, 252, 249)
S50 = (248, 250, 252)
S100 = (241, 245, 249)
S200 = (226, 232, 240)
S300 = (203, 213, 225)
S400 = (148, 163, 184)
S500 = (100, 116, 139)
S600 = (71, 85, 105)
S700 = (51, 65, 85)
INK = (15, 23, 42)
GREEN = (21, 128, 61)

F = "/usr/share/fonts/truetype/dejavu/"
def font(name, size):
    return ImageFont.truetype(F + name, size)

def sans(s): return font("DejaVuSans.ttf", s)
def sansb(s): return font("DejaVuSans-Bold.ttf", s)
def serif(s): return font("DejaVuSerif.ttf", s)
def serifb(s): return font("DejaVuSerif-Bold.ttf", s)

# ---------------------------------------------------------------- helpers
def cover(path, w, h):
    im = Image.open(path).convert("RGB")
    sr, tr = im.width / im.height, w / h
    if sr > tr:
        nw = int(im.height * tr)
        im = im.crop(((im.width - nw) // 2, 0, (im.width + nw) // 2, im.height))
    else:
        nh = int(im.width / tr)
        im = im.crop((0, (im.height - nh) // 2, im.width, (im.height + nh) // 2))
    return im.resize((w, h), Image.LANCZOS)

def mix(c1, c2, t):
    return tuple(int(a + (b - a) * t) for a, b in zip(c1, c2))

def dim(img, amount, colour=NAVY):
    return Image.blend(img, Image.new("RGB", img.size, colour), amount)

def grad(w, h, c1, c2, diagonal=False):
    g = Image.new("RGB", (w, h), c1)
    d = ImageDraw.Draw(g)
    if diagonal:
        for i in range(w + h):
            t = i / (w + h)
            d.line([(i, 0), (0, i)], fill=mix(c1, c2, t))
    else:
        for y in range(h):
            d.line([(0, y), (w, y)], fill=mix(c1, c2, y / max(1, h - 1)))
    return g

def photo_on(base, path, box, radius=0, amount=0.0, colour=NAVY, border=None):
    x, y, w, h = box
    p = cover(path, w, h)
    if amount:
        p = dim(p, amount, colour)
    if radius:
        mask = Image.new("L", (w, h), 0)
        ImageDraw.Draw(mask).rounded_rectangle([0, 0, w - 1, h - 1], radius, fill=255)
    else:
        mask = Image.new("L", (w, h), 255)
    base.paste(p, (x, y), mask)
    if border:
        ImageDraw.Draw(base).rounded_rectangle([x, y, x + w - 1, y + h - 1], radius, outline=border, width=2)
    return base

def rrect(d, box, radius, fill=None, outline=None, width=1):
    d.rounded_rectangle(box, radius, fill=fill, outline=outline, width=width)

def txt(d, xy, s, f, fill, anchor="la"):
    d.text(xy, s, font=f, fill=fill, anchor=anchor)

def wrap(d, text, f, maxw):
    words, lines, cur = text.split(), [], ""
    for w_ in words:
        t = (cur + " " + w_).strip()
        if d.textlength(t, font=f) <= maxw:
            cur = t
        else:
            if cur:
                lines.append(cur)
            cur = w_
    if cur:
        lines.append(cur)
    return lines

def para(d, x, y, text, f, fill, maxw, leading=1.5):
    for i, ln in enumerate(wrap(d, text, f, maxw)):
        d.text((x, y + i * int(f.size * leading)), ln, font=f, fill=fill)
    return y + len(wrap(d, text, f, maxw)) * int(f.size * leading)

def button(base, x, y, label, f, fill, tcol, pad=26, h=52, outline=None, radius=10):
    d = ImageDraw.Draw(base)
    tw = d.textlength(label, font=f)
    w = int(tw + pad * 2)
    rrect(d, [x, y, x + w, y + h], radius, fill=fill, outline=outline, width=2 if outline else 1)
    txt(d, (x + w // 2, y + h // 2), label, f, tcol, "mm")
    return x + w + 14

def pill(base, x, y, label, f, fg, bg=None, border=None, h=40):
    d = ImageDraw.Draw(base)
    tw = d.textlength(label, font=f)
    w = int(tw + 40)
    rrect(d, [x, y, x + w, y + h], h // 2, fill=bg, outline=border, width=2 if border else 1)
    txt(d, (x + w // 2, y + h // 2), label, f, fg, "mm")
    return w

# ---------------------------------------------------------------- shared content
SCHOOL = "FAITH LEARNING CENTRE"
MOTTO = "Rooted in Faith, Excelling in Competence & Character"
NAV = ["About", "Academics", "School Life", "Term Dates", "Admissions", "Contact"]
STATS = [("12", "LEARNERS ENROLLED"), ("8", "STAFF MEMBERS"), ("72%", "SCHOOL MEAN SCORE"), ("94%", "AVERAGE ATTENDANCE")]
ABOUT = ("Faith Learning Centre is a Ministry of Education registered Competency-Based Curriculum school in "
         "Nairobi, offering Pre-Primary, Primary and Junior School education in a disciplined, caring and "
         "technology-supported environment.")
CONTACT = "P.O. Box 41892-00100, Ngong Road, Nairobi · 0769679217 · info@faithlearningcentre.ac.ke"

def header(base, dark=False, bar_h=94):
    d = ImageDraw.Draw(base)
    d.rectangle([0, 0, W, bar_h], fill=NAVY2 if dark else WHITE)
    d.line([(0, bar_h), (W, bar_h)], fill=(29, 58, 94) if dark else S200, width=2)
    # crest
    crest = grad(56, 56, NAVY3, GOLD, diagonal=True)
    m = Image.new("L", (56, 56), 0)
    ImageDraw.Draw(m).rounded_rectangle([0, 0, 55, 55], 12, fill=255)
    base.paste(crest, (34, 19), m)
    txt(d, (62, 47), "FLC", sansb(17), WHITE, "mm")
    txt(d, (104, 26), SCHOOL, sansb(23), WHITE if dark else NAVY)
    txt(d, (104, 56), MOTTO, sans(14), (200, 212, 228) if dark else S500)
    x = 780
    for n in NAV:
        txt(d, (x, bar_h // 2), n, sans(16), (226, 235, 245) if dark else S700, "lm")
        x += int(d.textlength(n, font=sans(16))) + 30
    button(base, W - 190, (bar_h - 46) // 2, "Portal", sansb(15), GOLD, WHITE, pad=24, h=46)
    return bar_h

def footer(base, y, dark_footer=True):
    d = ImageDraw.Draw(base)
    d.rectangle([0, y, W, H], fill=DARKER if dark_footer else WHITE)
    d.line([(0, y), (W, y)], fill=(29, 58, 94) if dark_footer else NAVY, width=3)
    crest = grad(48, 48, NAVY3, GOLD, diagonal=True)
    m = Image.new("L", (48, 48), 0)
    ImageDraw.Draw(m).rounded_rectangle([0, 0, 47, 47], 10, fill=255)
    base.paste(crest, (40, y + 32), m)
    txt(d, (100, y + 40), SCHOOL, sansb(20), WHITE if dark_footer else NAVY)
    txt(d, (100, y + 70), "KNEC 20408192 · NEMIS NEMIS-KE-40918 · Reg MOE/P&JSS/NRB/2018/0412",
        sans(13), (168, 186, 206) if dark_footer else S500)
    txt(d, (40, y + 104), "Photography: Wikimedia Commons (CC BY-SA / public domain).",
        sans(12), (120, 140, 164) if dark_footer else S400)
    cols = [("Quick links", ["About the school", "Academic programmes", "School fees", "Term dates", "Admissions"]),
            ("Portals", ["Parent & Student", "Teacher", "Bursar / Finance", "Administrator", "Terms & Conditions"]),
            ("Contact", ["Ngong Road, Nairobi", "0769679217", "info@faithlearningcentre.ac.ke", "Mon – Fri, 7:30 – 16:30"])]
    x = 700
    for ci, (title, items) in enumerate(cols):
        right = ci == len(cols) - 1
        tx = W - 40 if right else x
        anchor = "ra" if right else "la"
        txt(d, (tx, y + 34), title.upper(), sansb(13), (255, 255, 255) if dark_footer else NAVY, anchor)
        for i, it in enumerate(items):
            txt(d, (tx, y + 62 + i * 24), it, sans(14), (176, 192, 210) if dark_footer else S600, anchor)
        x += 280
    d.line([(40, H - 58), (W - 40, H - 58)], fill=(28, 45, 68) if dark_footer else S200, width=1)
    txt(d, (40, H - 40), "© 2026 FAITH LEARNING CENTRE. All rights reserved.", sans(13), (150, 168, 188) if dark_footer else S500)
    txt(d, (W - 40, H - 40), "Terms & Conditions · Data Protection & Privacy", sans(13), (150, 168, 188) if dark_footer else S500, "ra")

def stats_band(base, y, h=132, bg=NAVY, numcol=WHITE, labcol=(170, 190, 215), top_rule=GOLD):
    d = ImageDraw.Draw(base)
    d.rectangle([0, y, W, y + h], fill=bg)
    if top_rule:
        d.rectangle([0, y, W, y + 5], fill=top_rule)
    step = W // len(STATS)
    for i, (v, l) in enumerate(STATS):
        cx = step // 2 + i * step
        txt(d, (cx, y + h // 2 - 14), v, serifb(40), numcol, "mm")
        txt(d, (cx, y + h // 2 + 28), l, sans(13), labcol, "mm")

def section_head(d, x, y, kicker, title, body=None, maxw=900, tcol=NAVY, bcol=S500, kcol=GOLD_D):
    txt(d, (x, y), kicker.upper(), sansb(14), kcol)
    txt(d, (x, y + 26), title, serifb(34), tcol)
    if body:
        para(d, x, y + 86, body, sans(17), bcol, maxw)

# ---------------------------------------------------------------- the seven designs
def design_1():
    base = Image.new("RGB", (W, H), WHITE)
    hh = header(base, dark=False)
    hero_h = 700
    photo_on(base, f"{A}/hero-1.jpg", (0, hh, W, hero_h), amount=0.0)
    base.paste(dim(cover(f"{A}/hero-1.jpg", W, hero_h), 0.62, DARKER), (0, hh))
    ov = grad(W, hero_h, (6, 18, 36), (10, 30, 55))
    base.paste(ov, (0, hh), Image.new("L", (W, hero_h), 90))
    d = ImageDraw.Draw(base)
    pw = pill(base, int(W // 2 - d.textlength("MINISTRY OF EDUCATION REGISTERED · CBC SCHOOL", font=sansb(14)) // 2 - 20), hh + 96,
              "MINISTRY OF EDUCATION REGISTERED · CBC SCHOOL", sansb(14), WHITE, border=WHITE)
    txt(d, (W // 2, hh + 200), SCHOOL, serifb(58), WHITE, "ma")
    txt(d, (W // 2, hh + 282), MOTTO, serif(26), GOLD_L, "ma")
    para(d, W // 2 - 430, hh + 340, ABOUT, sans(17), (226, 234, 244), 860)
    bx = W // 2 - 300
    bx = button(base, bx, hh + 500, "Apply for Admission", sansb(18), GOLD, WHITE, pad=34, h=58)
    button(base, bx, hh + 500, "Parent & Student Portal", sansb(18), None, WHITE, pad=34, h=58, outline=WHITE)
    for i in range(3):
        cx = W // 2 - 26 + i * 26
        d.ellipse([cx, hh + hero_h - 44, cx + 11, hh + hero_h - 33], fill=WHITE if i == 0 else (255, 255, 255, 90))
    stats_band(base, hh + hero_h)
    y = hh + hero_h + 132
    d.rectangle([0, y, W, y + 470], fill=WHITE)
    txt(d, (90, y + 66), "ABOUT US", sansb(14), GOLD_D)
    txt(d, (90, y + 92), "Founded on faith, ordered for excellence", serifb(29), NAVY)
    para(d, 90, y + 158, ABOUT, sans(16), S500, 640)
    for i, (t, v) in enumerate([("Registration", "MOE/P&JSS/NRB/2018/0412"), ("KNEC Centre", "20408192"),
                                ("Head of Institution", "Mrs. Grace Wanjiku Mwangi, M.Ed")]):
        yy = y + 290 + i * 46
        txt(d, (90, yy), t, sans(16), S500)
        txt(d, (740, yy), v, sansb(16), NAVY, "ra")
        d.line([(90, yy + 30), (740, yy + 30)], fill=S200, width=1)
    photo_on(base, f"{A}/classroom.jpg", (830, y + 60, 580, 360), radius=14, border=S200)
    rrect(d, [856, y + 366, 1360, y + 424], 10, fill=NAVY)
    txt(d, (1108, y + 395), "FLC · PP1 – Grade 9 (Junior School)", sansb(15), WHITE, "mm")
    y2 = y + 470
    d.rectangle([0, y2, W, y2 + 330], fill=S100)
    for i, (ph, cap) in enumerate([("assembly.jpg", "Parade, scouts & co-curricular"),
                                   ("library.jpg", "Library and reading programme"),
                                   ("sports.jpg", "Games, sports and physical education")]):
        x = 90 + i * 447
        photo_on(base, f"{A}/{ph}", (x, y2 + 40, 424, 200), radius=12, amount=0.28, colour=NAVY, border=S200)
        txt(d, (x, y2 + 258), cap, sansb(15), NAVY)
        txt(d, (x, y2 + 284), "School life at Faith Learning Centre", sans(13), S500)
    footer(base, y2 + 330)
    return base

def design_2():
    base = Image.new("RGB", (W, H), WHITE)
    hh = header(base, dark=False)
    hero_h = 690
    d = ImageDraw.Draw(base)
    rrect(d, [0, hh, 760, hh + hero_h], 0, fill=NAVY2)
    d.rectangle([758, hh, 764, hh + hero_h], fill=GOLD)
    photo_on(base, f"{A}/hero-2.jpg", (764, hh, W - 764, hero_h))
    d = ImageDraw.Draw(base)
    pill(base, 70, hh + 84, "MINISTRY OF EDUCATION REGISTERED · KNEC 20408192", sansb(13), WHITE, border=(255, 255, 255))
    txt(d, (70, hh + 168), "FAITH\nLEARNING\nCENTRE", serifb(46), WHITE)
    txt(d, (70, hh + 372), MOTTO, serif(20), GOLD_L)
    para(d, 70, hh + 420, "Providing quality Competency-Based Education in a caring, innovative, and learner-centered environment.", sans(16), (216, 228, 242), 620)
    bx = button(base, 70, hh + 512, "Apply for Admission", sansb(16), GOLD, WHITE, pad=28, h=54)
    button(base, bx, hh + 512, "Portal Login", sansb(16), None, WHITE, pad=28, h=54, outline=WHITE)
    for i, (v, l) in enumerate(STATS[:3]):
        x = 70 + i * 220
        txt(d, (x, hh + 606), v, serifb(30), WHITE)
        txt(d, (x, hh + 644), l.title(), sans(12), (150, 172, 200))
    rrect(d, [800, hh + hero_h - 74, 1050, hh + hero_h - 30], 8, fill=(6, 20, 38, 210))
    txt(d, (925, hh + hero_h - 52), "Ngong Road · Nairobi", sansb(14), WHITE, "mm")
    y = hh + hero_h
    d.rectangle([0, y, W, y + 150], fill=WHITE)
    step = W // 4
    for i, (v, l) in enumerate(STATS):
        cx = step // 2 + i * step
        txt(d, (cx, y + 52), v, serifb(38), NAVY, "mm")
        txt(d, (cx, y + 104), l.title(), sans(13), S500, "mm")
    y += 150
    d.rectangle([0, y, W, y + 520], fill=S100)
    rrect(d, [90, y + 60, 660, y + 460], 14, fill=WHITE, outline=S200)
    txt(d, (130, y + 100), "ACADEMICS", sansb(14), GOLD_D)
    txt(d, (130, y + 128), "Competency-Based Curriculum", serifb(28), NAVY)
    para(d, 130, y + 188, "Nine learning areas assessed through School-Based Assessment and termly examinations weighted 80% / 20%, reported on official CBC progress reports.", sans(16), S500, 480)
    for i, t in enumerate(["Pre-Primary (ECDE)", "Lower Primary · Grade 1–3", "Upper Primary · Grade 4–6", "Junior School · Grade 7–9"]):
        yy = y + 268 + i * 42
        d.ellipse([130, yy + 8, 142, yy + 20], fill=GOLD)
        txt(d, (156, yy), t, sansb(16), S700)
    rrect(d, [700, y + 60, 1410, y + 460], 14, fill=WHITE, outline=S200)
    txt(d, (740, y + 100), "SCHOOL FEES", sansb(14), GOLD_D)
    txt(d, (740, y + 128), "Term 3, 2026", serifb(28), NAVY)
    rows = [("Pre-Primary (PP1–PP2)", "KES 28,000"), ("Lower Primary (G1–G3)", "KES 34,000"),
            ("Upper Primary (G4–G6)", "KES 38,000"), ("Junior School (G7–G9)", "KES 44,000")]
    for i, (a, b) in enumerate(rows):
        yy = y + 196 + i * 54
        d.rectangle([740, yy - 12, 1370, yy + 34], fill=S50 if i % 2 == 0 else WHITE)
        txt(d, (756, yy), a, sans(16), S700)
        txt(d, (1354, yy), b, sansb(16), NAVY, "ra")
    txt(d, (740, y + 420), "M-Pesa Paybill 522533 · account FLC-ADMNO · boarding from KES 60,000", sans(14), S500)
    y += 520
    d.rectangle([0, y, W, y + 320], fill=WHITE)
    txt(d, (90, y + 40), "SCHOOL LIFE", sansb(14), GOLD_D)
    for i, (ph, cap) in enumerate([("assembly.jpg", "Parade & co-curricular"), ("classroom.jpg", "Learners at work"), ("community.jpg", "Community service")]):
        x = 90 + i * 447
        photo_on(base, f"{A}/{ph}", (x, y + 80, 424, 180), radius=12, amount=0.25, colour=NAVY, border=S200)
        txt(d, (x, y + 274), cap, sansb(15), NAVY)
    footer(base, y + 320)
    return base

def design_3():
    base = Image.new("RGB", (W, H), CREAM)
    d = ImageDraw.Draw(base)
    txt(d, (60, 34), "TERM 3 · 2026  |  P.O. Box 41892-00100, Ngong Road, Nairobi", sans(14), S500)
    txt(d, (W - 60, 34), "KNEC 20408192 · NEMIS NEMIS-KE-40918", sans(14), S500, "ra")
    txt(d, (W // 2, 66), SCHOOL, serifb(46), NAVY, "ma")
    txt(d, (W // 2, 126), MOTTO.upper(), sansb(13), GOLD_D, "ma")
    d.line([(60, 160), (W - 60, 160)], fill=NAVY, width=3)
    d.line([(60, 166), (W - 60, 166)], fill=NAVY, width=1)
    y = 180
    banner_h = 560
    base.paste(dim(cover(f"{A}/hero-3.jpg", W, banner_h), 0.55, DARKER), (0, y))
    d = ImageDraw.Draw(base)
    txt(d, (80, y + banner_h - 200), "Rooted in faith. Prepared for the future.", serifb(40), WHITE)
    para(d, 80, y + banner_h - 140, "Competency-Based Education from Pre-Primary to Junior School, with boarding, transport and talent pathways across Nairobi.", sans(17), (226, 234, 244), 800)
    bx = button(base, 80, y + banner_h - 76, "Admissions open", sansb(16), GOLD, WHITE, h=52)
    button(base, bx, y + banner_h - 76, "Portal login", sansb(16), None, WHITE, h=52, outline=WHITE)
    y += banner_h
    d.rectangle([0, y, W, y + 110], fill=CREAM)
    d.line([(60, y + 20), (W - 60, y + 20)], fill=S300, width=1)
    for i, (v, l) in enumerate(STATS):
        cx = 60 + (i + 0.5) * ((W - 120) / 4)
        txt(d, (cx, y + 44), v, serifb(34), NAVY, "mm")
        txt(d, (cx, y + 82), l.title(), sans(12), S500, "mm")
    y += 110
    d.line([(60, y), (W - 60, y)], fill=S300, width=1)
    y += 34
    col_w = 420
    photo_on(base, f"{A}/library.jpg", (60, y, col_w, 240), radius=0, amount=0.2, colour=NAVY, border=S300)
    txt(d, (60, y + 262), "Reading culture", serifb(22), NAVY)
    para(d, 60, y + 300, "Every class has a timetabled library period; the reading programme runs through the year with parental book packs.", sans(15), S600, col_w)
    x2 = 60 + col_w + 50
    txt(d, (x2, y), "Notices", serifb(22), NAVY)
    d.line([(x2, y + 34), (x2 + col_w, y + 34)], fill=NAVY, width=2)
    for i, (t, dt) in enumerate([("Candidates’ Dedication Service", "16 October 2026"),
                                 ("Term 3 closing date", "21 October 2026"),
                                 ("Science & ICT week", "6 November 2026"),
                                 ("Prize giving day", "20 November 2026")]):
        yy = y + 56 + i * 96
        txt(d, (x2, yy), t, sansb(16), NAVY)
        txt(d, (x2, yy + 24), dt, sans(13), GOLD_D)
        txt(d, (x2, yy + 46), "Parents are invited; a circular will be sent by SMS.", sans(13), S500)
        d.line([(x2, yy + 74), (x2 + col_w, yy + 74)], fill=S300, width=1)
    x3 = x2 + col_w + 50
    txt(d, (x3, y), "From the Head", serifb(22), NAVY)
    d.line([(x3, y + 34), (x3 + col_w, y + 34)], fill=NAVY, width=2)
    para(d, x3, y + 56, "Our learners continue to demonstrate strong competencies in literacy, numeracy and integration. This term we welcomed new members of staff and completed the pre-technical workshop.", sans(15), S600, col_w)
    para(d, x3, y + 190, "Mrs. Grace Wanjiku Mwangi, M.Ed\nPrincipal", sansb(15), NAVY, col_w)
    photo_on(base, f"{A}/assembly.jpg", (x3, y + 250, col_w, 200), radius=0, amount=0.25, colour=NAVY, border=S300)
    txt(d, (60, y + 470), "Also inside: boarding houses, four bus routes, library and talent pathways.", sans(14), S500)
    y += 520
    d.rectangle([0, y, W, y + 300], fill=CREAM)
    d.line([(60, y), (W - 60, y)], fill=NAVY, width=3)
    txt(d, (60, y + 28), "ADMISSIONS", sansb(14), GOLD_D)
    txt(d, (60, y + 54), "Joining Faith Learning Centre", serifb(30), NAVY)
    steps = [("01", "Enquire & visit"), ("02", "Submit the application"), ("03", "Assessment & interview"), ("04", "Offer, fees & joining")]
    for i, (n, t) in enumerate(steps):
        x = 60 + i * 350
        txt(d, (x, y + 120), n, serifb(30), GOLD)
        txt(d, (x, y + 164), t, sansb(16), NAVY)
        para(d, x, y + 194, "The office responds within one working day.", sans(13), S500, 300)
    txt(d, (60, y + 250), "Requirements: birth certificate & NEMIS UPI · last report card · transfer letter · immunisation card · 2 photographs · guardian ID.",
        sans(14), S600)
    d.line([(60, y + 232), (W - 60, y + 232)], fill=S300, width=1)
    footer(base, y + 300)
    return base

def design_4():
    base = Image.new("RGB", (W, H), WHITE)
    hh = header(base, dark=False)
    ph = 330
    base.paste(dim(cover(f"{A}/hero-1.jpg", W, ph), 0.42, NAVY), (0, hh))
    d = ImageDraw.Draw(base)
    y = hh + ph - 120                      # hero card overlaps the photograph
    rrect(d, [110, y, 1000, y + 400], 6, fill=WHITE, outline=S200, width=1)
    d.rectangle([110, y, 1000, y + 4], fill=GOLD)
    pill(base, 150, y + 38, "CBC SCHOOL · PP1 – GRADE 9 · NAIROBI", sansb(12), S600, bg=S100, border=S300)
    txt(d, (150, y + 96), SCHOOL, serif(40), NAVY)
    txt(d, (150, y + 156), MOTTO, serif(19), GOLD_D)
    para(d, 150, y + 200, "A Ministry of Education registered institution offering the Competency-Based Curriculum in a caring, disciplined environment.", sans(16), S500, 800)
    bx = button(base, 150, y + 292, "Apply for admission", sansb(16), NAVY, WHITE, h=54)
    button(base, bx, y + 292, "Portal login", sansb(16), None, NAVY, h=54, outline=S300)
    # figures sit in a hairline row beneath the hero card
    yr = y + 440
    d.line([(110, yr), (W - 110, yr)], fill=S200, width=1)
    for i, (v, l) in enumerate(STATS[:4]):
        cx = 110 + int((i + 0.5) * ((W - 220) / 4))
        txt(d, (cx, yr + 34), v, serifb(30), NAVY, "mm")
        txt(d, (cx, yr + 74), l.title(), sans(13), S500, "mm")
    d.line([(110, yr + 108), (W - 110, yr + 108)], fill=S200, width=1)
    y2 = yr + 150
    section_head(d, 110, y2, "Academics", "Nine learning areas, one clear standard", "Assessed through School-Based Assessment and termly examinations weighted 80% / 20%.", maxw=900)
    cards = [("Pre-Primary", "PP1 – PP2", "KES 28,000"), ("Lower Primary", "Grade 1 – 3", "KES 34,000"),
             ("Upper Primary", "Grade 4 – 6", "KES 38,000"), ("Junior School", "Grade 7 – 9", "KES 44,000")]
    for i, (t, g, f_) in enumerate(cards):
        x = 110 + i * 325
        rrect(d, [x, y2 + 180, x + 295, y2 + 366], 6, fill=WHITE, outline=S200)
        d.line([(x + 26, y2 + 226), (x + 90, y2 + 226)], fill=GOLD, width=3)
        txt(d, (x + 26, y2 + 244), t, sansb(18), NAVY)
        txt(d, (x + 26, y2 + 272), g, sans(14), S500)
        txt(d, (x + 26, y2 + 314), f_, serifb(22), NAVY)
        txt(d, (x + 26, y2 + 342), "per term, day scholar", sans(12), S400)
    y25 = y2 + 400
    d.rectangle([0, y25, W, y25 + 210], fill=WHITE)
    d.line([(110, y25), (W - 110, y25)], fill=S200, width=1)
    txt(d, (110, y25 + 28), "TERM DATES & NOTICES", sansb(13), GOLD_D)
    txt(d, (110, y25 + 54), "Term 3, 2026", serifb(26), NAVY)
    for i, (a, b) in enumerate([("Term opens", "1 September 2026"), ("Term closes", "21 October 2026"), ("Next term opens", "5 January 2027")]):
        yy = y25 + 108 + i * 34
        txt(d, (110, yy), a, sans(15), S500)
        txt(d, (600, yy), b, sansb(15), NAVY, "ra")
        d.line([(110, yy + 22), (600, yy + 22)], fill=S200, width=1)
    txt(d, (700, y25 + 54), "Noticeboard", sansb(15), NAVY)
    for i, t in enumerate(["Candidates’ Dedication Service — 16 October 2026",
                           "Science & ICT week — 6 November 2026",
                           "Prize giving day — 20 November 2026",
                           "Fee deadline: Week 3 of every term"]):
        txt(d, (700, y25 + 92 + i * 30), "·  " + t, sans(14), S600)
    y3 = y25 + 210
    d.rectangle([0, y3, W, y3 + 240], fill=WHITE)
    d.line([(110, y3), (W - 110, y3)], fill=S200, width=1)
    txt(d, (110, y3 + 24), "SCHOOL LIFE", sansb(13), GOLD_D)
    for i, (ph2, cap) in enumerate([("classroom.jpg", "Learners at work"), ("sports.jpg", "Games & physical education"), ("community.jpg", "Community service learning")]):
        x = 110 + i * 427
        photo_on(base, f"{A}/{ph2}", (x, y3 + 54, 404, 132), radius=4, amount=0.18, colour=NAVY, border=S200)
        txt(d, (x, y3 + 202), cap, sansb(15), NAVY)
    footer(base, y3 + 240, dark_footer=True)
    return base


def design_5():
    base = Image.new("RGB", (W, H), S50)
    hh = header(base, dark=True)
    y = hh + 40
    d = ImageDraw.Draw(base)
    tiles = [
        ("text", 0, 0, 2, 2), ("photo", 2, 0, 2, 1), ("photo2", 2, 1, 1, 1), ("stat", 3, 1, 1, 1),
        ("photo3", 0, 2, 1, 1), ("photo4", 1, 2, 2, 1), ("photo5", 3, 2, 1, 1),
    ]
    gw, t, gap = 4, 300, 16
    tw = (W - 180 - gap * 3) // 4
    y0 = y
    base.paste(grad(tw * 2 + gap, t * 2 + gap, NAVY, NAVY3, diagonal=True), (90, y0))
    d = ImageDraw.Draw(base)
    txt(d, (90 + 40, y0 + 70), "FAITH · COMPETENCE · CHARACTER", sansb(12), GOLD_L)
    txt(d, (90 + 40, y0 + 110), "FAITH\nLEARNING\nCENTRE", serifb(40), WHITE)
    txt(d, (90 + 40, y0 + 270), MOTTO, serif(17), GOLD_L)
    button(base, 90 + 40, y0 + 320, "Apply now", sansb(16), GOLD, WHITE, h=50)
    button(base, 90 + 40 + 160, y0 + 320, "Portal", sansb(16), None, WHITE, h=50, outline=WHITE)
    photo_on(base, f"{A}/hero-2.jpg", (90 + tw * 2 + gap * 2, y0, tw * 2 + gap, t), radius=16, amount=0.15)
    photo_on(base, f"{A}/classroom.jpg", (90 + tw * 2 + gap * 2, y0 + t + gap, tw, t), radius=16, amount=0.15)
    rrect(d, [90 + tw * 3 + gap * 3, y0 + t + gap, 90 + tw * 4 + gap * 3, y0 + t * 2 + gap], 16, fill=GOLD)
    txt(d, (90 + tw * 3 + gap * 3 + tw // 2, y0 + t + gap + t // 2 - 20), "72%", serifb(44), WHITE, "mm")
    txt(d, (90 + tw * 3 + gap * 3 + tw // 2, y0 + t + gap + t // 2 + 34), "SCHOOL MEAN", sansb(13), WHITE, "mm")
    row2 = y0 + t * 2 + gap * 2
    photo_on(base, f"{A}/sports.jpg", (90, row2, tw, t), radius=16, amount=0.18)
    photo_on(base, f"{A}/library.jpg", (90 + tw + gap, row2, tw * 2 + gap, t), radius=16, amount=0.2)
    photo_on(base, f"{A}/assembly.jpg", (90 + (tw + gap) * 3, row2, tw, t), radius=16, amount=0.2)
    y = row2 + t + 60
    d.rectangle([0, y, W, y + 430], fill=WHITE)
    section_head(d, 90, y + 50, "Academics & School Life", "Everything in one well-ordered system", "Competency-Based Education from PP1 to Grade 9 with boarding, transport and talent pathways.", maxw=1000)
    cards = [("PP1 – Grade 3", "ECDE & Lower Primary"), ("Grade 4 – 6", "Upper Primary with KPSEA prep"),
             ("Grade 7 – 9", "Junior School & pre-technical"), ("Boarding", "4 houses · 240 beds")]
    for i, (t1, t2) in enumerate(cards):
        x = 90 + i * 340
        rrect(d, [x, y + 240, x + 310, y + 390], 16, fill=S50, outline=S200)
        txt(d, (x + 26, y + 272), t1, sansb(19), NAVY)
        txt(d, (x + 26, y + 306), t2, sans(14), S500)
        para(d, x + 26, y + 340, "Term fee from KES 28,000. M-Pesa Paybill 522533.", sans(13), S600, 250)
    y += 430
    stats_band(base, y, 150, bg=NAVY, top_rule=GOLD)
    footer(base, y + 150)
    return base

def design_6():
    base = Image.new("RGB", (W, H), NAVY)
    hh = header(base, dark=True)
    d = ImageDraw.Draw(base)
    hero_h = 660
    base.paste(grad(W, hero_h, DARKER, NAVY2, diagonal=True), (0, hh))
    d = ImageDraw.Draw(base)
    pill(base, 90, hh + 80, "MINISTRY OF EDUCATION REGISTERED · CBC · NAIROBI", sansb(13), GOLD_L, bg=(217, 119, 6, 40), border=GOLD)
    txt(d, (90, hh + 160), "FAITH LEARNING\nCENTRE", serifb(46), WHITE)
    txt(d, (90, hh + 320), MOTTO, serif(20), GOLD_L)
    para(d, 90, hh + 368, "To nurture holistic, ethical, and globally competitive learners grounded in Christian values and academic excellence.", sans(16), (206, 220, 236), 620)
    bx = button(base, 90, hh + 470, "Apply for admission", sansb(16), GOLD, WHITE, h=54)
    button(base, bx, hh + 470, "Portal login", sansb(16), None, WHITE, h=54, outline=(255, 255, 255))
    d = ImageDraw.Draw(base)
    for i in range(4):
        cx = 90 + i * 200
        txt(d, (cx, hh + 570), STATS[i][0], serifb(30), GOLD)
        txt(d, (cx, hh + 610), STATS[i][1].title(), sans(12), (156, 176, 200))
    for i, ph in enumerate(["hero-1.jpg", "library.jpg", "assembly.jpg", "classroom.jpg"]):
        x = 800 + (i % 2) * 322
        yy = hh + 70 + (i // 2) * 262
        photo_on(base, f"{A}/{ph}", (x, yy, 300, 240), radius=12, amount=0.3, colour=DARKER, border=(30, 60, 98))
    y = hh + hero_h
    d.rectangle([0, y, W, y + 4], fill=GOLD)
    d.rectangle([0, y + 4, W, y + 470], fill=DARKER)
    section_head(d, 90, y + 60, "Why families choose us", "Discipline, faith and measurable progress",
                 None, tcol=WHITE, bcol=(170, 190, 214), kcol=GOLD)
    cards = [("Faith & character", "Devotions, mentorship and service learning shape character alongside academics."),
             ("Academic rigour", "SBA and termly examinations weighted 80% / 20%, reported on official CBC reports."),
             ("Boarding & transport", "Four supervised houses and four bus routes across Nairobi.")]
    for i, (t1, t2) in enumerate(cards):
        x = 90 + i * 447
        rrect(d, [x, y + 210, x + 424, y + 420], 12, fill=NAVY2, outline=(30, 60, 98))
        txt(d, (x + 28, y + 244), t1, serifb(22), WHITE)
        para(d, x + 28, y + 290, t2, sans(14), (170, 190, 214), 360)
        txt(d, (x + 28, y + 380), "Read more →", sansb(13), GOLD)
    y += 470
    d.rectangle([0, y, W, y + 190], fill=NAVY2)
    d.rectangle([0, y, W, y + 3], fill=GOLD)
    for i, (v, l) in enumerate([("1 Sept", "Term 3 opens"), ("21 Oct", "Term closes"), ("5 Jan", "Next term opens"),
                                ("KES 44,000", "Junior School day fee"), ("KES 60,000", "Boarding fee")]):
        cx = 150 + i * 290
        txt(d, (cx, y + 66), v, serifb(26), WHITE, "mm")
        txt(d, (cx, y + 116), l, sans(13), (176, 196, 220), "mm")
    y += 190
    d.rectangle([0, y, W, y + 380], fill=NAVY)
    txt(d, (90, y + 40), "CAMPUS & SCHOOL LIFE", sansb(13), GOLD)
    for i, (ph, cap) in enumerate([("assembly.jpg", "Parade & co-curricular"), ("sports.jpg", "Games & PE"),
                                   ("community.jpg", "Service learning")]):
        x = 90 + i * 447
        photo_on(base, f"{A}/{ph}", (x, y + 80, 424, 190), radius=10, amount=0.42, colour=DARKER, border=(30, 60, 98))
        txt(d, (x, y + 290), cap, sansb(15), WHITE)
    footer(base, y + 380)
    return base

def design_7():
    base = Image.new("RGB", (W, H), WHITE)
    hh = header(base, dark=False)
    hero_h = 700
    base.paste(grad(W, hero_h, NAVY, BLUE, diagonal=True), (0, hh))
    d = ImageDraw.Draw(base)
    pill(base, 90, hh + 70, "ADMISSIONS OPEN · TERM 3 · 2026", sansb(13), WHITE, border=WHITE)
    txt(d, (90, hh + 150), "Join FAITH\nLEARNING\nCENTRE", serifb(44), WHITE)
    txt(d, (90, hh + 348), MOTTO, serif(19), GOLD_L)
    para(d, 90, hh + 392, "Competency-Based Curriculum from PP1 to Grade 9, day and boarding, four bus routes across Nairobi.", sans(16), (216, 228, 242), 620)
    for i, t in enumerate(["Limited boarding places — allocated on deposit",
                           "Reply from the admissions office within one working day",
                           "Fees payable by M-Pesa Paybill 522533"]):
        yy = hh + 460 + i * 34
        txt(d, (90, yy), "✓", sansb(17), GOLD)
        txt(d, (118, yy), t, sans(15), (224, 234, 246))
    for i, (v, l) in enumerate(STATS[:3]):
        x = 90 + i * 210
        txt(d, (x, hh + 590), v, serifb(28), WHITE)
        txt(d, (x, hh + 626), l.title(), sans(12), (170, 190, 214))
    # quick apply card
    rrect(d, [770, hh + 60, 1410, hh + 640], 14, fill=WHITE)
    d.rectangle([770, hh + 60, 1410, hh + 66], fill=GOLD)
    txt(d, (806, hh + 96), "Quick Apply", serifb(28), NAVY)
    txt(d, (806, hh + 142), "The admissions office responds within one working day.", sans(14), S500)
    fields = [("Parent / Guardian Name *", "Grace Mwangi"), ("Phone Number *", "+254 7XX XXX XXX"),
              ("Learner's Name", "Brian Otieno"), ("Grade of Interest", "Grade 7 (Junior School)")]
    for i, (lab, val) in enumerate(fields):
        yy = hh + 186 + i * 84
        txt(d, (806, yy), lab, sansb(13), S600)
        rrect(d, [806, yy + 22, 1374, yy + 68], 8, fill=WHITE, outline=S300)
        txt(d, (822, yy + 45), val, sans(15), INK if i < 2 else S400, "lm")
    rrect(d, [806, hh + 532, 826, hh + 552], 4, fill=WHITE, outline=S300)
    txt(d, (836, hh + 542), "I accept the School Terms & Conditions", sans(14), S600, "lm")
    rrect(d, [806, hh + 566, 1374, hh + 614], 10, fill=NAVY)
    txt(d, (1090, hh + 590), "Submit Enquiry", sansb(16), WHITE, "mm")
    y = hh + hero_h
    d.rectangle([0, y, W, y + 490], fill=S100)
    section_head(d, 90, y + 50, "School Fees", "Term fee structure by level", "Payable by Week 3 through M-Pesa Paybill 522533 (account FLC-ADMNO) or bank transfer.", maxw=1000)
    rows = [("Pre-Primary (PP1–PP2)", "KES 28,000", "KES 46,000"), ("Lower Primary (G1–G3)", "KES 34,000", "KES 52,000"),
            ("Upper Primary (G4–G6)", "KES 38,000", "KES 56,000"), ("Junior School (G7–G9)", "KES 44,000", "KES 60,000")]
    d.rectangle([90, y + 190, 1410, y + 238], fill=NAVY)
    for i, h in enumerate(["LEVEL GROUP", "DAY SCHOLAR", "BOARDING"]):
        txt(d, (114 + i * 440 + (0 if i == 0 else 320), y + 214), h, sansb(13), WHITE, "lm" if i == 0 else "rm")
    for i, (a, b, c) in enumerate(rows):
        yy = y + 238 + i * 46
        d.rectangle([90, yy, 1410, yy + 46], fill=WHITE if i % 2 == 0 else S100)
        txt(d, (114, yy + 23), a, sans(15), S700, "lm")
        txt(d, (970, yy + 23), b, sansb(15), NAVY, "rm")
        txt(d, (1386, yy + 23), c, sansb(15), GOLD_D, "rm")
    txt(d, (90, y + 444), "Transport billed per route (KES 12,000 – 18,000 per term). Refunds processed within 14 working days.", sans(13), S500)
    y2 = y + 490
    d.rectangle([0, y2, W, y2 + 420], fill=WHITE)
    txt(d, (90, y2 + 36), "ADMISSIONS", sansb(13), GOLD_D)
    for i, (n, t) in enumerate([("01", "Enquire & visit"), ("02", "Submit the application"),
                                ("03", "Assessment & interview"), ("04", "Offer, fees & joining")]):
        x = 90 + i * 340
        txt(d, (x, y2 + 70), n, serifb(28), GOLD)
        txt(d, (x, y2 + 112), t, sansb(16), NAVY)
        para(d, x, y2 + 142, "Bring the birth certificate, NEMIS UPI and last report card.", sans(13), S500, 300)
    d.line([(90, y2 + 216), (1410, y2 + 216)], fill=S200, width=1)
    txt(d, (90, y2 + 238), "WHAT TO BRING", sansb(13), GOLD_D)
    for i, t in enumerate(["Birth certificate & NEMIS UPI", "Latest school report card", "Transfer or leaving certificate",
                           "Immunisation / clinic card", "Passport photographs (2)", "Parent / guardian ID copies",
                           "Boarding deposit (boarders)", "Assessment fee receipt"]):
        x = 90 + (i % 4) * 340
        yy = y2 + 274 + (i // 4) * 40
        txt(d, (x, yy), "✓", sansb(15), GREEN)
        txt(d, (x + 26, yy), t, sans(14), S600)
    rrect(d, [90, y2 + 356, 1410, y2 + 404], 10, fill=S50, outline=S200)
    txt(d, (114, y2 + 380), "Admission is confirmed only upon acceptance of the School Terms & Conditions.", sans(14), S600, "lm")
    y3 = y2 + 420
    d.rectangle([0, y3, W, y3 + 66], fill=NAVY)
    d.rectangle([0, y3, W, y3 + 4], fill=GOLD)
    txt(d, (90, y3 + 35), "Admissions open — limited boarding places", sansb(17), WHITE, "lm")
    button(base, 1180, y3 + 12, "Apply now", sansb(15), GOLD, WHITE, h=42)
    footer(base, y3 + 66)
    return base

DESIGNS = [
    ("1", "Classic Heritage", design_1),
    ("2", "Split Panel", design_2),
    ("3", "Editorial Broadsheet", design_3),
    ("4", "Minimal Corporate", design_4),
    ("5", "Bento Mosaic", design_5),
    ("6", "Premium Dark", design_6),
    ("7", "Admissions Focused", design_7),
]

if __name__ == "__main__":
    os.makedirs(OUT, exist_ok=True)
    for num, name, fn in DESIGNS:
        img = fn().resize((W, H), Image.LANCZOS)
        path = f"{OUT}/design-{num}.jpg"
        img.save(path, "JPEG", quality=88, optimize=True)
        print(f"  design {num}  {name:24s} -> {path}  ({os.path.getsize(path)//1024} KB)")
    print("done")
