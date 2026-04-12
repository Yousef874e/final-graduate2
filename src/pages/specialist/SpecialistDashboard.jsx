import styles from "../../assets/specialistDashboard.module.css"
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { getSpecialistDashboard } from "../../api/dashboardService"
import {
  FaCalendarAlt,
  FaUsers,
  FaChartLine,
  FaCheckCircle,
  FaPlay
} from "react-icons/fa"
import toast from "react-hot-toast"

function SpecialistDashboard() {

  const [data, setData] = useState({})
  const navigate = useNavigate()

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const res = await getSpecialistDashboard()
      setData(res || {})
    } catch {
      toast.error("فشل تحميل البيانات")
    }
  }

  const overview = data?.overview || {}
  const appointments = data?.upcomingAppointments || []

  return (
    <div className={styles.container}>

      <div className={styles.header}>
        <h2>👋 مرحباً دكتور</h2>
        <p>لديك {appointments.length} مواعيد اليوم</p>
      </div>

      <div className={styles.stats}>
        
        <div className={styles.card}>
          <FaUsers />
          <span>عدد الأطفال</span>
          <h3>{overview.totalAssignedChildren || 0}</h3>
        </div>

        <div className={styles.card}>
          <FaCheckCircle />
          <span>المواعيد المكتملة</span>
          <h3>{overview.totalCompletedAppointments || 0}</h3>
        </div>

        <div className={styles.card}>
          <FaCalendarAlt />
          <span>إجمالي المواعيد</span>
          <h3>{overview.totalAppointments || 0}</h3>
        </div>

        <div className={styles.card}>
          <FaChartLine />
          <span>التقيم العام</span>
          <h3>{overview.averageChildAccuracy || 0}%</h3>
        </div>

      </div>

      <div className={styles.grid}>

        <div className={styles.left}>

          <div className={styles.smallCard}>
            <p>تذكير إداري</p>
            <br />
            <span>يرجى تسليم التقرير الأسبوعي</span>
            <button onClick={() => navigate("/dashboard/specialist/reports")}>
              إرسال التقرير
            </button>
          </div>

        </div>

        <div className={styles.right}>

          <h4>مواعيد اليوم</h4>

          {appointments.length === 0 ? (
            <p>لا يوجد مواعيد</p>
          ) : (
            appointments.map((item) => {

              const isCompleted = item.status === 4

              return (
                <div key={item.appointmentId} className={styles.appointment}>

                  <div className={styles.info}>
                    <h5>{item.childName}</h5>
                  </div>

                  <div className={styles.time}>
                    <span>
                      {new Date(item.scheduledAtUtc).toLocaleTimeString("ar-EG", {
                        hour: "2-digit",
                        minute: "2-digit"
                      })}
                    </span>
                  </div>

                  <div className={styles.actions}>
                    {isCompleted ? (
                      <span className={styles.done}>مكتمل</span>
                    ) : (
                      <button
                        onClick={() =>
                          navigate("/dashboard/specialist/appointments", {
                            state: { appointmentId: item.appointmentId }
                          })
                        }
                      >
                        <FaPlay /> بدء الجلسة الآن
                      </button>
                    )}
                  </div>

                </div>
              )
            })
          )}

          <div className={styles.reminder}>
            <h4>تذكير</h4>
            <br />
            <p>يرجى مراجعة تمارين المرضى خلال الأسبوع</p>

            <button
              onClick={() => navigate("/dashboard/specialist/exercises")}
            >
              مراجعة التمارين
            </button>
          </div>

        </div>

      </div>

    </div>
  )
}

export default SpecialistDashboard