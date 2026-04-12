import styles from "../../assets/profiles.module.css"
import { useEffect, useState } from "react"
import { useApp } from "../../Context/AppContext"
import {
  getSpecialistProfileImage,
  setSpecialistProfileImage
} from "../../api/specialistProfileService"
import toast from "react-hot-toast"

function SpecialistProfile() {

  const { data, loadData } = useApp()

  const [image, setImage] = useState(null)

  useEffect(() => {
    loadImage()
  }, [])

  const loadImage = async () => {
    try {
      const res = await getSpecialistProfileImage()
      setImage(res?.url || null)
    } catch {
      setImage(null)
    }
  }

  const handleUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    if (!file.type.startsWith("image/")) {
      toast.error("مسموح صور فقط")
      return
    }

    try {
      const formData = new FormData()
      formData.append("file", file)

      await setSpecialistProfileImage(formData)

      await loadImage()
      await loadData()

      toast.success("تم تحديث الصورة")
    } catch {
      toast.error("فشل رفع الصورة")
    }
  }

  return (
    <div className={styles.container}>

      <div className={styles.headerCard}>

        <div className={styles.cover}></div>

        <div className={styles.profileInfo}>

          <div className={styles.avatarWrapper}>
            <img
              src={image || "/avatar.png"}
              className={styles.avatar}
              alt=""
            />

            <input
              type="file"
              accept="image/*"
              onChange={handleUpload}
              className={styles.fileInput}
            />
          </div>

          <div>
            <h2>{data?.specialistName || "دكتور"}</h2>
            <p>{data?.specialization || "تخصص"}</p>
          </div>

        </div>

      </div>

      <div className={styles.grid}>

        <div className={styles.card}>
          <h3>نبذة عني</h3>
          <p>{data?.bio || "لا يوجد وصف"}</p>
        </div>

      </div>

    </div>
  )
}

export default SpecialistProfile