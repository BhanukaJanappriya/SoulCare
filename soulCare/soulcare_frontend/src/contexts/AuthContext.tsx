// contexts/AuthContext.tsx

import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import { User } from "@/types/index";


interface LoginResponse {
  access: string;
  refresh: string;
  role: string;
  email: string;
}

const axiosInstance = axios.create({
  baseURL: "http://localhost:8000/api/auth/",
});

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUser = async (token: string) => {
    try {
      axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      const response = await axiosInstance.get<User>("user/");
      setUser(response.data);
    } catch (error) {
      console.error("Token is invalid or expired. Logging out.", error);
      logout();
    }
  };

  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem("accessToken");
      if (token) {
        await fetchUser(token);
      }
      setIsLoading(false);
    };
    initializeAuth();
  }, []);

  const login = async (username: string, password: string) => {
    delete axiosInstance.defaults.headers.common['Authorization'];
    setIsLoading(true);
    try {
      const response = await axiosInstance.post<LoginResponse>("login/", { username, password });
      const { access } = response.data;
      localStorage.setItem("accessToken", access);
      await fetchUser(access);
      setIsLoading(false);
      return { success: true };

    } catch (error: any) {
      // --- THIS IS THE NEW, CORRECTED CATCH BLOCK ---
      console.error("Login API call failed:", error.response?.data); // Log the full error for debugging

      const errorData = error.response?.data;
      let errorMessage = "An unknown error occurred. Please try again."; // A better default

      if (errorData) {
        // First, check for the specific 'not verified' or 'invalid password' errors
        if (errorData.non_field_errors) {
          errorMessage = errorData.non_field_errors.join(" "); // e.g., "Account not verified..."
        } 
        // Then, check for other generic DRF errors
        else if (errorData.detail) {
          errorMessage = errorData.detail;
        } 
        // As a fallback, handle validation errors on specific fields (e.g., username, password)
        else if (typeof errorData === 'object') {
          errorMessage = Object.values(errorData).flat().join(" ");
        }
      }

      setIsLoading(false);
      return { success: false, error: errorMessage };
      // --- END OF THE CORRECTED CATCH BLOCK ---
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("accessToken");
    delete axiosInstance.defaults.headers.common['Authorization'];
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};