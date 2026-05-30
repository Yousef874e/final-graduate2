import "../../assets/adminDashboard.css";
import { useEffect, useState } from "react";
import { getAdminDashboard } from "../../api/dashboardService";
import { getSystemMonitoring } from "../../api/adminService";
import {
  FaExclamationTriangle,
  FaFileAlt,
  FaCalendar,
  FaUsers,
  FaEnvelope,
  FaTrash,
  FaEye,
  FaCheckDouble,
} from "react-icons/fa";
import { useOutletContext } from "react-router-dom";
import banner from "../../assets/images/banner.png";

function AdminDashboard() {
  const [data, setData] = useState({});
  const [system, setSystem] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [contactMessages, setContactMessages] = useState([]);
  const [showMessages, setShowMessages] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState(null);

  const { setNotifications } = useOutletContext();

  useEffect(() => {
    loadData();
    loadContactMessages();
  }, []);

  useEffect(() => {
    if (!data?.alerts) return;
    const arr = [];
    if (data.alerts.unassignedChildren > 0) {
      arr.push(`يوجد ${data.alerts.unassignedChildren} أطفال غير مرتبطين`);
    }
    if (data.alerts.childrenWithoutReports > 0) {
      arr.push(`يوجد ${data.alerts.childrenWithoutReports} أطفال بدون تقارير`);
    }
    if (data.alerts.childrenWithoutUpcomingAppointments > 0) {
      arr.push(
        `يوجد ${data.alerts.childrenWithoutUpcomingAppointments} أطفال بدون مواعيد`,
      );
    }
    setNotifications(arr);
  }, [data]);

  const loadData = async () => {
    try {
      const [dash, sys] = await Promise.all([
        getAdminDashboard(),
        getSystemMonitoring(),
      ]);
      setData(dash || {});
      setSystem(sys || {});
    } catch {
      setError("حدث خطأ");
    } finally {
      setLoading(false);
    }
  };

  const loadContactMessages = () => {
    const saved = localStorage.getItem("contact_messages");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setContactMessages(parsed.sort((a, b) => b.id - a.id));
        }
      } catch (error) {
        setContactMessages([]);
      }
    }
  };

  const markAsRead = (id) => {
    const updated = contactMessages.map(msg =>
      msg.id === id ? { ...msg, read: true } : msg
    );
    setContactMessages(updated);
    localStorage.setItem("contact_messages", JSON.stringify(updated));
  };

  const markAllAsRead = () => {
    const updated = contactMessages.map(msg => ({ ...msg, read: true }));
    setContactMessages(updated);
    localStorage.setItem("contact_messages", JSON.stringify(updated));
  };

  const deleteMessage = (id) => {
    if (window.confirm("هل أنت متأكد من حذف هذه الرسالة؟")) {
      const updated = contactMessages.filter(msg => msg.id !== id);
      setContactMessages(updated);
      localStorage.setItem("contact_messages", JSON.stringify(updated));
      if (selectedMessage?.id === id) setSelectedMessage(null);
    }
  };

  const deleteAllMessages = () => {
    if (window.confirm("هل أنت متأكد من حذف جميع الرسائل؟")) {
      setContactMessages([]);
      localStorage.removeItem("contact_messages");
      setSelectedMessage(null);
    }
  };

  const unreadCount = contactMessages.filter(msg => !msg.read).length;

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

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

      <button 
        className="messages-toggle-btn"
        onClick={() => setShowMessages(!showMessages)}
      >
        <FaEnvelope />
        الرسائل الواردة
        {unreadCount > 0 && <span className="badge">{unreadCount}</span>}
      </button>

      {showMessages && (
        <div className="messages-panel">
          <div className="messages-header">
            <h3>الرسائل الواردة من الموقع</h3>
            <div className="messages-actions">
              {contactMessages.length > 0 && (
                <>
                  <button onClick={markAllAsRead} className="msg-btn-read-all">
                    <FaCheckDouble /> تحديد الكل كمقروء
                  </button>
                  <button onClick={deleteAllMessages} className="msg-btn-delete-all">
                    <FaTrash /> حذف الكل
                  </button>
                </>
              )}
            </div>
          </div>

          <div className="messages-content">
            <div className="messages-list">
              {contactMessages.length === 0 ? (
                <div className="empty-messages">لا توجد رسائل حالياً</div>
              ) : (
                contactMessages.map(msg => (
                  <div
                    key={msg.id}
                    className={`msg-item ${!msg.read ? 'unread' : 'read'}`}
                    onClick={() => setSelectedMessage(msg)}
                  >
                    <div className="msg-name">{msg.name}</div>
                    <div className="msg-preview">
                      {msg.message.substring(0, 40)}...
                    </div>
                    <div className="msg-date">{msg.timestamp}</div>
                    {!msg.read && <span className="new-dot"></span>}
                  </div>
                ))
              )}
            </div>

            <div className="messages-detail">
              {selectedMessage ? (
                <div className="msg-detail-card">
                  <div className="msg-detail-header">
                    <h4>تفاصيل الرسالة</h4>
                    <div className="msg-detail-actions">
                      {!selectedMessage.read && (
                        <button onClick={() => markAsRead(selectedMessage.id)}>
                          <FaEye /> تحديد كمقروء
                        </button>
                      )}
                      <button onClick={() => deleteMessage(selectedMessage.id)}>
                        <FaTrash /> حذف
                      </button>
                    </div>
                  </div>
                  <div className="msg-detail-body">
                    <p><strong>الاسم:</strong> {selectedMessage.name}</p>
                    <p><strong>البريد:</strong> {selectedMessage.email}</p>
                    <p><strong>التاريخ:</strong> {selectedMessage.timestamp}</p>
                    <div className="msg-text">
                      <strong>الرسالة:</strong>
                      <p>{selectedMessage.message}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="no-selection">
                  اختر رسالة من القائمة
                </div>
              )}
            </div>
          </div>
        </div>
      )}

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
          <div className="system-item">
            إجمالي المستخدمين: {system?.totalUsers || 0}
          </div>
          <div className="system-item">
            المستخدمين النشطين: {system?.activeUsers || 0}
          </div>
          <div className="system-item">
            إجمالي الجلسات: {system?.totalSessions || 0}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
