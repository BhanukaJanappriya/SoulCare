import React from "react";
import { useAuth } from "@/contexts/AuthContext";
// CORRECTED: The PatientSidebar is no longer imported here
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
} from "lucide-react";

const PatientDashboard: React.FC = () => {
  const { user } = useAuth();

  // Mock data for mood tracking (this will be replaced with real data later)
  const moodData = [
    { day: "Mon", mood: 7, energy: 6, anxiety: 4 },
    { day: "Tue", mood: 8, energy: 7, anxiety: 3 },
    { day: "Wed", mood: 6, energy: 5, anxiety: 6 },
    { day: "Thu", mood: 9, energy: 8, anxiety: 2 },
    { day: "Fri", mood: 7, energy: 7, anxiety: 4 },
    { day: "Sat", mood: 8, energy: 8, anxiety: 3 },
    { day: "Sun", mood: 9, energy: 9, anxiety: 2 },
  ];

  // Mock data for daily progress
  const dailyProgress = [
    { name: "Completed", value: 75, fill: "hsl(var(--primary))" },
    { name: "Remaining", value: 25, fill: "hsl(var(--muted))" },
  ];

  // Mock data for habits
  const habits = [
    { name: "Morning Meditation", streak: 7, target: 7, progress: 100 },
    { name: "Daily Walk", streak: 5, target: 7, progress: 71 },
    { name: "Water Intake", streak: 6, target: 7, progress: 86 },
    { name: "Journal Writing", streak: 4, target: 7, progress: 57 },
  ];

  return (
    // CORRECTED: The main div no longer needs the PatientSidebar or pr-16 padding.
    // The PatientLayout component now handles this.
    <div className="p-6">
      {/* Welcome Section */}
      <div className="mb-8">
        {/* CORRECTED: The user's name is now accessed from user.profile.full_name */}
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Welcome back, {user?.profile?.full_name}! 👋
        </h1>
        <p className="text-muted-foreground">
          Let's continue your journey to better mental well-being
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="hover-scale">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Current Streak
                </p>
                <p className="text-2xl font-bold text-foreground">7 days</p>
              </div>
              <Award className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="hover-scale">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Today's Mood
                </p>
                <p className="text-2xl font-bold text-foreground">8.5/10</p>
              </div>
              <Heart className="w-8 h-8 text-rose-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="hover-scale">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Meditation
                </p>
                <p className="text-2xl font-bold text-foreground">15 min</p>
              </div>
              <Brain className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="hover-scale">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Next Session
                </p>
                <p className="text-2xl font-bold text-foreground">2:00 PM</p>
              </div>
              <Calendar className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
      </div>

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
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={moodData}>
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
            </CardContent>
          </Card>

          {/* Activity Tracking */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5 text-primary" />
                Habit Tracker
              </CardTitle>
              <CardDescription>Your daily habits and streaks</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {habits.map((habit, index) => (
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
                        {habit.streak}/{habit.target} days
                      </Badge>
                    </div>
                    <Progress value={habit.progress} className="h-2" />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Daily Progress */}
          <Card>
            <CardHeader>
              <CardTitle>Daily Progress</CardTitle>
              <CardDescription>Tasks completed today</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-48 flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={dailyProgress}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={80}
                      dataKey="value"
                    >
                      {dailyProgress.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="text-center mt-4">
                <p className="text-2xl font-bold text-foreground">75%</p>
                <p className="text-sm text-muted-foreground">
                  Tasks completed
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Meditation CTA */}
          <Card className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-950/20 border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="w-5 h-5 text-primary" />
                Meditation
              </CardTitle>
              <CardDescription>
                Take a moment to center yourself
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" size="lg">
                <Play className="w-4 h-4 mr-2" />
                Start Meditation
              </Button>
              <p className="text-xs text-muted-foreground mt-2 text-center">
                Last session: 15 minutes ago
              </p>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start">
                <Users className="w-4 h-4 mr-2" />
                Book Appointment
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <BookOpen className="w-4 h-4 mr-2" />
                Write Journal Entry
              </Button>
              <Button variant="outline" className="w-full justify-start">
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