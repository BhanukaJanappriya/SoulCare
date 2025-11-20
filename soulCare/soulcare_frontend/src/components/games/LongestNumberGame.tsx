import React, {
  useState,
  useRef,
  useCallback,
  useEffect,
  useMemo,
} from "react";
import {
  Brain,
  Clock,
  HelpCircle,
  TrendingUp,
  X,
  Trophy,
  Dices,
  ListOrdered,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Progress } from "../../components/ui/progress";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  SelectGroup,
} from "../../components/ui/select";
import {
  saveLongestNumberResult,
  LongestNumberGameStats,
  fetchLongestNumberStats,
} from "../../api";
import { useToast } from "../../components/ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../components/ui/dialog";
import { format } from "date-fns";
import { ScrollArea } from "../../components/ui/scroll-area";

// --- CONFIG ---
const INITIAL_LENGTH = 1;
const MAX_LENGTH = 25;
const LEVEL_INCREMENT = 1;
const MEMORIZE_TIME_MS = 1000;

const GAME_LEVELS = Array.from({ length: MAX_LENGTH }, (_, i) => ({
  level: i + 1,
  length: INITIAL_LENGTH + i * LEVEL_INCREMENT,
}));

// Placeholder Type Definition (Ensure this matches your imported LongestNumberPayload)
type LongestNumberPayload = {
  max_number_length: number;
  total_attempts: number;
  total_reaction_time_ms: number;
  post_game_mood: number;
  perceived_effort: number;
  stress_reduction_rating: number;
};

// Data structure for the matrix part of the payload
type MatrixData = Omit<
  LongestNumberPayload,
  "max_number_length" | "total_attempts" | "total_reaction_time_ms"
>;

// --- State Definitions ---
type GameState = "initial" | "memorize" | "input" | "success" | "finished";

interface LongestNumberGameProps {
  onGameEnd: () => void;
}

const generateRandomNumber = (length: number): string => {
  let number = "";
  if (length > 1) {
    number += Math.floor(Math.random() * 9) + 1;
    for (let i = 1; i < length; i++) {
      number += Math.floor(Math.random() * 10).toString();
    }
  } else {
    number = Math.floor(Math.random() * 10).toString();
  }
  return number;
};

// Initial state for API stats (assuming LongestNumberGameStats is defined in your API types)
const initialStats: LongestNumberGameStats = {
  highest_score: 0,
  average_score: 0,
  total_plays: 0,
  total_time_ms: 0,
  history: [],
};

const LongestNumberGame: React.FC<LongestNumberGameProps> = ({ onGameEnd }) => {
  const { toast } = useToast();

  // --- Game State ---
  const [gameState, setGameState] = useState<GameState>("initial");
  const [currentLevelIndex, setCurrentLevelIndex] = useState(0);
  const [currentNumber, setCurrentNumber] = useState("");
  const [userNumber, setUserNumber] = useState("");
  const [totalAttempts, setTotalAttempts] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [stats, setStats] = useState<LongestNumberGameStats>(initialStats);
  const [isHighestScore, setIsHighestScore] = useState(false);

  // Refs for timing and scoring
  const lastSuccessfulLengthRef = useRef(0);
  const totalReactionTimeRef = useRef(0);
  const inputStartTimeRef = useRef(0);

  // State for the Matrix Data (Self-Report)
  const [matrixData, setMatrixData] = useState<MatrixData>({
    post_game_mood: 3, // Default to Neutral
    perceived_effort: 5, // Default mid-range
    stress_reduction_rating: 5, // Default mid-range
  });

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const currentLevel = GAME_LEVELS[currentLevelIndex];
  const currentLength = currentLevel?.length || INITIAL_LENGTH;
  const maxPossibleLength = GAME_LEVELS[GAME_LEVELS.length - 1].length;

  // --- Data Fetching ---
  const fetchStats = useCallback(async () => {
    try {
      // NOTE: This assumes fetchLongestNumberStats is correctly defined in your api.ts
      const fetchedStats = await fetchLongestNumberStats();
      setStats(fetchedStats);
    } catch (e) {
      console.error("Failed to fetch game stats:", e);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  // --- Game Logic ---
  const startLevel = useCallback(
    (levelIndex: number) => {
      const levelConfig = GAME_LEVELS[levelIndex];
      if (!levelConfig) {
        setGameState("finished");
        return;
      }

      setGameState("memorize");
      setUserNumber("");

      const newNumber = generateRandomNumber(levelConfig.length);
      setCurrentNumber(newNumber);
      setTotalAttempts((prev) => prev + 1);

      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        setGameState("input");
        inputStartTimeRef.current = performance.now(); // Start reaction time tracking
        toast({
          title: "Time's up!",
          description: "Enter the number you saw.",
          duration: 1500,
        });
      }, levelConfig.length * MEMORIZE_TIME_MS);
    },
    [toast]
  );

  const startGame = useCallback(() => {
    setCurrentLevelIndex(0);
    lastSuccessfulLengthRef.current = 0;
    totalReactionTimeRef.current = 0;
    setIsHighestScore(false);
    setTotalAttempts(0);
    startLevel(0);
  }, [startLevel]);

  const checkAnswer = useCallback(() => {
    if (gameState !== "input") return;

    const reactionTime = performance.now() - inputStartTimeRef.current; // Calculate current RT

    if (userNumber === currentNumber) {
      // Successful attempt!
      totalReactionTimeRef.current += reactionTime; // Add to total
      lastSuccessfulLengthRef.current = currentLength; // Update the score to the CURRENT length

      const nextLevelIndex = currentLevelIndex + 1;

      if (nextLevelIndex < GAME_LEVELS.length) {
        setCurrentLevelIndex(nextLevelIndex);
        setGameState("success");
        toast({
          title: "Success!",
          description: `Time: ${reactionTime.toFixed(
            0
          )}ms. Next level loading.`,
          duration: 1000,
        });
        setTimeout(() => {
          startLevel(nextLevelIndex);
        }, 1000);
      } else {
        // Game Complete (Max Length Reached)
        setGameState("finished");

        if (currentLength > stats.highest_score) {
          setIsHighestScore(true);
        }

        toast({
          title: "Memory Legend!",
          description: `You completed the max length of ${maxPossibleLength} digits!`,
          variant: "default",
        });
      }
    } else {
      // Incorrect answer -> GAME OVER (Single mistake rule)
      setGameState("finished");

      // Final score to save is the length of the number that was being attempted
      const finalScore = currentLength;

      // Check for highest score against the stored highest completion
      if (lastSuccessfulLengthRef.current > stats.highest_score) {
        setIsHighestScore(true);
      }

      toast({
        title: "Game Over!",
        description: `Incorrect. Final length being attempted: ${finalScore} digits.`,
        variant: "destructive",
      });
    }
  }, [
    gameState,
    userNumber,
    currentNumber,
    currentLevelIndex,
    currentLength,
    maxPossibleLength,
    stats.highest_score,
    startLevel,
    toast,
  ]);

  // Cleanup effect
  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  // The score that will be saved to the database: The length of the number being attempted
  const scoreToSave = useMemo(() => {
    if (gameState !== "finished") return 0;

    // If MAX level was completed, score is MAX_LENGTH
    if (currentLevelIndex === GAME_LEVELS.length) {
      return maxPossibleLength;
    }

    // If a failure, score is the length of the number that was being attempted
    return currentLength;
  }, [gameState, currentLevelIndex, currentLength, maxPossibleLength]);

  // The time to save (Fixed: use the ref directly when needed)
  const timeToSave = totalReactionTimeRef.current;

  // --- Save Result Logic ---
  const saveResult = async () => {
    setIsSaving(true);

    // Final Payload containing both game results and matrix data
    const payload: LongestNumberPayload = {
      max_number_length: scoreToSave,
      total_attempts: totalAttempts,
      total_reaction_time_ms: timeToSave,
      ...matrixData, // Includes post_game_mood, perceived_effort, stress_reduction_rating
    };

    // Log the payload being sent for debugging confirmation
    console.log("Sending Payload:", payload);

    try {
      // NOTE: Assumes saveLongestNumberResult is correctly defined in your api.ts
      await saveLongestNumberResult(payload);
      toast({
        title: "Success!",
        description: "Game result and matrix saved successfully.",
      });

      await fetchStats();

      // Reset state for a fresh start
      setGameState("initial");
      totalReactionTimeRef.current = 0;
      lastSuccessfulLengthRef.current = 0;
      setTotalAttempts(0);
      onGameEnd();
    } catch (err) {
      console.error("Save Failed:", err);
      toast({
        title: "Save Failed",
        description: "Failed to save result. Check console for details.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  // --- UI Render Helpers ---
  const getGameMessage = () => {
    switch (gameState) {
      case "initial":
        return "Start at 1 Digit. Go for 25!";
      case "memorize":
        return currentNumber;
      case "input":
        return "Enter the number below";
      case "success":
        return "Correct! Next Level Loading...";
      case "finished":
        return `Game Over. Final Attempted Length: ${scoreToSave} Digits.`;
      default:
        return "";
    }
  };

  const getGameClasses = () => {
    switch (gameState) {
      case "memorize":
        return "bg-indigo-600 text-white text-6xl font-extrabold shadow-2xl animate-pulse font-mono tracking-widest";
      case "input":
        return "bg-gray-100 text-gray-700 text-2xl font-mono";
      case "success":
        return "bg-green-200 text-green-800 text-3xl animate-bounce";
      case "finished":
        return "bg-red-100 text-red-800 text-2xl";
      case "initial":
      default:
        return "bg-gray-100 text-gray-700 text-2xl";
    }
  };

  // Function to prepare history data for display (sorted by score)
  const sortedHistory = useMemo(() => {
    if (!stats.history) return [];
    // Sort primarily by score (max_number_length) DESC, secondarily by time ASC
    return [...stats.history]
      .sort((a, b) => {
        if (b.score !== a.score) {
          return b.score - a.score; // Higher score first
        }
        return a.time - b.time; // Faster time first
      })
      .map((item, index) => ({
        rank: index + 1,
        score: item.score,
        time: item.time,
        date: format(new Date(item.created_at), "MMM dd, yyyy HH:mm"),
      }));
  }, [stats.history]);

  const totalTimeMinutes = (stats.total_time_ms / (1000 * 60)).toFixed(1);

  // Helper for top 3 sleek styling
  const getRankClass = (rank: number) => {
    if (rank === 1)
      return "bg-yellow-50 text-yellow-800 font-extrabold border-l-4 border-yellow-500 shadow-md";
    if (rank === 2)
      return "bg-slate-50 text-slate-800 font-bold border-l-4 border-slate-400";
    if (rank === 3)
      return "bg-amber-50 text-amber-800 font-semibold border-l-4 border-amber-300";
    return "";
  };

  // --- Main Render ---
  return (
    <Card className="w-full max-w-4xl mx-auto mt-10 shadow-2xl">
      {/* CONGRATULATIONS POP-UP DIALOG (Not changed) */}
      <Dialog
        open={gameState === "finished" && isHighestScore}
        onOpenChange={(open) => !open && setIsHighestScore(false)}
      >
        <DialogContent className="sm:max-w-[425px] text-center">
          <DialogHeader>
            <Dices className="w-16 h-16 text-yellow-500 mx-auto animate-bounce" />
            <DialogTitle className="text-3xl font-bold text-primary">
              NEW HIGH SCORE!
            </DialogTitle>
          </DialogHeader>
          <p className="text-lg">
            Congratulations! You set a new personal record:
            <span className="font-extrabold text-2xl text-green-600 ml-2">
              {stats.highest_score} Digits
            </span>
          </p>
          <div className="flex justify-center mt-4">
            <Button onClick={() => setIsHighestScore(false)}>Awesome!</Button>
          </div>
        </DialogContent>
      </Dialog>
      {/* END CONGRATULATIONS POP-UP */}

      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex flex-col">
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-6 h-6 text-primary" />
            Longest Number Recall
          </CardTitle>
          <CardDescription>
            Memorize and recall the number before time runs out. Max length:{" "}
            {maxPossibleLength} digits.
          </CardDescription>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" size="icon" className="shrink-0">
              <HelpCircle className="w-5 h-5" />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="text-xl">
                Instructions: Longest Number
              </DialogTitle>
            </DialogHeader>
            <ol className="list-decimal list-inside space-y-2">
              <li>
                Click **Start Game** to begin Level 1 ({INITIAL_LENGTH} digit).
              </li>
              <li>
                A number will appear for a set period ({MEMORIZE_TIME_MS / 1000}{" "}
                second per digit).
              </li>
              <li>Once the number disappears, quickly enter the number.</li>
              <li>**A single mistake ends the game (Game Over).**</li>
              <li>
                If correct, you immediately advance to the next level with **one
                additional digit**.
              </li>
              <li>
                Your final score recorded is the **length of the number you
                failed on.**
              </li>
            </ol>
          </DialogContent>
        </Dialog>
      </CardHeader>

      <CardContent>
        {/* Game Stats Card (Not changed) */}
        <Card className="mb-6 p-4 bg-gray-50 dark:bg-gray-800/50">
          <div className="grid grid-cols-4 text-center divide-x divide-gray-300">
            {" "}
            {/* Added divide-x */}
            <div>
              <Trophy className="w-5 h-5 mx-auto text-yellow-500" />
              <p className="text-xs font-semibold mt-1">Highest Score</p>
              <p className="text-lg font-bold">{stats.highest_score} digits</p>
            </div>
            <div>
              <TrendingUp className="w-5 h-5 mx-auto text-green-500" />
              <p className="text-xs font-semibold mt-1">Avg. Score</p>
              <p className="text-lg font-bold">{stats.average_score} digits</p>
            </div>
            <div>
              <Clock className="w-5 h-5 mx-auto text-blue-500" />
              <p className="text-xs font-semibold mt-1">Total Time</p>
              <p className="text-lg font-bold">{totalTimeMinutes} min</p>
            </div>
            <div>
              <Clock className="w-5 h-5 mx-auto text-blue-500" />
              <p className="text-xs font-semibold mt-1">Total Plays</p>
              <p className="text-lg font-bold">{stats.total_plays}</p>
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            {/* Game Area (Not changed) */}
            <div
              className={`
								h-40 w-full rounded-lg flex flex-col items-center justify-center transition-all duration-500 select-none
								${getGameClasses()}
							`}
            >
              <p className="tracking-widest">{getGameMessage()}</p>
              {(gameState === "memorize" || gameState === "success") && (
                <p className="text-sm mt-2 opacity-80">
                  Current Length: {currentLength} digits
                </p>
              )}
            </div>

            {/* Progress (Not changed) */}
            {gameState !== "initial" &&
              gameState !== "finished" &&
              currentLevel && (
                <div className="mt-4 space-y-3">
                  <div className="flex justify-between text-sm font-medium">
                    <span>Progress to Max Length ({maxPossibleLength}):</span>
                    <span>
                      {currentLevel.length} / {maxPossibleLength}
                    </span>
                  </div>
                  <Progress
                    value={(currentLevel.length / maxPossibleLength) * 100}
                    className="h-2"
                  />
                </div>
              )}

            {/* Input/Control Area (Not changed) */}
            <div className="mt-6">
              {gameState === "input" && (
                <div className="flex gap-2">
                  <Input
                    type="number"
                    placeholder={`Enter the ${currentLength}-digit number`}
                    value={userNumber}
                    onChange={(e) =>
                      setUserNumber(e.target.value.substring(0, currentLength))
                    }
                    className="text-lg text-center font-mono"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === "Enter") checkAnswer();
                    }}
                  />
                  <Button onClick={checkAnswer}>Submit</Button>
                </div>
              )}

              {/* Start/Play Again buttons (Not changed) */}
              <div className="flex flex-col gap-2 mt-4">
                {(gameState === "initial" || gameState === "finished") && (
                  <Button
                    onClick={startGame}
                    className="w-full text-lg py-6 bg-green-500 hover:bg-green-600"
                  >
                    {gameState === "finished" ? "Play Again" : "Start Game"}
                  </Button>
                )}
                <Button
                  onClick={onGameEnd}
                  variant="outline"
                  className="w-full"
                >
                  <X className="w-4 h-4 mr-2" />
                  Back to Games List
                </Button>
              </div>
            </div>
          </div>

          {/* Leaderboard/History Card (Not changed) */}
          <Card className="lg:col-span-1 p-0">
            <CardHeader className="p-4 border-b">
              <CardTitle className="text-lg flex items-center gap-2">
                <ListOrdered className="w-5 h-5 text-primary" />
                My Leaderboard (Top 15)
              </CardTitle>
            </CardHeader>
            <ScrollArea className="h-96">
              <CardContent className="p-0">
                {sortedHistory.length === 0 ? (
                  <p className="p-4 text-center text-muted-foreground">
                    No history yet. Play to set a record!
                  </p>
                ) : (
                  <table className="w-full text-sm">
                    <thead className="sticky top-0 bg-background/90 backdrop-blur-sm border-b">
                      <tr className="text-left text-muted-foreground">
                        <th className="p-3">#</th>
                        <th className="p-3">Score</th>
                        <th className="p-3">Time (s)</th>
                        <th className="p-3">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sortedHistory.slice(0, 15).map((item, index) => (
                        <tr
                          key={index}
                          className={`border-b last:border-b-0 transition-colors ${getRankClass(
                            item.rank
                          )}`}
                        >
                          <td className="p-3 font-bold">{item.rank}</td>
                          <td className="p-3 text-lg font-bold text-green-600">
                            {item.score}
                          </td>
                          <td className="p-3 text-sm font-mono">
                            {(item.time / 1000).toFixed(2)}
                          </td>{" "}
                          {/* Display time in seconds */}
                          <td className="p-3 text-xs text-muted-foreground">
                            {item.date}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </CardContent>
            </ScrollArea>
          </Card>
        </div>

        {/* --- Post-Game Matrix Submission (UPDATED SECTION) --- */}
        {gameState === "finished" && (
          <div className="mt-8 pt-4 border-t border-gray-200">
            <h3 className="text-xl font-semibold mb-4 text-center">
              Final Result: {scoreToSave} Digits Attempted
            </h3>

            <h4 className="text-lg font-medium mb-3 text-center text-primary-dark">
              Submit Mood Matrix (Total Input Time:{" "}
              {(timeToSave / 1000).toFixed(2)}s)
            </h4>

            {/* --- MATRIX INPUT FIELDS START HERE --- */}
            <div className="space-y-4 max-w-lg mx-auto p-4 border rounded-lg bg-gray-50 dark:bg-gray-800">
              {/* 1. Post Game Mood (Self-Reported Stress) */}
              <div className="flex flex-col space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  1. Post-Game Mood{" "}
                  <span className="text-xs text-muted-foreground">
                    (1=Stressed, 5=Calm)
                  </span>
                </label>
                <Select
                  value={matrixData.post_game_mood.toString()}
                  onValueChange={(value) =>
                    setMatrixData((prev) => ({
                      ...prev,
                      post_game_mood: parseInt(value),
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Mood" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="1">1 - Very Stressed 😩</SelectItem>
                      <SelectItem value="2">2 - Stressed 😟</SelectItem>
                      <SelectItem value="3">3 - Neutral 😐</SelectItem>
                      <SelectItem value="4">4 - Calm 🙂</SelectItem>
                      <SelectItem value="5">5 - Very Calm 😊</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>

              {/* 2. Perceived Effort (1-10 Scale) */}
              <div className="flex flex-col space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  2. Perceived Effort{" "}
                  <span className="text-xs text-muted-foreground">
                    (1=Low, 10=High)
                  </span>
                </label>
                <Input
                  type="number"
                  min="1"
                  max="10"
                  value={matrixData.perceived_effort}
                  onChange={(e) => {
                    const val = parseInt(e.target.value);
                    setMatrixData((prev) => ({
                      ...prev,
                      perceived_effort: isNaN(val)
                        ? 0
                        : Math.min(10, Math.max(1, val)),
                    }));
                  }}
                  className="text-center"
                />
              </div>

              {/* 3. Stress Reduction Rating (1-10 Scale) */}
              <div className="flex flex-col space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  3. Stress Reduction Rating{" "}
                  <span className="text-xs text-muted-foreground">
                    (1=No, 10=Yes)
                  </span>
                </label>
                <Input
                  type="number"
                  min="1"
                  max="10"
                  value={matrixData.stress_reduction_rating}
                  onChange={(e) => {
                    const val = parseInt(e.target.value);
                    setMatrixData((prev) => ({
                      ...prev,
                      stress_reduction_rating: isNaN(val)
                        ? 0
                        : Math.min(10, Math.max(1, val)),
                    }));
                  }}
                  className="text-center"
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
            {/* --- MATRIX INPUT FIELDS END HERE --- */}
          </div>
        )}
        {/* --- END Post-Game Matrix Submission --- */}
      </CardContent>
    </Card>
  );
};

export default LongestNumberGame;
