export const setAuth = (data) => {
  localStorage.setItem(
    "accessToken",
    data.accessToken || data.token || ""
  )

  localStorage.setItem(
    "refreshToken",
    data.refreshToken || ""
  )

  const roles = data.roles?.length
    ? data.roles
    : [data.role]

  localStorage.setItem(
    "roles",
    JSON.stringify(roles || [])
  )

  const email = data.email || ""

  const apiName =
    data.fullName ||
    data.name ||
    data.userName ||
    ""

  if (email) {
    localStorage.setItem("email", email)
  }

  if (apiName) {
    localStorage.setItem("userName", apiName)
  }
}

export const getAuth = () => {
  return {
    token:
      localStorage.getItem("accessToken") ||
      localStorage.getItem("token") ||
      "",

    refreshToken:
      localStorage.getItem("refreshToken") ||
      "",

    roles: JSON.parse(
      localStorage.getItem("roles") || "[]"
    ),

    userName:
      localStorage.getItem("userName") || "",

    email:
      localStorage.getItem("email") || "",
  }
}

export const clearAuth = () => {
  localStorage.removeItem("accessToken")
  localStorage.removeItem("refreshToken")
  localStorage.removeItem("roles")
  localStorage.removeItem("email")
  localStorage.removeItem("userName")
}