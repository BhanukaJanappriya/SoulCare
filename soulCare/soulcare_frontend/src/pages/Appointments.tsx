
// import React, { useState } from "react";
// import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
// import { api } from '@/api';
// import { Appointment } from '@/types';
// import { Card, CardContent } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Badge } from "@/components/ui/badge";
// import { Input } from "@/components/ui/input";
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import { RightSidebar } from "@/components/layout/RightSidebar";
// import { 
//     Calendar, 
//     Clock, 
//     User, 
//     Check, 
//     X, 
//     CheckCircle, 
//     Trash2, 
//     Search, 
//     Filter, 
//     CalendarCheck, 
//     History,
//     CalendarDays
// } from "lucide-react";
// import { useToast } from "@/hooks/use-toast";
// import {
//   AlertDialog,
//   AlertDialogAction,
//   AlertDialogCancel,
//   AlertDialogContent,
//   AlertDialogDescription,
//   AlertDialogFooter,
//   AlertDialogHeader,
//   AlertDialogTitle,
//   AlertDialogTrigger,
// } from "@/components/ui/alert-dialog";

// // --- API Functions ---
// const fetchProviderAppointments = async (): Promise<Appointment[]> => {
//     const { data } = await api.get<Appointment[]>('/appointments/');
//     return data;
// };

// const updateAppointmentStatus = async ({ id, status }: { id: number, status: string }) => {
//     const { data } = await api.post(`/appointments/${id}/update-status/`, { status });
//     return data;
// };

// const deleteAppointment = async (appointmentId: number) => {
//     await api.delete(`/appointments/${appointmentId}/`);
// };

// // --- Main Component ---
// const Appointments: React.FC = () => {
//     const { toast } = useToast();
//     const queryClient = useQueryClient();
//     const [searchQuery, setSearchQuery] = useState("");

//     // Fetch Data
//     const { data: appointments = [], isLoading } = useQuery<Appointment[]>({
//         queryKey: ['providerAppointments'],
//         queryFn: fetchProviderAppointments,
//     });

//     // Update Mutation
//     const mutation = useMutation({
//         mutationFn: updateAppointmentStatus,
//         onSuccess: () => {
//             queryClient.invalidateQueries({ queryKey: ['providerAppointments'] });
//             toast({ title: "Success", description: "Appointment status updated." });
//         },
//         onError: (error: any) => {
//             toast({ variant: "destructive", title: "Error", description: error.response?.data?.error || "Could not update status." });
//         }
//     });

//     // Delete Mutation
//     const deleteMutation = useMutation({
//         mutationFn: deleteAppointment,
//         onSuccess: () => {
//             toast({ title: "Success", description: "Appointment deleted from history." });
//         },
//         onError: (error: any) => {
//             toast({ variant: "destructive", title: "Error", description: error.response?.data?.error || "Could not delete appointment." });
//         },
//         onSettled: ()=> {
//             queryClient.invalidateQueries({ queryKey: ['providerAppointments'] });
//         },
//     });

//     const handleUpdateStatus = (id: number, status: 'scheduled' | 'cancelled' | 'completed') => {
//         mutation.mutate({ id, status });
//     };

//     const getStatusColor = (status: string) => {
//         switch (status) {
//             case "scheduled": return "bg-blue-100 text-blue-800 hover:bg-blue-100";
//             case "completed": return "bg-green-100 text-green-800 hover:bg-green-100";
//             case "cancelled": return "bg-red-100 text-red-800 hover:bg-red-100";
//             case "pending": return "bg-yellow-100 text-yellow-800 animate-pulse hover:bg-yellow-100";
//             default: return "bg-gray-100 text-gray-800";
//         }
//     };

//     // Filter logic based on Search Query
//     const filteredAppointments = appointments.filter(app => 
//         app.patient.profile?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
//         app.date.includes(searchQuery)
//     );

//     // Categorize Appointments based on Backend Status
//     const pendingAppointments = filteredAppointments.filter(a => a.status === 'pending');
//     const scheduledAppointments = filteredAppointments.filter(a => a.status === 'scheduled');
//     const pastAppointments = filteredAppointments.filter(a => ['completed', 'cancelled'].includes(a.status));

//     // Helper Component for Empty State (Matches your requirement: White background)
//     const EmptyState = ({ message, subMessage }: { message: string, subMessage: string }) => (
//         <div className="flex flex-col items-center justify-center py-16 text-center animate-fade-in bg-white rounded-lg border border-border/60 shadow-sm">
//             <div className="bg-secondary/20 p-4 rounded-full mb-4">
//                 <CalendarDays className="h-8 w-8 text-muted-foreground" />
//             </div>
//             <h3 className="text-lg font-semibold text-foreground">{message}</h3>
//             <p className="text-sm text-muted-foreground mt-1 max-w-sm">
//                 {subMessage}
//             </p>
//         </div>
//     );

//     return (
//         <div className="min-h-screen healthcare-gradient pr-16">
//             <RightSidebar />
//             <div className="p-6 max-w-7xl mx-auto space-y-6">
                
//                 {/* Header Section */}
//                 <div className="space-y-0.5 animate-fade-in">
//                     <h1 className="text-2xl font-bold tracking-tight text-foreground">
//                         Manage Appointments
//                     </h1>
//                     <p className="text-muted-foreground">
//                         View, schedule, and manage patient appointment requests here.
//                     </p>
//                 </div>

//                 {/* Search and Filter Bar */}
//                 <div className="flex flex-col sm:flex-row gap-4 animate-fade-in">
//                     <div className="relative flex-1">
//                         <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
//                         <Input
//                             placeholder="Search by patient name or date..."
//                             className="pl-9 bg-white border-border/40 shadow-sm"
//                             value={searchQuery}
//                             onChange={(e) => setSearchQuery(e.target.value)}
//                         />
//                     </div>
//                     <Button variant="outline" className="bg-white shadow-sm gap-2">
//                         <Filter className="h-4 w-4" />
//                         Filter
//                     </Button>
//                 </div>

//                 {/* Loading State */}
//                 {isLoading ? (
//                     <div className="py-10 text-center text-muted-foreground">Loading appointments...</div>
//                 ) : (
//                     /* Tabs System */
//                     <Tabs defaultValue="pending" className="space-y-6 animate-slide-in">
//                         <TabsList className="grid w-full grid-cols-3 lg:w-[500px] bg-white shadow-sm border border-border/40 p-1">
//                             <TabsTrigger value="pending" className="gap-2 data-[state=active]:bg-primary/10 data-[state=active]:text-primary">
//                                 <Clock className="h-4 w-4" /> Pending
//                             </TabsTrigger>
//                             <TabsTrigger value="upcoming" className="gap-2 data-[state=active]:bg-primary/10 data-[state=active]:text-primary">
//                                 <CalendarCheck className="h-4 w-4" /> Upcoming
//                             </TabsTrigger>
//                             <TabsTrigger value="past" className="gap-2 data-[state=active]:bg-primary/10 data-[state=active]:text-primary">
//                                 <History className="h-4 w-4" /> Past
//                             </TabsTrigger>
//                         </TabsList>

//                         {/* 1. Pending Requests Tab */}
//                         <TabsContent value="pending" className="space-y-4">
//                             {pendingAppointments.length > 0 ? (
//                                 <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-2">
//                                     {pendingAppointments.map(app => (
//                                         <Card key={app.id} className="bg-white hover:shadow-md transition-shadow border-l-4 border-l-yellow-400">
//                                             <CardContent className="p-6 flex items-center justify-between">
//                                                 <div className="flex items-center gap-4">
//                                                     <div className="bg-yellow-50 p-3 rounded-full">
//                                                         <User className="w-6 h-6 text-yellow-600" />
//                                                     </div>
//                                                     <div>
//                                                         <p className="font-bold text-lg">{app.patient.profile?.full_name || "Unknown Patient"}</p>
//                                                         <div className="text-sm text-muted-foreground flex flex-col gap-1 mt-1">
//                                                             <span className="flex items-center gap-1"><Calendar className="w-3 h-3"/> {app.date}</span>
//                                                             <span className="flex items-center gap-1"><Clock className="w-3 h-3"/> {app.time}</span>
//                                                         </div>
//                                                     </div>
//                                                 </div>
//                                                 <div className="flex flex-col gap-2">
//                                                     <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white w-full" onClick={() => handleUpdateStatus(app.id, 'scheduled')} disabled={mutation.isPending}>
//                                                         <Check className="w-4 h-4 mr-2"/> Confirm
//                                                     </Button>
//                                                     <Button size="sm" variant="outline" className="text-red-600 border-red-200 hover:bg-red-50 w-full" onClick={() => handleUpdateStatus(app.id, 'cancelled')} disabled={mutation.isPending}>
//                                                         <X className="w-4 h-4 mr-2"/> Decline
//                                                     </Button>
//                                                 </div>
//                                             </CardContent>
//                                         </Card>
//                                     ))}
//                                 </div>
//                             ) : (
//                                 <EmptyState message="No pending requests" subMessage="You don't have any pending appointment requests at the moment." />
//                             )}
//                         </TabsContent>

//                         {/* 2. Upcoming Appointments Tab */}
//                         <TabsContent value="upcoming" className="space-y-4">
//                             {scheduledAppointments.length > 0 ? (
//                                 <div className="grid gap-4 md:grid-cols-1">
//                                     {scheduledAppointments.map((appointment) => (
//                                         <Card key={appointment.id} className="bg-white hover:shadow-md transition-shadow border-l-4 border-l-blue-500">
//                                             <CardContent className="p-6 flex items-center justify-between">
//                                                 <div className="flex items-center gap-5">
//                                                     <div className="bg-blue-50 p-3 rounded-full">
//                                                         <User className="w-8 h-8 text-blue-600" />
//                                                     </div>
//                                                     <div>
//                                                         <p className="font-bold text-xl">{appointment.patient.profile?.full_name}</p>
//                                                         <div className="flex items-center gap-6 text-sm text-muted-foreground mt-2">
//                                                             <p className="flex items-center gap-2 bg-secondary/50 px-3 py-1 rounded-md"><Calendar className="w-4 h-4 text-primary"/>{appointment.date}</p>
//                                                             <p className="flex items-center gap-2 bg-secondary/50 px-3 py-1 rounded-md"><Clock className="w-4 h-4 text-primary"/>{appointment.time}</p>
//                                                         </div>
//                                                     </div>
//                                                 </div>
//                                                 <div className="flex items-center gap-3">
//                                                     <Button size="sm" className="bg-primary hover:bg-primary/90" onClick={() => handleUpdateStatus(appointment.id, 'completed')} disabled={mutation.isPending}>
//                                                         <CheckCircle className="w-4 h-4 mr-2"/> Mark Complete
//                                                     </Button>
//                                                     <Button size="sm" variant="ghost" className="text-destructive hover:bg-destructive/10" onClick={() => handleUpdateStatus(appointment.id, 'cancelled')} disabled={mutation.isPending}>
//                                                         Cancel
//                                                     </Button>
//                                                 </div>
//                                             </CardContent>
//                                         </Card>
//                                     ))}
//                                 </div>
//                             ) : (
//                                 <EmptyState message="No upcoming appointments" subMessage="There are no upcoming appointments scheduled in your calendar." />
//                             )}
//                         </TabsContent>

//                         {/* 3. Past Appointments Tab */}
//                         <TabsContent value="past" className="space-y-4">
//                             {pastAppointments.length > 0 ? (
//                                 <div className="space-y-3">
//                                     {pastAppointments.map((appointment) => (
//                                         <Card key={appointment.id} className="bg-white/60 hover:bg-white transition-colors">
//                                             <CardContent className="p-4 flex items-center justify-between">
//                                                 <div className="flex items-center gap-4">
//                                                     <div className="bg-gray-100 p-2 rounded-full">
//                                                         <User className="w-5 h-5 text-gray-500" />
//                                                     </div>
//                                                     <div>
//                                                         <p className="font-semibold text-gray-700">{appointment.patient.profile?.full_name}</p>
//                                                         <div className="flex items-center gap-4 text-xs text-muted-foreground">
//                                                             <p className="flex items-center gap-1"><Calendar className="w-3 h-3"/>{appointment.date}</p>
//                                                         </div>
//                                                     </div>
//                                                 </div>
//                                                 <div className="flex items-center gap-3">
//                                                     <Badge variant="secondary" className={`${getStatusColor(appointment.status)} px-3 py-1 capitalize`}>
//                                                         {appointment.status}
//                                                     </Badge>
//                                                     <AlertDialog>
//                                                         <AlertDialogTrigger asChild>
//                                                             <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive hover:bg-destructive/10" disabled={deleteMutation.isPending}>
//                                                                 <Trash2 className="w-4 h-4"/>
//                                                             </Button>
//                                                         </AlertDialogTrigger>
//                                                         <AlertDialogContent>
//                                                             <AlertDialogHeader>
//                                                                 <AlertDialogTitle>Delete Record</AlertDialogTitle>
//                                                                 <AlertDialogDescription>
//                                                                     Are you sure you want to delete this history record? This cannot be undone.
//                                                                 </AlertDialogDescription>
//                                                             </AlertDialogHeader>
//                                                             <AlertDialogFooter>
//                                                                 <AlertDialogCancel>Cancel</AlertDialogCancel>
//                                                                 <AlertDialogAction onClick={() => deleteMutation.mutate(appointment.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
//                                                                     Delete
//                                                                 </AlertDialogAction>
//                                                             </AlertDialogFooter>
//                                                         </AlertDialogContent>
//                                                     </AlertDialog>
//                                                 </div>
//                                             </CardContent>
//                                         </Card>
//                                     ))}
//                                 </div>
//                             ) : (
//                                 <EmptyState message="No past records" subMessage="No past appointment history found." />
//                             )}
//                         </TabsContent>
//                     </Tabs>
//                 )}
//             </div>
//         </div>
//     );
// };

// export default Appointments;


import React, { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/api';
import { Appointment } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
    CalendarRange,
    History,
    CalendarDays,
    FileText, // Changed icon to match prescription style if desired, or keep Calendar
    PlusCircle
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

// --- API Functions (Provider Logic) ---
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

    // Mutations
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
            toast({ title: "Success", description: "Record deleted." });
        },
        onSettled: ()=> {
            queryClient.invalidateQueries({ queryKey: ['providerAppointments'] });
        },
    });

    const handleUpdateStatus = (id: number, status: 'scheduled' | 'cancelled' | 'completed') => {
        mutation.mutate({ id, status });
    };

    // Helper colors for status badges
    const getStatusColor = (status: string) => {
        switch (status) {
            case "scheduled": return "bg-blue-100 text-blue-700 border-blue-200";
            case "completed": return "bg-green-100 text-green-700 border-green-200";
            case "cancelled": return "bg-red-100 text-red-700 border-red-200";
            case "pending": return "bg-amber-100 text-amber-700 border-amber-200";
            default: return "bg-slate-100 text-slate-700 border-slate-200";
        }
    };

    // Filter logic
    const filteredAppointments = useMemo(() => {
        return appointments.filter(app => 
            app.patient.profile?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            app.date.includes(searchQuery)
        );
    }, [appointments, searchQuery]);

    const pendingAppointments = filteredAppointments.filter(a => a.status === 'pending');
    const scheduledAppointments = filteredAppointments.filter(a => a.status === 'scheduled');
    const pastAppointments = filteredAppointments.filter(a => ['completed', 'cancelled'].includes(a.status));

    // --- Shared Appointment Card Component ---
    const AppointmentCard = ({ appointment, showActions, showComplete, showDelete }: { appointment: Appointment, showActions?: boolean, showComplete?: boolean, showDelete?: boolean }) => (
        <Card key={appointment.id} className="group border border-border/50 bg-card hover:bg-card/50 transition-all duration-200 hover:shadow-md hover:border-primary/20 rounded-xl overflow-hidden">
            <CardContent className="p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
            
            {/* Patient Info Section */}
            <div className="flex items-center gap-4 w-full md:w-auto">
                <Avatar className="w-16 h-16 border-2 border-background shadow-sm group-hover:border-primary/20 transition-colors">
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
            
            {/* Status & Actions Section */}
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

    // Empty State Component (Matches Image 2 Design)
    const EmptyState = ({ title, description, icon: Icon = CalendarDays }: { title: string, description: string, icon?: any }) => (
        <div className="w-full bg-white rounded-lg border border-slate-200 shadow-sm flex flex-col items-center justify-center text-center p-16 min-h-[300px] animate-fade-in">
            <div className="bg-slate-50 p-4 rounded-2xl mb-4 border border-slate-100">
                <Icon className="h-8 w-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-1">{title}</h3>
            <p className="text-sm text-slate-500 max-w-sm leading-relaxed">
                {description}
            </p>
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-50/50">
            <RightSidebar />
            
            {/* Main Content Layout */}
            <div className="p-6 lg:pr-[20%] max-w-7xl mx-auto space-y-8">
                
                {/* Header */}
                <div className="space-y-1 animate-fade-in">
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                        Manage Appointments
                    </h1>
                    <p className="text-slate-500">
                        View, schedule, and manage patient appointment requests here.
                    </p>
                </div>

                {/* Search and Filter Section */}
                <div className="flex flex-col sm:flex-row gap-3 animate-fade-in">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input
                            placeholder="Search by patient name or date..."
                            className="pl-10 bg-white border-slate-200 shadow-sm focus-visible:ring-primary/20 h-10"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <Button variant="outline" className="bg-white border-slate-200 text-slate-700 shadow-sm gap-2 h-10 px-5 hover:bg-slate-50">
                        <Filter className="h-3.5 w-3.5" />
                        Filter
                    </Button>
                </div>
            {/* --- END HEADER --- */}

                {/* Tabs & Content */}
                {isLoading ? (
                    <div className="w-full h-64 bg-white rounded-lg border border-slate-200 flex items-center justify-center">
                        <div className="animate-pulse flex flex-col items-center gap-2">
                            <div className="h-8 w-8 bg-slate-200 rounded-full"></div>
                            <span className="text-slate-400 text-sm">Loading data...</span>
                        </div>
                    </div>
                ) : (
                    <Tabs defaultValue="pending" className="space-y-6 animate-slide-in">
                        {/* Custom Tab Styling to match Image 2 */}
                        <TabsList className="bg-transparent p-0 gap-2 h-auto flex-wrap justify-start w-full border-b border-slate-200 rounded-none pb-px">
                            <TabsTrigger 
                                value="pending" 
                                className="gap-2 px-4 py-2 data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none border-b-2 border-transparent transition-all"
                            >
                                <Clock className="h-4 w-4" /> Pending
                            </TabsTrigger>
                            <TabsTrigger 
                                value="upcoming" 
                                className="gap-2 px-4 py-2 data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none border-b-2 border-transparent transition-all"
                            >
                                <CalendarRange className="h-4 w-4" /> Upcoming
                            </TabsTrigger>
                            <TabsTrigger 
                                value="past" 
                                className="gap-2 px-4 py-2 data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none border-b-2 border-transparent transition-all"
                            >
                                <History className="h-4 w-4" /> Past
                            </TabsTrigger>
                        </TabsList>

                        {/* 1. Pending Requests Tab */}
                        <TabsContent value="pending" className="mt-4 space-y-4">
                            {pendingAppointments.length > 0 ? (
                                <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-2">
                                    {pendingAppointments.map(app => (
                                        <Card key={app.id} className="bg-white border-slate-200 shadow-sm hover:shadow-md transition-all duration-200">
                                            <CardContent className="p-5 flex items-start justify-between gap-4">
                                                <div className="flex gap-4">
                                                    <div className="h-12 w-12 rounded-full bg-amber-50 border border-amber-100 flex items-center justify-center shrink-0 text-amber-600">
                                                        <User className="h-6 w-6" />
                                                    </div>
                                                    <div>
                                                        <h4 className="font-semibold text-slate-900 text-lg">{app.patient.profile?.full_name || "Unknown"}</h4>
                                                        <div className="flex flex-col gap-1 mt-1">
                                                            <span className="flex items-center gap-2 text-sm text-slate-500"><Calendar className="w-3.5 h-3.5"/> {app.date}</span>
                                                            <span className="flex items-center gap-2 text-sm text-slate-500"><Clock className="w-3.5 h-3.5"/> {app.time}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex flex-col gap-2 shrink-0">
                                                    <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white w-24 shadow-sm" onClick={() => handleUpdateStatus(app.id, 'scheduled')} disabled={mutation.isPending}>
                                                        Accept
                                                    </Button>
                                                    <Button size="sm" variant="outline" className="text-slate-600 border-slate-200 hover:bg-red-50 hover:text-red-600 w-24" onClick={() => handleUpdateStatus(app.id, 'cancelled')} disabled={mutation.isPending}>
                                                        Decline
                                                    </Button>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            ) : (
                                <EmptyState 
                                    title="No pending requests" 
                                    description="You don't have any pending appointment requests at the moment." 
                                />
                            )}
                        </TabsContent>

                        {/* 2. Upcoming Appointments Tab */}
                        <TabsContent value="upcoming" className="mt-4 space-y-4">
                            {scheduledAppointments.length > 0 ? (
                                <div className="grid gap-4">
                                    {scheduledAppointments.map((appointment) => (
                                        <Card key={appointment.id} className="bg-white border-slate-200 shadow-sm hover:shadow-md transition-all">
                                            <CardContent className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                                <div className="flex items-center gap-4">
                                                    <div className="h-12 w-12 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0 text-blue-600">
                                                        <User className="h-6 w-6" />
                                                    </div>
                                                    <div>
                                                        <h4 className="font-semibold text-slate-900 text-lg">{appointment.patient.profile?.full_name}</h4>
                                                        <div className="flex items-center gap-3 mt-1">
                                                            <Badge variant="secondary" className="bg-slate-100 text-slate-600 font-normal gap-1.5 border border-slate-200">
                                                                <Calendar className="w-3 h-3"/> {appointment.date}
                                                            </Badge>
                                                            <Badge variant="secondary" className="bg-slate-100 text-slate-600 font-normal gap-1.5 border border-slate-200">
                                                                <Clock className="w-3 h-3"/> {appointment.time}
                                                            </Badge>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3 w-full sm:w-auto">
                                                    <Button className="bg-primary hover:bg-primary/90 text-white flex-1 sm:flex-none shadow-sm" onClick={() => handleUpdateStatus(appointment.id, 'completed')} disabled={mutation.isPending}>
                                                        <CheckCircle className="w-4 h-4 mr-2"/> Complete
                                                    </Button>
                                                    <Button variant="outline" className="text-slate-500 border-slate-200 hover:bg-slate-50" onClick={() => handleUpdateStatus(appointment.id, 'cancelled')} disabled={mutation.isPending}>
                                                        Cancel
                                                    </Button>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            ) : (
                                <EmptyState 
                                    title="No upcoming appointments" 
                                    description="No upcoming appointments scheduled in your calendar." 
                                />
                            )}
                        </TabsContent>

                        {/* 3. Past Appointments Tab */}
                        <TabsContent value="past" className="mt-4 space-y-3">
                            {pastAppointments.length > 0 ? (
                                <div className="space-y-3">
                                    {pastAppointments.map((appointment) => (
                                        <Card key={appointment.id} className="bg-slate-50 border-slate-200 hover:bg-white transition-colors">
                                            <CardContent className="p-4 flex items-center justify-between">
                                                <div className="flex items-center gap-4">
                                                    <div className="h-10 w-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-400 shrink-0">
                                                        <User className="w-5 h-5" />
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-slate-700">{appointment.patient.profile?.full_name}</p>
                                                        <div className="flex items-center gap-3 text-xs text-slate-500 mt-0.5">
                                                            <span className="flex items-center gap-1"><Calendar className="w-3 h-3"/>{appointment.date}</span>
                                                            <span className="flex items-center gap-1"><Clock className="w-3 h-3"/>{appointment.time}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <Badge variant="outline" className={`${getStatusColor(appointment.status)} font-medium capitalize`}>
                                                        {appointment.status}
                                                    </Badge>
                                                    <AlertDialog>
                                                        <AlertDialogTrigger asChild>
                                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-red-600 hover:bg-red-50" disabled={deleteMutation.isPending}>
                                                                <Trash2 className="w-4 h-4"/>
                                                            </Button>
                                                        </AlertDialogTrigger>
                                                        <AlertDialogContent>
                                                            <AlertDialogHeader>
                                                                <AlertDialogTitle>Delete Record</AlertDialogTitle>
                                                                <AlertDialogDescription>
                                                                    Are you sure you want to delete this history record?
                                                                </AlertDialogDescription>
                                                            </AlertDialogHeader>
                                                            <AlertDialogFooter>
                                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                                <AlertDialogAction onClick={() => deleteMutation.mutate(appointment.id)} className="bg-red-600 hover:bg-red-700">
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
                                <EmptyState 
                                    title="No past records" 
                                    description="No past appointment history found." 
                                    icon={History}
                                />
                            )}
                        </TabsContent>
                </Tabs>
            )}
            </div>
        </div>
    );
};

export default Appointments;