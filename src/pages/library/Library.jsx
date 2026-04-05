import styles from "../../assets/dashboard.module.css"
import libraryStyles from "../../assets/library.module.css"
import { useEffect, useState } from "react"
import { getExercises } from "../../api/exerciseService"
import { FaBell, FaUser } from "react-icons/fa"

function Library() {

  const [exercises, setExercises] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState("all")

  const userName = localStorage.getItem("userName") || "User"

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getExercises()

        const data = res.data?.data?.items || []

        const mapped = data.map(item => ({
          id: item.id,
          name: item.name,
          type: item.exerciseType?.toLowerCase().includes("upper")
            ? "video"
            : "article",
          mediaThumbnailUrl: item.mediaThumbnailUrl,
          mediaUrl: item.mediaUrl
        }))

        setExercises(mapped)

      } catch (err) {
        console.log(err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const filteredData = exercises.filter(item => {
    if (filter === "all") return true
    return item.type === filter
  })

  return (
    <div className={styles.specialistsPage}>

      {/* 🔥 Top Bar */}
      <div className={styles.topBar}>
        <div className={styles.topRight}>
          <h3>لوحة التحكم</h3>
        </div>

        <div className={styles.topLeft}>
          <div className={styles.userBox}>
            <span>{userName}</span>
            <FaUser className={styles.iconCircle}/>
          </div>

          <div className={styles.iconWrapper}>
            <FaBell />
          </div>
        </div>
      </div>

      {/* 🔥 Title */}
      <h2 className={styles.pageTitle}>المكتبة والمصادر</h2>
      <p className={styles.pageDesc}>
        محتوى تعليمي لمساعدتك في رحلة العلاج
      </p>

      {/* 🔥 Tabs */}
      <div className={libraryStyles.tabs}>
        <button
          className={filter === "all" ? libraryStyles.activeTab : ""}
          onClick={() => setFilter("all")}
        >
          الكل
        </button>

        <button
          className={filter === "video" ? libraryStyles.activeTab : ""}
          onClick={() => setFilter("video")}
        >
          فيديو
        </button>

        <button
          className={filter === "article" ? libraryStyles.activeTab : ""}
          onClick={() => setFilter("article")}
        >
          مقالات
        </button>
      </div>

      {/* 🔥 Banner */}
      <div className={libraryStyles.banner}>
        <h2>سلسلة التأهيل الحركي المكثف</h2>
        <p>كورس متكامل يشرح أهم التمارين المنزلية بشكل مبسط</p>

        <button
          onClick={() => {
            if (filteredData.length > 0) {
              window.open(filteredData[0].mediaUrl)
            }
          }}
        >
          ابدأ المشاهدة الآن
        </button>
      </div>

      {/* 🔥 Cards */}
      <div className={libraryStyles.grid}>

        {loading ? (
          <p>Loading...</p>
        ) : filteredData.length === 0 ? (
          <p>لا يوجد محتوى</p>
        ) : (
          filteredData.map((item)=>(
            <div key={item.id} className={libraryStyles.card}>

              <img
                src={item.mediaThumbnailUrl}
                alt=""
                onError={(e)=> e.target.src = "https://via.placeholder.com/300"}
              />

              <div className={libraryStyles.cardContent}>
                <h4>{item.name}</h4>

                <p className={libraryStyles.meta}>
                  {item.type === "video" ? "فيديو" : "مقال"}
                </p>

                <button
                  className={libraryStyles.btn}
                  onClick={() => window.open(item.mediaUrl)}
                >
                  عرض المحتوى
                </button>
              </div>

            </div>
          ))
        )}

      </div>

    </div>
  )
}
export default Library