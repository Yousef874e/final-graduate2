import "../../assets/adminDashboard.css"
import { useEffect, useState } from "react"
import { getAdminDashboard } from "../../api/dashboardService"
import { getSystemMonitoring } from "../../api/adminService"
import { FaExclamationTriangle, FaFileAlt, FaCalendar, FaUsers } from "react-icons/fa"
import banner from "../../assets/images/banner.png"

function AdminDashboard() {
  const [data, setData] = useState({})
  const [system, setSystem] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [dash, sys] = await Promise.all([
        getAdminDashboard(),
        getSystemMonitoring()
      ])
      setData(dash || {})
      setSystem(sys || {})
    } catch {
      setError("حدث خطأ")
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div>Loading...</div>
  if (error) return <div>{error}</div>

  return (
    <div className="admin-page">

      <div className="top-row">
        <h2>مرحبًا</h2>
        <div className="date-box">
          <p>تاريخ اليوم</p>
          <h4>{new Date().toLocaleDateString()}</h4>
        </div>
      </div>

      <div className="banner-img">
        <img src={banner} alt="banner" />
      </div>

      {data?.alerts?.unassignedChildren > 0 && (
        <div className="alert">
          يوجد {data.alerts.unassignedChildren} أطفال غير مرتبطين تحتاج متابعة
        </div>
      )}

      {data?.alerts?.childrenWithoutReports > 0 && (
        <div className="alert">
          يوجد {data.alerts.childrenWithoutReports} أطفال بدون تقارير
        </div>
      )}

      <div className="stats">

        <div className="card">
          <FaExclamationTriangle />
          <h3>{data?.alerts?.childrenWithoutUpcomingAppointments || 0}</h3>
          <p>مشاكل (مواعيد)</p>
        </div>

        <div className="card">
          <FaFileAlt />
          <h3>{data?.overview?.totalMedicalReports || 0}</h3>
          <p>تقارير</p>
        </div>

        <div className="card">
          <FaCalendar />
          <h3>{data?.overview?.totalAppointments || 0}</h3>
          <p>المواعيد</p>
        </div>

        <div className="card">
          <FaUsers />
          <h3>{data?.overview?.totalChildren || 0}</h3>
          <p>الأطفال</p>
        </div>

      </div>

      <div className="bottom">

        <div className="activities">
          <div className="activity-item">
            عدد الجلسات: {data?.overview?.totalSessions || 0}
          </div>
          <div className="activity-item">
            عدد الأخصائيين: {data?.overview?.totalSpecialists || 0}
          </div>
          <div className="activity-item">
            عدد أولياء الأمور: {data?.overview?.totalParents || 0}
          </div>
          <div className="activity-item">
            متوسط الجلسات لكل طفل: {data?.engagement?.averageSessionsPerChild || 0}
          </div>
          <div className="activity-item">
            متوسط التقارير لكل طفل: {data?.engagement?.averageReportsPerChild || 0}
          </div>
        </div>

        <div className="system">
          <div className="system-item">إجمالي المستخدمين: {system?.totalUsers || 0}</div>
          <div className="system-item">المستخدمين النشطين: {system?.activeUsers || 0}</div>
          <div className="system-item">إجمالي الجلسات: {system?.totalSessions || 0}</div>
        </div>

      </div>

    </div>
  )
}

export default AdminDashboard