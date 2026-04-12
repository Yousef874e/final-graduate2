import { useState } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { resetPassword } from "../../api/authService"
import logo from "../../assets/images/logo.png"
import "../../assets/login.css"
import { FaEye, FaEyeSlash } from "react-icons/fa"
import toast from "react-hot-toast"

function ResetPassword() {

  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const email = searchParams.get("email")
  const token = decodeURIComponent(searchParams.get("token") || "")

  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  const isStrongPassword = (pass) =>
    /[A-Z]/.test(pass) &&
    /[a-z]/.test(pass) &&
    /[0-9]/.test(pass)

  if (!email || !token) {
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

              <h2 className="signup-title">الرابط غير صالح ❌</h2>
              <p className="signup-subtitle">
                من فضلك اطلب رابط جديد لإعادة تعيين كلمة المرور
              </p>
            </div>

            <button
              className="login-btns"
              onClick={() => navigate("/forgot-password")}
            >
              إعادة المحاولة
            </button>

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

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!password || !confirmPassword) {
      toast.error("املى كل البيانات ❌")
      return
    }

    if (password.length < 8 || !isStrongPassword(password)) {
      toast.error("كلمة المرور ضعيفة ❌")
      return
    }

    if (password !== confirmPassword) {
      toast.error("كلمة المرور غير متطابقة ❌")
      return
    }

    try {
      setLoading(true)

      await resetPassword({
        email,
        token,
        newPassword: password
      })

      toast.success("تم تغيير كلمة السر ✅")

      navigate("/login")

    } catch (err) {

      const errorMsg =
        err?.response?.data?.errors?.[0] ||
        err?.response?.data?.title ||
        "الكود غير صحيح ❌"

      toast.error(errorMsg)

    } finally {
      setLoading(false)
    }
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

            <h2 className="signup-title">إعادة تعيين كلمة السر</h2>
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
              <span className="eye" onClick={() => setShowPassword(!showPassword)}>
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
              <span className="eye" onClick={() => setShowConfirm(!showConfirm)}>
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

export default ResetPassword