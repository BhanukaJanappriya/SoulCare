import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { axiosInstance } from '@/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Calendar, Clock, PlusCircle, Trash2, XCircle, Loader2 } from 'lucide-react';
import { RightSidebar } from '@/components/layout/RightSidebar';
import { Badge } from "@/components/ui/badge";
import { format, parse } from 'date-fns';

interface Schedule {
    id: number;
    day_of_week: number;
    start_time: string;
    end_time: string;
}

const fetchSchedule = async (): Promise<Schedule[]> => {
    const { data } = await axiosInstance.get<Schedule[]>('/schedules/');
    return data;
};

const addSchedule = async (newSchedule: Omit<Schedule, 'id'>) => {
    const { data } = await axiosInstance.post('/schedules/', newSchedule);
    return data;
};

const deleteSchedule = async (scheduleId: number) => {
    await axiosInstance.delete(`/schedules/${scheduleId}/`);
};

const dayMap = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

// Helper to generate time slots for the dropdown
const generateTimeSlots = () => {
    const slots = [];
    for (let i = 0; i < 24; i++) {
        for (let j = 0; j < 60; j += 30) {
            const hour = i.toString().padStart(2, '0');
            const minute = j.toString().padStart(2, '0');
            slots.push(`${hour}:${minute}`);
        }
    }
    return slots;
};
const timeSlots = generateTimeSlots();

const Schedule: React.FC = () => {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

    const { data: schedules = [], isLoading } = useQuery<Schedule[]>({
        queryKey: ['providerSchedule'],
        queryFn: fetchSchedule,
    });

    const createMutation = useMutation({
        mutationFn: addSchedule,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['providerSchedule'] });
            toast({ title: "Success", description: "Availability added." });
            setIsCreateDialogOpen(false);
        },
        onError: () => toast({ variant: "destructive", title: "Error", description: "Could not add time block." })
    });

    const deleteMutation = useMutation({
        mutationFn: deleteSchedule,
        onSuccess: () => {
             queryClient.invalidateQueries({ queryKey: ['providerSchedule'] });
             toast({ title: "Removed", description: "Time block removed." });
        }
    });

    // Group schedules by day
    const groupedSchedules = schedules.reduce((acc, s) => {
        (acc[s.day_of_week] = acc[s.day_of_week] || []).push(s);
        return acc;
    }, {} as Record<number, Schedule[]>);

    // Sort days so they appear Mon-Sun
    const sortedDays = Object.keys(groupedSchedules).map(Number).sort((a, b) => a - b);

    return (
        <div className="min-h-screen bg-background text-foreground ">
            <RightSidebar />
            <div className="space-y-8 p-6 md:p-8 min-h-screen bg-background mr-16 ">
                
                {/* --- HEADER --- */}
                <Card className="shadow-sm bg-card">
                    <CardHeader>
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                                <div className="bg-primary/10 p-3 rounded-full">
                                     <Calendar className="h-8 w-8 text-primary" />
                                </div>
                                <div>
                                    <CardTitle className="text-2xl font-bold">Weekly Schedule</CardTitle>
                                    <CardDescription className="mt-1">
                                        Set your recurring weekly availability for appointments.
                                    </CardDescription>
                                </div>
                            </div>

                            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                                <DialogTrigger asChild>
                                    <Button>
                                        <PlusCircle className="mr-2 h-4 w-4" /> Add Availability
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-[425px]">
                                    <DialogHeader>
                                        <DialogTitle>Add Time Block</DialogTitle>
                                    </DialogHeader>
                                    <ScheduleForm 
                                        onSubmit={(data) => createMutation.mutate(data)} 
                                        isLoading={createMutation.isPending} 
                                    />
                                </DialogContent>
                            </Dialog>
                        </div>
                    </CardHeader>
                </Card>

                {/* --- SCHEDULE GRID --- */}
                {isLoading ? (
                     <div className="flex justify-center items-center py-20">
                        <Loader2 className="h-10 w-10 animate-spin text-primary" />
                    </div>
                ) : sortedDays.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {sortedDays.map((dayIndex) => (
                            <Card key={dayIndex} className="shadow-sm border hover:border-primary/50 transition-colors">
                                <CardHeader className="pb-3 border-b bg-muted/20">
                                    <CardTitle className="text-lg font-medium flex items-center justify-between">
                                        {dayMap[dayIndex]}
                                        <Badge variant="secondary" className="text-xs font-normal">
                                            {groupedSchedules[dayIndex].length} Slots
                                        </Badge>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="pt-4 space-y-2">
                                    {groupedSchedules[dayIndex]
                                        .sort((a, b) => a.start_time.localeCompare(b.start_time)) // Sort by start time
                                        .map((slot) => (
                                        <div key={slot.id} className="flex items-center justify-between p-2 rounded-md bg-background border group hover:shadow-sm transition-all">
                                            <div className="flex items-center text-sm font-medium">
                                                <Clock className="w-4 h-4 mr-2 text-muted-foreground" />
                                                {/* Format time nicely (remove seconds) */}
                                                {slot.start_time.substring(0, 5)} - {slot.end_time.substring(0, 5)}
                                            </div>
                                            <Button 
                                                variant="ghost" 
                                                size="icon" 
                                                className="h-7 w-7 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                                                onClick={() => deleteMutation.mutate(slot.id)}
                                                disabled={deleteMutation.isPending}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-16 bg-muted/10 rounded-xl border-2 border-dashed border-muted-foreground/20">
                        <Calendar className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-foreground">No availability set</h3>
                        <p className="text-muted-foreground mt-1">Click "Add Availability" to start setting up your schedule.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

// --- FORM COMPONENT ---
const ScheduleForm: React.FC<{ 
    onSubmit: (data: Omit<Schedule, 'id'>) => void; 
    isLoading: boolean 
}> = ({ onSubmit, isLoading }) => {
    const [dayOfWeek, setDayOfWeek] = useState<string>();
    const [startTime, setStartTime] = useState<string>('09:00');
    const [endTime, setEndTime] = useState<string>('17:00');
    const { toast } = useToast();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!dayOfWeek) {
             toast({ variant: "destructive", title: "Error", description: "Please select a day." });
             return;
        }
        // Basic validation
        if (startTime >= endTime) {
            toast({ variant: "destructive", title: "Invalid Time", description: "End time must be after start time." });
            return;
        }

        onSubmit({ 
            day_of_week: parseInt(dayOfWeek), 
            start_time: startTime, 
            end_time: endTime 
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 py-2">
            <div className="space-y-2">
                <Label>Day of the Week</Label>
                <Select onValueChange={setDayOfWeek} required>
                    <SelectTrigger>
                        <SelectValue placeholder="Select day" />
                    </SelectTrigger>
                    <SelectContent>
                        {dayMap.map((day, index) => (
                            <SelectItem key={index} value={String(index)}>{day}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label>Start Time</Label>
                    <Select value={startTime} onValueChange={setStartTime}>
                        <SelectTrigger>
                            <SelectValue placeholder="Start" />
                        </SelectTrigger>
                        <SelectContent className="max-h-[200px]">
                            {timeSlots.map((time) => (
                                <SelectItem key={`start-${time}`} value={time}>
                                    {time}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label>End Time</Label>
                    <Select value={endTime} onValueChange={setEndTime}>
                         <SelectTrigger>
                            <SelectValue placeholder="End" />
                        </SelectTrigger>
                        <SelectContent className="max-h-[200px]">
                            {timeSlots.map((time) => (
                                <SelectItem key={`end-${time}`} value={time}>
                                    {time}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="pt-2">
                <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
                        </>
                    ) : (
                        "Save Time Block"
                    )}
                </Button>
            </div>
        </form>
    );
};

export default Schedule;