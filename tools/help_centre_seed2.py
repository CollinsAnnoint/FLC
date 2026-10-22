#!/usr/bin/env python3
"""Add the Help Centre knowledge base and the password-reset queue to data/seed.js."""
import os

os.chdir("/home/user")
p = "data/seed.js"
s = open(p, encoding="utf-8").read()

if "helpArticles" in s:
    print("already present - nothing to do")
    raise SystemExit(0)

ARTICLES = '''  // Help Centre knowledge base. The administrator or the ICT department can extend this
  // from the Help Centre page; the article ids stay stable so links keep working.
  const helpArticles = [
    { id: "help_pay", category: "Fees & payments", title: "How do I pay school fees?",
      body: "Fees can be paid by M-Pesa Paybill 522533 (account FLC-ADMNO), by the temporary M-Pesa Pochi la Biashara number shown on the Fees page, through E-Citizen, by bank deposit to the KCB account, or in cash at the bursar's office. Always quote the learner's admission number. Receipts appear on the portal the same day and a confirmation SMS goes to the guardian.",
      tags: ["mpesa", "fees", "ecitizen", "receipt"] },
    { id: "help_receipt", category: "Fees & payments", title: "My payment is not showing on the portal",
      body: "Fee payments appear as soon as the bursar receipts them, usually within a few minutes of the M-Pesa confirmation. If a payment is still missing after 24 hours, open the Finance page, copy the receipt reference and raise it through the Help Centre so it can be traced.",
      tags: ["receipt", "mpesa", "finance"] },
    { id: "help_password", category: "Accounts & passwords", title: "I have forgotten my portal password",
      body: "Press 'Forgot your password?' on the sign-in screen and send a reset request. The administrator or the ICT department sees it in Help Centre then Password Resets, sets a temporary password and tells you what it is. Sign in with it and change it yourself under Backend Customization Zone then Sign-in & Security.",
      tags: ["password", "sign-in", "reset", "forgotten"] },
    { id: "help_new_staff", category: "Accounts & passwords", title: "A new teacher, bursar or parent needs an account",
      body: "Sign in as the administrator and open Backend Customization Zone then Sign-in & Security to create the account with the right portal role. Parents only ever see their own children; teachers see the classes assigned to them. Disable an account the day a member of staff leaves.",
      tags: ["account", "staff", "roles"] },
    { id: "help_marks", category: "Academics", title: "How are CBC marks recorded and graded?",
      body: "Teachers enter formative and summative scores in the CBC Markbook. The school's grading configuration turns them into EE, ME, AE or BE with an A-E equivalent where needed, and the report card shows both. Entries stay editable until the report card is published.",
      tags: ["cbc", "marks", "report card", "grading"] },
    { id: "help_report", category: "Academics", title: "When are report cards released?",
      body: "Report cards are published in the last week of each term and appear immediately in the parent portal. If they are locked on arrears, the notice on the portal shows the outstanding balance and the bursar's office can advise on an instalment plan.",
      tags: ["report card", "results", "arrears"] },
    { id: "help_attendance", category: "School life", title: "How is attendance recorded?",
      body: "The class teacher marks the register every morning; the attendance figure on the portal is the running average for the term. Absences are followed up by SMS to the guardian the same day.",
      tags: ["attendance", "register", "absence"] },
    { id: "help_ict", category: "ICT support", title: "How do I reach the ICT department?",
      body: "The ICT department handles accounts, passwords, devices, printers and the network. Raise a request from the Help Centre or call the school office. Password resets are done by the administrator or the ICT department only.",
      tags: ["ict", "support", "contact", "password"] },
    { id: "help_security", category: "ICT support", title: "What security is built into this system?",
      body: "Passwords are stored only as salted scrypt hashes; sign-in is rate-limited with account lockout; requests carry security headers; every change requires a signed-in account; sessions are capped, expire, and are revoked when the password changes or you sign out. Help Centre then Security shows the live checklist and the audit trail.",
      tags: ["security", "audit", "headers"] },
    { id: "help_backup", category: "ICT support", title: "How is the school's data backed up?",
      body: "The system stores its data in data/db.json on the school server. The ICT department should copy that file to offline storage daily and before any upgrade. Keep an offline copy before replacing devices or moving the server.",
      tags: ["backup", "data", "ict"] }
  ];

'''

# the array goes just above the final return block
marker = "  return {\n    accounts,\n    sessions: [],"
assert marker in s, "final return block not found"
s = s.replace(marker, ARTICLES + marker, 1)

# and both collections join the returned database
s = s.replace('''    accounts,
    sessions: [],
    systemConfig,''',
'''    accounts,
    sessions: [],
    passwordResetRequests: [],
    helpArticles,
    systemConfig,''', 1)

open(p, "w", encoding="utf-8").write(s)
print("helpArticles + passwordResetRequests added to data/seed.js")
