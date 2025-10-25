// src/pages/Prescriptions.tsx
import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
// Import API functions
import { getPrescriptionsAPI, createPrescriptionAPI, getDoctorPatients } from '@/api';
// Import types
import { PrescriptionData, MedicationData, PatientOption, PrescriptionFormData, PrescriptionInput } from '@/types'; // Use refined types
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PlusCircle, XCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { RightSidebar } from "@/components/layout/RightSidebar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"; // Import Alert

// --- Main Page Component ---
const PrescriptionsPage: React.FC = () => {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    // Fetching prescriptions
    const { data: prescriptions = [], isLoading, error: fetchError } = useQuery<PrescriptionData[]>({
        queryKey: ['prescriptions'], // Query key for doctor's prescriptions
        queryFn: getPrescriptionsAPI, // Use function from api.ts
    });

    // Mutation for creating prescriptions
    const mutation = useMutation({
        mutationFn: (newPrescription: PrescriptionInput) => createPrescriptionAPI(newPrescription),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['prescriptions'] });
            toast({ title: "Success", description: "Prescription created successfully." });
            setIsDialogOpen(false); // Close dialog on success
        },
        onError: (error: any) => {
            toast({
                variant: "destructive",
                title: "Error Creating Prescription",
                description: error.response?.data?.detail || error.message || "Failed to create prescription."
            });
        }
    });

    // Handle form submission: Convert form data structure to API input structure
    const handleFormSubmit = (formData: PrescriptionFormData) => {
        // Validate patient ID selection
        const patientId = parseInt(formData.patient, 10);
        if (isNaN(patientId)) {
             toast({ variant: "destructive", title: "Validation Error", description: "Please select a patient." });
             return;
        }

        const apiData: PrescriptionInput = {
            ...formData,
            patient_id: patientId, // Convert patient ID string to number
        };
        mutation.mutate(apiData); // Trigger the mutation
    };

    return (
        
        <div className="pr-16 ">
           <RightSidebar />
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Manage Prescriptions</h1>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button> <PlusCircle className="mr-2 h-4 w-4" /> Create New Prescription</Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-2xl">
                        <DialogHeader>
                            <DialogTitle>New Prescription</DialogTitle>
                        </DialogHeader>
                        {/* Render Form, pass submit handler and loading state */}
                        <PrescriptionForm onSubmit={handleFormSubmit} isLoading={mutation.isPending} />
                    </DialogContent>
                </Dialog>
            </div>

            {/* Loading State */}
            {isLoading && <p>Loading prescriptions...</p>}

            {/* Error State */}
            {fetchError && (
                 <Alert variant="destructive" className="mb-4">
                   <AlertTitle>Error Loading Prescriptions</AlertTitle>
                   <AlertDescription>{(fetchError as Error).message || "Could not load data."}</AlertDescription>
                </Alert>
            )}

            {/* Empty State */}
            {!isLoading && !fetchError && prescriptions.length === 0 && (
                <p>No prescriptions have been issued yet.</p>
            )}

            {/* Prescriptions List */}
            {!isLoading && !fetchError && prescriptions.length > 0 && (
                <div className="space-y-6">
                    {prescriptions.map(p => (
                        <Card key={p.id} className="shadow-md">
                            <CardHeader>
                                <CardTitle>Prescription #{p.id}</CardTitle>
                                <CardDescription>
                                    Issued on: {format(new Date(p.date_issued), 'PPP')} {/* Nicer date format */}
                                    {' | '}Patient: {p.patient.full_name} (NIC: {p.patient.nic}) {/* Display name */}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <h4 className="font-semibold mb-1 text-sm text-gray-600">Diagnosis:</h4>
                                    <p className="text-gray-800">{p.diagnosis}</p>
                                </div>
                                {p.notes && (
                                     <div>
                                        <h4 className="font-semibold mb-1 text-sm text-gray-600">Notes:</h4>
                                        <p className="text-gray-800">{p.notes}</p>
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
                                            {p.medications.map((med, index) => (
                                                <TableRow key={`${p.id}-med-${index}`}> {/* More specific key */}
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
                    ))}
                </div>
            )}
        </div>
    );
};

// --- Prescription Form Component (Still within the same file) ---
const PrescriptionForm: React.FC<{ onSubmit: (data: PrescriptionFormData) => void; isLoading: boolean }> = ({ onSubmit, isLoading }) => {
    const { toast } = useToast();

    // --- State for Patient Dropdown ---
    const { data: patients = [], isLoading: isLoadingPatients, error: patientsError } = useQuery<PatientOption[]>({
        queryKey: ['doctorPatients'], // Unique query key for doctor's patients
        queryFn: getDoctorPatients, // Use API function
        staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    });

    // --- State for Form Fields ---
    const [selectedPatientId, setSelectedPatientId] = useState<string>('');
    const [diagnosis, setDiagnosis] = useState('');
    const [notes, setNotes] = useState('');
    const [medications, setMedications] = useState<Omit<MedicationData, 'id'>[]>([{ name: '', dosage: '', frequency: '', instructions: '' }]);

    // --- Medication Handlers ---
     const handleMedicationChange = (index: number, field: keyof Omit<MedicationData, 'id'>, value: string) => {
        const newMeds = [...medications];
        (newMeds[index] as any)[field] = value;
        setMedications(newMeds);
    };
    const addMedication = () => setMedications([...medications, { name: '', dosage: '', frequency: '', instructions: '' }]);
    const removeMedication = (index: number) => setMedications(medications.filter((_, i) => i !== index));

    // --- Form Submission ---
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Basic Client-Side Validation (consider adding more robust validation)
        if (!selectedPatientId) {
             toast({ variant: "destructive", title: "Error", description: "Please select a patient." });
             return;
        }
        if (!diagnosis.trim()) {
            toast({ variant: "destructive", title: "Error", description: "Diagnosis cannot be empty." });
             return;
        }
        if (medications.length === 0 || medications.some(m => !m.name.trim() || !m.dosage.trim() || !m.frequency.trim())) {
             toast({ variant: "destructive", title: "Error", description: "Please ensure all medications have a name, dosage, and frequency." });
             return;
        }
        onSubmit({ patient: selectedPatientId, diagnosis, notes, medications });
    };

     // Display error if patients fail to load
     if (patientsError) {
        return <p className="text-red-500">Error loading patient list.</p>;
     }

    return (
        <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-2"> {/* Added scroll */}
            {/* Patient Selection */}
            <div>
                <Label htmlFor="patientId">Patient *</Label>
                <Select
                    value={selectedPatientId}
                    onValueChange={setSelectedPatientId}
                    disabled={isLoadingPatients || isLoading}
                >
                    <SelectTrigger id="patientId">
                        <SelectValue placeholder={isLoadingPatients ? "Loading patients..." : "Select a patient"} />
                    </SelectTrigger>
                    <SelectContent>
                        {patients.map((p) => (
                            <SelectItem key={p.id} value={String(p.id)}>
                                {p.full_name || p.username} (NIC: {p.nic})
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* Diagnosis */}
            <div>
                <Label htmlFor="diagnosis">Diagnosis *</Label>
                <Textarea id="diagnosis" value={diagnosis} onChange={(e) => setDiagnosis(e.target.value)} disabled={isLoading} required />
            </div>

            {/* Medications Section */}
            <h3 className="font-semibold pt-4">Medications *</h3>
            {medications.map((med, index) => (
                <Card key={index} className="border p-4 pt-8 rounded-md space-y-3 relative shadow-sm">
                    {medications.length > 1 && (
                         <Button type="button" variant="ghost" size="icon" className="absolute top-1 right-1 h-6 w-6 text-red-500 hover:text-red-700" onClick={() => removeMedication(index)}>
                            <XCircle className="h-4 w-4" />
                            <span className="sr-only">Remove Medication</span>
                         </Button>
                    )}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                         <div>
                            <Label htmlFor={`med-name-${index}`}>Name *</Label>
                            <Input id={`med-name-${index}`} placeholder="Medication Name" value={med.name} onChange={e => handleMedicationChange(index, 'name', e.target.value)} disabled={isLoading} required />
                        </div>
                         <div>
                            <Label htmlFor={`med-dosage-${index}`}>Dosage *</Label>
                            <Input id={`med-dosage-${index}`} placeholder="e.g., 500mg" value={med.dosage} onChange={e => handleMedicationChange(index, 'dosage', e.target.value)} disabled={isLoading} required />
                        </div>
                         <div>
                            <Label htmlFor={`med-freq-${index}`}>Frequency *</Label>
                            <Input id={`med-freq-${index}`} placeholder="e.g., Twice a day" value={med.frequency} onChange={e => handleMedicationChange(index, 'frequency', e.target.value)} disabled={isLoading} required />
                        </div>
                         <div>
                            <Label htmlFor={`med-instr-${index}`}>Instructions</Label>
                            <Input id={`med-instr-${index}`} placeholder="e.g., Take with food" value={med.instructions || ''} onChange={e => handleMedicationChange(index, 'instructions', e.target.value)} disabled={isLoading} />
                        </div>
                    </div>
                </Card>
            ))}
            <Button type="button" variant="outline" onClick={addMedication} className="w-full" disabled={isLoading}>
                <PlusCircle className="w-4 h-4 mr-2" /> Add Medication
            </Button>

            {/* Additional Notes */}
            <div className="pt-4">
                <Label htmlFor="notes">Additional Notes</Label>
                <Textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} disabled={isLoading} />
            </div>

            {/* Submit Button */}
            <Button type="submit" className="w-full mt-4" disabled={isLoading}>
                {isLoading ? 'Saving...' : 'Save Prescription'}
            </Button>
        </form>
    );
};

export default PrescriptionsPage; // Ensure default export name matches filename convention