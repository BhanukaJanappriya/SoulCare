import React from "react";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/api';
import { Appointment } from '@/types';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RightSidebar } from "@/components/layout/RightSidebar";
import { Calendar, Clock, User, Check, X, CheckCircle,Trash2 } from "lucide-react"; // Added CheckCircle
import { useToast } from "@/hooks/use-toast";
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

const fetchProviderAppointments = async (): Promise<Appointment[]> => {
    const { data } = await api.get<Appointment[]>('/appointments/');
    return data;
};

const updateAppointmentStatus = async ({ id, status }: { id: number, status: string }) => {
    const { data } = await api.post(`/appointments/${id}/update-status/`, { status });
    return data;
};

const deleteAppointment = async (appointmentId: number) => {
    await api.delete(`/appointments/${appointmentId}/`);
};


const Appointments: React.FC = () => {
    const { toast } = useToast();
    const queryClient = useQueryClient();

    const { data: appointments = [], isLoading } = useQuery<Appointment[]>({
        queryKey: ['providerAppointments'],
        queryFn: fetchProviderAppointments,
    });

    const mutation = useMutation({
        mutationFn: updateAppointmentStatus,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['providerAppointments'] });
            toast({ title: "Success", description: "Appointment status updated." });
        },
        onError: (error: any) => {
            toast({ variant: "destructive", title: "Error", description: error.response?.data?.error || "Could not update status." });
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
        onSettled: ()=> {
            queryClient.invalidateQueries({ queryKey: ['providerAppointments'] });
        },
    });

    // Widen the type to include 'completed'
    const handleUpdateStatus = (id: number, status: 'scheduled' | 'cancelled' | 'completed') => {
        mutation.mutate({ id, status });
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "scheduled": return "bg-blue-100 text-blue-800";
            case "completed": return "bg-green-100 text-green-800";
            case "cancelled": return "bg-red-100 text-red-800";
            case "pending": return "bg-yellow-100 text-yellow-800 animate-pulse";
            default: return "bg-gray-100 text-gray-800";
        }
    };

    // We now have three categories of appointments
    const pendingAppointments = appointments.filter(a => a.status === 'pending');
    const scheduledAppointments = appointments.filter(a => a.status === 'scheduled');
    const pastAppointments = appointments.filter(a => ['completed', 'cancelled'].includes(a.status));

    return (
        <div className="min-h-screen healthcare-gradient pr-16">
            <RightSidebar />
            <div className="p-6 max-w-7xl mx-auto">
                <h1 className="text-3xl font-bold text-foreground mb-6">Appointments</h1>
                
                {isLoading ? <p>Loading...</p> : (
                    <>
                        {/* Pending Appointments Section */}
                        <div className="mb-8">
                            <h2 className="text-2xl font-semibold text-foreground mb-4">Pending Requests</h2>
                            {pendingAppointments.length > 0 ? (
                                <div className="space-y-4">
                                    {pendingAppointments.map(app => (
                                        <Card key={app.id} className="bg-yellow-50 border-yellow-200">
                                            <CardContent className="p-4 flex items-center justify-between">
                                                <div>
                                                    <p className="font-bold">{app.patient.profile?.full_name}</p>
                                                    <p className="text-sm text-muted-foreground">{app.date} at {app.time}</p>
                                                </div>
                                                <div className="flex gap-2">
                                                    <Button size="sm" className="bg-green-500 hover:bg-green-600" onClick={() => handleUpdateStatus(app.id, 'scheduled')} disabled={mutation.isPending}>
                                                        <Check className="w-4 h-4 mr-2"/>Confirm
                                                    </Button>
                                                    <Button size="sm" variant="destructive" onClick={() => handleUpdateStatus(app.id, 'cancelled')} disabled={mutation.isPending}>
                                                        <X className="w-4 h-4 mr-2"/>Decline
                                                    </Button>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            ) : <p className="text-muted-foreground">No pending appointment requests.</p>}
                        </div>

                        {/* Scheduled (Upcoming) Appointments Section */}
                        <div className="mb-8">
                            <h2 className="text-2xl font-semibold text-foreground mb-4">Upcoming Appointments</h2>
                            {scheduledAppointments.length > 0 ? (
                                <div className="space-y-4">
                                    {scheduledAppointments.map((appointment) => (
                                        <Card key={appointment.id}>
                                            <CardContent className="p-4 flex items-center justify-between">
                                                <div className="flex items-center gap-4">
                                                    <User className="w-8 h-8 text-primary" />
                                                    <div>
                                                        <p className="font-bold">{appointment.patient.profile?.full_name}</p>
                                                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                                            <p className="flex items-center gap-1"><Calendar className="w-4 h-4"/>{appointment.date}</p>
                                                            <p className="flex items-center gap-1"><Clock className="w-4 h-4"/>{appointment.time}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                                {/* --- THIS IS THE NEW PART --- */}
                                                <div className="flex items-center gap-2">
                                                    <Button size="sm" variant="outline" className="text-green-600 border-green-600 hover:bg-green-50 hover:text-green-700" onClick={() => handleUpdateStatus(appointment.id, 'completed')} disabled={mutation.isPending}>
                                                        <CheckCircle className="w-4 h-4 mr-2"/>Complete
                                                    </Button>
                                                     <Button size="sm" variant="destructive" onClick={() => handleUpdateStatus(appointment.id, 'cancelled')} disabled={mutation.isPending}>
                                                        <X className="w-4 h-4 mr-2"/>Cancel
                                                    </Button>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            ) : <p className="text-muted-foreground">No upcoming appointments scheduled.</p>}
                        </div>
                        
                        {/* Past Appointments Section */}
                        <div>
                            <h2 className="text-2xl font-semibold text-foreground mb-4">Past Appointments</h2>
                             {pastAppointments.length > 0 ? (
                                <div className="space-y-4">
                                     {pastAppointments.map((appointment) => (
                                      <Card key={appointment.id} className="opacity-70">
                                        <CardContent className="p-4 flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <User className="w-8 h-8 text-muted-foreground" />
                                                <div>
                                                    <p className="font-bold text-muted-foreground">{appointment.patient.profile?.full_name}</p>
                                                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                                        <p className="flex items-center gap-1"><Calendar className="w-4 h-4"/>{appointment.date}</p>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Badge className={getStatusColor(appointment.status)}>{appointment.status}</Badge>
                                                <AlertDialog>
                                                    <AlertDialogTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600" disabled={deleteMutation.isPending}>
                                                            <Trash2 className="w-4 h-4"/>
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
                             ) : <p className="text-muted-foreground">No past appointment records.</p>}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default Appointments;