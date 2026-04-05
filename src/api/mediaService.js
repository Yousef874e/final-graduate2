import axiosClient from "./axiosClient"

export const uploadImage = async (formData, onProgress) => {
  const res = await axiosClient.post("/Media/upload/image", formData, {
    headers: { "Content-Type": "multipart/form-data" },
    onUploadProgress: (e) => {
      if (onProgress) {
        const percent = Math.round((e.loaded * 100) / e.total)
        onProgress(percent)
      }
    }
  })
  return res.data
}

export const getMediaPaged = async (params) => {
  const res = await axiosClient.get("/Media/paged", { params })
  return res.data
}

export const deleteMedia = async (id) => {
  const res = await axiosClient.delete(`/Media/${id}`)
  return res.data
}