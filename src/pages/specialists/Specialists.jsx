import styles from "../../assets/dashboard.module.css"
import { FaSearch, FaMapMarkerAlt, FaBell, FaUser } from "react-icons/fa"
import { useEffect, useState } from "react"
import { getSpecialists } from "../../api/specialistsService"

import defaultImg from "../../assets/images/sss.png"

function Specialists() {

  const [doctors, setDoctors] = useState([])
  const [loading, setLoading] = useState(true)

  const [searchText, setSearchText] = useState("")
  const [selectedFilter, setSelectedFilter] = useState("الكل")

  const [page, setPage] = useState(1)

  // ✅ اسم اليوزر dynamic
  const userName = localStorage.getItem("userName")

  // 🔥 API CALL
  useEffect(() => {
    const fetchDoctors = async () => {
      setLoading(true)
      try {
        const res = await getSpecialists({
          pageNumber: page,
          pageSize: 6
        })

        console.log("API DATA:", res.data)

        setDoctors(res?.data?.items ?? [])
      } catch (err) {
        console.log(err)
      } finally {
        setLoading(false)
      }
    }

    fetchDoctors()
  }, [page])

  // 🔍 FILTER + SEARCH (محسنة)
  const filteredDoctors = doctors.filter((doc) => {

    const name = doc.fullName || ""
    const spec = doc.specialization || ""

    const matchSearch = name
      .toLowerCase()
      .includes(searchText.toLowerCase())

    const matchFilter =
      selectedFilter === "الكل" ||
      spec.toLowerCase().includes(selectedFilter.toLowerCase())

    return matchSearch && matchFilter
  })

  const handleBook = (doc) => {
    alert(`تم اختيار ${doc.fullName}`)
  }

  return (
    <div className={styles.specialistsPage}>

      {/* الهيدر */}
      <div className={styles.topBar}>
        <div className={styles.topRight}>
          <h3>لوحة التحكم</h3>
        </div>

        <div className={styles.topLeft}>
          <div className={styles.userBox}>
            <span>{userName || "User"}</span>
            <FaUser className={styles.iconCircle}/>
          </div>

          <div className={styles.iconWrapper}>
            <FaBell />
          </div>
        </div>
      </div>

      {/* العنوان */}
      <h2 className={styles.pageTitle}>أخصائيين رفيق</h2>
      <p className={styles.pageDesc}>
        نخبة من أفضل المتخصصين المعتمدين لمتابعة حالة طفلك
      </p>

      {/* البحث */}
      <div className={styles.searchRow}>
        <button className={styles.searchBtn}>بحث</button>

        <div className={styles.inputBox}>
          <FaMapMarkerAlt />
          <input placeholder="ابحث في المدينة" />
        </div>

        <div className={styles.inputBox}>
          <FaSearch />
          <input
            placeholder="ابحث عن أخصائي، تخصص..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
        </div>
      </div>

      {/* الفلاتر */}
      <div className={styles.filters}>
        {["الكل","علاج طبيعي","علاج وظيفي","تخاطب","مخ وأعصاب","تغذية","نفسي"]
          .map((f,i)=>(
            <button
              key={i}
              className={selectedFilter === f ? styles.active : ""}
              onClick={()=> setSelectedFilter(f)}
            >
              {f}
            </button>
        ))}
      </div>

      {/* الكروت */}
      <div className={styles.cards}>

        {loading ? (
          [1,2,3].map((_,i)=>(
            <div key={i} className={styles.card}>Loading...</div>
          ))
        ) : filteredDoctors.length === 0 ? (
          <p style={{textAlign:"center"}}>لا يوجد نتائج</p>
        ) : (
          filteredDoctors.map((doc, i) => (
            <div key={i} className={styles.card}>

              <div className={styles.cardHeader}>
                <img
                  src={doc.profileImageUrl || defaultImg}
                  alt={doc.fullName}
                />
                <div>
                  <h4>{doc.fullName || "بدون اسم"}</h4>
                  <p>{doc.specialization || "غير محدد"}</p>
                  <span className={styles.rating}>⭐ 4.5</span>
                </div>
              </div>

              <div className={styles.tags}>
                <span>تكامل حسي</span>
                <span>استقلالية</span>
              </div>

              <div className={styles.cardFooter}>
                <button
                  onClick={()=> handleBook(doc)}
                  className={styles.book}
                >
                  حجز موعد
                </button>
                <span className={styles.available}>متاح اليوم</span>
              </div>

            </div>
          ))
        )}

      </div>

      {/* 📄 Pagination */}
      <div style={{marginTop:20, display:"flex", gap:10, justifyContent:"center"}}>
        <button onClick={()=> setPage(p => Math.max(p-1,1))}>
          السابق
        </button>

        <span>صفحة {page}</span>

        <button onClick={()=> setPage(p => p+1)}>
          التالي
        </button>
      </div>

    </div>
  )
}

export default Specialists
