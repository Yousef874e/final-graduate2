import styles from "../../assets/exerciseDetails.module.css"
import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import { getExerciseById } from "../../api/exerciseService"
import { startSession, submitSessionVideo } from "../../api/sessionsService"
import { uploadVideo } from "../../api/mediaService"
import { getTreatmentPlans } from "../../api/treatmentPlansService"
import { useApp } from "../../Context/AppContext"
import toast from "react-hot-toast"

function ExerciseDetails() {

  const { id } = useParams()
  const { loadData } = useApp()

  const [exercise, setExercise] = useState(null)
  const [loading, setLoading] = useState(true)
  const [sessionId, setSessionId] = useState(null)
  const [uploaded, setUploaded] = useState(false)
  const [uploading, setUploading] = useState(false)

  const childId = localStorage.getItem("childId")

  useEffect(() => {
    init()
  }, [])

  const init = async () => {
    try {

      if (!childId) {
        toast.error("لا يوجد طفل ❌")
        return
      }

      const data = await getExerciseById(id)
      setExercise(data)

      const plansRes = await getTreatmentPlans(childId)
      const plans = plansRes?.items || []

      let exercisePlan = null

      for (const p of plans) {
        const found = p.exercises?.find(e => e.exerciseId === data.id)
        if (found) {
          exercisePlan = found
          break
        }
      }

      if (!exercisePlan) {
        toast.error("التمرين غير موجود في الخطة ❌")
        return
      }

      const session = await startSession({
        childId: Number(childId),
        exerciseId: data.id,
        treatmentPlanExerciseId: exercisePlan.id
      })

      if (!session?.id) {
        toast.error("فشل بدء الجلسة ❌")
        return
      }

      setSessionId(session.id)

    } catch {
      toast.error("فشل تحميل التمرين ❌")
    } finally {
      setLoading(false)
    }
  }

  const handleUpload = async (e) => {

    const file = e.target.files[0]
    if (!file) return

    if (!file.type.startsWith("video/")) {
      toast.error("مسموح فيديو فقط ❌")
      return
    }

    if (!sessionId) {
      toast.error("لم يتم بدء الجلسة ❌")
      return
    }

    try {
      setUploading(true)

      const formData = new FormData()
      formData.append("file", file)
      formData.append("category", 4)
      formData.append("childId", childId)

      const media = await uploadVideo(formData)

      if (!media?.id) {
        toast.error("فشل رفع الفيديو ❌")
        return
      }

      await submitSessionVideo(sessionId, media.id)

      await loadData()

      setUploaded(true)
      toast.success("تم رفع الفيديو بنجاح ✅")

    } catch {
      toast.error("فشل رفع الفيديو ❌")
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className={styles.container}>

      <h3 className={styles.header}>التمرين</h3>
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
          {uploading ? "جاري الرفع..." : "رفع الفيديو"}
          <input
            type="file"
            accept="video/*"
            hidden
            onChange={handleUpload}
            disabled={uploading}
          />
        </label>
      )}

    </div>
  )
}

export default ExerciseDetails