import styles from "../../assets/dashboard.module.css"
import sessionStyles from "../../assets/sessions.module.css"
import { FaUser, FaBell } from "react-icons/fa"
import { useEffect, useState } from "react"
import { getSessionsByChild } from "../../api/sessionsService"
import { getAppointmentsByChild, createAppointment } from "../../api/appointmentsService"

function Sessions() {

  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDay, setSelectedDay] = useState(new Date().getDate())
  const [sessions, setSessions] = useState([])
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)

  const [openModal, setOpenModal] = useState(false)

  const [form, setForm] = useState({
    date: "",
    time: "",
    duration: "",
    notes: ""
  })

  const childId = localStorage.getItem("childId")
  const userName = localStorage.getItem("userName")

  useEffect(() => {
    if (!childId) return

    const fetchData = async () => {
      setLoading(true)
      try {
        const [sessionsRes, appointmentsRes] = await Promise.all([
          getSessionsByChild(childId),
          getAppointmentsByChild(childId)
        ])

        setSessions(sessionsRes?.data?.data?.items || [])
        setAppointments(appointmentsRes?.data?.data?.items || [])
      } catch (err) {
        console.log(err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [childId])

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
      title: "جلسة علاج طبيعي",
      doctor: a.specialistUserId || "غير معروف",
      time: a.scheduledAtUtc,
      color: "#e8f4ff"
    })),
    ...sessions.map(s => ({
      id: s.id,
      title: "جلسة تمرين",
      doctor: "",
      time: s.createdAtUtc,
      color: "#f3e8ff"
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

    timeLeft = hours > 0
      ? `لم يتبق سوى ${hours} ساعة`
      : "قريبًا"
  }

  const handleSubmit = async () => {
    if (!form.date || !form.time || !form.duration) {
      alert("املى البيانات ❌")
      return
    }

    const dateTime = new Date(`${form.date}T${form.time}`)

    try {
      const res = await createAppointment({
        childId,
        scheduledAtUtc: dateTime.toISOString(),
        durationMinutes: Number(form.duration),
        notes: form.notes
      })

      const newItem = res.data?.data || res.data

      setAppointments(prev => [...prev, newItem])

      setOpenModal(false)

    } catch (err) {
      console.log(err)
      alert("فيه خطأ ❌")
    }
  }

  return (
    <div className={styles.specialistsPage}>

      <div className={styles.topBar}>
        <div className={styles.topRight}>
          <h3>لوحة التحكم</h3>
        </div>

        <div className={styles.topLeft}>
          <div className={styles.userBox}>
            <span>{userName || "User"}</span>
            <FaUser className={styles.iconCircle}/>
          </div>
          <div className={styles.iconWrapper}>
            <FaBell />
          </div>
        </div>
      </div>

      <h2 className={styles.pageTitle}>الجدول الزمني</h2>

      <button
        className={styles.startBtn}
        onClick={() => setOpenModal(true)}
        style={{marginBottom:"15px"}}
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
              filteredData.map((item,i)=>(
                <div key={i} className={`${styles.card} ${sessionStyles.sessionItem}`}>
                  <div>
                    <h4>{item.title}</h4>
                    <p>{item.doctor}</p>
                  </div>

                  <div>
                    <p>{new Date(item.time).toLocaleTimeString()}</p>
                  </div>
                </div>
              ))
            )}

          </div>

        </div>

      </div>

      {openModal && (
        <div className={sessionStyles.modal}>
          <div className={sessionStyles.modalContent}>

            <h3>إضافة موعد</h3>

            <input type="date" onChange={e=>setForm({...form, date:e.target.value})}/>
            <input type="time" onChange={e=>setForm({...form, time:e.target.value})}/>
            <input placeholder="المدة بالدقائق" onChange={e=>setForm({...form, duration:e.target.value})}/>
            <input placeholder="ملاحظات" onChange={e=>setForm({...form, notes:e.target.value})}/>

            <button onClick={handleSubmit}>حفظ</button>
            <button onClick={()=>setOpenModal(false)}>إلغاء</button>

          </div>
        </div>
      )}

    </div>
  )
}

export default Sessions