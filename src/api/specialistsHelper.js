import axiosClient from "./axiosClient"

export const getSpecialistProfile = async () => {
  const res = await axiosClient.get("/specialist/profile")
  return res.data
}

export const updateSpecialistProfile = async (data) => {
  const res = await axiosClient.put("/specialist/profile", data)
  return res.data
}

export const getSpecialistById = async (id) => {
  const res = await axiosClient.get(`/specialist/profile/${id}`)
  return res.data
}