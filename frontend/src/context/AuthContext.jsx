import React from 'react';
import { createContext, useContext, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext(null);

function readSavedUser() {
  try { return JSON.parse(localStorage.getItem("lifedrop_user") || "null"); }
  catch { return null; }
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem("lifedrop_token"));
  const [user, setUser] = useState(readSavedUser());

  const login = (responseData, fallbackRole) => {
    const data = responseData?.data ?? responseData ?? {};
    const newToken = data.token || data.accessToken || data.jwt;
    const rawUser = data.user || data.donor || data.staff || data;
    const role = rawUser.role || data.role || fallbackRole;
    const safeUser = {
      id: rawUser.donor_id || rawUser.staff_id || rawUser.id || rawUser.user_id,
      full_name: rawUser.full_name || rawUser.name || "User",
      email: rawUser.email || "",
      role,
    };
    if (newToken) localStorage.setItem("lifedrop_token", newToken);
    localStorage.setItem("lifedrop_user", JSON.stringify(safeUser));
    setToken(newToken || null);
    setUser(safeUser);
    return safeUser;
  };

  const logout = () => {
    localStorage.removeItem("lifedrop_token");
    localStorage.removeItem("lifedrop_user");
    setToken(null);
    setUser(null);
  };

  const value = useMemo(() => ({ token, user, login, logout, isAuthenticated: Boolean(token && user) }), [token, user]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useAuth must be used inside AuthProvider");
  return value;
}
