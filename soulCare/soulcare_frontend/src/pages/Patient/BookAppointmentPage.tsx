import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, axiosInstance } from '@/api';
import { Provider } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { User, Star, Stethoscope, Brain } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Fetches the list of all verified doctors and counselors
const fetchProviders = async (): Promise<Provider[]> => {
    const { data } = await axiosInstance.get<Provider[]>('/providers/');
    return data;
};

const BookAppointmentPage: React.FC = () => {
    const { data: providers = [], isLoading } = useQuery<Provider[]>({
        queryKey: ['providers'],
        queryFn: fetchProviders,
    });

    if (isLoading) {
        return <div className="p-6">Loading available doctors and counselors...</div>;
    }

    return (
        <div className="p-6">
            <h1 className="text-3xl font-bold mb-2">Find a Provider</h1>
            <p className="text-muted-foreground mb-6">Browse our verified professionals and book an appointment.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {providers.map(provider => (
                    <ProviderCard key={provider.id} provider={provider} />
                ))}
            </div>
        </div>
    );
};

const ProviderCard: React.FC<{ provider: Provider }> = ({ provider }) => {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const ProviderIcon = provider.role === 'doctor' ? Stethoscope : Brain;

    return (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <Card className="flex flex-col">
                <CardHeader className="items-center text-center">
                    <Avatar className="w-24 h-24 mb-4">
                        <AvatarImage src={(provider.profile as any).profile_picture_url} />
                        <AvatarFallback className="text-3xl bg-muted">
                            <User />
                        </AvatarFallback>
                    </Avatar>
                    <CardTitle>{provider.profile.full_name}</CardTitle>
                    <CardDescription className="capitalize flex items-center gap-2">
                        <ProviderIcon className="w-4 h-4 text-muted-foreground" />
                        {provider.role}
                    </CardDescription>
                </CardHeader>
                <CardContent className="text-center space-y-4 flex-grow flex flex-col justify-between">
                    <div>
                        <p className="text-muted-foreground font-semibold">
                            {'specialization' in provider.profile ? provider.profile.specialization : provider.profile.expertise}
                        </p>
                        <p className="text-sm text-muted-foreground px-4 mt-2 h-20 overflow-hidden">
                             {(provider.profile as any).bio || "No bio provided."}
                        </p>
                    </div>
                    <div className="mt-4">
                         <div className="flex items-center justify-center mb-4">
                            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400 mr-1" />
                            <span className="font-semibold">{provider.profile.rating}</span>
                        </div>
                        <DialogTrigger asChild>
                            <Button className="w-full">Book Appointment</Button>
                        </DialogTrigger>
                    </div>
                </CardContent>
            </Card>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Book Appointment with {provider.profile.full_name}</DialogTitle>
                </DialogHeader>
                <BookingForm providerId={provider.id} closeModal={() => setIsDialogOpen(false)} />
            </DialogContent>
        </Dialog>
    );
};

// Data mutation function
const bookAppointment = async (appointmentData: { provider: number, date: string, time: string, notes: string }) => {
    const { data } = await api.post('/appointments/', appointmentData);
    return data;
};

const BookingForm: React.FC<{ providerId: number, closeModal: () => void }> = ({ providerId, closeModal }) => {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const navigate = useNavigate();
    const [date, setDate] = useState('');
    const [time, setTime] = useState('');
    const [notes, setNotes] = useState('');

    const mutation = useMutation({
        mutationFn: bookAppointment,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['patientAppointments'] });
            toast({ title: "Success!", description: "Your appointment request has been sent." });
            closeModal();
            navigate('/patient/appointments');
        },
        onError: (error: any) => {
            toast({ variant: "destructive", title: "Error", description: error.response?.data?.error || "Could not book appointment." });
        }
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        mutation.mutate({ provider: providerId, date, time, notes });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <Label htmlFor="date">Date</Label>
                    <Input id="date" type="date" value={date} onChange={e => setDate(e.target.value)} required />
                </div>
                <div>
                    <Label htmlFor="time">Time</Label>
                    <Input id="time" type="time" value={time} onChange={e => setTime(e.target.value)} required />
                </div>
            </div>
            <div>
                <Label htmlFor="notes">Reason for visit (optional)</Label>
                <Textarea id="notes" value={notes} onChange={e => setNotes(e.target.value)} placeholder="Briefly describe the reason for your appointment..."/>
            </div>
            <Button type="submit" className="w-full" disabled={mutation.isPending}>
                {mutation.isPending ? "Requesting..." : "Request Appointment"}
            </Button>
        </form>
    );
};

export default BookAppointmentPage;