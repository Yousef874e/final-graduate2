import "../../assets/login.css"
import logo from "../../assets/images/logo.png"
import { FaEye, FaEyeSlash, FaGoogle } from "react-icons/fa"
import { MdEmail } from "react-icons/md"
import { IoArrowForward } from "react-icons/io5"
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { login } from "../../api/authService"
import toast from "react-hot-toast"

function LoginPage() {

  const navigate = useNavigate()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleLogin = async () => {

    if (!email || !password) {
      toast.error("من فضلك املأ البيانات ❌")
      return
    }

    try {
      setLoading(true)

      const data = await login({ email, password })

      localStorage.setItem("accessToken", data.accessToken)
      localStorage.setItem("refreshToken", data.refreshToken)

      if (data.requiresPasswordChange) {
        toast("لازم تغير كلمة المرور 🔐")
        setLoading(false)
        navigate("/reset-password")
        return
      }

      const role = data.roles?.[0]

      if (role === "Admin") {
        navigate("/dashboard/admin")
      } else if (role === "Parent") {
        navigate("/dashboard/parent")
      } else if (role === "Specialist") {
        navigate("/dashboard/specialist")
      } else {
        toast.error("Role غير معروف ❌")
        return
      }

      toast.success("تم تسجيل الدخول ✅")

    } catch (err) {

      const errorMsg =
        err.response?.data?.errors?.[0] ||
        err.response?.data?.title ||
        "فشل تسجيل الدخول ❌"

      toast.error(errorMsg)

    } finally {
      setLoading(false)
    }
  }

  const handleGoogleLogin = () => {
    toast("قريبًا تسجيل الدخول بجوجل 🚀")
  }

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

          <form onSubmit={(e) => { e.preventDefault(); handleLogin() }}>

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
              <span className="eye" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </span>
            </div>

            <div className="forget" onClick={() => navigate("/forgot-password")}>
              نسيت كلمة السر؟
            </div>

            <button type="submit" className="login-btns" disabled={loading}>
              {loading ? "جاري تسجيل الدخول..." : "تسجيل الدخول"}
              <IoArrowForward />
            </button>

          </form>

          <div className="divider">أو</div>

          <button className="google-btn" onClick={handleGoogleLogin}>
            <FaGoogle />
            تسجيل الدخول بجوجل
          </button>

          <p className="register">
            ليس لديك حساب؟
            <span onClick={() => navigate("/register/parent")}>
              أنشئ حساب
            </span>
          </p>

        </div>
      </div>

      <div className="login-left">
        <div className="overlay">

          <h2>صحة طفلك<br />في أيدي أمينة.</h2>

          <p>
            انضم إلى مجتمع رفيق واستفد من أحدث التقنيات
            في متابعة وعلاج الأطفال.
          </p>

          <div className="features">
            <div className="feature">✔ خطط علاجية معتمدة</div>
            <div className="feature">✔ تواصل مع الأخصائيين</div>
            <div className="feature">✔ تقارير دورية</div>
          </div>

        </div>
      </div>

    </div>
  )
}

export default LoginPage