import axiosClient from "./axiosClient"

export const getTreatmentPlans = async (childId, pageNumber = 1, pageSize = 10) => {
  const res = await axiosClient.get(`/TreatmentPlans/child/${childId}`, {
    params: {
      PageNumber: pageNumber,
      PageSize: pageSize
    }
  })

  return {
    items: res.data?.items || [],
    totalCount: res.data?.totalCount || 0
  }
}

export const createTreatmentPlan = async (data) => {
  const res = await axiosClient.post("/TreatmentPlans", data)
  return res.data
}

export const getTreatmentPlanById = async (id) => {
  const res = await axiosClient.get(`/TreatmentPlans/${id}`)
  return res.data
}

export const updateTreatmentPlan = async (id, data) => {
  const res = await axiosClient.put(`/TreatmentPlans/${id}`, data)
  return res.data
}

export const deleteTreatmentPlan = async (id) => {
  const res = await axiosClient.delete(`/TreatmentPlans/${id}`)
  return res.data
}