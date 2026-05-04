export const setAuth = (data) => {
  localStorage.setItem("accessToken", data.accessToken || "")
  localStorage.setItem("refreshToken", data.refreshToken || "")

  const roles = data.roles || [data.role]
  localStorage.setItem("roles", JSON.stringify(roles || []))

  // 👇 نجيب الاسم القديم
  const existingName = localStorage.getItem("userName")

  // 👇 الاسم من API (لو موجود)
  const apiName =
    data.fullName ||
    data.name ||
    data.userName

  // 👇 الحل: متغيرش الاسم إلا لو مفيش واحد قديم
  const finalName = existingName || apiName

  if (finalName) {
    localStorage.setItem("userName", finalName)
  }

  localStorage.setItem("email", data.email || "")
}

export const getAuth = () => {
  return {
    token: localStorage.getItem("accessToken") || "",
    refreshToken: localStorage.getItem("refreshToken") || "",
    roles: JSON.parse(localStorage.getItem("roles") || "[]"),
    userName: localStorage.getItem("userName") || "",
    email: localStorage.getItem("email") || ""
  }
}

export const clearAuth = () => {
  localStorage.removeItem("accessToken")
  localStorage.removeItem("refreshToken")
  localStorage.removeItem("roles")
  localStorage.removeItem("email")

  // ❗ مهم: متحذفش الاسم
  // localStorage.removeItem("userName")
}