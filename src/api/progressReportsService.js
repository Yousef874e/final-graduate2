import axiosClient from "./axiosClient"

export const getProgressReports = async (childId) => {
  const res = await axiosClient.get(`/ProgressReports/child/${childId}`)
  return res.data
}

export const generateReport = async (data) => {
  const res = await axiosClient.post("/ProgressReports/generate", data)
  return res.data
}