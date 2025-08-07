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
import { User, ArrowLeft } from "lucide-react"; // Using User icon for Patient

const PatientRegister: React.FC = () => {
  // State management based on the modern component structure
  const [formData, setFormData] = useState({
    full_name: "",
    username: "",
    email: "",
    password: "",
    confirm_password: "",
    nic: "",
    contact_number: "",
    address: "",
    dob: "",
    health_issues: "",
  });

  const [errors, setErrors] = useState<string[]>([]);
  const [successMsg, setSuccessMsg] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // Live password-match check
  useEffect(() => {
    if (
      formData.confirm_password &&
      formData.password !== formData.confirm_password
    ) {
      setConfirmPasswordError("Passwords do not match");
    } else {
      setConfirmPasswordError("");
    }
  }, [formData.password, formData.confirm_password]);

  // Typed event handler
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Modernized submission logic
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors([]);
    setSuccessMsg("");

    if (formData.password !== formData.confirm_password) {
      setConfirmPasswordError("Passwords do not match");
      return;
    }
    setConfirmPasswordError("");

    if (formData.password.length < 6) {
      setErrors(["Password must be at least 6 characters"]);
      return;
    }

    setIsLoading(true);

    try {
      const { confirm_password, ...payload } = formData;
      const response = await axios.post(
        "http://localhost:8000/api/auth/register/patient/",
        payload
      );
      setSuccessMsg("Your account has been successfully created!");
      console.log(response.data);
      // You can redirect after a delay
      setTimeout(() => navigate("/auth/login"), 3000);

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
                <User className="w-8 h-8 text-primary" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold">
              Patient Registration
            </CardTitle>
            <CardDescription>
              Create your account to get started
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Form fields specific to the Patient */}
              <div className="space-y-2">
                <Label htmlFor="full_name">Full Name</Label>
                <Input id="full_name" name="full_name" value={formData.full_name} onChange={handleChange} placeholder="Enter your full name" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input id="username" name="username" value={formData.username} onChange={handleChange} placeholder="Choose a username" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" value={formData.email} onChange={handleChange} placeholder="Enter your email" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" name="password" type="password" value={formData.password} onChange={handleChange} placeholder="Create a password" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm_password">Confirm Password</Label>
                <Input id="confirm_password" name="confirm_password" type="password" value={formData.confirm_password} onChange={handleChange} placeholder="Confirm your password" required />
                {confirmPasswordError && (<p className="text-sm text-destructive pt-1">{confirmPasswordError}</p>)}
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
                <Label htmlFor="address">Address</Label>
                <Input id="address" name="address" value={formData.address} onChange={handleChange} placeholder="Enter your address" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dob">Date of Birth</Label>
                <Input id="dob" name="dob" type="date" value={formData.dob} onChange={handleChange} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="health_issues">Health Issues (Optional)</Label>
                <Input id="health_issues" name="health_issues" value={formData.health_issues} onChange={handleChange} placeholder="e.g., Asthma, Diabetes" />
              </div>

              {/* Error and Success Alerts */}
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
                {isLoading ? "Creating Account..." : "Register"}
              </Button>
            </form>
            <div className="text-center mt-4 space-y-2">
              <p className="text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link to="/auth/login" className="text-primary hover:underline">
                  Sign in
                </Link>
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

export default PatientRegister;