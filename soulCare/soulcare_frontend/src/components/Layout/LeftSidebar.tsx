import React from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Calendar,
  FileText,
  User,
  Video,
  BookOpen,
  MessageSquare,
  Settings,
  Stethoscope,
  LogOut,
  Heart,
  UserCheck,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const LeftSidebar: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const getNavigation = () => {
    const baseNavigation = [
      { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
      { name: "Appointments", href: "/appointments", icon: Calendar },
      { name: "Messages", href: "/messages", icon: MessageSquare },
      { name: "Profile", href: "/profile", icon: User },
      { name: "Settings", href: "/settings", icon: Settings },
    ];

    if (user?.role === "doctor" || user?.role === "counselor") {
      return [
        ...baseNavigation.slice(0, 1), // Dashboard
        { name: "Patients", href: "/patients", icon: Users },
        ...baseNavigation.slice(1, 2), // Appointments
        { name: "Schedule", href: "/schedule", icon: Calendar },
        { name: "Video Calls", href: "/video-calls", icon: Video },
        ...baseNavigation.slice(2, 3), // Messages
        { name: "Content", href: "/content", icon: BookOpen },
        ...(user?.role === "doctor"
          ? [
              {
                name: "Prescriptions",
                href: "/prescriptions",
                icon: Stethoscope,
              },
            ]
          : []),
        { name: "Blogs", href: "/blogs", icon: FileText },
        ...baseNavigation.slice(3), // Profile, Settings
      ];
    } else if (user?.role === "patient") {
      return [
        ...baseNavigation.slice(0, 2), // Dashboard, Appointments
        { name: "My Health", href: "/health-records", icon: Heart },
        { name: "My Providers", href: "/my-providers", icon: UserCheck },
        { name: "Resources", href: "/resources", icon: BookOpen },
        ...baseNavigation.slice(2), // Messages, Profile, Settings
      ];
    }
    return baseNavigation;
  };

  const navigation = getNavigation();

  return (
    <TooltipProvider>
      <div className="fixed left-0 top-0 h-full w-16 bg-sidebar border-r border-border flex flex-col items-center py-4 z-50">
        <div className="flex flex-col space-y-4">
          {navigation.map((item) => (
            <Tooltip key={item.name}>
              <TooltipTrigger asChild>
                <NavLink
                  to={item.href}
                  className={({ isActive }) =>
                    `p-3 rounded-lg transition-all duration-200 hover:bg-sidebar-hover ${
                      isActive
                        ? "bg-primary text-primary-foreground shadow-lg"
                        : "text-sidebar-foreground hover:text-sidebar-accent-foreground"
                    }`
                  }
                >
                  <item.icon className="h-5 w-5" />
                </NavLink>
              </TooltipTrigger>
              <TooltipContent side="right" className="ml-2">
                <p>{item.name}</p>
              </TooltipContent>
            </Tooltip>
          ))}
        </div>

        <div className="flex-1" />

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              onClick={logout}
              variant="ghost"
              size="icon"
              className="text-sidebar-foreground hover:text-red-400 hover:bg-red-400/10"
            >
              <LogOut className="h-5 w-5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right" className="ml-2">
            <p>Logout</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
};

export default LeftSidebar;
