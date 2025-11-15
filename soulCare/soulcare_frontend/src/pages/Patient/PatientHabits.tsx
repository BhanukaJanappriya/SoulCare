import React, { useState, useEffect, useCallback } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import {
  Target,
  Plus,
  Flame,
  CheckCircle,
  TrendingUp,
  Trash2,
} from "lucide-react";
import api, {
  getHabitsAPI,
  createHabitAPI,
  deleteHabitAPI,
  toggleHabitCompletionAPI,
} from "@/api";

// --- IMPORT HABIT TYPES FROM THE CENTRAL TYPES FILE ---
import { Habit, HabitInput } from "@/types"; // Habit type is for API transport (string dates)

// --- FIX: Define a type for local component state using Date objects ---
// We use Omit<> to exclude the string date properties and redefine them as Date.
type HabitWithDate = Omit<Habit, "createdAt" | "lastCompleted"> & {
  createdAt: Date;
  lastCompleted?: Date;
};

// Type for the form state, using HabitInput structure but allowing a specific frequency type
type NewHabitFormState = Omit<HabitInput, "color"> & {
  frequency: "daily" | "weekly" | "monthly";
};

const PatientHabits: React.FC = () => {
  const { toast } = useToast();

  // FIX: Use the new HabitWithDate type for the habits state
  const [habits, setHabits] = useState<HabitWithDate[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Use the refined type for the form state
  const [newHabit, setNewHabit] = useState<NewHabitFormState>({
    name: "",
    description: "",
    frequency: "daily",
    target: 1,
    category: "Mental Health",
  });

  const [isAddingHabit, setIsAddingHabit] = useState(false);

  const categories = [
    "Mental Health",
    "Physical Health",
    "Nutrition",
    "Sleep",
    "Social",
    "Productivity",
  ];

  // --- API CALLS ---

  const fetchHabits = useCallback(async () => {
    setLoading(true);
    try {
      // Use the dedicated API function (returns Habit[] with string dates)
      const data = await getHabitsAPI();

      // FIX: Map the Habit[] data into HabitWithDate[] format for state
      const formattedHabits: HabitWithDate[] = data.map((h) => ({
        // Spread all common properties
        ...h,
        // Convert ISO string to Date object
        createdAt: new Date(h.createdAt as string),
        // Convert lastCompleted string/null to Date object or undefined
        lastCompleted: h.lastCompleted
          ? new Date(h.lastCompleted as string)
          : undefined,
      }));

      setHabits(formattedHabits);
    } catch (error) {
      console.error("Error fetching habits:", error);
      toast({
        title: "Error",
        description: "Failed to load habits.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchHabits();
  }, [fetchHabits]);

  // FIX: Change 'habit' parameter to use the local state type
  const toggleHabitCompletion = async (habit: HabitWithDate) => {
    const newCompletionState = !habit.completedToday;
    const habitId = habit.id;

    const originalHabits = habits;

    // Optimistic UI update: Toggle local state for immediate feedback
    setHabits((prev) =>
      prev.map((h) =>
        h.id === habitId ? { ...h, completedToday: newCompletionState } : h
      )
    );

    try {
      // Use the dedicated API function (returns HabitToggleResponse with Habit/string dates)
      const response = await toggleHabitCompletionAPI(
        habitId,
        newCompletionState
      );

      // FIX: Convert the returned Habit object back into HabitWithDate for the state
      const updatedHabitData: HabitWithDate = {
        ...response.habit,
        createdAt: new Date(response.habit.createdAt as string),
        lastCompleted: response.habit.lastCompleted
          ? new Date(response.habit.lastCompleted as string)
          : undefined,
      };

      // Update state with the *actual* data returned from the backend
      setHabits((prev) =>
        prev.map((h) => (h.id === habitId ? updatedHabitData : h))
      );

      toast({
        title: newCompletionState ? "Great job!" : "Habit unmarked!",
        description: newCompletionState
          ? "You've completed another habit today!"
          : "Keep going with your habits!",
      });
    } catch (error) {
      console.error("Error toggling habit completion:", error);
      // Revert state on error
      setHabits(originalHabits);
      toast({
        title: "Error",
        description: `Failed to ${
          newCompletionState ? "complete" : "unmark"
        } habit.`,
        variant: "destructive",
      });
    }
  };

  const addNewHabit = async () => {
    if (!newHabit.name.trim()) {
      toast({
        title: "Error",
        description: "Please enter a habit name",
        variant: "destructive",
      });
      return;
    }

    // Prepare HabitInput structure (with generated color)
    const habitData: HabitInput = {
      ...newHabit,
      color: `hsl(${Math.random() * 360}, 70%, 50%)`,
    };

    try {
      // Use the dedicated API function (returns Habit with string dates)
      const data = await createHabitAPI(habitData);

      // FIX: Format the returned Habit (string dates) for local HabitWithDate state
      const createdHabit: HabitWithDate = {
        ...data,
        createdAt: new Date(data.createdAt as string),
        lastCompleted: data.lastCompleted
          ? new Date(data.lastCompleted as string)
          : undefined,
      };

      setHabits((prev) => [...prev, createdHabit]);
      setNewHabit({
        name: "",
        description: "",
        frequency: "daily",
        target: 1,
        category: "Mental Health",
      });
      setIsAddingHabit(false);

      toast({
        title: "Habit added!",
        description: "Your new habit has been created successfully.",
      });
    } catch (error) {
      console.error("Error adding new habit:", error);
      toast({
        title: "Error",
        description: "Failed to create new habit.",
        variant: "destructive",
      });
    }
  };

  const deleteHabit = async (habitId: string | number) => {
    try {
      // Use the dedicated API function
      await deleteHabitAPI(habitId);

      // Update state only after successful API call
      setHabits((prev) => prev.filter((h) => h.id !== habitId));

      toast({
        title: "Habit deleted",
        description: "The habit has been removed from your list.",
      });
    } catch (error) {
      console.error("Error deleting habit:", error);
      toast({
        title: "Error",
        description: "Failed to delete habit.",
        variant: "destructive",
      });
    }
  };

  // --- STATS CALCULATIONS ---

  const completedHabitsToday = habits.filter((h) => h.completedToday).length;
  const totalHabits = habits.length;
  const completionRate =
    totalHabits > 0 ? (completedHabitsToday / totalHabits) * 100 : 0;

  const bestStreak = Math.max(...habits.map((h) => h.streak), 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <main className="p-6">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                Daily Habits
              </h1>
              <p className="text-muted-foreground">
                Track and build positive habits for better mental health
              </p>
            </div>

            <Dialog open={isAddingHabit} onOpenChange={setIsAddingHabit}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="w-4 h-4" />
                  Add Habit
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Habit</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Habit Name</Label>
                    <Input
                      placeholder="e.g., Morning Meditation"
                      value={newHabit.name}
                      onChange={(e) =>
                        setNewHabit((prev) => ({
                          ...prev,
                          name: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea
                      placeholder="Brief description of your habit"
                      value={newHabit.description}
                      onChange={(e) =>
                        setNewHabit((prev) => ({
                          ...prev,
                          description: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Category</Label>
                      <Select
                        value={newHabit.category}
                        onValueChange={(value) =>
                          setNewHabit((prev) => ({ ...prev, category: value }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((cat) => (
                            <SelectItem key={cat} value={cat}>
                              {cat}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Frequency</Label>
                      <Select
                        value={newHabit.frequency}
                        onValueChange={(
                          value: "daily" | "weekly" | "monthly"
                        ) =>
                          setNewHabit((prev) => ({ ...prev, frequency: value }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="daily">Daily</SelectItem>
                          <SelectItem value="weekly">Weekly</SelectItem>
                          <SelectItem value="monthly">Monthly</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Target ({newHabit.frequency})</Label>
                    <Input
                      type="number"
                      min="1"
                      value={newHabit.target}
                      onChange={(e) =>
                        setNewHabit((prev) => ({
                          ...prev,
                          target: parseInt(e.target.value) || 1,
                        }))
                      }
                    />
                  </div>
                  <div className="flex gap-2 pt-4">
                    <Button onClick={addNewHabit} className="flex-1">
                      Create Habit
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setIsAddingHabit(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Stats Overview (Show skeleton while loading) */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-4">
                    <Skeleton className="h-10 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Target className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Total Habits
                      </p>
                      <p className="text-2xl font-bold text-foreground">
                        {totalHabits}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Completed Today
                      </p>
                      <p className="text-2xl font-bold text-foreground">
                        {completedHabitsToday}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-orange-500/10 flex items-center justify-center">
                      <Flame className="w-5 h-5 text-orange-500" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Best Streak
                      </p>
                      <p className="text-2xl font-bold text-foreground">
                        {bestStreak}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                      <TrendingUp className="w-5 h-5 text-blue-500" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Completion Rate
                      </p>
                      <p className="text-2xl font-bold text-foreground">
                        {completionRate.toFixed(0)}%
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Progress Overview */}
          <Card>
            <CardHeader>
              <CardTitle>Today's Progress</CardTitle>
              <CardDescription>
                {completedHabitsToday} of {totalHabits} habits completed
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Progress value={completionRate} className="h-3" />
            </CardContent>
          </Card>

          {/* Habits List */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {loading
              ? // Habit List Skeleton
                [...Array(4)].map((_, i) => (
                  <Card key={i}>
                    <CardContent className="p-4">
                      <Skeleton className="h-24 w-full" />
                    </CardContent>
                  </Card>
                ))
              : habits.map((habit) => (
                  <Card key={habit.id} className="relative">
                    <CardHeader className="pb-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg flex items-center gap-2">
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: habit.color }}
                            />
                            {habit.name}
                          </CardTitle>
                          <CardDescription className="mt-1">
                            {habit.description}
                          </CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteHabit(habit.id)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Badge variant="outline">{habit.category}</Badge>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Flame className="w-4 h-4 text-orange-500" />
                            {habit.streak} day streak
                          </div>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {habit.current}/{habit.target} {habit.frequency}
                        </div>
                      </div>

                      <Progress
                        value={(habit.current / habit.target) * 100}
                        className="h-2"
                      />

                      <div className="flex items-center justify-between pt-2">
                        <div className="flex items-center gap-2">
                          <Checkbox
                            checked={habit.completedToday}
                            onCheckedChange={() => toggleHabitCompletion(habit)}
                            id={`habit-${habit.id}`}
                          />
                          <Label
                            htmlFor={`habit-${habit.id}`}
                            className={`text-sm ${
                              habit.completedToday
                                ? "line-through text-muted-foreground"
                                : ""
                            }`}
                          >
                            Mark as completed today
                          </Label>
                        </div>
                        {habit.completedToday && (
                          <Badge
                            variant="default"
                            className="bg-green-500 hover:bg-green-600"
                          >
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Done
                          </Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
          </div>

          {/* No Habits Placeholder */}
          {!loading && habits.length === 0 && (
            <Card className="py-12">
              <CardContent className="text-center">
                <Target className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  No habits yet
                </h3>
                <p className="text-muted-foreground mb-4">
                  Start building positive habits to improve your mental health
                </p>
                <Button onClick={() => setIsAddingHabit(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Your First Habit
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
};

export default PatientHabits;
