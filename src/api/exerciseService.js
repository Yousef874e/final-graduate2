import axiosClient from "./axiosClient"

export const getExercises = async (params) => {
  const res = await axiosClient.get("/Exercises", { params })
  return res.data
}

export const getExerciseById = async (id) => {
  const res = await axiosClient.get(`/Exercises/${id}`)
  return res.data
}

export const createExercise = async (data) => {
  const res = await axiosClient.post("/Exercises", data)
  return res.data
}

export const updateExercise = async (id, data) => {
  const res = await axiosClient.put(`/Exercises/${id}`, data)
  return res.data
}