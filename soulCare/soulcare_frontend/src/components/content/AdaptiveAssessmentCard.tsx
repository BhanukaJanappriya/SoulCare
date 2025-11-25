import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BrainCircuit, Zap } from "lucide-react";

// Assuming you have an interface for user state to check if the profile is complete
// For simplicity, we use a boolean prop here, but this logic often lives in the parent dashboard.
interface AdaptiveAssessmentCardProps {
  isProfileComplete: boolean;
}

const AdaptiveAssessmentCard: React.FC<AdaptiveAssessmentCardProps> = ({
  isProfileComplete,
}) => {
  const navigate = useNavigate();

  const handleStartAssessment = () => {
    if (isProfileComplete) {
      // Navigate to the main assessment page
      navigate("/patient/adaptive-assessment");
    } else {
      // Navigate to the profile setup page if prerequisite data is missing
      // This ensures the adaptive logic has the necessary data to filter questions.
      navigate("/patient/profile-setup");
    }
  };

  return (
    <Card
      className="w-full shadow-lg transition-all duration-300 hover:shadow-xl hover:border-primary/50 cursor-pointer border-2"
      onClick={handleStartAssessment} // Make the whole card clickable
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-semibold text-primary">
          Personalized Health Check
        </CardTitle>
        <BrainCircuit className="h-6 w-6 text-primary" />
      </CardHeader>
      <CardContent>
        <CardDescription className="text-sm mb-4">
          Answer a few personalized questions to get an accurate risk assessment
          and tailored content recommendations powered by AI.
        </CardDescription>

        <div className="flex justify-between items-center">
          <div className="text-xs text-muted-foreground">
            Time commitment: ~5 minutes
          </div>
          <Button variant="default" size="sm" className="flex items-center">
            {isProfileComplete ? "Start Assessment" : "Complete Profile First"}
            <Zap className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default AdaptiveAssessmentCard;
