import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Users,
  Calendar,
  FileText,
  Star,
  TrendingUp,
  Clock,
  MessageSquare,
  Activity,
} from "lucide-react";
import { RightSidebar } from "@/components/layout/RightSidebar";

const Dashboard: React.FC = () => {
  const { user } = useAuth();

  const stats = [
    {
      title: "Total Patients",
      value: "24",
      change: "+12%",
      icon: Users,
      color: "text-primary",
    },
    {
      title: "Appointments Today",
      value: "6",
      change: "+2",
      icon: Calendar,
      color: "text-success",
    },
    {
      title: "Pending Messages",
      value: "3",
      change: "-1",
      icon: MessageSquare,
      color: "text-warning",
    },
    {
      title: "Average Rating",
      value: user?.rating?.toFixed(1) || "5.0",
      change: "+0.2",
      icon: Star,
      color: "text-primary",
    },
  ];

  const recentAppointments = [
    {
      id: "1",
      patient: "Sarah Johnson",
      time: "10:00 AM",
      type: "Follow-up",
      status: "upcoming",
    },
    {
      id: "2",
      patient: "Mike Chen",
      time: "11:30 AM",
      type: "Consultation",
      status: "upcoming",
    },
    {
      id: "3",
      patient: "Emma Wilson",
      time: "2:00 PM",
      type: "Therapy Session",
      status: "upcoming",
    },
  ];

  const recentActivity = [
    "New patient registration: Alex Morgan",
    "Appointment confirmed for tomorrow at 9:00 AM",
    'Blog post "Managing Anxiety" published',
    "Prescription updated for patient ID #1234",
  ];

  return (
    <div className="min-h-screen healthcare-gradient pr-16">
      <RightSidebar />

      <div className="p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Welcome back, {user?.name?.split(" ")[0]}!
          </h1>
          <p className="text-muted-foreground">
            Here's what's happening with your practice today.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index} className="healthcare-card">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        {stat.title}
                      </p>
                      <div className="flex items-center mt-1">
                        <p className="text-2xl font-bold text-foreground">
                          {stat.value}
                        </p>
                        <span className={`ml-2 text-sm ${stat.color}`}>
                          {stat.change}
                        </span>
                      </div>
                    </div>
                    <Icon className={`w-8 h-8 ${stat.color}`} />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Today's Appointments */}
          <Card className="healthcare-card">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="w-5 h-5 mr-2" />
                Today's Appointments
              </CardTitle>
              <CardDescription>
                Your scheduled appointments for today
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {recentAppointments.map((appointment) => (
                <div
                  key={appointment.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-background/50"
                >
                  <div>
                    <p className="font-medium text-foreground">
                      {appointment.patient}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {appointment.type}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-primary">
                      {appointment.time}
                    </p>
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-success/20 text-success">
                      Upcoming
                    </span>
                  </div>
                </div>
              ))}
              <Button variant="outline" className="w-full">
                View All Appointments
              </Button>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card className="healthcare-card">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Activity className="w-5 h-5 mr-2" />
                Recent Activity
              </CardTitle>
              <CardDescription>
                Latest updates and notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div
                  key={index}
                  className="flex items-start space-x-3 p-3 rounded-lg bg-background/50"
                >
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                  <p className="text-sm text-foreground">{activity}</p>
                </div>
              ))}
              <Button variant="outline" className="w-full">
                View All Activity
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="mt-8">
          <h2 className="text-xl font-semibold text-foreground mb-4">
            Quick Actions
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button className="healthcare-button-primary h-20 flex-col space-y-2">
              <Calendar className="w-6 h-6" />
              <span>New Appointment</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col space-y-2">
              <Users className="w-6 h-6" />
              <span>Add Patient</span>
            </Button>
            {user?.role === "doctor" && (
              <Button variant="outline" className="h-20 flex-col space-y-2">
                <FileText className="w-6 h-6" />
                <span>Write Prescription</span>
              </Button>
            )}
            <Button variant="outline" className="h-20 flex-col space-y-2">
              <MessageSquare className="w-6 h-6" />
              <span>Send Message</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
