/**
 * SIMS — Firestore Seed Script
 * Run: node scripts/seedFirestore.mjs
 *
 * This uploads all seed data to your Firebase project so the app
 * works with real Firestore data instead of localStorage demo data.
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, setDoc, writeBatch } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBjkii5-JVb2pJHLgXLNCCBIxFdnhciZ4Q",
  authDomain: "poster-d75a4.firebaseapp.com",
  projectId: "poster-d75a4",
  storageBucket: "poster-d75a4.firebasestorage.app",
  messagingSenderId: "786027624735",
  appId: "1:786027624735:web:1f0d8326888c1f7a45182a",
};

const SCHOOL_ID = 'school-oakridge-01';

const app = initializeApp(firebaseConfig);
const db  = getFirestore(app);

// ── Helper ────────────────────────────────────────────────────────────────────
async function uploadCollection(subcollection, items, idField = 'id') {
  const colRef = collection(db, 'schools', SCHOOL_ID, subcollection);
  let batch = writeBatch(db);
  let count = 0;

  for (const item of items) {
    const id = item[idField] || item.uid || `item-${Date.now()}-${count}`;
    const docRef = doc(colRef, id);
    batch.set(docRef, item);
    count++;

    // Firestore batch limit = 500
    if (count % 490 === 0) {
      await batch.commit();
      batch = writeBatch(db);
      console.log(`  ...committed ${count} docs`);
    }
  }
  await batch.commit();
  console.log(`✅ ${subcollection}: ${items.length} documents uploaded`);
}

// ── School document ───────────────────────────────────────────────────────────
async function seedSchool() {
  const schoolData = {
    id: SCHOOL_ID,
    name: 'Oakridge International Academy',
    code: 'OIA-2026',
    address: '450 Crestview Boulevard, Silicon Valley Campus',
    phone: '+1 (555) 234-5678',
    email: 'office@oakridge.edu',
    academicYear: '2026 - 2027',
  };
  await setDoc(doc(db, 'schools', SCHOOL_ID), schoolData);
  console.log('✅ school: document created');
}

// ── Data ──────────────────────────────────────────────────────────────────────
const classes = [
  { id: 'class-g9',  name: 'Grade 9',  gradeLevel: 9,  schoolId: SCHOOL_ID },
  { id: 'class-g10', name: 'Grade 10', gradeLevel: 10, schoolId: SCHOOL_ID },
  { id: 'class-g11', name: 'Grade 11', gradeLevel: 11, schoolId: SCHOOL_ID },
  { id: 'class-g12', name: 'Grade 12', gradeLevel: 12, schoolId: SCHOOL_ID },
];

const sections = [
  { id: 'sec-g10-a', classId: 'class-g10', name: 'Section A', room: 'Room 302', capacity: 35, classTeacherId: 'teacher-david' },
  { id: 'sec-g10-b', classId: 'class-g10', name: 'Section B', room: 'Room 304', capacity: 35, classTeacherId: 'teacher-elena' },
  { id: 'sec-g11-a', classId: 'class-g11', name: 'Section A', room: 'Room 401', capacity: 30, classTeacherId: 'teacher-robert' },
  { id: 'sec-g12-a', classId: 'class-g12', name: 'Section A', room: 'Room 405', capacity: 30, classTeacherId: 'teacher-karen'  },
];

const subjects = [
  { id: 'sub-math', code: 'MTH-101', name: 'Mathematics',       department: 'Mathematics',    weeklyHours: 6 },
  { id: 'sub-phy',  code: 'PHY-102', name: 'Physics',           department: 'Science',        weeklyHours: 5 },
  { id: 'sub-chm',  code: 'CHM-103', name: 'Chemistry',         department: 'Science',        weeklyHours: 5 },
  { id: 'sub-eng',  code: 'ENG-104', name: 'English Literature', department: 'Humanities',    weeklyHours: 4 },
  { id: 'sub-csc',  code: 'CSC-105', name: 'Computer Science',   department: 'Technology',    weeklyHours: 4 },
  { id: 'sub-his',  code: 'HIS-106', name: 'World History',      department: 'Social Sciences', weeklyHours: 3 },
];

const announcements = [
  {
    id: 'ann-001',
    schoolId: SCHOOL_ID,
    title: 'Annual Science & Innovation Exhibition 2026',
    content: 'Students from Grades 9 through 12 are invited to register working robotics, clean energy, and applied physics models for the Annual Science Exhibition.',
    category: 'events',
    targetAudience: 'all',
    isPinned: true,
    authorId: 'admin-eleanor',
    authorName: 'Eleanor Vance (Principal)',
    publishedAt: new Date().toISOString(),
  },
  {
    id: 'ann-002',
    schoolId: SCHOOL_ID,
    title: 'Mid-Term Examination Schedule',
    content: 'Mid-Term Examinations commence on November 16, 2026. Hall tickets will be issued through SIMS portal on November 10. Minimum 75% attendance required.',
    category: 'exam',
    targetAudience: 'students',
    isPinned: true,
    authorId: 'admin-robert',
    authorName: 'Robert Sterling (Academic Dean)',
    publishedAt: new Date().toISOString(),
  },
  {
    id: 'ann-003',
    schoolId: SCHOOL_ID,
    title: 'Mandatory 75% Attendance Regulation',
    content: 'Students with cumulative attendance below 75% receive an automated shortage alert. Correction appeals must be submitted within 48 hours.',
    category: 'academic',
    targetAudience: 'all',
    isPinned: false,
    authorId: 'admin-clara',
    authorName: 'Clara Oswald (Attendance Officer)',
    publishedAt: new Date().toISOString(),
  },
  {
    id: 'ann-004',
    schoolId: SCHOOL_ID,
    title: 'Parent-Teacher Consultations: Grade 10 & 12',
    content: 'Parent-Teacher meetings scheduled for Saturday, November 14, 2026 between 09:00 AM and 01:00 PM.',
    category: 'urgent',
    targetAudience: 'all',
    isPinned: false,
    authorId: 'admin-eleanor',
    authorName: 'Eleanor Vance (Principal)',
    publishedAt: new Date().toISOString(),
  },
];

// Admin users (NOTE: for real auth you need Firebase Auth UIDs)
// These are placeholder profiles — real users will be created via Firebase Auth
const adminUsers = [
  {
    uid: 'admin-eleanor',
    email: 'admin@oakridge.edu',
    name: 'Eleanor Vance',
    role: 'admin',
    status: 'active',
    schoolId: SCHOOL_ID,
    adminData: {
      adminRole: 'super_admin',
      permissions: ['all'],
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    uid: 'admin-robert',
    email: 'academic@oakridge.edu',
    name: 'Robert Sterling',
    role: 'admin',
    status: 'active',
    schoolId: SCHOOL_ID,
    adminData: {
      adminRole: 'academic_admin',
      permissions: ['manage_academics', 'manage_timetable', 'announcements'],
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    uid: 'admin-clara',
    email: 'attendance@oakridge.edu',
    name: 'Clara Oswald',
    role: 'admin',
    status: 'active',
    schoolId: SCHOOL_ID,
    adminData: {
      adminRole: 'attendance_officer',
      permissions: ['manage_attendance', 'authorized_corrections', 'reports'],
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  console.log('\n🚀 SIMS Firestore Seed Script');
  console.log(`📁 Project: poster-d75a4`);
  console.log(`🏫 School: ${SCHOOL_ID}\n`);

  try {
    await seedSchool();
    await uploadCollection('classes',       classes,       'id');
    await uploadCollection('sections',      sections,      'id');
    await uploadCollection('subjects',      subjects,      'id');
    await uploadCollection('announcements', announcements, 'id');
    await uploadCollection('users',         adminUsers,    'uid');

    console.log('\n✅ All seed data uploaded successfully!');
    console.log('\n📌 Next steps:');
    console.log('   1. Enable Email/Password auth in Firebase Console');
    console.log('   2. Create user accounts via Firebase Console → Authentication');
    console.log('   3. Or use the app — new signups go to Firestore automatically');
    console.log('   4. Restart dev server: npm run dev:app\n');

  } catch (err) {
    console.error('❌ Seed failed:', err.message);
    process.exit(1);
  }

  process.exit(0);
}

main();
