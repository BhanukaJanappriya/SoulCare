import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { RightSidebar } from "@/components/layout/RightSidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  User,
  Video,
  MapPin,
  Plus,
} from "lucide-react";

interface ScheduleEvent {
  id: string;
  title: string;
  patientName: string;
  type: "consultation" | "follow-up" | "therapy" | "emergency";
  startTime: Date;
  endTime: Date;
  location: "online" | "office";
  status: "confirmed" | "pending" | "completed";
}

const mockEvents: ScheduleEvent[] = [
  {
    id: "1",
    title: "Initial Consultation",
    patientName: "Sarah Johnson",
    type: "consultation",
    startTime: new Date(2024, 1, 15, 9, 0),
    endTime: new Date(2024, 1, 15, 10, 0),
    location: "online",
    status: "confirmed",
  },
  {
    id: "2",
    title: "Therapy Session",
    patientName: "Michael Chen",
    type: "therapy",
    startTime: new Date(2024, 1, 15, 11, 30),
    endTime: new Date(2024, 1, 15, 12, 30),
    location: "office",
    status: "confirmed",
  },
  {
    id: "3",
    title: "Follow-up Appointment",
    patientName: "Emma Wilson",
    type: "follow-up",
    startTime: new Date(2024, 1, 15, 14, 0),
    endTime: new Date(2024, 1, 15, 14, 30),
    location: "online",
    status: "pending",
  },
];

export default function Schedule() {
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [viewMode, setViewMode] = useState<"day" | "week" | "month">("week");

  const timeSlots = Array.from({ length: 12 }, (_, i) => {
    const hour = i + 8; // Starting from 8 AM
    return `${hour.toString().padStart(2, "0")}:00`;
  });

  const getWeekDays = (date: Date) => {
    const week = [];
    const startOfWeek = new Date(date);
    startOfWeek.setDate(date.getDate() - date.getDay());

    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      week.push(day);
    }
    return week;
  };

  const getEventsForDate = (date: Date) => {
    return mockEvents.filter(
      (event) => event.startTime.toDateString() === date.toDateString()
    );
  };

  const getTypeColor = (type: ScheduleEvent["type"]) => {
    switch (type) {
      case "consultation":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "therapy":
        return "bg-green-100 text-green-800 border-green-200";
      case "follow-up":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "emergency":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusColor = (status: ScheduleEvent["status"]) => {
    switch (status) {
      case "confirmed":
        return "bg-success";
      case "pending":
        return "bg-warning";
      case "completed":
        return "bg-gray-500";
      default:
        return "bg-gray-400";
    }
  };

  const navigateWeek = (direction: "prev" | "next") => {
    const newWeek = new Date(currentWeek);
    newWeek.setDate(currentWeek.getDate() + (direction === "next" ? 7 : -7));
    setCurrentWeek(newWeek);
  };

  return (
    <div className="min-h-screen bg-page-bg flex">
      <div className="flex-1 pr-16">
        <div className="container mx-auto px-6 py-8">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-text-dark mb-2">
                Schedule
              </h1>
              <p className="text-text-muted">
                Manage your appointments and availability
              </p>
            </div>
            <div className="flex gap-3">
              <div className="flex bg-white rounded-lg border">
                {(["day", "week", "month"] as const).map((mode) => (
                  <Button
                    key={mode}
                    variant={viewMode === mode ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode(mode)}
                    className="capitalize rounded-none first:rounded-l-lg last:rounded-r-lg"
                  >
                    {mode}
                  </Button>
                ))}
              </div>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add Slot
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Calendar Sidebar */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Calendar</CardTitle>
                </CardHeader>
                <CardContent>
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => date && setSelectedDate(date)}
                    className="rounded-md border-0"
                  />
                </CardContent>
              </Card>

              {/* Today's Summary */}
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle className="text-lg">Today's Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-text-muted">Total Appointments</span>
                    <span className="font-semibold">3</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-muted">Online Sessions</span>
                    <span className="font-semibold">2</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-muted">Office Visits</span>
                    <span className="font-semibold">1</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-muted">Available Slots</span>
                    <span className="font-semibold">4</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Schedule View */}
            <div className="lg:col-span-3">
              {viewMode === "week" && (
                <Card>
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <CardTitle>
                        Week of{" "}
                        {currentWeek.toLocaleDateString("en-US", {
                          month: "long",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </CardTitle>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigateWeek("prev")}
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigateWeek("next")}
                        >
                          <ChevronRight className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-8 gap-px bg-gray-200 rounded-lg overflow-hidden">
                      {/* Time column header */}
                      <div className="bg-white p-3 font-medium text-center">
                        Time
                      </div>

                      {/* Day headers */}
                      {getWeekDays(currentWeek).map((day, index) => (
                        <div key={index} className="bg-white p-3 text-center">
                          <div className="font-medium">
                            {day.toLocaleDateString("en-US", {
                              weekday: "short",
                            })}
                          </div>
                          <div className="text-sm text-text-muted">
                            {day.getDate()}
                          </div>
                        </div>
                      ))}

                      {/* Time slots and appointments */}
                      {timeSlots.map((time, timeIndex) => (
                        <React.Fragment key={timeIndex}>
                          {/* Time label */}
                          <div className="bg-gray-50 p-3 text-sm text-text-muted text-center">
                            {time}
                          </div>

                          {/* Day cells */}
                          {getWeekDays(currentWeek).map((day, dayIndex) => {
                            const events = getEventsForDate(day).filter(
                              (event) => {
                                const eventHour = event.startTime.getHours();
                                const slotHour = parseInt(time.split(":")[0]);
                                return eventHour === slotHour;
                              }
                            );

                            return (
                              <div
                                key={dayIndex}
                                className="bg-white p-1 min-h-[60px] relative"
                              >
                                {events.map((event) => (
                                  <div
                                    key={event.id}
                                    className={`p-2 rounded text-xs ${getTypeColor(
                                      event.type
                                    )} cursor-pointer hover:shadow-sm transition-shadow`}
                                  >
                                    <div className="flex items-center gap-1 mb-1">
                                      <div
                                        className={`w-2 h-2 rounded-full ${getStatusColor(
                                          event.status
                                        )}`}
                                      />
                                      {event.location === "online" ? (
                                        <Video className="w-3 h-3" />
                                      ) : (
                                        <MapPin className="w-3 h-3" />
                                      )}
                                    </div>
                                    <div className="font-medium truncate">
                                      {event.patientName}
                                    </div>
                                    <div className="text-xs opacity-75">
                                      {event.startTime.toLocaleTimeString(
                                        "en-US",
                                        {
                                          hour: "numeric",
                                          minute: "2-digit",
                                        }
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            );
                          })}
                        </React.Fragment>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Upcoming Appointments */}
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Upcoming Appointments</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {mockEvents.map((event) => (
                      <div
                        key={event.id}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center gap-4">
                          <div className="flex flex-col items-center">
                            <Clock className="w-5 h-5 text-primary mb-1" />
                            <span className="text-sm font-medium">
                              {event.startTime.toLocaleTimeString("en-US", {
                                hour: "numeric",
                                minute: "2-digit",
                              })}
                            </span>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <User className="w-4 h-4 text-text-muted" />
                              <span className="font-medium">
                                {event.patientName}
                              </span>
                              <Badge className={getTypeColor(event.type)}>
                                {event.type}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-text-muted">
                              {event.location === "online" ? (
                                <>
                                  <Video className="w-4 h-4" />
                                  <span>Online Session</span>
                                </>
                              ) : (
                                <>
                                  <MapPin className="w-4 h-4" />
                                  <span>Office Visit</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-3 h-3 rounded-full ${getStatusColor(
                              event.status
                            )}`}
                          />
                          <span className="text-sm capitalize">
                            {event.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
      <RightSidebar />
    </div>
  );
}
