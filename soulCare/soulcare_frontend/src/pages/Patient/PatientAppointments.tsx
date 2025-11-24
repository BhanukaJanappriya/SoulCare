import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, createReviewAPI } from "@/api";
import { Appointment } from "@/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Calendar,
  Clock,
  Plus,
  User,
  X,
  Trash2,
  Star,
  MessageSquare,
  CheckCircle2,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
// NEW IMPORT: Import AxiosError for proper error handling
import { AxiosError } from "axios";

// --- Data Fetching & Mutation Functions ---
const fetchPatientAppointments = async (): Promise<Appointment[]> => {
  const { data } = await api.get<Appointment[]>("/appointments/");
  return data;
};

const cancelAppointment = async (appointmentId: number) => {
  const { data } = await api.post(
    `/appointments/${appointmentId}/cancel-by-patient/`
  );
  return data;
};

const deleteAppointment = async (appointmentId: number) => {
  await api.delete(`/appointments/${appointmentId}/`);
};

// --- Rating Dialog Component ---
interface RateDialogProps {
  isOpen: boolean;
  onClose: () => void;
  appointment: Appointment | null;
}

const RateDialog: React.FC<RateDialogProps> = ({
  isOpen,
  onClose,
  appointment,
}) => {
  const { toast } = useToast();
  const queryClient = useQueryClient(); // Need this to refresh the list after rating
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");

  const mutation = useMutation({
    mutationFn: createReviewAPI,
    onSuccess: () => {
      toast({
        title: "Thank you!",
        description: "Your review has been submitted.",
      });
      // Invalidate query to update the 'has_review' status in the list
      queryClient.invalidateQueries({ queryKey: ["patientAppointments"] });
      onClose();
      setRating(0);
      setComment("");
    },
    // FIX 1: Replaced 'any' with 'AxiosError'
    onError: (error: AxiosError) => {
      // Safely check for error response data
      const errorData = error.response?.data;
      const msg =
        errorData && typeof errorData === "object"
          ? // Use a safe way to flatten and join error messages
            Object.values(errorData).flat().join(" ")
          : "Could not submit review.";
      toast({ variant: "destructive", title: "Error", description: msg });
    },
  });

  const handleSubmit = () => {
    if (!appointment) return;
    if (rating === 0) {
      toast({
        variant: "destructive",
        title: "Rating Required",
        description: "Please select a star rating.",
      });
      return;
    }
    mutation.mutate({
      appointment_id: appointment.id,
      rating: rating,
      comment: comment,
    });
  };

  if (!appointment) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] rounded-xl shadow-2xl">
        <DialogHeader className="text-center sm:text-left">
          <DialogTitle className="text-2xl font-semibold">
            Rate Your Experience
          </DialogTitle>
          <DialogDescription>
            How was your appointment with{" "}
            <span className="font-medium text-foreground">
              {appointment.provider.profile?.full_name ||
                appointment.provider.username}
            </span>
            ?
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-6 py-6">
          {/* Star Rating */}
          <div className="flex flex-col items-center gap-2">
            <div className="flex justify-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  className="focus:outline-none transition-transform hover:scale-110 p-1"
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => setRating(star)}
                >
                  <Star
                    className={cn(
                      "w-8 h-8 transition-colors duration-200",
                      (hoverRating || rating) >= star
                        ? "fill-yellow-400 text-yellow-400"
                        : "fill-muted text-muted-foreground/20"
                    )}
                  />
                </button>
              ))}
            </div>
            <div className="text-sm font-medium text-muted-foreground h-5">
              {hoverRating > 0 ? (
                <span className="text-primary font-semibold animate-in fade-in slide-in-from-bottom-1">
                  {
                    [
                      "Terrible 😞",
                      "Bad 😕",
                      "Okay 😐",
                      "Good 🙂",
                      "Excellent 🤩",
                    ][hoverRating - 1]
                  }
                </span>
              ) : rating > 0 ? (
                <span className="text-primary font-semibold">
                  {
                    [
                      "Terrible 😞",
                      "Bad 😕",
                      "Okay 😐",
                      "Good 🙂",
                      "Excellent 🤩",
                    ][rating - 1]
                  }
                </span>
              ) : (
                "Tap a star to rate"
              )}
            </div>
          </div>

          {/* Comment Box */}
          <div className="grid gap-2">
            <Label htmlFor="comment" className="font-medium">
              Additional Feedback
            </Label>
            <Textarea
              id="comment"
              placeholder="Share your experience..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="resize-none h-24"
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
            className="w-full sm:w-auto"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={mutation.isPending}
            className="w-full sm:w-auto"
          >
            {mutation.isPending ? "Submitting..." : "Submit Review"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const PatientAppointments: React.FC = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [isRateOpen, setIsRateOpen] = useState(false);
  const [appointmentToRate, setAppointmentToRate] =
    useState<Appointment | null>(null);

  const { data: appointments = [], isLoading } = useQuery<Appointment[]>({
    queryKey: ["patientAppointments"],
    queryFn: fetchPatientAppointments,
  });

  const cancelMutation = useMutation({
    mutationFn: cancelAppointment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["patientAppointments"] });
      toast({
        title: "Success",
        description: "Your appointment has been cancelled.",
      });
    },
    // FIX 2: Replaced 'any' with 'AxiosError'
    onError: (error: AxiosError) => {
      // Safely access data, defaulting to an empty object if response is missing
      const errorData = error.response?.data as { error?: string };
      toast({
        variant: "destructive",
        title: "Error",
        description: errorData?.error || "Could not cancel appointment.",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteAppointment,
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Appointment deleted from history.",
      });
    },
    // FIX 3: Replaced 'any' with 'AxiosError'
    onError: (error: AxiosError) => {
      const errorData = error.response?.data as { error?: string };
      toast({
        variant: "destructive",
        title: "Error",
        description: errorData?.error || "Could not delete appointment.",
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["patientAppointments"] });
    },
  });

  const handleCancel = (id: number) => {
    cancelMutation.mutate(id);
  };

  const openRateDialog = (appointment: Appointment) => {
    setAppointmentToRate(appointment);
    setIsRateOpen(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-50 text-yellow-700 border-yellow-200/60 shadow-sm";
      case "scheduled":
        return "bg-blue-50 text-blue-700 border-blue-200/60 shadow-sm";
      case "completed":
        return "bg-green-50 text-green-700 border-green-200/60 shadow-sm";
      case "cancelled":
        return "bg-red-50 text-red-700 border-red-200/60 shadow-sm";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const pendingAppointments = appointments.filter(
    (a) => a.status === "pending"
  );
  const upcomingAppointments = appointments.filter(
    (a) => a.status === "scheduled"
  );
  const historyAppointments = appointments.filter((a) =>
    ["completed", "cancelled"].includes(a.status)
  );

  // --- Styling: Enhanced Appointment Card ---
  const AppointmentCard = ({
    appointment,
    showCancel,
    showDelete,
    showRate,
  }: {
    appointment: Appointment;
    showCancel?: boolean;
    showDelete?: boolean;
    showRate?: boolean;
  }) => (
    <Card
      key={appointment.id}
      className="group border border-border/50 bg-card hover:bg-card/50 transition-all duration-200 hover:shadow-md hover:border-primary/20 rounded-xl overflow-hidden"
    >
      <CardContent className="p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
        {/* Provider Info */}
        <div className="flex items-center gap-4 w-full md:w-auto">
          <Avatar className="w-16 h-16 border-2 border-background shadow-sm group-hover:border-primary/20 transition-colors">
            {/* FIX 4: Safely access profile_picture_url, casting provider.profile to a common type that has it */}
            <AvatarImage
              src={
                (
                  appointment.provider.profile as {
                    profile_picture_url?: string | null;
                  }
                )?.profile_picture_url || undefined
              }
              className="object-cover"
            />
            <AvatarFallback className="bg-primary/5 text-primary font-semibold text-lg">
              {(appointment.provider.profile?.full_name ||
                appointment.provider.username)[0].toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="space-y-1.5">
            <h3 className="font-bold text-lg text-foreground tracking-tight leading-none">
              {appointment.provider.profile.full_name ||
                appointment.provider.username}
            </h3>
            <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground/80 font-medium">
              <div className="flex items-center gap-1.5 bg-secondary/30 px-2 py-0.5 rounded-md">
                <Calendar className="w-3.5 h-3.5" />
                <span>{appointment.date}</span>
              </div>
              <div className="flex items-center gap-1.5 bg-secondary/30 px-2 py-0.5 rounded-md">
                <Clock className="w-3.5 h-3.5" />
                <span>{appointment.time}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Actions & Status */}
        <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 pt-4 md:pt-0 mt-2 md:mt-0">
          <Badge
            variant="outline"
            className={cn(
              "capitalize px-3 py-1 font-medium",
              getStatusColor(appointment.status)
            )}
          >
            {appointment.status}
          </Badge>

          <div className="flex items-center gap-2">
            {/* Action: Rate (Disable if has_review is true) */}
            {showRate && appointment.status === "completed" && (
              <Button
                size="sm"
                variant={appointment.has_review ? "secondary" : "outline"}
                className={cn(
                  "gap-2 transition-all",
                  appointment.has_review
                    ? "opacity-70 cursor-default"
                    : "text-yellow-600 border-yellow-200 hover:bg-yellow-50 hover:border-yellow-300"
                )}
                onClick={() =>
                  !appointment.has_review && openRateDialog(appointment)
                }
                disabled={appointment.has_review}
              >
                {appointment.has_review ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-green-600" /> Rated
                  </>
                ) : (
                  <>
                    <Star className="w-4 h-4 fill-yellow-600" /> Rate
                  </>
                )}
              </Button>
            )}

            {/* Action: Cancel */}
            {showCancel && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:text-destructive hover:bg-destructive/10 font-medium"
                    disabled={cancelMutation.isPending}
                  >
                    <X className="w-4 h-4 mr-1.5" />
                    Cancel
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="rounded-xl">
                  <AlertDialogHeader>
                    <AlertDialogTitle>Cancel Appointment?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure? This will free up the slot for other
                      patients.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel className="rounded-lg">
                      Keep Appointment
                    </AlertDialogCancel>
                    <AlertDialogAction
                      className="bg-destructive hover:bg-destructive/90 rounded-lg"
                      onClick={() => handleCancel(appointment.id)}
                    >
                      Yes, Cancel
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}

            {/* Action: Delete */}
            {showDelete && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-muted-foreground/60 hover:text-destructive hover:bg-destructive/10 transition-colors rounded-full h-8 w-8"
                    disabled={deleteMutation.isPending}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="rounded-xl">
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete History?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently remove this record from your history
                      view.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel className="rounded-lg">
                      Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction
                      className="bg-destructive hover:bg-destructive/90 rounded-lg"
                      onClick={() => deleteMutation.mutate(appointment.id)}
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="p-6 md:p-8 min-h-screen bg-background/50">
      <div className="max-w-8xl mx-auto space-y-8">
        {/* Page Header with gradient text effect */}
        <div className=" flex-col  sm:flex-row items-start sm:items-center justify-between gap-6 pb-6 border-b">
          <div className="mb-8">
            <Card className="shadow-sm bg-card">
              <CardHeader>
                <div className="flex items-center gap-4">
                  <Calendar className="h-8 w-8 text-primary" />
                  <div>
                    <CardTitle className="text-2xl font-bold">
                      My Appointments
                    </CardTitle>
                    <CardDescription className="mt-1">
                      Manage your bookings and view your medical history.
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>
          </div>
          <Button
            asChild
            className="shadow-lg hover:shadow-primary/25 transition-all rounded-full px-6 h-12 text-base"
          >
            <Link
              to="/patient/book-appointment"
              className="flex items-center gap-2"
            >
              <Plus className="w-5 h-5" /> Book New Appointment
            </Link>
          </Button>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
            <p className="text-muted-foreground font-medium">
              Loading your schedule...
            </p>
          </div>
        ) : (
          <Tabs defaultValue="scheduled" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-8 p-1 bg-muted/50 rounded-xl h-14">
              <TabsTrigger
                value="scheduled"
                className="rounded-lg h-12 font-medium data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm transition-all"
              >
                Upcoming{" "}
                <span className="ml-2 bg-primary/10 text-primary px-2 py-0.5 rounded-full text-xs">
                  {upcomingAppointments.length}
                </span>
              </TabsTrigger>
              <TabsTrigger
                value="pending"
                className="rounded-lg h-12 font-medium data-[state=active]:bg-white data-[state=active]:text-yellow-600 data-[state=active]:shadow-sm transition-all"
              >
                Pending{" "}
                <span className="ml-2 bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full text-xs">
                  {pendingAppointments.length}
                </span>
              </TabsTrigger>
              <TabsTrigger
                value="history"
                className="rounded-lg h-12 font-medium data-[state=active]:bg-white data-[state=active]:text-muted-foreground data-[state=active]:shadow-sm transition-all"
              >
                History{" "}
                <span className="ml-2 bg-muted text-muted-foreground px-2 py-0.5 rounded-full text-xs">
                  {historyAppointments.length}
                </span>
              </TabsTrigger>
            </TabsList>

            <div className="mt-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <TabsContent value="pending" className="space-y-4">
                {pendingAppointments.length > 0 ? (
                  pendingAppointments.map((app) => (
                    <AppointmentCard
                      key={app.id}
                      appointment={app}
                      showCancel={true}
                    />
                  ))
                ) : (
                  <EmptyState
                    message="No pending appointment requests."
                    icon={Clock}
                  />
                )}
              </TabsContent>

              <TabsContent value="scheduled" className="space-y-4">
                {upcomingAppointments.length > 0 ? (
                  upcomingAppointments.map((app) => (
                    <AppointmentCard
                      key={app.id}
                      appointment={app}
                      showCancel={true}
                    />
                  ))
                ) : (
                  <EmptyState
                    message="No upcoming appointments scheduled."
                    icon={Calendar}
                  />
                )}
              </TabsContent>

              <TabsContent value="history" className="space-y-4">
                {historyAppointments.length > 0 ? (
                  historyAppointments.map((app) => (
                    <AppointmentCard
                      key={app.id}
                      appointment={app}
                      showDelete={true}
                      showRate={true}
                    />
                  ))
                ) : (
                  <EmptyState
                    message="No past appointment history."
                    icon={User}
                  />
                )}
              </TabsContent>
            </div>
          </Tabs>
        )}
      </div>

      <RateDialog
        isOpen={isRateOpen}
        onClose={() => setIsRateOpen(false)}
        appointment={appointmentToRate}
      />
    </div>
  );
};

const EmptyState = ({
  message,
  icon: Icon,
}: {
  message: string;
  icon: React.ElementType;
}) => (
  <div className="text-center py-20 bg-muted/5 rounded-2xl border-2 border-dashed border-muted-foreground/20 flex flex-col items-center justify-center">
    <div className="p-4 bg-background rounded-full shadow-sm mb-4">
      <Icon className="w-8 h-8 text-muted-foreground/50" />
    </div>
    <p className="text-muted-foreground font-medium text-lg">{message}</p>
  </div>
);

export default PatientAppointments;
