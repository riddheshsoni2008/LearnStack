"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const handleSetUser = useCallback((userData) => {
    setUser(userData);
    if (userData) {
      localStorage.setItem("user", JSON.stringify(userData));
    } else {
      localStorage.removeItem("user");
    }
  }, []);

  const fetchUser = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/me", {
        credentials: "include",
        cache: "no-store", // Prevent Next.js caching
      });
      
      if (!res.ok) {
        if (res.status === 401) {
          handleSetUser(null);
        }
        return;
      }

      const data = await res.json();

      if (data.success) {
        handleSetUser(data.data);
      } else {
        handleSetUser(null);
      }
    } catch (error) {
      console.error("Failed to fetch user:", error);
      // Do not clear user on network error (e.g. server restarting)
    } finally {
      setLoading(false);
    }
  }, [handleSetUser]);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        localStorage.removeItem("user");
      }
    }
    fetchUser();
  }, []);

  const login = async (email, password) => {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
        credentials: "include", // For setting cookie from backend response
      });
      if (!res.ok) {
        // Fallback if the server crashes and sends non-JSON
        const contentType = res.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
          return { success: false, message: "Server error. Please try again later." };
        }
      }
      const data = await res.json();

      if (data.success) {
        handleSetUser(data.data);
        router.push("/dashboard");
      }
      return data;
    } catch (error) {
      console.error("Login failed:", error);
      return { success: false, message: "Network error. Please try again." };
    }
  };

  const register = async (name, email, password) => {
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
        credentials: "include",
      });
      if (!res.ok) {
        // Fallback if the server crashes and sends non-JSON
        const contentType = res.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
          return { success: false, message: "Server error. Please try again later." };
        }
      }
      const data = await res.json();

      if (data.success) {
        handleSetUser(data.data);
        router.push("/dashboard");
      }
      return data;
    } catch (error) {
      console.error("Registration failed:", error);
      return { success: false, message: "Network error. Please try again." };
    }
  };

  const logout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
      handleSetUser(null);
      router.push("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, setUser: handleSetUser, loading, login, register, logout, fetchUser }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
