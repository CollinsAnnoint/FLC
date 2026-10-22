**Layout colour — Crisp white with onyx black & crimson, and eight switchable combinations.** Every light
background is pure white (`#ffffff`) with light-grey hairlines (`#e4e4e6`) separating surfaces, taken from the
supplied colour reference. The colour comes from the deliberate surfaces and accents: **onyx black** (`#141316`,
`#060608`) with the reference's **deep maroon** (`#3a1119`) mid-tone, and a **crimson** accent (`#e4002b`) on
the sidebar, top bars, hero, call-out band and footer.

Eight ready-made combinations ship with the system, all previewable live and applicable in one click:
**Onyx & Crimson (live now)**, Corporate Navy & Amber, Graphite & Amber, Teal & Sand, Green & Old Gold,
Burgundy & Gold, Royal Blue & Silver and Clean Light.

- **Live picker:** `/colours` — swatches, side-by-side preview and an *Apply* button per combination.
- **Preview without saving:** append `?theme=<id>` to any page, e.g. `/?theme=teal` or `/app?theme=teal`. A bar at
  the foot of the screen names the combination and offers *Apply*; nothing changes for visitors until applied.
- **Admin console:** Backend Customization Zone → Branding → *Primary / Accent Colour*, *Sidebar Theme* and
  *Quick Theme Presets*.
- All combinations live in `public/themes.js` (single source of truth), and the tokens themselves in
  `public/styles.css` (portals) and `public/site.css` (public website and all eight designs).

**Typography.** The school's typeface is **Rubik**, self-hosted from `public/assets/fonts/` (latin and latin-ext,
SIL Open Font License 1.1) and declared in `public/rubik.css` — nothing is fetched from an external font service,
so the site and the portals look identical offline. Headings sit at a heavier weight with tighter tracking,
body text at 400, and a monospace face is kept for codes and admission numbers. The administrator can change the
weight/tracking preset and the text size from the website editing bar.

**White surfaces.** Every light layout is pure white (`#ffffff`) — page, section, card and table surfaces alike.
Structure comes from grey hairlines (`#e4e4e6`) and a `#fafafa` hover, never from a grey or cream wash, so the
crimson and onyx read as the only colour on the page.

**Logo.** The school's mark is vector art drawn for this system — a heraldic shield with a cross, a flame and an
open book, in the onyx-and-crimson palette. It is drawn inline by `public/brand.js`, served as `public/assets/logo.svg` for the
browser tab, and appears on the public header and footer, the portal sidebar, the splash screen and the Terms
sheet. The backend's Crest Style setting switches between the shield, the circular seal and the letter monogram.

**Transitioning images.** The home page hero cross-fades between four of the credited photographs, and every row
of the alternating campus band cross-fades between two, on staggered cycles defined in `public/homes.css`
(`@keyframes d8-fade-cycle` / `d8-fade-pair`). The animation is switched off automatically for visitors who ask
for reduced motion.

**Running it.** `npm install` once, then `npm start` (defaults to port 3000; `PORT`, `HOST` and
`FLC_DB_PATH` are honoured). `npm test` runs both suites; `npm run licences` re-checks every
photograph's licence. `GET /healthz` reports version, uptime, database size and the last backup for
the school's monitoring. The system is installable on a phone or tablet from the browser (manifest and
icons included), prints cleanly (report cards and fee statements come out without the navigation
chrome), and carries a command palette (⌘K / Ctrl-K or `/`) that reaches every page, learner, member
of staff and help article.

**Go-live readiness.** The administrator's dashboard opens with a checklist computed from the live
database — the administrator's password, the review accounts, any temporary payment channel still
switched on, the placeholder registration data, off-server backups and HTTPS. Each item links to the
place it is fixed, so the panel can never drift from the real state of the school's data.

**Operations.** `data/db.json` is written atomically (temp file + rename) and copied to
`data/backups/` on every boot, daily, before a reset or import, on shutdown and on demand — 14 copies
kept. The administrator can take a backup from Help Centre → Security, and sign out any device.
Deployment, backup/restore and troubleshooting are written up in **`docs/OPERATIONS.md`**.

**Portal sign-in.** `/app` — and the *Portal login* button on the public website — opens on a sign-in screen.
One form serves all four portals: the account decides which portal opens, and every sign-in carries the required
School Terms & Conditions checkbox, so acceptance is recorded at the moment of entry.

| Portal | Email | Password |
|---|---|---|
| Admin / Principal | `leadex44@gmail.com` | `12345678` — the school's account |
| Teacher | `teacher@faithlearningcentre.ac.ke` | `Teacher@2026` |
| Bursar / Finance | `bursar@faithlearningcentre.ac.ke` | `Bursar@2026` |
| Parent / Guardian | `parent@faithlearningcentre.ac.ke` | `Parent@2026` |

The three lower rows are demonstration accounts for reviewing the other portals; the sign-in screen lists them.
Passwords are stored only as salted scrypt hashes — never in clear text — and sign-ins, failed attempts and
password changes are written to the audit trail. Sessions are issued as tokens (capped, revoked on sign-out).
Change any password under **Backend Customization Zone → Sign-in & Security**; changing one signs every other
device out. Replace the demonstration accounts and the administrator password before the system goes public.

**Imagery and licensing.** All eight photographs are openly licensed and were re-verified against the Wikimedia
Commons API — five CC BY-SA 4.0, one CC BY 2.0, two public domain. No pirated, watermarked, stock-library or
AI-generated imagery is used. Full register, obligations and the two non-copyright cautions (consent for
identifiable people in photographs, and replacing the placeholder registration data) are in
`IMAGE-LICENCES.md`; re-run the audit any time with `python3 tools/audit_image_licences.py`.

**Chooser page:** open `/designs` (or Backend Customization Zone → Branding → *Public Home Page Design*) to
  preview all eight side by side and publish one. The choice is stored as `branding.homeDesign` on the server
  and is what every visitor sees at `/`; any design can also be reviewed with `?design=1…7`.
- Design previews are also saved as images in `home-designs/` (`design-1.jpg` … `design-7.jpg`, plus the
  combined sheet `all-seven-designs.jpg`).

**Layout colour — Complementary Pairs.** Each combination uses an opposite pair on the colour wheel, so it
reads as deliberate rather than blended: the deep surface colour (burgundy `#35101a`, navy `#081e38`, graphite
`#141a22`, teal `#072a30`, green `#0d3a1f`) on every large surface — sidebar, top bars, hero panels, footers —
and **gold** (`#c9902f`, `#a9741f`, `#e3c078`, `#f7efdd`) for rules, numerals and actions, over pure white with
neutral grey hairlines. There is no blue-violet cast and no purple anywhere. Apply any combination from the
branding tab (Quick Theme Presets), the sidebar theme list, or the `/colours` picker. Tokens live in
`public/themes.js` (combinations) plus `public/styles.css` (portals) and `public/site.css` (public website and
all eight designs).

**Typography.** The school's typeface is **Rubik**, self-hosted from `public/assets/fonts/` (latin and latin-ext,
SIL Open Font License 1.1) and declared in `public/rubik.css` — nothing is fetched from an external font service,
so the site and the portals look identical offline. Headings sit at a heavier weight with tighter tracking,
body text at 400, and a monospace face is kept for codes and admission numbers. The administrator can change the
weight/tracking preset and the text size from the website editing bar.

A professional, interactive school website built entirely from the live system configuration:

- **Dimmed photographic hero** with a three-image slider, animated counters and scroll reveals
- **Live statistics band** — enrolment, staff, school mean, attendance, learning areas, dormitories (read from the database)
- **About Us** — vision, mission, core values, registration facts
- **Academics** — tabbed programmes (ECDE, Lower Primary, Upper Primary, Junior School) with the learning areas and
  current term fees pulled from the fee structures
- **School Life** — photo gallery with lightbox, boarding houses, transport routes and clubs
- **Term Dates & Events** — current term, key dates and upcoming events from the events register, plus latest notices
- **Admissions** — four-step process, requirements checklist and an **Online Admission Enquiry form** that writes
  straight into the admin portal
- **FAQ accordion** and a full **Contact / Portals** section
- **Footer** with quick links, portal links, contact details, KNEC/NEMIS/registration numbers and photo credits

Photography is **real, openly-licensed Kenyan school imagery** from Wikimedia Commons (CC BY-SA 3.0/4.0 and
public domain), served locally from `public/assets/`. Attribution is shown in the footer and may be replaced
at any time by dropping new files with the same names into that folder.

## 0.1 Terms & Conditions — applied across the whole system

A formal **16-clause Terms & Conditions** document (introduction, admission, fees & refunds, uniform and property,
attendance, health and emergency consent, boarding, transport, conduct and discipline, child protection,
data protection, communications, assessment, complaints, withdrawal, amendments) is generated from the live
configuration and enforced at every entry point:

| Entry point | Enforcement |
|---|---|
| Public front page | Terms button in the navigation and footer; full document in a printable modal |
| Admission enquiry form | Acceptance checkbox is mandatory before the enquiry is submitted |
| Portal login | Acceptance checkbox is mandatory before sign-in |
| Inside every portal | Blocking acceptance gate on first entry, with the checkbox disabled submit button |
| Admission form (admin) | Terms link shown alongside learner capture |
| Printed report cards & fee receipts | Terms version, SHS/weighting and refund-policy reference stamped on the document |

Every acceptance is recorded in the **Acceptance Registry** (name, portal, version, timestamp) and written to the
audit trail. The document text, version, effective date, fee deadline, refund window, withdrawal notice, arrears
policy, academic honesty, attendance requirement, complaints channel and consent defaults are all editable in
**Backend Customization Zone → Terms & Policies**.

---

## 1. Portals (switch instantly with the role switcher in the top bar)

| Portal | What it contains |
|---|---|
| **Admin / Principal** | Dashboard, students & admissions, attendance, markbook, report cards & analytics, finance, staff & payroll, transport, boarding, library, merits/discipline, SMS hub, reports, **Backend Customization Zone** |
| **Teacher** | Dashboard, class register, CBC markbook editor (read-only if permission revoked), report cards, timetable, library, communications |
| **Bursar / Finance** | Dashboard, fee collection ledger, M-Pesa reconciliation, arrears & reminders, expenditure, fee reports |
| **Student / Parent** | Child dashboard, report card & competencies, attendance history, timetable, fee statement + M-Pesa payment, school notices, learner profile |

Parent views are **child-scoped** — a guardian only ever sees their own learner's data (no school-wide
ranking lists, no other parents' contacts).

---

## 2. Backend Customization Zone (Admin → gear icon in the sidebar)

Nine control surfaces, all live-updating:

1. **School Identity & Theme** — school name, acronym, motto, vision, mission, KNEC code, NEMIS code,
   MoE registration, postal address, phone, email, website, principal, bursar, receipt & report-card
   footers, primary/accent colours, sidebar theme, UI density, crest style, plus one-click theme presets
   and a live appearance preview.
2. **Modules & Features** — 10 feature flags (Academics, Finance, Attendance, Timetable, Staff,
   Transport, Boarding, Library, Discipline, Communications). Toggle any module off and it disappears
   from every portal instantly; data is preserved.
3. **Academic Engine** — academic year, current term, term dates, next-term opening date, grading mode
   (`cbc` / `standard` / `hybrid`), SBA vs exam weighting, assessment types (add/remove), class levels
   (PP1 → Grade 9 JSS, add/remove), streams/houses (add/remove), and the full learning-area (subject)
   table with add/edit/remove/activate.
4. **Grading Scales** — editable CBC rubric (EE/ME/AE/BE bands, points, colours and descriptors) and the
   standard A–E percentage scale with remarks.
5. **Custom Fields Builder** — no-code schema extension: add dropdown/text/number/date fields to learner
   or staff records. New learner fields appear immediately on the admission form and learner profile.
6. **Finance & M-Pesa Gateway** — currency, Paybill number, account prefix, bank details, arrears alert
   threshold, parent-portal payments, auto-SMS on payment/absence, report-card withholding + threshold,
   SMS provider/sender ID/credit balance, and editable **fee structures per level group** (totals
   auto-compute for Day and Boarding).
7. **Role Permissions** — granular matrix for teacher, bursar and parent portals (e.g. revoke
   `canEditMarks` and the markbook turns read-only for teachers).
8. **Terms & Policies** — the master Terms & Conditions configuration, the acceptance registry and the
   website admission enquiries inbox.
9. **System Data & Audit** — export full JSON backup, CSV exports (learners, parents, payment ledger,
   fee report), import a JSON backup, factory reset to seed data, and a full audit trail of every
   configuration change.

---

## 3. Modules included

- **Students & Admissions** — NEMIS UPI, KNEC assessment number, guardians, boarding/transport
  allocation, custom fields, live fee position, CSV export.
- **Attendance** — daily roll-call per learner (Present/Late/Absent/Excused), class trend analysis,
  one-click absence SMS dispatch.
- **Academics & Markbook** — SBA + exam entry per learning area, weighted final score, CBC rating and
  per-strand remarks; class performance distribution.
- **Report Cards** — official MoE-style printable report card (school crest, learner bio-data, SBA/exam
  columns, CBC levels, competency ratings, teacher & principal comments, grading key, total points and
  class rank) plus batch printing.
- **Finance** — M-Pesa Paybill receipting with auto-generated receipt numbers, official printable fee
  receipts, arrears/debtor tracking, SMS reminder engine, expenditure voteheads, collection-channel
  analysis, net position.
- **Staff, TSC & Payroll** — teacher directory with TSC numbers, subject allocations, department
  strength, and Kenya statutory payroll (SHIF, NSSF, Housing Levy, PAYE → net pay).
- **Timetable** — weekly master timetable with break/assembly shading, teacher weekly lesson load, room
  utilisation, and an editable slot editor.
- **Transport** — routes, vehicle registrations, drivers/assistants, capacity utilisation, transport
  billing, printable pickup registers.
- **Boarding** — dormitory houses, capacity/occupancy, matrons & patrons, boarder allocation register
  with medical/kitchen notes.
- **Library** — KICD textbook inventory, lending register, due dates, overdue tracking + reminder SMS.
- **Merits & Discipline** — merits/awards, guidance cases, house merit leaderboard, CBC talent club
  membership.
- **Communications** — bulk SMS composer with audience segmentation, live SMS preview and credit
  accounting, broadcast history, parent contact directory.
- **Reports & Analytics** — fee collection by class, expenditure by votehead, enrolment ratios,
  board-ready prints.

---

## 4. API reference (backend)

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/bootstrap` | Full database snapshot (config + all records) |
| PUT | `/api/config/branding` | School identity & theme |
| PUT | `/api/config/modules` | Feature flags |
| PUT | `/api/config/academic` | Academic engine, grades, streams, learning areas, grading scales |
| POST/DELETE | `/api/config/custom-fields` | Custom field builder |
| PUT | `/api/config/finance` | M-Pesa, SMS gateway, arrears rules |
| PUT | `/api/config/permissions` | Role permission matrix |
| PUT | `/api/config/terms` | Terms & Conditions / school policy configuration |
| POST | `/api/consents` | Record Terms & Conditions acceptance (public site or portal) |
| POST | `/api/enquiries` | Public admission enquiry from the front page |
| POST | `/api/config/reset` · `/api/config/import` | Factory reset · restore backup |
| POST/PUT/DELETE | `/api/students` · `/api/students/:id` | Admissions & learner records |
| PUT/POST | `/api/assessments/:studentId` · `/api/assessments/bulk` | Markbook |
| POST | `/api/payments` · `/api/expenses` | Receipting & expenditure |
| PUT | `/api/fee-structures/:id` | Fee structure per level |
| POST | `/api/attendance` | Daily register |
| POST | `/api/staff` · `/api/timetable/:dayId` | HR & timetable |
| POST | `/api/operations/:collection` | Transport, boarding, library, merits |
| POST | `/api/communications` | SMS broadcasts & circulars |

---

## 5. Files

```
server.js                  Express backend + REST API + audit logging
data/seed.js               Seed database (config, terms, 12 learners, marks, payments, staff, events…)
data/db.json               Live persistent database (created/updated on writes)
public/index.html          Public front page shell (served at /)
public/app.html            Portal shell (served at /app)
public/site.css            Public site + Terms & Conditions + login styling
public/styles.css          Portal theme engine (CSS variables driven by the customizer)
public/app.js              Core app: router, portals, modules, customization zone, modals
public/landing.js          Public front page: hero, sections, enquiry form, login
public/controls.js         Header controls: appearance theme, refresh, log out (self-mounting)
public/mode.css            Dark appearance theme for the public website + control styling
public/terms.js            Shared Terms & Conditions module (document, gate, modal, checklist)
public/parent-portal.js    Child-scoped parent & student views
public/assets/*.jpg        Real, openly-licensed school photography (local, no external requests)
public/assets/CREDITS.md   Photograph attribution register (author + licence per image)
home-designs/*.jpg         Seven rendered home-page design previews for the school to choose from
home-designs/system-designs/  Archived (inactive) code for the alternative home-page layouts
tests/smoke.test.js        Portal smoke test: all roles × routes × customizer tabs
tests/public.test.js       Front page, T&C enforcement, login gate and page routing test
```

### Colour palette

The interface uses a deliberately institutional palette only. The live combination is **Onyx & Crimson** — onyx
black `#141316` with the deep maroon `#3a1119` mid-tone, a crimson accent `#e4002b`, over pure white surfaces,
`#e4e4e6` hairlines and a `#fafafa` hover. Forest green carries positive states, greys the secondary text and a
single functional red the arrears/alerts. There are no purple, violet, indigo, magenta or neon tones anywhere in
the UI.

**Changing the colour.** Seven further combinations ship with the system and any of them can be applied in one
click — Corporate Navy & Amber, Graphite & Amber, Teal & Sand, Green & Old Gold, Burgundy & Gold, Royal Blue &
Silver and Clean Light. Every combination is defined once in `public/themes.js`, which drives the live picker at
`/colours`, the `?theme=<id>` previews on any page, the preview bar and the backend branding picker alike.

- **Preview without saving:** append `?theme=<id>` to any address — e.g. `/?theme=teal`, `/app?theme=teal`,
  `/designs?theme=burgundy`. A bar at the foot of the screen names the combination and offers *Apply*; nothing
  changes for visitors until it is applied.
- **Apply:** press *Apply* on the preview bar, use the buttons on `/colours`, or set *Primary / Accent Colour* and
  *Sidebar Theme* in Backend Customization Zone → Branding. The choice is stored as `branding.primaryColor`,
  `accentColor` and `sidebarTheme`, so it survives restarts.
- **Hand-picked colours:** the branding tab's colour inputs accept any pair; the system derives a full ramp from
  whatever is chosen, so custom colours work too.

**Default seed:** 12 learners (PP2 → Grade 9 JSS), 9 learning areas, 8 staff members, 4 transport
routes, 4 dormitory houses, 5 library titles, Term 3 2026 marks, M-Pesa and bank payments, and a full
audit trail — so every screen opens with realistic Kenyan school data.


## The website header controls

Every public page carries three controls in its header (the strip beside the phone number,
so they appear on the live design and on all eight previews):

| Control | What it does |
|---|---|
| **Dark / Light** | Switches the website between the light look (the school's default: white surfaces, onyx type) and the dark look built on the supplied onyx palette — `#0d0c0e` pages, `#151215` cards, `#f5f5f2` type, the same crimson accent. The choice is kept on that device only; it never changes the school's official colours. A link ending in `?mode=dark` (or `?mode=light`) opens in that theme, and a visitor whose device asks for dark starts there. |
| **Refresh** | Re-reads the school's data from the server (`/api/bootstrap`) and repaints the live page — new fees, notices, events or photographs appear without a full browser reload. |
| **Log out** | Shown only when a portal session exists on this device. It clears the device token **and** revokes the session on the server (`POST /api/auth/logout`), then returns the visitor to the signed-out site. |

The controls are mounted by `controls.js` into whichever header the current design rendered, so no
design template has to be changed and the eight designs all stay in step. The portal keeps its own
**Sync** and **Sign out** controls, and the dark theme applies to the public website only.

## Help Centre

Every portal has a **Help Centre** in the sidebar:

- **Help articles** — the school's own knowledge base (fees and M-Pesa, eCitizen, passwords, CBC marks, report cards,
  attendance, ICT, backups), searchable by any word, extendable by the administrator from the page itself.
- **Password Resets** — a learner, parent or member of staff presses *Forgot your password?* on the sign-in screen; the
  request appears here and the **administrator or the ICT department** issues a temporary password (readable, hashed
  into the account straight away) which must be changed after signing in. Every other device is signed out at the
  moment of the reset. Requests are never visible to anyone who is not signed in, and the screen never reveals
  whether an address belongs to the school.
- **Security** — the live checklist (scrypt hashing, rate limiting, lockout, session control, security headers, audit
  trail), the accounts table with the last password change, and the recent security events.
- **Contact ICT** — the department's details and a request form.

## Payments

`systemConfig.financeConfig.paymentChannels` is the single list of ways the school accepts money, shown on the
payment modal, under **Backend Customization Zone → Finance**, and in the website's fee section:

| Channel | Detail | State |
|---|---|---|
| M-Pesa Paybill | 522533 · account FLC-ADMNO | permanent |
| **M-Pesa Pochi la Biashara** | **0769679217** | **temporary — switch off or remove once the till is live** |
| E-Citizen | eCitizen paybill 222222 · account FLC-ADMNO | permanent (confirm the school's agency code) |
| Bank deposit / EFT | KCB Bank Kenya — Ngong Road Branch · 1180492817 | permanent |
| Cash | Bursar's office, Mon–Fri 8:00 AM – 4:00 PM | permanent |

Each channel has an on/off switch, an editable description and a Remove button; a temporary channel is badged on
the website and in the portals. Nothing about the Pochi number is hard-coded — removing it takes one click.

## The administrator's website editing bar

While signed in as the administrator, the public website carries a bar at the foot of the page (`public/admin-bar.js`):
**layout** (any of the eight designs), **fonts** (Rubik presets) and text size, **headline** and **call-out line**,
**hero photographs** (choose up to four from the school's images) and **Publish**. Publishing writes
`systemConfig.siteContent` and `systemConfig.typography` to the server, so every visitor sees the change immediately.
The words accept `{term}`, `{year}`, `{fromFee}` and `{school}` placeholders. *Colours* and *Open the portal* sit
beside Publish; **Hide bar** collapses it for the session.

## Security

What is in place in the application:

- Passwords stored only as **salted scrypt hashes**; no password material ever leaves the server.
- **Rate limiting** on sign-in and public forms, and **account lockout** after six failed attempts (10 minutes).
- **Every change to the system requires a signed-in account** (`X-FLC-Token`); the only open writes are sign-in,
  forgotten password, Terms consent and the enquiry form.
- Sessions are capped, revoked on sign-out, on password change and on a help-desk reset.
- **Security headers** on every response: CSP (with `frame-ancestors *` so the school may embed the site), `nosniff`,
  `Referrer-Policy`, `Permissions-Policy`, `Cross-Origin-Resource-Policy`; JSON bodies capped at 2 MB.
- **Audit trail** of sign-ins, failures, resets and every change, readable under Help Centre → Security and
  `GET /api/security/status`.

Two things only the school's hosting can provide, and they are shown as outstanding in the security checklist:

1. **HTTPS/TLS** on the public address — the platform must terminate TLS; the app cannot.
2. **Off-server backups** of `data/db.json` — copy it nightly (and before any upgrade) to storage that is not the
   server, because the running system is a single Node process with a JSON store.

Also before going public: replace the administrator's `12345678`, delete the three demonstration accounts, replace
the placeholder registration data, and confirm consent for identifiable people in the photographs.
