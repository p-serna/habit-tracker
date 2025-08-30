import * as SQLite from 'expo-sqlite';
import { runMigrations } from './migrations';
import { generateId } from '../utils/id';
import type { 
  Habit, 
  HabitCompletion, 
  Achievement, 
  UserStats, 
  CreateHabitInput, 
  UpdateHabitInput,
  DailyTotal 
} from '../types/database';

export class DatabaseService {
  private db: SQLite.SQLiteDatabase | null = null;

  async initialize(): Promise<void> {
    if (this.db) return;
    
    this.db = await SQLite.openDatabaseAsync('habitTracker.db');
    await runMigrations(this.db);
  }

  private getDb(): SQLite.SQLiteDatabase {
    if (!this.db) {
      throw new Error('Database not initialized. Call initialize() first.');
    }
    return this.db;
  }

  // Habit operations
  async getHabits(): Promise<Habit[]> {
    const db = this.getDb();
    const result = await db.getAllAsync<Habit>(
      'SELECT * FROM habits WHERE isActive = 1 AND (isArchived IS NULL OR isArchived = 0) ORDER BY createdAt DESC'
    );
    return result.map(habit => ({
      ...habit,
      isActive: Boolean(habit.isActive),
      isArchived: Boolean(habit.isArchived)
    }));
  }

  async createHabit(habit: CreateHabitInput): Promise<string> {
    const db = this.getDb();
    const id = generateId();
    
    await db.runAsync(
      `INSERT INTO habits (id, name, description, color, icon, targetFrequency, points, isActive, createdAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, 1, ?)`,
      [id, habit.name, habit.description || null, habit.color, habit.icon, habit.targetFrequency, habit.points, Date.now()]
    );
    
    return id;
  }

  async updateHabit(id: string, updates: UpdateHabitInput): Promise<void> {
    const db = this.getDb();
    const fields: string[] = [];
    const values: any[] = [];
    
    Object.entries(updates).forEach(([key, value]) => {
      if (value !== undefined) {
        fields.push(`${key} = ?`);
        values.push(value);
      }
    });
    
    if (fields.length === 0) return;
    
    values.push(id);
    await db.runAsync(
      `UPDATE habits SET ${fields.join(', ')} WHERE id = ?`,
      values
    );
  }

  async removeHabit(id: string): Promise<void> {
    const db = this.getDb();
    await db.runAsync('UPDATE habits SET isActive = 0 WHERE id = ?', [id]);
  }

  async archiveHabit(habitId: string): Promise<void> {
    const db = this.getDb();
    await db.runAsync(
      'UPDATE habits SET isArchived = 1, archivedAt = ? WHERE id = ?',
      [Date.now(), habitId]
    );
  }

  async unarchiveHabit(habitId: string): Promise<void> {
    const db = this.getDb();
    await db.runAsync(
      'UPDATE habits SET isArchived = 0, archivedAt = NULL WHERE id = ?',
      [habitId]
    );
  }

  // Completion operations
  async completeHabit(habitId: string, date: string): Promise<string> {
    const db = this.getDb();
    
    // Check if already completed
    const existing = await db.getFirstAsync<HabitCompletion>(
      'SELECT * FROM habitCompletions WHERE habitId = ? AND date = ?',
      [habitId, date]
    );
    
    if (existing) {
      throw new Error('Habit already completed today');
    }
    
    // Get habit details
    const habit = await db.getFirstAsync<Habit>(
      'SELECT * FROM habits WHERE id = ?',
      [habitId]
    );
    
    if (!habit) {
      throw new Error('Habit not found');
    }
    
    const completionId = generateId();
    
    // Create completion record
    await db.runAsync(
      `INSERT INTO habitCompletions (id, habitId, date, points, completedAt)
       VALUES (?, ?, ?, ?, ?)`,
      [completionId, habitId, date, habit.points, Date.now()]
    );
    
    // Update user stats
    await this.updateUserStats(habit.points, date);
    
    return completionId;
  }

  async getCompletionsForDate(date: string): Promise<HabitCompletion[]> {
    const db = this.getDb();
    return await db.getAllAsync<HabitCompletion>(
      'SELECT * FROM habitCompletions WHERE date = ?',
      [date]
    );
  }

  async getTodayCompletions(): Promise<HabitCompletion[]> {
    const today = new Date().toISOString().split('T')[0];
    return this.getCompletionsForDate(today);
  }

  async removeHabitCompletion(habitId: string, date: string): Promise<HabitCompletion | null> {
    const db = this.getDb();
    
    // Get the completion before deleting (for rollback data)
    const completion = await db.getFirstAsync<HabitCompletion>(
      'SELECT * FROM habitCompletions WHERE habitId = ? AND date = ?',
      [habitId, date]
    );
    
    if (completion) {
      await db.runAsync(
        'DELETE FROM habitCompletions WHERE habitId = ? AND date = ?',
        [habitId, date]
      );
    }
    
    return completion;
  }

  async getHabitCompletion(habitId: string, date: string): Promise<HabitCompletion | null> {
    const db = this.getDb();
    return await db.getFirstAsync<HabitCompletion>(
      'SELECT * FROM habitCompletions WHERE habitId = ? AND date = ?',
      [habitId, date]
    );
  }

  async getWeeklyProgress(startDate: string, endDate: string): Promise<DailyTotal[]> {
    const db = this.getDb();
    const result = await db.getAllAsync<{date: string, count: number}>(
      `SELECT date, COUNT(*) as count 
       FROM habitCompletions 
       WHERE date BETWEEN ? AND ? 
       GROUP BY date
       ORDER BY date`,
      [startDate, endDate]
    );
    
    return result.map(row => ({
      date: row.date,
      count: row.count
    }));
  }

  async getHabitProgress(habitId: string, days: number): Promise<HabitCompletion[]> {
    const db = this.getDb();
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - days);
    
    return await db.getAllAsync<HabitCompletion>(
      `SELECT * FROM habitCompletions 
       WHERE habitId = ? AND completedAt >= ?
       ORDER BY completedAt DESC`,
      [habitId, startDate.getTime()]
    );
  }

  // Stats operations
  async getUserStats(): Promise<UserStats> {
    const db = this.getDb();
    const stats = await db.getFirstAsync<UserStats>(
      'SELECT * FROM userStats WHERE id = 1'
    );
    
    if (!stats) {
      // Initialize default stats if none exist
      await db.runAsync(
        `INSERT INTO userStats (id, totalPoints, totalCompletions, currentStreak, longestStreak)
         VALUES (1, 0, 0, 0, 0)`
      );
      return {
        id: 1,
        totalPoints: 0,
        totalCompletions: 0,
        currentStreak: 0,
        longestStreak: 0
      };
    }
    
    return stats;
  }

  async updateUserStats(pointsToAdd: number, completionDate: string): Promise<void> {
    const db = this.getDb();
    const stats = await this.getUserStats();
    
    const newTotalPoints = stats.totalPoints + pointsToAdd;
    const newTotalCompletions = stats.totalCompletions + 1;
    
    // Calculate streak
    let newCurrentStreak = stats.currentStreak;
    let newLongestStreak = stats.longestStreak;
    
    if (stats.lastCompletionDate) {
      const lastDate = new Date(stats.lastCompletionDate);
      const currentDate = new Date(completionDate);
      const dayDiff = Math.floor((currentDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (dayDiff === 1) {
        // Consecutive day
        newCurrentStreak += 1;
      } else if (dayDiff > 1) {
        // Streak broken
        newCurrentStreak = 1;
      }
      // If dayDiff === 0, it's the same day, don't change streak
    } else {
      // First completion ever
      newCurrentStreak = 1;
    }
    
    newLongestStreak = Math.max(newLongestStreak, newCurrentStreak);
    
    await db.runAsync(
      `UPDATE userStats 
       SET totalPoints = ?, totalCompletions = ?, currentStreak = ?, 
           longestStreak = ?, lastCompletionDate = ?
       WHERE id = 1`,
      [newTotalPoints, newTotalCompletions, newCurrentStreak, newLongestStreak, completionDate]
    );
  }

  async rollbackUserStats(pointsToSubtract: number, completionDate: string): Promise<void> {
    const db = this.getDb();
    const stats = await this.getUserStats();
    
    const newTotalPoints = Math.max(0, stats.totalPoints - pointsToSubtract);
    const newTotalCompletions = Math.max(0, stats.totalCompletions - 1);
    
    // Recalculate current streak by checking if there are any completions before the rollback date
    const newStreak = await this.recalculateCurrentStreak(completionDate);
    
    await db.runAsync(
      `UPDATE userStats 
       SET totalPoints = ?, totalCompletions = ?, currentStreak = ?
       WHERE id = 1`,
      [newTotalPoints, newTotalCompletions, newStreak]
    );
  }

  private async recalculateCurrentStreak(excludeDate?: string): Promise<number> {
    const db = this.getDb();
    
    // Get all completion dates in descending order, excluding the specified date if provided
    const excludeClause = excludeDate ? 'AND date != ?' : '';
    const params = excludeDate ? [excludeDate] : [];
    
    const completions = await db.getAllAsync<{date: string}>(
      `SELECT DISTINCT date FROM habitCompletions 
       WHERE 1=1 ${excludeClause}
       ORDER BY date DESC`,
      params
    );
    
    if (completions.length === 0) return 0;
    
    let streak = 0;
    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);
    
    for (const completion of completions) {
      const completionDate = new Date(completion.date);
      const dayDiff = Math.floor((currentDate.getTime() - completionDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (dayDiff === streak) {
        // Consecutive day
        streak++;
        currentDate = completionDate;
      } else {
        // Streak broken
        break;
      }
    }
    
    return streak;
  }

  // Achievement operations
  async getAchievements(): Promise<Achievement[]> {
    const db = this.getDb();
    return await db.getAllAsync<Achievement>('SELECT * FROM achievements ORDER BY requirement ASC');
  }

  async unlockAchievement(achievementId: string): Promise<void> {
    const db = this.getDb();
    await db.runAsync(
      'UPDATE achievements SET unlockedAt = ? WHERE id = ? AND unlockedAt IS NULL',
      [Date.now(), achievementId]
    );
  }

  async checkAndUnlockAchievements(): Promise<Achievement[]> {
    const db = this.getDb();
    const stats = await this.getUserStats();
    const achievements = await this.getAchievements();
    const unlockedAchievements: Achievement[] = [];
    
    for (const achievement of achievements) {
      if (achievement.unlockedAt) continue; // Already unlocked
      
      let shouldUnlock = false;
      
      switch (achievement.type) {
        case 'total_completions':
          shouldUnlock = stats.totalCompletions >= achievement.requirement;
          break;
        case 'streak':
          shouldUnlock = stats.currentStreak >= achievement.requirement;
          break;
        case 'points':
          shouldUnlock = stats.totalPoints >= achievement.requirement;
          break;
        case 'consistency':
          // For consistency, we could implement more complex logic
          // For now, treat it like streak
          shouldUnlock = stats.currentStreak >= achievement.requirement;
          break;
      }
      
      if (shouldUnlock) {
        await this.unlockAchievement(achievement.id);
        unlockedAchievements.push({
          ...achievement,
          unlockedAt: Date.now()
        });
      }
    }
    
    return unlockedAchievements;
  }
}

// Singleton instance
export const databaseService = new DatabaseService();