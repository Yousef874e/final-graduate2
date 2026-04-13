import { BrowserRouter, Routes, Route } from "react-router-dom"
import { Toaster } from "react-hot-toast"
import { AppProvider } from "./Context/AppContext.jsx"

import LandingPage from "./pages/public/LandingPage"
import LoginPage from "./pages/public/LoginPage"
import RegisterPage from "./pages/public/RegisterPage"
import ForgotPassword from "./pages/public/ForgotPassword"
import ResetPassword from "./pages/public/ResetPassword"
import ChildImage from "./pages/public/ChildImage"
import ChildInfoStep1 from "./pages/public/ChildInfoStep1"

import ProtectedRoute from "./routes/ProtectedRoute"

import DashboardLayout from "./layouts/DashboardLayout"
import SpecialistLayout from "./layouts/SpecialistLayout.jsx"
import AdminLayout from "./layouts/AdminLayout.jsx"

import ParentDashboard from "./pages/dashboard/ParentDashboard"
import Reports from "./pages/reports/Reports"
import Appointments from "./pages/sessions/Appointments.jsx"
import Profile from "./pages/profile/Profile"
import Library from "./pages/library/Library"
import Exercise from "./pages/exercise/Exercise.jsx"
import Chat from "./pages/chat/Chat"
import Settings from "./pages/settings/Settings"

import AdminDashboard from "./pages/admin/AdminDashboard.jsx"
import AdminUsers from "./pages/admin/AdminUsers.jsx"
import AdminAppointments from "./pages/admin/AdminAppointments.jsx"
import AdminReports from "./pages/admin/AdminReports.jsx"
import AdminLibrary from "./pages/admin/AdminLibrary.jsx"
import AdminSettings from "./pages/admin/AdminSettings.jsx"

import SpecialistDashboard from "./pages/specialist/SpecialistDashboard.jsx"
import SpecialistPatients from "./pages/specialist/SpecialistPatients.jsx"
import SpecialistAppointments from "./pages/specialist/SpecialistAppointments.jsx"
import SpecialistReports from "./pages/specialist/SpecialistReports.jsx"
import SpecialistChat from "./pages/specialist/SpecialistChat.jsx"
import SpecialistExercise from "./pages/specialist/SpecialistExercise.jsx"
import SpecialistSettings from "./pages/specialist/SpecialistSettings.jsx"
import SpecialistProfile from "./pages/specialist/SpecialistProfile.jsx"

function App() {
  return (
    <AppProvider>
      <BrowserRouter>

        <Toaster position="top-center" toastOptions={{ duration: 650 }} />

        <Routes>

          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />

          <Route path="/register" element={<RegisterPage />} />
          <Route path="/register/parent" element={<RegisterPage />} />
          <Route path="/register/specialist" element={<RegisterPage />} />

          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          <Route path="/child-imge" element={<ChildImage />} />
          <Route path="/child-info-step1" element={<ChildInfoStep1 />} />

          {/* Parent */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route path="parent" element={<ParentDashboard />} />
            <Route path="appointments" element={<Appointments />} />
            <Route path="reports" element={<Reports />} />
            <Route path="profile" element={<Profile />} />
            <Route path="library" element={<Library />} />
            <Route path="exercises" element={<Exercise />} />
            <Route path="chat" element={<Chat />} />
            <Route path="settings" element={<Settings />} />
          </Route>

          {/* Admin */}
          <Route
            path="/dashboard/admin"
            element={
              <ProtectedRoute>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<AdminDashboard />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="appointments" element={<AdminAppointments />} />
            <Route path="reports" element={<AdminReports />} />
            <Route path="library" element={<AdminLibrary />} />
            <Route path="settings" element={<AdminSettings />} />
          </Route>

          {/* Specialist 🔥 */}
          <Route
  path="/dashboard/specialist"
  element={
    <ProtectedRoute>
      <SpecialistLayout />
    </ProtectedRoute>
  }
>
  <Route index element={<SpecialistDashboard />} />
  <Route path="patients" element={<SpecialistPatients />} />
  <Route path="appointments" element={<SpecialistAppointments />} />
  <Route path="reports" element={<SpecialistReports />} />
  <Route path="chat" element={<SpecialistChat />} />
  <Route path="exercises" element={<SpecialistExercise />} />
  <Route path="settings" element={<SpecialistSettings />} />
  <Route path="profile" element={<SpecialistProfile />} />
</Route>
        </Routes>

      </BrowserRouter>
    </AppProvider>
  )
}

export default App