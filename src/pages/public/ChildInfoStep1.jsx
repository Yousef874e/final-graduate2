import { useState } from "react"
import { useNavigate } from "react-router-dom"
import sideImg from "../../assets/images/ggg.png"
import "../../assets/child.css"
import { createChild } from "../../api/childrenService"
import toast from "react-hot-toast"

function ChildInfoStep1() {

  const navigate = useNavigate()

  const [form, setForm] = useState({
    fullName: "",
    dateOfBirth: "",
    gender: "",
    diagnosis: ""
  })

  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target

    setForm({
      ...form,
      [name]: name === "gender" ? Number(value) : value
    })
  }

  const handleSubmit = async () => {

    if (
      !form.fullName.trim() ||
      !form.dateOfBirth ||
      form.gender === "" ||
      !form.diagnosis.trim()
    ) {
      toast.error("املى كل البيانات ❌")
      return
    }

    const today = new Date().toISOString().split("T")[0]

    if (form.dateOfBirth > today) {
      toast.error("تاريخ الميلاد غير صحيح ❌")
      return
    }

    try {
      setLoading(true)

      const res = await createChild(form)

      const childId = res?.id

      if (!childId) {
        toast.error("فيه مشكلة في ال API ❌")
        return
      }

      localStorage.setItem("childId", childId)

      toast.success("تم تسجيل الطفل بنجاح ✅")

      navigate("/child-image")

    } catch (err) {

      const errorMsg =
        err?.response?.data?.errors?.[0] ||
        err?.response?.data?.title ||
        "فيه خطأ ❌"

      toast.error(errorMsg)

    } finally {
      setLoading(false)
    }
  }

  const today = new Date().toISOString().split("T")[0]

  return (
    <div className="child-container">

      <div className="child-left">
        <img src={sideImg} alt="img" />
        <h3>مجتمع داعم ومتكامل</h3>
        <p>انضم لأكثر من 5000 عائلة تشارك نفس الرحلة والاهتمامات</p>
      </div>

      <div className="child-right">

        <div className="child-box">

          <h2 className="child-title">بيانات الطفل</h2>

          <p className="child-sub">ادخل البيانات الأساسية للطفل</p>

          <input
            className="child-input"
            name="fullName"
            placeholder="الاسم الكامل"
            value={form.fullName}
            onChange={handleChange}
          />

          <input
            className="child-input"
            type="date"
            name="dateOfBirth"
            max={today}
            value={form.dateOfBirth}
            onChange={handleChange}
          />

          <select
            className="child-input"
            name="gender"
            value={form.gender}
            onChange={handleChange}
          >
            <option value="">اختر الجنس</option>
            <option value="1">ذكر</option>
            <option value="2">أنثى</option>
            <option value="3">أخرى</option>
          </select>

          <input
            className="child-input"
            name="diagnosis"
            placeholder="التشخيص"
            value={form.diagnosis}
            onChange={handleChange}
          />

          <button
            className="child-btn"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? "جاري الحفظ..." : "التالي →"}
          </button>

        </div>

      </div>

    </div>
  )
}

export default ChildInfoStep1