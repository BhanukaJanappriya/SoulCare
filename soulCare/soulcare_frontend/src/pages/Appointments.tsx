import React from "react";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/api';
import { Appointment } from '@/types';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RightSidebar } from "@/components/layout/RightSidebar";
import { Calendar, Clock, User, Check, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const fetchProviderAppointments = async (): Promise<Appointment[]> => {
    const { data } = await api.get<Appointment[]>('/appointments/');
    return data;
};

const updateAppointmentStatus = async ({ id, status }: { id: number, status: string }) => {
    const { data } = await api.post(`/appointments/${id}/update-status/`, { status });
    return data;
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

    const handleUpdateStatus = (id: number, status: 'scheduled' | 'cancelled') => {
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

    const pendingAppointments = appointments.filter(a => a.status === 'pending');
    const otherAppointments = appointments.filter(a => a.status !== 'pending');

    return (
        <div className="min-h-screen healthcare-gradient pr-16">
            <RightSidebar />
            <div className="p-6 max-w-7xl mx-auto">
                <h1 className="text-3xl font-bold text-foreground mb-6">Appointments</h1>
                
                {/* Pending Appointments Section */}
                <div className="mb-8">
                    <h2 className="text-2xl font-semibold text-foreground mb-4">Pending Requests</h2>
                    {isLoading ? <p>Loading...</p> : pendingAppointments.length > 0 ? (
                        <div className="space-y-4">
                            {pendingAppointments.map(app => (
                                <Card key={app.id} className="bg-yellow-50 border-yellow-200">
                                    <CardContent className="p-4 flex items-center justify-between">
                                        <div>
                                            <p className="font-bold">{app.patient.profile.full_name}</p>
                                            <p className="text-sm text-muted-foreground">{app.date} at {app.time}</p>
                                            <p className="text-sm mt-1">Note: {app.notes}</p>
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

                {/* All Other Appointments */}
                <div>
                    <h2 className="text-2xl font-semibold text-foreground mb-4">Scheduled & Past Appointments</h2>
                    <div className="space-y-4">
                         {otherAppointments.map((appointment) => (
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
                                <Badge className={getStatusColor(appointment.status)}>{appointment.status}</Badge>
                            </CardContent>
                          </Card>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Appointments;