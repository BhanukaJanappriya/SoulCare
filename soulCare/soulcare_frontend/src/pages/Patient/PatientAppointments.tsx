import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Calendar,
  Clock,
  MapPin,
  Search,
  Filter,
  Plus,
  Video,
  MessageCircle,
  Star,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Mock data for appointments
const mockAppointments = [
  {
    id: "1",
    doctorName: "Dr. Sarah Wilson",
    doctorImage: "/placeholder.svg",
    specialty: "Cardiologist",
    date: "2024-01-15",
    time: "10:00 AM",
    status: "upcoming",
    type: "video",
    location: "Online Consultation",
    rating: 4.8,
    notes: "Follow-up for heart condition",
  },
  {
    id: "2",
    doctorName: "Dr. Michael Chen",
    doctorImage: "/placeholder.svg",
    specialty: "Psychiatrist",
    date: "2024-01-10",
    time: "2:30 PM",
    status: "completed",
    type: "in-person",
    location: "Mental Health Clinic",
    rating: 4.9,
    notes: "Therapy session",
  },
  {
    id: "3",
    doctorName: "Dr. Emily Brown",
    doctorImage: "/placeholder.svg",
    specialty: "General Physician",
    date: "2024-01-20",
    time: "11:30 AM",
    status: "upcoming",
    type: "video",
    location: "Online Consultation",
    rating: 4.7,
    notes: "Regular checkup",
  },
];

const PatientAppointments: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<
    "all" | "upcoming" | "completed" | "cancelled"
  >("all");

  const getStatusColor = (status: string) => {
    switch (status) {
      case "upcoming":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
      case "completed":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "cancelled":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
    }
  };

  const getTypeIcon = (type: string) => {
    return type === "video" ? Video : MapPin;
  };

  const filteredAppointments = mockAppointments.filter((appointment) => {
    const matchesSearch =
      appointment.doctorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.specialty.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter =
      filterStatus === "all" || appointment.status === filterStatus;

    return matchesSearch && matchesFilter;
  });

  return (
    <div className="min-h-screen bg-background">
      

      <div className="p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                My Appointments
              </h1>
              <p className="text-muted-foreground mt-1">
                Manage your healthcare appointments
              </p>
            </div>
            <Button className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Book Appointment
            </Button>
          </div>

          {/* Filters and Search */}
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="flex gap-2">
                  {(["all", "upcoming", "completed", "cancelled"] as const).map(
                    (status) => (
                      <Button
                        key={status}
                        variant={
                          filterStatus === status ? "default" : "outline"
                        }
                        size="sm"
                        onClick={() => setFilterStatus(status)}
                        className="capitalize"
                      >
                        {status}
                      </Button>
                    )
                  )}
                </div>

                <div className="flex gap-2 items-center">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search doctor or specialty..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 w-64"
                    />
                  </div>
                  <Button variant="outline" size="icon">
                    <Filter className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Appointments List */}
          <div className="grid gap-4">
            {filteredAppointments.length > 0 ? (
              filteredAppointments.map((appointment) => {
                const TypeIcon = getTypeIcon(appointment.type);

                return (
                  <Card
                    key={appointment.id}
                    className="hover:shadow-lg transition-shadow"
                  >
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <Avatar className="w-16 h-16">
                            <AvatarImage
                              src={appointment.doctorImage}
                              alt={appointment.doctorName}
                            />
                            <AvatarFallback>
                              <User className="w-8 h-8" />
                            </AvatarFallback>
                          </Avatar>

                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold text-lg">
                                {appointment.doctorName}
                              </h3>
                              <div className="flex items-center gap-1">
                                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                <span className="text-sm text-muted-foreground">
                                  {appointment.rating}
                                </span>
                              </div>
                            </div>
                            <p className="text-muted-foreground">
                              {appointment.specialty}
                            </p>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                {appointment.date}
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                {appointment.time}
                              </div>
                              <div className="flex items-center gap-1">
                                <TypeIcon className="w-4 h-4" />
                                {appointment.location}
                              </div>
                            </div>
                            {appointment.notes && (
                              <p className="text-sm text-muted-foreground mt-2">
                                Note: {appointment.notes}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <Badge
                            className={cn(
                              "",
                              getStatusColor(appointment.status)
                            )}
                          >
                            {appointment.status}
                          </Badge>

                          {appointment.status === "upcoming" && (
                            <div className="flex gap-2">
                              {appointment.type === "video" && (
                                <Button
                                  size="sm"
                                  className="flex items-center gap-1"
                                >
                                  <Video className="w-4 h-4" />
                                  Join Call
                                </Button>
                              )}
                              <Button
                                variant="outline"
                                size="sm"
                                className="flex items-center gap-1"
                              >
                                <MessageCircle className="w-4 h-4" />
                                Message
                              </Button>
                            </div>
                          )}

                          {appointment.status === "completed" && (
                            <Button variant="outline" size="sm">
                              View Report
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">
                    No appointments found
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    {searchTerm || filterStatus !== "all"
                      ? "No appointments match your current filters"
                      : "You don't have any appointments yet"}
                  </p>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Book Your First Appointment
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientAppointments;
