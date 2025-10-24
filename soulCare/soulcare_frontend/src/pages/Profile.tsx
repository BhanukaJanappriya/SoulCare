// src/pages/Profile.tsx

import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";
import { RightSidebar } from "@/components/layout/RightSidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star, Edit, Save, Camera } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/api";

// ---------------- TYPES ----------------
interface BaseProfile {
  full_name: string;
  contact_number: string;
  profile_picture?: string | null;
  nic?: string;
  license_number?: string;
  health_issues?: string;
  address?: string;
  availability?: string;
  rating?: number;
  dob?: string; // Add DOB for patients
}

interface DoctorProfile extends BaseProfile {
  specialization: string;
}

interface CounselorProfile extends BaseProfile {
  expertise: string;
}

interface PatientProfile extends BaseProfile {
  address: string;
  health_issues?: string;
  nic: string;
  dob?: string;
}

type ProfileType = DoctorProfile | CounselorProfile | PatientProfile;

interface User {
  id: number;
  username: string;
  email: string;
  role: "doctor" | "counselor" | "user" | "admin";
  profile: ProfileType | null;
}

// Define the type of the data structure we send in the API payload
type ProfileUpdateValue = string | File | undefined | null;
type ProfileUpdateData = Record<string, ProfileUpdateValue>;

// ✅ Add proper error response type
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
const isDoctor = (profile: ProfileType): profile is DoctorProfile => "specialization" in profile;
const isCounselor = (profile: ProfileType): profile is CounselorProfile => "expertise" in profile;
const isPatient = (profile: ProfileType): profile is PatientProfile => "address" in profile && "nic" in profile;
const hasRating = (profile: ProfileType): profile is DoctorProfile | CounselorProfile => "rating" in profile;
const hasLicense = (profile: ProfileType): profile is DoctorProfile | CounselorProfile => "license_number" in profile;
const hasAvailability = (profile: ProfileType): profile is DoctorProfile => "availability" in profile;
const getProfilePicture = (profile: ProfileType): string | null => profile.profile_picture || null;

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
  });

  // Sync user data to local state
  useEffect(() => {
    if (user && user.profile) {
      const profile = user.profile as ProfileType;

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
        health_issues: profile.health_issues || "",
        nic: (profile as PatientProfile).nic || "",
        dob: (profile as PatientProfile).dob || "",
      });
    }
  }, [user]);

  const handleSave = async () => {
    if (!user || !user.profile) return;

    setIsEditing(false);
    const profile = user.profile as ProfileType;

    // 1. Prepare data for the specific role
    const profileUpdateData: ProfileUpdateData = {
        'full_name': formData.full_name,
        'contact_number': formData.contact_number,
    };

    // Add role-specific fields
    if (user.role === 'doctor') {
        profileUpdateData['specialization'] = formData.profileField;
    } else if (user.role === 'counselor') {
        profileUpdateData['expertise'] = formData.profileField;
    } else if (user.role === 'user') {
        // Patient specific fields
        profileUpdateData['address'] = formData.profileField;
        profileUpdateData['health_issues'] = formData.health_issues;
        // Note: NIC and DOB are not included as they are unchangeable
    }

    // 2. Add Profile Picture file
    if (file) {
      profileUpdateData.profile_picture = file;
    }

    // 3. Create the final FormData object
    const formDataObject = buildFormData(profileUpdateData);

    try {
      // API Call: PATCH request to the /auth/user/ endpoint
      await api.patch(`auth/user/`, formDataObject, {
          headers: {
              'Content-Type': 'multipart/form-data',
          }
      });

      // Use correct token key
      const token = localStorage.getItem('access');
      if (token) {
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

      // ✅ FIX: Type-safe error handling without 'any'
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

  const profile = user.profile as ProfileType;
  const profilePictureUrl = getProfilePicture(profile);
  const profileImageSrc = file ? URL.createObjectURL(file) : profilePictureUrl;

  // Role-specific labels and values
  const roleLabel = isDoctor(profile)
    ? "Specialization"
    : isCounselor(profile)
    ? "Expertise"
    : "Address";

  const roleLabelValue = isDoctor(profile)
    ? profile.specialization
    : isCounselor(profile)
    ? profile.expertise
    : isPatient(profile)
    ? profile.address
    : "N/A";

  const secondaryLabel = isDoctor(profile) || isCounselor(profile)
    ? "License Number"
    : "Health Issues";

  const secondaryLabelValue = hasLicense(profile)
    ? profile.license_number ?? "N/A"
    : isPatient(profile)
    ? profile.health_issues ?? "N/A"
    : "N/A";

  // Patient-specific fields
  const patientProfile = profile as PatientProfile;

  return (
    <div className="min-h-screen bg-page-bg flex">
      <div className="flex-1 pr-16">
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
                        .map((n) => n[0])
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
                    <span className="text-text-muted ml-1">(Mock reviews)</span>
                  </div>
                )}
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <Label className="text-sm font-medium text-text-muted">
                      {roleLabel}
                    </Label>
                    <p className="text-sm">{roleLabelValue}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-text-muted">
                      {secondaryLabel}
                    </Label>
                    <p className="text-sm">{secondaryLabelValue}</p>
                  </div>

                  {/* ✅ Patient-specific fields in summary card */}
                  {isPatient(profile) && (
                    <>
                      <div>
                        <Label className="text-sm font-medium text-text-muted">
                          NIC
                        </Label>
                        <p className="text-sm">{patientProfile.nic || "N/A"}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-text-muted">
                          Date of Birth
                        </Label>
                        <p className="text-sm">
                          {patientProfile.dob ? new Date(patientProfile.dob).toLocaleDateString() : "N/A"}
                        </p>
                      </div>
                    </>
                  )}

                  {hasAvailability(profile) && (
                    <div>
                      <Label className="text-sm font-medium text-text-muted">
                        Availability
                      </Label>
                      <p className="text-sm">{profile.availability}</p>
                    </div>
                  )}
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
                        setFormData((p) => ({
                          ...p,
                          full_name: e.target.value,
                        }))
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
                        setFormData((p) => ({
                          ...p,
                          contact_number: e.target.value,
                        }))
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
                        setFormData((p) => ({
                          ...p,
                          profileField: e.target.value,
                        }))
                      }
                      disabled={!isEditing}
                    />
                  </div>

                  {/* ✅ Patient-specific editable fields */}
                  {user.role === 'user' && (
                    <>
                      <div>
                        <Label htmlFor="health_issues">Health Issues</Label>
                        <Input
                          id="health_issues"
                          value={formData.health_issues}
                          onChange={(e) =>
                            setFormData((p) => ({
                              ...p,
                              health_issues: e.target.value,
                            }))
                          }
                          disabled={!isEditing}
                          placeholder="Describe any health issues"
                        />
                      </div>
                      <div>
                        <Label htmlFor="nic">NIC</Label>
                        <Input
                          id="nic"
                          value={formData.nic}
                          disabled={true}
                          className="opacity-70"
                        />
                      </div>
                      <div>
                        <Label htmlFor="dob">Date of Birth</Label>
                        <Input
                          id="dob"
                          type="text"
                          value={formData.dob ? new Date(formData.dob).toLocaleDateString() : 'N/A'}
                          disabled={true}
                          className="opacity-70"
                        />
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      <RightSidebar />
    </div>
  );
}
