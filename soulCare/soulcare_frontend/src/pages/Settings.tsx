import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { RightSidebar } from "@/components/layout/RightSidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Settings as SettingsIcon} from "lucide-react";
import {
  Bell,
  Shield,
  Palette,
  Clock,
  MessageSquare,
  Save,
  Calendar,
  Key,
  Lock,
  Loader2,
  Hourglass,
  Globe,
  Users,
  QrCode,
  X,
  CreditCard
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useTheme } from "next-themes"; // Import theme hook
import { api } from "@/api"; // Import API helper

// --- STRIPE IMPORTS ---
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { previousDay } from "date-fns";

// Initialize Stripe
const stripePromise = loadStripe("pk_test_51SWUjLBPhjlkALLUm7vDDMvMUSY3RWastKIsNgwRbBEoqyA6Ftqff7pB9fuuMLGCFOJlTsJIydkYkL0IvoQoAd2300gsUr1vjz");

// --- Payment Method Form ---
const PaymentMethodForm = ({ onSuccess, onCancel }: { onSuccess: (data: any) => void, onCancel: () => void }) => {
    const stripe = useStripe();
    const elements = useElements();
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();

        if (!stripe || !elements) {
            return;
        }

        setIsProcessing(true);
        setErrorMessage(null);

        console.log("1. Starting Stripe Confirmation...");

        try {
            // 1. Confirm Setup with Stripe
            const { error, setupIntent } = await stripe.confirmSetup({
                elements,
                confirmParams: { return_url: window.location.origin + "/settings" },
                redirect: "if_required"
            });

            console.log("2. Stripe Response:", { error, setupIntent }); // Debug Log

            if (error) {
                setErrorMessage(error.message || "An error occurred.");
            } 
            else if (setupIntent && setupIntent.status === "succeeded") {
                console.log("3. Setup Succeeded! Sending to backend..."); // Debug Log
                
                // 2. If successful, save details to backend
                const response = await api.post("settings/billing/save-method/", {
                    payment_method_id: setupIntent.payment_method
                });

                console.log("4. Backend Response:", response.data); // Debug Log
                onSuccess(response.data); 
            } 
            else {
                // Handle other statuses (e.g., requires_payment_method)
                console.warn("3. Setup status was not succeeded:", setupIntent?.status);
                setErrorMessage(`Payment setup incomplete. Status: ${setupIntent?.status}`);
            }
        } catch (err: any) {
            console.error("ERROR:", err); // Debug Log
            // Check if it's a backend error response
            const backendMsg = err.response?.data?.error || "Failed to save payment method details.";
            setErrorMessage(backendMsg);
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <PaymentElement />
            {errorMessage && <div className="text-red-500 text-sm">{errorMessage}</div>}
            <div className="flex justify-end gap-2 mt-4">
                <Button variant="outline" type="button" onClick={onCancel} disabled={isProcessing}>
                    Cancel
                </Button>
                <Button type="submit" disabled={!stripe || isProcessing}>
                    {isProcessing ? "Processing..." : "Save Card"}
                </Button>
            </div>
        </form>
    );
};

export default function Settings() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { setTheme } = useTheme(); // Hook to control the visual theme

  // --- STATE MANAGEMENT ---

  const [notifications, setNotifications] = useState({
    email_appointment_updates: true,
    email_new_messages: true,
    email_appointment_reminders: true,
    emailAppointments: true,
    emailMessages: true,
    emailReminders: true,
    pushAppointments: true,
    pushMessages: false,
    pushReminders: true,
    securityAlerts: true,
  });

  const [preferences, setPreferences] = useState({
    theme: "light",
    language: "en",
    timezone: "UTC-5",
    date_format: "MM/DD/YYYY", 
    time_format: "12h", 
  });

  const [sessionDuration, setSessionDuration] = useState<string>("60");

  const [privacy, setPrivacy] = useState({
    profileVisibility: "public",
    onlineStatus: true,
    readReceipts: true,
    dataSharing: false,
  });

  const [security, setSecurity] = useState({
    twoFactorEnabled: false,
    sessionTimeout: "30",
    passwordLastChanged: new Date("2024-01-15"),
  });

  // --- Password Change State ---
  const [passwordData, setPasswordData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [isSaving, setIsSaving] = useState(false);

  const [billingInfo, setBillingInfo] = useState({ card_brand: "", card_last4: "" , card_exp_month: "", 
      card_exp_year: ""});

  // --- 2FA STATE ---
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);
  const [show2FASetup, setShow2FASetup] = useState(false); // Controls Modal
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [is2FASaving, setIs2FASaving] = useState(false);

  // Payment Modal
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [clientSecret, setClientSecret] = useState("");
  
  const [isPaySaving, setIsPaySaving] = useState(false);


  // --- EFFECTS (Load Data) ---

  useEffect(() => {
    // Fetch Application Preferences from Backend on Load
    const fetchPreferences = async () => {
      try {
          const [billingRes,twoFactorRes] = await Promise.all([
            api.get("settings/billing/info/"),
            api.get("settings/2fa/status")      
        ]);

        const response = await api.get("/settings/preferences/");
        if (response.data) {
          setPreferences((prev) => ({ ...prev, ...response.data }));
          
          // Sync the visual theme immediately based on DB value
          // Backend 'auto' maps to Frontend 'system'
          const visualTheme = response.data.theme === 'auto' ? 'system' : response.data.theme;
          setSessionDuration(String(response.data.session_duration || "60"));          
          setTheme(visualTheme);
        }
        setNotifications((prev)=>({
          ...prev,
          emailAppointments: response.data.email_appointment_updates ?? true,
          emailMessages: response.data.email_new_messages ?? true,
          emailReminders: response.data.email_appointment_reminders ?? true,
        }));
        
  
          // 2. Fetch Privacy Settings (NEW)
        const privacyRes = await api.get("/settings/privacy/");
        if (privacyRes.data) {
          setPrivacy(prev => ({
            ...prev,
            profile_visibility: privacyRes.data.profile_visibility || "public"
          }));
        }

        setIs2FAEnabled(twoFactorRes.data.enabled);

        setBillingInfo(billingRes.data);
        

      } catch (error) {
        console.error("Error fetching preferences:", error);
        // Fail silently or show a toast, using defaults if fetch fails
      }
    };

    fetchPreferences();
  }, [setTheme]);

  // --- HANDLERS ---

  // 1. Billing: Open Payment Modal
  const handleUpdatePaymentMethod = async () => {
    try {
        const response = await api.post("settings/billing/setup-intent/");
        setClientSecret(response.data.client_secret);
        setShowPaymentModal(true);
    } catch (error) {
        toast({ title: "Error", description: "Failed to initialize payment form.", variant: "destructive" });
    }
  };

  const handlePaymentSuccess = (newCardData) => {
      setShowPaymentModal(false);
      setClientSecret("");
      setBillingInfo({ 
          card_brand: newCardData.brand, 
          card_last4: newCardData.last4 ,
          card_exp_month: newCardData.exp_month,
          card_exp_year: newCardData.exp_year
      });
      toast({ title: "Success", description: "Your payment method has been updated." });
  };

  // Special handler for Theme because it needs to update the UI immediately
  const handleThemeChange = async (value: string) => {
    // 1. Update React State
    setPreferences({ ...preferences, theme: value });

    // 2. Update Visual Theme (Frontend)
    const visualValue = value === 'auto' ? 'system' : value;
    setTheme(visualValue);

    // 3. Persist to Backend immediately (Optional, but good UX)
    try {
      await api.patch("/settings/theme/", { theme: value });
      toast({
        title: "Theme Updated",
        description: `Theme changed to ${value} mode.`,
      });
    } catch (error) {
      console.error("Failed to save theme", error);
    }
  };

  // Generic handler for other dropdowns in Preferences
  const handlePreferenceChange = (key: string, value: string) => {
    setPreferences({ ...preferences, [key]: value });
  };

  // --- 2FA HANDLERS ---
  const handleToggle2FA = async (checked: boolean) => {
    if (checked) {
      // User wants to ENABLE -> Start Setup Flow
      try {
        const response = await api.get("settings/2fa/setup/");
        setQrCodeUrl(response.data.qr_code);
        setShow2FASetup(true); // Open Modal
      } catch (error) {
        toast({ title: "Error", description: "Failed to start 2FA setup.", variant: "destructive" });
      }
    } else {
      // User wants to DISABLE
      try {
        await api.post("settings/2fa/disable/");
        setIs2FAEnabled(false);
        toast({ title: "2FA Disabled", description: "Two-factor authentication is now off." });
      } catch (error) {
        toast({ title: "Error", description: "Failed to disable 2FA.", variant: "destructive" });
      }
    }
  };

  const handleVerify2FA = async () => {
    if (verificationCode.length !== 6) {
      toast({ title: "Invalid Code", description: "Please enter a 6-digit code.", variant: "destructive" });
      return;
    }
    
    setIsSaving(true);
    try {
      await api.post("settings/2fa/verify/", { code: verificationCode });
      setIs2FAEnabled(true);
      setShow2FASetup(false); // Close Modal
      setVerificationCode(""); // Clear Input
      toast({ title: "Success", description: "2FA has been successfully enabled!" });
    } catch (error) {
      toast({ title: "Verification Failed", description: "Invalid code. Please try again.", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };



  // Main Save Handler
  const handleSaveSettings = async (section: string) => {
    try {
      if (section === "preference") {
        // Send PATCH request to update preferences
        await api.patch("/settings/preferences/", preferences);
        toast({
          title: "Preferences Saved",
          description: "Your application preferences have been updated.",
        });

       } else if (section === "privacy") {
        // Call the new Privacy Endpoint
        await api.patch("/settings/privacy/", {
          profile_visibility: privacy.profileVisibility
          // Add other privacy fields here when backend supports them
        });
        toast({ title: "Privacy Settings Saved", description: "Your privacy configuration has been updated." });

      } else {
        // Placeholder for other sections (Notifications, Privacy, etc.)
        // You will implement the backend for these later.
        toast({
          title: "Settings Saved",
          description: `Your ${section} settings have been updated.`,
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save settings. Please try again.",
      });
    }
  };
  
  // Save Notification Preferences
  const handleSaveNotifications = async (p0: string) => {
      setIsSaving(true);
      try {
        const payload = {
        email_appointment_updates: notifications.emailAppointments,
        email_new_messages: notifications.emailMessages,
        email_appointment_reminders: notifications.emailReminders,
        };
        // We use the same 'preferences' endpoint to patch these values
        await api.patch("settings/preferences/", payload);
        toast({ title: "Saved", description: "Notification preferences updated." });
      } catch (e) { 
          toast({ variant: "destructive", title: "Error", description: "Failed to save settings." }); 
      } finally { 
          setIsSaving(false); 
      }
  };

  // --- NEW: Handle Password Change ---
  const handleSavePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: "Error",
        description: "New passwords do not match.",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      // Send data to the backend
      await api.post("settings/password/change/", {
        old_password: passwordData.oldPassword,
        new_password: passwordData.newPassword,
        confirm_password: passwordData.confirmPassword,
      });

      toast({
        title: "Success",
        description: "Your password has been updated successfully.",
      });

      // Clear the form
      setPasswordData({
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

    } catch (error: any) {
      console.error("Password change error:", error);
      // Extract error message from backend if available
      const errorMsg = error.response?.data?.old_password?.[0] || 
                       error.response?.data?.new_password?.[0] || 
                       error.response?.data?.detail ||
                       "Failed to update password. Please try again.";
      
      toast({
        title: "Error",
        description: errorMsg,
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveSession = async (value: string) => {
      setIsSaving(true);
      setSessionDuration(value);
      try {
          // Re-use the preferences endpoint since we added the field there
          await api.patch("settings/preferences/", { session_duration: parseInt(value) });
          toast({ title: "Updated", description: "Session timeout updated successfully." });
      } catch (error) {
          toast({ title: "Error", description: "Failed to update session settings.", variant: "destructive" });
      } finally {
          setIsSaving(false);
      }
  };


  return (
    <div className="min-h-screen bg-background text-foreground flex">
      <div className="flex-1 pr-16">
        <div className="container mx-auto px-6 py-8">
          {/* --- HEADER SECTION SETTINGS.TSX--- */}
            <Card className="mb-8 shadow-sm bg-card">
              <CardHeader>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-full bg-muted">
                      <SettingsIcon className="w-6 h-6 text-blue-400" />
                    </div>
                    <div>
                      <CardTitle className="text-2xl font-bold">Manage Settings</CardTitle>
                      <CardDescription className="mt-1">
                        View and manage all your settings.
                      </CardDescription>
                    </div>
                  </div>
                </div>
              </CardHeader>
            </Card>
            {/* --- END HEADER --- */}

          <Tabs defaultValue="preferences" className="space-y-6">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="notifications">Notifications</TabsTrigger>
              <TabsTrigger value="preferences">Preferences</TabsTrigger>
              <TabsTrigger value="privacy">Privacy</TabsTrigger>
              <TabsTrigger value="security">Security</TabsTrigger>
              <TabsTrigger value="billing">Billing</TabsTrigger>
            </TabsList>

            {/* Notifications Settings */}
            <TabsContent value="notifications">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="w-5 h-5" />
                    Notification Preferences
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-4">
                      Email Notifications
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Calendar className="w-4 h-4 text-muted-foreground" />
                          <div>
                            <Label htmlFor="email-appointments">
                              Appointment Updates
                            </Label>
                            <p className="text-sm text-muted-foreground">
                              Get notified about appointment changes
                            </p>
                          </div>
                        </div>
                        <Switch
                          id="email-appointments"
                          checked={notifications.emailAppointments}
                          onCheckedChange={(checked) =>
                            setNotifications(prev=>({
                              ...prev,notifications,
                              emailAppointments: checked,
                            }))
                          }
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <MessageSquare className="w-4 h-4 text-muted-foreground" />
                          <div>
                            <Label htmlFor="email-messages">New Messages</Label>
                            <p className="text-sm text-muted-foreground">
                              Get notified when patients send messages
                            </p>
                          </div>
                        </div>
                        <Switch
                          id="email-messages"
                          checked={notifications.emailMessages}
                          onCheckedChange={(checked) =>
                            setNotifications(prev =>({
                              ...prev,
                              emailMessages: checked,
                            }))
                          }
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Clock className="w-4 h-4 text-muted-foreground" />
                          <div>
                            <Label htmlFor="email-reminders">
                              Appointment Reminders
                            </Label>
                            <p className="text-sm text-muted-foreground">
                              Reminders before upcoming appointments
                            </p>
                          </div>
                        </div>
                        <Switch
                          id="email-reminders"
                          checked={notifications.emailReminders}
                          onCheckedChange={(checked) =>
                            setNotifications(prev =>({
                              ...prev,notifications,
                              emailReminders: checked,
                            }))
                          }
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-4">
                      Push Notifications
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Calendar className="w-4 h-4 text-muted-foreground" />
                          <div>
                            <Label htmlFor="push-appointments">
                              Appointment Updates
                            </Label>
                            <p className="text-sm text-muted-foreground">
                              Real-time appointment notifications
                            </p>
                          </div>
                        </div>
                        <Switch
                          id="push-appointments"
                          checked={notifications.pushAppointments}
                          onCheckedChange={(checked) =>
                            setNotifications({
                              ...notifications,
                              pushAppointments: checked,
                            })
                          }
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <MessageSquare className="w-4 h-4 text-muted-foreground" />
                          <div>
                            <Label htmlFor="push-messages">New Messages</Label>
                            <p className="text-sm text-muted-foreground">
                              Instant message notifications
                            </p>
                          </div>
                        </div>
                        <Switch
                          id="push-messages"
                          checked={notifications.pushMessages}
                          onCheckedChange={(checked) =>
                            setNotifications({
                              ...notifications,
                              pushMessages: checked,
                            })
                          }
                        />
                      </div>
                    </div>
                  </div>

                  <Button onClick={() => handleSaveNotifications("notification")}>
                    <Save className="w-4 h-4 mr-2" />
                    Save Notification Settings
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Preferences Settings */}
            <TabsContent value="preferences">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Palette className="w-5 h-5" />
                    Application Preferences
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    
                    {/* THEME */}
                    <div>
                      <Label htmlFor="theme">Theme</Label>
                      <Select
                        value={preferences.theme}
                        onValueChange={handleThemeChange}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select theme" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="light">Light</SelectItem>
                          <SelectItem value="dark">Dark</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground mt-1">
                        Controls the visual appearance of the app.
                      </p>
                    </div>

                    {/* LANGUAGE */}
                    <div>
                      <Label htmlFor="language">Language</Label>
                      <Select
                        value={preferences.language}
                        onValueChange={(val) => handlePreferenceChange('language', val)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="en">English</SelectItem>
                          <SelectItem value="sn">Sinhala</SelectItem>
                          <SelectItem value="tm">Tamil</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* TIMEZONE */}
                    <div>
                      <Label htmlFor="timezone">Timezone</Label>
                      <Select
                        value={preferences.timezone}
                        onValueChange={(val) => handlePreferenceChange('timezone', val)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="UTC-5">EST (UTC-5)</SelectItem>
                          <SelectItem value="UTC-6">CST (UTC-6)</SelectItem>
                          <SelectItem value="UTC-7">MST (UTC-7)</SelectItem>
                          <SelectItem value="UTC-8">PST (UTC-8)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* DATE FORMAT */}
                    <div>
                      <Label htmlFor="date-format">Date Format</Label>
                      <Select
                        value={preferences.date_format}
                        onValueChange={(val) => handlePreferenceChange('date_format', val)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                          <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                          <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* TIME FORMAT */}
                    <div>
                      <Label htmlFor="time-format">Time Format</Label>
                      <Select
                        value={preferences.time_format}
                        onValueChange={(val) => handlePreferenceChange('time_format', val)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="12h">12 Hour</SelectItem>
                          <SelectItem value="24h">24 Hour</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <Button onClick={() => handleSaveSettings("preference")}>
                    <Save className="w-4 h-4 mr-2" />
                    Save Preferences
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Privacy Settings */}
            <TabsContent value="privacy">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    Privacy Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Profile Visibility</Label>
                        <p className="text-sm text-muted-foreground">
                          Who can see your profile information
                        </p>
                      </div>
                      <Select
                        value={privacy.profileVisibility}
                        onValueChange={(value) =>
                          setPrivacy({ ...privacy, profileVisibility: value })
                        }
                      >
                        <SelectTrigger className="w-48">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="public">Public</SelectItem>
                          <SelectItem value="patients_only">
                            Patients Only
                          </SelectItem>
                          <SelectItem value="private">Private</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Show Online Status</Label>
                        <p className="text-sm text-muted-foreground">
                          Let patients see when you're online
                        </p>
                      </div>
                      <Switch
                        checked={privacy.onlineStatus}
                        onCheckedChange={(checked) =>
                          setPrivacy({ ...privacy, onlineStatus: checked })
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Read Receipts</Label>
                        <p className="text-sm text-muted-foreground">
                          Show when you've read messages
                        </p>
                      </div>
                      <Switch
                        checked={privacy.readReceipts}
                        onCheckedChange={(checked) =>
                          setPrivacy({ ...privacy, readReceipts: checked })
                        }
                      />
                    </div>
                  </div>

                  <Button onClick={() => handleSaveSettings("privacy")}>
                    <Save className="w-4 h-4 mr-2" />
                    Save Privacy Settings
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Security Settings */}
            <TabsContent value="security">
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Change Password</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>Current Password</Label>
                      <Input
                        type="password"
                        placeholder="Enter current password"
                        value={passwordData.oldPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, oldPassword: e.target.value })}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>New Password</Label>
                        <Input
                          type="password"
                          placeholder="Enter new password"
                          value={passwordData.newPassword}
                          onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Confirm Password</Label>
                        <Input
                          type="password"
                          placeholder="Confirm new password"
                          value={passwordData.confirmPassword}
                          onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <Button onClick={handleSavePassword} disabled={isSaving}>
                        {isSaving ? "Updating..." : <><Key className="w-4 h-4 mr-2" /> Update Password</>}
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Two-Factor Authentication</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between p-4 bg-secondary/20 rounded-lg">
                      <div>
                        <Label>2FA Status</Label>
                        <p className="text-sm text-muted-foreground">
                          Add an extra layer of security to your account
                        </p>
                        {/* Toggle Switch */}
                        <Switch checked={is2FAEnabled} onCheckedChange={handleToggle2FA} />
                        <div className="mt-2">
                          <Badge
                            variant={
                              security.twoFactorEnabled
                                ? "default"
                                : "secondary"
                            }
                          >
                            {security.twoFactorEnabled ? "Enabled" : "Disabled"}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Session Management</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="session-timeout">
                          Session Timeout
                        </Label>
                        <Select
                          value={sessionDuration} // Bound to state
                          onValueChange={handleSaveSession}  // Triggers Auto-Save
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select Duration"/>
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="15">15 minutes</SelectItem>
                            <SelectItem value="30">30 minutes</SelectItem>
                            <SelectItem value="60">1 hour</SelectItem>
                            <SelectItem value="120">2 hours</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Button onClick={() => handleSaveSettings("security")}>
                  <Save className="w-4 h-4 mr-2" />
                  Save Security Settings
                </Button>
              </div>
            </TabsContent>

            {/* --- 2FA SETUP MODAL --- */}
      {show2FASetup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-background border rounded-lg shadow-lg w-full max-w-md p-6 space-y-6">
                <div className="flex justify-between items-center">
                    <h2 className="text-lg font-semibold flex items-center"><QrCode className="w-5 h-5 mr-2" /> Setup 2FA</h2>
                    <Button variant="ghost" size="icon" onClick={() => setShow2FASetup(false)}><X className="w-4 h-4" /></Button>
                </div>
                
                <div className="flex flex-col items-center space-y-4">
                    <p className="text-sm text-center text-muted-foreground">Scan this QR code with your Authenticator App (Google/Microsoft Authenticator).</p>
                    <div className="border p-2 bg-white rounded-md">
                        {qrCodeUrl && <img src={qrCodeUrl} alt="2FA QR Code" className="w-48 h-48 object-contain" />}
                    </div>
                    <div className="w-full space-y-2">
                        <Label>Enter 6-Digit Code</Label>
                        <Input 
                            value={verificationCode} 
                            onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                            placeholder="e.g. 123456"
                            className="text-center tracking-widest text-lg"
                        />
                    </div>
                </div>

                <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setShow2FASetup(false)}>Cancel</Button>
                    <Button onClick={handleVerify2FA} disabled={isSaving}>
                        {isSaving ? "Verifying..." : "Verify & Enable"}
                    </Button>
                </div>
            </div>
        </div>
      )}
                  {/* Billing Settings */}
            <TabsContent value="billing">
              <Card>
                <CardHeader>
                  <CardTitle>Billing & Subscription</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="p-6 bg-primary/10 rounded-lg border border-primary/20">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="text-lg font-semibold">
                          Professional Plan
                        </h3>
                        <p className="text-muted-foreground">
                          Unlimited patients, video calls, and features
                        </p>
                        <Badge className="mt-2">Active</Badge>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold">$99</div>
                        <div className="text-muted-foreground">per month</div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-4">
                      Payment Method
                    </h3>
                    <p className="text-sm text-muted-foreground">Update your card details securely.</p>
                    <div className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded flex items-center justify-center">
                            💳
                          </div>
                          <div>
                            {/* <p className="font-medium">•••• •••• •••• 4242</p>
                            <p className="text-sm text-muted-foreground">
                              Expires 12/27
                            </p> */}
                            <p className="text-sm text-muted-foreground uppercase font-bold">
                                {billingInfo.card_last4 
                                   ? `**** **** ***** ${billingInfo.card_last4}`
                                   : "No card saved"}
                            </p>
                            {billingInfo.card_exp_month && (
                              <p className="text-xs text-muted-foreground">
                                  Expires {billingInfo.card_exp_month}/{billingInfo.card_exp_year}
                              </p>
                            )}
                          </div>
                        </div>

                        <Button onClick={handleUpdatePaymentMethod} variant="outline" size="sm">
                          Update
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* PAYMENT MODAL */}
                  {showPaymentModal && clientSecret && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                        <div className="bg-background border rounded-lg shadow-lg w-full max-w-md p-6 space-y-6">
                            <div className="flex justify-between items-center"><h2 className="text-lg font-semibold">Update Payment Method</h2><Button variant="ghost" size="icon" onClick={() => setShowPaymentModal(false)}><X className="w-4 h-4" /></Button></div>
                            {/* WRAP WITH ELEMENTS PROVIDER */}
                            <Elements stripe={stripePromise} options={{ clientSecret }}>
                                <PaymentMethodForm onSuccess={handlePaymentSuccess} onCancel={() => setShowPaymentModal(false)} />
                            </Elements>
                        </div>
                    </div>
                  )}

                  <div>
                    <h3 className="text-lg font-semibold mb-4">
                      Billing History
                    </h3>
                    <div className="space-y-3">
                      {[
                        {
                          date: "2024-02-01",
                          amount: "$99.00",
                          status: "Paid",
                        },
                        {
                          date: "2024-01-01",
                          amount: "$99.00",
                          status: "Paid",
                        },
                        {
                          date: "2023-12-01",
                          amount: "$99.00",
                          status: "Paid",
                        },
                      ].map((invoice, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 border rounded-lg"
                        >
                          <div>
                            <p className="font-medium">{invoice.date}</p>
                            <p className="text-sm text-muted-foreground">
                              Professional Plan
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">{invoice.amount}</p>
                            <Badge variant="outline">{invoice.status}</Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
      <RightSidebar />
    </div>
  );
}

