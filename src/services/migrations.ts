import { SQLiteDatabase } from 'expo-sqlite';
import { generateId } from '../utils/id';

export interface Migration {
  version: number;
  name: string;
  up: (db: SQLiteDatabase) => Promise<void>;
}

const migrations: Migration[] = [
  {
    version: 1,
    name: 'initial_schema',
    up: async (db: SQLiteDatabase) => {
      // Create habits table
      await db.execAsync(`
        CREATE TABLE IF NOT EXISTS habits (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          description TEXT,
          color TEXT NOT NULL,
          icon TEXT NOT NULL,
          targetFrequency INTEGER NOT NULL,
          points INTEGER NOT NULL,
          isActive INTEGER NOT NULL DEFAULT 1,
          createdAt INTEGER NOT NULL
        );
      `);

      // Create habitCompletions table
      await db.execAsync(`
        CREATE TABLE IF NOT EXISTS habitCompletions (
          id TEXT PRIMARY KEY,
          habitId TEXT NOT NULL,
          completedAt INTEGER NOT NULL,
          date TEXT NOT NULL,
          points INTEGER NOT NULL,
          FOREIGN KEY (habitId) REFERENCES habits (id)
        );
      `);

      // Create indexes for habitCompletions
      await db.execAsync(`
        CREATE INDEX IF NOT EXISTS idx_habit_completions_habitId 
        ON habitCompletions(habitId);
      `);
      
      await db.execAsync(`
        CREATE INDEX IF NOT EXISTS idx_habit_completions_date 
        ON habitCompletions(date);
      `);
      
      await db.execAsync(`
        CREATE UNIQUE INDEX IF NOT EXISTS idx_habit_completions_habit_date 
        ON habitCompletions(habitId, date);
      `);

      // Create achievements table
      await db.execAsync(`
        CREATE TABLE IF NOT EXISTS achievements (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          description TEXT NOT NULL,
          icon TEXT NOT NULL,
          type TEXT NOT NULL CHECK (type IN ('streak', 'total_completions', 'points', 'consistency')),
          requirement INTEGER NOT NULL,
          points INTEGER NOT NULL,
          unlockedAt INTEGER
        );
      `);

      // Create userStats table
      await db.execAsync(`
        CREATE TABLE IF NOT EXISTS userStats (
          id INTEGER PRIMARY KEY CHECK (id = 1),
          totalPoints INTEGER NOT NULL DEFAULT 0,
          totalCompletions INTEGER NOT NULL DEFAULT 0,
          currentStreak INTEGER NOT NULL DEFAULT 0,
          longestStreak INTEGER NOT NULL DEFAULT 0,
          lastCompletionDate TEXT
        );
      `);

      // Initialize userStats with default values
      await db.execAsync(`
        INSERT OR IGNORE INTO userStats (id, totalPoints, totalCompletions, currentStreak, longestStreak)
        VALUES (1, 0, 0, 0, 0);
      `);

      // Insert default achievements
      const defaultAchievements = [
        {
          id: generateId(),
          name: "First Step",
          description: "Complete your first habit",
          icon: "👶",
          type: "total_completions",
          requirement: 1,
          points: 10
        },
        {
          id: generateId(),
          name: "Getting Started",
          description: "Complete 5 habits",
          icon: "🌱",
          type: "total_completions",
          requirement: 5,
          points: 25
        },
        {
          id: generateId(),
          name: "Habit Builder",
          description: "Complete 25 habits",
          icon: "🏗️",
          type: "total_completions",
          requirement: 25,
          points: 100
        },
        {
          id: generateId(),
          name: "Century Club",
          description: "Complete 100 habits",
          icon: "💯",
          type: "total_completions",
          requirement: 100,
          points: 500
        },
        {
          id: generateId(),
          name: "On Fire!",
          description: "Maintain a 3-day streak",
          icon: "🔥",
          type: "streak",
          requirement: 3,
          points: 50
        },
        {
          id: generateId(),
          name: "Week Warrior",
          description: "Maintain a 7-day streak",
          icon: "⚡",
          type: "streak",
          requirement: 7,
          points: 100
        },
        {
          id: generateId(),
          name: "Consistency King",
          description: "Maintain a 30-day streak",
          icon: "👑",
          type: "streak",
          requirement: 30,
          points: 1000
        },
        {
          id: generateId(),
          name: "Point Collector",
          description: "Earn 100 points",
          icon: "⭐",
          type: "points",
          requirement: 100,
          points: 50
        },
        {
          id: generateId(),
          name: "Point Master",
          description: "Earn 1000 points",
          icon: "🌟",
          type: "points",
          requirement: 1000,
          points: 200
        }
      ];

      for (const achievement of defaultAchievements) {
        await db.runAsync(
          `INSERT OR IGNORE INTO achievements (id, name, description, icon, type, requirement, points, unlockedAt)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [achievement.id, achievement.name, achievement.description, achievement.icon, achievement.type, achievement.requirement, achievement.points, null]
        );
      }
    }
  },
  {
    version: 2,
    name: 'add_archive_fields',
    up: async (db: SQLiteDatabase) => {
      // Add archive fields to habits table
      await db.execAsync(`
        ALTER TABLE habits ADD COLUMN isArchived INTEGER NOT NULL DEFAULT 0;
      `);
      
      await db.execAsync(`
        ALTER TABLE habits ADD COLUMN archivedAt INTEGER NULL;
      `);
      
      // Create index for efficient archived habit queries
      await db.execAsync(`
        CREATE INDEX IF NOT EXISTS idx_habits_archived ON habits(isArchived);
      `);
    }
  }
];

export async function getCurrentVersion(db: SQLiteDatabase): Promise<number> {
  try {
    const result = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version');
    return result?.user_version || 0;
  } catch {
    return 0;
  }
}

export async function setVersion(db: SQLiteDatabase, version: number): Promise<void> {
  await db.execAsync(`PRAGMA user_version = ${version}`);
}

export async function runMigrations(db: SQLiteDatabase): Promise<void> {
  const currentVersion = await getCurrentVersion(db);
  
  console.log(`Current database version: ${currentVersion}`);
  
  for (const migration of migrations) {
    if (migration.version > currentVersion) {
      console.log(`Running migration: ${migration.name} (v${migration.version})`);
      await migration.up(db);
      await setVersion(db, migration.version);
      console.log(`Migration completed: ${migration.name}`);
    }
  }
  
  console.log('All migrations completed');
}