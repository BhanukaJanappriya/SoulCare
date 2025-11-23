import React, { useState, useCallback, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { saveStroopGameResult } from "../../api";
import { StroopGamePayload } from "../../types";
import { Zap, Eye, Target } from "lucide-react";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  SelectGroup,
} from "../ui/select";
// --- Constants ---
type ColorName = "RED" | "BLUE" | "GREEN" | "YELLOW";
type ColorCode =
  | "text-red-600"
  | "text-blue-600"
  | "text-green-600"
  | "text-yellow-600";
type TrialType = "congruent" | "incongruent";

const COLOR_MAP: Record<ColorName, ColorCode> = {
  RED: "text-red-600",
  BLUE: "text-blue-600",
  GREEN: "text-green-600",
  YELLOW: "text-yellow-600",
};
const COLOR_NAMES: ColorName[] = ["RED", "BLUE", "GREEN", "YELLOW"];
const TOTAL_TRIALS = 20; // Example: 10 congruent, 10 incongruent

// --- Trial Data Structure ---
interface Trial {
  word: ColorName;
  inkColorCode: ColorCode;
  type: TrialType;
  startTime: number;
  reactionTime: number | null;
  isCorrect: boolean | null;
}

// --- State Definitions ---
type GameState = "initial" | "running" | "finished";
type MatrixData = Omit<
  StroopGamePayload,
  "total_correct" | "interference_score_ms" | "total_time_s"
>;

interface StroopGameProps {
  onGameEnd: () => void;
}

const StroopGame: React.FC<StroopGameProps> = ({ onGameEnd }) => {
  const [gameState, setGameState] = useState<GameState>("initial");
  const [currentTrial, setCurrentTrial] = useState(0);
  const [trials, setTrials] = useState<Trial[]>([]);
  const [metrics, setMetrics] = useState({
    correct: 0,
    totalTime: 0,
    interference: 0,
  });
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [matrixData, setMatrixData] = useState<MatrixData>({
    post_game_mood: 3,
    perceived_effort: 5,
    stress_reduction_rating: 5,
  });

  const gameStartTimeRef = useRef(0);

  // --- Game Logic ---
  const generateTrials = useCallback(() => {
    const newTrials: Trial[] = [];
    const trialTypes: TrialType[] = [];
    // Create an equal mix of congruent and incongruent trials
    for (let i = 0; i < TOTAL_TRIALS / 2; i++) {
      trialTypes.push("congruent", "incongruent");
    }
    // Shuffle the trial types
    trialTypes.sort(() => Math.random() - 0.5);

    for (const type of trialTypes) {
      let word: ColorName;
      let inkColor: ColorName;

      if (type === "congruent") {
        inkColor = COLOR_NAMES[Math.floor(Math.random() * COLOR_NAMES.length)];
        word = inkColor; // Word matches ink color
      } else {
        // Incongruent: Word does NOT match ink color
        const inkIndex = Math.floor(Math.random() * COLOR_NAMES.length);
        inkColor = COLOR_NAMES[inkIndex];

        let wordIndex;
        do {
          wordIndex = Math.floor(Math.random() * COLOR_NAMES.length);
        } while (wordIndex === inkIndex);
        word = COLOR_NAMES[wordIndex];
      }

      newTrials.push({
        word,
        inkColorCode: COLOR_MAP[inkColor],
        type,
        startTime: 0,
        reactionTime: null,
        isCorrect: null,
      });
    }
    return newTrials;
  }, []);

  const startGame = useCallback(() => {
    const initialTrials = generateTrials();
    setTrials(initialTrials);
    setCurrentTrial(0);
    setMetrics({ correct: 0, totalTime: 0, interference: 0 });
    setError(null);
    gameStartTimeRef.current = performance.now();
    setGameState("running");
  }, [generateTrials]);

  const finishGame = useCallback(() => {
    const totalEndTime = performance.now();
    const totalTimeSeconds = (totalEndTime - gameStartTimeRef.current) / 1000;

    const completedTrials = trials.filter((t) => t.reactionTime !== null);

    const totalCorrect = completedTrials.filter((t) => t.isCorrect).length;

    // Calculate Reaction Times by trial type
    const congruentTimes = completedTrials
      .filter((t) => t.type === "congruent" && t.isCorrect)
      .map((t) => t.reactionTime || 0);
    const incongruentTimes = completedTrials
      .filter((t) => t.type === "incongruent" && t.isCorrect)
      .map((t) => t.reactionTime || 0);

    // Calculate average times
    const avgCongruent =
      congruentTimes.length > 0
        ? congruentTimes.reduce((a, b) => a + b) / congruentTimes.length
        : 0;
    const avgIncongruent =
      incongruentTimes.length > 0
        ? incongruentTimes.reduce((a, b) => a + b) / incongruentTimes.length
        : 0;

    // Stroop Interference Score: Difference between avg incongruent and avg congruent RTs
    const interferenceScore = Math.round(avgIncongruent - avgCongruent);

    setMetrics({
      correct: totalCorrect,
      totalTime: parseFloat(totalTimeSeconds.toFixed(2)),
      interference: interferenceScore,
    });
    setGameState("finished");
  }, [trials, setMetrics]);
  useEffect(() => {
    if (
      gameState === "running" &&
      trials.length > 0 &&
      currentTrial < TOTAL_TRIALS
    ) {
      // Mark the start time for the current trial
      setTrials((prev) => {
        const newTrials = [...prev];
        newTrials[currentTrial].startTime = performance.now();
        return newTrials;
      });
    } else if (gameState === "running" && currentTrial >= TOTAL_TRIALS) {
      // End the game
      finishGame();
    }
  }, [gameState, currentTrial, trials.length, finishGame]);

  // <--- IMPORTANT: Add 'trials' and 'setMetrics' to the dependencies

  const handleColorClick = (clickedColor: ColorName) => {
    if (gameState !== "running" || currentTrial >= TOTAL_TRIALS) return;

    const trial = trials[currentTrial];
    const reactionTime = performance.now() - trial.startTime;

    // Correct color is the name corresponding to the inkColorCode
    const correctInkColorName = Object.keys(COLOR_MAP).find(
      (key) => COLOR_MAP[key as ColorName] === trial.inkColorCode
    );

    const isCorrect = clickedColor === correctInkColorName;

    // Update the current trial data
    setTrials((prev) => {
      const newTrials = [...prev];
      newTrials[currentTrial] = {
        ...trial,
        reactionTime: Math.round(reactionTime),
        isCorrect: isCorrect,
      };
      return newTrials;
    });

    // Move to the next trial
    setCurrentTrial((prev) => prev + 1);
  };

  // --- Matrix Submission Logic ---
  const handleMatrixChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    const parsedValue = parseInt(value, 10);
    if (isNaN(parsedValue)) return;
    setMatrixData((prev) => ({ ...prev, [name]: parsedValue }));
  };

  const saveResult = async () => {
    setIsSaving(true);
    setError(null);

    const payload: StroopGamePayload = {
      total_correct: metrics.correct,
      interference_score_ms: metrics.interference,
      total_time_s: metrics.totalTime,
      ...matrixData,
    };

    try {
      await saveStroopGameResult(payload);
      alert("Stroop Game result and matrix saved successfully!");
      setGameState("initial");
      setMetrics({ correct: 0, totalTime: 0, interference: 0 });
      setMatrixData({
        post_game_mood: 3,
        perceived_effort: 5,
        stress_reduction_rating: 5,
      });
      onGameEnd();
    } catch (err) {
      setError("Failed to save result. Check console for details.");
    } finally {
      setIsSaving(false);
    }
  };

  // --- UI/Rendering ---
  const currentDisplay = trials[currentTrial];
  const inkColorCode = currentDisplay?.inkColorCode || "text-gray-400";
  const word = currentDisplay?.word || "START";

  const getButtonColorClass = (color: ColorName) => {
    switch (color) {
      case "RED":
        return "bg-red-500 hover:bg-red-600";
      case "BLUE":
        return "bg-blue-500 hover:bg-blue-600";
      case "GREEN":
        return "bg-green-500 hover:bg-green-600";
      case "YELLOW":
        return "bg-yellow-500 hover:bg-yellow-600";
    }
  };

  if (gameState === "finished") {
    return (
      <Card className="w-full max-w-lg mx-auto mt-10 shadow-xl">
        <CardHeader className="text-center">
          <Eye className="w-16 h-16 text-primary mx-auto" />
          <CardTitle className="text-3xl">Stroop Test Complete!</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 text-center">
            <p className="text-2xl font-bold text-green-600">
              Correct Answers: {metrics.correct} / {TOTAL_TRIALS}
            </p>
            <p className="text-xl">Total Time: {metrics.totalTime} seconds</p>
            <p className="text-xl font-semibold text-blue-700">
              Interference Score (ms): {metrics.interference}
            </p>
            <p className="text-sm text-gray-500">
              (Lower is better, a measure of cognitive flexibility)
            </p>
          </div>

          {/* Matrix Form */}
          <div className="mt-8 pt-4 border-t border-gray-200">
            <h3 className="text-xl font-semibold mb-4 text-center">
              Mood Matrix Data
            </h3>
            {/* Mood Collection (1-5 Select) - STYLIZED WITH CUSTOM COMPONENT */}
            <div className="space-y-4">
              {/* Mood Collection: 1-5 Select */}
              {/* ... (Mood, Effort, Stress Reduction fields remain the same) ... */}
              <div>
                <label
                  htmlFor="post_game_mood"
                  className="block text-sm font-medium text-gray-700"
                >
                  1. How stressed do you feel right now? (1=Very Stressed,
                  5=Very Calm)
                </label>

                {/* Use the Custom Select Component */}
                <Select
                  // The value must be a string for the Select component
                  value={String(matrixData.post_game_mood || 3)}
                  onValueChange={(val) =>
                    handleMatrixChange({
                      target: {
                        name: "post_game_mood",
                        value: val,
                      },
                    } as React.ChangeEvent<HTMLSelectElement>)
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select your mood" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="1">1 - Very Stressed</SelectItem>
                      <SelectItem value="2">2 - Stressed</SelectItem>
                      <SelectItem value="3">3 - Neutral</SelectItem>
                      <SelectItem value="4">4 - Calm</SelectItem>
                      <SelectItem value="5">5 - Very Calm</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
              {/* Perceived Effort: 1-10 Input */}
              <div>
                <label
                  htmlFor="perceived_effort_m"
                  className="block text-sm font-medium text-gray-700"
                >
                  2. How much effort did you feel you exerted? (1=None, 10=Max)
                </label>
                <Input
                  id="perceived_effort_m"
                  name="perceived_effort"
                  type="number"
                  min="1"
                  max="10"
                  value={matrixData.perceived_effort}
                  onChange={handleMatrixChange}
                  className="mt-1"
                />
              </div>
              {/* Stress Reduction Rating: 1-10 Input */}
              <div>
                <label
                  htmlFor="stress_reduction_rating_m"
                  className="block text-sm font-medium text-gray-700"
                >
                  3. Do you feel calmer after the game? (1=No, 10=Definitely
                  Yes)
                </label>
                <Input
                  id="stress_reduction_rating_m"
                  name="stress_reduction_rating"
                  type="number"
                  min="1"
                  max="10"
                  value={matrixData.stress_reduction_rating}
                  onChange={handleMatrixChange}
                  className="mt-1"
                />
              </div>

              <Button
                onClick={saveResult}
                disabled={isSaving}
                className="w-full mt-4 bg-blue-600 hover:bg-blue-700"
              >
                {isSaving ? "Saving..." : "Save Result and Matrix Data"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // --- Initial/Running State Render ---
  return (
    <Card className="w-full max-w-lg mx-auto mt-10 shadow-xl">
      <CardHeader>
        <CardTitle className="text-center">The Stroop Effect Test</CardTitle>
        <p className="text-center text-sm text-gray-500">
          Click the button that matches the **INK COLOR** of the word.
        </p>
        <div className="flex justify-between items-center mt-2 p-2 bg-gray-100 rounded-md">
          <p className="font-bold text-lg text-blue-600 flex items-center gap-2">
            <Target className="w-5 h-5" /> Trial: {currentTrial} /{" "}
            {TOTAL_TRIALS}
          </p>
          <p className="font-bold text-lg text-purple-600 flex items-center gap-2">
            <Zap className="w-5 h-5" /> Correct: {metrics.correct}
          </p>
        </div>
      </CardHeader>

      <CardContent>
        {gameState === "initial" ? (
          <Button
            onClick={startGame}
            className="w-full h-24 text-2xl bg-green-500 hover:bg-green-600"
          >
            Start Stroop Test
          </Button>
        ) : (
          <>
            {/* The Stroop Word Display */}
            <div className="w-full h-32 flex items-center justify-center bg-gray-100 rounded-lg mb-6 shadow-inner">
              <h2
                className={`text-7xl font-extrabold select-none ${inkColorCode} transition-colors duration-200`}
              >
                {word}
              </h2>
            </div>

            {/* Answer Buttons */}
            <div className="grid grid-cols-2 gap-4">
              {COLOR_NAMES.map((color) => (
                <Button
                  key={color}
                  onClick={() => handleColorClick(color)}
                  className={`h-16 text-lg font-semibold text-white ${getButtonColorClass(
                    color
                  )}`}
                  disabled={gameState !== "running"}
                >
                  {color}
                </Button>
              ))}
            </div>

            <Button
              onClick={onGameEnd}
              variant="outline"
              className="w-full mt-4"
            >
              Exit Game
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default StroopGame;
