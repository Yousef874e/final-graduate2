import axiosClient from "./axiosClient"

export const getAdminDashboard = async () => {
  const res = await axiosClient.get("/Admin/dashboard")
  return res.data
}

export const getParentDashboard = async () => {
  const res = await axiosClient.get("/Parent/dashboard")
  return res.data
}

export const getSpecialistDashboard = async () => {
  const res = await axiosClient.get("/Specialist/dashboard")
  return res.data
}