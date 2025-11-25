import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/api';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { format, parse } from 'date-fns'; // Import 'parse'
import { Loader2 } from 'lucide-react';

interface BookingFormProps {
    providerId: number;
    selectedDate: Date;
    selectedTime: string;
    closeModal: () => void;
}

const createAppointment = async (data: any) => {
    const response = await api.post('/appointments/', data);
    return response.data;
};

const BookingForm: React.FC<BookingFormProps> = ({ providerId, selectedDate, selectedTime, closeModal }) => {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [notes, setNotes] = useState('');

    const mutation = useMutation({
        mutationFn: createAppointment,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['providerAppointments'] });
            queryClient.invalidateQueries({ queryKey: ['patientAppointments'] });
            queryClient.invalidateQueries({ queryKey: ['availability'] });
            
            toast({ title: "Success", description: "Appointment requested successfully." });
            closeModal();
        },
        onError: (error: any) => {
            console.error("Booking error:", error);
            const errorData = error.response?.data;
            let errorMsg = "Could not book appointment.";
            
            if (errorData) {
                if (errorData.date) errorMsg = `Date Error: ${errorData.date[0]}`;
                else if (errorData.time) errorMsg = `Time Error: ${errorData.time[0]}`;
                else if (errorData.detail) errorMsg = errorData.detail;
                else if (typeof errorData === 'object') {
                    errorMsg = Object.values(errorData).flat().join(' ');
                }
            }
            
            toast({ 
                variant: "destructive", 
                title: "Booking Failed", 
                description: errorMsg 
            });
        }
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // 1. Format Date to YYYY-MM-DD
        const formattedDate = format(selectedDate, 'yyyy-MM-dd');
        
        // 2. Format Time Robustly (Handle 12-hour "11:00 AM" format)
        let formattedTime = selectedTime;

        try {
            // If the time string contains AM/PM, parse it first
            if (selectedTime.includes('AM') || selectedTime.includes('PM')) {
                // Parse "11:00 AM" using date-fns
                // 'hh:mm a' matches "11:00 AM"
                // 'h:mm a' matches "9:00 AM"
                const parsedTime = parse(selectedTime, 'h:mm a', new Date());
                
                // Convert to 24-hour format "HH:mm:ss"
                formattedTime = format(parsedTime, 'HH:mm:ss');
            } else {
                // Assume it's already 24-hour HH:mm, just ensure seconds
                const [hours, minutes] = selectedTime.split(':');
                formattedTime = `${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}:00`;
            }
        } catch (error) {
            console.error("Time parsing error:", error);
            toast({ variant: "destructive", title: "Error", description: "Invalid time format." });
            return;
        }

        const payload = {
            provider: providerId,
            date: formattedDate,
            time: formattedTime,
            notes: notes
        };
        
        console.log("Submitting payload:", payload); 

        mutation.mutate(payload);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="bg-muted/30 p-4 rounded-lg border text-sm space-y-2">
                <div className="flex justify-between">
                    <span className="text-muted-foreground">Date:</span>
                    <span className="font-medium">{format(selectedDate, 'PPP')}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-muted-foreground">Time:</span>
                    <span className="font-medium">{selectedTime}</span>
                </div>
            </div>
            
            <div className="space-y-2">
                <Label htmlFor="notes">Notes for Provider (Optional)</Label>
                <Textarea 
                    id="notes" 
                    value={notes} 
                    onChange={(e) => setNotes(e.target.value)} 
                    placeholder="Briefly describe reason for visit..."
                    className="resize-none h-24"
                />
            </div>

            <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={closeModal}>Cancel</Button>
                <Button type="submit" disabled={mutation.isPending}>
                    {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Confirm Booking
                </Button>
            </div>
        </form>
    );
};

export default BookingForm;