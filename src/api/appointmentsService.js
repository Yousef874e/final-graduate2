import axiosClient from "./axiosClient"

// GET
export const getAppointmentsByChildId = async (childId, params = {}) => {
  const res = await axiosClient.get(
    `/Appointments/child/${childId}`,
    { params }
  )
  return res.data
}

// CREATE
export const createAppointment = async (data) => {
  const res = await axiosClient.post("/Appointments", data)
  return res.data
}

// UPDATE
export const updateAppointment = async (id, data) => {
  const res = await axiosClient.put(`/Appointments/${id}`, data)
  return res.data
}

// CANCEL
export const cancelAppointment = async (id) => {
  await axiosClient.post(`/Appointments/${id}/cancel`)
  return true
}

// COMPLETE
export const completeAppointment = async (id) => {
  await axiosClient.post(`/Appointments/${id}/complete`)
  return true
}