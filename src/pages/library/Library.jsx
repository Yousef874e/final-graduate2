import styles from "../../assets/dashboard.module.css"
import libraryStyles from "../../assets/library.module.css"
import { useEffect, useState } from "react"
import { getExercises } from "../../api/exerciseService"
import { getSessionsByChild } from "../../api/sessionsService"
import { useNavigate } from "react-router-dom"

function Library() {

  const [exercises, setExercises] = useState([])
  const [sessions, setSessions] = useState([])
  const [filtered, setFiltered] = useState([])
  const [loading, setLoading] = useState(true)

  const [search, setSearch] = useState("")
  const [activeType, setActiveType] = useState("all")

  const navigate = useNavigate()

  const childId = localStorage.getItem("childId")

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [exData, sesData] = await Promise.all([
        getExercises(),
        getSessionsByChild(childId)
      ])

      setExercises(exData)
      setSessions(sesData)
      setFiltered(exData)

    } catch (err) {
      console.log(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {

    let result = exercises.filter(item => item.isActive)

    if (search) {
      result = result.filter(item =>
        item.name.toLowerCase().includes(search.toLowerCase())
      )
    }

    if (activeType !== "all") {
      result = result.filter(item =>
        item.exerciseType === activeType
      )
    }

    setFiltered(result)

  }, [search, activeType, exercises])

  const isCompleted = (exerciseId) => {
    return sessions.some(
      s => s.exerciseId === exerciseId && s.status === 4
    )
  }

  const completedCount = exercises.filter(ex =>
    sessions.some(s => s.exerciseId === ex.id && s.status === 4)
  ).length

  const progress = exercises.length
    ? (completedCount / exercises.length) * 100
    : 0

  return (
    <div style={{ padding: "20px" }}>

      <h2 className={styles.pageTitle}>التمارين</h2>

      <input
        type="text"
        placeholder="ابحث عن تمرين..."
        className={libraryStyles.search}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <div className={libraryStyles.tabs}>

        <button
          className={activeType === "all" ? libraryStyles.activeTab : ""}
          onClick={() => setActiveType("all")}
        >
          الكل
        </button>

        <button
          className={activeType === "Physical" ? libraryStyles.activeTab : ""}
          onClick={() => setActiveType("Physical")}
        >
          علاج طبيعي
        </button>

        <button
          className={activeType === "Speech" ? libraryStyles.activeTab : ""}
          onClick={() => setActiveType("Speech")}
        >
          تخاطب
        </button>

        <button
          className={activeType === "Balance" ? libraryStyles.activeTab : ""}
          onClick={() => setActiveType("Balance")}
        >
          توازن
        </button>

      </div>

      <div className={libraryStyles.progressBox}>
        <p>تمرين اليوم</p>
        <div className={libraryStyles.progressBar}>
          <div
            className={libraryStyles.progressFill}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className={libraryStyles.grid}>

          {filtered.map(item => {

            const completed = isCompleted(item.id)

            return (
              <div key={item.id} className={libraryStyles.card}>

                <img
                  src={item.mediaThumbnailUrl || "/default.png"}
                  alt={item.name}
                  className={libraryStyles.image}
                />

                <h4>{item.name}</h4>

                <p className={libraryStyles.desc}>
                  {item.description?.slice(0, 60) || "لا يوجد وصف"}
                </p>

                <button
                  className={completed ? libraryStyles.doneBtn : styles.startBtn}
                  onClick={() => !completed && navigate(`/exercise/${item.id}`)}
                >
                  {completed ? "مكتمل" : "ابدأ التمرين"}
                </button>

              </div>
            )
          })}

        </div>
      )}

    </div>
  )
}

export default Library