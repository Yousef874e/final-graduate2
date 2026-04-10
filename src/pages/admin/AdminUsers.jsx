import "../../assets/adminDashboard.css"
import { useEffect, useState } from "react"
import { FaCalendarAlt, FaFileAlt, FaLink, FaEllipsisV } from "react-icons/fa"

import { getChildren } from "../../api/childrenService"
import { getSessionsByChild } from "../../api/sessionsService"
import { getMedicalReports } from "../../api/medicalReportsService"
import { getProgressReports } from "../../api/progressReportsService"
import { getSpecialists, assignSpecialistToChild } from "../../api/adminService"

function AdminUsers() {

  const [users, setUsers] = useState([])
  const [selectedUser, setSelectedUser] = useState(null)

  const [reports, setReports] = useState([])
  const [sessions, setSessions] = useState([])
  const [specialists, setSpecialists] = useState([])

  const [showReports, setShowReports] = useState(false)
  const [showSessions, setShowSessions] = useState(false)
  const [showLink, setShowLink] = useState(false)
  const [showMenu, setShowMenu] = useState(null)
  const [showFilter, setShowFilter] = useState(false)

  const [selectedSpecialist, setSelectedSpecialist] = useState("")
  const [search, setSearch] = useState("")

  useEffect(() => {
    loadUsers()
    loadSpecialists()
  }, [])

  const loadUsers = async () => {
    const res = await getChildren()
    setUsers(res.items || [])
  }

  const loadSpecialists = async () => {
    const res = await getSpecialists()
    setSpecialists(res.items || [])
  }

  const openReports = async (user) => {
    setSelectedUser(user)
    setShowReports(true)

    const r1 = await getMedicalReports(user.id)
    const r2 = await getProgressReports(user.id)

    setReports([...(r1.items || []), ...(r2.items || [])])
  }

  const openSessions = async (user) => {
    setSelectedUser(user)
    setShowSessions(true)

    const res = await getSessionsByChild(user.id)
    setSessions(res.items || [])
  }

  const handleLink = async () => {
    if (!selectedSpecialist) return

    await assignSpecialistToChild(selectedUser.id, {
      specialistProfileId: Number(selectedSpecialist)
    })

    setShowLink(false)
    setSelectedSpecialist("")
  }

  // 🔥 فلترة بالبحث
  const filteredUsers = users.filter(user =>
    user.fullName?.toLowerCase().includes(search.toLowerCase())
  )

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
          <label><input type="checkbox" /> طفل</label>
          <label><input type="checkbox" /> أخصائي</label>
          <label><input type="checkbox" /> مفعل</label>
          <label><input type="checkbox" /> غير مفعل</label>
        </div>
      )}

      <input
        className="search"
        placeholder="بحث..."
        onChange={(e) => setSearch(e.target.value)}
      />

      <div className="users-grid">
        {filteredUsers.map((user) => (
          <div className="user-card" key={user.id}>

            <div className="user-top">

              <div className="user-info">
                <img
                  src={user.profileImageUrl || "/default.png"}
                  className="avatar"
                />

                <div>
                  <h3 title={user.fullName}>{user.fullName}</h3>
                  <p>{user.age || "-" } سنة</p>

                  <span className={user.isActive ? "status active" : "status inactive"}>
                    {user.isActive ? "مفعل" : "غير مفعل"}
                  </span>
                </div>
              </div>

              <FaEllipsisV
                className="menu-icon"
                onClick={() => setShowMenu(user.id)}
              />

              {showMenu === user.id && (
                <div className="dropdown">
                  <div>حذف</div>
                  <div>تعطيل</div>
                  <div onClick={() => {
                    setSelectedUser(user)
                    setShowLink(true)
                  }}>ربط</div>
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

    </div>
  )
}

export default AdminUsers