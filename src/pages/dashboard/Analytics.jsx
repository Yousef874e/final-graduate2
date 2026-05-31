import { useState, useEffect } from "react";
import styles from "../../assets/dashboard.module.css";
import analyticsStyles from "../../assets/analytics.module.css";
import { useNavigate, useLocation } from "react-router-dom";
import toast from "react-hot-toast";
import { useApp } from "../../Context/AppContext";
import { getTreatmentPlans } from "../../api/treatmentPlansService";
import { getSessionsByChild } from "../../api/sessionsService";
import { getMedicalReports } from "../../api/medicalReportsService";
import { getChildImage } from "../../api/childrenService";

function Analytics() {
  const navigate = useNavigate();
  const location = useLocation();

  const [loading, setLoading] = useState(false);
  const [plans, setPlans] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [reports, setReports] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [showDateModal, setShowDateModal] = useState(false);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [globalAverage, setGlobalAverage] = useState(null);
  const [childImage, setChildImage] = useState(null);
  const [allPlans, setAllPlans] = useState([]);
  const [allReports, setAllReports] = useState([]);
  const [hasData, setHasData] = useState(false);
  const [selectedPlanStats, setSelectedPlanStats] = useState(null);

 const appContext = useApp();

const { data } = appContext;

const userRole = appContext?.role || "parent";
const isSpecialist = userRole === "Specialist";

const children = isSpecialist
  ? data?.childrenSnapshot || []
  : data?.children || [];
  const childIdFromState = location.state?.childId;
  const childNameFromState = location.state?.childName;

  let selectedChildId = null;

  if (isSpecialist && childIdFromState) {
    selectedChildId = childIdFromState;
  } else if (!isSpecialist && children.length > 0) {
    selectedChildId = children[0]?.childId;
  } else if (!isSpecialist && childIdFromState) {
    selectedChildId = childIdFromState;
  } else if (children.length > 0 && !selectedChildId) {
    selectedChildId = children[0]?.childId;
  }
console.log("children", children);
console.log("selectedChildId", selectedChildId);
  const currentChild =
    children.find((child) => child.childId === selectedChildId) || null;
    console.log(
  "currentChild",
  children.find((child) => child.childId === selectedChildId)
);

  useEffect(() => {
    if (selectedChildId) {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - 1);
      setFromDate(startDate.toISOString().split("T")[0]);
      setToDate(endDate.toISOString().split("T")[0]);
      fetchDataByDate();
      loadChildImage();
    }
  }, [selectedChildId]);

  const loadChildImage = async () => {
    if (!selectedChildId) return;
    try {
      const imageData = await getChildImage(selectedChildId);
      setChildImage(imageData?.url || null);
    } catch (err) {
      setChildImage(null);
    }
  };

  const calculatePlanStats = (plan) => {
    const planExerciseIds = (plan.exercises || []).map((e) => Number(e.id));
    const planSessions = sessions.filter(
      (s) =>
        planExerciseIds.includes(Number(s.treatmentPlanExerciseId)) &&
        s.result?.accuracyScore != null,
    );

    if (!planSessions.length)
      return {
        avgScore: null,
        totalMistakes: 0,
        totalRepetitions: 0,
        avgMistakesPerSession: 0,
        avgRepetitionsPerSession: 0,
        sessionsCount: 0,
      };

    const avg =
      planSessions.reduce(
        (sum, s) => sum + Number(s.result.accuracyScore),
        0,
      ) / planSessions.length;
    const totalMistakes = planSessions.reduce(
      (sum, s) => sum + (s.result?.mistakeCount || 0),
      0,
    );
    const totalRepetitions = planSessions.reduce(
      (sum, s) => sum + (s.result?.repetitionCount || 0),
      0,
    );
    const avgMistakesPerSession = totalMistakes / planSessions.length;
    const avgRepetitionsPerSession = totalRepetitions / planSessions.length;

    return {
      avgScore: Math.round(avg),
      totalMistakes,
      totalRepetitions,
      avgMistakesPerSession,
      avgRepetitionsPerSession,
      sessionsCount: planSessions.length,
    };
  };

  const fetchDataByDate = async () => {
    if (!selectedChildId) {
      toast.error("لا يوجد طفل مرتبط بالحساب");
      return;
    }

    if (!fromDate && !toDate) {
      toast.error("يرجى تحديد التاريخ");
      return;
    }

    setLoading(true);
    setHasData(false);

    try {
      const [plansRes, sessionsRes, reportsRes] = await Promise.all([
        getTreatmentPlans(selectedChildId),
        getSessionsByChild(selectedChildId),
        getMedicalReports(selectedChildId),
      ]);

      let allPlansData = plansRes?.items || [];
      const sessionsData = sessionsRes?.items || [];
      let allReportsData = reportsRes?.items || [];

      let filteredPlans = [...allPlansData];
      let filteredReports = [...allReportsData];

      if (fromDate) {
        const from = new Date(fromDate);
        from.setHours(0, 0, 0, 0);

        filteredPlans = filteredPlans.filter(
          (plan) => new Date(plan.startDate) >= from,
        );
        filteredReports = filteredReports.filter(
          (report) => new Date(report.createdAtUtc || report.createdAt) >= from,
        );
      }

      if (toDate) {
        const to = new Date(toDate);
        to.setHours(23, 59, 59, 999);

        filteredPlans = filteredPlans.filter(
          (plan) => new Date(plan.endDate) <= to,
        );
        filteredReports = filteredReports.filter(
          (report) => new Date(report.createdAtUtc || report.createdAt) <= to,
        );
      }

      setAllPlans(allPlansData);
      setAllReports(allReportsData);
      setPlans(filteredPlans);
      setReports(filteredReports);
      setSessions(sessionsData);

      if (filteredPlans.length > 0 || filteredReports.length > 0) {
        setHasData(true);
        if (filteredPlans.length > 0) {
          setSelectedPlan(filteredPlans[0]);
          calculateGlobalAverage(filteredPlans, sessionsData);
          const stats = calculatePlanStats(filteredPlans[0]);
          setSelectedPlanStats(stats);
        } else {
          setSelectedPlan(null);
          setGlobalAverage(null);
          setSelectedPlanStats(null);
        }
      } else {
        setHasData(false);
        setSelectedPlan(null);
        setGlobalAverage(null);
        setSelectedPlanStats(null);
        toast("لا توجد بيانات في الفترة المحددة", { icon: "📭" });
      }

      setShowDateModal(false);
    } catch (err) {
      console.error(err);
      toast.error("فشل تحميل البيانات ❌");
    } finally {
      setLoading(false);
    }
  };

  const calculateGlobalAverage = (plansList, sessionsList) => {
    let allScores = [];
    plansList.forEach((plan) => {
      const planExerciseIds = (plan.exercises || []).map((e) => Number(e.id));
      const planSessions = sessionsList.filter(
        (s) =>
          planExerciseIds.includes(Number(s.treatmentPlanExerciseId)) &&
          s.result?.accuracyScore != null,
      );
      planSessions.forEach((session) => {
        allScores.push(Number(session.result.accuracyScore));
      });
    });
    if (allScores.length === 0) {
      setGlobalAverage(null);
      return;
    }
    const avg =
      allScores.reduce((sum, score) => sum + score, 0) / allScores.length;
    setGlobalAverage(Math.round(avg));
  };

  const calculateCompletedExercises = (plan) => {
    const planExerciseIds = (plan.exercises || []).map((e) => Number(e.id));
    const completedIds = sessions
      .filter((s) => [2, 3, 4].includes(Number(s.status)))
      .map((s) => Number(s.treatmentPlanExerciseId));
    const completed = planExerciseIds.filter((id) =>
      completedIds.includes(id),
    ).length;
    const total = planExerciseIds.length;
    return {
      completed,
      total,
      percentage: total ? Math.round((completed / total) * 100) : 0,
    };
  };

  const formatDate = (dateString) => {
    if (!dateString) return "—";
    const date = new Date(dateString);
    return date.toLocaleDateString("ar-EG", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getScoreColor = (score) => {
    if (score === null) return "#94a3b8";
    if (score >= 90) return "#10b981";
    if (score >= 75) return "#3b82f6";
    if (score >= 60) return "#f59e0b";
    if (score >= 45) return "#f97316";
    return "#ef4444";
  };

  const getScoreLevel = (score) => {
    if (score === null) return "لم يبدأ بعد";
    if (score >= 95) return "متميز";
    if (score >= 85) return "ممتاز";
    if (score >= 75) return "جيد جداً";
    if (score >= 65) return "جيد";
    if (score >= 50) return "مقبول";
    return "يحتاج تحسين";
  };

  const getImprovementText = (percentage) => {
    if (percentage >= 30) return "تحسن ممتاز 🎉";
    if (percentage >= 15) return "تحسن جيد 👌";
    if (percentage >= 5) return "تحسن بسيط 📈";
    if (percentage > 0) return "تحسن طفيف ↗️";
    if (percentage === 0) return "لا تغيير ➡️";
    if (percentage >= -10) return "تراجع طفيف ↘️";
    if (percentage >= -20) return "تراجع ملحوظ 📉";
    return "تراجع كبير ⚠️";
  };

  const getRemainingText = (completed, total) => {
    const remaining = total - completed;
    if (remaining === 0) return "✅ مكتمل بالكامل";
    if (remaining === 1) return `⏳ متبقي تمرين واحد`;
    if (remaining <= 3) return `⏳ متبقي ${remaining} تمارين`;
    return `⏳ متبقي ${remaining} تمرين`;
  };

  if (loading) {
    return (
      <div className={analyticsStyles.loading}>جاري تحميل البيانات...</div>
    );
  }
console.log("userRole =", userRole);
console.log("isSpecialist =", isSpecialist);
  if (!currentChild && selectedChildId && !isSpecialist) {
  return (
    <div className={analyticsStyles.emptyState}>
        <div className={analyticsStyles.emptyIcon}>👶</div>
        <h3>الطفل غير موجود</h3>
        <p>عذراً، لم نتمكن من العثور على بيانات هذا الطفل</p>
        <button
          className={analyticsStyles.primaryBtn}
          onClick={() =>
            isSpecialist
              ? navigate("/dashboard/specialist/patients")
              : navigate("/dashboard/parent")
          }
        >
          العودة
        </button>
      </div>
    );
  }

  return (
    <div className={analyticsStyles.container}>
      <div className={analyticsStyles.header}>
        <h2>📊 التقارير والتحليلات</h2>
        <button
          className={analyticsStyles.filterBtn}
          onClick={() => setShowDateModal(true)}
        >
          📅 تحديد الفترة
        </button>
      </div>

      {currentChild && (
        <div className={analyticsStyles.childInfo}>
          <div className={analyticsStyles.childAvatar}>
            {childImage ? (
              <img
                src={childImage}
                alt={currentChild.childName}
                className={analyticsStyles.avatarImg}
              />
            ) : (
              <div className={analyticsStyles.avatarPlaceholder}>👶</div>
            )}
          </div>
          <div className={analyticsStyles.childDetails}>
            <h3>{currentChild.childName}</h3>
            {hasData && (
              <div className={analyticsStyles.childStats}>
                <span className={analyticsStyles.childStat}>
                  📋 {reports.length} تقرير
                </span>
                <span className={analyticsStyles.childStat}>
                  📋 {plans.length} خطة
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {!hasData ? (
        <div className={analyticsStyles.emptyState}>
          <div className={analyticsStyles.emptyIcon}>📅</div>
          <h3>لا توجد بيانات معروضة</h3>
          <p>يرجى تحديد الفترة الزمنية لعرض التقارير والخطط</p>
          <button
            className={analyticsStyles.primaryBtn}
            onClick={() => setShowDateModal(true)}
          >
            تحديد الفترة الآن
          </button>
        </div>
      ) : (
        <>
          <div className={analyticsStyles.filterBadge}>
            📅 {fromDate && formatDate(fromDate)} —{" "}
            {toDate && formatDate(toDate)}
          </div>

          <div className={analyticsStyles.globalAverage}>
            <h3>📈 متوسط الأداء العام</h3>
            <div className={analyticsStyles.averageCircle}>
              <svg
                className={analyticsStyles.circularChart}
                viewBox="0 0 180 180"
              >
                <circle
                  className={analyticsStyles.circleBg}
                  cx="90"
                  cy="90"
                  r="78"
                />
                <circle
                  className={analyticsStyles.circleFill}
                  cx="90"
                  cy="90"
                  r="78"
                  stroke={getScoreColor(globalAverage)}
                  strokeDasharray={`${2 * Math.PI * 78}`}
                  strokeDashoffset={
                    globalAverage !== null
                      ? 2 * Math.PI * 78 * (1 - globalAverage / 100)
                      : 2 * Math.PI * 78
                  }
                />
              </svg>
              <div
                className={analyticsStyles.averageValue}
                style={{ color: getScoreColor(globalAverage) }}
              >
                {globalAverage !== null ? `${globalAverage}%` : "—"}
              </div>
            </div>
            <div
              className={analyticsStyles.averageLevel}
              style={{ color: getScoreColor(globalAverage) }}
            >
              {getScoreLevel(globalAverage)}
            </div>
          </div>

          {plans.length > 0 && (
            <div className={analyticsStyles.plansSection}>
              <h3>📋 الخطط العلاجية</h3>

              <div className={analyticsStyles.plansTabs}>
                {plans.map((plan) => {
                  const stats = calculatePlanStats(plan);
                  const avgScore = stats?.avgScore || null;
                  const { completed, total, percentage } =
                    calculateCompletedExercises(plan);

                  return (
                    <div
                      key={plan.id}
                      className={`${analyticsStyles.planTab} ${selectedPlan?.id === plan.id ? analyticsStyles.active : ""}`}
                      onClick={() => {
                        setSelectedPlan(plan);
                        setSelectedPlanStats(calculatePlanStats(plan));
                      }}
                    >
                      <div className={analyticsStyles.planTabHeader}>
                        <h4>{plan.title}</h4>
                        <span
                          className={analyticsStyles.planScore}
                          style={{ color: getScoreColor(avgScore) }}
                        >
                          {avgScore !== null ? `${avgScore}%` : "—"}
                        </span>
                      </div>
                      <p className={analyticsStyles.planDate}>
                        {formatDate(plan.startDate)} →{" "}
                        {formatDate(plan.endDate)}
                      </p>
                      <div className={analyticsStyles.planProgress}>
                        <div className={analyticsStyles.progressBar}>
                          <div
                            className={analyticsStyles.progressFill}
                            style={{
                              width: `${percentage}%`,
                              backgroundColor: getScoreColor(avgScore || 0),
                            }}
                          />
                        </div>
                        <span className={analyticsStyles.progressText}>
                          {completed}/{total} تمرين -{" "}
                          {getRemainingText(completed, total)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {selectedPlan && selectedPlanStats && (
                <div className={analyticsStyles.planDetails}>
                  <div className={analyticsStyles.planDetailsHeader}>
                    <h3>{selectedPlan.title}</h3>
                    <p className={analyticsStyles.planPeriod}>
                      📅 {formatDate(selectedPlan.startDate)} -{" "}
                      {formatDate(selectedPlan.endDate)}
                    </p>
                  </div>

                  <div className={analyticsStyles.statsGrid}>
                    <div className={analyticsStyles.statCard}>
                      <div className={analyticsStyles.statIcon}>📊</div>
                      <div className={analyticsStyles.statLabel}>
                        نسبة الإنجاز
                      </div>
                      <div
                        className={analyticsStyles.statValue}
                        style={{
                          color: getScoreColor(selectedPlanStats.avgScore),
                        }}
                      >
                        {selectedPlanStats.avgScore !== null
                          ? `${selectedPlanStats.avgScore}%`
                          : "—"}
                      </div>
                      <div className={analyticsStyles.statSub}>
                        {getScoreLevel(selectedPlanStats.avgScore)}
                      </div>
                    </div>

                    <div className={analyticsStyles.statCard}>
                      <div className={analyticsStyles.statIcon}>✅</div>
                      <div className={analyticsStyles.statLabel}>
                        التمارين المكتملة
                      </div>
                      <div className={analyticsStyles.statValue}>
                        {calculateCompletedExercises(selectedPlan).completed}/
                        {calculateCompletedExercises(selectedPlan).total}
                      </div>
                      <div className={analyticsStyles.statSub}>
                        {getRemainingText(
                          calculateCompletedExercises(selectedPlan).completed,
                          calculateCompletedExercises(selectedPlan).total,
                        )}
                      </div>
                    </div>

                    <div className={analyticsStyles.statCard}>
                      <div className={analyticsStyles.statIcon}>📋</div>
                      <div className={analyticsStyles.statLabel}>
                        عدد التمارين
                      </div>
                      <div className={analyticsStyles.statValue}>
                        {selectedPlan.exercises?.length || 0}
                      </div>
                      <div className={analyticsStyles.statSub}>تمرين</div>
                    </div>

                    <div className={analyticsStyles.statCard}>
                      <div className={analyticsStyles.statIcon}>❌</div>
                      <div className={analyticsStyles.statLabel}>
                        إجمالي الأخطاء
                      </div>
                      <div className={analyticsStyles.statValue}>
                        {selectedPlanStats.totalMistakes || 0}
                      </div>
                      <div className={analyticsStyles.statSub}>
                        بمتوسط {selectedPlanStats.avgMistakesPerSession.toFixed(1)} لكل جلسة
                      </div>
                    </div>

                    <div className={analyticsStyles.statCard}>
                      <div className={analyticsStyles.statIcon}>🔄</div>
                      <div className={analyticsStyles.statLabel}>
                        إجمالي التكرارات
                      </div>
                      <div className={analyticsStyles.statValue}>
                        {selectedPlanStats.totalRepetitions || 0}
                      </div>
                      <div className={analyticsStyles.statSub}>
                        بمتوسط {selectedPlanStats.avgRepetitionsPerSession.toFixed(1)} لكل جلسة
                      </div>
                    </div>

                    <div className={analyticsStyles.statCard}>
                      <div className={analyticsStyles.statIcon}>📅</div>
                      <div className={analyticsStyles.statLabel}>
                        عدد الجلسات
                      </div>
                      <div className={analyticsStyles.statValue}>
                        {selectedPlanStats.sessionsCount || 0}
                      </div>
                      <div className={analyticsStyles.statSub}>
                        جلسة لهذه الخطة
                      </div>
                    </div>
                  </div>

                  {selectedPlanStats.totalRepetitions > 0 && (
                    <div className={analyticsStyles.errorsRepetitionsChart}>
                      <h4>📊 تحليل الأخطاء والتكرارات</h4>
                      <div className={analyticsStyles.chartBars}>
                        <div className={analyticsStyles.chartBar}>
                          <div className={analyticsStyles.barLabel}>
                            الأخطاء
                          </div>
                          <div className={analyticsStyles.barWrapper}>
                            <div
                              className={analyticsStyles.barFill}
                              style={{
                                width: `${Math.min((selectedPlanStats.totalMistakes / Math.max(selectedPlanStats.totalRepetitions, 1)) * 100, 100)}%`,
                                backgroundColor: "#ef4444",
                              }}
                            />
                          </div>
                          <span className={analyticsStyles.barValue}>
                            {selectedPlanStats.totalMistakes}
                          </span>
                        </div>
                        <div className={analyticsStyles.chartBar}>
                          <div className={analyticsStyles.barLabel}>
                            التكرارات
                          </div>
                          <div className={analyticsStyles.barWrapper}>
                            <div
                              className={analyticsStyles.barFillReps}
                              style={{ width: "100%", backgroundColor: "#10b981" }}
                            />
                          </div>
                          <span className={analyticsStyles.barValue}>
                            {selectedPlanStats.totalRepetitions}
                          </span>
                        </div>
                      </div>
                      <div className={analyticsStyles.ratioInfo}>
                        نسبة الأخطاء إلى التكرارات:{" "}
                        {(
                          (selectedPlanStats.totalMistakes /
                            selectedPlanStats.totalRepetitions) *
                          100
                        ).toFixed(1)}
                        %
                      </div>
                    </div>
                  )}

                  {selectedPlan.exercises?.length > 0 && (
                    <div className={analyticsStyles.exercisesList}>
                      <h4>📝 تمارين الخطة</h4>
                      <div className={analyticsStyles.exercisesGrid}>
                        {selectedPlan.exercises.map((ex, index) => {
                          const isCompleted = sessions
                            .filter((s) => [2, 3, 4].includes(Number(s.status)))
                            .some(
                              (s) =>
                                Number(s.treatmentPlanExerciseId) ===
                                Number(ex.id),
                            );
                          return (
                            <div
                              key={ex.id}
                              className={`${analyticsStyles.exerciseItem} ${isCompleted ? analyticsStyles.completed : ""}`}
                            >
                              <div className={analyticsStyles.exerciseName}>
                                {index + 1}. {ex.exerciseName}
                                {isCompleted && (
                                  <span
                                    className={analyticsStyles.completedBadge}
                                  >
                                    ✓
                                  </span>
                                )}
                              </div>
                              <div className={analyticsStyles.exerciseDetails}>
                                <span>🔄 {ex.sets} جولات</span>
                                <span>🔁 {ex.expectedReps} عدات</span>
                                <span>📅 {ex.dailyFrequency} يومياً</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          <div className={analyticsStyles.reportsSection}>
            <h3>📊 التقارير السابقة</h3>

            {reports.length === 0 ? (
              <div className={analyticsStyles.emptyReports}>
                <p>لا توجد تقارير في الفترة المحددة</p>
              </div>
            ) : (
              <div className={analyticsStyles.reportsGrid}>
                {reports.map((report) => {
                  const improvement = report.improvementPercentage || 0;
                  const isPositive = improvement >= 0;
                  const completedExercises =
                    report.completedExercisesCount || 0;
                  const totalExercises = report.totalExercisesCount || 0;
                  const remainingExercises =
                    totalExercises - completedExercises;

                  return (
                    <div key={report.id} className={analyticsStyles.reportCard}>
                      <div className={analyticsStyles.reportPeriod}>
                        <span>
                          📅{" "}
                          {formatDate(report.createdAtUtc || report.createdAt)}
                        </span>
                      </div>

                      <div className={analyticsStyles.reportStats}>
                        <div className={analyticsStyles.reportStat}>
                          <span>نوع التقرير</span>
                          <strong>{report.reportType || "طبي"}</strong>
                        </div>

                        <div className={analyticsStyles.reportStat}>
                          <span>الحالة</span>
                          <strong>{report.status || "مكتمل"}</strong>
                        </div>

                        {report.averageAccuracy !== undefined && (
                          <div className={analyticsStyles.reportStat}>
                            <span>متوسط الدقة</span>
                            <strong
                              style={{
                                color: getScoreColor(report.averageAccuracy),
                              }}
                            >
                              {report.averageAccuracy}%
                            </strong>
                          </div>
                        )}
                      </div>

                      <div className={analyticsStyles.improvementCard}>
                        <div className={analyticsStyles.improvementHeader}>
                          <span className={analyticsStyles.improvementIcon}>
                            {isPositive ? "📈" : "📉"}
                          </span>
                          <span>نسبة التحسن</span>
                        </div>
                        <div
                          className={analyticsStyles.improvementValue}
                          style={{ color: isPositive ? "#10b981" : "#ef4444" }}
                        >
                          {Math.abs(improvement)}%
                        </div>
                        <div className={analyticsStyles.improvementText}>
                          {getImprovementText(improvement)}
                        </div>
                      </div>

                      {totalExercises > 0 && (
                        <div className={analyticsStyles.exercisesProgress}>
                          <div className={analyticsStyles.progressInfo}>
                            <span>📋 التمارين المكتملة</span>
                            <strong>
                              {completedExercises}/{totalExercises}
                            </strong>
                          </div>
                          <div className={analyticsStyles.progressBar}>
                            <div
                              className={analyticsStyles.progressFill}
                              style={{
                                width: `${(completedExercises / totalExercises) * 100}%`,
                                backgroundColor: "#10b981",
                              }}
                            />
                          </div>
                          <div className={analyticsStyles.remainingInfo}>
                            {remainingExercises === 0
                              ? "🎉 جميع التمارين مكتملة"
                              : `⏳ متبقي ${remainingExercises} تمرين`}
                          </div>
                        </div>
                      )}

                      {report.summary && (
                        <div className={analyticsStyles.reportSummary}>
                          📝 {report.summary}
                        </div>
                      )}

                      {report.description && (
                        <div className={analyticsStyles.reportDescription}>
                          📄 {report.description}
                        </div>
                      )}

                      <div className={analyticsStyles.reportDate}>
                        🕐 آخر تحديث:{" "}
                        {formatDate(
                          report.updatedAtUtc ||
                            report.updatedAt ||
                            report.createdAtUtc ||
                            report.createdAt,
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}

      {showDateModal && (
        <div
          className={analyticsStyles.modalOverlay}
          onClick={() => setShowDateModal(false)}
        >
          <div
            className={analyticsStyles.modal}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={analyticsStyles.modalHeader}>
              <h3>📅 تحديد الفترة الزمنية</h3>
              <button
                className={analyticsStyles.closeBtn}
                onClick={() => setShowDateModal(false)}
              >
                ✕
              </button>
            </div>

            <div className={analyticsStyles.modalBody}>
              <div className={analyticsStyles.inputGroup}>
                <label>من تاريخ:</label>
                <input
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                />
              </div>

              <div className={analyticsStyles.inputGroup}>
                <label>إلى تاريخ:</label>
                <input
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                />
              </div>
            </div>

            <div className={analyticsStyles.modalFooter}>
              <button
                className={analyticsStyles.cancelBtn}
                onClick={() => setShowDateModal(false)}
              >
                إلغاء
              </button>
              <button
                className={analyticsStyles.applyBtn}
                onClick={fetchDataByDate}
              >
                تطبيق
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Analytics;