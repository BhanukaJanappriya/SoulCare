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
  ListPlus,
  AlertTriangle,
  Brain,
  Dumbbell,
  Apple,
  Bed,
  Users,
  Zap,
  LucideIcon,
} from "lucide-react";

import api, {
  getHabitsAPI,
  createHabitAPI,
  deleteHabitAPI,
  createHabitTaskAPI,
  toggleHabitTaskCompletionAPI,
  getMissedHabitsAPI,
} from "@/api";

import {
  Habit,
  HabitInput,
  HabitTask,
  HabitTaskInput,
  MissedHabitItem,
} from "@/types";

// =================================================================
// --- LOCAL TYPES (DEFINED OUTSIDE MAIN COMPONENT) ---
// =================================================================

type HabitWithDate = Omit<Habit, "createdAt"> & {
  createdAt: Date;
};

type NewHabitTaskFormState = {
  name: string;
  habitId: number | null;
};

type NewHabitFormState = Omit<HabitInput, "color"> & {
  frequency: "daily" | "weekly" | "monthly";
};

// =================================================================
// --- HELPER FUNCTIONS (DEFINED OUTSIDE MAIN COMPONENT) ---
// =================================================================

const getCategoryIcon = (category: string): LucideIcon => {
  switch (category) {
    case "Mental Health":
      return Brain;
    case "Physical Health":
      return Dumbbell;
    case "Nutrition":
      return Apple;
    case "Sleep":
      return Bed;
    case "Social":
      return Users;
    case "Productivity":
      return Zap;
    default:
      return Target;
  }
};

// =================================================================
// --- TASK CREATION DIALOG COMPONENT (FIX FOR INPUT SHAKING) ---
// =================================================================

const TaskCreationDialog: React.FC<{
  isAddingTask: boolean;
  setIsAddingTask: (open: boolean) => void;
  newTask: NewHabitTaskFormState;
  setNewTask: React.Dispatch<React.SetStateAction<NewHabitTaskFormState>>;
  addNewTask: () => Promise<void>;
  habits: HabitWithDate[];
}> = ({
  isAddingTask,
  setIsAddingTask,
  newTask,
  setNewTask,
  addNewTask,
  habits,
}) => (
  <Dialog open={isAddingTask} onOpenChange={setIsAddingTask}>
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Add New Task to Habit</DialogTitle>
        <CardDescription>
          Break down a habit into multiple, trackable steps.
        </CardDescription>
      </DialogHeader>
      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Select Habit</Label>
          <Select
            value={String(newTask.habitId || "")}
            onValueChange={(value) =>
              setNewTask((prev) => ({ ...prev, habitId: parseInt(value) }))
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Choose a parent habit" />
            </SelectTrigger>
            <SelectContent>
              {habits.map((h) => (
                <SelectItem key={h.id} value={String(h.id)}>
                  {h.name} ({h.frequency})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Task Name</Label>
          <Input
            placeholder="e.g., Drink 2 glasses of water"
            value={newTask.name}
            // The stable state update here prevents the component re-render loop
            onChange={(e) =>
              setNewTask((prev) => ({ ...prev, name: e.target.value }))
            }
          />
        </div>
        <div className="flex gap-2 pt-4">
          <Button onClick={addNewTask} className="flex-1">
            Add Task
          </Button>
          <Button variant="outline" onClick={() => setIsAddingTask(false)}>
            Cancel
          </Button>
        </div>
      </div>
    </DialogContent>
  </Dialog>
);

// =================================================================
// --- MAIN PATIENT HABITS COMPONENT ---
// =================================================================

const PatientHabits: React.FC = () => {
  const { toast } = useToast();

  const [habits, setHabits] = useState<HabitWithDate[]>([]);
  const [missedHabits, setMissedHabits] = useState<MissedHabitItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isAddingHabit, setIsAddingHabit] = useState(false);
  const [isAddingTask, setIsAddingTask] = useState(false);

  const [newHabit, setNewHabit] = useState<NewHabitFormState>({
    name: "",
    description: "",
    frequency: "daily",
    target: 1,
    category: "Mental Health",
  });

  const [newTask, setNewTask] = useState<NewHabitTaskFormState>({
    name: "",
    habitId: null,
  });

  const categories = [
    "Mental Health",
    "Physical Health",
    "Nutrition",
    "Sleep",
    "Social",
    "Productivity",
  ];

  // --- FETCH MISSED HABITS ---
  const fetchMissedHabits = useCallback(async () => {
    try {
      const data = await getMissedHabitsAPI();
      setMissedHabits(data);
    } catch (error) {
      console.error("Error fetching missed habits:", error);
      // NOTE: Do not show toast on 404, as it will be fixed with the URL change
    }
  }, []);

  // --- FETCH ALL HABITS ---
  const fetchHabits = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getHabitsAPI();

      const formattedHabits: HabitWithDate[] = data.map((h) => ({
        ...h,
        createdAt: new Date(h.createdAt as string),
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

  // Combined fetch in useEffect
  useEffect(() => {
    fetchHabits();
    fetchMissedHabits();
  }, [fetchHabits, fetchMissedHabits]);

  // --- TOGGLE TASK COMPLETION (UPDATED TO USE FULL HABIT RESPONSE) ---
  const toggleTaskCompletion = async (
    habitId: number,
    task: HabitTask,
    newCompletionState: boolean
  ) => {
    const taskId = task.id;
    const originalHabits = habits;

    // Minimal optimistic update for the specific task checkbox
    setHabits((prevHabits) =>
      prevHabits.map((h) => {
        if (h.id === habitId) {
          return {
            ...h,
            tasks: h.tasks.map((t) =>
              t.id === taskId ? { ...t, isCompleted: newCompletionState } : t
            ),
          };
        }
        return h;
      })
    );

    try {
      // 1. Call the API endpoint
      const response = await toggleHabitTaskCompletionAPI(
        taskId,
        newCompletionState
      );

      // 2. Extract the full, updated habit object from the response
      const updatedHabitData = response.habit;

      // 3. Update the habits state with the full server data
      setHabits((prev) =>
        prev.map((h) => {
          if (h.id === habitId) {
            // Overwrite the old habit data with the fresh, server-calculated data
            return {
              ...updatedHabitData,
              createdAt: new Date(updatedHabitData.createdAt),
            } as HabitWithDate;
          }
          return h;
        })
      );

      // Check if missed habits need to be re-fetched (e.g., if a missed task was completed)
      fetchMissedHabits();

      toast({
        title: newCompletionState ? "Task Completed!" : "Task Unmarked!",
        description: `Task: ${task.name} has been updated. Habit status refreshed.`,
      });
    } catch (error) {
      console.error("Error toggling habit task completion:", error);
      setHabits(originalHabits); // Rollback on error
      toast({
        title: "Error",
        description: `Failed to update task: ${task.name}.`,
        variant: "destructive",
      });
    }
  };

  // --- ADD NEW HABIT ---
  const addNewHabit = async () => {
    // ... (logic remains the same)
    if (!newHabit.name.trim()) {
      toast({
        title: "Error",
        description: "Please enter a habit name",
        variant: "destructive",
      });
      return;
    }

    const habitData: HabitInput = {
      ...newHabit,
      color: `hsl(${Math.random() * 360}, 70%, 50%)`,
    };

    try {
      const data = await createHabitAPI(habitData);

      const createdHabit: HabitWithDate = {
        ...data,
        createdAt: new Date(data.createdAt as string),
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

  // --- ADD NEW TASK ---
  const addNewTask = async () => {
    if (!newTask.name.trim() || !newTask.habitId) {
      toast({
        title: "Error",
        description: "Please enter a task name.",
        variant: "destructive",
      });
      return;
    }

    try {
      const createdTask = await createHabitTaskAPI(newTask.habitId, {
        name: newTask.name,
      });

      // Update the habit in the state
      setHabits((prev) =>
        prev.map((h) => {
          if (h.id === newTask.habitId) {
            const updatedTasks = [...h.tasks, createdTask];
            // Update the habit target to match the new task count
            return {
              ...h,
              tasks: updatedTasks,
              target: updatedTasks.length,
            };
          }
          return h;
        })
      );

      setNewTask({ name: "", habitId: null });
      setIsAddingTask(false);

      toast({
        title: "Task added!",
        description: "A new task has been added to your habit.",
      });
    } catch (error) {
      console.error("Error adding new task:", error);
      toast({
        title: "Error",
        description: "Failed to create new task.",
        variant: "destructive",
      });
    }
  };

  // --- DELETE HABIT ---
  const deleteHabit = async (habitId: string | number) => {
    try {
      await deleteHabitAPI(habitId);

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
                Habits Tracker
              </h1>
              <p className="text-muted-foreground">
                Break down habits into tasks and stay on track
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                onClick={() => setIsAddingTask(true)}
                className="gap-2"
              >
                <ListPlus className="w-4 h-4" />
                Add Task
              </Button>
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
                    {/* ... (Habit form fields) ... */}
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
                            setNewHabit((prev) => ({
                              ...prev,
                              category: value,
                            }))
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
                            setNewHabit((prev) => ({
                              ...prev,
                              frequency: value,
                            }))
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
                      <Label>Target Task Count</Label>
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
                        placeholder="Enter 1 if it's a single-step habit"
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
            {/* Render the MOVED dialog here */}
            <TaskCreationDialog
              isAddingTask={isAddingTask}
              setIsAddingTask={setIsAddingTask}
              newTask={newTask}
              setNewTask={setNewTask}
              addNewTask={addNewTask}
              habits={habits}
            />
          </div>

          {/* Stats Overview */}
          {loading ? (
            // ... (Skeleton loading) ...
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
              <CardTitle>Current Progress</CardTitle>
              <CardDescription>
                {completedHabitsToday} of {totalHabits} habits completed for the
                current period.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Progress value={completionRate} className="h-3" />
            </CardContent>
          </Card>

          {/* MISSED HABITS SECTION */}
          {missedHabits.length > 0 && (
            <Card className="border-l-4 border-destructive bg-destructive/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-destructive">
                  <AlertTriangle className="w-5 h-5" />
                  Missed Tasks ({missedHabits.length})
                </CardTitle>
                <CardDescription>
                  These tasks were not completed in their previous cycle. Get
                  back on track!
                </CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {missedHabits.map((item, index) => (
                  <div
                    key={index}
                    className="p-3 border rounded-lg bg-card/50 flex flex-col space-y-1 text-sm"
                  >
                    <p className="font-semibold text-foreground">
                      {item.task_name}
                    </p>
                    <p className="text-muted-foreground">
                      Habit: {item.habit_name}
                    </p>
                    <div className="flex items-center justify-between text-xs pt-1">
                      <Badge variant="secondary" className="capitalize">
                        {item.frequency}
                      </Badge>
                      <span className="text-destructive/80">
                        Missed on: {item.missed_period_end_date}
                      </span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

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
              : habits.map((habit) => {
                  const IconComponent = getCategoryIcon(habit.category);
                  const totalTasks = habit.tasks.length || habit.target;

                  return (
                    <Card key={habit.id} className="relative">
                      <CardHeader className="pb-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="text-lg flex items-center gap-2">
                              <IconComponent className="w-4 h-4 text-primary" />
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
                              onClick={() => {
                                setNewTask({ name: "", habitId: habit.id });
                                setIsAddingTask(true);
                              }}
                              className="text-primary hover:text-primary/80"
                            >
                              <ListPlus className="w-4 h-4" />
                            </Button>
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
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: habit.color }}
                            />
                            <Badge variant="outline">{habit.category}</Badge>
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <Flame className="w-4 h-4 text-orange-500" />
                              {habit.streak} {habit.frequency} streak
                            </div>
                          </div>
                          <div className="text-sm font-semibold">
                            {habit.current}/{totalTasks}{" "}
                            <Badge variant="secondary" className="capitalize">
                              {habit.frequency}
                            </Badge>
                          </div>
                        </div>

                        {/* Progress Bar */}
                        <Progress
                          value={(habit.current / totalTasks) * 100}
                          className="h-2"
                        />

                        {/* Task List / Single Completion */}
                        {habit.tasks.length > 0 ? (
                          <div className="space-y-2 pt-2">
                            <Label className="text-xs font-medium uppercase text-muted-foreground">
                              Tasks
                            </Label>
                            {habit.tasks.map((task, taskIndex) => (
                              <div
                                key={task.id}
                                className="flex items-center justify-between p-2 border rounded-md hover:bg-muted/50 transition-colors"
                              >
                                <div className="flex items-center gap-2">
                                  <Checkbox
                                    checked={task.isCompleted}
                                    onCheckedChange={(checked) =>
                                      toggleTaskCompletion(
                                        habit.id,
                                        task,
                                        !!checked
                                      )
                                    }
                                    id={`task-${task.id}`}
                                  />
                                  <Label
                                    htmlFor={`task-${task.id}`}
                                    className={`text-sm cursor-pointer ${
                                      task.isCompleted
                                        ? "line-through text-muted-foreground"
                                        : "text-foreground"
                                    }`}
                                  >
                                    {task.name}
                                  </Label>
                                </div>
                                {task.isCompleted && (
                                  <CheckCircle className="w-4 h-4 text-green-500" />
                                )}
                              </div>
                            ))}
                            {habit.completedToday && (
                              <Badge
                                variant="default"
                                className="mt-2 w-full justify-center bg-green-500 hover:bg-green-600"
                              >
                                <CheckCircle className="w-4 h-4 mr-1" />
                                Habit Completed for this {habit.frequency}!
                              </Badge>
                            )}
                          </div>
                        ) : (
                          // Single-task completion (fallback/initial state)
                          <div className="flex items-center justify-between pt-2">
                            <div className="flex items-center gap-2">
                              <Checkbox
                                checked={habit.completedToday}
                                onCheckedChange={() => {
                                  if (
                                    habit.target > 0 &&
                                    habit.tasks.length === 0
                                  ) {
                                    toast({
                                      title: "Hint",
                                      description:
                                        "Please break this habit down into at least one task using the 'Add Task' button.",
                                      variant: "default",
                                    });
                                    return;
                                  }
                                }}
                                id={`habit-${habit.id}-single`}
                                disabled={true} // Disable checkbox to force task breakdown
                              />
                              <Label
                                htmlFor={`habit-${habit.id}-single`}
                                className={`text-sm text-muted-foreground italic`}
                              >
                                {habit.target} {habit.frequency} completion. (
                                <span
                                  className="font-semibold text-primary/80 cursor-pointer"
                                  onClick={() => {
                                    setNewTask({ name: "", habitId: habit.id });
                                    setIsAddingTask(true);
                                  }}
                                >
                                  Add your first task
                                </span>{" "}
                                to track)
                              </Label>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
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
