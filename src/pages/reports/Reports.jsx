import styles from "../../assets/dashboard.module.css"
import reportStyles from "../../assets/reports.module.css"
import { useEffect, useState } from "react"
import { getMedicalReports, deleteMedicalReport, downloadMedicalReport } from "../../api/medicalReportsService"
import { FaDownload, FaTrash, FaFilePdf, FaEye } from "react-icons/fa"
import toast from "react-hot-toast"

function Reports() {

  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [previewUrl, setPreviewUrl] = useState(null)

  const childId = localStorage.getItem("childId")

  useEffect(() => {
    fetchReports()
  }, [])

  const fetchReports = async () => {
    try {
      const res = await getMedicalReports(childId)
      setReports(res.data?.items || res.data?.data?.items || [])
    } catch {
      toast.error("فشل تحميل التقارير")
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm("متأكد عايز تمسح التقرير؟")) return
    try {
      await deleteMedicalReport(id)
      setReports(prev => prev.filter(r => r.id !== id))
      toast.success("تم حذف التقرير")
    } catch {
      toast.error("فشل حذف التقرير")
    }
  }

  const handleDownload = async (id) => {
    try {
      const blob = await downloadMedicalReport(id)
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = "report.pdf"
      document.body.appendChild(link)
      link.click()
      link.remove()
    } catch {
      toast.error("فشل تحميل التقرير")
    }
  }

  const handlePreview = async (id) => {
    try {
      const blob = await downloadMedicalReport(id)
      const url = window.URL.createObjectURL(blob)
      setPreviewUrl(url)
    } catch {
      toast.error("فشل فتح التقرير")
    }
  }

  return (
    <div className={styles.specialistsPage}>

      <h2 className={styles.pageTitle}>التقارير الطبية</h2>
      <p className={styles.pageDesc}>
        جميع التقارير الطبية الخاصة بطفلك في مكان واحد
      </p>

      <div className={reportStyles.list}>

        {loading ? (
          <p>Loading...</p>
        ) : reports.length === 0 ? (
          <p>لا يوجد تقارير</p>
        ) : (
          reports.map((item) => (
            <div key={item.id} className={reportStyles.card}>

              <div className={reportStyles.left}>

                <div className={reportStyles.icon}>
                  <FaFilePdf />
                </div>

                <div>
                  <div className={reportStyles.titleRow}>
                    <h4>{item.notes || "تقرير طبي"}</h4>
                    <span className={reportStyles.badge}>جديد</span>
                  </div>

                  <p className={reportStyles.meta}>
                    {new Date(item.createdAtUtc).toLocaleDateString("ar-EG")}
                  </p>
                </div>

              </div>

              <div className={reportStyles.actions}>

                <button onClick={() => handlePreview(item.id)}>
                  <FaEye />
                </button>

                <button onClick={() => handleDownload(item.id)}>
                  <FaDownload />
                </button>

                <button onClick={() => handleDelete(item.id)}>
                  <FaTrash />
                </button>

              </div>

            </div>
          ))
        )}

      </div>

      {previewUrl && (
        <div className={reportStyles.previewOverlay} onClick={() => setPreviewUrl(null)}>
          <div className={reportStyles.previewBox} onClick={(e) => e.stopPropagation()}>
            <iframe src={previewUrl} title="preview" />
          </div>
        </div>
      )}

    </div>
  )
}

export default Reports