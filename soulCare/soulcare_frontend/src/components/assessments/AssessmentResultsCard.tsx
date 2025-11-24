// soulcare_frontend/src/components/assessments/AssessmentResultsCard.tsx

import React, { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AssessmentResult } from "@/types";
import { cn } from "@/lib/utils";
import { History, Share2, CornerDownLeft } from "lucide-react";

interface AssessmentResultsCardProps {
  result: AssessmentResult;
  onRetake: () => void;
  onViewHistory: () => void;
}

// Define the score ranges to highlight the user's result on the simulated chart
const SCORE_RANGES = [
  {
    min: 0,
    max: 18,
    color: "bg-green-500",
    label: "Not depressed",
    rangeText: "0-18",
  },
  {
    min: 19,
    max: 36,
    color: "bg-yellow-500",
    label: "Few signs of depression",
    rangeText: "19-36",
  },
  {
    min: 37,
    max: 63,
    color: "bg-orange-500",
    label: "Possible signs of depression",
    rangeText: "37-63",
  },
  {
    min: 64,
    max: 81,
    color: "bg-red-500",
    label: "Some signs of clinical depression",
    rangeText: "64-81",
  },
  {
    min: 82,
    max: 100,
    color: "bg-purple-600",
    label: "Generally depressed",
    rangeText: "82-100",
  },
];

const AssessmentResultsCard: React.FC<AssessmentResultsCardProps> = ({
  result,
  onRetake,
  onViewHistory,
}) => {
  const userRange = useMemo(() => {
    return (
      SCORE_RANGES.find(
        (r) => result.scaled_score >= r.min && result.scaled_score <= r.max
      ) || SCORE_RANGES[2]
    ); // Default to 'Possible signs'
  }, [result.scaled_score]);

  // Calculate the position of the user's score on the 0-100 scale (in percentage)
  const scorePosition = (result.scaled_score / 100) * 100;

  const formattedDate = new Date(result.submitted_at).toLocaleDateString(
    "en-US",
    {
      year: "numeric",
      month: "long",
      day: "numeric",
    }
  );

  return (
    <Card className="max-w-5xl mx-auto shadow-2xl border-2 border-primary/20 animate-in fade-in duration-500">
      <CardHeader
        className={cn(
          "text-primary-foreground rounded-t-lg p-8",
          userRange.color
        )}
      >
        <CardTitle className="text-3xl font-extrabold flex items-center">
          {result.questionnaire_title} Score
        </CardTitle>
        <div className="text-sm mt-1 opacity-90">
          Completed on: {formattedDate}
        </div>
      </CardHeader>

      <CardContent className="p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* --- Left Column: Score Visualization --- */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-4xl font-bold text-gray-800">
            {result.scaled_score}/100 -{" "}
            <span
              className={cn(
                "font-extrabold",
                userRange.color.replace("bg-", "text-")
              )}
            >
              {userRange.label}
            </span>
          </h2>

          <p className="text-sm text-gray-500 pt-2">{result.interpretation}</p>

          {/* Simple Bar Chart Simulation */}
          <div className="pt-4 pb-2">
            <div className="relative w-full h-8 bg-gray-200 rounded-full overflow-hidden">
              {SCORE_RANGES.map((range, index) => {
                // Calculate the width for each range band (20% each, since 5 ranges)
                return (
                  <div
                    key={index}
                    className={cn(
                      "absolute h-full transition-all duration-500 ease-out",
                      range.color
                    )}
                    style={{
                      left: `${range.min}%`,
                      width: `${range.max - range.min}%`,
                    }}
                  ></div>
                );
              })}
              {/* User's Score Indicator (The 'You' bar) */}
              <div
                className="absolute h-full w-2 bg-blue-600 shadow-xl"
                style={{ left: `calc(${scorePosition}% - 4px)` }}
              >
                <span className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs font-bold text-blue-600 bg-white px-2 py-0.5 rounded-full shadow-md whitespace-nowrap">
                  You ({result.scaled_score})
                </span>
                <div className="absolute top-0 w-full h-full bg-blue-600 animate-pulse opacity-50"></div>
              </div>
            </div>
            {/* Score Labels below the bar */}
            <div className="flex justify-between text-xs text-gray-500 pt-1">
              {SCORE_RANGES.map((range) => (
                <span key={range.min} className="text-xs">
                  {range.min}
                </span>
              ))}
              <span className="text-xs">100</span>
            </div>
          </div>
        </div>

        {/* --- Right Column: Interpretation Key & Actions --- */}
        <div className="lg:col-span-1 border-l pl-6 space-y-4">
          <h3 className="text-xl font-semibold text-gray-700 mb-4">
            What do the scores mean?
          </h3>
          <div className="space-y-2">
            {SCORE_RANGES.map((range) => {
              const isUserRange = range.min === userRange.min;
              return (
                <div
                  key={range.min}
                  className={cn(
                    "flex justify-between items-center p-2 rounded-lg transition-all duration-300",
                    isUserRange
                      ? "bg-primary/20 font-bold border border-primary"
                      : "hover:bg-gray-50"
                  )}
                >
                  <span className="text-sm">{range.rangeText}</span>
                  <span
                    className={cn(
                      "text-sm",
                      isUserRange ? "text-primary" : "text-gray-600"
                    )}
                  >
                    {range.label}
                  </span>
                </div>
              );
            })}
          </div>
          <div className="flex flex-col space-y-3 pt-4 border-t mt-4">
            <Button onClick={onRetake} className="w-full" variant="secondary">
              <CornerDownLeft className="w-4 h-4 mr-2" />
              Take Another Test
            </Button>
            <Button
              onClick={onViewHistory}
              className="w-full"
              variant="outline"
            >
              <History className="w-4 h-4 mr-2" />
              View Assessment History
            </Button>
            <Button
              onClick={() => alert("Share feature not yet implemented!")}
              className="w-full"
              variant="ghost"
            >
              <Share2 className="w-4 h-4 mr-2" />
              Share Result
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AssessmentResultsCard;
