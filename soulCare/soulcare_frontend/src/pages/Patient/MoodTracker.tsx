// In soulcare_frontend/src/pages/MoodTracker.tsx

import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  KeyboardEvent,
} from "react";
import { api } from "@/api";
import { useToast } from "@/hooks/use-toast";

// NEW: Import specific icons
import {
  Heart,
  Zap,
  AlertTriangle,
  Plus,
  TrendingUp,
  TrendingDown,
  Tag as TagIcon,
} from "lucide-react";
import { Input } from "@/components/ui/input";
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

// --- TYPESCRIPT INTERFACES ---
interface MoodEntry {
  id: number;
  date: string;
  mood: number;
  energy: number;
  anxiety: number;
  notes?: string;
  activities: string[];
  tags: string[]; // NEW: Add tags to MoodEntry type
}

interface Activity {
  id: number;
  name: string;
}
interface Tag {
  id: number;
  name: string;
} // NEW: Add Tag type

interface ApiErrorResponse {
  response?: {
    data?: { date?: string[]; detail?: string; [key: string]: unknown };
  };
}

const MoodTracker: React.FC = () => {
  const { toast } = useToast();

  // --- STATE MANAGEMENT ---
  const [mood, setMood] = useState([7]);
  const [energy, setEnergy] = useState([6]);
  const [anxiety, setAnxiety] = useState([3]);
  const [notes, setNotes] = useState("");
  const [selectedActivities, setSelectedActivities] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]); // NEW: State for selected tags
  const [moodHistory, setMoodHistory] = useState<MoodEntry[]>([]);
  const [availableActivities, setAvailableActivities] = useState<Activity[]>(
    []
  );
  const [availableTags, setAvailableTags] = useState<Tag[]>([]); // NEW: State for available tags
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // NEW: State for the input fields for custom activities and tags
  const [customActivity, setCustomActivity] = useState("");
  const [customTag, setCustomTag] = useState("");

  // --- DATA FETCHING ---
  const fetchMoodData = useCallback(async () => {
    try {
      const [entriesResponse, activitiesResponse, tagsResponse] =
        await Promise.all([
          api.get("/moodtracker/entries/"),
          api.get("/moodtracker/activities/"),
          api.get("/moodtracker/tags/"), // NEW: Fetch tags from the new endpoint
        ]);
      setMoodHistory(
        entriesResponse.data.results || entriesResponse.data || []
      );
      setAvailableActivities(
        activitiesResponse.data.results || activitiesResponse.data || []
      );
      setAvailableTags(tagsResponse.data.results || tagsResponse.data || []); // NEW: Set available tags
    } catch (error) {
      console.error("Failed to fetch mood data:", error);
      toast({
        title: "Error",
        description: "Could not load your mood history.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchMoodData();
  }, [fetchMoodData]);

  // --- DATA SUBMISSION & HANDLING ---
  const handleSubmit = async () => {
    setIsSubmitting(true);
    const today = new Date().toISOString().split("T")[0];

    if (moodHistory.some((entry) => entry.date === today)) {
      toast({
        title: "Already Logged Today",
        description: "You can log again tomorrow.",
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
      tags: selectedTags, // NEW: Include selected tags in the payload
    };

    try {
      await api.post("/mood/entries/", newEntryPayload);
      toast({
        title: "Success!",
        description: "Your mood entry has been saved.",
      });
      // Reset form
      setMood([7]);
      setEnergy([6]);
      setAnxiety([3]);
      setNotes("");
      setSelectedActivities([]);
      setSelectedTags([]);
      fetchMoodData(); // Refresh all data
    } catch (error: unknown) {
      const apiError = error as ApiErrorResponse;
      const errorMessage =
        apiError.response?.data?.date?.[0] || "An unexpected error occurred.";
      toast({
        title: "Submission Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // NEW: Function to handle adding a new, user-defined activity or tag
  const handleAddNewItem = (value: string, type: "activity" | "tag") => {
    if (!value.trim()) return; // Prevent adding empty items

    // Capitalize the first letter for consistency
    const newItemName = value.charAt(0).toUpperCase() + value.slice(1);

    if (type === "activity") {
      if (
        availableActivities.some(
          (a) => a.name.toLowerCase() === newItemName.toLowerCase()
        )
      )
        return;
      setAvailableActivities((prev) => [
        ...prev,
        { id: Date.now(), name: newItemName },
      ]);
      setSelectedActivities((prev) => [...prev, newItemName]);
      setCustomActivity("");
    } else {
      if (
        availableTags.some(
          (t) => t.name.toLowerCase() === newItemName.toLowerCase()
        )
      )
        return;
      setAvailableTags((prev) => [
        ...prev,
        { id: Date.now(), name: newItemName },
      ]);
      setSelectedTags((prev) => [...prev, newItemName]);
      setCustomTag("");
    }
  };

  const handleKeyPress = (
    e: KeyboardEvent<HTMLInputElement>,
    type: "activity" | "tag"
  ) => {
    if (e.key === "Enter") {
      e.preventDefault(); // Prevent form submission
      handleAddNewItem((e.target as HTMLInputElement).value, type);
    }
  };

  // --- DATA PROCESSING (MEMOIZED) ---
  const todaysEntry = useMemo(
    () =>
      moodHistory.find(
        (entry) => entry.date === new Date().toISOString().split("T")[0]
      ),
    [moodHistory]
  );
  // ... (weeklyAverage, weeklyChartData, monthlyChartData remain the same) ...
  const weeklyAverage = useMemo(() => {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const recentEntries = moodHistory.filter(
      (entry) => new Date(entry.date) >= oneWeekAgo
    );
    if (recentEntries.length === 0) return { mood: 0, energy: 0, anxiety: 0 };
    const totals = recentEntries.reduce(
      (acc, entry) => ({
        mood: acc.mood + entry.mood,
        energy: acc.energy + entry.energy,
        anxiety: acc.anxiety + entry.anxiety,
      }),
      { mood: 0, energy: 0, anxiety: 0 }
    );
    return {
      mood: parseFloat((totals.mood / recentEntries.length).toFixed(1)),
      energy: parseFloat((totals.energy / recentEntries.length).toFixed(1)),
      anxiety: parseFloat((totals.anxiety / recentEntries.length).toFixed(1)),
    };
  }, [moodHistory]);
  const weeklyChartData = useMemo(
    () =>
      moodHistory
        .slice(0, 7)
        .map((entry) => ({
          ...entry,
          day: new Date(entry.date).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          }),
        }))
        .reverse(),
    [moodHistory]
  );
  const monthlyChartData = useMemo(() => {
    const fourWeeksAgo = new Date();
    fourWeeksAgo.setDate(fourWeeksAgo.getDate() - 28);
    const recentEntries = moodHistory.filter(
      (entry) => new Date(entry.date) >= fourWeeksAgo
    );
    if (recentEntries.length < 1) return [];
    const weeks = Array.from({ length: 4 }, (_, i) => ({
      week: `Week ${4 - i}`,
      entries: [] as MoodEntry[],
    }));
    recentEntries.forEach((entry) => {
      const diffDays = Math.floor(
        (new Date().getTime() - new Date(entry.date).getTime()) /
          (1000 * 3600 * 24)
      );
      const weekIndex = Math.floor(diffDays / 7);
      if (weekIndex < 4) weeks[weekIndex].entries.push(entry);
    });
    return weeks
      .map((week) => {
        if (week.entries.length === 0)
          return { week: week.week, mood: 0, energy: 0, anxiety: 0 };
        const totals = week.entries.reduce(
          (acc, entry) => ({
            mood: acc.mood + entry.mood,
            energy: acc.energy + entry.energy,
            anxiety: acc.anxiety + entry.anxiety,
          }),
          { mood: 0, energy: 0, anxiety: 0 }
        );
        return {
          week: week.week,
          mood: parseFloat((totals.mood / week.entries.length).toFixed(1)),
          energy: parseFloat((totals.energy / week.entries.length).toFixed(1)),
          anxiety: parseFloat(
            (totals.anxiety / week.entries.length).toFixed(1)
          ),
        };
      })
      .reverse();
  }, [moodHistory]);

  // --- UTILITY FUNCTIONS ---
  const toggleSelection = (name: string, type: "activity" | "tag") => {
    if (type === "activity") {
      setSelectedActivities((prev) =>
        prev.includes(name)
          ? prev.filter((item) => item !== name)
          : [...prev, name]
      );
    } else {
      setSelectedTags((prev) =>
        prev.includes(name)
          ? prev.filter((item) => item !== name)
          : [...prev, name]
      );
    }
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
  if (isLoading)
    return <div className="p-6 text-center">Loading your mood tracker...</div>;

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
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Plus className="w-5 h-5 text-primary" />
                      Log Today's Mood
                    </CardTitle>
                    <CardDescription>
                      {todaysEntry
                        ? "You've already logged today. Come back tomorrow!"
                        : "How are you feeling right now?"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Mood Sliders */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-medium flex items-center gap-2">
                          <Heart className="w-4 h-4 text-rose-500" /> Mood
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
                        disabled={!!todaysEntry || isSubmitting}
                      />
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-medium flex items-center gap-2">
                          <Zap className="w-4 h-4 text-yellow-500" /> Energy
                        </label>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">
                            {energy[0]}/10
                          </span>
                        </div>
                      </div>
                      <Slider
                        value={energy}
                        onValueChange={setEnergy}
                        max={10}
                        min={1}
                        step={1}
                        disabled={!!todaysEntry || isSubmitting}
                      />
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-medium flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4 text-orange-500" />{" "}
                          Anxiety
                        </label>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">
                            {anxiety[0]}/10
                          </span>
                        </div>
                      </div>
                      <Slider
                        value={anxiety}
                        onValueChange={setAnxiety}
                        max={10}
                        min={1}
                        step={1}
                        disabled={!!todaysEntry || isSubmitting}
                      />
                    </div>

                    {/* Activities Section */}
                    <div className="space-y-3">
                      <label className="text-sm font-medium">
                        What did you do today?
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {availableActivities.map((activity) => (
                          <Badge
                            key={activity.id}
                            variant={
                              selectedActivities.includes(activity.name)
                                ? "default"
                                : "outline"
                            }
                            className={`cursor-pointer ${
                              todaysEntry || isSubmitting
                                ? "cursor-not-allowed opacity-50"
                                : ""
                            }`}
                            onClick={() =>
                              !(todaysEntry || isSubmitting) &&
                              toggleSelection(activity.name, "activity")
                            }
                          >
                            {activity.name}
                          </Badge>
                        ))}
                      </div>
                      <Input
                        placeholder="Add a custom activity..."
                        value={customActivity}
                        onChange={(e) => setCustomActivity(e.target.value)}
                        onKeyPress={(e) => handleKeyPress(e, "activity")}
                        disabled={!!todaysEntry || isSubmitting}
                      />
                    </div>

                    {/* NEW: Tags Section */}
                    <div className="space-y-3">
                      <label className="text-sm font-medium flex items-center gap-2">
                        <TagIcon className="w-4 h-4" />
                        Tags (Optional)
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {availableTags.map((tag) => (
                          <Badge
                            key={tag.id}
                            variant={
                              selectedTags.includes(tag.name)
                                ? "secondary"
                                : "outline"
                            }
                            className={`cursor-pointer ${
                              todaysEntry || isSubmitting
                                ? "cursor-not-allowed opacity-50"
                                : ""
                            }`}
                            onClick={() =>
                              !(todaysEntry || isSubmitting) &&
                              toggleSelection(tag.name, "tag")
                            }
                          >
                            {tag.name}
                          </Badge>
                        ))}
                      </div>
                      <Input
                        placeholder="Add a custom tag..."
                        value={customTag}
                        onChange={(e) => setCustomTag(e.target.value)}
                        onKeyPress={(e) => handleKeyPress(e, "tag")}
                        disabled={!!todaysEntry || isSubmitting}
                      />
                    </div>

                    {/* Notes Section */}
                    <div className="space-y-3">
                      <label className="text-sm font-medium">
                        Additional Notes (Optional)
                      </label>
                      <Textarea
                        placeholder="How was your day? Any specific events or thoughts..."
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        rows={3}
                        disabled={!!todaysEntry || isSubmitting}
                      />
                    </div>

                    <Button
                      onClick={handleSubmit}
                      className="w-full"
                      disabled={!!todaysEntry || isSubmitting}
                    >
                      {isSubmitting ? "Saving..." : "Save Mood Entry"}
                    </Button>
                  </CardContent>
                </Card>
                {/* Stats Cards remain the same */}
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Today's Summary</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {todaysEntry ? (
                        <>
                          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                            <span className="text-sm font-medium">Mood</span>
                            <div className="flex items-center gap-2">
                              <span className="text-2xl">
                                {getMoodEmoji(todaysEntry.mood)}
                              </span>
                              <span
                                className={`font-bold ${getMoodColor(
                                  todaysEntry.mood
                                )}`}
                              >
                                {todaysEntry.mood}/10
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                            <span className="text-sm font-medium">Energy</span>
                            <span className="font-bold text-yellow-500">
                              {todaysEntry.energy}/10
                            </span>
                          </div>
                          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                            <span className="text-sm font-medium">Anxiety</span>
                            <span className="font-bold text-orange-500">
                              {todaysEntry.anxiety}/10
                            </span>
                          </div>
                        </>
                      ) : (
                        <p className="text-muted-foreground text-sm">
                          Log your mood for today to see a summary here.
                        </p>
                      )}
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
                          {weeklyAverage.mood > 5 ? (
                            <TrendingUp className="w-4 h-4 text-green-500" />
                          ) : (
                            <TrendingDown className="w-4 h-4 text-red-500" />
                          )}
                          <span className="font-bold">
                            {weeklyAverage.mood}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">
                          Energy
                        </span>
                        <div className="flex items-center gap-2">
                          {weeklyAverage.energy > 5 ? (
                            <TrendingUp className="w-4 h-4 text-green-500" />
                          ) : (
                            <TrendingDown className="w-4 h-4 text-red-500" />
                          )}
                          <span className="font-bold">
                            {weeklyAverage.energy}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">
                          Anxiety
                        </span>
                        <div className="flex items-center gap-2">
                          {weeklyAverage.anxiety < 5 ? (
                            <TrendingUp className="w-4 h-4 text-green-500" />
                          ) : (
                            <TrendingDown className="w-4 h-4 text-red-500" />
                          )}
                          <span className="font-bold">
                            {weeklyAverage.anxiety}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            {/* Other Tabs (weekly, monthly, insights) remain the same */}
            <TabsContent value="weekly" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Weekly Mood Trends</CardTitle>
                  <CardDescription>
                    Your mood patterns over the last 7 entries
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={weeklyChartData}>
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
                          name="Mood"
                        />
                        <Line
                          type="monotone"
                          dataKey="energy"
                          stroke="#10b981"
                          strokeWidth={2}
                          name="Energy"
                        />
                        <Line
                          type="monotone"
                          dataKey="anxiety"
                          stroke="#f59e0b"
                          strokeWidth={2}
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
                    Weekly averages for the past four weeks
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={monthlyChartData}>
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
              <p className="text-muted-foreground text-center">
                More insights will be available as you log more entries.
              </p>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default MoodTracker;
