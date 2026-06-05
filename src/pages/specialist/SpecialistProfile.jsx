import styles from "../../assets/profiles.module.css";
import { useEffect, useState } from "react";

import {
  getSpecialistProfile,
  getSpecialistProfileImage,
  setSpecialistProfileImage,
} from "../../api/specialistProfileService";

import { uploadImage } from "../../api/mediaService";

import toast from "react-hot-toast";
import { useApp } from "../../Context/AppContext";

function SpecialistProfile() {
  const { setSpecialistImage } = useApp();
  const [profile, setProfile] = useState(null);
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [mediaId, setMediaId] = useState(null);

  useEffect(() => {
    loadProfile();
    loadImage();
  }, []);

  const loadProfile = async () => {
    try {
      const res = await getSpecialistProfile();
      setProfile(res || null);
    } catch {
      toast.error("فشل تحميل البروفايل");
    } finally {
      setLoading(false);
    }
  };

  const loadImage = async () => {
    try {
      const res = await getSpecialistProfileImage();
      const imageUrl = res?.url || null;
      const id = res?.id || null;
      setImage(imageUrl);
      setMediaId(id);
      if (imageUrl) {
        setSpecialistImage(imageUrl);
      }
    } catch (err) {
      if (err?.response?.status === 404) {
        setImage(null);
        setMediaId(null);
        return;
      }
      setImage(null);
      setMediaId(null);
    }
  };

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("مسموح صور فقط");
      return;
    }

    const localPreview = URL.createObjectURL(file);
    setPreview(localPreview);

    try {
      setUploading(true);
      const media = await uploadImage(file, {
        category: 2,
      });
      await setSpecialistProfileImage({
        mediaId: media.id,
      });
      setImage(media.url);
      setMediaId(media.id);
      setSpecialistImage(media.url);
      toast.success("تم تحديث الصورة");
    } catch {
      toast.error("فشل رفع الصورة");
      setPreview(null);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.headerCard}>
        <div className={styles.cover}></div>
        <div className={styles.profileInfo}>
          <div className={styles.avatarWrapper}>
            <img
              src={preview || image || "/avatar.png"}
              className={styles.avatar}
              alt=""
            />
            <input
              type="file"
              accept="image/*"
              onChange={handleUpload}
              className={styles.fileInput}
              disabled={uploading}
            />
          </div>
          <div className={styles.info}>
            <h2>{loading ? "جاري التحميل..." : profile?.fullName || "دكتور"}</h2>
            <p>{profile?.specialization || "لا يوجد تخصص"}</p>
          </div>
        </div>
      </div>
      <div className={styles.grid}>
        <div className={styles.card}>
          <h3>نبذة عني</h3>
          <p>{profile?.bio || "لا يوجد وصف"}</p>
        </div>
      </div>
    </div>
  );
}

export default SpecialistProfile;