import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import PatientLayout from "@/components/layout/PatientLayout";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { getAdaptiveQuestionsAPI} from "@/api"
interface Question {
  id: string;
  text: string;
  category: string;
  scores: [number, string][];
  is_phq9_item: boolean;
}

interface AssessmentResponse {
  question_id: string;
  score: number;
}

interface QuestionCategory {
  name: string;
  questions: Question[];
}

// Safe auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem("accessToken");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const AdaptiveAssessmentPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  const [questionsByCategory, setQuestionsByCategory] = useState<
    QuestionCategory[]
  >([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [responses, setResponses] = useState<Record<string, number>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingQuestions, setLoadingQuestions] = useState(true);

  const totalSteps = questionsByCategory.length;
  const currentCategory = questionsByCategory[currentStep];

  useEffect(() => {
    const fetchQuestions = async () => {
      setLoadingQuestions(true);

      if (!user) {
        setLoadingQuestions(false);
        navigate("/auth/login");
        return;
      }

      try {
        const response = await axios.get("/api/adaptive/questions/", {
          headers: getAuthHeaders(),
        });
        

        console.log("API response:", response.data);

        // Safety: ensure questions array exists
        const rawQuestions: Question[] = Array.isArray(response.data?.questions)
          ? response.data.questions
          : [];

        if (rawQuestions.length === 0) {
          toast({
            title: "No Questions",
            description: "No assessment questions are available at this time.",
            variant: "destructive",
          });
          setLoadingQuestions(false);
          return;
        }

        // Group by category
        const grouped: QuestionCategory[] = rawQuestions.reduce(
          (acc, question) => {
            const categoryName = question.category;
            const categoryIndex = acc.findIndex((c) => c.name === categoryName);

            if (categoryIndex === -1) {
              acc.push({ name: categoryName, questions: [question] });
            } else {
              acc[categoryIndex].questions.push(question);
            }
            return acc;
          },
          [] as QuestionCategory[]
        );

        setQuestionsByCategory(grouped);

        // Initialize responses with default 0
        const initialResponses = rawQuestions.reduce(
          (acc, q) => ({ ...acc, [q.id]: 0 }),
          {}
        );
        setResponses(initialResponses);
      } catch (error) {
        console.error("Failed to fetch adaptive questions:", error);
        toast({
          title: "Error",
          description: "Could not load personalized assessment.",
          variant: "destructive",
        });
        navigate("/patient/content");
      } finally {
        setLoadingQuestions(false);
      }
    };

    if (user) {
      fetchQuestions();
    }
  }, [user, navigate, toast]);

  const handleScoreChange = useCallback((questionId: string, score: number) => {
    setResponses((prev) => ({ ...prev, [questionId]: score }));
  }, []);

  const isStepComplete = useMemo(() => {
    return currentCategory?.questions.every(
      (q) =>
        Object.prototype.hasOwnProperty.call(responses, q.id) &&
        responses[q.id] > 0
    );
  }, [currentCategory, responses]);

  const handleNext = () => {
    if (!isStepComplete) {
      toast({
        title: "Incomplete",
        description:
          "Please answer all questions in this section before continuing.",
        variant: "default",
      });
      return;
    }
    if (currentStep < totalSteps - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      handleSubmitAssessment();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleSubmitAssessment = async () => {
    setIsSubmitting(true);

    const formattedResponses: AssessmentResponse[] = Object.entries(
      responses
    ).map(([question_id, score]) => ({ question_id, score }));

    try {
      const response = await axios.post(
        "/api/adaptive/submit/",
        { responses: formattedResponses },
        { headers: getAuthHeaders() }
      );

      toast({
        title: "Assessment Complete",
        description:
          "Your risk has been classified, and content has been recommended.",
      });

      navigate("/patient/assessment-results", { state: response.data });
    } catch (error) {
      console.error("LLM Classification Submission Failed:", error);
      toast({
        title: "Submission Error",
        description: "Failed to process results. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loadingQuestions || !user) {
    return (
      <PatientLayout>
        <div className="text-center py-20">Loading Assessment...</div>
      </PatientLayout>
    );
  }

  if (!currentCategory) {
    return (
      <PatientLayout>
        <div className="text-center py-20">
          No assessment content available.
        </div>
      </PatientLayout>
    );
  }

  const progressValue = ((currentStep + 1) / totalSteps) * 100;

  return (
    <PatientLayout>
      <div className="max-w-3xl mx-auto py-8">
        <h1 className="text-3xl font-bold mb-4 text-center text-primary">
          🧠 Personalized Health Assessment
        </h1>
        <p className="text-center text-muted-foreground mb-6">
          Section {currentStep + 1} of {totalSteps}: {currentCategory.name}
        </p>

        <Progress value={progressValue} className="mb-6 h-3" />

        <Card>
          <CardHeader>
            <CardTitle>{currentCategory.name}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-8">
            {currentCategory.questions.map((q) => (
              <div key={q.id} className="border-b pb-4 last:border-b-0">
                <p className="font-semibold text-lg mb-3">{q.text}</p>
                <RadioGroup
                  onValueChange={(value) =>
                    handleScoreChange(q.id, parseInt(value))
                  }
                  value={String(responses[q.id])}
                  className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-4"
                >
                  {q.scores.map(([score, label]) => (
                    <div key={score} className="flex items-center space-x-2">
                      <RadioGroupItem
                        value={String(score)}
                        id={`${q.id}-${score}`}
                      />
                      <Label htmlFor={`${q.id}-${score}`}>{label}</Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            ))}
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button
              onClick={handlePrevious}
              disabled={currentStep === 0 || isSubmitting}
              variant="outline"
            >
              <ArrowLeft className="h-4 w-4 mr-2" /> Previous
            </Button>
            <Button
              onClick={handleNext}
              disabled={isSubmitting}
              className="ml-auto"
            >
              {currentStep < totalSteps - 1 ? (
                <>
                  Next Section <ArrowRight className="h-4 w-4 ml-2" />
                </>
              ) : (
                "Submit Assessment & View Results"
              )}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </PatientLayout>
  );
};

export default AdaptiveAssessmentPage;
