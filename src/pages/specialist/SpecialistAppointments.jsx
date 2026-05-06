import styles from "../../assets/appointments.module.css";
import { useEffect, useState } from "react";
import {
  createAppointment,
  getAppointmentsByChildId,
  updateAppointment,
  cancelAppointment,
  completeAppointment,
} from "../../api/appointmentsService";
import { getChildren } from "../../api/childrenService";
import toast from "react-hot-toast";

function SpecialistAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [children, setChildren] = useState([]);

  const [childId, setChildId] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);

  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [duration, setDuration] = useState(30);
  const [notes, setNotes] = useState("");

  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());

  const loadAppointments = async () => {
    try {
      const res = await getChildren();
      const childrenList = res?.items || [];
      setChildren(childrenList);

      let allAppointments = [];

      const promises = childrenList.map(async (child) => {
        try {
          const res = await getAppointmentsByChildId(child.id);
          const items = res?.items || [];

          return items.map((a) => ({
            ...a,
            childName: child.fullName,
          }));
        } catch {
          return [];
        }
      });

      const results = await Promise.all(promises);

      results.forEach((arr) => {
        allAppointments.push(...arr);
      });

      setAppointments(allAppointments);
    } catch {
      toast.error("فشل تحميل المواعيد");
    }
  };

  useEffect(() => {
    loadAppointments();
  }, []);

  const handleSubmit = async () => {
    if (!childId) return toast.error("اختار طفل");
    if (!date || !time) return toast.error("حدد التاريخ والوقت");

    const [hours, minutes] = time.split(":").map(Number);

    const localDate = new Date(date);
    localDate.setHours(hours, minutes, 0, 0);

    if (localDate <= new Date()) return toast.error("لازم وقت في المستقبل");

    const scheduledAtUtc = localDate.toISOString();

    try {
      if (editId) {
        await updateAppointment(editId, {
          scheduledAtUtc,
          durationMinutes: Number(duration),
          notes,
        });
        toast.success("تم التعديل");
      } else {
        await createAppointment({
          childId: Number(childId),
          scheduledAtUtc,
          durationMinutes: Number(duration),
          notes,
        });
        toast.success("تم الإضافة");
      }

      handleCancel();
      loadAppointments();
    } catch (err) {
      console.log(err);
      toast.error("فشل العملية");
    }
  };

  const handleEdit = (a) => {
    setEditId(a.id);
    setShowForm(true);

    const d = new Date(a.scheduledAtUtc);

    setDate(d.toLocaleDateString("en-CA"));
    setTime(
      d.toLocaleTimeString("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }),
    );

    setDuration(a.durationMinutes);
    setNotes(a.notes || "");
    setChildId(a.childId);
  };

  const handleCancelAppointment = async (id) => {
    try {
      await cancelAppointment(id);
      setAppointments((prev) => prev.filter((a) => a.id !== id));
      toast.success("تم الإلغاء");
    } catch (err) {
      console.log(err);
      toast.error("لا يمكن إلغاء هذا الموعد");
    }
  };

  const handleCompleteAppointment = async (id) => {
    try {
      await completeAppointment(id);
      toast.success("تم الإنهاء");
      loadAppointments();
    } catch (err) {
      console.log(err);
      toast.error("لا يمكن إنهاء هذا الموعد");
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditId(null);
    setDate("");
    setTime("");
    setDuration(30);
    setNotes("");
    setChildId("");
  };

  const nextMonth = () => {
    const d = new Date(currentDate);
    d.setMonth(d.getMonth() + 1);
    setCurrentDate(d);
  };

  const prevMonth = () => {
    const d = new Date(currentDate);
    d.setMonth(d.getMonth() - 1);
    setCurrentDate(d);
  };

  const getMonthDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const days = [];

    for (let i = 0; i < firstDay; i++) days.push(null);
    for (let i = 1; i <= daysInMonth; i++) days.push(new Date(year, month, i));

    return days;
  };

  const hasAppointment = (day) => {
    if (!day) return false;
    return appointments.some(
      (a) => new Date(a.scheduledAtUtc).toDateString() === day.toDateString(),
    );
  };

  const filteredAppointments = appointments.filter(
    (a) =>
      new Date(a.scheduledAtUtc).toDateString() === selectedDate.toDateString(),
  );

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
              year: "numeric",
            })}
          </h3>
          <button onClick={nextMonth}>›</button>
        </div>

        <div className={styles.grid}>
          {["ح", "ن", "ث", "ر", "خ", "ج", "س"].map((d, i) => (
            <div key={i} className={styles.dayName}>
              {d}
            </div>
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
            <select
              value={childId}
              onChange={(e) => setChildId(Number(e.target.value))}
            >
              <option value="">اختر الطفل</option>
              {children.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.fullName}
                </option>
              ))}
            </select>

            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
            />

            <input
              type="number"
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
            />

            <input value={notes} onChange={(e) => setNotes(e.target.value)} />

            <div className={styles.actions}>
              <button onClick={handleSubmit}>حفظ</button>
              <button className={styles.cancel} onClick={handleCancel}>
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      <div className={styles.list}>
        {filteredAppointments.map((a) => (
          <div key={a.id} className={styles.card}>
            <div>
              <h4>{a.notes || "جلسة"}</h4>
              <p>{a.childName}</p>

              <p>{new Date(a.scheduledAtUtc).toLocaleDateString("ar-EG")}</p>
            </div>

            <div className={styles.cardActions}>
              <span>
                {new Date(a.scheduledAtUtc).toLocaleTimeString("ar-EG", {
                  hour: "numeric",
                  minute: "2-digit",
                  hour12: true,
                })}
              </span>

              {a.status === 1 && (
                <>
                  <button onClick={() => handleEdit(a)}>تعديل</button>
                  <button onClick={() => handleCancelAppointment(a.id)}>
                    إلغاء
                  </button>
                  <button onClick={() => handleCompleteAppointment(a.id)}>
                    إنهاء
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default SpecialistAppointments;
