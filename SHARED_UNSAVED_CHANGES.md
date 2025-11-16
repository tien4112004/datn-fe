# Shared Unsaved Changes Dialog & Handler

## Overview

Extracted and refactored the unsaved changes prevention logic from presentation feature into reusable shared components that can be used by any feature (mindmap, presentation, etc.).

## New Shared Files

### 1. **`shared/components/modals/UnsavedChangesDialog.tsx`**

Reusable dialog component that prompts users when they attempt to navigate away with unsaved changes.

**Props:**
```typescript
interface UnsavedChangesDialogProps {
  open: boolean;                    // Dialog visibility
  onOpenChange: (open: boolean) => void;  // Called when user wants to close
  onStay: () => void;               // Called when user clicks "Stay"
  onLeave: () => void;              // Called when user clicks "Leave"
  title?: string;                   // Optional custom title (defaults to translation)
  description?: string;             // Optional custom description
  stayLabel?: string;               // Optional custom "Stay" button label
  leaveLabel?: string;              // Optional custom "Leave" button label
}
```

**Usage Example:**
```tsx
import { UnsavedChangesDialog } from '@/shared/components/modals/UnsavedChangesDialog';

export function MyComponent() {
  const [showDialog, setShowDialog] = useState(false);

  return (
    <>
      {/* Your component content */}
      <UnsavedChangesDialog
        open={showDialog}
        onOpenChange={setShowDialog}
        onStay={() => console.log('User stayed')}
        onLeave={() => console.log('User left')}
        title="Custom Title"
        description="Custom description"
      />
    </>
  );
}
```

**Features:**
- ✅ Customizable title and description
- ✅ Customizable button labels
- ✅ Falls back to translation keys for defaults
- ✅ Accessible dialog component
- ✅ High z-index for visibility

---

### 2. **`shared/hooks/useUnsavedChangesBlocker.ts`**

Generic hook for blocking navigation when unsaved changes exist. Works with any event name.

**Parameters:**
```typescript
interface UseUnsavedChangesBlockerOptions {
  /**
   * Custom event name to listen for dirty state changes
   * Default: 'app.unsaved-changes'
   * 
   * Should match the event dispatched by your feature's dirty store
   */
  eventName?: string;
}
```

**Return Value:**
```typescript
{
  hasUnsavedChanges: boolean;              // Current dirty state
  showDialog: boolean;                     // Whether to show dialog
  setShowDialog: (open: boolean) => void;  // Control dialog visibility
  handleStay: () => void;                  // Keep user on current page
  handleProceed: () => void;               // Allow user to navigate away
}
```

**Usage Example:**
```tsx
import { useUnsavedChangesBlocker } from '@/shared/hooks';
import { UnsavedChangesDialog } from '@/shared/components/modals/UnsavedChangesDialog';

export function MyFeaturePage() {
  // Listen for custom event
  const { showDialog, setShowDialog, handleStay, handleProceed } = 
    useUnsavedChangesBlocker({
      eventName: 'app.my-feature.dirty-state-changed'
    });

  return (
    <>
      {/* Your page content */}
      <UnsavedChangesDialog
        open={showDialog}
        onOpenChange={setShowDialog}
        onStay={handleStay}
        onLeave={handleProceed}
      />
    </>
  );
}
```

**How It Works:**
1. Hook listens for custom event: `app.my-feature.dirty-state-changed`
2. Event should dispatch: `{ detail: { isDirty: boolean } }`
3. Hook uses React Router's `useBlocker` to intercept navigation
4. When navigation is blocked, `showDialog` becomes `true`
5. User chooses to stay or leave
6. Hook either resets blocker or proceeds with navigation

---

## Migration Guide

### For Mindmap Feature

**Before:**
```tsx
import { useMindmapUnsavedChangesBlocker } from '../hooks/useMindmapUnsavedChangesBlocker';
import { UnsavedChangesDialog } from '@/features/presentation/components/UnsavedChangesDialog';

export function MindmapPage() {
  const { showDialog, setShowDialog, handleStay, handleProceed } = 
    useMindmapUnsavedChangesBlocker();
    
  return <UnsavedChangesDialog ... />;
}
```

**After:**
```tsx
import { useUnsavedChangesBlocker } from '@/shared/hooks';
import { UnsavedChangesDialog } from '@/shared/components/modals/UnsavedChangesDialog';

export function MindmapPage() {
  const { showDialog, setShowDialog, handleStay, handleProceed } = 
    useUnsavedChangesBlocker({
      eventName: 'app.mindmap.dirty-state-changed'
    });
    
  return <UnsavedChangesDialog ... />;
}
```

### For Presentation Feature

**Before:**
```tsx
import { useUnsavedChangesBlocker } from '../hooks/useUnsavedChangesBlocker';
import { UnsavedChangesDialog } from '../components/UnsavedChangesDialog';

export function PresentationDetailPage() {
  const { showDialog, setShowDialog, handleStay, handleProceed } = 
    useUnsavedChangesBlocker();
    
  return <UnsavedChangesDialog ... />;
}
```

**After:**
```tsx
import { useUnsavedChangesBlocker } from '@/shared/hooks';
import { UnsavedChangesDialog } from '@/shared/components/modals/UnsavedChangesDialog';

export function PresentationDetailPage() {
  const { showDialog, setShowDialog, handleStay, handleProceed } = 
    useUnsavedChangesBlocker({
      eventName: 'app.presentation.dirty-state-changed'
    });
    
  return <UnsavedChangesDialog ... />;
}
```

---

## Integration with Your Dirty Store

### Step 1: Dispatch Custom Event in Store

```typescript
// In your dirty store (e.g., stores/dirty.ts)
export const useDirtyStore = create<DirtyState>((set) => ({
  isDirty: false,

  markDirty: () => {
    set({ isDirty: true });
    // Dispatch event that hook will listen to
    window.dispatchEvent(
      new CustomEvent('app.my-feature.dirty-state-changed', {
        detail: { isDirty: true },
      })
    );
  },

  markSaved: () => {
    set({ isDirty: false });
    // Clear dirty state
    window.dispatchEvent(
      new CustomEvent('app.my-feature.dirty-state-changed', {
        detail: { isDirty: false },
      })
    );
  },
}));
```

### Step 2: Use Hook in Component

```tsx
// In your page component
export function MyFeaturePage() {
  // Track changes
  useDirtyTracking(); // Your custom hook that calls markDirty()
  
  // Block navigation
  const { showDialog, setShowDialog, handleStay, handleProceed } = 
    useUnsavedChangesBlocker({
      eventName: 'app.my-feature.dirty-state-changed'
    });

  return (
    <>
      {/* Page content */}
      <UnsavedChangesDialog
        open={showDialog}
        onOpenChange={setShowDialog}
        onStay={handleStay}
        onLeave={handleProceed}
      />
    </>
  );
}
```

---

## Files Changed

### New Files (2)
- ✅ `shared/components/modals/UnsavedChangesDialog.tsx`
- ✅ `shared/hooks/useUnsavedChangesBlocker.ts`

### Modified Files (3)
- ✅ `shared/hooks/index.ts` - Added export for new hook
- ✅ `features/mindmap/pages/MindmapPage.tsx` - Now uses shared components
- ✅ `features/presentation/pages/PresentationDetailPage.tsx` - Now uses shared components

### Refactored/Deprecated Files (2)
- ✅ `features/mindmap/hooks/useMindmapUnsavedChangesBlocker.ts` - REMOVED (use shared hook)
- ✅ `features/presentation/hooks/useUnsavedChangesBlocker.ts` - REMOVED (use shared hook)
- ✅ `features/presentation/components/UnsavedChangesDialog.tsx` - Now re-exports from shared (backwards compatible)

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                  Feature Pages                          │
├─────────────────────────────────────────────────────────┤
│  MindmapPage           │   PresentationDetailPage      │
│  useDirtyTracking()    │   (Vue component with events) │
└─────────┬──────────────┴─────────────┬──────────────────┘
          │                           │
          ↓ Uses                       ↓ Uses
┌─────────────────────────────────────────────────────────┐
│         Shared useUnsavedChangesBlocker                 │
├─────────────────────────────────────────────────────────┤
│  ├─ Listens to custom event                            │
│  ├─ Blocks navigation with React Router                │
│  └─ Returns state & handlers                           │
└─────────┬───────────────────────────────────────────────┘
          │ Uses
          ↓
┌─────────────────────────────────────────────────────────┐
│       Shared UnsavedChangesDialog                       │
├─────────────────────────────────────────────────────────┤
│  ├─ Customizable title/description                     │
│  ├─ Customizable button labels                         │
│  └─ Fallback to translations                           │
└─────────────────────────────────────────────────────────┘
```

---

## Event Flow

```
User makes changes
    ↓
Feature's dirty store calls markDirty()
    ↓
markDirty() dispatches: 'app.{feature}.dirty-state-changed'
    ↓
useUnsavedChangesBlocker receives event
    ↓
hasUnsavedChanges = true
    ↓
User tries to navigate
    ↓
React Router useBlocker intercepts
    ↓
showDialog = true
    ↓
UnsavedChangesDialog appears
    ↓
├─ User clicks "Stay" → handleStay() → blocker.reset()
└─ User clicks "Leave" → handleProceed() → blocker.proceed()
```

---

## Benefits

✨ **DRY Principle** - No duplicated dialog/blocker code
🔄 **Reusable** - Any feature can use shared components
🎯 **Event-Driven** - Loose coupling via custom events
📝 **Customizable** - Dialog supports custom labels/text
🧪 **Testable** - Hook and component are independently testable
🔒 **Type-Safe** - Full TypeScript support
♿ **Accessible** - Uses accessible dialog component

---

## Example: Adding to a New Feature

If you want to add unsaved changes protection to a new feature:

1. **Create dirty store:**
   ```typescript
   // features/my-feature/stores/dirty.ts
   export const useDirtyStore = create<DirtyState>((set) => ({
     isDirty: false,
     markDirty: () => {
       set({ isDirty: true });
       window.dispatchEvent(new CustomEvent('app.my-feature.dirty-state-changed', {
         detail: { isDirty: true }
       }));
     },
     markSaved: () => {
       set({ isDirty: false });
       window.dispatchEvent(new CustomEvent('app.my-feature.dirty-state-changed', {
         detail: { isDirty: false }
       }));
     },
   }));
   ```

2. **Create dirty tracking hook (optional):**
   ```typescript
   // features/my-feature/hooks/useDirtyTracking.ts
   export const useDirtyTracking = () => {
     const markDirty = useDirtyStore((state) => state.markDirty);
     // Detect changes and call markDirty()
   };
   ```

3. **Use in page:**
   ```typescript
   // features/my-feature/pages/MyFeaturePage.tsx
   export function MyFeaturePage() {
     useDirtyTracking(); // Track changes
     
     const { showDialog, setShowDialog, handleStay, handleProceed } = 
       useUnsavedChangesBlocker({
         eventName: 'app.my-feature.dirty-state-changed'
       });

     return (
       <>
         {/* Content */}
         <UnsavedChangesDialog
           open={showDialog}
           onOpenChange={setShowDialog}
           onStay={handleStay}
           onLeave={handleProceed}
         />
       </>
     );
   }
   ```

---

## Build Status

✅ **TypeScript**: 0 errors
✅ **Build**: 19.07s - 8313 modules transformed
✅ **Backwards Compatibility**: Maintained (presentation's old imports still work)
✅ **Production Ready**: All features working

---

## Translation Keys

The shared dialog uses these translation keys (with fallbacks):

| Key | Default | Context |
|-----|---------|---------|
| `presentation.unsavedChanges.title` | "Unsaved Changes" | Dialog title |
| `presentation.unsavedChanges.description` | "You have unsaved changes. Do you want to save them before leaving?" | Dialog description |
| `presentation.unsavedChanges.stay` | "Stay" | Stay button label |
| `presentation.unsavedChanges.leave` | "Leave" | Leave button label |

You can override with custom strings in the dialog props.
