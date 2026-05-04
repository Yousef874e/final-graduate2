import "../../assets/adminReports.css"
import { useEffect, useState } from "react"
import { FaDownload, FaPlus } from "react-icons/fa"
import toast from "react-hot-toast"

import { getChildren } from "../../api/childrenService"
import {
  getMedicalReports,
  createMedicalReport,
  downloadMedicalReport
} from "../../api/medicalReportsService"
import { uploadFile } from "../../api/mediaService"

function AdminReports() {
  const [reports, setReports] = useState([])
  const [children, setChildren] = useState([])
  const [search, setSearch] = useState("")
  const [showModal, setShowModal] = useState(false)

  const [form, setForm] = useState({
    childId: "",
    notes: "",
    file: null
  })

  useEffect(() => {
    loadChildren()
  }, [])

  const loadChildren = async () => {
    try {
      const res = await getChildren()
      setChildren(res.items || [])
    } catch {
      toast.error("فشل تحميل الأطفال ❌")
    }
  }

  const loadReports = async (childId) => {
    if (!childId) return

    try {
      const res = await getMedicalReports(childId, {
        pageNumber: 1,
        pageSize: 50
      })
      setReports(res.items || [])
    } catch {
      toast.error("فشل تحميل التقارير ❌")
    }
  }

  const handleDownload = async (id) => {
    try {
      const url = await downloadMedicalReport(id)
      window.open(url, "_blank")
    } catch {
      toast.error("فشل تحميل التقرير ❌")
    }
  }

  const handleUpload = async () => {
    if (!form.childId || !form.file) {
      toast.error("كمل البيانات ❌")
      return
    }

    try {
      const uploadRes = await uploadFile(
        form.file,
        {
          description: form.notes,
          category: 3,
          childId: Number(form.childId)
        }
      )

      await createMedicalReport({
        childId: Number(form.childId),
        mediaId: uploadRes.id,
        notes: form.notes || ""
      })

      toast.success("تم رفع التقرير ✅")

      setShowModal(false)

      await loadReports(form.childId)

      setForm({
        childId: "",
        notes: "",
        file: null
      })
    } catch (err) {
      console.log(err.response?.data)
      toast.error("فشل رفع التقرير ❌")
    }
  }

  const filteredReports = reports.filter(r =>
    r.notes?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="reports-page">
      <div className="reports-header">
        <h2>التقارير الطبية</h2>
        <button className="add-btn" onClick={() => setShowModal(true)}>
          <FaPlus /> إنشاء تقرير
        </button>
      </div>

      <div className="reports-tools">
        <input
          placeholder="بحث..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="reports-list">
        {filteredReports.length === 0 ? (
          <p>لا يوجد تقارير</p>
        ) : (
          filteredReports.map(r => (
            <div className="report-card" key={r.id}>
              <div className="report-info">
                <h4>{r.notes || "تقرير"}</h4>
                <p>{new Date(r.createdAtUtc).toLocaleDateString()}</p>
              </div>

              <div className="report-actions">
                <button onClick={() => handleDownload(r.id)}>
                  <FaDownload />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {showModal && (
        <div className="modal">
          <div className="modal-content">
            <h3>إضافة تقرير</h3>

            <select
              value={form.childId}
              onChange={(e) => {
                setForm({ ...form, childId: e.target.value })
                loadReports(e.target.value)
              }}
            >
              <option value="">اختر الطفل</option>
              {children.map(c => (
                <option key={c.id} value={c.id}>
                  {c.fullName}
                </option>
              ))}
            </select>

            <textarea
              placeholder="ملاحظات"
              value={form.notes}
              onChange={(e) =>
                setForm({ ...form, notes: e.target.value })
              }
            />

            <input
              type="file"
              accept="application/pdf"
              onChange={(e) =>
                setForm({ ...form, file: e.target.files[0] })
              }
            />

            <button className="upload-btn" onClick={handleUpload}>
              رفع
            </button>

            <button className="close-btn" onClick={() => setShowModal(false)}>
              إغلاق
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminReports