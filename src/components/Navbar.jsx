import "../assets/navbar.css"
import logo from "../assets/images/logo.png"
import { useNavigate } from "react-router-dom"

function Navbar() {
  const navigate = useNavigate()

  const scrollToSection = (id) => {
    const section = document.getElementById(id)

    if (section) {
      section.scrollIntoView({
        behavior: "smooth"
      })
    }
  }

  return (
    <nav className="navbar">

      <div className="logo-container">
        <div className="logo-circle">
          <img src={logo} alt="logo" />
        </div>

        <span className="logo-text">رفيق</span>
      </div>

      <ul className="nav-links">
        <li onClick={() => navigate("/")}>
          الرئيسية
        </li>

        <li onClick={() => scrollToSection("services")}>
          المميزات
        </li>

        <li onClick={() => scrollToSection("doctors")}>
          الأخصائيين
        </li>

        <li onClick={() => scrollToSection("contact")}>
          تواصل معنا
        </li>
      </ul>

      <div className="auth-buttons">

        <button
          className="login-btn"
          onClick={() => navigate("/login")}
        >
          تسجيل الدخول
        </button>

        <button
          className="register-btn"
          onClick={() => navigate("/register")}
        >
          حساب جديد
        </button>

      </div>

    </nav>
  )
}

export default Navbar