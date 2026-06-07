import axiosClient from "./axiosClient";

export const getParentProfile = async () => {
  try {
    const res = await axiosClient.get("/Parent/profile");
    return res.data;
  } catch (err) {
    throw err;
  }
};

export const getParentProfileById = async (id) => {
  try {
    const res = await axiosClient.get(`/Parent/profile/${id}`);
    return res.data;
  } catch (err) {
    if (err?.response?.status !== 403) {
      throw err;
    }
    return null;
  }
};

export const updateParentProfile = async (data) => {
  try {
    const res = await axiosClient.put("/Parent/profile", data);
    return res.data;
  } catch (err) {
    throw err;
  }
};

export const getParentProfileImage = async () => {
  try {
    const res = await axiosClient.get("/Parent/profile-image");
    return res.data;
  } catch (err) {
    throw err;
  }
};

export const setParentProfileImage = async (mediaId) => {
  try {
    const res = await axiosClient.put("/Parent/profile-image", { mediaId });
    return res.data !== undefined ? res.data : true;
  } catch (err) {
    throw err;
  }
};

export const deleteParentProfileImage = async () => {
  try {
    const res = await axiosClient.delete("/Parent/profile-image");
    return res.data || true;
  } catch (err) {
    throw err;
  }
};

export const getParentProfileWithChildren = async (id) => {
  try {
    const res = await axiosClient.get(`/Parent/profile/${id}`);
    return res.data;
  } catch (err) {
    if (err?.response?.status !== 403) {
      throw err;
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
    throw err;
  }
};

export const deleteChild = async (childId) => {
  try {
    const res = await axiosClient.delete(`/Parent/child/${childId}`);
    return res.data || true;
  } catch (err) {
    throw err;
  }
};

export const getChildById = async (childId) => {
  try {
    const res = await axiosClient.get(`/Parent/child/${childId}`);
    return res.data;
  } catch (err) {
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
    throw err;
  }
};