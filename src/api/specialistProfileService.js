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

export const getSpecialistProfileById = async (id) => {
  try {
    const res = await axiosClient.get(`/specialist/profile/${id}`)
    return res.data
  } catch (err) {
    if (err?.response?.status !== 403) {
      console.error("Error getting specialist profile by id:", err)
    }
    return null
  }
}

export const updateSpecialistProfile = async (data) => {
  try {
    const res = await axiosClient.put("/specialist/profile", data)
    return res.data
  } catch (err) {
    console.error("Error updating specialist profile:", err)
    throw err
  }
}

export const updateSpecialistProfilePicture = async (specialistProfileId, imageData) => {
  try {
    const res = await axiosClient.put(`/specialist/profile/${specialistProfileId}/picture`, imageData)
    return res.data || true
  } catch (err) {
    console.error("Error updating specialist profile picture:", err)
    throw err
  }
}

export const deleteSpecialistProfilePicture = async (specialistProfileId) => {
  try {
    const res = await axiosClient.delete(`/specialist/profile/${specialistProfileId}/picture`)
    return res.data || true
  } catch (err) {
    console.error("Error deleting specialist profile picture:", err)
    throw err
  }
}

export const getSpecialistProfileImageById = async (specialistId) => {
  try {
    const res = await axiosClient.get(`/specialist/profile-image/${specialistId}`);
    return res.data;
  } catch (err) {
    console.error("Error getting specialist image by id:", err);
    return null;
  }
}