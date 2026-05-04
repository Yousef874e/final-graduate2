import "../../assets/register.css"
import logo from "../../assets/images/logo.png"
import sideImg from "../../assets/images/ggg.png"
import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { FaUser, FaPhone, FaEye, FaEyeSlash } from "react-icons/fa"
import { MdEmail } from "react-icons/md"
import { FcGoogle } from "react-icons/fc"
import { IoArrowForward } from "react-icons/io5"
import { registerParent, registerSpecialist, googleLogin } from "../../api/authService"
import { setAuth } from "../../utils/auth"
import toast from "react-hot-toast"

function RegisterPage() {
  const navigate = useNavigate()

  const [role, setRole] = useState("parent")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    password: "",
    confirmPassword: "",
    specialization: "",
    bio: ""
  })

  useEffect(() => {
    const script = document.createElement("script")
    script.src = "https://accounts.google.com/gsi/client"
    script.async = true
    script.defer = true
    document.body.appendChild(script)
  }, [])

  // ✅ Google باستخدام idToken (credential)
  const handleGoogleCallback = async (response) => {
    try {
      console.log("🔥 ID TOKEN:", response.credential)

      const res = await googleLogin(response.credential)

      console.log("🔥 GOOGLE RESPONSE:", res)

      setAuth(res)
      localStorage.setItem("userName", res.fullName || "")

      const roleName = res?.roles?.[0]

      toast.success("تم تسجيل الدخول بجوجل ✅")

      if (roleName === "Parent") {
        if (res.children && res.children.length > 0) {
          navigate("/dashboard/parent")
        } else {
          navigate("/child-info-step1")
        }
      } else if (roleName === "Specialist") {
        navigate("/dashboard/specialist")
      } else if (roleName === "Admin") {
        navigate("/dashboard/admin")
      } else {
        toast.error("Role غير معروف ❌")
      }
    } catch (err) {
      console.log("❌ GOOGLE ERROR:", err)
      toast.error("فشل تسجيل الدخول ❌")
    }
  }

  const handleGoogleLogin = () => {
    if (!window.google) {
      toast.error("Google مش جاهز ❌")
      return
    }

    window.google.accounts.id.initialize({
      client_id: "470189378307-c74it8k81hpbmjhm0mekifk7n0fdpfjq.apps.googleusercontent.com",
      callback: handleGoogleCallback
    })

    window.google.accounts.id.prompt()
  }

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    })
  }

  const isValidSpecialization = (text) => {
    if (!text) return false
    if (text.length < 3) return false
    if (!/[a-zA-Z\u0600-\u06FF]/.test(text)) return false
    if (/^(.)\1+$/.test(text)) return false
    if (!text.includes(" ") && text.length < 6) return false
    return true
  }

  const isValidBio = (text) => {
    if (!text) return false
    if (text.length < 20) return false
    if (text.split(" ").length < 3) return false
    if (!/[a-zA-Z\u0600-\u06FF]/.test(text)) return false
    return true
  }

  const handleRegister = async () => {
    if (!form.fullName || !form.email || !form.password || !form.confirmPassword) {
      toast.error("من فضلك املى كل البيانات ❌")
      return
    }

    if (role === "parent" && (!form.phone || !form.address)) {
      toast.error("اكمل بيانات ولي الأمر ❌")
      return
    }

    if (!form.email.includes("@")) {
      toast.error("البريد الإلكتروني غير صحيح ❌")
      return
    }

    if (form.password.length < 8) {
      toast.error("كلمة المرور لازم تكون 8 حروف على الأقل ❌")
      return
    }

    if (form.password !== form.confirmPassword) {
      toast.error("كلمة المرور غير متطابقة ❌")
      return
    }

    if (role === "specialist") {
      if (!isValidSpecialization(form.specialization)) {
        toast.error("اكتب تخصص واضح ❌")
        return
      }

      if (!isValidBio(form.bio)) {
        toast.error("اكتب نبذة مفهومة ❌")
        return
      }
    }

    setLoading(true)

    try {
      let res

      if (role === "parent") {
        res = await registerParent({
          fullName: form.fullName,
          email: form.email,
          password: form.password,
          phoneNumber: form.phone,
          address: form.address
        })
      } else {
        res = await registerSpecialist({
          fullName: form.fullName,
          email: form.email,
          password: form.password,
          specialization: form.specialization,
          bio: form.bio || "Specialist"
        })
      }

      console.log("🔥 REGISTER RESPONSE:", res)

      if (res.requiresPasswordChange) {
        toast("لازم تغير كلمة المرور 🔐")
        navigate("/reset-password")
        return
      }

      setAuth(res)
      localStorage.setItem("userName", form.fullName)

      const roleName = res?.roles?.[0]

      toast.success("تم إنشاء الحساب وتسجيل الدخول ✅")

      if (roleName === "Parent") {
        navigate("/child-info-step1")
      } else if (roleName === "Specialist") {
        navigate("/dashboard/specialist")
      } else if (roleName === "Admin") {
        navigate("/dashboard/admin")
      } else {
        toast.error("Role غير معروف ❌")
      }
    } catch (err) {
      console.log("❌ REGISTER ERROR:", err)
      toast.error("فيه خطأ ❌")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="signup-container">
      <div className="signup-right">
        <div className="signup-box">

          <div className="signup-header">
            <div className="logo-container">
              <div className="logo-circle">
                <img src={logo} alt="logo" />
              </div>
              <span className="logo-text">Rafiq</span>
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
            <span
              className="eye"
              onClick={() => setShowConfirm(!showConfirm)}
            >
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
            <span onClick={() => navigate("/login")}>
              سجل الدخول
            </span>
          </p>

        </div>
      </div>

      <div className="signup-left">
        <img src={sideImg} alt="img" />
        <h3>مجتمع داعم ومتكامل</h3>
        <p>انضم لأكثر من 5000 عائلة تشارك نفس الرحله والاهتمامات</p>
      </div>
    </div>
  )
}

export default RegisterPage