import "../../assets/adminDashboard.css";
import { useEffect, useState } from "react";

import { FaCalendarAlt, FaFileAlt, FaLink, FaEllipsisV } from "react-icons/fa";

import toast from "react-hot-toast";
import Select from "react-select";

import {
  getChildren,
  deleteChild,
  updateChild,
  getChildImage,
} from "../../api/childrenService";

import { getAppointmentsByChildId } from "../../api/appointmentsService";

import { getMedicalReports } from "../../api/medicalReportsService";

import { getProgressReports } from "../../api/progressReportsService";

import {
  getSpecialists,
  assignSpecialistToChild,
} from "../../api/adminService";

import { getParentProfileById } from "../../api/parentProfileService";

function AdminUsers() {
  const [users, setUsers] = useState([]);

  const [filteredUsers, setFilteredUsers] = useState([]);

  const [selectedUser, setSelectedUser] = useState(null);

  const [reports, setReports] = useState([]);

  const [sessions, setSessions] = useState([]);

  const [specialists, setSpecialists] = useState([]);

  const [showReports, setShowReports] = useState(false);

  const [showSessions, setShowSessions] = useState(false);

  const [showLink, setShowLink] = useState(false);

  const [showEdit, setShowEdit] = useState(false);

  const [showMenu, setShowMenu] = useState(null);

  const [selectedSpecialist, setSelectedSpecialist] = useState("");

  const [search, setSearch] = useState("");

  const [editForm, setEditForm] = useState({
    fullName: "",
    dateOfBirth: "",
  });

  useEffect(() => {
    loadUsers();
    loadSpecialists();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [search, users]);

  const loadUsers = async () => {
    try {
      const res = await getChildren();

      let data = res.items || [];

      const promises = data.map(async (user) => {
        try {
          const parent = await getParentProfileById(user.parentProfileId);

          user.parentName = parent?.fullName || "ولي أمر";
        } catch {
          user.parentName = "ولي أمر";
        }

        try {
          const imageRes = await getChildImage(user.id);

          if (imageRes?.url) {
            user.profileImageUrl = imageRes.url;
          }
        } catch {
          user.profileImageUrl = "/default.png";
        }

        return user;
      });

      data = await Promise.all(promises);

      setUsers(data);

      setFilteredUsers(data);
    } catch {
      toast.error("فشل تحميل المستخدمين ❌");
    }
  };

  const loadSpecialists = async () => {
    try {
      const res = await getSpecialists({
        pageNumber: 1,
        pageSize: 50,
      });

      setSpecialists(res.items || []);
    } catch {
      toast.error("فشل تحميل الأخصائيين ❌");
    }
  };

  const applyFilters = () => {
    let data = [...users];

    if (search.trim()) {
      data = data.filter((u) =>
        u.fullName?.toLowerCase().includes(search.toLowerCase()),
      );
    }

    setFilteredUsers(data);
  };

  const calculateAge = (date) => {
    if (!date) return "-";

    return new Date().getFullYear() - new Date(date).getFullYear();
  };

  const formatDate = (dateString) => {
    if (!dateString) return "التاريخ غير متوفر";
    
    try {
      const date = new Date(dateString);
      
      if (isNaN(date.getTime())) {
        return "تاريخ غير صالح";
      }
      
      return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
    } catch (error) {
      return "خطأ في التاريخ";
    }
  };

  const openReports = async (user) => {
    setSelectedUser(user);

    setShowReports(true);

    try {
      const r1 = await getMedicalReports(user.id, {
        pageNumber: 1,
        pageSize: 50,
      });

      const r2 = await getProgressReports(user.id, {
        pageNumber: 1,
        pageSize: 50,
      });

      const medical = r1?.items || [];

      const progress = r2?.items || [];

      setReports([
        ...medical.map((r) => ({
          ...r,
          type: "medical",
        })),

        ...progress.map((r) => ({
          ...r,
          type: "progress",
        })),
      ]);
    } catch {
      toast.error("فشل تحميل التقارير ❌");
    }
  };

  const openSessions = async (user) => {
    setSelectedUser(user);

    setShowSessions(true);

    try {
      const res = await getAppointmentsByChildId(user.id, {
        pageNumber: 1,
        pageSize: 50,
      });

      setSessions(res.items || []);
    } catch {
      toast.error("فشل تحميل المواعيد ❌");
    }
  };

  const handleLink = async () => {
    if (selectedUser?.specialistProfileId) {
      toast.error("هذا الطفل مربوط بالفعل بأخصائي، لا يمكن ربطه بأخصائي آخر ❌");
      setShowLink(false);
      return;
    }

    if (!selectedSpecialist) {
      toast.error("اختار أخصائي ❌");
      return;
    }

    try {
      await assignSpecialistToChild(
        selectedUser.id,
        Number(selectedSpecialist),
      );

      toast.success("تم الربط ✅");

      setShowLink(false);

      setSelectedSpecialist("");

      loadUsers();
    } catch {
      toast.error("فشل الربط ❌");
    }
  };

  const handleUnlink = async () => {
    if (!selectedUser) return;

    try {
      await updateChild(selectedUser.id, {
        fullName: selectedUser.fullName,
        dateOfBirth: selectedUser.dateOfBirth,
        gender: selectedUser.gender,
        diagnosis: selectedUser.diagnosis,
        specialistProfileId: null,
      });

      toast.success("تم فك الربط ✅");
      setShowMenu(null);
      loadUsers();
    } catch {
      toast.error("فشل فك الربط ❌");
    }
  };

  const deleteUser = async (user) => {
    try {
      await deleteChild(user.id);

      setUsers((prev) => prev.filter((u) => u.id !== user.id));

      toast.success("تم الحذف 🗑️");
    } catch {
      toast.error("المستخدم مرتبط ببيانات ❌");
    }
  };

  const openEdit = (user) => {
    setSelectedUser(user);

    setEditForm({
      fullName: user.fullName || "",

      dateOfBirth: user.dateOfBirth?.split("T")[0] || "",
    });

    setShowEdit(true);
  };

  const submitEdit = async () => {
    try {
      await updateChild(selectedUser.id, {
        fullName: editForm.fullName,

        dateOfBirth: editForm.dateOfBirth,

        gender: selectedUser.gender,

        diagnosis: selectedUser.diagnosis,

        specialistProfileId: selectedUser.specialistProfileId,
      });

      setUsers((prev) =>
        prev.map((u) =>
          u.id === selectedUser.id
            ? {
                ...u,
                fullName: editForm.fullName,

                dateOfBirth: editForm.dateOfBirth,
              }
            : u,
        ),
      );

      toast.success("تم التعديل ✏️");

      setShowEdit(false);
    } catch {
      toast.error("فشل التعديل ❌");
    }
  };

  return (
    <div className="admin-page">
      <div className="users-header">
        <h2>ملفات المستخدمين</h2>
      </div>

      <input
        className="search"
        placeholder="بحث..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <div className="users-grid">
        {filteredUsers.map((user) => (
          <div className="user-card" key={user.id}>
            <div className="user-top">
              <div className="user-info">
                <img
                  src={user.profileImageUrl || "/default.png"}
                  alt=""
                  className="avatar"
                  onError={(e) => {
                    e.target.src = "/default.png";
                  }}
                />

                <div>
                  <h3>{user.fullName}</h3>

                  <p>السن: {calculateAge(user.dateOfBirth)} سنة</p>

                  <p>ولي الأمر: {user.parentName}</p>
                </div>
              </div>

              <FaEllipsisV
                className="menu-icon"
                onClick={() =>
                  setShowMenu(showMenu === user.id ? null : user.id)
                }
              />

              {showMenu === user.id && (
                <div className="dropdown">
                  <div onClick={() => openEdit(user)}>تعديل</div>
                  {user.specialistProfileId && (
                    <div onClick={() => {
                      setSelectedUser(user);
                      handleUnlink();
                    }}>فك الربط</div>
                  )}
                  <div onClick={() => deleteUser(user)}>حذف</div>
                </div>
              )}
            </div>

            <div className="divider" />

            <div className="user-actions">
              <div
                className={user.specialistProfileId ? "linked-btn" : ""}
                onClick={() => {
                  if (user.specialistProfileId) {
                    toast("هذا الطفل مربوط بالفعل بأخصائي", { icon: "🔗" });
                    return;
                  }
                  setSelectedUser(user);
                  setShowLink(true);
                }}
                style={user.specialistProfileId ? { opacity: 0.6, cursor: "pointer" } : {}}
              >
                <FaLink />
                <span>{user.specialistProfileId ? "مرتبط" : "ربط"}</span>
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

      {showLink && (
        <div className="modal">
          <div className="modal-content">
            <h3>ربط أخصائي</h3>

            <Select
              placeholder="اختر أخصائي"
              menuPlacement="bottom"
              menuPortalTarget={document.body}
              value={
                specialists
                  .map((s) => ({
                    value: s.specialistProfileId || s.id,
                    label: s.fullName,
                  }))
                  .find(
                    (option) => option.value === Number(selectedSpecialist),
                  ) || null
              }
              onChange={(option) => setSelectedSpecialist(option?.value || "")}
              options={specialists.map((s) => ({
                value: s.specialistProfileId || s.id,
                label: s.fullName,
              }))}
              styles={{
                menuPortal: (base) => ({
                  ...base,
                  zIndex: 9999,
                }),
                menu: (base) => ({
                  ...base,
                  zIndex: 9999,
                }),
              }}
            />

            <div className="modal-actions">
              <button onClick={handleLink}>ربط</button>

              <button onClick={() => setShowLink(false)}>إلغاء</button>
            </div>
          </div>
        </div>
      )}

      {showSessions && (
        <div className="modal">
          <div className="modal-content">
            <h3>المواعيد</h3>

            {sessions.length > 0 ? (
              sessions.map((s) => (
                <div key={s.id} className="session-card">
                  <p>التاريخ: {formatDate(s.scheduledAtUtc)}</p>
                </div>
              ))
            ) : (
              <p>لا توجد مواعيد</p>
            )}

            <div className="modal-actions">
              <button onClick={() => setShowSessions(false)}>إغلاق</button>
            </div>
          </div>
        </div>
      )}

      {showReports && (
        <div className="modal">
          <div className="modal-content">
            <h3>التقارير</h3>

            {reports.length > 0 ? (
              reports.map((r) => (
                <div key={r.id} className="report-card">
                  <p>
                    النوع:
                    {r.type === "medical" ? " تقرير طبي" : " تقرير متابعة"}
                  </p>

                  <p>{r.notes || r.description || "-"}</p>
                </div>
              ))
            ) : (
              <p>لا توجد تقارير</p>
            )}

            <div className="modal-actions">
              <button onClick={() => setShowReports(false)}>إغلاق</button>
            </div>
          </div>
        </div>
      )}

      {showEdit && (
        <div className="modal">
          <div className="modal-content">
            <h3>تعديل المستخدم</h3>

            <input
              type="text"
              value={editForm.fullName}
              onChange={(e) =>
                setEditForm({
                  ...editForm,
                  fullName: e.target.value,
                })
              }
              placeholder="الاسم"
            />

            <input
              type="date"
              value={editForm.dateOfBirth}
              onChange={(e) =>
                setEditForm({
                  ...editForm,
                  dateOfBirth: e.target.value,
                })
              }
            />

            <div className="modal-actions">
              <button onClick={submitEdit}>حفظ</button>

              <button onClick={() => setShowEdit(false)}>إلغاء</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminUsers;