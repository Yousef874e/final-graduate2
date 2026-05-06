import { Navigate } from "react-router-dom"
import { getAuth } from "../utils/auth"

function ProtectedRoute({ children }) {

  const { token } = getAuth()

  if (!token || token === "undefined") {
    return <Navigate to="/login" replace />
  }

  return children
}

export default ProtectedRoute