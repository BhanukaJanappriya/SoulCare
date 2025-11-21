import React, { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/api';
import { Appointment } from '@/types';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RightSidebar } from "@/components/layout/RightSidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
    CalendarDays,
    ArrowRight
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
import { cn } from "@/lib/utils";

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
            case "pending": return "bg-yellow-50 text-yellow-700 border-yellow-200/60 shadow-sm";
            case "scheduled": return "bg-blue-50 text-blue-700 border-blue-200/60 shadow-sm";
            case "completed": return "bg-green-50 text-green-700 border-green-200/60 shadow-sm";
            case "cancelled": return "bg-red-50 text-red-700 border-red-200/60 shadow-sm";
            default: return "bg-gray-100 text-gray-800";
        }
    };

    // Filter logic based on Search Query
    const filteredAppointments = useMemo(() => {
        return appointments.filter(app => 
            app.patient.profile?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            app.date.includes(searchQuery)
        );
    }, [appointments, searchQuery]);

    // Categorize Appointments
    const pendingAppointments = filteredAppointments.filter(a => a.status === 'pending');
    const scheduledAppointments = filteredAppointments.filter(a => a.status === 'scheduled');
    const pastAppointments = filteredAppointments.filter(a => ['completed', 'cancelled'].includes(a.status));

    // Helper Component for Empty State
    const EmptyState = ({ message, subMessage, icon: Icon }: { message: string, subMessage: string, icon: any }) => (
        <div className="text-center py-20 bg-muted/5 rounded-2xl border-2 border-dashed border-muted-foreground/20 flex flex-col items-center justify-center">
            <div className="p-4 bg-background rounded-full shadow-sm mb-4">
                <Icon className="w-8 h-8 text-muted-foreground/50" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">{message}</h3>
            <p className="text-muted-foreground mt-1 max-w-sm text-sm">
                {subMessage}
            </p>
        </div>
    );

    // --- Shared Appointment Card Component ---
    const AppointmentCard = ({ appointment, showActions, showComplete, showDelete }: { appointment: Appointment, showActions?: boolean, showComplete?: boolean, showDelete?: boolean }) => (
        <Card key={appointment.id} className="group border border-border/50 bg-card hover:bg-card/50 transition-all duration-200 hover:shadow-md hover:border-primary/20 rounded-xl overflow-hidden">
            <CardContent className="p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
            
            {/* Patient Info */}
            <div className="flex items-center gap-4 w-full md:w-auto">
                <Avatar className="w-16 h-16 border-2 border-background shadow-sm group-hover:border-primary/20 transition-colors">
                    {/* Use optional chaining for patient profile picture */}
                    <AvatarImage src={(appointment.patient.profile as any)?.profile_picture_url} className="object-cover" />
                    <AvatarFallback className="bg-primary/5 text-primary font-semibold text-lg">
                        {(appointment.patient.profile?.full_name || appointment.patient.username)[0].toUpperCase()}
                    </AvatarFallback>
                </Avatar>
                <div className="space-y-1.5">
                    <h3 className="font-bold text-lg text-foreground tracking-tight leading-none">
                        {appointment.patient.profile?.full_name || appointment.patient.username}
                    </h3>
                    <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground/80 font-medium">
                        <div className="flex items-center gap-1.5 bg-secondary/30 px-2 py-0.5 rounded-md">
                            <Calendar className="w-3.5 h-3.5" />
                            <span>{appointment.date}</span>
                        </div>
                        <div className="flex items-center gap-1.5 bg-secondary/30 px-2 py-0.5 rounded-md">
                            <Clock className="w-3.5 h-3.5" />
                            <span>{appointment.time}</span>
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Actions & Status */}
            <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 pt-4 md:pt-0 mt-2 md:mt-0">
                <Badge variant="outline" className={cn("capitalize px-3 py-1 font-medium", getStatusColor(appointment.status))}>
                    {appointment.status}
                </Badge>

                <div className="flex items-center gap-2">
                    {/* Actions for Pending Requests */}
                    {showActions && (
                        <>
                            <Button 
                                size="sm" 
                                className="bg-green-600 hover:bg-green-700 text-white shadow-sm"
                                onClick={() => handleUpdateStatus(appointment.id, 'scheduled')}
                                disabled={mutation.isPending}
                            >
                                <Check className="w-4 h-4 mr-1.5" /> Confirm
                            </Button>
                            <Button 
                                size="sm" 
                                variant="outline" 
                                className="text-destructive border-destructive/20 hover:bg-destructive/5"
                                onClick={() => handleUpdateStatus(appointment.id, 'cancelled')}
                                disabled={mutation.isPending}
                            >
                                <X className="w-4 h-4 mr-1.5" /> Decline
                            </Button>
                        </>
                    )}

                    {/* Actions for Scheduled Appointments */}
                    {showComplete && (
                         <>
                            <Button 
                                size="sm" 
                                className="bg-primary hover:bg-primary/90 shadow-sm"
                                onClick={() => handleUpdateStatus(appointment.id, 'completed')}
                                disabled={mutation.isPending}
                            >
                                <CheckCircle className="w-4 h-4 mr-1.5" /> Mark Complete
                            </Button>
                             <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive hover:bg-destructive/10" disabled={mutation.isPending}>
                                        Cancel
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Cancel Appointment?</AlertDialogTitle>
                                        <AlertDialogDescription>Are you sure? This will cancel the scheduled session.</AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Back</AlertDialogCancel>
                                        <AlertDialogAction className="bg-destructive hover:bg-destructive/90" onClick={() => handleUpdateStatus(appointment.id, 'cancelled')}>
                                            Yes, Cancel
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </>
                    )}

                    {/* Action: Delete History */}
                    {showDelete && (
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="text-muted-foreground/60 hover:text-destructive hover:bg-destructive/10 transition-colors rounded-full h-8 w-8" disabled={deleteMutation.isPending}>
                            <Trash2 className="w-4 h-4" />
                        </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="rounded-xl">
                        <AlertDialogHeader>
                            <AlertDialogTitle>Delete History?</AlertDialogTitle>
                            <AlertDialogDescription>
                                This will permanently remove this record from your history view.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel className="rounded-lg">Cancel</AlertDialogCancel>
                            <AlertDialogAction className="bg-destructive hover:bg-destructive/90 rounded-lg" onClick={() => deleteMutation.mutate(appointment.id)}>
                                Delete
                            </AlertDialogAction>
                        </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                    )}
                </div>
            </div>
            </CardContent>
        </Card>
    );

    return (
        <div className="p-6 md:p-8 min-h-screen bg-background/50 pr-[5.5rem]">
            <RightSidebar />
            <div className="max-w-6xl mx-auto space-y-8">
                
                {/* Header Section */}
                <div className="flex flex-col gap-6">
                    <div>
                        <h1 className="text-4xl font-extrabold tracking-tight text-foreground">
                          Manage Appointments   <span className="text-primary"> </span>
                        </h1>
                        <p className="text-muted-foreground mt-2 text-lg">View, schedule, and manage patient appointment requests.</p>
                    </div>

                    {/* Search Bar */}
                    <div className="relative max-w-md">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search by patient name or date..."
                            className="pl-10 bg-background shadow-sm border-muted-foreground/20 h-11"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                {isLoading ? (
                     <div className="flex flex-col items-center justify-center py-20 gap-4">
                         <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
                         <p className="text-muted-foreground font-medium">Loading appointments...</p>
                     </div>
                ) : (
                    <Tabs defaultValue="pending" className="w-full">
                        <TabsList className="grid w-full grid-cols-3 mb-8 p-1 bg-muted/50 rounded-xl h-14 lg:w-[600px]">
                            <TabsTrigger value="pending" className="rounded-lg h-12 font-medium data-[state=active]:bg-white data-[state=active]:text-yellow-600 data-[state=active]:shadow-sm transition-all">
                                Pending <span className="ml-2 bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full text-xs">{pendingAppointments.length}</span>
                            </TabsTrigger>
                            <TabsTrigger value="scheduled" className="rounded-lg h-12 font-medium data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm transition-all">
                                Upcoming <span className="ml-2 bg-primary/10 text-primary px-2 py-0.5 rounded-full text-xs">{scheduledAppointments.length}</span>
                            </TabsTrigger>
                            <TabsTrigger value="history" className="rounded-lg h-12 font-medium data-[state=active]:bg-white data-[state=active]:text-muted-foreground data-[state=active]:shadow-sm transition-all">
                                History <span className="ml-2 bg-muted text-muted-foreground px-2 py-0.5 rounded-full text-xs">{pastAppointments.length}</span>
                            </TabsTrigger>
                        </TabsList>

                        <div className="mt-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            {/* 1. Pending Requests Tab */}
                            <TabsContent value="pending" className="space-y-4">
                                {pendingAppointments.length > 0 ? (
                                    pendingAppointments.map(app => <AppointmentCard key={app.id} appointment={app} showActions={true} />)
                                ) : (
                                    <EmptyState message="No pending requests" subMessage="You're all caught up! No new appointment requests." icon={Clock} />
                                )}
                            </TabsContent>

                            {/* 2. Upcoming Tab */}
                            <TabsContent value="scheduled" className="space-y-4">
                                {scheduledAppointments.length > 0 ? (
                                    scheduledAppointments.map(app => <AppointmentCard key={app.id} appointment={app} showComplete={true} />)
                                ) : (
                                    <EmptyState message="No upcoming sessions" subMessage="Your schedule is clear for upcoming appointments." icon={CalendarCheck} />
                                )}
                            </TabsContent>

                            {/* 3. History Tab */}
                            <TabsContent value="history" className="space-y-4">
                                {pastAppointments.length > 0 ? (
                                    pastAppointments.map(app => <AppointmentCard key={app.id} appointment={app} showDelete={true} />)
                                ) : (
                                    <EmptyState message="No appointment history" subMessage="Past appointments will appear here." icon={History} />
                                )}
                            </TabsContent>
                        </div>
                    </Tabs>
                )}
            </div>
        </div>
    );
};

export default Appointments;