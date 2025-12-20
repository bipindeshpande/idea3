# Color Backup & Restore Guide

**Created:** $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")
**Branch:** color-palette-consolidation (created from master)

## How to Revert Color Changes

### Method 1: Git Revert (Recommended - Easiest)
If you want to completely undo all color changes:

```bash
# Discard all changes and go back to original
git checkout master
git branch -D color-palette-consolidation
```

Or if you want to keep the branch but see original:
```bash
git checkout master
```

### Method 2: Restore from Backup Files
If you want to restore specific files, use the backup files in `frontend/src/styles/backup/`:

```bash
# Restore theme.css
cp frontend/src/styles/backup/theme.css.backup frontend/src/styles/theme.css

# Restore marketing-tokens.css
cp frontend/src/styles/backup/marketing-tokens.css.backup frontend/src/styles/marketing-tokens.css

# Restore marketing.css
cp frontend/src/styles/backup/marketing.css.backup frontend/src/styles/marketing.css
```

### Method 3: Manual Restore from Values Below
Copy the values from the backup section below and paste them into the respective files.

---

## Current Color Values Backup

### File: `frontend/src/styles/theme.css`

#### Light Mode (:root and [data-theme="light"])
```css
/* Core Brand Colors */
--accent: #2563EB;
--accent-hover: #1D4ED8;

/* Marketing Primary */
--mkt-primary: #2563eb;
--mkt-primary-hover: #1d4ed8;

/* Marketing Card Colors */
--mkt-card-blue: #eff6ff;
--mkt-card-green: #ecfdf5;
--mkt-card-orange: #fff7ed;
--mkt-card-purple: #f3e8ff;
--mkt-card-yellow: #fefce8;

/* Marketing Hero */
--mkt-hero-start: #eef2ff;
--mkt-hero-end: #dbeafe;

/* Marketing Surfaces */
--mkt-surface: #ffffff;
--mkt-surface-hover: #f8fafc;
--mkt-surface-muted: #f8fafc;

/* Marketing Text */
--mkt-text: #1e293b;
--mkt-text-dim: #475569;
--mkt-heading: #0f172a;
--mkt-subheading: #334155;

/* Marketing Borders */
--mkt-outline: #e2e8f0;
--mkt-divider: #e2e8f0;

/* Semantic Colors */
--success: #16A34A;
--warning: #D97706;
--danger: #DC2626;

/* Badge Colors */
--badge-success-bg: #DCFCE7;
--badge-success-text: #15803D;
--badge-success-border: #86EFAC;
--badge-info-bg: #E0E7FF;
--badge-info-text: #4338CA;
--badge-info-border: #A5B4FC;
--badge-warning-bg: #FFE4E6;
--badge-warning-text: #9F1239;
--badge-warning-border: #FDA4AF;
--badge-danger-bg: #FEE2E2;
--badge-danger-text: #B91C1C;
--badge-danger-border: #FCA5A5;
```

#### Dark Mode ([data-theme="dark"])
```css
/* Core Brand Colors */
--accent: #3B82F6;
--accent-hover: #2563EB;

/* Marketing Primary */
--mkt-primary: #3b82f6;
--mkt-primary-hover: #2563eb;

/* Marketing Card Colors */
--mkt-card-blue: rgba(59, 130, 246, 0.1);
--mkt-card-green: rgba(34, 197, 94, 0.1);
--mkt-card-orange: rgba(249, 115, 22, 0.1);
--mkt-card-purple: rgba(139, 92, 246, 0.1);
--mkt-card-yellow: rgba(234, 179, 8, 0.1);

/* Marketing Hero */
--mkt-hero-start: rgba(30, 41, 59, 0.3);
--mkt-hero-end: rgba(51, 65, 85, 0.3);

/* Marketing Surfaces */
--mkt-surface: #1e293b;
--mkt-surface-hover: #24324a;
--mkt-surface-muted: #0f172a;

/* Marketing Text */
--mkt-text: #f1f5f9;
--mkt-text-dim: #CBD5E1;
--mkt-heading: #f8fafc;
--mkt-subheading: #cbd5e1;

/* Marketing Borders */
--mkt-outline: #334155;
--mkt-divider: #334155;

/* Semantic Colors */
--success: #4ADE80;
--warning: #FBBF24;
--danger: #F87171;
```

### File: `frontend/src/styles/marketing-tokens.css`

```css
/* Primary Brand Color - COBALT */
--color-primary: #0052CC;
--color-primary-hover: #003D99;
--color-primary-light: #E3F2FD;
--color-primary-dark: #002D66;

/* Secondary Accent Colors */
--color-accent-1: #7C3AED; /* Purple - for cards only */
--color-accent-2: #059669; /* Green - for cards only */

/* Semantic Colors */
--color-success: #16A34A;
--color-warning: #D97706;
--color-error: #DC2626;
--color-info: #0052CC;

/* Dark Mode Primary */
--color-primary: #3B82F6;
--color-primary-hover: #60A5FA;
```

---

## Files That Will Be Modified

1. `frontend/src/styles/theme.css` - Main theme file
2. `frontend/src/styles/marketing-tokens.css` - Marketing tokens
3. `frontend/src/styles/marketing.css` - Marketing styles (if needed)

---

## Quick Restore Commands

### PowerShell (Windows)
```powershell
# Restore from git
git checkout master

# Or restore specific files
Copy-Item "frontend\src\styles\backup\theme.css.backup" "frontend\src\styles\theme.css" -Force
Copy-Item "frontend\src\styles\backup\marketing-tokens.css.backup" "frontend\src\styles\marketing-tokens.css" -Force
```

### Bash (Linux/Mac)
```bash
# Restore from git
git checkout master

# Or restore specific files
cp frontend/src/styles/backup/theme.css.backup frontend/src/styles/theme.css
cp frontend/src/styles/backup/marketing-tokens.css.backup frontend/src/styles/marketing-tokens.css
```

---

## What Gets Changed

### Planned Changes:
1. ✅ Unify primary color: `#0052CC` → `#2563EB` (in marketing-tokens.css)
2. ✅ Reduce marketing card colors: 5 → 3 (remove orange & yellow)
3. ✅ Standardize color token structure
4. ✅ Update all references to use unified tokens

### What Stays the Same:
- ✅ Semantic colors (success, warning, danger)
- ✅ Neutral grays
- ✅ Typography tokens
- ✅ Spacing tokens
- ✅ Shadow tokens

---

## Testing After Restore

After restoring, verify:
1. Website loads correctly
2. Colors match original design
3. Dark mode works
4. All pages render properly

---

## Notes

- All changes are on branch: `color-palette-consolidation`
- Original code is safe on `master` branch
- Backup files are in: `frontend/src/styles/backup/`
- This document serves as a reference for manual restoration

