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
  const prevCountRef = useRef(0);
  const audioRef = useRef(null);
  const savedUserName = localStorage.getItem("userName") || "مستخدم";

  const notifications = [];

  if (data?.upcomingAppointments?.length > 0) {
    notifications.push("📅 لديك جلسات قادمة لطفلك");
  }

  if (
    data?.children?.some(
      (child) => child.exercisesCount > 0 || child.pendingExercisesCount > 0,
    )
  ) {
    notifications.push("🏋️ هناك تمارين تحتاج متابعة");
  }

  if (data?.treatmentPlans?.length > 0) {
    notifications.push("📋 تم إضافة أو تحديث خطة علاجية");
  }

  if (data?.children?.some((child) => child.reportsCount > 0)) {
    notifications.push("📊 يوجد تقارير جديدة متاحة");
  }

  const notificationsCount = notifications.length;

  const playNotificationSound = () => {
    try {
      const audio = new Audio(
        "https://www.soundjay.com/misc/sounds/bell-ringing-05.mp3",
      );
      audio.volume = 0.5;
      audio.play().catch((err) => console.log("صوت الإشعارات معطل:", err));
    } catch (err) {
      console.log("تعذر تشغيل الصوت");
    }
  };

  const vibrateDevice = () => {
    if (window.navigator && window.navigator.vibrate) {
      window.navigator.vibrate(200);
    }
  };

  const showBrowserNotification = (title, body) => {
    if (Notification && Notification.permission === "granted") {
      new Notification(title, {
        body: body,
        icon: logo,
        silent: false,
      });
    } else if (Notification && Notification.permission !== "denied") {
      Notification.requestPermission().then((permission) => {
        if (permission === "granted") {
          new Notification(title, {
            body: body,
            icon: logo,
          });
        }
      });
    }
  };

  useEffect(() => {
    if (
      Notification &&
      Notification.permission !== "granted" &&
      Notification.permission !== "denied"
    ) {
      Notification.requestPermission();
    }
  }, []);

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
    if (notificationsCount > prevCountRef.current) {
      const diff = notificationsCount - prevCountRef.current;

      playNotificationSound();
      vibrateDevice();

      if (diff === 1) {
        toast.success(`🔔 عندك إشعار جديد`);
        showBrowserNotification(
          "إشعار جديد",
          notifications[notifications.length - 1],
        );
      } else {
        toast.success(`🔔 عندك ${diff} إشعارات جديدة`);
        showBrowserNotification(
          `${diff} إشعارات جديدة`,
          `لديك ${diff} من الإشعارات الجديدة`,
        );
      }
    }

    prevCountRef.current = notificationsCount;
  }, [notificationsCount]);

  useEffect(() => {
    loadData();

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
                مرحباً، {parent?.fullName || savedUserName} 👋
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
                className={`${styles.iconCircle} ${notificationsCount > 0 ? styles.hasNotifications : ""}`}
                onClick={() => setShowNotifications(!showNotifications)}
              />
              {notificationsCount > 0 && (
                <span className={styles.badge}>{notificationsCount}</span>
              )}
              {showNotifications && notifications.length > 0 && (
                <div className={styles.notificationsBox}>
                  {notifications.map((item, index) => (
                    <div key={index} className={styles.notificationItem}>
                      {item}
                    </div>
                  ))}
                </div>
              )}
              {showNotifications && notifications.length === 0 && (
                <div className={styles.notificationsBox}>
                  <div className={styles.noNotifications}>
                    📭 لا توجد إشعارات جديدة
                  </div>
                </div>
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