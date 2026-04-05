import "../assets/adminLayout.css"
import logo from "../assets/images/logo.png"
import { FaHome, FaUsers, FaCalendar, FaFileAlt, FaCog, FaBell } from "react-icons/fa"
import { Outlet, useNavigate } from "react-router-dom"

function AdminLayout() {

  const navigate = useNavigate()

  return (
    <div className="layout">

      <div className="sidebar">

        <div className="logo">
          <img src={logo} alt="logo" />
          <span>رفيق</span>
        </div>

        <div className="menu">
          <div className="active" onClick={() => navigate("/dashboard/admin")}>
            <FaHome /> الرئيسية
          </div>

          <div>
            <FaUsers /> ملفات المستخدمين
          </div>

          <div>
            <FaCalendar /> جدول المواعيد
          </div>

          <div>
            <FaFileAlt /> التقارير الطبية
          </div>

          <div>
            <FaCog /> الإعدادات
          </div>
        </div>

        <div className="logout">
          تسجيل الخروج
        </div>

      </div>

      <div className="main">

        <div className="header">
          <h3>لوحة تحكم الأدمن</h3>

          <div className="header-left">
            <FaBell className="bell" />
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