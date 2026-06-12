import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { resetPassword } from "../../api/authService";
import logo from "../../assets/images/logo.png";
import "../../assets/login.css";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import toast from "react-hot-toast";

function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const urlEmail = searchParams.get("email");
  const rawToken = searchParams.get("token") || "";
  const token = decodeURIComponent(rawToken);

  const [email, setEmail] = useState("");
  const [manualEmail, setManualEmail] = useState("");
  const [showEmailInput, setShowEmailInput] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    if (!token) {
      toast.error("الرابط غير صالح ❌");
      navigate("/forgot-password");
      return;
    }

    if (urlEmail) {
      setEmail(urlEmail);
    } else {
      const savedEmail = localStorage.getItem("resetEmail");
      if (savedEmail) {
        setEmail(savedEmail);
      } else {
        setShowEmailInput(true);
      }
    }
  }, [urlEmail, token, navigate]);

  const handleManualEmailSubmit = () => {
    if (!manualEmail.trim()) {
      toast.error("من فضلك أدخل البريد الإلكتروني ❌");
      return;
    }
    if (!/\S+@\S+\.\S+/.test(manualEmail)) {
      toast.error("صيغة البريد الإلكتروني غير صحيحة ❌");
      return;
    }
    setEmail(manualEmail);
    setShowEmailInput(false);
  };

  if (showEmailInput) {
    return (
      <div className="login">
        <div className="login-right">
          <div className="form-box">
            <div className="signup-header">
              <div className="logo-container">
                <div className="logo-circle">
                  <img src={logo} alt="logo" />
                </div>
                <span className="logo-text">رفيق</span>
              </div>

              <h2 className="signup-title">تأكيد البريد الإلكتروني</h2>
              <p className="signup-subtitle">
                من فضلك أدخل بريدك الإلكتروني لإعادة تعيين كلمة السر
              </p>
            </div>

            <div className="input-box">
              <input
                type="email"
                placeholder="البريد الإلكتروني"
                value={manualEmail}
                onChange={(e) => setManualEmail(e.target.value)}
                disabled={loading}
              />
            </div>

            <button className="login-btns" onClick={handleManualEmailSubmit}>
              تأكيد
            </button>

            <p className="register">
              <span onClick={() => navigate("/login")}>عودة لتسجيل الدخول</span>
            </p>
          </div>
        </div>

        <div className="login-left">
          <div className="overlay">
            <h2>
              صحة طفلك
              <br />
              في أيدي أمينة.
            </h2>
            <p>
              انضم إلى مجتمع رفيق واستفد من أحدث التقنيات في متابعة وعلاج الأطفال.
            </p>
            <div className="features">
              <div className="feature">✔ خطط علاجية معتمدة</div>
              <div className="feature">✔ تواصل مع الأخصائيين</div>
              <div className="feature">✔ تقارير دورية</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!password || !confirmPassword) {
      toast.error("املى كل البيانات ❌");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("كلمة المرور غير متطابقة ❌");
      return;
    }

    try {
      setLoading(true);

      await resetPassword({
        email,
        token,
        newPassword: password,
      });

      localStorage.removeItem("resetEmail");

      toast.success("تم تغيير كلمة السر ✅");
      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } catch (err) {
      const errorMsg =
        err?.response?.data?.errors?.[0] ||
        err?.response?.data?.title ||
        "حدث خطأ ❌";

      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login">
      <div className="login-right">
        <div className="form-box">
          <div className="signup-header">
            <div className="logo-container">
              <div className="logo-circle">
                <img src={logo} alt="logo" />
              </div>
              <span className="logo-text">رفيق</span>
            </div>

            <h2 className="signup-title">إعادة تعيين كلمة السر</h2>
            <p className="signup-subtitle">
              أدخل كلمة المرور الجديدة
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="input-box">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="كلمة السر الجديدة"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
              <span
                className="eye"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </span>
            </div>

            <div className="input-box">
              <input
                type={showConfirm ? "text" : "password"}
                placeholder="تأكيد كلمة السر"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={loading}
              />
              <span
                className="eye"
                onClick={() => setShowConfirm(!showConfirm)}
              >
                {showConfirm ? <FaEyeSlash /> : <FaEye />}
              </span>
            </div>

            <button className="login-btns" disabled={loading}>
              {loading ? "جاري التغيير..." : "تغيير كلمة السر"}
            </button>
          </form>
        </div>
      </div>

      <div className="login-left">
        <div className="overlay">
          <h2>
            صحة طفلك
            <br />
            في أيدي أمينة.
          </h2>
          <p>
            انضم إلى مجتمع رفيق واستفد من أحدث التقنيات في متابعة وعلاج الأطفال.
          </p>
          <div className="features">
            <div className="feature">✔ خطط علاجية معتمدة</div>
            <div className="feature">✔ تواصل مع الأخصائيين</div>
            <div className="feature">✔ تقارير دورية</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ResetPassword;