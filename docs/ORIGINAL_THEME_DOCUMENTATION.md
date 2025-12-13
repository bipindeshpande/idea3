# Original Theme Documentation

This document captures the original typography, spacing, and visual accent styles that existed before the unified theme update.

## Typography System (Original)

### Headings
- **Main page titles**: `text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50 md:text-4xl lg:text-5xl` (with gradient text effects)
- **Section titles**: `text-xl font-bold text-slate-900 dark:text-slate-50` or `text-2xl font-bold`
- **Card titles**: `text-lg font-bold text-slate-900 dark:text-slate-50`
- **Sub-headings**: `text-sm font-semibold` or `text-xs font-semibold`

### Body Text
- **Standard body text**: `text-xs text-slate-600 dark:text-slate-300` or `text-sm text-slate-600 dark:text-slate-300`
- **Secondary text**: `text-xs text-slate-500 dark:text-slate-400` or `text-sm text-slate-500 dark:text-slate-400`
- **Labels**: `text-xs font-medium text-slate-700 dark:text-slate-300` or `text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide`

### Button Text
- **Button labels**: `text-xs font-semibold` or `text-sm font-semibold`

### Special Text Effects
- **Gradient text**: `bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 dark:from-slate-50 dark:via-slate-100 dark:to-slate-50 bg-clip-text text-transparent`
- **Brand gradient text**: `bg-gradient-to-r from-brand-600 to-brand-700 dark:from-brand-400 dark:to-brand-500 bg-clip-text text-transparent`

## Spacing System (Original)

### Page Layout
- **Container**: `mx-auto max-w-6xl px-6 py-4` or `mx-auto max-w-4xl px-6 py-12` or `mx-auto max-w-7xl px-6 py-6`
- **No consistent max-width constraint** - varied between `max-w-4xl`, `max-w-6xl`, `max-w-7xl`

### Section Spacing
- **Between sections**: `mb-8` or `mb-12` (inconsistent)
- **Title spacing**: `mt-4` or `mt-6` after title
- **Content spacing**: `mt-2` or `mt-3` before content

### Cards
- **Card padding**: `p-5`, `p-6`, `p-8` (inconsistent)
- **Card styling**: Varied between:
  - `rounded-xl border border-slate-200/60 dark:border-slate-700/60 bg-white dark:bg-slate-800/50`
  - `rounded-2xl border-2 border-slate-300/80 dark:border-slate-600/80`
  - `rounded-3xl border-2 border-brand-200/80 dark:border-brand-700/80`
- **Card shadows**: `shadow-md`, `shadow-lg`, `shadow-xl`, `shadow-2xl` (inconsistent)

### Grid Spacing
- **Grid gaps**: `gap-3`, `gap-4`, `gap-6` (inconsistent, no responsive variants)

## Visual Accents (Original)

### Icons
- **Icon containers**: Varied styles:
  - `flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-brand-100 to-brand-200 dark:from-brand-900/50 dark:to-brand-800/50 text-lg shadow-sm`
  - `flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-indigo-100 dark:bg-indigo-900/50 text-2xl`
  - Inline icons without consistent wrapping
- **No unified icon circle style**

### Background Gradients
- **Hero sections**: `bg-gradient-to-br from-brand-50 via-white to-brand-50/30 dark:from-brand-900/30 dark:via-slate-800/50 dark:to-brand-900/20`
- **Cards**: Multiple gradient variations:
  - `bg-gradient-to-br from-white via-coral-50/30 to-white dark:from-slate-800 dark:via-coral-900/20 dark:to-slate-800`
  - `bg-gradient-to-br from-brand-50/80 via-brand-50/40 to-white dark:from-brand-900/20 dark:via-brand-900/10 dark:to-slate-800/50`
- **No consistent radial glow accents**

### Accent Circles
- **Hero accents**: Used inline styles with varying opacity:
  - `style={{ background: '#e8efff', opacity: 0.12 }}`
  - `style={{ background: '#f3e8ff', opacity: 0.12 }}`
- **Workspace accents**: `style={{ background: '#eef2ff', opacity: 0.10 }}`
- **No standardized blur effects or consistent positioning**

### Borders and Shadows
- **Borders**: Varied thickness and opacity:
  - `border-2 border-slate-300/80 dark:border-slate-600/80`
  - `border border-slate-200/60 dark:border-slate-700/60`
  - `border-2 border-brand-200/80 dark:border-brand-700/80`
- **Shadows**: Multiple shadow styles:
  - `shadow-sm`, `shadow-md`, `shadow-lg`, `shadow-xl`, `shadow-2xl`
  - Colored shadows: `shadow-lg shadow-brand-500/25`
  - Soft shadows: `shadow-soft`

## Specific Component Examples

### Landing Page (Original)
- Container: `mx-auto max-w-6xl px-6 py-4`
- Hero title: `text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50 md:text-4xl lg:text-5xl` with gradient
- Cards: `rounded-3xl border-2 border-brand-300/80 dark:border-brand-700/80 bg-gradient-to-br from-white via-brand-50/30 to-white` with `shadow-2xl`
- Icons: Gradient backgrounds with `bg-gradient-to-br from-brand-100 to-brand-200`
- Section spacing: `mb-8`

### Dashboard (Original)
- Container: `mx-auto max-w-7xl px-6 py-6`
- Page title: `text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50 md:text-3xl`
- Workspace container: `rounded-2xl border-2 border-slate-300/80 dark:border-slate-600/80 p-8 shadow-xl`
- Tabs: `text-sm font-semibold` with `border-b-2`
- Cards: `rounded-xl border border-slate-200/60 dark:border-slate-700/60 bg-white/95 dark:bg-slate-800/95 p-6 shadow-lg`

### Account Page (Original)
- Container: `mx-auto max-w-4xl px-6 py-12`
- Page title: `text-3xl font-semibold text-slate-900 dark:text-slate-50`
- Cards: `rounded-3xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-8 shadow-soft`
- Labels: `text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide`

## Key Differences from New Theme

1. **Typography**: More varied font sizes (`text-xs`, `text-sm`, `text-base`, `text-lg`, `text-xl`, `text-2xl`, `text-3xl`, `text-4xl`, `text-5xl`) with inconsistent weights
2. **Spacing**: Inconsistent padding (`p-5`, `p-6`, `p-8`) and margins (`mb-8`, `mb-12`, `mt-4`, `mt-6`)
3. **Containers**: Multiple max-widths (`max-w-4xl`, `max-w-6xl`, `max-w-7xl`) instead of unified `max-w-screen-lg`
4. **Cards**: Multiple border styles (`border`, `border-2`), varied rounded corners (`rounded-xl`, `rounded-2xl`, `rounded-3xl`), inconsistent shadows
5. **Icons**: No unified icon circle style - varied gradient backgrounds and sizes
6. **Accents**: Inline styles for accent circles, no standardized blur effects, varied opacity values
7. **Colors**: More use of `slate` colors instead of unified `gray` scale
8. **Visual Effects**: More gradient backgrounds, colored shadows, hover animations with transforms

## Notes

- The original theme had more visual variety and decorative elements (gradients, colored shadows, transform animations)
- Typography was less standardized with more size variations
- Spacing was more flexible but less consistent
- Visual accents were more prominent but less unified

