#!/usr/bin/env python3
"""Second pass: refined searches plus Commons category members, East African school life."""
import json
import re
import urllib.parse
import urllib.request

API = "https://commons.wikimedia.org/w/api.php"
UA = "FaithLearningCentre-media-register/1.0 (school website; contact: info@faithlearningcentre.ac.ke)"
GOOD = ("cc by", "cc0", "public domain", "attribution")

SEARCHES = {
    "learning":   ["pupils classroom Kenya", "students in class African school", "education Kenya classroom children",
                   "school children classroom Uganda", "learner classroom Tanzania"],
    "eating":     ["school lunch Kenya children", "porridge school feeding Kenya", "school meals Uganda children",
                   "children eating school Africa"],
    "playing":    ["children playing Kenya", "netball school Africa", "football children Kenya village",
                   "school games children Uganda", "skipping game children Africa"],
    "praying":    ["church service Kenya children", "school assembly Kenya pupils", "prayer meeting Africa children",
                   "Sunday school Kenya", "chapel service school Africa"],
    "parading":   ["Kenya Scouts", "scouts parade Africa", "march past school Kenya", "Independence parade Kenya",
                   "school band parade Kenya", "girl guides Kenya"],
    "awarding":   ["prize giving Kenya school", "graduation ceremony Kenya school", "trophy awarded pupils Africa",
                   "certificate pupils Kenya", "KCSE results celebration school"],
    "discussion": ["group discussion students Africa", "pupils group work Kenya", "students talking classroom Africa",
                   "debate students Kenya school", "learners in groups school"],
}

CATEGORIES = [
    "Category:Education in Kenya",
    "Category:Schools in Kenya",
    "Category:Children of Kenya",
    "Category:Primary schools in Kenya",
]


def api(params):
    params.update({"format": "json", "formatversion": "2"})
    url = API + "?" + urllib.parse.urlencode(params)
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    with urllib.request.urlopen(req, timeout=60) as r:
        return json.load(r)


def strip_html(s):
    return re.sub(r"<[^>]+>", "", s or "").strip()


def search(term, limit=15):
    d = api({"action": "query", "list": "search", "srsearch": term, "srnamespace": "6", "srlimit": str(limit)})
    return [h["title"] for h in d.get("query", {}).get("search", [])]


def category_members(cat, limit=120):
    out, cont = [], None
    while len(out) < limit:
        p = {"action": "query", "list": "categorymembers", "cmtitle": cat, "cmlimit": "50", "cmtype": "file"}
        if cont:
            p["cmcontinue"] = cont
        d = api(p)
        out += [m["title"] for m in d.get("query", {}).get("categorymembers", [])]
        cont = d.get("continue", {}).get("cmcontinue")
        if not cont:
            break
    return out


def info(titles):
    out = {}
    for i in range(0, len(titles), 20):
        d = api({"action": "query", "prop": "imageinfo", "iiprop": "url|size|mime|extmetadata|user",
                 "titles": "|".join(titles[i:i + 20])})
        for page in d.get("query", {}).get("pages", []):
            if page.get("missing"):
                continue
            ii = (page.get("imageinfo") or [{}])[0]
            em = ii.get("extmetadata", {})
            out[page["title"]] = {
                "url": ii.get("url"), "w": ii.get("width"), "h": ii.get("height"), "mime": ii.get("mime"),
                "licence": strip_html(em.get("LicenseShortName", {}).get("value")),
                "usage": strip_html(em.get("UsageTerms", {}).get("value")),
                "artist": strip_html(em.get("Artist", {}).get("value"))[:50],
                "desc": strip_html(em.get("ImageDescription", {}).get("value"))[:90],
            }
    return out


def usable(title, m):
    if not m["mime"] or "jpeg" not in m["mime"]:
        return False
    if (m["w"] or 0) < 1000:
        return False
    if not any(g in (m["licence"] + " " + m["usage"]).lower() for g in GOOD):
        return False
    low = title.lower()
    return not any(bad in low for bad in ("logo", "map", "coat of arms", "flag", "diagram", "chart", "poster", "stamp"))


for category, terms in SEARCHES.items():
    titles = []
    for t in terms:
        for hit in search(t):
            if hit not in titles:
                titles.append(hit)
    meta = info(titles)
    print("\n=== " + category.upper() + " ===")
    for title, m in meta.items():
        if usable(title, m):
            print("  %-62s %5sx%-5s %-16s %s" % (title[:62], m["w"], m["h"], m["licence"][:16], m["desc"][:70]))

print("\n=== CATEGORY MEMBERS ===")
for cat in CATEGORIES:
    members = category_members(cat)
    meta = info(members)
    print("\n-- " + cat + " (" + str(len(members)) + " files) --")
    for title, m in meta.items():
        if usable(title, m):
            print("  %-62s %5sx%-5s %-16s %s" % (title[:62], m["w"], m["h"], m["licence"][:16], m["desc"][:70]))
