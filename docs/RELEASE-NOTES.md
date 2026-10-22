# FAITH LEARNING CENTRE — release notes

**v1.2.1** · 2026-10-22 · Faith Learning Centre ERP + public website  
_(audit release — see the v1.2.1 section at the end)_

---

## What this release contains

### The school website
- **Design 8 live at `/`** — the onyx-and-crimson institutional look, with the school brief
  (location, mission, vision) directly under the call-out band, the fee table, term dates, events,
  notices, the FAQ and the enquiry form, all rendered from the live school database.
- **Ten school-life photographs replaced** with scenes from well-developed school environments —
  classrooms, a computer room, a chapel, courts, a running track and a prize table. Real,
  openly-licensed photographs only (8 × CC BY-SA 4.0, 1 × CC BY-SA 3.0, 1 × CC BY 2.0), credited in
  `public/assets/CREDITS.md` and `IMAGE-LICENCES.md`, and re-audited by `npm run licences`.
- **Header controls** on every public page: **Dark / Light** theme (per-device, never written back to
  the school's colours), **Refresh** (re-reads the school data and repaints in place) and **Log out**
  (shown when a portal session exists; revokes the session on the server as well as the device).
- **School contact number is 0769679217** — it drives the header, footer, contact section and the
  Help Centre from one branding field, so `+254 711 840 200` is gone everywhere it was public.
- Eight home page designs remain available to preview and publish from `/designs`, and the eight
  colour combinations from `/colours`; neither a design nor a colour change needs a developer.

### The portal
- All four portals work — **Administrator, Teacher, Bursar, Parent/Student** — with the modules,
  permissions and custom fields the school controls from the Backend Customization Zone.
- **Operations layer**: `/healthz` liveness probe, `/api/system/status`, `/version.js`, rotating
  backups (14 kept) written on boot, daily, on shutdown, on crash, before a reset or import, and on
  demand; device management with masked tokens and remote sign-out.
- **Help Centre** for forgotten passwords (admin/ICT), the **payments** channels (E-Citizen 222222
  plus the temporary Pochi la Biashara till), and the **admin editing bar** over the public site.
- **Security**: the write guard (`X-FLC-Token`), rate limiting and account lockout, security headers,
  audit log for every change, and Terms & Conditions genuinely enforced (gate, versioned, editable)
  in the portal and in every quick-apply form.

## Verified before handover

| Check | Result |
|---|---|
| `npm test` — portal smoke suite (78 routes, every role, every customizer tab) | ✅ passed |
| `npm test` — public suite (front page, eight designs, chooser, colours, T&C gate, auth, Help Centre, operations, design tokens, header controls) | ✅ passed |
| `npm run licences` — every photograph licence-checked against Wikimedia Commons | ✅ no non-free material |
| Design-token coverage on all four pages | ✅ no missing tokens |
| Routes `/`, `/app`, `/designs`, `/colours`, `/healthz`, `/version.js`, `/mode.css`, `/controls.js` | ✅ 200 |
| Server version reported by package, `/healthz` and `/version.js` | ✅ 1.2.0 |
| Backup taken at handover | ✅ see `data/backups/` |

## Before it goes public — the school's to-do list

The dashboard's **go-live readiness** panel lists these; none of them need a developer:

1. **Replace the admin password** (`leadex44@gmail.com` ships with a demonstration password) and
   remove or rename the demonstration teacher, bursar and parent accounts.
2. **Delete the placeholder registration data** — the sample learners, marks and payments are
   examples, not the school's real records. *Backup first: the portal takes one before a reset.*
3. **Turn off the temporary Pochi la Biashara channel** once the school's own till is ready
   (Portal → Fees → payment channels).
4. **Serve over HTTPS** on the real domain — the readiness panel only turns green once the site is
   on `https://`. `docs/OPERATIONS.md` §5 has the nginx and systemd configuration.
5. **Consent for photographs** — several gallery images show identifiable learners; get written
   consent under the Kenya Data Protection Act, 2019 (see the caution in `IMAGE-LICENCES.md`).

## Where to look next

| Document | What it is for |
|---|---|
| `README.md` | What the system is, the modules, the API, the colour palette, the header controls |
| `docs/OPERATIONS.md` | Running it, backups and restore, nginx + systemd, security, everyday tasks, troubleshooting |
| `public/assets/CREDITS.md` · `IMAGE-LICENCES.md` | The media register and the licence position for every photograph |
| `tools/` | The scripts that built the site (photo sourcing, licence audit, colour board) — documented, not needed day to day |

*Admin sign-in for the demonstration: `leadex44@gmail.com` / `12345678` (also `teacher`, `bursar`
and `parent` accounts). Change these before the system holds real pupil data.*

---

## v1.2.1 · 2026-10-22 — full-system audit

A pass over the whole system looking for anything broken, unsafe or unfinished. Everything found was
fixed and is now covered by a test.

### Security — three holes closed

| Found | Why it mattered | Fixed |
|---|---|---|
| Any signed-in account could call the configuration API | A **parent account could rename the school or reset the entire database** (both were reproduced). | The write guard is now role-scoped: configuration, staff, learners, devices and the reset queue are administrator-only; teachers keep attendance, marks, timetable and messaging; the bursar keeps payments, expenses and fee structures. Refusals return `403` and are written to the audit log. |
| `POST /api/config/reset` and `/import` returned the whole database | The response carried every account's `salt` and `passwordHash`. | They now return a count summary. The administrator who pressed the button stays signed in; everyone else is signed out. |
| `GET /api/help/requests` was readable by any signed-in user | Revealed who had asked for a password reset, and any temporary password issued. | Administrator/ICT only. A new temporary password is held in memory for 30 minutes and **never written to disk**. |
| `POST /api/consents` echoed the whole acceptance register to an anonymous visitor | Every name and IP that had accepted the Terms. | A visitor receives their own receipt; the portal keeps its own local copy of the acceptance. |

Also added: **validation on the write endpoints** (a learner needs a name and a class, a payment needs
an amount, a message needs a title and a body, a staff record needs a name and a role, an attendance
register needs a date and rows) — an empty form previously created placeholder records. The sign-in
ceiling is now 60 attempts a minute per device, because a school office or ICT lab shares one address;
the real defence stays the per-account lockout (6 failures → 10 minutes, verified end to end).

### Fixed

- **The portal drew itself from the public payload.** After the data boundary was introduced, the
  dashboard still expected the full record set at sign-in and threw `Cannot read properties of
  undefined`. Sign-in and session restore now re-fetch `/api/bootstrap` with the session token.
- **Log out vanished on a phone.** The ≤720 px rule hid the whole button (it carried the
  `flc-ctl-text` class) instead of just its label. The controls are now icon-only but present and
  38 px tappable, each with an accessible name.
- **The Learner Profile menu item painted the dashboard.** `pageProfile` existed but was never
  registered in the route map. It is now a real page (bio-data, guardian contacts, custom fields,
  learner switcher) and is covered by a test.
- **The enquiry table was a dead end** — a status column that never changed and no way to remove
  spam. Added `PUT /api/enquiries/:id` (New / Contacted / Enrolled / Archived) and
  `DELETE /api/enquiries/:id`, both administrator-only, with the controls wired into the portal.

### Accessibility

- Every public page now opens with a **skip link**, and the chooser pages have a named `<main>`.
- All **enquiry form labels are bound to their fields** (`for`/`id`) across all eight designs, the
  legacy design and the landing page — 26 fields in total.

### Re-verified after the changes

| Check | Result |
|---|---|
| Eight home designs | ✅ 8/8 — no duplicate ids, no dead anchors, no unlabelled fields, no JS errors |
| Portal routes | ✅ all 17 render |
| Endpoint sweep (27 endpoints × anonymous and administrator) | ✅ no 5xx, no stack traces |
| Authorisation matrix (10 operations × 4 roles) | ✅ correct decisions, no side effects |
| Stylesheets | ✅ 6/6 parse, braces balanced |
| Portal smoke suite | ✅ 78 routes |
| Public suite (now 19 blocks) | ✅ passed |
| Photograph licences | ✅ unchanged |

*Signed-in demonstration passwords are unchanged: `leadex44@gmail.com` / `12345678`, and the
teacher, bursar and parent accounts.*
