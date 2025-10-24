// src/pages/PatientDetailPage.tsx
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom'; // Added useNavigate
import { useQuery } from '@tanstack/react-query';
import { getPatientDetailsAPI } from '@/api'; // Use the specific API function
import { PatientDetailData } from '@/types'; // Use the detailed type
import { Loader2, AlertTriangle, ArrowLeft, Mail, Phone, Calendar as CalendarIcon, MapPin, Stethoscope, FileText, User } from 'lucide-react'; // Added more icons
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { format, differenceInYears } from 'date-fns'; // Added differenceInYears
import { useToast } from "@/hooks/use-toast";

const PatientDetailPage: React.FC = () => {
    const { patientId } = useParams<{ patientId: string }>();
    const navigate = useNavigate();
    const { toast } = useToast();

    // Fetch patient details
    const { data: patient, isLoading, error: fetchError, isError } = useQuery<PatientDetailData>({
        queryKey: ['patientDetails', patientId],
        queryFn: () => getPatientDetailsAPI(patientId!),
        enabled: !!patientId,
        staleTime: 5 * 60 * 1000,
    });

    const goBack = () => navigate(-1); // Function to go back to the previous page

    // --- Loading State ---
    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-[calc(100vh-4rem)]"> {/* Adjust height calculation based on your layout */}
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
        );
    }

    // --- Error State ---
    if (isError || !patient) {
        return (
            <div className="p-6">
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
    const age = profile?.dob ? differenceInYears(new Date(), new Date(profile.dob)) : 'N/A';

    return (
        <div className="p-6 space-y-6 pb-10"> {/* Added bottom padding */}
            <Button variant="outline" size="sm" onClick={goBack} className="mb-0"> {/* Reduced margin */}
               <ArrowLeft className="mr-2 h-4 w-4" /> Back to Patients List
            </Button>

            {/* Patient Header Card */}
            <Card className="shadow-md overflow-hidden">
                <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-6 p-6 bg-card">
                    <Avatar className="h-20 w-20 border-2 border-primary">
                        {/* <AvatarImage src={profile?.profile_picture_url} alt={patient.username} /> */}
                        <AvatarFallback className="text-3xl bg-primary/10 text-primary">
                            {profile?.full_name ? profile.full_name.charAt(0).toUpperCase() : patient.username.charAt(0).toUpperCase()}
                        </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0"> {/* Added min-w-0 */}
                        <CardTitle className="text-2xl font-bold truncate">{profile?.full_name || patient.username}</CardTitle>
                        <CardDescription className="text-sm text-muted-foreground mt-1">
                            @{patient.username} | Age: {age} | Joined: {format(new Date(patient.date_joined), 'PPP')}
                        </CardDescription>
                         <div className="mt-2 flex items-center space-x-2">
                             <Badge variant={patient.is_active ? "default" : "secondary"} className={`text-xs ${patient.is_active ? 'bg-green-100 text-green-700 border-green-200' : 'bg-gray-100 text-gray-500 border-gray-200'}`}>
                                {patient.is_active ? 'Active' : 'Inactive'}
                             </Badge>
                              {/* Placeholder for Risk Badge - Add when data available */}
                             {/* <Badge className="text-xs bg-yellow-100 text-yellow-700 border-yellow-200">Medium Risk</Badge> */}
                         </div>
                    </div>
                     {/* Action Buttons - Example */}
                     <div className="flex flex-col sm:flex-row gap-2 mt-4 sm:mt-0">
                        <Button size="sm" variant="outline"><Phone className="mr-2 h-4 w-4" /> Call (TBD)</Button>
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
                             <div><span className="font-medium">DOB:</span> {profile?.dob ? format(new Date(profile.dob), 'PPP') : 'N/A'} (Age: {age})</div>
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
                          {/* Placeholder for Condition */}
                         {/* <div><span className="font-medium">Primary Condition:</span> (Condition Placeholder)</div> */}
                         {/* Placeholder for Risk Factors */}
                         {/* <div><span className="font-medium">Risk Level:</span> (Risk Placeholder)</div> */}
                    </CardContent>
                </Card>
            </div>


            {/* Placeholder Sections for Appointments, Prescriptions, Notes */}
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="shadow-sm">
                    <CardHeader><CardTitle className="text-lg">Recent Appointments</CardTitle></CardHeader>
                    <CardContent>
                        {/* TODO: Fetch and list appointments */}
                        <p className="text-muted-foreground">Appointment list feature coming soon.</p>
                        <Button variant="outline" size="sm" className="mt-3" onClick={() => toast({ title: "Action", description: "Navigate to schedule" })}>Schedule New</Button>
                    </CardContent>
                </Card>
                 <Card className="shadow-sm">
                     <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="text-lg">Prescriptions</CardTitle>
                        <Button variant="outline" size="sm" onClick={() => toast({ title: "Action", description: "Open new prescription modal/page" })}>Write New</Button>
                     </CardHeader>
                     <CardContent>
                        {/* TODO: Fetch and list prescriptions for this patient */}
                        <p className="text-muted-foreground">Prescription list feature coming soon.</p>
                        {/* <PrescriptionList patientId={patient.id} />  <-- Example: Pass patientId to a reusable component */}
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