export type UserRole = 'student' | 'teacher' | 'parent' | 'admin';

export type AdminRole = 'super_admin' | 'academic_admin' | 'attendance_officer';

export type AccountStatus = 'active' | 'pending' | 'rejected' | 'pending_placement';

export interface StudentData {
  admissionNumber: string;
  classId?: string;
  className?: string;
  sectionId?: string;
  sectionName?: string;
  rollNumber?: string;
  dob: string;
  guardianName?: string;
  guardianPhone?: string;
}

export interface TeacherData {
  employeeId: string;
  department: string;
  designation: string;
  assignedClassIds: string[];
  assignedSubjectIds: string[];
}

export interface ParentData {
  linkedStudentIds: string[];
  relation: 'Father' | 'Mother' | 'Guardian';
}

export interface AdminData {
  adminRole: AdminRole;
  permissions: string[];
}

export interface UserProfile {
  uid: string;
  email: string;
  name: string;
  role: UserRole;
  status: AccountStatus;
  schoolId: string;
  phone?: string;
  avatarUrl?: string;
  studentData?: StudentData;
  teacherData?: TeacherData;
  parentData?: ParentData;
  adminData?: AdminData;
  createdAt: string;
  updatedAt: string;
}

export interface School {
  id: string;
  name: string;
  code: string;
  address: string;
  phone: string;
  email: string;
  logoUrl?: string;
  academicYear: string;
}

export interface ClassItem {
  id: string;
  name: string;
  gradeLevel: number;
  schoolId: string;
}

export interface SectionItem {
  id: string;
  classId: string;
  name: string;
  room: string;
  classTeacherId?: string;
  capacity: number;
}

export interface SubjectItem {
  id: string;
  code: string;
  name: string;
  department: string;
  weeklyHours: number;
}

export interface TimetableSlot {
  id: string;
  schoolId: string;
  classId: string;
  sectionId: string;
  subjectId: string;
  teacherId: string;
  dayOfWeek: 1 | 2 | 3 | 4 | 5 | 6; // 1 = Monday ... 6 = Saturday
  periodNumber: number;
  startTime: string; // e.g. "09:00 AM"
  endTime: string;   // e.g. "09:50 AM"
  roomNumber: string;
}

export type AttendanceStatus = 'P' | 'A' | 'L'; // Present, Absent, Leave
export type AttendanceSessionStatus = 'draft' | 'finalized';

export interface AttendanceSession {
  id: string;
  schoolId: string;
  classId: string;
  className: string;
  sectionId: string;
  sectionName: string;
  subjectId: string;
  subjectName: string;
  date: string; // YYYY-MM-DD
  periodNumber?: number;
  teacherId: string;
  teacherName: string;
  status: AttendanceSessionStatus;
  records: Record<string, AttendanceStatus>; // studentId -> status
  totalStudents: number;
  presentCount: number;
  absentCount: number;
  leaveCount: number;
  finalizedAt?: string;
  finalizedBy?: string;
  finalizedByName?: string;
  lastDraftSavedAt?: string;
  createdAt: string;
}

export interface AttendanceAuditLog {
  id: string;
  schoolId: string;
  sessionId: string;
  studentId: string;
  studentName: string;
  oldStatus: AttendanceStatus;
  newStatus: AttendanceStatus;
  reason: string;
  authorizedBy: string;
  authorizedByName: string;
  timestamp: string;
}

export interface LeaveRequest {
  id: string;
  schoolId: string;
  studentId: string;
  studentName: string;
  className: string;
  sectionName: string;
  leaveType: 'Medical' | 'Casual' | 'Family Emergency' | 'Academic';
  startDate: string;
  endDate: string;
  reason: string;
  contactPhone?: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedBy: string;
  submittedRole: 'student' | 'parent';
  reviewedBy?: string;
  reviewedByName?: string;
  reviewRemarks?: string;
  reviewedAt?: string;
  createdAt: string;
}

export interface CorrectionRequest {
  id: string;
  schoolId: string;
  studentId: string;
  studentName: string;
  sessionId: string;
  sessionDate: string;
  subjectName: string;
  recordedStatus: AttendanceStatus;
  requestedStatus: AttendanceStatus;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedBy: string;
  reviewedBy?: string;
  reviewedByName?: string;
  reviewRemarks?: string;
  reviewedAt?: string;
  createdAt: string;
}

export interface Announcement {
  id: string;
  schoolId: string;
  title: string;
  content: string;
  category: 'academic' | 'events' | 'exam' | 'administrative' | 'urgent';
  targetAudience: 'all' | 'students' | 'teachers' | 'parents' | string;
  targetName?: string;
  isPinned?: boolean;
  authorId: string;
  authorName: string;
  publishedAt: string;
  expiresAt?: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'attendance' | 'announcement' | 'leave' | 'correction' | 'system';
  timestamp: string;
  read: boolean;
  targetRoles?: UserRole[];
  targetUserId?: string;
}

// ── Fees ─────────────────────────────────────────────────────────────────────
export interface FeeRecord {
  id: string;
  schoolId: string;
  studentId: string;
  studentName: string;
  month: string;        // e.g. "2026-11"
  monthLabel: string;   // e.g. "November 2026"
  amount: number;
  status: 'paid' | 'pending' | 'overdue';
  dueDate: string;
  paidDate?: string;
  paidAmount?: number;
  remarks?: string;
  createdAt: string;
}

// ── Grade / Exam Result ───────────────────────────────────────────────────────
export interface ExamResult {
  id: string;
  schoolId: string;
  studentId: string;
  studentName: string;
  classId: string;
  className: string;
  sectionId: string;
  examName: string;       // e.g. "Mid-Term 2026", "Final 2026"
  examType: 'midterm' | 'final' | 'unit_test' | 'quarterly';
  academicYear: string;
  subjects: ExamSubjectResult[];
  totalMarks: number;
  obtainedMarks: number;
  percentage: number;
  grade: string;          // A+, A, B+, B, C, D, F
  rank?: number;
  remarks?: string;
  publishedAt: string;
  createdAt: string;
}

export interface ExamSubjectResult {
  subjectId: string;
  subjectName: string;
  totalMarks: number;
  obtainedMarks: number;
  grade: string;
  isPassed: boolean;
}

// ── Student Performance ───────────────────────────────────────────────────────
export interface PerformanceReport {
  id: string;
  schoolId: string;
  studentId: string;
  studentName: string;
  classId: string;
  sectionId: string;
  teacherId: string;
  teacherName: string;
  month: string;        // "2026-11"
  monthLabel: string;
  academicRating: 1 | 2 | 3 | 4 | 5;
  behaviorRating: 1 | 2 | 3 | 4 | 5;
  participationRating: 1 | 2 | 3 | 4 | 5;
  homeworkRating: 1 | 2 | 3 | 4 | 5;
  strengths: string;
  improvements: string;
  teacherRemarks: string;
  createdAt: string;
}

// ── Guardian Complaint ────────────────────────────────────────────────────────
export interface GuardianComplaint {
  id: string;
  schoolId: string;
  submittedBy: string;     // userId (student or parent)
  submittedByName: string;
  submittedRole: 'student' | 'parent';
  studentId: string;
  studentName: string;
  category: 'academic' | 'discipline' | 'facility' | 'staff' | 'fee' | 'other';
  subject: string;
  description: string;
  status: 'open' | 'in_review' | 'resolved' | 'closed';
  adminResponse?: string;
  resolvedBy?: string;
  resolvedByName?: string;
  resolvedAt?: string;
  createdAt: string;
}

