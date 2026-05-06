import styles from "../../assets/reportss.module.css";
import { useEffect, useState } from "react";
import {
  getMedicalReports,
  createMedicalReport,
  deleteMedicalReport,
  downloadMedicalReport,
} from "../../api/medicalReportsService";
import { getChildren } from "../../api/childrenService";
import { uploadFile } from "../../api/mediaService";
import toast from "react-hot-toast";

function SpecialistReports() {
  const [reports, setReports] = useState([]);
  const [children, setChildren] = useState([]);

  const [childId, setChildId] = useState("");
  const [showForm, setShowForm] = useState(false);

  const [title, setTitle] = useState("");
  const [file, setFile] = useState(null);

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  const loadChildren = async () => {
    try {
      const res = await getChildren();
      setChildren(res?.items || []);
    } catch {
      toast.error("فشل تحميل الأطفال");
    }
  };

  const loadReports = async (id) => {
    if (!id) return;
    try {
      const res = await getMedicalReports(Number(id));
      setReports(res?.items || []);
    } catch {
      toast.error("فشل تحميل التقارير");
    }
  };

  useEffect(() => {
    loadChildren();
  }, []);

  const handleCreate = async () => {
    if (!childId || !file) {
      toast.error("اختر الطفل وارفع ملف");
      return;
    }

    try {
      const upload = await uploadFile(file, {
        description: title,
        category: 3,
        childId: Number(childId),
      });

      const newReport = await createMedicalReport({
        childId: Number(childId),
        mediaId: upload.id,
        notes: title,
      });

      toast.success("تم إضافة التقرير");

      setShowForm(false);
      setTitle("");
      setFile(null);
      setReports((prev) => [
        {
          ...newReport,
          notes: title,
          createdAtUtc: new Date().toISOString(),
        },
        ...prev,
      ]);
    } catch (err) {
      console.log(err);
      toast.error("فشل الإضافة");
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteMedicalReport(id);
      setReports((prev) => prev.filter((r) => r.id !== id));

      toast.success("تم الحذف");
    } catch {
      toast.error("فشل الحذف");
    }
  };

  const handleDownload = async (id) => {
    try {
      const result = await downloadMedicalReport(id);

      if (typeof result === "string") {
        window.open(result, "_blank");
      } else {
        const url = window.URL.createObjectURL(result);
        window.open(url);
      }
    } catch {
      toast.error("فشل التحميل");
    }
  };

  let filteredReports = [...reports];

  if (search) {
    filteredReports = filteredReports.filter((r) =>
      r.notes?.toLowerCase().includes(search.toLowerCase()),
    );
  }

  if (filter === "new") {
    filteredReports.sort(
      (a, b) => new Date(b.createdAtUtc) - new Date(a.createdAtUtc),
    );
  }

  if (filter === "old") {
    filteredReports.sort(
      (a, b) => new Date(a.createdAtUtc) - new Date(b.createdAtUtc),
    );
  }

  if (filter === "today") {
    const today = new Date().toDateString();
    filteredReports = filteredReports.filter(
      (r) => new Date(r.createdAtUtc).toDateString() === today,
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h2>التقارير الطبية</h2>
          <p>مراجعة وإدارة التقارير</p>
        </div>

        <button className={styles.addBtn} onClick={() => setShowForm(true)}>
          + إنشاء تقرير
        </button>
      </div>

      <div className={styles.tools}>
        <select
          className={styles.filterBtn}
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="all">الكل</option>
          <option value="new">الأحدث</option>
          <option value="old">الأقدم</option>
          <option value="today">اليوم</option>
        </select>

        <input
          className={styles.search}
          placeholder="بحث..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className={styles.list}>
        {filteredReports.length === 0 ? (
          <p>لا توجد تقارير</p>
        ) : (
          filteredReports.map((r) => (
            <div key={r.id} className={styles.card}>
              <div className={styles.right}>
                <h4>{r.notes || "تقرير طبي"}</h4>
                <span>
                  {new Date(r.createdAtUtc).toLocaleDateString("ar-EG")}
                </span>
              </div>

              <div className={styles.left}>
                <button onClick={() => handleDownload(r.id)}>عرض</button>

                <button
                  className={styles.delete}
                  onClick={() => handleDelete(r.id)}
                >
                  حذف
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {showForm && (
        <div className={styles.overlay}>
          <div className={styles.modal}>
            <h3>إضافة تقرير</h3>

            <select
              value={childId}
              onChange={(e) => {
                const id = Number(e.target.value);
                setChildId(id);
                loadReports(id);
              }}
            >
              <option value="">اختر الطفل</option>
              {children.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.fullName}
                </option>
              ))}
            </select>

            <input
              placeholder="عنوان التقرير"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />

            <input
              type="file"
              accept=".pdf"
              onChange={(e) => setFile(e.target.files[0])}
            />

            <div className={styles.modalActions}>
              <button onClick={handleCreate}>رفع التقرير</button>
              <button onClick={() => setShowForm(false)}>إلغاء</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default SpecialistReports;
