import axiosClient from "./axiosClient";

export const getExercises = async ({ PageNumber = 1, PageSize = 10 } = {}) => {
  try {
    const res = await axiosClient.get("/Exercises", {
      params: { PageNumber, PageSize },
    });
    return res.data;
  } catch (err) {
    console.error("Error fetching exercises:", err);
    throw err;
  }
};

export const getExerciseById = async (id) => {
  try {
    const res = await axiosClient.get(`/Exercises/${id}`);
    return res.data;
  } catch (err) {
    console.error(`Error fetching exercise ${id}:`, err);
    throw err;
  }
};

export const createExercise = async (data) => {
  try {
    const res = await axiosClient.post("/Exercises", data);
    return res.data;
  } catch (err) {
    console.error("Error creating exercise:", err);
    throw err;
  }
};

export const updateExercise = async (id, data) => {
  try {
    const res = await axiosClient.put(`/Exercises/${id}`, data);
    return res.data;
  } catch (err) {
    console.error(`Error updating exercise ${id}:`, err);
    throw err;
  }
};

export const deleteExercise = async (id) => {
  try {
    const res = await axiosClient.delete(`/Exercises/${id}`);
    return res.data;
  } catch (err) {
    console.error(`Error deleting exercise ${id}:`, err);
    throw err;
  }
};
