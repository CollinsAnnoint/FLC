#!/usr/bin/env python3
"""Find openly licensed photographs on Wikimedia Commons for the school's new gallery.

Search only — prints the candidates with their licence, size and author so a human
can pick. Nothing is downloaded here.
"""
import json
import re
import urllib.parse
import urllib.request

API = "https://commons.wikimedia.org/w/api.php"
UA = "FaithLearningCentre-media-register/1.0 (school website; contact: info@faithlearningcentre.ac.ke)"

SEARCHES = {
    "learning":   ["students classroom lesson Kenya", "pupils writing classroom Tanzania", "school children learning Uganda"],
    "eating":     ["school feeding programme children", "children eating lunch school Kenya", "school meals students Africa"],
    "playing":    ["children playing football Kenya", "school sports day pupils Africa", "students games field school"],
    "praying":    ["school assembly prayer Kenya", "church service children Africa", "pupils praying school"],
    "parading":   ["school parade Kenya", "scouts parade school Uganda", "marching band students Africa"],
    "awarding":   ["prize giving day school Kenya", "graduation primary school Africa", "award ceremony students school"],
    "discussion": ["students group discussion classroom", "pupils group work school Africa", "learners discussion group school"],
}

GOOD_LICENCES = ("cc by", "cc0", "public domain", "cc by-sa", "attribution")


def api(params):
    params["format"] = "json"
    params["formatversion"] = "2"
    url = API + "?" + urllib.parse.urlencode(params)
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    with urllib.request.urlopen(req, timeout=60) as r:
        return json.load(r)


def strip_html(s):
    return re.sub(r"<[^>]+>", "", s or "").strip()


def search(term, limit=12):
    data = api({
        "action": "query", "list": "search", "srsearch": term,
        "srnamespace": "6", "srlimit": str(limit)
    })
    return [h["title"] for h in data.get("query", {}).get("search", [])]


def info(titles):
    out = {}
    for i in range(0, len(titles), 20):
        data = api({
            "action": "query", "prop": "imageinfo", "iiprop": "url|size|mime|extmetadata|user",
            "titles": "|".join(titles[i:i + 20])
        })
        for page in data.get("query", {}).get("pages", []):
            if page.get("missing"):
                continue
            ii = (page.get("imageinfo") or [{}])[0]
            em = ii.get("extmetadata", {})
            out[page["title"]] = {
                "url": ii.get("url"),
                "w": ii.get("width"), "h": ii.get("height"),
                "mime": ii.get("mime"),
                "licence": strip_html(em.get("LicenseShortName", {}).get("value")),
                "usage": strip_html(em.get("UsageTerms", {}).get("value")),
                "artist": strip_html(em.get("Artist", {}).get("value"))[:60],
                "uploader": ii.get("user"),
                "page": "https://commons.wikimedia.org/wiki/" + page["title"].replace(" ", "_"),
            }
    return out


seen = set()
for category, terms in SEARCHES.items():
    titles = []
    for term in terms:
        for t in search(term):
            if t not in titles:
                titles.append(t)
    meta = info(titles)
    print("\n=== " + category.upper() + " ===")
    for title, m in meta.items():
        if not m["mime"] or "jpeg" not in m["mime"]:
            continue
        if (m["w"] or 0) < 1000:
            continue
        lic = (m["licence"] + " " + m["usage"]).lower()
        if not any(g in lic for g in GOOD_LICENCES):
            continue
        if any(bad in title.lower() for bad in ("logo", "map", "coat of arms", "flag", "diagram", "chart")):
            continue
        key = title
        if key in seen:
            continue
        seen.add(key)
        print("  %-58s %sx%s  %-22s  %s" % (title[:58], m["w"], m["h"], m["licence"], m["artist"][:38]))
