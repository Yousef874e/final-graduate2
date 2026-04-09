import axiosClient from "./axiosClient"

export const generateReport = async (data) => {
  const res = await axiosClient.post("/progressReports/generate", data)
  return res.data
}

export const getProgressReports = async (childId) => {
  const res = await axiosClient.get(`/progressReports/${childId}`)
  return res.data
}