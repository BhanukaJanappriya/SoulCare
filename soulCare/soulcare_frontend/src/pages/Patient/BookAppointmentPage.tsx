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
import { useNavigate,Link } from 'react-router-dom';

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
    const ProviderIcon = provider.role === 'doctor' ? Stethoscope : Brain;

    return (
        // The Dialog components are now removed from here
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

                    {/* --- THIS IS THE KEY CHANGE --- */}
                    {/* The Button is now wrapped in a Link component */}
                    <Link to={`/patient/providers/${provider.id}`}>
                        <Button className="w-full">
                            View Profile & Availability
                        </Button>
                    </Link>
                </div>
            </CardContent>
        </Card>
    );

   
};

export default BookAppointmentPage;