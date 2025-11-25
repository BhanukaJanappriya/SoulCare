import React, { useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import PatientLayout from "@/components/layout/PatientLayout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  ExternalLink,
  BookOpen,
  Clock,
  Zap,
} from "lucide-react";
// NOTE: Assuming your ContentItem type is available via a global import or defined locally
// import { ContentItem } from '@/types';

// --- FIX 1: DEFINE MISSING CONSTANT ---
const PHQ9_MAX_RAW_SCORE = 27;

// --- Type Definitions for API Data ---
// These interfaces reflect the data received from the /api/assessments/adaptive/submit/ endpoint
interface RecommendationData {
  title: string;
  type: string; // "video" | "audio" | "document" | "image"
  url: string; // The file field URL
}

interface AssessmentResultData {
  risk_level: "low" | "medium" | "high";
  total_score: number;
  justification: string;
}

interface PageState {
  assessment_result: AssessmentResultData;
  content_recommendations: RecommendationData[];
  recommended_tags: string[];
}

// --- Content Card Component ---
const ContentRecommendationCard: React.FC<RecommendationData> = ({
  title,
  type,
  url,
}) => {
  const getIcon = (itemType: string) => {
    const lowerType = itemType.toLowerCase();
    if (lowerType === "video")
      return <Zap className="h-4 w-4 text-purple-600" />;
    if (lowerType === "audio")
      return <Clock className="h-4 w-4 text-orange-600" />;
    return <BookOpen className="h-4 w-4 text-blue-600" />;
  };

  return (
    <Card className="hover:shadow-lg transition-shadow border-2 border-l-4 border-l-primary/50">
      <CardContent className="p-4 flex justify-between items-center">
        <div>
          <p className="font-semibold text-base flex items-center space-x-2">
            {getIcon(type)}
            <span>{title}</span>
          </p>
          <Badge variant="secondary" className="mt-1 ml-6">
            {type}
          </Badge>
        </div>
        {url && (
          <Button variant="ghost" size="icon" asChild>
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`View ${title}`}
            >
              <ExternalLink className="h-5 w-5" />
            </a>
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

const AssessmentResultsPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as PageState;

  // --- FIX 2: HOOKS DEFINED FIRST (Ensures stability) ---
  // Safely default risk_level before the conditional return
  const risk_level = state?.assessment_result?.risk_level || "low";

  const riskColorClass = useMemo(() => {
    if (risk_level === "high") return "border-red-500 bg-red-50/50";
    if (risk_level === "medium") return "border-yellow-500 bg-yellow-50/50";
    return "border-green-500 bg-green-50/50";
  }, [risk_level]);

  // --- Early Return Logic (Must be after hook definitions) ---
  if (!state || !state.assessment_result) {
    navigate("/patient/adaptive-assessment");
    return null;
  }

  const { assessment_result, content_recommendations, recommended_tags } =
    state;
  const { justification, total_score } = assessment_result;

  return (
    <PatientLayout>
      <div className="max-w-4xl mx-auto py-10 space-y-8">
        <h1 className="text-4xl font-extrabold text-center text-primary">
          Your Assessment Results
        </h1>

        {/* --- 1. Risk Level Card & Analysis --- */}
        <Card className={`border-l-8 ${riskColorClass} shadow-xl`}>
          {" "}
          <CardHeader>
            <CardTitle className="flex items-center space-x-3 text-2xl">
              {risk_level === "high" ? (
                <AlertTriangle className="h-6 w-6 text-red-600" />
              ) : (
                <TrendingUp className="h-6 w-6 text-green-600" />
              )}
              <span>
                Risk Classification:{" "}
                <span
                  className={`uppercase font-extrabold ${
                    risk_level === "high" ? "text-red-700" : "text-primary"
                  }`}
                >
                  {risk_level}
                </span>
              </span>
            </CardTitle>
            {/* FIX 3: Uses the correctly defined constant */}
            <CardDescription className="text-md">
              Standard PHQ-9 Raw Score: **{total_score}** / {PHQ9_MAX_RAW_SCORE}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="p-4 border rounded-lg bg-white shadow-inner">
              <p className="font-semibold mb-2">AI Contextual Analysis:</p>
              <p className="text-gray-700 italic">"{justification}"</p>
            </div>
            {recommended_tags && recommended_tags.length > 0 && (
              <div className="mt-4">
                <span className="font-medium text-sm">
                  Tags Used for Filtering:
                </span>
                <div className="flex flex-wrap gap-2 mt-1">
                  {recommended_tags.map((tag) => (
                    <Badge
                      key={tag}
                      variant="outline"
                      className="text-xs bg-gray-100"
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* --- CRISIS ALERT (HIGH RISK ONLY) --- */}
        {risk_level === "high" && (
          <Alert variant="destructive">
            <AlertTriangle className="h-5 w-5" />
            <AlertTitle>⚠️ URGENT: HIGH RISK DETECTED</AlertTitle>
            <AlertDescription className="font-semibold">
              Based on your contextual data and scores, please contact
              professional help immediately.
              <ul className="list-disc list-inside mt-2">
                <li>**National Crisis Hotline:** XXX-XXX-XXXX</li>
                <li>**Emergency Services:** 999 / 119</li>
              </ul>
            </AlertDescription>
          </Alert>
        )}

        {/* --- 2. Personalized Content Recommendations --- */}
        <h2 className="text-3xl font-bold pt-4 border-t">
          Personalized Content Library 📚
        </h2>
        <p className="text-muted-foreground">
          These top resources were curated by our AI classifier based on your
          specific profile and risk level.
        </p>

        <div className="grid md:grid-cols-2 gap-4">
          {content_recommendations.length > 0 ? (
            content_recommendations.map((item, index) => (
              <ContentRecommendationCard key={index} {...item} />
            ))
          ) : (
            <div className="col-span-2 text-center py-10 border rounded-lg bg-gray-50">
              <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-3" />
              <p className="font-medium">
                All clear! Focus on preventative well-being.
              </p>
              <Button
                onClick={() => navigate("/patient/blogs")}
                className="mt-4"
              >
                Explore Full Library
              </Button>
            </div>
          )}
        </div>

        <div className="text-center pt-8">
          <Button
            onClick={() => navigate("/patient/dashboard")}
            size="lg"
            variant="default"
          >
            Return to Dashboard
          </Button>
        </div>
      </div>
    </PatientLayout>
  );
};

export default AssessmentResultsPage;
