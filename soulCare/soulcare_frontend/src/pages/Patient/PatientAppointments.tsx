import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/api';
import { Appointment } from '@/types';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Calendar, Clock, Plus, User, Star } from "lucide-react";
import { Link } from "react-router-dom";

const fetchPatientAppointments = async (): Promise<Appointment[]> => {
    const { data } = await api.get<Appointment[]>('/appointments/');
    return data;
};

const PatientAppointments: React.FC = () => {
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

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">My Appointments</h1>
            <p className="text-muted-foreground mt-1">View your upcoming and past appointments</p>
          </div>
          <Button asChild>
            <Link to="/patient/book-appointment" className="flex items-center gap-2">
              <Plus className="w-4 h-4" /> Book New Appointment
            </Link>
          </Button>
        </div>

        <div className="grid gap-4">
          {isLoading ? (
            <p>Loading your appointments...</p>
          ) : appointments.length > 0 ? (
            appointments.map((appointment) => (
              <Card key={appointment.id}>
                <CardContent className="p-6 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Avatar className="w-16 h-16">
                      <AvatarImage src={(appointment.provider.profile as any).profile_picture_url} />
                      <AvatarFallback><User className="w-8 h-8" /></AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold text-lg">{appointment.provider.profile.full_name}</h3>
                      <p className="text-muted-foreground">{'specialization' in appointment.provider.profile ? appointment.provider.profile.specialization : appointment.provider.profile.expertise}</p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                        <div className="flex items-center gap-1"><Calendar className="w-4 h-4" />{appointment.date}</div>
                        <div className="flex items-center gap-1"><Clock className="w-4 h-4" />{appointment.time}</div>
                      </div>
                    </div>
                  </div>
                  <Badge className={getStatusColor(appointment.status)}>{appointment.status}</Badge>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
                <CardContent className="p-12 text-center">
                    <p>You have no appointments scheduled.</p>
                </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default PatientAppointments;