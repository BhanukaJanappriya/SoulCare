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

// ✅ Define proper TypeScript interfaces
interface BaseProfile {
  full_name?: string;
  profile_picture?: string | null;
}

interface UserProfile {
  username?: string;
  role?: string;
  profile?: BaseProfile | null;
}

// ✅ Type-safe helper functions
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

const navItems: NavItem[] = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
  { icon: Users, label: "Patients", path: "/patients" },
  { icon: Calendar, label: "Appointments", path: "/appointments" },
  { icon: Clock, label: "Schedule", path: "/schedule" },
  {
    icon: Stethoscope,
    label: "Prescriptions",
    path: "/prescriptions",
    doctorOnly: true,
  },
  { icon: Video, label: "Video Calls", path: "/video-calls" },
  { icon: FileText, label: "Content", path: "/content" },
  { icon: BookOpen, label: "Blogs", path: "/blogs" },
  { icon: MessageSquare, label: "Messages", path: "/messages" },
  { icon: Settings, label: "Settings", path: "/settings" },
];

export const RightSidebar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { t } = useTranslation();

  const filteredNavItems = navItems.filter(
    (item) => !item.doctorOnly || user?.role === "doctor"
  );

  const isActive = (path: string) => location.pathname === path;

  // ✅ Type-safe profile data extraction
  const profile = user?.profile as BaseProfile | undefined;
  const fullName = getFullName(profile);

  const userInitials = fullName
    ? fullName.split(" ").map((n: string) => n[0]).join("").toUpperCase()
    : user?.username ? user.username[0].toUpperCase() : 'U';

  const profileImageSrc = getProfilePicture(profile);

  // ✅ Profile Click Handler
  const handleProfileClick = () => {
    navigate('/profile');
  };

  return (
    <div className="fixed right-0 top-0 h-full w-16 bg-sidebar-bg flex flex-col items-center py-4 z-50 shadow-lg">

      {/* ✅ User Avatar (Now the Navigation Point) */}
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="mb-6 cursor-pointer" onClick={handleProfileClick}>
            <Avatar className="w-10 h-10">
              <AvatarImage src={profileImageSrc || ''} alt={`${user?.username}'s profile`} />
              <AvatarFallback className="bg-primary text-white font-semibold text-sm">
                {userInitials}
              </AvatarFallback>
            </Avatar>
          </div>
        </TooltipTrigger>
        <TooltipContent side="left" className="mr-2">
          <p>View Profile</p>
        </TooltipContent>
      </Tooltip>

      {/* Navigation Items */}
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

      {/* Logout Button */}
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
