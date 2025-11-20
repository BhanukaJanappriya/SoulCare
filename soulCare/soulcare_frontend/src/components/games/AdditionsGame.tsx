import React, {
  useState,
  useRef,
  useCallback,
  useEffect,
  useMemo,
} from "react";
import {
  PlusCircle,
  Clock,
  HelpCircle,
  Trophy,
  TrendingUp,
  X,
  ListOrdered,
  ChevronRight,
  Check,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Separator } from "../ui/separator";
import { Progress } from "../ui/progress";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  SelectGroup,
} from "../ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { ScrollArea } from "../ui/scroll-area";
import { useToast } from "../ui/use-toast";
import { format } from "date-fns";
import { AdditionsGamePayload, AdditionsGameStats } from "../../types";
import { saveAdditionsResult, fetchAdditionsStats } from "../../api";

// --- CONFIG ---
const QUESTIONS_PER_LEVEL = 5;
const MAX_LEVELS = 5;
const MAX_TIME_PER_QUESTION_S = 10; // Time limit per question (optional, can be adapted)

const DIFFICULTY_CONFIG = [
  { level: 1, max_value: 10, terms: 2 }, // 1-digit + 1-digit
  { level: 2, max_value: 50, terms: 2 }, // 2-digit + 2-digit (up to 50)
  { level: 3, max_value: 100, terms: 2 }, // Up to 100
  { level: 4, max_value: 100, terms: 3 }, // 3 terms, up to 100 each
  { level: 5, max_value: 500, terms: 3 }, // Higher 3 terms
];

// --- State Definitions ---
type GameState = "initial" | "playing" | "submitting" | "finished";

// Data structure for the matrix part of the payload
type MatrixData = Omit<
  AdditionsGamePayload,
  "total_correct" | "time_taken_s" | "difficulty_level"
>;

interface AdditionsGameProps {
  onGameEnd: () => void;
}

interface Question {
  terms: number[];
  answer: number;
  text: string;
  startTime: number;
}

// --- Helper Functions ---

const generateQuestion = (
  levelConfig: (typeof DIFFICULTY_CONFIG)[0]
): Question => {
  let sum = 0;
  const terms: number[] = [];
  for (let i = 0; i < levelConfig.terms; i++) {
    const term = Math.floor(Math.random() * levelConfig.max_value) + 1; // 1 to max_value
    terms.push(term);
    sum += term;
  }

  return {
    terms: terms,
    answer: sum,
    text: terms.join(" + "),
    startTime: performance.now(),
  };
};

// --- Initial State for Stats ---
const initialStats: AdditionsGameStats = {
  highest_correct: 0,
  avg_correct: 0,
  total_plays: 0,
  history: [],
};

const AdditionsGame: React.FC<AdditionsGameProps> = ({ onGameEnd }) => {
  const { toast } = useToast();

  // --- Game State ---
  const [gameState, setGameState] = useState<GameState>("initial");
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [userAnswer, setUserAnswer] = useState("");
  const [correctCount, setCorrectCount] = useState(0);
  const [questionCount, setQuestionCount] = useState(0);
  const [currentLevelIndex, setCurrentLevelIndex] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [stats, setStats] = useState<AdditionsGameStats>(initialStats);
  const [isNewBest, setIsNewBest] = useState(false);

  const totalTimeRef = useRef(0);
  const questionStartTimeRef = useRef(0);

  const currentLevelConfig = DIFFICULTY_CONFIG[currentLevelIndex];
  const maxQuestions = MAX_LEVELS * QUESTIONS_PER_LEVEL;

  // Initialize matrix data with default neutral values
  const [matrixData, setMatrixData] = useState<MatrixData>({
    post_game_mood: 3,
    perceived_effort: 5,
    stress_reduction_rating: 5,
  });

  // --- Game Logic ---
  const startNextQuestion = useCallback((levelIndex: number) => {
    const levelConfig = DIFFICULTY_CONFIG[levelIndex];
    if (!levelConfig) {
      // Should only happen if max level is reached
      setGameState("submitting");
      return;
    }

    const newQuestion = generateQuestion(levelConfig);
    setCurrentQuestion(newQuestion);
    setUserAnswer("");
    questionStartTimeRef.current = performance.now();
    setQuestionCount((prev) => prev + 1);
  }, []);

  const startGame = useCallback(() => {
    setGameState("playing");
    setCorrectCount(0);
    setQuestionCount(0);
    setCurrentLevelIndex(0);
    totalTimeRef.current = 0;
    setIsNewBest(false);
    startNextQuestion(0);
  }, [startNextQuestion]);

  const checkAnswer = useCallback(() => {
    if (!currentQuestion) return;

    const answer = parseInt(userAnswer, 10);
    const timeTaken = (performance.now() - questionStartTimeRef.current) / 1000;
    totalTimeRef.current += timeTaken;

    if (answer === currentQuestion.answer) {
      setCorrectCount((prev) => prev + 1);
      toast({
        title: "Correct!",
        description: `Time: ${timeTaken.toFixed(1)}s`,
        variant: "default",
      });

      // Check for level up
      const nextLevelIndex = Math.floor(
        (questionCount + 1) / QUESTIONS_PER_LEVEL
      );

      if (nextLevelIndex < MAX_LEVELS) {
        // Advance level if needed, otherwise stay on the same level
        setCurrentLevelIndex(nextLevelIndex);
        startNextQuestion(nextLevelIndex);
      } else {
        // Game End
        setGameState("submitting");
        const finalScore = correctCount + 1; // +1 for the current correct answer
        if (finalScore > stats.highest_correct) {
          setIsNewBest(true);
        }
      }
    } else {
      // Wrong Answer - Game Over
      setGameState("submitting");
      toast({
        title: "Incorrect!",
        description: `The correct answer was ${currentQuestion.answer}.`,
        variant: "destructive",
      });
    }
  }, [
    currentQuestion,
    userAnswer,
    questionCount,
    correctCount,
    stats.highest_correct,
    startNextQuestion,
    toast,
  ]);

  // --- Data Fetching ---
  const fetchStats = useCallback(async () => {
    try {
      const fetchedStats = await fetchAdditionsStats();
      setStats(fetchedStats);
    } catch (e) {
      console.error("Failed to fetch Additions stats:", e);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  // --- Save Result Logic ---
  const saveResult = async () => {
    if (gameState !== "submitting") return;

    setIsSaving(true);

    const finalCorrect =
      correctCount +
      (userAnswer && parseInt(userAnswer, 10) === currentQuestion?.answer
        ? 1
        : 0);
    const finalTime = totalTimeRef.current;
    const finalDifficulty = currentLevelConfig.level;

    const payload: AdditionsGamePayload = {
      total_correct: finalCorrect,
      time_taken_s: finalTime,
      difficulty_level: finalDifficulty,
      ...matrixData,
    };

    try {
      await saveAdditionsResult(payload);
      toast({
        title: "Result Saved!",
        description: "Score and matrix saved successfully.",
      });
      await fetchStats();
      setGameState("finished");
    } catch (err) {
      toast({
        title: "Save Failed",
        description: "Failed to save result. See console.",
        variant: "destructive",
      });
      setGameState("finished");
    } finally {
      setIsSaving(false);
    }
  };

  // --- UI Render Helpers ---
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const getRankClass = (rank: number) => {
    if (rank === 1)
      return "bg-yellow-50 text-yellow-800 font-extrabold border-l-4 border-yellow-500 shadow-md";
    if (rank === 2)
      return "bg-slate-50 text-slate-800 font-bold border-l-4 border-slate-400";
    if (rank === 3)
      return "bg-amber-50 text-amber-800 font-semibold border-l-4 border-amber-300";
    return "";
  };

  const sortedHistory = useMemo(() => {
    if (!stats.history) return [];
    // Sort primarily by score (correct answers) DESC, secondarily by time ASC
    return [...stats.history]
      .sort((a, b) => {
        if (b.score !== a.score) {
          return b.score - a.score;
        }
        return a.time - b.time; // Faster time for the same score is better
      })
      .map((item, index) => ({
        rank: index + 1,
        score: item.score,
        time: item.time,
        difficulty: item.difficulty,
        date: format(new Date(item.created_at), "MMM dd, yyyy HH:mm"),
      }));
  }, [stats.history]);

  const finalScore =
    correctCount +
    (userAnswer &&
    currentQuestion &&
    parseInt(userAnswer, 10) === currentQuestion.answer
      ? 1
      : 0);
  const finalTime = totalTimeRef.current;

  // --- Main Render ---
  return (
    <Card className="w-full max-w-4xl mx-auto mt-10 shadow-2xl">
      {/* CONGRATULATIONS POP-UP DIALOG */}
      <Dialog
        open={gameState === "submitting" && isNewBest}
        onOpenChange={(open) => !open && setIsNewBest(false)}
      >
        <DialogContent className="sm:max-w-[425px] text-center">
          <DialogHeader>
            <Trophy className="w-16 h-16 text-yellow-500 mx-auto animate-bounce" />
            <DialogTitle className="text-3xl font-bold text-primary">
              NEW HIGH SCORE!
            </DialogTitle>
          </DialogHeader>
          <p className="text-lg">
            You set a new personal record of:
            <span className="font-extrabold text-2xl text-green-600 ml-2">
              {finalScore} Correct
            </span>
          </p>
          <div className="flex justify-center mt-4">
            <Button onClick={() => setIsNewBest(false)}>
              Continue to Save
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex flex-col">
          <CardTitle className="flex items-center gap-2">
            <PlusCircle className="w-6 h-6 text-primary" />
            Quick Addition Challenge
          </CardTitle>
          <CardDescription>
            Answer addition problems quickly to advance difficulty.
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
                Instructions: Additions Game
              </DialogTitle>
            </DialogHeader>
            <ol className="list-decimal list-inside space-y-2">
              <li>You are given {QUESTIONS_PER_LEVEL} questions per level.</li>
              <li>Answer each question and press 'Enter' or 'Submit'.</li>
              <li>
                A correct answer advances your **score** and keeps you on the
                same level.
              </li>
              <li>
                Upon answering {QUESTIONS_PER_LEVEL} correctly, the **difficulty
                level** increases.
              </li>
              <li>
                A single wrong answer or reaching the max level ends the game.
              </li>
              <li>Your score is the **total number of correct answers**.</li>
            </ol>
          </DialogContent>
        </Dialog>
      </CardHeader>

      <CardContent>
        {/* Game Stats Card */}
        <Card className="mb-6 p-4 bg-gray-50 dark:bg-gray-800/50">
          <div className="grid grid-cols-4 text-center divide-x divide-gray-300">
            <div>
              <Trophy className="w-5 h-5 mx-auto text-yellow-500" />
              <p className="text-xs font-semibold mt-1">Highest Score</p>
              <p className="text-lg font-bold">{stats.highest_correct}</p>
            </div>
            <div>
              <TrendingUp className="w-5 h-5 mx-auto text-green-500" />
              <p className="text-xs font-semibold mt-1">Avg. Score</p>
              <p className="text-lg font-bold">{stats.avg_correct}</p>
            </div>
            <div>
              <Clock className="w-5 h-5 mx-auto text-blue-500" />
              <p className="text-xs font-semibold mt-1">Time (Session)</p>
              <p className="text-lg font-bold">
                {formatTime(totalTimeRef.current)}
              </p>
            </div>
            <div>
              <Check className="w-5 h-5 mx-auto text-green-500" />
              <p className="text-xs font-semibold mt-1">Current Correct</p>
              <p className="text-lg font-bold">{correctCount}</p>
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            {/* Game Area */}
            <div
              className={`
                                h-40 w-full rounded-lg flex flex-col items-center justify-center transition-colors shadow-inner
                                ${
                                  gameState === "playing"
                                    ? "bg-white"
                                    : "bg-gray-100 text-gray-700"
                                }
                            `}
            >
              {gameState === "playing" && currentQuestion ? (
                <>
                  <p className="text-4xl font-extrabold text-indigo-600 font-mono tracking-widest">
                    {currentQuestion.text} = ?
                  </p>
                  <p className="text-sm mt-2 text-muted-foreground">
                    Level: {currentLevelConfig.level} / {MAX_LEVELS}
                  </p>
                </>
              ) : (
                <p className="text-2xl font-bold">
                  {gameState === "initial"
                    ? "Click Start to Begin"
                    : "Game Ended"}
                </p>
              )}
            </div>

            {/* Progress */}
            {gameState === "playing" && (
              <div className="mt-4 space-y-3">
                <div className="flex justify-between text-sm font-medium">
                  <span>Questions to Level Up:</span>
                  <span>
                    {correctCount % QUESTIONS_PER_LEVEL} / {QUESTIONS_PER_LEVEL}
                  </span>
                </div>
                <Progress
                  value={
                    ((correctCount % QUESTIONS_PER_LEVEL) /
                      QUESTIONS_PER_LEVEL) *
                    100
                  }
                  className="h-2"
                />
                <div className="flex justify-end text-xs text-muted-foreground">
                  Total Correct: {correctCount}
                </div>
              </div>
            )}

            {/* Input/Control Area */}
            <div className="mt-6">
              {gameState === "playing" && (
                <div className="flex gap-2">
                  <Input
                    type="number"
                    placeholder={`Enter your answer`}
                    value={userAnswer}
                    onChange={(e) => setUserAnswer(e.target.value)}
                    className="text-lg text-center font-mono"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === "Enter") checkAnswer();
                    }}
                  />
                  <Button onClick={checkAnswer}>
                    Submit <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              )}

              {/* Start/Play Again buttons */}
              {(gameState === "initial" || gameState === "finished") && (
                <div className="flex flex-col gap-2 mt-4">
                  <Button
                    onClick={startGame}
                    className="w-full text-lg py-6 bg-green-500 hover:bg-green-600"
                  >
                    {gameState === "finished" ? "Play Again" : "Start Game"}
                  </Button>
                  <Button
                    onClick={onGameEnd}
                    variant="outline"
                    className="w-full"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Back to Games List
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Leaderboard/History Card (Right Side) */}
          <Card className="lg:col-span-1 p-0">
            <CardHeader className="p-4 border-b">
              <CardTitle className="text-lg flex items-center gap-2">
                <ListOrdered className="w-5 h-5 text-primary" />
                My Leaderboard (Score)
              </CardTitle>
            </CardHeader>
            <ScrollArea className="h-96">
              <CardContent className="p-0">
                {sortedHistory.length === 0 ? (
                  <p className="p-4 text-center text-muted-foreground">
                    No history yet. Be the first to score!
                  </p>
                ) : (
                  <table className="w-full text-sm">
                    <thead className="sticky top-0 bg-background/90 backdrop-blur-sm border-b">
                      <tr className="text-left text-muted-foreground">
                        <th className="p-3">#</th>
                        <th className="p-3">Score</th>
                        <th className="p-3">Time</th>
                        <th className="p-3">Level</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sortedHistory.slice(0, 10).map((item, index) => (
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
                            {formatTime(item.time)}
                          </td>
                          <td className="p-3 text-xs text-muted-foreground">
                            Lvl {item.difficulty}
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

        {/* --- Post-Game Matrix Submission --- */}
        {gameState === "submitting" && (
          <div className="mt-8 pt-4 border-t border-gray-200">
            <h3 className="text-xl font-semibold mb-4 text-center">
              Game Over. Final Score: {finalScore} Correct in{" "}
              {formatTime(finalTime)}
            </h3>

            <h4 className="text-lg font-medium mb-3 text-center">
              Submit Mood Matrix
            </h4>
            <div className="space-y-4">
              {/* Matrix forms - Replace with your actual form fields */}
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

export default AdditionsGame;
