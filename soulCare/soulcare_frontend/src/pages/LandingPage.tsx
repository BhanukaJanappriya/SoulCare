import React from "react";
import { useNavigate } from "react-router-dom";
import { Stethoscope, Brain, User } from "lucide-react";
import { RoleCard } from "@/components/ui/role-card";
import { UserRole } from "@/types";

// User friendly landing
const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  const handleRoleSelect = (role: UserRole) => {
    navigate("/auth/login", { state: { selectedRole: role } });
  };

  return (
    <div className="min-h-screen healthcare-gradient flex items-center justify-center p-4">
      <div className="w-full max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12 animate-fade-in">
          <h1 className="text-5xl font-bold text-foreground mb-4">
            Mental Healthcare Platform
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Connecting healthcare professionals with patients through secure,
            modern technology for better mental health outcomes.
          </p>
        </div>

        {/* Role Selection Cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <div className="animate-fade-in" style={{ animationDelay: "0.4s" }}>
            <RoleCard
              role={"patient"}
              title="User"
              description="Someone ready to begin their journey toward healing and a brighter state of mind"
              icon={User}
              onSelect={handleRoleSelect}
              features={[]}
            />
          </div>
          <div className="animate-fade-in" style={{ animationDelay: "0.2s" }}>
            <RoleCard
              role="doctor"
              title="Doctor"
              description="Medical professional specializing in mental health diagnosis and treatment"
              icon={Stethoscope}
              onSelect={handleRoleSelect}
              features={[]}
            />
          </div>

          <div className="animate-fade-in" style={{ animationDelay: "0.4s" }}>
            <RoleCard
              role="counselor"
              title="Counselor"
              description="Licensed mental health counselor providing therapy and support"
              icon={Brain}
              onSelect={handleRoleSelect}
              features={[]}
            />
          </div>
        </div>

        {/* Footer */}
        <div
          className="text-center mt-12 animate-fade-in"
          style={{ animationDelay: "0.6s" }}
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
