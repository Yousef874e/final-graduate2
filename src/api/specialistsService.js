import axiosClient from "./axiosClient"

export const getSpecialists = async (params) => {
  const res = await axiosClient.get("/Specialists", { params })
  return res.data
}