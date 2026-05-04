import axiosClient from "./axiosClient"

export const getTreatmentPlans = async (childId, pageNumber = 1, pageSize = 10) => {
  try {
    const res = await axiosClient.get(`/TreatmentPlans/child/${childId}`, {
      params: {
        PageNumber: pageNumber,
        PageSize: pageSize
      }
    })

    return res.data
  } catch (err) {
    console.error("Error fetching treatment plans:", err)
    throw err
  }
}