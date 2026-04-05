import axiosClient from "./axiosClient"

export const getTreatmentPlans = async (childId) => {
  const res = await axiosClient.get(`/TreatmentPlans/child/${childId}`)
  return res.data
}