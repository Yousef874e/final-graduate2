import styles from "../../assets/dashboard.module.css"
import libraryStyles from "../../assets/library.module.css"
import { useEffect, useState } from "react"
import { getTreatmentPlans } from "../../api/treatmentPlansService"
import { getSessionsByChild } from "../../api/sessionsService"
import { useNavigate } from "react-router-dom"

function Library() {

  const [plans, setPlans] = useState([])
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

      if (!childId) {
        setPlans([])
        setSessions([])
        return
      }

      const [planRes, sessionRes] = await Promise.all([
        getTreatmentPlans(childId),
        getSessionsByChild(childId)
      ])

      const plansData = planRes?.items || planRes?.data?.items || []

      setPlans(plansData)
      setSessions(sessionRes?.items || [])

      const exercises = plansData.flatMap(p => p.exercises || [])
      setFiltered(exercises)

    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {

    let exercises = plans.flatMap(p => p.exercises || [])

    if (search) {
      exercises = exercises.filter(item =>
        item.exerciseName?.toLowerCase().includes(search.toLowerCase())
      )
    }

    if (activeType !== "all") {
      exercises = exercises.filter(item =>
        String(item.exerciseType) === activeType
      )
    }

    setFiltered(exercises)

  }, [search, activeType, plans])

  const isCompleted = (exerciseId) => {
    return sessions.some(
      s => s.exerciseId === exerciseId && s.status === 4
    )
  }

  const allExercises = plans.flatMap(p => p.exercises || [])

  const completedCount = allExercises.filter(ex =>
    sessions.some(s => s.exerciseId === ex.exerciseId && s.status === 4)
  ).length

  const progress = allExercises.length
    ? (completedCount / allExercises.length) * 100
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
          className={activeType === "1" ? libraryStyles.activeTab : ""}
          onClick={() => setActiveType("1")}
        >
          علاج طبيعي
        </button>

        <button
          className={activeType === "2" ? libraryStyles.activeTab : ""}
          onClick={() => setActiveType("2")}
        >
          تخاطب
        </button>

      </div>

      <div className={libraryStyles.progressBox}>
        <p>تقدم التمارين</p>
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

            const completed = isCompleted(item.exerciseId)

            return (
              <div key={item.id} className={libraryStyles.card}>

                <img
                  src={item.mediaThumbnailUrl || "/default.png"}
                  alt=""
                  className={libraryStyles.image}
                />

                <h4>{item.exerciseName}</h4>

                <p className={libraryStyles.desc}>
                  عدد المرات: {item.expectedReps} × {item.sets}
                </p>

                <button
                  className={completed ? libraryStyles.doneBtn : styles.startBtn}
                  onClick={() =>
                    !completed &&
                    navigate(`/exercise/${item.exerciseId}`, {
                      state: { treatmentPlanExerciseId: item.id }
                    })
                  }
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