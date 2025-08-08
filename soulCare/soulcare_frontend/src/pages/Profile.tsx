import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { RightSidebar } from "@/components/layout/RightSidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star, Edit, Save, Camera } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Profile() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);

  // This logic correctly determines the specialization/expertise
  const specializationOrExpertise =
    user?.profile && 'specialization' in user.profile ? user.profile.specialization :
    user?.profile && 'expertise' in user.profile ? user.profile.expertise : '';

  const [formData, setFormData] = useState({
    full_name: user?.profile?.full_name || "",
    email: user?.email || "",
    contact_number: user?.profile?.contact_number || "",
    specialization: specializationOrExpertise,
  });

  const handleSave = () => {
    toast({
      title: "Profile Updated",
      description: "Your profile information has been successfully updated.",
    });
    setIsEditing(false);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  if (!user || !user.profile) {
    return <div>Loading profile...</div>;
  }

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
                <div className="relative inline-block">
                  <Avatar className="w-24 h-24 mx-auto mb-4">
                    <AvatarImage src="" />
                    <AvatarFallback className="text-2xl bg-primary text-white">
                      {user.profile.full_name?.split(" ").map((n) => n[0]).join("").toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <Button size="sm" variant="outline" className="absolute -bottom-2 -right-2 rounded-full w-8 h-8 p-0">
                    <Camera className="w-4 h-4" />
                  </Button>
                </div>
                <CardTitle className="text-xl">{user.profile.full_name}</CardTitle>
                <p className="text-text-muted capitalize">{user.role}</p>
                {/* CORRECTED: Using the 'in' operator as a type guard for rating */}
                {'rating' in user.profile && user.profile.rating && (
                  <div className="flex items-center justify-center mt-2">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400 mr-1" />
                    <span className="font-semibold">{user.profile.rating}</span>
                    <span className="text-text-muted ml-1">(Mock reviews)</span>
                  </div>
                )}
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <Label className="text-sm font-medium text-text-muted">
                      {user.role === 'doctor' ? 'Specialization' : 'Expertise'}
                    </Label>
                    <p className="text-sm">{specializationOrExpertise}</p>
                  </div>
                   <div>
                    <Label className="text-sm font-medium text-text-muted">License Number</Label>
                    {/* CORRECTED: Using the 'in' operator as a type guard */}
                    <p className="text-sm">
                      {'license_number' in user.profile ? user.profile.license_number : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-text-muted">Availability</Label>
                    {/* CORRECTED: Using the 'in' operator as a type guard */}
                    <p className="text-sm">
                      {'availability' in user.profile ? user.profile.availability : 'Not specified'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Profile Details */}
            <Card className="lg:col-span-2">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Professional Information</CardTitle>
                <Button variant={isEditing ? "default" : "outline"} size="sm" onClick={isEditing ? handleSave : () => setIsEditing(true)}>
                  {isEditing ? <><Save className="w-4 h-4 mr-2" />Save Changes</> : <><Edit className="w-4 h-4 mr-2" />Edit Profile</>}
                </Button>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="full_name">Full Name</Label>
                    <Input id="full_name" value={formData.full_name} onChange={(e) => handleInputChange("full_name", e.target.value)} disabled={!isEditing}/>
                  </div>
                  <div>
                    <Label htmlFor="email">Email Address</Label>
                    <Input id="email" type="email" value={formData.email} disabled={true} />
                  </div>
                  <div>
                    <Label htmlFor="contact_number">Contact Number</Label>
                    <Input id="contact_number" value={formData.contact_number} onChange={(e) => handleInputChange("contact_number", e.target.value)} disabled={!isEditing}/>
                  </div>
                  <div>
                    <Label htmlFor="specialization">{user.role === 'doctor' ? 'Specialization' : 'Expertise'}</Label>
                    <Input id="specialization" value={formData.specialization} onChange={(e) => handleInputChange("specialization", e.target.value)} disabled={!isEditing}/>
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