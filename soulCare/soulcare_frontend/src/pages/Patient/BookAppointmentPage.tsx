/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { axiosInstance } from "@/api";
import { Provider } from "@/types";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  User,
  Star,
  Stethoscope,
  Brain,
  Search,
  CalendarPlus,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge"; // Import Badge

// Fetches the list of all verified doctors and counselors
const fetchProviders = async (): Promise<Provider[]> => {
  const { data } = await axiosInstance.get<Provider[]>("/providers/");
  return data;
};

const BookAppointmentPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const { data: providers = [], isLoading } = useQuery<Provider[]>({
    queryKey: ["providers"],
    queryFn: fetchProviders,
  });

  // Filter providers based on search
  const filteredProviders = useMemo(() => {
    if (!searchQuery) return providers;
    const lowerQuery = searchQuery.toLowerCase();
    return providers.filter((provider) => {
      const profile = provider.profile as any;
      return (
        profile.full_name?.toLowerCase().includes(lowerQuery) ||
        provider.role.toLowerCase().includes(lowerQuery) ||
        (profile.specialization || profile.expertise || "")
          .toLowerCase()
          .includes(lowerQuery)
      );
    });
  }, [providers, searchQuery]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
          <p className="text-muted-foreground font-medium">
            Loading available providers...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground pb-20">
      <div className="p-6 max-w mx-auto space-y-8">
        {/* --- HEADER CARD --- */}
        <Card className="mb-8 shadow-sm bg-card border-none">
          <CardHeader>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                {/* Icon Box */}
                <div className="p-3 bg-primary/10 rounded-xl">
                  <CalendarPlus className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-2xl font-bold">
                    Find a Provider
                  </CardTitle>
                  <CardDescription className="mt-1">
                    Browse our verified professionals and book an appointment.
                  </CardDescription>
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>
        {/* --- END HEADER --- */}

        {/* Search Bar */}
        <div className="relative max-w-md mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by doctor name, role, or specialization..."
            className="pl-10 bg-background shadow-sm border-muted-foreground/20 h-11"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Providers Grid */}
        {filteredProviders.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProviders.map((provider) => (
              <ProviderCard key={provider.id} provider={provider} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-muted/5 rounded-xl border-2 border-dashed border-muted-foreground/20">
            <User className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground">
              No providers found
            </h3>
            <p className="text-muted-foreground mt-1">
              Try adjusting your search terms.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

const ProviderCard: React.FC<{ provider: Provider }> = ({ provider }) => {
  const isDoctor = provider.role === "doctor";
  const ProviderIcon = isDoctor ? Stethoscope : Brain;

  // Helper to access profile properties safely since 'Provider' type might be a union
  const profile = (provider.profile ?? {}) as {
    profile_picture?: string;
    full_name?: string;
    specialization?: string;
    expertise?: string;
    bio?: string;
    rating?: string | number;
  };

  const specialization =
    "specialization" in profile ? profile.specialization : profile.expertise;

  return (
    <Card className="flex flex-col h-full hover:shadow-md transition-shadow border-muted/60 overflow-hidden group">
      <CardHeader className="items-center text-center pb-4 bg-muted/10 border-b border-border/40">
        <div className="relative">
          <Avatar className="w-24 h-24 mb-3 border-4 border-background shadow-sm group-hover:border-primary/20 transition-colors">
            <AvatarImage
              src={profile.profile_picture}
              alt={profile.full_name}
              className="object-cover"
            />
            <AvatarFallback className="text-3xl bg-primary/10 text-primary font-semibold">
              {profile.full_name ? (
                profile.full_name.charAt(0).toUpperCase()
              ) : (
                <User />
              )}
            </AvatarFallback>
          </Avatar>
          {/* Role Badge overlapping avatar */}
          <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
            <Badge
              variant="secondary"
              className="text-[10px] px-2 py-0.5 font-semibold shadow-sm border-white border flex items-center gap-1 whitespace-nowrap"
            >
              <ProviderIcon className="w-3 h-3" />
              {isDoctor ? "Doctor" : "Counselor"}
            </Badge>
          </div>
        </div>

        <div className="mt-3">
          <CardTitle className="text-lg font-bold line-clamp-1">
            {profile.full_name}
          </CardTitle>
          <p className="text-sm font-medium text-primary mt-1 line-clamp-1">
            Specialization: {specialization}
          </p>
        </div>
      </CardHeader>

      <CardContent className="text-center pt-6 pb-6 px-6 flex-grow flex flex-col justify-between gap-4">
        {/* Bio Section */}
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3 min-h-[4.5rem]">
            {profile.bio || "No professional bio provided yet."}
          </p>
        </div>

        {/* Footer Actions */}
        <div className="space-y-4 mt-auto">
          <div className="flex items-center justify-center gap-1.5 bg-yellow-50 dark:bg-yellow-900/10 py-1.5 px-3 rounded-full w-fit mx-auto">
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            <span className="font-bold text-sm text-yellow-700 dark:text-yellow-500">
              {profile.rating || "5.0"}
            </span>
            <span className="text-xs text-yellow-600/70 dark:text-yellow-500/70 font-medium">
              Rating
            </span>
          </div>

          <Button
            asChild
            className="w-full shadow-sm group-hover:shadow-md transition-all"
          >
            <Link to={`/patient/providers/${provider.id}`}>
              View Profile & Availability
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default BookAppointmentPage;
