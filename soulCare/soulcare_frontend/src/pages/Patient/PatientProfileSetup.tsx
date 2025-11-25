import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import axios from "axios";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

// --- Import your existing UI components ---
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import PatientLayout from "@/components/layout/PatientLayout";
import { ArrowLeft, ArrowRight, Save } from "lucide-react";

// --- Interface matching the new PatientProfile fields (Flat Write structure) ---
interface ProfileData {
  gender: string;
  marital_status: string;
  employment_status: string;
  financial_stress_level: number;
  chronic_illness: boolean;
  substance_use: boolean;
  mh_diagnosis_history: boolean;
}

// Helper to get token securely from localStorage
const getAuthHeaders = () => {
  const token = localStorage.getItem("accessToken");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// --- CONSTANTS FOR SELECTS ---
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

const ProfileSetupPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  const {
    control,
    handleSubmit,
    watch,
    formState: { isSubmitting, isValid },
  } = useForm<ProfileData>({
    defaultValues: {
      financial_stress_level: 3,
      gender: "",
      marital_status: "",
      employment_status: "",
      chronic_illness: false,
      substance_use: false,
      mh_diagnosis_history: false,
    },
    mode: "onChange",
  });

  const [step, setStep] = useState(1);
  const totalSteps = 3;
  const progressValue = (step / totalSteps) * 100;

  // Watch the financial stress slider for real-time display
  const financialStress = watch("financial_stress_level");

  // --- NAVIGATION FUNCTIONS (FIX: Added these functions) ---
  const handlePrevious = () => {
    setStep((prev) => Math.max(1, prev - 1));
  };

  const isCurrentStepValid = (): boolean => {
    // For Step 1, ensure required fields have a value other than the initial empty string
    if (
      step === 1 &&
      (!watch("gender") ||
        !watch("marital_status") ||
        !watch("employment_status"))
    )
      return false;
    // Step 2 & 3 primarily use controlled components (slider, switches) which always have valid default values
    return true;
  };

  const handleNext = () => {
    if (isCurrentStepValid()) {
      setStep((prev) => Math.min(totalSteps, prev + 1));
    } else {
      toast({
        title: "Wait!",
        description: "Please complete all required fields.",
        variant: "destructive",
      });
    }
  };
  // -----------------------------------------------------

  const onSubmit = async (data: ProfileData) => {
    // Data is sent FLAT to match UserProfileUpdateSerializer
    const submitData = {
      gender: data.gender,
      marital_status: data.marital_status,
      employment_status: data.employment_status,
      financial_stress_level: data.financial_stress_level,

      // Booleans are sent directly (handled by the backend serializer)
      chronic_illness: data.chronic_illness,
      substance_use: data.substance_use,
      mh_diagnosis_history: data.mh_diagnosis_history,
    };

    try {
      await axios.patch(`/api/auth/user/`, submitData, {
        headers: getAuthHeaders(),
      });
      toast({
        title: "Success",
        description: "Profile setup complete. Redirecting to assessment.",
      });
      // Success! Profile completed. Redirect to the Adaptive Assessment page.
      navigate("/patient/adaptive-assessment");
    } catch (error) {
      console.error("Profile Update Failed:", error);
      toast({
        title: "Error",
        description: "Failed to save profile. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <PatientLayout>
      <div className="max-w-xl mx-auto py-10">
        <h1 className="text-3xl font-bold mb-6 text-center text-primary">
          👋 Complete Your Health Profile
        </h1>
        <p className="text-center text-muted-foreground mb-8">
          This information helps us personalize your mental health check.
        </p>
        <Progress value={progressValue} className="mb-8 h-2" />

        <Card>
          <CardHeader>
            <CardTitle>
              {step === 1
                ? "Life & Relationship Status 🏡"
                : step === 2
                ? "Financial & Health Context 💊"
                : "Mental Health History 🧠"}
            </CardTitle>
          </CardHeader>
          <form onSubmit={handleSubmit(onSubmit)}>
            <CardContent className="space-y-6">
              {/* --- STEP 1: Personal & Social --- */}
              {step === 1 && (
                <>
                  {/* Gender Select */}
                  <div className="space-y-2">
                    <Label htmlFor="gender">Gender Identity *</Label>
                    <Controller
                      name="gender"
                      control={control}
                      rules={{ required: "Gender is required" }}
                      render={({ field }) => (
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
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
                      )}
                    />
                  </div>
                  {/* Marital Status Select */}
                  <div className="space-y-2">
                    <Label htmlFor="marital_status">Marital Status *</Label>
                    <Controller
                      name="marital_status"
                      control={control}
                      rules={{ required: "Marital status is required" }}
                      render={({ field }) => (
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
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
                      )}
                    />
                  </div>
                  {/* Employment Status Select */}
                  <div className="space-y-2">
                    <Label htmlFor="employment_status">
                      Employment Status *
                    </Label>
                    <Controller
                      name="employment_status"
                      control={control}
                      rules={{ required: "Employment status is required" }}
                      render={({ field }) => (
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
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
                      )}
                    />
                  </div>
                </>
              )}

              {/* --- STEP 2: Financial & Health Context --- */}
              {step === 2 && (
                <>
                  {/* Financial Stress Slider */}
                  <div className="space-y-4">
                    <Label className="block mb-2 text-lg font-semibold">
                      Perceived Financial Stress Level (1-5)
                    </Label>
                    <Controller
                      name="financial_stress_level"
                      control={control}
                      render={({ field }) => (
                        <Slider
                          min={1}
                          max={5}
                          step={1}
                          value={[field.value]}
                          onValueChange={(val) => field.onChange(val[0])}
                          className="mt-2"
                        />
                      )}
                    />
                    <div className="text-sm text-center text-muted-foreground">
                      **{financialStress}** (1 = Low Concern, 5 = Severe Strain)
                    </div>
                  </div>

                  {/* Chronic Illness Switch */}
                  <div className="flex items-center justify-between border-t pt-4">
                    <Label htmlFor="chronic_illness">
                      Do you have a managed chronic physical illness?
                    </Label>
                    <Controller
                      name="chronic_illness"
                      control={control}
                      render={({ field }) => (
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      )}
                    />
                  </div>

                  {/* Substance Use Switch */}
                  <div className="flex items-center justify-between border-t pt-4">
                    <Label htmlFor="substance_use">
                      History of significant substance/alcohol use?
                    </Label>
                    <Controller
                      name="substance_use"
                      control={control}
                      render={({ field }) => (
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      )}
                    />
                  </div>
                </>
              )}

              {/* --- STEP 3: Mental Health History --- */}
              {step === 3 && (
                <div className="flex items-center justify-between border-t pt-4">
                  <Label htmlFor="mh_diagnosis_history">
                    Have you had a formal mental health diagnosis before?
                  </Label>
                  <Controller
                    name="mh_diagnosis_history"
                    control={control}
                    render={({ field }) => (
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    )}
                  />
                </div>
              )}
            </CardContent>

            <CardFooter className="flex justify-between">
              {step > 1 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handlePrevious}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" /> Previous
                </Button>
              )}
              {step < totalSteps && (
                <Button
                  type="button"
                  onClick={handleNext} // Call the defined handleNext function
                  className="ml-auto"
                  disabled={!isCurrentStepValid()}
                >
                  Next Step <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              )}
              {step === totalSteps && (
                <Button
                  type="submit"
                  disabled={isSubmitting || !isValid}
                  className="ml-auto"
                >
                  {isSubmitting
                    ? "Saving Profile..."
                    : "Complete Setup & Assess"}
                  <Save className="w-4 h-4 ml-2" />
                </Button>
              )}
            </CardFooter>
          </form>
        </Card>
      </div>
    </PatientLayout>
  );
};

export default ProfileSetupPage;
