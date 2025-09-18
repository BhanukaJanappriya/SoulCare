import React, { useState } from "react";
import { useQuery } from '@tanstack/react-query';
import {axiosInstance,api} from '@/api';
import { Appointment } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Calendar, Clock, MapPin, Search, Plus, Video, Star, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";

// --- Data Fetching Function ---
const fetchPatientAppointments = async (): Promise<Appointment[]> => {
    const { data } = await api.get<Appointment[]>('/appointments/');
    return data;
};

const PatientAppointments: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "pending" | "scheduled" | "completed" | "cancelled">("all");
  
  // --- Fetch Real Data with React Query ---
  const { data: appointments = [], isLoading } = useQuery<Appointment[]>({
      queryKey: ['patientAppointments'],
      queryFn: fetchPatientAppointments,
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-yellow-100 text-yellow-800";
      case "scheduled": return "bg-blue-100 text-blue-800";
      case "completed": return "bg-green-100 text-green-800";
      case "cancelled": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  // Filtering logic now works on real data
  const filteredAppointments = appointments.filter((appointment) => {
    const providerName = appointment.provider.profile?.full_name || '';
    const specialty = (appointment.provider.profile as any)?.specialization || (appointment.provider.profile as any)?.expertise || '';
    
    const matchesSearch = providerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          specialty.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === "all" || appointment.status === filterStatus;

    return matchesSearch && matchesFilter;
  });

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">My Appointments</h1>
            <p className="text-muted-foreground mt-1">Manage your healthcare appointments</p>
          </div>
          <Button asChild>
            <Link to="/patient/book-appointment" className="flex items-center gap-2">
              <Plus className="w-4 h-4" /> Book New Appointment
            </Link>
          </Button>
        </div>

        {/* Filters and Search */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="flex gap-2">
                 {(["all", "pending", "scheduled", "completed", "cancelled"] as const).map((status) => (
                  <Button
                    key={status}
                    variant={filterStatus === status ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFilterStatus(status)}
                    className="capitalize">
                    {status}
                  </Button>
                ))}
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by doctor or specialty..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Appointments List */}
        <div className="grid gap-4">
          {isLoading ? (
            <p>Loading your appointments...</p>
          ) : filteredAppointments.length > 0 ? (
            filteredAppointments.map((appointment) => (
              <Card key={appointment.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Avatar className="w-16 h-16">
                         <AvatarImage src="" alt={appointment.provider.profile?.full_name} />
                        <AvatarFallback><User className="w-8 h-8" /></AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-2">
                           {/* CORRECTED: Display real provider info */}
                          <h3 className="font-semibold text-lg">{appointment.provider.profile?.full_name}</h3>
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                            <span className="text-sm text-muted-foreground">{(appointment.provider.profile as any)?.rating || '5.0'}</span>
                          </div>
                        </div>
                        <p className="text-muted-foreground">{(appointment.provider.profile as any)?.specialization || (appointment.provider.profile as any)?.expertise}</p>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                          <div className="flex items-center gap-1"><Calendar className="w-4 h-4" />{appointment.date}</div>
                          <div className="flex items-center gap-1"><Clock className="w-4 h-4" />{appointment.time}</div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge className={cn("", getStatusColor(appointment.status))}>{appointment.status}</Badge>
                      {/* You can add action buttons here, e.g., for cancelling a pending appointment */}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <p>No appointments match your current filters.</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default PatientAppointments;