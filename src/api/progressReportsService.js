import axiosClient from "./axiosClient"

export const generateReport = async (data) => {
  const res = await axiosClient.post("/ProgressReports/generate", data)
  return res.data
}

export const getProgressReports = async (childId, params) => {
  const res = await axiosClient.get(`/ProgressReports/child/${childId}`, { params })
  return res.data
}