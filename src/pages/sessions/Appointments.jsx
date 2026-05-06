import styles from "../../assets/dashboard.module.css";
import sessionStyles from "../../assets/sessions.module.css";
import { useState, useMemo } from "react";
import { useApp } from "../../Context/AppContext";
import { useSearchParams } from "react-router-dom";

function Sessions() {
  const { sessions = [], appointments = [], loading } = useApp();

  const [params] = useSearchParams();
  const sessionId = params.get("sessionId");
  const appointmentId = params.get("appointmentId");

  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(new Date().getDate());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const monthNames = [
    "يناير",
    "فبراير",
    "مارس",
    "أبريل",
    "مايو",
    "يونيو",
    "يوليو",
    "أغسطس",
    "سبتمبر",
    "أكتوبر",
    "نوفمبر",
    "ديسمبر",
  ];

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
    setSelectedDay(1);
  };

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
    setSelectedDay(1);
  };

  const getStatus = (a) => {
    switch (a.status) {
      case 1:
        return { text: "قادم", color: "#2196F3" };
      case 2:
        return { text: "تم التعديل", color: "#FF9800" };
      case 3:
        return { text: "ملغي", color: "gray" };
      case 4:
        return { text: "مكتمل", color: "green" };
      case 5:
        return { text: "فات", color: "red" };
      default:
        return { text: "", color: "black" };
    }
  };

  const isPast = (date) => new Date(date).getTime() < Date.now();
  const mergedData = useMemo(
    () => [
      ...appointments.map((a) => ({
        id: a.id,
        type: "appointment",
        title: "جلسة علاج طبيعي",
        doctor: a.specialistName || "أخصائي",
        time: a.scheduledAtUtc,
        status: a.status,
        raw: a,
      })),
      ...sessions.map((s) => ({
        id: s.id,
        type: "session",
        title: "جلسة تمرين",
        doctor: "تمرين",
        time: s.startedAtUtc || s.createdAtUtc,
      })),
    ],
    [appointments, sessions],
  );

  const filteredData = useMemo(() => {
    return mergedData
      .filter((item) => {
        if (!item.time) return false;
        const d = new Date(item.time);
        return (
          d.getFullYear() === year &&
          d.getMonth() === month &&
          d.getDate() === selectedDay
        );
      })
      .sort((a, b) => new Date(a.time) - new Date(b.time));
  }, [mergedData, selectedDay, month, year]);

  const nextAppointment = useMemo(() => {
    return appointments
      .filter(
        (a) =>
          (a.status === 1 || a.status === 2) &&
          new Date(a.scheduledAtUtc).getTime() > Date.now(),
      )
      .sort(
        (a, b) => new Date(a.scheduledAtUtc) - new Date(b.scheduledAtUtc),
      )[0];
  }, [appointments]);

  let timeLeft = "لا يوجد مواعيد قادمة";

  if (nextAppointment) {
    const diff =
      new Date(nextAppointment.scheduledAtUtc).getTime() - Date.now();
    const minutes = Math.floor(diff / (1000 * 60));

    if (minutes > 60) {
      timeLeft = `متبقي ${Math.floor(minutes / 60)} ساعة`;
    } else if (minutes > 0) {
      timeLeft = `متبقي ${minutes} دقيقة`;
    } else {
      timeLeft = "جاري الآن";
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
                  {new Date(nextAppointment.scheduledAtUtc).toLocaleTimeString(
                    "ar-EG",
                    {
                      hour: "2-digit",
                      minute: "2-digit",
                    },
                  )}
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
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <button onClick={prevMonth}>◀</button>
              <h4>
                {monthNames[month]} {year}
              </h4>
              <button onClick={nextMonth}>▶</button>
            </div>

            <div className={sessionStyles.calendarBox}>
              {days.map((d) => (
                <div
                  key={d}
                  onClick={() => setSelectedDay(d)}
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

            {loading && filteredData.length === 0 ? (
              <p>Loading...</p>
            ) : filteredData.length === 0 ? (
              <div className={sessionStyles.emptyBox}>لا توجد مواعيد</div>
            ) : (
              filteredData.map((item) => {
                const isActive =
                  (item.type === "session" && item.id === Number(sessionId)) ||
                  (item.type === "appointment" &&
                    item.id === Number(appointmentId));

                let statusUI = null;

                if (item.type === "appointment") {
                  const status = getStatus(item.raw);

                  const fallbackMissed =
                    (item.raw.status === 1 || item.raw.status === 2) &&
                    isPast(item.time);

                  statusUI = fallbackMissed
                    ? { text: "فات", color: "red" }
                    : status;
                }

                return (
                  <div
                    key={item.id}
                    className={`${styles.card} ${sessionStyles.sessionItem}`}
                    style={{
                      border: isActive ? "2px solid #4CAF50" : "",
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
                          minute: "2-digit",
                        })}
                      </p>

                      {statusUI && (
                        <small style={{ color: statusUI.color }}>
                          {statusUI.text}
                        </small>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Sessions;
