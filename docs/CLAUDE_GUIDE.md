# Claude Code Assistant Guide

This document provides Claude with essential information about the Habit Tracker repository structure, patterns, and conventions to facilitate efficient development assistance.

## Repository Overview

**Project**: Habit Point Tracker - React Native app with SQLite backend for gamified habit tracking  
**Tech Stack**: React Native, Expo, Expo Router, SQLite, TypeScript, ESLint  
**Architecture**: Frontend-only app with local SQLite database

## Project Structure

```
habit-tracker/
├── app/                     # Expo Router pages (main screens)
│   ├── _layout.tsx         # Root layout with navigation setup
│   ├── index.tsx           # Home screen with habit list
│   ├── add-habit.tsx       # Add new habit form
│   └── achievements.tsx    # User achievements display
├── src/
│   ├── components/         # Reusable UI components
│   │   ├── DatabaseLoadingScreen.tsx
│   │   └── SwipeableHabitCard.tsx    # Main habit interaction component
│   ├── contexts/           # React contexts
│   │   └── SQLiteProvider.tsx        # Database context provider
│   ├── hooks/              # Custom React hooks
│   │   ├── useHabits.ts             # Habit CRUD operations
│   │   ├── useCompletions.ts        # Habit completion tracking
│   │   ├── useStats.ts              # User statistics
│   │   ├── useAchievements.ts       # Achievement system
│   │   └── useUndoState.ts          # Undo functionality
│   ├── services/           # Data layer
│   │   ├── database.ts              # Main database service class
│   │   └── migrations.ts            # Database migrations
│   ├── types/              # TypeScript type definitions
│   │   └── database.ts              # Core data types
│   └── utils/              # Utility functions
│       └── id.ts                    # ID generation
├── components/             # Legacy components (being migrated to src/)
│   ├── HabitCard.tsx       # Individual habit display
│   ├── StatsHeader.tsx     # Statistics header
│   ├── SwipeableHabitCard.tsx       # Swipe gesture wrapper
│   ├── UndoToast.tsx       # Undo notification
│   └── WeeklyProgress.tsx  # Progress visualization
└── docs/                   # Documentation
    ├── epics/              # Feature specifications
    ├── development/        # Implementation details
    └── release_notes/      # Version releases
```

## Key Data Models

### Core Types (src/types/database.ts)
- **Habit**: Main habit entity with name, color, icon, points, targets
- **HabitCompletion**: Daily completion tracking with points
- **Achievement**: Unlockable achievements for gamification
- **UserStats**: Aggregated user statistics and streaks

### Database Service (src/services/database.ts)
- SQLite-based with migration system
- CRUD operations for all entities
- Statistics calculation and aggregation
- Archive/unarchive functionality for habits

## Architecture Patterns

### Component Organization
- **Pages**: In `app/` directory using Expo Router
- **Reusable Components**: In `src/components/` (newer) and `components/` (legacy)
- **Data Hooks**: Custom hooks in `src/hooks/` for data operations
- **Context**: SQLiteProvider for database access throughout app

### State Management
- **Local State**: React hooks and context
- **Database**: SQLite with custom service layer
- **No External State Management**: Uses React's built-in state management

### Navigation
- **Expo Router**: File-based routing in `app/` directory
- **Stack Navigation**: Main navigation pattern

## Development Commands

```bash
npm start          # Start Expo development server
npm run android    # Run on Android device/emulator
npm run ios        # Run on iOS device/simulator  
npm run web        # Run in web browser
npm run lint       # Run ESLint (available linting command)
```

## Code Conventions

### TypeScript
- Strict typing enforced
- Interface definitions in `src/types/`
- All new code must be TypeScript

### Component Patterns
- **Functional components** with hooks
- **Props interfaces** defined inline or in types file
- **Custom hooks** for data operations and business logic
- **Context providers** for cross-component state

### File Naming
- **PascalCase** for components: `HabitCard.tsx`
- **camelCase** for hooks: `useHabits.ts`
- **camelCase** for utilities: `database.ts`
- **kebab-case** for pages: `add-habit.tsx`

## Documentation Patterns

### Epic Documentation (docs/epics/)
- **Template**: `000-template.md` provides comprehensive structure
- **Metadata**: Epic number, type, priority, dependencies, effort estimation
- **Sections**: Problem statement, user stories, acceptance criteria, technical specs
- **Task Tracking**: Detailed phase-based checklists with checkboxes
- **Completion Guide**: Final steps for epic completion and release

### Development Documentation (docs/development/)
- **Implementation Summaries**: High-level implementation overview
- **Phase Documentation**: Detailed phase-specific notes
- **Bug Fix Tracking**: Issues discovered and resolved during implementation

### Release Notes (docs/release_notes/)
- **Version Format**: `v-X-Y-Z-feature-name.md`
- **Structure**: New features, bug fixes, technical changes, migration notes
- **User-Focused**: Emphasizes user-facing improvements and changes

## Testing Approach

Currently **no automated testing framework** is configured. When adding tests:
1. Check if test framework exists before assuming one
2. Ask user for preferred testing approach
3. Look for existing test patterns in codebase

## Recent Major Changes

### Epic 002: Swipe Gestures & Undo (Completed)
- Implemented swipe left (archive) and right (complete) gestures
- Added 5-second undo system with toast notifications
- Fixed double points counting bug
- Enhanced user experience with haptic feedback

### Architecture Notes
- **SQLite Migration**: Recently migrated from Convex to local SQLite
- **Gesture Integration**: Uses react-native-gesture-handler
- **Component Migration**: Gradual move from `/components` to `/src/components`

## Feature Development Guidelines

### New Feature Process
1. **Create Epic**: Use `docs/epics/000-template.md` as base
2. **Plan Implementation**: Break into phases with clear tasks
3. **Document Progress**: Create development notes during implementation
4. **Release Documentation**: Write comprehensive release notes
5. **Update This Guide**: Add any new patterns or conventions

### Component Development
- **Check Existing Patterns**: Look at similar components first
- **Follow TypeScript**: Strict typing for all new components
- **Use Existing Hooks**: Leverage established data hooks
- **Test on Device**: Always test gesture/touch interactions on actual device

### Database Changes
- **Migration Required**: All schema changes need migrations in `src/services/migrations.ts`
- **Service Layer**: Add operations to `DatabaseService` class
- **Hook Integration**: Update relevant hooks for new operations
- **Type Updates**: Update TypeScript interfaces in `src/types/database.ts`

## Key Dependencies

```json
{
  "expo": "~53.0.9",
  "react-native": "0.79.2", 
  "expo-sqlite": "^15.2.14",
  "react-native-gesture-handler": "~2.24.0",
  "expo-router": "^5.1.4"
}
```

## Common Workflows

### Adding New Feature
1. Research existing codebase patterns
2. Create epic documentation if complex
3. Update database schema/migrations if needed
4. Implement components following existing patterns
5. Update hooks for data operations
6. Test on multiple platforms
7. Run linting: `npm run lint`
8. Document changes

### Bug Fixes
1. Reproduce and understand the issue
2. Identify root cause in codebase
3. Implement fix following existing patterns
4. Test fix thoroughly
5. Document fix in relevant epic or release notes
6. Run linting to ensure code quality

### Code Quality
- **Always run**: `npm run lint` before committing
- **Follow Patterns**: Mimic existing code style and architecture
- **TypeScript**: Maintain strict typing standards
- **Component Reuse**: Leverage existing components when possible

This guide should be updated whenever new patterns, conventions, or architectural decisions are made to keep Claude's understanding current and accurate.