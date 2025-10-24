// src/pages/Profile.tsx

import React, { useState, useEffect, useRef } from "react";
// NOTE: Assuming this is a custom hook that returns AuthContextType
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

// Assuming createFormData is defined in your api.ts or a separate file.
// For this file, we assume it's imported correctly.

// ---------------- TYPES ----------------
// NOTE: These interfaces should ideally be imported from "@/types/index"
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
}

interface DoctorProfile extends BaseProfile {
  specialization: string;
}

interface CounselorProfile extends BaseProfile {
  expertise: string;
}

interface PatientProfile extends BaseProfile {
  address: string;
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


// -------------- HELPERS ----------------
const getProfileKey = (role: string): string => {
  if (role === "doctor") return "doctor_profile_update";
  if (role === "counselor") return "counselor_profile_update";
  if (role === "user") return "patient_profile_update";
  return "";
};

const isDoctor = (profile: ProfileType): profile is DoctorProfile => "specialization" in profile;
const isCounselor = (profile: ProfileType): profile is CounselorProfile => "expertise" in profile;
const isPatient = (profile: ProfileType): profile is PatientProfile => "address" in profile;
const hasRating = (profile: ProfileType): profile is DoctorProfile | CounselorProfile => "rating" in profile;
const hasLicense = (profile: ProfileType): profile is DoctorProfile | CounselorProfile => "license_number" in profile;
const hasAvailability = (profile: ProfileType): profile is DoctorProfile => "availability" in profile;
const getProfilePicture = (profile: ProfileType): string | null => profile.profile_picture || null;

// The logic from the original `createFormData` function (moved inline for self-contained fix)
const buildFormData = (data: ProfileUpdateData, profileKey: string): FormData => {
    const formData = new FormData();
    for (const key in data) {
        if (Object.prototype.hasOwnProperty.call(data, key)) {
            const value = data[key];
            const prefixedKey = `${profileKey}.${key}`;

            if (value instanceof File) {
                formData.append(prefixedKey, value, value.name);
            } else if (value !== null && value !== undefined) {
                formData.append(prefixedKey, value.toString());
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
    profileField: "",
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
      });
    }
  }, [user]);

  const handleSave = async () => {
    if (!user || !user.profile) return;

    setIsEditing(false);
    const profileKey = getProfileKey(user.role);
    const profile = user.profile as ProfileType; // Re-assert user profile

    // 1. Prepare data (Type is now ProfileUpdateData, which is Record<string, string | File | ...>)
    const profileUpdateData: ProfileUpdateData = {
        'full_name': formData.full_name,
        'contact_number': formData.contact_number,

        // Dynamic field mapping
        ...(user.role === 'doctor' && { 'specialization': formData.profileField }),
        ...(user.role === 'counselor' && { 'expertise': formData.profileField }),
        ...(user.role === 'user' && { 'address': formData.profileField }),
    };

    // 2. Add Profile Picture file
    if (file) {
      profileUpdateData.profile_picture = file;
    }

    // 3. Create the final FormData object
    const formDataObject = buildFormData(profileUpdateData, profileKey);


    try {
      // API Call: PATCH request to the /auth/user/ endpoint
      await api.patch(`auth/user/`, formDataObject, {
          headers: {
              // Ensures correct boundary is set
              'Content-Type': undefined,
          }
      });

      // Re-fetch user data to update the AuthContext and UI
      const token = localStorage.getItem('accessToken');
      if (token) {
         await fetchUser(token);
      }

      toast({
        title: "Profile Updated",
        description: "Your profile and picture have been successfully updated.",
      });
      setFile(null);
    } catch (error) {
      console.error("Profile Update Failed:", error.response || error);
      toast({
        title: "Update Failed",
        description: "Could not save profile. Check console for details.",
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
    return <div>Loading profile...</div>;
  }

  const profile = user.profile as ProfileType;
  const profilePictureUrl = getProfilePicture(profile);
  const profileImageSrc = file ? URL.createObjectURL(file) : profilePictureUrl;

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

  const secondaryLabel =
    isDoctor(profile) || isCounselor(profile)
      ? "License Number"
      : "Health Issues";
  const secondaryLabelValue = hasLicense(profile)
    ? profile.license_number ?? "N/A"
    : isPatient(profile)
    ? profile.health_issues ?? "N/A"
    : "N/A";

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
