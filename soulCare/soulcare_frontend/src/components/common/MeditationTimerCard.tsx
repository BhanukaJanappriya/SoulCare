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
  // Pass the total sessions as a prop for the professional look
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
    // FIX 1: Use window.setInterval and declare interval as number
    let interval: number | undefined;

    if (isRunning && secondsLeft > 0) {
      interval = window.setInterval(() => {
        setSecondsLeft((prev) => prev - 1);
      }, 1000);
    } else if (secondsLeft === 0 && isRunning) {
      setIsRunning(false);
      setIsCompleted(true);
      // Call the success callback
      onSessionComplete(duration / 60);

      // Add an alert or a simple sound for the end of the session
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

  // Calculate the percentage for the radial progress display
  const progressPercent = useMemo(() => {
    if (duration === 0) return 0;
    return 100 - (secondsLeft / duration) * 100;
  }, [secondsLeft, duration]);

  // Determine the primary display message
  const timerMessage = useMemo(() => {
    if (isCompleted) return "Session Complete!";
    if (isRunning) return "Find your focus...";
    if (secondsLeft < duration && secondsLeft > 0) return "Ready to resume?";
    return "Choose a duration.";
  }, [isRunning, isCompleted, secondsLeft, duration]);

  return (
    <Card className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-950/20 border-primary/20 shadow-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-primary">
          <Brain className="w-5 h-5" />
          Meditation Timer
        </CardTitle>
        <CardDescription>{timerMessage}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center space-y-6">
        {/* Sleek Timer Display (Radial Progress Look) */}
        <div className="relative flex items-center justify-center w-48 h-48">
          {/* SVG Ring for Progress Bar */}
          <svg className="w-full h-full transform -rotate-90 absolute">
            <circle
              className="text-muted-foreground/20"
              strokeWidth="10"
              stroke="currentColor"
              fill="transparent"
              r="70"
              cx="96"
              cy="96"
            />
            <circle
              className={`text-primary transition-all duration-1000 ${
                isCompleted ? "text-green-500" : "text-primary"
              }`}
              strokeWidth="10"
              strokeDasharray={2 * Math.PI * 70}
              strokeDashoffset={2 * Math.PI * 70 * (1 - progressPercent / 100)}
              strokeLinecap="round"
              stroke="currentColor"
              fill="transparent"
              r="70"
              cx="96"
              cy="96"
            />
          </svg>

          {/* Time Display */}
          <span
            className={`text-5xl font-extrabold transition-colors duration-500 ${
              isCompleted ? "text-green-600" : "text-foreground"
            }`}
          >
            {formatTime(secondsLeft)}
          </span>
        </div>

        {/* Duration Selection Buttons */}
        <div className="flex space-x-2">
          {DURATION_OPTIONS.map((opt) => (
            <Button
              key={opt.value}
              variant={duration === opt.value ? "default" : "outline"}
              size="sm"
              onClick={() => setTime(opt.value)}
              disabled={isRunning}
            >
              {opt.label}
            </Button>
          ))}
        </div>

        {/* Control Buttons */}
        <div className="flex space-x-4 w-full justify-center">
          {/* Start/Pause Button */}
          <Button
            size="lg"
            className="flex-1 max-w-[200px]"
            onClick={isRunning ? pause : start}
            disabled={secondsLeft === 0 && !isCompleted}
          >
            {isRunning ? <Pause className="mr-2" /> : <Play className="mr-2" />}
            {isRunning ? "Pause" : isCompleted ? "Restart" : "Start"}
          </Button>

          {/* Reset Button */}
          <Button variant="outline" size="icon" onClick={reset}>
            <RotateCcw />
          </Button>

          {/* Sound Button (Placeholder) */}
          <Button
            variant="outline"
            size="icon"
            onClick={() => alert("Toggle Calming Sound...")}
          >
            <Volume2 />
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-2 text-center">
          Total minutes logged: {totalSessionsLogged}
        </p>
      </CardContent>
    </Card>
  );
};

export default MeditationTimerCard;
