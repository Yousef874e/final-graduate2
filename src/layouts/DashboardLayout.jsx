import {
  FaHome,
  FaCalendarAlt,
  FaBook,
  FaChartBar,
  FaCog,
  FaSignOutAlt,
  FaUser,
  FaBell,
  FaDumbbell,
  FaComment
} from "react-icons/fa"

import { NavLink, Outlet, useNavigate, useLocation } from "react-router-dom"
import styles from "../assets/dashboard.module.css"
import logo from "../assets/images/logo.png"
import { useState } from "react"
import { useApp } from "../Context/AppContext"

function DashboardLayout() {

  const navigate = useNavigate()
  const location = useLocation()
  const { data } = useApp()

  const [showNotifications, setShowNotifications] = useState(false)

  const alerts = data?.alerts || {}
  const userName = data?.parentName || "User"
  const profileImage = data?.parentProfileImageUrl

  const notificationsCount =
    (alerts?.childrenWithoutUpcomingAppointments || 0) +
    (alerts?.childrenWithLowAccuracy || 0)

  const titles = {
    "/dashboard/parent": "لوحة التحكم",
    "/dashboard/appointments": "الجدول الزمني",
    "/dashboard/library": "المكتبة",
    "/dashboard/reports": "التقارير",
    "/dashboard/chat": "الشات",
    "/dashboard/exercises": "التمارين",
    "/dashboard/settings": "الإعدادات",
    "/dashboard/profile": "الملف الشخصي"
  }

  const currentTitle = titles[location.pathname] || "لوحة التحكم"
  const isDashboard = location.pathname === "/dashboard/parent"

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
            <NavLink to="/dashboard/parent" className={({ isActive }) => isActive ? styles.active : ""}>
              <FaHome /> الرئيسية
            </NavLink>
          </li>

          <li>
            <NavLink to="/dashboard/appointments" className={({ isActive }) => isActive ? styles.active : ""}>
              <FaCalendarAlt /> الجدول
            </NavLink>
          </li>

          <li>
            <NavLink to="/dashboard/library">
              <FaBook /> المكتبة
            </NavLink>
          </li>

          <li>
            <NavLink to="/dashboard/exercises">
              <FaDumbbell /> التمارين
            </NavLink>
          </li>

          <li>
            <NavLink to="/dashboard/reports">
              <FaChartBar /> التقارير
            </NavLink>
          </li>

          <li>
            <NavLink to="/dashboard/chat">
              <FaComment /> الشات
            </NavLink>
          </li>

          <li>
            <NavLink to="/dashboard/settings">
              <FaCog /> الإعدادات
            </NavLink>
          </li>

          <li>
            <NavLink to="/dashboard/profile">
              <FaUser /> الملف الشخصي
            </NavLink>
          </li>

          <li className={styles.logout}>
            <div
              onClick={() => {
                localStorage.clear()
                navigate("/login")
              }}
              style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: "8px" }}
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
                مرحباً، {userName}
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
                    <p>⚠️ في طفل بدون مواعيد</p>
                  )}
                  {alerts?.childrenWithLowAccuracy > 0 && (
                    <p>📉 في طفل محتاج متابعة</p>
                  )}
                  {notificationsCount === 0 && (
                    <p>لا يوجد إشعارات</p>
                  )}
                </div>
              )}
            </div>

            <div
              className={styles.userBox}
              onClick={() => navigate("/dashboard/profile")}
            >
              <span>{userName}</span>

              {profileImage ? (
                <img
                  src={profileImage}
                  alt="profile"
                  className={styles.avatar}
                />
              ) : (
                <FaUser className={styles.iconCircle}/>
              )}
            </div>

          </div>

        </div>

        <Outlet />

      </div>

    </div>
  )
}

export default DashboardLayout