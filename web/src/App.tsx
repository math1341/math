import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';

import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { TeacherDashboard } from './pages/teacher/TeacherDashboard';
import { QuestionBankPage } from './pages/teacher/QuestionBankPage';
import { TopicsPage } from './pages/teacher/TopicsPage';
import { TestConstructorPage } from './pages/teacher/TestConstructorPage';
import { GroupsPage } from './pages/teacher/GroupsPage';
import { TestResultsPage } from './pages/teacher/TestResultsPage';
import { StudentDashboard } from './pages/student/StudentDashboard';
import { TakeTestPage } from './pages/student/TakeTestPage';
import { TestResultViewPage } from './pages/student/TestResultViewPage';

const ProtectedLayout: React.FC<{ children: React.ReactNode; allowedRoles?: string[] }> = ({
  children,
  allowedRoles,
}) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect to respective home
    if (user.role === 'ADMIN') return <Navigate to="/admin" replace />;
    if (user.role === 'TEACHER') return <Navigate to="/teacher" replace />;
    return <Navigate to="/student" replace />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 overflow-x-hidden">{children}</main>
      </div>
    </div>
  );
};

const RootRedirect: React.FC = () => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === 'ADMIN') return <Navigate to="/admin" replace />;
  if (user.role === 'TEACHER') return <Navigate to="/teacher" replace />;
  return <Navigate to="/student" replace />;
};

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Admin Routes */}
            <Route
              path="/admin"
              element={
                <ProtectedLayout allowedRoles={['ADMIN']}>
                  <AdminDashboard />
                </ProtectedLayout>
              }
            />
            <Route
              path="/admin/users"
              element={
                <ProtectedLayout allowedRoles={['ADMIN']}>
                  <AdminDashboard />
                </ProtectedLayout>
              }
            />
            <Route
              path="/admin/audit"
              element={
                <ProtectedLayout allowedRoles={['ADMIN']}>
                  <AdminDashboard />
                </ProtectedLayout>
              }
            />

            {/* Teacher Routes */}
            <Route
              path="/teacher"
              element={
                <ProtectedLayout allowedRoles={['ADMIN', 'TEACHER']}>
                  <TeacherDashboard />
                </ProtectedLayout>
              }
            />
            <Route
              path="/teacher/questions"
              element={
                <ProtectedLayout allowedRoles={['ADMIN', 'TEACHER']}>
                  <QuestionBankPage />
                </ProtectedLayout>
              }
            />
            <Route
              path="/teacher/topics"
              element={
                <ProtectedLayout allowedRoles={['ADMIN', 'TEACHER']}>
                  <TopicsPage />
                </ProtectedLayout>
              }
            />
            <Route
              path="/teacher/tests"
              element={
                <ProtectedLayout allowedRoles={['ADMIN', 'TEACHER']}>
                  <TestConstructorPage />
                </ProtectedLayout>
              }
            />
            <Route
              path="/teacher/tests/:testId/results"
              element={
                <ProtectedLayout allowedRoles={['ADMIN', 'TEACHER']}>
                  <TestResultsPage />
                </ProtectedLayout>
              }
            />
            <Route
              path="/teacher/groups"
              element={
                <ProtectedLayout allowedRoles={['ADMIN', 'TEACHER']}>
                  <GroupsPage />
                </ProtectedLayout>
              }
            />

            {/* Student Routes */}
            <Route
              path="/student"
              element={
                <ProtectedLayout allowedRoles={['STUDENT']}>
                  <StudentDashboard />
                </ProtectedLayout>
              }
            />
            <Route
              path="/student/history"
              element={
                <ProtectedLayout allowedRoles={['STUDENT']}>
                  <StudentDashboard />
                </ProtectedLayout>
              }
            />
            <Route
              path="/student/results/:attemptId"
              element={
                <ProtectedLayout allowedRoles={['STUDENT', 'TEACHER', 'ADMIN']}>
                  <TestResultViewPage />
                </ProtectedLayout>
              }
            />

            {/* Dedicated Exam Route */}
            <Route
              path="/student/test/:testId"
              element={
                <TakeTestPage />
              }
            />

            {/* Catch-all */}
            <Route path="/" element={<RootRedirect />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
};
