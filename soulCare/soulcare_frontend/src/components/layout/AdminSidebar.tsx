import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import {
  Shield,
  UserCheck,
  Users,
  LogOut,
  LayoutDashboard,
  FileText,
  FolderOpen,
} from 'lucide-react';

// Define the navigation items for the admin panel
const adminNavItems = [
  { icon: Shield, label: "Admin Dashboard", path: "/admin/dashboard" },
  { icon: UserCheck, label: "Manage Doctors", path: "/admin/manage-doctors" },
  { icon: UserCheck, label: "Manage Counselors", path: "/admin/manage-counselors" },
  { icon: Users, label: "Manage Patients", path: "/admin/manage-patients" },
  { icon: FileText, label: "Manage Blogs", path: "/admin/manage-blogs" },
  { icon: FolderOpen, label: "Manage Contents", path: "/admin/manage-content" },

];

export const AdminSidebar: React.FC = () => {
  const location = useLocation();
  const { user, logout } = useAuth();

  const isActive = (path: string) => location.pathname.startsWith(path);

  return (
    <div className="fixed left-0 top-0 h-full w-64 bg-card flex flex-col p-4 border-r z-50 shadow-lg">
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-bold text-primary">Admin Panel</h1>
        <p className="text-sm text-muted-foreground">{user?.email}</p>
      </div>

      <nav className="flex-1 flex flex-col space-y-2">
        {adminNavItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);

          return (
            <NavLink to={item.path} key={item.path}>
              <Button
                variant={active ? "secondary" : "ghost"}
                className="w-full justify-start text-base p-6"
              >
                <Icon className="w-5 h-5 mr-4" />
                {item.label}
              </Button>
            </NavLink>
          );
        })}
      </nav>

      {/* Links to go back to the main app or logout */}
      <div className="mt-auto space-y-2">
         <NavLink to="/dashboard">
             <Button variant="outline" className="w-full justify-start">
                <LayoutDashboard className="w-5 h-5 mr-4" />
                Return to Main Site
             </Button>
         </NavLink>
         <Button variant="ghost" onClick={logout} className="w-full justify-start text-destructive hover:text-destructive">
            <LogOut className="w-5 h-5 mr-4" />
            Logout
         </Button>
      </div>
    </div>
  );
};