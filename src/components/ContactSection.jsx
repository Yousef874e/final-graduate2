import { useState } from "react";
import "../assets/contact.css";
import { 
  FaPhoneAlt, 
  FaEnvelope, 
  FaMapMarkerAlt,
  FaCheckCircle,
  FaExclamationCircle
} from "react-icons/fa";

function ContactSection() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: ""
  });
  
  const [status, setStatus] = useState({
    show: false,
    type: "",
    message: ""
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.message) {
      setStatus({
        show: true,
        type: "error",
        message: "❌ الرجاء تعبئة جميع الحقول"
      });
      
      setTimeout(() => {
        setStatus(prev => ({ ...prev, show: false }));
      }, 3000);
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setStatus({
        show: true,
        type: "error",
        message: "❌ الرجاء إدخال بريد إلكتروني صحيح"
      });
      setTimeout(() => {
        setStatus(prev => ({ ...prev, show: false }));
      }, 3000);
      return;
    }

    const contactData = {
      id: Date.now(),
      name: formData.name,
      email: formData.email,
      message: formData.message,
      timestamp: new Date().toLocaleString('ar-EG'),
      read: false
    };

    const existingMessages = localStorage.getItem("contact_messages");
    let messages = [];
    
    if (existingMessages) {
      try {
        messages = JSON.parse(existingMessages);
        if (!Array.isArray(messages)) messages = [];
      } catch (error) {
        messages = [];
      }
    }
    
    messages.push(contactData);
    localStorage.setItem("contact_messages", JSON.stringify(messages));
    
    setStatus({
      show: true,
      type: "success",
      message: "✅ تم إرسال رسالتك بنجاح!"
    });
    
    setFormData({
      name: "",
      email: "",
      message: ""
    });
    
    setTimeout(() => {
      setStatus(prev => ({ ...prev, show: false }));
    }, 3000);
  };

  return (
    <section className="contact" id="contact">
      <div className="contact-container">
        <div className="contact-form">
          <h3>أرسل لنا رسالة</h3>
          
          {status.show && (
            <div className={`status-message ${status.type}`}>
              {status.type === "success" ? <FaCheckCircle /> : <FaExclamationCircle />}
              {status.message}
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <input 
                type="text" 
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="الاسم"
              />
            </div>

            <div className="form-group">
              <input 
                type="email" 
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="البريد الإلكتروني"
              />
            </div>

            <div className="form-group">
              <textarea 
                name="message"
                value={formData.message}
                onChange={handleChange}
                placeholder="رسالتك"
                rows="4"
              ></textarea>
            </div>

            <button type="submit">إرسال</button>
          </form>
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
        <p>© 2026 رفيق جميع الحقوق محفوظة</p>
      </div>
    </section>
  );
}

export default ContactSection;
