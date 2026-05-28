import axiosClient from "./axiosClient";
export const getSessionsByChild = async (childId, params = {}) => {
  const res = await axiosClient.get(`/Sessions/child/${childId}`, {
    params,
  });

  console.log("getSessionsByChild:", res.data);

  return res.data;
};
export const getSessionById = async (id) => {
  const res = await axiosClient.get(`/Sessions/${id}`);

  console.log("getSessionById:", res.data);

  return res.data;
};
export const startSession = async (data) => {
  const res = await axiosClient.post("/Sessions/start", {
    childId: data.childId,

    exerciseId: data.exerciseId,

    treatmentPlanExerciseId: data.treatmentPlanExerciseId,
  });

  console.log("startSession response:", res.data);

  return res.data;
};
export const submitSessionVideo = async (sessionId, mediaId) => {
  console.log("submitSessionVideo request:", {
    sessionId,
    mediaId,
  });

  const res = await axiosClient.post(`/Sessions/${sessionId}/submit-video`, {
    mediaId,
  });

  console.log("submitSessionVideo response:", res.data);
  if (res.data?.status) {
    console.log("Session Status After Submit:", res.data.status);
  }

  return res.data;
};
