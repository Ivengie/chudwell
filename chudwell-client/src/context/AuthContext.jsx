import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { DEFAULT_AVATAR, PERMISSIONS, ROLE_ACCOUNTS, STORAGE } from "../config.js";
import { load, save } from "../utils.js";

const GUEST = { isLoggedIn: false, role: "guest", username: "@guest", displayName: "Guest", userAvatar: DEFAULT_AVATAR };
const AuthContext = createContext(null);
const normalize = (v = "") => String(v).trim().replace(/^@+/, "").toLowerCase();

function initialUser() {
  const u = { ...GUEST, ...load(STORAGE.state, {}) };
  if (u.role === "author") u.role = "writer";
  if (!["guest", "reader", "writer"].includes(u.role)) u.role = "guest";
  return u;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(initialUser);
  useEffect(() => save(STORAGE.state, user), [user]);

  const role = user.isLoggedIn ? user.role : "guest";

  const login = useCallback(async (identifier, password) => {
  try {
    const res = await fetch("http://localhost:3000/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ identifier, password }),
    });
    const data = await res.json();
    if (!res.ok) return data.error;                 // e.g. "Invalid username or password."
    const account = ROLE_ACCOUNTS.find(
      (knownAccount) =>
        normalize(knownAccount.username) === normalize(data.user.username) ||
        normalize(knownAccount.email) === normalize(data.user.email),
    );
    localStorage.setItem("token", data.token);
    setUser((u) => ({
      ...u,
      isLoggedIn: true,
      role: account?.role ?? "reader",
      username: "@" + data.user.username,
      displayName: account?.displayName ?? data.user.name,
    }));
    return null;
  } catch {
    return "Cannot reach the server. Is the backend running?";
  }
}, []);

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    setUser((u) => ({ ...u, ...GUEST, userAvatar: u.userAvatar }));
  }, []);  
  const setDisplayName = useCallback((displayName) => setUser((u) => ({ ...u, displayName })), []);
  const setAvatar = useCallback((userAvatar) => setUser((u) => ({ ...u, userAvatar })), []);
  const can = useCallback((permission) => Boolean(PERMISSIONS[role]?.[permission]), [role]);

  const value = useMemo(
    () => ({ user, role, isLoggedIn: user.isLoggedIn, can, login, logout, setDisplayName, setAvatar }),
    [user, role, can, login, logout, setDisplayName, setAvatar]
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
