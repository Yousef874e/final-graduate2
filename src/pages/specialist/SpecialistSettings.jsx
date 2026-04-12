import styles from "../../assets/settingss.module.css"
import { useEffect, useState } from "react"
import { changePassword } from "../../api/authService"
import { getSpecialistDashboard } from "../../api/dashboardService"
import { useNavigate } from "react-router-dom"
import toast from "react-hot-toast"

function Settings() {

  const navigate = useNavigate()

  const [profile, setProfile] = useState(null)
  const [loadingProfile, setLoadingProfile] = useState(true)

  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    try {
      const res = await getSpecialistDashboard()
      const data = res?.data || res || {}

      setProfile({
        fullName: data?.specialistName || "",
        specialization: data?.specialization || "",
        bio: data?.bio || ""
      })

    } catch {
      toast.error("فشل تحميل البيانات")
    } finally {
      setLoadingProfile(false)
    }
  }

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword) {
      toast.error("املأ البيانات")
      return
    }

    if (newPassword.length < 6) {
      toast.error("كلمة المرور الجديدة ضعيفة")
      return
    }

    try {
      setLoading(true)

      await changePassword({
        currentPassword,
        newPassword
      })

      toast.success("تم تغيير كلمة المرور")

      localStorage.clear()

      setTimeout(() => {
        navigate("/login")
      }, 1000)

    } catch {
      toast.error("كلمة المرور الحالية غير صحيحة")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.container}>

      <h2 className={styles.title}>إعدادات الحساب</h2>

      <div className={styles.card}>
        <h3>الملف المهني</h3>

        {loadingProfile ? (
          <p>Loading...</p>
        ) : (
          <>
            <div className={styles.row}>
              <input value={profile?.fullName} disabled />
              <input value={profile?.specialization} disabled />
            </div>

            <textarea value={profile?.bio} disabled />
          </>
        )}
      </div>

      <div className={styles.card}>
        <h3>الأمان</h3>

        <input
          type="password"
          placeholder="كلمة المرور الحالية"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
        />

        <input
          type="password"
          placeholder="كلمة المرور الجديدة"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
        />

        <button
          className={styles.save}
          onClick={handleChangePassword}
          disabled={loading}
        >
          {loading ? "جارٍ التغيير..." : "تغيير كلمة المرور"}
        </button>

      </div>

    </div>
  )
}

export default Settings