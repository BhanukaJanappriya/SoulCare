import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { RightSidebar } from "@/components/layout/RightSidebar";
import {
  Search,
  Filter,
  Plus,
  MoreHorizontal,
  User,
  Phone,
  Mail,
  Calendar,
  AlertTriangle,
} from "lucide-react";

const Patients: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const mockPatients = [
    {
      id: "1",
      name: "Sarah Johnson",
      email: "sarah.j@email.com",
      phone: "+1 (555) 123-4567",
      age: 28,
      lastVisit: "2024-01-15",
      condition: "Anxiety Disorder",
      status: "active",
      riskLevel: "low",
    },
    {
      id: "2",
      name: "Mike Chen",
      email: "mike.chen@email.com",
      phone: "+1 (555) 234-5678",
      age: 35,
      lastVisit: "2024-01-14",
      condition: "Depression",
      status: "active",
      riskLevel: "medium",
    },
    {
      id: "3",
      name: "Emma Wilson",
      email: "emma.w@email.com",
      phone: "+1 (555) 345-6789",
      age: 42,
      lastVisit: "2024-01-12",
      condition: "PTSD",
      status: "inactive",
      riskLevel: "high",
    },
    {
      id: "4",
      name: "James Rodriguez",
      email: "james.r@email.com",
      phone: "+1 (555) 456-7890",
      age: 29,
      lastVisit: "2024-01-16",
      condition: "Bipolar Disorder",
      status: "active",
      riskLevel: "medium",
    },
  ];

  const filteredPatients = mockPatients.filter(
    (patient) =>
      patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.condition.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRiskLevelColor = (riskLevel: string) => {
    switch (riskLevel) {
      case "high":
        return "bg-destructive text-destructive-foreground";
      case "medium":
        return "bg-warning text-warning-foreground";
      case "low":
        return "bg-success text-success-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getStatusColor = (status: string) => {
    return status === "active"
      ? "bg-success/20 text-success"
      : "bg-muted text-muted-foreground";
  };

  return (
    <div className="min-h-screen healthcare-gradient pr-16">
      <RightSidebar />

      <div className="p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Patient Management
            </h1>
            <p className="text-muted-foreground">
              Manage your patient roster and track their progress
            </p>
          </div>
          <Button className="healthcare-button-primary">
            <Plus className="w-4 h-4 mr-2" />
            Add New Patient
          </Button>
        </div>

        {/* Search and Filters */}
        <Card className="healthcare-card mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search patients by name, email, or condition..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button variant="outline">
                <Filter className="w-4 h-4 mr-2" />
                Filter
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Patients Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPatients.map((patient) => (
            <Card
              key={patient.id}
              className="healthcare-card hover:shadow-lg transition-shadow"
            >
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                      <User className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{patient.name}</CardTitle>
                      <CardDescription>Age: {patient.age}</CardDescription>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Contact Info */}
                <div className="space-y-2">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Mail className="w-4 h-4 mr-2" />
                    {patient.email}
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Phone className="w-4 h-4 mr-2" />
                    {patient.phone}
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Calendar className="w-4 h-4 mr-2" />
                    Last visit:{" "}
                    {new Date(patient.lastVisit).toLocaleDateString()}
                  </div>
                </div>

                {/* Condition */}
                <div>
                  <p className="text-sm font-medium text-foreground mb-1">
                    Condition:
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {patient.condition}
                  </p>
                </div>

                {/* Status and Risk Level */}
                <div className="flex items-center justify-between">
                  <Badge className={getStatusColor(patient.status)}>
                    {patient.status.charAt(0).toUpperCase() +
                      patient.status.slice(1)}
                  </Badge>
                  <div className="flex items-center">
                    {patient.riskLevel === "high" && (
                      <AlertTriangle className="w-4 h-4 text-destructive mr-1" />
                    )}
                    <Badge className={getRiskLevelColor(patient.riskLevel)}>
                      {patient.riskLevel.charAt(0).toUpperCase() +
                        patient.riskLevel.slice(1)}{" "}
                      Risk
                    </Badge>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex space-x-2 pt-2">
                  <Button
                    size="sm"
                    className="flex-1 healthcare-button-primary"
                  >
                    View Details
                  </Button>
                  <Button size="sm" variant="outline" className="flex-1">
                    Schedule
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {filteredPatients.length === 0 && (
          <Card className="healthcare-card">
            <CardContent className="text-center py-12">
              <User className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">
                No patients found
              </h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm
                  ? "Try adjusting your search criteria or add a new patient."
                  : "Start by adding your first patient to the system."}
              </p>
              <Button className="healthcare-button-primary">
                <Plus className="w-4 h-4 mr-2" />
                Add New Patient
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Patients;
