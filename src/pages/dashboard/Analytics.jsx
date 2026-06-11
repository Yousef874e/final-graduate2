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
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadialBarChart,
  RadialBar,
  ComposedChart,
} from "recharts";

const COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6"];

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
  const [activeChart, setActiveChart] = useState("line");

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
        sessionHistory: [],
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

    const sessionHistory = validSessions
      .sort((a, b) => new Date(a.sessionDate || a.createdAtUtc) - new Date(b.sessionDate || b.createdAtUtc))
      .map((s, idx) => ({
        session: `جلسة ${idx + 1}`,
        score: Number(s.result.accuracyScore),
        mistakes: s.result?.mistakeCount || 0,
        repetitions: s.result?.repetitionCount || 0,
        date: new Date(s.sessionDate || s.createdAtUtc).toLocaleDateString("ar-EG"),
      }));

    return {
      avgScore: Math.round(avg),
      totalMistakes,
      totalRepetitions,
      avgMistakesPerSession,
      avgRepetitionsPerSession,
      sessionsCount: validSessions.length,
      allSessionsCount: planSessions.length,
      sessionHistory,
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

    if (!fromDate || !toDate) {
      toast.error("الرجاء تحديد تاريخ البداية والنهاية");
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

      const fromDateTime = new Date(fromDate);
      fromDateTime.setHours(0, 0, 0, 0);
      
      const toDateTime = new Date(toDate);
      toDateTime.setHours(23, 59, 59, 999);

      const filteredPlans = allPlansData.filter(plan => {
        const planStartDate = new Date(plan.startDate);
        const planEndDate = new Date(plan.endDate);
        return planStartDate <= toDateTime && planEndDate >= fromDateTime;
      });

      const filteredSessions = sessionsData.filter(session => {
        const sessionDate = new Date(session.sessionDate || session.createdAtUtc);
        return sessionDate >= fromDateTime && sessionDate <= toDateTime;
      });

      const filteredReports = allReportsData.filter(report => {
        const reportDate = new Date(report.createdAtUtc || report.createdAt);
        return reportDate >= fromDateTime && reportDate <= toDateTime;
      });

      setAllPlans(filteredPlans);
      setAllReports(filteredReports);
      setPlans(filteredPlans);
      setSessions(filteredSessions);
      setReports(filteredReports);

      const hasAnyData =
        filteredPlans.length > 0 ||
        filteredReports.length > 0 ||
        filteredSessions.length > 0;
      setHasData(hasAnyData);

      if (filteredPlans.length > 0) {
        setSelectedPlan(filteredPlans[0]);
        const allScores = calculateGlobalAverageFromData(filteredPlans, filteredSessions);
        setGlobalAverage(allScores);
        const stats = calculatePlanStats(filteredPlans[0]);
        setSelectedPlanStats(stats);
      } else {
        setSelectedPlan(null);
        setGlobalAverage(null);
        setSelectedPlanStats(null);
        if (!hasAnyData) {
          toast("لا توجد بيانات في هذه الفترة", { icon: "📭" });
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

  const getOverallStatsData = () => {
    const planStats = plans.map(plan => {
      const stats = calculatePlanStats(plan);
      return {
        name: plan.title || plan.name || "خطة",
        score: stats.avgScore || 0,
        sessions: stats.sessionsCount,
        mistakes: stats.totalMistakes,
        repetitions: stats.totalRepetitions,
      };
    });
    return planStats;
  };

  const getPieData = () => {
    const completed = plans.reduce((sum, plan) => {
      return sum + calculateCompletedExercises(plan).completed;
    }, 0);
    const total = plans.reduce((sum, plan) => {
      return sum + (plan.exercises?.length || 0);
    }, 0);
    return [
      { name: "تمارين مكتملة", value: completed },
      { name: "تمارين متبقية", value: total - completed },
    ];
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

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{ background: "white", padding: "8px", borderRadius: "6px", boxShadow: "0 1px 4px rgba(0,0,0,0.1)", border: "1px solid #e2e8f0", fontSize: "10px" }}>
          <p style={{ margin: 0, fontWeight: "bold", color: "#1e293b" }}>{label}</p>
          {payload.map((p, idx) => (
            <p key={idx} style={{ margin: "2px 0", color: p.color }}>
              {p.name}: {p.value} {p.unit || "%"}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className={analyticsStyles.loading}>
        <div className={analyticsStyles.spinner}></div>
        <p>جاري تحميل البيانات...</p>
      </div>
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
          <div className={analyticsStyles.globalAverageCard}>
            <h3>📈 متوسط الأداء العام</h3>
            <ResponsiveContainer width="100%" height={200}>
              <RadialBarChart 
                cx="50%" 
                cy="50%" 
                innerRadius="60%" 
                outerRadius="80%" 
                barSize={16} 
                data={[{ name: "المتوسط", value: globalAverage || 0, fill: getScoreColor(globalAverage) }]}
                startAngle={180}
                endAngle={0}
              >
                <RadialBar background dataKey="value" cornerRadius={30} />
                <text x="50%" y="48%" textAnchor="middle" dominantBaseline="middle" fill="#fff" fontSize={20} fontWeight="bold">
                  {globalAverage !== null ? `${globalAverage}%` : "—"}
                </text>
                <text x="50%" y="65%" textAnchor="middle" dominantBaseline="middle" fill="#cbd5e1" fontSize={11}>
                  {getScoreLevel(globalAverage)}
                </text>
              </RadialBarChart>
            </ResponsiveContainer>
          </div>

          {plans.length > 0 && (
            <div className={analyticsStyles.chartCard}>
              <h3>📊 مقارنة أداء الخطط العلاجية</h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={getOverallStatsData()} barSize={24}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} unit="%" />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="score" name="نسبة الإنجاز" fill="#3b82f6" barSize={24} radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {selectedPlanStats?.sessionHistory?.length > 0 && (
            <div className={analyticsStyles.chartCard}>
              <div className={analyticsStyles.chartHeader}>
                <h3>📈 تقدم الجلسات - {selectedPlan?.title || selectedPlan?.name || "الخطة الحالية"}</h3>
                <div className={analyticsStyles.chartTabs}>
                  <button className={`${analyticsStyles.chartTab} ${activeChart === "line" ? analyticsStyles.active : ""}`} onClick={() => setActiveChart("line")}>خطي</button>
                  <button className={`${analyticsStyles.chartTab} ${activeChart === "area" ? analyticsStyles.active : ""}`} onClick={() => setActiveChart("area")}>مساحي</button>
                  <button className={`${analyticsStyles.chartTab} ${activeChart === "composed" ? analyticsStyles.active : ""}`} onClick={() => setActiveChart("composed")}>مركب</button>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={280}>
                {activeChart === "line" && (
                  <LineChart data={selectedPlanStats.sessionHistory}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="session" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} unit="%" domain={[0, 100]} />
                    <Tooltip content={<CustomTooltip />} />
                    <Line type="monotone" dataKey="score" name="درجة الدقة" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} />
                  </LineChart>
                )}
                {activeChart === "area" && (
                  <AreaChart data={selectedPlanStats.sessionHistory}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="session" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} unit="%" domain={[0, 100]} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area type="monotone" dataKey="score" name="درجة الدقة" stroke="#10b981" fill="#10b981" fillOpacity={0.3} strokeWidth={2} />
                  </AreaChart>
                )}
                {activeChart === "composed" && (
                  <ComposedChart data={selectedPlanStats.sessionHistory}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="session" tick={{ fontSize: 11 }} />
                    <YAxis yAxisId="left" tick={{ fontSize: 11 }} unit="%" domain={[0, 100]} />
                    <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar yAxisId="right" dataKey="mistakes" name="الأخطاء" fill="#ef4444" barSize={20} radius={[4, 4, 0, 0]} />
                    <Line yAxisId="left" type="monotone" dataKey="score" name="الدقة" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} />
                  </ComposedChart>
                )}
              </ResponsiveContainer>
            </div>
          )}

          {selectedPlanStats && (selectedPlanStats.totalMistakes > 0 || selectedPlanStats.totalRepetitions > 0) && (
            <div className={analyticsStyles.chartCard}>
              <h3>❌ الأخطاء والتكرارات</h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={[
                  { name: "الأخطاء", value: selectedPlanStats.totalMistakes },
                  { name: "التكرارات", value: selectedPlanStats.totalRepetitions }
                ]} barSize={40}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="value" name="العدد" barSize={40} radius={[6, 6, 0, 0]}>
                    <Cell fill="#ef4444" />
                    <Cell fill="#10b981" />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              <div className={analyticsStyles.ratioInfo}>
                نسبة الأخطاء: {((selectedPlanStats.totalMistakes / Math.max(selectedPlanStats.totalRepetitions, 1)) * 100).toFixed(1)}%
              </div>
            </div>
          )}

          {plans.length > 0 && (
            <div className={analyticsStyles.chartCard}>
              <h3>🥧 نسبة إتمام التمارين</h3>
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie data={getPieData()} cx="50%" cy="50%" labelLine={false} label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`} outerRadius={80} dataKey="value">
                    {getPieData().map((entry, index) => (<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: "11px" }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}

          {plans.length > 0 && (
            <div className={analyticsStyles.plansSection}>
              <h3>📋 الخطط العلاجية</h3>
              <div className={analyticsStyles.plansTabs}>
                {plans.map((plan, idx) => {
                  const stats = calculatePlanStats(plan);
                  const avgScore = stats?.avgScore || null;
                  const { completed, total, percentage } = calculateCompletedExercises(plan);
                  const planName = plan.title || plan.name || `خطة ${idx + 1}`;
                  return (
                    <div key={plan.id || idx} className={`${analyticsStyles.planTab} ${selectedPlan?.id === plan.id ? analyticsStyles.active : ""}`} onClick={() => { setSelectedPlan(plan); setSelectedPlanStats(calculatePlanStats(plan)); }}>
                      <div className={analyticsStyles.planTabHeader}>
                        <h4>{planName}</h4>
                        <span className={analyticsStyles.planScore} style={{ color: getScoreColor(avgScore) }}>{avgScore !== null ? `${avgScore}%` : "—"}</span>
                      </div>
                      <p className={analyticsStyles.planDate}>{formatDate(plan.startDate)} → {formatDate(plan.endDate)}</p>
                      <div className={analyticsStyles.planProgress}>
                        <div className={analyticsStyles.progressBar}><div className={analyticsStyles.progressFill} style={{ width: `${percentage}%`, backgroundColor: getScoreColor(avgScore || 0) }} /></div>
                        <span className={analyticsStyles.progressText}>{completed}/{total} تمرين</span>
                      </div>
                      {stats && stats.sessionsCount > 0 && (<div className={analyticsStyles.planStats}><span>📊 {stats.sessionsCount} جلسة</span><span>❌ {stats.totalMistakes} خطأ</span></div>)}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className={analyticsStyles.reportsSection}>
            <h3>📊 التقارير السابقة</h3>
            <div className={analyticsStyles.reportsGrid}>
              {reports.map((report, idx) => {
                const improvement = report.improvementPercentage || 0;
                const isPositive = improvement >= 0;
                const completedExercises = report.completedExercisesCount || 0;
                const totalExercises = report.totalExercisesCount || 0;
                return (
                  <div key={report.id || idx} className={analyticsStyles.reportCard}>
                    <div className={analyticsStyles.reportPeriod}>📅 {formatDate(report.createdAtUtc || report.createdAt)}</div>
                    <div className={analyticsStyles.reportStats}>
                      <div className={analyticsStyles.reportStat}><span>النوع</span><strong>{report.reportType || "طبي"}</strong></div>
                      <div className={analyticsStyles.reportStat}><span>الحالة</span><strong>{report.status || "مكتمل"}</strong></div>
                      {report.averageAccuracy !== undefined && (<div className={analyticsStyles.reportStat}><span>الدقة</span><strong style={{ color: getScoreColor(report.averageAccuracy) }}>{report.averageAccuracy}%</strong></div>)}
                    </div>
                    <div className={`${analyticsStyles.improvementCard} ${isPositive ? analyticsStyles.positive : analyticsStyles.negative}`}>
                      <div className={analyticsStyles.improvementValue}>{isPositive ? "📈" : "📉"} {Math.abs(improvement)}%</div>
                      <div className={analyticsStyles.improvementText}>{getImprovementText(improvement)}</div>
                    </div>
                    {totalExercises > 0 && (
                      <div className={analyticsStyles.exercisesProgress}>
                        <div className={analyticsStyles.progressInfo}><span>📋 التمارين</span><strong>{completedExercises}/{totalExercises}</strong></div>
                        <div className={analyticsStyles.progressBar}><div className={analyticsStyles.progressFill} style={{ width: `${(completedExercises / totalExercises) * 100}%`, backgroundColor: "#10b981" }} /></div>
                      </div>
                    )}
                    {report.summary && (<div className={analyticsStyles.reportSummary}>📝 {report.summary}</div>)}
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}

      {showDateModal && (
        <div className={analyticsStyles.modalOverlay} onClick={() => setShowDateModal(false)}>
          <div className={analyticsStyles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={analyticsStyles.modalHeader}>
              <h3>📅 تحديد الفترة الزمنية</h3>
              <button className={analyticsStyles.closeBtn} onClick={() => setShowDateModal(false)}>✕</button>
            </div>
            <div className={analyticsStyles.modalBody}>
              <div className={analyticsStyles.inputGroup}>
                <label>📅 من تاريخ</label>
                <input
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                />
              </div>
              <div className={analyticsStyles.inputGroup}>
                <label>📅 إلى تاريخ</label>
                <input
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                />
              </div>
            </div>
            <div className={analyticsStyles.modalFooter}>
              <button className={analyticsStyles.cancelBtn} onClick={() => setShowDateModal(false)}>إلغاء</button>
              <button className={analyticsStyles.applyBtn} onClick={fetchDataByDate}>تطبيق</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Analytics;