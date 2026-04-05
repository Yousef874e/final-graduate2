import axios from "axios"

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL + "/api/v1",
  headers: {
    Accept: "application/json"
  }
})

axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken")
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

let isRefreshing = false
let failedQueue = []

const processQueue = (error, token = null) => {
  failedQueue.forEach(p => {
    error ? p.reject(error) : p.resolve(token)
  })
  failedQueue = []
}

axiosClient.interceptors.response.use(
  res => res,
  async (error) => {
    const original = error.config

    if (error.response?.status === 401 && !original._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        }).then(token => {
          original.headers.Authorization = `Bearer ${token}`
          return axiosClient(original)
        })
      }

      original._retry = true
      isRefreshing = true

      try {
        const refreshToken = localStorage.getItem("refreshToken")

        const res = await axios.post(
          `${import.meta.env.VITE_API_BASE_URL}/api/v1/Auth/refresh-token`,
          { refreshToken }
        )

        const newAccessToken = res.data.accessToken
        const newRefreshToken = res.data.refreshToken

        localStorage.setItem("accessToken", newAccessToken)
        localStorage.setItem("refreshToken", newRefreshToken)

        axiosClient.defaults.headers.Authorization = `Bearer ${newAccessToken}`

        processQueue(null, newAccessToken)

        original.headers.Authorization = `Bearer ${newAccessToken}`
        return axiosClient(original)

      } catch (err) {
        processQueue(err)
        localStorage.clear()
        window.location.href = "/login"
        return Promise.reject(err)
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(error)
  }
)

export default axiosClient