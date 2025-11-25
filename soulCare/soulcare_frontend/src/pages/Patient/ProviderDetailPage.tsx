import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { axiosInstance } from '@/api';
import { Provider, DoctorProfile, CounselorProfile } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User, Star, ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, MapPin, Award, ShieldCheck, Stethoscope, UserCheck } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import BookingForm from '@/components/appointments/BookingForm';
import { format, addDays, startOfWeek, isSameDay, isBefore, startOfToday, endOfWeek } from 'date-fns';
import { Badge } from "@/components/ui/badge";

type AvailabilityData = Record<string, string[]>;

type ProviderProfile = DoctorProfile | CounselorProfile;

// Type guard functions
const isDoctorProfile = (profile: ProviderProfile): profile is DoctorProfile => {
    return 'specialization' in profile;
};

const isCounselorProfile = (profile: ProviderProfile): profile is CounselorProfile => {
    return 'expertise' in profile;
};

const fetchProviderDetail = async (providerId: string): Promise<Provider> => {
    const { data } = await axiosInstance.get<Provider>(`/providers/${providerId}/`);
    return data;
};

const fetchAvailability = async (providerId: string, startDate: Date): Promise<AvailabilityData> => {
    const start = format(startDate, 'yyyy-MM-dd');
    const end = format(addDays(startDate, 13), 'yyyy-MM-dd'); 
    const { data } = await axiosInstance.get<AvailabilityData>(`/providers/${providerId}/availability/?start_date=${start}&end_date=${end}`);
    return data;
};

const ProviderDetailPage: React.FC = () => {
    const { providerId } = useParams<{ providerId: string }>();
    const navigate = useNavigate();
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [selectedTime, setSelectedTime] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 }); 

    const { data: provider, isLoading: isLoadingProvider } = useQuery<Provider>({
        queryKey: ['providerDetail', providerId],
        queryFn: () => fetchProviderDetail(providerId!),
        enabled: !!providerId,
    });

    const { data: availability, isLoading: isLoadingAvailability } = useQuery<AvailabilityData>({
        queryKey: ['availability', providerId, format(weekStart, 'yyyy-MM-dd')],
        queryFn: () => fetchAvailability(providerId!, weekStart),
        enabled: !!providerId,
    });

    const handleTimeSlotClick = (day: Date, time: string) => {
        setSelectedDate(day);
        setSelectedTime(time);
        setIsModalOpen(true);
    };

    if (isLoadingProvider || !provider) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-pulse flex flex-col items-center">
                    <div className="h-12 w-12 bg-gray-200 rounded-full mb-4"></div>
                    <div className="h-4 w-32 bg-gray-200 rounded"></div>
                </div>
            </div>
        );
    }

    const today = startOfToday();
    const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
    const currentDateTime = new Date();

    const profile = provider.profile as ProviderProfile;
    const profilePictureUrl = profile.profile_picture;
    const providerSpecialization = isDoctorProfile(profile)
        ? profile.specialization
        : isCounselorProfile(profile)
        ? profile.expertise
        : 'Provider';

    const providerBio = profile.bio || 'No bio available for this provider.';
    const licenseNumber = profile.license_number;

    var provider_type = 'Provider';

    if(provider.role == 'doctor'){

        provider_type = 'Doctor';

    }else{

        provider_type = 'Counselor';
    }

    

    return (
        <div className="min-h-screen bg-background text-foreground pb-20">
            <div className="p-6 max-w mx-auto space-y-8">

                {/* --- HEADER CARD (New Clean Style) --- */}
                <Card className="shadow-sm bg-card border-none">
                    <CardHeader className="pb-6">
                         <Button 
                            variant="ghost" 
                            size="sm" 
                            className="w-fit mb-4 pl-0 hover:bg-transparent hover:text-primary transition-colors" 
                            onClick={() => navigate(-1)}
                        >
                            <ChevronLeft className="w-4 h-4 mr-1" /> Go Back
                        </Button>

                        <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                            <Avatar className="w-24 h-24 border-2 border-background shadow-sm">
                                <AvatarImage src={profilePictureUrl || undefined} className="object-cover" />
                                <AvatarFallback className="text-3xl bg-primary/10 text-primary">
                                    {profile.full_name?.[0]}
                                </AvatarFallback>
                            </Avatar>
                            
                            <div className="flex-1 space-y-2">
                                <div>
                                    <div className="flex flex-wrap items-center gap-3">
                                        <h1 className="text-3xl font-bold text-foreground tracking-tight">
                                            {profile.full_name}
                                        </h1>
                                        <Badge variant="secondary" className="text-xs font-medium">
                                            {provider.role === 'doctor' ? 'Medical Doctor' : 'Counselor'}
                                        </Badge>
                                    </div>
                                    <p className="text-lg text-muted-foreground font-medium flex items-center gap-2 mt-1">
                                        <Stethoscope className="w-4 h-4 text-primary" />
                                         Specialization: {providerSpecialization}
                                    </p>
                                </div>

                                <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground pt-2">
                                    {profile.rating && (
                                        <div className="flex items-center gap-1.5 bg-yellow-50 dark:bg-yellow-900/10 px-2.5 py-1 rounded-md text-yellow-700 dark:text-yellow-500 font-medium">
                                            <Star className="w-3.5 h-3.5 fill-current" />
                                            {profile.rating} Rating
                                        </div>
                                    )}
                                    {licenseNumber && (
                                        <div className="flex items-center gap-1.5">
                                            <ShieldCheck className="w-4 h-4 text-green-600" />
                                            <span>License: {licenseNumber}</span>
                                        </div>
                                    )}
                                    <div className="flex items-center gap-1.5 text-green-700">
                                        <UserCheck className="w-4 h-4" />
                                        <span>Verified {provider_type}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardHeader>
                </Card>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* --- LEFT COLUMN: BIO --- */}
                    <div className="lg:col-span-1 space-y-6">
                        <Card className="shadow-sm h-full">
                            <CardHeader>
                                <CardTitle className="text-lg">About {provider_type}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                                    {providerBio}
                                </p>
                                <div className="mt-6 pt-6 border-t space-y-3">
                                    <h4 className="text-sm font-semibold text-foreground">Consultation Details</h4>
                                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                        <div className="p-2 bg-primary/10 rounded-md">
                                            <MapPin className="w-4 h-4 text-primary" />
                                        </div>
                                        <span>Online Video Consultation</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                        <div className="p-2 bg-primary/10 rounded-md">
                                            <Clock className="w-4 h-4 text-primary" />
                                        </div>
                                        <span>~60 Minutes / Session</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* --- RIGHT COLUMN: BOOKING CALENDAR --- */}
                    <div className="lg:col-span-2">
                        <Card className="shadow-sm border-t-4 border-t-primary">
                            <CardHeader className="border-b bg-muted/5 pb-4">
                                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                                    <div>
                                        <CardTitle className="text-xl flex items-center gap-2">
                                            <CalendarIcon className="w-5 h-5 text-primary" />
                                            Select Appointment
                                        </CardTitle>
                                        <CardDescription>Choose a date and time that works for you.</CardDescription>
                                    </div>

                                    {/* Calendar Controls */}
                                    <div className="flex items-center bg-background border rounded-lg p-1 shadow-sm">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8"
                                            onClick={() => setCurrentDate(addDays(currentDate, -7))}
                                            disabled={isBefore(addDays(weekStart, -1), startOfWeek(new Date(), { weekStartsOn: 1 }))}
                                        >
                                            <ChevronLeft className="w-4 h-4" />
                                        </Button>
                                        <div className="px-3 text-sm font-semibold min-w-[120px] text-center">
                                            {format(weekStart, 'MMM d')} - {format(endOfWeek(weekStart, { weekStartsOn: 1 }), 'MMM d')}
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8"
                                            onClick={() => setCurrentDate(addDays(currentDate, 7))}
                                        >
                                            <ChevronRight className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            </CardHeader>

                            <CardContent className="p-6">
                                {isLoadingAvailability ? (
                                    <div className="flex justify-center py-12">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3">
                                        {days.map((day) => {
                                            const isPastDay = isBefore(day, today);
                                            const isToday = isSameDay(day, today);
                                            const dayKey = format(day, 'yyyy-MM-dd');
                                            
                                            const allSlots = availability?.[dayKey] || [];
                                            const validSlots = allSlots.filter(time => {
                                                if (!isToday) return true;
                                                const [hours, minutes] = time.split(':').map(Number);
                                                const slotTime = new Date(day);
                                                slotTime.setHours(hours, minutes, 0);
                                                return slotTime > currentDateTime;
                                            });

                                            return (
                                                <div key={day.toISOString()} className={`rounded-lg border ${isToday ? 'border-primary/40 bg-primary/5' : 'border-border'} overflow-hidden flex flex-col`}>
                                                    {/* Day Header */}
                                                    <div className={`p-2 text-center border-b ${isToday ? 'bg-primary text-primary-foreground' : 'bg-muted/40'}`}>
                                                        <p className="text-[10px] font-bold uppercase tracking-wider opacity-90">{format(day, 'EEE')}</p>
                                                        <p className="text-sm font-bold leading-none mt-0.5">{format(day, 'd')}</p>
                                                    </div>

                                                    {/* Slots List */}
                                                    <div className="p-2 space-y-1.5 flex-1 flex flex-col items-center justify-start min-h-[100px]">
                                                        {isPastDay ? (
                                                            <span className="text-xs text-muted-foreground italic my-auto">Unavailable</span>
                                                        ) : validSlots.length > 0 ? (
                                                            validSlots.sort().map((time) => (
                                                                <Button
                                                                    key={time}
                                                                    variant="outline"
                                                                    size="sm"
                                                                    className="w-full h-7 text-xs font-medium hover:bg-primary hover:text-primary-foreground transition-colors border-primary/20"
                                                                    onClick={() => handleTimeSlotClick(day, time)}
                                                                >
                                                                    {time}
                                                                </Button>
                                                            ))
                                                        ) : (
                                                            <span className="text-xs text-muted-foreground/50 italic my-auto px-1 text-center">
                                                                No slots
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>

            {/* Booking Modal */}
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Confirm Appointment</DialogTitle>
                    </DialogHeader>
                    {selectedDate && selectedTime && (
                        <BookingForm
                            providerId={provider.id}
                            selectedDate={selectedDate}
                            selectedTime={selectedTime}
                            closeModal={() => setIsModalOpen(false)}
                        />
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default ProviderDetailPage;