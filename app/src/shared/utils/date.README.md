# Single-Timezone Date Handling

## Overview

This project uses a **single-timezone approach** where all users are in the same timezone (UTC+7). This simplifies date handling significantly.

## Configuration

Set the timezone offset in `/shared/utils/date.ts`:

```typescript
export const LOCAL_TIMEZONE_OFFSET = 7; // UTC+7 (Vietnam, Thailand, etc.)
```

## How It Works

Backend stores dates in **local time (UTC+7)** but marks them as UTC:

```json
{
  "createdAt": "2024-01-05T10:00:00.000Z"  // Means 10 AM local, but marked as UTC
}
```

**Problem:** Browser sees `Z` suffix → interprets as UTC → shows wrong time

**Solution:** `parseDateSafe()` adds 7 hours to compensate:

```typescript
const date = parseDateSafe("2024-01-05T10:00:00.000Z");
// Adds 7 hours internally → displays as 10 AM local ✅
```

## Usage

Simply use `parseDateSafe()` everywhere you parse dates:

```typescript
import { parseDateSafe } from '@/shared/utils/date';
import { formatDistanceToNow } from 'date-fns';

// ✅ Correct - Automatically adjusts for timezone
const relativeTime = formatDistanceToNow(parseDateSafe(post.createdAt), {
  addSuffix: true
});

// ❌ Wrong - Will show 7 hours offset
const relativeTime = formatDistanceToNow(new Date(post.createdAt), {
  addSuffix: true
});
```

## Backend Requirements

Your backend should:

1. **Store dates in local time** (UTC+7)
2. **Can use any format:**
   - With Z suffix: `"2024-01-05T10:00:00.000Z"` ✅ (frontend adjusts)
   - Without Z: `"2024-01-05T10:00:00"` ✅ (also works)
3. **Be consistent** - Don't mix formats

## Testing

To verify the fix is working:

1. Create a post/comment
2. Check it displays "just now" or "a few seconds ago"
3. Not "7 hours ago"!

### Debug Mode

To see what's happening:

```typescript
import { parseDateSafe, LOCAL_TIMEZONE_OFFSET } from '@/shared/utils/date';

const rawDate = "2024-01-05T10:00:00.000Z";
console.log('Timezone offset:', LOCAL_TIMEZONE_OFFSET);
console.log('Raw date:', rawDate);
console.log('Parsed (without adjustment):', new Date(rawDate));
console.log('Parsed (with adjustment):', parseDateSafe(rawDate));
```

## Advantages of Single-Timezone Approach

✅ **Simpler** - No complex timezone conversions
✅ **Faster** - Less computation
✅ **Consistent** - All users see the same time
✅ **Predictable** - No "what timezone is this?" confusion

## Limitations

⚠️ **Only works if ALL users are in the same timezone**

To support multiple timezones:
1. Set `LOCAL_TIMEZONE_OFFSET = 0` in `date.ts`
2. Update backend to store proper UTC timestamps
3. Test thoroughly

## Quick Reference

```typescript
// Always use this
import { parseDateSafe } from '@/shared/utils/date';
formatDistanceToNow(parseDateSafe(post.createdAt));

// Never use this
formatDistanceToNow(new Date(post.createdAt)); // ❌ Wrong timezone
```

## Troubleshooting

**Still showing wrong time?**

1. Verify offset: `console.log('Offset:', LOCAL_TIMEZONE_OFFSET)`
2. Try adjusting: If 8 hours off → set offset to 8
3. Check backend response format

**Change timezone:**
```typescript
export const LOCAL_TIMEZONE_OFFSET = 8; // Update in date.ts
```
