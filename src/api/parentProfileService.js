import axiosClient from "./axiosClient"

export const getParentProfileImage = async () => {
  try {
    const res = await axiosClient.get("/Parent/profile-image")
    return res.data
  } catch (err) {
    console.error("Error getting parent image:", err)
    throw err
  }
}

export const setParentProfileImage = async (data) => {
  try {
    const res = await axiosClient.put("/Parent/profile-image", data)
    return res.data || true
  } catch (err) {
    console.error("Error setting parent image:", err)
    throw err
  }
}

export const deleteParentProfileImage = async () => {
  try {
    const res = await axiosClient.delete("/Parent/profile-image")
    return res.data || true
  } catch (err) {
    console.error("Error deleting parent image:", err)
    throw err
  }
}