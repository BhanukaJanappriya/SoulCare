// src/pages/Prescriptions.tsx
import React, { useState } from 'react'; // Removed useEffect, not needed
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
// --- Import deletePrescriptionAPI ---
import {
  getPrescriptionsAPI,
  createPrescriptionAPI,
  getDoctorPatients,
  deletePrescriptionAPI, // <-- ADD THIS
} from '@/api';
// Import types
import { PrescriptionData, MedicationData, PatientOption, PrescriptionFormData, PrescriptionInput } from '@/types';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// --- Import icons for delete button ---
import { PlusCircle, XCircle, Trash2, Loader2, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { RightSidebar } from "@/components/layout/RightSidebar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
// --- Import AlertDialog for delete confirmation ---
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

// --- Main Page Component ---
const PrescriptionsPage: React.FC = () => {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    
    // --- State for the delete confirmation dialog ---
    const [itemToDelete, setItemToDelete] = useState<PrescriptionData | null>(null);

    // Fetching prescriptions
    const { data: prescriptions = [], isLoading, error: fetchError } = useQuery<PrescriptionData[]>({
        queryKey: ['prescriptions'],
        queryFn: getPrescriptionsAPI,
    });

    // Mutation for creating prescriptions
    const createMutation = useMutation({
        mutationFn: createPrescriptionAPI,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['prescriptions'] });
            toast({ title: "Success", description: "Prescription created successfully." });
            setIsCreateDialogOpen(false);
        },
        onError: (error: any) => {
            toast({
                variant: "destructive",
                title: "Error Creating Prescription",
                description: error.response?.data?.detail || error.message || "Failed to create prescription."
            });
        }
    });

    // --- NEW: Mutation for deleting a prescription ---
    const deleteMutation = useMutation({
        mutationFn: (id: number) => deletePrescriptionAPI(id),
        onSuccess: (_, deletedId) => {
            // Optimistically update the UI by removing the deleted item
            queryClient.setQueryData<PrescriptionData[]>(
                ['prescriptions'],
                (oldData = []) => oldData.filter((p) => p.id !== deletedId)
            );
            toast({ title: "Success", description: "Prescription deleted." });
            setItemToDelete(null); // Close the dialog
        },
        onError: (error: any) => {
            toast({
                variant: "destructive",
                title: "Error Deleting",
                description: error.response?.data?.detail || error.message || "Failed to delete prescription."
            });
            setItemToDelete(null); // Close the dialog
        }
    });

    // Handle form submission
    const handleFormSubmit = (formData: PrescriptionFormData) => {
        const patientId = parseInt(formData.patient, 10);
        if (isNaN(patientId)) {
             toast({ variant: "destructive", title: "Validation Error", description: "Please select a patient." });
             return;
        }

        // Note: Your PrescriptionInput already expects 'patient_id'
        // But your form submit logic was passing 'patient'
        const apiData: PrescriptionInput = {
            patient_id: patientId, // Use the correct key
            diagnosis: formData.diagnosis,
            notes: formData.notes,
            medications: formData.medications,
        };
        createMutation.mutate(apiData);
    };

    const confirmDelete = () => {
        if (itemToDelete) {
            deleteMutation.mutate(itemToDelete.id);
        }
    };

    return (
        <div className="pr-[5.5rem] p-6"> {/* Added padding */}
            <RightSidebar />
            
            {/* --- STYLED HEADER --- */}
            <Card className="mb-8 shadow-sm bg-card">
              <CardHeader>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <FileText className="h-8 w-8 text-primary" />
                    <div>
                      <CardTitle className="text-2xl font-bold">Manage Prescriptions</CardTitle>
                      <CardDescription className="mt-1">
                        Create, view, and manage all patient prescriptions.
                      </CardDescription>
                    </div>
                  </div>
                  <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                      <DialogTrigger asChild>
                          <Button> <PlusCircle className="mr-2 h-4 w-4" /> Create New Prescription</Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-2xl">
                          <DialogHeader>
                              <DialogTitle>New Prescription</DialogTitle>
                          </DialogHeader>
                          <PrescriptionForm onSubmit={handleFormSubmit} isLoading={createMutation.isPending} />
                      </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
            </Card>
            {/* --- END STYLED HEADER --- */}


            {/* Loading State */}
            {isLoading && (
              <div className="flex justify-center items-center py-10">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            )}

            {/* Error State */}
            {fetchError && (
                 <Alert variant="destructive" className="mb-4">
                    <AlertTitle>Error Loading Prescriptions</AlertTitle>
                    <AlertDescription>{(fetchError as Error).message || "Could not load data."}</AlertDescription>
                </Alert>
            )}

            {/* Empty State */}
            {!isLoading && !fetchError && prescriptions.length === 0 && (
                <Card className="mt-6 bg-card border border-dashed">
                  <CardContent className="text-center py-12">
                    <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-foreground mb-1">
                      No Prescriptions Found
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      Click "Create New Prescription" to get started.
                    </p>
                  </CardContent>
                </Card>
            )}

            {/* Prescriptions List */}
            {!isLoading && !fetchError && prescriptions.length > 0 && (
                <div className="space-y-6">
                    {prescriptions.map(p => (
                        <Card key={p.id} className="shadow-sm">
                            <CardHeader>
                                {/* --- UPDATED TITLE AND DESCRIPTION --- */}
                                <div className="flex justify-between items-start">
                                  <div>
                                    <CardTitle className="text-lg">
                                      Prescription for {p.patient.full_name || p.patient.username}
                                    </CardTitle>
                                    <CardDescription>
                                        Issued on: {format(new Date(p.date_issued), 'PPP')}
                                        {' | '}Patient NIC: {p.patient.nic || 'N/A'}
                                        {' | '}Ref: #{p.id}
                                    </CardDescription>
                                  </div>
                                  {/* --- NEW DELETE BUTTON --- */}
                                  <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="text-destructive hover:text-destructive/80"
                                    onClick={() => setItemToDelete(p)}
                                    disabled={deleteMutation.isPending && itemToDelete?.id === p.id}
                                  >
                                    <Trash2 className="w-4 h-4" />
                                    <span className="sr-only">Delete</span>
                                  </Button>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <h4 className="font-semibold mb-1 text-sm text-muted-foreground">Diagnosis:</h4>
                                    <p className="text-foreground">{p.diagnosis}</p>
                                </div>
                                {p.notes && (
                                     <div>
                                        <h4 className="font-semibold mb-1 text-sm text-muted-foreground">Notes:</h4>
                                        <p className="text-foreground">{p.notes}</p>
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
                                            {p.medications.map((med, index) => (
                                                <TableRow key={`${p.id}-med-${index}`}>
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

            {/* --- NEW: Delete Confirmation Dialog --- */}
            <AlertDialog open={!!itemToDelete} onOpenChange={() => setItemToDelete(null)}>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete the prescription for 
                    <span className="font-medium"> {itemToDelete?.patient.full_name}</span> (Ref: #{itemToDelete?.id}). 
                    This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel onClick={() => setItemToDelete(null)}>Cancel</AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={confirmDelete}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/80"
                    disabled={deleteMutation.isPending}
                  >
                    {deleteMutation.isPending ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      "Delete"
                    )}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};

// --- Prescription Form Component (Still within the same file, no changes) ---
const PrescriptionForm: React.FC<{ onSubmit: (data: PrescriptionFormData) => void; isLoading: boolean }> = ({ onSubmit, isLoading }) => {
    const { toast } = useToast();

    const { data: patients = [], isLoading: isLoadingPatients, error: patientsError } = useQuery<PatientOption[]>({
        queryKey: ['doctorPatients'],
        queryFn: getDoctorPatients,
        staleTime: 5 * 60 * 1000,
    });

    const [selectedPatientId, setSelectedPatientId] = useState<string>('');
    const [diagnosis, setDiagnosis] = useState('');
    const [notes, setNotes] = useState('');
    const [medications, setMedications] = useState<Omit<MedicationData, 'id'>[]>([{ name: '', dosage: '', frequency: '', instructions: '' }]);

    const handleMedicationChange = (index: number, field: keyof Omit<MedicationData, 'id'>, value: string) => {
        const newMeds = [...medications];
        (newMeds[index] as any)[field] = value;
        setMedications(newMeds);
    };
    const addMedication = () => setMedications([...medications, { name: '', dosage: '', frequency: '', instructions: '' }]);
    const removeMedication = (index: number) => setMedications(medications.filter((_, i) => i !== index));

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
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

     if (patientsError) {
         return <p className="text-red-500">Error loading patient list.</p>;
     }

    return (
        <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
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

            <div>
                <Label htmlFor="diagnosis">Diagnosis *</Label>
                <Textarea id="diagnosis" value={diagnosis} onChange={(e) => setDiagnosis(e.target.value)} disabled={isLoading} required />
            </div>

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

            <div className="pt-4">
                <Label htmlFor="notes">Additional Notes</Label>
                <Textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} disabled={isLoading} />
            </div>

            <Button type="submit" className="w-full mt-4" disabled={isLoading}>
                {isLoading ? 'Saving...' : 'Save Prescription'}
            </Button>
        </form>
    );
};

export default PrescriptionsPage;