import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Brain, Play, Pause, RotateCcw, Volume2 } from "lucide-react";

// Duration options in seconds
const DURATION_OPTIONS = [
  { label: "5 min", value: 5 * 60 },
  { label: "10 min", value: 10 * 60 },
  { label: "15 min", value: 15 * 60 },
  { label: "30 min", value: 30 * 60 },
];

interface MeditationTimerCardProps {
  totalSessionsLogged: number;
  onSessionComplete: (durationMinutes: number) => void;
}

/**
 * Custom hook to handle the timer logic (Start, Pause, Reset, Tick)
 */
const useTimer = (
  initialDurationSeconds: number,
  onSessionComplete: (durationMinutes: number) => void
) => {
  const [duration, setDuration] = useState(initialDurationSeconds);
  const [secondsLeft, setSecondsLeft] = useState(initialDurationSeconds);
  const [isRunning, setIsRunning] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    let interval: number | undefined;

    if (isRunning && secondsLeft > 0) {
      interval = window.setInterval(() => {
        setSecondsLeft((prev) => prev - 1);
      }, 1000);
    } else if (secondsLeft === 0 && isRunning) {
      setIsRunning(false);
      setIsCompleted(true);
      onSessionComplete(duration / 60);

      if ("vibrate" in navigator) {
        navigator.vibrate([200, 100, 200]);
      }
    }

    return () => window.clearInterval(interval);
  }, [isRunning, secondsLeft, duration, onSessionComplete]);

  const start = useCallback(() => {
    if (secondsLeft > 0) {
      setIsRunning(true);
      setIsCompleted(false);
    }
  }, [secondsLeft]);

  const pause = useCallback(() => {
    setIsRunning(false);
  }, []);

  const reset = useCallback(() => {
    setIsRunning(false);
    setSecondsLeft(duration);
    setIsCompleted(false);
  }, [duration]);

  const setTime = useCallback((newDuration: number) => {
    setDuration(newDuration);
    setSecondsLeft(newDuration);
    setIsRunning(false);
    setIsCompleted(false);
  }, []);

  const formatTime = (time: number): string => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  };

  return {
    secondsLeft,
    isRunning,
    isCompleted,
    start,
    pause,
    reset,
    setTime,
    formatTime,
    duration,
  };
};

/**
 * Sleek and Professional Meditation Timer Card Component
 */
const MeditationTimerCard: React.FC<MeditationTimerCardProps> = ({
  totalSessionsLogged,
  onSessionComplete,
}) => {
  // Default to 15 minutes
  const {
    secondsLeft,
    isRunning,
    isCompleted,
    start,
    pause,
    reset,
    setTime,
    formatTime,
    duration,
  } = useTimer(DURATION_OPTIONS[2].value, onSessionComplete);

  const progressPercent = useMemo(() => {
    if (duration === 0) return 0;
    return 100 - (secondsLeft / duration) * 100;
  }, [secondsLeft, duration]);

  // Dynamic class for the progress ring color
  const ringColorClass = useMemo(() => {
    if (isCompleted) return "text-green-500";
    if (isRunning) return "text-blue-500 shadow-blue-500/50"; // Glow when running
    if (secondsLeft < duration) return "text-yellow-500"; // Paused
    return "text-primary";
  }, [isRunning, isCompleted, secondsLeft, duration]);

  // Determine the primary display message
  const timerMessage = useMemo(() => {
    if (isCompleted) return "Session Complete! Take a deep breath.";
    if (isRunning) return "Focus on your breath and let go...";
    if (secondsLeft < duration && secondsLeft > 0) return "Ready to resume?";
    return "Select a duration and begin.";
  }, [isRunning, isCompleted, secondsLeft, duration]);

  // Styles for the enhanced time display
  const timeDisplayClass = `text-5xl text-primary font-bold transition-colors duration-500 ${
    isCompleted ? "text-green-600" : "text-foreground"
  } ${isRunning ? "drop-shadow-lg" : ""}`; // Added drop-shadow

  return (
    <Card className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-950/20 border-primary/20 shadow-2xl">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-primary">
          <Brain className="w-5 h-5" />
          Meditation Timer
        </CardTitle>
        <CardDescription>{timerMessage}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center space-y-6 ">
        {/* Sleek Timer Display (Radial Progress Look) */}
        <div className="relative flex items-center justify-center w-56 h-56">
          {/* SVG Ring for Progress Bar (Increased size to 56x56 / radius 85) */}
          <svg className="w-full h-full transform -rotate-90 absolute">
            <circle
              className="text-muted-foreground/20"
              strokeWidth="12" // Slightly thicker ring
              stroke="currentColor"
              fill="transparent"
              r="105"
              cx="112" // Center X for 56x56
              cy="112" // Center Y for 56x56
            />
            <circle
              className={`${ringColorClass} transition-all duration-1000`}
              strokeWidth="14"
              strokeDasharray={2 * Math.PI * 85}
              strokeDashoffset={2 * Math.PI * 85 * (1 - progressPercent / 100)}
              strokeLinecap="round"
              stroke="currentColor"
              fill="transparent"
              r="85"
              cx="112"
              cy="112"
            />
          </svg>

          {/* Time Display */}
          <span className={timeDisplayClass}>{formatTime(secondsLeft)}</span>
        </div>

        {/* Duration Selection Buttons */}
        <div className="flex space-x-2">
          {DURATION_OPTIONS.map((opt) => (
            <Button
              key={opt.value}
              variant={duration === opt.value ? "default" : "outline"}
              size="sm"
              onClick={() => setTime(opt.value)}
              disabled={isRunning} // FIXED: Removed '|| isLoading'
            >
              {opt.label}
            </Button>
          ))}
        </div>

        {/* Control Buttons - Simplified layout */}
        <div className="flex space-x-2 w-full max-w-sm justify-center">
          {/* Reset Button (Moved to the end) */}
          <Button
            variant="outline"
            size="icon"
            onClick={reset}
            disabled={isRunning}
          >
            <RotateCcw />
          </Button>

          {/* Start/Pause Button (Main Action) */}
          <Button
            size="lg"
            className="flex-1"
            onClick={isRunning ? pause : start}
            disabled={secondsLeft === 0 && !isCompleted}
          >
            {isRunning ? <Pause className="mr-2" /> : <Play className="mr-2" />}
            {isRunning ? "Pause" : isCompleted ? "Restart" : "Start"}
          </Button>

          {/* Sound Button (Placeholder) */}
          <Button
            variant="outline"
            size="icon"
            onClick={() => alert("Toggle Calming Sound...")}
            disabled={isRunning}
          >
            <Volume2 />
          </Button>
        </div>

        <p className="text-xs text-muted-foreground mt-2 text-center">
          Total meditation minutes logged: {totalSessionsLogged}
        </p>
      </CardContent>
    </Card>
  );
};

export default MeditationTimerCard;
