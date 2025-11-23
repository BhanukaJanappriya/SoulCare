import React, { useState, useRef, useCallback } from "react";
// Assuming these are your components from src/components/ui/
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { saveReactionTimeResult } from "../../api"; // The corrected API function
import { ReactionTimePayload } from "../../types"; // The new type
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  SelectGroup,
} from "../ui/select";

// --- State Definitions ---
type GameState = "initial" | "waiting" | "ready" | "too_early" | "finished";

// Data structure for the matrix part of the payload
type MatrixData = Omit<ReactionTimePayload, "reaction_time_ms">;

// Props to handle going back to the dashboard
interface ReactionTimeGameProps {
  onGameEnd: () => void;
}

const ReactionTimeGame: React.FC<ReactionTimeGameProps> = ({ onGameEnd }) => {
  const [gameState, setGameState] = useState<GameState>("initial");
  const [result, setResult] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Initialize matrix data with default neutral values
  const [matrixData, setMatrixData] = useState<MatrixData>({
    post_game_mood: 3,
    perceived_effort: 5,
    stress_reduction_rating: 5,
  });

  const startTimeRef = useRef<number>(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // --- Game Logic ---
  const startGame = useCallback(() => {
    // Clear any previous timeouts
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    setGameState("waiting");
    setResult(null);
    setError(null);

    const delay = Math.floor(Math.random() * 3000) + 1000; // 1 to 4 seconds delay

    // Set a timeout to change the color and start the official timer
    timeoutRef.current = setTimeout(() => {
      setGameState("ready");
      startTimeRef.current = performance.now();
    }, delay);
  }, []);

  const handleClick = useCallback(() => {
    if (gameState === "waiting") {
      // Clicked too early
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      setResult(0); // Indicate early click
      setError("Clicked too early! Try again.");
      setGameState("too_early");
      return;
    }

    if (gameState === "ready") {
      // Successful click
      const endTime = performance.now();
      const reactionTime = Math.round(endTime - startTimeRef.current);
      setResult(reactionTime);
      setGameState("finished");
      return;
    }

    if (gameState === "initial" || gameState === "too_early") {
      // Start button click
      startGame();
      return;
    }

    // If finished, clicking the block should do nothing, the button handles 'Play Again'
  }, [gameState, startGame]);

  // Cleanup effect
  React.useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  // --- Matrix Submission Logic ---
  const handleMatrixChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    let parsedValue: number | undefined;

    // Check if the input is one of the number fields and is a valid number
    if (name !== "post_game_mood" && value) {
      // Use unary plus operator or parseInt, ensuring we handle empty strings
      parsedValue = parseInt(value, 10);
      // Ensure the value is not NaN before setting
      if (isNaN(parsedValue)) {
        // Keep the previous value or set to a default if parsing failed
        return;
      }
    } else {
      // This is for the 'post_game_mood' select which should always have a value
      parsedValue = parseInt(value, 10);
    }

    setMatrixData((prev) => ({
      ...prev,
      [name]: parsedValue, // Set the parsed number
    }));
  };

  const saveResult = async () => {
    if (result === null || result <= 0) {
      setError("Cannot save an invalid result.");
      return;
    }

    setIsSaving(true);
    setError(null);

    const payload: ReactionTimePayload = {
      reaction_time_ms: result,
      ...matrixData,
    };

    try {
      await saveReactionTimeResult(payload);
      alert("Game result and mood matrix saved successfully!");
      // Reset to initial state after successful save
      setGameState("initial");
      setResult(null);
      setMatrixData({
        post_game_mood: 3,
        perceived_effort: 5,
        stress_reduction_rating: 5,
      });
      onGameEnd(); // Go back to the dashboard/games list
    } catch (err) {
      setError("Failed to save result. Check console for details.");
    } finally {
      setIsSaving(false);
    }
  };

  // --- UI/Rendering Helpers ---
  const getContainerClasses = () => {
    switch (gameState) {
      case "waiting":
        return "bg-red-500 cursor-not-allowed";
      case "ready":
        return "bg-green-500 text-white cursor-pointer";
      case "too_early":
        return "bg-red-200 text-red-800 cursor-pointer";
      case "finished":
        return "bg-blue-100 text-blue-800 cursor-pointer";
      case "initial":
      default:
        return "bg-gray-200 text-gray-700 hover:bg-gray-300 cursor-pointer";
    }
  };

  const getGameMessage = () => {
    switch (gameState) {
      case "waiting":
        return "... Wait for Green ...";
      case "ready":
        return "CLICK NOW!";
      case "too_early":
        return "Too Early! Click to Restart.";
      case "finished":
        return `${result} ms`;
      case "initial":
      default:
        return "Click to Start";
    }
  };

  return (
    <Card className="w-full max-w-lg mx-auto mt-10 shadow-xl">
      <CardHeader>
        <CardTitle className="text-center">Reaction Time Test</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Game Area */}
        <div
          onClick={handleClick}
          className={`
            h-64 w-full rounded-lg flex items-center justify-center transition-colors text-4xl font-extrabold select-none
            ${getContainerClasses()}
          `}
        >
          {getGameMessage()}
        </div>

        {/* Error Display */}
        {error && <p className="text-red-500 mt-4 text-center">{error}</p>}

        {/* Control Button */}
        <div className="mt-6 flex justify-center">
          <Button
            onClick={
              gameState === "finished" || gameState === "too_early"
                ? startGame
                : handleClick
            }
            disabled={gameState === "waiting" || gameState === "ready"}
            className="w-full text-lg py-6"
          >
            {gameState === "finished" ? "Play Again" : "Start/Restart"}
          </Button>
        </div>

        <Button onClick={onGameEnd} variant="outline" className="w-full mt-2">
          Back to Games List
        </Button>

        {/* Matrix Data Collection Form - Show only after a valid result */}
        {gameState === "finished" && result !== null && result > 0 && (
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
        )}
      </CardContent>
    </Card>
  );
};

export default ReactionTimeGame;
