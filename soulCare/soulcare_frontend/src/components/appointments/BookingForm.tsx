/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/api";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";

interface BookingFormProps {
  providerId: number;
  selectedDate: Date;
  selectedTime: string;
  closeModal: () => void;
}

const bookAppointment = async (appointmentData: {
  provider: number;
  date: string;
  time: string;
  notes: string;
}) => {
  const { data } = await api.post("/appointments/", appointmentData);
  return data;
};

const BookingForm: React.FC<BookingFormProps> = ({
  providerId,
  selectedDate,
  selectedTime,
  closeModal,
}) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [notes, setNotes] = useState("");

  const mutation = useMutation({
    mutationFn: bookAppointment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["patientAppointments"] });
      toast({
        title: "Success!",
        description: "Your appointment request has been sent.",
      });
      closeModal();
      navigate("/patient/appointments");
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Error",
        description:
          error.response?.data?.error || "Could not book appointment.",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate({
      provider: providerId,
      date: format(selectedDate, "yyyy-MM-dd"),
      time: selectedTime,
      notes,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 pt-4">
      <div className="p-4 bg-muted rounded-md text-center">
        <p>You are booking an appointment for:</p>
        <p className="font-bold text-lg">
          {format(selectedDate, "EEEE, MMMM d, yyyy")} at {selectedTime}
        </p>
      </div>
      <div>
        <Label htmlFor="notes">Reason for visit (optional)</Label>
        <Textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Briefly describe the reason for your appointment..."
        />
      </div>
      <Button type="submit" className="w-full" disabled={mutation.isPending}>
        {mutation.isPending ? "Requesting..." : "Confirm & Request Appointment"}
      </Button>
    </form>
  );
};

export default BookingForm;
