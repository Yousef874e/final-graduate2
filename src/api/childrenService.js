import axiosClient from "./axiosClient"

export const getChildren = async (params) => {
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

export const updateChildProfile = async (childId, data) => {
  return updateChild(childId, data)
}

export const deleteChild = async (childId) => {
  const res = await axiosClient.delete(`/Children/${childId}`)
  return res.data || true
}

export const setChildImage = async (childId, mediaId) => {
  const res = await axiosClient.put(
    `/Children/${childId}/profile-image`,
    { mediaId }
  )
  return res.data || true
}

export const getChildImage = async (childId) => {
  const res = await axiosClient.get(`/Children/${childId}/profile-image`)
  return res.data
}