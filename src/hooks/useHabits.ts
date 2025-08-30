import { useState, useEffect, useCallback } from 'react';
import { useSQLiteContext } from '../contexts/SQLiteProvider';
import { Habit, CreateHabitInput, UpdateHabitInput } from '../types/database';

export const useHabits = () => {
  const { db, isInitialized } = useSQLiteContext();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadHabits = useCallback(async () => {
    if (!isInitialized) return;
    
    try {
      setLoading(true);
      const habitsData = await db.getHabits();
      setHabits(habitsData);
      setError(null);
    } catch (err) {
      console.error('Failed to load habits:', err);
      setError(err instanceof Error ? err.message : 'Failed to load habits');
    } finally {
      setLoading(false);
    }
  }, [db, isInitialized]);

  useEffect(() => {
    loadHabits();
  }, [loadHabits]);

  const createHabit = useCallback(async (habitData: CreateHabitInput): Promise<string> => {
    try {
      const id = await db.createHabit(habitData);
      await loadHabits(); // Refresh the list
      return id;
    } catch (err) {
      console.error('Failed to create habit:', err);
      throw err;
    }
  }, [db, loadHabits]);

  const updateHabit = useCallback(async (id: string, updates: UpdateHabitInput): Promise<void> => {
    try {
      await db.updateHabit(id, updates);
      await loadHabits(); // Refresh the list
    } catch (err) {
      console.error('Failed to update habit:', err);
      throw err;
    }
  }, [db, loadHabits]);

  const removeHabit = useCallback(async (id: string): Promise<void> => {
    try {
      await db.removeHabit(id);
      await loadHabits(); // Refresh the list
    } catch (err) {
      console.error('Failed to remove habit:', err);
      throw err;
    }
  }, [db, loadHabits]);

  return {
    data: habits,
    isLoading: loading,
    error,
    createHabit,
    updateHabit,
    removeHabit,
    refetch: loadHabits,
  };
};