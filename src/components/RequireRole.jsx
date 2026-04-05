import { Navigate } from "react-router-dom"
import { getAuth } from "../utils/auth"

function RequireRole({ children, allowedRoles }) {
  const { roles } = getAuth()

  const hasRole = roles.some(role => allowedRoles.includes(role))

  if (!hasRole) {
    return <Navigate to="/login" />
  }

  return children
}

export default RequireRole