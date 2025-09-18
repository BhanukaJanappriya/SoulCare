import React, { useState } from "react";
import { useQuery } from '@tanstack/react-query';
import {axiosInstance,api} from '@/api';
import { Appointment } from '@/types';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { RightSidebar } from "@/components/layout/RightSidebar";
import {
  Calendar,
  Clock,
  Plus,
  Search,
  Filter,
  Video,
  User,
  MoreHorizontal,
} from "lucide-react";

// --- Data Fetching Function ---
const fetchProviderAppointments = async (): Promise<Appointment[]> => {
    const { data } = await api.get<Appointment[]>('/appointments/');
    return data;
};

const Appointments: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedView, setSelectedView] = useState<"all" | "today" | "upcoming" | "past">("all");

  // --- Fetch Real Data with React Query ---
  const { data: appointments = [], isLoading } = useQuery<Appointment[]>({
      queryKey: ['providerAppointments'],
      queryFn: fetchProviderAppointments,
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "scheduled": return "bg-primary/20 text-primary";
      case "completed": return "bg-green-600/20 text-green-600";
      case "cancelled": return "bg-destructive/20 text-destructive";
      case "pending": return "bg-yellow-500/20 text-yellow-500";
      default: return "bg-muted text-muted-foreground";
    }
  };
  
  // Filtering logic remains the same but now works on real data
  const filteredAppointments = appointments.filter((appointment) => {
    const patientName = appointment.patient.profile?.full_name || '';
    const matchesSearch = patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (appointment.notes && appointment.notes.toLowerCase().includes(searchTerm.toLowerCase()));

    // Note: You might want to replace hardcoded dates with a library like date-fns for real-world use
    if (selectedView === "today") {
      const today = new Date().toISOString().split('T')[0];
      return matchesSearch && appointment.date === today;
    } else if (selectedView === "upcoming") {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return matchesSearch && new Date(appointment.date) >= today;
    } else if (selectedView === "past") {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return matchesSearch && new Date(appointment.date) < today;
    }
    return matchesSearch;
  });

  return (
    <div className="min-h-screen healthcare-gradient pr-16">
      <RightSidebar />

      <div className="p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Appointments</h1>
            <p className="text-muted-foreground">Manage your appointment schedule</p>
          </div>
          <Button className="healthcare-button-primary">
            <Plus className="w-4 h-4 mr-2" />
            Schedule Appointment
          </Button>
        </div>

        {/* Filters and Search */}
        <Card className="healthcare-card mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex rounded-lg bg-muted p-1">
                 {(["all", "today", "upcoming", "past"] as const).map((view) => (
                  <button key={view} onClick={() => setSelectedView(view)}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      selectedView === view ? "bg-white text-primary shadow-sm" : "text-muted-foreground hover:text-foreground"
                    }`}>
                    {view.charAt(0).toUpperCase() + view.slice(1)}
                  </button>
                ))}
              </div>
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search by patient name or notes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button variant="outline"><Filter className="w-4 h-4 mr-2" /> More Filters</Button>
            </div>
          </CardContent>
        </Card>

        {/* Appointments List */}
        <div className="space-y-4">
          {isLoading ? (
            <p>Loading appointments...</p>
          ) : filteredAppointments.length > 0 ? (
            filteredAppointments.map((appointment) => (
              <Card key={appointment.id} className="healthcare-card">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                        <User className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <div className="flex items-center space-x-4 mb-2">
                           {/* CORRECTED: Display real patient name */}
                          <h3 className="text-lg font-semibold text-foreground">
                            {appointment.patient.profile?.full_name || appointment.patient.username}
                          </h3>
                          <Badge className={getStatusColor(appointment.status)}>
                            {appointment.status}
                          </Badge>
                        </div>
                        <div className="flex items-center space-x-6 text-sm text-muted-foreground">
                          <div className="flex items-center"><Calendar className="w-4 h-4 mr-1" />{appointment.date}</div>
                          <div className="flex items-center"><Clock className="w-4 h-4 mr-1" />{appointment.time}</div>
                        </div>
                        {appointment.notes && <p className="text-sm text-muted-foreground mt-2">{appointment.notes}</p>}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {/* TODO: Add real functionality to these buttons */}
                      <Button size="sm" variant="outline">Complete</Button>
                      <Button size="sm" variant="destructive">Cancel</Button>
                      <Button variant="ghost" size="sm"><MoreHorizontal className="w-4 h-4" /></Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
             <Card className="healthcare-card"><CardContent className="text-center py-12"><p>No appointments found.</p></CardContent></Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default Appointments;