import axiosClient from "./axiosClient"
export const getAppointmentsByChildId = async (childId) => {
  const res = await axiosClient.get(`/Appointments/child/${childId}`)
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