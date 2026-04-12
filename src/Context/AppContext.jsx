import { createContext, useContext, useEffect, useState } from "react"
import { getParentDashboard, getSpecialistDashboard } from "../api/dashboardService"
import { getSessionsByChild } from "../api/sessionsService"
import { getAppointmentsByChildId } from "../api/appointmentsService"
import { getSpecialistProfileImage } from "../api/specialistProfileService"

const AppContext = createContext()

export const AppProvider = ({ children }) => {

  const [data, setData] = useState({})
  const [profileImage, setProfileImage] = useState(null)
  const [sessions, setSessions] = useState([])
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)

  const role = localStorage.getItem("role")

  const loadData = async () => {
    try {
      setLoading(true)

      let dashboardRes

      if (role === "Specialist") {
        dashboardRes = await getSpecialistDashboard()
      } else {
        dashboardRes = await getParentDashboard()
      }

      const dashboardData = dashboardRes?.data || dashboardRes || {}
      setData(dashboardData)

      if (role === "Specialist") {
        try {
          const img = await getSpecialistProfileImage()
          setProfileImage(img?.url || null)
        } catch {
          setProfileImage(null)
        }
      } else {
        setProfileImage(
          dashboardData?.parentProfileImageUrl ||
          dashboardData?.profileImageUrl ||
          null
        )
      }

      if (role !== "Specialist") {
        const childId = dashboardData?.children?.[0]?.childId

        if (childId) {
          const [sessionsRes, appointmentsRes] = await Promise.all([
            getSessionsByChild(childId),
            getAppointmentsByChildId(childId)
          ])

          setSessions(sessionsRes?.data?.data?.items || [])
          setAppointments(appointmentsRes?.data?.data?.items || [])
        }
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
      loadData,
      role
    }}>
      {children}
    </AppContext.Provider>
  )
}

export const useApp = () => useContext(AppContext)