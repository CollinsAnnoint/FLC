# Image Licence Audit — FAITH LEARNING CENTRE website

**Audit date:** 11 October 2026 · **Audited by:** automated check against the Wikimedia Commons API
**Verdict: all 8 photographs on the website are openly licensed and cleared for commercial use. No pirated,
watermarked, stock-library or AI-generated imagery is used anywhere in the system.**

Each file below was re-checked live against the authoritative licence metadata on Wikimedia Commons
(not just against our own credits file). Every entry has: no "fair use" or "non-free" flag, no usage
restriction recorded, and a licence that permits commercial use.

---

## 1. Photograph register

| File | Subject | Author / credit line | Licence | Attribution required | Source |
|---|---|---|---|---|---|
| `hero-1.jpg` | School classroom blocks and grounds | Flickr contributor, via Wikimedia Commons | **CC BY 2.0** | Yes | [Commons](https://commons.wikimedia.org/wiki/File:School_buildings_(5362804539).jpg) |
| `hero-2.jpg` | Girls working in a school ICT laboratory, Kenya | Queen Asali | **CC BY-SA 4.0** | Yes | [Commons](https://commons.wikimedia.org/wiki/File:Girls_using_a_computer_in_Kenya.jpg) |
| `hero-3.jpg` | Learners walking to school, Kenya | Joseph | **CC BY-SA 4.0** | Yes | [Commons](https://commons.wikimedia.org/wiki/File:Africa_on_the_move_-_Thirst_for_education.jpg) |
| `classroom.jpg` | Learners at computers, Shela Primary School, Lamu County | Queen Asali | **CC BY-SA 4.0** | Yes | [Commons](https://commons.wikimedia.org/wiki/File:Girls_at_Shela_Primary_School_-_Lamu_County.jpg) |
| `library.jpg` | School library reading session, Kenya | U.S. Army Corps of Engineers Europe District | **Public domain** | No (we credit anyway) | [Commons](https://commons.wikimedia.org/wiki/File:USACE,_AFRICOM_build_Catholic_school_library_(8788276659).jpg) |
| `sports.jpg` | Secondary school football team, Kenya | Wyckie | **CC BY-SA 4.0** | Yes | [Commons](https://commons.wikimedia.org/wiki/File:Bushili_secondary_football_team.jpg) |
| `assembly.jpg` | School scouts parade, Nyeri County | Queen Asali | **CC BY-SA 4.0** | Yes | [Commons](https://commons.wikimedia.org/wiki/File:Bishop_Gatimu_Girls_Scouts.jpg) |
| `community.jpg` | Community service learning in a Kenyan classroom | Petty Officer 2nd Class Nathan Laird, US Navy | **Public domain** | No (we credit anyway) | [Commons](https://commons.wikimedia.org/wiki/File:Community_work_in_Kenya_DVIDS342488.jpg) |

Raw metadata as returned by the Commons API is archived in `tools/image-licence-audit.json`.

## 2. What the licences allow

- **CC BY 2.0 / CC BY-SA 4.0** permit commercial use, modification and redistribution, provided the author is
  credited and the licence is named.
- **CC BY-SA** adds a share-alike condition: adaptations of *that photograph* (including our resized/re-encoded
  copies) stay under the same licence. This affects the photo files only — it does **not** put the school's
  website code, text or branding under CC BY-SA.
- **Public domain** images carry no conditions at all.
- None of the eight images is marked "non-free", "fair use", "editorial use only", or subject to a recorded
  usage restriction of any kind.

## 3. How the school is complying (already in place)

1. **Attribution is published** — the footer of the public website carries a photography credit line, and
   `/assets/CREDITS.md` inside the delivered system is the media register listing author, licence and source
   for every file.
2. **Licence names are stated** with each image in that register, with links to the Commons source pages.
3. **No watermark or rights-management information** has been removed: files are only resized and re-compressed
   for web delivery, which the licences expressly allow.
4. **No third-party logos, crests or trademarks** appear in any image we serve.

## 4. Two separate points to be aware of (not copyright)

**(a) People in the photographs — consent and privacy.**
A Creative Commons licence covers the *photographer's* copyright. It does not grant the right to use a
recognisable person's image for promotion. Several of these photographs show identifiable learners. Under the
**Data Protection Act, 2019**, publishing identifiable images of individuals for school promotion is processing
personal data, and images of minors warrant particular care. Options, in order of strength:

- Replace the photographs that show clear faces with the building/grounds/classroom-in-progress shots
  (`hero-1.jpg`, `library.jpg`, `community.jpg`) — a two-minute swap, same file names.
- Get written consent from the schools/parents whose learners appear (the Commons pages name the schools).
- Keep them but publish a short take-down policy and honour any request to remove an image promptly.

Recommended: use the current set as launch imagery, and switch to the school's **own** photographs as soon as
they are available — its own photos carry no licence conditions at all and are the strongest position.

**(b) Placeholder school details.**
The delivered database contains **sample** identity data — school name, KNEC centre code, NEMIS code, MoE
registration number, principal and bursar names, phone, email and fees. These must be replaced with the
school's real registration particulars before the site goes public; publishing a registration or centre code
that is not the school's own would be the one thing in this system capable of causing a genuine problem with
the authorities. They are all editable in **Backend Customization Zone → Branding / Academic / Finance**, and
"FAITH LEARNING CENTRE" itself is a placeholder name to be replaced the same way.

## 5. Layout reference (this is not an image we ship)

The Alverno College screenshot supplied as a layout reference was used **only to study page structure**
(header → hero → call-out band → card row). No image, logo, text, colour palette or code from that website was
copied into the system — the layout is rebuilt from scratch with our own markup, our own copy from the school's
database and the openly licensed photographs above. Nothing from that screenshot is hosted or served.

## 6. Ongoing practice

- Add each new photograph to `/assets/CREDITS.md` before publishing it.
- Prefer, in this order: the school's own photography → public-domain sources → CC-licensed sources with credit.
- Never take images from Google Images results, social media, or stock sites whose previews carry watermarks.
- Keep `tools/audit_image_licences.py` — it re-runs this whole audit in one command if the photo set changes:
  `python3 tools/audit_image_licences.py`.

## School-life photographs replaced 2026-10-11

Ten school-life photographs for a well-developed school environment — classrooms, a computer room, a
chapel, courts, a track and a prize table. All licence-checked against the Commons API at download time
and recorded in `tools/new-photos-licences.json`.

| File | Licence | Author |
|---|---|---|
| `students-learning-1.jpg` | CC BY-SA 4.0 | BAGANIAH |
| `students-learning-2.jpg` | CC BY-SA 4.0 | Esthee2010 |
| `students-discussion.jpg` | CC BY-SA 4.0 | Queen Asali |
| `students-eating.jpg` | CC BY-SA 3.0 | User:victorgrigas |
| `students-playing-1.jpg` | CC BY 2.0 | Baozhong Junior High School (褒忠國中 雲端網) |
| `students-playing-2.jpg` | CC BY-SA 4.0 | Mugera Swabri |
| `students-praying.jpg` | CC BY-SA 4.0 | Derek J Moore |
| `students-parading.jpg` | CC BY-SA 4.0 | Hansiezefy |
| `students-award-1.jpg` | CC BY-SA 4.0 | Sandister Tei |
| `students-award-2.jpg` | CC BY-SA 4.0 | MakaLeanne |

8 are CC BY-SA 4.0, 1 is CC BY-SA 3.0 and 1 is CC BY 2.0 — all require attribution, which the footer
credit line and this register provide. The two standing cautions are unchanged: obtain consent for
identifiable learners (Kenya Data Protection Act, 2019) and replace the placeholder registration data
before the site goes public. Captions describe the activity shown, not this school's own campus.
