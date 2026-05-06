import "../../assets/login.css";
import logo from "../../assets/images/logo.png";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { MdEmail } from "react-icons/md";
import { IoArrowForward } from "react-icons/io5";
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { login, googleLogin } from "../../api/authService";
import { setAuth } from "../../utils/auth";
import { initGoogleAuth, renderGoogleButton } from "../../utils/googleAuth";
import toast from "react-hot-toast";

function LoginPage() {
  const navigate = useNavigate();
  const googleBtnRef = useRef(null);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleGoogleCallback = async (response) => {
    try {
      const res = await googleLogin(response.credential);

      setAuth(res);

      const role = res?.roles?.[0];

      toast.success("تم تسجيل الدخول بجوجل ✅");

      if (role === "Admin") {
        navigate("/dashboard/admin", { replace: true });
      } else if (role === "Parent") {
        navigate("/dashboard/parent", { replace: true });
      } else if (role === "Specialist") {
        navigate("/dashboard/specialist", { replace: true });
      }
    } catch {
      toast.error("فشل تسجيل الدخول بجوجل ❌");
    }
  };

  useEffect(() => {
    initGoogleAuth(handleGoogleCallback);

    setTimeout(() => {
      renderGoogleButton(googleBtnRef.current);
    }, 300);
  }, []);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      toast.error("من فضلك املأ البيانات ❌");
      return;
    }

    try {
      setLoading(true);

      const data = await login({
        email: email.trim(),
        password: password.trim(),
      });

      if (data.requiresPasswordChange) {
        toast("لازم تغير كلمة المرور 🔐");
        navigate("/reset-password");
        return;
      }

      setAuth(data);

      const role = data.roles?.[0] || data.role;

      if (!role) {
        toast.error("Role غير معروف ❌");
        return;
      }

      toast.success("تم تسجيل الدخول ✅");

      if (role === "Admin") {
        navigate("/dashboard/admin", { replace: true });
      } else if (role === "Parent") {
        navigate("/dashboard/parent", { replace: true });
      } else if (role === "Specialist") {
        navigate("/dashboard/specialist", { replace: true });
      } else {
        navigate("/", { replace: true });
      }
    } catch (err) {
      const errorMsg =
        err?.response?.data?.errors?.[0] ||
        err?.response?.data?.title ||
        err?.message ||
        "فشل تسجيل الدخول ❌";

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

            <h2 className="signup-title">مرحبا بعودتك</h2>
            <p className="signup-subtitle">سجل الدخول للمتابعة</p>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleLogin();
            }}
          >
            <div className="input-box">
              <MdEmail className="input-icon" />
              <input
                type="email"
                placeholder="البريد الإلكتروني"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
            </div>

            <div className="input-box">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="كلمة السر"
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

            <div
              className="forget"
              onClick={() => navigate("/forgot-password")}
            >
              نسيت كلمة السر؟
            </div>

            <button type="submit" className="login-btns" disabled={loading}>
              {loading ? "جاري تسجيل الدخول..." : "تسجيل الدخول"}
              <IoArrowForward />
            </button>
          </form>

          <div className="divider">أو</div>

          <div
            ref={googleBtnRef}
            style={{
              display: "flex",
              justifyContent: "center",
              marginTop: "8px",
            }}
          />

          <p className="register">
            ليس لديك حساب؟
            <span onClick={() => navigate("/register/parent")}>أنشئ حساب</span>
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

export default LoginPage;
