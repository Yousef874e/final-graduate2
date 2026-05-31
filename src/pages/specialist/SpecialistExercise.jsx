import styles from "../../assets/exercise.module.css";
import { useEffect, useState } from "react";

import Select from "react-select";

import { getExercises } from "../../api/exerciseService";
import { getChildren } from "../../api/childrenService";

import {
  createTreatmentPlan,
  getTreatmentPlans,
  getTreatmentPlanById,
  updateTreatmentPlan,
  stopTreatmentPlan,
} from "../../api/treatmentPlansService";

import toast from "react-hot-toast";

function SpecialistExercise() {
  const [exercises, setExercises] = useState([]);
  const [children, setChildren] = useState([]);
  const [plans, setPlans] = useState([]);

  const [search, setSearch] = useState("");
  const [childId, setChildId] = useState("");
  const [selectedExercises, setSelectedExercises] = useState([]);

  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [showModal, setShowModal] = useState(false);

  const toEgyptTime = (dateString) => {
    if (!dateString) return "";
    return dateString.split("T")[0];
  };

  const toUTCForAPI = (dateString) => {
    if (!dateString) return "";
    return dateString;
  };

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

      const activeExercises = (exRes.items || []).filter((e) => e.isActive);

      setExercises(activeExercises);

      setChildren(childRes?.items || []);

      if (childRes?.items?.length > 0) {
        const firstChildId = childRes.items[0].id;

        setChildId(firstChildId);

        const plansRes = await getTreatmentPlans(firstChildId);

        const plansWithEgyptTime = (plansRes.items || []).map(plan => ({
          ...plan,
          startDate: toEgyptTime(plan.startDate),
          endDate: toEgyptTime(plan.endDate),
        }));

        setPlans(plansWithEgyptTime);
      }
    } catch (err) {
      console.log(err);

      toast.error("فشل تحميل البيانات");
    }
  };

  const loadPlans = async (id) => {
    try {
      const res = await getTreatmentPlans(id);
      
      const plansWithEgyptTime = (res.items || []).map(plan => ({
        ...plan,
        startDate: toEgyptTime(plan.startDate),
        endDate: toEgyptTime(plan.endDate),
      }));

      setPlans(plansWithEgyptTime);
    } catch (err) {
      console.log(err);
    }
  };

  const toggleExercise = (ex) => {
    const exists = selectedExercises.find((e) => e.exerciseId === ex.id);

    if (exists) {
      toast.error("التمرين مضاف بالفعل");
      return;
    }

    setSelectedExercises((prev) => [
      ...prev,
      {
        exerciseId: ex.id,
        expectedReps: 10,
        sets: 3,
        dailyFrequency: 1,
      },
    ]);
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

  const removeExercise = (id) => {
    setSelectedExercises((prev) => prev.filter((e) => e.exerciseId !== id));
  };

  const resetForm = () => {
    setEditingId(null);
    setSelectedExercises([]);
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

    if (!title.trim()) {
      toast.error("اكتب عنوان الخطة");
      return;
    }

    if (!startDate || !endDate) {
      toast.error("حدد التواريخ");
      return;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (end < start) {
      toast.error("تاريخ النهاية يجب أن يكون بعد تاريخ البداية");
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
        startDate: toUTCForAPI(startDate),
        endDate: toUTCForAPI(endDate),
        exercises: selectedExercises,
      };

      if (editingId) {
        await updateTreatmentPlan(editingId, payload);
        toast.success("تم تعديل الخطة");
      } else {
        await createTreatmentPlan(payload);
        toast.success("تم إنشاء الخطة");
      }

      await loadPlans(childId);
      resetForm();
      setShowModal(false);
    } catch (err) {
      console.log(err);
      toast.error("فشل حفظ الخطة");
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
      setStartDate(toEgyptTime(fullPlan.startDate));
      setEndDate(toEgyptTime(fullPlan.endDate));

      setSelectedExercises(
        (fullPlan.exercises || []).map((ex) => ({
          exerciseId: ex.exerciseId,
          expectedReps: ex.expectedReps,
          sets: ex.sets,
          dailyFrequency: ex.dailyFrequency,
        })),
      );

      setShowModal(true);
    } catch (err) {
      console.log(err);
      toast.error("فشل تحميل الخطة");
    }
  };
const handleStop = async (plan) => {
  const ok = window.confirm("هل تريد إيقاف الخطة ؟");

  if (!ok) return;

  try {
    const fullPlan = await getTreatmentPlanById(plan.id);

    await stopTreatmentPlan(plan.id, fullPlan);

    toast.success("تم إيقاف الخطة");
    loadPlans(childId);
  } catch (err) {
  
    toast.error("فشل إيقاف الخطة");
  }
};

  const filtered = exercises.filter((ex) =>
    ex.name?.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h2>الخطط العلاجية</h2>
          <p>إدارة الخطط العلاجية للأطفال</p>
        </div>

        <div className={styles.headerActions}>
          <input
            className={styles.search}
            placeholder="بحث عن تمرين..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <button
            className={styles.saveBtn}
            onClick={() => {
              resetForm();
              setShowModal(true);
            }}
          >
            إنشاء الخطة العلاجية
          </button>
        </div>
      </div>

      <div className={styles.plansSection}>
        <div className={styles.plansGrid}>
          {plans.map((plan) => (
            <div key={plan.id} className={styles.planCard}>
              <h4>{plan.title}</h4>
              <p>{plan.notes}</p>
              <p>
                من {plan.startDate?.split("T")[0] || plan.startDate} إلى{" "}
                {plan.endDate?.split("T")[0] || plan.endDate}
              </p>
              <div className={styles.planActions}>
                <button onClick={() => handleEdit(plan)}>تعديل</button>
                <button onClick={() => handleStop(plan)}>إيقاف</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {showModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h3>{editingId ? "تعديل خطة علاجية" : "إنشاء خطة علاجية"}</h3>

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
                onChange={async (e) => {
                  const id = e.target.value;
                  setChildId(id);

                  try {
                    const plansRes = await getTreatmentPlans(id);
                    const plansWithEgyptTime = (plansRes?.items || []).map(plan => ({
                      ...plan,
                      startDate: toEgyptTime(plan.startDate),
                      endDate: toEgyptTime(plan.endDate),
                    }));
                    setPlans(plansWithEgyptTime);
                  } catch (err) {
                    console.log(err);
                    setPlans([]);
                    toast.error("فشل تحميل الخطط");
                  }
                }}
              >
                <option value="">اختر الطفل</option>
                {children.map((child) => (
                  <option key={child.id} value={child.id}>
                    {child.fullName}
                  </option>
                ))}
              </select>

              <Select
                placeholder="اختر تمرين"
                options={filtered.map((ex) => ({
                  value: ex.id,
                  label: ex.name,
                }))}
                onChange={(selectedOption) => {
                  if (!selectedOption) return;
                  const exercise = exercises.find(
                    (ex) => ex.id === selectedOption.value,
                  );
                  if (exercise) {
                    toggleExercise(exercise);
                  }
                }}
              />
            </div>

            <div className={styles.exerciseList}>
              {selectedExercises.map((selected) => {
                const exercise = exercises.find(
                  (ex) => ex.id === selected.exerciseId,
                );

                return (
                  <div
                    key={selected.exerciseId}
                    className={styles.exerciseItem}
                  >
                    <h4>{exercise?.name}</h4>

                    <div className={styles.inputs}>
                      <input
                        type="number"
                        placeholder="العدات"
                        value={selected.expectedReps}
                        onChange={(e) =>
                          updateField(
                            selected.exerciseId,
                            "expectedReps",
                            e.target.value,
                          )
                        }
                      />

                      <input
                        type="number"
                        placeholder="الجولات"
                        value={selected.sets}
                        onChange={(e) =>
                          updateField(
                            selected.exerciseId,
                            "sets",
                            e.target.value,
                          )
                        }
                      />

                      <input
                        type="number"
                        placeholder="يومياً"
                        value={selected.dailyFrequency}
                        onChange={(e) =>
                          updateField(
                            selected.exerciseId,
                            "dailyFrequency",
                            e.target.value,
                          )
                        }
                      />
                    </div>

                    <button
                      className={styles.removeBtn}
                      onClick={() => removeExercise(selected.exerciseId)}
                    >
                      حذف التمرين
                    </button>
                  </div>
                );
              })}
            </div>

            <div className={styles.modalActions}>
              <button
                className={styles.confirmBtn}
                onClick={handleSubmit}
                disabled={loading}
              >
                {loading ? "جاري الحفظ..." : editingId ? "تعديل" : "حفظ"}
              </button>

              <button
                className={styles.cancelBtn}
                onClick={() => {
                  setShowModal(false);
                  resetForm();
                }}
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default SpecialistExercise;