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
import { Separator } from "../../components/ui/separator";
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../components/ui/dialog";
import { ScrollArea } from "../../components/ui/scroll-area";
import { useToast } from "../../components/ui/use-toast";
import { format } from "date-fns";
import { NumpuzPayload, NumpuzGameStats } from "../../types";
import { saveNumpuzResult, fetchNumpuzStats } from "../../api";

// --- CONFIG ---
const PUZZLE_SIZE = 3; // N x N grid (e.g., 3x3 = 8 puzzle)
const WINNING_TILE_ORDER = [1, 2, 3, 4, 5, 6, 7, 8, 0]; // 0 is the empty tile
// --- State Definitions ---
type GameState = "initial" | "playing" | "finished";

// Data structure for the matrix part of the payload
type MatrixData = Omit<
  NumpuzPayload,
  "time_taken_s" | "puzzle_size" | "moves_made"
>;

interface NumpuzGameProps {
  onGameEnd: () => void;
}

// --- Helper Functions ---

// Fisher-Yates (Knuth) Shuffle for tiles
const shuffleArray = (array: number[]): number[] => {
  let currentIndex = array.length,
    randomIndex;

  while (currentIndex !== 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex],
      array[currentIndex],
    ];
  }
  return array;
};

// Check if a 1D array is solvable (Only necessary for even-sized grids, but good practice)
// For 3x3, the number of inversions must be even.
const isSolvable = (tiles: number[]): boolean => {
  let inversions = 0;
  const size = tiles.length;
  for (let i = 0; i < size; i++) {
    for (let j = i + 1; j < size; j++) {
      if (tiles[i] !== 0 && tiles[j] !== 0 && tiles[i] > tiles[j]) {
        inversions++;
      }
    }
  }
  // For odd N (like 3x3), solvable if inversions is even
  return inversions % 2 === 0;
};

const getInitialTiles = (): number[] => {
  let tiles;
  do {
    tiles = shuffleArray([...WINNING_TILE_ORDER]);
  } while (
    !isSolvable(tiles) ||
    tiles.every((val, i) => val === WINNING_TILE_ORDER[i])
  );
  return tiles;
};

// --- Initial State for Stats ---
const initialStats: NumpuzGameStats = {
  best_time_s: 0,
  min_moves: 0,
  total_plays: 0,
  history: [],
};

const NumpuzGame: React.FC<NumpuzGameProps> = ({ onGameEnd }) => {
  const { toast } = useToast();

  // --- Game State ---
  const [gameState, setGameState] = useState<GameState>("initial");
  const [tiles, setTiles] = useState<number[]>(WINNING_TILE_ORDER); // Current tile positions
  const [moves, setMoves] = useState(0);
  const [stats, setStats] = useState<NumpuzGameStats>(initialStats);
  const [isBestScore, setIsBestScore] = useState(false); // Flag for best score pop-up
  const [isSaving, setIsSaving] = useState(false);

  // --- Time State ---
  const [timeElapsed, setTimeElapsed] = useState(0); // Time in seconds
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef(0);

  // Initialize matrix data with default neutral values
  const [matrixData, setMatrixData] = useState<MatrixData>({
    post_game_mood: 3,
    perceived_effort: 5,
    stress_reduction_rating: 5,
  });

  // --- Core Logic ---

  const checkWin = useCallback((currentTiles: number[]): boolean => {
    return currentTiles.every((val, i) => val === WINNING_TILE_ORDER[i]);
  }, []);

  const handleMove = useCallback(
    (tileIndex: number) => {
      if (gameState !== "playing") return;

      const emptyIndex = tiles.indexOf(0);
      const tileValue = tiles[tileIndex];

      // Helper to convert 1D index to 2D coordinates
      const toCoords = (i: number) => ({
        row: Math.floor(i / PUZZLE_SIZE),
        col: i % PUZZLE_SIZE,
      });

      const tile = toCoords(tileIndex);
      const empty = toCoords(emptyIndex);

      // Check if the tile is adjacent to the empty spot
      const isAdjacent =
        (Math.abs(tile.row - empty.row) === 1 && tile.col === empty.col) ||
        (Math.abs(tile.col - empty.col) === 1 && tile.row === empty.row);

      if (isAdjacent) {
        const newTiles = [...tiles];
        [newTiles[tileIndex], newTiles[emptyIndex]] = [
          newTiles[emptyIndex],
          newTiles[tileIndex],
        ];

        setTiles(newTiles);
        setMoves((prev) => prev + 1);

        // Check for win immediately after the move
        if (checkWin(newTiles)) {
          stopTimer();
          setGameState("finished");
          const finalTime = Math.round(
            (performance.now() - startTimeRef.current) / 1000
          );
          setTimeElapsed(finalTime);

          // Check for best score (Minimum Moves)
          if (moves + 1 < stats.min_moves || stats.min_moves === 0) {
            setIsBestScore(true);
          }

          toast({
            title: "Puzzle Solved!",
            description: `Solved in ${finalTime} seconds with ${
              moves + 1
            } moves.`,
            variant: "default",
          });
        }
      }
    },
    [gameState, tiles, moves, checkWin, stats.min_moves, toast]
  );

  const startGame = useCallback(() => {
    setTiles(getInitialTiles());
    setMoves(0);
    setTimeElapsed(0);
    setIsBestScore(false);
    setGameState("playing");
    startTimer();
  }, []);

  // --- Timer Logic ---
  const startTimer = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    startTimeRef.current = performance.now();
    intervalRef.current = setInterval(() => {
      setTimeElapsed(
        Math.round((performance.now() - startTimeRef.current) / 1000)
      );
    }, 1000);
  };

  const stopTimer = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = null;
  };

  useEffect(() => {
    return () => stopTimer();
  }, []);

  // --- Data Fetching ---
  const fetchStats = useCallback(async () => {
    try {
      const fetchedStats = await fetchNumpuzStats();
      setStats(fetchedStats);
    } catch (e) {
      console.error("Failed to fetch Numpuz stats:", e);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  // --- Save Result Logic ---
  const saveResult = async () => {
    if (gameState !== "finished") return;

    setIsSaving(true);
    const payload: NumpuzPayload = {
      time_taken_s: timeElapsed,
      puzzle_size: `${PUZZLE_SIZE}x${PUZZLE_SIZE}`,
      moves_made: moves,
      ...matrixData,
    };

    try {
      await saveNumpuzResult(payload);
      toast({
        title: "Success!",
        description: "Game result and matrix saved successfully.",
      });
      await fetchStats();
      setGameState("initial");
      onGameEnd();
    } catch (err) {
      toast({
        title: "Save Failed",
        description: "Failed to save result. See console.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  // --- UI Render Helpers ---
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
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

  // Function to prepare history data for display (sorted by best moves/time)
  const sortedHistory = useMemo(() => {
    if (!stats.history) return [];
    // Sort primarily by time_taken_s ASC, secondarily by moves_made ASC
    return [...stats.history]
      .sort((a, b) => {
        if (a.time_taken_s !== b.time_taken_s) {
          return a.time_taken_s - b.time_taken_s; // Faster time first
        }
        return a.score - b.score; // Fewer moves (score) first
      })
      .map((item, index) => ({
        rank: index + 1,
        time: item.time_taken_s,
        moves: item.score,
        size: item.puzzle_size,
        date: format(new Date(item.created_at), "MMM dd, yyyy HH:mm"),
      }));
  }, [stats.history]);

  // --- Main Render ---
  return (
    <Card className="w-full max-w-4xl mx-auto mt-10 shadow-2xl">
      {/* CONGRATULATIONS POP-UP DIALOG (Best Moves/Time) */}
      <Dialog
        open={gameState === "finished" && isBestScore}
        onOpenChange={(open) => !open && setIsBestScore(false)}
      >
        <DialogContent className="sm:max-w-[425px] text-center">
          <DialogHeader>
            <Trophy className="w-16 h-16 text-yellow-500 mx-auto animate-bounce" />
            <DialogTitle className="text-3xl font-bold text-primary">
              NEW BEST SCORE!
            </DialogTitle>
          </DialogHeader>
          <p className="text-lg">
            You solved the puzzle in a new record!
            <div className="mt-2">
              <span className="font-extrabold text-xl text-green-600">
                {moves} Moves
              </span>
              <span className="text-gray-500"> / </span>
              <span className="font-extrabold text-xl text-green-600">
                {timeElapsed} Seconds
              </span>
            </div>
          </p>
          <div className="flex justify-center mt-4">
            <Button onClick={() => setIsBestScore(false)}>
              Check Leaderboard
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex flex-col">
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-6 h-6 text-primary" />
            Numpuz (Sliding Puzzle)
          </CardTitle>
          <CardDescription>
            Solve the {PUZZLE_SIZE}x{PUZZLE_SIZE} grid. Test your
            problem-solving and focus.
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
                Instructions: Numpuz
              </DialogTitle>
            </DialogHeader>
            <ol className="list-decimal list-inside space-y-2">
              <li>
                The goal is to reorder the tiles to the final sequence (1-8,
                with 0 at the end).
              </li>
              <li>
                Click on any tile adjacent (up, down, left, right) to the empty
                spot (0) to move it.
              </li>
              <li>The timer starts once you click 'Start Game'.</li>
              <li>
                Your score is based on **time taken** and **total moves**.
              </li>
            </ol>
          </DialogContent>
        </Dialog>
      </CardHeader>

      <CardContent>
        {/* Game Stats Card */}
        <Card className="mb-6 p-4 bg-gray-50 dark:bg-gray-800/50">
          <div className="grid grid-cols-4 text-center divide-x divide-gray-300">
            <div>
              <Clock className="w-5 h-5 mx-auto text-blue-500" />
              <p className="text-xs font-semibold mt-1">Best Time</p>
              <p className="text-lg font-bold">
                {formatTime(stats.best_time_s)}
              </p>
            </div>
            <div>
              <Trophy className="w-5 h-5 mx-auto text-yellow-500" />
              <p className="text-xs font-semibold mt-1">Min Moves</p>
              <p className="text-lg font-bold">{stats.min_moves}</p>
            </div>
            <div>
              <TrendingUp className="w-5 h-5 mx-auto text-green-500" />
              <p className="text-xs font-semibold mt-1">Current Moves</p>
              <p className="text-lg font-bold">{moves}</p>
            </div>
            <div>
              <Clock className="w-5 h-5 mx-auto text-blue-500" />
              <p className="text-xs font-semibold mt-1">Time Elapsed</p>
              <p className="text-lg font-bold text-red-600">
                {formatTime(timeElapsed)}
              </p>
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            {/* Game Board */}
            <div
              className="w-full aspect-square mx-auto p-2 rounded-lg bg-gray-100 shadow-inner"
              style={{ maxWidth: "400px" }}
            >
              <div
                className="grid gap-2"
                style={{
                  gridTemplateColumns: `repeat(${PUZZLE_SIZE}, 1fr)`,
                }}
              >
                {tiles.map((tile, index) => (
                  <div
                    key={index}
                    onClick={() => handleMove(index)}
                    className={`
                                            aspect-square rounded-lg flex items-center justify-center text-2xl font-bold transition-transform duration-150 ease-in-out
                                            ${
                                              tile === 0
                                                ? "bg-transparent text-transparent cursor-default"
                                                : gameState === "playing"
                                                ? "bg-primary text-primary-foreground shadow-md hover:bg-primary/90 cursor-pointer active:scale-95"
                                                : "bg-primary/50 text-primary-foreground/50 cursor-not-allowed"
                                            }
                                        `}
                  >
                    {tile !== 0 ? tile : ""}
                  </div>
                ))}
              </div>
            </div>

            {/* Control Buttons */}
            <div className="flex flex-col gap-2 mt-6">
              {(gameState === "initial" || gameState === "finished") && (
                <Button
                  onClick={startGame}
                  className="w-full text-lg py-6 bg-green-500 hover:bg-green-600"
                >
                  {gameState === "finished" ? "Play Again" : "Start Game (3x3)"}
                </Button>
              )}
              <Button onClick={onGameEnd} variant="outline" className="w-full">
                <X className="w-4 h-4 mr-2" />
                Back to Games List
              </Button>
            </div>
          </div>

          {/* Leaderboard/History Card (Right Side) */}
          <Card className="lg:col-span-1 p-0">
            <CardHeader className="p-4 border-b">
              <CardTitle className="text-lg flex items-center gap-2">
                <ListOrdered className="w-5 h-5 text-primary" />
                Best Times (3x3)
              </CardTitle>
            </CardHeader>
            <ScrollArea className="h-96">
              <CardContent className="p-0">
                {sortedHistory.length === 0 ? (
                  <p className="p-4 text-center text-muted-foreground">
                    No history yet. Be the first to solve!
                  </p>
                ) : (
                  <table className="w-full text-sm">
                    <thead className="sticky top-0 bg-background/90 backdrop-blur-sm border-b">
                      <tr className="text-left text-muted-foreground">
                        <th className="p-3">#</th>
                        <th className="p-3">Time</th>
                        <th className="p-3">Moves</th>
                        <th className="p-3">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sortedHistory.map((item, index) => (
                        <tr
                          key={index}
                          className={`border-b last:border-b-0 transition-colors ${getRankClass(
                            item.rank
                          )}`}
                        >
                          <td className="p-3 font-bold">{item.rank}</td>
                          <td className="p-3 text-lg font-bold text-green-600">
                            {formatTime(item.time)}
                          </td>
                          <td className="p-3 text-sm">{item.moves}</td>
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

        {/* --- Post-Game Matrix Submission --- */}
        {gameState === "finished" && (
          <div className="mt-8 pt-4 border-t border-gray-200">
            <h3 className="text-xl font-semibold mb-4 text-center">
              Solved! Time: {formatTime(timeElapsed)} / Moves: {moves}
            </h3>

            <h4 className="text-lg font-medium mb-3 text-center">
              Submit Mood Matrix
            </h4>
            <div className="space-y-4">
              {/* Matrix forms */}
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

export default NumpuzGame;
