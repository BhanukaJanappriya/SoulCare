import React, { useState, useCallback } from "react";
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
} from "lucide-react";

// --- Custom Component Imports (Assume these are available locally or correctly imported) ---
// Note: These must be imported from their respective file locations.
import ReactionTimeGame from "../../components/games/ReactionTimeGame";
import MemoryGame from "../../components/games/MemoryGame";
import StroopGame from "../../components/games/StroopGame";
import LongestNumberGame from "../../components/games/LongestNumberGame";
import NumpuzGame from "../../components/games/NumpuzGame";
import AdditionsGame from "@/components/games/AdditionsGame";
// --- Local UI Component Definitions (Kept from your original file for rendering accuracy) ---

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

// --- MAIN COMPONENT ---

// Define possible games based on the ID we used in the URL paths
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
  const [currentGame, setCurrentGame] = useState<GameName>(null); // State to control which game is visible

  // Mock data for games (Updated with correct IDs and the new Stroop Game)
  const games = [
    {
      id: "color_pattern_memory" as const, // <-- Updated ID for Memory Game
      title: "Color Pattern Memory",
      description:
        "Test your working memory and attention span with colorful sequences",
      category: "memory",
      difficulty: "Easy",
      duration: "5 min",
      completions: 12,
      bestScore: 85,
      icon: Brain,
      gradient: "from-blue-500 to-purple-600",
      bgGradient:
        "from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20",
      detectionFocus: ["Working Memory", "Attention Span", "Processing Speed"],
    },

    {
      id: "longest_number" as const, // The new ID
      title: "Longest Number Recall",
      description:
        "Test your digital memory span by recalling increasingly long numbers.",
      category: "memory", // Matches the Longest Number Game focus
      difficulty: "Medium",
      duration: "5 min",
      completions: 0,
      bestScore: 0,
      icon: Brain, // Same icon as Memory game or another suitable one
      gradient: "from-teal-500 to-cyan-600",
      bgGradient:
        "from-teal-50 to-cyan-50 dark:from-teal-950/20 dark:to-cyan-950/20",
      detectionFocus: ["Working Memory", "Digital Span", "Short-Term Recall"],
    },

    {
      id: "numpuz_game" as const, // <-- ID MUST MATCH
      title: "Numpuz Sliding Puzzle",
      description:
        "A classic 15-puzzle to test problem-solving and spatial reasoning.",
      category: "logic",
      difficulty: "Medium",
      duration: "10 min",
      completions: 5,
      bestScore: 120,
      icon: Target,
      gradient: "from-red-500 to-pink-600",
      bgGradient:
        "from-red-50 to-pink-50 dark:from-red-950/20 dark:to-pink-950/20",
      detectionFocus: ["Problem Solving", "Cognitive Flexibility", "Planning"],
    },

    {
      id: "additions_game" as const,
      title: "Quick Addition Challenge",
      description:
        "Fast-paced mental math to improve concentration and processing speed.",
      category: "speed",
      difficulty: "Easy",
      duration: "3 min",
      completions: 15,
      bestScore: 95, // Example: highest score is % correct
      icon: Target, // Or a Plus icon if you have one imported
      gradient: "from-orange-500 to-red-600",
      bgGradient:
        "from-orange-50 to-red-50 dark:from-orange-950/20 dark:to-red-950/20",
      detectionFocus: [
        "Processing Speed",
        "Working Memory",
        "Numerical Fluency",
      ],
    },

    {
      id: "emotion_recognition" as const,
      title: "Emotion Recognition",
      description:
        "Identify emotions from facial expressions to assess social cognition",
      category: "emotion",
      difficulty: "Medium",
      duration: "8 min",
      completions: 8,
      bestScore: 78,
      icon: Heart,
      gradient: "from-rose-500 to-pink-600",
      bgGradient:
        "from-rose-50 to-pink-50 dark:from-rose-950/20 dark:to-pink-950/20",
      detectionFocus: ["Social Cognition", "Emotional Processing", "Empathy"],
    },
    {
      id: "reaction_time" as const, // <-- Updated ID for Reaction Time Game
      title: "Reaction Time Challenge",
      description: "Quick response game to measure cognitive processing speed",
      category: "speed",
      difficulty: "Easy",
      duration: "3 min",
      completions: 15,
      bestScore: 92,
      icon: Zap,
      gradient: "from-yellow-500 to-orange-600",
      bgGradient:
        "from-yellow-50 to-orange-50 dark:from-yellow-950/20 dark:to-orange-950/20",
      detectionFocus: ["Reaction Time", "Motor Speed", "Alertness"],
    },
    {
      id: "stroop_effect" as const, // <-- NEW Stroop Effect Test
      title: "Stroop Effect Test",
      description: "Measures selective attention and cognitive interference.",
      category: "attention",
      difficulty: "Medium",
      duration: "5 min",
      completions: 1,
      bestScore: 75,
      icon: Eye,
      gradient: "from-fuchsia-500 to-pink-600",
      bgGradient:
        "from-fuchsia-50 to-pink-50 dark:from-fuchsia-950/20 dark:to-pink-950/20",
      detectionFocus: [
        "Selective Attention",
        "Cognitive Interference",
        "Processing Speed",
      ],
    },
    {
      id: "visual_attention_tracker" as const,
      title: "Visual Attention Tracker",
      description: "Track moving objects to assess visual attention and focus",
      category: "attention",
      difficulty: "Hard",
      duration: "10 min",
      completions: 6,
      bestScore: 71,
      icon: Eye,
      gradient: "from-green-500 to-teal-600",
      bgGradient:
        "from-green-50 to-teal-50 dark:from-green-950/20 dark:to-teal-950/20",
      detectionFocus: ["Visual Attention", "Sustained Focus", "Concentration"],
    },
    {
      id: "pattern_recognition" as const,
      title: "Pattern Recognition",
      description:
        "Identify complex patterns to evaluate cognitive flexibility",
      category: "logic",
      difficulty: "Medium",
      duration: "7 min",
      completions: 10,
      bestScore: 89,
      icon: Target,
      gradient: "from-indigo-500 to-blue-600",
      bgGradient:
        "from-indigo-50 to-blue-50 dark:from-indigo-950/20 dark:to-blue-950/20",
      detectionFocus: [
        "Pattern Recognition",
        "Cognitive Flexibility",
        "Problem Solving",
      ],
    },
    {
      id: "mood_reflection_game" as const,
      title: "Mood Reflection Game",
      description:
        "Interactive scenarios to assess emotional regulation skills",
      category: "emotion",
      difficulty: "Medium",
      duration: "12 min",
      completions: 7,
      bestScore: 76,
      icon: Gamepad2,
      gradient: "from-purple-500 to-violet-600",
      bgGradient:
        "from-purple-50 to-violet-50 dark:from-purple-950/20 dark:to-violet-950/20",
      detectionFocus: [
        "Emotional Regulation",
        "Self-Awareness",
        "Coping Skills",
      ],
    },
  ];

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
      ? games
      : games.filter((game) => game.category === selectedCategory);

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

  // --- Conditional Game Rendering Logic ---

  const handleGameEnd = useCallback(() => {
    setCurrentGame(null); // Return to the dashboard view
  }, []);

  // 1. Reaction Time Game
  if (currentGame === "reaction_time") {
    return <ReactionTimeGame onGameEnd={handleGameEnd} />;
  }

  // 2. Color Pattern Memory Game
  if (currentGame === "color_pattern_memory") {
    return <MemoryGame onGameEnd={handleGameEnd} />;
  }

  // 3. Stroop Effect Test
  if (currentGame === "stroop_effect") {
    return <StroopGame onGameEnd={handleGameEnd} />;
  }

  if (currentGame === "longest_number") {
    return <LongestNumberGame onGameEnd={handleGameEnd} />; // The component we will create next
  }

  if (currentGame === "numpuz_game") {
    return <NumpuzGame onGameEnd={handleGameEnd} />;
  }

  if (currentGame === "additions_game") {
    // This component must be imported at the top
    return <AdditionsGame onGameEnd={handleGameEnd} />;
  }
  // --- Dashboard Rendering (Default) ---
  return (
    <div className="p-6 min-h-screen bg-background">
      {/* Header Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Mental Health Detection Games 🧠
        </h1>
        <p className="text-muted-foreground">
          Play engaging games designed to assess and monitor your cognitive and
          emotional well-being
        </p>
      </div>

      {/* Stats Overview (Uses your original stat cards) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {/* ... (Your original Stat Cards JSX) ... */}
        <Card className="transform hover:scale-105 transition-transform duration-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Games Played
                </p>
                <p className="text-2xl font-bold text-foreground">58</p>
              </div>
              <Gamepad2 className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card className="transform hover:scale-105 transition-transform duration-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Average Score
                </p>
                <p className="text-2xl font-bold text-foreground">82%</p>
              </div>
              <Trophy className="w-8 h-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="transform hover:scale-105 transition-transform duration-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Time Played
                </p>
                <p className="text-2xl font-bold text-foreground">4.2h</p>
              </div>
              <Clock className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="transform hover:scale-105 transition-transform duration-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Achievements
                </p>
                <p className="text-2xl font-bold text-foreground">12</p>
              </div>
              <Award className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Category Filter */}
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

      {/* Games Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {filteredGames.map((game) => {
          const Icon = game.icon;
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
                  {/* Game Stats */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-2">
                      <Timer className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        {game.duration}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        {game.bestScore}%
                      </span>
                    </div>
                  </div>

                  {/* Detection Focus */}
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

                  {/* Progress */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-muted-foreground">
                        Played {game.completions} times
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {Math.min(100, (game.completions / 15) * 100)}%
                      </span>
                    </div>
                    <ProgressBar
                      value={Math.min(100, (game.completions / 15) * 100)}
                      className="h-2"
                    />
                  </div>

                  {/* Play Button - Use setCurrentGame to launch the game component */}
                  <Button
                    className="w-full group-hover:scale-105 transition-transform"
                    // Cast 'id' to GameName to resolve potential TS type issues
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
        })}
      </div>

      {/* Weekly Challenge */}
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
