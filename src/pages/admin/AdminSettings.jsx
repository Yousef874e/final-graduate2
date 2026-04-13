import "../../assets/adminSettings.css"
import { useState } from "react"
import { changePassword } from "../../api/authService"
import toast from "react-hot-toast"

function AdminSettings() {

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: ""
  })

  const [preview, setPreview] = useState(null)

  const [notifications, setNotifications] = useState({
    appointments: true,
    messages: true
  })

  const handleImageChange = (file) => {
    if (!file) return
    setPreview(URL.createObjectURL(file))
  }

  const handleChangePassword = async () => {
    if (!passwordForm.currentPassword || !passwordForm.newPassword) {
      toast.error("كمل البيانات ❌")
      return
    }

    try {
      await changePassword(passwordForm)
      toast.success("تم تغيير كلمة المرور 🔒")
      setPasswordForm({ currentPassword: "", newPassword: "" })
    } catch {
      toast.error("فشل ❌")
    }
  }

  return (
    <div className="settings-page">

      <div className="card profile-card">

        <h3>الملف المهني</h3>

        <div className="profile-wrapper">
          <label className="image-box">
            <input
              type="file"
              hidden
              onChange={(e) => handleImageChange(e.target.files[0])}
            />

            {preview ? (
              <img src={preview} alt="preview" />
            ) : (
              <span>📷</span>
            )}

            <div className="overlay">تغيير</div>
          </label>
        </div>

        <button className="btn primary">
          حفظ التغييرات
        </button>
      </div>

      <div className="card">

        <h3>الإشعارات والتنبيهات</h3>

        <div className="notif-item">
          <span>تنبيهات المواعيد</span>

          <div
            className={`switch ${notifications.appointments ? "active" : ""}`}
            onClick={() =>
              setNotifications({
                ...notifications,
                appointments: !notifications.appointments
              })
            }
          />
        </div>

        <div className="notif-item">
          <span>رسائل المرضى</span>

          <div
            className={`switch ${notifications.messages ? "active" : ""}`}
            onClick={() =>
              setNotifications({
                ...notifications,
                messages: !notifications.messages
              })
            }
          />
        </div>

      </div>

      <div className="card">

        <h3>الأمان</h3>

        <div className="input-group">
          <input
            type="password"
            placeholder="كلمة المرور الحالية"
            value={passwordForm.currentPassword}
            onChange={(e) =>
              setPasswordForm({ ...passwordForm, currentPassword: e.target.value })
            }
          />
        </div>

        <div className="input-group">
          <input
            type="password"
            placeholder="كلمة المرور الجديدة"
            value={passwordForm.newPassword}
            onChange={(e) =>
              setPasswordForm({ ...passwordForm, newPassword: e.target.value })
            }
          />
        </div>

        <button className="btn primary" onClick={handleChangePassword}>
          تغيير كلمة المرور
        </button>

      </div>

    </div>
  )
}

export default AdminSettings