import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { AdminUser, adminLogin, logActivity } from "@/lib/adminApi";

interface AdminAuthContextValue {
  admin: AdminUser | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AdminAuthContext = createContext<AdminAuthContextValue | null>(null);

const SESSION_KEY = "kayrosco_admin_session";

export const AdminAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore session from sessionStorage on mount
  useEffect(() => {
    try {
      const stored = sessionStorage.getItem(SESSION_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as AdminUser;
        setAdmin(parsed);
      }
    } catch {
      sessionStorage.removeItem(SESSION_KEY);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = useCallback(async (username: string, password: string) => {
    const user = await adminLogin(username, password);
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(user));
    setAdmin(user);
    await logActivity(user.id, user.username, "Logged in", "login", user.department);
  }, []);

  const logout = useCallback(() => {
    if (admin) {
      logActivity(admin.id, admin.username, "Logged out", "logout", admin.department).catch(() => {});
    }
    sessionStorage.removeItem(SESSION_KEY);
    setAdmin(null);
  }, [admin]);

  return (
    <AdminAuthContext.Provider
      value={{ admin, isLoading, login, logout, isAuthenticated: !!admin }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = (): AdminAuthContextValue => {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) throw new Error("useAdminAuth must be used inside AdminAuthProvider");
  return ctx;
};
