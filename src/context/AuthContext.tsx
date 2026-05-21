import React, { createContext, useContext, useState, ReactNode } from "react";
import type { User, UserRole } from "../types";

interface AuthContextValue {
  user: User | null;
  login: (role: UserRole) => void;
  logout: () => void;
  isAdmin: boolean;
}

const MOCK_USERS: Record<UserRole, User> = {
  admin: {
    id: "admin-1",
    name: "Alex Orbital",
    email: "alex@orbitdash.io",
    role: "admin",
    avatar: "AO",
  },
  user: {
    id: "user-1",
    name: "Sam Rivera",
    email: "sam@orbitdash.io",
    role: "user",
    avatar: "SR",
  },
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem("orbitdash-user");
    return stored ? JSON.parse(stored) : MOCK_USERS.admin;
  });

  const login = (role: UserRole) => {
    const u = MOCK_USERS[role];
    setUser(u);
    localStorage.setItem("orbitdash-user", JSON.stringify(u));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("orbitdash-user");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAdmin: user?.role === "admin" }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
