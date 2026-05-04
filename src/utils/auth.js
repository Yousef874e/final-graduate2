export const setAuth = (data) => {
  localStorage.setItem("accessToken", data.accessToken || "")
  localStorage.setItem("refreshToken", data.refreshToken || "")

  const roles = data.roles?.length ? data.roles : [data.role]
  localStorage.setItem("roles", JSON.stringify(roles || []))

  const email = data.email || ""

  const existingName = localStorage.getItem(`userName_${email}`)

  const apiName =
    data.fullName ||
    data.name ||
    data.userName ||
    ""

  let finalName = existingName || apiName

  if (!finalName && email) {
    finalName = email.split("@")[0]
  }

  if (email && finalName && !existingName) {
    localStorage.setItem(`userName_${email}`, finalName)
  }

  localStorage.setItem("email", email)
}

export const getAuth = () => {
  const email = localStorage.getItem("email") || ""

  return {
    token: localStorage.getItem("accessToken") || "",
    refreshToken: localStorage.getItem("refreshToken") || "",
    roles: JSON.parse(localStorage.getItem("roles") || "[]"),
    userName: localStorage.getItem(`userName_${email}`) || "",
    email
  }
}

export const clearAuth = () => {
  localStorage.removeItem("accessToken")
  localStorage.removeItem("refreshToken")
  localStorage.removeItem("roles")
  localStorage.removeItem("email")
}