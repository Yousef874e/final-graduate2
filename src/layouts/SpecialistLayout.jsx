import {
  FaHome,
  FaCalendarAlt,
  FaChartBar,
  FaCog,
  FaSignOutAlt,
  FaUser,
  FaBell,
  FaComment,
  FaUsers,
  FaFileMedical,
  FaDumbbell
} from "react-icons/fa"

import { NavLink, Outlet, useNavigate, useLocation } from "react-router-dom"
import styles from "../assets/dashboard.module.css"
import logo from "../assets/images/logo.png"
import { useState } from "react"
import { useApp } from "../Context/AppContext"

function SpecialistLayout() {

  const navigate = useNavigate()
  const location = useLocation()
  const { data } = useApp()

  const [showNotifications, setShowNotifications] = useState(false)

  const alerts = data?.alerts || {}
  const userName = data?.specialistName || "Doctor"
  const profileImage = data?.profileImageUrl

  const notificationsCount =
    (alerts?.childrenWithoutUpcomingAppointments || 0) +
    (alerts?.childrenWithLowAccuracy || 0)

  const getTitle = () => {
    if (location.pathname.includes("patients")) return "ملفات المرضى"
    if (location.pathname.includes("appointments")) return "جدول المواعيد"
    if (location.pathname.includes("reports")) return "التقارير الطبية"
    if (location.pathname.includes("chat")) return "الرسائل"
    if (location.pathname.includes("exercises")) return "التمارين"
    if (location.pathname.includes("settings")) return "الإعدادات"
    if (location.pathname.includes("profile")) return "الملف الشخصي"
    return "لوحة التحكم"
  }

  const currentTitle = getTitle()
  const isDashboard = location.pathname === "/dashboard/specialist"

  return (
    <div className={styles.dashboard}>

      <div className={styles.sidebar}>

        <div className="logo-container">
          <span className="logo-text">رفيق</span>
          <div className="logo-circle">
            <img src={logo} alt="logo" />
          </div>
        </div>

        <ul>

          <li>
            <NavLink to="/dashboard/specialist" className={({ isActive }) => isActive ? styles.active : ""}>
              <FaHome /> الرئيسية
            </NavLink>
          </li>

          <li>
            <NavLink to="/dashboard/specialist/patients" className={({ isActive }) => isActive ? styles.active : ""}>
              <FaUsers /> ملفات المرضى
            </NavLink>
          </li>

          <li>
            <NavLink to="/dashboard/specialist/appointments" className={({ isActive }) => isActive ? styles.active : ""}>
              <FaCalendarAlt /> المواعيد
            </NavLink>
          </li>

          <li>
            <NavLink to="/dashboard/specialist/reports" className={({ isActive }) => isActive ? styles.active : ""}>
              <FaFileMedical /> التقارير
            </NavLink>
          </li>

          <li>
            <NavLink to="/dashboard/specialist/chat" className={({ isActive }) => isActive ? styles.active : ""}>
              <FaComment /> الرسائل
            </NavLink>
          </li>

          <li>
            <NavLink to="/dashboard/specialist/exercises" className={({ isActive }) => isActive ? styles.active : ""}>
              <FaDumbbell /> التمارين
            </NavLink>
          </li>

          <li>
            <NavLink to="/dashboard/specialist/settings" className={({ isActive }) => isActive ? styles.active : ""}>
              <FaCog /> الإعدادات
            </NavLink>
          </li>

          <li>
            <NavLink to="/dashboard/specialist/profile" className={({ isActive }) => isActive ? styles.active : ""}>
              <FaUser /> الملف الشخصي
            </NavLink>
          </li>

          <li className={styles.logout}>
            <div
              onClick={() => {
                localStorage.clear()
                navigate("/login", { replace: true })
              }}
              style={{ cursor: "pointer", display: "flex", gap: "8px" }}
            >
              <FaSignOutAlt /> تسجيل الخروج
            </div>
          </li>

        </ul>

      </div>

      <div className={styles.main}>

        <div className={styles.header}>

          <div className={styles.headerRight}>
            <h3>{currentTitle}</h3>

            {isDashboard && (
              <p className={styles.welcome}>
                👋 مرحباً دكتور {userName}
              </p>
            )}
          </div>

          <div className={styles.headerLeft}>

            <div style={{ position: "relative" }}>
              <FaBell
                className={styles.iconCircle}
                onClick={() => setShowNotifications(!showNotifications)}
              />

              {notificationsCount > 0 && (
                <span className={styles.badge}>
                  {notificationsCount}
                </span>
              )}

              {showNotifications && (
                <div className={styles.dropdown}>
                  {alerts?.childrenWithoutUpcomingAppointments > 0 && (
                    <p>⚠️ في أطفال بدون مواعيد</p>
                  )}
                  {alerts?.childrenWithLowAccuracy > 0 && (
                    <p>📉 في أطفال محتاجين متابعة</p>
                  )}
                  {notificationsCount === 0 && (
                    <p>لا يوجد إشعارات</p>
                  )}
                </div>
              )}
            </div>

            <div
              className={styles.userBox}
              onClick={() => navigate("/dashboard/specialist/profile")}
            >
              <span>{userName}</span>

              {profileImage ? (
                <img src={profileImage} className={styles.avatar} />
              ) : (
                <FaUser className={styles.iconCircle} />
              )}
            </div>

          </div>

        </div>

        <Outlet />

      </div>

    </div>
  )
}

export default SpecialistLayout