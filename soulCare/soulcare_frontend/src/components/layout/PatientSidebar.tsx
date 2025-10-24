import React from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Heart,
  Target,
  Calendar,
  Pill,
  FileText,
  Gamepad2,
  BookOpen,
  MessageCircle,
  Bell,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

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

const PatientSidebar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const navigationItems = [
    { name: "Dashboard", href: "/patient/dashboard", icon: LayoutDashboard },
    { name: "Mood Tracker", href: "/patient/mood", icon: Heart },
    { name: "Habits", href: "/patient/habits", icon: Target },
    { name: "Appointments", href: "/patient/appointments", icon: Calendar },
    { name: "Prescriptions", href: "/patient/prescriptions", icon: Pill},
    { name: "Blogs", href: "/patient/blogs", icon: FileText },
    { name: "Games", href: "/patient/games", icon: Gamepad2 },
    { name: "Journal", href: "/patient/journal", icon: BookOpen },
    { name: "Chatbot", href: "/patient/chatbot", icon: MessageCircle },
  ];

  // ✅ Type-safe profile data extraction
  const profile = user?.profile as BaseProfile | undefined;
  const fullName = getFullName(profile);

  const userInitials = fullName
    ? fullName.split(" ").map((n: string) => n[0]).join("").toUpperCase()
    : user?.username ? user.username[0].toUpperCase() : 'U';

  const profileImageSrc = getProfilePicture(profile);

  // ✅ Profile Click Handler
  const handleProfileClick = () => {
    navigate('/patient/profile');
  };

  // ✅ Logout Handler
  const handleLogout = () => {
    logout();
    navigate('/auth/login');
  };

  return (
    <TooltipProvider>
      <div className="fixed right-0 top-0 h-full w-16 bg-sidebar-bg flex flex-col items-center py-4 z-50 shadow-lg">

        {/* ✅ User Avatar (Navigation to Profile) */}
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
          {navigationItems.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Tooltip key={item.name}>
                <TooltipTrigger asChild>
                  <NavLink
                    to={item.href}
                    className={cn(
                      "w-12 h-12 p-0 rounded-lg transition-all duration-200 flex items-center justify-center",
                      isActive
                        ? "bg-white/20 text-white"
                        : "text-white/70 hover:bg-white/10 hover:text-white"
                    )}
                  >
                    <item.icon className="w-5 h-5" />
                  </NavLink>
                </TooltipTrigger>
                <TooltipContent side="left" className="mr-2">
                  {item.name}
                </TooltipContent>
              </Tooltip>
            );
          })}
        </nav>

        {/* Notifications */}
        <Tooltip>
          <TooltipTrigger asChild>
            <button className="w-12 h-12 p-0 rounded-lg text-white/70 hover:bg-white/10 hover:text-white transition-all duration-200 flex items-center justify-center relative mb-2">
              <Bell className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-destructive rounded-full flex items-center justify-center">
                <span className="w-1.5 h-1.5 bg-white rounded-full"></span>
              </span>
            </button>
          </TooltipTrigger>
          <TooltipContent side="left" className="mr-2">
            Notifications
          </TooltipContent>
        </Tooltip>

        {/* ✅ Logout Button */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
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
    </TooltipProvider>
  );
};

export default PatientSidebar;
