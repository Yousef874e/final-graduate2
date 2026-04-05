import axiosClient from "./axiosClient"

export const getExercises = async (pageNumber = 1, pageSize = 20) => {
  const res = await axiosClient.get("/Exercises", {
    params: { pageNumber, pageSize }
  })
  return res.data
}