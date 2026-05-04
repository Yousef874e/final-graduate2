import axiosClient from "./axiosClient"

const upload = async (url, formData, onProgress) => {
  const res = await axiosClient.post(url, formData, {
    onUploadProgress: (e) => {
      if (onProgress && e.total) {
        const percent = Math.round((e.loaded * 100) / e.total)
        onProgress(percent)
      }
    }
  })
  return res.data
}

export const uploadFile = (file, data = {}, onProgress) => {
  const formData = new FormData()
  formData.append("File", file)
  formData.append("Description", data.description || "")
  formData.append("Category", data.category || 0)
  formData.append("ChildId", data.childId || 0)

  return upload("/Media/upload", formData, onProgress)
}

export const uploadImage = (file, data, onProgress) => {
  const formData = new FormData()
  formData.append("File", file)
  formData.append("Description", data?.description || "")
  formData.append("Category", data?.category || 0)

  if (data?.childId) {
    formData.append("ChildId", data.childId)
  }

  return upload("/Media/upload/image", formData, onProgress)
}

export const uploadVideo = (file, data, onProgress) => {
  const formData = new FormData()
  formData.append("File", file)
  formData.append("Description", data?.description || "")
  formData.append("Category", data?.category || 0)

  if (data?.childId) {
    formData.append("ChildId", data.childId)
  }

  return upload("/Media/upload/video", formData, onProgress)
}
export const getMediaPaged = async (params) => {
  const res = await axiosClient.get("/Media/paged", { params })
  return res.data
}

export const deleteMedia = async (id) => {
  const res = await axiosClient.delete(`/Media/${id}`)
  return res.data || true
}