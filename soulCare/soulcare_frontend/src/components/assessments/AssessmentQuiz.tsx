// soulcare_frontend/src/components/assessments/AssessmentQuiz.tsx

import React, { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { ArrowLeft, ArrowRight, CheckCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";
import { submitAssessmentResponseAPI } from "@/api"; // Ensure this is a named export in api.ts
import { AssessmentResult, AssessmentResponseInput } from "@/types"; // Ensure these types exist

// Hardcoded Questions based on your provided list
const QUESTIONS = [
  { id: 1, text: "I generally feel down and unhappy." },
  { id: 2, text: "I have less interest in other people than I used to." },
  {
    id: 3,
    text: "It takes a lot of effort to start working on something new.",
  },
  {
    id: 4,
    text: "I don't get as much satisfaction out of things as I used to.",
  },
  { id: 5, text: "I have headaches or back pain for no apparent reason." },
  { id: 6, text: "I easily get impatient, frustrated, or angry." },
  {
    id: 7,
    text: "I feel lonely, and that people aren't that interested in me.",
  },
  { id: 8, text: "I feel like I have nothing to look forward to." },
  { id: 9, text: "I have episodes of crying that are hard to stop." },
  { id: 10, text: "I have trouble getting to sleep or I sleep in too late." },
  {
    id: 11,
    text: "I feel like my life has been a failure or a disappointment.",
  },
  {
    id: 12,
    text: "I have trouble staying focused on what I'm supposed to be doing.",
  },
  { id: 13, text: "I blame myself for my faults and mistakes." },
  {
    id: 14,
    text: "I feel like I've slowed down; sometimes I don't have the energy to get anything done.",
  },
  { id: 15, text: "I have trouble finishing books, movies, or TV shows." },
  { id: 16, text: "I put off making decisions more often than I used to." },
  { id: 17, text: "When I feel down, friends and family can't cheer me up." },
  { id: 18, text: "I think about people being better off without me." },
  {
    id: 19,
    text: "I'm eating much less (or much more) than normal and it's affecting my weight.",
  },
  { id: 20, text: "I have less interest in sex than I used to." },
];

const ANSWER_OPTIONS = [
  { score: 0, label: "Strongly Disagree" },
  { score: 1, label: "Disagree" },
  { score: 2, label: "Neutral" },
  { score: 3, label: "Agree" },
  { score: 4, label: "Strongly Agree" },
];

interface AssessmentQuizProps {
  onComplete: (result: AssessmentResult) => void;
  onCancel: () => void;
}

const AssessmentQuiz: React.FC<AssessmentQuizProps> = ({
  onComplete,
  onCancel,
}) => {
  const [currentStep, setCurrentStep] = useState(0); // 0 to 19 (for 20 questions)
  const [responses, setResponses] = useState<Record<number, number>>({}); // { questionId: score }
  const [animationKey, setAnimationKey] = useState(0); // For transition effect
  const { toast } = useToast();

  // Fix: Explicitly type the mutation to resolve type errors
  const submitMutation = useMutation<
    AssessmentResult,
    Error,
    AssessmentResponseInput[]
  >({
    mutationFn: submitAssessmentResponseAPI,
    onSuccess: (data: AssessmentResult) => {
      onComplete(data);
      toast({
        title: "Assessment Complete!",
        description: "Your results have been calculated and saved.",
        variant: "default",
      });
    },
    onError: (error) => {
      console.error("Submission error:", error);
      toast({
        title: "Submission Failed",
        description:
          "There was an error saving your assessment. Please try again.",
        variant: "destructive",
      });
    },
  });

  const currentQuestion = QUESTIONS[currentStep];

  const handleAnswer = (score: number) => {
    setResponses((prev) => ({ ...prev, [currentQuestion.id]: score }));
    setAnimationKey((prev) => prev + 1); // Trigger animation reset

    if (currentStep < QUESTIONS.length - 1) {
      // Delay step transition for animation
      setTimeout(() => setCurrentStep((prev) => prev + 1), 200);
    }
  };

  const handleNext = () => {
    if (responses[currentQuestion.id] === undefined) {
      toast({
        title: "Incomplete",
        description: "Please select an answer to continue.",
        variant: "destructive",
      });
      return;
    }
    setAnimationKey((prev) => prev + 1);
    setTimeout(() => setCurrentStep((prev) => prev + 1), 200);
  };

  const handleBack = () => {
    setAnimationKey((prev) => prev + 1);
    setTimeout(() => setCurrentStep((prev) => prev - 1), 200);
  };

  const handleSubmit = () => {
    if (responses[currentQuestion.id] === undefined) {
      toast({
        title: "Incomplete",
        description: "Please select an answer to submit the test.",
        variant: "destructive",
      });
      return;
    }

    const finalResponses: AssessmentResponseInput[] = QUESTIONS.map((q) => ({
      question_id: q.id,
      score: responses[q.id] || 0, // Default to 0 if somehow missed
    }));

    submitMutation.mutate(finalResponses);
  };

  const isLastStep = currentStep === QUESTIONS.length - 1;
  const progress = Math.round(((currentStep + 1) / QUESTIONS.length) * 100);

  return (
    <Card className="max-w-4xl mx-auto shadow-2xl animate-in fade-in duration-500">
      <CardHeader className="bg-primary/90 text-primary-foreground rounded-t-lg p-6">
        <CardTitle className="text-2xl font-bold flex justify-between items-center">
          Depression Assessment Test
          <Button
            variant="ghost"
            size="sm"
            onClick={onCancel}
            className="text-primary-foreground hover:bg-white/20"
          >
            Exit
          </Button>
        </CardTitle>
        <div className="mt-2 text-sm">
          {currentStep + 1} of {QUESTIONS.length} Questions
        </div>
        <div className="w-full bg-primary-foreground/30 rounded-full h-2.5 mt-2">
          <div
            className="bg-primary-foreground h-2.5 rounded-full transition-all duration-500 ease-in-out"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </CardHeader>

      <CardContent className="p-8">
        {submitMutation.isPending ? (
          <div className="flex flex-col items-center justify-center h-64">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <p className="mt-4 text-lg font-semibold text-gray-700">
              Analyzing your responses...
            </p>
            <p className="text-sm text-gray-500">This may take a moment.</p>
          </div>
        ) : (
          <div key={animationKey} className="animate-in fade-in duration-300">
            <h3 className="text-xl font-semibold mb-6 text-gray-800 transition-colors duration-300">
              {currentStep + 1}. {currentQuestion.text}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {ANSWER_OPTIONS.map((option) => {
                const isSelected =
                  responses[currentQuestion.id] === option.score;
                return (
                  <button
                    key={option.score}
                    onClick={() => handleAnswer(option.score)}
                    className={cn(
                      "flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all duration-300 transform hover:scale-[1.02] hover:shadow-lg",
                      isSelected
                        ? "bg-primary text-white border-primary shadow-lg"
                        : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-primary/10"
                    )}
                  >
                    <span className="text-lg font-medium">{option.label}</span>
                    {isSelected && <CheckCircle className="w-4 h-4 mt-1" />}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <div className="flex justify-between mt-8 pt-4 border-t">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={currentStep === 0 || submitMutation.isPending}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Previous
          </Button>
          {isLastStep ? (
            <Button
              onClick={handleSubmit}
              disabled={
                submitMutation.isPending ||
                responses[currentQuestion.id] === undefined
              }
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 transition-colors"
            >
              {submitMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle className="w-4 h-4" />
              )}
              {submitMutation.isPending ? "Submitting..." : "Submit Assessment"}
            </Button>
          ) : (
            <Button
              onClick={handleNext}
              disabled={
                submitMutation.isPending ||
                responses[currentQuestion.id] === undefined
              }
              className="flex items-center gap-2"
            >
              Next Question
              <ArrowRight className="w-4 h-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default AssessmentQuiz;
