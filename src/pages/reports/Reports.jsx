import styles from "../../assets/dashboard.module.css"
import reportStyles from "../../assets/reports.module.css"
import { useEffect, useState } from "react"
import { getMedicalReports, deleteMedicalReport } from "../../api/medicalReportsService"
import { FaBell, FaUser, FaDownload, FaTrash, FaFilePdf } from "react-icons/fa"

function Reports() {

  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)

  const childId = localStorage.getItem("childId")
  const userName = localStorage.getItem("userName") || "User"

  useEffect(() => {
    fetchReports()
  }, [])

  const fetchReports = async () => {
    try {
      const res = await getMedicalReports(childId)

      setReports(
        res.data?.items ||
        res.data?.data?.items ||
        []
      )

    } catch (err) {
      console.log(err)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm("متأكد عايز تمسح التقرير؟")) return

    try {
      await deleteMedicalReport(id)
      fetchReports()
    } catch (err) {
      console.log(err)
    }
  }

  return (
    <div className={styles.specialistsPage}>

      {/* 🔥 Top Bar */}
      <div className={styles.topBar}>
        <div className={styles.topRight}>
          <h3>لوحة التحكم</h3>
        </div>

        <div className={styles.topLeft}>
          <div className={styles.userBox}>
            <span>{userName}</span>
            <FaUser className={styles.iconCircle}/>
          </div>

          <div className={styles.iconWrapper}>
            <FaBell />
          </div>
        </div>
      </div>

      {/* 🔥 Title */}
      <h2 className={styles.pageTitle}>التقارير الطبية</h2>
      <p className={styles.pageDesc}>
        جميع التقارير الطبية الخاصة بطفلك في مكان واحد
      </p>

      {/* 🔥 List */}
      <div className={reportStyles.list}>

        {loading ? (
          <p>Loading...</p>
        ) : reports.length === 0 ? (
          <p>لا يوجد تقارير</p>
        ) : (
          reports.map((item) => (
            <div key={item.id} className={reportStyles.card}>

              {/* 🔥 Left */}
              <div className={reportStyles.left}>

                <div className={reportStyles.icon}>
                  <FaFilePdf />
                </div>

                <div>
                  <div className={reportStyles.titleRow}>
                    <h4>{item.title}</h4>

                    {/* 🔴 badge */}
                    <span className={reportStyles.badge}>جديد</span>
                  </div>

                  <p className={reportStyles.meta}>
                    {new Date(item.createdAt).toLocaleDateString("ar-EG")}
                  </p>

                  <small className={reportStyles.doctor}>
                    {item.doctorName || "بدون دكتور"}
                  </small>
                </div>

              </div>

              {/* 🔥 Actions */}
              <div className={reportStyles.actions}>

                <button
                  onClick={() => window.open(item.fileUrl)}
                >
                  <FaDownload />
                </button>

                <button
                  onClick={() => handleDelete(item.id)}
                >
                  <FaTrash />
                </button>

              </div>

            </div>
          ))
        )}

      </div>

    </div>
  )
}

export default Reports