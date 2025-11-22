import React from "react";
import { useAuth } from "../../contexts/AuthContext";
// Assuming your UserRole enum/type is accessible via a path like this,
// if not, you might need to adjust the import path for your project structure.
import { UserRole } from "@/types";
import { Brain, User, Shield, BriefcaseMedical } from "lucide-react";

// Helper function to get the appropriate greeting based on time of day
const getTimeOfDayGreeting = (): string => {
  const hour = new Date().getHours();
  if (hour < 5) return "Good Night"; // 00:00 - 04:59
  if (hour < 12) return "Good Morning"; // 05:00 - 11:59
  if (hour < 17) return "Good Afternoon"; // 12:00 - 16:59
  return "Good Evening"; // 17:00 - 23:59
};

// Helper function to get the role title and icon
const getRoleDetails = (role: UserRole | undefined) => {
  switch (role) {
    case "admin":
      return {
        title: "Administrator Panel",
        icon: Shield,
        color: "bg-red-100 text-red-800",
      };
    case "counselor":
      return {
        title: "Counselor Portal",
        icon: Brain,
        color: "bg-blue-100 text-blue-800",
      };
    case "doctor":
      return {
        title: "Doctor Portal",
        icon: BriefcaseMedical,
        color: "bg-purple-100 text-purple-800",
      };
    case "user":
    default:
      return {
        title: "Patient Dashboard",
        icon: User,
        color: "bg-green-100 text-green-800",
      };
  }
};

const GreetingHeader: React.FC = () => {
  const { user, isLoading } = useAuth();

  if (isLoading || !user) {
    // Basic loading state to prevent flash of content
    return (
      <div className="p-6 border-b sticky top-0 z-10 shadow-sm h-20 animate-pulse bg-gray-50"></div>
    );
  }

  const greeting = getTimeOfDayGreeting();
  const roleDetails = getRoleDetails(user.role);

  // Try to get full_name from profile, otherwise fallback to username
  const profile = user.profile;
  const profileFullName =
    profile && "full_name" in profile ? profile.full_name : null;
  const displayName = profileFullName || user.username;

  const RoleIcon = roleDetails.icon;

  return (
    <div className="p-6 bg-white border-b sticky top-0 z-10 shadow-sm">
      <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
        <span className="text-primary-600">{greeting},</span>
        <span className="text-primary">{displayName}</span>
      </h1>
      <p className="text-sm text-muted-foreground mt-1 flex items-center gap-3">
        <span className="flex items-center gap-1">
          <RoleIcon className="w-4 h-4 text-muted-foreground" />
          {roleDetails.title}
        </span>
        <span
          className={`px-2 py-0.5 text-xs font-semibold rounded-full uppercase ${roleDetails.color}`}
        >
          {user.role}
        </span>
      </p>
    </div>
  );
};

export default GreetingHeader;
