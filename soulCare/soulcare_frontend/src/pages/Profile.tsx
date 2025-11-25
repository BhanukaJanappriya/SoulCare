// src/pages/Profile.tsx

import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { RightSidebar } from "@/components/layout/RightSidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star, Edit, Save, Camera, Check, MessageSquare, Loader2 } from "lucide-react"; // Added MessageSquare
import { useToast } from "@/hooks/use-toast";
import { api, createFeedbackAPI } from "@/api"; // Import createFeedbackAPI
import { User, DoctorProfile, CounselorProfile, PatientProfile, CombinedProfile, ProfessionalProfile } from "@/types";
import { useMutation } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

// ---------------- TYPES ----------------
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
// ✅ FIX: Replacing all 'any' in signatures with 'CombinedProfile'
const isDoctor = (profile: CombinedProfile): profile is DoctorProfile => "specialization" in profile;
const isCounselor = (profile: CombinedProfile): profile is CounselorProfile => "expertise" in profile;
const isPatient = (profile: CombinedProfile): profile is PatientProfile => "address" in profile && "nic" in profile;
const hasRating = (profile: CombinedProfile): profile is DoctorProfile | CounselorProfile => "rating" in profile;
const isProfessional = (profile: CombinedProfile): profile is ProfessionalProfile =>
  isDoctor(profile) || isCounselor(profile);
const hasLicense = (profile: CombinedProfile): profile is DoctorProfile | CounselorProfile =>
  isProfessional(profile) && "license_number" in profile;
const hasAvailability = (profile: CombinedProfile): profile is DoctorProfile =>
  isDoctor(profile) && "availability" in profile;
const getBio = (profile: CombinedProfile): string => {
    // Only attempt to access bio if the profile is Professional, as Patients don't have it
    if (isProfessional(profile)) {
        return profile.bio || "";
    }
    return ""; // Return empty string for Patient profiles
};
const getProfilePicture = (profile: CombinedProfile): string | null => profile.profile_picture || null;
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

// --- Feedback Dialog Component (Inline for simplicity) ---
interface FeedbackDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

const FeedbackDialog: React.FC<FeedbackDialogProps> = ({ open, onOpenChange }) => {
    const { toast } = useToast();
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [content, setContent] = useState("");

    const mutation = useMutation({
        mutationFn: createFeedbackAPI,
        onSuccess: () => {
            toast({ title: "Thank You!", description: "Your feedback has been submitted for review." });
            onOpenChange(false);
            setRating(0);
            setContent("");
        },
        onError: () => {
            toast({ variant: "destructive", title: "Error", description: "Failed to submit feedback." });
        }
    });

    const handleSubmit = () => {
        if (rating === 0) {
            toast({ variant: "destructive", title: "Error", description: "Please select a rating." });
            return;
        }
        if (!content.trim()) {
            toast({ variant: "destructive", title: "Error", description: "Please write some feedback." });
            return;
        }
        mutation.mutate({ rating, content });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Give Feedback</DialogTitle>
                    <DialogDescription>
                        Share your experience with SoulCare. Your feedback helps us improve.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="flex justify-center gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <button
                                key={star}
                                type="button"
                                className="focus:outline-none transition-transform hover:scale-110"
                                onMouseEnter={() => setHoverRating(star)}
                                onMouseLeave={() => setHoverRating(0)}
                                onClick={() => setRating(star)}
                            >
                                <Star
                                    className={cn(
                                        "w-8 h-8 transition-colors",
                                        (hoverRating || rating) >= star ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                                    )}
                                />
                            </button>
                        ))}
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="feedback">Your Message</Label>
                        <Textarea
                            id="feedback"
                            placeholder="What did you like? What can we do better?"
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            rows={4}
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                    <Button onClick={handleSubmit} disabled={mutation.isPending}>
                        {mutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                        Submit
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

// --------------------------------------

export default function Profile() {
  const { user, fetchUser, isLoading: isAuthLoading } = useAuth();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // --- NEW: Feedback State ---
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);

  const [formData, setFormData] = useState({
    full_name: "", email: "", contact_number: "", profileField: "",
    health_issues: "", nic: "", dob: "", bio: "",
  });

  useEffect(() => {
    if (user && user.profile) {
      const profile = user.profile;
      const profileField = isDoctor(profile) ? profile.specialization
        : isCounselor(profile) ? profile.expertise
        : isPatient(profile) ? profile.address : "";
      setFormData({
        email: user.email || "",
        full_name: profile.full_name || "",
        contact_number: profile.contact_number || "",
        profileField: profileField || "",
        health_issues: (profile as PatientProfile).health_issues || "",
        nic: (profile as PatientProfile).nic || "",
        dob: (profile as PatientProfile).dob || "",
        bio: getBio(profile),
      });
    }
  }, [user]);

  const handleSave = async () => {
    if (!user || !user.profile) return;
    setIsEditing(false);

    const profileUpdateData: ProfileUpdateData = {
        'full_name': formData.full_name,
        'contact_number': formData.contact_number,
    };

    if (user.role === 'doctor') {
        profileUpdateData['specialization'] = formData.profileField;
        profileUpdateData['bio'] = formData.bio;
    } else if (user.role === 'counselor') {
        profileUpdateData['expertise'] = formData.profileField;
        profileUpdateData['bio'] = formData.bio;
    } else if (user.role === 'user') {
        profileUpdateData['address'] = formData.profileField;
        profileUpdateData['health_issues'] = formData.health_issues;
    }

    if (file) {
      profileUpdateData.profile_picture = file;
    }

    const formDataObject = buildFormData(profileUpdateData);

    try {
      await api.patch(`auth/user/`, formDataObject);
      const token = localStorage.getItem('accessToken');
      if (token) {
         await fetchUser(token);
      }
      toast({ title: "Profile Updated", description: "Your profile has been successfully updated." });
      setFile(null);
    } catch (error: unknown) {
      console.error("Profile Update Failed:", error);
      let errorMessage = "Could not save profile. Please try again.";
      const apiError = error as ApiErrorResponse;
      if (apiError.response?.data) {
        const errorData = apiError.response.data;
        if (errorData.detail && typeof errorData.detail === 'string') { errorMessage = errorData.detail; }
        else if (errorData.non_field_errors) {
          if (Array.isArray(errorData.non_field_errors)) { errorMessage = errorData.non_field_errors.join(' '); }
          else if (typeof errorData.non_field_errors === 'string') { errorMessage = errorData.non_field_errors; }
        }
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      toast({ title: "Update Failed", description: errorMessage, variant: "destructive" });
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
    return <div className="min-h-screen bg-page-bg flex items-center justify-center"><div>Loading profile...</div></div>;
  }

  const profile = user.profile as CombinedProfile;
  const profilePictureUrl = getProfilePicture(profile);
  const profileImageSrc = file ? URL.createObjectURL(file) : profilePictureUrl;
  const roleLabel = isDoctor(profile) ? "Specialization" : isCounselor(profile) ? "Expertise" : "Address";

  const isVerifiedProfessional = (user.role === 'doctor' || user.role === 'counselor') && user.is_verified;

  // --- INLINE CSS STYLE OBJECTS ---
  const avatarWrapperStyle: React.CSSProperties = {
    position: 'relative',
    display: 'inline-block',
  };
  const avatarRingStyle: React.CSSProperties = {
    boxShadow: '0 0 0 4px #22c53bff',
    borderRadius: '9999px',
  };
  const verifiedBadgeStyle: React.CSSProperties = {
    position: 'absolute',
    bottom: '4px',
    right: '4px',
    height: '24px',
    width: '24px',
    backgroundColor: '#23b319ff',
    borderRadius: '9999px',
    border: '2px solid white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxSizing: 'border-box',
  };
  // --- END INLINE CSS ---

  return (
    <div className="min-h-screen bg-page-bg flex">
      <div className="flex-1 pr-[5.5rem]">
        <div className="container mx-auto px-6 py-8">
          
          {/* --- HEADER SECTION (UPDATED) --- */}
          <div className="mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
                <h1 className="text-3xl font-bold text-text-dark mb-2">Profile</h1>
                <p className="text-text-muted">Manage your professional information</p>
            </div>
            {/* --- NEW: Give Feedback Button --- */}
            <Button 
                variant="outline" 
                onClick={() => setIsFeedbackOpen(true)}
                className="shadow-sm"
                
            >
                <MessageSquare className="w-4 h-4 mr-2" />
                Give Feedback
            </Button>
          </div>
          {/* --- END HEADER --- */}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <Card className="lg:col-span-1">
              <CardHeader className="text-center">
                <div style={avatarWrapperStyle}>
                  <Avatar className="w-24 h-24 mx-auto mb-4" style={isVerifiedProfessional ? avatarRingStyle : {}}>
                    <AvatarImage src={profileImageSrc || ""} alt={`${user.username}'s profile`} />
                    <AvatarFallback className="text-2xl bg-primary text-white">
                      {profile.full_name?.split(" ").map((n: string) => n[0]).join("").toUpperCase()}
                    </AvatarFallback>
                  </Avatar>

                  <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" hidden />

                  {isVerifiedProfessional && (
                    <div style={verifiedBadgeStyle} title="Verified Professional">
                      <Check className="h-4 w-4 text-white" strokeWidth={3} />
                    </div>
                  )}

                  {isEditing && (
                    <Button size="sm" variant="outline" className="absolute -bottom-2 -right-2 rounded-full w-8 h-8 p-0" onClick={handleImageClick}>
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
                  <div>
                    <Label className="text-sm font-medium text-text-muted">{roleLabel}</Label>
                    <p className="text-sm">{formData.profileField}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Professional Information</CardTitle>
                <Button variant={isEditing ? "default" : "outline"} size="sm" onClick={isEditing ? handleSave : () => setIsEditing(true)}>
                  {isEditing ? (<><Save className="w-4 h-4 mr-2" />Save Changes</>) : (<><Edit className="w-4 h-4 mr-2" />Edit Profile</>)}
                </Button>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="full_name">Full Name</Label>
                    <Input id="full_name" value={formData.full_name} onChange={(e) => setFormData((p) => ({ ...p, full_name: e.target.value }))} disabled={!isEditing}/>
                  </div>
                  <div>
                    <Label htmlFor="email">Email Address</Label>
                    <Input id="email" type="email" value={formData.email} disabled={true}/>
                  </div>
                  <div>
                    <Label htmlFor="contact_number">Contact Number</Label>
                    <Input id="contact_number" value={formData.contact_number} onChange={(e) => setFormData((p) => ({ ...p, contact_number: e.target.value }))} disabled={!isEditing}/>
                  </div>
                  <div>
                    <Label htmlFor="profileField">{roleLabel}</Label>
                    <Input id="profileField" value={formData.profileField} onChange={(e) => setFormData((p) => ({ ...p, profileField: e.target.value }))} disabled={!isEditing}/>
                  </div>
                  {user.role === 'user' && (
                    <>
                      <div>
                        <Label htmlFor="health_issues">Health Issues</Label>
                        <Input id="health_issues" value={formData.health_issues} onChange={(e) => setFormData((p) => ({ ...p, health_issues: e.target.value }))} disabled={!isEditing}/>
                      </div>
                    </>
                  )}
                </div>
                {(user.role === 'doctor' || user.role === 'counselor') && (
                    <div className="space-y-2">
                        <Label htmlFor="bio">Professional Bio</Label>
                        <Textarea id="bio" placeholder="Tell patients about your experience and approach..." value={formData.bio} onChange={(e) => setFormData(p => ({ ...p, bio: e.target.value }))} disabled={!isEditing} className="min-h-[100px]"/>
                        <p className="text-xs text-muted-foreground">This will be displayed to patients when they are booking appointments.</p>
                    </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      <RightSidebar />

      {/* --- Dialog Component Instance --- */}
      <FeedbackDialog open={isFeedbackOpen} onOpenChange={setIsFeedbackOpen} />
    </div>
  );
}