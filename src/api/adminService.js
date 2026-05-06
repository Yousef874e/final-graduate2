import axiosClient from "./axiosClient";

export const getAdminUsers = async (params) => {
  const res = await axiosClient.get("/Admin/users", { params });
  return res.data;
};

export const getUserById = async (id) => {
  const res = await axiosClient.get(`/Admin/users/${id}`);
  return res.data;
};

export const updateUserStatus = async (id, isActive) => {
  const res = await axiosClient.patch(`/Admin/users/${id}/status`, {
    isActive,
  });
  return res.data;
};

export const assignUserRole = async (id, role) => {
  const res = await axiosClient.post(`/Admin/users/${id}/roles`, { role });
  return res.data;
};

export const forceResetPassword = async (id) => {
  await axiosClient.post(`/Admin/users/${id}/force-reset`);
};
export const getSystemMonitoring = async () => {
  const res = await axiosClient.get("/Admin/system-monitoring");
  return res.data;
};

export const getSpecialists = async (params) => {
  const res = await axiosClient.get("/Specialists", { params });
  return res.data;
};

export const assignSpecialistToChild = async (childId, specialistProfileId) => {
  const res = await axiosClient.put(`/Children/${childId}/specialist`, {
    specialistProfileId,
  });
  return res.data;
};

export const unassignSpecialistFromChild = async (childId) => {
  const res = await axiosClient.delete(`/Children/${childId}/specialist`);
  return res.data;
};

export const getParentProfiles = async (params) => {
  const res = await axiosClient.get("/Admin/parent-profiles", { params });
  return res.data;
};

export const getParentProfilesSummary = async () => {
  const res = await axiosClient.get("/Admin/parent-profiles/summary");
  return res.data;
};

export const getParentProfileById = async (id) => {
  const res = await axiosClient.get(`/Admin/parent-profiles/${id}`);
  return res.data;
};

export const getParentChildren = async (id, params) => {
  const res = await axiosClient.get(`/Admin/parent-profiles/${id}/children`, {
    params,
  });
  return res.data;
};
