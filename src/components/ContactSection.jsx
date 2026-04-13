import "../assets/contact.css";
import { 
  FaPhoneAlt, 
  FaEnvelope, 
  FaMapMarkerAlt, 
  FaLinkedin, 
  FaInstagram, 
  FaTwitter 
} from "react-icons/fa";

function ContactSection() {
  return (
    <section className="contact">
      <div className="contact-container">
        <div className="contact-form">
          <h3>أرسل لنا رسالة</h3>

          <div className="form-group">
            <input type="text" placeholder="الاسم" />
          </div>

          <div className="form-group">
            <input type="email" placeholder="البريد الإلكتروني" />
          </div>

          <div className="form-group">
            <textarea placeholder="رسالتك"></textarea>
          </div>

          <button>إرسال</button>
        </div>
        <div className="contact-info">
          <h2>رفيق</h2>

          <p>
            نحن هنا لمساعدتك في كل خطوة. تواصل معنا للحصول على
            المزيد من المعلومات أو المساعدة التقنية.
          </p>

          <div className="info-item">
            <FaPhoneAlt />
            <span>+201093055427</span>
          </div>

          <div className="info-item">
            <FaEnvelope />
            <span>support@rafeeq.com</span>
          </div>

          <div className="info-item">
            <FaMapMarkerAlt />
            <span>القاهرة، مصر</span>
          </div>
        </div>
      </div>

      <div className="footer">
        <div className="socials">
          <FaLinkedin />
          <FaInstagram />
          <FaTwitter />
        </div>
        <p>© 2026 رفيق جميع الحقوق محفوظة</p>
      </div>
    </section>
  );
}

export default ContactSection;