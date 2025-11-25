import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { getSharedContentForPatient, getAssessmentHistoryAPI } from "@/api";

// --- NEW IMPORTS REQUIRED FOR ADAPTIVE LOGIC ---
import { useAuth } from "@/contexts/AuthContext";
import { PatientProfile } from "@/types";
import AdaptiveAssessmentCard from "@/components/content/AdaptiveAssessmentCard";
// ----------------------------------------------

import { ContentItem, AssessmentResult } from "@/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Loader2,
  Zap,
  BrainCircuit,
  History,
  CornerDownLeft,
  Library,
  AlertTriangle,
  FileText,
  Video,
  Music,
  Image,
  Download,
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { format, parseISO } from "date-fns";

import AssessmentQuiz from "@/components/assessments/AssessmentQuiz";
import AssessmentResultsCard from "@/components/assessments/AssessmentResultsCard";

const isValueSet = (value:string|number|null) =>
  value !== null && value !== undefined && value !== "";

/* Icons */
const getTypeIcon = (type: ContentItem["type"]): JSX.Element => {
  switch (type) {
    case "video":
      return <Video className="w-5 h-5" />;
    case "audio":
      return <Music className="w-5 h-5" />;
    case "document":
      return <FileText className="w-5 h-5" />;
    case "image":
      return <Image className="w-5 h-5" />;
    default:
      return <FileText className="w-5 h-5" />;
  }
};

const getTypeColor = (type: ContentItem["type"]): string => {
  switch (type) {
    case "video":
      return "bg-blue-100 text-blue-800";
    case "audio":
      return "bg-green-100 text-green-800";
    case "document":
      return "bg-orange-100 text-orange-800";
    case "image":
      return "bg-purple-100 text-purple-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

/* UI Card */
const PatientContentCard: React.FC<{ item: ContentItem }> = ({ item }) => {
  return (
    <Card className="shadow-sm flex flex-col h-full hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${getTypeColor(item.type)}`}>
            {getTypeIcon(item.type)}
          </div>
          <div className="flex-1">
            <CardTitle className="text-lg line-clamp-1">{item.title}</CardTitle>
            <Badge className={getTypeColor(item.type)}>{item.type}</Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col justify-between">
        <p className="text-muted-foreground text-sm mb-4 line-clamp-3">
          {item.description}
        </p>
        <div>
          <p className="text-xs text-muted-foreground mb-4">
            Shared by:{" "}
            {item.owner?.full_name || item.owner?.username || "Provider"} on{" "}
            {format(parseISO(item.created_at), "PPP")}
          </p>
          <Button asChild className="w-full">
            <a
              href={item.file}
              target="_blank"
              rel="noopener noreferrer"
              download
            >
              <Download className="w-4 h-4 mr-2" />
              Download / View
            </a>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

/* MAIN COMPONENT */
type PatientContentView =
  | "ContentLibrary"
  | "AssessmentQuiz"
  | "AssessmentResult"
  | "AssessmentHistory";

const PatientContent: React.FC = () => {
  const { user } = useAuth();
  const [currentView, setCurrentView] =
    useState<PatientContentView>("ContentLibrary");
  const [latestResult, setLatestResult] = useState<AssessmentResult | null>(
    null
  );

  // Profile Complete Check
  const isAdaptiveProfileComplete = useMemo(() => {
    if (!user || !user.profile) return false;
    const profile = user.profile as PatientProfile;

    return (
      isValueSet(profile.gender) &&
      isValueSet(profile.marital_status) &&
      isValueSet(profile.employment_status) &&
      isValueSet(profile.financial_stress_level)
    );
  }, [user]);

  /* Queries */
  const {
    data: contentItemsData,
    isLoading: isLoadingContent,
    error: contentError,
    refetch: refetchSharedContentOriginal,
  } = useQuery({
    queryKey: ["sharedContent"],
    queryFn: getSharedContentForPatient,
    enabled: false,
  });

  const stableRefetchSharedContent = useCallback(() => {
    refetchSharedContentOriginal();
  }, [refetchSharedContentOriginal]);

  const contentItems = contentItemsData || [];

  const {
    data: assessmentHistoryData = [],
    isLoading: isLoadingHistory,
    refetch: refetchHistory,
  } = useQuery({
    queryKey: ["assessmentHistory"],
    queryFn: getAssessmentHistoryAPI,
    staleTime: 5 * 60 * 1000,
  });

  /* useEffect with FIXED dependency */
  useEffect(() => {
    if (currentView === "ContentLibrary") {
      stableRefetchSharedContent();
    }

    if (assessmentHistoryData.length > 0) {
      const sortedHistory = [...assessmentHistoryData].sort(
        (a, b) =>
          new Date(b.submitted_at).getTime() -
          new Date(a.submitted_at).getTime()
      );
      setLatestResult(sortedHistory[0]);
    } else {
      setLatestResult(null);
    }
  }, [assessmentHistoryData, currentView, stableRefetchSharedContent]);

  const assessmentHistory = assessmentHistoryData || [];

  /* Result helpers */
  const isAssessmentActive = currentView === "AssessmentQuiz";
  const isResultsActive = currentView === "AssessmentResult" && latestResult;
  const isHistoryActive = currentView === "AssessmentHistory";

  const handleQuizComplete = (result: AssessmentResult) => {
    setLatestResult(result);
    setCurrentView("AssessmentResult");
    refetchHistory();
  };

  const handleViewLatestResult = () => {
    if (latestResult) setCurrentView("AssessmentResult");
    else setCurrentView("AssessmentQuiz");
  };

  /* Rendering */
  const renderContentLibrary = () => (
    <div className="space-y-6">
      <Card className="shadow-sm bg-card">
        <CardHeader>
          <div className="flex items-center gap-4">
            <Library className="h-8 w-8 text-primary" />
            <div>
              <CardTitle className="text-2xl font-bold">
                My Library & Tools
              </CardTitle>
              <CardDescription>
                Access articles, videos, and tools for your well-being.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Assessment Cards */}
      <h2 className="text-xl font-bold text-gray-700">Assessment Tools</h2>

      <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
        {/* <AdaptiveAssessmentCard isProfileComplete={isAdaptiveProfileComplete} /> */}

        <Card className="shadow-lg border-2 border-muted hover:shadow-xl">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xl font-bold text-primary flex items-center gap-2">
              <BrainCircuit className="w-5 h-5" /> Basic Assessment
            </CardTitle>

            {assessmentHistory.length > 0 && (
              <Badge className="bg-green-500 text-white">
                Last: {assessmentHistory[0].scaled_score}/100
              </Badge>
            )}
          </CardHeader>

          <CardContent>
            <CardDescription className="text-sm mb-4">
              Take the standard Depression Assessment (PHQ-9).
            </CardDescription>

            <div className="flex flex-wrap gap-3">
              <Button onClick={() => setCurrentView("AssessmentQuiz")}>
                <Zap className="w-4 h-4" /> Start
              </Button>

              {assessmentHistory.length > 0 && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setLatestResult(assessmentHistory[0]);
                    handleViewLatestResult();
                  }}
                >
                  View Latest
                </Button>
              )}

              <Button
                variant="ghost"
                onClick={() => setCurrentView("AssessmentHistory")}
              >
                <History className="w-4 h-4" /> History
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Shared Content */}
      <h2 className="text-2xl font-bold text-gray-700 pt-4 border-t">
        Shared Content ({contentItems.length})
      </h2>

      {isLoadingContent ? (
        <div className="flex justify-center items-center h-40">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : contentError ? (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>Could not load shared content.</AlertDescription>
        </Alert>
      ) : contentItems.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {contentItems.map((item) => (
            <PatientContentCard key={item.id} item={item} />
          ))}
        </div>
      ) : (
        <Card className="mt-6 border border-dashed">
          <CardContent className="text-center py-12">
            <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold">No Content Shared</h3>
            <p className="text-sm text-muted-foreground">
              Your provider has not shared any content yet.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );

  const renderAssessmentHistory = () => (
    <div className="space-y-6">
      <Button
        onClick={() => setCurrentView("ContentLibrary")}
        variant="outline"
      >
        <CornerDownLeft className="w-4 h-4 mr-2" /> Back
      </Button>

      <h1 className="text-3xl font-bold">Assessment History</h1>

      {isLoadingHistory ? (
        <div className="flex justify-center items-center h-40">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : assessmentHistory.length > 0 ? (
        <div className="space-y-4">
          {[...assessmentHistory]
            .sort(
              (a, b) =>
                new Date(b.submitted_at).getTime() -
                new Date(a.submitted_at).getTime()
            )
            .map((result, index) => (
              <Card
                key={result.id}
                className="p-4 hover:shadow-md cursor-pointer"
                onClick={() => {
                  setLatestResult(result);
                  setCurrentView("AssessmentResult");
                }}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-semibold text-lg">
                      {result.questionnaire_title} – Attempt {index + 1}
                    </p>
                    <p className="text-sm text-gray-500">
                      {new Date(result.submitted_at).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge
                    className={
                      result.level >= 4
                        ? "bg-red-500"
                        : result.level >= 3
                        ? "bg-orange-500"
                        : "bg-green-500"
                    }
                  >
                    {result.scaled_score}/100
                  </Badge>
                </div>
              </Card>
            ))}
        </div>
      ) : (
        <p>No assessment history found.</p>
      )}
    </div>
  );

  if (isAssessmentActive)
    return (
      <AssessmentQuiz
        onComplete={handleQuizComplete}
        onCancel={() => setCurrentView("ContentLibrary")}
      />
    );

  if (isResultsActive)
    return (
      <AssessmentResultsCard
        result={latestResult!}
        onRetake={() => setCurrentView("AssessmentQuiz")}
        onViewHistory={() => setCurrentView("AssessmentHistory")}
      />
    );

  if (isHistoryActive)
    return <div className="p-4 md:p-8">{renderAssessmentHistory()}</div>;

  return <div className="p-4 md:p-8">{renderContentLibrary()}</div>;
};

export default PatientContent;
