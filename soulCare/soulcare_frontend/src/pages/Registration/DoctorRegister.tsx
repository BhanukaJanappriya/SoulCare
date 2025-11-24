import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";

// Imports for the modern styling system
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
import { Stethoscope, ArrowLeft, CheckCircle2, XCircle,Upload } from "lucide-react";

// Helper component to display validation rules dynamically
const ValidationItem: React.FC<{ isValid: boolean; text: string }> = ({ isValid, text }) => (
  <div className={`flex items-center gap-2 transition-colors ${isValid ? "text-green-500" : "text-muted-foreground"}`}>
    {isValid ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
    <span>{text}</span>
  </div>
);

const DoctorRegister: React.FC = () => {
  // Your original state for form data
  const [formData, setFormData] = useState({
    username: "",
    full_name: "",
    email: "",
    password: "",
    confirm_password: "",
    nic: "",
    contact_number: "",
    specialization: "",
    availability: "",
    license_number:"",
  });

  const [licenseFile, setLicenseFile] = useState<File | null>(null);

  // Your original state for handling form status
  const [errors, setErrors] = useState<string[]>([]);
  const [successMsg, setSuccessMsg] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  
  // --- START: ADDED STATE FOR PASSWORD UI ---
  const [passwordValidation, setPasswordValidation] = useState({
    minLength: false,
    hasNumber: false,
    hasUppercase: false,
    hasLowercase: false,
  });
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);
  // We don't need a separate passwordErrors state, we can use the main `errors` state
  // --- END: ADDED STATE ---

  // Combined useEffect for all live password validation
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

  // Handler for form input changes (unchanged)
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Submission handler with added frontend validation
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors([]); // Reset general errors

    // --- START: NEW SUBMISSION CHECKS ---
    // 1. Check for password mismatch
    if (formData.password !== formData.confirm_password) {
      // The red text under the confirm password box will already be visible
      return; 
    }
    
    
    // 2. Check password security rules before submitting
    const isPasswordValid = Object.values(passwordValidation).every(Boolean);
    if (!isPasswordValid) {
      setErrors(["Password does not meet all security requirements."]);
      return; // Stop submission
    }
    // --- END: NEW SUBMISSION CHECKS ---

    if (!licenseFile) {
        setErrors(["Please upload your license document for verification."]);
        return;
    }

    setIsLoading(true);
    try {
      // Create FormData object
      const submissionData = new FormData();
      submissionData.append("username", formData.username);
      submissionData.append("full_name", formData.full_name);
      submissionData.append("email", formData.email);
      submissionData.append("password", formData.password);
      submissionData.append("nic", formData.nic);
      submissionData.append("contact_number", formData.contact_number);
      submissionData.append("specialization", formData.specialization);
      submissionData.append("availability", formData.availability);
      submissionData.append("license_number", formData.license_number);
      submissionData.append("license_document", licenseFile); // Append the file

      const response = await axios.post(
        "http://localhost:8000/api/auth/register/doctor/",
        submissionData,
        {
            headers: { "Content-Type": "multipart/form-data" } // Important!
        }
      );
      setSuccessMsg("Your account is pending admin approval.");
      console.log(response.data);
    } catch (err: any) {
      console.error(err.response);
      const errorData = err.response?.data;
      if (errorData && typeof errorData === "object") {
        const messages = Object.values(errorData).flat() as string[];
        setErrors(messages);
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
                <Stethoscope className="w-8 h-8 text-primary" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold">Doctor Registration</CardTitle>
            <CardDescription>Create your account to join our platform</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* All other fields remain the same */}
              <div className="space-y-2">
                <Label htmlFor="full_name">Full Name</Label>
                <Input id="full_name" name="full_name" value={formData.full_name} onChange={handleChange} placeholder="Enter your full name" required/>
              </div>
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input id="username" name="username" value={formData.username} onChange={handleChange} placeholder="Choose a username" required/>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" value={formData.email} onChange={handleChange} placeholder="Enter your email" required/>
              </div>
              
              {/* --- START: NEW PASSWORD FIELD WITH ALL FEATURES --- */}
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
              </div>
              {/* --- END: NEW PASSWORD FIELD --- */}

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
              
              {/* All other fields remain the same */}
              <div className="space-y-2">
                <Label htmlFor="nic">NIC</Label>
                <Input id="nic" name="nic" value={formData.nic} onChange={handleChange} placeholder="Enter your NIC number" required/>
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact_number">Contact Number</Label>
                <Input id="contact_number" name="contact_number" type="tel" value={formData.contact_number} onChange={handleChange} placeholder="Enter your phone number" required/>
              </div>
              <div className="space-y-2">
                <Label htmlFor="specialization">Specialization</Label>
                <Input id="specialization" name="specialization" value={formData.specialization} onChange={handleChange} placeholder="e.g., Psychiatry, Cardiology" required/>
              </div>
              <div className="space-y-2">
                <Label htmlFor="availability">Availability</Label>
                <Input id="availability" name="availability" value={formData.availability} onChange={handleChange} placeholder="e.g., Mon-Fri, 9am-5pm" required/>
              </div>
              <div className="space-y-2">
                <Label htmlFor="license_number">License Number</Label>
                <Input id="license_number" name="license_number" type="text" value={formData.license_number} onChange={handleChange} placeholder="Enter License Number" required/>
              </div>

              <div className="space-y-2">
                <Label htmlFor="license_document">License Document (PDF/Image)</Label>
                <div className="flex items-center gap-2">
                    <Input 
                        id="license_document" 
                        type="file" 
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) => setLicenseFile(e.target.files?.[0] || null)}
                        className="file:text-primary file:font-medium"
                        required
                    />
                </div>
                <p className="text-xs text-muted-foreground">Upload a clear copy of your medical license.</p>
              </div>

              {errors.length > 0 && (
                <Alert variant="destructive">
                  <AlertTitle>Registration Failed!</AlertTitle>
                  <AlertDescription>
                     <ul className="list-disc pl-5 space-y-1">
                      {errors.map((errorMsg, index) => (<li key={index}>{errorMsg}</li>))}
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

              <Button type="submit" className="w-full healthcare-button-primary" disabled={isLoading || !!successMsg}>
                {isLoading ? "Registering..." : "Register Doctor"}
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

export default DoctorRegister;