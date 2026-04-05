import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import sideImg from "../../assets/images/ggg.png"
import "../../assets/child.css"
import toast from "react-hot-toast"

import { uploadImage } from "../../api/mediaService"
import { setChildImage } from "../../api/childrenService"

function ChildImage() {

  const navigate = useNavigate()

  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState("")

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview)
    }
  }, [preview])

  const handleFileChange = (e) => {

    setError("")

    const selected = e.target.files[0]
    if (!selected) return

    if (!selected.type.startsWith("image/")) {
      setError("لازم تختار صورة ❌")
      toast.error("لازم تختار صورة ❌")
      return
    }

    if (selected.size > 5 * 1024 * 1024) {
      setError("الصورة أكبر من 5MB ❌")
      toast.error("الصورة أكبر من 5MB ❌")
      return
    }

    setFile(selected)
    setPreview(URL.createObjectURL(selected))
  }

  const handleUpload = async () => {

    if (!file) {
      toast.error("اختار صورة ❌")
      return
    }

    const childId = localStorage.getItem("childId")

    if (!childId) {
      toast.error("مفيش childId ❌")
      return
    }

    try {
      setLoading(true)

      const formData = new FormData()
      formData.append("file", file)
      formData.append("category", "2")

      const uploadRes = await uploadImage(formData, setProgress)

      const mediaId = uploadRes?.id

      if (!mediaId) {
        toast.error("فشل رفع الصورة ❌")
        return
      }

      await setChildImage(childId, mediaId)

      toast.success("تم رفع الصورة بنجاح ✅")

      navigate("/dashboard/parent")

    } catch (err) {

      const errorMsg =
        err.response?.data?.errors?.[0] ||
        err.response?.data?.title ||
        "فيه خطأ ❌"

      toast.error(errorMsg)

    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="child-container">

      <div className="child-left">
        <img src={sideImg} alt="img" />
        <h3>مجتمع داعم ومتكامل</h3>
        <p>انضم لأكثر من 5000 عائلة تشارك نفس الرحلة والاهتمامات</p>
      </div>

      <div className="child-right">

        <div className="child-box" style={{ textAlign: "center" }}>

          <h2 className="child-title">مرحبًا بك</h2>
          <p className="child-sub">يرجى اختيار صورة واضحة للطفل</p>

          {error && <p className="child-error">{error}</p>}

          <label className="upload-circle">

            {preview ? (
              <img src={preview} alt="preview" className="preview-img" />
            ) : (
              <span style={{ fontSize: "30px" }}>📷</span>
            )}

            <input type="file" hidden onChange={handleFileChange} />

          </label>

          {progress > 0 && (
            <p style={{ color: "#fff" }}>{progress}%</p>
          )}

          <button
            className="child-btn"
            onClick={handleUpload}
            disabled={loading}
          >
            {loading ? "جاري الرفع..." : "دخول إلى لوحة التحكم →"}
          </button>

        </div>

      </div>

    </div>
  )
}

export default ChildImage