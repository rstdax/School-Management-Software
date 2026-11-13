import React, { useState, useRef } from 'react';
import { useAuth } from './context/AuthContext';
import { Announcement } from '@sims/shared';

// Layout
import { TopHeader } from './components/layout/TopHeader';
import { BottomNavigation } from './components/layout/BottomNavigation';
import { NotificationDrawer } from './components/common/NotificationDrawer';
import { PageTransition } from './components/layout/PageTransition';

// Modals
import { LeaveRequestModal } from './components/modals/LeaveRequestModal';
import { CorrectionRequestModal } from './components/modals/CorrectionRequestModal';
import { ExportAttendanceModal } from './components/modals/ExportAttendanceModal';
import { AnnouncementDetailModal } from './components/modals/AnnouncementDetailModal';

// Screens
import { WelcomeScreen } from './screens/WelcomeScreen';
import { StudentSignUpScreen } from './screens/StudentSignUpScreen';
import { LoginScreen } from './screens/LoginScreen';
import { TeacherLoginScreen } from './screens/TeacherLoginScreen';
import { StudentDashboardScreen } from './screens/StudentDashboardScreen';
import { StudentAttendanceScreen } from './screens/StudentAttendanceScreen';
import { StudentRoutineScreen } from './screens/StudentRoutineScreen';
import { StudentAnnouncementsScreen } from './screens/StudentAnnouncementsScreen';
import { TeacherDashboardScreen } from './screens/TeacherDashboardScreen';
import { TeacherTakeAttendanceScreen } from './screens/TeacherTakeAttendanceScreen';
import { TeacherReportsScreen } from './screens/TeacherReportsScreen';
import { LeaveRequestsScreen } from './screens/LeaveRequestsScreen';
import { TeacherSignUpScreen } from './screens/TeacherSignUpScreen';
import { ProfileScreen } from './screens/ProfileScreen';
import { FeesScreen } from './screens/FeesScreen';
import { GradeSheetScreen } from './screens/GradeSheetScreen';

export const App: React.FC = () => {
  const { currentUser, isAuthenticated, logout } = useAuth();

  // Screen state — persisted to sessionStorage so refresh restores position
  const [currentScreen, setCurrentScreen] = useState<string>(() => {
    if (!isAuthenticated) return 'welcome';
    // Restore last screen from sessionStorage, fall back to dashboard
    const saved = sessionStorage.getItem('sims_current_screen');
    const authScreens = ['welcome', 'login', 'teacher_login', 'student_signup', 'teacher_signup'];
    if (saved && !authScreens.includes(saved)) return saved;
    return 'dashboard';
  });

  // Navigation direction for slide animation
  const screenHistoryRef = useRef<string[]>([currentScreen]);
  const [navDirection, setNavDirection] = useState<'forward' | 'back'>('forward');

  // Modals state
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
  const [leaveModalProps, setLeaveModalProps] = useState<{
    studentId?: string;
    studentName?: string;
    className?: string;
    sectionName?: string;
  }>({});

  const [isCorrectionModalOpen, setIsCorrectionModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null);

  // Take attendance lecture to mark — default to Grade 10-B (draft session, not finalized)
  const [attendanceParams, setAttendanceParams] = useState<{
    classId: string;
    sectionId: string;
    subjectId: string;
    date: string;
    period: number;
  }>({
    classId: 'class-g10',
    sectionId: 'sec-g10-b',
    subjectId: 'sub-math',
    date: '2026-11-03',
    period: 3,
  });

  // Handle navigation
  const navigateTo = (screen: string) => {
    const history = screenHistoryRef.current;
    const prevIndex = history.lastIndexOf(screen);
    if (prevIndex !== -1 && prevIndex < history.length - 1) {
      setNavDirection('back');
      screenHistoryRef.current = history.slice(0, prevIndex + 1);
    } else {
      setNavDirection('forward');
      screenHistoryRef.current = [...history, screen];
    }
    setCurrentScreen(screen);
    // Persist so refresh restores this screen
    const authScreens = ['welcome', 'login', 'teacher_login', 'student_signup', 'teacher_signup'];
    if (!authScreens.includes(screen)) {
      sessionStorage.setItem('sims_current_screen', screen);
    } else {
      sessionStorage.removeItem('sims_current_screen');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenLeaveModal = (
    studentId?: string,
    studentName?: string,
    className?: string,
    sectionName?: string
  ) => {
    setLeaveModalProps({ studentId, studentName, className, sectionName });
    setIsLeaveModalOpen(true);
  };

  const handleOpenCorrectionModal = (_studentId?: string) => {
    setIsCorrectionModalOpen(true);
  };

  const handleTeacherSelectLecture = (
    classId: string,
    sectionId: string,
    subjectId: string,
    date: string,
    period: number
  ) => {
    setAttendanceParams({ classId, sectionId, subjectId, date, period });
    navigateTo('teacher_attendance');
  };

  // Determine which screen component to render
  const renderScreen = () => {
    if (!isAuthenticated) {
      switch (currentScreen) {
        case 'student_signup':
          return (
            <StudentSignUpScreen
              onBack={() => navigateTo('welcome')}
              onSuccess={() => navigateTo('dashboard')}
              onNavigateLogin={() => navigateTo('login')}
            />
          );
        case 'teacher_signup':
          return (
            <TeacherSignUpScreen
              onBack={() => navigateTo('teacher_login')}
              onSuccess={() => navigateTo('teacher_login')}
              onNavigateLogin={() => navigateTo('teacher_login')}
            />
          );
        case 'teacher_login':
          return (
            <TeacherLoginScreen
              onSuccess={() => navigateTo('dashboard')}
              onNavigateStudentLogin={() => navigateTo('login')}
              onNavigateSignUp={() => navigateTo('teacher_signup')}
              onBack={() => navigateTo('welcome')}
            />
          );
        case 'login':
          return (
            <LoginScreen
              onSuccess={() => navigateTo('dashboard')}
              onNavigateSignUp={() => navigateTo('student_signup')}
              onNavigateTeacherLogin={() => navigateTo('teacher_login')}
              onBack={() => navigateTo('welcome')}
            />
          );
        case 'welcome':
        default:
          return (
            <WelcomeScreen
              onStudentSignIn={() => navigateTo('login')}
              onTeacherSignIn={() => navigateTo('teacher_login')}
              onStudentRegister={() => navigateTo('student_signup')}
            />
          );
      }
    }

    // Authenticated screens (Role-Based Authorization)
    const role = currentUser?.role;

    switch (currentScreen) {
      case 'dashboard':
        if (role === 'teacher') {
          return (
            <TeacherDashboardScreen
              onNavigateScreen={navigateTo}
              onSelectLectureToMark={handleTeacherSelectLecture}
            />
          );
        }
        return (
          <StudentDashboardScreen
            onNavigateScreen={navigateTo}
            onOpenLeaveModal={() => handleOpenLeaveModal()}
            onOpenCorrectionModal={() => handleOpenCorrectionModal()}
            onSelectAnnouncement={setSelectedAnnouncement}
          />
        );

      case 'attendance':
        return (
          <StudentAttendanceScreen
            onOpenExportModal={() => setIsExportModalOpen(true)}
            onOpenCorrectionModal={() => handleOpenCorrectionModal()}
          />
        );

      case 'routine':
        return <StudentRoutineScreen />;

      case 'announcements':
        return (
          <StudentAnnouncementsScreen
            onSelectAnnouncement={setSelectedAnnouncement}
          />
        );

      case 'teacher_attendance':
        return (
          <TeacherTakeAttendanceScreen
            initialClassId={attendanceParams.classId}
            initialSectionId={attendanceParams.sectionId}
            initialSubjectId={attendanceParams.subjectId}
            initialDate={attendanceParams.date}
            initialPeriod={attendanceParams.period}
            onSuccess={() => navigateTo('dashboard')}
          />
        );

      case 'teacher_reports':
        return <TeacherReportsScreen />;

      case 'leave_requests':
        return (
          <LeaveRequestsScreen
            onOpenApplyModal={() => handleOpenLeaveModal()}
          />
        );

      case 'profile':
        return (
          <ProfileScreen
            onLogout={async () => {
              sessionStorage.removeItem('sims_current_screen');
              await logout();
              navigateTo('welcome');
            }}
            onNavigateScreen={navigateTo}
          />
        );

      case 'fees':
        return <FeesScreen onBack={() => navigateTo('dashboard')} />;

      case 'grades':
        return <GradeSheetScreen />;

      default:
        if (role === 'teacher') {
          return (
            <TeacherDashboardScreen
              onNavigateScreen={navigateTo}
              onSelectLectureToMark={handleTeacherSelectLecture}
            />
          );
        }
        return (
          <StudentDashboardScreen
            onNavigateScreen={navigateTo}
            onOpenLeaveModal={() => handleOpenLeaveModal()}
            onOpenCorrectionModal={() => handleOpenCorrectionModal()}
            onSelectAnnouncement={setSelectedAnnouncement}
          />
        );
    }
  };

  const isAuthScreen = !isAuthenticated || ['welcome', 'student_signup', 'teacher_signup', 'login', 'teacher_login'].includes(currentScreen);

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-start text-slate-800">
      {/* Centered Mobile-First Application Container */}
      <div className="w-full max-w-md bg-slate-50 min-h-screen flex flex-col relative shadow-md border-x border-slate-200/80">
        {/* Top Header when authenticated */}
        {!isAuthScreen && (
          <TopHeader
            currentScreen={currentScreen}
            onNavigateScreen={navigateTo}
            showBack={currentScreen !== 'dashboard'}
            onBack={() => navigateTo('dashboard')}
          />
        )}

        {/* Screen Content */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden">
          <PageTransition screenKey={currentScreen} direction={navDirection}>
            {renderScreen()}
          </PageTransition>
        </main>

        {/* Bottom Navigation */}
        {!isAuthScreen && (
          <BottomNavigation
            currentScreen={currentScreen}
            onNavigateScreen={navigateTo}
          />
        )}
      </div>

      {/* Slide-over Notifications Drawer */}
      <NotificationDrawer />

      {/* Modals */}
      <LeaveRequestModal
        isOpen={isLeaveModalOpen}
        onClose={() => setIsLeaveModalOpen(false)}
        targetStudentId={leaveModalProps.studentId}
        targetStudentName={leaveModalProps.studentName}
        targetClassName={leaveModalProps.className}
        targetSectionName={leaveModalProps.sectionName}
      />

      <CorrectionRequestModal
        isOpen={isCorrectionModalOpen}
        onClose={() => setIsCorrectionModalOpen(false)}
      />

      <ExportAttendanceModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        targetStudentId={currentUser?.uid}
      />

      <AnnouncementDetailModal
        announcement={selectedAnnouncement}
        onClose={() => setSelectedAnnouncement(null)}
      />
    </div>
  );
};
