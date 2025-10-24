/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import axios from "axios";
import { User } from "@/types/index";
import { axiosInstance, api } from "@/api";

interface LoginResponse {
  access: string;
  refresh: string;
  role: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  login: (
    username: string,
    password: string
  ) => Promise<{ success: boolean; error?: string; user?: User }>;
  logout: () => void;
  isLoading: boolean;
  fetchUser: (token: string) => Promise<User | null>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ✅ Keep useAuth in the same file (with ESLint disabled)
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUser = useCallback(async (token: string): Promise<User | null> => {
    try {
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      const response = await api.get<User>("auth/user/");
      setUser(response.data);
      return response.data;
    } catch (error) {
      console.error("Error fetching user details:", error);
      localStorage.removeItem("accessToken");
      delete api.defaults.headers.common["Authorization"];
      delete axiosInstance.defaults.headers.common["Authorization"];
      setUser(null);
      return null;
    }
  }, []);

  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem("accessToken");
      if (token) {
        api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        await fetchUser(token);
      }
      setIsLoading(false);
    };
    initializeAuth();
  }, [fetchUser]);

  const login = async (username: string, password: string) => {
    delete api.defaults.headers.common["Authorization"];
    delete axiosInstance.defaults.headers.common["Authorization"];
    setIsLoading(true);

    try {
      const response = await axiosInstance.post<LoginResponse>("login/", {
        username,
        password,
      });
      const { access } = response.data;
      localStorage.setItem("accessToken", access);
      api.defaults.headers.common["Authorization"] = `Bearer ${access}`;

      const loggedInUser = await fetchUser(access);
      setIsLoading(false);

      if (loggedInUser) {
        return { success: true, user: loggedInUser };
      } else {
        return {
          success: false,
          error: "Failed to fetch user profile after login.",
        };
      }
    } catch (error: unknown) {
      const errorData = (error as { response?: { data?: unknown } })?.response?.data;
      let errorMessage = "An unknown error occurred. Please try again.";

      if (errorData && typeof errorData === "object") {
        const data = errorData as Record<string, unknown>;

        if (data.non_field_errors && Array.isArray(data.non_field_errors)) {
          errorMessage = (data.non_field_errors as string[]).join(" ");
        } else if (data.detail && typeof data.detail === "string") {
          errorMessage = data.detail;
        } else {
          const messages = Object.values(data)
            .flat()
            .filter((v): v is string => typeof v === "string");
          errorMessage = messages.join(" ");
        }
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }

      setIsLoading(false);
      return { success: false, error: errorMessage };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("accessToken");
    delete api.defaults.headers.common["Authorization"];
    delete axiosInstance.defaults.headers.common["Authorization"];
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading, fetchUser }}>
      {children}
    </AuthContext.Provider>
  );
};
