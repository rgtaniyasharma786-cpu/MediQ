// // import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
// // import { authAPI } from '../services/api';
// // import { initSocket, disconnectSocket } from '../services/socket';

// // const AuthContext = createContext(null);

// // export const AuthProvider = ({ children }) => {
// //   const [user, setUser] = useState(null);
// //   const [profile, setProfile] = useState(null);
// //   const [loading, setLoading] = useState(true);
// //   const [notifications, setNotifications] = useState([]);

// //   // ✅ Define logout FIRST using useCallback so it's stable and
// //   //    can be safely referenced by fetchMe below
// //   const logout = useCallback(() => {
// //     localStorage.removeItem('token');
// //     localStorage.removeItem('user');
// //     setUser(null);
// //     setProfile(null);
// //     disconnectSocket();
// //   }, []);

// //   // ✅ fetchMe defined AFTER logout — safe to reference it
// //   const fetchMe = useCallback(async () => {
// //     try {
// //       const res = await authAPI.getMe();
// //       setUser(res.data.user);
// //       setProfile(res.data.profile);
// //       localStorage.setItem('user', JSON.stringify(res.data.user));
// //     } catch (err) {
// //       // Token invalid / expired — clear everything
// //       logout();
// //     } finally {
// //       setLoading(false);
// //     }
// //   }, [logout]);

// //   // ✅ useEffect runs AFTER both are defined — no hoisting issue
// //   useEffect(() => {
// //     const token     = localStorage.getItem('token');
// //     const savedUser = localStorage.getItem('user');
// //     if (token && savedUser) {
// //       try {
// //         setUser(JSON.parse(savedUser));
// //         initSocket();
// //         fetchMe();
// //       } catch {
// //         // Corrupted localStorage — clean up
// //         logout();
// //       }
// //     } else {
// //       setLoading(false);
// //     }
// //   }, [fetchMe, logout]);

// //   const login = async (email, password) => {
// //     const res = await authAPI.login({ email, password });
// //     const { token, user } = res.data;
// //     localStorage.setItem('token', token);
// //     localStorage.setItem('user', JSON.stringify(user));
// //     setUser(user);
// //     initSocket();
// //     await fetchMe();
// //     return user;
// //   };

// //   // register is intentionally NOT included in AuthContext
// //   // Registration is a plain API call in Register.jsx that returns no token.
// //   // After registration the user is redirected to /login to sign in manually.

// //   const updateUser = (updates) => {
// //     const updated = { ...user, ...updates };
// //     setUser(updated);
// //     localStorage.setItem('user', JSON.stringify(updated));
// //   };

// //   const addNotification = (notif) => {
// //     setNotifications(prev => [notif, ...prev].slice(0, 20));
// //   };

// //   return (
// //     <AuthContext.Provider value={{
// //       user, profile, loading, notifications,
// //       login, logout, updateUser, fetchMe, addNotification
// //     }}>
// //       {children}
// //     </AuthContext.Provider>
// //   );
// // };

// // export const useAuth = () => {
// //   const ctx = useContext(AuthContext);
// //   if (!ctx) throw new Error('useAuth must be used within AuthProvider');
// //   return ctx;
// // };

// // export default AuthContext;

// import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
// import { authAPI } from '../services/api';
// import { initSocket, disconnectSocket } from '../services/socket';

// const AuthContext = createContext(null);

// export const AuthProvider = ({ children }) => {
//   const [user, setUser] = useState(null);
//   const [profile, setProfile] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [notifications, setNotifications] = useState([]);

//   //  Define logout FIRST using useCallback so it's stable and
//   //    can be safely referenced by fetchMe below
//   const logout = useCallback(() => {
//     localStorage.removeItem('token');
//     localStorage.removeItem('user');
//     setUser(null);
//     setProfile(null);
//     disconnectSocket();
//   }, []);

//   // fetchMe defined AFTER logout — safe to reference it
//   const fetchMe = useCallback(async () => {
//     try {
//       const res = await authAPI.getMe();
//       setUser(res.data.user);
//       setProfile(res.data.profile);
//       localStorage.setItem('user', JSON.stringify(res.data.user));
//     } catch (err) {
//       // Token invalid / expired — clear everything
//       logout();
//     } finally {
//       setLoading(false);
//     }
//   }, [logout]);

//   // ✅ useEffect runs AFTER both are defined — no hoisting issue
//   useEffect(() => {
//     const token     = localStorage.getItem('token');
//     const savedUser = localStorage.getItem('user');
//     if (token && savedUser) {
//       try {
//         setUser(JSON.parse(savedUser));
//         initSocket();
//         fetchMe();
//       } catch {
//         // Corrupted localStorage — clean up
//         logout();
//       }
//     } else {
//       setLoading(false);
//     }
//   }, [fetchMe, logout]);

//   const login = async (email, password) => {
//     const res = await authAPI.login({ email, password });
//     const { token, user } = res.data;
//     localStorage.setItem('token', token);
//     localStorage.setItem('user', JSON.stringify(user));
//     setUser(user);
//     initSocket();
//     await fetchMe();
//     return user;
//   };

//   // register is intentionally NOT included in AuthContext
//   // Registration is a plain API call in Register.jsx that returns no token.
//   // After registration the user is redirected to /login to sign in manually.

//   const updateUser = (updates) => {
//     const updated = { ...user, ...updates };
//     setUser(updated);
//     localStorage.setItem('user', JSON.stringify(updated));
//   };

//   const addNotification = (notif) => {
//     setNotifications(prev => [notif, ...prev].slice(0, 20));
//   };

//   return (
//     <AuthContext.Provider value={{
//       user, profile, loading, notifications,
//       login, logout, updateUser, fetchMe, addNotification
//     }}>
//       {children}
//     </AuthContext.Provider>
//   );
// };

// export const useAuth = () => {
//   const ctx = useContext(AuthContext);
//   if (!ctx) throw new Error('useAuth must be used within AuthProvider');
//   return ctx;
// };

// export default AuthContext;

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { authAPI } from "../services/api";
import { initSocket, disconnectSocket } from "../services/socket";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // logout defined first with useCallback
  const logout = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    setProfile(null);
    disconnectSocket();
  }, []);

  // fetchMe references logout safely
  const fetchMe = useCallback(async () => {
    try {
      const res = await authAPI.getMe();
      setUser(res.data.user);
      setProfile(res.data.profile);
      localStorage.setItem("user", JSON.stringify(res.data.user));
    } catch {
      logout();
    } finally {
      setLoading(false);
    }
  }, [logout]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const savedUser = localStorage.getItem("user");
    if (token && savedUser) {
      try {
        setUser(JSON.parse(savedUser));
        initSocket();
        fetchMe();
      } catch {
        logout();
      }
    } else {
      setLoading(false);
    }
  }, [fetchMe, logout]);

  const login = async (email, password) => {
    const res = await authAPI.login({ email, password });
    const { token, user } = res.data;
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));
    setUser(user);
    try {
      initSocket();
    } catch (err) {
      console.error("Socket initialization failed:", err);
    }
    await fetchMe().catch((err) => {
      console.error("fetchMe failed:", err);
    });
    return user;
  };

  const updateUser = (updates) => {
    const updated = { ...user, ...updates };
    setUser(updated);
    localStorage.setItem("user", JSON.stringify(updated));
  };

  return (
    <AuthContext.Provider
      value={{ user, profile, loading, login, logout, updateUser, fetchMe }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};

export default AuthContext;
