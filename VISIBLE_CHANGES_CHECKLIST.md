# Visible Changes Checklist

## What Should Be Different

### 1. ProductValidate Page (`/validate`)

**Before:**
- Green gradient section background (line 82)
- Orange/yellow colors in some cards

**After:**
- Green gradient section → Now uses primary blue gradient
- All cards use only blue (primary) or purple (secondary)

**Where to look:**
- Section with "How Validation Works" (3 steps) - background should be blue gradient, not green
- Large gradient box showing validation report - should be blue→purple gradient

---

### 2. Home Page (`/`)

**Before:**
- Step numbers: Blue, Purple, Green
- Various card colors

**After:**
- Step numbers: Blue (primary), Purple (secondary), Green (accent #059669)
- Cards use only primary/secondary colors

**Where to look:**
- "How It Works" section - 3 step numbers should show: Blue, Purple, Green (but green is now accent color, not card color)

---

## Troubleshooting: If You Don't See Changes

### Step 1: Restart Dev Server
```powershell
# Stop current dev server (Ctrl+C)
# Then restart:
cd frontend
npm run dev
```

### Step 2: Hard Refresh Browser
- **Chrome/Edge**: `Ctrl + Shift + R` or `Ctrl + F5`
- **Firefox**: `Ctrl + Shift + R`
- Or open DevTools → Network tab → Check "Disable cache" → Refresh

### Step 3: Clear Browser Cache
1. Open DevTools (F12)
2. Right-click refresh button
3. Select "Empty Cache and Hard Reload"

### Step 4: Verify CSS is Loading
1. Open DevTools (F12)
2. Go to Console tab
3. Type: `getComputedStyle(document.documentElement).getPropertyValue('--mkt-card-primary')`
4. Should return: `#eff6ff` (or `rgb(239, 246, 255)`)

### Step 5: Check Network Tab
1. Open DevTools → Network tab
2. Filter by "CSS"
3. Make sure `theme.css` and `marketing-tokens.css` are loading
4. Check they're not cached (Status should be 200, not 304)

---

## Quick Visual Test

### Test 1: Check Primary Color
1. Go to `/validate` page
2. Inspect any button or primary element
3. Should show `#2563EB` (not `#0052CC`)

### Test 2: Check Card Colors
1. Go to `/validate` page
2. Inspect any feature card
3. Background should be `#eff6ff` (primary) or `#f3e8ff` (secondary)
4. Should NOT see orange (`#fff7ed`) or yellow (`#fefce8`)

### Test 3: Check Gradient Sections
1. Go to `/validate` page
2. Scroll to "How Validation Works" section
3. Background should be blue gradient (not green)
4. Inspect element → should show `var(--mkt-card-primary)` in gradient

---

## If Still Not Working

1. **Check you're on the right branch:**
   ```bash
   git branch
   # Should show: * color-palette-consolidation
   ```

2. **Verify files are saved:**
   - Check `frontend/src/styles/theme.css` line 122-123
   - Should see: `--mkt-card-primary` and `--mkt-card-secondary`

3. **Check browser console for errors:**
   - Open DevTools → Console
   - Look for CSS loading errors

4. **Try incognito/private window:**
   - Opens without cache
   - Should show changes immediately

---

## Expected Color Values

After changes, you should see:
- `--mkt-card-primary`: `#eff6ff` (light blue)
- `--mkt-card-secondary`: `#f3e8ff` (light purple)
- `--mkt-primary`: `#2563EB` (blue)
- `--color-primary`: `#2563EB` (in marketing-tokens.css)

