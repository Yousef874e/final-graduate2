import "../../assets/adminDashboard.css";
import { useEffect, useState } from "react";

import { FaCalendarAlt, FaFileAlt, FaLink, FaEllipsisV } from "react-icons/fa";

import toast from "react-hot-toast";

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

  const [showFilter, setShowFilter] = useState(false);

  const [activeFilter, setActiveFilter] = useState("all");

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
  }, [search, activeFilter, users]);

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

    if (activeFilter === "active") {
      data = data.filter((u) => u.isActive);
    }

    if (activeFilter === "inactive") {
      data = data.filter((u) => !u.isActive);
    }

    setFilteredUsers(data);
  };

  const calculateAge = (date) => {
    if (!date) return "-";

    return new Date().getFullYear() - new Date(date).getFullYear();
  };

  const getStatus = (status) => {
    if (status === 0) return "قيد الانتظار";

    if (status === 1) return "مكتمل";

    if (status === 2) return "ملغي";

    return "-";
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
    if (!selectedSpecialist) {
      toast.error("اختار أخصائي ❌");

      return;
    }

    if (selectedUser.specialistProfileId) {
      toast.error("الطفل مربوط بالفعل");

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

  const deleteUser = async (user) => {
    try {
      if (user.isActive) {
        await updateChild(user.id, {
          fullName: user.fullName,

          dateOfBirth: user.dateOfBirth,

          gender: user.gender,

          diagnosis: user.diagnosis,

          specialistProfileId: user.specialistProfileId,

          isActive: false,
        });

        setUsers((prev) =>
          prev.map((u) =>
            u.id === user.id
              ? {
                  ...u,
                  isActive: false,
                }
              : u,
          ),
        );

        toast.success("تم تعطيل المستخدم ⚠️");

        return;
      }

      await deleteChild(user.id);

      setUsers((prev) => prev.filter((u) => u.id !== user.id));

      toast.success("تم الحذف 🗑️");
    } catch {
      toast.error("المستخدم مرتبط ببيانات ❌");
    }
  };

  const openEdit = (user) => {
    if (!user.isActive) {
      toast.error("مينفعش تعدل مستخدم غير نشط ❌");

      return;
    }

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

        <button
          className="filter-btn"
          onClick={() => setShowFilter(!showFilter)}
        >
          تصفية
        </button>
      </div>

      {showFilter && (
        <div className="filter-box">
          <button onClick={() => setActiveFilter("all")}>الكل</button>

          <button onClick={() => setActiveFilter("active")}>مفعل</button>

          <button onClick={() => setActiveFilter("inactive")}>غير مفعل</button>
        </div>
      )}

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

                  <span
                    style={{
                      color: user.isActive ? "green" : "red",
                    }}
                  >
                    {user.isActive ? "نشط" : "غير نشط"}
                  </span>
                </div>
              </div>

              <FaEllipsisV
                onClick={() =>
                  setShowMenu(showMenu === user.id ? null : user.id)
                }
              />

              {showMenu === user.id && (
                <div className="dropdown">
                  <div onClick={() => openEdit(user)}>تعديل</div>

                  <div onClick={() => deleteUser(user)}>حذف</div>
                </div>
              )}
            </div>

            <div className="divider" />

            <div className="user-actions">
              <div
                onClick={() => {
                  setSelectedUser(user);

                  setShowLink(true);
                }}
              >
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
    </div>
  );
}

export default AdminUsers;
