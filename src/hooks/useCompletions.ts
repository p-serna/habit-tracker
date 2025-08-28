import { useState, useEffect, useCallback } from 'react';
import { useSQLiteContext } from '../contexts/SQLiteProvider';
import { HabitCompletion, DailyTotal } from '../types/database';

export const useCompletions = () => {
  const { db, isInitialized } = useSQLiteContext();

  const completeHabit = useCallback(async (habitId: string, date?: string): Promise<string> => {
    const completionDate = date || new Date().toISOString().split('T')[0];
    try {
      const id = await db.completeHabit(habitId, completionDate);
      return id;
    } catch (err) {
      console.error('Failed to complete habit:', err);
      throw err;
    }
  }, [db]);

  return {
    completeHabit,
  };
};

export const useTodayCompletions = () => {
  const { db, isInitialized } = useSQLiteContext();
  const [completions, setCompletions] = useState<HabitCompletion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadTodayCompletions = useCallback(async () => {
    if (!isInitialized) return;
    
    try {
      setLoading(true);
      const today = new Date().toISOString().split('T')[0];
      const completionsData = await db.getCompletionsForDate(today);
      setCompletions(completionsData);
      setError(null);
    } catch (err) {
      console.error('Failed to load today completions:', err);
      setError(err instanceof Error ? err.message : 'Failed to load today completions');
    } finally {
      setLoading(false);
    }
  }, [db, isInitialized]);

  useEffect(() => {
    loadTodayCompletions();
  }, [loadTodayCompletions]);

  return {
    data: completions,
    isLoading: loading,
    error,
    refetch: loadTodayCompletions,
  };
};

export const useWeeklyProgress = (startDate: string, endDate: string) => {
  const { db, isInitialized } = useSQLiteContext();
  const [weeklyProgress, setWeeklyProgress] = useState<DailyTotal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadWeeklyProgress = useCallback(async () => {
    if (!isInitialized) return;
    
    try {
      setLoading(true);
      const progressData = await db.getWeeklyProgress(startDate, endDate);
      setWeeklyProgress(progressData);
      setError(null);
    } catch (err) {
      console.error('Failed to load weekly progress:', err);
      setError(err instanceof Error ? err.message : 'Failed to load weekly progress');
    } finally {
      setLoading(false);
    }
  }, [db, isInitialized, startDate, endDate]);

  useEffect(() => {
    loadWeeklyProgress();
  }, [loadWeeklyProgress]);

  return {
    data: weeklyProgress,
    isLoading: loading,
    error,
    refetch: loadWeeklyProgress,
  };
};