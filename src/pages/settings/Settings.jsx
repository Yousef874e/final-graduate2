import styles from "../../assets/settings.module.css"
import dashboardStyles from "../../assets/dashboard.module.css"
import { useState, useEffect } from "react"
import { changePassword } from "../../api/authService"
import { useNavigate } from "react-router-dom"
import { FaPalette, FaLock } from "react-icons/fa"
import toast from "react-hot-toast"

function Settings() {

  const navigate = useNavigate()

  const [language, setLanguage] = useState(
    localStorage.getItem("language") || "ar"
  )

  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [oldPassword, setOldPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")

  useEffect(() => {
    localStorage.setItem("language", language)
    document.documentElement.dir = language === "ar" ? "rtl" : "ltr"
  }, [language])

  const handleChangePassword = async () => {
    if (!oldPassword || !newPassword) {
      toast.error("املى البيانات")
      return
    }

    try {
      await changePassword({
        currentPassword: oldPassword,
        newPassword: newPassword
      })

      setShowPasswordModal(false)
      setOldPassword("")
      setNewPassword("")

      toast.success("تم تغيير كلمة المرور")

    } catch {
      toast.error("فشل تغيير كلمة المرور")
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