import { createContext, useContext, useEffect, useState } from "react"
import { getParentDashboard } from "../api/dashboardService"

const AppContext = createContext()

export const AppProvider = ({ children }) => {

  const [data, setData] = useState({})
  const [profileImage, setProfileImage] = useState(null)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const res = await getParentDashboard()
      setData(res || {})
      setProfileImage(res?.parentProfileImageUrl || null)
    } catch {}
  }

  return (
    <AppContext.Provider value={{ data, profileImage }}>
      {children}
    </AppContext.Provider>
  )
}

export const useApp = () => useContext(AppContext)