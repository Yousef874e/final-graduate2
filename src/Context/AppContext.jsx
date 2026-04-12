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

  const [role] = useState(localStorage.getItem("role"))

  const loadData = async () => {
    try {
      setLoading(true)

      const dashboardRes =
        role === "Specialist"
          ? await getSpecialistDashboard()
          : await getParentDashboard()

      const dashboardData = dashboardRes || {}
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

        if (!childId) {
          setSessions([])
          setAppointments([])
          return
        }

        const [sessionsRes, appointmentsRes] = await Promise.all([
          getSessionsByChild(childId),
          getAppointmentsByChildId(childId)
        ])

        setSessions(sessionsRes?.items || sessionsRes || [])
        setAppointments(appointmentsRes?.items || appointmentsRes || [])
      }

    } catch (err) {
      console.error(err)
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