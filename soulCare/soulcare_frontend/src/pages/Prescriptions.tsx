import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {axiosInstance} from '@/api';
import { Prescription } from '@/types';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { PlusCircle, XCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// --- Data Fetching ---
const fetchPrescriptions = async (): Promise<Prescription[]> => {
  const response = await axiosInstance.get<Prescription[]>('/prescriptions/');
  return response.data;
};

const createPrescription = async (newPrescription: any) => {
    const { data } = await axiosInstance.post('/prescriptions/', newPrescription);
    return data;
};

// --- Main Component ---
const Prescriptions: React.FC = () => {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    // Fetching data with react-query
    const { data: prescriptions = [], isLoading } = useQuery<Prescription[]>({
        queryKey: ['prescriptions'],
        queryFn: fetchPrescriptions,
    });

    // Mutation for creating data
    const mutation = useMutation({
        mutationFn: createPrescription,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['prescriptions'] });
            toast({ title: "Success", description: "Prescription created successfully." });
            setIsDialogOpen(false);
        },
        onError: (error: any) => {
            toast({ variant: "destructive", title: "Error", description: error.response?.data?.detail || "Failed to create prescription." });
        }
    });

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Prescriptions</h1>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button>Create New Prescription</Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-2xl">
                        <DialogHeader>
                            <DialogTitle>New Prescription</DialogTitle>
                        </DialogHeader>
                        <PrescriptionForm onSubmit={mutation.mutate} isLoading={mutation.isPending} />
                    </DialogContent>
                </Dialog>
            </div>

            {isLoading ? <p>Loading prescriptions...</p> : (
                <div className="space-y-4">
                    {prescriptions.map(p => (
                        <div key={p.id} className="border p-4 rounded-lg">
                           <h2 className="font-bold">Patient ID: {p.patient} - {p.date_issued}</h2>
                           <p><strong>Diagnosis:</strong> {p.diagnosis}</p>
                           <ul className="list-disc pl-5 mt-2">
                               {p.medications.map(m => <li key={m.id}>{m.name} ({m.dosage}, {m.frequency})</li>)}
                           </ul>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

// --- Prescription Form Component ---
const PrescriptionForm: React.FC<{ onSubmit: (data: any) => void; isLoading: boolean }> = ({ onSubmit, isLoading }) => {
    const [patientId, setPatientId] = useState('');
    const [diagnosis, setDiagnosis] = useState('');
    const [notes, setNotes] = useState('');
    const [medications, setMedications] = useState([{ name: '', dosage: '', frequency: '', instructions: '' }]);

    const handleMedicationChange = (index: number, field: string, value: string) => {
        const newMeds = [...medications];
        newMeds[index][field] = value;
        setMedications(newMeds);
    };

    const addMedication = () => {
        setMedications([...medications, { name: '', dosage: '', frequency: '', instructions: '' }]);
    };

    const removeMedication = (index: number) => {
        const newMeds = medications.filter((_, i) => i !== index);
        setMedications(newMeds);
    };
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit({ patient: patientId, diagnosis, notes, medications });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <Label htmlFor="patientId">Patient ID</Label>
                <Input id="patientId" value={patientId} onChange={(e) => setPatientId(e.target.value)} required />
            </div>
            <div>
                <Label htmlFor="diagnosis">Diagnosis</Label>
                <Textarea id="diagnosis" value={diagnosis} onChange={(e) => setDiagnosis(e.target.value)} required />
            </div>
            
            <h3 className="font-semibold pt-4">Medications</h3>
            {medications.map((med, index) => (
                <div key={index} className="border p-3 rounded-md space-y-2 relative">
                    <Button type="button" variant="ghost" size="icon" className="absolute top-1 right-1 h-6 w-6" onClick={() => removeMedication(index)}>
                        <XCircle className="h-4 w-4 text-red-500" />
                    </Button>
                    <div className="grid grid-cols-2 gap-2">
                        <Input placeholder="Medication Name" value={med.name} onChange={e => handleMedicationChange(index, 'name', e.target.value)} required />
                        <Input placeholder="Dosage (e.g., 500mg)" value={med.dosage} onChange={e => handleMedicationChange(index, 'dosage', e.target.value)} required />
                        <Input placeholder="Frequency (e.g., Twice a day)" value={med.frequency} onChange={e => handleMedicationChange(index, 'frequency', e.target.value)} required />
                        <Input placeholder="Instructions" value={med.instructions} onChange={e => handleMedicationChange(index, 'instructions', e.target.value)} />
                    </div>
                </div>
            ))}

            <Button type="button" variant="outline" onClick={addMedication} className="w-full">
                <PlusCircle className="w-4 h-4 mr-2" /> Add Medication
            </Button>
            
            <div className="pt-4">
                <Label htmlFor="notes">Additional Notes</Label>
                <Textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} />
            </div>
            
            <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Saving...' : 'Save Prescription'}
            </Button>
        </form>
    );
};

export default Prescriptions;