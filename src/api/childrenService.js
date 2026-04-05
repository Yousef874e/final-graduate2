import axiosClient from "./axiosClient"

export const getChildren = async () => {
  const res = await axiosClient.get("/Children")
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

export const updateChildProfile = async (childId, data) => {
  const res = await axiosClient.put(`/Children/${childId}`, data)
  return res.data
}
export const setChildImage = async (childId, mediaId) => {
  const res = await axiosClient.put(
    `/Children/${childId}/profile-image`,
    { mediaId }
  )
  return res.data
}