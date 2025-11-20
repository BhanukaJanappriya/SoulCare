// src/pages/Profile.tsx

import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext"; // Fixed import path if needed
import { RightSidebar } from "@/components/layout/RightSidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea"; // Import Textarea
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star, Edit, Save, Camera } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/api";
import { User, DoctorProfile, CounselorProfile, PatientProfile } from "@/types"; // Import types

// ---------------- TYPES ----------------
// (You can rely on imported types, but defining helper types locally is fine too)
type ProfileType = DoctorProfile | CounselorProfile | PatientProfile;

// Define the type of the data structure we send in the API payload
type ProfileUpdateValue = string | File | undefined | null;
type ProfileUpdateData = Record<string, ProfileUpdateValue>;

interface ApiErrorResponse {
  response?: {
    data?: {
      detail?: string;
      non_field_errors?: string[] | string;
      [key: string]: unknown;
    };
  };
}

// -------------- HELPERS ----------------
const isDoctor = (profile: any): profile is DoctorProfile => "specialization" in profile;
const isCounselor = (profile: any): profile is CounselorProfile => "expertise" in profile;
const isPatient = (profile: any): profile is PatientProfile => "address" in profile && "nic" in profile;
const hasRating = (profile: any): profile is DoctorProfile | CounselorProfile => "rating" in profile;
const hasLicense = (profile: any): profile is DoctorProfile | CounselorProfile => "license_number" in profile;
const hasAvailability = (profile: any): profile is DoctorProfile => "availability" in profile;
// Helper to safely get bio
const getBio = (profile: any): string => profile.bio || ""; 

const getProfilePicture = (profile: any): string | null => profile.profile_picture || null;

// FormData builder
const buildFormData = (data: ProfileUpdateData): FormData => {
    const formData = new FormData();
    for (const key in data) {
        if (Object.prototype.hasOwnProperty.call(data, key)) {
            const value = data[key];

            if (value instanceof File) {
                formData.append(key, value, value.name);
            } else if (value !== null && value !== undefined) {
                formData.append(key, value.toString());
            }
        }
    }
    return formData;
};

// --------------------------------------

export default function Profile() {
  const { user, fetchUser, isLoading: isAuthLoading } = useAuth();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    contact_number: "",
    profileField: "", // specialization/expertise/address
    health_issues: "",
    nic: "",
    dob: "",
    bio: "", // --- ADDED BIO STATE ---
  });

  // Sync user data to local state
  useEffect(() => {
    if (user && user.profile) {
      const profile = user.profile;

      const profileField = isDoctor(profile)
        ? profile.specialization
        : isCounselor(profile)
        ? profile.expertise
        : isPatient(profile)
        ? profile.address
        : "";

      setFormData({
        email: user.email || "",
        full_name: profile.full_name || "",
        contact_number: profile.contact_number || "",
        profileField: profileField || "",
        health_issues: (profile as PatientProfile).health_issues || "",
        nic: (profile as PatientProfile).nic || "",
        dob: (profile as PatientProfile).dob || "",
        bio: getBio(profile), // --- SYNC BIO ---
      });
    }
  }, [user]);

  const handleSave = async () => {
    if (!user || !user.profile) return;

    setIsEditing(false);
    
    // 1. Prepare data for the specific role
    const profileUpdateData: ProfileUpdateData = {
        'full_name': formData.full_name,
        'contact_number': formData.contact_number,
    };

    // Add role-specific fields
    if (user.role === 'doctor') {
        profileUpdateData['specialization'] = formData.profileField;
        profileUpdateData['bio'] = formData.bio; // --- ADD BIO TO UPDATE ---
    } else if (user.role === 'counselor') {
        profileUpdateData['expertise'] = formData.profileField;
        profileUpdateData['bio'] = formData.bio; // --- ADD BIO TO UPDATE ---
    } else if (user.role === 'user') {
        profileUpdateData['address'] = formData.profileField;
        profileUpdateData['health_issues'] = formData.health_issues;
    }

    // 2. Add Profile Picture file
    if (file) {
      profileUpdateData.profile_picture = file; // Ensure backend expects 'profile_picture'
    }

    // 3. Create the final FormData object
    const formDataObject = buildFormData(profileUpdateData);

    try {
      // API Call: PATCH request to the /auth/user/ endpoint
      await api.patch(`auth/user/`, formDataObject);

      // Use correct token key
      const token = localStorage.getItem('accessToken'); // Fixed key name
      if (token) {
         // Refresh user data
         // Note: fetchUser in AuthContext might not take arguments based on previous fixes, 
         // but if it does, pass the token.
         await fetchUser(token);
      }

      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated.",
      });
      setFile(null);
    } catch (error: unknown) {
      console.error("Profile Update Failed:", error);

      let errorMessage = "Could not save profile. Please try again.";

      const apiError = error as ApiErrorResponse;
      if (apiError.response?.data) {
        const errorData = apiError.response.data;

        if (errorData.detail && typeof errorData.detail === 'string') {
          errorMessage = errorData.detail;
        } else if (errorData.non_field_errors) {
          if (Array.isArray(errorData.non_field_errors)) {
            errorMessage = errorData.non_field_errors.join(' ');
          } else if (typeof errorData.non_field_errors === 'string') {
            errorMessage = errorData.non_field_errors;
          }
        }
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }

      toast({
        title: "Update Failed",
        description: errorMessage,
        variant: "destructive",
      });
      setIsEditing(true);
    }
  };

  const handleImageClick = (): void => {
    if (isEditing) {
      fileInputRef.current?.click();
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    if (event.target.files && event.target.files.length > 0) {
      setFile(event.target.files[0]);
    }
  };

  if (isAuthLoading || !user || !user.profile) {
    return <div className="min-h-screen bg-page-bg flex items-center justify-center">
      <div>Loading profile...</div>
    </div>;
  }

  const profile = user.profile as any; // Use any for easier access to shared fields
  const profilePictureUrl = getProfilePicture(profile);
  const profileImageSrc = file ? URL.createObjectURL(file) : profilePictureUrl;

  // Role-specific labels and values
  const roleLabel = isDoctor(profile)
    ? "Specialization"
    : isCounselor(profile)
    ? "Expertise"
    : "Address";

  const secondaryLabel = isDoctor(profile) || isCounselor(profile)
    ? "License Number"
    : "Health Issues";

  const secondaryLabelValue = hasLicense(profile)
    ? profile.license_number ?? "N/A"
    : isPatient(profile)
    ? profile.health_issues ?? "N/A"
    : "N/A";

  return (
    <div className="min-h-screen bg-page-bg flex">
      <div className="flex-1 pr-[5.5rem]"> {/* Adjusted padding */}
        <div className="container mx-auto px-6 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-text-dark mb-2">Profile</h1>
            <p className="text-text-muted">Manage your professional information</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Profile Summary Card */}
            <Card className="lg:col-span-1">
              <CardHeader className="text-center">
                <div
                  className="relative inline-block cursor-pointer"
                  onClick={handleImageClick}
                >
                  <Avatar className="w-24 h-24 mx-auto mb-4">
                    <AvatarImage
                      src={profileImageSrc || ""}
                      alt={`${user.username}'s profile`}
                    />
                    <AvatarFallback className="text-2xl bg-primary text-white">
                      {profile.full_name
                        ?.split(" ")
                        .map((n: string) => n[0])
                        .join("")
                        .toUpperCase()}
                    </AvatarFallback>
                  </Avatar>

                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*"
                    hidden
                  />

                  {isEditing && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="absolute -bottom-2 -right-2 rounded-full w-8 h-8 p-0"
                    >
                      <Camera className="w-4 h-4" />
                    </Button>
                  )}
                </div>
                <CardTitle className="text-xl">{profile.full_name}</CardTitle>
                <p className="text-text-muted capitalize">{user.role}</p>

                {hasRating(profile) && profile.rating !== undefined && (
                  <div className="flex items-center justify-center mt-2">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400 mr-1" />
                    <span className="font-semibold">{profile.rating}</span>
                  </div>
                )}
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {/* ... existing summary fields ... */}
                  <div>
                    <Label className="text-sm font-medium text-text-muted">
                      {roleLabel}
                    </Label>
                    <p className="text-sm">{formData.profileField}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Profile Details */}
            <Card className="lg:col-span-2">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Professional Information</CardTitle>
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
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="full_name">Full Name</Label>
                    <Input
                      id="full_name"
                      value={formData.full_name}
                      onChange={(e) =>
                        setFormData((p) => ({ ...p, full_name: e.target.value }))
                      }
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      disabled={true}
                    />
                  </div>
                  <div>
                    <Label htmlFor="contact_number">Contact Number</Label>
                    <Input
                      id="contact_number"
                      value={formData.contact_number}
                      onChange={(e) =>
                        setFormData((p) => ({ ...p, contact_number: e.target.value }))
                      }
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <Label htmlFor="profileField">{roleLabel}</Label>
                    <Input
                      id="profileField"
                      value={formData.profileField}
                      onChange={(e) =>
                        setFormData((p) => ({ ...p, profileField: e.target.value }))
                      }
                      disabled={!isEditing}
                    />
                  </div>

                  {/* Patient specific fields (NIC, DOB, Health Issues) */}
                  {user.role === 'user' && (
                    <>
                      <div>
                        <Label htmlFor="health_issues">Health Issues</Label>
                        <Input
                          id="health_issues"
                          value={formData.health_issues}
                          onChange={(e) => setFormData((p) => ({ ...p, health_issues: e.target.value }))}
                          disabled={!isEditing}
                        />
                      </div>
                       {/* ... NIC and DOB inputs (disabled) ... */}
                    </>
                  )}
                </div>

                {/* --- NEW: BIO SECTION (Doctors/Counselors only) --- */}
                {(user.role === 'doctor' || user.role === 'counselor') && (
                    <div className="space-y-2">
                        <Label htmlFor="bio">Professional Bio</Label>
                        <Textarea
                            id="bio"
                            placeholder="Tell patients about your experience and approach..."
                            value={formData.bio}
                            onChange={(e) => setFormData(p => ({ ...p, bio: e.target.value }))}
                            disabled={!isEditing}
                            className="min-h-[100px]"
                        />
                        <p className="text-xs text-muted-foreground">
                            This will be displayed to patients when they are booking appointments.
                        </p>
                    </div>
                )}
                {/* --- END BIO SECTION --- */}

              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      <RightSidebar />
    </div>
  );
}