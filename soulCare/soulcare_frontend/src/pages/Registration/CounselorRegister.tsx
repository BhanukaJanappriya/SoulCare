import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";

// Imports from your UI library
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
// Import icons for dynamic feedback
import { Brain, ArrowLeft, CheckCircle2, XCircle } from "lucide-react";

// Helper component to display validation rules in the instruction box
const ValidationItem: React.FC<{ isValid: boolean; text: string }> = ({ isValid, text }) => (
  <div className={`flex items-center gap-2 transition-colors ${isValid ? "text-green-500" : "text-muted-foreground"}`}>
    {isValid ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
    <span>{text}</span>
  </div>
);

const CounselorRegister: React.FC = () => {
  // State for all form data
  const [formData, setFormData] = useState({
    username: "",
    full_name: "",
    email: "",
    password: "",
    confirm_password: "",
    nic: "",
    contact_number: "",
    expertise: "",
    license_number: "",
  });

  // State for general form errors (from backend), success messages, and loading
  const [errors, setErrors] = useState<string[]>([]);
  const [successMsg, setSuccessMsg] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // State for managing the password instruction box UI
  const [passwordValidation, setPasswordValidation] = useState({
    minLength: false,
    hasNumber: false,
    hasUppercase: false,
    hasLowercase: false,
  });
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);

  // useEffect hook to handle all live validation
  useEffect(() => {
    // 1. Check if passwords match
    if (formData.confirm_password && formData.password !== formData.confirm_password) {
      setConfirmPasswordError("Passwords do not match");
    } else {
      setConfirmPasswordError("");
    }

    // 2. Perform live security validation for the instruction box
    const { password } = formData;
    setPasswordValidation({
      minLength: password.length >= 8,
      hasNumber: /\d/.test(password),
      hasUppercase: /[A-Z]/.test(password),
      hasLowercase: /[a-z]/.test(password),
    });
  }, [formData.password, formData.confirm_password]);

  // Handler for all form input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Submission handler with frontend validation
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors([]); // Reset general errors

    // --- START: SUBMISSION CHECKS ---
    // 1. Check for password mismatch
    if (formData.password !== formData.confirm_password) {
      // The red text under the confirm password box will already be visible
      return; 
    }

    // 2. Check password security rules before submitting
    const isPasswordValid = Object.values(passwordValidation).every(Boolean);
    if (!isPasswordValid) {
      // If the password is not valid, show a single, general error and stop.
      setErrors(["Password does not meet all security requirements."]);
      return;
    }
    // --- END: SUBMISSION CHECKS ---

    setIsLoading(true);
    try {
      const { confirm_password, ...payload } = formData;
      await axios.post("http://localhost:8000/api/auth/register/counselor/", payload);
      setSuccessMsg("Your account is pending admin approval.");
    } catch (err: any) {
      setSuccessMsg("");
      const backendErrors = err.response?.data;
      if (backendErrors && typeof backendErrors === "object") {
        setErrors(Object.values(backendErrors).flat() as string[]);
      } else {
        setErrors(["An unknown error occurred. Please try again."]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen healthcare-gradient flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="healthcare-card">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                <Brain className="w-8 h-8 text-primary" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold">Counselor Registration</CardTitle>
            <CardDescription>Create your account to join our platform</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* All other input fields are unchanged */}
              <div className="space-y-2">
                <Label htmlFor="full_name">Full Name</Label>
                <Input id="full_name" name="full_name" value={formData.full_name} onChange={handleChange} placeholder="Enter your full name" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input id="username" name="username" value={formData.username} onChange={handleChange} placeholder="Choose a username" required />
              </div>

              {/* --- START: CLEANED UP PASSWORD FIELD --- */}
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  onFocus={() => setIsPasswordFocused(true)} // Show instructions on click
                  onBlur={() => setIsPasswordFocused(false)}  // Hide instructions on click away
                  placeholder="Create a password"
                  required
                />
                
                {/* Instruction Box: Appears only when the user is typing in the password field */}
                {isPasswordFocused && (
                  <div className="p-3 mt-2 border rounded-lg bg-muted/50 text-sm">
                    <p className="font-semibold mb-2 text-foreground">Password must contain:</p>
                    <div className="space-y-1.5">
                      <ValidationItem isValid={passwordValidation.minLength} text="At least 8 characters" />
                      <ValidationItem isValid={passwordValidation.hasLowercase} text="One lowercase letter (a-z)" />
                      <ValidationItem isValid={passwordValidation.hasUppercase} text="One uppercase letter (A-Z)" />
                      <ValidationItem isValid={passwordValidation.hasNumber} text="One number (0-9)" />
                    </div>
                  </div>
                )}
                {/* The red error message lines have been removed from here */}
              </div>
              {/* --- END: CLEANED UP PASSWORD FIELD --- */}
              
              <div className="space-y-2">
                <Label htmlFor="confirm_password">Confirm Password</Label>
                <Input
                  id="confirm_password"
                  name="confirm_password"
                  type="password"
                  value={formData.confirm_password}
                  onChange={handleChange}
                  placeholder="Confirm your password"
                  className={confirmPasswordError ? "border-destructive focus-visible:ring-destructive" : ""}
                  required
                />
                {confirmPasswordError && (<p className="text-sm text-destructive pt-1">{confirmPasswordError}</p>)}
              </div>
              
              {/* All other input fields remain unchanged */}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" value={formData.email} onChange={handleChange} placeholder="Enter your email" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="expertise">Expertise</Label>
                <Input id="expertise" name="expertise" value={formData.expertise} onChange={handleChange} placeholder="e.g., CBT, Family Therapy" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nic">NIC</Label>
                <Input id="nic" name="nic" value={formData.nic} onChange={handleChange} placeholder="Enter your NIC number" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact_number">Contact Number</Label>
                <Input id="contact_number" name="contact_number" type="tel" value={formData.contact_number} onChange={handleChange} placeholder="Enter your phone number" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="license_number">License Number</Label>
                <Input id="license_number" name="license_number" type="text" value={formData.license_number} onChange={handleChange} placeholder="Enter Your license number" required />
              </div>
              
              {errors.length > 0 && (
                <Alert variant="destructive" className="bg-destructive/10 border-destructive/20">
                  <AlertTitle>Registration Failed!</AlertTitle>
                  <AlertDescription className="text-destructive text-sm">
                    <ul className="list-disc pl-5 space-y-1">
                      {errors.map((errorMsg, index) => (
                        <li key={index}>{errorMsg}</li>
                      ))}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}
              {successMsg && (
                <Alert variant="success">
                  <AlertTitle>Registration Successful!</AlertTitle>
                  <AlertDescription>{successMsg}</AlertDescription>
                </Alert>
              )}

              <Button type="submit" className="w-full healthcare-button-primary" disabled={isLoading}>
                {isLoading ? "Registering..." : "Register Counselor"}
              </Button>
            </form>
            <div className="text-center mt-4 space-y-2">
              <p className="text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link to="/auth/login" className="text-primary hover:underline">Sign in</Link>
              </p>
              <Link to="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary">
                <ArrowLeft className="w-4 h-4 mr-1" />
                Back to home
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CounselorRegister;


