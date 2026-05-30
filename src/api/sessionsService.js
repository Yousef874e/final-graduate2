import axiosClient from "./axiosClient";

export const getSessionsByChild = async (childId, params = {}) => {
  const res = await axiosClient.get(`/Sessions/child/${childId}`, {
    params,
  });

  return res.data;
};

export const getSessionById = async (id) => {
  const res = await axiosClient.get(`/Sessions/${id}`);

  return res.data;
};

export const startSession = async (data) => {
  const res = await axiosClient.post("/Sessions/start", {
    childId: data.childId,

    exerciseId: data.exerciseId,

    treatmentPlanExerciseId: data.treatmentPlanExerciseId,
  });

  return res.data;
};

export const submitSessionVideo = async (sessionId, mediaId) => {
  const res = await axiosClient.post(
    `/Sessions/${sessionId}/submit-video`,
    {
      mediaId,
    },
  );

  return res.data;
};
