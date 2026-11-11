import React, { useState } from 'react';
import { useAdminAuth } from './context/AdminAuthContext';
import { AdminLayout } from './components/layout/AdminLayout';

// Pages
import { AdminLoginPage } from './pages/AdminLoginPage';
import { OverviewPage } from './pages/OverviewPage';
import { TeacherApprovalsPage } from './pages/TeacherApprovalsPage';
import { StudentPlacementPage } from './pages/StudentPlacementPage';
import { AcademicManagementPage } from './pages/AcademicManagementPage';
import { TimetablePage } from './pages/TimetablePage';
import { AttendanceOversightPage } from './pages/AttendanceOversightPage';
import { RequestsReviewPage } from './pages/RequestsReviewPage';
import { AnnouncementsPage } from './pages/AnnouncementsPage';
import { ReportsAuditPage } from './pages/ReportsAuditPage';

export const App: React.FC = () => {
  const { isAuthenticated } = useAdminAuth();
  const [currentTab, setCurrentTab] = useState<string>('overview');

  if (!isAuthenticated) {
    return <AdminLoginPage />;
  }

  const renderContent = () => {
    switch (currentTab) {
      case 'overview':
        return <OverviewPage onNavigateTab={setCurrentTab} />;
      case 'teacher_approvals':
        return <TeacherApprovalsPage />;
      case 'student_placement':
        return <StudentPlacementPage />;
      case 'academics':
        return <AcademicManagementPage />;
      case 'timetable':
        return <TimetablePage />;
      case 'attendance':
        return <AttendanceOversightPage />;
      case 'requests':
        return <RequestsReviewPage />;
      case 'announcements':
        return <AnnouncementsPage />;
      case 'reports':
        return <ReportsAuditPage />;
      default:
        return <OverviewPage onNavigateTab={setCurrentTab} />;
    }
  };

  return (
    <AdminLayout currentTab={currentTab} onNavigateTab={setCurrentTab}>
      {renderContent()}
    </AdminLayout>
  );
};

