
import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import { User } from "@/types/index";
import axiosInstance from "@/api";

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
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

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

  const fetchUser = async (token: string): Promise<User | null> => {
    try {
      axiosInstance.defaults.headers.common[
        "Authorization"
      ] = `Bearer ${token}`;
      const response = await axiosInstance.get<User>("user/");
      setUser(response.data);
      return response.data;
    } catch (error) {
      console.error(error);
      logout();
      return null;
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

  

  

  const logout = () => {
    setUser(null);
    localStorage.removeItem("accessToken");
    delete axiosInstance.defaults.headers.common["Authorization"];
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};
