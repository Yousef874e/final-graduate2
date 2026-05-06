import axiosClient from "./axiosClient";

export const getParentProfile = async () => {
  try {
    const res = await axiosClient.get("/Parent/profile");

    return res.data;
  } catch (err) {
    console.error("Error getting parent profile:", err);

    throw err;
  }
};

export const getParentProfileById = async (id) => {
  try {
    const res = await axiosClient.get(`/Parent/profile/${id}`);

    return res.data;
  } catch (err) {
    console.error("Error getting parent profile by id:", err);

    throw err;
  }
};

export const updateParentProfile = async (data) => {
  try {
    const res = await axiosClient.put("/Parent/profile", data);

    return res.data;
  } catch (err) {
    console.error("Error updating parent profile:", err);

    throw err;
  }
};

export const getParentProfileImage = async () => {
  try {
    const res = await axiosClient.get("/Parent/profile-image");

    return res.data;
  } catch (err) {
    console.error("Error getting parent image:", err);

    throw err;
  }
};

export const setParentProfileImage = async (data) => {
  try {
    const res = await axiosClient.put("/Parent/profile-image", data);

    return res.data || true;
  } catch (err) {
    console.error("Error setting parent image:", err);

    throw err;
  }
};

export const deleteParentProfileImage = async () => {
  try {
    const res = await axiosClient.delete("/Parent/profile-image");

    return res.data || true;
  } catch (err) {
    console.error("Error deleting parent image:", err);

    throw err;
  }
};
