import React from "react";
import { useNavigate } from "react-router-dom";
// CORRECTED: Imported Heart icon instead of User
import { Stethoscope, Brain, Heart } from "lucide-react"; 
import { RoleCard } from "@/components/ui/role-card";
import { UserRole } from "@/types";

const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  // CORRECTED: This is the proper registration logic from LandingPage1
  const handleRoleSelect = (role: UserRole) => {
    const navigationState = { state: { selectedRole: role } };

    if (role === "user") {
      navigate("/auth/signup", navigationState);
    } else if (role === "counselor") {
      navigate("/counselor-register", navigationState);
    } else if (role === "doctor") {
      navigate("/doctor-register", navigationState);
    } else {
      console.error("Unknown role selected:", role);
    }
  };

  // ADDED: Feature lists from LandingPage2
  const doctorFeatures = [
    "Create and manage prescriptions",
    "Video consultations with patients",
    "Patient diagnosis and treatment",
    "Medical history tracking",
    "Appointment scheduling",
    "Share medical content",
    "Write and publish blogs",
    "Progress tracking tools",
  ];

  const counselorFeatures = [
    "Therapy session management",
    "Video consultations with patients",
    "Mental health assessments",
    "Progress tracking tools",
    "Appointment scheduling",
    "Share therapeutic content",
    "Write and publish blogs",
    "Session notes and plans",
  ];

  const patientFeatures = [
    "Personalized mood tracking",
    "Interactive mental health games",
    "Guided meditation sessions",
    "Daily habit tracking",
    "Private journal & diary",
    "Book appointments with providers",
    "Stress detection & insights",
    "Community blog participation",
  ];

  return (
    <div className="min-h-screen healthcare-gradient flex items-center justify-center p-4">
      <div className="w-full max-w-6xl">
        {/* UPDATED: Header with logo from LandingPage2 */}
        <div className="mb-12 animate-fade-in ">
          <div className="flex flex-col items-center text-center md:flex-row md:items-center md:text-center md:justify-center gap-4">
            <img
              src="/assets/SoulCare.png"
              alt="SoulCare logo"
              className="w-32 h-32 md:w-32 md:h-32 transition-transform hover:scale-105 cursor-pointer"
            />
            <div>
              <h1 className="text-5xl font-bold text-foreground text-center justify-content-center mb-4">
                Mental Healthcare Platform
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl text-center mx-auto">
                Connecting healthcare professionals with patients through
                secure, modern technology for better mental health outcomes.
              </p>
            </div>
          </div>
        </div>

        {/* UPDATED: Role Selection Cards now include the feature lists and correct icons/roles */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl justify-items-center mx-auto">
          <div className="animate-fade-in" style={{ animationDelay: "0.2s" }}>
            <RoleCard
              role="doctor"
              title="Doctor"
              description="Medical professional specializing in mental health diagnosis and treatment"
              icon={Stethoscope}
              features={doctorFeatures}
              onSelect={handleRoleSelect}
            />
          </div>

          <div className="animate-fade-in" style={{ animationDelay: "0.4s" }}>
            <RoleCard
              role="counselor"
              title="Counselor"
              description="Licensed mental health counselor providing therapy and support"
              icon={Brain}
              features={counselorFeatures}
              onSelect={handleRoleSelect}
            />
          </div>

          <div className="animate-fade-in" style={{ animationDelay: "0.6s" }}>
            {/* CORRECTED: Role is 'user', title is 'Patient', icon is Heart */}
            <RoleCard
              role="user" 
              title="Patient"
              description="Your personal journey to better mental well-being"
              icon={Heart}
              features={patientFeatures}
              onSelect={handleRoleSelect}
            />
          </div>
        </div>

        {/* Footer */}
        <div
          className="text-center mt-12 animate-fade-in"
          style={{ animationDelay: "0.8s" }}
        >
          <p className="text-muted-foreground">
            Secure • HIPAA Compliant • Professional • Trusted
          </p>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;