import { useEffect, useState } from "react"
import {
  getAppointmentsByChildId,
  createAppointment,
  cancelAppointment,
  completeAppointment
} from "../../api/appointmentsService"
import { getChildren } from "../../api/childrenService"
import "../../assets/adminAppointments.css"
import toast from "react-hot-toast"

export default function AdminAppointments() {

  const [appointments, setAppointments] = useState([])
  const [children, setChildren] = useState([])

  const [selectedDate, setSelectedDate] = useState(new Date())
  const [currentMonth, setCurrentMonth] = useState(new Date())

  const [showModal, setShowModal] = useState(false)
  const [loading, setLoading] = useState(false)

  const [form, setForm] = useState({
    childId: "",
    scheduledAtUtc: "",
    durationMinutes: "",
    notes: ""
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const c = await getChildren()
      const kids = c.data || []
      setChildren(kids)

      if (kids.length > 0) {
        const a = await getAppointmentsByChildId(kids[0].id)
        setAppointments(a.items || [])
      }
    } catch {
      toast.error("فشل تحميل البيانات")
    }
  }

  const getDays = () => {
    const year = currentMonth.getFullYear()
    const month = currentMonth.getMonth()

    const firstDay = new Date(year, month, 1).getDay()
    const daysInMonth = new Date(year, month + 1, 0).getDate()

    const days = []

    for (let i = 0; i < firstDay; i++) days.push(null)

    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i))
    }

    return days
  }

  const filtered = appointments.filter(a => {
    const d = new Date(a.scheduledAtUtc)
    return d.toDateString() === selectedDate.toDateString()
  })

  const isValid = () => {
    return (
      form.childId &&
      form.scheduledAtUtc &&
      form.durationMinutes >= 15 &&
      form.durationMinutes <= 240
    )
  }

  const submit = async () => {
    if (!isValid()) {
      toast.error("اكمل البيانات صح ❌")
      return
    }

    setLoading(true)

    try {
      await createAppointment({
        childId: Number(form.childId),
        scheduledAtUtc: new Date(form.scheduledAtUtc).toISOString(),
        durationMinutes: Number(form.durationMinutes),
        notes: form.notes
      })

      toast.success("تم إضافة الجلسة ✅")

      setShowModal(false)
      setForm({
        childId: "",
        scheduledAtUtc: "",
        durationMinutes: "",
        notes: ""
      })

      loadData()
    } catch {
      toast.error("فشل إضافة الجلسة ❌")
    }

    setLoading(false)
  }

  return (
    <div className="appointments">

      <div className="header">
        <h2>الجدول الزمني</h2>
        <button className="add-btn" onClick={() => setShowModal(true)}>
          + إضافة موعد
        </button>
      </div>

      <div className="month">
        <button onClick={() =>
          setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() - 1)))
        }>‹</button>

        <span>
          {currentMonth.toLocaleString("ar-EG", { month: "long", year: "numeric" })}
        </span>

        <button onClick={() =>
          setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() + 1)))
        }>›</button>
      </div>

      <div className="days">
        {getDays().map((d, i) => (
          <div
            key={i}
            className={`day ${d && selectedDate.toDateString() === d.toDateString() ? "active" : ""}`}
            onClick={() => d && setSelectedDate(d)}
          >
            {d ? d.getDate() : ""}
          </div>
        ))}
      </div>

      <div className="cards">
        {filtered.map(a => {
          const time = new Date(a.scheduledAtUtc)

          return (
            <div className="card" key={a.id}>
              <h3>{a.notes || "جلسة"}</h3>
              <p>{time.toLocaleTimeString()}</p>

              <div className="actions">
                <button onClick={() => cancelAppointment(a.id)}>إلغاء</button>
                <button onClick={() => completeAppointment(a.id)}>إنهاء</button>
              </div>
            </div>
          )
        })}
      </div>

      {showModal && (
        <div className="modal">
          <div className="modal-content">

            <h3>إضافة جلسة</h3>

            <select onChange={e => setForm({ ...form, childId: e.target.value })}>
              <option value="">اختر الطفل</option>
              {children.map(c => (
                <option key={c.id} value={c.id}>{c.fullName}</option>
              ))}
            </select>

            <input
              type="datetime-local"
              onChange={e => setForm({ ...form, scheduledAtUtc: e.target.value })}
            />

            <input
              type="number"
              placeholder="مدة الجلسة (15-240 دقيقة)"
              onChange={e => setForm({ ...form, durationMinutes: e.target.value })}
            />

            <input
              placeholder="ملاحظات"
              onChange={e => setForm({ ...form, notes: e.target.value })}
            />

            <button
              disabled={!isValid() || loading}
              className="submit"
              onClick={submit}
            >
              {loading ? "جاري الإضافة..." : "إضافة"}
            </button>

            <button className="close" onClick={() => setShowModal(false)}>
              إغلاق
            </button>

          </div>
        </div>
      )}

    </div>
  )
}