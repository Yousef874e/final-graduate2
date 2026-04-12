import styles from "../../assets/exercise.module.css"
import { useEffect, useState } from "react"
import {
  getExercises,
  createExercise,
  updateExercise
} from "../../api/exerciseService"
import { uploadFile } from "../../api/mediaService"
import toast from "react-hot-toast"

function SpecialistExercise() {

  const [exercises, setExercises] = useState([])
  const [search, setSearch] = useState("")
  const [filter, setFilter] = useState("all")

  const [showModal, setShowModal] = useState(false)
  const [editingExercise, setEditingExercise] = useState(null)

  const [name, setName] = useState("")
  const [type, setType] = useState("")
  const [desc, setDesc] = useState("")
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState(null)

  useEffect(() => {
    loadExercises()
  }, [])

  const loadExercises = async () => {
    try {
      const res = await getExercises()
      setExercises(res?.items || res?.data?.items || [])
    } catch {
      toast.error("فشل تحميل التمارين")
    }
  }

  const handleFileChange = (f) => {
    if (!f) return

    if (preview) URL.revokeObjectURL(preview)

    setFile(f)
    setPreview(URL.createObjectURL(f))
  }

  const handleSubmit = async () => {
    if (!name || !type || (!file && !editingExercise)) {
      toast.error("املأ البيانات وارفع ملف")
      return
    }

    try {
      let mediaId = editingExercise?.mediaId

      if (file) {
        const formData = new FormData()
        formData.append("file", file)
        formData.append("category", 1)

        const upload = await uploadFile(formData)
        mediaId = upload.id
      }

      if (editingExercise) {
        await updateExercise(editingExercise.id, {
          name,
          exerciseType: Number(type),
          description: desc,
          mediaId,
          isActive: true
        })
        toast.success("تم التعديل")
      } else {
        await createExercise({
          name,
          exerciseType: Number(type),
          description: desc,
          mediaId
        })
        toast.success("تم الإضافة")
      }

      closeModal()
      loadExercises()

    } catch {
      toast.error("فشل العملية")
    }
  }

  const handleEdit = (ex) => {
    setEditingExercise(ex)
    setName(ex.name || "")
    setType(String(ex.exerciseType || ""))
    setDesc(ex.description || "")
    setPreview(ex.mediaThumbnailUrl || null)
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setEditingExercise(null)
    setName("")
    setType("")
    setDesc("")
    setFile(null)

    if (preview) URL.revokeObjectURL(preview)
    setPreview(null)
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
          <p>إدارة التمارين العلاجية</p>
        </div>

        <button
          className={styles.addBtn}
          onClick={() => setShowModal(true)}
        >
          + إضافة تمرين
        </button>
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
        </select>

        <input
          className={styles.search}
          placeholder="بحث..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

      </div>

      <div className={styles.grid}>
        {filtered.map(ex => (
          <div key={ex.id} className={styles.card}>

            <img
              src={ex.mediaThumbnailUrl || "/default.png"}
              alt=""
            />

            <h4>{ex.name}</h4>

            <div className={styles.cardActions}>
              <button onClick={() => handleEdit(ex)}>
                تعديل
              </button>
            </div>

          </div>
        ))}
      </div>

      {showModal && (
        <div className={styles.overlay}>
          <div className={styles.modal}>

            <h3>
              {editingExercise ? "تعديل تمرين" : "إضافة تمرين"}
            </h3>

            <input
              placeholder="اسم التمرين"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />

            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
            >
              <option value="">نوع التمرين</option>
              <option value="1">علاج طبيعي</option>
              <option value="2">نطق</option>
            </select>

            <textarea
              placeholder="الوصف"
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
            />

            <input
              type="file"
              accept="video/*"
              onChange={(e) => handleFileChange(e.target.files[0])}
            />

            {preview && (
              <div className={styles.preview}>
                {file?.type?.startsWith("video") ? (
                  <video src={preview} controls />
                ) : (
                  <img src={preview} alt="" />
                )}
              </div>
            )}

            <div className={styles.actions}>
              <button onClick={handleSubmit}>
                {editingExercise ? "تعديل" : "إضافة"}
              </button>

              <button onClick={closeModal}>
                إلغاء
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  )
}

export default SpecialistExercise