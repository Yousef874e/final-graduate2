import "../../assets/adminLibrary.css"
import { useEffect, useState } from "react"
import { FaPlus, FaDumbbell, FaTrash } from "react-icons/fa"
import toast from "react-hot-toast"

import {
  getExercises,
  createExercise,
  updateExercise,
  deleteExercise
} from "../../api/exerciseService"

import {
  uploadImage,
  uploadVideo
} from "../../api/mediaService"

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
      const res = await getExercises({ PageNumber: 1, PageSize: 50 })
      setExercises(res.items || [])
    } catch {
      toast.error("فشل تحميل التمارين ❌")
    }
  }

  const uploadMedia = async () => {
    if (!form.file) return null

    let res

    if (form.file.type.startsWith("image")) {
      res = await uploadImage(form.file, { category: 1 })
    } else if (form.file.type.startsWith("video")) {
      res = await uploadVideo(form.file, { category: 1 })
    } else {
      toast.error("ارفع صورة أو فيديو فقط ❌")
      return null
    }

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
        exerciseType: form.exerciseType,
        description: form.description,
        mediaId
      })

      toast.success("تم إضافة التمرين ✅")
      closeModal()
      loadExercises()
    } catch (err) {
      console.log(err.response?.data)
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
        exerciseType: form.exerciseType,
        description: form.description,
        mediaId,
        isActive: selectedExercise.isActive
      })

      toast.success("تم التعديل ✅")
      closeModal()
      loadExercises()
    } catch (err) {
      console.log(err.response?.data)
      toast.error("فشل التعديل ❌")
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm("متأكد عايز تحذف التمرين؟")) return

    try {
      await deleteExercise(id)
      setExercises(prev => prev.filter(ex => ex.id !== id))
      toast.success("تم الحذف ✅")
    } catch (err) {
      console.log(err.response?.data)
      toast.error("فشل الحذف ❌")
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

    setForm({
      name: "",
      exerciseType: "",
      description: "",
      file: null
    })
  }

  const filtered = exercises.filter((ex) => {
    const matchSearch =
      ex.name?.toLowerCase().includes(search.toLowerCase())

    if (activeFilter === "all") return matchSearch

    return matchSearch && ex.exerciseType === activeFilter
  })

  return (
    <div className="library-page">

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

      <div className="filters">
        <button onClick={() => setActiveFilter("all")}>الكل</button>
        <button onClick={() => setActiveFilter("UpperBody")}>علاج طبيعي</button>
        <button onClick={() => setActiveFilter("Speech")}>نطق</button>
        <button onClick={() => setActiveFilter("Sensory")}>تكامل حسي</button>
      </div>

      <div className="grid">
        {filtered.map((ex) => (
          <div className="card" key={ex.id}>

            <div className="icon">
              {ex.mediaThumbnailUrl ? (
                <img src={ex.mediaThumbnailUrl} alt="" />
              ) : ex.mediaUrl ? (
                <video src={ex.mediaUrl} controls />
              ) : (
                <FaDumbbell />
              )}
            </div>

            <h3>{ex.name}</h3>
            <p className="desc">{ex.description}</p>

            <div className="actions">
              <button onClick={() => openEdit(ex)}>تعديل</button>

              <button onClick={() => handleDelete(ex.id)}>
                <FaTrash />
              </button>
            </div>

          </div>
        ))}
      </div>

      {showModal && (
        <div className="modal">
          <div className="modal-content">

            <h2>
              {isEdit ? "تعديل التمرين" : "إضافة تمرين"}
            </h2>

            <input
              placeholder="اسم التمرين"
              value={form.name}
              onChange={(e) =>
                setForm({ ...form, name: e.target.value })
              }
            />

            <select
              value={form.exerciseType}
              onChange={(e) =>
                setForm({
                  ...form,
                  exerciseType: e.target.value
                })
              }
            >
              <option value="">نوع التمرين</option>
              <option value="UpperBody">علاج طبيعي</option>
              <option value="Speech">نطق</option>
              <option value="Sensory">تكامل حسي</option>
            </select>

            <textarea
              placeholder="الوصف"
              value={form.description}
              onChange={(e) =>
                setForm({
                  ...form,
                  description: e.target.value
                })
              }
            />

            <input
              type="file"
              accept="image/*,video/*"
              onChange={(e) =>
                setForm({
                  ...form,
                  file: e.target.files[0]
                })
              }
            />

            <button onClick={isEdit ? handleUpdate : handleCreate}>
              {isEdit ? "حفظ" : "إضافة"}
            </button>

            <button onClick={closeModal}>
              إغلاق
            </button>

          </div>
        </div>
      )}

    </div>
  )
}

export default AdminLibrary