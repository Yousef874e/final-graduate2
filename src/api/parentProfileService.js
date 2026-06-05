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
    if (err?.response?.status !== 403) {
      console.error("Error getting parent profile by id:", err);
    }
    return null;
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

export const setParentProfileImage = async (mediaId) => {
  try {
    const res = await axiosClient.put("/Parent/profile-image", { mediaId });
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

export const getParentProfileWithChildren = async (id) => {
  try {
    const res = await axiosClient.get(`/Parent/profile/${id}`);
    return res.data;
  } catch (err) {
    if (err?.response?.status !== 403) {
      console.error("Error getting parent profile with children:", err);
    }
    return null;
  }
};

export const addChild = async (parentProfileId, childData) => {
  try {
    const res = await axiosClient.post(
      `/Parent/profile/${parentProfileId}/child`,
      childData
    );
    return res.data;
  } catch (err) {
    console.error("Error adding child:", err);
    throw err;
  }
};

export const updateChild = async (childId, childData) => {
  try {
    const res = await axiosClient.put(
      `/Parent/child/${childId}`,
      childData
    );
    return res.data;
  } catch (err) {
    console.error("Error updating child:", err);
    throw err;
  }
};

export const deleteChild = async (childId) => {
  try {
    const res = await axiosClient.delete(`/Parent/child/${childId}`);
    return res.data || true;
  } catch (err) {
    console.error("Error deleting child:", err);
    throw err;
  }
};

export const getChildById = async (childId) => {
  try {
    const res = await axiosClient.get(`/Parent/child/${childId}`);
    return res.data;
  } catch (err) {
    console.error("Error getting child by id:", err);
    throw err;
  }
};

export const getChildrenByParentId = async (parentProfileId) => {
  try {
    const res = await axiosClient.get(
      `/Parent/profile/${parentProfileId}/children`
    );
    return res.data;
  } catch (err) {
    console.error("Error getting children by parent id:", err);
    throw err;
  }
};