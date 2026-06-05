import axiosClient from "./axiosClient";

export const getChildren = async (params = {}) => {
  try {
    const res = await axiosClient.get("/Children", { params });
    return res.data;
  } catch (err) {
    console.error("Error getting children:", err);
    throw err;
  }
};

export const getChildProfile = async (childId) => {
  try {
    const res = await axiosClient.get(`/Children/${childId}`);
    return res.data;
  } catch (err) {
    if (err.response?.status === 404) {
      return null;
    }
    console.error("Error getting child profile:", err);
    throw err;
  }
};

export const createChild = async (data) => {
  try {
    const res = await axiosClient.post("/Children", data);
    return res.data;
  } catch (err) {
    console.error("Error creating child:", err);
    throw err;
  }
};

export const updateChild = async (childId, data) => {
  try {
    const res = await axiosClient.put(`/Children/${childId}`, data);
    return res.data;
  } catch (err) {
    console.error("Error updating child:", err);
    throw err;
  }
};

export const updateChildProfile = updateChild;

export const deleteChild = async (childId) => {
  try {
    await axiosClient.delete(`/Children/${childId}`);
    return true;
  } catch (err) {
    console.error("Error deleting child:", err);
    throw err;
  }
};

export const assignSpecialist = async (childId, specialistProfileId) => {
  try {
    const res = await axiosClient.put(`/Children/${childId}/specialist`, {
      specialistProfileId,
    });
    return res.data;
  } catch (err) {
    console.error("Error assigning specialist:", err);
    throw err;
  }
};

export const removeSpecialist = async (childId) => {
  try {
    const res = await axiosClient.delete(`/Children/${childId}/specialist`);
    return res.data;
  } catch (err) {
    console.error("Error removing specialist:", err);
    throw err;
  }
};

export const setChildImage = async (childId, mediaId) => {
  try {
    const res = await axiosClient.put(`/Children/${childId}/profile-image`, {
      mediaId,
    });
    return res.data;
  } catch (err) {
    console.error("Error setting child image:", err);
    throw err;
  }
};

export const getChildImage = async (childId) => {
  try {
    const res = await axiosClient.get(`/Children/${childId}/profile-image`);
    return res.data;
  } catch (err) {
    if (err.response?.status === 404) {
      return null;
    }
    console.error("Error getting child image:", err);
    throw err;
  }
};

export const deleteChildImage = async (childId) => {
  try {
    const res = await axiosClient.delete(`/Children/${childId}/profile-image`);
    return res.data;
  } catch (err) {
    console.error("Error deleting child image:", err);
    throw err;
  }
};