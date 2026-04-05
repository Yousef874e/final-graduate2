import "../../assets/adminDashboard.css"
import { useEffect, useState } from "react"
import { getAdminDashboard } from "../../api/dashboardService"
import { getSystemMonitoring } from "../../api/adminService"
import toast from "react-hot-toast"

function AdminDashboard() {

  const [data, setData] = useState({})
  const [system, setSystem] = useState({})

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {

    const t = toast.loading("جاري التحميل...")

    try {
      const dash = await getAdminDashboard()
      setData(dash)

      const sys = await getSystemMonitoring()
      setSystem(sys)

      toast.success("تم التحميل ✅", { id: t })

    } catch {
      toast.error("فشل التحميل ❌", { id: t })
    }
  }

  return (
    <div className="admin-page">

      <div className="top-row">
        <div>
          <p>تاريخ اليوم</p>
          <h4>{new Date().toLocaleDateString("ar-EG")}</h4>
        </div>

        <h2>👋 مرحبًا</h2>
      </div>

      <div className="banner">
        <div>
          <h1>لوحة الإدارة</h1>
          <p>مركز متابعة شامل للنظام</p>

          <div className="tags">
            <span>API مستقر</span>
            <span>SignalR متصل</span>
            <span>آخر تحديث الآن</span>
          </div>
        </div>
      </div>

      <div className="alert">
        يوجد {data.activeIssues || 0} مشاكل نشطة تحتاج متابعة فورية
      </div>

      <div className="stats">

        <div className="card red">
          <h3>{data.activeIssues || 0}</h3>
          <p>مشاكل نشطة</p>
        </div>

        <div className="card yellow">
          <h3>{data.pendingReports || 0}</h3>
          <p>تقارير تحتاج متابعة</p>
        </div>

        <div className="card green">
          <h3>{data.todaySessions || 0}</h3>
          <p>جلسات اليوم</p>
        </div>

        <div className="card blue">
          <h3>{data.totalUsers || 0}</h3>
          <p>إجمالي المستخدمين</p>
        </div>

      </div>

      <div className="bottom">

        <div className="activities">
          <h3>آخر الأنشطة</h3>

          <div className="activity green">
            مستخدم جديد - منذ 5 دقائق
          </div>

          <div className="activity blue">
            رفع تقرير - منذ 11 دقيقة
          </div>

          <div className="activity red">
            جلسة فاشلة - منذ 20 دقيقة
          </div>

        </div>

        <div className="system">
          <h3>حالة المنظومة</h3>

          <div className="status">
            <span>API Health</span>
            <span>{system.apiStatus || "مستقر"}</span>
          </div>

          <div className="status">
            <span>SignalR Hub</span>
            <span>{system.signalR || "متصل"}</span>
          </div>

          <div className="status">
            <span>Queue Jobs</span>
            <span>{system.queue || "قيد التنفيذ"}</span>
          </div>

        </div>

      </div>

    </div>
  )
}

export default AdminDashboard