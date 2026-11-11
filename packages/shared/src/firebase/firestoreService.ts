import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  query,
  where,
  orderBy,
  limit,
} from 'firebase/firestore';
import { getFirebaseFirestore, isFirebaseConfigured, getFirebaseConfig } from './firebaseConfig';
import { simsStore } from '../store/storageStore';
import {
  UserProfile,
  AttendanceSession,
  AttendanceAuditLog,
  LeaveRequest,
  CorrectionRequest,
  Announcement,
  TimetableSlot,
} from '../types';

export const getSchoolCollection = (schoolId: string, subcollection: string) => {
  const db = getFirebaseFirestore();
  if (!db) throw new Error('Firestore not initialized');
  return collection(db, 'schools', schoolId, subcollection);
};

export const getSchoolDoc = (schoolId: string, subcollection: string, docId: string) => {
  const db = getFirebaseFirestore();
  if (!db) throw new Error('Firestore not initialized');
  return doc(db, 'schools', schoolId, subcollection, docId);
};

export const defaultSchoolId = () => getFirebaseConfig().defaultSchoolId || 'school-oakridge-01';

export const firestoreService = {
  // Get User Profile
  async getUserProfile(uid: string, schoolId: string = defaultSchoolId()): Promise<UserProfile | null> {
    if (!isFirebaseConfigured()) {
      return simsStore.getUserById(uid) || null;
    }
    try {
      const docRef = getSchoolDoc(schoolId, 'users', uid);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        return snap.data() as UserProfile;
      }
      return null;
    } catch (err) {
      console.warn('Firestore fetch failed, falling back to local store:', err);
      return simsStore.getUserById(uid) || null;
    }
  },

  // Save User Profile
  async saveUserProfile(user: UserProfile, schoolId: string = defaultSchoolId()): Promise<void> {
    simsStore.saveUser(user);
    if (isFirebaseConfigured()) {
      try {
        const docRef = getSchoolDoc(schoolId, 'users', user.uid);
        await setDoc(docRef, user, { merge: true });
      } catch (err) {
        console.error('Failed to write profile to Firestore:', err);
      }
    }
  },

  // Get Timetable Slots
  async getTimetable(classId?: string, sectionId?: string, dayOfWeek?: number, schoolId: string = defaultSchoolId()): Promise<TimetableSlot[]> {
    if (!isFirebaseConfigured()) {
      return simsStore.getTimetable(classId, sectionId, dayOfWeek);
    }
    try {
      const colRef = getSchoolCollection(schoolId, 'routines');
      let q = query(colRef);
      if (classId) q = query(q, where('classId', '==', classId));
      if (sectionId) q = query(q, where('sectionId', '==', sectionId));
      if (dayOfWeek !== undefined) q = query(q, where('dayOfWeek', '==', dayOfWeek));
      const snap = await getDocs(q);
      if (!snap.empty) {
        return snap.docs.map((d) => d.data() as TimetableSlot).sort((a, b) => a.periodNumber - b.periodNumber);
      }
      return simsStore.getTimetable(classId, sectionId, dayOfWeek);
    } catch (err) {
      console.warn('Firestore timetable fetch failed, fallback to local store:', err);
      return simsStore.getTimetable(classId, sectionId, dayOfWeek);
    }
  },

  // Save Attendance Draft
  async saveAttendanceDraft(session: Omit<AttendanceSession, 'id' | 'status' | 'createdAt'> & { id?: string }, schoolId: string = defaultSchoolId()): Promise<AttendanceSession> {
    const saved = simsStore.saveAttendanceDraft(session);
    if (isFirebaseConfigured()) {
      try {
        const docRef = getSchoolDoc(schoolId, 'attendance_sessions', saved.id);
        await setDoc(docRef, saved, { merge: true });
      } catch (err) {
        console.error('Failed to save draft to Firestore:', err);
      }
    }
    return saved;
  },

  // Finalize Attendance Session
  async finalizeAttendance(sessionId: string, finalizedBy: string, finalizedByName: string, schoolId: string = defaultSchoolId()): Promise<AttendanceSession> {
    const finalized = simsStore.finalizeAttendance(sessionId, finalizedBy, finalizedByName);
    if (isFirebaseConfigured()) {
      try {
        const docRef = getSchoolDoc(schoolId, 'attendance_sessions', sessionId);
        await updateDoc(docRef, {
          status: 'finalized',
          finalizedAt: finalized.finalizedAt,
          finalizedBy,
          finalizedByName,
        });
      } catch (err) {
        console.error('Failed to finalize in Firestore:', err);
      }
    }
    return finalized;
  },

  // Apply Authorized Correction
  async applyAuthorizedCorrection(params: {
    sessionId: string;
    studentId: string;
    studentName: string;
    newStatus: 'P' | 'A' | 'L';
    reason: string;
    authorizedBy: string;
    authorizedByName: string;
    schoolId?: string;
  }): Promise<{ success: boolean; error?: string }> {
    const schoolId = params.schoolId || defaultSchoolId();
    const result = simsStore.applyAuthorizedCorrection(params);
    if (!result.success) return result;

    if (isFirebaseConfigured()) {
      try {
        const sessionRef = getSchoolDoc(schoolId, 'attendance_sessions', params.sessionId);
        const sessionSnap = await getDoc(sessionRef);
        if (sessionSnap.exists()) {
          const currentData = sessionSnap.data() as AttendanceSession;
          const oldStatus = currentData.records[params.studentId] || 'A';
          currentData.records[params.studentId] = params.newStatus;
          await updateDoc(sessionRef, {
            records: currentData.records,
          });

          // Append audit log
          const auditRef = getSchoolDoc(schoolId, 'audit_logs', `audit-${Date.now()}`);
          const auditLog: AttendanceAuditLog = {
            id: auditRef.id,
            schoolId,
            sessionId: params.sessionId,
            studentId: params.studentId,
            studentName: params.studentName,
            oldStatus,
            newStatus: params.newStatus,
            reason: params.reason,
            authorizedBy: params.authorizedBy,
            authorizedByName: params.authorizedByName,
            timestamp: new Date().toISOString(),
          };
          await setDoc(auditRef, auditLog);
        }
      } catch (err) {
        console.error('Failed to sync correction to Firestore:', err);
      }
    }
    return result;
  },

  // Announcements
  async getAnnouncements(category?: string, schoolId: string = defaultSchoolId()): Promise<Announcement[]> {
    if (!isFirebaseConfigured()) {
      return simsStore.getAnnouncements(category);
    }
    try {
      const colRef = getSchoolCollection(schoolId, 'announcements');
      let q = query(colRef, orderBy('publishedAt', 'desc'), limit(20));
      if (category && category !== 'all') {
        q = query(colRef, where('category', '==', category), orderBy('publishedAt', 'desc'), limit(20));
      }
      const snap = await getDocs(q);
      if (!snap.empty) {
        return snap.docs.map((d) => d.data() as Announcement);
      }
      return simsStore.getAnnouncements(category);
    } catch (err) {
      console.warn('Firestore announcements fetch failed:', err);
      return simsStore.getAnnouncements(category);
    }
  },

  // Leave Requests
  async submitLeaveRequest(data: Omit<LeaveRequest, 'id' | 'status' | 'createdAt'>, schoolId: string = defaultSchoolId()): Promise<LeaveRequest> {
    const saved = simsStore.submitLeaveRequest(data);
    if (isFirebaseConfigured()) {
      try {
        const docRef = getSchoolDoc(schoolId, 'leave_requests', saved.id);
        await setDoc(docRef, saved);
      } catch (err) {
        console.error('Failed to submit leave to Firestore:', err);
      }
    }
    return saved;
  },

  // Correction Requests
  async submitCorrectionRequest(data: Omit<CorrectionRequest, 'id' | 'status' | 'createdAt'>, schoolId: string = defaultSchoolId()): Promise<CorrectionRequest> {
    const saved = simsStore.submitCorrectionRequest(data);
    if (isFirebaseConfigured()) {
      try {
        const docRef = getSchoolDoc(schoolId, 'correction_requests', saved.id);
        await setDoc(docRef, saved);
      } catch (err) {
        console.error('Failed to submit correction to Firestore:', err);
      }
    }
    return saved;
  },
};

