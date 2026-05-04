import axiosClient from "./axiosClient"
export const getChildMessages = async (childId, params = {}) => {
  try {
    const res = await axiosClient.get(`/Messages/child/${childId}`, {
      params: {
        PageNumber: params.pageNumber || 1,
        PageSize: params.pageSize || 50
      }
    })

    return res.data
  } catch (err) {
    console.error("Error fetching messages:", err)
    throw err
  }
}

export const sendMessage = async (data) => {
  try {
    const res = await axiosClient.post(`/Messages`, data)
    return res.data
  } catch (err) {
    console.error("Error sending message:", err)
    throw err
  }
}


export const markMessageRead = async (messageId) => {
  try {
    await axiosClient.patch(`/Messages/${messageId}/read`)
    return true
  } catch (err) {
    console.error("Error marking message as read:", err)
    return false
  }
}
export const getConversations = async () => {
  const res = await axiosClient.get(`/Messages`)
  return res.data
}