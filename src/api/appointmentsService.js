// src/api/services/appointmentsService.js
import axiosClient from "./axiosClient"

// 📅 GET appointments by child
export const getAppointmentsByChild = async (childId, params) => {
  const res = await axiosClient.get(
    `/Appointments/child/${childId}`,
    { params }
  )
  return res.data
}

// ➕ CREATE appointment
export const createAppointment = async (data) => {
  const res = await axiosClient.post("/Appointments", data)
  return res.data
}

// ✏️ UPDATE appointment
export const updateAppointment = async (id, data) => {
  const res = await axiosClient.put(`/Appointments/${id}`, data)
  return res.data
}

// ❌ CANCEL appointment
export const cancelAppointment = async (id) => {
  const res = await axiosClient.post(`/Appointments/${id}/cancel`)
  return res.data
}

// ✅ COMPLETE appointment
export const completeAppointment = async (id) => {
  const res = await axiosClient.post(`/Appointments/${id}/complete`)
  return res.data
}