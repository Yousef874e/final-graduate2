import axiosClient from "./axiosClient"

export const getAdminDashboard = async () => {
  const res = await axiosClient.get("/admin/dashboard")
  return res.data
}

export const getParentDashboard = async () => {
  const res = await axiosClient.get("/parent/dashboard")
  return res.data
}

export const getSpecialistDashboard = async () => {
  const res = await axiosClient.get("/specialist/dashboard")
  return res.data
}