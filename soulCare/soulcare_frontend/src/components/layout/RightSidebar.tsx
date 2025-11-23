import React from "react";
import { useLocation, Link, useNavigate } from "react-router-dom";
import { useTranslation } from 'react-i18next';
import {
  LayoutDashboard,
  Users,
  Calendar,
  Clock,
  FileText,
  MessageSquare,
  User,
  Settings,
  LogOut,
  Stethoscope,
  Video,
  BookOpen,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Your interfaces and helpers are correct
interface BaseProfile {
  full_name?: string;
  profile_picture?: string | null;
}

const getProfilePicture = (profile: BaseProfile | null | undefined): string | null => {
  return profile?.profile_picture || null;
};

const getFullName = (profile: BaseProfile | null | undefined): string | null => {
  return profile?.full_name || null;
};

interface NavItem {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  path: string;
  doctorOnly?: boolean;
}

// Your navItems array is correct
const navItems: NavItem[] = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
  { icon: Users, label: "Patients", path: "/patients" },
  { icon: Calendar, label: "Appointments", path: "/appointments" },
  { icon: Clock, label: "Schedule", path: "/schedule" },
  { icon: Stethoscope, label: "Prescriptions", path: "/prescriptions", doctorOnly: true },
  { icon: Video, label: "Video Calls", path: "/video-calls" },
  { icon: FileText, label: "Content", path: "/content" },
  { icon: BookOpen, label: "Blogs", path: "/blogs" },
  { icon: MessageSquare, label: "Messages", path: "/messages" },
  { icon: Settings, label: "Settings", path: "/settings" },
];

export const RightSidebar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth(); // Assuming useAuth provides the full user object including 'is_verified'

  const filteredNavItems = navItems.filter(
    (item) => !item.doctorOnly || user?.role === "doctor"
  );

  const isActive = (path: string) => location.pathname === path;

  const profile = user?.profile as BaseProfile | undefined;
  const fullName = getFullName(profile);
  const userInitials = fullName
    ? fullName.split(" ").map((n: string) => n[0]).join("").toUpperCase()
    : user?.username ? user.username[0].toUpperCase() : 'U';
  const profileImageSrc = getProfilePicture(profile);

  const handleProfileClick = () => {
    navigate('/profile');
  };

  // --- START: NEW CODE FOR VERIFIED STYLING ---
  // A helper variable to determine if the user is a verified professional
  const isVerifiedProfessional = (user?.role === 'doctor' || user?.role === 'counselor') && user?.is_verified;
  // --- END: NEW CODE ---

  return (
    <div className="fixed right-0 top-0 h-full w-16 bg-sidebar-bg flex flex-col items-center py-4 z-50 shadow-lg">
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="mb-6 cursor-pointer" onClick={handleProfileClick}>
            
            {/* --- START: APPLYING CONDITIONAL STYLING TO AVATAR --- */}
            {/* We will add a green ring if the professional is verified */}
            <Avatar className={`w-10 h-10 ${
              isVerifiedProfessional
                ? 'ring-2 ring-green-500 ring-offset-2 ring-offset-sidebar-bg'
                : ''
            }`}>
            {/* --- END: APPLYING CONDITIONAL STYLING --- */}

              <AvatarImage src={profileImageSrc || ''} alt={`${user?.username}'s profile`} />
              <AvatarFallback className="bg-primary text-white font-semibold text-sm">
                {userInitials}
              </AvatarFallback>
            </Avatar>
          </div>
        </TooltipTrigger>
        <TooltipContent side="left" className="mr-2">
          {/* --- START: DYNAMIC TOOLTIP CONTENT --- */}
          <p>{isVerifiedProfessional ? `${fullName} (Verified)` : 'View Profile'}</p>
          {/* --- END: DYNAMIC TOOLTIP CONTENT --- */}
        </TooltipContent>
      </Tooltip>

      {/* Navigation Items (unchanged) */}
      <nav className="flex-1 flex flex-col space-y-2">
        {filteredNavItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          return (
            <Tooltip key={item.path}>
              <TooltipTrigger asChild>
                <Link to={item.path}>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`w-12 h-12 p-0 rounded-lg transition-all duration-200 ${
                      active
                        ? "bg-white/20 text-white"
                        : "text-white/70 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                  </Button>
                </Link>
              </TooltipTrigger>
              <TooltipContent side="left" className="mr-2">
                <p>{item.label}</p>
              </TooltipContent>
            </Tooltip>
          );
        })}
      </nav>

      {/* Logout Button (unchanged) */}
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            onClick={logout}
            className="w-12 h-12 p-0 rounded-lg text-white/70 hover:bg-red-500/20 hover:text-red-200 transition-all duration-200"
          >
            <LogOut className="w-5 h-5" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="left" className="mr-2">
          <p>Logout</p>
        </TooltipContent>
      </Tooltip>
    </div>
  );
};


















