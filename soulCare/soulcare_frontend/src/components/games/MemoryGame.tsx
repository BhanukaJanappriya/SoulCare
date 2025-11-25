import React, { useState, useRef, useCallback, useEffect } from "react";
// Assuming these are your components from src/components/ui/
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { saveMemoryGameResult } from "../../api";
import { MemoryGamePayload } from "../../types";
import { Zap, Brain, Trophy } from "lucide-react";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  SelectGroup,
} from "../ui/select";
import { toast, useToast } from "@/hooks/use-toast";

// --- Constants ---
type Color = "red" | "blue" | "green" | "yellow";
const GAME_COLORS: Color[] = ["red", "blue", "green", "yellow"];

// --- State Definitions ---
type GameState =
  | "initial"
  | "showing_sequence"
  | "user_input"
  | "finished"
  | "win_congrats";
type MatrixData = Omit<
  MemoryGamePayload,
  "max_sequence_length" | "total_attempts"
>;

interface MemoryGameProps {
  onGameEnd: () => void;
}

const MemoryGame: React.FC<MemoryGameProps> = ({ onGameEnd }) => {
  const [gameState, setGameState] = useState<GameState>("initial");
  const [sequence, setSequence] = useState<Color[]>([]);
  const [userClicks, setUserClicks] = useState<Color[]>([]);
  const [activeColor, setActiveColor] = useState<Color | null>(null);
  const [score, setScore] = useState(0); // Max successful sequence length
  const [attempts, setAttempts] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [highScore, setHighScore] = useState(0); // Simple local high score tracking

  const [matrixData, setMatrixData] = useState<MatrixData>({
    post_game_mood: 3,
    perceived_effort: 5,
    stress_reduction_rating: 5,
  });

  const isMounted = useRef(true);
  const {toast} = useToast()

  // --- Game Logic ---
  const generateNextSequence = useCallback((currentSequence: Color[]) => {
    const randomColor =
      GAME_COLORS[Math.floor(Math.random() * GAME_COLORS.length)];
    return [...currentSequence, randomColor];
  }, []);

  const startGame = useCallback(() => {
    setError(null);
    setAttempts(0);
    setScore(0);
    setUserClicks([]);

    const initialSequence = generateNextSequence([]);
    setSequence(initialSequence);
    setGameState("showing_sequence");
  }, [generateNextSequence]);

  // Effect to display the sequence
  useEffect(() => {
    if (gameState === "showing_sequence" && sequence.length > 0) {
      let i = 0;
      const interval = setInterval(() => {
        if (!isMounted.current) {
          clearInterval(interval);
          return;
        }
        if (i < sequence.length) {
          setActiveColor(sequence[i]);
          setTimeout(() => setActiveColor(null), 400); // Shorter flash
          i++;
        } else {
          clearInterval(interval);
          setTimeout(() => {
            if (isMounted.current) {
              setGameState("user_input");
              setUserClicks([]);
            }
          }, 400);
        }
      }, 800); // Faster sequence display

      return () => clearInterval(interval);
    }
  }, [gameState, sequence]);

  // Cleanup
  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  // --- Failure/Win Condition ---
  const handleFailure = (currentSequenceLength: number) => {
    setAttempts((prev) => prev + 1);
    const finalScore = currentSequenceLength - 1; // Score is max successful length
    setScore(finalScore);
    setError(
      `GAME OVER! You failed at sequence length ${currentSequenceLength}.`
    );

    // Check for new high score
    if (finalScore > highScore) {
      setHighScore(finalScore); // Update local high score
      setGameState("win_congrats"); // Switch to the congratulations screen
      setTimeout(() => setGameState("finished"), 3000); // Show congrats for 3s, then switch to finished/form
    } else {
      setGameState("finished");
    }
  };

  const handleColorClick = (color: Color) => {
    if (gameState !== "user_input") return;

    setActiveColor(color);
    setTimeout(() => setActiveColor(null), 150);

    const expectedColor = sequence[userClicks.length];

    // --- Failure ---
    if (color !== expectedColor) {
      handleFailure(sequence.length);
      return;
    }

    // --- Success Check ---
    const newClicks = [...userClicks, color];
    setUserClicks(newClicks);

    // If the user has finished the current sequence
    if (newClicks.length === sequence.length) {
      // Successfully completed a round. Prepare for the next round.
      const nextSequence = generateNextSequence(sequence);

      // Brief moment to show success before showing next sequence
      setTimeout(() => {
        setSequence(nextSequence);
        setGameState("showing_sequence");
      }, 500);
    }
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
    if (score === 0 && attempts === 0) {
      setError("Please play a game before saving.");
      return;
    }

    setIsSaving(true);
    setError(null);

    const payload: MemoryGamePayload = {
      max_sequence_length: score,
      total_attempts: attempts,
      ...matrixData,
    };

    try {
      await saveMemoryGameResult(payload);
      toast({
        title: "Success! 🧠",
        description: "Memory Game result and mood matrix saved successfully!",
      });
      setGameState("initial");
      setScore(0);
      setAttempts(0);
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
  const getColorClasses = (color: Color, index: number) => {
    const baseClasses = `absolute w-1/2 h-1/2 cursor-pointer transition-all duration-300 transform shadow-2xl rounded-full border-4 border-gray-900/50`;

    let colorClasses = "";
    switch (color) {
      case "green":
        colorClasses = "bg-green-500 top-0 left-0 rounded-br-none";
        break;
      case "red":
        colorClasses = "bg-red-500 top-0 right-0 rounded-bl-none";
        break;
      case "yellow":
        colorClasses = "bg-yellow-500 bottom-0 left-0 rounded-tr-none";
        break;
      case "blue":
        colorClasses = "bg-blue-500 bottom-0 right-0 rounded-tl-none";
        break;
    }

    const isActive = activeColor === color;
    const isClickable = gameState === "user_input";
    const isFaded = !isClickable && gameState !== "showing_sequence";

    // Use scale for active flash
    const activeScale = isActive
      ? "scale-110 opacity-100 ring-8 ring-white/50"
      : "scale-100 opacity-90 z-10";

    if (isFaded) {
      return `${baseClasses} ${colorClasses} opacity-30 z-10`;
    }

    return `${baseClasses} ${colorClasses} ${activeScale} ${
      isClickable ? "hover:scale-[1.02] active:scale-95" : ""
    }`;
  };

  const GameBlock: React.FC<{ color: Color; index: number }> = ({
    color,
    index,
  }) => (
    <div
      className={getColorClasses(color, index)}
      onClick={() => handleColorClick(color)}
    />
  );

  const getGameStatusMessage = () => {
    const currentLevel = sequence.length > 0 ? sequence.length : 0;
    const correctClicks = userClicks.length;

    switch (gameState) {
      case "initial":
        return "Click Start to begin. Memorize the color sequence.";
      case "showing_sequence":
        return `WATCH! Level: ${currentLevel} (Score: ${score})`;
      case "user_input":
        return `GO! Clicks: ${correctClicks}/${currentLevel}`;
      case "finished":
        return `FINAL SCORE: ${score}. Fill the matrix to save.`;
      default:
        return "";
    }
  };

  // --- Congratulatory Screen (Animation) ---
  if (gameState === "win_congrats") {
    return (
      <Card className="w-full max-w-lg mx-auto mt-10 shadow-2xl border-4 border-yellow-400 bg-yellow-50/50 animate-pulse-fast">
        <CardHeader className="text-center">
          <Brain className="w-16 h-16 text-yellow-600 mx-auto animate-bounce-slow" />
          <CardTitle className="text-4xl font-extrabold text-yellow-700">
            NEW HIGH SCORE!
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4 pb-8">
          <p className="text-2xl font-semibold">
            Congratulations! You reached a sequence length of {score}.
          </p>
          <p className="text-lg text-gray-600">
            You beat your previous best of {score - 1}.
          </p>
          <Button
            onClick={() => setGameState("finished")}
            className="mt-4 bg-yellow-500 hover:bg-yellow-600"
          >
            Continue to Save Result
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-lg mx-auto mt-10 shadow-xl">
      <CardHeader>
        <CardTitle className="text-center">Color Pattern Memory Test</CardTitle>
        <p className="text-center text-sm text-gray-500">
          Measures Working Memory & Attention
        </p>
        <div className="flex justify-between items-center mt-2 p-2 bg-gray-100 rounded-md">
          <p className="font-bold text-lg text-blue-600 flex items-center gap-2">
            <Zap className="w-5 h-5" /> Current Score: {score}
          </p>
          <p className="font-bold text-lg text-green-600 flex items-center gap-2">
            <Trophy className="w-5 h-5" /> High Score: {highScore}
          </p>
        </div>
        <p className={`text-center font-semibold text-lg text-gray-700 mt-2`}>
          {getGameStatusMessage()}
        </p>
      </CardHeader>

      <CardContent>
        {/* PIE CHART / CIRCULAR GAME BOARD */}
        <div className="w-full flex items-center justify-center py-6">
          <div className="relative w-72 h-72 rounded-full shadow-2xl bg-gray-700/50">
            <div className="absolute inset-0 rounded-full overflow-hidden">
              <GameBlock color="green" index={0} />
              <GameBlock color="red" index={1} />
              <GameBlock color="yellow" index={2} />
              <GameBlock color="blue" index={3} />
            </div>

            {/* Center Button / Display */}
            <div className="absolute inset-1/4 w-1/2 h-1/2 bg-gray-900 rounded-full flex items-center justify-center border-4 border-gray-500/50 z-30">
              <p className="text-white text-3xl font-extrabold">
                {sequence.length - 1}
              </p>
            </div>
          </div>
        </div>

        {/* Control Button */}
        <div className="mt-6 flex justify-center">
          {gameState === "initial" || gameState === "finished" ? (
            <Button
              onClick={startGame}
              className="w-full text-lg py-6 bg-green-500 hover:bg-green-600"
            >
              {gameState === "finished" ? "Play Again" : "Start New Game"}
            </Button>
          ) : (
            <Button disabled className="w-full text-lg py-6 bg-gray-400">
              {gameState === "showing_sequence"
                ? "WATCH SEQUENCE"
                : `YOUR TURN (${sequence.length - userClicks.length} Left)`}
            </Button>
          )}
        </div>

        <Button onClick={onGameEnd} variant="outline" className="w-full mt-2">
          Back to Games List
        </Button>

        {/* Error Display */}
        {error && (
          <p className="text-red-500 mt-4 text-center font-bold">{error}</p>
        )}

        {/* Matrix Data Collection Form - Show only after a game is finished */}
        {gameState === "finished" &&
          score >= 0 && ( // Allow saving of 0 score
            <div className="mt-8 pt-4 border-t border-gray-200">
              <h3 className="text-xl font-semibold mb-4 text-center">
                Mood Matrix Data
              </h3>
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
                    2. How much effort did you feel you exerted? (1=None,
                    10=Max)
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

export default MemoryGame;
