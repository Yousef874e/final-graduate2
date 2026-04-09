import "../../assets/adminDashboard.css"
import { useEffect, useState } from "react"
import { getAdminDashboard } from "../../api/dashboardService"
import { getSystemMonitoring } from "../../api/adminService"
import { FaExclamationTriangle, FaFileAlt, FaCalendar, FaUsers,  } from "react-icons/fa"
import banner from "../../assets/images/banner.png"

function AdminDashboard() {
  const [data, setData] = useState({})
  const [system, setSystem] = useState({})
  
  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const dash = await getAdminDashboard()
      const sys = await getSystemMonitoring()
      setData(dash)
      setSystem(sys)
    } catch (e) {
      console.log(e)
    }
  }

  return (
    <div className="admin-page">

      <div className="top-row">
        <h2>مرحبًا</h2>
        <div className="date-box">
          <p>تاريخ اليوم</p>
          <h4>{data?.todayDate || "-"}</h4>
        </div>
      </div>

      <div className="banner-img">
        <img src={banner} alt="banner" />
      </div>
<div className="alert">
  يوجد {data?.activeIssues || 0} مشاكل نشطة تحتاج متابعة فورية
</div>

      <div className="stats">
        <div className="card">
          <FaExclamationTriangle />
          <h3>{data?.activeIssues || 0}</h3>
          <p>مشاكل نشطة</p>
        </div>

        <div className="card">
          <FaFileAlt />
          <h3>{data?.pendingReports || 0}</h3>
          <p>تقارير</p>
        </div>

        <div className="card">
          <FaCalendar />
          <h3>{data?.todaySessions || 0}</h3>
          <p>جلسات اليوم</p>
        </div>

        <div className="card">
          <FaUsers />
          <h3>{data?.totalUsers || 0}</h3>
          <p>المستخدمين</p>
        </div>
      </div>

      <div className="bottom">

        <div className="activities">
          {(data?.recentActivities || []).map((a, i) => (
            <div key={i} className="activity-item">{a.description}</div>
          ))}
        </div>

        <div className="system">
          <div className="system-item">API: {system?.apiStatus}</div>
          <div className="system-item">SignalR: {system?.signalR}</div>
          <div className="system-item">Queue: {system?.queue}</div>
        </div>

      </div>

    </div>
  )
}

export default AdminDashboard