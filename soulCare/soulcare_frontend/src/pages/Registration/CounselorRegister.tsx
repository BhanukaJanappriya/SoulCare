import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";

// Imports from the first page's styling system
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
import { Brain, ArrowLeft } from "lucide-react"; // Using Brain icon for Counselor

// This component now uses the styling of the first page
// but retains the logic of the second page.
const CounselorRegister: React.FC = () => {
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

  const [errors, setErrors] = useState<string[]>([]);
  const [successMsg, setSuccessMsg] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // Live password-match check (from original logic)
  useEffect(() => {
    if (
      formData.confirm_password &&
      formData.password !== formData.confirm_password
    ) {
      setConfirmPasswordError("Passwords do not match");
    } else {
      setConfirmPasswordError(""); // Clear the error if they match
    }
  }, [formData.password, formData.confirm_password]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors([]); // Reset error on new submission

    if (formData.password !== formData.confirm_password) {
      setConfirmPasswordError("Passwords do not match");
      return; // Stop the submission
    }

    setConfirmPasswordError("");

    // CHANGED: This validation now correctly uses the general `setError`.
    if (formData.password.length < 6) {
      setErrors(["Password must be at least 6 characters"]);
      return;
    }

    setIsLoading(true);

    try {
      // Strip confirm_password from the payload (from original logic)
      const { confirm_password, ...payload } = formData;
      const response = await axios.post(
        "http://localhost:8000/api/auth/register/counselor/",
        payload
      );
      setSuccessMsg("Your account is pending admin approval.");
      console.log(response.data); // Keep original console log
      // On success, navigate to the login page
      //navigate("/login");
    } catch (err: any) {
      setSuccessMsg("");
      console.error(err.response); // Keep original console error log
      const errors = err.response?.data;
      // Detailed error handling from the backend
      if (errors && typeof errors === "object") {
        // This gets all error messages from the backend object,
        // flattens them into a single list, and removes the field names.
        const messages = Object.values(errors).flat() as string[];
        setErrors(messages);
      } else {
        // For any other kind of error, set a generic message
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
            <CardTitle className="text-2xl font-bold">
              Counselor Registration
            </CardTitle>
            <CardDescription>
              Create your account to join our platform
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Using a more declarative way to render fields */}
              <div className="space-y-2">
                <Label htmlFor="full_name">Full Name</Label>
                <Input
                  id="full_name"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="Choose a username"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Create a password"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm_password">Confirm Password</Label>
                <Input
                  id="confirm_password"
                  name="confirm_password"
                  type="password"
                  value={formData.confirm_password}
                  onChange={handleChange}
                  placeholder="Confirm your password"
                  required
                />

                {confirmPasswordError && (
                  <p className="text-sm text-destructive pt-1">
                    {confirmPasswordError}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="expertise">Expertise</Label>
                <Input
                  id="expertise"
                  name="expertise"
                  value={formData.expertise}
                  onChange={handleChange}
                  placeholder="e.g., CBT, Family Therapy"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nic">NIC</Label>
                <Input
                  id="nic"
                  name="nic"
                  value={formData.nic}
                  onChange={handleChange}
                  placeholder="Enter your NIC number"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact_number">Contact Number</Label>
                <Input
                  id="contact_number"
                  name="contact_number"
                  type="tel"
                  value={formData.contact_number}
                  onChange={handleChange}
                  placeholder="Enter your phone number"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="license_number">License Number</Label>
                <Input
                  id="license_number"
                  name="license_number"
                  type="tel"
                  value={formData.license_number}
                  onChange={handleChange}
                  placeholder="Enter Your license number"
                  required
                />
              </div>

              {errors.length > 0 && (
                <Alert
                  variant="destructive"
                  className="bg-destructive/10 border-destructive/20"
                >
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

              <Button
                type="submit"
                className="w-full healthcare-button-primary"
                disabled={isLoading}
              >
                {isLoading ? "Registering..." : "Register Counselor"}
              </Button>
            </form>
            <div className="text-center mt-4 space-y-2">
              <p className="text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link to="/auth/login" className="text-primary hover:underline">
                  Sign in
                </Link>
              </p>
              <Link
                to="/"
                className="inline-flex items-center text-sm text-muted-foreground hover:text-primary"
              >
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
