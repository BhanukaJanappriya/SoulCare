// src/pages/Patients.tsx
import React, { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { getDoctorPatients } from "@/api";
import { PatientOption } from "@/types";
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
import { RightSidebar } from "@/components/layout/RightSidebar"; // Assuming path is correct
import {
  Search,
  Filter,
  MoreHorizontal,
  User,
  Phone,
  Mail,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast"; // Ensure path is correct
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuPortal,
} from "@/components/ui/dropdown-menu";

// Define filter types
type StatusFilter = "all" | "active" | "inactive";
type RiskFilter = "all" | "low" | "medium" | "high";

// --- Patient Card Component ---
interface PatientCardProps {
  patient: PatientOption;
  // Mock data for status/risk - replace when available from API
  mockStatus: "active" | "inactive";
  mockRiskLevel: "low" | "medium" | "high";
}

const PatientCard: React.FC<PatientCardProps> = ({
  patient,
  mockStatus,
  mockRiskLevel,
}) => {
  const navigate = useNavigate();
  const { toast } = useToast(); // Correct place to call useToast

  const handleViewDetails = () => navigate(`/patient-details/${patient.id}`);

  // handleSchedule function removed

  const handleWritePrescription = () => {
    // Navigate to the main prescriptions page
    navigate("/prescriptions");

    // Optional: Show a toast to guide the user what to do next
    toast({
      title: "Navigated to Prescriptions",
      description: `Click "Create New Prescription" and select '${
        patient.full_name
      }' from the list.`,
    });
  };
  const handleViewHistory = () => {
    toast({
      title: "Action",
      description: `View history for ${patient.full_name || patient.username}`,
    });
    // Future: navigate(`/patient-details/${patient.id}?section=history`);
  };

  // Helper functions for styling
  const getRiskLevelColor = (riskLevel?: string) => {
    switch (riskLevel) {
      case "high":
        return "bg-destructive text-destructive-foreground hover:bg-destructive/80";
      case "medium":
        return "bg-yellow-500 text-black hover:bg-yellow-500/80";
      case "low":
        return "bg-green-600 text-white hover:bg-green-600/80";
      default:
        return "bg-muted text-muted-foreground hover:bg-muted/80";
    }
  };

  const getStatusColor = (status?: string) => {
    return status === "active"
      ? "bg-green-100 text-green-700 border border-green-200"
      : "bg-gray-100 text-gray-500 border border-gray-200";
  };

  return (
    <Card className="healthcare-card hover:shadow-lg transition-shadow flex flex-col bg-card text-card-foreground">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          {/* Patient Info */}
          <div className="flex items-center space-x-3 overflow-hidden">
            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
              <User className="w-5 h-5 text-primary" />
            </div>
            <div className="min-w-0">
              <CardTitle className="text-base font-semibold truncate">
                {patient.full_name || patient.username}
              </CardTitle>
              <CardDescription className="text-xs truncate">
                NIC: {patient.nic || "N/A"}
              </CardDescription>
            </div>
          </div>
          {/* More Actions Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 flex-shrink-0 text-muted-foreground"
              >
                <MoreHorizontal className="w-4 h-4" />
                <span className="sr-only">More options</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleViewDetails}>
                View Details
              </DropdownMenuItem>
              {/* Schedule Appointment item removed */}
              <DropdownMenuItem onClick={handleWritePrescription}>
                Write Prescription
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleViewHistory}>
                View History
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent className="space-y-2 flex-grow text-sm pb-4">
        <div className="flex items-center text-muted-foreground">
          <Mail className="w-4 h-4 mr-2 flex-shrink-0" />
          <span className="truncate">{patient.email || "No email"}</span>
        </div>
        <div className="flex items-center text-muted-foreground">
          <Phone className="w-4 h-4 mr-2 flex-shrink-0" />
          {patient.contact_number || "No phone"}
        </div>
      </CardContent>

      <div className="p-4 pt-2 border-t flex items-center justify-between">
        {/* Status and Risk (Using Mock Data) */}
        <div className="flex items-center space-x-2">
          <Badge
            variant="outline"
            className={
              getStatusColor(mockStatus) + " text-xs font-medium px-2 py-0.5"
            }
          >
            {mockStatus.charAt(0).toUpperCase() + mockStatus.slice(1)}
          </Badge>
          <Badge
            className={
              getRiskLevelColor(mockRiskLevel) +
              " text-xs font-medium px-2 py-0.5"
            }
          >
            {mockRiskLevel === "high" && (
              <AlertTriangle className="w-3 h-3 mr-1 inline-block" />
            )}
            {mockRiskLevel.charAt(0).toUpperCase() + mockRiskLevel.slice(1)}{" "}
            Risk
          </Badge>
        </div>
        {/* Simple View Details Button (Dropdown handles other actions) */}
        <Button
          size="sm"
          variant="link"
          className="h-auto p-0 text-primary"
          onClick={handleViewDetails}
        >
          View
        </Button>
      </div>
    </Card>
  );
};

// --- Main Patients Page Component ---
const Patients: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast(); // Correct place to call useToast

  // --- Filter State ---
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [riskFilter, setRiskFilter] = useState<RiskFilter>("all");

  // --- Fetch Patients ---
  const {
    data: patients = [],
    isLoading,
    error: fetchError,
  } = useQuery<PatientOption[]>({
    queryKey: ["doctorPatients"],
    queryFn: getDoctorPatients,
    staleTime: 5 * 60 * 1000,
  });

  // --- MOCK DATA INJECTION (Remove when API provides status/risk) ---
  const patientsWithMockData = useMemo(() => {
    return patients.map((p) => ({
      ...p,
      mockStatus: (p.id % 2 === 0 ? "active" : "inactive") as
        | "active"
        | "inactive",
      mockRiskLevel: ["low", "medium", "high"][p.id % 3] as
        | "low"
        | "medium"
        | "high",
    }));
  }, [patients]);
  // --- END MOCK DATA INJECTION ---

  // --- Combined Filtering Logic ---
  const filteredPatients = useMemo(() => {
    let results = patientsWithMockData; // Start with fetched (and mocked) data

    // Apply search term filter
    if (searchTerm) {
      const lowerSearchTerm = searchTerm.toLowerCase();
      results = results.filter(
        (patient) =>
          (patient.full_name && patient.full_name.toLowerCase().includes(lowerSearchTerm)) ||
          patient.username.toLowerCase().includes(lowerSearchTerm) ||
          (patient.email && patient.email.toLowerCase().includes(lowerSearchTerm)) ||
          (patient.nic && patient.nic.toLowerCase().includes(lowerSearchTerm))
      );
    }

    // Apply status filter
    if (statusFilter !== "all") {
      results = results.filter(
        (patient) => patient.mockStatus === statusFilter
      ); // Use mockStatus
    }

    // Apply risk filter
    if (riskFilter !== "all") {
      results = results.filter(
        (patient) => patient.mockRiskLevel === riskFilter
      ); // Use mockRiskLevel
    }

    return results;
  }, [patientsWithMockData, searchTerm, statusFilter, riskFilter]);

  return (
    // Assuming RightSidebar is w-16 (4rem), p-6 is 1.5rem.
    // Total right padding = 4rem + 1.5rem = 5.5rem (pr-[5.5rem] is ~pr-22 in Tailwind)
    <div className="min-h-screen bg-background text-foreground pr-[5.5rem]">
      <RightSidebar />
      <div className="p-6">
        
        {/* --- UPDATED & COMBINED HEADER / FILTER CARD --- */}
        <Card className="mb-8 shadow-sm bg-card">
          <CardHeader>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <CardTitle className="text-2xl font-bold">
                  Patient Management
                </CardTitle>
                <CardDescription className="mt-1">
                  View, search, and filter patients associated with your profile.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0 pb-4">
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Search Input */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, username, email, or NIC..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-10"
                />
              </div>
              {/* Filter Dropdown Button */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="h-10">
                    <Filter className="w-4 h-4 mr-2" />
                    Filter
                    {/* Optional: Show badge if filters active */}
                    {(statusFilter !== "all" || riskFilter !== "all") && (
                      <span className="ml-2 inline-block w-2 h-2 rounded-full bg-primary" />
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>Filter By</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {/* Status Filter */}
                  <DropdownMenuSub>
                    <DropdownMenuSubTrigger>Status</DropdownMenuSubTrigger>
                    <DropdownMenuPortal>
                      <DropdownMenuSubContent>
                        <DropdownMenuCheckboxItem
                          checked={statusFilter === "all"}
                          onCheckedChange={() => setStatusFilter("all")}
                        >
                          All
                        </DropdownMenuCheckboxItem>
                        <DropdownMenuCheckboxItem
                          checked={statusFilter === "active"}
                          onCheckedChange={() => setStatusFilter("active")}
                        >
                          Active
                        </DropdownMenuCheckboxItem>
                        <DropdownMenuCheckboxItem
                          checked={statusFilter === "inactive"}
                          onCheckedChange={() => setStatusFilter("inactive")}
                        >
                          Inactive
                        </DropdownMenuCheckboxItem>
                      </DropdownMenuSubContent>
                    </DropdownMenuPortal>
                  </DropdownMenuSub>
                  {/* Risk Level Filter */}
                  <DropdownMenuSub>
                    <DropdownMenuSubTrigger>Risk Level</DropdownMenuSubTrigger>
                    <DropdownMenuPortal>
                      <DropdownMenuSubContent>
                        <DropdownMenuCheckboxItem
                          checked={riskFilter === "all"}
                          onCheckedChange={() => setRiskFilter("all")}
                        >
                          All
                        </DropdownMenuCheckboxItem>
                        <DropdownMenuCheckboxItem
                          checked={riskFilter === "low"}
                          onCheckedChange={() => setRiskFilter("low")}
                        >
                          Low
                        </DropdownMenuCheckboxItem>
                        <DropdownMenuCheckboxItem
                          checked={riskFilter === "medium"}
                          onCheckedChange={() => setRiskFilter("medium")}
                        >
                          Medium
                        </DropdownMenuCheckboxItem>
                        <DropdownMenuCheckboxItem
                          checked={riskFilter === "high"}
                          onCheckedChange={() => setRiskFilter("high")}
                        >
                          High
                        </DropdownMenuCheckboxItem>
                      </DropdownMenuSubContent>
                    </DropdownMenuPortal>
                  </DropdownMenuSub>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardContent>
        </Card>
        {/* --- END OF UPDATED HEADER --- */}


        {/* Loading State */}
        {isLoading && (
          <div className="flex justify-center items-center py-10">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2 text-muted-foreground">Loading patients...</span>
          </div>
        )}

        {/* Error State */}
        {fetchError && (
          <Alert variant="destructive" className="mt-6">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Error Loading Patients</AlertTitle>
            <AlertDescription>
              {(fetchError as Error).message || "Could not load patient data."}
            </AlertDescription>
          </Alert>
        )}

        {/* Patients Grid */}
        {!isLoading && !fetchError && filteredPatients.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-5">
            {filteredPatients.map((patient) => (
              // Pass mock status/risk until API provides them
              <PatientCard
                key={patient.id}
                patient={patient}
                mockStatus={patient.mockStatus}
                mockRiskLevel={patient.mockRiskLevel}
              />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !fetchError && filteredPatients.length === 0 && (
          <Card className="mt-6 bg-card border border-dashed">
            <CardContent className="text-center py-12">
              <User className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-1">
                No patients found
              </h3>
              <p className="text-muted-foreground text-sm">
                {searchTerm
                  ? "Try adjusting your search criteria."
                  : "No patients with scheduled appointments found in your list."}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Patients;