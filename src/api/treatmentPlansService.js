import axiosClient from "./axiosClient";

export const getTreatmentPlans = async (
  childId,
  pageNumber = 1,
  pageSize = 10,
) => {
  const res = await axiosClient.get(`/TreatmentPlans/child/${childId}`, {
    params: {
      PageNumber: pageNumber,
      PageSize: pageSize,
    },
  });

  return {
    items: res.data?.items || [],
    totalCount: res.data?.totalCount || 0,
  };
};

export const createTreatmentPlan = async (data) => {
  const payload = {
    childId: Number(data.childId),
    title: data.title,
    notes: data.notes,
    startDate: data.startDate,
    endDate: data.endDate,
    isActive: true,

    exercises: data.exercises.map((ex) => ({
      exerciseId: Number(ex.exerciseId),
      expectedReps: Number(ex.expectedReps),
      sets: Number(ex.sets),
      dailyFrequency: Number(ex.dailyFrequency),
    })),
  };

  const res = await axiosClient.post("/TreatmentPlans", payload);

  return res.data;
};

export const getTreatmentPlanById = async (id) => {
  const res = await axiosClient.get(`/TreatmentPlans/${id}`);

  return res.data;
};

export const updateTreatmentPlan = async (id, data) => {
  const payload = {
    title: data.title,
    notes: data.notes,
    startDate: data.startDate,
    endDate: data.endDate,
    isActive: data.isActive !== undefined ? data.isActive : true,
   

    exercises: data.exercises.map((ex) => ({
      exerciseId: Number(ex.exerciseId),
      expectedReps: Number(ex.expectedReps),
      sets: Number(ex.sets),
      dailyFrequency: Number(ex.dailyFrequency),
      
    })),
  };

  const res = await axiosClient.put(`/TreatmentPlans/${id}`, payload);

  return res.data;
};

export const stopTreatmentPlan = async (id, data) => {
  const payload = {
    title: data.title,
    notes: data.notes,
    startDate: data.startDate,
    endDate: data.endDate,
    isActive: false,

    exercises: (data.exercises || []).map((ex) => ({
      exerciseId: Number(ex.exerciseId),
      expectedReps: Number(ex.expectedReps),
      sets: Number(ex.sets),
      dailyFrequency: Number(ex.dailyFrequency),
    })),
  };

 

  const res = await axiosClient.put(`/TreatmentPlans/${id}`, payload);

  return res.data;
};

