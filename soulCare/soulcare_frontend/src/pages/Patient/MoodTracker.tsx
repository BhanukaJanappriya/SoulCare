import React, { useState } from "react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import {
  Heart,
  Zap,
  AlertTriangle,
  Calendar,
  Plus,
  TrendingUp,
  TrendingDown,
} from "lucide-react";

const MoodTracker: React.FC = () => {
  const [mood, setMood] = useState([7]);
  const [energy, setEnergy] = useState([6]);
  const [anxiety, setAnxiety] = useState([3]);
  const [notes, setNotes] = useState("");
  const [selectedActivities, setSelectedActivities] = useState<string[]>([]);

  // Mock historical data
  const weeklyData = [
    { day: "Mon", mood: 7, energy: 6, anxiety: 4, date: "2024-01-15" },
    { day: "Tue", mood: 8, energy: 7, anxiety: 3, date: "2024-01-16" },
    { day: "Wed", mood: 6, energy: 5, anxiety: 6, date: "2024-01-17" },
    { day: "Thu", mood: 9, energy: 8, anxiety: 2, date: "2024-01-18" },
    { day: "Fri", mood: 7, energy: 7, anxiety: 4, date: "2024-01-19" },
    { day: "Sat", mood: 8, energy: 8, anxiety: 3, date: "2024-01-20" },
    { day: "Sun", mood: 9, energy: 9, anxiety: 2, date: "2024-01-21" },
  ];

  const monthlyData = [
    { week: "Week 1", mood: 7.2, energy: 6.8, anxiety: 3.5 },
    { week: "Week 2", mood: 7.8, energy: 7.2, anxiety: 3.2 },
    { week: "Week 3", mood: 6.9, energy: 6.5, anxiety: 4.1 },
    { week: "Week 4", mood: 8.1, energy: 7.8, anxiety: 2.8 },
  ];

  const activities = [
    "Exercise",
    "Meditation",
    "Social time",
    "Work",
    "Sleep",
    "Reading",
    "Music",
    "Outdoor time",
    "Creative work",
    "Relaxation",
    "Gaming",
    "Cooking",
  ];

  const toggleActivity = (activity: string) => {
    setSelectedActivities((prev) =>
      prev.includes(activity)
        ? prev.filter((a) => a !== activity)
        : [...prev, activity]
    );
  };

  const handleSubmit = () => {
    // Handle mood entry submission
    console.log({
      mood: mood[0],
      energy: energy[0],
      anxiety: anxiety[0],
      notes,
      activities: selectedActivities,
      date: new Date(),
    });
    // Reset form or show success message
  };

  const getMoodColor = (value: number) => {
    if (value >= 8) return "text-green-500";
    if (value >= 6) return "text-yellow-500";
    if (value >= 4) return "text-orange-500";
    return "text-red-500";
  };

  const getMoodEmoji = (value: number) => {
    if (value >= 9) return "😄";
    if (value >= 7) return "😊";
    if (value >= 5) return "😐";
    if (value >= 3) return "😔";
    return "😢";
  };

  return (
    <div className="min-h-screen bg-background">
      

      <div className="p-6">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Mood Tracker
            </h1>
            <p className="text-muted-foreground">
              Track your emotional well-being and identify patterns over time
            </p>
          </div>

          <Tabs defaultValue="track" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="track">Track Today</TabsTrigger>
              <TabsTrigger value="weekly">Weekly View</TabsTrigger>
              <TabsTrigger value="monthly">Monthly View</TabsTrigger>
              <TabsTrigger value="insights">Insights</TabsTrigger>
            </TabsList>

            <TabsContent value="track" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Mood Entry Form */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Plus className="w-5 h-5 text-primary" />
                      Log Today's Mood
                    </CardTitle>
                    <CardDescription>
                      How are you feeling right now?
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Mood Slider */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-medium flex items-center gap-2">
                          <Heart className="w-4 h-4 text-rose-500" />
                          Mood
                        </label>
                        <div className="flex items-center gap-2">
                          <span className={`text-2xl ${getMoodColor(mood[0])}`}>
                            {getMoodEmoji(mood[0])}
                          </span>
                          <span className="text-sm font-medium">
                            {mood[0]}/10
                          </span>
                        </div>
                      </div>
                      <Slider
                        value={mood}
                        onValueChange={setMood}
                        max={10}
                        min={1}
                        step={1}
                        className="w-full"
                      />
                    </div>

                    {/* Energy Slider */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-medium flex items-center gap-2">
                          <Zap className="w-4 h-4 text-yellow-500" />
                          Energy Level
                        </label>
                        <span className="text-sm font-medium">
                          {energy[0]}/10
                        </span>
                      </div>
                      <Slider
                        value={energy}
                        onValueChange={setEnergy}
                        max={10}
                        min={1}
                        step={1}
                        className="w-full"
                      />
                    </div>

                    {/* Anxiety Slider */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-medium flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4 text-orange-500" />
                          Anxiety Level
                        </label>
                        <span className="text-sm font-medium">
                          {anxiety[0]}/10
                        </span>
                      </div>
                      <Slider
                        value={anxiety}
                        onValueChange={setAnxiety}
                        max={10}
                        min={1}
                        step={1}
                        className="w-full"
                      />
                    </div>

                    {/* Activities */}
                    <div className="space-y-3">
                      <label className="text-sm font-medium">
                        What did you do today?
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {activities.map((activity) => (
                          <Badge
                            key={activity}
                            variant={
                              selectedActivities.includes(activity)
                                ? "default"
                                : "outline"
                            }
                            className="cursor-pointer text-center justify-center py-2"
                            onClick={() => toggleActivity(activity)}
                          >
                            {activity}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Notes */}
                    <div className="space-y-3">
                      <label className="text-sm font-medium">
                        Additional Notes (Optional)
                      </label>
                      <Textarea
                        placeholder="How was your day? Any specific events or thoughts..."
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        rows={3}
                      />
                    </div>

                    <Button onClick={handleSubmit} className="w-full">
                      Save Mood Entry
                    </Button>
                  </CardContent>
                </Card>

                {/* Quick Stats */}
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Today's Summary</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <span className="text-sm font-medium">
                          Current Mood
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">
                            {getMoodEmoji(mood[0])}
                          </span>
                          <span
                            className={`font-bold ${getMoodColor(mood[0])}`}
                          >
                            {mood[0]}/10
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <span className="text-sm font-medium">Energy</span>
                        <span className="font-bold text-yellow-500">
                          {energy[0]}/10
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <span className="text-sm font-medium">Anxiety</span>
                        <span className="font-bold text-orange-500">
                          {anxiety[0]}/10
                        </span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>This Week's Average</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">
                          Mood
                        </span>
                        <div className="flex items-center gap-2">
                          <TrendingUp className="w-4 h-4 text-green-500" />
                          <span className="font-bold text-green-500">7.6</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">
                          Energy
                        </span>
                        <div className="flex items-center gap-2">
                          <TrendingUp className="w-4 h-4 text-green-500" />
                          <span className="font-bold text-green-500">7.2</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">
                          Anxiety
                        </span>
                        <div className="flex items-center gap-2">
                          <TrendingDown className="w-4 h-4 text-green-500" />
                          <span className="font-bold text-green-500">3.4</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="weekly" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Weekly Mood Trends</CardTitle>
                  <CardDescription>
                    Your mood patterns over the past week
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={weeklyData}>
                        <CartesianGrid
                          strokeDasharray="3 3"
                          className="opacity-30"
                        />
                        <XAxis dataKey="day" />
                        <YAxis domain={[0, 10]} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "hsl(var(--popover))",
                            border: "1px solid hsl(var(--border))",
                            borderRadius: "8px",
                          }}
                        />
                        <Line
                          type="monotone"
                          dataKey="mood"
                          stroke="hsl(var(--primary))"
                          strokeWidth={3}
                          dot={{
                            fill: "hsl(var(--primary))",
                            strokeWidth: 2,
                            r: 6,
                          }}
                          name="Mood"
                        />
                        <Line
                          type="monotone"
                          dataKey="energy"
                          stroke="#10b981"
                          strokeWidth={2}
                          dot={{ fill: "#10b981", strokeWidth: 2, r: 5 }}
                          name="Energy"
                        />
                        <Line
                          type="monotone"
                          dataKey="anxiety"
                          stroke="#f59e0b"
                          strokeWidth={2}
                          dot={{ fill: "#f59e0b", strokeWidth: 2, r: 5 }}
                          name="Anxiety"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="monthly" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Monthly Overview</CardTitle>
                  <CardDescription>
                    Weekly averages for the current month
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={monthlyData}>
                        <CartesianGrid
                          strokeDasharray="3 3"
                          className="opacity-30"
                        />
                        <XAxis dataKey="week" />
                        <YAxis domain={[0, 10]} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "hsl(var(--popover))",
                            border: "1px solid hsl(var(--border))",
                            borderRadius: "8px",
                          }}
                        />
                        <Bar
                          dataKey="mood"
                          fill="hsl(var(--primary))"
                          name="Mood"
                        />
                        <Bar dataKey="energy" fill="#10b981" name="Energy" />
                        <Bar dataKey="anxiety" fill="#f59e0b" name="Anxiety" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="insights" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Mood Patterns</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
                      <h4 className="font-semibold text-green-800 dark:text-green-200">
                        Best Days
                      </h4>
                      <p className="text-sm text-green-600 dark:text-green-300">
                        You tend to feel better on weekends, especially Sundays
                      </p>
                    </div>
                    <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                      <h4 className="font-semibold text-blue-800 dark:text-blue-200">
                        Activity Impact
                      </h4>
                      <p className="text-sm text-blue-600 dark:text-blue-300">
                        Exercise and outdoor time correlate with higher mood
                        scores
                      </p>
                    </div>
                    <div className="p-4 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                      <h4 className="font-semibold text-yellow-800 dark:text-yellow-200">
                        Energy Levels
                      </h4>
                      <p className="text-sm text-yellow-600 dark:text-yellow-300">
                        Your energy peaks in the morning and after lunch
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Recommendations</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="p-4 bg-purple-50 dark:bg-purple-950/20 rounded-lg border border-purple-200 dark:border-purple-800">
                      <h4 className="font-semibold text-purple-800 dark:text-purple-200">
                        Try Meditation
                      </h4>
                      <p className="text-sm text-purple-600 dark:text-purple-300">
                        On days with higher anxiety, consider 10-minute
                        breathing exercises
                      </p>
                    </div>
                    <div className="p-4 bg-indigo-50 dark:bg-indigo-950/20 rounded-lg border border-indigo-200 dark:border-indigo-800">
                      <h4 className="font-semibold text-indigo-800 dark:text-indigo-200">
                        Social Connection
                      </h4>
                      <p className="text-sm text-indigo-600 dark:text-indigo-300">
                        Schedule more social activities on mid-week days
                      </p>
                    </div>
                    <div className="p-4 bg-rose-50 dark:bg-rose-950/20 rounded-lg border border-rose-200 dark:border-rose-800">
                      <h4 className="font-semibold text-rose-800 dark:text-rose-200">
                        Sleep Schedule
                      </h4>
                      <p className="text-sm text-rose-600 dark:text-rose-300">
                        Maintain consistent sleep times to improve energy levels
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default MoodTracker;
