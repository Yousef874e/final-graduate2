import axiosClient from "./axiosClient"

export const getMedicalReports = async (childId, params) => {
  const res = await axiosClient.get(`/MedicalReports/child/${childId}`, { params })
  return res.data
}

export const createMedicalReport = async (data) => {
  const res = await axiosClient.post("/MedicalReports", data)
  return res.data
}

export const deleteMedicalReport = async (id) => {
  const res = await axiosClient.delete(`/MedicalReports/${id}`)
  return res.data
}

export const downloadMedicalReport = async (id) => {
  const res = await axiosClient.get(`/MedicalReports/${id}/download`, {
    responseType: "blob"
  })
  return res.data
}