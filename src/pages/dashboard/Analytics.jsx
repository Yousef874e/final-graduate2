import { useState, useEffect } from "react";
import styles from "../../assets/dashboard.module.css";
import analyticsStyles from "../../assets/analytics.module.css";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useApp } from "../../Context/AppContext";
import { getTreatmentPlans } from "../../api/treatmentPlansService";
import { getSessionsByChild } from "../../api/sessionsService";
import { getProgressReports } from "../../api/progressReportsService";
import { getChildImage } from "../../api/childrenService";

function Analytics() {
  const navigate = useNavigate();
  const { data } = useApp();

  const [loading, setLoading] = useState(false);
  const [plans, setPlans] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [reports, setReports] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [showDateModal, setShowDateModal] = useState(true);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [globalAverage, setGlobalAverage] = useState(null);
  const [childImage, setChildImage] = useState(null);
  const [allPlans, setAllPlans] = useState([]);
  const [allReports, setAllReports] = useState([]);
  const [hasData, setHasData] = useState(false);

  const children = data?.children || [];
  const child = children[0];

  useEffect(() => {
    if (!child?.childId) {
      return;
    }
    loadChildImage();
  }, [child?.childId]);

  const loadChildImage = async () => {
    if (!child?.childId) return;
    try {
      const imageData = await getChildImage(child.childId);
      setChildImage(imageData?.url || null);
    } catch (err) {
      setChildImage(null);
    }
  };

  const fetchDataByDate = async () => {
    if (!fromDate && !toDate) {
      toast.error("يرجى تحديد التاريخ");
      return;
    }

    setLoading(true);
    setHasData(false);

    try {
      const [plansRes, sessionsRes, reportsRes] = await Promise.all([
        getTreatmentPlans(child.childId),
        getSessionsByChild(child.childId),
        getProgressReports(child.childId),
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
          (plan) => new Date(plan.startDate) >= from
        );
        filteredReports = filteredReports.filter(
          (report) => new Date(report.fromDate) >= from
        );
      }

      if (toDate) {
        const to = new Date(toDate);
        to.setHours(23, 59, 59, 999);
        
        filteredPlans = filteredPlans.filter(
          (plan) => new Date(plan.endDate) <= to
        );
        filteredReports = filteredReports.filter(
          (report) => new Date(report.toDate) <= to
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
        } else {
          setSelectedPlan(null);
          setGlobalAverage(null);
        }
      } else {
        setHasData(false);
        setSelectedPlan(null);
        setGlobalAverage(null);
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

  const calculatePlanProgress = (plan) => {
    const planExerciseIds = (plan.exercises || []).map((e) => Number(e.id));
    const planSessions = sessions.filter(
      (s) =>
        planExerciseIds.includes(Number(s.treatmentPlanExerciseId)) &&
        s.result?.accuracyScore != null,
    );
    if (!planSessions.length) return null;
    const avg =
      planSessions.reduce((sum, s) => sum + Number(s.result.accuracyScore), 0) /
      planSessions.length;
    return Math.round(avg);
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
    if (score >= 80) return "#22c55e";
    if (score >= 60) return "#eab308";
    if (score >= 40) return "#f97316";
    return "#ef4444";
  };

  const getScoreLevel = (score) => {
    if (score === null) return "لم يبدأ بعد";
    if (score >= 90) return "ممتاز 🔥";
    if (score >= 80) return "جيد جداً 👌";
    if (score >= 70) return "جيد 🙂";
    if (score >= 50) return "مقبول 😐";
    return "ضعيف ❌";
  };

  if (loading) {
    return (
      <div className={analyticsStyles.loading}>جاري تحميل البيانات...</div>
    );
  }

  return (
    <div className={analyticsStyles.container}>
      <div className={analyticsStyles.header}>
        <h2>📊 التقارير والتحليلات</h2>
        <button
          className={styles.startBtn}
          onClick={() => setShowDateModal(true)}
        >
          📅 تحديد الفترة
        </button>
      </div>

      {child && (
        <div className={analyticsStyles.childInfo}>
          <div className={analyticsStyles.childAvatar}>
            {childImage ? (
              <img
                src={childImage}
                alt={child.childName}
                className={analyticsStyles.avatarImg}
              />
            ) : (
              <div className={analyticsStyles.avatarPlaceholder}>👶</div>
            )}
          </div>
          <div className={analyticsStyles.childDetails}>
            <h3>{child.childName}</h3>
            {hasData && (
              <>
                <p>📋 عدد التقارير: {reports.length}</p>
                <p>📋 عدد الخطط: {plans.length}</p>
              </>
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
            className={styles.startBtn}
            onClick={() => setShowDateModal(true)}
          >
            تحديد الفترة الآن
          </button>
        </div>
      ) : (
        <>
          <div className={analyticsStyles.filterBadgeLarge}>
            📅 الفترة: {fromDate && `من ${formatDate(fromDate)}`} {toDate && `إلى ${formatDate(toDate)}`}
          </div>

          <div className={analyticsStyles.globalAverage}>
            <h3>📈 متوسط الأداء العام (جميع الخطط)</h3>
            <div className={analyticsStyles.averageCircle}>
              <svg className={analyticsStyles.circularChart} viewBox="0 0 180 180">
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
                  const avgScore = calculatePlanProgress(plan);
                  const { percentage } = calculateCompletedExercises(plan);

                  return (
                    <div
                      key={plan.id}
                      className={`${analyticsStyles.planTab} ${selectedPlan?.id === plan.id ? analyticsStyles.active : ""}`}
                      onClick={() => setSelectedPlan(plan)}
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
                          {calculateCompletedExercises(plan).completed}/
                          {calculateCompletedExercises(plan).total} تمرين مكتمل
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {selectedPlan && (
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
                      <div className={analyticsStyles.statLabel}>نسبة الإنجاز</div>
                      <div
                        className={analyticsStyles.statValue}
                        style={{
                          color: getScoreColor(calculatePlanProgress(selectedPlan)),
                        }}
                      >
                        {calculatePlanProgress(selectedPlan) !== null
                          ? `${calculatePlanProgress(selectedPlan)}%`
                          : "—"}
                      </div>
                      <div className={analyticsStyles.statSub}>
                        {getScoreLevel(calculatePlanProgress(selectedPlan))}
                      </div>
                    </div>

                    <div className={analyticsStyles.statCard}>
                      <div className={analyticsStyles.statLabel}>
                        التمارين المكتملة
                      </div>
                      <div className={analyticsStyles.statValue}>
                        {calculateCompletedExercises(selectedPlan).completed}/
                        {calculateCompletedExercises(selectedPlan).total}
                      </div>
                      <div className={analyticsStyles.statSub}>
                        بنسبة {calculateCompletedExercises(selectedPlan).percentage}%
                      </div>
                    </div>

                    <div className={analyticsStyles.statCard}>
                      <div className={analyticsStyles.statLabel}>عدد التمارين</div>
                      <div className={analyticsStyles.statValue}>
                        {selectedPlan.exercises?.length || 0}
                      </div>
                      <div className={analyticsStyles.statSub}>تمرين</div>
                    </div>
                  </div>

                  {selectedPlan.exercises?.length > 0 && (
                    <div className={analyticsStyles.exercisesList}>
                      <h4>📝 تمارين الخطة</h4>
                      <div className={analyticsStyles.exercisesGrid}>
                        {selectedPlan.exercises.map((ex, index) => (
                          <div key={ex.id} className={analyticsStyles.exerciseItem}>
                            <div className={analyticsStyles.exerciseName}>
                              {index + 1}. {ex.exerciseName}
                            </div>
                            <div className={analyticsStyles.exerciseDetails}>
                              <span>🔄 {ex.sets} جولات</span>
                              <span>🔁 {ex.expectedReps} عدات</span>
                              <span>📅 {ex.dailyFrequency} يومياً</span>
                            </div>
                          </div>
                        ))}
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
                {reports.map((report) => (
                  <div key={report.id} className={analyticsStyles.reportCard}>
                    <div className={analyticsStyles.reportPeriod}>
                      <span>📅 {formatDate(report.fromDate)}</span>
                      <span>→</span>
                      <span>{formatDate(report.toDate)}</span>
                    </div>

                    <div className={analyticsStyles.reportStats}>
                      <div className={analyticsStyles.reportStat}>
                        <span className={analyticsStyles.statLabel}>
                          نسبة التحسن
                        </span>
                        <strong
                          style={{
                            color: getScoreColor(report.improvementPercentage),
                          }}
                        >
                          {report.improvementPercentage || 0}%
                        </strong>
                      </div>

                      <div className={analyticsStyles.reportStat}>
                        <span className={analyticsStyles.statLabel}>
                          تكرار الجلسات
                        </span>
                        <strong>{report.sessionFrequency || 0} مرات/يوم</strong>
                      </div>

                      {report.accuracyTrends360 && (
                        <div className={analyticsStyles.reportStat}>
                          <span className={analyticsStyles.statLabel}>
                            اتجاهات الدقة
                          </span>
                          <strong>{report.accuracyTrends360}</strong>
                        </div>
                      )}
                    </div>

                    {report.summary && (
                      <div className={analyticsStyles.reportSummary}>
                        📝 {report.summary}
                      </div>
                    )}

                    <div className={analyticsStyles.reportDate}>
                      🕐 تاريخ الإنشاء: {formatDate(report.createdAtUtc)}
                    </div>
                  </div>
                ))}
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
              <button className={styles.startBtn} onClick={fetchDataByDate}>
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