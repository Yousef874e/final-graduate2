import styles from "../../assets/dashboard.module.css"
import sessionStyles from "../../assets/sessions.module.css"
import { useState, useMemo } from "react"
import { useApp } from "../../Context/AppContext"
import { useSearchParams } from "react-router-dom"

function Sessions() {

  const {
    sessions = [],
    appointments = [],
    loading
  } = useApp()

  const [params] = useSearchParams()
  const sessionId = params.get("sessionId")
  const appointmentId = params.get("appointmentId")

  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDay, setSelectedDay] = useState(new Date().getDate())

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1)

  const monthNames = [
    "يناير","فبراير","مارس","أبريل","مايو","يونيو",
    "يوليو","أغسطس","سبتمبر","أكتوبر","نوفمبر","ديسمبر"
  ]

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1))
    setSelectedDay(1)
  }

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1))
    setSelectedDay(1)
  }

  const mergedData = useMemo(() => [
    ...appointments.map(a => ({
      id: a?.id,
      type: "appointment",
      title: "جلسة علاج طبيعي",
      doctor: a?.specialistUserId || "غير معروف",
      time: a?.scheduledAtUtc
    })),
    ...sessions.map(s => ({
      id: s?.id,
      type: "session",
      title: "جلسة تمرين",
      doctor: "تمرين",
      time: s?.startedAtUtc || s?.createdAtUtc
    }))
  ], [appointments, sessions])

  const filteredData = useMemo(() => {
    return mergedData
      .filter(item => {
        if (!item.time) return false
        const date = new Date(item.time)
        return (
          date.getDate() === selectedDay &&
          date.getMonth() === month &&
          date.getFullYear() === year
        )
      })
      .sort((a, b) => new Date(a.time) - new Date(b.time))
  }, [mergedData, selectedDay, month, year])

  const now = new Date()

  const nextAppointment = useMemo(() => {
    return appointments
      .filter(a => a?.scheduledAtUtc && new Date(a.scheduledAtUtc) > now)
      .sort((a, b) => new Date(a.scheduledAtUtc) - new Date(b.scheduledAtUtc))[0]
  }, [appointments, now])

  let timeLeft = "لا يوجد مواعيد قادمة"

  if (nextAppointment) {
    const diff = new Date(nextAppointment.scheduledAtUtc) - now
    const minutes = Math.floor(diff / (1000 * 60))

    if (minutes > 60) {
      timeLeft = `متبقي ${Math.floor(minutes / 60)} ساعة`
    } else if (minutes > 0) {
      timeLeft = `متبقي ${minutes} دقيقة`
    } else {
      timeLeft = "قريبًا"
    }
  }

  return (
    <div style={{ padding: "20px" }}>

      <div className={sessionStyles.sessionsLayout}>

        <div className={sessionStyles.leftSide}>

          <div className={`${styles.card} ${sessionStyles.nextSession}`}>
            <h4>تذكير القادم</h4>
            <p>{timeLeft}</p>

            {nextAppointment && (
              <div className={sessionStyles.nextBox}>
                جلسة قادمة <br />
                <small>
                  {new Date(nextAppointment.scheduledAtUtc).toLocaleTimeString("ar-EG", {
                    hour: "2-digit",
                    minute: "2-digit"
                  })}
                </small>
              </div>
            )}
          </div>

          <div className={`${styles.card} ${sessionStyles.summary}`}>
            <h4>ملخص الشهر</h4>
            <p>{sessions.length} جلسة</p>
            <p>{appointments.length} مواعيد</p>
          </div>

        </div>

        <div>

          <div className={styles.card}>
            <div style={{display:"flex", justifyContent:"space-between"}}>
              <button onClick={prevMonth}>◀</button>
              <h4>{monthNames[month]} {year}</h4>
              <button onClick={nextMonth}>▶</button>
            </div>

            <div className={sessionStyles.calendarBox}>
              {days.map(d=>(
                <div
                  key={d}
                  onClick={()=> setSelectedDay(d)}
                  className={`${sessionStyles.day} ${
                    selectedDay === d ? sessionStyles.activeDay : ""
                  }`}
                >
                  {d}
                </div>
              ))}
            </div>
          </div>

          <div className={sessionStyles.sessionsList}>

            <h4>مواعيد {selectedDay}</h4>

            {loading ? (
              <p>Loading...</p>
            ) : filteredData.length === 0 ? (
              <div className={sessionStyles.emptyBox}>
                لا توجد مواعيد
              </div>
            ) : (
              filteredData.map((item)=>{

                const isActive =
                  (item.type === "session" && item.id == sessionId) ||
                  (item.type === "appointment" && item.id == appointmentId)

                return (
                  <div
                    key={item.id}
                    className={`${styles.card} ${sessionStyles.sessionItem}`}
                    style={{
                      border: isActive ? "2px solid #4CAF50" : ""
                    }}
                  >
                    <div>
                      <h4>{item.title}</h4>
                      <p>{item.doctor}</p>
                    </div>
                    <div>
                      <p>
                        {new Date(item.time).toLocaleTimeString("ar-EG", {
                          hour: "2-digit",
                          minute: "2-digit"
                        })}
                      </p>
                    </div>
                  </div>
                )
              })
            )}

          </div>

        </div>

      </div>

    </div>
  )
}

export default Sessions