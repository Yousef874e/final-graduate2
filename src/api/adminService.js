import axiosClient from "./axiosClient"
export const getAdminUsers = async (params) => {
  const res = await axiosClient.get("/Admin/users", { params })
  return res.data
}
export const updateUserStatus = async (id, data) => {
  const res = await axiosClient.patch(`/Admin/users/${id}/status`, data)
  return res.data
}
export const assignUserRole = async (id, data) => {
  const res = await axiosClient.post(`/Admin/users/${id}/roles`, data)
  return res.data
}
export const forceResetPassword = async (id) => {
  const res = await axiosClient.post(`/Admin/users/${id}/force-reset`)
  return res.data
}
export const getSystemMonitoring = async () => {
  const res = await axiosClient.get("/Admin/system-monitoring")
  return res.data
}
export const getSpecialists = async (params) => {
  const res = await axiosClient.get("/Specialists", { params })
  return res.data
}
export const assignSpecialistToChild = async (childId, specialistProfileId) => {
  const res = await axiosClient.put(
    `/Children/${childId}/specialist`,
    { specialistProfileId }
  )
  return res.data
}
export const unassignSpecialistFromChild = async (childId) => {
  const res = await axiosClient.delete(
    `/Children/${childId}/specialist`
  )
  return res.data
}