#!/usr/bin/env python3
"""Help Centre data, payment channels, site content and the security layer."""
import os

os.chdir("/home/user")

# ============================================================ seed.js
p = "data/seed.js"; s = open(p, encoding="utf-8").read()

# --- payment channels (E-Citizen + the temporary Pochi la Biashara number) ---
s = s.replace('''      autoSmsOnPayment: true,
      autoSmsOnAbsence: true
    },''',
'''      autoSmsOnPayment: true,
      autoSmsOnAbsence: true,
      // Every way the school accepts money. Temporary channels are flagged so the admin
      // can switch them off in one click once the permanent tills go live.
      paymentChannels: [
        { id: "mpesa_paybill", label: "M-Pesa Paybill", kind: "mpesa", enabled: true, temporary: false,
          detail: "Paybill 522533 · account FLC-ADMNO" },
        { id: "mpesa_pochi", label: "M-Pesa Pochi la Biashara", kind: "mpesa", enabled: true, temporary: true,
          detail: "0769679217 · Pochi la Biashara (school till)", number: "0769679217",
          note: "Temporary channel added for the current term — switch it off once the school paybill or till is live." },
        { id: "ecitizen", label: "E-Citizen", kind: "government", enabled: true, temporary: false,
          detail: "eCitizen Paybill 222222 · account FLC-ADMNO",
          note: "Confirm the school's eCitizen agency code before publishing live instructions." },
        { id: "bank", label: "Bank deposit / EFT", kind: "bank", enabled: true, temporary: false,
          detail: "KCB Bank Kenya — Ngong Road Branch · account 1180492817" },
        { id: "cash", label: "Cash (Bursar's office)", kind: "cash", enabled: true, temporary: false,
          detail: "Mon – Fri, 8:00 AM – 4:00 PM" }
      ]
    },''')

# --- editable website words, hero images and typography ---
s = s.replace('''    terms: {
      version: "2.1",''',
'''    // Everything the administrator can rewrite from the website editing bar.
    siteContent: {
      heroKicker: "Admissions open · {term} {year}",
      heroTitle: "Get ready to excel in faith, competence & character",
      heroSub: "A Ministry of Education registered Competency-Based Curriculum school on Ngong Road, Nairobi — Pre-Primary to Junior School, day and boarding.",
      bandQuestion: "Ready to join a school that knows every learner by name?",
      bandSub: "Day fees from {fromFee} a term, with sibling concessions, instalments and a boarding option.",
      aboutHeading: "",
      aboutLead: "",
      feesLead: "",
      footerNote: "",
      heroImages: ["/assets/hero-1.jpg", "/assets/hero-3.jpg", "/assets/classroom.jpg", "/assets/sports.jpg"],
      updatedAt: null,
      updatedBy: null
    },
    typography: {
      preset: "baskerville",
      scale: "normal",
      updatedAt: null
    },
    terms: {
      version: "2.1",''')

# --- Help Centre knowledge base + password reset queue ---
s = s.replace('''  return {
    accounts,
    sessions,''',
'''  // Help Centre articles — shown in the portal and referenced by the ICT help desk.
  const helpArticles = [
    { id: "help_pay", category: "Fees & payments", title: "How do I pay school fees?",
      body: "Fees can be paid by M-Pesa Paybill 522533 (account FLC-ADMNO), by the temporary M-Pesa Pochi la Biashara number shown on the Fees page, through E-Citizen, by bank deposit to the KCB account, or in cash at the bursar's office. Always quote the learner's admission number. Receipts are issued on the portal the same day and a confirmation SMS is sent to the guardian.",
      tags: ["mpesa", "fees", "ecitizen", "receipt"] },
    { id: "help_receipt", category: "Fees & payments", title: "My payment is not showing on the portal",
      body: "Fee payments appear on the portal as soon as the bursar receipts them, usually within a few minutes of the M-Pesa confirmation. If a payment is missing after 24 hours, open the Finance page, find the receipt reference and send it to the bursar or the ICT department through the Help Centre so it can be traced.",
      tags: ["receipt", "mpesa", "finance"] },
    { id: "help_password", category: "Accounts & passwords", title: "I have forgotten my portal password",
      body: "Press 'Forgot your password?' on the sign-in screen and send a reset request. The administrator or the ICT department sees the request in the Help Centre's Password Resets tab, sets a temporary password and tells you what it is. You will be asked to change it yourself under Backend Customization Zone → Sign-in & Security after signing in.",
      tags: ["password", "sign-in", "reset", "forgotten"] },
    { id: "help_new_staff", category: "Accounts & passwords", title: "A new teacher, bursar or parent needs an account",
      body: "Sign in as the administrator, open Backend Customization Zone → Sign-in & Security and create the account with the right portal role. Parents only see their own children; teachers see the classes assigned to them. Ask the ICT department to disable an account the day a member of staff leaves.",
      tags: ["account", "staff", "roles"] },
    { id: "help_marks", category: "Academics", title: "How are CBC marks recorded and graded?",
      body: "Teachers enter formative and summative scores in the CBC Markbook. The school's grading configuration turns them into EE, ME, AE or BE (and an A–E equivalent where needed), and the report card shows both. Markbook entries can be edited until the report card is published.",
      tags: ["cbc", "marks", "report card", "grading"] },
    { id: "help_report", category: "Academics", title: "When are report cards released?",
      body: "Report cards are published in the last week of each term and appear immediately in the parent portal. If report cards are locked on arrears, the notice on the portal shows the outstanding balance and the bursar's office can advise on an instalment plan.",
      tags: ["report card", "results", "arrears"] },
    { id: "help_attendance", category: "School life", title: "How is attendance recorded?",
      body: "The class teacher marks the register every morning; the attendance percentage on the portal is the running average for the term. Absences are followed up by SMS to the guardian the same day.",
      tags: ["attendance", "register", "absence"] },
    { id: "help_ict", category: "ICT support", title: "How do I reach the ICT department?",
      body: "The ICT department handles accounts, passwords, devices, printers and the network. Raise a request from the Help Centre, or call the school office. Password resets are done by the administrator or the ICT department only — no one else can see or change a password.",
      tags: ["ict", "support", "contact", "password"] },
    { id: "help_security", category: "ICT support", title: "What security is built into this system?",
      body: "Passwords are stored only as salted scrypt hashes; sign-in is rate-limited with account lockout; every change to the system requires a signed-in account; sessions expire, are capped and are revoked when a password changes or you sign out. The Security tab in the Help Centre shows the live checklist and the audit trail.",
      tags: ["security", "audit", "firewall"] },
    { id: "help_backup", category: "ICT support", title: "How is the school's data backed up?",
      body: "The system stores its data in data/db.json on the school server. The ICT department copies that file to offline storage daily, and before any upgrade. Keep an offline copy before replacing devices or moving the server.",
      tags: ["backup", "data", "ict"] }
  ];

  return {
    accounts,
    sessions,
    passwordResetRequests: [],
    helpArticles,''')
open(p, "w", encoding="utf-8").write(s)
print("seed.js: payment channels, site content, typography, help articles and the reset queue added")
