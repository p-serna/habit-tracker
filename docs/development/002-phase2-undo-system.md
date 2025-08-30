# Phase 2: Undo System Implementation

## Current Status
✅ **Phase 1 Complete**: Basic swipe gestures are working
- Right swipe completes habits with celebration popup
- Left swipe archives habits (removes from active list)
- Visual feedback with colored backgrounds and icons
- GestureHandlerRootView properly configured
- Database migration v2 adds archive fields

## Phase 2 Objective
Implement undo functionality for swipe actions to prevent accidental completions and archiving.

## Current Architecture Context

### Existing Components
- `SwipeableHabitCard` at `/components/SwipeableHabitCard.tsx`
- `HabitCard` at `/components/HabitCard.tsx` (simplified, no tap interaction)
- Main screen at `/app/index.tsx`

### Existing Database Methods
```typescript
// In DatabaseService (/src/services/database.ts)
async archiveHabit(habitId: string): Promise<void>
async unarchiveHabit(habitId: string): Promise<void>
async completeHabit(habitId: string, date: string): Promise<string>
```

### Existing Hooks
```typescript
// In useHabits (/src/hooks/useHabits.ts)
const { archiveHabit, unarchiveHabit } = useHabits();

// In useCompletions (/src/hooks/useCompletions.ts)  
const { completeHabit } = useCompletions();
```

## Phase 2 Implementation Plan

### 1. Create UndoToast Component
**File**: `/components/UndoToast.tsx`

```typescript
interface UndoAction {
  type: 'complete' | 'archive';
  habitId: string;
  habitName: string;
  timestamp: number;
  originalData?: any; // For restoration
}

interface UndoToastProps {
  action: UndoAction | null;
  onUndo: () => void;
  onDismiss: () => void;
  visible: boolean;
}
```

**Requirements:**
- Slide up from bottom animation
- 5-second auto-dismiss timer
- Clear undo/dismiss actions
- Shows habit name and action type
- Accessible with screen readers

### 2. Create Undo State Management Hook
**File**: `/src/hooks/useUndoState.ts`

```typescript
interface UndoState {
  pendingAction: UndoAction | null;
  timeoutId: NodeJS.Timeout | null;
}

const useUndoState = () => {
  const [undoState, setUndoState] = useState<UndoState>({
    pendingAction: null,
    timeoutId: null
  });
  
  const startUndoTimer = (action: UndoAction, onTimeout: () => void) => void;
  const cancelUndoTimer = () => void;
  const executeUndo = () => void;
}
```

### 3. Database Undo Support
**Add to DatabaseService** (`/src/services/database.ts`):

```typescript
// Add method to remove today's completion
async removeHabitCompletion(habitId: string, date: string): Promise<void> {
  await this.db.runAsync(
    'DELETE FROM habitCompletions WHERE habitId = ? AND date = ?',
    [habitId, date]
  );
}

// Add method to get completion before deletion (for stats rollback)
async getHabitCompletion(habitId: string, date: string): Promise<HabitCompletion | null> {
  return await this.db.getFirstAsync<HabitCompletion>(
    'SELECT * FROM habitCompletions WHERE habitId = ? AND date = ?',
    [habitId, date]
  );
}
```

### 4. Update Stats Rollback
**Add to DatabaseService** (`/src/services/database.ts`):

```typescript
async rollbackUserStats(pointsToSubtract: number, completionDate: string): Promise<void> {
  const db = this.getDb();
  const stats = await this.getUserStats();
  
  const newTotalPoints = Math.max(0, stats.totalPoints - pointsToSubtract);
  const newTotalCompletions = Math.max(0, stats.totalCompletions - 1);
  
  // Recalculate streak by checking previous completion
  const newStreak = await this.recalculateCurrentStreak();
  
  await db.runAsync(
    `UPDATE userStats 
     SET totalPoints = ?, totalCompletions = ?, currentStreak = ?
     WHERE id = 1`,
    [newTotalPoints, newTotalCompletions, newStreak]
  );
}
```

### 5. Integration Points

#### Update SwipeableHabitCard
- Add `onUndoNeeded` callback prop
- Store original state before action
- Trigger undo state when action completes

#### Update HomeScreen (app/index.tsx)
- Add UndoToast component
- Implement undo state management
- Handle undo actions for complete/archive
- Update completion/archive handlers to trigger undo state

### 6. Implementation Steps

```typescript
// Step 1: Modify SwipeableHabitCard to capture undo data
const handleCompleteAction = () => {
  const undoData = {
    type: 'complete' as const,
    habitId: habit.id,
    habitName: habit.name,
    timestamp: Date.now(),
  };
  
  onComplete(habit.id);
  onUndoNeeded(undoData);
};

// Step 2: Update HomeScreen handlers
const handleCompleteHabit = async (habitId: string) => {
  // ... existing completion logic
  
  // Don't show celebration popup immediately - wait for undo timeout
  setCompletionData({ habit, achievements: newAchievements });
};

const handleUndoComplete = async (action: UndoAction) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    
    // Remove completion from database
    await databaseService.removeHabitCompletion(action.habitId, today);
    
    // Rollback stats (need completion data for points)
    const habit = habits?.find(h => h.id === action.habitId);
    if (habit) {
      await databaseService.rollbackUserStats(habit.points, today);
    }
    
    // Refresh UI
    refetchCompletions();
    refetchStats();
    refetchHabits();
    
  } catch (error) {
    console.error('Undo failed:', error);
    Alert.alert('Undo Failed', 'Could not undo the action. Please try again.');
  }
};
```

### 7. User Experience Flow

1. **User swipes right** → Habit marked complete
2. **UndoToast appears** → "Completed [Habit Name] - UNDO"
3. **5-second timer** → Auto-dismiss if no action
4. **User taps UNDO** → Completion removed, stats rolled back
5. **Success feedback** → Brief confirmation of undo

### 8. Error Handling

- **Network issues**: Queue undo actions if offline
- **Database errors**: Show error message, maintain undo option
- **Concurrent actions**: Handle multiple pending undos
- **App backgrounding**: Pause/resume undo timers appropriately

### 9. Testing Checklist

- [ ] Undo completion removes from database and updates stats
- [ ] Undo archive restores habit to active list
- [ ] Timer auto-dismisses after 5 seconds
- [ ] Multiple rapid swipes handle undo state correctly
- [ ] App backgrounding doesn't break undo timers
- [ ] Screen rotation preserves undo state
- [ ] Accessibility support for undo actions

### 10. Files to Create/Modify

**New Files:**
- `/components/UndoToast.tsx`
- `/src/hooks/useUndoState.ts`

**Files to Update:**
- `/components/SwipeableHabitCard.tsx` - Add undo data capture
- `/app/index.tsx` - Add UndoToast and undo handlers
- `/src/services/database.ts` - Add undo database methods
- `/src/hooks/useCompletions.ts` - Add remove completion method

### 11. Success Criteria for Phase 2

- [ ] Undo works for both complete and archive actions
- [ ] Toast shows for exactly 5 seconds unless dismissed
- [ ] Undo correctly reverses database state and UI
- [ ] No crashes or data corruption from undo actions
- [ ] Celebration popup delayed until undo timeout expires

## Implementation Priority

1. **High**: UndoToast component and basic undo state
2. **High**: Database methods for removing completions
3. **Medium**: Stats rollback functionality  
4. **Medium**: Integration with existing swipe handlers
5. **Low**: Advanced error handling and edge cases

## Development Notes

- Focus on completion undo first (more critical than archive undo)
- Use React state for undo management (no need for AsyncStorage for 5-second timeouts)
- Consider showing celebration popup only after undo timeout expires
- Test thoroughly on both iOS and Android for gesture conflicts