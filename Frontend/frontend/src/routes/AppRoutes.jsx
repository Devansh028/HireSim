import { Routes, Route, Navigate } from 'react-router-dom'
import ProtectedRoute from '../auth/ProtectedRoute'

import Login from '../pages/Login'
import Register from '../pages/Register'

// Admin
import AdminLayout from '../layouts/AdminLayout'
import AdminDashboard from '../pages/admin/AdminDashboard'
import Programs from '../pages/admin/Programs'
import Tasks from '../pages/admin/Tasks'
import AuditLogs from '../pages/admin/AuditLogs'

// Reviewer
import ReviewerLayout from '../layouts/ReviewerLayout'
import ReviewerDashboard from '../pages/reviewer/ReviewerDashboard'
import ReviewTasks from '../pages/reviewer/ReviewTasks'
import Analytics from '../pages/reviewer/Analytics'

// Candidate
import CandidateLayout from '../layouts/CandidateLayout'
import CandidateDashboard from '../pages/candidate/CandidateDashboard'
import MyTasks from '../pages/candidate/MyTasks'
import SubmitTask from '../pages/candidate/SubmitTask'
import Notifications from '../pages/candidate/Notifications'

const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<Navigate to="/login" replace />} />
    <Route path="/login" element={<Login />} />
    <Route path="/register" element={<Register />} />

    {/* Admin */}
    <Route path="/admin" element={
      <ProtectedRoute roles={['ADMIN']}><AdminLayout><AdminDashboard /></AdminLayout></ProtectedRoute>
    } />
    <Route path="/admin/programs" element={
      <ProtectedRoute roles={['ADMIN']}><AdminLayout><Programs /></AdminLayout></ProtectedRoute>
    } />
    <Route path="/admin/tasks" element={
      <ProtectedRoute roles={['ADMIN']}><AdminLayout><Tasks /></AdminLayout></ProtectedRoute>
    } />
    <Route path="/admin/audit" element={
      <ProtectedRoute roles={['ADMIN']}><AdminLayout><AuditLogs /></AdminLayout></ProtectedRoute>
    } />

    {/* Reviewer */}
    <Route path="/reviewer" element={
      <ProtectedRoute roles={['REVIEWER']}><ReviewerLayout><ReviewerDashboard /></ReviewerLayout></ProtectedRoute>
    } />
    <Route path="/reviewer/reviews" element={
      <ProtectedRoute roles={['REVIEWER']}><ReviewerLayout><ReviewTasks /></ReviewerLayout></ProtectedRoute>
    } />
    <Route path="/reviewer/analytics" element={
      <ProtectedRoute roles={['REVIEWER']}><ReviewerLayout><Analytics /></ReviewerLayout></ProtectedRoute>
    } />

    {/* Candidate */}
    <Route path="/candidate" element={
      <ProtectedRoute roles={['CANDIDATE']}><CandidateLayout><CandidateDashboard /></CandidateLayout></ProtectedRoute>
    } />
    <Route path="/candidate/tasks" element={
      <ProtectedRoute roles={['CANDIDATE']}><CandidateLayout><MyTasks /></CandidateLayout></ProtectedRoute>
    } />
    <Route path="/candidate/submit" element={
      <ProtectedRoute roles={['CANDIDATE']}><CandidateLayout><SubmitTask /></CandidateLayout></ProtectedRoute>
    } />
    <Route path="/candidate/notifications" element={
      <ProtectedRoute roles={['CANDIDATE']}><CandidateLayout><Notifications /></CandidateLayout></ProtectedRoute>
    } />

    <Route path="*" element={<Navigate to="/login" replace />} />
  </Routes>
)

export default AppRoutes
