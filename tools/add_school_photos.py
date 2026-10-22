#!/usr/bin/env python3
"""Download the ten new school-life photographs from Wikimedia Commons.

Every file is checked against the Commons API (licence, size, mime) before it is
saved, resized for the web, stripped of metadata and written into public/assets/.
The licence record is written to tools/new-photos-licences.json for the register.
"""
import io
import json
import os
import re
import urllib.parse
import urllib.request

from PIL import Image

os.chdir("/home/user")
API = "https://commons.wikimedia.org/w/api.php"
UA = "FaithLearningCentre-media-register/1.0 (school website; contact: info@faithlearningcentre.ac.ke)"
ASSETS = "public/assets"

# local name -> (Commons title, the caption the website shows)
PLAN = [
    ("students-learning-1.jpg", "File:Ghanaian Senior High School students in class 01.jpg",
     "A lesson under way — learners at their desks"),
    ("students-learning-2.jpg", "File:Students learning in class together.jpg",
     "Two learners working through a task together"),
    ("students-discussion.jpg", "File:Nahadah Islamic School students asking questions in class.jpg",
     "Question time — the class in discussion"),
    ("students-eating.jpg", "File:Meals in primary school.jpg",
     "The school feeding programme — lunch is served"),
    ("students-playing.jpg", "File:Oxfam East Africa - Children playing in Kulaley.jpg",
     "Games on the field"),
    ("students-praying.jpg", "File:Nyota, Kenya 01.jpg",
     "Grace before a meal"),
    ("students-parading.jpg", "File:AHS Scouts.jpg",
     "The scout troop on parade at a school event"),
    ("students-parading-2.jpg", "File:DEGAN Gabin ( Scout children).jpg",
     "Scout children on parade"),
    ("students-award-1.jpg", "File:Sungura Scouts Award Ceremony.JPG",
     "A badge and certificate presented at the award ceremony"),
    ("students-award-2.jpg", "File:2025 Primary School Graduation Ceremony.jpg",
     "Graduation day — certificates for the leavers"),
]

GOOD = ("cc by", "cc0", "public domain", "attribution")


def strip_html(s):
    return re.sub(r"<[^>]+>", "", s or "").strip()


def api(params):
    params.update({"format": "json", "formatversion": "2"})
    url = API + "?" + urllib.parse.urlencode(params)
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    with urllib.request.urlopen(req, timeout=60) as r:
        return json.load(r)


def web_image(raw, target_width=1600, quality=82):
    im = Image.open(io.BytesIO(raw))
    im = im.convert("RGB")
    if im.width > target_width:
        im = im.resize((target_width, round(im.height * target_width / im.width)), Image.LANCZOS)
    out = io.BytesIO()
    im.save(out, "JPEG", quality=quality, optimize=True, progressive=True)
    return out.getvalue(), im.size


record = []
for local, title, caption in PLAN:
    data = api({"action": "query", "prop": "imageinfo", "iiprop": "url|size|mime|extmetadata|user", "titles": title})
    page = (data.get("query", {}).get("pages") or [{}])[0]
    if page.get("missing"):
        print("MISSING:", title)
        continue
    ii = (page.get("imageinfo") or [{}])[0]
    em = ii.get("extmetadata", {})
    licence = strip_html(em.get("LicenseShortName", {}).get("value"))
    usage = strip_html(em.get("UsageTerms", {}).get("value"))
    if not any(g in (licence + " " + usage).lower() for g in GOOD):
        print("NOT OPENLY LICENSED:", title, licence)
        continue
    if "jpeg" not in (ii.get("mime") or ""):
        print("NOT A PHOTOGRAPH:", title, ii.get("mime"))
        continue
    req = urllib.request.Request(ii["url"], headers={"User-Agent": UA})
    raw = urllib.request.urlopen(req, timeout=120).read()
    web, size = web_image(raw)
    with open(os.path.join(ASSETS, local), "wb") as fh:
        fh.write(web)
    record.append({
        "local": local,
        "commons": title,
        "page": "https://commons.wikimedia.org/wiki/" + title.replace(" ", "_"),
        "licence": licence,
        "usageTerms": usage,
        "author": strip_html(em.get("Artist", {}).get("value")) or ii.get("user"),
        "description": strip_html(em.get("ImageDescription", {}).get("value"))[:200],
        "originalSize": "%sx%s" % (ii.get("width"), ii.get("height")),
        "webSize": "%sx%s" % size,
        "caption": caption,
    })
    print("saved %-28s %-14s %s" % (local, licence, caption))

with open("tools/new-photos-licences.json", "w", encoding="utf-8") as fh:
    json.dump(record, fh, indent=2, ensure_ascii=False)
print("\nphotographs saved:", len(record), "of", len(PLAN))
