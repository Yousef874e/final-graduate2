import styles from "../../assets/exercise.module.css"
import { useEffect, useState } from "react"
import { getExercises } from "../../api/exerciseService"
import toast from "react-hot-toast"

function SpecialistExercise() {

  const [exercises, setExercises] = useState([])
  const [search, setSearch] = useState("")
  const [filter, setFilter] = useState("all")

  useEffect(() => {
    loadExercises()
  }, [])

  const loadExercises = async () => {
    try {
      const res = await getExercises()
      setExercises(res?.items || [])
    } catch {
      toast.error("فشل تحميل التمارين ❌")
    }
  }

  const filtered = exercises
    .filter(e =>
      e.name?.toLowerCase().includes(search.toLowerCase())
    )
    .filter(e =>
      filter === "all"
        ? true
        : e.exerciseType === Number(filter)
    )

  return (
    <div className={styles.container}>

      <div className={styles.header}>
        <div>
          <h2>التمارين</h2>
          <p>عرض التمارين العلاجية</p>
        </div>
      </div>

      <div className={styles.tools}>

        <select
          className={styles.filter}
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="all">الكل</option>
          <option value="1">علاج طبيعي</option>
          <option value="2">نطق</option>
          <option value="3">تكامل حسي</option>
        </select>

        <input
          className={styles.search}
          placeholder="بحث..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

      </div>

      <div className={styles.grid}>
        {filtered.length === 0 ? (
          <p>لا توجد تمارين</p>
        ) : (
          filtered.map(ex => (
            <div key={ex.id} className={styles.card}>

              <img
                src={ex.mediaThumbnailUrl || "/default.png"}
                alt=""
              />

              <h4>{ex.name}</h4>

              <p className={styles.type}>
                {ex.exerciseType === 1 && "علاج طبيعي"}
                {ex.exerciseType === 2 && "نطق"}
                {ex.exerciseType === 3 && "تكامل حسي"}
              </p>

            </div>
          ))
        )}
      </div>

    </div>
  )
}

export default SpecialistExercise