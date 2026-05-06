import "../../assets/register.css";
import logo from "../../assets/images/logo.png";
import sideImg from "../../assets/images/ggg.png";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaUser, FaPhone, FaEye, FaEyeSlash } from "react-icons/fa";
import { MdEmail } from "react-icons/md";
import { FcGoogle } from "react-icons/fc";
import { IoArrowForward } from "react-icons/io5";
import { registerParent, registerSpecialist } from "../../api/authService";
import { setAuth } from "../../utils/auth";
import { triggerGoogleLogin } from "../../utils/googleAuth";
import toast from "react-hot-toast";

function RegisterPage() {
  const navigate = useNavigate();

  const [role, setRole] = useState("parent");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    password: "",
    confirmPassword: "",
    specialization: "",
    bio: "",
  });

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const isValidEmail = (email) => /\S+@\S+\.\S+/.test(email);
  const isValidPhone = (phone) => /^[0-9]{10,15}$/.test(phone);
  const isValidPassword = (password) =>
    password.length >= 8 && /[A-Z]/.test(password) && /[0-9]/.test(password);
  const isValidText = (text) => text && text.trim().length >= 3;
  const isValidBio = (text) => {
    if (!text || text.trim().length < 5) return false;
    if (!/[a-zA-Z\u0600-\u06FF]/.test(text)) return false;
    if (text.trim().split(" ").length < 2) return false;
    if (/^(.)\1+$/.test(text)) return false;
    return true;
  };

  const handleRegister = async () => {
    if (!isValidText(form.fullName)) {
      toast.error("اكتب اسم واضح");
      return;
    }

    if (!isValidEmail(form.email)) {
      toast.error("اكتب بريد إلكتروني صحيح");
      return;
    }

    if (role === "parent") {
      if (!isValidPhone(form.phone)) {
        toast.error("اكتب رقم موبايل صحيح");
        return;
      }

      if (!isValidText(form.address)) {
        toast.error("اكتب عنوان واضح");
        return;
      }
    }

    if (role === "specialist") {
      if (!isValidText(form.specialization)) {
        toast.error("اكتب تخصص واضح");
        return;
      }

      if (!isValidBio(form.bio)) {
        toast.error("اكتب نبذة مفهومة");
        return;
      }
    }

    if (!isValidPassword(form.password)) {
      toast.error("كلمة المرور لازم تكون 8 حروف وتحتوي على رقم وحرف كبير");
      return;
    }

    if (form.password !== form.confirmPassword) {
      toast.error("كلمة المرور مش متطابقة");
      return;
    }

    setLoading(true);

    try {
      let res;

      if (role === "parent") {
        res = await registerParent({
          fullName: form.fullName,
          email: form.email,
          password: form.password,
          phoneNumber: form.phone,
          address: form.address,
        });
      } else {
        res = await registerSpecialist({
          fullName: form.fullName,
          email: form.email,
          password: form.password,
          specialization: form.specialization,
          bio: form.bio || "Specialist",
        });
      }

      if (res.requiresPasswordChange) {
        navigate("/reset-password");
        return;
      }

      localStorage.setItem(`userName_${form.email}`, form.fullName);

      setAuth(res);

      const roleName = res?.roles?.[0];

      if (roleName === "Parent") {
        navigate("/child-info-step1");
      } else if (roleName === "Specialist") {
        navigate("/dashboard/specialist");
      } else {
        toast.error("Role غير معروف");
      }
    } catch {
      toast.error("فيه خطأ");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    triggerGoogleLogin();
  };

  return (
    <div className="signup-container">
      <div className="signup-right">
        <div className="signup-box">
          <div className="signup-header">
            <div className="logo-container">
              <div className="logo-circle">
                <img src={logo} alt="logo" />
              </div>
              <span className="logo-text">رفيق</span>
            </div>

            <h2 className="signup-title">إنشاء حساب جديد</h2>
            <p className="signup-subtitle">ابدأ رحلتك مع رفيق اليوم</p>
          </div>

          <div className="role-switch">
            <button
              className={`role-btn ${role === "parent" ? "active" : ""}`}
              onClick={() => setRole("parent")}
              type="button"
            >
              <FaUser /> ولي أمر
            </button>

            <button
              className={`role-btn ${role === "specialist" ? "active" : ""}`}
              onClick={() => setRole("specialist")}
              type="button"
            >
              👨‍⚕️ أخصائي
            </button>
          </div>

          <div className="field-box">
            <FaUser className="field-icon" />
            <input
              type="text"
              name="fullName"
              placeholder="الاسم الكامل"
              value={form.fullName}
              onChange={handleChange}
            />
          </div>

          <div className="field-box">
            <MdEmail className="field-icon" />
            <input
              type="email"
              name="email"
              placeholder="البريد الإلكتروني"
              value={form.email}
              onChange={handleChange}
            />
          </div>

          {role === "parent" && (
            <>
              <div className="field-box">
                <FaPhone className="field-icon" />
                <input
                  type="text"
                  name="phone"
                  placeholder="رقم الجوال"
                  value={form.phone}
                  onChange={handleChange}
                />
              </div>

              <div className="field-box">
                <input
                  type="text"
                  name="address"
                  placeholder="العنوان"
                  value={form.address}
                  onChange={handleChange}
                />
              </div>
            </>
          )}

          {role === "specialist" && (
            <>
              <div className="field-box">
                <input
                  type="text"
                  name="specialization"
                  placeholder="التخصص"
                  value={form.specialization}
                  onChange={handleChange}
                />
              </div>

              <div className="field-box">
                <input
                  type="text"
                  name="bio"
                  placeholder="نبذة عنك"
                  value={form.bio}
                  onChange={handleChange}
                />
              </div>
            </>
          )}

          <div className="field-box">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="كلمة المرور"
              value={form.password}
              onChange={handleChange}
            />
            <span
              className="eye"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>

          <div className="field-box">
            <input
              type={showConfirm ? "text" : "password"}
              name="confirmPassword"
              placeholder="تأكيد كلمة المرور"
              value={form.confirmPassword}
              onChange={handleChange}
            />
            <span className="eye" onClick={() => setShowConfirm(!showConfirm)}>
              {showConfirm ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>

          <button
            className="main-btn"
            onClick={handleRegister}
            disabled={loading}
            type="button"
          >
            {loading
              ? "جاري الإنشاء..."
              : `إنشاء حساب ${role === "parent" ? "ولي أمر" : "أخصائي"}`}
            <IoArrowForward />
          </button>

          <div className="split-line">أو سجل عن طريق</div>

          <div className="social-box">
            <button onClick={handleGoogleLogin} type="button">
              <FcGoogle /> تسجيل بجوجل
            </button>
          </div>

          <p className="login-redirect">
            لديك حساب؟
            <span onClick={() => navigate("/login")}>سجل الدخول</span>
          </p>
        </div>
      </div>

      <div className="signup-left">
        <img src={sideImg} alt="img" />
        <h3>مجتمع داعم ومتكامل</h3>
        <p>انضم لأكثر من 5000 عائلة تشارك نفس الرحله والاهتمامات</p>
      </div>
    </div>
  );
}

export default RegisterPage;
