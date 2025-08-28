# Convex to SQLite Migration Plan

## Overview
Migrate the habit tracker app from Convex backend to local SQLite database using `expo-sqlite`, maintaining all current functionality while enabling offline-first operation.

## Migration Tasks Checklist

### Phase 1: Dependencies and Setup
- [ ] Install `expo-sqlite` package
- [ ] Remove Convex dependencies from package.json
- [ ] Create SQLite database initialization module
- [ ] Set up database schema migration system

### Phase 2: Database Schema Creation
- [ ] Create `habits` table with schema matching Convex model
- [ ] Create `habitCompletions` table with proper indexes
- [ ] Create `achievements` table for gamification
- [ ] Create `userStats` table for user statistics
- [ ] Add database initialization script with sample data

### Phase 3: Data Layer Implementation
- [ ] Create SQLite database service layer (`src/services/database.ts`)
- [ ] Implement habit CRUD operations
- [ ] Implement completion tracking operations
- [ ] Implement statistics calculation functions
- [ ] Implement achievement system operations

### Phase 4: React Integration
- [ ] Create SQLite context provider to replace ConvexProvider
- [ ] Create custom hooks for database operations (replace Convex hooks)
- [ ] Update app layout to use SQLite provider
- [ ] Create loading states for database initialization

### Phase 5: Component Updates
- [ ] Update `app/index.tsx` to use SQLite hooks instead of Convex
- [ ] Update `app/add-habit.tsx` for local database operations
- [ ] Update `app/achievements.tsx` for local data
- [ ] Update `components/HabitCard.tsx` for local operations
- [ ] Update `components/WeeklyProgress.tsx` for local data
- [ ] Update `components/StatsHeader.tsx` for local statistics

### Phase 6: Testing and Cleanup
- [ ] Test all CRUD operations
- [ ] Test offline functionality
- [ ] Test data persistence across app restarts
- [ ] Remove Convex configuration files
- [ ] Update environment variables
- [ ] Test on both iOS and Android

## Technical Specifications

### Database Schema

#### Habits Table
```sql
CREATE TABLE habits (
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
```

#### HabitCompletions Table
```sql
CREATE TABLE habitCompletions (
  id TEXT PRIMARY KEY,
  habitId TEXT NOT NULL,
  completedAt INTEGER NOT NULL,
  date TEXT NOT NULL, -- YYYY-MM-DD format
  points INTEGER NOT NULL,
  FOREIGN KEY (habitId) REFERENCES habits (id)
);

CREATE INDEX idx_habit_completions_habitId ON habitCompletions(habitId);
CREATE INDEX idx_habit_completions_date ON habitCompletions(date);
CREATE UNIQUE INDEX idx_habit_completions_habit_date ON habitCompletions(habitId, date);
```

#### Achievements Table
```sql
CREATE TABLE achievements (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('streak', 'total_completions', 'points', 'consistency')),
  requirement INTEGER NOT NULL,
  points INTEGER NOT NULL,
  unlockedAt INTEGER
);
```

#### UserStats Table
```sql
CREATE TABLE userStats (
  id INTEGER PRIMARY KEY CHECK (id = 1), -- Single row table
  totalPoints INTEGER NOT NULL DEFAULT 0,
  totalCompletions INTEGER NOT NULL DEFAULT 0,
  currentStreak INTEGER NOT NULL DEFAULT 0,
  longestStreak INTEGER NOT NULL DEFAULT 0,
  lastCompletionDate TEXT
);
```

### File Structure Changes

#### New Files to Create:
```
src/
  services/
    database.ts          # Main SQLite service
    migrations.ts        # Database schema migrations
  hooks/
    useSQLite.ts        # Custom hooks for database operations
    useHabits.ts        # Habit-specific operations
    useCompletions.ts   # Completion-specific operations
    useStats.ts         # Statistics operations
    useAchievements.ts  # Achievement operations
  contexts/
    SQLiteProvider.tsx  # React context for database
  types/
    database.ts         # TypeScript types for database models
```

#### Files to Update:
- `app/_layout.tsx` - Replace ConvexProvider with SQLiteProvider
- `app/index.tsx` - Replace Convex hooks with SQLite hooks
- `app/add-habit.tsx` - Update to use local database
- `app/achievements.tsx` - Update for local data
- `components/HabitCard.tsx` - Update habit completion logic
- `components/WeeklyProgress.tsx` - Update data fetching
- `components/StatsHeader.tsx` - Update statistics display

#### Files to Remove:
- `convex/` directory (entire folder)
- Convex configuration files

### Dependencies

#### Add:
```json
{
  "expo-sqlite": "~15.0.0"
}
```

#### Remove:
```json
{
  "convex": "^1.25.4"
}
```

### API Conversion Map

| Convex Operation | SQLite Equivalent |
|-----------------|-------------------|
| `useQuery(api.habits.list)` | `SELECT * FROM habits WHERE isActive = 1 ORDER BY createdAt DESC` |
| `useMutation(api.habits.create)` | `INSERT INTO habits (name, description, color, icon, targetFrequency, points, isActive, createdAt) VALUES (?, ?, ?, ?, ?, ?, 1, ?)` |
| `useMutation(api.habits.update)` | `UPDATE habits SET name = ?, description = ?, color = ? WHERE id = ?` |
| `useMutation(api.habits.remove)` | `UPDATE habits SET isActive = 0 WHERE id = ?` |
| `useQuery(api.habits.getTodayCompletions)` | `SELECT * FROM habitCompletions WHERE date = ?` |
| `useMutation(api.completions.completeHabit)` | `INSERT INTO habitCompletions (id, habitId, date, points, completedAt) VALUES (?, ?, ?, ?, ?)` |
| `useQuery(api.completions.getWeeklyProgress)` | `SELECT date, COUNT(*) as count FROM habitCompletions WHERE date BETWEEN ? AND ? GROUP BY date` |
| `useQuery(api.stats.getUserStats)` | `SELECT * FROM userStats WHERE id = 1` |

### Implementation Details

#### Database Service Pattern
```typescript
// Example structure for database service
export class DatabaseService {
  private db: SQLite.SQLiteDatabase;
  
  async initializeDatabase(): Promise<void>
  async getHabits(): Promise<Habit[]>
  async createHabit(habit: CreateHabitInput): Promise<string>
  async updateHabit(id: string, updates: UpdateHabitInput): Promise<void>
  async removeHabit(id: string): Promise<void>
  async completeHabit(habitId: string, date: string): Promise<string>
  async getCompletionsForDate(date: string): Promise<HabitCompletion[]>
  async getWeeklyProgress(startDate: string, endDate: string): Promise<DailyTotal[]>
  async getUserStats(): Promise<UserStats>
  async updateUserStats(pointsToAdd: number, completionDate: string): Promise<void>
}
```

#### Hook Pattern
```typescript
// Custom hooks will wrap database operations
export const useHabits = () => {
  const db = useSQLiteContext();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Return same interface as Convex hooks for minimal component changes
  return {
    data: habits,
    isLoading: loading,
    create: (habit: CreateHabitInput) => Promise<string>,
    update: (id: string, updates: UpdateHabitInput) => Promise<void>,
    remove: (id: string) => Promise<void>
  };
};
```

### Environment Changes

#### Remove:
- `EXPO_PUBLIC_CONVEX_URL` environment variable
- `convex/` folder and all Convex configuration

#### Add (Optional):
- Database backup/export functionality
- Data seeding options for development

### Testing Strategy

1. **Unit Tests**: Test database operations individually
2. **Integration Tests**: Test complete user workflows
3. **Persistence Tests**: Verify data survives app restarts
4. **Performance Tests**: Ensure queries remain fast with sample data
5. **Platform Tests**: Test on both iOS and Android devices

### Rollback Plan

1. Keep Convex dependencies in a separate branch
2. Backup current Convex data before migration
3. Implement data export functionality for reverting if needed

### Benefits After Migration

- ✅ 100% offline functionality
- ✅ No server costs or dependencies
- ✅ Faster local operations
- ✅ Complete data privacy
- ✅ No network requirements
- ✅ Reduced app startup time (no network calls)

### Trade-offs

- ❌ No automatic cloud backup (can be added manually)
- ❌ No cross-device synchronization (unless implemented)
- ❌ Slightly larger app bundle
- ❌ Manual data export/import for users

## Migration Execution Order

Execute phases in order, testing thoroughly after each phase before proceeding. Each phase should be completed in a separate branch and merged after testing to allow for easy rollback if issues arise.

The migration maintains the exact same user interface and experience while moving to a local-first architecture that's more suitable for a personal habit tracking application.