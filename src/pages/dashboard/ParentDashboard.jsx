import { useState } from "react";

import styles from "../../assets/dashboard.module.css";

import { FaPlay } from "react-icons/fa";

import { useNavigate } from "react-router-dom";

import toast from "react-hot-toast";

import { useApp } from "../../Context/AppContext";

import { getTreatmentPlans } from "../../api/treatmentPlansService";

import { getSessionsByChild } from "../../api/sessionsService";

function ParentDashboard() {
  const navigate = useNavigate();

  const { data } = useApp();

  const [starting, setStarting] = useState(false);

  const children = data?.children || [];

  const appointments = data?.upcomingAppointments || [];

  const overview = data?.overview || {};

  const now = new Date();

  const upcomingAppointments = appointments
    .filter((a) => new Date(a.scheduledAtUtc) > now && a.status !== 3)
    .sort((a, b) => new Date(a.scheduledAtUtc) - new Date(b.scheduledAtUtc));

  const appointment = upcomingAppointments[0];

  const child = children[0];

  let day = "";
  let month = "";
  let time = "";
  let isToday = false;

  if (appointment?.scheduledAtUtc) {
    const date = new Date(appointment.scheduledAtUtc);

    day = date.getDate();

    month = date.toLocaleString("ar-EG", {
      month: "short",
    });

    time = date.toLocaleTimeString("ar-EG", {
      hour: "2-digit",
      minute: "2-digit",
    });

    isToday = date.toDateString() === new Date().toDateString();
  }

  const hasAiResult =
    child?.averageAccuracyScore !== null &&
    child?.averageAccuracyScore !== undefined;

  const score = hasAiResult
    ? Math.min(100, Math.max(0, child.averageAccuracyScore))
    : null;

  const getLevel = (score) => {
    if (score === null) return "جاري التحليل ⏳";

    if (score >= 90) return "ممتاز 🔥";

    if (score >= 80) return "جيد جدًا 👌";

    if (score >= 70) return "جيد 🙂";

    if (score >= 50) return "مقبول 😐";

    return "ضعيف ❌";
  };

  const getColor = (score) => {
    if (score === null) return "#94a3b8";

    if (score >= 80) return "#22c55e";

    if (score >= 60) return "#eab308";

    return "#ef4444";
  };

  const handleStartSession = async () => {
    if (!child?.childId) {
      toast.error("لا يوجد طفل ❌");
      return;
    }

    try {
      setStarting(true);

      const plansRes = await getTreatmentPlans(child.childId);

      const plans = plansRes?.items || [];

      if (plans.length === 0) {
        toast.error("لا توجد خطط علاجية ❌");
        return;
      }

      const allExercises = plans.flatMap((plan) =>
        (plan.exercises || []).map((ex) => ({
          ...ex,
          treatmentPlanExerciseId: ex.id,
          planId: plan.id,
        })),
      );

      if (allExercises.length === 0) {
        toast.error("لا توجد تمارين ❌");
        return;
      }

      const sessionsRes = await getSessionsByChild(child.childId);

      const sessions = sessionsRes?.items || [];

      const completedIds = sessions
        .filter((s) => [2, 3, 4].includes(Number(s.status)))
        .map((s) => Number(s.treatmentPlanExerciseId));

      const remainingExercise = allExercises.find(
        (ex) => !completedIds.includes(Number(ex.treatmentPlanExerciseId)),
      );

      if (!remainingExercise) {
        toast.success("تم إنهاء جميع التمارين ✅");
        return;
      }

      navigate(`/dashboard/exercises/${remainingExercise.exerciseId}`, {
        state: {
          treatmentPlanExerciseId: remainingExercise.treatmentPlanExerciseId,
        },
      });
    } catch (err) {
      console.log(err);

      const errorMsg =
        err?.response?.data?.errors?.[0] ||
        err?.response?.data?.title ||
        "فشل بدء التمرين ❌";

      toast.error(errorMsg);
    } finally {
      setStarting(false);
    }
  };

  return (
    <>
      <div className={styles.hero}>
        <div className={styles.heroRight}>
          <span className={styles.tag}>
            {appointment
              ? isToday
                ? "جلسة اليوم"
                : "جلسة قادمة"
              : "لا يوجد جلسات"}
          </span>

          <h2>جاهز للتمرين؟</h2>

          <p>بقت خطوة واحدة لإكمال الهدف!</p>

          <div className={styles.heroBtns}>
            <button
              className={styles.outlineBtn}
              onClick={() => {
                if (appointment) {
                  navigate(
                    `/dashboard/appointments?appointmentId=${appointment.appointmentId}`,
                  );
                } else {
                  toast.error("لا يوجد جلسة حالياً ❌");
                }
              }}
            >
              تفاصيل الجلسة
            </button>

            <button
              className={styles.startBtn}
              onClick={handleStartSession}
              disabled={starting}
            >
              {starting ? (
                "جاري البدء..."
              ) : (
                <>
                  <FaPlay /> ابدأ التمرين
                </>
              )}
            </button>
          </div>
        </div>

        <div className={styles.heroLeft}>
          <div
            className={styles.progressCircle}
            style={{
              color: getColor(score),
            }}
          >
            {score === null ? "..." : `${score}%`}
          </div>

          {score === null && (
            <p
              style={{
                marginTop: "10px",
                color: "#94a3b8",
                fontWeight: "700",
                fontSize: "14px",
                textAlign: "center",
              }}
            >
              جاري التحليل ⏳
            </p>
          )}
        </div>
      </div>

      <div className={styles.cards}>
        <div className={styles.card}>
          <h4>إنجازات الأسبوع</h4>

          <div className={styles.taskDone}>
            جلسات مكتملة: {overview?.totalCompletedSessions || 0}
          </div>

          <span
            className={styles.viewAll}
            onClick={() => navigate("/dashboard/reports")}
          >
            عرض كل الإنجازات
          </span>
        </div>

        <div className={styles.card}>
          <h4>الموعد القادم</h4>

          {appointment ? (
            <>
              <div className={styles.appointment}>
                <div>
                  <h5>{appointment.specialistName}</h5>

                  <p>{time}</p>
                </div>

                <div className={styles.dateBox}>
                  <span>{month}</span>

                  <strong>{day}</strong>
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  gap: "10px",
                  marginTop: "10px",
                }}
              >
                <button
                  className={styles.confirmBtn}
                  onClick={() =>
                    navigate(
                      `/dashboard/appointments?appointmentId=${appointment.appointmentId}`,
                    )
                  }
                >
                  عرض الجلسة
                </button>

                <button
                  className={styles.startBtn}
                  onClick={() => toast.success("تم تأكيد حضور الجلسة ✅")}
                >
                  تأكيد الحضور
                </button>
              </div>
            </>
          ) : (
            <p>لا يوجد موعد</p>
          )}
        </div>

        <div className={styles.card}>
          <h4>{child ? child.childName : "لا يوجد طفل"}</h4>

          {child && (
            <>
              <div className={styles.childInfo}>
                <span>{child.specialistName}</span>

                <span>تقارير: {child.reportsCount}</span>
              </div>

              <div className={styles.progressBar}>
                <div
                  className={styles.progressFill}
                  style={{
                    width: score === null ? "0%" : `${score}%`,
                    backgroundColor: getColor(score),
                  }}
                />
              </div>

              <span
                className={styles.good}
                style={{
                  color: getColor(score),
                }}
              >
                {getLevel(score)}
              </span>
            </>
          )}

          <span
            className={styles.viewAll}
            onClick={() => navigate("/dashboard/profile")}
          >
            عرض الملف الكامل
          </span>
        </div>
      </div>
    </>
  );
}

export default ParentDashboard;
