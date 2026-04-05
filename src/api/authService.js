import axiosClient from "./axiosClient"

export const login = async (data) => {
  const res = await axiosClient.post("/Auth/login", data)
  return res.data
}

export const registerParent = async (data) => {
  const res = await axiosClient.post("/Auth/register/parent", data)
  return res.data
}

export const registerSpecialist = async (data) => {
  const res = await axiosClient.post("/Auth/register/specialist", data)
  return res.data
}

export const forgotPassword = async (data) => {
  const res = await axiosClient.post("/Account/forgot-password", data)
  return res.data
}

export const resetPassword = async (data) => {
  const res = await axiosClient.post("/Account/reset-password", data)
  return res.data
}