import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/api';
import { Appointment } from '@/types';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RightSidebar } from "@/components/layout/RightSidebar";
import { 
    Calendar, 
    Clock, 
    User, 
    Check, 
    X, 
    CheckCircle, 
    Trash2, 
    Search, 
    Filter, 
    CalendarCheck, 
    History,
    CalendarDays
} from "lucide-react";
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

// --- API Functions ---
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

// --- Main Component ---
const Appointments: React.FC = () => {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [searchQuery, setSearchQuery] = useState("");

    // Fetch Data
    const { data: appointments = [], isLoading } = useQuery<Appointment[]>({
        queryKey: ['providerAppointments'],
        queryFn: fetchProviderAppointments,
    });

    // Update Mutation
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

    // Delete Mutation
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

    const handleUpdateStatus = (id: number, status: 'scheduled' | 'cancelled' | 'completed') => {
        mutation.mutate({ id, status });
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "scheduled": return "bg-blue-100 text-blue-800 hover:bg-blue-100";
            case "completed": return "bg-green-100 text-green-800 hover:bg-green-100";
            case "cancelled": return "bg-red-100 text-red-800 hover:bg-red-100";
            case "pending": return "bg-yellow-100 text-yellow-800 animate-pulse hover:bg-yellow-100";
            default: return "bg-gray-100 text-gray-800";
        }
    };

    // Filter logic based on Search Query
    const filteredAppointments = appointments.filter(app => 
        app.patient.profile?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.date.includes(searchQuery)
    );

    // Categorize Appointments
    const pendingAppointments = filteredAppointments.filter(a => a.status === 'pending');
    const scheduledAppointments = filteredAppointments.filter(a => a.status === 'scheduled');
    const pastAppointments = filteredAppointments.filter(a => ['completed', 'cancelled'].includes(a.status));

    // Helper Component for Empty State
    // UPDATED: Changed bg-white/50 to bg-white and added shadow-sm to match search bar
    const EmptyState = ({ message, subMessage }: { message: string, subMessage: string }) => (
        <div className="flex flex-col items-center justify-center py-12 text-center animate-fade-in bg-white rounded-lg border border-dashed border-border/60 shadow-sm">
            <div className="bg-secondary/50 p-4 rounded-full mb-4">
                <CalendarDays className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">{message}</h3>
            <p className="text-sm text-muted-foreground mt-1 max-w-sm">
                {subMessage}
            </p>
        </div>
    );

    return (
        <div className="min-h-screen healthcare-gradient pr-16">
            <RightSidebar />
            <div className="p-6 max-w-7xl mx-auto space-y-6">
                
                {/* Header Section */}
                <div className="space-y-0.5 animate-fade-in">
                    <h1 className="text-2xl font-bold tracking-tight text-foreground">
                        Manage Appointments
                    </h1>
                    <p className="text-muted-foreground">
                        View, schedule, and manage patient appointment requests here.
                    </p>
                </div>

                {/* Search and Filter Bar */}
                <div className="flex flex-col sm:flex-row gap-4 animate-fade-in">
                    <div className="relative flex-1">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search by patient name or date..."
                            className="pl-9 bg-white border-border/40 shadow-sm"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <Button variant="outline" className="bg-white shadow-sm gap-2">
                        <Filter className="h-4 w-4" />
                        Filter
                    </Button>
                </div>

                {/* Loading State */}
                {isLoading ? (
                    <div className="py-10 text-center text-muted-foreground">Loading appointments...</div>
                ) : (
                    /* Tabs System */
                    <Tabs defaultValue="pending" className="space-y-6 animate-slide-in">
                        <TabsList className="grid w-full grid-cols-3 lg:w-[500px] bg-white shadow-sm border border-border/40 p-1">
                            <TabsTrigger value="pending" className="gap-2 data-[state=active]:bg-primary/10 data-[state=active]:text-primary">
                                <Clock className="h-4 w-4" /> Pending Requests
                            </TabsTrigger>
                            <TabsTrigger value="upcoming" className="gap-2 data-[state=active]:bg-primary/10 data-[state=active]:text-primary">
                                <CalendarCheck className="h-4 w-4" /> Upcoming
                            </TabsTrigger>
                            <TabsTrigger value="past" className="gap-2 data-[state=active]:bg-primary/10 data-[state=active]:text-primary">
                                <History className="h-4 w-4" /> Past History
                            </TabsTrigger>
                        </TabsList>

                        {/* 1. Pending Requests Tab */}
                        <TabsContent value="pending" className="space-y-4">
                            {pendingAppointments.length > 0 ? (
                                <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-2">
                                    {pendingAppointments.map(app => (
                                        <Card key={app.id} className="bg-white hover:shadow-md transition-shadow border-l-4 border-l-yellow-400">
                                            <CardContent className="p-6 flex items-center justify-between">
                                                <div className="flex items-center gap-4">
                                                    <div className="bg-yellow-50 p-3 rounded-full">
                                                        <User className="w-6 h-6 text-yellow-600" />
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-lg">{app.patient.profile?.full_name || "Unknown Patient"}</p>
                                                        <div className="text-sm text-muted-foreground flex flex-col gap-1 mt-1">
                                                            <span className="flex items-center gap-1"><Calendar className="w-3 h-3"/> {app.date}</span>
                                                            <span className="flex items-center gap-1"><Clock className="w-3 h-3"/> {app.time}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex flex-col gap-2">
                                                    <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white w-full" onClick={() => handleUpdateStatus(app.id, 'scheduled')} disabled={mutation.isPending}>
                                                        <Check className="w-4 h-4 mr-2"/> Confirm
                                                    </Button>
                                                    <Button size="sm" variant="outline" className="text-red-600 border-red-200 hover:bg-red-50 w-full" onClick={() => handleUpdateStatus(app.id, 'cancelled')} disabled={mutation.isPending}>
                                                        <X className="w-4 h-4 mr-2"/> Decline
                                                    </Button>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            ) : (
                                <EmptyState message="No pending requests" subMessage="You don't have any pending appointment requests at the moment." />
                            )}
                        </TabsContent>

                        {/* 2. Upcoming Appointments Tab */}
                        <TabsContent value="upcoming" className="space-y-4">
                            {scheduledAppointments.length > 0 ? (
                                <div className="grid gap-4 md:grid-cols-1">
                                    {scheduledAppointments.map((appointment) => (
                                        <Card key={appointment.id} className="bg-white hover:shadow-md transition-shadow border-l-4 border-l-blue-500">
                                            <CardContent className="p-6 flex items-center justify-between">
                                                <div className="flex items-center gap-5">
                                                    <div className="bg-blue-50 p-3 rounded-full">
                                                        <User className="w-8 h-8 text-blue-600" />
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-xl">{appointment.patient.profile?.full_name}</p>
                                                        <div className="flex items-center gap-6 text-sm text-muted-foreground mt-2">
                                                            <p className="flex items-center gap-2 bg-secondary/50 px-3 py-1 rounded-md"><Calendar className="w-4 h-4 text-primary"/>{appointment.date}</p>
                                                            <p className="flex items-center gap-2 bg-secondary/50 px-3 py-1 rounded-md"><Clock className="w-4 h-4 text-primary"/>{appointment.time}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <Button size="sm" className="bg-primary hover:bg-primary/90" onClick={() => handleUpdateStatus(appointment.id, 'completed')} disabled={mutation.isPending}>
                                                        <CheckCircle className="w-4 h-4 mr-2"/> Mark Complete
                                                    </Button>
                                                    <Button size="sm" variant="ghost" className="text-destructive hover:bg-destructive/10" onClick={() => handleUpdateStatus(appointment.id, 'cancelled')} disabled={mutation.isPending}>
                                                        Cancel
                                                    </Button>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            ) : (
                                <EmptyState message="No upcoming appointments" subMessage="There are no upcoming appointments scheduled in your calendar." />
                            )}
                        </TabsContent>

                        {/* 3. Past Appointments Tab */}
                        <TabsContent value="past" className="space-y-4">
                            {pastAppointments.length > 0 ? (
                                <div className="space-y-3">
                                    {pastAppointments.map((appointment) => (
                                        <Card key={appointment.id} className="bg-white/60 hover:bg-white transition-colors">
                                            <CardContent className="p-4 flex items-center justify-between">
                                                <div className="flex items-center gap-4">
                                                    <div className="bg-gray-100 p-2 rounded-full">
                                                        <User className="w-5 h-5 text-gray-500" />
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold text-gray-700">{appointment.patient.profile?.full_name}</p>
                                                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                                            <p className="flex items-center gap-1"><Calendar className="w-3 h-3"/>{appointment.date}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <Badge variant="secondary" className={`${getStatusColor(appointment.status)} px-3 py-1 capitalize`}>
                                                        {appointment.status}
                                                    </Badge>
                                                    <AlertDialog>
                                                        <AlertDialogTrigger asChild>
                                                            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive hover:bg-destructive/10" disabled={deleteMutation.isPending}>
                                                                <Trash2 className="w-4 h-4"/>
                                                            </Button>
                                                        </AlertDialogTrigger>
                                                        <AlertDialogContent>
                                                            <AlertDialogHeader>
                                                                <AlertDialogTitle>Delete Record</AlertDialogTitle>
                                                                <AlertDialogDescription>
                                                                    Are you sure you want to delete this history record? This cannot be undone.
                                                                </AlertDialogDescription>
                                                            </AlertDialogHeader>
                                                            <AlertDialogFooter>
                                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                                <AlertDialogAction onClick={() => deleteMutation.mutate(appointment.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                                                                    Delete
                                                                </AlertDialogAction>
                                                            </AlertDialogFooter>
                                                        </AlertDialogContent>
                                                    </AlertDialog>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            ) : (
                                <EmptyState message="No past records" subMessage="No past appointment history found." />
                            )}
                        </TabsContent>
                    </Tabs>
                )}
            </div>
        </div>
    );
};

export default Appointments;