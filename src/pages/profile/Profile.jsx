import styles from "../../assets/profile.module.css";
import dashboardStyles from "../../assets/dashboard.module.css";

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  getChildProfile,
  setChildImage,
  getChildImage,
} from "../../api/childrenService";

import {
  getParentProfileImage,
  setParentProfileImage,
  getParentProfile,
  updateParentProfile,
} from "../../api/parentProfileService";

import { uploadImage } from "../../api/mediaService";

import { useApp } from "../../Context/AppContext";

import toast from "react-hot-toast";

import { clearAuth } from "../../utils/auth";

function Profile() {
  const navigate = useNavigate();

  const { data, setParentImage: setParentImageInContext } = useApp();

  const childId = data?.children?.[0]?.childId;

  const [child, setChild] = useState({});
  const [parent, setParent] = useState({});
  const [childImage, setChildImageUrl] = useState(null);
  const [parentImage, setParentImage] = useState(null);
  const [childPreview, setChildPreview] = useState(null);
  const [parentPreview, setParentPreview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchData();
  }, [childId]);

  const fetchData = async () => {
    try {
      setLoading(true);

      const parentRes = await getParentProfile();
      setParent(parentRes || {});

      try {
        const parentImg = await getParentProfileImage();
        const imageUrl = parentImg?.url || null;
        setParentImage(imageUrl);
        setParentImageInContext(imageUrl);
      } catch {
        setParentImage(null);
        setParentImageInContext(null);
      }

      if (childId) {
        const childRes = await getChildProfile(childId);
        setChild(childRes || {});

        try {
          const childImg = await getChildImage(childId);
          const imageUrl = childImg?.url || null;
          setChildImageUrl(imageUrl);
        } catch {
          setChildImageUrl(null);
        }
      }
    } catch (err) {
      toast.error("فشل تحميل البيانات");
    } finally {
      setLoading(false);
    }
  };

  const handleParentChange = (e) => {
    setParent((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await updateParentProfile({
        fullName: parent.fullName,
        phoneNumber: parent.phoneNumber,
        address: parent.address,
      });
      localStorage.setItem("userName", parent.fullName);
      toast.success("تم حفظ البيانات");
    } catch {
      toast.error("فشل الحفظ");
    } finally {
      setSaving(false);
    }
  };

  const handleChildImage = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setChildPreview(URL.createObjectURL(file));

    try {
      const res = await uploadImage(file, {
        category: 2,
      });
      
      await setChildImage(childId, res.id);
      
      setChildImageUrl(res.url);
      setChildPreview(null);
      toast.success("تم تغيير صورة الطفل");
      
    } catch (error) {
      toast.error("فشل رفع الصورة");
      setChildPreview(null);
    }
  };

  const handleParentImage = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setParentPreview(URL.createObjectURL(file));

    try {
      const res = await uploadImage(file, {
        category: 2,
      });
      
      await setParentProfileImage(res.id);
      
      setParentImage(res.url);
      setParentImageInContext(res.url);
      setParentPreview(null);
      toast.success("تم تغيير الصورة");
    } catch (error) {
      toast.error("فشل رفع الصورة");
      setParentPreview(null);
    }
  };

  if (loading) {
    return <p>Loading...</p>;
  }

  return (
    <div className={dashboardStyles.specialistsPage}>
      <div className={styles.header}>
        <h2 className={dashboardStyles.pageTitle}>الملف الشخصي</h2>

        <button
          className={styles.saveBtn}
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? "جارٍ الحفظ..." : "حفظ التغييرات"}
        </button>
      </div>

      <div className={styles.container}>
        <div className={styles.right}>
          <div className={styles.profileCard}>
            <img
              src={parentPreview || parentImage || "/avatar.png"}
              className={styles.avatar}
              alt="profile"
            />

            <h3>
              {parent.fullName ||
                localStorage.getItem("userName") ||
                "ولي الأمر"}
            </h3>

            <div className={styles.parentInfo}>
              <div className={styles.parentField}>
                <label>اسم ولي الأمر</label>
                <input
                  name="fullName"
                  value={parent.fullName || ""}
                  onChange={handleParentChange}
                  placeholder="اسم ولي الأمر"
                />
              </div>

              <div className={styles.parentField}>
                <label>رقم الهاتف</label>
                <input
                  name="phoneNumber"
                  value={parent.phoneNumber || ""}
                  onChange={handleParentChange}
                  placeholder="رقم الهاتف"
                />
              </div>

              <div className={styles.parentField}>
                <label>العنوان</label>
                <input
                  name="address"
                  value={parent.address || ""}
                  onChange={handleParentChange}
                  placeholder="العنوان"
                />
              </div>
            </div>

            <label className={styles.uploadBtn}>
              تغيير الصورة
              <input type="file" hidden onChange={handleParentImage} />
            </label>

            <button
              className={styles.logout}
              onClick={() => {
                clearAuth();
                navigate("/login");
              }}
            >
              تسجيل الخروج
            </button>
          </div>
        </div>

        <div className={styles.left}>
          <div className={styles.card}>
            <h3>بيانات الطفل</h3>

            <div className={styles.childBox}>
              <img
                src={childPreview || childImage || "/avatar.png"}
                className={styles.avatar}
                alt="child"
              />

              <span>{child.fullName || "لا يوجد طفل"}</span>

              {childId && (
                <label className={styles.uploadBtn}>
                  تغيير صورة الطفل
                  <input type="file" hidden onChange={handleChildImage} />
                </label>
              )}
            </div>

            <div className={styles.grid}>
              <input
                value={child.fullName || ""}
                readOnly
                placeholder="اسم الطفل"
              />

              <input
                value={child.dateOfBirth?.split("T")[0] || ""}
                readOnly
                placeholder="تاريخ الميلاد"
              />

              <input
                value={child.diagnosis || ""}
                readOnly
                placeholder="التشخيص"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;