import React, { useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { usePatientDashboardData } from "@/hooks/usePatientDashboardData";
import MeditationTimerCard from "@/components/common/MeditationTimerCard";
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
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/use-toast";
import type { HabitTask, Appointment, Habit } from "@/types"; // Added Habit type
import { useNavigate } from "react-router-dom";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  Heart,
  Target,
  Brain,
  Calendar,
  Award,
  TrendingUp,
  Play,
  Users,
  BookOpen,
  Zap,
  Loader2,
} from "lucide-react";

// NEW HELPER FUNCTION: Calculates progress based on TASKS (for the Habit Card)
const calculateHabitProgress = (habits: { tasks: HabitTask[] }[]) => {
  const totalTasks = habits.reduce((sum, h) => sum + h.tasks.length, 0);
  const completedTasks = habits.reduce(
    (sum, h) => sum + h.tasks.filter((t: HabitTask) => t.isCompleted).length,
    0
  );
  if (totalTasks === 0) return { percent: 0, completed: 0, total: 0 };
  return {
    percent: Math.round((completedTasks / totalTasks) * 100),
    completed: completedTasks,
    total: totalTasks,
  };
};

// NEW HELPER FUNCTION: Calculates progress based on HABITS (for the Pie Chart)
const calculateDailyHabitCompletion = (habits: Habit[]) => {
  const totalHabits = habits.length;
  if (totalHabits === 0) return 0;

  const completedHabits = habits.filter((h) => h.completedToday).length;

  return Math.round((completedHabits / totalHabits) * 100);
};

// NEW: Mock function to simulate saving the meditation session
const saveMeditationSession = async (durationMinutes: number) => {
  // TODO: IMPLEMENT API CALL TO DJANGO BACKEND HERE
  await new Promise((resolve) => setTimeout(resolve, 500));
  console.log(`Simulated saving ${durationMinutes} minutes of meditation.`);
  return true;
};

const PatientDashboard: React.FC = () => {
  const { user } = useAuth();
  const { data, isLoading, error, refetch } = usePatientDashboardData();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleMeditationComplete = useCallback(
    async (durationMinutes: number) => {
      try {
        await saveMeditationSession(durationMinutes);
        toast({
          title: "Meditation Complete!",
          description: `You successfully meditated for ${durationMinutes} minutes. Data saved.`,
          variant: "default",
        });
        refetch();
      } catch (e) {
        toast({
          title: "Error",
          description: "Failed to save meditation session.",
          variant: "destructive",
        });
      }
    },
    [refetch, toast]
  );

  // --- NAVIGATION HANDLERS ---
  const navigateToAppointments = () => navigate("/patient/book-appointment");
  const navigateToJournal = () => navigate("/patient/journal");
  const navigateToGames = () => navigate("/patient/games");
  // ---------------------------

  if (error) {
    return (
      <div className="p-6 text-center text-destructive">
        <h1 className="text-2xl font-bold">Error Loading Dashboard</h1>
        <p>There was an issue fetching your real-time data.</p>
      </div>
    );
  }

  // Calculate Habit Card Progress (based on tasks)
  const habitTaskProgress = data
    ? calculateHabitProgress(data.habits)
    : { percent: 0, completed: 0, total: 0 };

  // CRITICAL FIX: Calculate Daily Progress Percentage (based on habits)
  const dailyHabitPercentage = data
    ? calculateDailyHabitCompletion(data.habits)
    : 0;

  // Helper for Pie Chart data (MODIFIED to use dailyHabitPercentage)
  const pieData = [
    {
      name: "Completed",
      value: dailyHabitPercentage || 0, // CRITICAL FIX
      fill: "hsl(var(--primary))",
    },
    {
      name: "Remaining",
      value: 100 - (dailyHabitPercentage || 0), // CRITICAL FIX
      fill: "hsl(var(--muted))",
    },
  ];

  // Helper for next appointment time
  const nextSessionTime = data?.stats.next_appointment
    ? new Date(
        (data.stats.next_appointment as Appointment).start_time
      ).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "No Session";

  // Render a loading state using Skeletons
  const LoadingSkeleton = () => (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      {[...Array(4)].map((_, i) => (
        <Card key={i}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-8 w-16" />
              </div>
              <Skeleton className="w-8 h-8 rounded-full" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      {isLoading ? (
        <LoadingSkeleton />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {/* Current Streak */}
          <Card className="hover-scale">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Current Streak
                  </p>
                  <p className="text-2xl font-bold text-foreground">
                    {data?.stats.current_streak} days
                  </p>
                </div>
                <Award className="w-8 h-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          {/* Today's Mood */}
          <Card className="hover-scale">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Today's Mood
                  </p>
                  <p className="text-2xl font-bold text-foreground">
                    {data?.stats.today_mood_score.toFixed(1) || "N/A"}
                  </p>
                </div>
                <Heart className="w-8 h-8 text-rose-500" />
              </div>
            </CardContent>
          </Card>

          {/* Meditation */}
          <Card className="hover-scale">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Total Meditation
                  </p>
                  <p className="text-2xl font-bold text-foreground">
                    {data?.stats.total_meditation_minutes} min
                  </p>
                </div>
                <Brain className="w-8 h-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          {/* Next Session */}
          <Card className="hover-scale">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Next Session
                  </p>
                  <p className="text-2xl font-bold text-foreground">
                    {nextSessionTime}
                  </p>
                </div>
                <Calendar className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Mood Tracker */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                Weekly Mood Progress
              </CardTitle>
              <CardDescription>
                Track your mood, energy, and anxiety levels over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="h-64 flex items-center justify-center">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data?.moodData || []}>
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
                          r: 5,
                        }}
                        name="Mood"
                      />
                      <Line
                        type="monotone"
                        dataKey="energy"
                        stroke="#10b981"
                        strokeWidth={2}
                        dot={{ fill: "#10b981", strokeWidth: 2, r: 4 }}
                        name="Energy"
                      />
                      <Line
                        type="monotone"
                        dataKey="anxiety"
                        stroke="#f59e0b"
                        strokeWidth={2}
                        dot={{ fill: "#f59e0b", strokeWidth: 2, r: 4 }}
                        name="Anxiety"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Activity Tracking (Habit Card) */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5 text-primary" />
                Habit Tracker
              </CardTitle>
              <CardDescription>Your daily habits and progress</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {isLoading && <Skeleton className="h-24 w-full" />}
              {data?.habits.map((habit, index) => {
                const completedTasks = habit.tasks.filter(
                  (t) => t.isCompleted
                ).length;
                const totalTasks = habit.tasks.length;
                const progress =
                  totalTasks > 0
                    ? Math.round((completedTasks / totalTasks) * 100)
                    : 0;
                return (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 bg-muted/50 rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-foreground">
                          {habit.name}
                        </span>
                        <Badge variant="outline">
                          {/* Display habit completion status */}
                          {habit.completedToday
                            ? "Completed"
                            : `${completedTasks}/${totalTasks} tasks`}
                        </Badge>
                      </div>
                      <Progress value={progress} className="h-2" />
                    </div>
                  </div>
                );
              })}
              {!isLoading && data?.habits.length === 0 && (
                <p className="text-center text-muted-foreground">
                  No habits set up yet.
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Daily Progress (Pie Chart) */}
          <Card>
            <CardHeader>
              <CardTitle className="text-primary">Daily Progress</CardTitle>
              <CardDescription>Habits completed today</CardDescription>{" "}
              {/* Updated description */}
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="h-48 flex items-center justify-center">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : (
                <>
                  <div className="h-48 flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pieData}
                          cx="50%"
                          cy="50%"
                          innerRadius={40}
                          outerRadius={80}
                          dataKey="value"
                          startAngle={90}
                          endAngle={90 + pieData[0].value * 3.6}
                        >
                          {pieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="text-center mt-4">
                    <p className="text-4xl font-extrabold text-primary">
                      {dailyHabitPercentage}%
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Habits Completed
                    </p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Meditation Timer Card (REPLACEMENT) */}
          <MeditationTimerCard
            totalSessionsLogged={data?.stats.total_meditation_minutes || 0}
            onSessionComplete={handleMeditationComplete}
          />

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={navigateToAppointments}
              >
                <Users className="w-4 h-4 mr-2" />
                Book Appointment
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={navigateToJournal}
              >
                <BookOpen className="w-4 h-4 mr-2" />
                Write Journal Entry
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={navigateToGames}
              >
                <Zap className="w-4 h-4 mr-2" />
                Play Mind Games
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PatientDashboard;
