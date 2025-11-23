// soulcare_frontend/src/pages/Patient/PatientGames.tsx

import React, { useState, useCallback, useMemo } from "react";
import {
  Brain,
  Play,
  Trophy,
  Clock,
  Target,
  Zap,
  Heart,
  Eye,
  Gamepad2,
  Star,
  ArrowRight,
  Timer,
  Award,
  TrendingUp,
  RotateCw,
} from "lucide-react";

// --- Custom Component Imports ---
import ReactionTimeGame from "../../components/games/ReactionTimeGame";
import MemoryGame from "../../components/games/MemoryGame";
import StroopGame from "../../components/games/StroopGame";
import LongestNumberGame from "../../components/games/LongestNumberGame";
import NumpuzGame from "../../components/games/NumpuzGame";
import AdditionsGame from "@/components/games/AdditionsGame";

// --- Import Custom Hook and Types ---
import { useGameDashboardStats } from "@/hooks/useGameDashboardStats";
import { GameDashboardStats } from "@/types";

// FIX: Assuming this path is correct now
import { Skeleton } from "../../components/ui/skeleton";

// --- Local UI Component Definitions (Preserved) ---

const ProgressBar = ({ value, className = "" }) => (
  <div
    className={`w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 ${className}`}
  >
    <div
      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
      style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
    />
  </div>
);

const Badge = ({ children, variant = "default", className = "" }) => {
  const variants = {
    default: "bg-primary text-primary-foreground",
    secondary: "bg-secondary text-secondary-foreground",
    outline: "border border-input bg-background",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${variants[variant]} ${className}`}
    >
      {children}
    </span>
  );
};

const Button = ({
  children,
  variant = "default",
  size = "default",
  className = "",
  ...props
}) => {
  const variants = {
    default: "bg-primary text-primary-foreground hover:bg-primary/90",
    outline:
      "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
  };

  const sizes = {
    default: "h-10 px-4 py-2",
    lg: "h-11 rounded-md px-8",
  };

  return (
    <button
      className={`inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

const Card = ({ children, className = "" }) => (
  <div
    className={`rounded-lg border bg-card text-card-foreground shadow-sm ${className}`}
  >
    {children}
  </div>
);

const CardHeader = ({ children, className = "" }) => (
  <div className={`flex flex-col space-y-1.5 p-6 ${className}`}>{children}</div>
);

const CardTitle = ({ children, className = "" }) => (
  <h3
    className={`text-2xl font-semibold leading-none tracking-tight ${className}`}
  >
    {children}
  </h3>
);

const CardDescription = ({ children, className = "" }) => (
  <p className={`text-sm text-muted-foreground ${className}`}>{children}</p>
);

const CardContent = ({ children, className = "" }) => (
  <div className={`p-6 pt-0 ${className}`}>{children}</div>
);

// New Component: Skeleton Card for Loading State (Sleek and Professional)
const SkeletonCard = ({ count = 4 }: { count?: number }) => (
  <>
    {[...Array(count)].map((_, index) => (
      <Card key={index} className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-4 w-3/4 mb-2" />
            <Skeleton className="h-8 w-1/2" />
          </div>
          <Skeleton className="h-8 w-8 rounded-full" />
        </div>
      </Card>
    ))}
  </>
);

// New Component: Individual Game Card Skeleton
const GameCardSkeleton = () => (
  <Card className="p-6 h-full">
    <div className="flex items-start justify-between mb-4">
      <Skeleton className="h-8 w-8 rounded-lg" />
      <Skeleton className="h-5 w-16 rounded-full" />
    </div>
    <Skeleton className="h-5 w-2/3 mb-2" />
    <Skeleton className="h-3 w-full mb-4" />

    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
      </div>
      <div>
        <Skeleton className="h-3 w-1/3 mb-2" />
        <div className="flex gap-1">
          <Skeleton className="h-5 w-1/4" />
          <Skeleton className="h-5 w-1/4" />
        </div>
      </div>
      <Skeleton className="h-2 w-full" />
      <Skeleton className="h-10 w-full" />
    </div>
  </Card>
);

// --- MAIN COMPONENT ---

type GameName =
  | "reaction_time"
  | "color_pattern_memory"
  | "stroop_effect"
  | "emotion_recognition"
  | "numpuz_game"
  | "additions_game"
  | "visual_attention_tracker"
  | "pattern_recognition"
  | "mood_reflection_game"
  | "longest_number"
  | null;

const PatientGames: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [currentGame, setCurrentGame] = useState<GameName>(null);

  // --- REAL-TIME DATA FETCHING ---
  const { stats, isLoading, error, refetch } = useGameDashboardStats();

  // Define a type for the dynamic keys in GameDashboardStats.summary
  type SummaryKey = keyof GameDashboardStats["summary"];

  // Mock data for games (Now only providing metadata, scores will be dynamically injected)
  const initialGames = useMemo(
    () => [
      {
        id: "color_pattern_memory" as const,
        title: "Color Pattern Memory",
        description:
          "Test your working memory and attention span with colorful sequences",
        category: "memory",
        difficulty: "Medium",
        duration: "5 min",
        icon: Brain,
        gradient: "from-blue-500 to-purple-600",
        bgGradient:
          "from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20",
        detectionFocus: [
          "Working Memory",
          "Attention Span",
          "Processing Speed",
        ],
        scoreUnit: " Levels",
      },

      {
        id: "longest_number" as const,
        title: "Longest Number Recall",
        description:
          "Test your digital memory span by recalling increasingly long numbers.",
        category: "memory",
        difficulty: "Medium",
        duration: "5 min",
        icon: Brain,
        gradient: "from-teal-500 to-cyan-600",
        bgGradient:
          "from-teal-50 to-cyan-50 dark:from-teal-950/20 dark:to-cyan-950/20",
        detectionFocus: ["Working Memory", "Digital Span", "Short-Term Recall"],
        scoreUnit: " Digits",
      },

      {
        id: "numpuz_game" as const,
        title: "Numpuz Sliding Puzzle",
        description:
          "A classic 15-puzzle to test problem-solving and spatial reasoning.",
        category: "logic",
        difficulty: "Medium",
        duration: "10 min",
        icon: Target,
        gradient: "from-red-500 to-pink-600",
        bgGradient:
          "from-red-50 to-pink-50 dark:from-red-950/20 dark:to-pink-950/20",
        detectionFocus: [
          "Problem Solving",
          "Cognitive Flexibility",
          "Planning",
        ],
        scoreUnit: "s", // Best score is best time
      },

      {
        id: "additions_game" as const,
        title: "Quick Addition Challenge",
        description:
          "Fast-paced mental math to improve concentration and processing speed.",
        category: "speed",
        difficulty: "Easy",
        duration: "3 min",
        icon: Target,
        gradient: "from-orange-500 to-red-600",
        bgGradient:
          "from-orange-50 to-red-50 dark:from-orange-950/20 dark:to-red-950/20",
        detectionFocus: [
          "Processing Speed",
          "Working Memory",
          "Numerical Fluency",
        ],
        scoreUnit: " Correct",
      },

      // ... (rest of your games, kept for consistency)
      {
        id: "emotion_recognition" as const,
        title: "Emotion Recognition",
        description:
          "Identify emotions from facial expressions to assess social cognition",
        category: "emotion",
        difficulty: "Medium",
        duration: "8 min",
        icon: Heart,
        gradient: "from-rose-500 to-pink-600",
        bgGradient:
          "from-rose-50 to-pink-50 dark:from-rose-950/20 dark:to-rose-950/20",
        detectionFocus: ["Social Cognition", "Emotional Processing", "Empathy"],
        scoreUnit: "%",
      },
      {
        id: "reaction_time" as const,
        title: "Reaction Time Challenge",
        description:
          "Quick response game to measure cognitive processing speed",
        category: "speed",
        difficulty: "Easy",
        duration: "3 min",
        icon: Zap,
        gradient: "from-yellow-500 to-orange-600",
        bgGradient:
          "from-yellow-50 to-orange-50 dark:from-yellow-950/20 dark:to-orange-950/20",
        detectionFocus: ["Reaction Time", "Motor Speed", "Alertness"],
        scoreUnit: "ms", // Reaction time is in milliseconds
      },
      {
        id: "stroop_effect" as const,
        title: "Stroop Effect Test",
        description: "Measures selective attention and cognitive interference.",
        category: "attention",
        difficulty: "Medium",
        duration: "5 min",
        icon: Eye,
        gradient: "from-fuchsia-500 to-pink-600",
        bgGradient:
          "from-fuchsia-50 to-pink-50 dark:from-fuchsia-950/20 dark:to-pink-950/20",
        detectionFocus: [
          "Selective Attention",
          "Cognitive Interference",
          "Processing Speed",
        ],
        scoreUnit: "%",
      },
      {
        id: "visual_attention_tracker" as const,
        title: "Visual Attention Tracker",
        description:
          "Track moving objects to assess visual attention and focus",
        category: "attention",
        difficulty: "Hard",
        duration: "10 min",
        icon: Eye,
        gradient: "from-green-500 to-teal-600",
        bgGradient:
          "from-green-50 to-teal-50 dark:from-green-950/20 dark:to-teal-950/20",
        detectionFocus: [
          "Visual Attention",
          "Sustained Focus",
          "Concentration",
        ],
        scoreUnit: "%",
      },
      {
        id: "pattern_recognition" as const,
        title: "Pattern Recognition",
        description:
          "Identify complex patterns to evaluate cognitive flexibility",
        category: "logic",
        difficulty: "Medium",
        duration: "7 min",
        icon: Target,
        gradient: "from-indigo-500 to-blue-600",
        bgGradient:
          "from-indigo-50 to-blue-50 dark:from-indigo-950/20 dark:to-indigo-950/20",
        detectionFocus: [
          "Pattern Recognition",
          "Cognitive Flexibility",
          "Problem Solving",
        ],
        scoreUnit: "%",
      },
      {
        id: "mood_reflection_game" as const,
        title: "Mood Reflection Game",
        description:
          "Interactive scenarios to assess emotional regulation skills",
        category: "emotion",
        difficulty: "Medium",
        duration: "12 min",
        icon: Gamepad2,
        gradient: "from-purple-500 to-violet-600",
        bgGradient:
          "from-purple-50 to-violet-50 dark:from-purple-950/20 dark:to-violet-950/20",
        detectionFocus: [
          "Emotional Regulation",
          "Self-Awareness",
          "Coping Skills",
        ],
        scoreUnit: "%",
      },
    ],
    []
  );

  // Inject real data into the static game list
  // FIX: Moved getGameStats logic here to resolve 'react-hooks/exhaustive-deps' warning
  const gamesWithData = useMemo(() => {
    // Map frontend IDs to backend summary keys
    const summaryKeyMap: { [key in GameName & string]: SummaryKey } = {
      reaction_time: "reaction_time",
      color_pattern_memory: "memory_game",
      stroop_effect: "stroop_game",
      longest_number: "longest_number",
      numpuz_game: "numpuz_game",
      additions_game: "additions_game",
      emotion_recognition: "emotion_recognition",
      visual_attention_tracker: "visual_attention_tracker",
      pattern_recognition: "pattern_recognition",
      mood_reflection_game: "mood_reflection_game",
    };

    return initialGames.map((game) => {
      // Safely retrieve the summary object from the API response based on the game ID
      const summary = stats.summary[summaryKeyMap[game.id]];

      let completions = 0;
      let bestScore = 0;

      if (summary) {
        // FIX: Changed 'let completions' to 'const completions' (ESLint prefer-const)
        completions = summary.total_plays || 0;

        if (
          game.id === "reaction_time" &&
          (summary as GameDashboardStats["summary"]["reaction_time"])
            .best_time_ms
        ) {
          bestScore = (
            summary as GameDashboardStats["summary"]["reaction_time"]
          ).best_time_ms as number;
        } else if (
          game.id === "color_pattern_memory" &&
          (summary as GameDashboardStats["summary"]["memory_game"])
            .max_sequence_length
        ) {
          bestScore = (summary as GameDashboardStats["summary"]["memory_game"])
            .max_sequence_length as number;
        } else if (
          game.id === "stroop_effect" &&
          (summary as GameDashboardStats["summary"]["stroop_game"])
            .best_correct_percentage
        ) {
          bestScore = Math.round(
            (summary as GameDashboardStats["summary"]["stroop_game"])
              .best_correct_percentage as number
          );
        } else if (
          game.id === "longest_number" &&
          (summary as GameDashboardStats["summary"]["longest_number"])
            .max_number_length
        ) {
          bestScore = (
            summary as GameDashboardStats["summary"]["longest_number"]
          ).max_number_length as number;
        } else if (
          game.id === "numpuz_game" &&
          (summary as GameDashboardStats["summary"]["numpuz_game"]).best_time_s
        ) {
          bestScore = Math.round(
            (summary as GameDashboardStats["summary"]["numpuz_game"])
              .best_time_s as number
          );
        } else if (
          game.id === "additions_game" &&
          (summary as GameDashboardStats["summary"]["additions_game"])
            .highest_correct
        ) {
          bestScore = (
            summary as GameDashboardStats["summary"]["additions_game"]
          ).highest_correct as number;
        }
      }

      // If completions is 0, bestScore should be 0 (handled by initialization)

      return {
        ...game,
        completions: completions,
        bestScore: bestScore,
      };
    });
  }, [initialGames, stats]);

  const categories = [
    { id: "all", name: "All Games", icon: Gamepad2 },
    { id: "memory", name: "Memory", icon: Brain },
    { id: "emotion", name: "Emotion", icon: Heart },
    { id: "attention", name: "Attention", icon: Eye },
    { id: "speed", name: "Speed", icon: Zap },
    { id: "logic", name: "Logic", icon: Target },
  ];

  const filteredGames =
    selectedCategory === "all"
      ? gamesWithData
      : gamesWithData.filter((game) => game.category === selectedCategory);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case "easy":
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300";
      case "medium":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300";
      case "hard":
        return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300";
    }
  };

  // --- Conditional Game Rendering Logic (Kept as is) ---

  const handleGameEnd = useCallback(() => {
    setCurrentGame(null); // Return to the dashboard view
    refetch(); // Refetch stats to update dashboard immediately after a game
  }, [refetch]);

  if (currentGame === "reaction_time") {
    return <ReactionTimeGame onGameEnd={handleGameEnd} />;
  }

  if (currentGame === "color_pattern_memory") {
    return <MemoryGame onGameEnd={handleGameEnd} />;
  }

  if (currentGame === "stroop_effect") {
    return <StroopGame onGameEnd={handleGameEnd} />;
  }

  if (currentGame === "longest_number") {
    return <LongestNumberGame onGameEnd={handleGameEnd} />;
  }

  if (currentGame === "numpuz_game") {
    return <NumpuzGame onGameEnd={handleGameEnd} />;
  }

  if (currentGame === "additions_game") {
    return <AdditionsGame onGameEnd={handleGameEnd} />;
  }

  // --- Dashboard Rendering (Default) ---
  return (
    <div className="p-6 min-h-screen bg-background">
      {/* Header Section with Loading/Error Info */}
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Mental Health Detection Games 🧠
          </h1>
          <Button
            variant="outline"
            size="sm"
            onClick={refetch}
            disabled={isLoading}
            className="flex items-center gap-1"
          >
            <RotateCw
              className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`}
            />
            {isLoading ? "Loading..." : "Refresh Data"}
          </Button>
        </div>
        <p className="text-muted-foreground">
          Play engaging games designed to assess and monitor your cognitive and
          emotional well-being
        </p>
        {error && (
          <div className="mt-4 p-3 bg-red-100 dark:bg-red-900/20 border border-red-300 rounded-md text-red-700 dark:text-red-300">
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}
      </div>

      {/* Stats Overview - NOW USING REAL DATA */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {isLoading ? (
          <SkeletonCard count={4} />
        ) : (
          <>
            <Card className="transform hover:scale-105 transition-transform duration-200 border-l-4 border-primary">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Total Games Played
                    </p>
                    <p className="text-2xl font-bold text-foreground">
                      {stats.total_games_played}
                    </p>
                  </div>
                  <Gamepad2 className="w-8 h-8 text-primary" />
                </div>
              </CardContent>
            </Card>
            <Card className="transform hover:scale-105 transition-transform duration-200 border-l-4 border-yellow-500">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Avg. Success Rate
                    </p>
                    <p className="text-2xl font-bold text-foreground">
                      {stats.average_success_rate.toFixed(1)}%
                    </p>
                  </div>
                  <Trophy className="w-8 h-8 text-yellow-500" />
                </div>
              </CardContent>
            </Card>
            <Card className="transform hover:scale-105 transition-transform duration-200 border-l-4 border-blue-500">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Time Played
                    </p>
                    <p className="text-2xl font-bold text-foreground">
                      {stats.total_time_spent_h.toFixed(1)}h
                    </p>
                  </div>
                  <Clock className="w-8 h-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>
            <Card className="transform hover:scale-105 transition-transform duration-200 border-l-4 border-purple-500">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Achievements Unlocked
                    </p>
                    <p className="text-2xl font-bold text-foreground">
                      {/* Placeholder for achievements until implemented */}
                      {12}
                    </p>
                  </div>
                  <Award className="w-8 h-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Category Filter (Kept as is) */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Game Categories</CardTitle>
          <CardDescription>
            Choose a category to explore specific cognitive and emotional
            assessments
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => {
              const Icon = category.icon;
              return (
                <Button
                  key={category.id}
                  variant={
                    selectedCategory === category.id ? "default" : "outline"
                  }
                  onClick={() => setSelectedCategory(category.id)}
                  className="flex items-center gap-2"
                >
                  <Icon className="w-4 h-4" />
                  {category.name}
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Games Grid - DYNAMICALLY RENDERED */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {isLoading ? (
          // Display game card skeletons while loading
          <>
            <GameCardSkeleton />
            <GameCardSkeleton />
            <GameCardSkeleton />
            <GameCardSkeleton />
            <GameCardSkeleton />
            <GameCardSkeleton />
          </>
        ) : filteredGames.length === 0 ? (
          // Display if no games match the filter
          <Card className="md:col-span-3 p-10 text-center">
            <CardTitle>No Games Found</CardTitle>
            <CardDescription>
              Try selecting a different category or check back later!
            </CardDescription>
          </Card>
        ) : (
          filteredGames.map((game) => {
            const Icon = game.icon;
            // Determine completion percentage for progress bar
            const maxPlaysForProgressBar = 15; // Set an arbitrary max for the progress bar
            const progressValue = Math.min(
              100,
              (game.completions / maxPlaysForProgressBar) * 100
            );

            return (
              <Card
                key={game.id}
                className={`transform hover:scale-105 transition-transform duration-200 bg-gradient-to-br ${game.bgGradient} border-primary/20 relative overflow-hidden group`}
              >
                {/* Background decoration */}
                <div className="absolute top-0 right-0 w-32 h-32 opacity-10">
                  <Icon className="w-full h-full text-primary" />
                </div>

                <CardHeader className="relative">
                  <div className="flex items-start justify-between mb-2">
                    <div
                      className={`p-2 rounded-lg bg-gradient-to-r ${game.gradient} text-white`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <Badge className={getDifficultyColor(game.difficulty)}>
                      {game.difficulty}
                    </Badge>
                  </div>
                  <CardTitle className="text-lg">{game.title}</CardTitle>
                  <CardDescription className="text-sm">
                    {game.description}
                  </CardDescription>
                </CardHeader>

                <CardContent className="relative">
                  <div className="space-y-4">
                    {/* Game Stats - NOW DYNAMIC */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center gap-2">
                        <Timer className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">
                          {game.duration}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-muted-foreground" />
                        <span className="text-base font-semibold text-foreground">
                          {/* Best score from real data, with its unit */}
                          {game.bestScore === 0 ? "--" : game.bestScore}
                          {game.scoreUnit}
                        </span>
                      </div>
                    </div>

                    {/* Detection Focus (Kept as is) */}
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-2">
                        Detection Focus:
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {game.detectionFocus.slice(0, 2).map((focus, index) => (
                          <Badge
                            key={index}
                            variant="secondary"
                            className="text-xs"
                          >
                            {focus}
                          </Badge>
                        ))}
                        {game.detectionFocus.length > 2 && (
                          <Badge variant="secondary" className="text-xs">
                            +{game.detectionFocus.length - 2}
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Progress - NOW DYNAMIC */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-muted-foreground">
                          Played {game.completions} times
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {progressValue.toFixed(0)}%
                        </span>
                      </div>
                      <ProgressBar value={progressValue} className="h-2" />
                    </div>

                    {/* Play Button - Use setCurrentGame to launch the game component */}
                    <Button
                      className="w-full group-hover:scale-105 transition-transform"
                      onClick={() => setCurrentGame(game.id as GameName)}
                    >
                      <Play className="w-4 h-4 mr-2" />
                      Play Game
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Weekly Challenge (Kept as is) */}
      <Card className="bg-gradient-to-r from-primary/10 via-purple-500/10 to-pink-500/10 border-primary/20">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Star className="w-6 h-6 text-primary" />
            <CardTitle>Weekly Challenge</CardTitle>
          </div>
          <CardDescription>
            Complete this week's special assessment to unlock insights about
            your cognitive patterns
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-lg mb-1">
                Cognitive Flexibility Assessment
              </h3>
              <p className="text-sm text-muted-foreground mb-2">
                A comprehensive 15-minute evaluation combining multiple
                cognitive domains
              </p>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  15 min
                </span>
                <span className="flex items-center gap-1">
                  <Trophy className="w-4 h-4" />
                  50 XP Reward
                </span>
              </div>
            </div>
            <Button
              size="lg"
              className="bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90"
            >
              <Play className="w-4 h-4 mr-2" />
              Start Challenge
            </Button>
          </div>
          <div className="mt-4">
            <div className="flex items-center justify-between text-sm mb-2">
              <span>Progress this week</span>
              <span>3/5 challenges completed</span>
            </div>
            <ProgressBar value={60} className="h-2" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PatientGames;
