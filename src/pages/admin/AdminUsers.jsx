import "../../assets/adminDashboard.css"
import { useEffect, useState } from "react"
import { FaCalendarAlt, FaFileAlt, FaLink, FaEllipsisV } from "react-icons/fa"
import toast from "react-hot-toast"

import { getChildren, deleteChild, updateChild } from "../../api/childrenService"
import { getSessionsByChild } from "../../api/sessionsService"
import { getMedicalReports } from "../../api/medicalReportsService"
import { getProgressReports } from "../../api/progressReportsService"
import { getSpecialists, assignSpecialistToChild } from "../../api/adminService"

function AdminUsers() {

  const [users, setUsers] = useState([])
  const [filteredUsers, setFilteredUsers] = useState([])
  const [selectedUser, setSelectedUser] = useState(null)

  const [reports, setReports] = useState([])
  const [sessions, setSessions] = useState([])
  const [specialists, setSpecialists] = useState([])

  const [showReports, setShowReports] = useState(false)
  const [showSessions, setShowSessions] = useState(false)
  const [showLink, setShowLink] = useState(false)
  const [showEdit, setShowEdit] = useState(false)

  const [showMenu, setShowMenu] = useState(null)

  const [selectedSpecialist, setSelectedSpecialist] = useState("")
  const [search, setSearch] = useState("")

  const [showFilter, setShowFilter] = useState(false)
  const [activeFilter, setActiveFilter] = useState("all")

  const [editForm, setEditForm] = useState({
    fullName: "",
    dateOfBirth: ""
  })

  useEffect(() => {
    loadUsers()
    loadSpecialists()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [search, activeFilter, users])

  const loadUsers = async () => {
    try {
      const res = await getChildren()
      const data = res.items || []
      setUsers(data)
      setFilteredUsers(data)
    } catch {
      toast.error("فشل تحميل المستخدمين ❌")
    }
  }

  const loadSpecialists = async () => {
    try {
      const res = await getSpecialists({ pageNumber: 1, pageSize: 50 })
      setSpecialists(res.items || [])
    } catch {
      toast.error("فشل تحميل الأخصائيين ❌")
    }
  }

  const applyFilters = () => {
    let data = [...users]

    if (search.trim()) {
      data = data.filter(u =>
        u.fullName?.toLowerCase().includes(search.toLowerCase())
      )
    }

    if (activeFilter === "active") {
      data = data.filter(u => u.isActive)
    }

    if (activeFilter === "inactive") {
      data = data.filter(u => !u.isActive)
    }

    setFilteredUsers(data)
  }

  const calculateAge = (date) => {
    if (!date) return "-"
    return new Date().getFullYear() - new Date(date).getFullYear()
  }

  const openReports = async (user) => {
    setSelectedUser(user)
    setShowReports(true)

    try {
      const r1 = await getMedicalReports(user.id)
      const r2 = await getProgressReports(user.id)
      setReports([...(r1.items || []), ...(r2.items || [])])
    } catch {
      toast.error("فشل تحميل التقارير ❌")
    }
  }

  const openSessions = async (user) => {
    setSelectedUser(user)
    setShowSessions(true)

    try {
      const res = await getSessionsByChild(user.id)
      setSessions(res.items || [])
    } catch {
      toast.error("فشل تحميل الجلسات ❌")
    }
  }

  const handleLink = async () => {
    if (!selectedSpecialist) {
      toast.error("اختار أخصائي ❌")
      return
    }

    try {
      await assignSpecialistToChild(selectedUser.id, {
        specialistProfileId: Number(selectedSpecialist)
      })

      toast.success("تم الربط ✅")
      setShowLink(false)
      setSelectedSpecialist("")
    } catch {
      toast.error("فشل الربط ❌")
    }
  }

  const deleteUser = async (id) => {
    try {
      await deleteChild(id)
      setUsers(users.filter(u => u.id !== id))
      toast.success("تم الحذف 🗑️")
    } catch {
      toast.error("فشل الحذف ❌")
    }
  }

  const openEdit = (user) => {
    setSelectedUser(user)
    setEditForm({
      fullName: user.fullName || "",
      dateOfBirth: user.dateOfBirth?.split("T")[0] || ""
    })
    setShowEdit(true)
  }

  const submitEdit = async () => {
    if (!editForm.fullName || !editForm.dateOfBirth) {
      toast.error("اكمل البيانات ❌")
      return
    }

    try {
      await updateChild(selectedUser.id, {
        fullName: editForm.fullName,
        dateOfBirth: editForm.dateOfBirth
      })

      toast.success("تم التعديل ✏️")
      setShowEdit(false)
      loadUsers()
    } catch {
      toast.error("فشل التعديل ❌")
    }
  }

  return (
    <div className="admin-page">

      <div className="users-header">
        <h2>ملفات المستخدمين</h2>

        <button className="filter-btn" onClick={() => setShowFilter(!showFilter)}>
          تصفية
        </button>
      </div>

      {showFilter && (
        <div className="filter-box">
  <button
    className={activeFilter === "all" ? "active" : ""}
    onClick={() => setActiveFilter("all")}
  >
    الكل
  </button>

  <button
    className={activeFilter === "active" ? "active" : ""}
    onClick={() => setActiveFilter("active")}
  >
    مفعل
  </button>

  <button
    className={activeFilter === "inactive" ? "active" : ""}
    onClick={() => setActiveFilter("inactive")}
  >
    غير مفعل
  </button>
</div>
      )}

      <input
        className="search"
        placeholder="بحث..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <div className="users-grid">
        {filteredUsers.map(user => (
          <div className="user-card" key={user.id}>

            <div className="user-top">
              <div className="user-info">
                <img src={user.profileImageUrl || "/default.png"} className="avatar" />

                <div>
                  <h3>{user.fullName}</h3>
                  <p>{calculateAge(user.dateOfBirth)} سنة</p>
                </div>
              </div>

              <FaEllipsisV
                className="menu-icon"
                onClick={() => setShowMenu(user.id)}
              />

              {showMenu === user.id && (
                <div className="dropdown">
                  <div onClick={() => openEdit(user)}>تعديل</div>
                  <div onClick={() => deleteUser(user.id)}>حذف</div>
                </div>
              )}
            </div>

            <div className="divider"></div>

            <div className="user-actions">

              <div onClick={() => {
                setSelectedUser(user)
                setShowLink(true)
              }}>
                <FaLink />
                <span>ربط</span>
              </div>

              <div onClick={() => openSessions(user)}>
                <FaCalendarAlt />
                <span>المواعيد</span>
              </div>

              <div onClick={() => openReports(user)}>
                <FaFileAlt />
                <span>التقارير</span>
              </div>

            </div>

          </div>
        ))}
      </div>

      {showReports && (
        <div className="modal">
          <div className="modal-content">
            <h3>التقارير</h3>
            {reports.map((r, i) => (
              <div key={i} className="item">{r.title || "تقرير"}</div>
            ))}
            <button onClick={() => setShowReports(false)}>إغلاق</button>
          </div>
        </div>
      )}

      {showSessions && (
        <div className="modal">
          <div className="modal-content">
            <h3>الجلسات</h3>
            {sessions.map((s, i) => (
              <div key={i} className="item">
                {new Date(s.createdAtUtc).toLocaleString()}
              </div>
            ))}
            <button onClick={() => setShowSessions(false)}>إغلاق</button>
          </div>
        </div>
      )}

      {showLink && (
        <div className="modal">
          <div className="modal-content">
            <h3>ربط طفل</h3>

            <select onChange={(e) => setSelectedSpecialist(e.target.value)}>
              <option value="">اختر أخصائي</option>
              {specialists.map(s => (
                <option key={s.specialistProfileId} value={s.specialistProfileId}>
                  {s.fullName}
                </option>
              ))}
            </select>

            <button onClick={handleLink}>حفظ</button>
            <button onClick={() => setShowLink(false)}>إغلاق</button>
          </div>
        </div>
      )}

      {showEdit && (
        <div className="modal">
          <div className="modal-content">

            <h3>تعديل</h3>

            <input
              value={editForm.fullName}
              onChange={e => setEditForm({ ...editForm, fullName: e.target.value })}
              placeholder="الاسم"
            />

            <input
              type="date"
              value={editForm.dateOfBirth}
              onChange={e => setEditForm({ ...editForm, dateOfBirth: e.target.value })}
            />

            <button onClick={submitEdit}>حفظ</button>
            <button onClick={() => setShowEdit(false)}>إغلاق</button>

          </div>
        </div>
      )}

    </div>
  )
}

export default AdminUsers