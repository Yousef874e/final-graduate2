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
import ParentDashboard from "./pages/dashboard/ParentDashboard"
import Specialists from "./pages/specialists/Specialists"
import Reports from "./pages/reports/Reports"
import Sessions from "./pages/sessions/Sessions"
import Profile from "./pages/profile/Profile"
import Library from "./pages/library/Library"
import Settings from "./pages/settings/Settings"

import AdminDashboard from "./pages/admin/AdminDashboard.jsx"
import AdminLayout from "./layouts/AdminLayout.jsx"
import AdminUsers from "./pages/admin/AdminUsers.jsx"
import AdminAppointments from "./pages/admin/AdminAppointments.jsx"
import AdminReports from "./pages/admin/AdminReports.jsx"
import AdminLibrary from "./pages/admin/AdminLibrary.jsx"
import AdminSettings from "./pages/admin/AdminSettings.jsx"

function App() {
  return (
    <AppProvider>
      <BrowserRouter>

        <Toaster
          position="top-center"
          toastOptions={{ duration: 650 }}
        />

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

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route path="parent" element={<ParentDashboard />} />
            <Route path="specialists" element={<Specialists />} />
            <Route path="sessions" element={<Sessions />} />
            <Route path="reports" element={<Reports />} />
            <Route path="profile" element={<Profile />} />
            <Route path="library" element={<Library />} />
          
            <Route path="settings" element={<Settings />} />
          </Route>

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
        </Routes>

      </BrowserRouter>
    </AppProvider>
  )
}

export default App