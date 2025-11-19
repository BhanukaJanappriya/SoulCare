// src/pages/Patient/PatientPrescriptions.tsx
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { getPrescriptionsAPI } from '@/api'; // Use the same API function
import { PrescriptionData } from '@/types'; // Import the type
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { format } from 'date-fns';
import { FileText, Loader2 } from 'lucide-react'; // <-- Import icons

const PatientPrescriptions: React.FC = () => {
    // Fetching prescriptions data - backend filters by logged-in patient
    const { data: prescriptions = [], isLoading, error } = useQuery<PrescriptionData[]>({
        queryKey: ['prescriptions'], // Can use the same key, data is user-specific
        queryFn: getPrescriptionsAPI,
        staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    });

    if (isLoading) {
        return (
          <div className="flex justify-center items-center py-10">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        );
    }

    if (error) {
        return (
             <div className="p-6">
                 <Alert variant="destructive">
                     <AlertTitle>Error Loading Prescriptions</AlertTitle>
                     <AlertDescription>{(error as Error).message || "Could not load data."}</AlertDescription>
                 </Alert>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
            
            {/* --- STYLED HEADER --- */}
            <Card className="shadow-sm bg-card">
              <CardHeader>
                <div className="flex items-center gap-4">
                  <FileText className="h-8 w-8 text-primary" />
                  <div>
                    <CardTitle className="text-2xl font-bold">My Prescriptions</CardTitle>
                    <CardDescription className="mt-1">
                      View all prescriptions issued to you by your doctors.
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>
            {/* --- END STYLED HEADER --- */}

            {prescriptions.length === 0 ? (
                <Card className="mt-6 bg-card border border-dashed">
                  <CardContent className="text-center py-12">
                    <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-foreground mb-1">
                      No Prescriptions Found
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      You do not have any prescriptions yet.
                    </p>
                  </CardContent>
                </Card>
            ) : (
                prescriptions.map((presc) => (
                    <Card key={presc.id} className="shadow-sm">
                        <CardHeader>
                            {/* --- UPDATED TITLE AND DESCRIPTION --- */}
                            <CardTitle className="text-lg">
                              Prescription from {presc.doctor.full_name || presc.doctor.username}
                            </CardTitle>
                            <CardDescription>
                                Issued on: {format(new Date(presc.date_issued), 'PPP')}
                                {' | '}Doctor NIC: {presc.doctor.nic || 'N/A'}
                                {' | '}Ref: #{presc.id}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <h4 className="font-semibold mb-1 text-sm text-muted-foreground">Diagnosis:</h4>
                                <p className="text-foreground">{presc.diagnosis}</p>
                            </div>
                            {presc.notes && (
                                <div>
                                    <h4 className="font-semibold mb-1 text-sm text-muted-foreground">Doctor's Notes:</h4>
                                    <p className="text-foreground">{presc.notes}</p>
                                </div>
                            )}
                            <div>
                               <h4 className="font-semibold mb-2 text-sm text-muted-foreground">Medications:</h4>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Name</TableHead>
                                            <TableHead>Dosage</TableHead>
                                            <TableHead>Frequency</TableHead>
                                            <TableHead>Instructions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {presc.medications.map((med, index) => (
                                            <TableRow key={`${presc.id}-med-${index}`}>
                                                <TableCell className="font-medium">{med.name}</TableCell>
                                                <TableCell>{med.dosage}</TableCell>
                                                <TableCell>{med.frequency}</TableCell>
                                                <TableCell>{med.instructions || '--'}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                             </div>
                        </CardContent>
                    </Card>
                ))
            )}
        </div>
    );
};

export default PatientPrescriptions;