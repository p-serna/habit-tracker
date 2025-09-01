export interface Habit {
  id: string;
  name: string;
  description?: string;
  color: string;
  icon: string;
  targetFrequency: number;
  points: number;
  isActive: boolean;
  createdAt: number;
  isArchived?: boolean;
  archivedAt?: number;
}

export interface HabitCompletion {
  id: string;
  habitId: string;
  completedAt: number;
  date: string; // YYYY-MM-DD format
  points: number;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  type: 'streak' | 'total_completions' | 'points' | 'consistency';
  requirement: number;
  points: number;
  unlockedAt?: number;
}

export interface UserStats {
  id: number;
  totalPoints: number;
  totalCompletions: number;
  currentStreak: number;
  longestStreak: number;
  lastCompletionDate?: string;
}

export interface CreateHabitInput {
  name: string;
  description?: string;
  color: string;
  icon: string;
  targetFrequency: number;
  points: number;
}

export interface UpdateHabitInput {
  name?: string;
  description?: string;
  color?: string;
  icon?: string;
  targetFrequency?: number;
  points?: number;
}

export interface DailyTotal {
  date: string;
  count: number;
}