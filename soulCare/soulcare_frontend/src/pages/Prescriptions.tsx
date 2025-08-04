import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { RightSidebar } from "@/components/layout/RightSidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Plus,
  Search,
  Printer,
  Eye,
  Edit,
  Trash2,
  Pill,
  Calendar,
  User,
  FileText,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Prescription } from "@/types";

interface Medication {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
}

const mockPrescriptions: Prescription[] = [
  {
    id: "1",
    patientId: "1",
    doctorId: "1",
    appointmentId: "1",
    medications: [
      {
        name: "Sertraline",
        dosage: "50mg",
        frequency: "Once daily",
        duration: "30 days",
        instructions: "Take with food in the morning",
      },
      {
        name: "Alprazolam",
        dosage: "0.25mg",
        frequency: "As needed",
        duration: "14 days",
        instructions: "For anxiety, do not exceed 2 tablets per day",
      },
    ],
    diagnosis: "Generalized Anxiety Disorder",
    notes:
      "Patient reports improvement in sleep patterns. Continue current dosage and monitor for side effects.",
    createdAt: new Date("2024-02-15"),
  },
  {
    id: "2",
    patientId: "2",
    doctorId: "1",
    appointmentId: "2",
    medications: [
      {
        name: "Fluoxetine",
        dosage: "20mg",
        frequency: "Once daily",
        duration: "60 days",
        instructions: "Take in the morning with breakfast",
      },
    ],
    diagnosis: "Major Depressive Disorder",
    notes:
      "Starting treatment with SSRI. Follow up in 4 weeks to assess response.",
    createdAt: new Date("2024-02-10"),
  },
];

const mockPatients = [
  { id: "1", name: "Sarah Johnson", age: 28 },
  { id: "2", name: "Michael Chen", age: 35 },
  { id: "3", name: "Emma Wilson", age: 42 },
];

export default function Prescriptions() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [prescriptions, setPrescriptions] =
    useState<Prescription[]>(mockPrescriptions);
  const [isCreating, setIsCreating] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPatient, setSelectedPatient] = useState("");

  const [newPrescription, setNewPrescription] = useState({
    patientId: "",
    diagnosis: "",
    notes: "",
    medications: [] as Medication[],
  });

  const [newMedication, setNewMedication] = useState<Medication>({
    name: "",
    dosage: "",
    frequency: "",
    duration: "",
    instructions: "",
  });

  const handleAddMedication = () => {
    if (newMedication.name && newMedication.dosage) {
      setNewPrescription({
        ...newPrescription,
        medications: [...newPrescription.medications, newMedication],
      });
      setNewMedication({
        name: "",
        dosage: "",
        frequency: "",
        duration: "",
        instructions: "",
      });
    }
  };

  const handleRemoveMedication = (index: number) => {
    setNewPrescription({
      ...newPrescription,
      medications: newPrescription.medications.filter((_, i) => i !== index),
    });
  };

  const handleCreatePrescription = () => {
    if (
      !newPrescription.patientId ||
      !newPrescription.diagnosis ||
      newPrescription.medications.length === 0
    ) {
      toast({
        title: "Validation Error",
        description:
          "Please fill in all required fields and add at least one medication.",
        variant: "destructive",
      });
      return;
    }

    const prescription: Prescription = {
      id: Date.now().toString(),
      patientId: newPrescription.patientId,
      doctorId: user?.id || "1",
      appointmentId: Date.now().toString(),
      medications: newPrescription.medications,
      diagnosis: newPrescription.diagnosis,
      notes: newPrescription.notes,
      createdAt: new Date(),
    };

    setPrescriptions([prescription, ...prescriptions]);
    setNewPrescription({
      patientId: "",
      diagnosis: "",
      notes: "",
      medications: [],
    });
    setIsCreating(false);

    toast({
      title: "Prescription Created",
      description:
        "The prescription has been successfully created and sent to the patient.",
    });
  };

  const filteredPrescriptions = prescriptions.filter((prescription) => {
    const patient = mockPatients.find((p) => p.id === prescription.patientId);
    const patientName = patient?.name || "";
    return (
      patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prescription.diagnosis.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const getPatientName = (patientId: string) => {
    const patient = mockPatients.find((p) => p.id === patientId);
    return patient?.name || "Unknown Patient";
  };

  return (
    <div className="min-h-screen bg-page-bg flex">
      <div className="flex-1 pr-16">
        <div className="container mx-auto px-6 py-8">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-text-dark mb-2">
                Prescriptions
              </h1>
              <p className="text-text-muted">
                Manage patient prescriptions and medications
              </p>
            </div>
            <Dialog open={isCreating} onOpenChange={setIsCreating}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  New Prescription
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Create New Prescription</DialogTitle>
                </DialogHeader>
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="patient">Patient</Label>
                      <Select
                        value={newPrescription.patientId}
                        onValueChange={(value) =>
                          setNewPrescription({
                            ...newPrescription,
                            patientId: value,
                          })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a patient" />
                        </SelectTrigger>
                        <SelectContent>
                          {mockPatients.map((patient) => (
                            <SelectItem key={patient.id} value={patient.id}>
                              {patient.name} (Age: {patient.age})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="diagnosis">Diagnosis</Label>
                      <Input
                        id="diagnosis"
                        value={newPrescription.diagnosis}
                        onChange={(e) =>
                          setNewPrescription({
                            ...newPrescription,
                            diagnosis: e.target.value,
                          })
                        }
                        placeholder="Enter diagnosis..."
                      />
                    </div>
                  </div>

                  {/* Medications Section */}
                  <div>
                    <Label className="text-base font-semibold">
                      Medications
                    </Label>
                    <Card className="mt-2">
                      <CardHeader>
                        <CardTitle className="text-lg">
                          Add Medication
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="med-name">Medication Name</Label>
                            <Input
                              id="med-name"
                              value={newMedication.name}
                              onChange={(e) =>
                                setNewMedication({
                                  ...newMedication,
                                  name: e.target.value,
                                })
                              }
                              placeholder="e.g., Sertraline"
                            />
                          </div>
                          <div>
                            <Label htmlFor="dosage">Dosage</Label>
                            <Input
                              id="dosage"
                              value={newMedication.dosage}
                              onChange={(e) =>
                                setNewMedication({
                                  ...newMedication,
                                  dosage: e.target.value,
                                })
                              }
                              placeholder="e.g., 50mg"
                            />
                          </div>
                          <div>
                            <Label htmlFor="frequency">Frequency</Label>
                            <Select
                              value={newMedication.frequency}
                              onValueChange={(value) =>
                                setNewMedication({
                                  ...newMedication,
                                  frequency: value,
                                })
                              }
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select frequency" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Once daily">
                                  Once daily
                                </SelectItem>
                                <SelectItem value="Twice daily">
                                  Twice daily
                                </SelectItem>
                                <SelectItem value="Three times daily">
                                  Three times daily
                                </SelectItem>
                                <SelectItem value="As needed">
                                  As needed
                                </SelectItem>
                                <SelectItem value="Every other day">
                                  Every other day
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label htmlFor="duration">Duration</Label>
                            <Input
                              id="duration"
                              value={newMedication.duration}
                              onChange={(e) =>
                                setNewMedication({
                                  ...newMedication,
                                  duration: e.target.value,
                                })
                              }
                              placeholder="e.g., 30 days"
                            />
                          </div>
                        </div>
                        <div>
                          <Label htmlFor="instructions">Instructions</Label>
                          <Textarea
                            id="instructions"
                            value={newMedication.instructions}
                            onChange={(e) =>
                              setNewMedication({
                                ...newMedication,
                                instructions: e.target.value,
                              })
                            }
                            placeholder="Special instructions for taking this medication..."
                            rows={2}
                          />
                        </div>
                        <Button onClick={handleAddMedication}>
                          <Plus className="w-4 h-4 mr-2" />
                          Add Medication
                        </Button>
                      </CardContent>
                    </Card>

                    {/* Added Medications List */}
                    {newPrescription.medications.length > 0 && (
                      <Card className="mt-4">
                        <CardHeader>
                          <CardTitle className="text-lg">
                            Added Medications
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            {newPrescription.medications.map((med, index) => (
                              <div
                                key={index}
                                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                              >
                                <div className="flex-1">
                                  <div className="font-medium">
                                    {med.name} - {med.dosage}
                                  </div>
                                  <div className="text-sm text-text-muted">
                                    {med.frequency} for {med.duration}
                                  </div>
                                  {med.instructions && (
                                    <div className="text-sm text-text-muted italic">
                                      {med.instructions}
                                    </div>
                                  )}
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleRemoveMedication(index)}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="notes">Notes</Label>
                    <Textarea
                      id="notes"
                      value={newPrescription.notes}
                      onChange={(e) =>
                        setNewPrescription({
                          ...newPrescription,
                          notes: e.target.value,
                        })
                      }
                      placeholder="Additional notes or instructions..."
                      rows={3}
                    />
                  </div>

                  <div className="flex justify-end gap-3">
                    <Button
                      variant="outline"
                      onClick={() => setIsCreating(false)}
                    >
                      Cancel
                    </Button>
                    <Button onClick={handleCreatePrescription}>
                      Create Prescription
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Search and Filters */}
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="flex gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-muted w-4 h-4" />
                  <Input
                    placeholder="Search prescriptions by patient name or diagnosis..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select
                  value={selectedPatient}
                  onValueChange={setSelectedPatient}
                >
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filter by patient" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Patients</SelectItem>
                    {mockPatients.map((patient) => (
                      <SelectItem key={patient.id} value={patient.id}>
                        {patient.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Prescriptions List */}
          <div className="space-y-6">
            {filteredPrescriptions.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <Pill className="w-12 h-12 text-text-muted mx-auto mb-4" />
                  <p className="text-text-muted">No prescriptions found.</p>
                </CardContent>
              </Card>
            ) : (
              filteredPrescriptions.map((prescription) => (
                <Card
                  key={prescription.id}
                  className="hover:shadow-md transition-shadow"
                >
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <CardTitle className="text-xl">
                            Prescription #{prescription.id}
                          </CardTitle>
                          <Badge variant="outline">
                            {prescription.medications.length} medication
                            {prescription.medications.length !== 1 ? "s" : ""}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-6 text-sm text-text-muted">
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4" />
                            <span>
                              {getPatientName(prescription.patientId)}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4" />
                            <span>{prescription.diagnosis}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            <span>
                              {prescription.createdAt.toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Printer className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Edit className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <Label className="font-semibold">Medications:</Label>
                        <div className="mt-2 space-y-2">
                          {prescription.medications.map((med, index) => (
                            <div
                              key={index}
                              className="p-3 bg-gray-50 rounded-lg"
                            >
                              <div className="flex items-center justify-between">
                                <div className="font-medium">{med.name}</div>
                                <Badge variant="outline">{med.dosage}</Badge>
                              </div>
                              <div className="text-sm text-text-muted mt-1">
                                {med.frequency} for {med.duration}
                              </div>
                              {med.instructions && (
                                <div className="text-sm text-text-muted italic mt-1">
                                  Instructions: {med.instructions}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>

                      {prescription.notes && (
                        <div>
                          <Label className="font-semibold">Notes:</Label>
                          <p className="text-sm text-text-muted mt-1">
                            {prescription.notes}
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>
      <RightSidebar />
    </div>
  );
}
