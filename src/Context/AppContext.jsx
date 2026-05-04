import { createContext, useContext, useEffect, useState, useCallback } from "react"
import { getParentDashboard, getSpecialistDashboard, getAdminDashboard } from "../api/dashboardService"
import { getSessionsByChild } from "../api/sessionsService"
import { getAppointmentsByChildId } from "../api/appointmentsService"
import { getSpecialistProfileImage } from "../api/specialistProfileService"

const AppContext = createContext()

// 🔥 استخراج userId من التوكن
const getUserIdFromToken = () => {
  try {
    const token = localStorage.getItem("accessToken")
    if (!token) return null

    const payload = JSON.parse(atob(token.split(".")[1]))
    return payload.nameid || payload.sub
  } catch {
    return null
  }
}

export const AppProvider = ({ children }) => {

  const [data, setData] = useState({})
  const [profileImage, setProfileImage] = useState(null)
  const [sessions, setSessions] = useState([])
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [userName, setUserName] = useState("")
  const [email, setEmail] = useState("")

  const roles = JSON.parse(localStorage.getItem("roles") || "[]")
  const role = roles[0]

  const userId = getUserIdFromToken() // 🔥 مهم

  const loadData = useCallback(async () => {
    try {
      setLoading(true)

      let dashboardRes

      if (role === "Admin") {
        dashboardRes = await getAdminDashboard()
      } else if (role === "Specialist") {
        dashboardRes = await getSpecialistDashboard()
      } else if (role === "Parent") {
        dashboardRes = await getParentDashboard()
      }

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

      if (role === "Parent") {

        const children = dashboardData?.children || []

        if (children.length === 0) {
          setSessions([])
          setAppointments([])
        } else {

          let allSessions = []
          let allAppointments = []

          const promises = children.map(async (child) => {
            try {
              const [sessionsRes, appointmentsRes] = await Promise.all([
                getSessionsByChild(child.childId),
                getAppointmentsByChildId(child.childId)
              ])

              return {
                sessions: (sessionsRes?.items || []).map(s => ({
                  ...s,
                  childName: child.childName
                })),
                appointments: (appointmentsRes?.items || []).map(a => ({
                  ...a,
                  childName: child.childName
                }))
              }
            } catch {
              return { sessions: [], appointments: [] }
            }
          })

          const results = await Promise.all(promises)

          results.forEach(r => {
            allSessions.push(...r.sessions)
            allAppointments.push(...r.appointments)
          })

          setSessions(allSessions)
          setAppointments(allAppointments)
        }
      }

    } catch (err) {
      console.error("Context Error:", err)
    } finally {
      setLoading(false)
    }
  }, [role])

  useEffect(() => {
    const name = localStorage.getItem("userName")
    if (name) setUserName(name)

    const userEmail = localStorage.getItem("email")
    if (userEmail) setEmail(userEmail)

    if (role) {
      loadData()
    }
  }, [loadData, role])

  return (
    <AppContext.Provider
      value={{
        data,
        profileImage,
        sessions,
        appointments,
        loading,
        loadData,
        role,
        userName,
        email,
        userId // 🔥 المهم
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

export const useApp = () => useContext(AppContext)