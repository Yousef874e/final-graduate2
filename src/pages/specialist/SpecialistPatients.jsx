import styles from "../../assets/patients.module.css";
import { useApp } from "../../Context/AppContext";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  FaSearch,
  FaEllipsisV,
  FaFileAlt,
  FaCalendarAlt,
  FaComment,
  FaChartLine,
} from "react-icons/fa";
import axiosClient from "../../api/axiosClient";

function SpecialistPatients() {
  const { data } = useApp();
  const navigate = useNavigate();

  const children = data?.childrenSnapshot || [];
  const [patients, setPatients] = useState([]);
  const [search, setSearch] = useState("");

  const getStatus = (score, sessions) => {
    if (!sessions) return "قيد التقييم";

    if (score >= 80) return "تحسن ملحوظ";
    if (score >= 50) return "مستمر";
    return "يحتاج متابعة";
  };

  const getStatusClass = (score, sessions) => {
    if (!sessions) return styles.normal;

    if (score >= 80) return styles.good;
    if (score >= 50) return styles.normal;
    return styles.bad;
  };

  useEffect(() => {
    const loadPatients = async () => {
      const result = await Promise.all(
        children.map(async (p) => {
          try {
            const res = await axiosClient.get(
              `/Children/${p.childId}/profile-image`,
            );
            return {
              ...p,
              image: res.data?.url,
            };
          } catch {
            return {
              ...p,
              image: null,
            };
          }
        }),
      );

      setPatients(result);
    };

    if (children.length) loadPatients();
  }, [children]);

  const filteredPatients = patients.filter((p) =>
    p.childName?.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.searchBox}>
          <input
            placeholder="بحث..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <FaSearch />
        </div>
      </div>

      <div className={styles.grid}>
        {filteredPatients.map((p) => (
          <div key={p.childId} className={styles.card}>
            <div className={styles.top}>
              <FaEllipsisV />

              <div className={styles.user}>
                <img src={p.image || "/default-avatar.png"} alt="" />
                <div>
                  <h4>{p.childName}</h4>
                  <p>التقارير الطبية: {p.medicalReportsCount || 0}</p>
                </div>
              </div>

              <span
                className={`${styles.status} ${getStatusClass(
                  p.averageAccuracyScore,
                  p.analyzedSessionsCount
                )}`}
              >
                {getStatus(
                  p.averageAccuracyScore,
                  p.analyzedSessionsCount
                )}
              </span>
            </div>

            <div className={styles.actions}>
              <div
                onClick={() =>
                  navigate("/dashboard/specialist/chat", {
                    state: { childId: p.childId },
                  })
                }
              >
                <FaComment />
                <span>رسائل</span>
              </div>

              <div
                onClick={() =>
                  navigate("/dashboard/specialist/appointments", {
                    state: { childId: p.childId },
                  })
                }
              >
                <FaCalendarAlt />
                <span>المواعيد</span>
              </div>

              <div
                onClick={() =>
                  navigate("/dashboard/specialist/child-analytics", {
                    state: { childId: p.childId, childName: p.childName },
                  })
                }
              >
                <FaChartLine />
                <span>تحليلات</span>
              </div>

              <div
                onClick={() =>
                  navigate("/dashboard/specialist/profile", {
                    state: { childId: p.childId },
                  })
                }
              >
                <FaFileAlt />
                <span>الملف</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default SpecialistPatients;
