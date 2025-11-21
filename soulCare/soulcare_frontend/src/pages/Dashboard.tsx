import React, { useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RightSidebar } from "@/components/layout/RightSidebar";
import {
  Users,
  Calendar,
  FileText,
  Star,
  Clock,
  MessageSquare,
  Activity,
  Loader2,
  AlertTriangle,
  AlertCircle, // For Cancellations
  UserPlus,    // For New Patients
  CheckCircle2, // For Prescriptions
  Share2,       // For Content Shared
  Rocket,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getProviderDashboardStats, getAppointments } from "@/api";
import { ProviderStatsData, Appointment, ActivityItem } from "@/types";
import { format, parseISO, formatDistanceToNow } from "date-fns";
import { useNavigate } from "react-router-dom";

// ... (StatCard component remains the same) ...
const StatCard: React.FC<{
  title: string;
  value: string | number;
  icon: React.ElementType;
  color: string;
}> = ({ title, value, icon: Icon, color }) => {
  return (
    <Card className="healthcare-card shadow-sm">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              {title}
            </p>
            <p className="text-2xl font-bold text-foreground mt-1">
              {value}
            </p>
          </div>
          <div className={`p-3 rounded-full bg-${color}/10`}>
            <Icon className={`w-6 h-6 ${color}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Queries
  const { data: stats, isLoading: isLoadingStats } = useQuery<ProviderStatsData>({
    queryKey: ["providerDashboardStats", user?.id],
    queryFn: getProviderDashboardStats,
  });

  const { data: appointments, isLoading: isLoadingAppointments } = useQuery<Appointment[]>({
    queryKey: ["appointments", "today"],
    queryFn: () => getAppointments({ date: "today" }),
  });

  const scheduledAppointments = useMemo(() => {
    if (!appointments) return [];
    return appointments.filter(app => app.status === 'scheduled');
  }, [appointments]);

  const handleActionClick = (path: string) => navigate(path);

  // --- NEW: Helper to render activity icon and color ---
  const renderActivityIcon = (type: ActivityItem['type']) => {
      switch (type) {
          case 'cancellation':
              return <div className="bg-red-100 p-2 rounded-full"><AlertCircle className="w-4 h-4 text-red-600" /></div>;
          case 'new_patient':
              return <div className="bg-blue-100 p-2 rounded-full"><UserPlus className="w-4 h-4 text-blue-600" /></div>;
          case 'prescription':
              return <div className="bg-green-100 p-2 rounded-full"><FileText className="w-4 h-4 text-green-600" /></div>;
          case 'content_shared':
              return <div className="bg-purple-100 p-2 rounded-full"><Share2 className="w-4 h-4 text-purple-600" /></div>;
          default:
              return <div className="bg-gray-100 p-2 rounded-full"><Activity className="w-4 h-4 text-gray-600" /></div>;
      }
  };

  return (
    <div className="min-h-screen healthcare-gradient pr-[5.5rem]">
      <RightSidebar />

      <div className="p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-1">
            Welcome back, {user?.profile?.full_name?.split(" ")[0]}!
          </h1>
          <p className="text-muted-foreground">
            Here's what's happening with your practice today.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {isLoadingStats || !stats ? (
            Array(4).fill(0).map((_, i) => (
              <Card key={i} className="h-[108px] bg-card animate-pulse" />
            ))
          ) : (
            <>
              <StatCard title="Total Patients" value={stats.total_patients} icon={Users} color="text-primary" />
              <StatCard title="Appointments Today" value={stats.appointments_today} icon={Calendar} color="text-green-600" />
              <StatCard title="Pending Messages" value={stats.pending_messages} icon={MessageSquare} color="text-yellow-600" />
              <StatCard title="Your Rating" value={stats.average_rating.toFixed(1)} icon={Star} color="text-blue-600" />
            </>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Today's Appointments (Unchanged) */}
          <Card className="healthcare-card shadow-sm">
             {/* ... (Keep your existing appointment card logic) ... */}
            <CardHeader>
              <CardTitle className="flex items-center">
                <Clock className="w-5 h-5 mr-2 text-primary" />
                    Scheduled Appointments
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {isLoadingAppointments ? (
                <div className="flex justify-center items-center py-4">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                </div>
              ) : scheduledAppointments && scheduledAppointments.length > 0 ? (
                scheduledAppointments.slice(0, 3).map((appointment) => ( 
                  <div key={appointment.id} className="flex items-center justify-between p-3 rounded-lg bg-background">
                    <div>
                      <p className="font-medium text-foreground">{appointment.patient.profile?.full_name || appointment.patient.username}</p>
                      <p className="text-sm text-muted-foreground">{appointment.notes || "No notes"}</p>
                    </div>
                    <div className="text-right flex-shrink-0 ml-2">
                      <p className="text-sm font-medium text-muted-foreground">{format(parseISO(appointment.date), "PPP")}</p>
                      <p className="font-medium text-primary">{format(parseISO(`1970-01-01T${appointment.time}`), "p")}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground text-sm text-center py-4">You have no scheduled appointments for today.</p>
              )}
              <Button variant="outline" className="w-full" onClick={() => handleActionClick('/appointments')}>View All Appointments</Button>
            </CardContent>
          </Card>

          {/* --- UPDATED: Recent Activity --- */}
          <Card className="healthcare-card shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Activity className="w-5 h-5 mr-2 text-primary" />
                Recent Activity
              </CardTitle>
              <CardDescription>Latest updates from your practice.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-0">
              {stats?.recent_activity && stats.recent_activity.length > 0 ? (
                <div className="divide-y divide-border/50">
                    {stats.recent_activity.map((item) => (
                    <div key={item.id} className="flex items-start space-x-4 p-4 hover:bg-muted/20 transition-colors first:pt-0 last:pb-0">
                        {renderActivityIcon(item.type)}
                        <div className="flex-1 space-y-1">
                            <p className="text-sm text-foreground font-medium leading-snug">{item.text}</p>
                            <p className="text-xs text-muted-foreground">
                                {formatDistanceToNow(new Date(item.date), { addSuffix: true })}
                            </p>
                        </div>
                    </div>
                    ))}
                </div>
              ) : (
                 <p className="text-muted-foreground text-sm text-center py-8">
                  No recent activity to show.
                 </p>
              )}
            </CardContent>
          </Card>
          {/* --- END UPDATED ACTIVITY --- */}

        </div>

        {/* Quick Actions (Unchanged) */}
        <div className="mt-8">
          <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center">
            <Rocket className="w-6 h-6 mr-2 text-primary" />
            Quick Actions
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button variant="outline"  className="h-20 flex-col space-y-2" onClick={() => handleActionClick('/appointments')}>
              <Calendar className="w-6 h-6" /> <span>Appointments</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col space-y-2" onClick={() => handleActionClick('/patients')}>
              <Users className="w-6 h-6" /> <span>My Patients</span>
            </Button>
            {user?.role === "doctor" && (
              <Button variant="outline" className="h-20 flex-col space-y-2" onClick={() => handleActionClick('/prescriptions')}>
                <FileText className="w-6 h-6" /> <span>Prescriptions</span>
              </Button>
            )}
            <Button variant="outline" className="h-20 flex-col space-y-2" onClick={() => handleActionClick('/messages')}>
              <MessageSquare className="w-6 h-6" /> <span>Messages</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;