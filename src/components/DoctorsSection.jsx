import "../assets/doctors.css";
import www from "../assets/images/www.png";
import sss from "../assets/images/sss.png";
import { FaStar } from "react-icons/fa";

function DoctorsSection() {
  const doctors = [
    {
      name: "د. محمد علي",
      specialty: "علاج وظيفي",
      image: www,
      rating: 5,
    },
    {
      name: "د. سارة أحمد",
      specialty: "علاج طبيعي أطفال",
      image: sss,
      rating: 5,
    },
    {
      name: "د. ليلى خالد",
      specialty: "تخاطب ونطق",
      image: "https://i.pravatar.cc/150?img=5",
      rating: 5,
    },
    {
      name: "د. عمر يوسف",
      specialty: "مخ وأعصاب",
      image: "https://i.pravatar.cc/150?img=6",
      rating: 5,
    },
  ];

  return (
    <section className="doctors">
      <div className="doctors-top">
        <div className="doctors-text">
          <span className="section-tag">فريقنا الطبي</span>
          <h2>نخبة من الأخصائيين المعتمدين</h2>
          <p>
            فريق طبي متكامل يضم استشاريين في العلاج الطبيعي، الوظيفي، والتخاطب.
          </p>
        </div>

        <button className="view-all">عرض جميع الأخصائيين →</button>
      </div>
      <div className="doctors-grid">
        {doctors.map((doctor, index) => (
          <div className="doctor-card" key={index}>
            <div className="doctor-img">
              <img src={doctor.image} alt={doctor.name} />
              <span className="online"></span>
            </div>

            <h3>{doctor.name}</h3>
            <p className="special">{doctor.specialty}</p>

            <div className="stars">
              {[...Array(doctor.rating)].map((_, i) => (
                <FaStar key={i} />
              ))}
            </div>

            <button className="book">حجز موعد</button>
          </div>
        ))}
      </div>
    </section>
  );
}

export default DoctorsSection;