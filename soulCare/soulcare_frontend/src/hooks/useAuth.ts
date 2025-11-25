import { useContext } from "react";
import { AuthContext } from "@/contexts/AuthContext"; // ✅ Now this import will work

interface User {
  id: string;
  name: string;
  email: string;
  token?: string; // ⭐ add this
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
