// In soulcare_frontend/src/pages/MoodTracker.tsx

import React, { useState, useEffect, useCallback, useMemo } from "react";
// NEW: Import the API instance and toast hook
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

// NEW: Define TypeScript types that match our Django backend models
interface MoodEntry {
  id: number;
  date: string; // Will be in "YYYY-MM-DD" format from backend
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

// ✅ Add proper API response types
interface MoodEntriesResponse {
  results?: MoodEntry[];
  data?: MoodEntry[];
}

interface ActivitiesResponse {
  results?: Activity[];
  data?: Activity[];
}

// ✅ Add proper error response type
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
  // --- STATE MANAGEMENT ---
  const { toast } = useToast();

  // Form state
  const [mood, setMood] = useState([7]);
  const [energy, setEnergy] = useState([6]);
  const [anxiety, setAnxiety] = useState([3]);
  const [notes, setNotes] = useState("");
  const [selectedActivities, setSelectedActivities] = useState<string[]>([]);

  // NEW: State for data fetched from the backend
  const [moodHistory, setMoodHistory] = useState<MoodEntry[]>([]);
  const [availableActivities, setAvailableActivities] = useState<Activity[]>([]);

  // NEW: Loading and submission state
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);


  // --- DATA FETCHING ---
  // NEW: Function to fetch all required data from the backend
  const fetchMoodData = useCallback(async () => {
    try {
      // Fetch mood entries and available activities at the same time
      const [entriesResponse, activitiesResponse] = await Promise.all([
        api.get<MoodEntriesResponse>('/mood/entries/'),
        api.get<ActivitiesResponse>('/mood/activities/')
      ]);

      // This is a good place to debug and see what the API is actually sending
      console.log("API Response for entries:", entriesResponse.data);
      console.log("API Response for activities:", activitiesResponse.data);

      // Handle different response formats safely
      const moodData = (entriesResponse.data.results || entriesResponse.data || []) as MoodEntry[];
      const activitiesData = (activitiesResponse.data.results || activitiesResponse.data || []) as Activity[];

      setMoodHistory(moodData);
      setAvailableActivities(activitiesData);
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

  // NEW: useEffect hook to call the fetch function when the component loads
  useEffect(() => {
    fetchMoodData();
  }, [fetchMoodData]);


  // --- DATA SUBMISSION ---
  // UPDATED: handleSubmit function to send data to the backend
  const handleSubmit = async () => {
    setIsSubmitting(true);

    const today = new Date().toISOString().split('T')[0]; // Format as YYYY-MM-DD

    // Check if an entry for today already exists
    if (moodHistory.some(entry => entry.date === today)) {
        toast({
            title: "Already Logged Today",
            description: "You have already logged your mood for today. You can log again tomorrow.",
            variant: "destructive",
        });
        setIsSubmitting(false);
        return;
    }

    const newEntryPayload = {
      date: today,
      mood: mood[0],
      energy: energy[0],
      anxiety: anxiety[0],
      notes,
      activities: selectedActivities,
    };

    try {
      await api.post('/mood/entries/', newEntryPayload);
      toast({
        title: "Success!",
        description: "Your mood entry has been saved.",
      });
      // Reset the form
      setMood([7]);
      setEnergy([6]);
      setAnxiety([3]);
      setNotes("");
      setSelectedActivities([]);
      // Refresh the data to show the new entry
      fetchMoodData();
    } catch (error: unknown) {
      console.error("Failed to save mood entry:", error);

      // ✅ FIX: Type-safe error handling without 'any'
      const apiError = error as ApiErrorResponse;
      const errorMessage = apiError.response?.data?.date?.[0] || "An unexpected error occurred.";

      toast({
        title: "Submission Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };


  // --- CLIENT-SIDE DATA PROCESSING ---
  // NEW: useMemo to efficiently calculate stats from the fetched data
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

  // UPDATED: Prepare data for the charts from the fetched history
  const chartData = useMemo(() => {
    return moodHistory
      .slice(0, 7) // Get the last 7 entries
      .map(entry => ({
        ...entry,
        // Format date for the chart (e.g., "Oct 25")
        day: new Date(entry.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      }))
      .reverse(); // Show oldest first in the chart
  }, [moodHistory]);


  // --- UTILITY FUNCTIONS ---
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


  // --- RENDER LOGIC ---
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
                    {/* Mood Slider */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-medium flex items-center gap-2">
                          <Heart className="w-4 h-4 text-rose-500" /> Mood
                        </label>
                        <div className="flex items-center gap-2">
                          <span className={`text-2xl ${getMoodColor(mood[0])}`}>
                            {getMoodEmoji(mood[0])}
                          </span>
                          <span className="text-sm font-medium">{mood[0]}/10</span>
                        </div>
                      </div>
                      <Slider value={mood} onValueChange={setMood} max={10} min={1} step={1} disabled={!!todaysEntry || isSubmitting}
                      className="cursor-pointer"/>
                    </div>

                    {/* Energy Slider */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-medium flex items-center gap-2">
                          <Zap className="w-4 h-4 text-yellow-500" /> Energy Level
                        </label>
                        <span className="text-sm font-medium">{energy[0]}/10</span>
                      </div>
                      <Slider value={energy} onValueChange={setEnergy} max={10} min={1} step={1} disabled={!!todaysEntry || isSubmitting}
                      className="cursor-pointer"/>
                    </div>

                    {/* Anxiety Slider */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-medium flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4 text-orange-500" /> Anxiety Level
                        </label>
                        <span className="text-sm font-medium">{anxiety[0]}/10</span>
                      </div>
                      <Slider value={anxiety} onValueChange={setAnxiety} max={10} min={1} step={1} disabled={!!todaysEntry || isSubmitting}
                      className="cursor-pointer"/>
                    </div>

                    {/* UPDATED: Activities now come from the backend */}
                    <div className="space-y-3">
                      <label className="text-sm font-medium">What did you do today?</label>
                      <div className="grid grid-cols-3 gap-2">
                        {availableActivities.map((activity) => (
                          <Badge
                            key={activity.id}
                            variant={selectedActivities.includes(activity.name) ? "default" : "outline"}
                            className={`cursor-pointer text-center justify-center py-2 ${todaysEntry ? 'cursor-not-allowed opacity-50' : ''}`}
                            onClick={() => !todaysEntry && toggleActivity(activity.name)}
                          >
                            {activity.name}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Notes */}
                    <div className="space-y-3">
                      <label className="text-sm font-medium">Additional Notes (Optional)</label>
                      <Textarea
                        placeholder="How was your day? Any specific events or thoughts..."
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        rows={3}
                        disabled={!!todaysEntry || isSubmitting}
                      />
                    </div>

                    <Button onClick={handleSubmit} className="w-full" disabled={!!todaysEntry || isSubmitting}>
                      {isSubmitting ? 'Saving...' : 'Save Mood Entry'}
                    </Button>
                  </CardContent>
                </Card>

                {/* Quick Stats - UPDATED to use real data */}
                <div className="space-y-6">
                  <Card>
                    <CardHeader><CardTitle>Today's Summary</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                      {todaysEntry ? (
                        <>
                          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                            <span className="text-sm font-medium">Mood</span>
                            <div className="flex items-center gap-2">
                              <span className="text-2xl">{getMoodEmoji(todaysEntry.mood)}</span>
                              <span className={`font-bold ${getMoodColor(todaysEntry.mood)}`}>{todaysEntry.mood}/10</span>
                            </div>
                          </div>
                          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                            <span className="text-sm font-medium">Energy</span>
                            <span className="font-bold text-yellow-500">{todaysEntry.energy}/10</span>
                          </div>
                          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                            <span className="text-sm font-medium">Anxiety</span>
                            <span className="font-bold text-orange-500">{todaysEntry.anxiety}/10</span>
                          </div>
                        </>
                      ) : (
                        <p className="text-muted-foreground text-sm">Log your mood for today to see a summary here.</p>
                      )}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader><CardTitle>This Week's Average</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Mood</span>
                        <div className="flex items-center gap-2">
                          {weeklyAverage.mood > 5 ? <TrendingUp className="w-4 h-4 text-green-500"/> : <TrendingDown className="w-4 h-4 text-red-500"/>}
                          <span className="font-bold">{weeklyAverage.mood}</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Energy</span>
                        <div className="flex items-center gap-2">
                           {weeklyAverage.energy > 5 ? <TrendingUp className="w-4 h-4 text-green-500"/> : <TrendingDown className="w-4 h-4 text-red-500"/>}
                          <span className="font-bold">{weeklyAverage.energy}</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Anxiety</span>
                        <div className="flex items-center gap-2">
                          {weeklyAverage.anxiety < 5 ? <TrendingUp className="w-4 h-4 text-green-500"/> : <TrendingDown className="w-4 h-4 text-red-500"/>}
                          <span className="font-bold">{weeklyAverage.anxiety}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            {/* UPDATED: Weekly View Chart */}
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
                        <Line type="monotone" dataKey="mood" stroke="hsl(var(--primary))" strokeWidth={3} name="Mood" />
                        <Line type="monotone" dataKey="energy" stroke="#10b981" strokeWidth={2} name="Energy" />
                        <Line type="monotone" dataKey="anxiety" stroke="#f59e0b" strokeWidth={2} name="Anxiety" />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* You can continue to adapt the Monthly and Insights tabs using the 'moodHistory' state */}
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default MoodTracker;
