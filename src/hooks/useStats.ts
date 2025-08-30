import { useState, useEffect, useCallback } from 'react';
import { useSQLiteContext } from '../contexts/SQLiteProvider';
import { UserStats } from '../types/database';

export const useStats = () => {
  const { db, isInitialized } = useSQLiteContext();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadStats = useCallback(async () => {
    if (!isInitialized) return;
    
    try {
      setLoading(true);
      const statsData = await db.getUserStats();
      setStats(statsData);
      setError(null);
    } catch (err) {
      console.error('Failed to load stats:', err);
      setError(err instanceof Error ? err.message : 'Failed to load stats');
    } finally {
      setLoading(false);
    }
  }, [db, isInitialized]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  const updateStats = useCallback(async (pointsToAdd: number, completionDate: string): Promise<void> => {
    try {
      await db.updateUserStats(pointsToAdd, completionDate);
      await loadStats(); // Refresh the stats
    } catch (err) {
      console.error('Failed to update stats:', err);
      throw err;
    }
  }, [db, loadStats]);

  return {
    data: stats,
    isLoading: loading,
    error,
    updateStats,
    refetch: loadStats,
  };
};