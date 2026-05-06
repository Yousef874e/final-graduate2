import axiosClient from "./axiosClient"

export const getSpecialistProfileImage = async () => {
  const res = await axiosClient.get("/Specialist/profile-image")
  return res.data
}

export const setSpecialistProfileImage = async (data) => {
  const res = await axiosClient.put(
    "/Specialist/profile-image",
    data
  )

  return res.data
}

export const deleteSpecialistProfileImage = async () => {
  const res = await axiosClient.delete(
    "/Specialist/profile-image"
  )

  return res.data
}

export const getSpecialistProfile = async () => {
  const res = await axiosClient.get("/Specialist/profile")

  return res.data
}