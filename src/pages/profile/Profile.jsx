import styles from "../../assets/profile.module.css"
import dashboardStyles from "../../assets/dashboard.module.css"
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import {
  getChildProfile,
  updateChildProfile,
  setChildImage,
  getChildImage
} from "../../api/childrenService"
import {
  getParentProfileImage,
  setParentProfileImage
} from "../../api/parentProfileService"
import { uploadImage } from "../../api/mediaService"
import toast from "react-hot-toast"
import { clearAuth } from "../../utils/auth"

function Profile() {

  const navigate = useNavigate()
  const childId = Number(localStorage.getItem("childId"))

  const [child, setChild] = useState({})
  const [childImage, setChildImageUrl] = useState(null)
  const [parentImage, setParentImage] = useState(null)

  const [childPreview, setChildPreview] = useState(null)
  const [parentPreview, setParentPreview] = useState(null)

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [childRes, childImg, parentImg] = await Promise.all([
        getChildProfile(childId),
        getChildImage(childId),
        getParentProfileImage()
      ])

      setChild(childRes || {})
      setChildImageUrl(childImg?.url || null)
      setParentImage(parentImg?.url || null)

    } catch {
      toast.error("فشل تحميل البيانات")
    } finally {
      setLoading(false)
    }
  }

  const handleChildChange = (e) => {
    setChild(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await updateChildProfile(childId, {
        fullName: child.fullName,
        dateOfBirth: child.dateOfBirth,
        gender: child.gender,
        diagnosis: child.diagnosis
      })

      toast.success("تم الحفظ")
    } catch {
      toast.error("فشل الحفظ")
    } finally {
      setSaving(false)
    }
  }

  const handleChildImage = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    setChildPreview(URL.createObjectURL(file))

    try {
      const res = await uploadImage(file, {
        category: 2
      })

      await setChildImage(childId, {
        mediaId: res.id
      })

      setChildImageUrl(res.url)

      toast.success("تم تغيير صورة الطفل")
    } catch {
      toast.error("فشل رفع الصورة")
    }
  }

  const handleParentImage = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    setParentPreview(URL.createObjectURL(file))

    try {
      const res = await uploadImage(file, {
        category: 2
      })

      await setParentProfileImage({
        mediaId: res.id
      })

      setParentImage(res.url)

      toast.success("تم تغيير الصورة")
    } catch {
      toast.error("فشل رفع الصورة")
    }
  }

  if (loading) return <p>Loading...</p>

  return (
    <div className={dashboardStyles.specialistsPage}>

      <div className={styles.header}>
        <h2 className={dashboardStyles.pageTitle}>الملف الشخصي</h2>

        <button
          className={styles.saveBtn}
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? "جارٍ الحفظ..." : "حفظ التغييرات"}
        </button>
      </div>

      <div className={styles.container}>

        <div className={styles.left}>

          <div className={styles.card}>
            <h3>بيانات الطفل</h3>

            <div className={styles.childBox}>

              <img
                src={childPreview || childImage || "/avatar.png"}
                className={styles.avatar}
              />

              <span>{child.fullName}</span>

              <label className={styles.uploadBtn}>
                تغيير صورة الطفل
                <input type="file" hidden onChange={handleChildImage} />
              </label>
            </div>

            <div className={styles.grid}>
              <input
                name="fullName"
                value={child.fullName || ""}
                onChange={handleChildChange}
                placeholder="اسم الطفل"
              />

              <input
                type="date"
                name="dateOfBirth"
                value={child.dateOfBirth?.split("T")[0] || ""}
                onChange={handleChildChange}
              />

              <input
                name="diagnosis"
                value={child.diagnosis || ""}
                onChange={handleChildChange}
                placeholder="التشخيص"
              />
            </div>

          </div>

        </div>

        <div className={styles.right}>

          <div className={styles.profileCard}>

            <img
              src={parentPreview || parentImage || "/avatar.png"}
              className={styles.avatar}
            />

            <h3>ولي الأمر</h3>

            <label className={styles.uploadBtn}>
              تغيير الصورة
              <input type="file" hidden onChange={handleParentImage} />
            </label>

            <button
              className={styles.logout}
              onClick={() => {
                clearAuth()
                navigate("/login")
              }}
            >
              تسجيل الخروج
            </button>

          </div>

        </div>

      </div>

    </div>
  )
}

export default Profile