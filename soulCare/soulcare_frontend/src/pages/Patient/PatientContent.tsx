// soulcare_frontend/src/pages/Patient/PatientContent.tsx (FINAL CLEANED & ROBUST VERSION)

import React, { useState } from "react";
// FIX: Added UseQueryResult import
import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { getSharedContentForPatient, getAssessmentHistoryAPI } from "@/api";
import { ContentItem, AssessmentResult } from "@/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
// FIX: Ensure all icons are imported
import {
  Loader2,
  Zap,
  BrainCircuit,
  History,
  CornerDownLeft,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

// New Component Imports
import AssessmentQuiz from "@/components/assessments/AssessmentQuiz";
import AssessmentResultsCard from "@/components/assessments/AssessmentResultsCard";

type PatientContentView =
  | "ContentLibrary"
  | "AssessmentQuiz"
  | "AssessmentResult"
  | "AssessmentHistory";

const PatientContent: React.FC = () => {
  const [currentView, setCurrentView] =
    useState<PatientContentView>("ContentLibrary");
  const [latestResult, setLatestResult] = useState<AssessmentResult | null>(
    null
  );

  // 1. Fetch existing Content Library items
  const { data: contentItemsData, isLoading: isLoadingContent } = useQuery<
    ContentItem[]
  >({
    queryKey: ["sharedContent"],
    queryFn: getSharedContentForPatient,
  });
  // FIX: Fallback to empty array to ensure .length and .map always exist
  const contentItems = contentItemsData || [];

  // 2. Fetch latest assessment result/history
  const {
    data: assessmentHistoryData = [],
    isLoading: isLoadingHistory,
    refetch: refetchHistory,
  } = useQuery<AssessmentResult[], Error>({
    queryKey: ["assessmentHistory"],
    queryFn: getAssessmentHistoryAPI,
    staleTime: 5 * 60 * 1000,
  });

  // FIX: Fallback to empty array to ensure .length and .map always exist
  const assessmentHistory = assessmentHistoryData || [];

  const isAssessmentActive = currentView === "AssessmentQuiz";
  const isResultsActive = currentView === "AssessmentResult" && latestResult;
  const isHistoryActive = currentView === "AssessmentHistory";
  const isLibraryActive = currentView === "ContentLibrary";

  const handleQuizComplete = (result: AssessmentResult) => {
    setLatestResult(result);
    setCurrentView("AssessmentResult");
    refetchHistory(); // Refresh the history and latest result for the main card
  };

  const handleViewLatestResult = () => {
    if (latestResult) {
      setCurrentView("AssessmentResult");
    } else {
      setCurrentView("AssessmentQuiz");
    }
  };

  const renderContentLibrary = () => (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">My Library & Tools</h1>

      {/* --- 1. Assessment Card (NEW FEATURE) --- */}
      <Card className="shadow-lg border-2 border-primary/20 transition-all duration-300 hover:shadow-xl">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-2xl font-extrabold text-primary flex items-center gap-2">
            <BrainCircuit className="w-6 h-6" /> Depression Assessment Test
          </CardTitle>
          {latestResult && (
            <Badge className="bg-green-500 hover:bg-green-600 text-white text-sm">
              Last Score: {latestResult.scaled_score}/100
            </Badge>
          )}
        </CardHeader>
        <CardContent>
          <CardDescription className="text-base mb-4">
            Take this confidential assessment to get a quick check on your
            emotional well-being. Your results can help inform your counselor.
          </CardDescription>
          <div className="flex gap-3">
            <Button
              onClick={() => setCurrentView("AssessmentQuiz")}
              className="flex items-center gap-2"
            >
              <Zap className="w-4 h-4" /> Start Assessment
            </Button>
            {latestResult && (
              <Button
                onClick={handleViewLatestResult}
                variant="outline"
                className="flex items-center gap-2"
              >
                View Latest Result
              </Button>
            )}
            <Button
              onClick={() => setCurrentView("AssessmentHistory")}
              variant="ghost"
              className="flex items-center gap-2"
            >
              <History className="w-4 h-4" /> History
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* --- 2. Shared Content Items --- */}
      <h2 className="text-2xl font-bold text-gray-700 pt-4 border-t">
        Shared Content ({contentItems.length || 0})
      </h2>

      {isLoadingContent ? (
        <div className="flex justify-center items-center h-40">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : contentItems.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {contentItems.map((item) => (
            <Card key={item.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="text-lg">{item.title}</CardTitle>
                <CardDescription>{item.type}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-500 line-clamp-2">
                  {item.description}
                </p>
                <Button size="sm" className="mt-4 w-full">
                  View Content
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <p className="text-gray-500">
          No content has been shared with you by your provider yet.
        </p>
      )}
    </div>
  );

  const renderAssessmentHistory = () => (
    <div className="space-y-6">
      <Button
        onClick={() => setCurrentView("ContentLibrary")}
        variant="outline"
        className="mb-4"
      >
        <CornerDownLeft className="w-4 h-4 mr-2" /> Back to Library
      </Button>
      <h1 className="text-3xl font-bold text-gray-800">Assessment History</h1>

      {isLoadingHistory ? (
        <div className="flex justify-center items-center h-40">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : assessmentHistory.length > 0 ? (
        <div className="space-y-4">
          {assessmentHistory.map((result, index) => (
            <Card
              key={result.id}
              className="hover:shadow-md transition-shadow cursor-pointer p-4"
              onClick={() => {
                setLatestResult(result);
                setCurrentView("AssessmentResult");
              }}
            >
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-semibold text-lg">
                    {result.questionnaire_title} - Attempt{" "}
                    {assessmentHistory.length - index}
                  </p>
                  <p className="text-sm text-gray-500">
                    Submitted:{" "}
                    {new Date(result.submitted_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <Badge
                    className={
                      result.level >= 4
                        ? "bg-red-500"
                        : result.level >= 3
                        ? "bg-orange-500"
                        : "bg-green-500"
                    }
                  >
                    Score: {result.scaled_score}/100
                  </Badge>
                  <p className="text-sm font-medium mt-1">
                    {result.level_display.split("(")[0].trim()}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <p className="text-gray-500">
          No assessment history found. Start your first test!
        </p>
      )}
    </div>
  );

  // --- Main Render Logic ---

  if (isAssessmentActive) {
    return (
      <AssessmentQuiz
        onComplete={handleQuizComplete}
        onCancel={() => setCurrentView("ContentLibrary")}
      />
    );
  }

  if (isResultsActive) {
    return (
      <AssessmentResultsCard
        result={latestResult}
        onRetake={() => setCurrentView("AssessmentQuiz")}
        onViewHistory={() => setCurrentView("AssessmentHistory")}
      />
    );
  }

  if (isHistoryActive) {
    return renderAssessmentHistory();
  }

  // Default: Content Library
  return <div className="p-4 md:p-8">{renderContentLibrary()}</div>;
};

export default PatientContent;
