import styles from "../../assets/profile.module.css"
import dashboardStyles from "../../assets/dashboard.module.css"
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { getChildProfile, updateChildProfile, setChildImage } from "../../api/childrenService"
import { uploadImage } from "../../api/mediaService"
function Profile() {
  const navigate = useNavigate()
  const childId = localStorage.getItem("childId")
  const [child, setChild] = useState({})
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    fetchData()
  }, [])
  const fetchData = async () => {
    try {
      const res = await getChildProfile(childId)
      setChild(res)
    } catch (err) {
      console.log(err)
    } finally {
      setLoading(false)
    }
  }
  const handleChange = (e) => {
    setChild({
      ...child,
      [e.target.name]: e.target.value
    })
  }
  const handleSave = async () => {
    try {
      const payload = {
        fullName: child.name,
        dateOfBirth: child.birthDate,
        gender: child.gender,
        diagnosis: child.diagnosis
      }
      await updateChildProfile(childId, payload)
      alert("تم الحفظ ✅")

    } catch {
      alert("فشل الحفظ ❌")
    }
  }
  const handleUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    const formData = new FormData()
    formData.append("file", file)
    formData.append("category", "2")
    try {
      const res = await uploadImage(formData)
      const mediaId = res?.id
      await setChildImage(childId, mediaId)
      fetchData()
    } catch (err) {
      console.log(err)
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
            <h3>المعلومات الأساسية</h3>

            <div className={styles.grid}>

              <div>
                <label>الاسم الأول</label>
                <input name="firstName" value={child.firstName || ""} onChange={handleChange} />
              </div>

              <div>
                <label>اسم العائلة</label>
                <input name="lastName" value={child.lastName || ""} onChange={handleChange} />
              </div>

              <div>
                <label>رقم الجوال</label>
                <input name="phone" value={child.phone || ""} onChange={handleChange} />
              </div>

              <div>
                <label>البريد الإلكتروني</label>
                <input name="email" value={child.email || ""} onChange={handleChange} />
              </div>

            </div>
          </div>

          <div className={styles.card}>
            <h3>بيانات الطفل</h3>

            <div className={styles.childBox}>
              <span>{child.name}</span>

              <label className={styles.uploadChildBtn}>
                تحديث صورة الطفل
                <input type="file" onChange={handleUpload} hidden />
              </label>
            </div>

            <div className={styles.grid}>

              <div>
                <label>التشخيص الطبي</label>
                <input name="diagnosis" value={child.diagnosis || ""} onChange={handleChange} />
              </div>

              <div>
                <label>تاريخ الميلاد</label>
                <input name="birthDate" value={child.birthDate || ""} onChange={handleChange} />
              </div>

            </div>

            <textarea
              name="notes"
              placeholder="ملاحظات إضافية"
              value={child.notes || ""}
              onChange={handleChange}
            />
          </div>

        </div>

        <div className={styles.right}>

          <div className={styles.profileCard}>

            <img
              src={child.imageUrl || child.url || "/avatar.png"}
              alt=""
              className={styles.avatar}
            />

            <h3>{child.name}</h3>
            <p>ولي أمر</p>

            <label className={styles.uploadChildBtn}>
              تغير الصوره
              <input type="file" onChange={handleUpload} hidden />
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

          <div className={styles.menuCard}>

            <div className={`${styles.menuItem} ${styles.active}`}>
              معلومات الحساب
            </div>

            <div className={styles.menuItem}>بيانات الطفل</div>
            <div className={styles.menuItem}>التقارير الطبية</div>
            <div className={styles.menuItem}>الأمان وكلمة المرور</div>
            <div className={styles.menuItem}>الإشعارات</div>

          </div>

        </div>

      </div>
    </div>
  )
}

export default Profile