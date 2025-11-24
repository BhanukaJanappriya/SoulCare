import React, { useState } from "react";
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
import { format, parseISO } from "date-fns"; // Added for content card formatting

// New Component Imports (Assumed to be defined elsewhere in your project)
import AssessmentQuiz from "@/components/assessments/AssessmentQuiz";
import AssessmentResultsCard from "@/components/assessments/AssessmentResultsCard";

// --- GLOBAL HELPERS (Extracted from second file) ---

const getTypeIcon = (type: ContentItem["type"]) => {
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

const getTypeColor = (type: ContentItem["type"]) => {
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

// --- REUSABLE PRESENTATION COMPONENT (Extracted from second file) ---

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

// --- MAIN PAGE LOGIC ---

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
  const {
    data: contentItemsData,
    isLoading: isLoadingContent,
    error: contentError,
  } = useQuery<ContentItem[]>({
    queryKey: ["sharedContent"],
    queryFn: getSharedContentForPatient,
  });
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

  const assessmentHistory = assessmentHistoryData || [];

  // Derive state for simple rendering
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
      // If no latest result, encourage starting a quiz
      setCurrentView("AssessmentQuiz");
    }
  };

  // --- RENDER FUNCTION 1: Content Library View ---

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
              <CardDescription className="mt-1">
                Access articles, videos, and tools for your mental well-being.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* --- 1. Assessment Card --- */}
      <Card className="shadow-lg border-2 border-primary/20 transition-all duration-300 hover:shadow-xl">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-2xl font-extrabold text-primary flex items-center gap-2">
            <BrainCircuit className="w-6 h-6" /> Depression Assessment Test
          </CardTitle>
          {assessmentHistory.length > 0 && (
            <Badge className="bg-green-500 hover:bg-green-600 text-white text-sm">
              Last Score: {assessmentHistory[0].scaled_score}/100
            </Badge>
          )}
        </CardHeader>
        <CardContent>
          <CardDescription className="text-base mb-4">
            Take this confidential assessment to get a quick check on your
            emotional well-being. Your results can help inform your counselor.
          </CardDescription>
          <div className="flex flex-wrap gap-3">
            <Button
              onClick={() => setCurrentView("AssessmentQuiz")}
              className="flex items-center gap-2"
            >
              <Zap className="w-4 h-4" /> Start Assessment
            </Button>
            {assessmentHistory.length > 0 && (
              <Button
                onClick={() => {
                  setLatestResult(assessmentHistory[0]);
                  handleViewLatestResult();
                }}
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
      ) : contentError ? (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {(contentError as Error).message ||
              "Could not load shared content."}
          </AlertDescription>
        </Alert>
      ) : contentItems.length > 0 ? (
        // ✅ FIX: Use PatientContentCard here for styled rendering
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {contentItems.map((item) => (
            <PatientContentCard key={item.id} item={item} />
          ))}
        </div>
      ) : (
        <Card className="mt-6 bg-card border border-dashed">
          <CardContent className="text-center py-12">
            <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-1">
              No Content Shared
            </h3>
            <p className="text-muted-foreground text-sm">
              No content has been shared with you by your provider yet.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );

  // --- RENDER FUNCTION 2: Assessment History View ---

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
          {/* Sort history so newest is first in the list, but index logic remains */}
          {[...assessmentHistory]
            .sort(
              (a, b) =>
                new Date(b.submitted_at).getTime() -
                new Date(a.submitted_at).getTime()
            )
            .map((result, index) => (
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
                      {/* Use index + 1 for attempt number */}
                      {index + 1}
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
        // Ensure latestResult is not null before passing (guarded by isResultsActive)
        result={latestResult!}
        onRetake={() => setCurrentView("AssessmentQuiz")}
        onViewHistory={() => setCurrentView("AssessmentHistory")}
      />
    );
  }

  if (isHistoryActive) {
    return <div className="p-4 md:p-8">{renderAssessmentHistory()}</div>;
  }

  // Default: Content Library
  return <div className="p-4 md:p-8">{renderContentLibrary()}</div>;
};

export default PatientContent;
