# Convex to SQLite Migration Plan

## Overview
Migrate the habit tracker app from Convex backend to local SQLite database using `expo-sqlite`, maintaining all current functionality while enabling offline-first operation.

## Migration Tasks Checklist

### Phase 1: Dependencies and Setup ✅ COMPLETED
- [x] Install `expo-sqlite` package
- [x] Remove Convex dependencies from package.json
- [x] Create SQLite database initialization module
- [x] Set up database schema migration system

**Phase 1 Implementation Details:**
- ✅ Installed expo-sqlite@^15.2.14
- ✅ Removed convex dependency and "dev" script from package.json
- ✅ Created complete file structure:
  - `src/types/database.ts` - TypeScript interfaces for all data models
  - `src/services/database.ts` - Main DatabaseService class with all CRUD operations
  - `src/services/migrations.ts` - Database schema migration system with default achievements
- ✅ Implemented full database schema with tables: habits, habitCompletions, achievements, userStats
- ✅ Added proper indexing for performance
- ✅ Included default achievements and user stats initialization

**Current Status:** Ready for Phase 2 - Database Schema Creation (schema is already implemented, need to test)

### Phase 2: Database Schema Creation ⚠️ READY FOR TESTING
- [x] Create `habits` table with schema matching Convex model
- [x] Create `habitCompletions` table with proper indexes
- [x] Create `achievements` table for gamification
- [x] Create `userStats` table for user statistics
- [x] Add database initialization script with sample data

**Phase 2 Status:** Schema implementation is complete in migrations.ts, but needs testing via React integration to verify functionality.

### Phase 3: Data Layer Implementation ✅ COMPLETED
- [x] Create SQLite database service layer (`src/services/database.ts`)
- [x] Implement habit CRUD operations
- [x] Implement completion tracking operations
- [x] Implement statistics calculation functions
- [x] Implement achievement system operations

**Phase 3 Implementation Details:**
- ✅ Created comprehensive DatabaseService class
- ✅ Implemented all habit operations: getHabits, createHabit, updateHabit, removeHabit
- ✅ Implemented completion tracking: completeHabit, getCompletionsForDate, getTodayCompletions, getWeeklyProgress
- ✅ Implemented statistics: getUserStats, updateUserStats with streak calculation
- ✅ Implemented achievement system: getAchievements, checkAndUnlockAchievements
- ✅ Added proper error handling and data validation
- ✅ Included singleton pattern for easy access across the app

### Phase 4: React Integration ✅ COMPLETED
- [x] Create SQLite context provider to replace ConvexProvider
- [x] Create custom hooks for database operations (replace Convex hooks)
- [x] Update app layout to use SQLite provider
- [x] Create loading states for database initialization

**Phase 4 Implementation Details:**
- ✅ Created `SQLiteProvider` context with proper initialization and error handling
- ✅ Created comprehensive custom hooks:
  - `useHabits` - habit CRUD operations with automatic refresh
  - `useCompletions`, `useTodayCompletions`, `useWeeklyProgress` - completion tracking
  - `useStats` - user statistics management
  - `useAchievements` - achievement system integration
- ✅ Updated `app/_layout.tsx` to use SQLiteProvider instead of ConvexProvider
- ✅ Added `DatabaseLoadingScreen` component for initialization states

### Phase 5: Component Updates ✅ COMPLETED
- [x] Update `app/index.tsx` to use SQLite hooks instead of Convex
- [x] Update `app/add-habit.tsx` for local database operations
- [x] Update `app/achievements.tsx` for local data
- [x] Update `components/HabitCard.tsx` for local operations
- [x] Update `components/WeeklyProgress.tsx` for local data
- [x] Update `components/StatsHeader.tsx` for local statistics

**Phase 5 Implementation Details:**
- ✅ Updated all app screens to use SQLite hooks with proper loading states
- ✅ Enhanced `HabitCard` component to include achievement checking and stats updates
- ✅ Fixed all property name mappings (`_id` → `id`) for database consistency
- ✅ Updated data structures to match SQLite schema types
- ✅ Maintained all existing UI functionality and user experience

### Phase 6: Testing and Cleanup ✅ PARTIALLY COMPLETED
- [x] Remove Convex configuration files
- [x] Update environment variables
- [x] Fix TypeScript compilation errors
- [⚠️] Test all CRUD operations - **ISSUE FOUND**
- [ ] Test offline functionality
- [ ] Test data persistence across app restarts
- [ ] Test on both iOS and Android

**Phase 6 Implementation Details:**
- ✅ Removed `convex/` directory and all related files
- ✅ Removed `.env.local` with `EXPO_PUBLIC_CONVEX_URL`
- ✅ Fixed package.json syntax error (trailing comma)
- ✅ Resolved all TypeScript compilation errors
- ✅ Code passes `npx tsc --noEmit` without errors

**❌ CRITICAL ISSUE FOUND DURING TESTING:**
When testing habit creation, habits are not appearing in the app after being created. The app starts successfully and the creation process completes without errors (shows success alert), but created habits do not display in the main habit list.

**Potential Causes to Investigate:**
1. Database write operations may not be committing properly
2. React state updates may not be triggering after database operations
3. Navigation timing issues - component re-rendering after `router.back()`
4. Hook dependency/refresh logic may need adjustment
5. Database initialization timing issues

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

## Next Steps for Claude Code (Debugging Phase)

**IMPORTANT FOR CLAUDE CODE CONTINUATION:**

If starting with fresh context, the current migration state is:
- ✅ **Phase 1-6 MOSTLY COMPLETED** - SQLite setup, schema, data layer, React integration, and cleanup are done
- ❌ **CRITICAL BUG FOUND** - Habit creation does not persist/display properly
- 📁 **Key Files Already Created:**
  - `src/types/database.ts` - All TypeScript interfaces ✅
  - `src/services/database.ts` - Complete DatabaseService class ✅
  - `src/services/migrations.ts` - Database schema and migrations ✅
  - `src/contexts/SQLiteProvider.tsx` - React context provider ✅
  - `src/hooks/` - All custom hooks (useHabits, useStats, etc.) ✅
- 🗂️ **All Components Updated:** App screens and components now use SQLite hooks ✅
- ⚠️ **Current State:** Code compiles and runs, but habit creation has a critical bug

**PRIORITY DEBUGGING TASKS:**
1. **Test Database Operations Directly**: Verify that `databaseService.createHabit()` actually writes to database
2. **Check Hook State Management**: Ensure `useHabits` properly refreshes after creation
3. **Investigate Navigation Timing**: Check if `router.back()` interferes with state updates
4. **Add Debug Logging**: Add console.log statements to track data flow
5. **Verify Database Persistence**: Check if data survives app restart
6. **Test Other CRUD Operations**: Verify if issue affects other operations

**DEBUGGING APPROACH:**
1. Add logging to database operations to verify writes
2. Check if React hooks are re-executing after database changes
3. Test habit creation without navigation to isolate timing issues
4. Verify database file is being written to correctly
5. Check if the issue is specific to habit creation or affects all operations

## Migration Execution Order

Execute remaining phases in order, testing thoroughly after each phase before proceeding. Each phase should be completed in a separate branch and merged after testing to allow for easy rollback if issues arise.

The migration maintains the exact same user interface and experience while moving to a local-first architecture that's more suitable for a personal habit tracking application.