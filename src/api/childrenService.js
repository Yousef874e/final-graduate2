import axiosClient from "./axiosClient"

export const getChildren = async (params = {}) => {
  const res = await axiosClient.get("/Children", { params })
  return res.data
}

export const getChildProfile = async (childId) => {
  const res = await axiosClient.get(`/Children/${childId}`)
  return res.data
}

export const createChild = async (data) => {
  const res = await axiosClient.post("/Children", data)
  return res.data
}

export const updateChild = async (childId, data) => {
  const res = await axiosClient.put(`/Children/${childId}`, data)
  return res.data
}

export const updateChildProfile = updateChild

export const deleteChild = async (childId) => {
  await axiosClient.delete(`/Children/${childId}`)
  return true
}

export const assignSpecialist = async (childId, specialistProfileId) => {
  const res = await axiosClient.put(
    `/Children/${childId}/specialist`,
    { specialistProfileId }
  )
  return res.data
}

export const removeSpecialist = async (childId) => {
  const res = await axiosClient.delete(
    `/Children/${childId}/specialist`
  )
  return res.data
}

export const setChildImage = async (childId, mediaId) => {
  const res = await axiosClient.put(
    `/Children/${childId}/profile-image`,
    { mediaId }
  )
  return res.data
}

export const getChildImage = async (childId) => {
  const res = await axiosClient.get(
    `/Children/${childId}/profile-image`
  )
  return res.data
}

export const deleteChildImage = async (childId) => {
  const res = await axiosClient.delete(
    `/Children/${childId}/profile-image`
  )
  return res.data
}