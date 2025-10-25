// src/pages/PatientDetailPage.tsx
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
// --- ADD NEW API FUNCTIONS ---
import { 
    getPatientDetailsAPI, 
    getPatientAppointments, 
    getPatientPrescriptions 
} from '@/api';
// --- ADD Appointment and PrescriptionData TYPES ---
import { 
    PatientDetailData, 
    Appointment, 
    PrescriptionData 
} from '@/types';
import { 
    Loader2, AlertTriangle, ArrowLeft, Mail, Phone, Calendar as CalendarIcon, 
    MapPin, Stethoscope, FileText, User, ClipboardX, Clock 
} from 'lucide-react'; // Added more icons
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { format, differenceInYears, parseISO } from 'date-fns'; // Added parseISO
import { useToast } from "@/hooks/use-toast";
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"; // Import Table components

// --- (Helper components for the lists, you can move these to a separate file if you prefer) ---

// --- NEW: Recent Appointments List Component ---
const RecentAppointmentsList: React.FC<{ patientId: string | number }> = ({ patientId }) => {
    const { data: appointments, isLoading, isError, error } = useQuery<Appointment[]>({
        queryKey: ['patientAppointments', patientId],
        queryFn: () => getPatientAppointments(patientId),
        staleTime: 5 * 60 * 1000,
    });

    if (isLoading) {
        return <div className="flex items-center text-muted-foreground text-sm"><Loader2 className="w-4 h-4 mr-2 animate-spin" />Loading...</div>;
    }
    if (isError) {
        return <p className="text-destructive text-sm">{(error as Error).message || "Could not load appointments."}</p>;
    }
    if (!appointments || appointments.length === 0) {
        return <p className="text-muted-foreground text-sm">No appointments found for this patient.</p>;
    }

    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead>Status</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {/* Show 3 most recent appointments */}
                {appointments.slice(0, 3).map(app => (
                    <TableRow key={app.id}>
                        <TableCell>{format(parseISO(app.date), 'PPP')}</TableCell>
                        <TableCell>{format(parseISO(`1970-01-01T${app.time}`), 'p')}</TableCell> {/* Format time */}
                        <TableCell>
                            <Badge variant={app.status === 'completed' ? 'default' : (app.status === 'scheduled' ? 'outline' : 'secondary')}>
                                {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                            </Badge>
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
};

// --- NEW: Patient Prescriptions List Component ---
const PatientPrescriptionsList: React.FC<{ patientId: string | number }> = ({ patientId }) => {
    const { data: prescriptions, isLoading, isError, error } = useQuery<PrescriptionData[]>({
        queryKey: ['patientPrescriptions', patientId],
        queryFn: () => getPatientPrescriptions(patientId),
        staleTime: 5 * 60 * 1000,
    });

    if (isLoading) {
        return <div className="flex items-center text-muted-foreground text-sm"><Loader2 className="w-4 h-4 mr-2 animate-spin" />Loading...</div>;
    }
    if (isError) {
        return <p className="text-destructive text-sm">{(error as Error).message || "Could not load prescriptions."}</p>;
    }
    if (!prescriptions || prescriptions.length === 0) {
        return <p className="text-muted-foreground text-sm">No prescriptions found for this patient.</p>;
    }

    // Just show the latest prescription's summary for this card
    const latestPrescription = prescriptions[0];

    return (
         <div className="space-y-3">
            <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                    Latest: {format(parseISO(latestPrescription.date_issued), 'PPP')}
                </span>
                <Badge>{latestPrescription.medications.length} medication(s)</Badge>
            </div>
            <p className="text-sm font-medium">Diagnosis: {latestPrescription.diagnosis}</p>
             <ul className="list-disc pl-5 text-sm text-muted-foreground">
                {latestPrescription.medications.slice(0, 2).map((med, index) => (
                    <li key={index}>{med.name} ({med.dosage})</li>
                ))}
                {latestPrescription.medications.length > 2 && (
                    <li className="italic">...and {latestPrescription.medications.length - 2} more.</li>
                )}
            </ul>
        </div>
    );
};
// --- (End of helper components) ---


const PatientDetailPage: React.FC = () => {
    const { patientId } = useParams<{ patientId: string }>();
    const navigate = useNavigate();
    const { toast } = useToast();

    // Fetch main patient details
    const { data: patient, isLoading, error: fetchError, isError } = useQuery<PatientDetailData>({
        queryKey: ['patientDetails', patientId],
        queryFn: () => getPatientDetailsAPI(patientId!),
        enabled: !!patientId,
        staleTime: 5 * 60 * 1000,
    });

    const goBack = () => navigate(-1);

    // --- Loading State ---
    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-[calc(100vh-4rem)] pr-[5.5rem]"> {/* Added padding */}
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
        );
    }

    // --- Error State ---
    if (isError || !patient) {
        return (
            <div className="p-6 pr-[5.5rem]"> {/* Added padding */}
                 <Button variant="outline" size="sm" onClick={goBack} className="mb-6">
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back to Patients
                </Button>
                <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Error Loading Patient Data</AlertTitle>
                    <AlertDescription>
                        {(fetchError as Error)?.message || "Could not load details for this patient, or you may not have permission."}
                    </AlertDescription>
                </Alert>
            </div>
        );
    }

    // --- Data Available - Render Details ---
    const profile = patient.patientprofile;
    const age = profile?.dob ? differenceInYears(parseISO(profile.dob), new Date()) : 'N/A'; // Use parseISO

    return (
        // Added right padding to account for sidebar
        <div className="p-6 space-y-6 pb-10 pr-[5.5rem]"> 
            <Button variant="outline" size="sm" onClick={goBack} className="mb-0">
               <ArrowLeft className="mr-2 h-4 w-4" /> Back to Patients List
            </Button>

            {/* Patient Header Card */}
            <Card className="shadow-md overflow-hidden">
                <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-6 p-6 bg-card">
                    <Avatar className="h-20 w-20 border-2 border-primary">
                        <AvatarFallback className="text-3xl bg-primary/10 text-primary">
                            {profile?.full_name ? profile.full_name.charAt(0).toUpperCase() : patient.username.charAt(0).toUpperCase()}
                        </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                        <CardTitle className="text-2xl font-bold truncate">{profile?.full_name || patient.username}</CardTitle>
                        <CardDescription className="text-sm text-muted-foreground mt-1">
                            @{patient.username} | Age: {age} | Joined: {format(parseISO(patient.date_joined), 'PPP')}
                        </CardDescription>
                         <div className="mt-2 flex items-center space-x-2">
                             <Badge variant={patient.is_active ? "default" : "secondary"} className={`text-xs ${patient.is_active ? 'bg-green-100 text-green-700 border-green-200' : 'bg-gray-100 text-gray-500 border-gray-200'}`}>
                                {patient.is_active ? 'Active' : 'Inactive'}
                             </Badge>
                         </div>
                    </div>
                     <div className="flex flex-col sm:flex-row gap-2 mt-4 sm:mt-0">
                        <Button size="sm"><Mail className="mr-2 h-4 w-4" /> Message (TBD)</Button>
                     </div>
                </CardHeader>
            </Card>

            {/* Detailed Info Grid */}
             <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Contact & Personal Info */}
                <Card className="lg:col-span-1 shadow-sm">
                    <CardHeader><CardTitle className="text-lg">Contact & Personal Info</CardTitle></CardHeader>
                    <CardContent className="space-y-3 text-sm">
                        <div className="flex items-start">
                            <Mail className="w-4 h-4 mr-3 mt-1 flex-shrink-0 text-muted-foreground" />
                            <div><span className="font-medium">Email:</span> {patient.email}</div>
                        </div>
                        <div className="flex items-start">
                            <Phone className="w-4 h-4 mr-3 mt-1 flex-shrink-0 text-muted-foreground" />
                            <div><span className="font-medium">Phone:</span> {profile?.contact_number || 'N/A'}</div>
                        </div>
                         <div className="flex items-start">
                             <CalendarIcon className="w-4 h-4 mr-3 mt-1 flex-shrink-0 text-muted-foreground" />
                             <div><span className="font-medium">DOB:</span> {profile?.dob ? format(parseISO(profile.dob), 'PPP') : 'N/A'} (Age: {age})</div>
                         </div>
                        <div className="flex items-start">
                            <MapPin className="w-4 h-4 mr-3 mt-1 flex-shrink-0 text-muted-foreground" />
                            <div><span className="font-medium">Address:</span> {profile?.address || 'N/A'}</div>
                        </div>
                         <div className="flex items-start">
                             <FileText className="w-4 h-4 mr-3 mt-1 flex-shrink-0 text-muted-foreground" />
                             <div><span className="font-medium">NIC:</span> {profile?.nic || 'N/A'}</div>
                         </div>
                    </CardContent>
                </Card>

                {/* Health Information */}
                <Card className="lg:col-span-2 shadow-sm">
                    <CardHeader><CardTitle className="text-lg">Health Information</CardTitle></CardHeader>
                    <CardContent className="space-y-3 text-sm">
                        <div>
                             <h4 className="font-medium mb-1 flex items-center"><Stethoscope className="w-4 h-4 mr-2 text-primary" />Reported Health Issues / Notes:</h4>
                            <p className="text-muted-foreground ml-6 whitespace-pre-wrap">{profile?.health_issues || 'None reported.'}</p>
                         </div>
                    </CardContent>
                </Card>
            </div>


            {/* --- UPDATED Sections for Appointments and Prescriptions --- */}
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-lg font-medium">Recent Appointments</CardTitle>
                        <Clock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        {/* Render the new component */}
                        <RecentAppointmentsList patientId={patient.id} />
                        <Button variant="outline" size="sm" className="mt-4" onClick={() => toast({ title: "Action", description: "Navigate to schedule" })}>
                            Schedule New
                        </Button>
                    </CardContent>
                </Card>
                 <Card className="shadow-sm">
                     <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-lg font-medium">Prescriptions</CardTitle>
                        <ClipboardX className="h-4 w-4 text-muted-foreground" />
                     </CardHeader>
                     <CardContent>
                        {/* Render the new component */}
                        <PatientPrescriptionsList patientId={patient.id} />
                        <Button variant="outline" size="sm" className="mt-4" onClick={() => navigate('/prescriptions')}>
                            Write New Prescription
                        </Button>
                     </CardContent>
                 </Card>
            </div>

             <Card className="shadow-sm">
                 <CardHeader className="flex flex-row items-center justify-between">
                     <CardTitle className="text-lg">Progress Notes</CardTitle>
                     <Button variant="outline" size="sm" onClick={() => toast({ title: "Action", description: "Open add note modal" })}>Add Note</Button>
                 </CardHeader>
                 <CardContent>
                    {/* TODO: Fetch and display progress notes */}
                    <p className="text-muted-foreground">Progress notes feature coming soon.</p>
                 </CardContent>
             </Card>

        </div>
    );
};

export default PatientDetailPage;