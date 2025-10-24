// src/pages/Patient/PatientPrescriptions.tsx
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { getPrescriptionsAPI } from '@/api'; // Use the same API function
import { PrescriptionData } from '@/types'; // Import the type
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { format } from 'date-fns'; // For date formatting

const PatientPrescriptions: React.FC = () => {
    // Fetching prescriptions data - backend filters by logged-in patient
    const { data: prescriptions = [], isLoading, error } = useQuery<PrescriptionData[]>({
        queryKey: ['prescriptions'], // Can use the same key, data is user-specific
        queryFn: getPrescriptionsAPI,
        staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    });

    if (isLoading) {
        return <div className="p-6">Loading your prescriptions...</div>; // Add padding
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
        <div className="p-6 space-y-6"> {/* Added padding and spacing */}
            <h1 className="text-3xl font-bold">My Prescriptions</h1>
            {prescriptions.length === 0 ? (
                <p>You do not have any prescriptions yet.</p>
            ) : (
                prescriptions.map((presc) => (
                    <Card key={presc.id} className="shadow-md">
                        <CardHeader>
                            <CardTitle>Prescription from Dr. {presc.doctor.full_name || presc.doctor.username}</CardTitle>
                            <CardDescription>
                                Issued on: {format(new Date(presc.date_issued), 'PPP')}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <h4 className="font-semibold mb-1 text-sm text-gray-600">Diagnosis:</h4>
                                <p className="text-gray-800">{presc.diagnosis}</p>
                            </div>
                            {presc.notes && (
                                <div>
                                    <h4 className="font-semibold mb-1 text-sm text-gray-600">Doctor's Notes:</h4>
                                    <p className="text-gray-800">{presc.notes}</p>
                                </div>
                            )}
                            <div>
                               <h4 className="font-semibold mb-2 text-sm text-gray-600">Medications:</h4>
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