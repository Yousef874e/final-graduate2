import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";

import {
  getParentDashboard,
  getSpecialistDashboard,
  getAdminDashboard,
} from "../api/dashboardService";

import { getSessionsByChild } from "../api/sessionsService";

import { getAppointmentsByChildId } from "../api/appointmentsService";

import {
  getSpecialistProfileImage,
  getSpecialistProfile,
  getSpecialistProfileImageById,
  getSpecialistProfileById,
} from "../api/specialistProfileService";

import {
  getParentProfileImage,
  getParentProfile,
  getParentProfileById,
} from "../api/parentProfileService";

import { getChildren } from "../api/childrenService";

const AppContext = createContext();

const getUserIdFromToken = () => {
  try {
    const token = localStorage.getItem("accessToken");
    if (!token) return null;
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.nameid || payload.sub;
  } catch {
    return null;
  }
};

export const AppProvider = ({ children }) => {
  const [data, setData] = useState({});
  const [profileImage, setProfileImage] = useState(null);
  const [specialistImage, setSpecialistImage] = useState(null);
  const [specialistMediaId, setSpecialistMediaId] = useState(() => {
    return localStorage.getItem("specialistMediaId") || null;
  });
  const [parentImage, setParentImage] = useState(null);
  const [parentMediaId, setParentMediaId] = useState(() => {
    return localStorage.getItem("parentMediaId") || null;
  });
  const [sessions, setSessions] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState("");
  const [specialistName, setSpecialistName] = useState("");
  const [parentName, setParentName] = useState("");
  const [childrenWithDetails, setChildrenWithDetails] = useState([]);

  const roles = JSON.parse(localStorage.getItem("roles") || "[]");
  const role = roles[0];
  const userId = getUserIdFromToken();
  const savedUserName = localStorage.getItem("userName") || "مستخدم";

  const updateSpecialistImage = useCallback((url, mediaId = null) => {
    setSpecialistImage(url);
    if (mediaId !== null) {
      setSpecialistMediaId(mediaId);
      localStorage.setItem("specialistMediaId", mediaId);
    }
  }, []);

  const updateParentImage = useCallback((url, mediaId = null) => {
    setParentImage(url);
    if (mediaId !== null) {
      setParentMediaId(mediaId);
      localStorage.setItem("parentMediaId", mediaId);
    }
  }, []);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);

      let dashboardRes;
      if (role === "Admin") {
        dashboardRes = await getAdminDashboard();
      } else if (role === "Specialist") {
        dashboardRes = await getSpecialistDashboard();
      } else if (role === "Parent") {
        dashboardRes = await getParentDashboard();
      }

      const dashboardData = dashboardRes || {};
      setData(dashboardData);

      const childrenRes = await getChildren();

      if (role === "Specialist") {
        try {
          const img = await getSpecialistProfileImage();
          const imageUrl = img?.url || null;
          const mediaIdValue = img?.mediaId || null;
          setProfileImage(imageUrl);
          setSpecialistImage(imageUrl);
          if (mediaIdValue) {
            setSpecialistMediaId(mediaIdValue);
            localStorage.setItem("specialistMediaId", mediaIdValue);
          }
        } catch {
          setProfileImage(null);
          setSpecialistImage(null);
        }

        try {
          const profile = await getSpecialistProfile();
          const finalName = profile?.fullName || savedUserName;
          setSpecialistName(finalName);
          setUserName(finalName);
          localStorage.setItem("userName", finalName);
        } catch {
          setSpecialistName(savedUserName);
          setUserName(savedUserName);
        }

        const children = dashboardData?.children || [];
        if (children.length > 0) {
          const enrichedChildren = await Promise.all(
            children.map(async (child) => {
              try {
                const parentProfile = await getParentProfileById(child.parentProfileId);
                return {
                  ...child,
                  parentImageUrl: parentProfile?.profilePictureUrl || null,
                  parentFullName: parentProfile?.fullName || "ولي الأمر"
                };
              } catch {
                return {
                  ...child,
                  parentImageUrl: null,
                  parentFullName: "ولي الأمر"
                };
              }
            })
          );
          setChildrenWithDetails(enrichedChildren);
        }
      }

      if (role === "Parent") {
        try {
          const img = await getParentProfileImage();
          const imageUrl = img?.url || null;
          const mediaIdValue = img?.id || img?.mediaId || null;
          setProfileImage(imageUrl);
          setParentImage(imageUrl);
          if (mediaIdValue) {
            setParentMediaId(mediaIdValue);
            localStorage.setItem("parentMediaId", mediaIdValue);
          }
        } catch {
          setProfileImage(null);
          setParentImage(null);
        }

        try {
          const profile = await getParentProfile();
          const finalName = profile?.fullName || savedUserName;
          setParentName(finalName);
          setUserName(finalName);
          localStorage.setItem("userName", finalName);
        } catch {
          setParentName(savedUserName);
          setUserName(savedUserName);
        }

        const children = dashboardData?.children || [];

        if (children.length > 0) {
          const firstChild = children[0];
          setSpecialistName(firstChild?.specialistName || "");

          const childDetails = childrenRes?.items?.find(
            (c) => c.id === firstChild.childId
          );
          
          const specialistId = childDetails?.specialistProfileId;
          
          let imageUrl = null;
          
          if (specialistId) {
            try {
              const specialistProfile = await getSpecialistProfileById(specialistId);
              if (specialistProfile) {
                imageUrl = specialistProfile?.profilePictureUrl || null;
                setSpecialistImage(imageUrl);
                localStorage.setItem("specialistProfileId", specialistId);
              }
            } catch {
              imageUrl = null;
            }
          } else {
            const storedMediaId = localStorage.getItem("specialistMediaId");
            if (storedMediaId) {
              try {
                const specialistImg = await getSpecialistProfileImageById(storedMediaId);
                imageUrl = specialistImg?.url || null;
              } catch {
                imageUrl = null;
              }
            }
          }
          
          setSpecialistImage(imageUrl);

          const enrichedChildren = children.map((child) => ({
            ...child,
            specialistImageUrl: imageUrl,
            specialistFullName: child.specialistName || "الأخصائي"
          }));
          setChildrenWithDetails(enrichedChildren);
        }

        if (children.length === 0) {
          setSessions([]);
          setAppointments([]);
        } else {
          let allSessions = [];
          let allAppointments = [];

          const promises = children.map(async (child) => {
            try {
              const [sessionsRes, appointmentsRes] = await Promise.all([
                getSessionsByChild(child.childId),
                getAppointmentsByChildId(child.childId),
              ]);
              return {
                sessions: (sessionsRes?.items || []).map((s) => ({
                  ...s,
                  childName: child.childName,
                })),
                appointments: (appointmentsRes?.items || []).map((a) => ({
                  ...a,
                  childName: child.childName,
                  specialistName: child.specialistName,
                })),
              };
            } catch {
              return { sessions: [], appointments: [] };
            }
          });

          const results = await Promise.all(promises);
          results.forEach((r) => {
            allSessions.push(...r.sessions);
            allAppointments.push(...r.appointments);
          });

          setSessions(allSessions);
          setAppointments(allAppointments);
        }
      }
    } catch (err) {
      console.error("Error loading data:", err);
    } finally {
      setLoading(false);
    }
  }, [role, savedUserName]);

  useEffect(() => {
    if (role) {
      loadData();
    }
  }, [loadData, role]);

  return (
    <AppContext.Provider
      value={{
        data,
        profileImage,
        specialistImage,
        specialistMediaId,
        parentImage,
        parentMediaId,
        sessions,
        appointments,
        loading,
        role,
        userName,
        specialistName,
        parentName,
        loadData,
        userId,
        setSpecialistImage: updateSpecialistImage,
        setParentImage: updateParentImage,
        childrenWithDetails,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);