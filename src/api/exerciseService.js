import axiosClient from "./axiosClient"
export const getExercises = async (pageNumber = 1, pageSize = 20) => {
  try {
    const res = await axiosClient.get('/Exercises', {
      params: { pageNumber, pageSize }
    })
    return res.data.items
  } catch (err) {
    throw err
  }
}
export const getExerciseById = async (id) => {
  try {
    const res = await axiosClient.get(`/Exercises/${id}`)
    return res.data
  } catch (err) {
    throw err
  }
}
export const createExercise = async (data) => {
  try {
    const res = await axiosClient.post('/Exercises', data)
    return res.data
  } catch (err) {
    throw err
  }
}
export const updateExercise = async (id, data) => {
  try {
    const res = await axiosClient.put(`/Exercises/${id}`, data)
    return res.data
  } catch (err) {
    throw err
  }
}