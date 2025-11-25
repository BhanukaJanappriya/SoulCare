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
  CardFooter,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea"; // Used for health issues
import { Switch } from "@/components/ui/switch";

// Import icons for dynamic feedback & categories
import {
  User,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  ChevronLeft,
  ChevronRight,
  Lock,
  Mail,
  CreditCard,
  Calendar,
  Phone,
  MapPin,
  Heart,
  DollarSign,
} from "lucide-react";

// --- Imports for Adaptive Fields ---
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Helper component to display validation rules dynamically
const ValidationItem: React.FC<{ isValid: boolean; text: string }> = ({
  isValid,
  text,
}) => (
  <div
    className={`flex items-center gap-2 transition-colors ${
      isValid ? "text-green-500" : "text-muted-foreground"
    }`}
  >
    {isValid ? (
      <CheckCircle2 className="w-4 h-4" />
    ) : (
      <XCircle className="w-4 h-4" />
    )}
    <span>{text}</span>
  </div>
);

// --- CONSTANTS FOR ADAPTIVE SELECTS ---
const GENDER_OPTIONS = [
  { value: "M", label: "Male" },
  { value: "F", label: "Female" },
  { value: "O", label: "Other/Non-binary" },
  { value: "P", label: "Prefer not to say" },
];
const MARITAL_OPTIONS = [
  { value: "S", label: "Single/Never Married" },
  { value: "M", label: "Married/Cohabiting" },
  { value: "D", label: "Divorced/Separated" },
  { value: "W", label: "Widowed" },
];
const EMPLOYMENT_OPTIONS = [
  { value: "E", label: "Employed" },
  { value: "U", label: "Unemployed/Seeking" },
  { value: "S", label: "Student" },
  { value: "R", label: "Retired" },
  { value: "H", label: "Homemaker" },
];

const PatientRegister: React.FC = () => {
  const navigate = useNavigate();

  // --- FORM STATE (EXPANDED) ---
  const [formData, setFormData] = useState({
    // Step 1: Core/Auth
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

    // Step 2: Adaptive/Profile
    gender: "",
    marital_status: "",
    employment_status: "",
    financial_stress_level: 3,
    chronic_illness: false,
    substance_use: false,
    mh_diagnosis_history: false,
  });

  // --- UI/STATUS STATE ---
  const [step, setStep] = useState(1);
  const [errors, setErrors] = useState<string[]>([]);
  const [successMsg, setSuccessMsg] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [passwordValidation, setPasswordValidation] = useState({
    minLength: false,
    hasNumber: false,
    hasUppercase: false,
    hasLowercase: false,
  });
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);

  // --- LIVE VALIDATION EFFECT (FIX 2: Added 'formData' dependency) ---
  useEffect(() => {
    // 1. Check if passwords match
    if (
      formData.confirm_password &&
      formData.password !== formData.confirm_password
    ) {
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
  }, [formData]); // <- FIX: Added formData to dependency array

  // Handler for form input changes (String/Text Inputs)
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handler for Boolean Inputs (Switches/Checkboxes)
  const handleSwitchChange = (
    name: keyof typeof formData,
    checked: boolean
  ) => {
    setFormData((prev) => ({ ...prev, [name]: checked }));
  };

  // Handler for Select components (using the select value change structure)
  const handleSelectChange = (name: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handler for Numeric/Slider Inputs (Financial Stress)
  const handleNumericChange = (name: keyof typeof formData, value: number) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // --- STEP VALIDATION ---
  const isStepOneValid = (): boolean => {
    const requiredFields = [
      "full_name",
      "username",
      "email",
      "password",
      "nic",
      "contact_number",
      "address",
      "dob",
    ];
    const coreFieldsValid = requiredFields.every(
      (field) => formData[field as keyof typeof formData]
    );
    const passwordsMatch =
      !confirmPasswordError && formData.password.length > 0;
    const passwordSecure = Object.values(passwordValidation).every(Boolean);

    return coreFieldsValid && passwordsMatch && passwordSecure;
  };

  const handleNext = () => {
    setErrors([]);
    if (step === 1) {
      if (!isStepOneValid()) {
        setErrors([
          "Please fill out all required fields and ensure the password meets all requirements.",
        ]);
        return;
      }
      setStep(2);
    }
  };

  // --- SUBMISSION HANDLER ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Ensure we are on the final step before submitting
    if (step !== 2) {
      handleNext();
      return;
    }

    setErrors([]);
    setIsLoading(true);

    // Final check for password mismatch (though step 1 handles most of this)
    if (formData.password !== formData.confirm_password) {
      setErrors(["Passwords do not match."]);
      setIsLoading(false);
      return;
    }

    try {
      // 1. Construct the payload with ALL fields (core + adaptive)
      const { confirm_password, ...payload } = formData;

      // 2. Post to the patient registration endpoint
      const response = await axios.post(
        "http://localhost:8000/api/auth/register/patient/",
        payload
      );

      setSuccessMsg(
        "Your account has been successfully created! You will be redirected to the login page."
      );
      console.log(response.data);
      setTimeout(() => navigate("/auth/login"), 3000);
    } catch (err: unknown) {
      // FIX 1: Replaced 'any' with 'unknown'
      setIsLoading(false);
      console.error(err);

      let messages: string[] = ["An unknown error occurred. Please try again."];

      if (axios.isAxiosError(err) && err.response?.data) {
        const errorData = err.response.data;
        // Flatten nested errors (common in DRF)
        if (typeof errorData === "object") {
          messages = Object.values(errorData).flat() as string[];
        } else if (typeof errorData === "string") {
          messages = [errorData];
        }
      }

      setErrors(messages);
    }
  };

  const progressValue = (step / 2) * 100;

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
              Step {step} of 2:{" "}
              {step === 1 ? "Core Account Setup" : "Personalized Profile"}
            </CardDescription>
          </CardHeader>

          <Progress value={progressValue} className="mb-4  h-2" />

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* --- STEP 1: CORE ACCOUNT SETUP --- */}
              {step === 1 && (
                <div className="space-y-4">
                  {/* Name, Username, Email, Password, Confirm Password (Existing Fields) */}

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

                  {/* Password Field with Validation UI */}
                  <div className="space-y-2">
                    <Label
                      htmlFor="password"
                      className="flex items-center gap-1"
                    >
                      <Lock className="w-4 h-4 text-primary" /> Password
                    </Label>
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      value={formData.password}
                      onChange={handleChange}
                      onFocus={() => setIsPasswordFocused(true)}
                      onBlur={() => setIsPasswordFocused(false)}
                      placeholder="Create a password"
                      required
                    />
                    {isPasswordFocused && (
                      <div className="p-3 mt-2 border rounded-lg bg-muted/50 text-sm">
                        <p className="font-semibold mb-2 text-foreground">
                          Password must contain:
                        </p>
                        <div className="space-y-1.5">
                          <ValidationItem
                            isValid={passwordValidation.minLength}
                            text="At least 8 characters"
                          />
                          <ValidationItem
                            isValid={passwordValidation.hasLowercase}
                            text="One lowercase letter (a-z)"
                          />
                          <ValidationItem
                            isValid={passwordValidation.hasUppercase}
                            text="One uppercase letter (A-Z)"
                          />
                          <ValidationItem
                            isValid={passwordValidation.hasNumber}
                            text="One number (0-9)"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Confirm Password */}
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
                      className={
                        confirmPasswordError
                          ? "border-destructive focus-visible:ring-destructive"
                          : ""
                      }
                    />
                    {confirmPasswordError && (
                      <p className="text-sm text-destructive pt-1">
                        {confirmPasswordError}
                      </p>
                    )}
                  </div>

                  {/* NIC, Contact, Address, DOB, Health Issues (Other existing fields) */}
                  <div className="space-y-2">
                    <Label htmlFor="nic" className="flex items-center gap-1">
                      <CreditCard className="w-4 h-4 text-primary" /> NIC
                    </Label>
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
                    <Label
                      htmlFor="contact_number"
                      className="flex items-center gap-1"
                    >
                      <Phone className="w-4 h-4 text-primary" /> Contact Number
                    </Label>
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
                    <Label
                      htmlFor="address"
                      className="flex items-center gap-1"
                    >
                      <MapPin className="w-4 h-4 text-primary" /> Address
                    </Label>
                    <Input
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      placeholder="Enter your address"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dob" className="flex items-center gap-1">
                      <Calendar className="w-4 h-4 text-primary" /> Date of
                      Birth
                    </Label>
                    <Input
                      id="dob"
                      name="dob"
                      type="date"
                      value={formData.dob}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="health_issues">
                      Health Issues (Optional)
                    </Label>
                    <Textarea
                      id="health_issues"
                      name="health_issues"
                      value={formData.health_issues}
                      onChange={handleChange}
                      placeholder="e.g., Asthma, Diabetes"
                    />
                  </div>
                </div>
              )}

              {/* --- STEP 2: ADAPTIVE PROFILE SETUP --- */}
              {step === 2 && (
                <div className="space-y-6">
                  <h3 className="text-xl font-semibold border-b pb-2 flex items-center gap-2 text-primary">
                    <Heart className="w-5 h-5" /> Life Context for
                    Personalization
                  </h3>

                  {/* 1. Gender Select */}
                  <div className="space-y-2">
                    <Label htmlFor="gender">Gender Identity</Label>
                    <Select
                      onValueChange={(v) => handleSelectChange("gender", v)}
                      value={formData.gender}
                      name="gender"
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select your gender..." />
                      </SelectTrigger>
                      <SelectContent>
                        {GENDER_OPTIONS.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* 2. Marital Status Select */}
                  <div className="space-y-2">
                    <Label htmlFor="marital_status">Marital Status</Label>
                    <Select
                      onValueChange={(v) =>
                        handleSelectChange("marital_status", v)
                      }
                      value={formData.marital_status}
                      name="marital_status"
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select status..." />
                      </SelectTrigger>
                      <SelectContent>
                        {MARITAL_OPTIONS.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* 3. Employment Status Select */}
                  <div className="space-y-2">
                    <Label htmlFor="employment_status">Employment Status</Label>
                    <Select
                      onValueChange={(v) =>
                        handleSelectChange("employment_status", v)
                      }
                      value={formData.employment_status}
                      name="employment_status"
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select status..." />
                      </SelectTrigger>
                      <SelectContent>
                        {EMPLOYMENT_OPTIONS.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* 4. Financial Stress Level */}
                  <div className="space-y-2">
                    <Label
                      htmlFor="financial_stress_level"
                      className="flex items-center gap-1"
                    >
                      <DollarSign className="w-4 h-4" /> Perceived Financial
                      Stress Level (1-5)
                    </Label>
                    <Input
                      id="financial_stress_level"
                      name="financial_stress_level"
                      type="number"
                      min="1"
                      max="5"
                      step="1"
                      value={String(formData.financial_stress_level)}
                      onChange={(e) =>
                        handleNumericChange(
                          "financial_stress_level",
                          parseInt(e.target.value) || 1
                        )
                      }
                      placeholder="3"
                    />
                    <p className="text-xs text-muted-foreground text-center">
                      Current: {formData.financial_stress_level} (1=Low,
                      5=Severe)
                    </p>
                  </div>

                  {/* 5. Chronic Illness Switch */}
                  <div className="flex items-center justify-between border-t pt-4">
                    <Label htmlFor="chronic_illness">
                      Do you have a managed chronic physical illness?
                    </Label>
                    <Switch
                      checked={formData.chronic_illness}
                      onCheckedChange={(c) =>
                        handleSwitchChange("chronic_illness", c)
                      }
                    />
                  </div>

                  {/* 6. Substance Use Switch */}
                  <div className="flex items-center justify-between border-t pt-4">
                    <Label htmlFor="substance_use">
                      History of significant substance/alcohol use?
                    </Label>
                    <Switch
                      checked={formData.substance_use}
                      onCheckedChange={(c) =>
                        handleSwitchChange("substance_use", c)
                      }
                    />
                  </div>

                  {/* 7. MH History Switch */}
                  <div className="flex items-center justify-between border-t pt-4">
                    <Label htmlFor="mh_diagnosis_history">
                      Have you had a formal mental health diagnosis before?
                    </Label>
                    <Switch
                      checked={formData.mh_diagnosis_history}
                      onCheckedChange={(c) =>
                        handleSwitchChange("mh_diagnosis_history", c)
                      }
                    />
                  </div>
                </div>
              )}

              {/* --- ERROR/SUCCESS MESSAGES --- */}
              {errors.length > 0 && (
                <Alert variant="destructive">
                  <AlertTitle>Registration Failed!</AlertTitle>
                  <AlertDescription>
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

              {/* --- BUTTONS (Dynamic based on step) --- */}
              <CardFooter className="p-0 pt-4 flex justify-between">
                {step > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setStep(1)}
                    disabled={isLoading}
                  >
                    <ChevronLeft className="w-4 h-4 mr-1" /> Previous
                  </Button>
                )}

                {step < 2 && (
                  <Button
                    type="button"
                    className="ml-auto"
                    onClick={handleNext}
                    disabled={isLoading || !isStepOneValid()}
                  >
                    Next Step <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                )}

                {step === 2 && (
                  <Button
                    type="submit"
                    className="w-full healthcare-button-primary"
                    disabled={isLoading || !!successMsg}
                  >
                    {isLoading
                      ? "Creating Account..."
                      : "Complete Registration"}
                  </Button>
                )}
              </CardFooter>
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

export default PatientRegister;
