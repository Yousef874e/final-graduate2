import { createContext, useContext, useEffect, useState } from "react"
import { getParentDashboard } from "../api/dashboardService"
import { getSessionsByChild } from "../api/sessionsService"
import { getAppointmentsByChildId } from "../api/appointmentsService"

const AppContext = createContext()

export const AppProvider = ({ children }) => {

  const [data, setData] = useState({})
  const [profileImage, setProfileImage] = useState(null)
  const [sessions, setSessions] = useState([])
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)

  const loadData = async () => {
    try {
      setLoading(true)

      // 1. Dashboard
      const dashboardRes = await getParentDashboard()
      const dashboardData = dashboardRes?.data || dashboardRes || {}

      setData(dashboardData)
      setProfileImage(dashboardData?.parentProfileImageUrl || null)

      // 2. childId
      const childId = dashboardData?.children?.[0]?.childId

      if (childId) {

        // 3. Sessions + Appointments
        const [sessionsRes, appointmentsRes] = await Promise.all([
          getSessionsByChild(childId),
          getAppointmentsByChildId(childId) // ✅ الاسم الصح
        ])

        setSessions(sessionsRes?.data?.data?.items || [])
        setAppointments(appointmentsRes?.data?.data?.items || [])
      }

    } catch (err) {
      console.log(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  return (
    <AppContext.Provider value={{
      data,
      profileImage,
      sessions,
      appointments,
      loading,
      loadData
    }}>
      {children}
    </AppContext.Provider>
  )
}

export const useApp = () => useContext(AppContext)