// src/pages/Patient/BookAppointmentPage.tsx
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { axiosInstance } from '@/api';
import { Provider } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User, Star, Stethoscope, Brain } from 'lucide-react';
import { Link } from 'react-router-dom';

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
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="text-lg text-muted-foreground">Loading available doctors and counselors...</div>
            </div>
        );
    }

    return (
        <div className="p-6">
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">Find a Provider</h1>
                <p className="text-muted-foreground">Browse our verified professionals and book an appointment.</p>
            </div>
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
    
    // Helper to access profile properties safely since 'Provider' type might be a union
    const profile: any = provider.profile;

    return (
        <Card className="flex flex-col hover:shadow-md transition-shadow">
            <CardHeader className="items-center text-center pb-2">
                <Avatar className="w-24 h-24 mb-4 border-2 border-primary/10">
                    <AvatarImage src={profile.profile_picture} alt={profile.full_name} />
                    <AvatarFallback className="text-3xl bg-primary/10 text-primary">
                        {profile.full_name ? profile.full_name.charAt(0).toUpperCase() : <User />}
                    </AvatarFallback>
                </Avatar>
                <CardTitle className="text-xl">{profile.full_name}</CardTitle>
                <CardDescription className="capitalize flex items-center gap-2 justify-center bg-muted/50 px-3 py-1 rounded-full text-xs font-medium mt-2">
                    <ProviderIcon className="w-3 h-3" />
                    {provider.role}
                </CardDescription>
            </CardHeader>
            <CardContent className="text-center space-y-4 flex-grow flex flex-col justify-between pt-2">
                <div>
                    <p className="font-medium text-primary mb-2">
                        {'specialization' in profile ? profile.specialization : profile.expertise}
                    </p>
                    
                    {/* --- BIO DISPLAY --- */}
                    <p className="text-sm text-muted-foreground px-2 line-clamp-3">
                         {profile.bio || "No bio provided yet."}
                    </p>
                    {/* --- END BIO DISPLAY --- */}

                </div>
                <div className="mt-4 space-y-3">
                     <div className="flex items-center justify-center gap-1">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-semibold">{profile.rating || "5.0"}</span>
                        <span className="text-xs text-muted-foreground">/ 5.0</span>
                    </div>

                    <Link to={`/patient/providers/${provider.id}`} className="block w-full">
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