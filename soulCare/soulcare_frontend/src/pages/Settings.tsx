import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { RightSidebar } from "@/components/layout/RightSidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Bell,
  Shield,
  Palette,
  Clock,
  Globe,
  Mail,
  Phone,
  Calendar,
  Video,
  MessageSquare,
  Save,
  Eye,
  EyeOff,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Settings() {
  const { user } = useAuth();
  const { toast } = useToast();

  const [notifications, setNotifications] = useState({
    emailAppointments: true,
    emailMessages: true,
    emailReminders: true,
    pushAppointments: true,
    pushMessages: false,
    pushReminders: true,
  });

  const [preferences, setPreferences] = useState({
    theme: "light",
    language: "en",
    timezone: "UTC-5",
    dateFormat: "MM/DD/YYYY",
    timeFormat: "12h",
  });

  const [privacy, setPrivacy] = useState({
    profileVisibility: "patients",
    onlineStatus: true,
    readReceipts: true,
    dataSharing: false,
  });

  const [security, setSecurity] = useState({
    twoFactorEnabled: false,
    sessionTimeout: "30",
    passwordLastChanged: new Date("2024-01-15"),
  });

  const [showPassword, setShowPassword] = useState(false);

  const handleSaveSettings = (section: string) => {
    toast({
      title: "Settings Saved",
      description: `Your ${section} settings have been updated successfully.`,
    });
  };

  const handlePasswordChange = () => {
    toast({
      title: "Password Change Request",
      description: "Password change instructions have been sent to your email.",
    });
  };

  const handleEnableTwoFactor = () => {
    setSecurity({ ...security, twoFactorEnabled: !security.twoFactorEnabled });
    toast({
      title: security.twoFactorEnabled ? "2FA Disabled" : "2FA Enabled",
      description: security.twoFactorEnabled
        ? "Two-factor authentication has been disabled."
        : "Two-factor authentication has been enabled.",
    });
  };

  return (
    <div className="min-h-screen bg-page-bg flex">
      <div className="flex-1 pr-16">
        <div className="container mx-auto px-6 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-text-dark mb-2">Settings</h1>
            <p className="text-text-muted">
              Manage your account preferences and configurations
            </p>
          </div>

          <Tabs defaultValue="notifications" className="space-y-6">
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
                          <Calendar className="w-4 h-4 text-text-muted" />
                          <div>
                            <Label htmlFor="email-appointments">
                              Appointment Updates
                            </Label>
                            <p className="text-sm text-text-muted">
                              Get notified about appointment changes
                            </p>
                          </div>
                        </div>
                        <Switch
                          id="email-appointments"
                          checked={notifications.emailAppointments}
                          onCheckedChange={(checked) =>
                            setNotifications({
                              ...notifications,
                              emailAppointments: checked,
                            })
                          }
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <MessageSquare className="w-4 h-4 text-text-muted" />
                          <div>
                            <Label htmlFor="email-messages">New Messages</Label>
                            <p className="text-sm text-text-muted">
                              Get notified when patients send messages
                            </p>
                          </div>
                        </div>
                        <Switch
                          id="email-messages"
                          checked={notifications.emailMessages}
                          onCheckedChange={(checked) =>
                            setNotifications({
                              ...notifications,
                              emailMessages: checked,
                            })
                          }
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Clock className="w-4 h-4 text-text-muted" />
                          <div>
                            <Label htmlFor="email-reminders">
                              Appointment Reminders
                            </Label>
                            <p className="text-sm text-text-muted">
                              Reminders before upcoming appointments
                            </p>
                          </div>
                        </div>
                        <Switch
                          id="email-reminders"
                          checked={notifications.emailReminders}
                          onCheckedChange={(checked) =>
                            setNotifications({
                              ...notifications,
                              emailReminders: checked,
                            })
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
                          <Calendar className="w-4 h-4 text-text-muted" />
                          <div>
                            <Label htmlFor="push-appointments">
                              Appointment Updates
                            </Label>
                            <p className="text-sm text-text-muted">
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
                          <MessageSquare className="w-4 h-4 text-text-muted" />
                          <div>
                            <Label htmlFor="push-messages">New Messages</Label>
                            <p className="text-sm text-text-muted">
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

                  <Button onClick={() => handleSaveSettings("notification")}>
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
                    <div>
                      <Label htmlFor="theme">Theme</Label>
                      <Select
                        value={preferences.theme}
                        onValueChange={(value) =>
                          setPreferences({ ...preferences, theme: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="light">Light</SelectItem>
                          <SelectItem value="dark">Dark</SelectItem>
                          <SelectItem value="auto">Auto</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="language">Language</Label>
                      <Select
                        value={preferences.language}
                        onValueChange={(value) =>
                          setPreferences({ ...preferences, language: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="en">English</SelectItem>
                          <SelectItem value="es">Spanish</SelectItem>
                          <SelectItem value="fr">French</SelectItem>
                          <SelectItem value="de">German</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="timezone">Timezone</Label>
                      <Select
                        value={preferences.timezone}
                        onValueChange={(value) =>
                          setPreferences({ ...preferences, timezone: value })
                        }
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

                    <div>
                      <Label htmlFor="date-format">Date Format</Label>
                      <Select
                        value={preferences.dateFormat}
                        onValueChange={(value) =>
                          setPreferences({ ...preferences, dateFormat: value })
                        }
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

                    <div>
                      <Label htmlFor="time-format">Time Format</Label>
                      <Select
                        value={preferences.timeFormat}
                        onValueChange={(value) =>
                          setPreferences({ ...preferences, timeFormat: value })
                        }
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
                        <p className="text-sm text-text-muted">
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
                          <SelectItem value="patients">
                            Patients Only
                          </SelectItem>
                          <SelectItem value="private">Private</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Show Online Status</Label>
                        <p className="text-sm text-text-muted">
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
                        <p className="text-sm text-text-muted">
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

                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Anonymous Analytics</Label>
                        <p className="text-sm text-text-muted">
                          Help improve our service with usage data
                        </p>
                      </div>
                      <Switch
                        checked={privacy.dataSharing}
                        onCheckedChange={(checked) =>
                          setPrivacy({ ...privacy, dataSharing: checked })
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
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    Security & Authentication
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Password</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div>
                          <Label>Password</Label>
                          <p className="text-sm text-text-muted">
                            Last changed:{" "}
                            {security.passwordLastChanged.toLocaleDateString()}
                          </p>
                        </div>
                        <Button
                          variant="outline"
                          onClick={handlePasswordChange}
                        >
                          Change Password
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-4">
                      Two-Factor Authentication
                    </h3>
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <Label>2FA Status</Label>
                        <p className="text-sm text-text-muted">
                          Add an extra layer of security to your account
                        </p>
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
                      <Button onClick={handleEnableTwoFactor}>
                        {security.twoFactorEnabled
                          ? "Disable 2FA"
                          : "Enable 2FA"}
                      </Button>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-4">
                      Session Management
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="session-timeout">
                          Session Timeout (minutes)
                        </Label>
                        <Select
                          value={security.sessionTimeout}
                          onValueChange={(value) =>
                            setSecurity({ ...security, sessionTimeout: value })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
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
                  </div>

                  <Button onClick={() => handleSaveSettings("security")}>
                    <Save className="w-4 h-4 mr-2" />
                    Save Security Settings
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Billing Settings */}
            <TabsContent value="billing">
              <Card>
                <CardHeader>
                  <CardTitle>Billing & Subscription</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="p-6 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="text-lg font-semibold">
                          Professional Plan
                        </h3>
                        <p className="text-text-muted">
                          Unlimited patients, video calls, and features
                        </p>
                        <Badge className="mt-2">Active</Badge>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold">$99</div>
                        <div className="text-text-muted">per month</div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-4">
                      Payment Method
                    </h3>
                    <div className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center">
                            💳
                          </div>
                          <div>
                            <p className="font-medium">•••• •••• •••• 4242</p>
                            <p className="text-sm text-text-muted">
                              Expires 12/27
                            </p>
                          </div>
                        </div>
                        <Button variant="outline" size="sm">
                          Update
                        </Button>
                      </div>
                    </div>
                  </div>

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
                            <p className="text-sm text-text-muted">
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
