# FAITH LEARNING CENTRE — School Management System

**Operations & Handover Guide** · version 1.2.1 · Node.js 20+ · Express 5

This document is for whoever runs the system day to day: the ICT department, the administrator,
and whoever the school hands the server to. Everything here has been tested on the running build.

---

## 1. Running the system

```bash
npm install            # once, after cloning or after moving the server
npm start              # starts on http://0.0.0.0:3000
```

| Variable | Default | What it does |
|---|---|---|
| `PORT` | `3000` | Port the server listens on |
| `HOST` | `0.0.0.0` | Interface to bind (keep `0.0.0.0` behind a reverse proxy) |
| `FLC_DB_PATH` | `data/db.json` | Where the school's database lives |

Useful commands:

```bash
npm test               # both suites: the website suite and the portal suite
npm run test:smoke     # every portal page, module and customizer tab
npm run test:public    # public site, terms, sign-in, Help Centre, payments, operations
npm run licences       # re-checks every photograph's licence against Wikimedia Commons
```

Health check for monitoring (no secrets in the response):

```bash
curl -s https://school.example.ac.ke/healthz
# {"ok":true,"service":"faith-learning-centre-erp","version":"1.2.1","uptimeSeconds":…,
#  "databaseKb":95,"lastBackup":{"file":"db-…-daily.json","at":"…","count":7},"time":"…"}
```

---

## 2. What is where

```
server.js                  the whole backend: routes, auth, security, operations
data/seed.js               the school's starting data (branding, fees, learners, accounts)
data/db.json               THE LIVE DATABASE — one JSON document, written atomically
data/backups/              rotating copies (14 kept; written on boot, daily, on demand, on stop)
public/                    website + portals (index.html, app.html, and the JS/CSS they load)
public/assets/             photographs, the crest, the app icons, CREDITS.md (media register)
tools/                     maintenance scripts: licence audit, colour board, photo sourcing
tests/                     smoke.test.js (portals) and public.test.js (website + platform)
docs/OPERATIONS.md         this document
```

The browser never sees the database's password material: `/api/bootstrap` strips salts and hashes.

---

## 3. Sign-in and accounts

| Portal | Email | Password |
|---|---|---|
| Admin / Principal | `leadex44@gmail.com` | `12345678` — **change this** |
| Teacher | `teacher@faithlearningcentre.ac.ke` | `Teacher@2026` (review account) |
| Bursar / Finance | `bursar@faithlearningcentre.ac.ke` | `Bursar@2026` (review account) |
| Parent / Guardian | `parent@faithlearningcentre.ac.ke` | `Parent@2026` (review account) |

- Passwords are stored only as **salted scrypt hashes**; nothing readable is stored or transmitted.
- The **administrator's password** and every review account are listed in the dashboard's
  **Go-live readiness** panel until they are dealt with. Once an account owner changes their own
  password, the review hint is deleted automatically.
- Forgotten passwords: the person presses *Forgot your password?* on the sign-in screen, and the
  **administrator or the ICT department** issues a temporary password from
  **Help Centre → Password Resets**. It is hashed immediately, shown once to the office, and must be
  changed after signing in. Every other device for that account is signed out at the same moment.
- **Devices** signed in are listed under **Help Centre → Security**; any device can be signed out
  individually, or all of the account's other devices at once.

---

## 4. Backups and restore

The database is written **atomically** (temp file + rename), so a crash mid-write cannot truncate it,
and a copy is written to `data/backups/`:

- on every boot,
- once a day while the server runs,
- before a factory reset or a data import,
- on a clean shutdown (`SIGINT`/`SIGTERM`) and on a crash,
- whenever somebody presses **Take a backup now** (Help Centre → Security).

Fourteen copies are kept, oldest removed first.

**Off-server copies are the ICT department's job — they are the only real insurance:**

```bash
# add to the server's crontab (runs nightly at 22:30)
30 22 * * * rsync -a /srv/flc/data/backups/ /mnt/offsite/flc-backups/
```

**Restore** (only with the server stopped):

```bash
sudo systemctl stop flc          # or Ctrl-C the node process
cp data/backups/db-YYYY-MM-DDTHH-MM-SS-daily.json data/db.json
sudo systemctl start flc
```

The file that is restored is validated by the same code path the server uses at boot; if it cannot be
parsed, the server says so in the log and keeps the old file.

---

## 5. Deploying it for real

The application itself is finished, but two things belong to the hosting, and the system reports them
as outstanding in **Go-live readiness** until they are done:

1. **HTTPS.** Put the Node process behind a reverse proxy that terminates TLS. Keep it on
   `HOST=127.0.0.1` in that case so nothing else can reach it directly.

   ```nginx
   server {
     listen 443 ssl http2;
     server_name school.example.ac.ke;
     ssl_certificate     /etc/letsencrypt/live/school.example.ac.ke/fullchain.pem;
     ssl_certificate_key /etc/letsencrypt/live/school.example.ac.ke/privkey.pem;
     location / {
       proxy_pass http://127.0.0.1:3000;
       proxy_set_header Host $host;
       proxy_set_header X-Real-IP $remote_addr;
       proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
     }
   }
   server { listen 80; server_name school.example.ac.ke; return 301 https://$host$request_uri; }
   ```

2. **Automatic off-server backups** — see the cron line above.

Then run the systemd unit so it survives a reboot:

```ini
# /etc/systemd/system/flc.service
[Unit]
Description=Faith Learning Centre school system
After=network.target

[Service]
WorkingDirectory=/srv/flc
Environment=NODE_ENV=production
Environment=HOST=127.0.0.1
ExecStart=/usr/bin/node server.js
Restart=always
RestartSec=3
User=flc

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl daemon-reload && sudo systemctl enable --now flc
```

### 5A. Deploying on Render (`render.yaml`)

The repository ships with `render.yaml`, `.node-version` (`20`), `.gitignore`, and reverse-proxy support (`app.set("trust proxy", 1)`) pre-configured for **Render.com**:

1. **Push this workspace to a GitHub or GitLab repository.**
2. **In the Render Dashboard:**
   - Click **New + → Blueprint** and select your repository (Render reads `render.yaml` automatically), **or**
   - Click **New + → Web Service**, connect your repository, and set:
     - **Runtime:** `Node`
     - **Build Command:** `npm install`
     - **Start Command:** `npm start`
     - **Health Check Path:** `/healthz`
3. **Choosing between Free and Persistent Disk (Starter):**
   - **Render Free Plan (default in `render.yaml`):** Deploys immediately at `$0/month` with automatic HTTPS (`https://<your-app>.onrender.com`). Note that Render Free containers sleep after 15 minutes of inactivity and reset their local disk on redeploy — use **Portal → Customization Zone → System & Data → Export Database JSON** before redeploying if you want to keep runtime edits.
   - **Render Starter Plan + Persistent Disk (recommended for live school data):**
     1. In Render, attach a **Disk** named `flc-data` mounted at `/var/data` (`1 GB` is plenty for years of JSON records and rotating backups).
     2. Add the environment variable `FLC_DB_PATH=/var/data/db.json` (or uncomment the `disk` and `FLC_DB_PATH` lines in `render.yaml`).
     3. On first boot, `server.js` automatically copies the bundled `data/db.json` onto `/var/data/db.json` and stores all future changes and rotating backups (`/var/data/backups/`) permanently across deploys and restarts.

**Before the address is public**, from the Go-live readiness panel:

- change the administrator's password and delete the three review accounts;
- switch off or remove any temporary payment channel (Finance & M-Pesa);
- replace the placeholder registration data (KNEC, NEMIS, registration numbers);
- confirm consent for the people shown in the school-life photographs (see `IMAGE-LICENCES.md`).

---

## 6. Security, as built

| Area | What is enforced |
|---|---|
| Passwords | scrypt, 32-byte hash, per-account salt; verified with `timingSafeEqual`; never sent to the browser |
| Sign-in | rate limited (60/minute/device) and locked for 10 minutes after 6 failures |
| Changes | every `POST/PUT/PATCH/DELETE` under `/api` needs a signed-in account (`X-FLC-Token`); only sign-in, forgotten-password, consent and enquiry are open |
| Sessions | capped at 25, revoked on sign-out, on password change, on a help-desk reset, and per device on request |
| Headers | CSP, `X-Content-Type-Options: nosniff`, `Referrer-Policy`, `Permissions-Policy`, `Cross-Origin-Resource-Policy` |
| Bodies | JSON capped at 2 MB |
| Audit | sign-ins, failures, resets, backups and every change, readable under Help Centre → Security and at `GET /api/security/status` |
| Photos | every image licence-checked through the Commons API and recorded in `public/assets/CREDITS.md` |

Known limits, stated plainly: the system is a single Node process with a JSON store behind one host —
fine for a school of this size, but it is not a clustered database. If the school outgrows it, the data
layer is one file and one `saveDb()` call to replace with Postgres or MySQL.

---

## 7. Everyday tasks

| I need to… | Where |
|---|---|
| Change branding, colours, fonts, terms, fees, modules, permissions | Backend Customization Zone |
| Change the website's layout, words, photographs or fonts | the editing bar on the public site (signed in as administrator) |
| Add or remove a payment channel (E-Citizen, the temporary Pochi number) | Customization Zone → Finance & M-Pesa |
| Reset somebody's password | Help Centre → Password Resets (administrator or ICT) |
| See who is signed in, or sign a device out | Help Centre → Security |
| Take a backup right now | Help Centre → Security → Take a backup now |
| Extend the help articles staff and parents read | Help Centre → Help articles → Add a help article |
| Take a copy of the whole database as JSON | Customization Zone → System Data |

---

## 8. The website header controls

The public site header carries **Dark / Light**, **Refresh** and **Log out** (the last appears
only when someone is signed in on that device).

- The theme is a per-device visitor setting (`localStorage` key `flc_appearance`); it never writes
  to the server, so a visitor cannot change the school's official colour combination. To open a
  page in a chosen theme from a link, add `?mode=dark` or `?mode=light`.
- Refresh re-reads `/api/bootstrap`; if it reports an error, the visitor sees a toast and the page
  keeps what it already had.
- Log out revokes the session on the server as well as clearing the device, so the entry disappears
  from **Portal → Sign-in & Security → devices** straight away.
- To give the dark theme a different depth, edit the token block at the top of `public/mode.css`
  (`--paper`, `--white`, `--line`, `--ink`). Nothing else has to change.
- If a visitor cannot see the controls, ask for a hard refresh: `controls.js` and `mode.css` are
  served with an ETag and the pages request them as `?v=18`.

## 9. If something goes wrong

| Symptom | First thing to check |
|---|---|
| The site does not load | `curl -s localhost:3000/healthz` — if it answers, the problem is the proxy or DNS; if not, `journalctl -u flc -n 60` |
| Everyone was signed out | expected after a password change or a help-desk reset; also after a server restart if `data/db.json` was replaced |
| "Sign in to make changes" on a form | the session expired — sign in again; the session cap is 25 devices |
| A page shows "That screen could not be drawn" | the rest of the system is unaffected; the message and the browser console name the cause — send it to the ICT department |
| A payment is missing | Finance → find the receipt reference; then Help Centre → Contact ICT |
| The sign-in screen still shows a review password | that account has not had its password changed yet; change it under Sign-in & Security |

The server logs one line per change — `[api] PUT /api/config/branding 200 12ms actor=Administrator` —
so the journal is the first place to look at what happened and who did it.
