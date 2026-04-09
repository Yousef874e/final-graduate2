import { useEffect, useState } from "react"
import {
  getAppointmentsByChild,
  createAppointment,
  updateAppointment,
  cancelAppointment,
  completeAppointment
} from "../../api/appointmentsService"
import { getChildren } from "../../api/childrenService"
import axiosClient from "../../api/axiosClient"
import "../../assets/adminAppointments.css"

export default function AdminAppointments() {

  const [appointments, setAppointments] = useState([])
  const [children, setChildren] = useState([])
  const [specialists, setSpecialists] = useState([])

  const [selectedDate, setSelectedDate] = useState(new Date())
  const [currentMonth, setCurrentMonth] = useState(new Date())

  const [showModal, setShowModal] = useState(false)

  const [form, setForm] = useState({
    childId: "",
    specialistUserId: "",
    scheduledAtUtc: "",
    location: "",
    notes: ""
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    const c = await getChildren()
    const kids = c.data || []
    setChildren(kids)

    if (kids.length > 0) {
      const a = await getAppointmentsByChild(kids[0].id)
      setAppointments(a || [])
    }

    const s = await axiosClient.get("/Specialists?pageNumber=1&pageSize=50")
    setSpecialists(s.data.items || [])
  }

  const getDays = () => {
    const year = currentMonth.getFullYear()
    const month = currentMonth.getMonth()
    const days = new Date(year, month + 1, 0).getDate()

    return [...Array(days)].map((_, i) =>
      new Date(year, month, i + 1)
    )
  }

  const filtered = appointments.filter(a => {
    const d = new Date(a.scheduledAtUtc)
    return (
      d.getDate() === selectedDate.getDate() &&
      d.getMonth() === selectedDate.getMonth() &&
      d.getFullYear() === selectedDate.getFullYear()
    )
  })

  const getChild = (id) =>
    children.find(c => c.id === id)?.fullName || ""

  const getDoctor = (id) =>
    specialists.find(s => s.userId === id)?.fullName || ""

  const getStatus = (status) => {
    if (status === 1) return { text: "جاري الآن", class: "now" }
    if (status === 4) return { text: "مكتمل", class: "done" }
    if (status === 3) return { text: "ملغي", class: "cancel" }
    return { text: "انضم للجلسة", class: "join" }
  }

  const submit = async () => {
    await createAppointment(form)
    setShowModal(false)
    loadData()
  }

  return (
    <div className="appointments">

      <div className="top">
        <button className="add-btn" onClick={() => setShowModal(true)}>
          + إضافة موعد جديد
        </button>
      </div>

      <div className="title">
        <h2>الجدول الزمني</h2>
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
            className={`day ${selectedDate.toDateString() === d.toDateString() ? "active" : ""}`}
            onClick={() => setSelectedDate(d)}
          >
            {d.getDate()}
          </div>
        ))}
      </div>

      <div className="cards">
        {filtered.map(a => {
          const status = getStatus(a.status)
          const time = new Date(a.scheduledAtUtc)

          return (
            <div className="card" key={a.id}>

              <div className="row">
                <h3>{a.notes || "جلسة"}</h3>
                <span>
                  {time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>

              <div className="info">
                <p>{getDoctor(a.specialistUserId)}</p>
                <p>{getChild(a.childId)}</p>
                <p>{a.location || "العيادة الرئيسية"}</p>
              </div>

              <button className={`status ${status.class}`}>
                {status.text}
              </button>

              <div className="actions">
                <button onClick={() => updateAppointment(a.id, a)}>تعديل</button>
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

            <select onChange={e => setForm({ ...form, specialistUserId: e.target.value })}>
              <option>الأخصائي</option>
              {specialists.map(s => (
                <option key={s.userId} value={s.userId}>{s.fullName}</option>
              ))}
            </select>

            <select onChange={e => setForm({ ...form, childId: e.target.value })}>
              <option>الطفل</option>
              {children.map(c => (
                <option key={c.id} value={c.id}>{c.fullName}</option>
              ))}
            </select>

            <input
              type="datetime-local"
              onChange={e => setForm({ ...form, scheduledAtUtc: e.target.value })}
            />

            <input
              placeholder="المكان"
              onChange={e => setForm({ ...form, location: e.target.value })}
            />

            <input
              placeholder="عنوان الجلسة"
              onChange={e => setForm({ ...form, notes: e.target.value })}
            />

            <button onClick={submit}>إضافة جلسة</button>
            <button onClick={() => setShowModal(false)}>إغلاق</button>

          </div>
        </div>
      )}

    </div>
  )
}