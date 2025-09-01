# Phase 2.5: UX Improvements

## Current Status
✅ **Phase 1 Complete**: Basic swipe gestures are working
✅ **Phase 2 Complete**: Undo system implemented
✅ **Phase 2.5 Complete**: UX improvements implemented

## Phase 2.5 Objective
Address UX improvements identified before moving to Phase 3:

1. **Click-to-uncomplete functionality** - Allow users to click completed habits to unmark them
2. **Fix swipe action visibility** - Improve the positioning of action indicators during swipes

## Proposed Changes

### 1. Click-to-Uncomplete Functionality

**Problem**: Currently completed habits cannot be unmarked by clicking them.

**Solution**: Add click-to-uncomplete functionality for completed habits.

**Implementation:**
- Update `HabitCard.tsx` to handle clicks on completed habits
- Add `removeHabitCompletion` call when clicking completed habits
- Update database rollback for stats when uncompleting
- Show undo toast for uncomplete actions too
- Visual feedback to indicate completed habits are clickable

**Files to modify:**
- `/components/HabitCard.tsx` - Add uncomplete handler
- `/app/index.tsx` - Add handleUncompleteHabit function
- UndoToast already supports this with existing undo system

### 2. Fix Swipe Action Visibility

**Problem**: Current swipe indicators are not optimally positioned:
- When swiping left (archive), user sees "Complete" action on the right
- When swiping right (complete), user doesn't see the action clearly

**Solution**: Improve action indicator positioning during swipes.

**Current behavior:**
```
[Archive] ← HABIT → [Complete]
```

**Proposed behavior:**
```
Left swipe shows:  [Archive] ← HABIT →
Right swipe shows: ← HABIT → [Complete]
```

**Implementation:**
- Update `SwipeableHabitCard.tsx` to show only relevant action during swipe
- When swiping left, only show archive action (hide complete)
- When swiping right, only show complete action (hide archive)
- Improve visual feedback with better positioning

**Files to modify:**
- `/components/SwipeableHabitCard.tsx` - Update action visibility logic

## Implementation Plan

### Step 1: Click-to-Uncomplete
1. Update HabitCard to detect clicks on completed habits
2. Add uncomplete handler in HomeScreen
3. Create undo action for uncomplete operations
4. Test the flow: complete → click to uncomplete → undo uncomplete

### Step 2: Improve Swipe Indicators
1. Modify SwipeableHabitCard gesture logic
2. Show only relevant action based on swipe direction
3. Improve positioning of action indicators
4. Test visual feedback during swipes

## User Experience Flow

### Click-to-Uncomplete Flow:
1. **Habit is completed** (via tap or swipe)
2. **User clicks completed habit** → Habit unmarked, stats rolled back
3. **UndoToast appears** → "Unmarked [Habit Name] - UNDO"
4. **User can undo** → Restores completion and stats

### Improved Swipe Visual Flow:
1. **User starts swiping left** → Only shows archive action on left
2. **User starts swiping right** → Only shows complete action on right
3. **Better visual clarity** → User sees only relevant action

## Success Criteria

- [x] Completed habits can be clicked to unmark them
- [x] Unmarking shows undo toast with proper rollback
- [x] Swipe left only shows archive action (not complete)
- [x] Swipe right only shows complete action (not archive)
- [x] Visual feedback is clear and intuitive
- [x] No regression in existing swipe functionality

## Implementation Summary

### ✅ Click-to-Uncomplete Implementation:
- Updated `HabitCard.tsx` to handle clicks on completed habits
- Added `handleUncompleteHabit` function in `HomeScreen` 
- Integrated with existing undo system
- Added 'uncomplete' action type to `UndoToast`

### ✅ Swipe Action Visibility Fix:
- Modified `getIconOpacity` in `SwipeableHabitCard.tsx`
- Left swipe now only shows archive action
- Right swipe now only shows complete action
- Improved visual clarity during swipe gestures

### Flow Verification:
1. **Complete → Uncomplete → Undo**: ✅ Working
2. **Swipe Visual Feedback**: ✅ Improved
3. **Undo System Integration**: ✅ Seamless

## Technical Considerations

### Click-to-Uncomplete:
- Reuse existing database methods (`removeHabitCompletion`, `rollbackUserStats`)
- Extend UndoAction type to include 'uncomplete' type
- Handle edge cases (multiple clicks, concurrent operations)

### Swipe Indicators:
- Modify `getIconOpacity` logic to hide irrelevant actions
- Update interpolation ranges for better visual feedback
- Ensure animations remain smooth during direction changes

## Files to Create/Modify

**No new files needed**

**Files to Update:**
- `/components/HabitCard.tsx` - Add uncomplete click handler
- `/components/SwipeableHabitCard.tsx` - Improve action visibility
- `/app/index.tsx` - Add uncomplete handler
- `/components/UndoToast.tsx` - Support 'uncomplete' action type

## Testing Checklist

- [ ] Click completed habit to unmark it
- [ ] Undo uncomplete action restores completion
- [ ] Swipe left shows only archive action
- [ ] Swipe right shows only complete action
- [ ] No visual artifacts during swipe direction changes
- [ ] Accessibility still works with new click behavior