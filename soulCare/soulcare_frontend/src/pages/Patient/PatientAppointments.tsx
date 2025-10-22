import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/api';
import { Appointment } from '@/types';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Calendar, Clock, Plus, User, X, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

// --- Data Fetching & Mutation Functions ---
const fetchPatientAppointments = async (): Promise<Appointment[]> => {
  const { data } = await api.get<Appointment[]>('/appointments/');
  return data;
};

const cancelAppointment = async (appointmentId: number) => {
  // Corrected the template literal syntax for the URL
  const { data } = await api.post(`/appointments/${appointmentId}/cancel-by-patient/`);
  return data;
};

const deleteAppointment = async (appointmentId: number) => {
  await api.delete(`/appointments/${appointmentId}/`);
};

const PatientAppointments: React.FC = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: appointments = [], isLoading } = useQuery<Appointment[]>({
    queryKey: ['patientAppointments'],
    queryFn: fetchPatientAppointments,
  });

  const mutation = useMutation({
    mutationFn: cancelAppointment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patientAppointments'] });
      toast({ title: "Success", description: "Your appointment has been cancelled." });
    },
    onError: (error: any) => {
      toast({ variant: "destructive", title: "Error", description: error.response?.data?.error || "Could not cancel appointment." });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: deleteAppointment,
    onSuccess: () => {
      
      toast({ title: "Success", description: "Appointment deleted from history." });
    },
    onError: (error: any) => {
      toast({ variant: "destructive", title: "Error", description: error.response?.data?.error || "Could not delete appointment." });
    },
    onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['patientAppointments'] });
    }
  });

  const handleCancel = (id: number) => {
    mutation.mutate(id);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-yellow-100 text-yellow-800";
      case "scheduled": return "bg-blue-100 text-blue-800";
      case "completed": return "bg-green-100 text-green-800";
      case "cancelled": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  // Separate appointments into two lists for better UI organization
  const upcomingAppointments = appointments.filter(a => ['pending', 'scheduled'].includes(a.status));
  const pastAppointments = appointments.filter(a => ['completed', 'cancelled'].includes(a.status));

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto space-y-8">
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

        {isLoading ? <p>Loading your appointments...</p> : (
          <>
            {/* Upcoming Appointments Section */}
            <div>
              <h2 className="text-2xl font-semibold text-foreground mb-4">Upcoming & Pending</h2>
              {upcomingAppointments.length > 0 ? (
                <div className="space-y-4">
                  {upcomingAppointments.map((appointment) => (
                    <Card key={appointment.id}>
                      <CardContent className="p-6 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <Avatar className="w-16 h-16">
                            <AvatarImage src={(appointment.provider.profile as any).profile_picture_url} />
                            <AvatarFallback><User className="w-8 h-8" /></AvatarFallback>
                          </Avatar>
                          <div>
                            <h3 className="font-semibold text-lg">{appointment.provider.profile.full_name}</h3>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                              <div className="flex items-center gap-1"><Calendar className="w-4 h-4" />{appointment.date}</div>
                              <div className="flex items-center gap-1"><Clock className="w-4 h-4" />{appointment.time}</div>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge className={getStatusColor(appointment.status)}>{appointment.status}</Badge>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="destructive" size="sm" disabled={mutation.isPending}>
                                <X className="w-4 h-4 mr-1" />Cancel
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This will permanently cancel your appointment. This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Go Back</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleCancel(appointment.id)}>
                                  Yes, Cancel Appointment
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : <p className="text-muted-foreground">You have no upcoming appointments.</p>}
            </div>

            {/* Past Appointments Section */}
            <div>
              <h2 className="text-2xl font-semibold text-foreground mb-4">Past Appointments</h2>
              {pastAppointments.length > 0 ? (
                <div className="space-y-4">
                  {pastAppointments.map((appointment) => (
                    <Card key={appointment.id} className="opacity-70">
                      <CardContent className="p-6 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <Avatar className="w-16 h-16">
                            <AvatarImage src={(appointment.provider.profile as any).profile_picture_url} />
                            <AvatarFallback><User className="w-8 h-8" /></AvatarFallback>
                          </Avatar>
                          <div>
                            <h3 className="font-semibold text-lg">{appointment.provider.profile.full_name}</h3>
                            <p className="text-sm text-muted-foreground">{appointment.date}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={getStatusColor(appointment.status)}>{appointment.status}</Badge>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600" disabled={deleteMutation.isPending}>
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Appointment Record?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This will permanently delete this appointment record. This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Go Back</AlertDialogCancel>
                                <AlertDialogAction onClick={() => deleteMutation.mutate(appointment.id)}>
                                  Yes, Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : <p className="text-muted-foreground">You have no past appointment history.</p>}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default PatientAppointments;