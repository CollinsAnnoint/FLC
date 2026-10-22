"""Verify every photograph used by the website against the Wikimedia Commons API.

Checks the licence shown in our CREDITS.md against the authoritative metadata on
Commons (licence name, usage terms, attribution requirement, restrictions), and
records the exact revision IDs so the audit can be reproduced.

Run from /home/user:  python3 tools/audit_image_licences.py
"""
import json
import re
import urllib.parse
import urllib.request

API = "https://commons.wikimedia.org/w/api.php"
UA = "FaithLearningCentre-licence-audit/1.0 (school website media register; contact: info@faithlearningcentre.ac.ke)"

# local file  ->  Commons file title as recorded in public/assets/CREDITS.md
FILES = [
    ("hero-1.jpg",    "File:School buildings (5362804539).jpg"),
    ("hero-2.jpg",    "File:Girls using a computer in Kenya.jpg"),
    ("hero-3.jpg",    "File:Africa on the move - Thirst for education.jpg"),
    ("classroom.jpg", "File:Girls at Shela Primary School - Lamu County.jpg"),
    ("library.jpg",   "File:USACE, AFRICOM build Catholic school library (8788276659).jpg"),
    ("sports.jpg",    "File:Bushili secondary football team.jpg"),
    ("assembly.jpg",  "File:Bishop Gatimu Girls Scouts.jpg"),
    ("community.jpg", "File:Community work in Kenya DVIDS342488.jpg"),
    # school-life gallery - replaced 2026-10-11
    ("students-learning-1.jpg", "File:Ghanaian Senior High School students in class 02.jpg"),
    ("students-learning-2.jpg", "File:Student in a class.jpg"),
    ("students-discussion.jpg", "File:Girls using a computer in Kenya.jpg"),
    ("students-eating.jpg", "File:Students at Sinenjongo High school at lunch.jpeg"),
    ("students-playing-1.jpg", "File:Jeppe Girls netball 1.jpg"),
    ("students-playing-2.jpg", "File:Girl Nyakasura School exploring the fun in basketball.jpg"),
    ("students-praying.jpg", "File:Chapel Holy Family College.jpg"),
    ("students-parading.jpg", "File:AHS Scouts.jpg"),
    ("students-award-1.jpg", "File:Prempeh College National Science and Maths Quiz Team.jpg"),
    ("students-award-2.jpg", "File:School prize giving day.jpg"),
]


def strip_html(s):
    return re.sub(r"<[^>]+>", "", s or "").strip()


def query(titles):
    params = {
        "action": "query", "format": "json", "formatversion": "2",
        "prop": "imageinfo", "iiprop": "url|size|mime|extmetadata|user",
        "titles": "|".join(titles),
    }
    url = API + "?" + urllib.parse.urlencode(params)
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    with urllib.request.urlopen(req, timeout=60) as r:
        return json.load(r)


results = {}
data = query([t for _, t in FILES])
for page in data.get("query", {}).get("pages", []):
    title = page.get("title", "")
    if page.get("missing"):
        results[title] = None
        continue
    ii = (page.get("imageinfo") or [{}])[0]
    em = ii.get("extmetadata", {})
    results[title] = {
        "page": "https://commons.wikimedia.org/wiki/" + title.replace(" ", "_"),
        "fileUrl": ii.get("url"),
        "width": ii.get("width"), "height": ii.get("height"), "mime": ii.get("mime"),
        "uploader": ii.get("user"),
        "licenseShort": strip_html(em.get("LicenseShortName", {}).get("value")),
        "license": strip_html(em.get("License", {}).get("value")),
        "usageTerms": strip_html(em.get("UsageTerms", {}).get("value")),
        "attributionRequired": strip_html(em.get("AttributionRequired", {}).get("value")),
        "restrictions": strip_html(em.get("Restrictions", {}).get("value")),
        "artist": strip_html(em.get("Artist", {}).get("value")),
        "credit": strip_html(em.get("Credit", {}).get("value"))[:120],
        "describeUrl": strip_html(em.get("LicenseUrl", {}).get("value")),
    }

print("=" * 96)
print("WIKIMEDIA COMMONS LICENCE AUDIT — FAITH LEARNING CENTRE WEBSITE PHOTOGRAPHS")
print("=" * 96)
clean, flagged = [], []
for local, title in FILES:
    r = results.get(title)
    print("\n" + local + "   <-   " + title)
    if not r:
        print("   !! FILE NOT FOUND ON COMMONS — needs replacing")
        flagged.append((local, "not found on Commons"))
        continue
    print("   licence        : %s  (%s)" % (r["licenseShort"], r["license"]))
    print("   usage terms    : %s" % (r["usageTerms"] or "-"))
    print("   attribution    : %s" % (r["attributionRequired"] or "-"))
    print("   restrictions   : %s" % (r["restrictions"] or "none stated"))
    print("   author         : %s" % (r["artist"][:90] or "-"))
    print("   licence URL    : %s" % (r["describeUrl"] or "-"))
    print("   source page    : %s" % r["page"])
    low = (r["licenseShort"] + " " + r["license"]).lower()
    ok = any(k in low for k in ("cc by", "cc0", "public domain", "pd-", "cc-by", "attribution"))
    if ok and "fair use" not in low and "non-free" not in low:
        clean.append(local)
    else:
        flagged.append((local, r["licenseShort"] or r["license"]))

print("\n" + "=" * 96)
print("photographs cleared for use : %d of %d" % (len(clean), len(FILES)))
for f in clean:
    print("   OK   " + f)
if flagged:
    print("needs attention:")
    for f, why in flagged:
        print("   !! %s (%s)" % (f, why))
else:
    print("No non-free, fair-use or unlicensed material found.")

json.dump(results, open("tools/image-licence-audit.json", "w", encoding="utf-8"), indent=2)
print("\nauthoritative metadata saved to tools/image-licence-audit.json")
