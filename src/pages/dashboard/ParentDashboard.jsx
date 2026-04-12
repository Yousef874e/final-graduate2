import { useState } from "react"
import styles from "../../assets/dashboard.module.css"
import { FaPlay } from "react-icons/fa"
import { useNavigate } from "react-router-dom"
import toast from "react-hot-toast"
import { useApp } from "../../Context/AppContext"
import { getTreatmentPlans } from "../../api/treatmentPlansService"
import { startSession } from "../../api/sessionsService"

function ParentDashboard() {

  const navigate = useNavigate()
  const { data } = useApp()

  const [starting, setStarting] = useState(false)

  const children = data?.children || []
  const appointments = data?.upcomingAppointments || []
  const overview = data?.overview || {}

  const appointment = appointments[0]
  const child = children[0]

  let day = ""
  let month = ""
  let time = ""

  if (appointment?.scheduledAtUtc) {
    const date = new Date(appointment.scheduledAtUtc)
    day = date.getDate()
    month = date.toLocaleString("ar-EG", { month: "short" })
    time = date.toLocaleTimeString("ar-EG", {
      hour: "2-digit",
      minute: "2-digit"
    })
  }

  const handleStartSession = async () => {

    if (!child?.childId) {
      toast.error("لا يوجد طفل ❌")
      return
    }

    try {
      setStarting(true)

      const plans = await getTreatmentPlans(child.childId)
      const plan = plans?.items?.[0]

      if (!plan) {
        toast.error("لا توجد خطة علاج ❌")
        return
      }

      const exercise = plan.exercises?.[0]

      if (!exercise) {
        toast.error("لا يوجد تمرين ❌")
        return
      }

      const res = await startSession({
        childId: child.childId,
        exerciseId: exercise.exerciseId,
        treatmentPlanExerciseId: exercise.id
      })

      const sessionId = res?.id

      if (!sessionId) {
        toast.error("فشل بدء التمرين ❌")
        return
      }

      toast.success("تم بدء التمرين ✅")

      navigate(`/dashboard/sessions?sessionId=${sessionId}`)

    } catch (err) {

      const errorMsg =
        err?.response?.data?.errors?.[0] ||
        err?.response?.data?.title ||
        "فشل بدء التمرين ❌"

      toast.error(errorMsg)

    } finally {
      setStarting(false)
    }
  }

  return (
    <>
      {/* HERO */}
      <div className={styles.hero}>

        <div className={styles.heroRight}>

          <span className={styles.tag}>
            {appointment ? "جلسة اليوم" : "لا يوجد جلسات"}
          </span>

          <h2>جاهز للتمرين؟</h2>
          <p>بقت خطوة واحدة لإكمال الهدف!</p>

          <div className={styles.heroBtns}>

            <button
              className={styles.outlineBtn}
              onClick={() => {
                if (appointment) {
                  navigate(`/dashboard/sessions?appointmentId=${appointment.appointmentId}`)
                } else {
                  toast.error("لا يوجد جلسة حالياً ❌")
                }
              }}
            >
              تفاصيل الجلسة
            </button>

            <button
              className={styles.startBtn}
              onClick={handleStartSession}
              disabled={starting}
            >
              {starting ? "جاري البدء..." : <><FaPlay /> ابدأ التمرين</>}
            </button>

          </div>

        </div>

        <div className={styles.heroLeft}>
          <div className={styles.progressCircle}>
            {overview?.averageAccuracyAcrossChildren || 0}%
          </div>
        </div>

      </div>

      {/* CARDS */}
      <div className={styles.cards}>

        <div className={styles.card}>
          <h4>إنجازات الأسبوع</h4>

          <div className={styles.taskDone}>
            جلسات مكتملة: {overview?.totalCompletedSessions || 0}
          </div>

          <span
            className={styles.viewAll}
            onClick={() => navigate("/dashboard/reports")}
          >
            عرض كل الإنجازات
          </span>
        </div>

        <div className={styles.card}>
          <h4>الموعد القادم</h4>

          {appointment ? (
            <>
              <div className={styles.appointment}>
                <div>
                  <h5>{appointment.specialistName}</h5>
                  <p>{time}</p>
                </div>

                <div className={styles.dateBox}>
                  <span>{month}</span>
                  <strong>{day}</strong>
                </div>
              </div>

              <button
                className={styles.confirmBtn}
                onClick={() => navigate("/dashboard/sessions")}
              >
                عرض الجلسة
              </button>
            </>
          ) : (
            <p>لا يوجد موعد</p>
          )}
        </div>

        <div className={styles.card}>
          <h4>
            {child ? child.childName : "لا يوجد طفل"}
          </h4>

          {child && (
            <>
              <div className={styles.childInfo}>
                <span>{child.specialistName}</span>
                <span>تقارير: {child.reportsCount}</span>
              </div>

              <div className={styles.progressBar}>
                <div
                  className={styles.progressFill}
                  style={{
                    width: `${child.averageAccuracyScore || 0}%`
                  }}
                />
              </div>

              <span className={styles.good}>
                {(child.averageAccuracyScore || 0) >= 70
                  ? "جيد جدًا"
                  : "يحتاج متابعة"}
              </span>
            </>
          )}

          <span
            className={styles.viewAll}
            onClick={() => navigate("/dashboard/profile")}
          >
            عرض الملف الكامل
          </span>
        </div>

      </div>

    </>
  )
}

export default ParentDashboard