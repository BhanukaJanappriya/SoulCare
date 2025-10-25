// In soulcare_frontend/src/pages/Patient/MoodTracker.tsx

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { api } from "@/api";
import { useToast } from "@/hooks/use-toast";

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
  Plus,
  TrendingUp,
  TrendingDown,
} from "lucide-react";

// Types
interface MoodEntry {
  id: number;
  date: string;
  mood: number;
  energy: number;
  anxiety: number;
  notes?: string;
  activities: string[];
}

interface Activity {
  id: number;
  name: string;
}

interface ApiErrorResponse {
  response?: {
    data?: {
      date?: string[];
      detail?: string;
      [key: string]: unknown;
    };
  };
}

const MoodTracker: React.FC = () => {
  const { toast } = useToast();

  // Form state
  const [mood, setMood] = useState([7]);
  const [energy, setEnergy] = useState([6]);
  const [anxiety, setAnxiety] = useState([3]);
  const [notes, setNotes] = useState("");
  const [selectedActivities, setSelectedActivities] = useState<string[]>([]);

  // Backend data state
  const [moodHistory, setMoodHistory] = useState<MoodEntry[]>([]);
  const [availableActivities, setAvailableActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Data fetching
  const fetchMoodData = useCallback(async () => {
    try {
      const [entriesResponse, activitiesResponse] = await Promise.all([
        api.get<MoodEntry[]>('/mood/entries/'),
        api.get<Activity[]>('/mood/activities/')
      ]);

      setMoodHistory(entriesResponse.data || []);
      setAvailableActivities(activitiesResponse.data || []);
    } catch (error) {
      console.error("Failed to fetch mood data:", error);
      toast({
        title: "Error",
        description: "Could not load your mood history. Please try refreshing.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchMoodData();
  }, [fetchMoodData]);

  // Data processing
  const todaysEntry = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    return moodHistory.find(entry => entry.date === todayStr);
  }, [moodHistory]);

  const weeklyAverage = useMemo(() => {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const recentEntries = moodHistory.filter(entry => new Date(entry.date) >= oneWeekAgo);

    if (recentEntries.length === 0) return { mood: 0, energy: 0, anxiety: 0 };

    const totals = recentEntries.reduce((acc, entry) => ({
      mood: acc.mood + entry.mood,
      energy: acc.energy + entry.energy,
      anxiety: acc.anxiety + entry.anxiety,
    }), { mood: 0, energy: 0, anxiety: 0 });

    return {
      mood: parseFloat((totals.mood / recentEntries.length).toFixed(1)),
      energy: parseFloat((totals.energy / recentEntries.length).toFixed(1)),
      anxiety: parseFloat((totals.anxiety / recentEntries.length).toFixed(1)),
    };
  }, [moodHistory]);

  const chartData = useMemo(() => {
    return moodHistory
      .slice(0, 7)
      .map(entry => ({
        ...entry,
        day: new Date(entry.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      }))
      .reverse();
  }, [moodHistory]);

  // FIX: Add monthlyData calculation
  const monthlyData = useMemo(() => {
    if (moodHistory.length === 0) return [];

    // Simple grouping - last 4 weeks or available data
    const recentEntries = moodHistory.slice(0, 28);

    if (recentEntries.length === 0) return [];

    const weeklyGroups = [];
    const entriesPerWeek = Math.ceil(recentEntries.length / 4);

    for (let i = 0; i < 4; i++) {
      const weekEntries = recentEntries.slice(i * entriesPerWeek, (i + 1) * entriesPerWeek);

      if (weekEntries.length > 0) {
        const totals = weekEntries.reduce((acc, entry) => ({
          mood: acc.mood + entry.mood,
          energy: acc.energy + entry.energy,
          anxiety: acc.anxiety + entry.anxiety,
        }), { mood: 0, energy: 0, anxiety: 0 });

        weeklyGroups.push({
          week: `Week ${i + 1}`,
          mood: parseFloat((totals.mood / weekEntries.length).toFixed(1)),
          energy: parseFloat((totals.energy / weekEntries.length).toFixed(1)),
          anxiety: parseFloat((totals.anxiety / weekEntries.length).toFixed(1)),
        });
      }
    }

    return weeklyGroups;
  }, [moodHistory]);

  // Form submission
  const handleSubmit = async () => {
    setIsSubmitting(true);
    const today = new Date().toISOString().split('T')[0];

    if (moodHistory.some(entry => entry.date === today)) {
      toast({
        title: "Already Logged Today",
        description: "You have already logged your mood for today. You can log again tomorrow.",
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }

    const activityIds = availableActivities
      .filter(activity => selectedActivities.includes(activity.name))
      .map(activity => activity.id);

    const newEntryPayload = {
      date: today,
      mood: mood[0],
      energy: energy[0],
      anxiety: anxiety[0],
      notes,
      activity_ids: activityIds,
    };

    try {
      await api.post('/mood/entries/', newEntryPayload);
      toast({
        title: "Success!",
        description: "Your mood entry has been saved.",
      });
      setMood([7]);
      setEnergy([6]);
      setAnxiety([3]);
      setNotes("");
      setSelectedActivities([]);
      fetchMoodData();
    } catch (error: unknown) {
      console.error("Failed to save mood entry:", error);
      const apiError = error as ApiErrorResponse;
      const errorMessage = apiError.response?.data?.detail || "An unexpected error occurred.";
      toast({
        title: "Submission Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Utility functions
  const toggleActivity = (activityName: string) => {
    setSelectedActivities((prev) =>
      prev.includes(activityName)
        ? prev.filter((a) => a !== activityName)
        : [...prev, activityName]
    );
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

  if (isLoading) {
    return <div className="p-6 text-center">Loading your mood tracker...</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="p-6">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Mood Tracker</h1>
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
              {/* Your existing track tab content */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Plus className="w-5 h-5 text-primary" />
                      Log Today's Mood
                    </CardTitle>
                    <CardDescription>
                      {todaysEntry ? "You've already logged today. Come back tomorrow!" : "How are you feeling right now?"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Your existing form content */}
                  </CardContent>
                </Card>
                {/* Your existing stats content */}
              </div>
            </TabsContent>

            <TabsContent value="weekly" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Weekly Mood Trends</CardTitle>
                  <CardDescription>Your mood patterns over the last 7 entries</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                        <XAxis dataKey="day" />
                        <YAxis domain={[0, 10]} />
                        <Tooltip contentStyle={{ backgroundColor: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }}/>
                        <Line type="monotone" dataKey="mood" stroke="hsl(var(--primary))" strokeWidth={3}
                          dot={{ fill: "hsl(var(--primary))", strokeWidth: 2, r: 6 }} name="Mood" />
                        <Line type="monotone" dataKey="energy" stroke="#10b981" strokeWidth={2}
                          dot={{ fill: "#10b981", strokeWidth: 2, r: 5 }} name="Energy" />
                        <Line type="monotone" dataKey="anxiety" stroke="#f59e0b" strokeWidth={2}
                          dot={{ fill: "#f59e0b", strokeWidth: 2, r: 5 }} name="Anxiety" />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* FIXED: Monthly View Tab */}
            <TabsContent value="monthly" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Monthly Overview</CardTitle>
                  <CardDescription>Weekly averages for the current month</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={monthlyData}>
                        <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                        <XAxis dataKey="week" />
                        <YAxis domain={[0, 10]} />
                        <Tooltip contentStyle={{
                          backgroundColor: "hsl(var(--popover))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px"
                        }}/>
                        <Bar dataKey="mood" fill="hsl(var(--primary))" name="Mood" />
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
                        {moodHistory.length > 0
                          ? "You tend to feel better on weekends based on your entries"
                          : "Log more entries to see your mood patterns"}
                      </p>
                    </div>
                    <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                      <h4 className="font-semibold text-blue-800 dark:text-blue-200">
                        Activity Impact
                      </h4>
                      <p className="text-sm text-blue-600 dark:text-blue-300">
                        {moodHistory.length > 0
                          ? "Track activities to see how they affect your mood"
                          : "Log activities with your mood entries to see patterns"}
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
                        Consistency is Key
                      </h4>
                      <p className="text-sm text-purple-600 dark:text-purple-300">
                        Try to log your mood daily for better insights
                      </p>
                    </div>
                    <div className="p-4 bg-indigo-50 dark:bg-indigo-950/20 rounded-lg border border-indigo-200 dark:border-indigo-800">
                      <h4 className="font-semibold text-indigo-800 dark:text-indigo-200">
                        Track Activities
                      </h4>
                      <p className="text-sm text-indigo-600 dark:text-indigo-300">
                        Note what you do each day to identify mood triggers
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
