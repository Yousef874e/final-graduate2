import styles from "../../assets/exerciseDetails.module.css"
import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import { getExerciseById } from "../../api/exerciseService"
import { startSession, submitSessionVideo } from "../../api/sessionsService"
import { uploadVideo } from "../../api/mediaService"
import { useApp } from "../../Context/AppContext"
import toast from "react-hot-toast"

function ExerciseDetails() {
  const { id } = useParams()

  const { loadData } = useApp()

  const [exercise, setExercise] = useState(null)
  const [loading, setLoading] = useState(true)
  const [sessionId, setSessionId] = useState(null)
  const [uploaded, setUploaded] = useState(false)

  useEffect(() => {
    init()
  }, [])

  const init = async () => {
    try {
      const data = await getExerciseById(id)
      setExercise(data)

      const session = await startSession({
        childId: data.childId,
        exerciseId: data.id
      })

      setSessionId(session.id)
    } catch {
      toast.error("فشل تحميل التمرين")
    } finally {
      setLoading(false)
    }
  }

  const handleUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    if (!file.type.startsWith("video/")) {
      toast.error("مسموح فيديو فقط")
      return
    }

    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("category", 4)
      formData.append("childId", exercise.childId)

      const media = await uploadVideo(formData)

      await submitSessionVideo(sessionId, media.id)

      await loadData()

      setUploaded(true)
      toast.success("تم رفع الفيديو")
    } catch {
      toast.error("فشل رفع الفيديو")
    }
  }

  return (
    <div className={styles.container}>
      <h3 className={styles.header}>لوحة التحكم</h3>
      <p className={styles.sub}>شاهد التمرين الآن</p>

      <div className={styles.videoBox}>
        {loading ? (
          <div className={styles.placeholder}></div>
        ) : (
          <video controls>
            <source src={exercise?.mediaUrl} />
          </video>
        )}
      </div>

      <div className={styles.card}>
        <h4>{exercise?.name || "تمرين"}</h4>
        <p>{exercise?.description || "لا يوجد وصف"}</p>

        <div className={styles.tags}>
          <span>{exercise?.exerciseType || "عام"}</span>
        </div>
      </div>

      <div className={styles.card}>
        <h4>قبل البدء</h4>
        <p>
          {exercise?.instructions ||
            "تأكد من وجود مساحة كافية حول الطفل"}
        </p>
      </div>

      {uploaded ? (
        <p className={styles.done}>✔️ تم رفع الفيديو</p>
      ) : (
        <label className={styles.uploadBtn}>
          رفع الفيديو
          <input
            type="file"
            accept="video/*"
            hidden
            onChange={handleUpload}
          />
        </label>
      )}
    </div>
  )
}

export default ExerciseDetails