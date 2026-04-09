import { useState, useEffect } from "react"
import styles from "../../assets/dashboard.module.css"
import { FaBell, FaPlay, FaUser } from "react-icons/fa"
import { useNavigate } from "react-router-dom"
import toast from "react-hot-toast"
import axiosClient from "../../api/axiosClient"
import { useApp } from "../../Context/AppContext"
import { getParentProfileImage } from "../../api/parentProfileService"
import { getTreatmentPlans } from "../../api/treatmentPlansService"

function ParentDashboard() {

  const navigate = useNavigate()
  const { data } = useApp()

  const [showNotifications, setShowNotifications] = useState(false)
  const [starting, setStarting] = useState(false)
  const [profileImage, setProfileImage] = useState(null)

  const children = data?.children || []
  const appointments = data?.upcomingAppointments || []
  const overview = data?.overview || {}
  const alerts = data?.alerts || {}

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

  const notificationsCount =
    (alerts?.childrenWithoutUpcomingAppointments || 0) +
    (alerts?.childrenWithLowAccuracy || 0)

  useEffect(() => {
    fetchProfileImage()
  }, [])

  const fetchProfileImage = async () => {
    try {
      const res = await getParentProfileImage()
      setProfileImage(res.url)
    } catch {
      setProfileImage(null)
    }
  }

  const handleStartSession = async () => {

    if (!child?.id) {
      toast.error("لا يوجد طفل ❌")
      return
    }

    try {
      setStarting(true)

      const plans = await getTreatmentPlans(child.id)
      const plan = plans?.[0] || plans?.items?.[0]

      if (!plan) {
        toast.error("لا توجد خطة علاج ❌")
        return
      }

      const exercise = plan.exercises?.[0]

      if (!exercise) {
        toast.error("لا يوجد تمرين ❌")
        return
      }

      const res = await axiosClient.post("/Sessions/start", {
        childId: child.id,
        exerciseId: exercise.exerciseId,
        treatmentPlanExerciseId: exercise.id
      })

      const sessionId = res.data?.id

      if (!sessionId) {
        toast.error("فشل بدء التمرين ❌")
        return
      }

      toast.success("تم بدء التمرين ✅")

      navigate(`/dashboard/sessions?sessionId=${sessionId}`)

    } catch (err) {

      const errorMsg =
        err.response?.data?.errors?.[0] ||
        err.response?.data?.title ||
        "فشل بدء التمرين ❌"

      toast.error(errorMsg)

    } finally {
      setStarting(false)
    }
  }

  return (
    <div className={styles.main}>

      <div className={styles.header}>

        <div className={styles.headerRight}>
          <h3>لوحة التحكم</h3>
          <p className={styles.welcome}>
            مرحباً، {data?.parentName || "..."}
          </p>
        </div>

        <div className={styles.headerLeft}>

          <div style={{ position: "relative" }}>
            <FaBell
              className={styles.iconCircle}
              onClick={() => setShowNotifications(!showNotifications)}
            />

            {notificationsCount > 0 && (
              <span className={styles.badge}>
                {notificationsCount}
              </span>
            )}

            {showNotifications && (
              <div className={styles.dropdown}>
                {alerts?.childrenWithoutUpcomingAppointments > 0 && (
                  <p>⚠️ في طفل بدون مواعيد</p>
                )}
                {alerts?.childrenWithLowAccuracy > 0 && (
                  <p>📉 في طفل محتاج متابعة</p>
                )}
                {notificationsCount === 0 && (
                  <p>لا يوجد إشعارات</p>
                )}
              </div>
            )}
          </div>

          <div
            className={styles.userBox}
            onClick={() => navigate("/dashboard/profile")}
          >
            <span>{data?.parentName || "..."}</span>

            {profileImage ? (
              <img
                src={profileImage}
                alt="profile"
                className={styles.avatar}
              />
            ) : (
              <FaUser className={styles.iconCircle}/>
            )}

          </div>

        </div>

      </div>

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
                  navigate(`/dashboard/sessions?appointmentId=${appointment.id}`)
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
            {child ? child.fullName : "لا يوجد طفل"}
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
                {child.averageAccuracyScore >= 70
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

    </div>
  )
}

export default ParentDashboard