import "../../assets/adminLibrary.css"
import { useEffect, useState } from "react"
import { FaPlus, FaDumbbell } from "react-icons/fa"
import toast from "react-hot-toast"

import {
  getExercises,
  createExercise,
  updateExercise
} from "../../api/exerciseService"

import { uploadFile } from "../../api/mediaService"

function AdminLibrary() {

  const [exercises, setExercises] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [search, setSearch] = useState("")
  const [activeFilter, setActiveFilter] = useState("all")

  const [isEdit, setIsEdit] = useState(false)
  const [selectedExercise, setSelectedExercise] = useState(null)

  const [form, setForm] = useState({
    name: "",
    exerciseType: "",
    description: "",
    file: null
  })

  useEffect(() => {
    loadExercises()
  }, [])

  const loadExercises = async () => {
    try {
      const res = await getExercises()
      setExercises(res.items || [])
    } catch {
      toast.error("فشل تحميل التمارين ❌")
    }
  }

  const uploadMedia = async () => {
    const data = new FormData()
    data.append("file", form.file)
    data.append("category", 1)

    const res = await uploadFile(data)
    return res.id
  }

  const handleCreate = async () => {
    if (!form.name || !form.exerciseType || !form.file) {
      toast.error("كمل البيانات ❌")
      return
    }

    try {
      const mediaId = await uploadMedia()

      await createExercise({
        name: form.name,
        exerciseType: Number(form.exerciseType),
        description: form.description,
        mediaId
      })

      toast.success("تم إضافة التمرين ✅")
      closeModal()
      loadExercises()

    } catch {
      toast.error("فشل الإضافة ❌")
    }
  }

  const handleUpdate = async () => {
    try {
      let mediaId = selectedExercise.mediaId

      if (form.file) {
        mediaId = await uploadMedia()
      }

      await updateExercise(selectedExercise.id, {
        name: form.name,
        exerciseType: Number(form.exerciseType),
        description: form.description,
        mediaId,
        isActive: true
      })

      toast.success("تم التعديل ✅")
      closeModal()
      loadExercises()

    } catch {
      toast.error("فشل التعديل ❌")
    }
  }

  const openCreate = () => {
    setIsEdit(false)
    setForm({
      name: "",
      exerciseType: "",
      description: "",
      file: null
    })
    setShowModal(true)
  }

  const openEdit = (ex) => {
    setIsEdit(true)
    setSelectedExercise(ex)

    setForm({
      name: ex.name,
      exerciseType: ex.exerciseType,
      description: ex.description || "",
      file: null
    })

    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setIsEdit(false)
    setSelectedExercise(null)
  }

  const filtered = exercises.filter(ex => {
    const matchSearch = ex.name?.toLowerCase().includes(search.toLowerCase())

    if (activeFilter === "all") return matchSearch

    return matchSearch && ex.exerciseType === activeFilter
  })

  return (
    <div className="library-page">

      {/* TOP BAR */}
      <div className="top-bar">

        <button className="add-btn" onClick={openCreate}>
          <FaPlus /> إنشاء تمرين جديد
        </button>

        <input
          className="search"
          placeholder="بحث..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* FILTERS */}
      <div className="filters">
        <button
          className={activeFilter === "all" ? "active" : ""}
          onClick={() => setActiveFilter("all")}
        >
          الكل
        </button>

        <button onClick={() => setActiveFilter(1)}>
          علاج طبيعي
        </button>

        <button onClick={() => setActiveFilter(2)}>
          نطق
        </button>

        <button onClick={() => setActiveFilter(3)}>
          تكامل حسي
        </button>
      </div>

      {/* GRID */}
      <div className="grid">
        {filtered.map((ex) => (
          <div className="card" key={ex.id}>

            <div className="icon">
              <FaDumbbell />
            </div>

            <h3>{ex.name}</h3>
            <p className="desc">{ex.description}</p>

            <button className="edit-btn" onClick={() => openEdit(ex)}>
              تعديل
            </button>

          </div>
        ))}
      </div>

      {/* MODAL */}
      {showModal && (
        <div className="modal">
          <div className="modal-content">

            <h2>{isEdit ? "تعديل التمرين" : "إضافة تمرين"}</h2>

            <input
              placeholder="اسم التمرين"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />

            <select
              value={form.exerciseType || ""}
              onChange={(e) => setForm({ ...form, exerciseType: e.target.value })}
            >
              <option value="">نوع التمرين</option>
              <option value="1">علاج طبيعي</option>
              <option value="2">نطق</option>
              <option value="3">تكامل حسي</option>
            </select>

            <textarea
              placeholder="الوصف"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />

            <input
              type="file"
              onChange={(e) => setForm({ ...form, file: e.target.files[0] })}
            />

            <button
              className="save-btn"
              onClick={isEdit ? handleUpdate : handleCreate}
            >
              {isEdit ? "حفظ التعديل" : "إضافة"}
            </button>

            <button className="close-btn" onClick={closeModal}>
              إغلاق
            </button>

          </div>
        </div>
      )}

    </div>
  )
}

export default AdminLibrary