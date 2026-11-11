import {
  UserProfile,
  School,
  ClassItem,
  SectionItem,
  SubjectItem,
  TimetableSlot,
  AttendanceSession,
  AttendanceAuditLog,
  LeaveRequest,
  CorrectionRequest,
  Announcement,
  NotificationItem,
  AttendanceStatus,
  FeeRecord,
  ExamResult,
  PerformanceReport,
  GuardianComplaint,
} from '../types';
import {
  SEED_SCHOOL,
  SEED_CLASSES,
  SEED_SECTIONS,
  SEED_SUBJECTS,
  SEED_USERS,
  SEED_TIMETABLE,
  SEED_ATTENDANCE_SESSIONS,
  SEED_AUDIT_LOGS,
  SEED_LEAVE_REQUESTS,
  SEED_CORRECTION_REQUESTS,
  SEED_ANNOUNCEMENTS,
  SEED_NOTIFICATIONS,
  SEED_STUDENTS_ROSTER,
  SEED_FEE_RECORDS,
  SEED_EXAM_RESULTS,
  SEED_PERFORMANCE_REPORTS,
  SEED_GUARDIAN_COMPLAINTS,
} from '../mock/seedData';

const STORAGE_KEYS = {
  SCHOOL: 'sims_school',
  USERS: 'sims_users',
  CLASSES: 'sims_classes',
  SECTIONS: 'sims_sections',
  SUBJECTS: 'sims_subjects',
  TIMETABLE: 'sims_timetable',
  ATTENDANCE: 'sims_attendance_sessions',
  AUDIT_LOGS: 'sims_audit_logs',
  LEAVE_REQUESTS: 'sims_leave_requests',
  CORRECTIONS: 'sims_correction_requests',
  ANNOUNCEMENTS: 'sims_announcements',
  NOTIFICATIONS: 'sims_notifications',
  CURRENT_USER_ID: 'sims_current_user_id',
  ADMIN_USER_ID: 'sims_admin_user_id',
  FEE_RECORDS: 'sims_fee_records',
  EXAM_RESULTS: 'sims_exam_results',
  PERFORMANCE_REPORTS: 'sims_performance_reports',
  GUARDIAN_COMPLAINTS: 'sims_guardian_complaints',
};

// Listeners for reactive updates
type Listener = () => void;
const listeners: Set<Listener> = new Set();

export const subscribeToStore = (listener: Listener) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

const notifyListeners = () => {
  listeners.forEach((fn) => {
    try {
      fn();
    } catch (e) {
      console.error('Error notifying store listener:', e);
    }
  });
};

// Safe localStorage access
const getItem = <T>(key: string, fallback: T): T => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
};

const setItem = <T>(key: string, value: T): void => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    notifyListeners();
  } catch (e) {
    console.error('Storage write error:', e);
  }
};

// Initialize or seed data
export const initializeStore = (forceReset = false): void => {
  if (forceReset || !localStorage.getItem(STORAGE_KEYS.SCHOOL)) {
    localStorage.setItem(STORAGE_KEYS.SCHOOL, JSON.stringify(SEED_SCHOOL));
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(SEED_USERS));
    localStorage.setItem(STORAGE_KEYS.CLASSES, JSON.stringify(SEED_CLASSES));
    localStorage.setItem(STORAGE_KEYS.SECTIONS, JSON.stringify(SEED_SECTIONS));
    localStorage.setItem(STORAGE_KEYS.SUBJECTS, JSON.stringify(SEED_SUBJECTS));
    localStorage.setItem(STORAGE_KEYS.TIMETABLE, JSON.stringify(SEED_TIMETABLE));
    localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify(SEED_ATTENDANCE_SESSIONS));
    localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(SEED_AUDIT_LOGS));
    localStorage.setItem(STORAGE_KEYS.LEAVE_REQUESTS, JSON.stringify(SEED_LEAVE_REQUESTS));
    localStorage.setItem(STORAGE_KEYS.CORRECTIONS, JSON.stringify(SEED_CORRECTION_REQUESTS));
    localStorage.setItem(STORAGE_KEYS.ANNOUNCEMENTS, JSON.stringify(SEED_ANNOUNCEMENTS));
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(SEED_NOTIFICATIONS));
    localStorage.setItem(STORAGE_KEYS.FEE_RECORDS, JSON.stringify(SEED_FEE_RECORDS));
    localStorage.setItem(STORAGE_KEYS.EXAM_RESULTS, JSON.stringify(SEED_EXAM_RESULTS));
    localStorage.setItem(STORAGE_KEYS.PERFORMANCE_REPORTS, JSON.stringify(SEED_PERFORMANCE_REPORTS));
    localStorage.setItem(STORAGE_KEYS.GUARDIAN_COMPLAINTS, JSON.stringify(SEED_GUARDIAN_COMPLAINTS));
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, JSON.stringify('student-alex'));
    localStorage.setItem(STORAGE_KEYS.ADMIN_USER_ID, JSON.stringify('admin-eleanor'));
    notifyListeners();
  }
};

// Store API
export const simsStore = {
  // School
  getSchool(): School {
    return getItem(STORAGE_KEYS.SCHOOL, SEED_SCHOOL);
  },

  // Users
  getUsers(): UserProfile[] {
    return getItem(STORAGE_KEYS.USERS, SEED_USERS);
  },

  getUserById(uid: string): UserProfile | undefined {
    return this.getUsers().find((u) => u.uid === uid);
  },

  getCurrentUser(): UserProfile | undefined {
    const uid = getItem<string | null>(STORAGE_KEYS.CURRENT_USER_ID, 'student-alex');
    return uid ? this.getUserById(uid) : undefined;
  },

  setCurrentUser(uid: string | null): void {
    setItem(STORAGE_KEYS.CURRENT_USER_ID, uid);
  },

  getCurrentAdmin(): UserProfile | undefined {
    const uid = getItem<string | null>(STORAGE_KEYS.ADMIN_USER_ID, 'admin-eleanor');
    return uid ? this.getUserById(uid) : undefined;
  },

  setCurrentAdmin(uid: string | null): void {
    setItem(STORAGE_KEYS.ADMIN_USER_ID, uid);
  },

  saveUser(user: UserProfile): void {
    const users = this.getUsers();
    const idx = users.findIndex((u) => u.uid === user.uid);
    if (idx >= 0) {
      users[idx] = { ...user, updatedAt: new Date().toISOString() };
    } else {
      users.push(user);
    }
    setItem(STORAGE_KEYS.USERS, users);
  },

  // Teacher Approval Queue
  getPendingTeachers(): UserProfile[] {
    return this.getUsers().filter((u) => u.role === 'teacher' && u.status === 'pending');
  },

  approveTeacher(teacherId: string, department?: string): void {
    const user = this.getUserById(teacherId);
    if (user && user.role === 'teacher') {
      user.status = 'active';
      if (department && user.teacherData) {
        user.teacherData.department = department;
      }
      this.saveUser(user);
      this.addNotification({
        title: 'Teacher Approved',
        message: `${user.name} was approved by administration.`,
        type: 'system',
        targetRoles: ['admin', 'teacher'],
      });
    }
  },

  rejectTeacher(teacherId: string, _reason?: string): void {
    const user = this.getUserById(teacherId);
    if (user && user.role === 'teacher') {
      user.status = 'rejected';
      this.saveUser(user);
    }
  },

  // Student Placement Review
  getPendingPlacementStudents(): UserProfile[] {
    return this.getUsers().filter((u) => u.role === 'student' && u.status === 'pending_placement');
  },

  assignOfficialPlacement(
    studentId: string,
    classId: string,
    className: string,
    sectionId: string,
    sectionName: string,
    rollNumber: string
  ): void {
    const user = this.getUserById(studentId);
    if (user && user.role === 'student') {
      user.status = 'active';
      user.studentData = {
        admissionNumber: user.studentData?.admissionNumber || `ADM-2026-${Math.floor(1000 + Math.random() * 9000)}`,
        classId,
        className,
        sectionId,
        sectionName,
        rollNumber,
        dob: user.studentData?.dob || '2010-01-01',
        guardianName: user.studentData?.guardianName,
        guardianPhone: user.studentData?.guardianPhone,
      };
      this.saveUser(user);
      this.addNotification({
        title: 'Official Placement Confirmed',
        message: `${user.name} has been assigned to ${className} ${sectionName} (Roll #${rollNumber}).`,
        type: 'system',
        targetUserId: user.uid,
      });
    }
  },

  // Classes & Sections & Subjects
  getClasses(): ClassItem[] {
    const items = getItem<ClassItem[]>(STORAGE_KEYS.CLASSES, SEED_CLASSES);
    return [...items].sort((a, b) => a.gradeLevel - b.gradeLevel);
  },

  getSections(classId?: string): SectionItem[] {
    const all = getItem<SectionItem[]>(STORAGE_KEYS.SECTIONS, SEED_SECTIONS);
    return classId ? all.filter((s) => s.classId === classId) : all;
  },

  getSubjects(): SubjectItem[] {
    return getItem(STORAGE_KEYS.SUBJECTS, SEED_SUBJECTS);
  },

  saveClass(cls: ClassItem): void {
    const items = this.getClasses();
    const idx = items.findIndex((c) => c.id === cls.id);
    if (idx >= 0) items[idx] = cls;
    else items.push(cls);
    setItem(STORAGE_KEYS.CLASSES, items);
  },

  saveSection(sec: SectionItem): void {
    const items = this.getSections();
    const idx = items.findIndex((s) => s.id === sec.id);
    if (idx >= 0) items[idx] = sec;
    else items.push(sec);
    setItem(STORAGE_KEYS.SECTIONS, items);
  },

  saveSubject(sub: SubjectItem): void {
    const items = this.getSubjects();
    const idx = items.findIndex((s) => s.id === sub.id);
    if (idx >= 0) items[idx] = sub;
    else items.push(sub);
    setItem(STORAGE_KEYS.SUBJECTS, items);
  },

  deleteClass(classId: string): void {
    // Remove the class
    const classes = this.getClasses().filter((c) => c.id !== classId);
    setItem(STORAGE_KEYS.CLASSES, classes);
    // Also remove all sections of that class
    const sections = this.getSections().filter((s) => s.classId !== classId);
    setItem(STORAGE_KEYS.SECTIONS, sections);
  },

  deleteSection(sectionId: string): void {
    const sections = this.getSections().filter((s) => s.id !== sectionId);
    setItem(STORAGE_KEYS.SECTIONS, sections);
  },

  deleteSubject(subjectId: string): void {
    const subjects = this.getSubjects().filter((s) => s.id !== subjectId);
    setItem(STORAGE_KEYS.SUBJECTS, subjects);
  },

  // Student roster for a class/section
  getClassRoster(classId: string, sectionId: string) {
    // For demo Grade 10 Section A, return full roster
    if (sectionId === 'sec-g10-a' || classId === 'class-g10') {
      return SEED_STUDENTS_ROSTER;
    }
    // Filter actual users or return default cohort
    const users = this.getUsers().filter(
      (u) => u.role === 'student' && u.studentData?.sectionId === sectionId
    );
    if (users.length > 0) {
      return users.map((u) => ({
        id: u.uid,
        name: u.name,
        roll: u.studentData?.rollNumber || '01',
        admission: u.studentData?.admissionNumber || 'ADM-000',
        email: u.email,
      }));
    }
    return SEED_STUDENTS_ROSTER.slice(0, 15);
  },

  // Timetable
  getTimetable(classId?: string, sectionId?: string, dayOfWeek?: number): TimetableSlot[] {
    let slots = getItem<TimetableSlot[]>(STORAGE_KEYS.TIMETABLE, SEED_TIMETABLE);
    if (classId) slots = slots.filter((s) => s.classId === classId);
    if (sectionId) slots = slots.filter((s) => s.sectionId === sectionId);
    if (dayOfWeek !== undefined) slots = slots.filter((s) => s.dayOfWeek === dayOfWeek);
    return slots.sort((a, b) => a.periodNumber - b.periodNumber);
  },

  getTeacherTimetable(teacherId: string, dayOfWeek?: number): TimetableSlot[] {
    let slots = getItem<TimetableSlot[]>(STORAGE_KEYS.TIMETABLE, SEED_TIMETABLE).filter(
      (s) => s.teacherId === teacherId
    );
    if (dayOfWeek !== undefined) slots = slots.filter((s) => s.dayOfWeek === dayOfWeek);
    return slots.sort((a, b) => a.periodNumber - b.periodNumber);
  },

  saveTimetableSlot(slot: TimetableSlot): { success: boolean; conflictError?: string } {
    const slots = getItem<TimetableSlot[]>(STORAGE_KEYS.TIMETABLE, SEED_TIMETABLE);

    // Conflict check 1: Teacher conflict
    const teacherConflict = slots.find(
      (s) =>
        s.id !== slot.id &&
        s.teacherId === slot.teacherId &&
        s.dayOfWeek === slot.dayOfWeek &&
        s.periodNumber === slot.periodNumber
    );
    if (teacherConflict) {
      return {
        success: false,
        conflictError: `Teacher is already scheduled for Period ${slot.periodNumber} on Day ${slot.dayOfWeek} (${teacherConflict.roomNumber})`,
      };
    }

    // Conflict check 2: Room conflict
    const roomConflict = slots.find(
      (s) =>
        s.id !== slot.id &&
        s.roomNumber.toLowerCase() === slot.roomNumber.toLowerCase() &&
        s.dayOfWeek === slot.dayOfWeek &&
        s.periodNumber === slot.periodNumber
    );
    if (roomConflict) {
      return {
        success: false,
        conflictError: `Room ${slot.roomNumber} is already occupied during Period ${slot.periodNumber} on Day ${slot.dayOfWeek}`,
      };
    }

    const idx = slots.findIndex((s) => s.id === slot.id);
    if (idx >= 0) slots[idx] = slot;
    else slots.push(slot);
    setItem(STORAGE_KEYS.TIMETABLE, slots);
    return { success: true };
  },

  deleteTimetableSlot(slotId: string): void {
    const slots = getItem<TimetableSlot[]>(STORAGE_KEYS.TIMETABLE, SEED_TIMETABLE).filter(
      (s) => s.id !== slotId
    );
    setItem(STORAGE_KEYS.TIMETABLE, slots);
  },

  // Attendance Sessions
  getAttendanceSessions(filters?: {
    classId?: string;
    sectionId?: string;
    subjectId?: string;
    date?: string;
    status?: 'draft' | 'finalized';
    teacherId?: string;
  }): AttendanceSession[] {
    let list = getItem<AttendanceSession[]>(STORAGE_KEYS.ATTENDANCE, SEED_ATTENDANCE_SESSIONS);
    if (!filters) return list;

    if (filters.classId) list = list.filter((s) => s.classId === filters.classId);
    if (filters.sectionId) list = list.filter((s) => s.sectionId === filters.sectionId);
    if (filters.subjectId) list = list.filter((s) => s.subjectId === filters.subjectId);
    if (filters.date) list = list.filter((s) => s.date === filters.date);
    if (filters.status) list = list.filter((s) => s.status === filters.status);
    if (filters.teacherId) list = list.filter((s) => s.teacherId === filters.teacherId);
    return list;
  },

  getAttendanceSessionById(sessionId: string): AttendanceSession | undefined {
    return this.getAttendanceSessions().find((s) => s.id === sessionId);
  },

  // Save draft attendance
  saveAttendanceDraft(session: Omit<AttendanceSession, 'id' | 'status' | 'createdAt'> & { id?: string }): AttendanceSession {
    const list = this.getAttendanceSessions();
    const id = session.id || `session-${Date.now()}`;
    const presentCount = Object.values(session.records).filter((st) => st === 'P').length;
    const absentCount = Object.values(session.records).filter((st) => st === 'A').length;
    const leaveCount = Object.values(session.records).filter((st) => st === 'L').length;

    const existingIdx = list.findIndex((s) => s.id === id);
    const existing = existingIdx >= 0 ? list[existingIdx] : undefined;

    const draftSession: AttendanceSession = {
      ...session,
      id,
      status: 'draft',
      totalStudents: Object.keys(session.records).length,
      presentCount,
      absentCount,
      leaveCount,
      lastDraftSavedAt: new Date().toISOString(),
      createdAt: existing?.createdAt || new Date().toISOString(),
    };

    if (existingIdx >= 0) {
      list[existingIdx] = draftSession;
    } else {
      list.push(draftSession);
    }
    setItem(STORAGE_KEYS.ATTENDANCE, list);
    return draftSession;
  },

  // Finalize attendance session
  finalizeAttendance(sessionId: string, finalizedBy: string, finalizedByName: string): AttendanceSession {
    const list = this.getAttendanceSessions();
    const session = list.find((s) => s.id === sessionId);
    if (!session) throw new Error('Session not found');

    session.status = 'finalized';
    session.finalizedAt = new Date().toISOString();
    session.finalizedBy = finalizedBy;
    session.finalizedByName = finalizedByName;

    setItem(STORAGE_KEYS.ATTENDANCE, list);

    this.addNotification({
      title: 'Attendance Finalized',
      message: `${session.subjectName} attendance for ${session.className} ${session.sectionName} on ${session.date} has been finalized by ${finalizedByName}.`,
      type: 'attendance',
      targetRoles: ['student', 'parent', 'admin'],
    });

    return session;
  },

  // Authorized Attendance Correction (Admin & Attendance Officer)
  applyAuthorizedCorrection(params: {
    sessionId: string;
    studentId: string;
    studentName: string;
    newStatus: AttendanceStatus;
    reason: string;
    authorizedBy: string;
    authorizedByName: string;
  }): { success: boolean; error?: string } {
    if (!params.reason || params.reason.trim().length < 5) {
      return { success: false, error: 'A valid reason (minimum 5 characters) is required for authorized correction.' };
    }

    const list = this.getAttendanceSessions();
    const session = list.find((s) => s.id === params.sessionId);
    if (!session) return { success: false, error: 'Session not found.' };

    const oldStatus = session.records[params.studentId] || 'A';
    if (oldStatus === params.newStatus) {
      return { success: false, error: 'New status is identical to current status.' };
    }

    // Update session record
    session.records[params.studentId] = params.newStatus;
    session.presentCount = Object.values(session.records).filter((st) => st === 'P').length;
    session.absentCount = Object.values(session.records).filter((st) => st === 'A').length;
    session.leaveCount = Object.values(session.records).filter((st) => st === 'L').length;
    setItem(STORAGE_KEYS.ATTENDANCE, list);

    // Create immutable audit log
    const auditLogs = this.getAuditLogs();
    const newAuditLog: AttendanceAuditLog = {
      id: `audit-${Date.now()}`,
      schoolId: session.schoolId,
      sessionId: session.id,
      studentId: params.studentId,
      studentName: params.studentName,
      oldStatus,
      newStatus: params.newStatus,
      reason: params.reason.trim(),
      authorizedBy: params.authorizedBy,
      authorizedByName: params.authorizedByName,
      timestamp: new Date().toISOString(),
    };
    auditLogs.unshift(newAuditLog);
    setItem(STORAGE_KEYS.AUDIT_LOGS, auditLogs);

    this.addNotification({
      title: 'Attendance Corrected',
      message: `Attendance for ${params.studentName} on ${session.date} (${session.subjectName}) was updated to ${params.newStatus}. Reason: ${params.reason}`,
      type: 'correction',
      targetUserId: params.studentId,
    });

    return { success: true };
  },

  // Audit Logs
  getAuditLogs(): AttendanceAuditLog[] {
    return getItem(STORAGE_KEYS.AUDIT_LOGS, SEED_AUDIT_LOGS);
  },

  // Student Attendance Statistics (calculates from finalized sessions only!)
  getStudentAttendanceStats(studentId: string, month?: string) {
    const sessions = this.getAttendanceSessions({ status: 'finalized' }).filter(
      (s) => s.records[studentId] !== undefined && (!month || s.date.startsWith(month))
    );

    let totalLectures = 0;
    let presentLectures = 0;
    let absentLectures = 0;
    let leaveLectures = 0;

    const subjectStats: Record<
      string,
      { subjectId: string; subjectName: string; total: number; present: number; absent: number; leave: number; percentage: number }
    > = {};

    sessions.forEach((sess) => {
      const st = sess.records[studentId];
      totalLectures++;
      if (st === 'P') presentLectures++;
      else if (st === 'A') absentLectures++;
      else if (st === 'L') leaveLectures++;

      if (!subjectStats[sess.subjectId]) {
        subjectStats[sess.subjectId] = {
          subjectId: sess.subjectId,
          subjectName: sess.subjectName,
          total: 0,
          present: 0,
          absent: 0,
          leave: 0,
          percentage: 100,
        };
      }
      subjectStats[sess.subjectId].total++;
      if (st === 'P') subjectStats[sess.subjectId].present++;
      else if (st === 'A') subjectStats[sess.subjectId].absent++;
      else if (st === 'L') subjectStats[sess.subjectId].leave++;
    });

    Object.values(subjectStats).forEach((sub) => {
      sub.percentage = sub.total > 0 ? Math.round((sub.present / sub.total) * 1000) / 10 : 100;
    });

    // If student has few recorded demo sessions AND no month filter,
    // enrich with realistic historic totals for overall stats display
    const isDemoAlex = studentId === 'student-alex' && !month;
    const effectiveTotal   = isDemoAlex ? 96 : totalLectures;
    const effectivePresent = isDemoAlex ? 85 : presentLectures;
    const effectiveAbsent  = isDemoAlex ? 7  : absentLectures;
    const effectiveLeave   = isDemoAlex ? 4  : leaveLectures;
    const overallPercentage =
      effectiveTotal > 0 ? Math.round((effectivePresent / effectiveTotal) * 1000) / 10 : 100;

    return {
      totalLectures: effectiveTotal,
      presentLectures: effectivePresent,
      absentLectures: effectiveAbsent,
      leaveLectures: effectiveLeave,
      overallPercentage,
      isShortage: overallPercentage < 75,
      subjectBreakdown: Object.values(subjectStats),
      sessions,
    };
  },

  // Leave Requests
  getLeaveRequests(filters?: { studentId?: string; status?: 'pending' | 'approved' | 'rejected' }): LeaveRequest[] {
    let list = getItem<LeaveRequest[]>(STORAGE_KEYS.LEAVE_REQUESTS, SEED_LEAVE_REQUESTS);
    if (filters?.studentId) list = list.filter((r) => r.studentId === filters.studentId);
    if (filters?.status) list = list.filter((r) => r.status === filters.status);
    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  submitLeaveRequest(data: Omit<LeaveRequest, 'id' | 'status' | 'createdAt'>): LeaveRequest {
    const list = this.getLeaveRequests();
    const newReq: LeaveRequest = {
      ...data,
      id: `leave-${Date.now()}`,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
    list.unshift(newReq);
    setItem(STORAGE_KEYS.LEAVE_REQUESTS, list);

    this.addNotification({
      title: 'New Leave Request',
      message: `Leave application submitted for ${data.studentName} (${data.leaveType}) from ${data.startDate} to ${data.endDate}.`,
      type: 'leave',
      targetRoles: ['teacher', 'admin'],
    });

    return newReq;
  },

  reviewLeaveRequest(requestId: string, status: 'approved' | 'rejected', reviewerId: string, reviewerName: string, remarks?: string): void {
    const list = this.getLeaveRequests();
    const req = list.find((r) => r.id === requestId);
    if (req) {
      req.status = status;
      req.reviewedBy = reviewerId;
      req.reviewedByName = reviewerName;
      req.reviewRemarks = remarks;
      req.reviewedAt = new Date().toISOString();
      setItem(STORAGE_KEYS.LEAVE_REQUESTS, list);

      this.addNotification({
        title: `Leave Request ${status === 'approved' ? 'Approved' : 'Rejected'}`,
        message: `Your leave request for ${req.startDate} to ${req.endDate} has been ${status} by ${reviewerName}.`,
        type: 'leave',
        targetUserId: req.studentId,
      });
    }
  },

  // Correction Requests
  getCorrectionRequests(filters?: { studentId?: string; status?: 'pending' | 'approved' | 'rejected' }): CorrectionRequest[] {
    let list = getItem<CorrectionRequest[]>(STORAGE_KEYS.CORRECTIONS, SEED_CORRECTION_REQUESTS);
    if (filters?.studentId) list = list.filter((r) => r.studentId === filters.studentId);
    if (filters?.status) list = list.filter((r) => r.status === filters.status);
    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  submitCorrectionRequest(data: Omit<CorrectionRequest, 'id' | 'status' | 'createdAt'>): CorrectionRequest {
    const list = this.getCorrectionRequests();
    const newReq: CorrectionRequest = {
      ...data,
      id: `corr-${Date.now()}`,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
    list.unshift(newReq);
    setItem(STORAGE_KEYS.CORRECTIONS, list);

    this.addNotification({
      title: 'Attendance Correction Appeal',
      message: `${data.studentName} requested attendance review for ${data.subjectName} on ${data.sessionDate}.`,
      type: 'correction',
      targetRoles: ['admin', 'teacher'],
    });

    return newReq;
  },

  reviewCorrectionRequest(
    requestId: string,
    status: 'approved' | 'rejected',
    reviewerId: string,
    reviewerName: string,
    remarks?: string
  ): void {
    const list = this.getCorrectionRequests();
    const req = list.find((r) => r.id === requestId);
    if (req) {
      req.status = status;
      req.reviewedBy = reviewerId;
      req.reviewedByName = reviewerName;
      req.reviewRemarks = remarks;
      req.reviewedAt = new Date().toISOString();
      setItem(STORAGE_KEYS.CORRECTIONS, list);

      // If approved, automatically apply authorized correction to the attendance session!
      if (status === 'approved') {
        this.applyAuthorizedCorrection({
          sessionId: req.sessionId,
          studentId: req.studentId,
          studentName: req.studentName,
          newStatus: req.requestedStatus,
          reason: `Approved student appeal #${req.id}: ${remarks || req.reason}`,
          authorizedBy: reviewerId,
          authorizedByName: reviewerName,
        });
      } else {
        this.addNotification({
          title: 'Correction Appeal Rejected',
          message: `Your correction appeal for ${req.subjectName} on ${req.sessionDate} was rejected. Note: ${remarks || 'Insufficient documentation.'}`,
          type: 'correction',
          targetUserId: req.studentId,
        });
      }
    }
  },

  // Announcements
  getAnnouncements(category?: string): Announcement[] {
    let list = getItem<Announcement[]>(STORAGE_KEYS.ANNOUNCEMENTS, SEED_ANNOUNCEMENTS);
    if (category && category !== 'all') {
      list = list.filter((a) => a.category === category);
    }
    return list.sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
    });
  },

  saveAnnouncement(ann: Announcement): void {
    const list = this.getAnnouncements();
    const idx = list.findIndex((a) => a.id === ann.id);
    if (idx >= 0) list[idx] = ann;
    else list.unshift(ann);
    setItem(STORAGE_KEYS.ANNOUNCEMENTS, list);

    this.addNotification({
      title: ann.title,
      message: `New announcement posted by ${ann.authorName}.`,
      type: 'announcement',
      targetRoles: ['student', 'teacher', 'parent'],
    });
  },

  deleteAnnouncement(annId: string): void {
    const list = this.getAnnouncements().filter((a) => a.id !== annId);
    setItem(STORAGE_KEYS.ANNOUNCEMENTS, list);
  },

  // Notifications
  getNotifications(userId?: string, role?: string): NotificationItem[] {
    let list = getItem<NotificationItem[]>(STORAGE_KEYS.NOTIFICATIONS, SEED_NOTIFICATIONS);
    if (userId) {
      list = list.filter((n) => !n.targetUserId || n.targetUserId === userId);
    }
    if (role) {
      list = list.filter((n) => !n.targetRoles || n.targetRoles.includes(role as any));
    }
    return list;
  },

  addNotification(item: Omit<NotificationItem, 'id' | 'timestamp' | 'read'>): void {
    const list = getItem<NotificationItem[]>(STORAGE_KEYS.NOTIFICATIONS, SEED_NOTIFICATIONS);
    const newNotif: NotificationItem = {
      ...item,
      id: `notif-${Date.now()}`,
      timestamp: new Date().toISOString(),
      read: false,
    };
    list.unshift(newNotif);
    setItem(STORAGE_KEYS.NOTIFICATIONS, list);
  },

  markNotificationRead(notifId: string): void {
    const list = getItem<NotificationItem[]>(STORAGE_KEYS.NOTIFICATIONS, SEED_NOTIFICATIONS);
    const item = list.find((n) => n.id === notifId);
    if (item) {
      item.read = true;
      setItem(STORAGE_KEYS.NOTIFICATIONS, list);
    }
  },

  markAllNotificationsRead(): void {
    const list = getItem<NotificationItem[]>(STORAGE_KEYS.NOTIFICATIONS, SEED_NOTIFICATIONS);
    list.forEach((n) => (n.read = true));
    setItem(STORAGE_KEYS.NOTIFICATIONS, list);
  },

  // ── Fee Records ──────────────────────────────────────────────────────────
  getFeeRecords(studentId?: string): FeeRecord[] {
    let list = getItem<FeeRecord[]>(STORAGE_KEYS.FEE_RECORDS, SEED_FEE_RECORDS);
    if (studentId) list = list.filter(f => f.studentId === studentId);
    return list.sort((a, b) => b.month.localeCompare(a.month));
  },
  saveFeeRecord(fee: FeeRecord): void {
    const list = getItem<FeeRecord[]>(STORAGE_KEYS.FEE_RECORDS, SEED_FEE_RECORDS);
    const idx = list.findIndex(f => f.id === fee.id);
    if (idx >= 0) list[idx] = fee; else list.push(fee);
    setItem(STORAGE_KEYS.FEE_RECORDS, list);
  },
  getStudentPendingFees(studentId: string): FeeRecord[] {
    return this.getFeeRecords(studentId).filter(f => f.status === 'pending' || f.status === 'overdue');
  },

  // ── Exam Results ─────────────────────────────────────────────────────────
  getExamResults(studentId?: string): ExamResult[] {
    let list = getItem<ExamResult[]>(STORAGE_KEYS.EXAM_RESULTS, SEED_EXAM_RESULTS);
    if (studentId) list = list.filter(r => r.studentId === studentId);
    return list.sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
  },
  saveExamResult(result: ExamResult): void {
    const list = getItem<ExamResult[]>(STORAGE_KEYS.EXAM_RESULTS, SEED_EXAM_RESULTS);
    const idx = list.findIndex(r => r.id === result.id);
    if (idx >= 0) list[idx] = result; else list.push(result);
    setItem(STORAGE_KEYS.EXAM_RESULTS, list);
  },
  getClassExamResults(classId: string, examName?: string): ExamResult[] {
    let list = getItem<ExamResult[]>(STORAGE_KEYS.EXAM_RESULTS, SEED_EXAM_RESULTS)
      .filter(r => r.classId === classId);
    if (examName) list = list.filter(r => r.examName === examName);
    return list;
  },

  // ── Performance Reports ──────────────────────────────────────────────────
  getPerformanceReports(studentId?: string): PerformanceReport[] {
    let list = getItem<PerformanceReport[]>(STORAGE_KEYS.PERFORMANCE_REPORTS, SEED_PERFORMANCE_REPORTS);
    if (studentId) list = list.filter(r => r.studentId === studentId);
    return list.sort((a, b) => b.month.localeCompare(a.month));
  },
  savePerformanceReport(report: PerformanceReport): void {
    const list = getItem<PerformanceReport[]>(STORAGE_KEYS.PERFORMANCE_REPORTS, SEED_PERFORMANCE_REPORTS);
    const idx = list.findIndex(r => r.id === report.id);
    if (idx >= 0) list[idx] = report; else list.unshift(report);
    setItem(STORAGE_KEYS.PERFORMANCE_REPORTS, list);
    this.addNotification({
      title: 'Performance Report Added',
      message: `A new performance report for ${report.studentName} has been submitted by ${report.teacherName}.`,
      type: 'system',
      targetUserId: report.studentId,
    });
  },

  // ── Guardian Complaints ──────────────────────────────────────────────────
  getGuardianComplaints(studentId?: string): GuardianComplaint[] {
    let list = getItem<GuardianComplaint[]>(STORAGE_KEYS.GUARDIAN_COMPLAINTS, SEED_GUARDIAN_COMPLAINTS);
    if (studentId) list = list.filter(c => c.studentId === studentId);
    return list.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  },
  getAllGuardianComplaints(): GuardianComplaint[] {
    return getItem<GuardianComplaint[]>(STORAGE_KEYS.GUARDIAN_COMPLAINTS, SEED_GUARDIAN_COMPLAINTS)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  },
  submitGuardianComplaint(data: Omit<GuardianComplaint, 'id' | 'status' | 'createdAt'>): GuardianComplaint {
    const list = getItem<GuardianComplaint[]>(STORAGE_KEYS.GUARDIAN_COMPLAINTS, SEED_GUARDIAN_COMPLAINTS);
    const newItem: GuardianComplaint = {
      ...data, id: `complaint-${Date.now()}`, status: 'open', createdAt: new Date().toISOString(),
    };
    list.unshift(newItem);
    setItem(STORAGE_KEYS.GUARDIAN_COMPLAINTS, list);
    this.addNotification({
      title: 'New Complaint Received',
      message: `${data.submittedByName} submitted a complaint: ${data.subject}`,
      type: 'system', targetRoles: ['admin'],
    });
    return newItem;
  },
  resolveGuardianComplaint(id: string, response: string, resolvedBy: string, resolvedByName: string): void {
    const list = getItem<GuardianComplaint[]>(STORAGE_KEYS.GUARDIAN_COMPLAINTS, SEED_GUARDIAN_COMPLAINTS);
    const item = list.find(c => c.id === id);
    if (item) {
      item.status = 'resolved';
      item.adminResponse = response;
      item.resolvedBy = resolvedBy;
      item.resolvedByName = resolvedByName;
      item.resolvedAt = new Date().toISOString();
      setItem(STORAGE_KEYS.GUARDIAN_COMPLAINTS, list);
    }
  },

  // Reset all data to factory demo state
  resetAllDemoData(): void {
    initializeStore(true);
  },
};

