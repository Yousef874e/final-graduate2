import styles from "../../assets/profile.module.css"
import dashboardStyles from "../../assets/dashboard.module.css"
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { getChildProfile, updateChildProfile, setChildImage } from "../../api/childrenService"
import { getParentProfileImage, setParentProfileImage } from "../../api/parentProfileService"
import { uploadImage } from "../../api/mediaService"
import toast from "react-hot-toast"

function Profile() {

  const navigate = useNavigate()
  const childId = localStorage.getItem("childId")

  const [child, setChild] = useState({})
  const [parentImage, setParentImage] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const childRes = await getChildProfile(childId)
      setChild(childRes || {})

      const img = await getParentProfileImage()
      setParentImage(img?.url || null)

    } catch {
      toast.error("فشل تحميل البيانات")
    } finally {
      setLoading(false)
    }
  }

  const handleChildChange = (e) => {
    setChild({
      ...child,
      [e.target.name]: e.target.value
    })
  }

  const handleSave = async () => {
    try {
      await updateChildProfile(childId, {
        fullName: child.fullName,
        dateOfBirth: child.dateOfBirth,
        gender: child.gender,
        diagnosis: child.diagnosis
      })

      toast.success("تم الحفظ بنجاح")
    } catch {
      toast.error("فشل الحفظ")
    }
  }

  const handleChildImage = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    const formData = new FormData()
    formData.append("file", file)
    formData.append("category", 2)

    try {
      const res = await uploadImage(formData)
      await setChildImage(childId, res.id)
      await fetchData()
      toast.success("تم تغيير صورة الطفل")
    } catch {
      toast.error("فشل رفع الصورة")
    }
  }

  const handleParentImage = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    const formData = new FormData()
    formData.append("file", file)
    formData.append("category", 2)

    try {
      const res = await uploadImage(formData)
      await setParentProfileImage({ mediaId: res.id })
      await fetchData()
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

        <button className={styles.saveBtn} onClick={handleSave}>
          حفظ التغييرات
        </button>
      </div>

      <div className={styles.container}>

        <div className={styles.left}>

          <div className={styles.card}>
            <h3>بيانات الطفل</h3>

            <div className={styles.childBox}>
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
              src={parentImage || "/avatar.png"}
              className={styles.avatar}
            />

            <h3>ولي الأمر</h3>
            <p>Parent</p>

            <label className={styles.uploadBtn}>
              تغيير الصورة
              <input type="file" hidden onChange={handleParentImage} />
            </label>

            <button
              className={styles.logout}
              onClick={() => {
                localStorage.clear()
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