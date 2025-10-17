import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, axiosInstance } from '@/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { XCircle } from 'lucide-react';
import { RightSidebar } from '@/components/layout/RightSidebar';

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

const Schedule: React.FC = () => {
    const { data: schedules = [], isLoading } = useQuery<Schedule[]>({
        queryKey: ['providerSchedule'],
        queryFn: fetchSchedule,
    });

    const groupedSchedules = schedules.reduce((acc, s) => {
        (acc[s.day_of_week] = acc[s.day_of_week] || []).push(s);
        return acc;
    }, {} as Record<number, Schedule[]>);

    return (
        <div className="min-h-screen healthcare-gradient pr-16">
            <RightSidebar />
            <div className="p-6 max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold text-foreground mb-6">Manage Your Weekly Schedule</h1>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <ScheduleForm />
                    <div className="space-y-4">
                        <h2 className="text-2xl font-semibold">Your Current Availability</h2>
                        {isLoading ? <p>Loading schedule...</p> : (
                            dayMap.map((day, index) => (
                                groupedSchedules[index] && (
                                    <div key={index}>
                                        <h3 className="font-bold">{day}</h3>
                                        {groupedSchedules[index].map(s => (
                                            <ScheduleItem key={s.id} schedule={s} />
                                        ))}
                                    </div>
                                )
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

const ScheduleForm: React.FC = () => {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [dayOfWeek, setDayOfWeek] = useState<string>();
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');

    const mutation = useMutation({
        mutationFn: addSchedule,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['providerSchedule'] });
            toast({ title: "Success", description: "New time block added to your schedule." });
        },
        onError: () => toast({ variant: "destructive", title: "Error", description: "Could not add schedule." })
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (dayOfWeek) {
            mutation.mutate({ day_of_week: parseInt(dayOfWeek), start_time: startTime, end_time: endTime });
        }
    };

    return (
        <Card>
            <CardHeader><CardTitle>Add New Time Block</CardTitle></CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <Label>Day of the Week</Label>
                        <Select onValueChange={setDayOfWeek} required>
                            <SelectTrigger><SelectValue placeholder="Select a day" /></SelectTrigger>
                            <SelectContent>
                                {dayMap.map((day, index) => <SelectItem key={index} value={String(index)}>{day}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="start_time">Start Time</Label>
                            <Input id="start_time" type="time" value={startTime} onChange={e => setStartTime(e.target.value)} required />
                        </div>
                        <div>
                            <Label htmlFor="end_time">End Time</Label>
                            <Input id="end_time" type="time" value={endTime} onChange={e => setEndTime(e.target.value)} required />
                        </div>
                    </div>
                    <Button type="submit" className="w-full" disabled={mutation.isPending}>
                        {mutation.isPending ? "Saving..." : "Add to Schedule"}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
};

const ScheduleItem: React.FC<{ schedule: Schedule }> = ({ schedule }) => {
    const queryClient = useQueryClient();
    const mutation = useMutation({
        mutationFn: deleteSchedule,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['providerSchedule'] })
    });

    return (
        <div className="flex items-center justify-between p-2 bg-muted rounded-md">
            <p>{schedule.start_time.slice(0, 5)} - {schedule.end_time.slice(0, 5)}</p>
            <Button variant="ghost" size="icon" onClick={() => mutation.mutate(schedule.id)}>
                <XCircle className="w-4 h-4 text-red-500" />
            </Button>
        </div>
    );
};

export default Schedule;