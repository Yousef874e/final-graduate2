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

  const currentChild =
    children.find((child) => child.childId === selectedChildId) || null;

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
    
    const planSessions = sessions.filter((s) => {
      if (!s.treatmentPlanExerciseId) return false;
      return planExerciseIds.includes(Number(s.treatmentPlanExerciseId));
    });
    
    const validSessions = planSessions.filter((s) => s.result?.accuracyScore != null);

    if (!validSessions.length)
      return {
        avgScore: null,
        totalMistakes: 0,
        totalRepetitions: 0,
        avgMistakesPerSession: 0,
        avgRepetitionsPerSession: 0,
        sessionsCount: 0,
        allSessionsCount: planSessions.length,
      };

    const avg =
      validSessions.reduce(
        (sum, s) => sum + Number(s.result.accuracyScore),
        0,
      ) / validSessions.length;
    const totalMistakes = validSessions.reduce(
      (sum, s) => sum + (s.result?.mistakeCount || 0),
      0,
    );
    const totalRepetitions = validSessions.reduce(
      (sum, s) => sum + (s.result?.repetitionCount || 0),
      0,
    );
    const avgMistakesPerSession = totalMistakes / validSessions.length;
    const avgRepetitionsPerSession = totalRepetitions / validSessions.length;

    return {
      avgScore: Math.round(avg),
      totalMistakes,
      totalRepetitions,
      avgMistakesPerSession,
      avgRepetitionsPerSession,
      sessionsCount: validSessions.length,
      allSessionsCount: planSessions.length,
    };
  };

  const calculateImprovementRate = (plan) => {
    const planExerciseIds = (plan.exercises || []).map((e) => Number(e.id));
    const planSessions = sessions
      .filter((s) => {
        if (!s.treatmentPlanExerciseId) return false;
        return planExerciseIds.includes(Number(s.treatmentPlanExerciseId));
      })
      .filter((s) => s.result?.accuracyScore != null)
      .sort((a, b) => new Date(a.sessionDate || a.createdAtUtc) - new Date(b.sessionDate || b.createdAtUtc));

    if (planSessions.length < 2) return null;

    const firstSession = planSessions[0];
    const lastSession = planSessions[planSessions.length - 1];

    const firstScore = firstSession.result?.accuracyScore || 0;
    const lastScore = lastSession.result?.accuracyScore || 0;

    if (firstScore === 0) return null;

    const improvement = ((lastScore - firstScore) / firstScore) * 100;
    return {
      percentage: Math.round(improvement),
      direction: improvement >= 0 ? "up" : "down",
      firstScore,
      lastScore,
    };
  };

  const fetchDataByDate = async () => {
    if (!selectedChildId) {
      toast.error("لا يوجد طفل مرتبط بالحساب");
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

      setAllPlans(allPlansData);
      setAllReports(allReportsData);
      setPlans(allPlansData);
      setSessions(sessionsData);
      setReports(allReportsData);

      const hasAnyData =
        allPlansData.length > 0 ||
        allReportsData.length > 0 ||
        sessionsData.length > 0;
      setHasData(hasAnyData);

      if (allPlansData.length > 0) {
        setSelectedPlan(allPlansData[0]);
        const allScores = calculateGlobalAverageFromData(allPlansData, sessionsData);
        setGlobalAverage(allScores);
        const stats = calculatePlanStats(allPlansData[0]);
        setSelectedPlanStats(stats);
      } else {
        setSelectedPlan(null);
        setGlobalAverage(null);
        setSelectedPlanStats(null);
        if (!hasAnyData) {
          toast("لا توجد بيانات", { icon: "📭" });
        }
      }

      setShowDateModal(false);
    } catch (err) {
      console.error(err);
      toast.error("فشل تحميل البيانات ❌");
    } finally {
      setLoading(false);
    }
  };

  const calculateGlobalAverageFromData = (plansList, sessionsList) => {
    let allScores = [];
    plansList.forEach((plan) => {
      const planExerciseIds = (plan.exercises || []).map((e) => Number(e.id));
      const planSessions = sessionsList.filter((s) => {
        if (!s.treatmentPlanExerciseId) return false;
        return planExerciseIds.includes(Number(s.treatmentPlanExerciseId));
      });
      planSessions.forEach((session) => {
        if (session.result?.accuracyScore != null) {
          allScores.push(Number(session.result.accuracyScore));
        }
      });
    });
    if (allScores.length === 0) {
      return null;
    }
    const avg = allScores.reduce((sum, score) => sum + score, 0) / allScores.length;
    return Math.round(avg);
  };

  const calculateCompletedExercises = (plan) => {
    const planExerciseIds = (plan.exercises || []).map((e) => Number(e.id));
    const completedSessions = sessions.filter((s) => [2, 3, 4].includes(Number(s.status)));
    const completedIds = completedSessions
      .filter((s) => s.treatmentPlanExerciseId)
      .map((s) => Number(s.treatmentPlanExerciseId));
    const completed = planExerciseIds.filter((id) =>
      completedIds.includes(id)
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
    if (isNaN(date.getTime())) return "—";
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
                <span className={analyticsStyles.childStat}>
                  🎯 {sessions.length} جلسة
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
          <p>لا توجد خطط علاجية أو جلسات أو تقارير لهذا الطفل</p>
          <button
            className={analyticsStyles.primaryBtn}
            onClick={() => setShowDateModal(true)}
          >
            تحديث البيانات
          </button>
        </div>
      ) : (
        <>
          <div className={analyticsStyles.filterBadge}>
            📅 عرض جميع البيانات المتاحة
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
            {globalAverage !== null && (
              <div className={analyticsStyles.averageDetails}>
                <span>✅ أنجزت: {globalAverage}%</span>
                <span>⏳ باقي للهدف: {100 - globalAverage}%</span>
              </div>
            )}
          </div>

          {plans.length > 0 && (
            <div className={analyticsStyles.plansSection}>
              <h3>📋 الخطط العلاجية</h3>
              <p className={analyticsStyles.plansCount}>عدد الخطط: {plans.length}</p>

              <div className={analyticsStyles.plansTabs}>
                {plans.map((plan, idx) => {
                  const stats = calculatePlanStats(plan);
                  const avgScore = stats?.avgScore || null;
                  const { completed, total, percentage } =
                    calculateCompletedExercises(plan);
                  const planName = plan.title || plan.name || `خطة ${idx + 1}`;

                  return (
                    <div
                      key={plan.id || idx}
                      className={`${analyticsStyles.planTab} ${selectedPlan?.id === plan.id ? analyticsStyles.active : ""}`}
                      onClick={() => {
                        setSelectedPlan(plan);
                        setSelectedPlanStats(calculatePlanStats(plan));
                      }}
                    >
                      <div className={analyticsStyles.planTabHeader}>
                        <h4>{planName}</h4>
                        <span
                          className={analyticsStyles.planScore}
                          style={{ color: getScoreColor(avgScore) }}
                        >
                          {avgScore !== null ? `${avgScore}%` : "—"}
                        </span>
                      </div>
                      <p className={analyticsStyles.planDate}>
                        {formatDate(plan.startDate)} → {formatDate(plan.endDate)}
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
                      {stats && stats.sessionsCount > 0 && (
                        <div className={analyticsStyles.planStats}>
                          <span>📊 {stats.sessionsCount} جلسة</span>
                          <span>❌ {stats.totalMistakes} خطأ</span>
                          <span>🔄 {stats.totalRepetitions} تكرار</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {selectedPlan && selectedPlanStats && (
                <div className={analyticsStyles.planDetails}>
                  <div className={analyticsStyles.planDetailsHeader}>
                    <h3>{selectedPlan.title || selectedPlan.name || "الخطة العلاجية"}</h3>
                    <p className={analyticsStyles.planPeriod}>
                      📅 {formatDate(selectedPlan.startDate)} - {formatDate(selectedPlan.endDate)}
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
                      {selectedPlanStats.avgScore !== null && (
                        <div className={analyticsStyles.statExtra}>
                          <div>✅ أنجزت: {selectedPlanStats.avgScore}%</div>
                          <div>⏳ باقي: {100 - selectedPlanStats.avgScore}%</div>
                        </div>
                      )}
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

                  {selectedPlanStats.sessionsCount >= 2 && (
                    <div className={analyticsStyles.improvementSection}>
                      <div className={analyticsStyles.improvementHeader}>
                        <span className={analyticsStyles.improvementIcon}>📈</span>
                        <h4>نسبة التحسن في الخطة</h4>
                      </div>
                      {(() => {
                        const improvement = calculateImprovementRate(selectedPlan);
                        if (!improvement) {
                          return (
                            <p className={analyticsStyles.noData}>
                              لا توجد بيانات كافية لحساب التحسن
                            </p>
                          );
                        }
                        const isPositive = improvement.percentage >= 0;
                        const completed = improvement.lastScore;
                        const remaining = 100 - completed;
                        return (
                          <div>
                            <div
                              className={`${analyticsStyles.improvementCard} ${isPositive ? analyticsStyles.positive : analyticsStyles.negative}`}
                            >
                              <div className={analyticsStyles.improvementValue}>
                                {isPositive ? "📈" : "📉"} {Math.abs(improvement.percentage)}%
                              </div>
                              <div className={analyticsStyles.improvementDetails}>
                                من {improvement.firstScore}% إلى {improvement.lastScore}%
                              </div>
                            </div>
                            <div className={analyticsStyles.completionBox}>
                              <div className={analyticsStyles.completionRow}>
                                <span className={analyticsStyles.completionLabel}>✅ أنجزت:</span>
                                <span className={analyticsStyles.completionValue}>{completed}%</span>
                              </div>
                              <div className={analyticsStyles.completionRow}>
                                <span className={analyticsStyles.completionLabel}>⏳ باقي للهدف:</span>
                                <span className={analyticsStyles.completionValue}>{remaining}%</span>
                              </div>
                              <div className={analyticsStyles.progressBar}>
                                <div
                                  className={analyticsStyles.progressFill}
                                  style={{
                                    width: `${completed}%`,
                                    backgroundColor: "#10b981",
                                  }}
                                />
                              </div>
                              <div className={analyticsStyles.completionMessage}>
                                {remaining <= 0 ? "🎉 تهانينا! لقد حققت الهدف بنجاح" :
                                 remaining <= 10 ? "💪 أنت على بعد خطوات قليلة من الهدف" :
                                 remaining <= 20 ? "👍 تقدم ممتاز، استمر" :
                                 remaining <= 50 ? "📈 في منتصف الطريق، واصل بنفس المستوى" :
                                 "🌟 بداية جيدة، استمر في التدريب"}
                              </div>
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  )}

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
                              key={ex.id || index}
                              className={`${analyticsStyles.exerciseItem} ${isCompleted ? analyticsStyles.completed : ""}`}
                            >
                              <div className={analyticsStyles.exerciseName}>
                                {index + 1}. {ex.exerciseName || ex.name || `تمرين ${index + 1}`}
                                {isCompleted && (
                                  <span
                                    className={analyticsStyles.completedBadge}
                                  >
                                    ✓
                                  </span>
                                )}
                              </div>
                              <div className={analyticsStyles.exerciseDetails}>
                                <span>🔄 {ex.sets || 0} جولات</span>
                                <span>🔁 {ex.expectedReps || ex.reps || 0} عدات</span>
                                <span>📅 {ex.dailyFrequency || 0} يومياً</span>
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
                <p>لا توجد تقارير طبية لهذا الطفل</p>
              </div>
            ) : (
              <div className={analyticsStyles.reportsGrid}>
                {reports.map((report, idx) => {
                  const improvement = report.improvementPercentage || 0;
                  const isPositive = improvement >= 0;
                  const completedExercises =
                    report.completedExercisesCount || 0;
                  const totalExercises = report.totalExercisesCount || 0;
                  const remainingExercises =
                    totalExercises - completedExercises;

                  return (
                    <div key={report.id || idx} className={analyticsStyles.reportCard}>
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
              <h3>📅 تحديث البيانات</h3>
              <button
                className={analyticsStyles.closeBtn}
                onClick={() => setShowDateModal(false)}
              >
                ✕
              </button>
            </div>

            <div className={analyticsStyles.modalBody}>
              <p>سيتم تحديث جميع البيانات المتاحة لهذا الطفل</p>
            </div>

            <div className={analyticsStyles.modalFooter}>
              <button
                className={analyticsStyles.applyBtn}
                onClick={fetchDataByDate}
              >
                تحديث البيانات
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Analytics;