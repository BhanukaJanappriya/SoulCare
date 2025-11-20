import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Edit, Save, Camera } from "lucide-react";
import { api } from "@/api";
import { useToast } from "@/hooks/use-toast";
import { User } from '@/types';

// Extend the User type to include nested PatientProfile data
interface PatientDetailData extends User {
  patientprofile: {
    full_name: string;
    nic: string;
    contact_number: string;
    address: string;
    dob: string;
    health_issues: string | null;
    profile_picture: string | null;
  }
}

// API Error response type
interface ApiErrorResponse {
  response?: {
    data?: {
      detail?: string;
      [key: string]: unknown;
    };
  };
}

export default function PatientDetailPage() {
    const { id } = useParams<{ id: string }>();
    const { toast } = useToast();
    const [patient, setPatient] = useState<PatientDetailData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        full_name: "",
        contact_number: "",
        address: "",
        health_issues: "",
        nic: "",
        dob: "",
        email: ""
    });

    useEffect(() => {
        if (!id) {
            setError("Patient ID is missing.");
            setIsLoading(false);
            return;
        }

        const fetchPatientDetails = async () => {
            try {
                const response = await api.get<PatientDetailData>(`auth/patients/${id}/`);
                setPatient(response.data);
                const profile = response.data.patientprofile;

                // Initialize form data
                setFormData({
                    full_name: profile.full_name || "",
                    contact_number: profile.contact_number || "",
                    address: profile.address || "",
                    health_issues: profile.health_issues || "",
                    nic: profile.nic || "",
                    dob: profile.dob || "",
                    email: response.data.email || ""
                });
            } catch (err: unknown) {
                console.error("Error fetching patient details:", err);
                const apiError = err as ApiErrorResponse;
                const message = apiError.response?.data?.detail || "You may not have permission to view this patient's full details.";
                setError(message);
                toast({ title: "Access Denied", description: message, variant: "destructive" });
            } finally {
                setIsLoading(false);
            }
        };

        fetchPatientDetails();
    }, [id, toast]);

    const handleSave = async () => {
        if (!patient) return;

        try {
            const profileUpdateData = {
                'full_name': formData.full_name,
                'contact_number': formData.contact_number,
                'address': formData.address,
                'health_issues': formData.health_issues,
                // Note: NIC and DOB are not included as they are unchangeable
            };

            await api.patch(`auth/patients/${id}/`, profileUpdateData);

            // Refresh patient data
            const response = await api.get<PatientDetailData>(`auth/patients/${id}/`);
            setPatient(response.data);

            toast({
                title: "Profile Updated",
                description: "Patient profile has been successfully updated.",
            });
            setIsEditing(false);
        } catch (error: unknown) {
            console.error("Profile Update Failed:", error);
            const apiError = error as ApiErrorResponse;
            const errorMessage = apiError.response?.data?.detail || "Could not update patient profile. Please try again.";

            toast({
                title: "Update Failed",
                description: errorMessage,
                variant: "destructive",
            });
        }
    };

    if (isLoading) return <div className="p-8 text-center">Loading patient record...</div>;
    if (error) return <div className="p-8 text-center text-red-500">Error: {error}</div>;
    if (!patient) return <div className="p-8 text-center">Patient not found.</div>;

    const profile = patient.patientprofile;
    const patientInitials = profile.full_name?.split(" ").map(n => n[0]).join("").toUpperCase();
    const dob = profile.dob ? new Date(profile.dob).toLocaleDateString() : 'N/A';

    return (
        <div className="container mx-auto px-6 py-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-text-dark">Patient Record: {profile.full_name}</h1>
                <Button
                    variant={isEditing ? "default" : "outline"}
                    size="sm"
                    onClick={isEditing ? handleSave : () => setIsEditing(true)}
                >
                    {isEditing ? (
                        <>
                            <Save className="w-4 h-4 mr-2" />
                            Save Changes
                        </>
                    ) : (
                        <>
                            <Edit className="w-4 h-4 mr-2" />
                            Edit Profile
                        </>
                    )}
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Demographic Card */}
                <Card className="lg:col-span-1">
                    <CardHeader className="text-center">
                         <Avatar className="w-24 h-24 mx-auto mb-4">
                            <AvatarImage src={profile.profile_picture || ''} alt={`${profile.full_name}'s profile`} />
                            <AvatarFallback className="text-2xl bg-primary text-white">{patientInitials}</AvatarFallback>
                        </Avatar>
                        <CardTitle className="text-xl">{profile.full_name}</CardTitle>
                        <p className="text-text-muted capitalize">{patient.role}</p>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {/* ✅ Unchangeable Fields */}
                        <DetailItem
                            label="NIC"
                            value={formData.nic}
                            isEditing={isEditing}
                            isReadOnly={true}
                            onChange={(value) => setFormData(prev => ({...prev, nic: value}))}
                        />
                        <DetailItem
                            label="Date of Birth"
                            value={dob}
                            isEditing={isEditing}
                            isReadOnly={true}
                        />

                        {/* ✅ Customizable Fields */}
                        <DetailItem
                            label="Full Name"
                            value={formData.full_name}
                            isEditing={isEditing}
                            onChange={(value) => setFormData(prev => ({...prev, full_name: value}))}
                        />
                        <DetailItem
                            label="Contact"
                            value={formData.contact_number}
                            isEditing={isEditing}
                            onChange={(value) => setFormData(prev => ({...prev, contact_number: value}))}
                        />
                        <DetailItem
                            label="Email"
                            value={formData.email}
                            isEditing={isEditing}
                            isReadOnly={true} // Email is typically unchangeable
                        />
                    </CardContent>
                </Card>

                {/* Medical Card */}
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle>Health Overview</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* ✅ Customizable Health Issues */}
                        <DetailItem
                            label="Initial Health Concerns"
                            value={formData.health_issues || 'None stated on record.'}
                            isEditing={isEditing}
                            onChange={(value) => setFormData(prev => ({...prev, health_issues: value}))}
                        />

                        {/* ✅ Customizable Address */}
                        <DetailItem
                            label="Address"
                            value={formData.address}
                            isEditing={isEditing}
                            onChange={(value) => setFormData(prev => ({...prev, address: value}))}
                        />

                        <div className="border-t pt-4">
                            <h3 className="font-semibold mb-2">Session Notes</h3>
                            <p className="text-text-muted">History and session notes will be displayed here.</p>
                        </div>

                        {/* ✅ Visual Indicators for Read-only Fields */}
                        {isEditing && (
                            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                                <p className="text-sm text-blue-700">
                                    <strong>Note:</strong> NIC and Date of Birth cannot be changed as they are permanent identification details.
                                </p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

// Enhanced Detail Row Component with Edit Support
interface DetailItemProps {
    label: string;
    value: string | null;
    isEditing?: boolean;
    isReadOnly?: boolean;
    onChange?: (value: string) => void;
}

const DetailItem: React.FC<DetailItemProps> = ({
    label,
    value,
    isEditing = false,
    isReadOnly = false,
    onChange
}) => (
    <div>
        <Label className="text-sm font-medium text-text-muted flex items-center">
            {label}
            {isReadOnly && isEditing && (
                <span className="text-xs text-muted-foreground ml-1">(Unchangeable)</span>
            )}
        </Label>
        {isEditing && !isReadOnly ? (
            <Input
                value={value || ''}
                onChange={(e) => onChange?.(e.target.value)}
                className="mt-1"
            />
        ) : (
            <p className={`text-base font-medium text-text-dark mt-1 ${isReadOnly ? 'opacity-70' : ''}`}>
                {value}
                {isReadOnly && isEditing && (
                    <span className="text-xs text-muted-foreground ml-1">🔒</span>
                )}
            </p>
        )}
    </div>
);
