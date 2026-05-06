import "../../assets/adminSettings.css";
import { useState, useEffect } from "react";
import { changePassword } from "../../api/authService";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

function AdminSettings() {
  const navigate = useNavigate();

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
  });

  const [preview, setPreview] = useState(null);

  const [notifications, setNotifications] = useState({
    appointments: true,
    messages: true,
  });

  useEffect(() => {
    const savedImage = localStorage.getItem("profileImage");
    const savedNotifications = localStorage.getItem("notifications");

    if (savedImage) setPreview(savedImage);
    if (savedNotifications) setNotifications(JSON.parse(savedNotifications));
  }, []);

  const handleImageChange = (file) => {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("ارفع صورة فقط ❌");
      return;
    }

    const maxSize = 2 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error("حجم الصورة كبير ❌");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result);
      localStorage.setItem("profileImage", reader.result);
    };

    reader.readAsDataURL(file);
  };

  const handleSaveSettings = () => {
    localStorage.setItem("notifications", JSON.stringify(notifications));
    toast.success("تم الحفظ ✅");
  };

  const handleChangePassword = async () => {
    if (!passwordForm.currentPassword || !passwordForm.newPassword) {
      toast.error("كمل البيانات ❌");
      return;
    }

    try {
      await changePassword(passwordForm);
      toast.success("تم تغيير كلمة المرور 🔒");

      localStorage.removeItem("token");

      setTimeout(() => {
        navigate("/login");
      }, 1000);

      setPasswordForm({ currentPassword: "", newPassword: "" });
    } catch {
      toast.error("فشل ❌");
    }
  };

  return (
    <div className="settings-page">
      <div className="card profile-card">
        <h3>الملف المهني</h3>

        <div className="profile-wrapper">
          <label className="image-box">
            <input
              type="file"
              hidden
              onChange={(e) => handleImageChange(e.target.files[0])}
            />

            {preview ? <img src={preview} alt="preview" /> : <span>📷</span>}

            <div className="overlay">تغيير</div>
          </label>
        </div>

        <button className="btn primary" onClick={handleSaveSettings}>
          حفظ التغييرات
        </button>
      </div>

      <div className="card">
        <h3>الإشعارات والتنبيهات</h3>

        <div className="notif-item">
          <span>تنبيهات المواعيد</span>
          <div
            className={`switch ${notifications.appointments ? "active" : ""}`}
            onClick={() =>
              setNotifications({
                ...notifications,
                appointments: !notifications.appointments,
              })
            }
          />
        </div>

        <div className="notif-item">
          <span>رسائل المرضى</span>
          <div
            className={`switch ${notifications.messages ? "active" : ""}`}
            onClick={() =>
              setNotifications({
                ...notifications,
                messages: !notifications.messages,
              })
            }
          />
        </div>
      </div>

      <div className="card">
        <h3>الأمان</h3>

        <div className="input-group">
          <input
            type="password"
            placeholder="كلمة المرور الحالية"
            value={passwordForm.currentPassword}
            onChange={(e) =>
              setPasswordForm({
                ...passwordForm,
                currentPassword: e.target.value,
              })
            }
          />
        </div>

        <div className="input-group">
          <input
            type="password"
            placeholder="كلمة المرور الجديدة"
            value={passwordForm.newPassword}
            onChange={(e) =>
              setPasswordForm({ ...passwordForm, newPassword: e.target.value })
            }
          />
        </div>

        <button className="btn primary" onClick={handleChangePassword}>
          تغيير كلمة المرور
        </button>
      </div>
    </div>
  );
}

export default AdminSettings;
