import "../assets/adminLayout.css"
import logo from "../assets/images/logo.png"
import {
  FaHome, FaUsers, FaCalendar, FaFileAlt,
  FaCog, FaBell, FaBook, FaSignOutAlt
} from "react-icons/fa"
import { Outlet, useNavigate, useLocation } from "react-router-dom"
import { useState } from "react"

function AdminLayout() {

  const navigate = useNavigate()
  const location = useLocation()

  const isActive = (path) => location.pathname.startsWith(path)

  const [showNotif, setShowNotif] = useState(false)

  const handleLogout = () => {
    localStorage.clear()
    navigate("/login", { replace: true })
  }

  return (
    <div className="layout">

      <div className="sidebar">

        <div className="logo-container">
          <div className="logo-circle">
            <img src={logo} alt="logo" />
          </div>
          <span className="logo-text">رفيق</span>
        </div>

        <br />

        <div className="menu">

          <div
            className={isActive("/dashboard/admin") && location.pathname === "/dashboard/admin" ? "active" : ""}
            onClick={() => navigate("/dashboard/admin")}
          >
            <FaHome /> الرئيسية
          </div>

          <div
            className={isActive("/dashboard/admin/users") ? "active" : ""}
            onClick={() => navigate("/dashboard/admin/users")}
          >
            <FaUsers /> ملفات المستخدمين
          </div>

          <div
            className={isActive("/dashboard/admin/appointments") ? "active" : ""}
            onClick={() => navigate("/dashboard/admin/appointments")}
          >
            <FaCalendar /> جدول المواعيد
          </div>

          <div
            className={isActive("/dashboard/admin/reports") ? "active" : ""}
            onClick={() => navigate("/dashboard/admin/reports")}
          >
            <FaFileAlt /> التقارير الطبية
          </div>

          <div
            className={isActive("/dashboard/admin/library") ? "active" : ""}
            onClick={() => navigate("/dashboard/admin/library")}
          >
            <FaBook /> المكتبة
          </div>

          <div
            className={isActive("/dashboard/admin/settings") ? "active" : ""}
            onClick={() => navigate("/dashboard/admin/settings")}
          >
            <FaCog /> الإعدادات
          </div>

        </div>

        <div className="logout" onClick={handleLogout}>
          <FaSignOutAlt /> تسجيل الخروج
        </div>

      </div>

      <div className="main">

        <div className="header">

          <h3>لوحة تحكم الأدمن</h3>

          <div className="header-row">

            <FaBell
              className="bell"
              onClick={() => setShowNotif(!showNotif)}
            />

            {showNotif && (
              <div className="notif-box">
                لا يوجد إشعارات حالياً
              </div>
            )}

          </div>

        </div>

        <div className="content">
          <Outlet />
        </div>

      </div>

    </div>
  )
}

export default AdminLayout