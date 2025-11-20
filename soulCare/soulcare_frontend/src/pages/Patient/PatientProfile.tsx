import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Edit, Save, Camera, User as UserIcon, Mail, Phone, MapPin, Calendar, FileText, CreditCard } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/api";
import { PatientProfile } from "@/types";
import { Badge } from "@/components/ui/badge";

// Helper to build FormData for file uploads
const buildFormData = (data: Record<string, any>): FormData => {
    const formData = new FormData();
    for (const key in data) {
        if (data[key] instanceof File) {
            formData.append(key, data[key]);
        } else if (data[key] !== null && data[key] !== undefined) {
            formData.append(key, String(data[key]));
        }
    }
    return formData;
};

export default function PatientProfilePage() {
    const { user, fetchUser, isLoading: isAuthLoading } = useAuth();
    const { toast } = useToast();
    const [isEditing, setIsEditing] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isSaving, setIsSaving] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        full_name: "",
        email: "",
        contact_number: "",
        address: "",
        health_issues: "",
        nic: "",
        dob: "",
    });

    // Sync user data to local state when it loads
    useEffect(() => {
        if (user && user.profile) {
            const profile = user.profile as PatientProfile;
            setFormData({
                email: user.email || "",
                full_name: profile.full_name || "",
                contact_number: profile.contact_number || "",
                address: profile.address || "",
                health_issues: profile.health_issues || "",
                nic: profile.nic || "",
                dob: profile.dob || "",
            });
        }
    }, [user]);

    const handleSave = async () => {
        if (!user) return;
        setIsSaving(true);

        const updateData: Record<string, any> = {
            full_name: formData.full_name,
            contact_number: formData.contact_number,
            address: formData.address,
            health_issues: formData.health_issues,
        };

        if (file) {
            updateData.profile_picture = file;
        }

        const payload = buildFormData(updateData);

        try {
            await api.patch('auth/user/', payload, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            const token = localStorage.getItem('accessToken');
            if (token) await fetchUser(token);

            toast({ title: "Success", description: "Profile updated successfully." });
            setIsEditing(false);
            setFile(null);
        } catch (error: any) {
            console.error("Update failed", error);
            toast({
                variant: "destructive",
                title: "Error",
                description: error.response?.data?.detail || "Failed to update profile.",
            });
        } finally {
            setIsSaving(false);
        }
    };

    const handleImageClick = () => {
        if (isEditing) fileInputRef.current?.click();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) setFile(e.target.files[0]);
    };

    if (isAuthLoading) return <div className="flex justify-center items-center min-h-[60vh] text-muted-foreground">Loading profile...</div>;
    if (!user || !user.profile) return <div className="flex justify-center items-center min-h-[60vh] text-muted-foreground">Profile not found.</div>;

    const profile = user.profile as PatientProfile;
    const displayImage = file ? URL.createObjectURL(file) : (profile.profile_picture || undefined);

    return (
        // FIX: Added pr-[5.5rem] to prevent the fixed RightSidebar from covering content
        <div className="container max-w-6xl mx-auto px-6 py-10 space-y-8 pr-[5.5rem]">
            
            {/* --- Header Section --- */}
            {/* Added relative and z-index to ensure it stays above background elements but below sidebar */}
            <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b pb-6 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 top-0 pt-2">
                <div>
                    <h1 className="text-4xl font-bold text-foreground tracking-tight">My Profile</h1>
                    <p className="text-muted-foreground mt-1">Manage your personal information and health records.</p>
                </div>
                <Button
                    variant="default"
                    size="lg"
                    className="shadow-sm transition-all"
                    onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                    disabled={isSaving}
                >
                    {isEditing ? (
                        <>
                            <Save className="w-4 h-4 mr-2" />
                            {isSaving ? "Saving..." : "Save Changes"}
                        </>
                    ) : (
                        <>
                            <Edit className="w-4 h-4 mr-2" />
                            Edit Profile
                        </>
                    )}
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* --- Left Column: Identity Card (Span 4) --- */}
                <div className="lg:col-span-4 space-y-6">
                    <Card className="overflow-hidden border-muted shadow-sm">
                        <div className="bg-muted/30 h-24 w-full absolute top-0 left-0 z-0" />
                        <CardHeader className="relative z-10 text-center pt-12 pb-8">
                            <div className="relative inline-block mx-auto group mb-4">
                                <Avatar 
                                    className={`w-36 h-36 border-4 border-background shadow-xl ${isEditing ? 'cursor-pointer hover:opacity-90 transition-opacity' : ''}`}
                                    onClick={handleImageClick}
                                >
                                    <AvatarImage src={displayImage} className="object-cover" />
                                    <AvatarFallback className="text-5xl bg-primary/10 text-primary">
                                        {profile.full_name?.[0]?.toUpperCase() || <UserIcon className="w-12 h-12" />}
                                    </AvatarFallback>
                                </Avatar>
                                
                                <input 
                                    type="file" 
                                    ref={fileInputRef} 
                                    onChange={handleFileChange} 
                                    className="hidden" 
                                    accept="image/*"
                                />

                                {isEditing && (
                                    <div 
                                        className="absolute bottom-1 right-1 bg-primary text-primary-foreground p-2.5 rounded-full shadow-lg cursor-pointer hover:bg-primary/90 transition-colors ring-2 ring-background"
                                        onClick={(e) => { e.stopPropagation(); handleImageClick(); }}
                                        title="Upload new picture"
                                    >
                                        <Camera className="w-5 h-5" />
                                    </div>
                                )}
                            </div>
                            <CardTitle className="text-2xl font-bold truncate px-2">{formData.full_name || "Patient Name"}</CardTitle>
                            <CardDescription className="flex items-center justify-center gap-1.5 mt-2 text-sm font-medium">
                                <Badge variant="outline" className="bg-primary/5 border-primary/20 text-primary hover:bg-primary/10">
                                    Patient Account
                                </Badge>
                            </CardDescription>
                        </CardHeader>
                        
                        <CardContent className="space-y-5 relative z-10 bg-card pt-0">
                            <div className="grid gap-4 border-t pt-6">
                                <div className="flex items-center justify-between group">
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <CreditCard className="w-4 h-4" />
                                        <span className="text-sm font-medium">NIC</span>
                                    </div>
                                    <span className="text-sm font-mono bg-muted/50 px-2 py-1 rounded text-foreground">{profile.nic || "N/A"}</span>
                                </div>
                                <div className="flex items-center justify-between group">
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <Calendar className="w-4 h-4" />
                                        <span className="text-sm font-medium">Date of Birth</span>
                                    </div>
                                    <span className="text-sm font-medium text-foreground">{profile.dob || "N/A"}</span>
                                </div>
                                <div className="flex items-center justify-between group">
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <Mail className="w-4 h-4" />
                                        <span className="text-sm font-medium">Email</span>
                                    </div>
                                    <span className="text-sm font-medium text-foreground truncate max-w-[180px]" title={formData.email}>{formData.email}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* --- Right Column: Details Form (Span 8) --- */}
                <div className="lg:col-span-8 space-y-6">
                    <Card className="shadow-sm border-muted">
                        <CardHeader>
                            <CardTitle className="text-xl flex items-center gap-2">
                                <UserIcon className="w-5 h-5 text-primary" />
                                Personal Details
                            </CardTitle>
                            <CardDescription>
                                Update your contact information and personal details.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="full_name" className="text-sm font-medium text-muted-foreground">Full Name</Label>
                                    <div className="relative">
                                        <Input 
                                            id="full_name"
                                            value={formData.full_name}
                                            onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                                            disabled={!isEditing}
                                            className="pl-10"
                                        />
                                        <UserIcon className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="contact" className="text-sm font-medium text-muted-foreground">Contact Number</Label>
                                    <div className="relative">
                                        <Input 
                                            id="contact"
                                            value={formData.contact_number}
                                            onChange={(e) => setFormData({...formData, contact_number: e.target.value})}
                                            disabled={!isEditing}
                                            className="pl-10"
                                        />
                                        <Phone className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="address" className="text-sm font-medium text-muted-foreground">Address</Label>
                                <div className="relative">
                                    <Textarea 
                                        id="address"
                                        value={formData.address}
                                        onChange={(e) => setFormData({...formData, address: e.target.value})}
                                        disabled={!isEditing}
                                        className="min-h-[100px] pl-10 resize-none"
                                    />
                                    <MapPin className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="shadow-sm border-muted">
                        <CardHeader>
                            <CardTitle className="text-xl flex items-center gap-2">
                                <FileText className="w-5 h-5 text-primary" />
                                Medical Information
                            </CardTitle>
                            <CardDescription>
                                Important health information visible to your doctors.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                <Label htmlFor="health_issues" className="text-sm font-medium text-muted-foreground">Health Issues / Allergies / Notes</Label>
                                <Textarea 
                                    id="health_issues"
                                    value={formData.health_issues}
                                    onChange={(e) => setFormData({...formData, health_issues: e.target.value})}
                                    disabled={!isEditing}
                                    placeholder="E.g., Allergic to penicillin, History of asthma..."
                                    className="min-h-[150px] p-4 leading-relaxed"
                                />
                                {isEditing && (
                                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-2">
                                        <span className="inline-block w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                                        Changes here will be updated in your permanent medical record.
                                    </p>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}