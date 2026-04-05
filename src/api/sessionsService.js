import axiosClient from "./axiosClient"

export const getSessionsByChild = async (childId) => {
  const res = await axiosClient.get(`/Sessions/child/${childId}`)
  return res.data
}

export const getSessionById = async (id) => {
  const res = await axiosClient.get(`/Sessions/${id}`)
  return res.data
}

export const startSession = async (data) => {
  const res = await axiosClient.post("/Sessions/start", data)
  return res.data
}

export const submitSessionVideo = async (sessionId, mediaId) => {
  const res = await axiosClient.post(
    `/Sessions/${sessionId}/submit-video`,
    { mediaId }
  )
  return res.data
}