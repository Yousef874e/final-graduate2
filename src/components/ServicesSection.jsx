import "../assets/services.css"
import { FaUserFriends, FaComments, FaShieldAlt, FaHeart, FaPlay, FaChartLine } from "react-icons/fa"

function ServicesSection() {
  return (
    <section className="services">

      <span className="section-tag">لماذا رفيق؟</span>

      <h2>كل ما يحتاجه طفلك في مكان واحد</h2>

      <p className="section-desc">
        نقدم مجموعة متكاملة من الخدمات المصممة خصيصاً لدعم وتطوير قدرات أطفال الشلل الدماغي.
      </p>

      <div className="services-grid">

        <div className="card">
          <FaUserFriends className="icon"/>
          <h3>مجتمع داعم</h3>
          <p>تبادل الخبرات والدعم المعنوي مع عائلات تمر بنفس التجربة.</p>
        </div>

        <div className="card">
          <FaComments className="icon"/>
          <h3>استشارات عن بعد</h3>
          <p>تواصل مباشر مع أفضل الأخصائيين عبر الفيديو والرسائل.</p>
        </div>

        <div className="card">
          <FaShieldAlt className="icon"/>
          <h3>خطط علاجية مخصصة</h3>
          <p>برامج علاجية مصممة خصيصاً لكل طفل بناءً على حالته.</p>
        </div>

        <div className="card">
          <FaHeart className="icon"/>
          <h3>رعاية شاملة</h3>
          <p>نهج متكامل يغطي الجوانب الجسدية والنفسية والاجتماعية.</p>
        </div>

        <div className="card">
          <FaPlay className="icon"/>
          <h3>مكتبة تعليمية</h3>
          <p>فيديوهات ومواد تعليمية لمساعدة الأهل في رعاية الطفل.</p>
        </div>

        <div className="card">
          <FaChartLine className="icon"/>
          <h3>متابعة التقدم</h3>
          <p>تقارير دورية توضح تطور حالة الطفل وتحسين الأداء.</p>
        </div>

      </div>

    </section>
  )
}

export default ServicesSection