import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { api, axiosInstance } from "@/api";
import { Provider, DoctorProfile, CounselorProfile } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, Star, ChevronLeft, ChevronRight } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import BookingForm from "@/components/appointments/BookingForm";
import {
  format,
  addDays,
  startOfWeek,
  endOfWeek,
  isSameDay,
  isBefore,
  startOfToday,
} from "date-fns";

type AvailabilityData = Record<string, string[]>;

type ProviderProfile = DoctorProfile | CounselorProfile;

// ✅ Type guard functions
const isDoctorProfile = (
  profile: ProviderProfile
): profile is DoctorProfile => {
  return "specialization" in profile;
};

const isCounselorProfile = (
  profile: ProviderProfile
): profile is CounselorProfile => {
  return "expertise" in profile;
};

const fetchProviderDetail = async (providerId: string): Promise<Provider> => {
  const { data } = await axiosInstance.get<Provider>(
    `/providers/${providerId}/`
  );
  return data;
};

const fetchAvailability = async (
  providerId: string,
  startDate: Date,
  endDate: Date
): Promise<AvailabilityData> => {
  const start = format(startDate, "yyyy-MM-dd");
  const end = format(endDate, "yyyy-MM-dd");
  const { data } = await axiosInstance.get<AvailabilityData>(
    `/providers/${providerId}/availability/?start_date=${start}&end_date=${end}`
  );
  return data;
};

const ProviderDetailPage: React.FC = () => {
  const { providerId } = useParams<{ providerId: string }>();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 }); // Monday

  const { data: provider, isLoading: isLoadingProvider } = useQuery<Provider>({
    queryKey: ["providerDetail", providerId],
    queryFn: () => fetchProviderDetail(providerId!),
    enabled: !!providerId,
  });

  const { data: availability, isLoading: isLoadingAvailability } =
    useQuery<AvailabilityData>({
      queryKey: ["availability", providerId, format(weekStart, "yyyy-MM-dd")],
      queryFn: () =>
        fetchAvailability(
          providerId!,
          weekStart,
          startOfWeek(addDays(weekStart, 13), { weekStartsOn: 1 })
        ), // Fetch 2 weeks at a time
      enabled: !!providerId,
    });

  const handleTimeSlotClick = (day: Date, time: string) => {
    setSelectedDate(day);
    setSelectedTime(time);
    setIsModalOpen(true);
  };

  if (isLoadingProvider || !provider)
    return <p className="p-6">Loading provider profile...</p>;

  const today = startOfToday();
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  // ✅ Type-safe profile access
  const profile = provider.profile as ProviderProfile;
  const profilePictureUrl = profile.profile_picture;
  const providerSpecialization = isDoctorProfile(profile)
    ? profile.specialization
    : isCounselorProfile(profile)
    ? profile.expertise
    : "Provider";

  const providerBio = profile.bio || "No bio available";

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Provider Info */}
      <div className="flex flex-col md:flex-row items-center gap-6 mb-8">
        <Avatar className="w-32 h-32">
          <AvatarImage src={profilePictureUrl} />
          <AvatarFallback className="text-5xl">
            <User />
          </AvatarFallback>
        </Avatar>
        <div className="text-center md:text-left">
          <h1 className="text-4xl font-bold">{profile.full_name}</h1>
          <p className="text-xl text-muted-foreground capitalize">
            {provider.role} - {providerSpecialization}
          </p>
          <div className="flex items-center justify-center md:justify-start mt-2">
            <Star className="w-5 h-5 fill-yellow-400 text-yellow-400 mr-1" />
            <span className="font-bold text-lg">{profile.rating || "N/A"}</span>
          </div>
          <p className="mt-4 text-muted-foreground">{providerBio}</p>
        </div>
      </div>

      {/* Availability Calendar */}
      <Card>
        <CardHeader>
          <CardTitle>Select a Time Slot</CardTitle>
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentDate(addDays(currentDate, -7))}
            >
              <ChevronLeft />
            </Button>
            <p className="font-semibold">{format(weekStart, "MMMM yyyy")}</p>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentDate(addDays(currentDate, 7))}
            >
              <ChevronRight />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoadingAvailability ? (
            <p className="text-center">Loading availability...</p>
          ) : (
            <div className="grid grid-cols-7 gap-2">
              {days.map((day) => {
                const isPast = isBefore(day, today);
                const dayKey = format(day, "yyyy-MM-dd");
                const daySlots = availability?.[dayKey] || [];

                return (
                  <div key={day.toISOString()} className="text-center">
                    <p className="font-bold">{format(day, "EEE")}</p>
                    <p
                      className={`text-sm ${
                        isSameDay(day, today)
                          ? "text-primary font-bold"
                          : "text-muted-foreground"
                      }`}
                    >
                      {format(day, "d")}
                    </p>
                    <div className="space-y-2 mt-2">
                      {isPast ? (
                        <div className="text-xs text-muted-foreground h-8 flex items-center justify-center">
                          Past
                        </div>
                      ) : daySlots.length > 0 ? (
                        daySlots.map((time) => (
                          <Button
                            key={time}
                            variant="outline"
                            className="w-full"
                            onClick={() => handleTimeSlotClick(day, time)}
                          >
                            {time}
                          </Button>
                        ))
                      ) : (
                        <div className="text-xs text-muted-foreground h-8 flex items-center justify-center">
                          Unavailable
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Booking Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Your Appointment</DialogTitle>
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
