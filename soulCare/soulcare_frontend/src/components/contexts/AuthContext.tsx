import React, { createContext, useContext, useState, useEffect } from "react";
import { User, UserRole } from "@/types";

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string, role: UserRole) => Promise<boolean>;
  signup: (userData: Partial<User> & { password: string }) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

// Mock users for demo
const mockUsers: (User & { password: string })[] = [
  {
    id: "1",
    email: "doctor@example.com",
    password: "password123",
    name: "Dr. Sarah Smith",
    role: "doctor",
    specialization: "Psychiatry",
    experience: 8,
    rating: 4.8,
    bio: "Experienced psychiatrist specializing in anxiety and depression treatment.",
    createdAt: new Date("2023-01-15"),
  },
  {
    id: "2",
    email: "counselor@example.com",
    password: "password123",
    name: "Mark Jones",
    role: "counselor",
    specialization: "Cognitive Behavioral Therapy",
    experience: 5,
    rating: 4.6,
    bio: "Licensed counselor focusing on CBT and trauma therapy.",
    createdAt: new Date("2023-03-20"),
  },
  {
    id: "3",
    email: "patient@example.com",
    password: "password123",
    name: "Emily Davis",
    role: "patient",
    phone: "+1 (555) 456-7890",
    bio: "Seeking support for mental wellness journey.",
    createdAt: new Date("2023-03-10"),
  },
];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for saved user session
    const savedUser = localStorage.getItem("healthcareUser");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (
    email: string,
    password: string,
    role: UserRole
  ): Promise<boolean> => {
    setIsLoading(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const foundUser = mockUsers.find(
      (u) => u.email === email && u.password === password && u.role === role
    );

    if (foundUser) {
      const { password: _, ...userWithoutPassword } = foundUser;
      setUser(userWithoutPassword);
      localStorage.setItem(
        "healthcareUser",
        JSON.stringify(userWithoutPassword)
      );
      setIsLoading(false);
      return true;
    }

    setIsLoading(false);
    return false;
  };

  const signup = async (
    userData: Partial<User> & { password: string }
  ): Promise<boolean> => {
    setIsLoading(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const newUser: User = {
      id: Date.now().toString(),
      email: userData.email!,
      name: userData.name!,
      role: userData.role!,
      specialization: userData.specialization,
      experience: userData.experience || 0,
      rating: 5.0,
      createdAt: new Date(),
    };

    setUser(newUser);
    localStorage.setItem("healthcareUser", JSON.stringify(newUser));
    setIsLoading(false);
    return true;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("healthcareUser");
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};
