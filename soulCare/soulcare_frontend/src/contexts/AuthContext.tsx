/* eslint-disable react-refresh/only-export-components */
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import axios from "axios";
import { User } from "@/types/index";
import { axiosInstance, api } from "@/api";


interface LoginResponse {
  access: string;
  refresh: string;
  role: string;
  email: string;
  requires_2fa?: boolean;
}

interface AuthContextType {
  user: User | null;
  login: (
    username: string,
    password: string,
    otp?: string
  ) => Promise<{ success: boolean; error?: string; user?: User }>;
  logout: () => void;
  isLoading: boolean;
  fetchUser: (token: string) => Promise<User | null>;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

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

  // Helper to set tokens in headers for immediate use
  const setAuthHeaders = (token: string) => {
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    axiosInstance.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  };

  const fetchUser = useCallback(async (token: string): Promise<User | null> => {
    try {
      setAuthHeaders(token);
      // NOTE: Adjust 'auth/user/' if your backend uses 'auth/users/me/'
      const response = await api.get<User>("auth/user/");
      setUser(response.data);
      return response.data;
    } catch (error) {
      console.error("Error fetching user details:", error);
      // If fetching user fails, the token might be stale, so log out locally
      setUser(null);
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      delete api.defaults.headers.common["Authorization"];
      delete axiosInstance.defaults.headers.common["Authorization"];
      return null;
    }
  }, []);

  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem("accessToken");
      if (token) {
        setAuthHeaders(token);
        await fetchUser(token);
      }
      setIsLoading(false);
    };
    initializeAuth();
  }, [fetchUser]);

  const login = async (username: string, password: string, otp?: string) => {
    setIsLoading(true);

    try {
      // 1. Send Login Request
      const response = await axiosInstance.post<LoginResponse>("login/", {
        username,
        password,
        otp,
      });

      const { access, refresh } = response.data;

      // 2. CRITICAL: Save Access Token for api.ts to read
      localStorage.setItem("accessToken", access);
      localStorage.setItem("refreshToken", refresh);

      // 3. Set headers and fetch profile
      setAuthHeaders(access);
      const loggedInUser = await fetchUser(access);

      setIsLoading(false);

      if (loggedInUser) {
        return { success: true, user: loggedInUser };
      } else {
        return {
          success: false,
          error: "Login successful, but failed to load user profile.",
        };
      }
    } catch (error: unknown) {
      setIsLoading(false);
      let errorMessage = "Login failed. Please check your credentials.";

      // Safe type narrowing instead of 'any'
      if (axios.isAxiosError(error) && error.response?.data) {
        // Assert the shape of the error data
        const errorData = error.response.data as {
          detail?: string;
          non_field_errors?: string[];
        };

        if (errorData.detail) {
          errorMessage = errorData.detail;
        } else if (errorData.non_field_errors) {
          errorMessage = errorData.non_field_errors.join(" ");
        }
      }

      return { success: false, error: errorMessage };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");

    // Clear headers
    delete api.defaults.headers.common["Authorization"];
    delete axiosInstance.defaults.headers.common["Authorization"];

    // Optional: Redirect to login if needed
    if (!window.location.pathname.includes("/auth/login")) {
      window.location.href = "/auth/login";
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading, fetchUser }}>
      {children}
    </AuthContext.Provider>
  );
};
