import styles from "../../assets/appointments.module.css"
import { useEffect, useState } from "react"
import {
  createAppointment,
  getAppointmentsByChildId,
  updateAppointment,
  cancelAppointment,
  completeAppointment
} from "../../api/appointmentsService"
import { getChildren } from "../../api/childrenService"
import toast from "react-hot-toast"

function SpecialistAppointments() {

  const [appointments, setAppointments] = useState([])
  const [children, setChildren] = useState([])

  const [childId, setChildId] = useState("")
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState(null)

  const [date, setDate] = useState("")
  const [time, setTime] = useState("")
  const [duration, setDuration] = useState(30)
  const [notes, setNotes] = useState("")

  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(new Date())

  const loadChildren = async () => {
    try {
      const res = await getChildren()
      setChildren(res?.items || [])
    } catch {
      toast.error("فشل تحميل الأطفال")
    }
  }

  const loadAppointments = async () => {
    if (!childId) return
    try {
      const res = await getAppointmentsByChildId(childId)
      setAppointments(res?.items || [])
    } catch {
      toast.error("فشل تحميل المواعيد")
    }
  }

  useEffect(() => {
    loadChildren()
  }, [])

  useEffect(() => {
    loadAppointments()
  }, [childId])

  const handleSubmit = async () => {

    if (!childId) {
      toast.error("اختار طفل")
      return
    }

    if (!date || !time) {
      toast.error("حدد التاريخ والوقت")
      return
    }

    if (duration < 15 || duration > 240) {
      toast.error("المدة لازم من 15 لـ 240 دقيقة")
      return
    }

    const scheduledAtUtc = new Date(`${date}T${time}`).toISOString()

    try {
      if (editId) {
        await updateAppointment(editId, {
          scheduledAtUtc,
          durationMinutes: Number(duration),
          notes
        })
        toast.success("تم التعديل")
      } else {
        await createAppointment({
          childId: Number(childId),
          scheduledAtUtc,
          durationMinutes: Number(duration),
          notes
        })
        toast.success("تم الإضافة")
      }

      handleCancel()
      loadAppointments()

    } catch {
      toast.error("فشل العملية")
    }
  }

  const handleEdit = (a) => {
    setEditId(a.id)
    setShowForm(true)

    const d = new Date(a.scheduledAtUtc)

    setDate(d.toISOString().split("T")[0])
    setTime(d.toTimeString().slice(0, 5))
    setDuration(a.durationMinutes)
    setNotes(a.notes || "")
    setChildId(a.childId)
  }

  const handleCancelAppointment = async (id) => {
    try {
      await cancelAppointment(id)
      toast.success("تم الإلغاء")
      loadAppointments()
    } catch {
      toast.error("فشل الإلغاء")
    }
  }

  const handleCompleteAppointment = async (id) => {
    try {
      await completeAppointment(id)
      toast.success("تم الإنهاء")
      loadAppointments()
    } catch {
      toast.error("فشل الإنهاء")
    }
  }

  const handleCancel = () => {
    setShowForm(false)
    setEditId(null)
    setDate("")
    setTime("")
    setDuration(30)
    setNotes("")
  }

  const nextMonth = () => {
    const d = new Date(currentDate)
    d.setMonth(d.getMonth() + 1)
    setCurrentDate(d)
  }

  const prevMonth = () => {
    const d = new Date(currentDate)
    d.setMonth(d.getMonth() - 1)
    setCurrentDate(d)
  }

  const getMonthDays = () => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()

    const firstDay = new Date(year, month, 1).getDay()
    const daysInMonth = new Date(year, month + 1, 0).getDate()

    const days = []

    for (let i = 0; i < firstDay; i++) {
      days.push(null)
    }

    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i))
    }

    return days
  }

  const hasAppointment = (day) => {
    if (!day) return false
    return appointments.some(
      (a) =>
        new Date(a.scheduledAtUtc).toDateString() === day.toDateString()
    )
  }

  const filteredAppointments = appointments.filter((a) => {
    return new Date(a.scheduledAtUtc).toDateString() === selectedDate.toDateString()
  })

  return (
    <div className={styles.container}>

      <div className={styles.header}>
        <button onClick={() => setShowForm(true)}>+ إضافة موعد</button>
      </div>

      <div className={styles.calendar}>

        <div className={styles.calendarTop}>
          <button onClick={prevMonth}>‹</button>

          <h3>
            {currentDate.toLocaleString("ar-EG", {
              month: "long",
              year: "numeric"
            })}
          </h3>

          <button onClick={nextMonth}>›</button>
        </div>

        <div className={styles.grid}>

          {["ح", "ن", "ث", "ر", "خ", "ج", "س"].map((d, i) => (
            <div key={i} className={styles.dayName}>{d}</div>
          ))}

          {getMonthDays().map((d, i) => (
            <div
              key={i}
              className={`${styles.day}
              ${d && selectedDate.toDateString() === d.toDateString() ? styles.active : ""}
              ${hasAppointment(d) ? styles.hasEvent : ""}`}
              onClick={() => d && setSelectedDate(d)}
            >
              {d ? d.getDate() : ""}
            </div>
          ))}

        </div>

      </div>

      {showForm && (
        <div className={styles.overlay}>
          <div className={styles.modal}>

            <select value={childId} onChange={(e) => setChildId(e.target.value)}>
              <option value="">اختر الطفل</option>
              {children.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.fullName}
                </option>
              ))}
            </select>

            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            <input type="time" value={time} onChange={(e) => setTime(e.target.value)} />

            <input
              type="number"
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
            />

            <input
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />

            <div className={styles.actions}>
              <button onClick={handleSubmit}>حفظ</button>
              <button className={styles.cancel} onClick={handleCancel}>إلغاء</button>
            </div>

          </div>
        </div>
      )}

      <div className={styles.list}>

        {filteredAppointments.map((a) => (
          <div key={a.id} className={styles.card}>

            <div>
              <h4>{a.notes || "جلسة"}</h4>
              <p>{new Date(a.scheduledAtUtc).toLocaleDateString()}</p>
            </div>

            <div className={styles.cardActions}>
              <span>
                {new Date(a.scheduledAtUtc).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit"
                })}
              </span>

              <button onClick={() => handleEdit(a)}>تعديل</button>
              <button onClick={() => handleCancelAppointment(a.id)}>إلغاء</button>
              <button onClick={() => handleCompleteAppointment(a.id)}>إنهاء</button>
            </div>

          </div>
        ))}

      </div>

    </div>
  )
}

export default SpecialistAppointments