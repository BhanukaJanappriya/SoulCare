import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api, axiosInstance } from '@/api';
import { Provider } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User, Star, Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
// You might need to install date-fns: npm install date-fns
import { format, addDays, startOfWeek, endOfWeek } from 'date-fns';

type AvailabilityData = Record<string, string[]>;

const fetchProviderDetail = async (providerId: string): Promise<Provider> => {
    const { data } = await axiosInstance.get<Provider>(`/providers/${providerId}/`); // Note: We may need to create this simple detail endpoint
    return data;
};

const fetchAvailability = async (providerId: string, startDate: Date, endDate: Date): Promise<AvailabilityData> => {
    const start = format(startDate, 'yyyy-MM-dd');
    const end = format(endDate, 'yyyy-MM-dd');
    const { data } = await axiosInstance.get<AvailabilityData>(`/providers/${providerId}/availability/?start_date=${start}&end_date=${end}`);
    return data; // Problem can occur 
};

const ProviderDetailPage: React.FC = () => {
    const { providerId } = useParams<{ providerId: string }>();
    const [currentDate, setCurrentDate] = useState(new Date());

    const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 }); // Monday
    const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });

    const { data: provider, isLoading: isLoadingProvider } = useQuery<Provider>({
        queryKey: ['providerDetail', providerId],
        queryFn: () => fetchProviderDetail(providerId!),
        enabled: !!providerId,
    });

    const { data: availability, isLoading: isLoadingAvailability } = useQuery<AvailabilityData>({
        queryKey: ['availability', providerId, format(weekStart, 'yyyy-MM-dd')],
        queryFn: () => fetchAvailability(providerId!, weekStart, weekEnd),
        enabled: !!providerId,
    });

    if (isLoadingProvider || !provider) return <p>Loading provider profile...</p>;

    const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

    return (
        <div className="p-6 max-w-4xl mx-auto">
            {/* Provider Info */}
            <div className="flex items-center gap-6 mb-8">
                <Avatar className="w-32 h-32">
                    <AvatarImage src={(provider.profile as any).profile_picture_url} />
                    <AvatarFallback className="text-5xl"><User /></AvatarFallback>
                </Avatar>
                <div>
                    <h1 className="text-4xl font-bold">{provider.profile.full_name}</h1>
                    <p className="text-xl text-muted-foreground capitalize">{provider.role} - {'specialization' in provider.profile ? provider.profile.specialization : provider.profile.expertise}</p>
                    <div className="flex items-center mt-2">
                        <Star className="w-5 h-5 fill-yellow-400 text-yellow-400 mr-1" />
                        <span className="font-bold text-lg">{provider.profile.rating}</span>
                    </div>
                    <p className="mt-4 text-muted-foreground">{(provider.profile as any).bio}</p>
                </div>
            </div>

            {/* Availability Calendar */}
            <Card>
                <CardHeader>
                    <CardTitle>Select a Time Slot</CardTitle>
                    <div className="flex items-center justify-between">
                        <Button variant="outline" size="icon" onClick={() => setCurrentDate(addDays(currentDate, -7))}><ChevronLeft/></Button>
                        <p className="font-semibold">{format(weekStart, 'MMM d')} - {format(weekEnd, 'MMM d, yyyy')}</p>
                        <Button variant="outline" size="icon" onClick={() => setCurrentDate(addDays(currentDate, 7))}><ChevronRight/></Button>
                    </div>
                </CardHeader>
                <CardContent>
                    {isLoadingAvailability ? <p>Loading availability...</p> : (
                        <div className="grid grid-cols-7 gap-2">
                            {days.map(day => (
                                <div key={day.toISOString()} className="text-center">
                                    <p className="font-bold">{format(day, 'EEE')}</p>
                                    <p className="text-sm text-muted-foreground">{format(day, 'd')}</p>
                                    <div className="space-y-2 mt-2">
                                        {availability?.[format(day, 'yyyy-MM-dd')]?.map(time => (
                                            <Button key={time} variant="outline" className="w-full">
                                                {time}
                                            </Button>
                                        )) || <p className="text-xs text-muted-foreground">Unavailable</p>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default ProviderDetailPage;