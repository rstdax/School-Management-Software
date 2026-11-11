# SIMS — Smart Institution Management System

SIMS (**Smart Institution Management System**) is a mobile-first, enterprise-grade school management web application designed for K-12 and collegiate institutions. Built with **React 19**, **TypeScript**, **Vite**, and **Tailwind CSS**, SIMS delivers role-specific portals for **Students**, **Parents**, **Teachers**, and **Administrators** backed by a multi-school **Firebase Modular SDK** schema and an offline-resilient reactive data store.

---

## 🏛️ System Architecture

SIMS is structured as a unified monorepo hosting two separately deployable web applications sharing a common core:

```
c:\xampp\htdocs\SMS\
├── apps/
│   ├── student-teacher/          # Student, Parent, & Teacher Web App (Vite :5173)
│   │   ├── src/
│   │   │   ├── components/       # Mobile layout, headers, navigation, dialogs
│   │   │   ├── context/          # AuthContext, NotificationContext
│   │   │   ├── screens/          # The 12 core screens & workflows
│   │   │   ├── App.tsx
│   │   │   └── main.tsx
│   │   └── vite.config.ts
│   │
│   └── admin/                    # Admin School Management Workspace (Vite :5174)
│       ├── src/
│       │   ├── components/       # Layout, admin sidebar, data tables
│       │   ├── context/          # AdminAuthContext (Role-scoped RBAC)
│       │   ├── pages/            # 10 Management consoles
│       │   ├── App.tsx
│       │   └── main.tsx
│       └── vite.config.ts
│
├── packages/
│   └── shared/                   # Shared domain types, mock data, store, utils
│       └── src/
│           ├── types/            # Strict TypeScript domain interfaces
│           ├── mock/             # Realistic Oakridge International Academy seed data
│           ├── store/            # Reactive localStorage store with listeners
│           ├── firebase/         # Firebase app, modular auth & multi-school firestore
│           └── utils/            # Real CSV export and formatting utilities
│
├── firebase.json                 # Dual hosting targets & Firestore rules/indexes
├── firestore.rules               # Multi-school production security rules
├── firestore.indexes.json        # Composite query indexes
├── .env.example                  # Environment configuration template
└── package.json                  # Root npm workspaces orchestrator
```

---

## 🎨 Visual Design Direction & The 12 Mobile Screens

The interface follows a clean, mobile-first aesthetic with school blue (`#2563EB`) as the primary action tone, crisp white cards, pale gray backgrounds (`#F8FAFC`), subtle borders (`#E2E8F0`), restrained shadows, and responsive touch targets:

| # | Screen | Description |
|---|---|---|
| **1** | **Welcome / Splash** | Institutional welcome with Oakridge Academy branding, Get Started, and Direct Sign In. |
| **2** | **Role Selection** | Interactive cards for **Student**, **Parent**, and **Teacher** with permissions guidance. |
| **3** | **Student Sign-Up** | Self-registration form (Full name, admission number, requested class/section, DOB) with provisional access advisory. |
| **4** | **Login** | Role-aware authentication with password toggle, remember me, forgot password modal, and one-click demo credentials. |
| **5** | **Student Dashboard** | Greeting, class badge (`Grade 10-A • Roll #14`), attendance gauge (88.5%), today's classes timeline, shortcuts, and notices. |
| **6** | **Student Attendance** | Interactive monthly calendar with **P / A / L** color dots, subject-wise breakdown, shortage alert (&lt;75%), records, and CSV export. |
| **7** | **Student Routine** | Monday–Saturday day selector, lecture slots with times, rooms, teachers, and a switchable Weekly Grid mode. |
| **8** | **Student Announcements** | Filterable cards (Academic, Exam, Events, Urgent) with search and detailed reading modal. |
| **9** | **Parent Dashboard** | Linked child selector (`Alex Rivera` vs `Sophia Rivera`), child today's attendance status, schedule, and shortcuts. |
| **10** | **Parent Child Attendance** | Strictly scoped to parent's linked child with monthly calendar, subject percentages, and leave application trigger. |
| **11** | **Teacher Dashboard** | Faculty greeting, assigned cohorts (`Grade 10-A`, `10-B`, `11-A`), today's lecture schedule with attendance status buttons. |
| **12** | **Teacher Take Attendance** | Cohort selection, 30-student roster, touch P/A toggles, Mark All Present, Save Draft, and Finalize Attendance confirmation. |

### Additional Integrated Flows
- **Leave Applications**: Students and parents apply with dates, reason, and emergency phone. Teachers and Admins review, approve, or reject with notes.
- **Attendance Correction Appeals**: Students and parents lodge discrepancy claims. Approvals automatically update attendance sessions and append to the audit log.
- **Attendance Dossier Export**: Formatted printable official statement with institutional signatures, plus browser CSV generation and download.
- **Teacher Class Reports**: Filter by cohort, identify students below the 75% threshold, and export class report to CSV.
- **Notification Drawer**: Interactive slide-over alert center for finalized lectures, published notices, and approved leaves.

---

## ⏱️ Manual Attendance Flow (Strict Requirements)

1. **Timetable Assignment**: Admin configures classes, sections, and schedules lectures specifying weekday, time, room, and teacher.
2. **Assigned Scope**: Teachers only see and mark sessions for their assigned cohorts and subjects.
3. **P / A Active Marking**: Teachers tap **P (Present)** or **A (Absent)** beside each student. Students are **not** automatically marked absent when a session starts.
4. **Draft Mode**: Teachers can tap **Save as Draft** at any time to preserve progress without making it official.
5. **Finalization Confirmation**: Finalizing requires explicit confirmation. Once finalized, the session becomes an official school record, locks from direct editing, and stores who finalized it and the exact timestamp.
6. **Authorized Corrections & Audit Log**: After finalization, edits can only be performed by authorized administrators (Super Admin or Attendance Officer). A **mandatory reason** is required and an immutable record is permanently written to the audit log.
7. **Parent & Student Access**: Students and parents can **only** view finalized attendance sessions.

---

## 🛡️ Admin Website Workspace

The Admin website (`http://localhost:5174`) is a dedicated school administration workspace with **no public registration**:

- **School Overview**: Student totals, teacher counts, today's lecture schedule, and live class-level attendance operations monitor.
- **Teacher Registration Approvals**: Review pending faculty registrations, verify credentials, assign departments, and approve or reject.
- **Student Enrollment Review**: Review self-registered students, assign official class, section, and roll number to confirm official placement.
- **Academic Master**: Manage Classes, Sections, Subjects, and view Student and Teacher directories.
- **Timetable Planner**: Interactive weekly timetable editor with **collision detection** preventing teacher double-booking and room clashes.
- **Attendance Oversight**: Monitor all sessions across the school and perform **Authorized Corrections** with mandatory justification and audit logging.
- **Review Queue**: Review leave requests and attendance correction appeals. Approving an appeal automatically updates the session and logs the audit entry.
- **Announcements Broadcaster**: Broadcast notices to the whole school, specific roles, or specific classes, with pinning options.
- **Reports & Audit Ledger**: Chronic absenteeism list (&lt;75%), one-click CSV export of school-wide attendance, and full audit trail viewer.

### Role-Based Access Control (RBAC) Scopes:
- `super_admin` (Principal Eleanor Vance): Unrestricted access to all modules, settings, and audits.
- `academic_admin` (Dean Robert Sterling): Class/Section/Subject management, student placement, timetable planner, announcements.
- `attendance_officer` (Clara Oswald): Attendance oversight, authorized corrections, review queues, shortage reports.

---

## 🔑 Pre-Configured Demo Credentials

You can log in directly using the following credentials or use the **One-Click Demo Login** buttons present on the login screens:

| Role | Name | Email | Password | Scope |
|---|---|---|---|---|
| **Student** | Alex Rivera | `alex.student@oakridge.edu` | `Demo@123` | Grade 10-A, Roll #14 |
| **Student (2nd)** | Sophia Rivera | `sophia.student@oakridge.edu` | `Demo@123` | Grade 9-B, Roll #08 |
| **Student (Pending)** | Marcus Chen | `marcus.student@oakridge.edu` | `Demo@123` | Provisional Placement |
| **Parent** | Maria Rivera | `maria.parent@oakridge.edu` | `Demo@123` | Linked to Alex & Sophia |
| **Teacher** | Prof. David Miller | `david.teacher@oakridge.edu` | `Demo@123` | Head of Mathematics |
| **Teacher (Pending)** | Dr. Sarah Jenkins | `sarah.teacher@oakridge.edu` | `Demo@123` | Pending Approval |
| **Super Admin** | Eleanor Vance | `admin@oakridge.edu` | `Admin@123` | Full Institutional Access |
| **Academic Dean** | Robert Sterling | `academic@oakridge.edu` | `Academic@123` | Academics & Timetable |
| **Attendance Officer** | Clara Oswald | `attendance@oakridge.edu` | `Officer@123` | Oversight & Corrections |

---

## 🚀 Local Development Setup

### 1. Prerequisites
- **Node.js** v18+ (tested on Node v24.22.0)
- **npm** v10+

### 2. Installation
From the root directory (`c:\xampp\htdocs\SMS`):
```bash
npm install
```

### 3. Launch Development Servers

You can run either or both applications independently:

**Run Student/Teacher Web App (Port 5173):**
```bash
npm run dev:app
```
*Open `http://localhost:5173` in your browser or mobile viewport.*

**Run Admin Management Website (Port 5174):**
```bash
npm run dev:admin
```
*Open `http://localhost:5174` in your browser.*

### 4. Build for Production
Run builds for both applications simultaneously:
```bash
npm run build
```
Or build each individually:
```bash
npm run build:app      # Compiles apps/student-teacher/dist
npm run build:admin    # Compiles apps/admin/dist
```

---

## 🔥 Firebase Setup & Deployment

### 1. Multi-School Firestore Schema
SIMS uses a multi-school data model with school-scoped subcollections:
```
schools/{schoolId}/
├── users/{userId}
├── classes/{classId}
├── sections/{sectionId}
├── subjects/{subjectId}
├── routines/{routineId}
├── attendance_sessions/{sessionId}
├── audit_logs/{logId}
├── leave_requests/{requestId}
├── correction_requests/{requestId}
└── announcements/{announcementId}
```

### 2. Environment Configuration
Copy `.env.example` to `.env` in the root or individual app folders:
```env
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=your-sims-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-sims-project
VITE_FIREBASE_STORAGE_BUCKET=your-sims-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
VITE_FIREBASE_APP_ID=1:123456789012:web:abcdef1234567890
VITE_DEFAULT_SCHOOL_ID=school-oakridge-01
```
> **Offline / Demo Resiliency**: If Firebase credentials are not provided, SIMS seamlessly runs with the built-in reactive store seeded with rich, realistic school data. Every button, form, draft, finalization, authorized correction, and CSV export works out of the box!

### 3. Deploying Firestore Rules & Indexes
Deploy security rules and composite query indexes using Firebase CLI:
```bash
firebase deploy --only firestore:rules,firestore:indexes
```

### 4. Separate Hosting Targets Deployment
`firebase.json` defines two separate hosting targets:
- `student-teacher-app` -> `apps/student-teacher/dist`
- `admin-app` -> `apps/admin/dist`

To configure separate hosting sites in your Firebase project:
```bash
# 1. Create hosting sites in your Firebase project console:
#    - Site 1: your-school-app (e.g., oakridge-portal)
#    - Site 2: your-school-admin (e.g., oakridge-admin)

# 2. Apply hosting targets to your local configuration:
firebase target:apply hosting student-teacher-app <your-student-teacher-site-id>
firebase target:apply hosting admin-app <your-admin-site-id>

# 3. Add both custom domains to Firebase Console > Authentication > Settings > Authorized Domains

# 4. Build and deploy:
npm run build
firebase deploy --only hosting
```

---

## 📋 Feature Status & Scope Transparency

| Feature Area | Status | Implementation Details |
|---|---|---|
| **Role-based Authentication** | ✅ Working | Student, Parent, Teacher, Admin portals with status checks. |
| **Manual Attendance Flow** | ✅ Working | Draft, Finalize, Lock, P/A toggles, live counters. |
| **Authorized Corrections** | ✅ Working | Mandatory reason, admin authorization, immutable audit log. |
| **Timetable Planner** | ✅ Working | Weekly grid editor with teacher & room collision detection. |
| **Leave & Correction Queues** | ✅ Working | Submit, review, approve, reject with admin remarks. |
| **CSV Reports & Dossiers** | ✅ Working | Real browser CSV generation and download for attendance. |
| **Printable Attendance** | ✅ Working | Formatted official statement with institutional signatures. |
| **Firebase Cloud Integration** | ⚙️ Configured | Modular SDK, Firestore collections, rules, and indexes ready. Requires Firebase project credentials in `.env`. |
| **Hardware & ERP Modules** | ❌ Not in Scope | RFID/NFC hardware, facial recognition, and payroll are intentionally not implemented per Blueprint specifications. |

---

*SIMS — Built with precision for educational institutions.*

