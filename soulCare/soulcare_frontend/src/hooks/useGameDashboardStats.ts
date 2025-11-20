import { useState, useEffect, useCallback } from 'react';
import { fetchDashboardGameStats } from '@/api'; // Adjust path if necessary
import { GameDashboardStats } from '@/types'; // Adjust path if necessary

// Define the initial state matching the GameDashboardStats structure
// This will ensure the component doesn't crash before data is loaded
const INITIAL_STATS: GameDashboardStats = {
    total_games_played: 0,
    average_success_rate: 0,
    total_time_spent_h: 0,
    summary: {
        reaction_time: { best_time_ms: null, total_plays: 0 },
        memory_game: { max_sequence_length: null, total_plays: 0 },
        stroop_game: { best_correct_percentage: null, avg_interference_ms: null, total_plays: 0 },
        longest_number: { max_number_length: null, total_plays: 0 },
        numpuz_game: { best_time_s: null, min_moves: null, total_plays: 0 },
        additions_game: { highest_correct: null, total_plays: 0 },
        // Placeholders for unmodeled games
        emotion_recognition: { total_plays: 0, best_metric: null, last_played_at: null },
        visual_attention_tracker: { total_plays: 0, best_metric: null, last_played_at: null },
        pattern_recognition: { total_plays: 0, best_metric: null, last_played_at: null },
        mood_reflection_game: { total_plays: 0, best_metric: null, last_played_at: null },
    }
};

/**
 * Custom hook to fetch and manage the patient's overall game dashboard statistics.
 * @returns An object containing the stats, loading status, and a refetch function.
 */
export const useGameDashboardStats = () => {
    const [stats, setStats] = useState<GameDashboardStats>(INITIAL_STATS);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchStats = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await fetchDashboardGameStats();
            setStats(data);
        } catch (err) {
            console.error("Failed to fetch game dashboard stats:", err);
            setError("Failed to load game statistics. Please try again.");
            setStats(INITIAL_STATS); // Reset to default on error
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchStats();
    }, [fetchStats]);

    return { stats, isLoading, error, refetch: fetchStats };
};
