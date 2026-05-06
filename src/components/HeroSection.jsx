import "../assets/hero.css"
import hhh from "../assets/images/hhh.png"

import { FaStar } from "react-icons/fa"
import { FaUser } from "react-icons/fa"
import { useNavigate } from "react-router-dom"

function HeroSection() {
  const navigate = useNavigate()
  return (
    <section className="hero">

      <div className="hero-text">

        <span className="badge">
          ⭐ المنصة الأولى لدعم أطفال الشلل الدماغي
        </span>

        <h1>
          رعاية متكاملة <br/>
          <span className="green">لأبطالنا الصغار</span>
        </h1>

        <p>
          نرافقك في رحلة علاج طفلك خطوة بخطوة. نوفر لك نخبة من
          الأخصائيين، خطط علاجية مخصصة، ومجتمع داعم لضمان أفضل
          مستقبل لطفلك.
        </p>

        <div className="hero-buttons">

        <button 
  className="start-btn"
  onClick={() => navigate("/login")}
>
  ابدأ رحلة الدعم مجاناً
</button>

        

        </div>

        <div className="hero-rating">

          <div className="users">
            <div className="user"><FaUser/></div>
            <div className="user"><FaUser/></div>
            <div className="user"><FaUser/></div>
            <div className="user"><FaUser/></div>

            <div className="count">+2k</div>
          </div>

          <div className="stars">
            <FaStar/>
            <FaStar/>
            <FaStar/>
            <FaStar/>
            <FaStar/>
          </div>

          <span className="trust">عائلات تثق بنا</span>

        </div>

      </div>

      <div className="hero-image">

  <img src={hhh} alt="hero" className="main-img"/>

 <div className="hero-card hero-card-left">
  <span>برامج معتمدة</span>
  <p>طبية وعلاجية</p>
</div>

<div className="hero-card hero-card-right">
  <span>أخصائيين متميزين</span>
  <p>تقييم 4.9/5 ⭐</p>
</div>
</div>
    </section>
  )
}

export default HeroSection