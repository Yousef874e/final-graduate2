import axiosClient from "./axiosClient"

export const getParentProfileImage = async () => {
  const res = await axiosClient.get("/Parent/profile-image")
  return res.data
}

export const setParentProfileImage = async (mediaId) => {
  const res = await axiosClient.put("/Parent/profile-image", { mediaId })
  return res.data
}

export const deleteParentProfileImage = async () => {
  const res = await axiosClient.delete("/Parent/profile-image")
  return res.data
}