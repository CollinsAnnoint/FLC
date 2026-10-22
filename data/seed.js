// Seed dataset for FAITH LEARNING CENTRE — Full-Pack School ERP & Backend Customization Zone
//
// Portal sign-in accounts live here. Passwords are never stored in clear: each account keeps a
// random salt and a scrypt hash of the password, and the server compares hashes at sign-in.
const crypto = require("crypto");

function makeAccount(email, password, role, name, demoPassword) {
  const salt = crypto.randomBytes(12).toString("hex");
  return {
    id: "acc_" + role,
    email,
    role,                       // admin | teacher | finance | parent
    name,
    salt,
    passwordHash: crypto.scryptSync(String(password), salt, 32).toString("hex"),
    // Demonstration accounts state their password on the sign-in screen so the portals can be reviewed;
    // the administrator account does not.
    demoPassword: demoPassword || null,
    active: true,
    createdAt: "2026-10-11 08:00"
  };
}

function createInitialDatabase() {
  const systemConfig = {
    branding: {
      schoolName: "FAITH LEARNING CENTRE",
      shortName: "FLC",
      motto: "Rooted in Faith, Excelling in Competence & Character",
      vision: "To nurture holistic, ethical, and globally competitive learners grounded in Christian values and academic excellence.",
      mission: "Providing quality Competency-Based Education in a caring, innovative, and learner-centered environment.",
      knecCode: "20408192",
      nemisCode: "NEMIS-KE-40918",
      regNumber: "MOE/P&JSS/NRB/2018/0412",
      address: "P.O. Box 41892-00100, Ngong Road, Nairobi, Kenya",
      phone: "0769679217",
      email: "info@faithlearningcentre.ac.ke",
      website: "www.faithlearningcentre.ac.ke",
      principalName: "Mrs. Grace Wanjiku Mwangi, M.Ed",
      bursarName: "CPA David Ochieng Otieno",
      primaryColor: "#141316",
      accentColor: "#e4002b",
      homeDesign: "8",
      sidebarTheme: "onyx",
      uiDensity: "comfortable",
      crestStyle: "shield",
      receiptFooter: "Thank you for partnering with Faith Learning Centre. Fees once paid are non-refundable.",
      reportCardFooter: "Official Competency-Based Curriculum (CBC) & Academic Progress Report — Faith Learning Centre."
    },
    modules: {
      academics: {
        enabled: true,
        label: "CBC & Academic Assessment",
        icon: "graduation-cap",
        description: "Markbooks, CBC rubrics (EE/ME/AE/BE), 8-4-4 grades, and official printable report cards"
      },
      finance: {
        enabled: true,
        label: "Finance, Bursar & M-Pesa",
        icon: "wallet",
        description: "Term fee structures, M-Pesa Paybill & STK Push receipting, arrears tracking, and expenses"
      },
      attendance: {
        enabled: true,
        label: "Daily Roll-Call & Attendance",
        icon: "calendar-check",
        description: "Daily class attendance registers, tardiness tracking, and automated parent absence alerts"
      },
      timetable: {
        enabled: true,
        label: "Master Timetable & Lessons",
        icon: "clock",
        description: "Weekly class schedules across grades, room allocations, and teacher lesson planner"
      },
      staff: {
        enabled: true,
        label: "Staff, TSC & Payroll",
        icon: "users",
        description: "Teaching & non-teaching HR directory, TSC registration, SHIF/NSSF/Housing Levy payroll"
      },
      transport: {
        enabled: true,
        label: "Transport & School Fleet",
        icon: "bus",
        description: "School bus routes, fleet management, driver assignments, and student transport billing"
      },
      boarding: {
        enabled: true,
        label: "Boarding & Hostels",
        icon: "home",
        description: "Dormitory houses, bed capacity, matron supervision, and boarder allocations"
      },
      library: {
        enabled: true,
        label: "Library & CBC Textbooks",
        icon: "book-open",
        description: "KICD textbook inventory, book lending register, and overdue book tracking"
      },
      discipline: {
        enabled: true,
        label: "Merits, Clubs & Discipline",
        icon: "award",
        description: "Learner character merits, leadership badges, clubs, and guidance records"
      },
      communications: {
        enabled: true,
        label: "SMS Broadcast & Noticeboard",
        icon: "message-square",
        description: "Bulk SMS broadcasts to parents, fee balance alerts, and digital school circulars"
      }
    },
    academicConfig: {
      currentYear: "2026",
      currentTerm: "Term 3",
      termStartDate: "2026-08-31",
      termEndDate: "2026-11-20",
      nextTermOpening: "2027-01-05",
      gradingMode: "hybrid", // 'cbc' | 'standard' | 'hybrid'
      sbaWeight: 40,
      examWeight: 60,
      activeExamType: "End-Term Assessment",
      examTypes: [
        "Opener Assessment",
        "Mid-Term CAT",
        "School-Based Assessment (SBA)",
        "End-Term Assessment"
      ],
      cbcRubricScale: [
        {
          code: "EE",
          subCode: "EE1",
          label: "Exceeding Expectations",
          min: 80,
          max: 100,
          points: 4,
          color: "#15803d",
          remark: "Consistently demonstrates exceptional mastery of strand competencies and helps peers."
        },
        {
          code: "ME",
          subCode: "ME1",
          label: "Meeting Expectations",
          min: 60,
          max: 79,
          points: 3,
          color: "#1d4ed8",
          remark: "Demonstrates solid understanding of learning outcomes and applies skills accurately."
        },
        {
          code: "AE",
          subCode: "AE1",
          label: "Approaching Expectations",
          min: 40,
          max: 59,
          points: 2,
          color: "#d97706",
          remark: "Developing competency; requires targeted practice and teacher guidance."
        },
        {
          code: "BE",
          subCode: "BE1",
          label: "Below Expectations",
          min: 0,
          max: 39,
          points: 1,
          color: "#dc2626",
          remark: "Needs intensive remedial support and foundational scaffolding."
        }
      ],
      standardGradeScale: [
        { grade: "A", min: 80, max: 100, points: 12, remark: "Excellent achievement! Keep aiming high." },
        { grade: "A-", min: 75, max: 79, points: 11, remark: "Very good performance." },
        { grade: "B+", min: 70, max: 74, points: 10, remark: "Good work, capable of reaching an A." },
        { grade: "B", min: 65, max: 69, points: 9, remark: "Above average, steady progress." },
        { grade: "B-", min: 60, max: 64, points: 8, remark: "Fairly good, put in extra effort." },
        { grade: "C+", min: 55, max: 59, points: 7, remark: "Average performance, room to improve." },
        { grade: "C", min: 50, max: 54, points: 6, remark: "Satisfactory, more revision needed." },
        { grade: "D+", min: 40, max: 49, points: 4, remark: "Below average, requires close follow-up." },
        { grade: "E", min: 0, max: 39, points: 2, remark: "Urgent remedial intervention required." }
      ],
      gradeLevels: [
        "PP1",
        "PP2",
        "Grade 1",
        "Grade 2",
        "Grade 3",
        "Grade 4",
        "Grade 5",
        "Grade 6",
        "Grade 7 (JSS)",
        "Grade 8 (JSS)",
        "Grade 9 (JSS)"
      ],
      streams: ["Faith", "Grace", "Unity", "Victory"],
      learningAreas: [
        { code: "MATH", name: "Mathematics", category: "Core", active: true },
        { code: "ENG", name: "English Language", category: "Core", active: true },
        { code: "KIS", name: "Kiswahili Lugha", category: "Core", active: true },
        { code: "SCI", name: "Integrated Science & Health", category: "STEM", active: true },
        { code: "AGRI", name: "Agriculture & Nutrition", category: "Applied", active: true },
        { code: "SST", name: "Social Studies & Citizenship", category: "Humanities", active: true },
        { code: "CRE", name: "Christian Religious Education", category: "Values", active: true },
        { code: "PRETECH", name: "Pre-Technical & Computer Studies", category: "STEM", active: true },
        { code: "ARTS", name: "Creative Arts, Music & Sports", category: "Talent", active: true }
      ]
    },
    customFields: [
      {
        id: "cf_blood_group",
        entity: "student",
        key: "bloodGroup",
        label: "Blood Group",
        type: "select",
        options: ["O+", "A+", "B+", "AB+", "O-", "Unknown"],
        required: false,
        active: true
      },
      {
        id: "cf_talent_club",
        entity: "student",
        key: "talentClub",
        label: "CBC Talent & Club Society",
        type: "select",
        options: [
          "Robotics & Coding Club",
          "Choir & Worship Band",
          "Scouts & Girl Guides",
          "Debate & Journalism",
          "Young Farmers (4-K Club)",
          "Swimming & Athletics",
          "Drama & Fine Arts"
        ],
        required: false,
        active: true
      },
      {
        id: "cf_dietary_medical",
        entity: "student",
        key: "dietaryMedical",
        label: "Medical / Allergy Notes",
        type: "text",
        options: [],
        required: false,
        active: true
      },
      {
        id: "cf_cbc_certified",
        entity: "staff",
        key: "cbcCertified",
        label: "KICD CBC Retooling Status",
        type: "select",
        options: ["Certified (JSS & Primary)", "Certified (Primary)", "Scheduled"],
        required: false,
        active: true
      }
    ],
    financeConfig: {
      currency: "KES",
      mpesaPaybill: "522533",
      mpesaAccountPrefix: "FLC",
      bankName: "KCB Bank Kenya — Ngong Road Branch",
      bankAccount: "1180492817",
      arrearsAlertThreshold: 10000,
      allowParentPortalMpesa: true,
      lockReportCardOnArrears: false,
      lockReportCardThreshold: 15000,
      smsGatewayProvider: "Africa's Talking KE",
      smsSenderId: "FAITH_LC",
      smsBalanceCredits: 4850,
      autoSmsOnPayment: true,
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
    },
    // Everything the administrator can rewrite from the website editing bar.
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
      preset: "rubik",
      scale: "normal",
      updatedAt: null
    },
    terms: {
      version: "2.1",
      effectiveDate: "2026-09-01",
      lastUpdated: "2026-09-01",
      enforceTermsAtLogin: true,
      requireAtAdmission: true,
      refundNoticeDays: 14,
      withdrawalNoticeDays: 30,
      feeDeadlineWeek: "Week 3 of every term",
      arrearsAction:
        "Where a fee balance exceeds KES 15,000 or remains unpaid by Week 8 of the term, the school may withhold the learner's report card and exclude the learner from end-term examinations until the balance is cleared.",
      academicHonesty:
        "All School-Based Assessment (SBA) and examination work must be the learner's own. Plagiarism, impersonation or examination malpractice may lead to cancellation of results and a disciplinary panel.",
      attendanceRequirement:
        "Learners must be present by 7:45 AM. Absence must be reported to the class teacher by 9:00 AM on the day of absence through the school office or the parent portal.",
      dpoEmail: "dpo@faithlearningcentre.ac.ke",
      photoConsentDefault: true,
      complaintsChannel: "The Principal's Office, in writing, within 14 days of the matter arising."
    },
    rolePermissions: {
      teacher: {
        canEditMarks: true,
        canMarkAttendance: true,
        canViewFeeBalances: false,
        canSendParentSms: true,
        canManageLibrary: true
      },
      bursar: {
        canCollectFees: true,
        canEditFeeStructure: true,
        canManagePayroll: true,
        canSendFeeReminders: true,
        canViewAcademicMarks: false
      },
      parent: {
        canViewReportCard: true,
        canPayViaMpesa: true,
        canViewAttendance: true,
        canViewTimetable: true,
        canDownloadReceipts: true
      }
    }
  };

  const feeStructures = [
    {
      id: "fs_pp",
      levelGroup: "Pre-Primary (PP1 & PP2)",
      grades: ["PP1", "PP2"],
      tuition: 14500,
      meals: 4500,
      activityCbc: 2500,
      ictLibrary: 1500,
      boardingFee: 0,
      totalDay: 23000,
      totalBoarding: 23000
    },
    {
      id: "fs_lower",
      levelGroup: "Lower Primary (Grade 1 – Grade 3)",
      grades: ["Grade 1", "Grade 2", "Grade 3"],
      tuition: 18500,
      meals: 5500,
      activityCbc: 3000,
      ictLibrary: 2000,
      boardingFee: 0,
      totalDay: 29000,
      totalBoarding: 29000
    },
    {
      id: "fs_upper",
      levelGroup: "Upper Primary (Grade 4 – Grade 6)",
      grades: ["Grade 4", "Grade 5", "Grade 6"],
      tuition: 22000,
      meals: 6000,
      activityCbc: 3500,
      ictLibrary: 2500,
      boardingFee: 14000,
      totalDay: 34000,
      totalBoarding: 48000
    },
    {
      id: "fs_jss",
      levelGroup: "Junior School / JSS (Grade 7 – Grade 9)",
      grades: ["Grade 7 (JSS)", "Grade 8 (JSS)", "Grade 9 (JSS)"],
      tuition: 28000,
      meals: 7000,
      activityCbc: 5000,
      ictLibrary: 4000,
      boardingFee: 16000,
      totalDay: 44000,
      totalBoarding: 60000
    }
  ];

  const students = [
    {
      id: "stu_01",
      admNo: "FLC/2026/001",
      nemisUpi: "KEM-904182A",
      assessmentNo: "KNEC-7019281",
      firstName: "Imani",
      lastName: "Wanjiru Kamau",
      gender: "Female",
      dob: "2012-04-14",
      grade: "Grade 8 (JSS)",
      stream: "Faith",
      boardingStatus: "Boarding",
      dormHouse: "Grace Wing",
      transportRoute: "None (Boarder)",
      transportFee: 0,
      guardianName: "Eng. Peter Kamau Njoroge",
      guardianRelation: "Father",
      guardianPhone: "+254 722 341 890",
      guardianEmail: "pkamau@gmail.com",
      billedAmount: 60000,
      paidAmount: 60000,
      balance: 0,
      status: "Active",
      enrollmentDate: "2022-01-10",
      attendanceRate: 98,
      coreCompetencies: {
        communication: "Exceeding",
        criticalThinking: "Exceeding",
        digitalLiteracy: "Meeting",
        citizenship: "Exceeding",
        selfEfficacy: "Exceeding"
      },
      customData: {
        bloodGroup: "O+",
        talentClub: "Robotics & Coding Club",
        dietaryMedical: "None"
      }
    },
    {
      id: "stu_02",
      admNo: "FLC/2026/002",
      nemisUpi: "KEM-882319B",
      assessmentNo: "KNEC-7019282",
      firstName: "Jabari",
      lastName: "Odhiambo Otieno",
      gender: "Male",
      dob: "2012-09-22",
      grade: "Grade 8 (JSS)",
      stream: "Faith",
      boardingStatus: "Day",
      dormHouse: "N/A",
      transportRoute: "Route A — Kilimani / Ngong Rd",
      transportFee: 6500,
      guardianName: "Dr. Millicent Achieng",
      guardianRelation: "Mother",
      guardianPhone: "+254 733 612 409",
      guardianEmail: "m.achieng@hospital.co.ke",
      billedAmount: 50500,
      paidAmount: 42000,
      balance: 8500,
      status: "Active",
      enrollmentDate: "2022-01-12",
      attendanceRate: 95,
      coreCompetencies: {
        communication: "Meeting",
        criticalThinking: "Exceeding",
        digitalLiteracy: "Exceeding",
        citizenship: "Meeting",
        selfEfficacy: "Meeting"
      },
      customData: {
        bloodGroup: "A+",
        talentClub: "Debate & Journalism",
        dietaryMedical: "Mild dust allergy"
      }
    },
    {
      id: "stu_03",
      admNo: "FLC/2026/003",
      nemisUpi: "KEM-773410C",
      assessmentNo: "KNEC-8091124",
      firstName: "Neema",
      lastName: "Chebet Kiprop",
      gender: "Female",
      dob: "2011-02-08",
      grade: "Grade 9 (JSS)",
      stream: "Grace",
      boardingStatus: "Boarding",
      dormHouse: "Faith House",
      transportRoute: "None (Boarder)",
      transportFee: 0,
      guardianName: "Mr. Hillary Kiprop Sang",
      guardianRelation: "Father",
      guardianPhone: "+254 710 998 312",
      guardianEmail: "hkiprop@agrokenya.co.ke",
      billedAmount: 60000,
      paidAmount: 41000,
      balance: 19000,
      status: "Active",
      enrollmentDate: "2021-01-14",
      attendanceRate: 96,
      coreCompetencies: {
        communication: "Exceeding",
        criticalThinking: "Meeting",
        digitalLiteracy: "Meeting",
        citizenship: "Exceeding",
        selfEfficacy: "Exceeding"
      },
      customData: {
        bloodGroup: "B+",
        talentClub: "Swimming & Athletics",
        dietaryMedical: "None"
      }
    },
    {
      id: "stu_04",
      admNo: "FLC/2026/004",
      nemisUpi: "KEM-654901D",
      assessmentNo: "KNEC-8091150",
      firstName: "Baraka",
      lastName: "Mwendwa Mutua",
      gender: "Male",
      dob: "2011-07-19",
      grade: "Grade 9 (JSS)",
      stream: "Grace",
      boardingStatus: "Boarding",
      dormHouse: "Unity House",
      transportRoute: "None (Boarder)",
      transportFee: 0,
      guardianName: "Mrs. Esther Ndunge Mutua",
      guardianRelation: "Mother",
      guardianPhone: "+254 721 504 776",
      guardianEmail: "esther.mutua@yahoo.com",
      billedAmount: 60000,
      paidAmount: 60000,
      balance: 0,
      status: "Active",
      enrollmentDate: "2021-01-15",
      attendanceRate: 99,
      coreCompetencies: {
        communication: "Exceeding",
        criticalThinking: "Exceeding",
        digitalLiteracy: "Exceeding",
        citizenship: "Exceeding",
        selfEfficacy: "Exceeding"
      },
      customData: {
        bloodGroup: "O+",
        talentClub: "Robotics & Coding Club",
        dietaryMedical: "None"
      }
    },
    {
      id: "stu_05",
      admNo: "FLC/2026/005",
      nemisUpi: "KEM-519204E",
      assessmentNo: "KNEC-6044210",
      firstName: "Zuri",
      lastName: "Nyambura Kariuki",
      gender: "Female",
      dob: "2013-11-03",
      grade: "Grade 7 (JSS)",
      stream: "Faith",
      boardingStatus: "Day",
      dormHouse: "N/A",
      transportRoute: "Route B — Karen / Lang'ata",
      transportFee: 7500,
      guardianName: "Mr. Simon Kariuki Mburu",
      guardianRelation: "Father",
      guardianPhone: "+254 720 817 550",
      guardianEmail: "skariuki@outlook.com",
      billedAmount: 51500,
      paidAmount: 35000,
      balance: 16500,
      status: "Active",
      enrollmentDate: "2023-01-09",
      attendanceRate: 92,
      coreCompetencies: {
        communication: "Meeting",
        criticalThinking: "Meeting",
        digitalLiteracy: "Meeting",
        citizenship: "Exceeding",
        selfEfficacy: "Meeting"
      },
      customData: {
        bloodGroup: "A+",
        talentClub: "Choir & Worship Band",
        dietaryMedical: "Lactose sensitive"
      }
    },
    {
      id: "stu_06",
      admNo: "FLC/2026/006",
      nemisUpi: "KEM-409112F",
      assessmentNo: "KNEC-5032198",
      firstName: "Ethan",
      lastName: "Kiptoo Ruto",
      gender: "Male",
      dob: "2014-05-27",
      grade: "Grade 6",
      stream: "Unity",
      boardingStatus: "Day",
      dormHouse: "N/A",
      transportRoute: "Route C — Lavington / Kawangware",
      transportFee: 5500,
      guardianName: "Mrs. Joyce Chepkoech",
      guardianRelation: "Mother",
      guardianPhone: "+254 724 119 832",
      guardianEmail: "jchepkoech@gmail.com",
      billedAmount: 39500,
      paidAmount: 39500,
      balance: 0,
      status: "Active",
      enrollmentDate: "2020-01-08",
      attendanceRate: 97,
      coreCompetencies: {
        communication: "Exceeding",
        criticalThinking: "Exceeding",
        digitalLiteracy: "Meeting",
        citizenship: "Exceeding",
        selfEfficacy: "Exceeding"
      },
      customData: {
        bloodGroup: "O+",
        talentClub: "Scouts & Girl Guides",
        dietaryMedical: "None"
      }
    },
    {
      id: "stu_07",
      admNo: "FLC/2026/007",
      nemisUpi: "KEM-389205G",
      assessmentNo: "KNEC-5032204",
      firstName: "Amani",
      lastName: "Wafula Wekesa",
      gender: "Male",
      dob: "2014-08-12",
      grade: "Grade 6",
      stream: "Unity",
      boardingStatus: "Boarding",
      dormHouse: "Victory Wing",
      transportRoute: "None (Boarder)",
      transportFee: 0,
      guardianName: "Prof. Moses Wekesa",
      guardianRelation: "Father",
      guardianPhone: "+254 712 405 600",
      guardianEmail: "mwekesa@uonbi.ac.ke",
      billedAmount: 48000,
      paidAmount: 30000,
      balance: 18000,
      status: "Active",
      enrollmentDate: "2021-05-03",
      attendanceRate: 91,
      coreCompetencies: {
        communication: "Meeting",
        criticalThinking: "Approaching",
        digitalLiteracy: "Meeting",
        citizenship: "Meeting",
        selfEfficacy: "Approaching"
      },
      customData: {
        bloodGroup: "B+",
        talentClub: "Young Farmers (4-K Club)",
        dietaryMedical: "Asthma inhaler in clinic"
      }
    },
    {
      id: "stu_08",
      admNo: "FLC/2026/008",
      nemisUpi: "KEM-294811H",
      assessmentNo: "KNEC-4021890",
      firstName: "Tiana",
      lastName: "Makena Gitonga",
      gender: "Female",
      dob: "2015-03-16",
      grade: "Grade 5",
      stream: "Faith",
      boardingStatus: "Day",
      dormHouse: "N/A",
      transportRoute: "Route A — Kilimani / Ngong Rd",
      transportFee: 6500,
      guardianName: "Mr. Alex Gitonga Nkatha",
      guardianRelation: "Father",
      guardianPhone: "+254 728 901 234",
      guardianEmail: "agitonga@kcb.co.ke",
      billedAmount: 40500,
      paidAmount: 40500,
      balance: 0,
      status: "Active",
      enrollmentDate: "2021-01-11",
      attendanceRate: 100,
      coreCompetencies: {
        communication: "Exceeding",
        criticalThinking: "Exceeding",
        digitalLiteracy: "Exceeding",
        citizenship: "Exceeding",
        selfEfficacy: "Exceeding"
      },
      customData: {
        bloodGroup: "AB+",
        talentClub: "Drama & Fine Arts",
        dietaryMedical: "None"
      }
    },
    {
      id: "stu_09",
      admNo: "FLC/2026/009",
      nemisUpi: "KEM-198432J",
      assessmentNo: "KNEC-3011452",
      firstName: "Liam",
      lastName: "Ndegwa Wachira",
      gender: "Male",
      dob: "2016-10-05",
      grade: "Grade 4",
      stream: "Grace",
      boardingStatus: "Day",
      dormHouse: "N/A",
      transportRoute: "Route D — Westlands / Kileleshwa",
      transportFee: 7000,
      guardianName: "Ms. Caroline Wachira",
      guardianRelation: "Mother",
      guardianPhone: "+254 715 678 902",
      guardianEmail: "cwachira@safaricom.co.ke",
      billedAmount: 41000,
      paidAmount: 29000,
      balance: 12000,
      status: "Active",
      enrollmentDate: "2022-01-10",
      attendanceRate: 94,
      coreCompetencies: {
        communication: "Meeting",
        criticalThinking: "Meeting",
        digitalLiteracy: "Exceeding",
        citizenship: "Meeting",
        selfEfficacy: "Meeting"
      },
      customData: {
        bloodGroup: "O+",
        talentClub: "Robotics & Coding Club",
        dietaryMedical: "None"
      }
    },
    {
      id: "stu_10",
      admNo: "FLC/2026/010",
      nemisUpi: "KEM-102948K",
      assessmentNo: "KNEC-2019401",
      firstName: "Malaika",
      lastName: "Zawadi Hassan",
      gender: "Female",
      dob: "2018-01-21",
      grade: "Grade 3",
      stream: "Victory",
      boardingStatus: "Day",
      dormHouse: "N/A",
      transportRoute: "Route A — Kilimani / Ngong Rd",
      transportFee: 6500,
      guardianName: "Mr. Rashid Hassan Omar",
      guardianRelation: "Father",
      guardianPhone: "+254 723 445 119",
      guardianEmail: "rhassan@logistics.ke",
      billedAmount: 35500,
      paidAmount: 35500,
      balance: 0,
      status: "Active",
      enrollmentDate: "2023-01-12",
      attendanceRate: 97,
      coreCompetencies: {
        communication: "Exceeding",
        criticalThinking: "Meeting",
        digitalLiteracy: "Meeting",
        citizenship: "Exceeding",
        selfEfficacy: "Exceeding"
      },
      customData: {
        bloodGroup: "A+",
        talentClub: "Choir & Worship Band",
        dietaryMedical: "Halal meals"
      }
    },
    {
      id: "stu_11",
      admNo: "FLC/2026/011",
      nemisUpi: "KEM-998123L",
      assessmentNo: "KNEC-1008321",
      firstName: "Noah",
      lastName: "Mutuku Musyoka",
      gender: "Male",
      dob: "2019-06-30",
      grade: "Grade 1",
      stream: "Faith",
      boardingStatus: "Day",
      dormHouse: "N/A",
      transportRoute: "Route B — Karen / Lang'ata",
      transportFee: 7500,
      guardianName: "Mrs. Faith Nduku Musyoka",
      guardianRelation: "Mother",
      guardianPhone: "+254 729 301 448",
      guardianEmail: "fmusyoka@gmail.com",
      billedAmount: 36500,
      paidAmount: 25000,
      balance: 11500,
      status: "Active",
      enrollmentDate: "2025-01-08",
      attendanceRate: 93,
      coreCompetencies: {
        communication: "Meeting",
        criticalThinking: "Meeting",
        digitalLiteracy: "Approaching",
        citizenship: "Meeting",
        selfEfficacy: "Meeting"
      },
      customData: {
        bloodGroup: "O+",
        talentClub: "Swimming & Athletics",
        dietaryMedical: "Peanut allergy"
      }
    },
    {
      id: "stu_12",
      admNo: "FLC/2026/012",
      nemisUpi: "KEM-887102M",
      assessmentNo: "KNEC-0091823",
      firstName: "Abigail",
      lastName: "Wambui Njuguna",
      gender: "Female",
      dob: "2021-02-14",
      grade: "PP2",
      stream: "Grace",
      boardingStatus: "Day",
      dormHouse: "N/A",
      transportRoute: "Route C — Lavington / Kawangware",
      transportFee: 5500,
      guardianName: "Mr. Patrick Njuguna Karanja",
      guardianRelation: "Father",
      guardianPhone: "+254 718 220 910",
      guardianEmail: "pnjuguna@equitybank.co.ke",
      billedAmount: 28500,
      paidAmount: 28500,
      balance: 0,
      status: "Active",
      enrollmentDate: "2025-01-08",
      attendanceRate: 98,
      coreCompetencies: {
        communication: "Exceeding",
        criticalThinking: "Meeting",
        digitalLiteracy: "Meeting",
        citizenship: "Exceeding",
        selfEfficacy: "Exceeding"
      },
      customData: {
        bloodGroup: "B+",
        talentClub: "Drama & Fine Arts",
        dietaryMedical: "None"
      }
    }
  ];

  // Assessments / Marks for Term 3 2026
  // Each student has scores per learning area: { sba: 0-100, exam: 0-100 }
  const assessments = {
    "stu_01": {
      MATH: { sba: 90, exam: 88 },
      ENG: { sba: 86, exam: 91 },
      KIS: { sba: 82, exam: 84 },
      SCI: { sba: 88, exam: 85 },
      AGRI: { sba: 84, exam: 87 },
      SST: { sba: 80, exam: 82 },
      CRE: { sba: 92, exam: 94 },
      PRETECH: { sba: 95, exam: 92 },
      ARTS: { sba: 88, exam: 90 },
      teacherComment: "Imani is an exemplary learner who demonstrates outstanding leadership in Robotics and STEM strands.",
      principalComment: "Excellent performance across all learning areas. Keep shining!"
    },
    "stu_02": {
      MATH: { sba: 76, exam: 72 },
      ENG: { sba: 84, exam: 86 },
      KIS: { sba: 78, exam: 75 },
      SCI: { sba: 74, exam: 70 },
      AGRI: { sba: 71, exam: 68 },
      SST: { sba: 82, exam: 80 },
      CRE: { sba: 80, exam: 78 },
      PRETECH: { sba: 85, exam: 82 },
      ARTS: { sba: 79, exam: 76 },
      teacherComment: "Jabari excels in communication, debate, and digital literacy. Keep practicing Mathematics problem-solving.",
      principalComment: "Solid progress this term. Aim for Exceeding Expectations in all STEM subjects."
    },
    "stu_03": {
      MATH: { sba: 68, exam: 64 },
      ENG: { sba: 82, exam: 80 },
      KIS: { sba: 85, exam: 88 },
      SCI: { sba: 72, exam: 69 },
      AGRI: { sba: 88, exam: 84 },
      SST: { sba: 79, exam: 75 },
      CRE: { sba: 90, exam: 87 },
      PRETECH: { sba: 70, exam: 66 },
      ARTS: { sba: 94, exam: 92 },
      teacherComment: "Neema shows remarkable talent in athletics, Kiswahili, and Agriculture. Extra coaching in Mathematics will boost her overall score.",
      principalComment: "Well done Neema! Continue balancing sports excellence with academic focus."
    },
    "stu_04": {
      MATH: { sba: 94, exam: 96 },
      ENG: { sba: 88, exam: 85 },
      KIS: { sba: 80, exam: 83 },
      SCI: { sba: 92, exam: 94 },
      AGRI: { sba: 86, exam: 89 },
      SST: { sba: 84, exam: 86 },
      CRE: { sba: 90, exam: 91 },
      PRETECH: { sba: 96, exam: 95 },
      ARTS: { sba: 85, exam: 84 },
      teacherComment: "Baraka is our top Junior School scholar with exceptional analytical and scientific inquiry skills.",
      principalComment: "Commendable achievement, Baraka! You are a role model to the entire student body."
    },
    "stu_05": {
      MATH: { sba: 62, exam: 58 },
      ENG: { sba: 75, exam: 73 },
      KIS: { sba: 70, exam: 68 },
      SCI: { sba: 65, exam: 61 },
      AGRI: { sba: 74, exam: 72 },
      SST: { sba: 72, exam: 70 },
      CRE: { sba: 84, exam: 82 },
      PRETECH: { sba: 66, exam: 64 },
      ARTS: { sba: 88, exam: 86 },
      teacherComment: "Zuri is creative and active in Choir. More attention to Integrated Science and Mathematics concepts is encouraged.",
      principalComment: "Good effort Zuri. Consistent revision will lift your grades to Exceeding Expectations."
    },
    "stu_06": {
      MATH: { sba: 85, exam: 83 },
      ENG: { sba: 80, exam: 82 },
      KIS: { sba: 78, exam: 77 },
      SCI: { sba: 86, exam: 84 },
      AGRI: { sba: 82, exam: 80 },
      SST: { sba: 84, exam: 81 },
      CRE: { sba: 88, exam: 89 },
      PRETECH: { sba: 80, exam: 78 },
      ARTS: { sba: 83, exam: 85 },
      teacherComment: "Ethan is a disciplined and well-rounded Grade 6 KPSEA candidate.",
      principalComment: "Great preparation for Junior School transition!"
    },
    "stu_07": {
      MATH: { sba: 52, exam: 48 },
      ENG: { sba: 60, exam: 56 },
      KIS: { sba: 64, exam: 62 },
      SCI: { sba: 55, exam: 50 },
      AGRI: { sba: 78, exam: 75 },
      SST: { sba: 58, exam: 54 },
      CRE: { sba: 70, exam: 68 },
      PRETECH: { sba: 54, exam: 52 },
      ARTS: { sba: 74, exam: 72 },
      teacherComment: "Amani thrives in practical Agriculture projects but needs close remedial support in Mathematics and Science.",
      principalComment: "Enrolled in afternoon remedial clinic to strengthen core competencies."
    },
    "stu_08": {
      MATH: { sba: 88, exam: 90 },
      ENG: { sba: 92, exam: 94 },
      KIS: { sba: 86, exam: 85 },
      SCI: { sba: 89, exam: 87 },
      AGRI: { sba: 84, exam: 86 },
      SST: { sba: 87, exam: 88 },
      CRE: { sba: 95, exam: 93 },
      PRETECH: { sba: 86, exam: 88 },
      ARTS: { sba: 93, exam: 95 },
      teacherComment: "Tiana has 100% attendance and excels in public speaking and all academic strands.",
      principalComment: "Outstanding work, Tiana!"
    },
    "stu_09": {
      MATH: { sba: 78, exam: 74 },
      ENG: { sba: 72, exam: 70 },
      KIS: { sba: 68, exam: 65 },
      SCI: { sba: 76, exam: 73 },
      AGRI: { sba: 70, exam: 72 },
      SST: { sba: 74, exam: 71 },
      CRE: { sba: 80, exam: 78 },
      PRETECH: { sba: 84, exam: 82 },
      ARTS: { sba: 75, exam: 77 },
      teacherComment: "Liam is enthusiastic about coding and science experiments. Encourage daily Kiswahili reading at home.",
      principalComment: "Steady progress. Keep working hard!"
    },
    "stu_10": {
      MATH: { sba: 82, exam: 80 },
      ENG: { sba: 88, exam: 86 },
      KIS: { sba: 90, exam: 92 },
      SCI: { sba: 80, exam: 78 },
      AGRI: { sba: 82, exam: 84 },
      SST: { sba: 85, exam: 83 },
      CRE: { sba: 86, exam: 88 },
      PRETECH: { sba: 78, exam: 80 },
      ARTS: { sba: 89, exam: 91 },
      teacherComment: "Malaika is polite, fluent in Kiswahili and English, and very supportive of her classmates.",
      principalComment: "Wonderful performance!"
    },
    "stu_11": {
      MATH: { sba: 70, exam: 68 },
      ENG: { sba: 74, exam: 72 },
      KIS: { sba: 72, exam: 70 },
      SCI: { sba: 76, exam: 74 },
      AGRI: { sba: 75, exam: 73 },
      SST: { sba: 71, exam: 69 },
      CRE: { sba: 82, exam: 80 },
      PRETECH: { sba: 68, exam: 66 },
      ARTS: { sba: 84, exam: 82 },
      teacherComment: "Noah is settling well into Grade 1 literacy and numeracy strands.",
      principalComment: "Good foundation!"
    },
    "stu_12": {
      MATH: { sba: 88, exam: 86 },
      ENG: { sba: 90, exam: 89 },
      KIS: { sba: 84, exam: 86 },
      SCI: { sba: 87, exam: 85 },
      AGRI: { sba: 86, exam: 88 },
      SST: { sba: 88, exam: 87 },
      CRE: { sba: 92, exam: 94 },
      PRETECH: { sba: 85, exam: 84 },
      ARTS: { sba: 95, exam: 94 },
      teacherComment: "Abigail is joyful, expressive, and masters psychomotor and literacy activities effortlessly.",
      principalComment: "Ready for Grade 1 with flying colours!"
    }
  };

  const payments = [
    {
      id: "pay_01",
      receiptNo: "FLC-RCP-2026-101",
      studentId: "stu_01",
      studentName: "Imani Wanjiru Kamau",
      admNo: "FLC/2026/001",
      grade: "Grade 8 (JSS)",
      amount: 60000,
      method: "M-Pesa Paybill",
      reference: "UKA92M4XLP",
      paidBy: "Eng. Peter Kamau (+254 722 341 890)",
      date: "2026-09-02",
      term: "Term 3",
      votehead: "Full Term 3 Tuition & Boarding",
      recordedBy: "CPA David Ochieng"
    },
    {
      id: "pay_02",
      receiptNo: "FLC-RCP-2026-102",
      studentId: "stu_02",
      studentName: "Jabari Odhiambo Otieno",
      admNo: "FLC/2026/002",
      grade: "Grade 8 (JSS)",
      amount: 42000,
      method: "M-Pesa Paybill",
      reference: "UKB41N8QWE",
      paidBy: "Dr. Millicent Achieng (+254 733 612 409)",
      date: "2026-09-04",
      term: "Term 3",
      votehead: "Tuition & Transport Deposit",
      recordedBy: "CPA David Ochieng"
    },
    {
      id: "pay_03",
      receiptNo: "FLC-RCP-2026-103",
      studentId: "stu_03",
      studentName: "Neema Chebet Kiprop",
      admNo: "FLC/2026/003",
      grade: "Grade 9 (JSS)",
      amount: 41000,
      method: "KCB Bank Deposit",
      reference: "KCB-99401822",
      paidBy: "Mr. Hillary Kiprop Sang",
      date: "2026-09-06",
      term: "Term 3",
      votehead: "Tuition & Boarding Installment 1",
      recordedBy: "CPA David Ochieng"
    },
    {
      id: "pay_04",
      receiptNo: "FLC-RCP-2026-104",
      studentId: "stu_04",
      studentName: "Baraka Mwendwa Mutua",
      admNo: "FLC/2026/004",
      grade: "Grade 9 (JSS)",
      amount: 60000,
      method: "M-Pesa Paybill",
      reference: "UKC77P2RTY",
      paidBy: "Mrs. Esther Ndunge Mutua (+254 721 504 776)",
      date: "2026-09-01",
      term: "Term 3",
      votehead: "Full Term 3 Fees",
      recordedBy: "CPA David Ochieng"
    },
    {
      id: "pay_05",
      receiptNo: "FLC-RCP-2026-105",
      studentId: "stu_05",
      studentName: "Zuri Nyambura Kariuki",
      admNo: "FLC/2026/005",
      grade: "Grade 7 (JSS)",
      amount: 35000,
      method: "M-Pesa Paybill",
      reference: "UKD18K9MNB",
      paidBy: "Mr. Simon Kariuki (+254 720 817 550)",
      date: "2026-09-10",
      term: "Term 3",
      votehead: "Tuition Installment",
      recordedBy: "CPA David Ochieng"
    },
    {
      id: "pay_06",
      receiptNo: "FLC-RCP-2026-106",
      studentId: "stu_06",
      studentName: "Ethan Kiptoo Ruto",
      admNo: "FLC/2026/006",
      grade: "Grade 6",
      amount: 39500,
      method: "M-Pesa Paybill",
      reference: "UKE55L3VBN",
      paidBy: "Mrs. Joyce Chepkoech (+254 724 119 832)",
      date: "2026-09-03",
      term: "Term 3",
      votehead: "Full Term 3 Fees & Transport",
      recordedBy: "CPA David Ochieng"
    },
    {
      id: "pay_07",
      receiptNo: "FLC-RCP-2026-107",
      studentId: "stu_08",
      studentName: "Tiana Makena Gitonga",
      admNo: "FLC/2026/008",
      grade: "Grade 5",
      amount: 40500,
      method: "Bank Transfer (EFT)",
      reference: "EFT-KCB-88210",
      paidBy: "Mr. Alex Gitonga",
      date: "2026-09-05",
      term: "Term 3",
      votehead: "Full Term 3 Fees",
      recordedBy: "CPA David Ochieng"
    },
    {
      id: "pay_08",
      receiptNo: "FLC-RCP-2026-108",
      studentId: "stu_10",
      studentName: "Malaika Zawadi Hassan",
      admNo: "FLC/2026/010",
      grade: "Grade 3",
      amount: 35500,
      method: "M-Pesa Paybill",
      reference: "UKH29W7ZXC",
      paidBy: "Mr. Rashid Hassan (+254 723 445 119)",
      date: "2026-09-08",
      term: "Term 3",
      votehead: "Full Term 3 Fees",
      recordedBy: "CPA David Ochieng"
    }
  ];

  const expenses = [
    {
      id: "exp_01",
      date: "2026-10-01",
      category: "Staff Payroll & Statutory",
      description: "September 2026 Teaching & Support Staff Salaries (Net + SHIF/NSSF/Housing)",
      amount: 645000,
      vendor: "FLC Staff Payroll — KCB Bulk Transfer",
      approvedBy: "Mrs. Grace Wanjiku Mwangi",
      status: "Paid"
    },
    {
      id: "exp_02",
      date: "2026-10-03",
      category: "Kitchen & Boarding Supplies",
      description: "Maize flour, rice, fresh milk, vegetables & beef supply for Term 3",
      amount: 118500,
      vendor: "Wakulima Fresh Supplies Ltd",
      approvedBy: "CPA David Ochieng",
      status: "Paid"
    },
    {
      id: "exp_03",
      date: "2026-10-05",
      category: "CBC Learning & Lab Materials",
      description: "Junior School Integrated Science lab reagents, robotics kits & art manila papers",
      amount: 46200,
      vendor: "Savanis Bookshop & Lab Equip Ltd",
      approvedBy: "Mrs. Grace Wanjiku Mwangi",
      status: "Paid"
    },
    {
      id: "exp_04",
      date: "2026-10-07",
      category: "Transport & Fleet Fuel",
      description: "Diesel & routine service for 3 school buses (KDK 412B, KDM 889A, KCA 115Z)",
      amount: 68400,
      vendor: "TotalEnergies Ngong Road Service Station",
      approvedBy: "CPA David Ochieng",
      status: "Paid"
    },
    {
      id: "exp_05",
      date: "2026-10-09",
      category: "Utilities & Internet",
      description: "KPLC electricity token, Nairobi Water bill & Safaricom Fiber 100Mbps",
      amount: 34900,
      vendor: "KPLC / Safaricom Business",
      approvedBy: "CPA David Ochieng",
      status: "Paid"
    }
  ];

  const staff = [
    {
      id: "stf_01",
      staffNo: "FLC-STF-001",
      tscNo: "TSC-410928",
      name: "Mrs. Grace Wanjiku Mwangi",
      role: "Principal / Head of Institution",
      department: "Administration",
      classAssigned: "All Classes",
      subjects: ["Christian Religious Education", "Social Studies & Citizenship"],
      phone: "+254 711 840 200",
      email: "principal@faithlearningcentre.ac.ke",
      qualification: "M.Ed (Educational Leadership), B.Ed (Arts)",
      grossSalary: 115000,
      status: "Active",
      customData: { cbcCertified: "Certified (JSS & Primary)" }
    },
    {
      id: "stf_02",
      staffNo: "FLC-STF-002",
      tscNo: "TSC-582910",
      name: "Mr. Kelvin Mwangi Karanja",
      role: "Deputy Principal & JSS Coordinator",
      department: "Junior School (JSS)",
      classAssigned: "Grade 8 (JSS) - Faith",
      subjects: ["Mathematics", "Pre-Technical & Computer Studies"],
      phone: "+254 722 901 445",
      email: "k.mwangi@faithlearningcentre.ac.ke",
      qualification: "B.Ed (Science — Maths & IT)",
      grossSalary: 82000,
      status: "Active",
      customData: { cbcCertified: "Certified (JSS & Primary)" }
    },
    {
      id: "stf_03",
      staffNo: "FLC-STF-003",
      tscNo: "TSC-619402",
      name: "Madam Beatrice Atieno Ouma",
      role: "Senior Teacher — Languages",
      department: "Languages & Literacy",
      classAssigned: "Grade 9 (JSS) - Grace",
      subjects: ["English Language", "Kiswahili Lugha"],
      phone: "+254 734 812 900",
      email: "b.atieno@faithlearningcentre.ac.ke",
      qualification: "B.Ed (Arts — English & Literature)",
      grossSalary: 72000,
      status: "Active",
      customData: { cbcCertified: "Certified (JSS & Primary)" }
    },
    {
      id: "stf_04",
      staffNo: "FLC-STF-004",
      tscNo: "TSC-674129",
      name: "Mr. Daniel Kipchumba Bett",
      role: "STEM & Science Lab Patron",
      department: "STEM & Agriculture",
      classAssigned: "Grade 7 (JSS) - Faith",
      subjects: ["Integrated Science & Health", "Agriculture & Nutrition"],
      phone: "+254 715 339 102",
      email: "d.bett@faithlearningcentre.ac.ke",
      qualification: "B.Sc (Agricultural Education & Extension)",
      grossSalary: 68000,
      status: "Active",
      customData: { cbcCertified: "Certified (JSS & Primary)" }
    },
    {
      id: "stf_05",
      staffNo: "FLC-STF-005",
      tscNo: "TSC-712098",
      name: "Madam Mercy Naliaka Wafula",
      role: "Upper Primary Coordinator",
      department: "Upper Primary",
      classAssigned: "Grade 6 - Unity",
      subjects: ["Social Studies & Citizenship", "Christian Religious Education", "Kiswahili Lugha"],
      phone: "+254 726 704 118",
      email: "m.naliaka@faithlearningcentre.ac.ke",
      qualification: "B.Ed (Primary Option)",
      grossSalary: 62000,
      status: "Active",
      customData: { cbcCertified: "Certified (Primary)" }
    },
    {
      id: "stf_06",
      staffNo: "FLC-STF-006",
      tscNo: "TSC-789301",
      name: "Mr. Samuel Mutiso Nzioka",
      role: "Creative Arts & Sports Coach",
      department: "Creative Arts & Talents",
      classAssigned: "Grade 5 - Faith",
      subjects: ["Creative Arts, Music & Sports", "Mathematics"],
      phone: "+254 719 550 321",
      email: "s.mutiso@faithlearningcentre.ac.ke",
      qualification: "Diploma in Education (P1 & Music/PE)",
      grossSalary: 56000,
      status: "Active",
      customData: { cbcCertified: "Certified (Primary)" }
    },
    {
      id: "stf_07",
      staffNo: "FLC-STF-007",
      tscNo: "TSC-830114",
      name: "Madam Lydia Wambui Ndungu",
      role: "ECDE & Lower Primary Lead",
      department: "ECDE & Lower Primary",
      classAssigned: "PP2 - Grace",
      subjects: ["English Language", "Creative Arts, Music & Sports"],
      phone: "+254 720 412 876",
      email: "l.wambui@faithlearningcentre.ac.ke",
      qualification: "B.Ed (Early Childhood Development)",
      grossSalary: 54000,
      status: "Active",
      customData: { cbcCertified: "Certified (Primary)" }
    },
    {
      id: "stf_08",
      staffNo: "FLC-STF-008",
      tscNo: "ICPAK-29014",
      name: "CPA David Ochieng Otieno",
      role: "Chief Bursar & Finance Officer",
      department: "Finance & Accounts",
      classAssigned: "N/A",
      subjects: [],
      phone: "+254 721 609 334",
      email: "bursar@faithlearningcentre.ac.ke",
      qualification: "B.Com (Finance), CPA(K)",
      grossSalary: 78000,
      status: "Active",
      customData: { cbcCertified: "Scheduled" }
    }
  ];

  // Daily Attendance Register snapshot for today (2026-10-11)
  const attendanceRecords = {
    "2026-10-11": {
      "stu_01": { status: "Present", timeIn: "07:15 AM", note: "Boarding roll-call" },
      "stu_02": { status: "Present", timeIn: "07:28 AM", note: "Arrived via Bus Route A" },
      "stu_03": { status: "Present", timeIn: "07:12 AM", note: "Boarding roll-call" },
      "stu_04": { status: "Present", timeIn: "07:10 AM", note: "Morning Prefect on duty" },
      "stu_05": { status: "Late", timeIn: "08:05 AM", note: "Traffic along Lang'ata Rd" },
      "stu_06": { status: "Present", timeIn: "07:32 AM", note: "On time" },
      "stu_07": { status: "Excused", timeIn: "—", note: "Routine checkup at clinic" },
      "stu_08": { status: "Present", timeIn: "07:20 AM", note: "On time" },
      "stu_09": { status: "Present", timeIn: "07:35 AM", note: "On time" },
      "stu_10": { status: "Present", timeIn: "07:25 AM", note: "On time" },
      "stu_11": { status: "Absent", timeIn: "—", note: "Parent called — mild cold" },
      "stu_12": { status: "Present", timeIn: "07:40 AM", note: "Dropped by parent" }
    }
  };

  const timetable = [
    {
      id: "tt_mon",
      day: "Monday",
      slots: [
        { time: "08:00 - 08:40", subject: "Assembly & Chapel Devotion", teacher: "Mrs. Grace Wanjiku", room: "Main Hall" },
        { time: "08:40 - 09:20", subject: "Mathematics", teacher: "Mr. Kelvin Mwangi", room: "JSS Rm 2" },
        { time: "09:20 - 10:00", subject: "Integrated Science & Health", teacher: "Mr. Daniel Bett", room: "Science Lab" },
        { time: "10:00 - 10:30", subject: "TEA & HEALTH BREAK", teacher: "Duty Roster", room: "Courtyard" },
        { time: "10:30 - 11:10", subject: "English Language", teacher: "Madam Beatrice Atieno", room: "JSS Rm 2" },
        { time: "11:10 - 11:50", subject: "Pre-Technical & Computer Studies", teacher: "Mr. Kelvin Mwangi", room: "ICT Hub" },
        { time: "11:50 - 12:30", subject: "Kiswahili Lugha", teacher: "Madam Beatrice Atieno", room: "JSS Rm 2" },
        { time: "12:30 - 01:30", subject: "HOT LUNCH & REST", teacher: "Catering Team", room: "Dining Hall" },
        { time: "01:30 - 02:10", subject: "Agriculture & Nutrition", teacher: "Mr. Daniel Bett", room: "School Demo Farm" },
        { time: "02:10 - 02:50", subject: "Social Studies & Citizenship", teacher: "Madam Mercy Naliaka", room: "JSS Rm 2" },
        { time: "02:50 - 04:00", subject: "CBC Clubs, Robotics & Sports", teacher: "Mr. Samuel Mutiso", room: "Sports Complex" }
      ]
    },
    {
      id: "tt_tue",
      day: "Tuesday",
      slots: [
        { time: "08:00 - 08:40", subject: "Mathematics", teacher: "Mr. Kelvin Mwangi", room: "JSS Rm 2" },
        { time: "08:40 - 09:20", subject: "English Language", teacher: "Madam Beatrice Atieno", room: "JSS Rm 2" },
        { time: "09:20 - 10:00", subject: "Christian Religious Education", teacher: "Mrs. Grace Wanjiku", room: "JSS Rm 2" },
        { time: "10:00 - 10:30", subject: "TEA & HEALTH BREAK", teacher: "Duty Roster", room: "Courtyard" },
        { time: "10:30 - 11:10", subject: "Integrated Science & Health", teacher: "Mr. Daniel Bett", room: "Science Lab" },
        { time: "11:10 - 11:50", subject: "Kiswahili Lugha", teacher: "Madam Beatrice Atieno", room: "JSS Rm 2" },
        { time: "11:50 - 12:30", subject: "Creative Arts, Music & Sports", teacher: "Mr. Samuel Mutiso", room: "Music Studio" },
        { time: "12:30 - 01:30", subject: "HOT LUNCH & REST", teacher: "Catering Team", room: "Dining Hall" },
        { time: "01:30 - 02:10", subject: "Pre-Technical & Computer Studies", teacher: "Mr. Kelvin Mwangi", room: "ICT Hub" },
        { time: "02:10 - 02:50", subject: "Agriculture & Nutrition", teacher: "Mr. Daniel Bett", room: "JSS Rm 2" },
        { time: "02:50 - 04:00", subject: "SBA Project Portfolio & Mentorship", teacher: "Class Teachers", room: "Classrooms" }
      ]
    },
    {
      id: "tt_wed",
      day: "Wednesday",
      slots: [
        { time: "08:00 - 08:40", subject: "Integrated Science & Health", teacher: "Mr. Daniel Bett", room: "Science Lab" },
        { time: "08:40 - 09:20", subject: "Mathematics", teacher: "Mr. Kelvin Mwangi", room: "JSS Rm 2" },
        { time: "09:20 - 10:00", subject: "Kiswahili Lugha", teacher: "Madam Beatrice Atieno", room: "JSS Rm 2" },
        { time: "10:00 - 10:30", subject: "TEA & HEALTH BREAK", teacher: "Duty Roster", room: "Courtyard" },
        { time: "10:30 - 11:10", subject: "Social Studies & Citizenship", teacher: "Madam Mercy Naliaka", room: "JSS Rm 2" },
        { time: "11:10 - 11:50", subject: "English Language", teacher: "Madam Beatrice Atieno", room: "Library" },
        { time: "11:50 - 12:30", subject: "Christian Religious Education", teacher: "Mrs. Grace Wanjiku", room: "JSS Rm 2" },
        { time: "12:30 - 01:30", subject: "HOT LUNCH & REST", teacher: "Catering Team", room: "Dining Hall" },
        { time: "01:30 - 02:10", subject: "Pre-Technical & Computer Studies", teacher: "Mr. Kelvin Mwangi", room: "Technical Workshop" },
        { time: "02:10 - 02:50", subject: "Creative Arts, Music & Sports", teacher: "Mr. Samuel Mutiso", room: "Art Room" },
        { time: "02:50 - 04:00", subject: "Inter-House Ball Games & Swimming", teacher: "Mr. Samuel Mutiso", room: "Main Pitch" }
      ]
    },
    {
      id: "tt_thu",
      day: "Thursday",
      slots: [
        { time: "08:00 - 08:40", subject: "Mathematics", teacher: "Mr. Kelvin Mwangi", room: "JSS Rm 2" },
        { time: "08:40 - 09:20", subject: "Agriculture & Nutrition", teacher: "Mr. Daniel Bett", room: "JSS Rm 2" },
        { time: "09:20 - 10:00", subject: "English Language", teacher: "Madam Beatrice Atieno", room: "JSS Rm 2" },
        { time: "10:00 - 10:30", subject: "TEA & HEALTH BREAK", teacher: "Duty Roster", room: "Courtyard" },
        { time: "10:30 - 11:10", subject: "Kiswahili Lugha", teacher: "Madam Beatrice Atieno", room: "JSS Rm 2" },
        { time: "11:10 - 11:50", subject: "Integrated Science & Health", teacher: "Mr. Daniel Bett", room: "Science Lab" },
        { time: "11:50 - 12:30", subject: "Social Studies & Citizenship", teacher: "Madam Mercy Naliaka", room: "JSS Rm 2" },
        { time: "12:30 - 01:30", subject: "HOT LUNCH & REST", teacher: "Catering Team", room: "Dining Hall" },
        { time: "01:30 - 02:10", subject: "Christian Religious Education", teacher: "Mrs. Grace Wanjiku", room: "JSS Rm 2" },
        { time: "02:10 - 02:50", subject: "Pre-Technical & Computer Studies", teacher: "Mr. Kelvin Mwangi", room: "ICT Hub" },
        { time: "02:50 - 04:00", subject: "Guidance, Pastoral Care & Debate", teacher: "Madam Beatrice Atieno", room: "Main Hall" }
      ]
    },
    {
      id: "tt_fri",
      day: "Friday",
      slots: [
        { time: "08:00 - 08:40", subject: "Flag Raising & Praise Assembly", teacher: "All Staff", room: "Parade Ground" },
        { time: "08:40 - 09:20", subject: "Mathematics", teacher: "Mr. Kelvin Mwangi", room: "JSS Rm 2" },
        { time: "09:20 - 10:00", subject: "English Language", teacher: "Madam Beatrice Atieno", room: "JSS Rm 2" },
        { time: "10:00 - 10:30", subject: "TEA & HEALTH BREAK", teacher: "Duty Roster", room: "Courtyard" },
        { time: "10:30 - 11:10", subject: "Integrated Science & Health", teacher: "Mr. Daniel Bett", room: "Science Lab" },
        { time: "11:10 - 11:50", subject: "Kiswahili Lugha", teacher: "Madam Beatrice Atieno", room: "JSS Rm 2" },
        { time: "11:50 - 12:30", subject: "Agriculture & Nutrition", teacher: "Mr. Daniel Bett", room: "School Demo Farm" },
        { time: "12:30 - 01:30", subject: "HOT LUNCH & REST", teacher: "Catering Team", room: "Dining Hall" },
        { time: "01:30 - 02:30", subject: "Community Service Learning (CSL)", teacher: "All Teachers", room: "Campus Grounds" },
        { time: "02:30 - 04:00", subject: "Talent Showcases & Weekly Review", teacher: "Mr. Samuel Mutiso", room: "Main Hall" }
      ]
    }
  ];

  const transportRoutes = [
    {
      id: "tr_01",
      routeName: "Route A — Kilimani / Ngong Rd",
      vehicleReg: "KDK 412B (Isuzu 51-Seater)",
      driverName: "Mr. Josephat Karanja",
      driverPhone: "+254 722 419 008",
      assistant: "Ms. Hannah Wanjiru",
      termFee: 6500,
      capacity: 51,
      assignedStudents: 38,
      status: "On Route / Active"
    },
    {
      id: "tr_02",
      routeName: "Route B — Karen / Lang'ata",
      vehicleReg: "KDM 889A (Mitsubishi Rosa 33-Seater)",
      driverName: "Mr. Boniface Mutua",
      driverPhone: "+254 714 802 119",
      assistant: "Ms. Ruth Nthenya",
      termFee: 7500,
      capacity: 33,
      assignedStudents: 29,
      status: "On Route / Active"
    },
    {
      id: "tr_03",
      routeName: "Route C — Lavington / Kawangware",
      vehicleReg: "KCA 115Z (Nissan Civilian 30-Seater)",
      driverName: "Mr. Peter Onyango",
      driverPhone: "+254 728 551 704",
      assistant: "Ms. Agnes Moraa",
      termFee: 5500,
      capacity: 30,
      assignedStudents: 26,
      status: "On Route / Active"
    },
    {
      id: "tr_04",
      routeName: "Route D — Westlands / Kileleshwa",
      vehicleReg: "KDR 204M (Toyota Coaster 29-Seater)",
      driverName: "Mr. Stephen Ndambuki",
      driverPhone: "+254 711 934 620",
      assistant: "Ms. Esther Kemunto",
      termFee: 7000,
      capacity: 29,
      assignedStudents: 24,
      status: "On Route / Active"
    }
  ];

  const boardingHouses = [
    {
      id: "bh_01",
      name: "Faith House (Girls Senior Wing)",
      gender: "Girls",
      matron: "Matron Margaret Nyokabi",
      phone: "+254 721 309 881",
      capacity: 60,
      occupied: 52,
      cleanlinessScore: "98% (Best Wing Trophy)"
    },
    {
      id: "bh_02",
      name: "Grace Wing (Girls Junior Wing)",
      gender: "Girls",
      matron: "Matron Sarah Chepngetich",
      phone: "+254 725 490 112",
      capacity: 60,
      occupied: 48,
      cleanlinessScore: "95%"
    },
    {
      id: "bh_03",
      name: "Unity House (Boys Senior Wing)",
      gender: "Boys",
      matron: "PatronJohnstone Wafula",
      phone: "+254 716 882 340",
      capacity: 64,
      occupied: 56,
      cleanlinessScore: "94%"
    },
    {
      id: "bh_04",
      name: "Victory Wing (Boys Junior Wing)",
      gender: "Boys",
      matron: "Patron Evans Kipkorir",
      phone: "+254 729 104 556",
      capacity: 64,
      occupied: 49,
      cleanlinessScore: "92%"
    }
  ];

  const libraryBooks = [
    {
      id: "bk_01",
      isbn: "KICD-978-9966-01",
      title: "KLB Top Scholar Integrated Science Grade 8 Learner's Book",
      category: "STEM / JSS",
      author: "Kenya Literature Bureau",
      totalCopies: 85,
      availableCopies: 72,
      borrowedBy: "Imani Wanjiru (FLC/2026/001)",
      dueDate: "2026-10-25"
    },
    {
      id: "bk_02",
      isbn: "KICD-978-9966-02",
      title: "Mentor Pre-Technical Studies Grade 8 Approved CBC Edition",
      category: "STEM / JSS",
      author: "Mentor Publishers",
      totalCopies: 80,
      availableCopies: 68,
      borrowedBy: "Baraka Mwendwa (FLC/2026/004)",
      dueDate: "2026-10-28"
    },
    {
      id: "bk_03",
      isbn: "KICD-978-9966-03",
      title: "Kiswahili Kitukuzwe Gredi ya 9 — Kitabu cha Mwanafunzi",
      category: "Languages",
      author: "Oxford East Africa",
      totalCopies: 75,
      availableCopies: 60,
      borrowedBy: "Neema Chebet (FLC/2026/003)",
      dueDate: "2026-10-20"
    },
    {
      id: "bk_04",
      isbn: "KICD-978-9966-04",
      title: "Longhorn Agriculture & Nutrition Grade 7 Practical Guide",
      category: "Applied Sciences",
      author: "Longhorn Publishers",
      totalCopies: 90,
      availableCopies: 84,
      borrowedBy: "Zuri Nyambura (FLC/2026/005)",
      dueDate: "2026-10-19"
    },
    {
      id: "bk_05",
      isbn: "KICD-978-9966-05",
      title: "Spotlight Mathematics Activities Grade 6 KPSEA Revision",
      category: "Mathematics",
      author: "Spotlight Publishers",
      totalCopies: 100,
      availableCopies: 79,
      borrowedBy: "Ethan Kiptoo (FLC/2026/006)",
      dueDate: "2026-10-22"
    }
  ];

  const disciplineMerits = [
    {
      id: "dm_01",
      date: "2026-10-08",
      studentId: "stu_01",
      studentName: "Imani Wanjiru Kamau",
      grade: "Grade 8 (JSS)",
      type: "Merit / Award",
      category: "STEM & Robotics Innovation",
      points: "+15",
      description: "Won 1st Place at Nairobi County Junior School Robotics & Solar Irrigation Challenge.",
      recordedBy: "Mr. Kelvin Mwangi"
    },
    {
      id: "dm_02",
      date: "2026-10-06",
      studentId: "stu_04",
      studentName: "Baraka Mwendwa Mutua",
      grade: "Grade 9 (JSS)",
      type: "Merit / Award",
      category: "Christian Leadership & Integrity",
      points: "+10",
      description: "Exemplary service as Head Boy during Parents' Prayer & Academic Clinic Day.",
      recordedBy: "Mrs. Grace Wanjiku"
    },
    {
      id: "dm_03",
      date: "2026-10-04",
      studentId: "stu_08",
      studentName: "Tiana Makena Gitonga",
      grade: "Grade 5",
      type: "Merit / Award",
      category: "Public Speaking & Drama",
      points: "+10",
      description: "Best Solo Verse presenter at the Sub-County Music & Cultural Festival.",
      recordedBy: "Mr. Samuel Mutiso"
    },
    {
      id: "dm_04",
      date: "2026-10-02",
      studentId: "stu_07",
      studentName: "Amani Wafula Wekesa",
      grade: "Grade 6",
      type: "Guidance & Counselling",
      category: "Academic Follow-Up",
      points: "0",
      description: "Paired with STEM peer mentor and scheduled for personalized afternoon Mathematics support.",
      recordedBy: "Madam Mercy Naliaka"
    }
  ];

  const communications = [
    {
      id: "comm_01",
      date: "2026-10-10 09:15 AM",
      channel: "SMS Broadcast & Portal Notice",
      audience: "All Parents & Guardians",
      title: "KPSEA & KJSEA Prayer Day and Mid-Term Academic Clinic",
      message: "Dear Parent, Faith Learning Centre invites you to our Annual Candidates' Dedication Service & Academic Clinic on Friday 16th Oct 2026 from 9:00 AM. Kindly clear any Term 3 fee balances via Paybill 522533.",
      recipientsCount: 412,
      sender: "Mrs. Grace Wanjiku (Principal)"
    },
    {
      id: "comm_02",
      date: "2026-10-08 02:30 PM",
      channel: "Targeted SMS Reminder",
      audience: "Parents with Fee Arrears (> KES 10,000)",
      title: "Gentle Term 3 Fee Balance Reminder",
      message: "Dear Guardian, thank you for your continued support at Faith Learning Centre. Kindly clear your child's outstanding Term 3 fee balance via M-Pesa Paybill 522533 Account FLC-[ADM_NO].",
      recipientsCount: 64,
      sender: "CPA David Ochieng (Bursar)"
    },
    {
      id: "comm_03",
      date: "2026-10-05 11:00 AM",
      channel: "Portal Circular",
      audience: "Junior School (Grade 7 – 9) Parents",
      title: "CBC Community Service Learning (CSL) Tree Planting Drive",
      message: "Our Junior School learners will participate in the Ngong Forest Environmental Conservation & Tree Planting CSL project on Wednesday 21st Oct 2026. Learners should wear full games kit.",
      recipientsCount: 145,
      sender: "Mr. Kelvin Mwangi (JSS Coordinator)"
    }
  ];

  const auditLogs = [
    {
      id: "log_01",
      timestamp: "2026-10-11 08:15 AM",
      actor: "Mrs. Grace Wanjiku (Admin)",
      action: "Verified Term 3 CBC Rubric Assessment weights (40% SBA / 60% Exam)",
      module: "Backend Customization Zone"
    },
    {
      id: "log_02",
      timestamp: "2026-10-11 07:45 AM",
      actor: "Mr. Kelvin Mwangi (Teacher)",
      action: "Completed Morning Roll-Call Register for Grade 8 (JSS) — Faith",
      module: "Attendance"
    },
    {
      id: "log_03",
      timestamp: "2026-10-10 04:20 PM",
      actor: "CPA David Ochieng (Bursar)",
      action: "Reconciled 8 M-Pesa Paybill 522533 transactions totaling KES 353,500",
      module: "Finance & M-Pesa"
    }
  ];

  const events = [
    {
      id: "ev_01",
      date: "2026-10-16",
      title: "Candidates' Dedication Service & Parents Academic Clinic",
      description:
        "A prayer and dedication service for our KPSEA and KJSEA candidates, followed by one-on-one academic clinics between parents and class teachers.",
      venue: "Main Hall & Classrooms",
      audience: "All Parents & Guardians",
      time: "9:00 AM – 1:00 PM"
    },
    {
      id: "ev_02",
      date: "2026-10-21",
      title: "Community Service Learning — Ngong Forest Tree Planting",
      description:
        "Junior School learners participate in the CBC Community Service Learning project on environmental conservation. Full games kit required.",
      venue: "Ngong Road Forest Sanctuary",
      audience: "Grade 7 – Grade 9 Learners",
      time: "8:00 AM – 3:00 PM"
    },
    {
      id: "ev_03",
      date: "2026-11-06",
      title: "Inter-House Sports Gala & Talent Showcase",
      description:
        "Faith, Grace, Unity and Victory houses compete across athletics, ball games and swimming, culminating in the evening talent showcase.",
      venue: "Main Pitch & Sports Complex",
      audience: "Whole School Community",
      time: "7:30 AM – 5:00 PM"
    },
    {
      id: "ev_04",
      date: "2026-11-20",
      title: "Term 3 Closing Day, Prize Giving & Graduation",
      description:
        "End-of-term closing ceremony, prize giving for academic and character excellence, and graduation for our PP2 and Grade 9 candidates.",
      venue: "Main Hall",
      audience: "All Parents & Guardians",
      time: "8:30 AM – 1:30 PM"
    }
  ];

  const enquiries = [
    {
      id: "enq_01",
      date: "2026-10-09",
      parentName: "Mrs. Alice Njeri Karanja",
      phone: "+254 720 118 447",
      email: "alice.njeri@gmail.com",
      learnerName: "Ryan Karanja",
      gradeOfInterest: "Grade 4",
      boardingPreference: "Day Scholar",
      message: "Kindly advise on available vacancies in Grade 4 and the term fee structure for day scholars.",
      status: "New"
    },
    {
      id: "enq_02",
      date: "2026-10-07",
      parentName: "Mr. Fredrick Ochieng",
      phone: "+254 733 902 118",
      email: "f.ochieng@yahoo.com",
      learnerName: "Daniella Ochieng",
      gradeOfInterest: "Grade 7 (JSS)",
      boardingPreference: "Boarding",
      message: "We are relocating from Mombasa in January. Please share the boarding requirements and joining instructions.",
      status: "Contacted"
    }
  ];

  const consents = [
    {
      id: "cns_01",
      timestamp: "2026-10-10 08:42 AM",
      role: "parent",
      portal: "Parent & Student Portal",
      name: "Eng. Peter Kamau Njoroge",
      termsVersion: "2.1",
      acceptedAt: "2026-10-10 08:42 AM",
      ip: "197.248.xx.xx"
    },
    {
      id: "cns_02",
      timestamp: "2026-10-10 07:05 AM",
      role: "teacher",
      portal: "Teacher Portal",
      name: "mr.kelvin.mwangi@faithlearningcentre.ac.ke",
      termsVersion: "2.1",
      acceptedAt: "2026-10-10 07:05 AM",
      ip: "197.232.xx.xx"
    }
  ];

  // Sign-in accounts. The administrator account is the one the school supplied; the three
  // demonstration accounts keep the other portals reachable until real staff accounts are created.
  const accounts = [
    makeAccount("leadex44@gmail.com", "12345678", "admin", "Administrator"),
    makeAccount("teacher@faithlearningcentre.ac.ke", "Teacher@2026", "teacher", "Class Teacher", "Teacher@2026"),
    makeAccount("bursar@faithlearningcentre.ac.ke", "Bursar@2026", "finance", "Bursar / Finance", "Bursar@2026"),
    makeAccount("parent@faithlearningcentre.ac.ke", "Parent@2026", "parent", "Parent / Guardian", "Parent@2026")
  ];

  // Help Centre knowledge base. The administrator or the ICT department can extend this
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

  return {
    accounts,
    sessions: [],
    passwordResetRequests: [],
    helpArticles,
    systemConfig,
    feeStructures,
    students,
    assessments,
    payments,
    expenses,
    staff,
    attendanceRecords,
    timetable,
    transportRoutes,
    boardingHouses,
    libraryBooks,
    disciplineMerits,
    communications,
    auditLogs,
    events,
    enquiries,
    consents
  };
}

module.exports = { createInitialDatabase };
