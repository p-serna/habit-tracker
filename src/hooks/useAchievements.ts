import { useState, useEffect, useCallback } from 'react';
import { useSQLiteContext } from '../contexts/SQLiteProvider';
import { Achievement } from '../types/database';

export const useAchievements = () => {
  const { db, isInitialized } = useSQLiteContext();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadAchievements = useCallback(async () => {
    if (!isInitialized) return;
    
    try {
      setLoading(true);
      const achievementsData = await db.getAchievements();
      setAchievements(achievementsData);
      setError(null);
    } catch (err) {
      console.error('Failed to load achievements:', err);
      setError(err instanceof Error ? err.message : 'Failed to load achievements');
    } finally {
      setLoading(false);
    }
  }, [db, isInitialized]);

  useEffect(() => {
    loadAchievements();
  }, [loadAchievements]);

  const checkAndUnlockAchievements = useCallback(async (): Promise<Achievement[]> => {
    try {
      const newAchievements = await db.checkAndUnlockAchievements();
      if (newAchievements.length > 0) {
        await loadAchievements(); // Refresh the list if new achievements were unlocked
      }
      return newAchievements;
    } catch (err) {
      console.error('Failed to check achievements:', err);
      throw err;
    }
  }, [db, loadAchievements]);

  const initializeAchievements = useCallback(async (): Promise<void> => {
    // This is handled automatically in the database migration/initialization
    // But we provide this for compatibility with existing code
    try {
      await loadAchievements();
    } catch (err) {
      console.error('Failed to initialize achievements:', err);
      throw err;
    }
  }, [loadAchievements]);

  return {
    data: achievements,
    isLoading: loading,
    error,
    checkAndUnlockAchievements,
    initializeAchievements,
    refetch: loadAchievements,
  };
};