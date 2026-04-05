import axiosClient from "./axiosClient"

export const getAdminDashboard = async () => {
  const res = await axiosClient.get("/api/v1/Admin/dashboard")
  return res.data
}

export const getParentDashboard = async () => {
  const res = await axiosClient.get("/api/v1/Parent/dashboard")
  return res.data
}

export const getSpecialistDashboard = async () => {
  const res = await axiosClient.get("/api/v1/Specialist/dashboard")
  return res.data
}