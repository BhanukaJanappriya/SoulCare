import React from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Heart,
  Target,
  Calendar,
  FileText,
  Gamepad2,
  BookOpen,
  MessageCircle,
  Bell,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const PatientSidebar: React.FC = () => {
  const location = useLocation();

  const navigationItems = [
    { name: "Dashboard", href: "/patient/dashboard", icon: LayoutDashboard },
    { name: "Mood Tracker", href: "/patient/mood", icon: Heart },
    { name: "Habits", href: "/patient/habits", icon: Target },
    { name: "Appointments", href: "/patient/appointments", icon: Calendar },
    { name: "Blogs", href: "/patient/blogs", icon: FileText },
    { name: "Games", href: "/patient/games", icon: Gamepad2 },
    { name: "Journal", href: "/patient/journal", icon: BookOpen },
    { name: "Chatbot", href: "/patient/chatbot", icon: MessageCircle },
  ];

  return (
    <TooltipProvider>
      <div className="fixed right-0 top-0 h-full w-16 bg-sidebar-bg flex flex-col items-center py-4 z-50 shadow-lg">
        {/* Logo/Brand */}
        <div className="mb-6">
          <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white font-semibold text-sm">
            {"E"}
          </div>
        </div>

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
            <button className="w-12 h-12 p-0 rounded-lg text-white/70 hover:bg-white/10 hover:text-white transition-all duration-200 flex items-center justify-center relative">
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
      </div>
    </TooltipProvider>
  );
};

export default PatientSidebar;