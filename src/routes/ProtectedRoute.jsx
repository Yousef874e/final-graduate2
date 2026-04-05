import { Navigate } from "react-router-dom"
import { getAuth } from "../utils/auth"

function ProtectedRoute({ children }) {

  // مؤقتًا إلغاء الحماية
  return children

  // الكود القديم (سيبه عشان ترجعله بعدين)
  /*
  const { token } = getAuth()

  if (!token || token === "undefined") {
    return <Navigate to="/login" replace />
  }

  return children
  */
}

export default ProtectedRoute