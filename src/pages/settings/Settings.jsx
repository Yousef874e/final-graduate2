import styles from "../../assets/settings.module.css"
import dashboardStyles from "../../assets/dashboard.module.css"
import { useState, useEffect } from "react"
import { changePassword } from "../../api/authService"
import { useNavigate } from "react-router-dom"
import { FaBell, FaPalette, FaLock } from "react-icons/fa"

function Settings() {

  const navigate = useNavigate()

  const [notifications, setNotifications] = useState(
    localStorage.getItem("notifications") === "true"
  )

  const [darkMode, setDarkMode] = useState(
    localStorage.getItem("darkMode") === "true"
  )

  const [language, setLanguage] = useState(
    localStorage.getItem("language") || "ar"
  )

  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [oldPassword, setOldPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [notificationsList, setNotificationsList] = useState([])

  useEffect(() => {
    localStorage.setItem("notifications", notifications)
  }, [notifications])

  useEffect(() => {
    localStorage.setItem("darkMode", darkMode)
    document.body.classList.toggle("dark", darkMode)
  }, [darkMode])

  useEffect(() => {
    localStorage.setItem("language", language)
    document.documentElement.dir = language === "ar" ? "rtl" : "ltr"
  }, [language])

  useEffect(() => {
    if (notifications) {
      setNotificationsList([
        "تم إضافة تقرير جديد",
        "لديك جلسة غداً"
      ])
    } else {
      setNotificationsList([])
    }
  }, [notifications])

  const handleChangePassword = async () => {
    if (!oldPassword || !newPassword) return

    try {
      await changePassword({
        currentPassword: oldPassword,
        newPassword: newPassword
      })

      setShowPasswordModal(false)
      setOldPassword("")
      setNewPassword("")
      alert("تم التغيير ✅")

    } catch {
      alert("خطأ ❌")
    }
  }

  const handleDeleteAccount = () => {
    const confirmDelete = window.confirm("هل أنت متأكد؟")
    if (confirmDelete) {
      localStorage.clear()
      navigate("/login")
    }
  }

  return (
    <div className={dashboardStyles.specialistsPage}>

      <h2 className={dashboardStyles.pageTitle}>الإعدادات</h2>

      <div className={styles.section}>
        <div className={styles.sectionTitle}>
          <FaBell />
          الإشعارات
        </div>

        <div className={styles.card}>
          <label className={styles.switch}>
            <input
              type="checkbox"
              checked={notifications}
              onChange={() => setNotifications(!notifications)}
            />
            <span className={styles.slider}></span>
          </label>

          <div>
            <h4>تفعيل الإشعارات</h4>
            <p>استقبال كل التحديثات</p>
          </div>
        </div>

        {notificationsList.length > 0 && (
          <div className={styles.notificationsBox}>
            {notificationsList.map((n, i) => (
              <p key={i}>{n}</p>
            ))}
          </div>
        )}

      </div>

      <div className={styles.section}>
        <div className={styles.sectionTitle}>
          <FaPalette />
          المظهر
        </div>

        <div className={styles.card}>
          <select
            className={styles.select}
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
          >
            <option value="ar">العربية</option>
            <option value="en">English</option>
          </select>

          <div>
            <h4>اللغة</h4>
            <p>تغيير لغة التطبيق</p>
          </div>
        </div>

        <div className={styles.card}>
          <label className={styles.switch}>
            <input
              type="checkbox"
              checked={darkMode}
              onChange={() => setDarkMode(!darkMode)}
            />
            <span className={styles.slider}></span>
          </label>

          <div>
            <h4>الوضع الليلي</h4>
            <p>تشغيل الوضع الداكن</p>
          </div>
        </div>

      </div>

      <div className={styles.section}>
        <div className={styles.sectionTitle}>
          <FaLock />
          الأمان
        </div>

        <button
          className={styles.mainBtn}
          onClick={() => setShowPasswordModal(true)}
        >
          تغيير كلمة السر
        </button>

        <button
          className={styles.deleteLink}
          onClick={handleDeleteAccount}
        >
          حذف الحساب
        </button>
      </div>

      {showPasswordModal && (
        <div
          className={styles.modalOverlay}
          onClick={() => setShowPasswordModal(false)}
        >
          <div
            className={styles.modal}
            onClick={(e) => e.stopPropagation()}
          >
            <h3>تغيير كلمة السر</h3>

            <input
              type="password"
              placeholder="كلمة السر القديمة"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
            />

            <input
              type="password"
              placeholder="كلمة السر الجديدة"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />

            <div className={styles.modalActions}>
              <button onClick={handleChangePassword}>
                حفظ
              </button>

              <button onClick={() => setShowPasswordModal(false)}>
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}

export default Settings