import axiosClient from "./axiosClient"

export const getChildMessages = async (childId) => {
  const res = await axiosClient.get(`/Messages/child/${childId}`)
  return res.data
}

export const sendMessage = async (data) => {
  const res = await axiosClient.post(`/Messages`, data)
  return res.data
}

export const markMessageRead = async (messageId) => {
  const res = await axiosClient.patch(`/Messages/${messageId}/read`)
  return res.data
}