// hooks/usePatientDashboardData.ts

import { useState, useEffect, useCallback } from 'react';
import {
  fetchPatientDashboardStats,
  fetchWeeklyMoodData,
  getHabitsAPI,
} from '@/api';
import {
  Habit,
  Appointment,
  WeeklyMoodDataPoint,
} from '@/types'; // Assuming these types exist or will be created

// New Types (You should ideally move these to '@/types/index.ts')
export interface PatientDashboardStats {
  current_streak: number;
  today_mood_score: number;
  total_meditation_minutes: number;
  next_appointment: Appointment | null;
  daily_progress_percentage: number;
}

export interface DashboardData {
  stats: PatientDashboardStats;
  moodData: WeeklyMoodDataPoint[];
  habits: Habit[];
}

export interface UseDashboardData {
  data: DashboardData | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

const initialStats: PatientDashboardStats = {
  current_streak: 0,
  today_mood_score: 0,
  total_meditation_minutes: 0,
  next_appointment: null,
  daily_progress_percentage: 0,
};

const initialData: DashboardData = {
  stats: initialStats,
  moodData: [],
  habits: [],
};

export const usePatientDashboardData = (): UseDashboardData => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Fetch all data concurrently
      const [statsResponse, moodResponse, habitsResponse] = await Promise.all([
        fetchPatientDashboardStats(),
        fetchWeeklyMoodData(),
        getHabitsAPI(), // Assuming this fetches habits with completion status
      ]);

      setData({
        stats: statsResponse,
        moodData: moodResponse,
        habits: habitsResponse,
      });
    } catch (err: unknown) {
      setError(err as Error);
      console.error("Failed to fetch dashboard data:", err);
      // Set to initial state on error
      setData(initialData);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, isLoading, error, refetch: fetchData };
};
