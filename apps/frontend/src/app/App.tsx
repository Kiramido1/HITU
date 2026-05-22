import React, { lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { BrowserRouter } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ErrorBoundary } from '@/components/ui/ErrorBoundary'
import { NotificationToast } from '@/components/ui/Notification'
import { useAppStore } from '@/store'

// ── Lazy-loaded pages (code splitting) ───────────────────────
const LandingPage        = lazy(() => import('@/pages/LandingPage').then(m => ({ default: m.LandingPage })))
const LoginPage          = lazy(() => import('@/pages/LoginPage').then(m => ({ default: m.LoginPage })))
const RegisterPage       = lazy(() => import('@/pages/RegisterPage').then(m => ({ default: m.RegisterPage })))
const ForgotPasswordPage = lazy(() => import('@/pages/ForgotPasswordPage').then(m => ({ default: m.ForgotPasswordPage })))
const ResetPasswordPage  = lazy(() => import('@/pages/ResetPasswordPage').then(m => ({ default: m.ResetPasswordPage })))
const NotFoundPage       = lazy(() => import('@/pages/NotFoundPage').then(m => ({ default: m.NotFoundPage })))
const AdminDashboard     = lazy(() => import('@/pages/admin/AdminDashboard').then(m => ({ default: m.AdminDashboard })))
const SemesterManager    = lazy(() => import('@/pages/admin/SemesterManager').then(m => ({ default: m.SemesterManager })))
const DepartmentManager  = lazy(() => import('@/pages/admin/DepartmentManager').then(m => ({ default: m.DepartmentManager })))
const CourseManager      = lazy(() => import('@/pages/admin/CourseManager').then(m => ({ default: m.CourseManager })))
const HallManager        = lazy(() => import('@/pages/admin/HallManager').then(m => ({ default: m.HallManager })))
const DoctorManager      = lazy(() => import('@/pages/admin/DoctorManager').then(m => ({ default: m.DoctorManager })))
const AssistantManager   = lazy(() => import('@/pages/admin/AssistantManager').then(m => ({ default: m.AssistantManager })))
const SchedulerPage      = lazy(() => import('@/pages/admin/SchedulerPage').then(m => ({ default: m.SchedulerPage })))
const DoctorDashboard    = lazy(() => import('@/pages/doctor/DoctorDashboard').then(m => ({ default: m.DoctorDashboard })))
const MaterialsUploadPage= lazy(() => import('@/pages/doctor/MaterialsUploadPage').then(m => ({ default: m.MaterialsUploadPage })))
const AssignmentsPage    = lazy(() => import('@/pages/doctor/AssignmentsPage').then(m => ({ default: m.AssignmentsPage })))
const AssistantDashboard = lazy(() => import('@/pages/assistant/AssistantDashboard').then(m => ({ default: m.AssistantDashboard })))
const StudentDashboard   = lazy(() => import('@/pages/student/StudentDashboard').then(m => ({ default: m.StudentDashboard })))
const StudentMaterials   = lazy(() => import('@/pages/student/StudentMaterialsPage').then(m => ({ default: m.StudentMaterialsPage })))
const TimetableViewer    = lazy(() => import('@/pages/scheduler/TimetableViewer').then(m => ({ default: m.TimetableViewer })))
const TimetableEditor    = lazy(() => import('@/pages/scheduler/TimetableEditor').then(m => ({ default: m.TimetableEditor })))
const AvailabilityCalendar= lazy(() => import('@/pages/scheduler/AvailabilityCalendar').then(m => ({ default: m.AvailabilityCalendar })))
const ReportDashboard    = lazy(() => import('@/pages/admin/ReportDashboard').then(m => ({ default: m.ReportDashboard })))
const StudentManager     = lazy(() => import('@/pages/admin/StudentManager').then(m => ({ default: m.StudentManager })))
const NotificationsPage  = lazy(() => import('@/pages/Notifications').then(m => ({ default: m.NotificationsPage })))
const ProfilePage        = lazy(() => import('@/pages/Profile').then(m => ({ default: m.ProfilePage })))
const SettingsPage       = lazy(() => import('@/pages/Settings').then(m => ({ default: m.SettingsPage })))
const AuditLogsPage      = lazy(() => import('@/pages/AuditLogs').then(m => ({ default: m.AuditLogsPage })))
const StudentAssignments = lazy(() => import('@/pages/student/StudentAssignmentsPage').then(m => ({ default: m.StudentAssignmentsPage })))

// ── Loading skeleton ──────────────────────────────────────────
const PageLoader = () => (
  <div className="min-h-screen bg-[#020817] flex items-center justify-center">
    <div className="flex flex-col items-center gap-4">
      <div className="relative w-12 h-12">
        <div className="absolute inset-0 rounded-full border-2 border-t-[#C8A95B] border-[rgba(200,169,91,0.1)] animate-spin" />
        <div className="absolute inset-3 rounded-full border border-[rgba(200,169,91,0.3)] animate-pulse" />
      </div>
      <p className="text-xs text-[#94A3B8]/60 uppercase tracking-widest">Loading</p>
    </div>
  </div>
)

type Role = 'admin' | 'doctor' | 'assistant' | 'student'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 5 * 60 * 1000, retry: 1, refetchOnWindowFocus: false },
  },
})

const ROLE_HOME: Record<string, string> = {
  admin: '/admin',
  doctor: '/doctor',
  assistant: '/assistant',
  student: '/student',
}

const ProtectedRoute: React.FC<{ children: React.ReactNode; roles?: Role[] }> = ({ children, roles }) => {
  const { isAuthenticated, user } = useAppStore()
  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (roles && user?.role && !roles.includes(user.role as Role)) return <Navigate to={ROLE_HOME[user.role as string] || '/'} replace />
  return <>{children}</>
}

// Redirect authenticated users away from public auth pages
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, user } = useAppStore()
  if (isAuthenticated && user) return <Navigate to={ROLE_HOME[user.role] || '/'} replace />
  return <>{children}</>
}

const Page: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -8 }}
    transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
  >
    {children}
  </motion.div>
)

export const App: React.FC = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <NotificationToast />
        <Suspense fallback={<PageLoader />}>
          <AnimatePresence mode="wait">
            <Routes>
              {/* Public */}
              <Route path="/"        element={<Page><LandingPage /></Page>} />
              <Route path="/login"   element={<PublicRoute><Page><LoginPage /></Page></PublicRoute>} />
              <Route path="/register" element={<PublicRoute><Page><RegisterPage /></Page></PublicRoute>} />
              <Route path="/forgot-password" element={<PublicRoute><Page><ForgotPasswordPage /></Page></PublicRoute>} />
              <Route path="/reset-password" element={<PublicRoute><Page><ResetPasswordPage /></Page></PublicRoute>} />

              {/* Admin */}
              <Route path="/admin"             element={<ProtectedRoute roles={['admin']}><Page><AdminDashboard /></Page></ProtectedRoute>} />
              <Route path="/admin/semesters"   element={<ProtectedRoute roles={['admin']}><Page><SemesterManager /></Page></ProtectedRoute>} />
              <Route path="/admin/departments" element={<ProtectedRoute roles={['admin']}><Page><DepartmentManager /></Page></ProtectedRoute>} />
              <Route path="/admin/courses"     element={<ProtectedRoute roles={['admin']}><Page><CourseManager /></Page></ProtectedRoute>} />
              <Route path="/admin/halls"       element={<ProtectedRoute roles={['admin']}><Page><HallManager /></Page></ProtectedRoute>} />
              <Route path="/admin/doctors"     element={<ProtectedRoute roles={['admin']}><Page><DoctorManager /></Page></ProtectedRoute>} />
              <Route path="/admin/assistants"  element={<ProtectedRoute roles={['admin']}><Page><AssistantManager /></Page></ProtectedRoute>} />
              <Route path="/admin/scheduler"   element={<ProtectedRoute roles={['admin']}><Page><SchedulerPage /></Page></ProtectedRoute>} />
              <Route path="/admin/scheduler/editor" element={<ProtectedRoute roles={['admin']}><Page><TimetableEditor /></Page></ProtectedRoute>} />
              <Route path="/admin/reports"     element={<ProtectedRoute roles={['admin']}><Page><ReportDashboard /></Page></ProtectedRoute>} />
              <Route path="/admin/students"   element={<ProtectedRoute roles={['admin']}><Page><StudentManager /></Page></ProtectedRoute>} />

              <Route path="/notifications" element={<ProtectedRoute><Page><NotificationsPage /></Page></ProtectedRoute>} />
              <Route path="/profile"       element={<ProtectedRoute><Page><ProfilePage /></Page></ProtectedRoute>} />
              <Route path="/settings"      element={<ProtectedRoute><Page><SettingsPage /></Page></ProtectedRoute>} />
              <Route path="/audit-logs"    element={<ProtectedRoute roles={['admin']}><Page><AuditLogsPage /></Page></ProtectedRoute>} />

              {/* Doctor */}
              <Route path="/doctor"             element={<ProtectedRoute roles={['doctor','admin']}><Page><DoctorDashboard /></Page></ProtectedRoute>} />
              <Route path="/doctor/materials"   element={<ProtectedRoute roles={['doctor','admin']}><Page><MaterialsUploadPage /></Page></ProtectedRoute>} />
              <Route path="/doctor/assignments" element={<ProtectedRoute roles={['doctor','admin']}><Page><AssignmentsPage /></Page></ProtectedRoute>} />
              <Route path="/doctor/availability" element={<ProtectedRoute roles={['doctor','admin']}><Page><AvailabilityCalendar /></Page></ProtectedRoute>} />

              {/* Assistant */}
              <Route path="/assistant"           element={<ProtectedRoute roles={['assistant','admin']}><Page><AssistantDashboard /></Page></ProtectedRoute>} />
              <Route path="/assistant/materials" element={<ProtectedRoute roles={['assistant','admin']}><Page><MaterialsUploadPage /></Page></ProtectedRoute>} />
              <Route path="/assistant/availability" element={<ProtectedRoute roles={['assistant','admin']}><Page><AvailabilityCalendar /></Page></ProtectedRoute>} />

              {/* Student */}
              <Route path="/student"           element={<ProtectedRoute roles={['student','admin']}><Page><StudentDashboard /></Page></ProtectedRoute>} />
              <Route path="/student/materials" element={<ProtectedRoute roles={['student','admin']}><Page><StudentMaterials /></Page></ProtectedRoute>} />
              <Route path="/student/assignments" element={<ProtectedRoute roles={['student','admin']}><Page><StudentAssignments /></Page></ProtectedRoute>} />

              {/* Common protected routes */}
              <Route path="/timetable" element={<ProtectedRoute><Page><TimetableViewer /></Page></ProtectedRoute>} />

              <Route path="/dashboard" element={<Navigate to="/" replace />} />
              <Route path="*" element={<Page><NotFoundPage /></Page>} />
            </Routes>
          </AnimatePresence>
        </Suspense>
      </BrowserRouter>
    </QueryClientProvider>
  </ErrorBoundary>
)
