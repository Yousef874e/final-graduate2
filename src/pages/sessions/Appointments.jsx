import styles from "../../assets/dashboard.module.css"
import sessionStyles from "../../assets/sessions.module.css"
import { useState } from "react"
import { useApp } from "../../Context/AppContext"
import { createAppointment } from "../../api/appointmentsService"
import { useSearchParams } from "react-router-dom"
import toast from "react-hot-toast"

function Sessions() {

  const {
    data,
    sessions,
    appointments,
    loading,
    loadData
  } = useApp()

  const [params] = useSearchParams()
  const sessionId = params.get("sessionId")
  const appointmentId = params.get("appointmentId")

  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDay, setSelectedDay] = useState(new Date().getDate())
  const [openModal, setOpenModal] = useState(false)

  const [form, setForm] = useState({
    date: "",
    time: "",
    duration: "",
    notes: ""
  })

  const childId = data?.children?.[0]?.childId

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

  const mergedData = [
    ...appointments.map(a => ({
      id: a.id,
      type: "appointment",
      title: "جلسة علاج طبيعي",
      doctor: a.specialistUserId || "غير معروف",
      time: a.scheduledAtUtc
    })),
    ...sessions.map(s => ({
      id: s.id,
      type: "session",
      title: "جلسة تمرين",
      doctor: "تمرين",
      time: s.startedAtUtc || s.createdAtUtc
    }))
  ]

  const filteredData = mergedData.filter(item => {
    const date = new Date(item.time)
    return (
      date.getDate() === selectedDay &&
      date.getMonth() === month &&
      date.getFullYear() === year
    )
  })

  const now = new Date()

  const nextAppointment = appointments
    .filter(a => new Date(a.scheduledAtUtc) > now)
    .sort((a, b) => new Date(a.scheduledAtUtc) - new Date(b.scheduledAtUtc))[0]

  let timeLeft = "لا يوجد مواعيد قادمة"

  if (nextAppointment) {
    const diff = new Date(nextAppointment.scheduledAtUtc) - now
    const hours = Math.floor(diff / (1000 * 60 * 60))
    timeLeft = hours > 0 ? `لم يتبق سوى ${hours} ساعة` : "قريبًا"
  }

  const handleSubmit = async () => {
    if (!form.date || !form.time || !form.duration) {
      toast.error("املى البيانات ❌")
      return
    }

    try {
      const dateTime = new Date(`${form.date}T${form.time}`)

      await createAppointment({
        childId,
        scheduledAtUtc: dateTime.toISOString(),
        durationMinutes: Number(form.duration),
        notes: form.notes
      })

      toast.success("تم إضافة الموعد ✅")

      setOpenModal(false)
      setForm({
        date: "",
        time: "",
        duration: "",
        notes: ""
      })

      await loadData()

    } catch {
      toast.error("فيه خطأ ❌")
    }
  }

  return (
    <>
      <div style={{ padding: "20px" }}>

        <button
          className={styles.startBtn}
          onClick={() => setOpenModal(true)}
          style={{ marginBottom: "15px" }}
        >
          + إضافة موعد جديد
        </button>

        <div className={sessionStyles.sessionsLayout}>

          <div className={sessionStyles.leftSide}>

            <div className={`${styles.card} ${sessionStyles.nextSession}`}>
              <h4>تذكير القادم</h4>
              <p>{timeLeft}</p>

              {nextAppointment && (
                <div className={sessionStyles.nextBox}>
                  جلسة قادمة <br />
                  <small>
                    {new Date(nextAppointment.scheduledAtUtc).toLocaleTimeString()}
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
                <div
                  className={sessionStyles.emptyBox}
                  onClick={() => setOpenModal(true)}
                >
                  لا توجد مواعيد - اضغط للإضافة
                </div>
              ) : (
                filteredData.map((item,i)=>{

                  const isActive =
                    (item.type === "session" && item.id == sessionId) ||
                    (item.type === "appointment" && item.id == appointmentId)

                  return (
                    <div
                      key={i}
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
                        <p>{new Date(item.time).toLocaleTimeString()}</p>
                      </div>
                    </div>
                  )
                })
              )}

            </div>

          </div>

        </div>

      </div>

      {openModal && (
        <div className={sessionStyles.modal}>
          <div className={sessionStyles.modalContent}>

            <h3>إضافة موعد</h3>

            <input type="date" value={form.date}
              onChange={e=>setForm({...form, date:e.target.value})}/>

            <input type="time" value={form.time}
              onChange={e=>setForm({...form, time:e.target.value})}/>

            <input placeholder="المدة بالدقائق"
              value={form.duration}
              onChange={e=>setForm({...form, duration:e.target.value})}/>

            <input placeholder="ملاحظات"
              value={form.notes}
              onChange={e=>setForm({...form, notes:e.target.value})}/>

            <button onClick={handleSubmit}>حفظ</button>
            <button onClick={()=>setOpenModal(false)}>إلغاء</button>

          </div>
        </div>
      )}
    </>
  )
}

export default Sessions