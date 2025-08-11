import React, { useState } from "react";
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
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import {
  Target,
  Plus,
  Flame,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  TrendingUp,
  BarChart3,
  Edit,
  Trash2,
} from "lucide-react";

interface Habit {
  id: string;
  name: string;
  description: string;
  frequency: "daily" | "weekly" | "monthly";
  target: number;
  current: number;
  streak: number;
  category: string;
  color: string;
  completedToday: boolean;
  createdAt: Date;
  lastCompleted?: Date;
}

const PatientHabits: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  const [habits, setHabits] = useState<Habit[]>([
    {
      id: "1",
      name: "Morning Meditation",
      description: "Start the day with 10 minutes of mindfulness",
      frequency: "daily",
      target: 10,
      current: 7,
      streak: 7,
      category: "Mental Health",
      color: "hsl(var(--primary))",
      completedToday: true,
      createdAt: new Date("2024-01-01"),
      lastCompleted: new Date(),
    },
    {
      id: "2",
      name: "Daily Walk",
      description: "30 minutes of walking or light exercise",
      frequency: "daily",
      target: 30,
      current: 22,
      streak: 5,
      category: "Physical Health",
      color: "hsl(142, 71%, 45%)",
      completedToday: false,
      createdAt: new Date("2024-01-01"),
    },
    {
      id: "3",
      name: "Water Intake",
      description: "Drink 8 glasses of water throughout the day",
      frequency: "daily",
      target: 8,
      current: 6,
      streak: 6,
      category: "Physical Health",
      color: "hsl(195, 100%, 50%)",
      completedToday: false,
      createdAt: new Date("2024-01-01"),
    },
    {
      id: "4",
      name: "Journal Writing",
      description: "Reflect on the day and write thoughts",
      frequency: "daily",
      target: 1,
      current: 4,
      streak: 4,
      category: "Mental Health",
      color: "hsl(280, 100%, 70%)",
      completedToday: false,
      createdAt: new Date("2024-01-01"),
    },
  ]);

  const [newHabit, setNewHabit] = useState({
    name: "",
    description: "",
    frequency: "daily" as const,
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

  const toggleHabitCompletion = (habitId: string) => {
    setHabits((prev) =>
      prev.map((habit) => {
        if (habit.id === habitId) {
          const completed = !habit.completedToday;
          return {
            ...habit,
            completedToday: completed,
            current: completed
              ? habit.current + 1
              : Math.max(0, habit.current - 1),
            streak: completed
              ? habit.streak + 1
              : Math.max(0, habit.streak - 1),
            lastCompleted: completed ? new Date() : habit.lastCompleted,
          };
        }
        return habit;
      })
    );

    toast({
      title: habits.find((h) => h.id === habitId)?.completedToday
        ? "Habit unmarked!"
        : "Great job!",
      description: habits.find((h) => h.id === habitId)?.completedToday
        ? "Keep going with your habits!"
        : "You've completed another habit today!",
    });
  };

  const addNewHabit = () => {
    if (!newHabit.name.trim()) {
      toast({
        title: "Error",
        description: "Please enter a habit name",
        variant: "destructive",
      });
      return;
    }

    const habit: Habit = {
      id: Date.now().toString(),
      ...newHabit,
      current: 0,
      streak: 0,
      color: `hsl(${Math.random() * 360}, 70%, 50%)`,
      completedToday: false,
      createdAt: new Date(),
    };

    setHabits((prev) => [...prev, habit]);
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
  };

  const deleteHabit = (habitId: string) => {
    setHabits((prev) => prev.filter((h) => h.id !== habitId));
    toast({
      title: "Habit deleted",
      description: "The habit has been removed from your list.",
    });
  };

  const completedHabitsToday = habits.filter((h) => h.completedToday).length;
  const totalHabits = habits.length;
  const completionRate =
    totalHabits > 0 ? (completedHabitsToday / totalHabits) * 100 : 0;

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
                        onValueChange={(value: any) =>
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

          {/* Stats Overview */}
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
                    <p className="text-sm text-muted-foreground">Best Streak</p>
                    <p className="text-2xl font-bold text-foreground">
                      {Math.max(...habits.map((h) => h.streak), 0)}
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
            {habits.map((habit) => (
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
                        onCheckedChange={() => toggleHabitCompletion(habit.id)}
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

          {habits.length === 0 && (
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
