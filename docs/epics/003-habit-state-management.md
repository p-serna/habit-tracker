# Habit State Management and List Organization

## Epic Metadata
- **Epic Number**: 003
- **Epic Type**: Enhancement
- **Priority**: High
- **Dependencies**: 002 (Swipe Gestures)
- **Estimated Effort**: Medium
- **Target Release**: v2.2

## Problem Statement
Currently completed habits remain mixed with pending habits in the list, creating visual clutter and reducing focus on remaining tasks. Archived habits have no dedicated management system.

## Overview
Implement advanced habit state management including list organization, habit archiving system, and preparation for an "Old Habits" page. This builds on the swipe gesture system to provide complete habit lifecycle management.

## User Stories
- **As a** habit tracker user, **I want** completed habits to move to the end of the list **so that** I can focus on remaining tasks
- **As a** habit tracker user, **I want** to access my archived habits **so that** I can restore them if needed
- **As a** habit tracker user, **I want** to search through old habits **so that** I can find previously tracked behaviors

## Acceptance Criteria
- [ ] Completed habits automatically move to end of active list
- [ ] Archived habits are stored separately from active habits
- [ ] Old Habits page shows archived habits with restore functionality
- [ ] List reordering animations are smooth and performant
- [ ] Archive operations maintain data integrity
- [ ] Search functionality works within archived habits

## Tasks Checklist

### Phase 1: Habit List Organization
- [ ] Implement automatic reordering: completed habits move to end
- [ ] Create habit sorting utilities (active first, completed last)
- [ ] Add visual distinction for completed vs pending habits
- [ ] Implement smooth list reordering animations
- [ ] Test list performance with frequent reordering
- [ ] Handle edge cases (all habits completed, etc.)

### Phase 2: Archived Habits Data Model
- [ ] Extend database schema for habit archiving
- [ ] Implement archive/unarchive database operations  
- [ ] Create archived habits query functions
- [ ] Add data migration for existing habits
- [ ] Implement archive cleanup utilities
- [ ] Test archive operations with existing data

### Phase 3: Archived Habits Management
- [ ] Create archived habits context/hook
- [ ] Implement restore functionality for archived habits
- [ ] Add permanent delete functionality
- [ ] Create archived habits counter/stats
- [ ] Implement search within archived habits
- [ ] Add bulk operations for archived habits

### Phase 4: UI Infrastructure for Old Habits
- [ ] Create basic "Old Habits" page structure (navigation only)
- [ ] Add archived habits list component
- [ ] Implement restore habit functionality
- [ ] Add archived habit detail view
- [ ] Create archive statistics dashboard
- [ ] Add export functionality for archived habits

### Phase 5: State Synchronization
- [ ] Ensure real-time list updates after completion
- [ ] Implement proper state refresh after archiving
- [ ] Handle concurrent modifications gracefully
- [ ] Add optimistic updates for better UX
- [ ] Test state consistency across app navigation
- [ ] Implement state persistence across app restarts

### Phase 6: Performance and Optimization
- [ ] Optimize habit list queries for large datasets
- [ ] Implement virtual scrolling for long lists
- [ ] Add pagination for archived habits
- [ ] Optimize reordering animations
- [ ] Test with 500+ habits (100+ archived)
- [ ] Implement caching strategies

## Technical Specifications

### Enhanced Database Schema

#### Updated Habits Table
```sql
-- Extend existing habits table with archiving support
ALTER TABLE habits ADD COLUMN archivedAt INTEGER NULL;
ALTER TABLE habits ADD COLUMN isArchived INTEGER NOT NULL DEFAULT 0;
ALTER TABLE habits ADD COLUMN sortOrder INTEGER NOT NULL DEFAULT 0;

-- Indexes for efficient queries
CREATE INDEX idx_habits_archived ON habits(isArchived);
CREATE INDEX idx_habits_active_order ON habits(isArchived, sortOrder, createdAt);
CREATE INDEX idx_habits_completion_status ON habits(id, isArchived);
```

#### Archive Metadata Table
```sql
CREATE TABLE habitArchiveMeta (
  id TEXT PRIMARY KEY,
  totalArchivedCount INTEGER NOT NULL DEFAULT 0,
  lastArchivedAt INTEGER,
  lastRestoredAt INTEGER
);
```

### State Management Architecture

#### Habit List State
```typescript
interface HabitListState {
  activeHabits: Habit[];
  completedTodayIds: Set<string>;
  archivedCount: number;
  lastUpdateTime: number;
  sortOrder: 'completion' | 'created' | 'custom';
}

interface HabitListActions {
  reorderAfterCompletion: (habitId: string) => void;
  archiveHabit: (habitId: string) => Promise<void>;
  restoreHabit: (habitId: string) => Promise<void>;
  refreshList: () => Promise<void>;
}
```

#### Archived Habits Hook
```typescript
interface UseArchivedHabitsReturn {
  archivedHabits: Habit[];
  isLoading: boolean;
  totalCount: number;
  restoreHabit: (habitId: string) => Promise<void>;
  permanentlyDelete: (habitId: string) => Promise<void>;
  searchArchived: (query: string) => Habit[];
  bulkRestore: (habitIds: string[]) => Promise<void>;
}

const useArchivedHabits = (): UseArchivedHabitsReturn
```

### List Reordering Logic

#### Sorting Algorithm
```typescript
interface HabitSortOptions {
  completedToday: Set<string>;
  sortBy: 'completion' | 'created' | 'priority';
}

const sortHabits = (habits: Habit[], options: HabitSortOptions): Habit[] => {
  return habits.sort((a, b) => {
    // 1. Active habits first, completed today last
    const aCompleted = options.completedToday.has(a.id);
    const bCompleted = options.completedToday.has(b.id);
    
    if (aCompleted !== bCompleted) {
      return aCompleted ? 1 : -1; // Completed habits go to end
    }
    
    // 2. Within same completion status, sort by specified criteria
    switch (options.sortBy) {
      case 'created':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case 'priority':
        return b.points - a.points;
      default:
        return 0;
    }
  });
};
```

### Database Operations

#### Enhanced DatabaseService Methods
```typescript
// Add to existing DatabaseService class
export class DatabaseService {
  // ... existing methods

  async getActiveHabitsOrdered(): Promise<Habit[]> {
    return await this.db.getAllAsync(`
      SELECT * FROM habits 
      WHERE isArchived = 0 
      ORDER BY sortOrder ASC, createdAt DESC
    `);
  }

  async getArchivedHabits(limit = 50, offset = 0): Promise<Habit[]> {
    return await this.db.getAllAsync(`
      SELECT * FROM habits 
      WHERE isArchived = 1 
      ORDER BY archivedAt DESC 
      LIMIT ? OFFSET ?
    `, [limit, offset]);
  }

  async archiveHabit(habitId: string): Promise<void> {
    const now = Date.now();
    await this.db.runAsync(`
      UPDATE habits 
      SET isArchived = 1, archivedAt = ? 
      WHERE id = ?
    `, [now, habitId]);
    
    // Update archive metadata
    await this.updateArchiveMetadata(now);
  }

  async restoreHabit(habitId: string): Promise<void> {
    await this.db.runAsync(`
      UPDATE habits 
      SET isArchived = 0, archivedAt = NULL 
      WHERE id = ?
    `, [habitId]);
  }

  async updateHabitSortOrder(habitId: string, sortOrder: number): Promise<void> {
    await this.db.runAsync(`
      UPDATE habits 
      SET sortOrder = ? 
      WHERE id = ?
    `, [sortOrder, habitId]);
  }

  async getArchiveStats(): Promise<{count: number, lastArchivedAt: number | null}> {
    const result = await this.db.getFirstAsync(`
      SELECT COUNT(*) as count, MAX(archivedAt) as lastArchivedAt
      FROM habits 
      WHERE isArchived = 1
    `) as any;
    
    return {
      count: result.count || 0,
      lastArchivedAt: result.lastArchivedAt
    };
  }

  async searchArchivedHabits(query: string): Promise<Habit[]> {
    return await this.db.getAllAsync(`
      SELECT * FROM habits 
      WHERE isArchived = 1 
      AND (name LIKE ? OR description LIKE ?)
      ORDER BY archivedAt DESC
    `, [`%${query}%`, `%${query}%`]);
  }
}
```

### Component Architecture

#### Enhanced HabitList Component
```typescript
interface HabitListProps {
  habits: Habit[];
  completedToday: Set<string>;
  onHabitComplete: (habitId: string) => void;
  onHabitArchive: (habitId: string) => void;
  sortOrder: 'completion' | 'created' | 'priority';
}

const HabitList: React.FC<HabitListProps> = ({
  habits,
  completedToday,
  onHabitComplete,
  onHabitArchive,
  sortOrder
}) => {
  const sortedHabits = useMemo(() => 
    sortHabits(habits, { completedToday, sortBy: sortOrder }), 
    [habits, completedToday, sortOrder]
  );

  return (
    <AnimatedFlatList
      data={sortedHabits}
      renderItem={({ item }) => (
        <SwipeableHabitCard
          habit={item}
          isCompleted={completedToday.has(item.id)}
          onComplete={onHabitComplete}
          onArchive={onHabitArchive}
        />
      )}
      itemLayoutAnimation={LinearTransition}
    />
  );
};
```

#### Old Habits Page Component
```typescript
const OldHabitsPage: React.FC = () => {
  const { archivedHabits, isLoading, restoreHabit, permanentlyDelete } = useArchivedHabits();
  const [searchQuery, setSearchQuery] = useState('');
  
  const filteredHabits = useMemo(() => 
    searchQuery ? archivedHabits.filter(h => 
      h.name.toLowerCase().includes(searchQuery.toLowerCase())
    ) : archivedHabits, 
    [archivedHabits, searchQuery]
  );

  return (
    <View style={styles.container}>
      <SearchBar
        placeholder="Search archived habits..."
        value={searchQuery}
        onChangeText={setSearchQuery}
      />
      <ArchivedHabitsList
        habits={filteredHabits}
        onRestore={restoreHabit}
        onDelete={permanentlyDelete}
        isLoading={isLoading}
      />
    </View>
  );
};
```

### File Structure Changes

#### New Files to Create:
```
src/
  hooks/
    useArchivedHabits.ts       # Archived habits management
    useHabitSorting.ts         # List sorting utilities
  components/
    HabitList.tsx              # Enhanced list with reordering
    ArchivedHabitsList.tsx     # Archived habits display
    SearchBar.tsx              # Search component for archives
  screens/
    OldHabitsPage.tsx          # Archived habits screen
  utils/
    habitSorting.ts            # Sorting algorithms
    archiveHelpers.ts          # Archive utility functions
```

#### Files to Update:
- `app/index.tsx` - Use new HabitList component
- `src/services/database.ts` - Add archive methods
- `src/hooks/useHabits.ts` - Add sorting and archive operations
- `app/_layout.tsx` - Add Old Habits page navigation

### Animation Specifications

#### List Reordering Animation
```typescript
const reorderAnimation = {
  type: 'spring',
  stiffness: 300,
  damping: 30,
  mass: 1
};
```

#### Archive Action Animation
```typescript
const archiveAnimation = {
  duration: 400,
  easing: 'ease-in-out',
  transform: [
    { translateX: '100%' },
    { opacity: 0 },
    { scale: 0.8 }
  ]
};
```

### Performance Considerations

#### Virtual Scrolling for Large Lists
```typescript
const VirtualizedHabitList: React.FC<{habits: Habit[]}> = ({ habits }) => {
  const getItemLayout = useCallback((data: any, index: number) => ({
    length: ITEM_HEIGHT,
    offset: ITEM_HEIGHT * index,
    index,
  }), []);

  return (
    <FlatList
      data={habits}
      renderItem={renderHabitCard}
      getItemLayout={getItemLayout}
      windowSize={10}
      maxToRenderPerBatch={20}
      updateCellsBatchingPeriod={50}
      removeClippedSubviews={true}
    />
  );
};
```

### Testing Strategy

1. **Unit Tests**: Test sorting algorithms and archive operations
2. **Integration Tests**: Test complete habit lifecycle workflows
3. **State Consistency Tests**: Verify list updates after each operation
4. **Performance Tests**: Test with large datasets (500+ habits, 200+ archived)
5. **Animation Tests**: Ensure smooth 60fps during reordering
6. **Data Integrity Tests**: Verify archive/restore operations and data consistency
7. **Search Performance**: Test search with large archived datasets
8. **Memory Tests**: Monitor memory usage with frequent list updates

### Rollback Plan
1. Database schema changes are additive and can be safely ignored
2. Keep current list ordering logic in fallback mode
3. Archive system can be disabled without data loss
4. Old Habits page can be hidden from navigation if issues arise

## Success Metrics
- [ ] List reordering completes in <500ms with 50+ habits
- [ ] Archive operations complete in <100ms
- [ ] Search through 200+ archived habits returns results in <300ms
- [ ] Memory usage increases by <10MB with enhanced state management
- [ ] Zero data loss during archive/restore operations

### Benefits
- ✅ Organized habit list (completed habits at end)
- ✅ Complete habit lifecycle management
- ✅ Efficient archived habit storage and retrieval
- ✅ Foundation for advanced habit analytics
- ✅ Improved app organization and scalability

### Trade-offs
- ❌ Increased database complexity
- ❌ More complex state management
- ❌ Additional memory usage for sorting
- ❌ Potential performance impact with very large lists

## Risk Assessment
- **Technical Risks**: Database migration complexity, list performance with frequent updates
- **User Experience Risks**: Confusing list reordering, difficulty finding archived habits
- **Performance Risks**: Memory usage growth, animation stuttering with large lists
- **Mitigation Strategies**: Incremental migration, performance monitoring, user feedback collection

## Future Considerations
- Implement custom habit list ordering (drag-and-drop)
- Add habit categories and filtering
- Implement habit analytics based on archived data
- Add habit templates from archived habits
- Consider habit synchronization across devices

## Notes
- List reordering should feel natural and immediate
- Archive system prepares for advanced habit lifecycle features
- Old Habits page is foundation for habit history and analytics

## Implementation Priority

This document should be implemented **after** completing the swipe gestures document (002-swipe-gestures-undo.md), as it builds upon the archiving functionality introduced there.

## Success Criteria
- [ ] Completed habits automatically move to end of list
- [ ] Archived habits are stored separately and can be retrieved
- [ ] List reordering animations are smooth and performant
- [ ] Archive operations maintain data consistency
- [ ] Old Habits page infrastructure is ready for future development
- [ ] Performance remains acceptable with 200+ active habits
- [ ] User points restart functionality is available and working

## Epic Completion Guide

When wrapping up an epic, ensure the following steps are completed:

### Documentation
1. **Update Epic Status**: Mark epic as "✅ COMPLETED" with completion summary
2. **Mark All Tasks**: Ensure all checklist items are marked as complete or moved to future work
3. **Document Bug Fixes**: Add any bugs discovered and fixed during implementation
4. **Create Release Notes**: Add comprehensive release notes in `docs/release_notes/[epic-number]-[epic-name].md`

### Development Summary
- **Implementation Summary**: Create `docs/development/[epic-number]-implementation-summary.md` if phases were complex
- **Development Notes**: Document any phase-specific learnings in `docs/development/[epic-number]-phase[X]-[name].md`
- **Technical Decisions**: Record any important architectural or technical decisions made

### Code Quality
- **Bug Verification**: Test all functionality and fix any discovered issues
- **Code Review**: Ensure code follows project conventions and patterns
- **Performance**: Verify no performance regressions were introduced

### Release Preparation
- **Release Notes**: Include user-facing changes, technical improvements, and bug fixes
- **Migration Notes**: Document any required migration steps for users/developers
- **Future Work**: Clearly separate completed work from optional future enhancements

### PR Documentation
When creating the final PR to main:
- **Summary**: Concise overview of epic achievements
- **Technical Details**: Key implementation highlights and architecture changes
- **Test Plan**: Document testing approach and verification steps
- **Documentation Links**: Reference epic docs, development notes, and release notes