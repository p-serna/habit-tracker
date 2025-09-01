# Epic Title

## Epic Metadata
- **Epic Number**: XXX
- **Epic Type**: [Feature/Enhancement/Bugfix/Technical]
- **Priority**: [High/Medium/Low]
- **Dependencies**: [List other epic numbers or "None"]
- **Estimated Effort**: [Small/Medium/Large/XL]
- **Target Release**: [Version or Sprint]

## Problem Statement
Brief description of the problem this epic solves or the value it provides.

## Overview
Detailed description of what will be implemented and why. Include user value and technical rationale.

## User Stories
- **As a** [user type], **I want** [functionality] **so that** [benefit]
- [Additional user stories as needed]

## Acceptance Criteria
- [ ] [Specific, testable criteria for epic completion]
- [ ] [Additional criteria]

## Tasks Checklist

### Phase 1: [Phase Name]
- [ ] [Specific implementation task]
- [ ] [Another task]

### Phase 2: [Phase Name]  
- [ ] [Implementation task]
- [ ] [Another task]

### [Additional Phases as needed]

## Technical Specifications

### Dependencies
```json
{
  "package-name": "~version"
}
```

### Database Changes
```sql
-- SQL schema changes if applicable
```

### API Changes
```typescript
// TypeScript interfaces for new/changed APIs
```

### Component Architecture
```typescript
// Key component interfaces and structure
```

### File Structure Changes

#### New Files to Create:
```
path/to/
  newFile.ts               # Description of file
  anotherFile.tsx          # Description of file
```

#### Files to Update:
- `path/to/file.ts` - Description of changes needed
- `path/to/another.tsx` - Description of changes needed

#### Files to Remove:
- `path/to/obsolete.ts` - Reason for removal

## Implementation Strategy

### Development Approach
1. [Step-by-step implementation approach]
2. [Another step]

### Testing Strategy
1. **Unit Tests**: [Description]
2. **Integration Tests**: [Description]  
3. **E2E Tests**: [Description]
4. **Performance Tests**: [Description]

### Rollback Plan
1. [Steps to revert changes if needed]
2. [Backup strategy]

## Success Metrics
- [ ] [Measurable success criteria]
- [ ] [Performance benchmarks]
- [ ] [User experience goals]

## Benefits
- ✅ [Benefit to users]
- ✅ [Technical benefit]
- ✅ [Business value]

## Trade-offs
- ❌ [Potential drawback]
- ❌ [Technical complexity cost]
- ❌ [Performance impact]

## Risk Assessment
- **Technical Risks**: [Potential technical challenges]
- **User Experience Risks**: [UX concerns]
- **Performance Risks**: [Performance considerations]
- **Mitigation Strategies**: [How to address risks]

## Future Considerations
- [How this epic enables future work]
- [Potential extensions or improvements]
- [Long-term maintenance considerations]

## Notes
- [Any additional context]
- [Implementation decisions]
- [Links to research or references]

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