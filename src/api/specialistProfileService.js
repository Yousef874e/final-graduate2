import axiosClient from "./axiosClient"

export const getSpecialistProfileImage = async () => {
  const res = await axiosClient.get("/Specialist/profile-image")
  return res.data
}

export const setSpecialistProfileImage = async (mediaId) => {
  const res = await axiosClient.put("/Specialist/profile-image", { mediaId })
  return res.data
}

export const deleteSpecialistProfileImage = async () => {
  const res = await axiosClient.delete("/Specialist/profile-image")
  return res.data
}