#!/usr/bin/env python3
"""Third pass: Commons categories for well-resourced schools, plus precise activity terms."""
import json
import re
import urllib.parse
import urllib.request

API = "https://commons.wikimedia.org/w/api.php"
UA = "FaithLearningCentre-media-register/1.0 (school website; contact: info@faithlearningcentre.ac.ke)"
GOOD = ("cc by", "cc0", "public domain", "attribution")

CATEGORIES = [
    "Category:African Leadership Academy",
    "Category:Schools in South Africa",
    "Category:High schools in South Africa",
    "Category:Schools in Rwanda",
    "Category:Schools in Ghana",
    "Category:Schools in Nairobi",
    "Category:Boarding schools in Kenya",
    "Category:School buildings in Kenya",
    "Category:Classrooms in Africa",
    "Category:School libraries in Africa",
    "Category:Students in Africa",
]

QUERIES = [
    "school computer laboratory students Africa",
    "science laboratory secondary school students",
    "school library reading students shelves",
    "students dining hall meal trays school",
    "school assembly students uniform hall",
    "graduation ceremony students gowns Africa",
    "students group discussion table school",
    "school netball court students",
    "school swimming pool students",
    "modern school building Kenya Nairobi",
    "international school campus Africa buildings",
    "students chapel service school",
]


def api(p):
    p.update({"format": "json", "formatversion": "2"})
    req = urllib.request.Request(API + "?" + urllib.parse.urlencode(p), headers={"User-Agent": UA})
    return json.load(urllib.request.urlopen(req, timeout=60))


def strip(s):
    return re.sub(r"<[^>]+>", "", s or "").strip()


def members(cat, limit=150):
    out, cont = [], None
    while len(out) < limit:
        p = {"action": "query", "list": "categorymembers", "cmtitle": cat, "cmlimit": "100", "cmtype": "file"}
        if cont:
            p["cmcontinue"] = cont
        d = api(p)
        out += [m["title"] for m in d.get("query", {}).get("categorymembers", [])]
        cont = d.get("continue", {}).get("cmcontinue")
        if not cont:
            break
    return out


def search(term, limit=12):
    d = api({"action": "query", "list": "search", "srsearch": term, "srnamespace": "6", "srlimit": str(limit)})
    return [h["title"] for h in d.get("query", {}).get("search", [])]


def describe(titles, label):
    print("\n=== " + label + " ===")
    for i in range(0, len(titles), 20):
        d = api({"action": "query", "prop": "imageinfo", "iiprop": "url|size|mime|extmetadata|user",
                 "titles": "|".join(titles[i:i + 20])})
        for page in d.get("query", {}).get("pages", []):
            if page.get("missing"):
                continue
            ii = (page.get("imageinfo") or [{}])[0]
            em = ii.get("extmetadata", {})
            lic = strip(em.get("LicenseShortName", {}).get("value"))
            if ii.get("mime") != "image/jpeg" or (ii.get("width") or 0) < 1500:
                continue
            if not any(g in lic.lower() for g in GOOD):
                continue
            low = page["title"].lower()
            if any(bad in low for bad in ("logo", "map", "coat of arms", "flag", "diagram", "chart", "1905", "1940", "1960", "sign", "plaque")):
                continue
            print("  %-66s %5sx%-5s %-13s %s" % (page["title"][:66], ii.get("width"), ii.get("height"), lic[:13],
                                                 strip(em.get("ImageDescription", {}).get("value"))[:58]))


for cat in CATEGORIES:
    try:
        describe(members(cat), cat.replace("Category:", "CAT "))
    except Exception as e:
        print("\n=== " + cat + " === (failed: " + str(e) + ")")

for q in QUERIES:
    describe(search(q), "SEARCH: " + q)
