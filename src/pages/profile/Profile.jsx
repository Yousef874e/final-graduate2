import styles from "../../assets/profile.module.css"
import dashboardStyles from "../../assets/dashboard.module.css"
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { getChildProfile, updateChildProfile, setChildImage } from "../../api/childrenService"
import { uploadImage } from "../../api/mediaService"
import { setParentProfileImage } from "../../api/parentProfileService"
import toast from "react-hot-toast"

function Profile() {

  const navigate = useNavigate()
  const childId = localStorage.getItem("childId")

  const [child, setChild] = useState({})
  const [parent, setParent] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const res = await getChildProfile(childId)

      setChild(res)

      setParent({
        fullName: res?.parentFullName || "",
        phoneNumber: res?.parentPhoneNumber || "",
        address: res?.parentAddress || ""
      })

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

  const handleParentChange = (e) => {
    setParent({
      ...parent,
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

      toast.success("تم الحفظ")
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
      fetchData()
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
      <br />

      <div className={styles.container}>

        <div className={styles.left}>

          <div className={styles.card}>
            <h3>بيانات ولي الأمر</h3>

            <div className={styles.grid}>
              <input
                name="fullName"
                value={parent.fullName}
                onChange={handleParentChange}
                placeholder="الاسم بالكامل"
              />

              <input
                name="phoneNumber"
                value={parent.phoneNumber}
                onChange={handleParentChange}
                placeholder="رقم الهاتف"
              />

              <input
                name="address"
                value={parent.address}
                onChange={handleParentChange}
                placeholder="العنوان"
              />
            </div>
          </div>

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
                name="dateOfBirth"
                value={child.dateOfBirth || ""}
                onChange={handleChildChange}
                placeholder="تاريخ الميلاد"
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
              src={child.imageUrl || "/avatar.png"}
              className={styles.avatar}
            />

            <h3>{parent.fullName}</h3>
            <p>ولي أمر</p>
            <br /><br />

            <label className={styles.uploadBtn}>
              تغيير الصورة
              <input type="file" hidden onChange={handleParentImage} />
            </label>
            <br />
            <br />

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