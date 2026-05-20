import styles from "../../assets/exerciseDetails.module.css";

import { useEffect, useState } from "react";

import { useLocation, useNavigate, useParams } from "react-router-dom";

import { getExercises } from "../../api/exerciseService";

import {
  startSession,
  submitSessionVideo,
  getSessionsByChild,
} from "../../api/sessionsService";

import { uploadVideo } from "../../api/mediaService";

import { getChildren } from "../../api/childrenService";

import { useApp } from "../../Context/AppContext";

import toast from "react-hot-toast";

function ExerciseDetails() {
  const { id } = useParams();

  const location = useLocation();

  const navigate = useNavigate();

  const { loadData } = useApp();

  const [exercise, setExercise] = useState(null);

  const [loading, setLoading] = useState(true);

  const [sessionId, setSessionId] = useState(null);

  const [uploading, setUploading] = useState(false);

  const [childId, setChildId] = useState(null);

  const treatmentPlanExerciseId =
    location.state?.treatmentPlanExerciseId;

  const baseUrl = import.meta.env.VITE_API_BASE_URL;

  const getFullUrl = (url) => {
    if (!url) return null;

    if (url.startsWith("http")) {
      return url;
    }

    return `${baseUrl}${url}`;
  };

  useEffect(() => {
    if (id) {
      init();
    }
  }, [id]);

  const init = async () => {
    try {
      setLoading(true);

      const childrenRes = await getChildren();

      const child = childrenRes?.items?.[0];

      if (!child) {
        toast.error("لا يوجد طفل ❌");

        return;
      }

      const currentChildId = child.id;

      setChildId(currentChildId);

      const sessionsRes = await getSessionsByChild(currentChildId);

      const sessions = sessionsRes?.items || [];

      const alreadyCompleted = sessions.find(
        (s) =>
          s.treatmentPlanExerciseId === treatmentPlanExerciseId &&
          s.status === 5,
      );

      if (alreadyCompleted) {
        toast.success("تم إنهاء التمرين بالفعل ✅");

        navigate("/dashboard/library");

        return;
      }

      const res = await getExercises({
        PageNumber: 1,
        PageSize: 100,
      });

      const exercises = res?.items || [];

      const selected = exercises.find((e) => e.id == id);

      if (!selected) {
        toast.error("التمرين غير موجود ❌");

        return;
      }

      setExercise(selected);

      const existingSession = sessions.find(
        (s) =>
          s.treatmentPlanExerciseId === treatmentPlanExerciseId &&
          s.status !== 5,
      );

      if (existingSession) {
        setSessionId(existingSession.id);

        return;
      }

      const session = await startSession({
        childId: Number(currentChildId),

        exerciseId: selected.id,

        treatmentPlanExerciseId,
      });

      if (!session?.id) {
        toast.error("فشل بدء الجلسة ❌");

        return;
      }

      setSessionId(session.id);
    } catch (err) {
      console.log(err);

      toast.error("فشل تحميل التمرين ❌");
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e) => {
    const file = e.target.files[0];

    if (!file) return;

    if (!file.type.startsWith("video/")) {
      toast.error("مسموح فيديو فقط ❌");

      return;
    }

    if (!sessionId) {
      toast.error("لم يتم بدء الجلسة ❌");

      return;
    }

    try {
      setUploading(true);

      const media = await uploadVideo(file, {
        category: 4,

        childId: Number(childId),
      });

      if (!media?.id) {
        toast.error("فشل رفع الفيديو ❌");

        return;
      }

      await submitSessionVideo(sessionId, media.id);

      const updatedSessions = await getSessionsByChild(childId);

      console.log(updatedSessions.items);

      await loadData();

      toast.success("تم رفع الفيديو بنجاح ✅");

      navigate("/dashboard/library");
    } catch (err) {
      console.log(err);

      toast.error("فشل رفع الفيديو ❌");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className={styles.container}>
      <h3 className={styles.header}>التمرين</h3>

      <p className={styles.sub}>شاهد التمرين الآن</p>

      <div className={styles.videoBox}>
        {loading ? (
          <div className={styles.placeholder} />
        ) : exercise?.mediaUrl ? (
          <video
            controls
            width="100%"
            poster={getFullUrl(exercise.mediaThumbnailUrl) || undefined}
          >
            <source src={getFullUrl(exercise.mediaUrl)} type="video/mp4" />
          </video>
        ) : (
          <div className={styles.placeholder}>
            <p
              style={{
                textAlign: "center",
              }}
            >
              لا يوجد فيديو لهذا التمرين ❌
            </p>
          </div>
        )}
      </div>

      <div className={styles.card}>
        <h4>{exercise?.name || "تمرين"}</h4>

        <p>{exercise?.description || "لا يوجد وصف"}</p>

        <div className={styles.tags}>
          <span>{exercise?.exerciseType || "عام"}</span>
        </div>
      </div>

      <div className={styles.card}>
        <h4>قبل البدء</h4>

        <p>{exercise?.instructions || "تأكد من وجود مساحة كافية حول الطفل"}</p>
      </div>

      <label className={styles.uploadBtn}>
        {uploading ? "جاري الرفع..." : "رفع الفيديو"}

        <input
          type="file"
          accept="video/*"
          hidden
          onChange={handleUpload}
          disabled={uploading}
        />
      </label>
    </div>
  );
}

export default ExerciseDetails;