#!/usr/bin/env python3
"""Search Wikimedia Commons for school-life photographs in modern, well-equipped settings."""
import json
import re
import urllib.parse
import urllib.request

API = "https://commons.wikimedia.org/w/api.php"
UA = "FaithLearningCentre-media-register/1.0 (school website; contact: info@faithlearningcentre.ac.ke)"

QUERIES = {
    "modern campus": ["modern school building Africa", "new school building Kenya", "school campus modern architecture Africa",
                      "secondary school Kenya buildings", "school block modern Tanzania", "academy campus Rwanda"],
    "classroom": ["computer lab school Kenya", "modern classroom Africa computers", "science laboratory school Kenya",
                  "well equipped classroom Africa", "students computer laboratory school"],
    "library": ["school library Kenya modern", "library students Africa modern", "reading room school library Africa"],
    "dining": ["school dining hall Africa", "cafeteria students Africa school", "school canteen modern Africa"],
    "sports": ["school sports field modern Africa", "athletics track school Africa", "rugby school South Africa",
               "swimming school Africa", "basketball court school Africa"],
    "assembly / parade": ["school assembly hall Africa", "students assembly modern school Africa", "school parade Kenya modern"],
    "awards": ["graduation ceremony school Africa modern", "prize giving school Africa", "certificate ceremony students Africa"],
    "group work": ["students group work modern classroom Africa", "study group students Africa school", "peer learning students Africa"],
    "campus wide": ["university campus Kenya modern", "school grounds Africa modern", "education campus Nairobi"],
}
GOOD = ("cc by", "cc0", "public domain", "attribution")


def api(p):
    p.update({"format": "json", "formatversion": "2"})
    req = urllib.request.Request(API + "?" + urllib.parse.urlencode(p), headers={"User-Agent": UA})
    return json.load(urllib.request.urlopen(req, timeout=60))


def strip(s):
    return re.sub(r"<[^>]+>", "", s or "").strip()


def search(term, limit=14):
    d = api({"action": "query", "list": "search", "srsearch": term, "srnamespace": "6", "srlimit": str(limit)})
    return [h["title"] for h in d.get("query", {}).get("search", [])]


seen = set()
for group, terms in QUERIES.items():
    titles = []
    for t in terms:
        for hit in search(t):
            if hit not in titles:
                titles.append(hit)
    print("\n=== " + group.upper() + " ===")
    for i in range(0, len(titles), 20):
        d = api({"action": "query", "prop": "imageinfo", "iiprop": "url|size|mime|extmetadata|user",
                 "titles": "|".join(titles[i:i + 20])})
        for page in d.get("query", {}).get("pages", []):
            if page.get("missing"):
                continue
            title = page["title"]
            if title in seen:
                continue
            ii = (page.get("imageinfo") or [{}])[0]
            em = ii.get("extmetadata", {})
            lic = strip(em.get("LicenseShortName", {}).get("value"))
            if ii.get("mime") != "image/jpeg" or (ii.get("width") or 0) < 1600:
                continue
            if not any(g in lic.lower() for g in GOOD):
                continue
            low = title.lower()
            if any(bad in low for bad in ("logo", "map", "coat of arms", "flag", "diagram", "chart", "1905", "1940", "1960", "19th")):
                continue
            seen.add(title)
            print("  %-64s %5sx%-5s %-14s %s" % (title[:64], ii.get("width"), ii.get("height"), lic[:14],
                                                 strip(em.get("ImageDescription", {}).get("value"))[:60]))
