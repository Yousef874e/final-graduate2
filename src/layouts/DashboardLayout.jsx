import { FaHome, FaUserMd, FaCalendarAlt, FaBook, FaChartBar, FaUsers, FaCog, FaSignOutAlt, FaUser } from "react-icons/fa"
import { NavLink, Outlet } from "react-router-dom"
import styles from "../assets/dashboard.module.css"
import logo from "../assets/images/logo.png"

function DashboardLayout() {
  return (
    <div className={styles.dashboard}>

      <div className={styles.sidebar}>

  <div className="logo-container">
    <div className="logo-circle">
      <img src={logo} alt="logo" />
    </div>
    <span className="logo-text">رفيق</span>
  </div>

  <ul></ul>

       
        <ul>

          <li>
            <NavLink to="/dashboard/parent" className={({ isActive }) => isActive ? styles.active : ""}>
              <FaHome /> الرئيسية
            </NavLink>
          </li>

          <li>
            <NavLink to="/dashboard/specialists" className={({ isActive }) => isActive ? styles.active : ""}>
              <FaUserMd /> الأخصائيين
            </NavLink>
          </li>

          <li>
            <NavLink to="/dashboard/sessions" className={({ isActive }) => isActive ? styles.active : ""}>
              <FaCalendarAlt /> الجدول
            </NavLink>
          </li>

          <li>
            <NavLink to="/dashboard/library">
              <FaBook /> المكتبة
            </NavLink>
          </li>

          <li>
            <NavLink to="/dashboard/reports">
              <FaChartBar /> التقارير
            </NavLink>
          </li>

          <li>
            <NavLink to="/dashboard/community">
              <FaUsers /> المجتمع
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
             <NavLink to="/login">
            <FaSignOutAlt /> تسجيل الخروج
            </NavLink>
          </li>

        </ul>

      </div>

      <div className={styles.main}>
        <Outlet />
      </div>

    </div>
  )
}

export default DashboardLayout