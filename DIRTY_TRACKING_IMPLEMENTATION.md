# Mindmap Dirty Tracking & Save with Thumbnail - Implementation Summary

## Overview
This implementation adds dirty state tracking to prevent users from navigating away from a mindmap with unsaved changes, similar to the presentation feature. It also integrates thumbnail generation during the save process.

## Files Created

### 1. **`stores/dirty.ts`** - Dirty State Management
- **Purpose**: Zustand store to manage the dirty/unsaved state of the mindmap
- **Key Features**:
  - `isDirty`: Boolean state tracking unsaved changes
  - `markDirty()`: Sets state to dirty and dispatches custom event
  - `markSaved()`: Clears dirty state after successful save
  - `reset()`: Resets dirty state on component unmount
  - Custom event dispatch: `app.mindmap.dirty-state-changed` for cross-component communication

### 2. **`hooks/useMindmapDirtyTracking.ts`** - Change Detection Hook
- **Purpose**: Monitors nodes/edges changes and marks mindmap as dirty
- **Key Features**:
  - Compares current and previous state using JSON serialization
  - Only dispatches if state actually changed (prevents duplicate events)
  - Uses ref to avoid recreating on every render
  - Automatically integrates with `useDirtyStore`

### 3. **`hooks/useMindmapUnsavedChangesBlocker.ts`** - Navigation Guard
- **Purpose**: Blocks navigation when there are unsaved changes
- **Key Features**:
  - Listens to `app.mindmap.dirty-state-changed` events
  - Uses React Router's `useBlocker` to prevent navigation
  - Shows confirmation dialog when navigation is blocked
  - `handleProceed()`: Allows navigation and clears dirty state
  - `handleStay()`: Cancels navigation attempt
  - Mimics presentation feature's implementation pattern

## Files Modified

### 1. **`hooks/useSaveMindmapWithThumbnail.ts`**
- Added import: `useDirtyStore`
- Added call to `markSaved()` after successful save
- Marks mindmap as clean after thumbnail + save completes

### 2. **`pages/MindmapPage.tsx`**
- Added imports for dirty tracking and blocker hooks
- Integrated `useMindmapDirtyTracking()` hook
- Integrated `useMindmapUnsavedChangesBlocker()` hook
- Wrapped component in fragment to include `UnsavedChangesDialog`
- Passes blocker state/handlers to dialog component

### 3. **`stores/index.ts`**
- Exported `useDirtyStore` from dirty store module

## How It Works

### Flow Diagram
```
1. User makes changes to mindmap
   ↓
2. useMindmapDirtyTracking detects change
   ↓
3. markDirty() called → isDirty = true
   ↓
4. Custom event dispatched: app.mindmap.dirty-state-changed
   ↓
5. useMindmapUnsavedChangesBlocker receives event
   ↓
6. User attempts to navigate away
   ↓
7. useBlocker intercepts navigation
   ↓
8. showDialog = true → UnsavedChangesDialog appears
   ↓
   ├─→ User clicks Stay → blocker.reset() → stay on page
   └─→ User clicks Leave → blocker.proceed() → navigate away
   
9. User saves mindmap (SaveMindmapButton)
   ↓
10. saveMindmapWithThumbnail()
    - Generates thumbnail (base64)
    - Saves to API with metadata
    ↓
11. markSaved() called → isDirty = false
    ↓
12. Custom event dispatched with isDirty = false
    ↓
13. Dialog hidden, user can navigate freely
```

## Key Features

### ✅ Dirty Tracking
- Detects any change to nodes or edges
- Marks mindmap as dirty automatically
- Efficient change detection (compares JSON, only marks once)

### ✅ Navigation Prevention
- Blocks navigation with confirmation dialog
- Uses React Router's `useBlocker` API
- Matches presentation feature behavior

### ✅ Save Integration
- Thumbnail generated automatically during save
- Dirty state cleared after successful save
- Toast notifications for user feedback

### ✅ Custom Events
- `app.mindmap.dirty-state-changed`: Cross-component communication
- Allows separation of concerns between stores and UI components

## Technical Details

### Change Detection Strategy
```typescript
// Compares JSON stringified versions
const currentState = {
  nodes: JSON.stringify(nodes),
  edges: JSON.stringify(edges),
};

if (currentState !== previousState) {
  markDirty(); // Only called if actually different
}
```

### Event Pattern
Similar to presentation feature:
```typescript
// Dispatch event
window.dispatchEvent(
  new CustomEvent('app.mindmap.dirty-state-changed', {
    detail: { isDirty: true },
  })
);

// Listen for event
const handleDirtyStateChange = (event: Event) => {
  const customEvent = event as CustomEvent<DirtyStateChangedDetail>;
  setHasUnsavedChanges(customEvent.detail.isDirty);
};
```

## Testing Scenarios

### Test 1: Basic Dirty Detection
1. Load mindmap
2. Modify a node
3. Verify dirty state is true
4. ✅ Dialog should show if navigating away

### Test 2: Save Clears Dirty
1. Make changes (dirty = true)
2. Click Save button
3. Wait for save to complete
4. Verify dirty state is false
5. ✅ Dialog should NOT show if navigating away

### Test 3: Navigation Blocking
1. Make changes to mindmap
2. Click browser back or navigate to different page
3. ✅ Dialog should appear asking to stay/leave
4. Click "Leave" → navigation proceeds
5. Click "Stay" → remain on page

### Test 4: Thumbnail Integration
1. Make changes to mindmap
2. Click Save button
3. ✅ Thumbnail should be generated and included in save
4. Verify in network tab that thumbnail is included in API payload

## Integration Points

### With Existing Systems
- **useCoreStore**: Provides nodes/edges for change detection
- **useDirtyStore**: Centralized dirty state management
- **useUpdateMindmapWithMetadata**: Already includes thumbnail in metadata
- **UnsavedChangesDialog**: Reused from presentation feature
- **React Router**: Navigation blocking via `useBlocker`

### User-Facing Components
- **Toolbar**: SaveMindmapButton now marks as saved
- **MindmapPage**: Orchestrates dirty tracking + blocking
- **Dialog**: Prevents accidental navigation away

## Future Enhancements

1. **Auto-save**: Automatically save after idle period
2. **Undo/Redo tracking**: Track dirty state through undo/redo
3. **Collaborative editing**: Share dirty state in real-time
4. **Unsaved indicator**: Show visual indicator in UI (like "*" in title)
5. **Grace period**: Wait before marking dirty (debounce rapid changes)

## Conclusion

The implementation follows React and Zustand best practices:
- ✅ Separation of concerns (store, hooks, components)
- ✅ Event-driven architecture for cross-component communication
- ✅ Efficient change detection with memoization
- ✅ Reuses existing patterns from presentation feature
- ✅ TypeScript strict mode compliance
- ✅ No external dependencies beyond existing ones
- ✅ Builds successfully without errors
