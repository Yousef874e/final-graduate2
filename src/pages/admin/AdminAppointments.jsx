import "../../assets/adminAppointments.css";
import { useEffect, useState } from "react";

import {
  getAppointmentsByChildId,
  cancelAppointment,
  completeAppointment,
} from "../../api/appointmentsService";

import { getChildren } from "../../api/childrenService";

import toast from "react-hot-toast";

export default function AdminAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [children, setChildren] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [loading, setLoading] = useState(false);
  const [selectedChildId, setSelectedChildId] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const c = await getChildren();
      const kids = c.items || [];
      setChildren(kids);

      const requests = kids.map((child) =>
        getAppointmentsByChildId(child.id, {
          pageNumber: 1,
          pageSize: 50,
        }),
      );

      const results = await Promise.all(requests);
      const allAppointments = results.flatMap((r) => r.items || []);

      allAppointments.sort(
        (a, b) => new Date(a.scheduledAtUtc) - new Date(b.scheduledAtUtc),
      );

      setAppointments(allAppointments);
    } catch {
      toast.error("فشل تحميل البيانات ❌");
    } finally {
      setLoading(false);
    }
  };

  const getDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const days = [];

    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }

    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }

    return days;
  };

  const getChildName = (childId) => {
    const child = children.find(c => c.id === childId);
    return child ? child.fullName : "طفل غير معروف";
  };

  const filtered = appointments.filter((a) => {
    const childMatch = selectedChildId ? a.childId === Number(selectedChildId) : true;
    const statusMatch = statusFilter === "all" ? true : a.status === Number(statusFilter);
    return childMatch && statusMatch;
  });

  const handleCancel = async (appointment) => {
    if (appointment.status !== 0) {
      toast.error("لا يمكن إلغاء هذا الموعد ❌");
      return;
    }

    try {
      await cancelAppointment(appointment.id);
      toast.success("تم الإلغاء ✅");
      loadData();
    } catch {
      toast.error("فشل الإلغاء ❌");
    }
  };

  const handleComplete = async (appointment) => {
    if (appointment.status !== 0) {
      toast.error("لا يمكن إنهاء هذا الموعد ❌");
      return;
    }

    try {
      await completeAppointment(appointment.id);
      toast.success("تم إنهاء الجلسة ✅");
      loadData();
    } catch {
      toast.error("فشل إنهاء الجلسة ❌");
    }
  };

  const prevMonth = () => {
    setCurrentMonth(
      (prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1),
    );
  };

  const nextMonth = () => {
    setCurrentMonth(
      (prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1),
    );
  };

  const getStatusText = (status) => {
    if (status === 0) return "قيد الانتظار";
    if (status === 1) return "مكتمل";
    if (status === 2) return "ملغي";
    return "غير معروف";
  };

  const handleChildChange = (e) => {
    setSelectedChildId(e.target.value);
  };

  return (
    <div className="appointments">
      <div className="header">
        <h2>الجدول الزمني - لوحة المشرف</h2>
       
      </div>

      <div className="filters">
        <select value={selectedChildId} onChange={handleChildChange}>
          <option value="">كل الأطفال</option>
          {children.map((c) => (
            <option key={c.id} value={c.id}>
              {c.fullName}
            </option>
          ))}
        </select>

        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="all">كل الحالات</option>
          <option value="0">قيد الانتظار</option>
          <option value="1">مكتمل</option>
          <option value="2">ملغي</option>
        </select>

        <button className="refresh-btn" onClick={loadData}>تحديث</button>
      </div>

      {loading && <div className="loading">جاري التحميل...</div>}

      <div className="cards">
        {filtered.length === 0 ? (
          <p className="empty">لا يوجد مواعيد</p>
        ) : (
          filtered.map((a) => {
            const time = new Date(a.scheduledAtUtc);
            return (
              <div className="card" key={a.id}>
                <h3>{a.notes || "جلسة"}</h3>
                <p>👶 {getChildName(a.childId)}</p>
                <p>
                  ⏰ {time.toLocaleTimeString("ar-EG", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
                <p>⏱️ {a.durationMinutes} دقيقة</p>
                <p>📌 الحالة: {getStatusText(a.status)}</p>

                <div className="actions">
                  {a.status === 0 && (
                    <>
                      <button onClick={() => handleCancel(a)}>إلغاء</button>
                      <button onClick={() => handleComplete(a)}>إنهاء</button>
                    </>
                  )}

                  {a.status === 1 && (
                    <span className="completed">مكتمل ✅</span>
                  )}

                  {a.status === 2 && (
                    <span className="cancelled">ملغي ❌</span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}