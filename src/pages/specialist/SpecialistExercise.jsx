import styles from "../../assets/exercise.module.css";
import { useEffect, useState } from "react";
import { getExercises } from "../../api/exerciseService";
import { getChildren } from "../../api/childrenService";

import {
  createTreatmentPlan,
  getTreatmentPlans,
  getTreatmentPlanById,
  updateTreatmentPlan,
  deleteTreatmentPlan,
} from "../../api/treatmentPlansService";

import toast from "react-hot-toast";

function SpecialistExercise() {
  const [exercises, setExercises] = useState([]);
  const [children, setChildren] = useState([]);
  const [plans, setPlans] = useState([]);

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  const [childId, setChildId] = useState("");
  const [selectedExercises, setSelectedExercises] = useState([]);

  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [exRes, childRes] = await Promise.all([
        getExercises({
          PageNumber: 1,
          PageSize: 100,
        }),
        getChildren(),
      ]);

      setExercises((exRes.items || []).filter((e) => e.isActive));

      setChildren(childRes?.items || []);

      if (childRes?.items?.length > 0) {
        const firstChildId = childRes.items[0].id;

        const plansRes = await getTreatmentPlans(firstChildId);

        setPlans(plansRes.items || []);
      }
    } catch (err) {
      console.log(err);
      toast.error("فشل تحميل البيانات");
    }
  };

  const loadPlans = async (id) => {
    try {
      const res = await getTreatmentPlans(id);
      setPlans(res.items || []);
    } catch (err) {
      console.log(err);
    }
  };

  const toggleExercise = (ex) => {
    const exists = selectedExercises.find((e) => e.exerciseId === ex.id);

    if (exists) {
      setSelectedExercises((prev) =>
        prev.filter((e) => e.exerciseId !== ex.id),
      );
    } else {
      setSelectedExercises((prev) => [
        ...prev,
        {
          exerciseId: ex.id,
          expectedReps: 10,
          sets: 3,
          dailyFrequency: 1,
        },
      ]);
    }
  };

  const updateField = (id, field, value) => {
    const num = Math.max(1, Number(value) || 1);

    setSelectedExercises((prev) =>
      prev.map((e) =>
        e.exerciseId === id
          ? {
              ...e,
              [field]: num,
            }
          : e,
      ),
    );
  };

  const resetForm = () => {
    setEditingId(null);
    setSelectedExercises([]);
    setChildId("");
    setTitle("");
    setNotes("");
    setStartDate("");
    setEndDate("");
  };

  const handleSubmit = async () => {
    if (!childId) {
      toast.error("اختار طفل");
      return;
    }

    if (!title) {
      toast.error("اكتب عنوان الخطة");
      return;
    }

    if (!startDate || !endDate) {
      toast.error("حدد التواريخ");
      return;
    }

    if (selectedExercises.length === 0) {
      toast.error("اختار تمارين");
      return;
    }

    try {
      setLoading(true);

      const payload = {
        childId: Number(childId),
        title,
        notes,
        startDate,
        endDate,
        exercises: selectedExercises,
      };

      if (editingId) {
        await updateTreatmentPlan(editingId, payload);
        toast.success("تم تعديل الخطة ✅");
      } else {
        await createTreatmentPlan(payload);
        toast.success("تم إنشاء الخطة ✅");
      }

      await loadPlans(childId);

      resetForm();
    } catch (err) {
      console.log(err);

      toast.error(err?.response?.data?.errors?.[0] || "فشل حفظ الخطة ❌");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async (plan) => {
    try {
      const fullPlan = await getTreatmentPlanById(plan.id);

      setEditingId(fullPlan.id);

      setChildId(fullPlan.childId);

      setTitle(fullPlan.title || "");

      setNotes(fullPlan.notes || "");

      setStartDate(fullPlan.startDate?.split("T")[0] || "");

      setEndDate(fullPlan.endDate?.split("T")[0] || "");

      setSelectedExercises(
        (fullPlan.exercises || []).map((ex) => ({
          exerciseId: ex.exerciseId,
          expectedReps: ex.expectedReps,
          sets: ex.sets,
          dailyFrequency: ex.dailyFrequency,
        })),
      );

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    } catch (err) {
      console.log(err);
      toast.error("فشل تحميل الخطة");
    }
  };

  const handleDelete = async (id) => {
    const ok = window.confirm("هل تريد حذف الخطة ؟");

    if (!ok) return;

    try {
      await deleteTreatmentPlan(id);

      toast.success("تم حذف الخطة");

      loadPlans(childId);
    } catch (err) {
      console.log(err);
      toast.error("فشل حذف الخطة");
    }
  };

  const filtered = exercises
    .filter((ex) => ex.name?.toLowerCase().includes(search.toLowerCase()))
    .filter((ex) => (filter === "all" ? true : ex.exerciseType === filter));

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h2>{editingId ? "تعديل خطة علاج" : "إنشاء خطة علاج"}</h2>

          <p>اختر التمارين المناسبة للطفل</p>
        </div>
      </div>

      <div className={styles.formBox}>
        <input
          placeholder="عنوان الخطة"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <textarea
          placeholder="ملاحظات"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />

        <div className={styles.dateRow}>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />

          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>

        <select
          value={childId}
          onChange={(e) => {
            setChildId(e.target.value);
            loadPlans(e.target.value);
          }}
        >
          <option value="">اختر الطفل</option>

          {children.map((child) => (
            <option key={child.id} value={child.id}>
              {child.fullName}
            </option>
          ))}
        </select>
      </div>

      <div className={styles.tools}>
        <input
          className={styles.search}
          placeholder="بحث عن تمرين..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          className={styles.filter}
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="all">كل التمارين</option>

          <option value="Balance">Balance</option>

          <option value="Stretch">Stretch</option>

          <option value="Strength">Strength</option>

          <option value="UpperBody">UpperBody</option>
        </select>
      </div>

      <div className={styles.sectionTitle}>
        <h3>التمارين المتاحة</h3>

        <p>اختر التمارين المناسبة للخطة العلاجية</p>
      </div>

      <div className={styles.grid}>
        {filtered.length === 0 && (
          <div className={styles.empty}>لا يوجد تمارين</div>
        )}

        {filtered.map((ex) => {
          const selected = selectedExercises.find(
            (e) => e.exerciseId === ex.id,
          );

          return (
            <div key={ex.id} className={styles.card}>
              {ex.mediaUrl ? (
                <video src={ex.mediaUrl} controls className={styles.video} />
              ) : (
                <img
                  src={ex.mediaThumbnailUrl || "/default.png"}
                  onError={(e) => (e.target.src = "/default.png")}
                  alt={ex.name}
                />
              )}

              <div className={styles.cardContent}>
                <h4>{ex.name}</h4>

                <div className={styles.type}>{ex.exerciseType}</div>

                <p>{ex.description}</p>

                <button
                  className={selected ? styles.selected : ""}
                  onClick={() => toggleExercise(ex)}
                >
                  {selected ? "تم الاختيار" : "اختيار"}
                </button>

                {selected && (
                  <div className={styles.inputs}>
                    <input
                      type="number"
                      min="1"
                      placeholder="العدات"
                      value={selected.expectedReps}
                      onChange={(e) =>
                        updateField(ex.id, "expectedReps", e.target.value)
                      }
                    />

                    <input
                      type="number"
                      min="1"
                      placeholder="الجولات"
                      value={selected.sets}
                      onChange={(e) =>
                        updateField(ex.id, "sets", e.target.value)
                      }
                    />

                    <input
                      type="number"
                      min="1"
                      placeholder="يومياً"
                      value={selected.dailyFrequency}
                      onChange={(e) =>
                        updateField(ex.id, "dailyFrequency", e.target.value)
                      }
                    />
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div
        style={{
          display: "flex",
          gap: "10px",
          marginTop: "20px",
        }}
      >
        <button
          className={styles.saveBtn}
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? "جاري الحفظ..." : editingId ? "تعديل الخطة" : "حفظ الخطة"}
        </button>

        {editingId && (
          <button
            className={styles.saveBtn}
            style={{
              background: "#777",
            }}
            onClick={resetForm}
          >
            إلغاء التعديل
          </button>
        )}
      </div>

      <div className={styles.plansSection}>
        <div className={styles.sectionTitle}>
          <h3>الخطط العلاجية</h3>
        </div>

        <div className={styles.plansGrid}>
          {plans.map((plan) => (
            <div key={plan.id} className={styles.planCard}>
              <h4>{plan.title}</h4>

              <p>{plan.notes}</p>

              <p>
                من {plan.startDate?.split("T")[0]} إلى{" "}
                {plan.endDate?.split("T")[0]}
              </p>

              <div className={styles.planActions}>
                <button onClick={() => handleEdit(plan)}>تعديل</button>

                <button onClick={() => handleDelete(plan.id)}>حذف</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default SpecialistExercise;
