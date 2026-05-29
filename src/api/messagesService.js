import axiosClient from "./axiosClient";

export const getChildMessages = async (childId, params = {}) => {
  const res = await axiosClient.get(`/Messages/child/${childId}`, {
    params: {
      PageNumber: params.pageNumber || 1,
      PageSize: params.pageSize || 50,
    },
  });

  return res.data;
};

export const sendMessage = async (data) => {
  const res = await axiosClient.post(`/Messages`, data);
  return res.data;
};

export const markMessageRead = async (messageId) => {
  await axiosClient.patch(`/Messages/${messageId}/read`);
  return true;
};

export const getConversations = async () => {
  const res = await axiosClient.get(`/Messages`);
  return res.data;
};

export const deleteMessage = async (messageId) => {
  await axiosClient.delete(`/Messages/${messageId}`);
  return true;
};