import React, { useState, useEffect } from "react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import {
  Play,
  Pause,
  RotateCcw,
  Brain,
  Clock,
  Volume2,
  VolumeX,
  Heart,
  Waves,
  TreePine,
  Sun,
} from "lucide-react";

const MeditationPage: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState([10]); // minutes
  const [timeLeft, setTimeLeft] = useState(duration[0] * 60); // seconds
  const [volume, setVolume] = useState([50]);
  const [isMuted, setIsMuted] = useState(false);
  const [selectedType, setSelectedType] = useState("breathing");

  const meditationTypes = [
    {
      id: "breathing",
      name: "Breathing",
      description: "Focus on your breath to center yourself",
      icon: Waves,
      color: "bg-blue-500",
      duration: "5-20 min",
    },
    {
      id: "mindfulness",
      name: "Mindfulness",
      description: "Present moment awareness meditation",
      icon: Brain,
      color: "bg-purple-500",
      duration: "10-30 min",
    },
    {
      id: "body-scan",
      name: "Body Scan",
      description: "Systematic relaxation of the entire body",
      icon: Heart,
      color: "bg-green-500",
      duration: "15-45 min",
    },
    {
      id: "nature",
      name: "Nature Sounds",
      description: "Meditation with calming nature ambiance",
      icon: TreePine,
      color: "bg-emerald-500",
      duration: "10-60 min",
    },
  ];

  // Timer logic
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isPlaying && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setIsPlaying(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isPlaying, timeLeft]);

  // Update timeLeft when duration changes
  useEffect(() => {
    if (!isPlaying) {
      setTimeLeft(duration[0] * 60);
    }
  }, [duration, isPlaying]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const handlePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const handleReset = () => {
    setIsPlaying(false);
    setTimeLeft(duration[0] * 60);
  };

  const progressPercentage =
    ((duration[0] * 60 - timeLeft) / (duration[0] * 60)) * 100;

  const completedSessions = [
    { date: "2024-01-21", type: "Breathing", duration: 10 },
    { date: "2024-01-20", type: "Mindfulness", duration: 15 },
    { date: "2024-01-19", type: "Body Scan", duration: 20 },
    { date: "2024-01-18", type: "Nature Sounds", duration: 25 },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-pink-900/20">
      

      <div className="p-6">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Meditation Center
            </h1>
            <p className="text-muted-foreground">
              Find peace and clarity through guided meditation
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Meditation Controls */}
            <div className="lg:col-span-2 space-y-6">
              {/* Meditation Types */}
              <Card>
                <CardHeader>
                  <CardTitle>Choose Your Practice</CardTitle>
                  <CardDescription>
                    Select a meditation style that suits your current needs
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    {meditationTypes.map((type) => (
                      <div
                        key={type.id}
                        className={`p-4 rounded-lg border-2 cursor-pointer transition-all hover:scale-105 ${
                          selectedType === type.id
                            ? "border-primary bg-primary/10"
                            : "border-border hover:border-primary/50"
                        }`}
                        onClick={() => setSelectedType(type.id)}
                      >
                        <div className="flex items-center gap-3 mb-2">
                          <div
                            className={`w-8 h-8 rounded-full ${type.color} flex items-center justify-center`}
                          >
                            <type.icon className="w-4 h-4 text-white" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-foreground">
                              {type.name}
                            </h3>
                            <Badge variant="outline" className="text-xs">
                              {type.duration}
                            </Badge>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {type.description}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Timer Interface */}
              <Card className="bg-gradient-to-br from-primary/5 to-purple-500/5">
                <CardContent className="p-8">
                  <div className="text-center space-y-8">
                    {/* Circular Progress */}
                    <div className="relative w-48 h-48 mx-auto">
                      <svg
                        className="w-48 h-48 transform -rotate-90"
                        viewBox="0 0 144 144"
                      >
                        <circle
                          cx="72"
                          cy="72"
                          r="60"
                          stroke="hsl(var(--muted))"
                          strokeWidth="8"
                          fill="none"
                        />
                        <circle
                          cx="72"
                          cy="72"
                          r="60"
                          stroke="hsl(var(--primary))"
                          strokeWidth="8"
                          fill="none"
                          strokeDasharray="377"
                          strokeDashoffset={
                            377 - (progressPercentage / 100) * 377
                          }
                          className="transition-all duration-1000 ease-in-out"
                        />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <div className="text-4xl font-bold text-foreground">
                          {formatTime(timeLeft)}
                        </div>
                        <div className="text-sm text-muted-foreground mt-1">
                          {
                            meditationTypes.find((t) => t.id === selectedType)
                              ?.name
                          }
                        </div>
                      </div>
                    </div>

                    {/* Controls */}
                    <div className="flex items-center justify-center gap-4">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={handleReset}
                        className="h-12 w-12"
                      >
                        <RotateCcw className="w-5 h-5" />
                      </Button>

                      <Button
                        onClick={handlePlay}
                        size="lg"
                        className="h-16 w-16 rounded-full"
                      >
                        {isPlaying ? (
                          <Pause className="w-8 h-8" />
                        ) : (
                          <Play className="w-8 h-8 ml-1" />
                        )}
                      </Button>

                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setIsMuted(!isMuted)}
                        className="h-12 w-12"
                      >
                        {isMuted ? (
                          <VolumeX className="w-5 h-5" />
                        ) : (
                          <Volume2 className="w-5 h-5" />
                        )}
                      </Button>
                    </div>

                    {/* Settings */}
                    <div className="space-y-6 max-w-md mx-auto">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <label className="text-sm font-medium flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            Duration
                          </label>
                          <span className="text-sm font-medium">
                            {duration[0]} min
                          </span>
                        </div>
                        <Slider
                          value={duration}
                          onValueChange={setDuration}
                          max={60}
                          min={5}
                          step={5}
                          className="w-full"
                          disabled={isPlaying}
                        />
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <label className="text-sm font-medium flex items-center gap-2">
                            <Volume2 className="w-4 h-4" />
                            Volume
                          </label>
                          <span className="text-sm font-medium">
                            {volume[0]}%
                          </span>
                        </div>
                        <Slider
                          value={volume}
                          onValueChange={setVolume}
                          max={100}
                          min={0}
                          step={10}
                          className="w-full"
                          disabled={isMuted}
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar Stats */}
            <div className="space-y-6">
              {/* Today's Progress */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sun className="w-5 h-5 text-yellow-500" />
                    Today's Progress
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-foreground mb-1">
                      15
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Minutes meditated
                    </div>
                  </div>
                  <Progress value={75} className="h-2" />
                  <div className="text-xs text-muted-foreground text-center">
                    75% of daily goal (20 min)
                  </div>
                </CardContent>
              </Card>

              {/* Weekly Stats */}
              <Card>
                <CardHeader>
                  <CardTitle>This Week</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-foreground">
                        7
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Sessions
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-foreground">
                        105
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Minutes
                      </div>
                    </div>
                  </div>
                  <div className="text-center">
                    <Badge
                      variant="outline"
                      className="text-green-600 border-green-600"
                    >
                      7 day streak! 🔥
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Sessions */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Sessions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {completedSessions.map((session, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-2 bg-muted/50 rounded-lg"
                      >
                        <div>
                          <div className="font-medium text-sm">
                            {session.type}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {session.date}
                          </div>
                        </div>
                        <Badge variant="outline">{session.duration}m</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Quick Tips */}
              <Card className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-950/20">
                <CardHeader>
                  <CardTitle className="text-sm">💡 Quick Tip</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Start with just 5 minutes daily. Consistency is more
                    important than duration.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MeditationPage;
