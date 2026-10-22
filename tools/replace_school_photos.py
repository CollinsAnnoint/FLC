#!/usr/bin/env python3
"""Replace the ten school-life photographs with scenes from well-developed school
environments — modern campuses, equipped classrooms, courts, a chapel, a dining hall.

Every file is licence-checked through the Commons API at download time, resized for
the web, and recorded in tools/new-photos-licences.json for the media register.
"""
import io
import json
import os
import re
import time
import urllib.parse
import urllib.request

from PIL import Image

os.chdir("/home/user")
API = "https://commons.wikimedia.org/w/api.php"
UA = "FaithLearningCentre-media-register/1.0 (school website; contact: info@faithlearningcentre.ac.ke)"
ASSETS = "public/assets"

# local file  <-  (Commons title, caption shown on the website, gallery group)
PLAN = [
    ("students-learning-1.jpg", "File:Ghanaian Senior High School students in class 02.jpg",
     "A lesson under way in a Senior High classroom", "Learning"),
    ("students-learning-2.jpg", "File:Student in a class.jpg",
     "Focused work at the desks", "Learning"),
    ("students-discussion.jpg", "File:Little Stars Academy Female students2.jpg",
     "Learners working through a task together", "Group discussion"),
    ("students-eating.jpg", "File:Students at Sinenjongo High school at lunch.jpeg",
     "Lunch on the school timetable", "Eating together"),
    ("students-playing-1.jpg", "File:Jeppe Girls netball 1.jpg",
     "Games afternoon — netball on the court", "Playing"),
    ("students-playing-2.jpg", "File:Girl Nyakasura School exploring the fun in basketball.jpg",
     "Basketball practice after class", "Playing"),
    ("students-praying.jpg", "File:Chapel Holy Family College.jpg",
     "The school chapel", "Prayer"),
    ("students-parading.jpg", "File:AHS Scouts.jpg",
     "The scout troop on parade at a school event", "Parading"),
    ("students-award-1.jpg", "File:Prempeh College National Science and Maths Quiz Team.jpg",
     "A winning team with the trophy and certificates", "Awarding"),
    ("students-award-2.jpg", "File:School prize giving day.jpg",
     "The prize table on awards day", "Awarding")
]

GOOD = ("cc by", "cc0", "public domain", "attribution")


def strip_html(s):
    return re.sub(r"<[^>]+>", "", s or "").strip()


def api(params):
    params.update({"format": "json", "formatversion": "2"})
    req = urllib.request.Request(API + "?" + urllib.parse.urlencode(params), headers={"User-Agent": UA})
    return json.load(urllib.request.urlopen(req, timeout=60))


def web_image(raw, width=1600, quality=82):
    im = Image.open(io.BytesIO(raw)).convert("RGB")
    if im.width > width:
        im = im.resize((width, round(im.height * width / im.width)), Image.LANCZOS)
    out = io.BytesIO()
    im.save(out, "JPEG", quality=quality, optimize=True, progressive=True)
    return out.getvalue(), im.size


record = []
for local, title, caption, group in PLAN:
    data = api({"action": "query", "prop": "imageinfo",
                "iiprop": "url|size|mime|extmetadata|user", "titles": title})
    page = (data.get("query", {}).get("pages") or [{}])[0]
    ii = (page.get("imageinfo") or [{}])[0]
    em = ii.get("extmetadata", {})
    licence = strip_html(em.get("LicenseShortName", {}).get("value"))
    usage = strip_html(em.get("UsageTerms", {}).get("value"))
    if page.get("missing") or not ii.get("url"):
        print("MISSING:", title)
        continue
    if not any(g in (licence + " " + usage).lower() for g in GOOD):
        print("NOT OPENLY LICENSED:", title, licence)
        continue
    if "jpeg" not in (ii.get("mime") or "") or (ii.get("width") or 0) < 1500:
        print("UNSUITABLE:", title, ii.get("mime"), ii.get("width"))
        continue
    raw = urllib.request.urlopen(urllib.request.Request(ii["url"], headers={"User-Agent": UA}), timeout=120).read()
    web, size = web_image(raw)
    with open(os.path.join(ASSETS, local), "wb") as fh:
        fh.write(web)
    record.append({
        "local": local, "commons": title, "title": title.replace("File:", ""),
        "page": "https://commons.wikimedia.org/wiki/" + title.replace(" ", "_"),
        "licence": licence, "usageTerms": usage,
        "author": strip_html(em.get("Artist", {}).get("value")) or ii.get("user"),
        "description": strip_html(em.get("ImageDescription", {}).get("value"))[:200],
        "originalSize": "%sx%s" % (ii.get("width"), ii.get("height")),
        "webSize": "%sx%s" % size,
        "caption": caption, "group": group
    })
    print("installed %-26s %-14s %s" % (local, licence, caption))
    time.sleep(2.2)     # the Commons API asks for a slow, identified client

with open("tools/new-photos-licences.json", "w", encoding="utf-8") as fh:
    json.dump(record, fh, indent=2, ensure_ascii=False)
print("\nreplaced:", len(record), "of", len(PLAN))

# the old parading file is no longer referenced anywhere
stale = os.path.join(ASSETS, "students-parading-2.jpg")
if os.path.exists(stale) and not any(r["local"] == "students-parading-2.jpg" for r in record):
    os.remove(stale)
    print("removed the unused students-parading-2.jpg")
