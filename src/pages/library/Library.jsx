import styles from "../../assets/dashboard.module.css";
import libraryStyles from "../../assets/library.module.css";

import { useEffect, useState } from "react";

import { getTreatmentPlans } from "../../api/treatmentPlansService";

import { getSessionsByChild, startSession } from "../../api/sessionsService";

import { getChildren } from "../../api/childrenService";

import { useNavigate } from "react-router-dom";

import toast from "react-hot-toast";

function Library() {
  const [plans, setPlans] = useState([]);

  const [sessions, setSessions] = useState([]);

  const [filtered, setFiltered] = useState([]);

  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);

      const childrenRes = await getChildren();

      const child = childrenRes?.items?.[0];

      if (!child) {
        setPlans([]);

        setSessions([]);

        setFiltered([]);

        return;
      }

      const childId = child.id;

      const [planRes, sessionRes] = await Promise.all([
        getTreatmentPlans(childId),

        getSessionsByChild(childId),
      ]);

      const plansData = planRes?.items || [];

      setPlans(plansData);

      setSessions(sessionRes?.items || []);

      const exercises = plansData.flatMap((p) =>
        (p.exercises || []).map((ex) => ({
          ...ex,

          planTitle: p.title,

          startDate: p.startDate,

          endDate: p.endDate,
        })),
      );

      setFiltered(exercises);
    } catch (err) {
      console.error(err);

      toast.error("فشل تحميل البيانات ❌");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let exercises = plans.flatMap((p) =>
      (p.exercises || []).map((ex) => ({
        ...ex,

        planTitle: p.title,

        startDate: p.startDate,

        endDate: p.endDate,
      })),
    );

    if (search) {
      exercises = exercises.filter((item) =>
        item.exerciseName?.toLowerCase().includes(search.toLowerCase()),
      );
    }

    setFiltered(exercises);
  }, [search, plans]);

  const completedExercises = new Set(
    sessions
      .filter((s) => s.status === 5)
      .map((s) => s.treatmentPlanExerciseId),
  );

  const isCompleted = (id) => {
    return completedExercises.has(id);
  };

  const completedCount = filtered.filter((ex) =>
    completedExercises.has(ex.id),
  ).length;

  const progress = filtered.length
    ? Math.round((completedCount / filtered.length) * 100)
    : 0;

  const startExercise = async (item) => {
    try {
      const childrenRes = await getChildren();

      const child = childrenRes?.items?.[0];

      if (!child) {
        toast.error("لا يوجد طفل ❌");

        return;
      }

      const session = await startSession({
        childId: child.id,

        exerciseId: item.exerciseId,

        treatmentPlanExerciseId: item.id,
      });

      navigate(`/dashboard/exercises/${item.exerciseId}`, {
        state: {
          sessionId: session.id,

          treatmentPlanExerciseId: item.id,
        },
      });
    } catch (err) {
      console.log(err);

      toast.error("فشل بدء الجلسة ❌");
    }
  };

  return (
    <div
      style={{
        padding: "24px",
      }}
    >
      <h2 className={styles.pageTitle}>التمارين</h2>

      <input
        type="text"
        placeholder="ابحث عن تمرين..."
        className={libraryStyles.search}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <div className={libraryStyles.progressBox}>
        <div className={libraryStyles.progressHeader}>
          <div className={libraryStyles.progressTitle}>تقدم التمارين</div>

          <div className={libraryStyles.progressPercent}>{progress}%</div>
        </div>

        <div className={libraryStyles.progressBar}>
          <div
            className={libraryStyles.progressFill}
            style={{
              width: `${progress}%`,
            }}
          />
        </div>
      </div>

      {loading ? (
        <div className={libraryStyles.loading}>جاري التحميل...</div>
      ) : filtered.length === 0 ? (
        <div className={libraryStyles.empty}>لا يوجد تمارين</div>
      ) : (
        <div className={libraryStyles.grid}>
          {filtered.map((item) => {
            const completed = isCompleted(item.id);

            return (
              <div key={item.id} className={libraryStyles.card}>
                <div className={libraryStyles.imageBox}>
                  <img
                    src={item.mediaThumbnailUrl || "/default.png"}
                    onError={(e) => {
                      e.target.style.display = "none";
                    }}
                    alt=""
                    className={libraryStyles.image}
                  />

                  <div className={libraryStyles.playOverlay}>▶</div>
                </div>

                <h4>{item.exerciseName}</h4>

                <p className={libraryStyles.desc}>تمرين علاجي مخصص للطفل</p>

                <p className={libraryStyles.date}>
                  من {item.startDate?.split("T")[0]} إلى{" "}
                  {item.endDate?.split("T")[0]}
                </p>

                <div className={libraryStyles.infoBox}>
                  <div className={libraryStyles.infoItem}>
                    العدات: {item.expectedReps}
                  </div>

                  <div className={libraryStyles.infoItem}>
                    الجولات: {item.sets}
                  </div>

                  <div className={libraryStyles.infoItem}>
                    يومياً: {item.dailyFrequency}
                  </div>
                </div>

                <button
                  className={
                    completed ? libraryStyles.doneBtn : styles.startBtn
                  }
                  onClick={() => !completed && startExercise(item)}
                >
                  {completed ? "مكتمل" : "ابدأ التمرين"}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default Library;
