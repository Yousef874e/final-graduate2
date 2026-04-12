import axiosClient from "./axiosClient"

const upload = async (url, formData, onProgress) => {
  const res = await axiosClient.post(url, formData, {
    headers: {
      "Content-Type": "multipart/form-data"
    },
    onUploadProgress: (e) => {
      if (onProgress && e.total) {
        const percent = Math.round((e.loaded * 100) / e.total)
        onProgress(percent)
      }
    }
  })
  return res.data
}

export const uploadImage = (formData, onProgress) => {
  return upload("/Media/upload/image", formData, onProgress)
}

export const uploadVideo = (formData, onProgress) => {
  return upload("/Media/upload/video", formData, onProgress)
}

export const uploadFile = (formData, onProgress) => {
  return upload("/Media/upload", formData, onProgress)
}

export const getMediaPaged = async (params) => {
  const res = await axiosClient.get("/Media/paged", { params })
  return res.data
}

export const deleteMedia = async (id) => {
  const res = await axiosClient.delete(`/Media/${id}`)
  return res.data || true
}