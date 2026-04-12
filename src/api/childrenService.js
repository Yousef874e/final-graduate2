import axiosClient from "./axiosClient"

// 📌 GET ALL
export const getChildren = async (params) => {
  const res = await axiosClient.get("/Children", { params })
  return res.data
}

// 📌 GET ONE
export const getChildProfile = async (childId) => {
  const res = await axiosClient.get(`/Children/${childId}`)
  return res.data
}

// 📌 CREATE
export const createChild = async (data) => {
  const res = await axiosClient.post("/Children", data)
  return res.data
}

// ✅ UPDATE (عام)
export const updateChild = async (childId, data) => {
  const res = await axiosClient.put(`/Children/${childId}`, data)
  return res.data
}

// ✅ UPDATE PROFILE (نفسه بس سيبه عشان المشروع)
export const updateChildProfile = async (childId, data) => {
  return updateChild(childId, data) // 👈 reuse بدل تكرار
}

// 📌 DELETE
export const deleteChild = async (childId) => {
  const res = await axiosClient.delete(`/Children/${childId}`)
  return res.data
}

// 📌 SET IMAGE
export const setChildImage = async (childId, mediaId) => {
  const res = await axiosClient.put(
    `/Children/${childId}/profile-image`,
    { mediaId }
  )
  return res.data
}

// 🔥 مهم عشان الصورة تظهر
export const getChildImage = async (childId) => {
  const res = await axiosClient.get(`/Children/${childId}/profile-image`)
  return res.data
}