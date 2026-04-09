import axiosClient from "./axiosClient"
export const getAppointmentsByChild = async (childId, params) => {
  const res = await axiosClient.get(
    `/Appointments/child/${childId}`,
    { params }
  )
  return res.data
}
export const createAppointment = async (data) => {
  const res = await axiosClient.post("/Appointments", data)
  return res.data
}
export const updateAppointment = async (id, data) => {
  const res = await axiosClient.put(`/Appointments/${id}`, data)
  return res.data
}
export const cancelAppointment = async (id) => {
  const res = await axiosClient.post(`/Appointments/${id}/cancel`)
  return res.data
}
export const completeAppointment = async (id) => {
  const res = await axiosClient.post(`/Appointments/${id}/complete`)
  return res.data
}