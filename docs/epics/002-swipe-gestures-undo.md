# Swipe Gestures and Undo Implementation

## Epic Metadata
- **Epic Number**: 002
- **Epic Type**: Feature
- **Priority**: High
- **Dependencies**: 001 (SQLite Migration)
- **Estimated Effort**: Large
- **Target Release**: v2.1

## Problem Statement
Users currently need to tap habits and confirm in a popup to mark them as completed. This creates friction in daily habit tracking and doesn't provide an intuitive way to remove unwanted habits.

## Overview
Implement swipe gestures for habit management with undo functionality. Users will be able to swipe left to archive habits and swipe right to mark habits as completed, with immediate visual feedback and undo options.

## User Stories
- **As a** habit tracker user, **I want** to swipe right on habits to mark them complete **so that** I can quickly track my daily progress
- **As a** habit tracker user, **I want** to swipe left on habits to archive them **so that** I can remove habits I no longer need
- **As a** habit tracker user, **I want** to undo accidental swipe actions **so that** I can recover from mistakes

## Acceptance Criteria
- [ ] Right swipe marks habit as completed for today
- [ ] Left swipe archives habit (removes from active list)
- [ ] Both swipe actions show undo option for 5 seconds
- [ ] Completion popup modal is removed
- [ ] Gestures work smoothly on iOS and Android
- [ ] Swipe actions include haptic feedback
- [ ] Accessibility alternatives exist for swipe actions

## Tasks Checklist

### Phase 1: Swipe Gesture Foundation
- [ ] Install and configure react-native-gesture-handler (if not already present)
- [ ] Create SwipeableHabitCard component wrapper
- [ ] Implement left swipe detection for habit deletion
- [ ] Implement right swipe detection for habit completion
- [ ] Add visual feedback during swipe (reveal action buttons/icons)
- [ ] Test swipe sensitivity and thresholds on different devices

### Phase 2: Swipe Actions Implementation
- [ ] Implement left swipe action: trigger habit archiving
- [ ] Implement right swipe action: trigger habit completion
- [ ] Add swipe action animations (smooth transitions)
- [ ] Implement swipe action confirmation thresholds
- [ ] Add haptic feedback for swipe actions (iOS/Android)
- [ ] Replace current tap-to-complete with swipe-to-complete

### Phase 3: Undo System
- [ ] Create UndoToast component for temporary notifications
- [ ] Implement undo state management (temporary storage)
- [ ] Add undo functionality for habit archiving
- [ ] Add undo functionality for habit completion
- [ ] Configure undo timeout (e.g., 5 seconds)
- [ ] Handle app backgrounding/foregrounding during undo period

### Phase 4: UI/UX Polish
- [ ] Remove existing completion popup modal
- [ ] Add swipe gesture hints/tutorials for new users
- [ ] Implement smooth animations for swipe reveals
- [ ] Add accessibility support for swipe actions
- [ ] Test gesture conflicts with scrolling
- [ ] Optimize performance for lists with many habits

### Phase 5: Testing and Validation
- [ ] Unit tests for swipe gesture handlers
- [ ] Integration tests for undo functionality
- [ ] Test swipe gestures on various screen sizes
- [ ] Test accessibility with VoiceOver/TalkBack
- [ ] Performance testing with long habit lists
- [ ] User acceptance testing for gesture feel

## Technical Specifications

### Dependencies
```json
{
  "react-native-gesture-handler": "~2.14.0",
  "@react-native-async-storage/async-storage": "~1.21.0"
}
```

### Component Architecture

#### SwipeableHabitCard Component
```typescript
interface SwipeableHabitCardProps {
  habit: Habit;
  onComplete: (habitId: string) => void;
  onArchive: (habitId: string) => void;
  isCompleted: boolean;
}

// Wraps existing HabitCard with swipe functionality
const SwipeableHabitCard: React.FC<SwipeableHabitCardProps>
```

#### UndoToast Component
```typescript
interface UndoAction {
  type: 'complete' | 'archive';
  habitId: string;
  habitName: string;
  timestamp: number;
}

interface UndoToastProps {
  action: UndoAction | null;
  onUndo: () => void;
  onDismiss: () => void;
}

const UndoToast: React.FC<UndoToastProps>
```

### Gesture Configuration

#### Swipe Thresholds
- **Activation threshold**: 100px horizontal movement
- **Completion threshold**: 150px horizontal movement  
- **Velocity threshold**: 500px/s for quick swipes
- **Undo timeout**: 5 seconds

#### Visual Feedback
- **Left swipe**: Red background with delete icon
- **Right swipe**: Green background with checkmark icon
- **Swipe progress**: Gradually reveal action background
- **Completion animation**: Smooth slide-out effect

### State Management

#### Temporary Undo State
```typescript
interface UndoState {
  pendingAction: UndoAction | null;
  originalHabitState: Habit | null;
  timeoutId: NodeJS.Timeout | null;
}

// Store in component state or context
const useUndoState = () => {
  const [undoState, setUndoState] = useState<UndoState>({
    pendingAction: null,
    originalHabitState: null,
    timeoutId: null
  });
}
```

### Database Changes

#### Habit Model Updates
```sql
-- Add archived status to existing habits table
ALTER TABLE habits ADD COLUMN archivedAt INTEGER NULL;
ALTER TABLE habits ADD COLUMN isArchived INTEGER NOT NULL DEFAULT 0;

-- Index for efficient archived habit queries
CREATE INDEX idx_habits_archived ON habits(isArchived);
```

#### Archive Operations
```typescript
// Add to DatabaseService
async archiveHabit(habitId: string): Promise<void> {
  await this.db.runAsync(
    'UPDATE habits SET isArchived = 1, archivedAt = ? WHERE id = ?',
    [Date.now(), habitId]
  );
}

async unarchiveHabit(habitId: string): Promise<void> {
  await this.db.runAsync(
    'UPDATE habits SET isArchived = 0, archivedAt = NULL WHERE id = ?',
    [habitId]
  );
}
```

### Animation Specifications

#### Swipe Reveal Animation
```typescript
const swipeAnimation = {
  duration: 200,
  easing: 'ease-out',
  properties: ['translateX', 'opacity']
};
```

#### Undo Toast Animation
```typescript
const undoToastAnimation = {
  enter: { translateY: 100, opacity: 0 },
  visible: { translateY: 0, opacity: 1 },
  exit: { translateY: 100, opacity: 0 },
  duration: 300
};
```

### File Structure Changes

#### New Files to Create:
```
src/
  components/
    SwipeableHabitCard.tsx     # Main swipeable wrapper component
    UndoToast.tsx              # Undo notification component
  hooks/
    useUndoState.ts            # Undo state management
    useSwipeGestures.ts        # Swipe gesture logic
  utils/
    gestureHelpers.ts          # Swipe calculation utilities
```

#### Files to Update:
- `app/index.tsx` - Replace HabitCard with SwipeableHabitCard
- `components/HabitCard.tsx` - Remove click-to-complete functionality
- `src/services/database.ts` - Add archive/unarchive methods
- `src/hooks/useHabits.ts` - Add archive operations

### Implementation Approach

#### Phase 1: Basic Swipe Detection
1. Install react-native-gesture-handler
2. Create SwipeableHabitCard wrapper around existing HabitCard
3. Implement PanGestureHandler for swipe detection
4. Add basic left/right swipe differentiation

#### Phase 2: Action Integration
1. Connect left swipe to archive function
2. Connect right swipe to completion function  
3. Add visual feedback during swipe
4. Implement swipe completion thresholds

#### Phase 3: Undo System
1. Create temporary state system for recent actions
2. Implement UndoToast component with timeout
3. Add undo handlers for each action type
4. Test undo timing and edge cases

### Testing Strategy

1. **Unit Tests**: Test swipe gesture handlers and undo state management
2. **Integration Tests**: Test complete swipe-to-action workflows
3. **Gesture Testing**: Verify swipe detection accuracy across devices and screen sizes
4. **Animation Testing**: Ensure smooth 60fps animations during swipes
5. **Undo Testing**: Test undo timing, app backgrounding scenarios, concurrent actions
6. **Accessibility Testing**: Verify VoiceOver/TalkBack compatibility and alternative access methods
7. **Performance Testing**: Test with 100+ habits in list, measure gesture response time

### Rollback Plan
1. Keep current tap-to-complete functionality in feature flag
2. Implement gradual rollout to subset of users
3. Monitor gesture accuracy and user satisfaction metrics
4. Revert to tap-to-complete if user feedback is negative

## Success Metrics
- [ ] 90%+ swipe gesture accuracy (intended action matches result)
- [ ] <200ms average gesture response time
- [ ] <5% undo usage rate (indicates intuitive gestures)
- [ ] No performance regression in list scrolling
- [ ] 100% accessibility compliance

### Benefits
- ✅ Faster habit management (no popups)
- ✅ Modern swipe-based interaction pattern
- ✅ Mistake prevention with undo functionality
- ✅ Reduced cognitive load (fewer taps)
- ✅ Better one-handed usability

### Trade-offs
- ❌ Learning curve for existing users
- ❌ Potential accidental swipes
- ❌ Additional complexity in gesture handling
- ❌ More memory usage for undo state

## Risk Assessment
- **Technical Risks**: Gesture conflicts with FlatList scrolling, animation performance
- **User Experience Risks**: Accidental swipes, discoverability of new gestures
- **Performance Risks**: Memory usage for undo state, animation frame drops
- **Mitigation Strategies**: Comprehensive user testing, gradual rollout, clear visual feedback

## Future Considerations
- Enable custom swipe actions configuration
- Add swipe gestures to other list items (achievements, archived habits)
- Implement advanced gesture patterns (multi-touch, long press + swipe)
- Consider swipe gesture analytics for usage patterns

## Notes
- Gesture thresholds may need device-specific tuning
- Consider platform-specific gesture conventions (iOS vs Android). If necessary, we focus first on Android.
- Ensure gestures work with external keyboards and accessibility devices

## Success Criteria
- [ ] Users can swipe left to archive habits with undo option
- [ ] Users can swipe right to complete habits with undo option  
- [ ] No completion popup modal appears
- [ ] Swipe gestures feel responsive and natural
- [ ] Undo system works reliably within timeout period
- [ ] No performance regression with gesture handling