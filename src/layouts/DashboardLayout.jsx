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
  FaComment,
} from "react-icons/fa";

import { NavLink, Outlet, useNavigate, useLocation } from "react-router-dom";

import styles from "../assets/dashboard.module.css";

import logo from "../assets/images/logo.png";

import { useState, useEffect, useRef } from "react";

import { useApp } from "../Context/AppContext";

import { clearAuth } from "../utils/auth";

import toast from "react-hot-toast";

import {
  getParentProfile,
  getParentProfileImage,
} from "../api/parentProfileService";

function DashboardLayout() {
  const navigate = useNavigate();

  const location = useLocation();

  const { data, loadData } = useApp();

  const [showNotifications, setShowNotifications] = useState(false);

  const [parent, setParent] = useState({});

  const [profileImage, setProfileImage] = useState(null);

  const alerts = data?.alerts || {};

  const notificationsCount =
    (alerts?.childrenWithoutUpcomingAppointments || 0) +
    (alerts?.childrenWithLowAccuracy || 0);

  const prevCountRef = useRef(0);

  const savedUserName = localStorage.getItem("userName") || "مستخدم";

  useEffect(() => {
    loadParentData();
  }, []);

  const loadParentData = async () => {
    try {
      const [parentRes, imageRes] = await Promise.all([
        getParentProfile(),

        getParentProfileImage(),
      ]);

      setParent(parentRes || {});

      setProfileImage(imageRes?.url || null);
    } catch {
      console.log("failed loading parent data");
    }
  };

  useEffect(() => {
    const count =
      (alerts?.childrenWithoutUpcomingAppointments || 0) +
      (alerts?.childrenWithLowAccuracy || 0);

    if (count > prevCountRef.current) {
      const diff = count - prevCountRef.current;

      toast.success(`عندك ${diff} إشعار جديد 🔔`);
    }

    prevCountRef.current = count;
  }, [alerts]);

  useEffect(() => {
    const interval = setInterval(() => {
      loadData();
    }, 10000);

    return () => clearInterval(interval);
  }, [loadData]);

  const titles = {
    "/dashboard/parent": "لوحة التحكم",

    "/dashboard/appointments": "الجدول الزمني",

    "/dashboard/library": "المكتبة",

    "/dashboard/reports": "التقارير",

    "/dashboard/chat": "الشات",

    "/dashboard/exercises": "التمارين",

    "/dashboard/settings": "الإعدادات",

    "/dashboard/profile": "الملف الشخصي",
  };

  const currentTitle = titles[location.pathname] || "لوحة التحكم";

  const isDashboard = location.pathname === "/dashboard/parent";

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
            <NavLink
              to="/dashboard/parent"
              className={({ isActive }) => (isActive ? styles.active : "")}
            >
              <FaHome />
              الرئيسية
            </NavLink>
          </li>

          <li>
            <NavLink
              to="/dashboard/appointments"
              className={({ isActive }) => (isActive ? styles.active : "")}
            >
              <FaCalendarAlt />
              الجدول
            </NavLink>
          </li>

          <li>
            <NavLink
              to="/dashboard/library"
              className={({ isActive }) => (isActive ? styles.active : "")}
            >
              <FaBook />
              المكتبة
            </NavLink>
          </li>

          <li>
            <NavLink
              to="/dashboard/exercises"
              className={({ isActive }) => (isActive ? styles.active : "")}
            >
              <FaDumbbell />
              التمارين
            </NavLink>
          </li>

          <li>
            <NavLink
              to="/dashboard/reports"
              className={({ isActive }) => (isActive ? styles.active : "")}
            >
              <FaChartBar />
              التقارير
            </NavLink>
          </li>

          <li>
            <NavLink
              to="/dashboard/chat"
              className={({ isActive }) => (isActive ? styles.active : "")}
            >
              <FaComment />
              الشات
            </NavLink>
          </li>

          <li>
            <NavLink
              to="/dashboard/settings"
              className={({ isActive }) => (isActive ? styles.active : "")}
            >
              <FaCog />
              الإعدادات
            </NavLink>
          </li>

          <li>
            <NavLink
              to="/dashboard/profile"
              className={({ isActive }) => (isActive ? styles.active : "")}
            >
              <FaUser />
              الملف الشخصي
            </NavLink>
          </li>

          <li className={styles.logout}>
            <div
              onClick={() => {
                clearAuth();

                navigate("/login", {
                  replace: true,
                });
              }}
              style={{
                cursor: "pointer",

                display: "flex",

                alignItems: "center",

                gap: "8px",
              }}
            >
              <FaSignOutAlt />
              تسجيل الخروج
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
                مرحباً،
                {parent?.fullName || savedUserName}
                👋
              </p>
            )}
          </div>

          <div className={styles.headerLeft}>
            <div
              style={{
                position: "relative",
              }}
            >
              <FaBell
                className={styles.iconCircle}
                onClick={() => setShowNotifications(!showNotifications)}
              />

              {notificationsCount > 0 && (
                <span className={styles.badge}>{notificationsCount}</span>
              )}
            </div>

            <div
              className={styles.userBox}
              onClick={() => navigate("/dashboard/profile")}
            >
              <span>{parent?.fullName || savedUserName}</span>

              <div className={styles.avatarWrapper}>
                {profileImage ? (
                  <img
                    src={profileImage}
                    alt="profile"
                    className={styles.avatarImg}
                  />
                ) : (
                  <FaUser className={styles.avatarIcon} />
                )}
              </div>
            </div>
          </div>
        </div>

        <Outlet />
      </div>
    </div>
  );
}

export default DashboardLayout;
