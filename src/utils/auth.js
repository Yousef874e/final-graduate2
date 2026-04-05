export const setAuth = (data) => {
  localStorage.setItem("accessToken", data.accessToken)
  localStorage.setItem("refreshToken", data.refreshToken)
  localStorage.setItem("roles", JSON.stringify(data.roles))

  // 🔥 المهم ده
  localStorage.setItem("userName", data.fullName || data.name || "")
}

export const getAuth = () => {
  return {
    token: localStorage.getItem("accessToken"),
    roles: JSON.parse(localStorage.getItem("roles") || "[]")
  }
}

export const clearAuth = () => {
  localStorage.clear()
}