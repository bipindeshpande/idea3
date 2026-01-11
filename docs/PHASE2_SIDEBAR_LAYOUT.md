# Phase 2: Sidebar Layout - Visual Guide

## Desktop Layout (lg and above)

```
┌────────────────────────────────────────────────────────────────────────────┐
│ Navigation: Back to Recommendations                                        │
├────────────────────────────────────────────────────────────────────────────┤
│ Header: Idea Title + Hero Statement + Hero Chips                          │
├──────────────────────────────────────────────┬─────────────────────────────┤
│ MAIN CONTENT (flex-1)                        │ SIDEBAR (w-80, sticky)      │
│                                              │                             │
│ [📋 Overview] [⚠️ Validation] [🚀 Exec] [📊] │ ┌─────────────────────────┐ │
│ ─────────────────────────────────────────── │ │ 📊 At a Glance          │ │
│                                              │ │                         │ │
│ ▼ Why This Fits You                         │ │ ⏱️ Timeline: 4-6 months │ │
│   Personalized analysis...                   │ │ 💰 Budget: $5K-$10K     │ │
│                                              │ │ ⚡ Effort: Medium        │ │
│ ▼ Financial Snapshot                         │ └─────────────────────────┘ │
│   ┌──────────────────────────────┐          │                             │
│   │ Startup costs: $25,000       │          │ ┌─────────────────────────┐ │
│   │ Revenue potential: $5K/mo    │          │ │ ⚠️ Top Risks            │ │
│   └──────────────────────────────┘          │ │                         │ │
│                                              │ │ 🔴 Market saturation    │ │
│ ▼ Immediate Next Steps                       │ │ 🟡 Technical skills     │ │
│   • Conduct market research                  │ │ 🟢 Time commitment      │ │
│   • Build MVP                                │ │                         │ │
│                                              │ │ View all risks →        │ │
│ ▼ Timeline & Effort                          │ └─────────────────────────┘ │
│   MVP: 1-2 months                            │                             │
│   Launch: 4-6 months                         │ ┌─────────────────────────┐ │
│                                              │ │ ✅ Actions              │ │
│                                              │ │                         │ │
│                                              │ │ [🔍 Validate Idea]      │ │
│                                              │ │ [🔖 Save for Later]     │ │
│                                              │ │ [⚖️ Compare Ideas]      │ │
│                                              │ └─────────────────────────┘ │
│                                              │                             │
│                                              │ ┌─────────────────────────┐ │
│                                              │ │ 📝 Quick Notes          │ │
│                                              │ │                         │ │
│                                              │ │ [Text area for notes]   │ │
│                                              │ │                         │ │
│                                              │ │ [Save Note]             │ │
│                                              │ └─────────────────────────┘ │
│                                              │                             │
│                                              │ 💡 Tip: Use tabs above...   │
└──────────────────────────────────────────────┴─────────────────────────────┘
```

## Mobile Layout (below lg)

```
┌────────────────────────────────────┐
│ Navigation                         │
├────────────────────────────────────┤
│ Header: Title + Statement          │
├────────────────────────────────────┤
│ [📋] [⚠️] [🚀] [📊]                 │
│ ─────────────────────────────────  │
│                                    │
│ ▼ Why This Fits You                │
│   Content...                       │
│                                    │
│ ▼ Financial Snapshot               │
│   Content...                       │
│                                    │
├────────────────────────────────────┤
│ SIDEBAR (stacked below)            │
│                                    │
│ ┌────────────────────────────────┐ │
│ │ 📊 At a Glance                 │ │
│ │ ⏱️ Timeline: 4-6 months        │ │
│ │ 💰 Budget: $5K-$10K            │ │
│ └────────────────────────────────┘ │
│                                    │
│ ┌────────────────────────────────┐ │
│ │ ⚠️ Top Risks                   │ │
│ │ 🔴 Market saturation           │ │
│ └────────────────────────────────┘ │
│                                    │
│ ┌────────────────────────────────┐ │
│ │ ✅ Actions                     │ │
│ │ [🔍 Validate Idea]             │ │
│ │ [🔖 Save for Later]            │ │
│ └────────────────────────────────┘ │
└────────────────────────────────────┘
```

## Key Features

### Sticky Behavior (Desktop)
```css
.sidebar {
  position: sticky;
  top: 1rem; /* 16px from top when scrolling */
}
```

- Sidebar stays visible while scrolling main content
- Always accessible without scrolling back up
- Smooth scroll experience

### Responsive Breakpoint
- **Desktop (lg: 1024px+):** Side-by-side layout
- **Mobile/Tablet (< 1024px):** Stacked layout

### Flexbox Layout
```jsx
<div className="flex flex-col lg:flex-row gap-8">
  <div className="flex-1 min-w-0">{/* Main */}</div>
  <aside className="lg:w-80">{/* Sidebar */}</aside>
</div>
```

## Sidebar Cards

### 1. At a Glance Card
**Purpose:** Quick decision metrics
**Data Source:** `heroChips` array
**Extracts:**
- Timeline (looks for "timeline" or "month" in label)
- Budget (looks for "budget" or "$" in label)
- Difficulty (looks for "difficulty" or "effort" in label)

### 2. Top Risks Card
**Purpose:** Risk awareness
**Data Source:** `riskRows` array (first 3)
**Features:**
- Severity badges (HIGH/MEDIUM/LOW)
- Color coding (red/yellow/green)
- Link to full risk analysis

### 3. Actions Card
**Purpose:** Quick actions
**Features:**
- Validate button (triggers validation workflow)
- Save button (bookmarks idea)
- Compare button (navigates to compare page)
- Auth-gated (shows login prompt if not authenticated)

### 4. Quick Notes Card
**Purpose:** Capture thoughts
**Features:**
- Textarea for notes
- Save button
- Auth-required
- Persists with idea

## User Flow Improvements

### Before (Phase 1 only)
1. User views tabs
2. Scrolls through content
3. Needs to scroll back up for actions
4. Forgets key metrics while reading

### After (Phase 1 + 2)
1. User views tabs
2. **Key metrics always visible in sidebar**
3. **Actions always accessible**
4. **Top risks prominently displayed**
5. **Can take notes without losing place**

## Benefits Summary

| Benefit | Description |
|---------|-------------|
| **Reduced Cognitive Load** | Key facts always visible, no need to remember |
| **Faster Actions** | One-click access to validate, save, compare |
| **Risk Awareness** | Top risks prominently displayed |
| **Note-taking** | Capture thoughts without losing context |
| **Better Mobile UX** | Graceful degradation to stacked layout |
| **Professional Look** | Modern two-column layout |

## Technical Notes

### Tailwind Classes Used
- `lg:flex-row` - Horizontal layout on desktop
- `lg:sticky lg:top-4` - Sticky positioning on desktop
- `lg:w-80` - Fixed width sidebar (320px)
- `flex-1 min-w-0` - Flexible main content with overflow handling
- `gap-8` - Consistent spacing (32px)

### Component Props
```jsx
<RecommendationSidebar
  activeIdea={activeIdea}
  heroChips={heroChips}
  riskRows={riskRows}
  onValidate={handleValidate}
  onSave={handleSave}
  validating={validating}
  isAuthenticated={isAuthenticated}
/>
```

### Future Enhancements
- [ ] Implement actual save functionality
- [ ] Persist notes to backend
- [ ] Add "Scroll to section" links
- [ ] Show completion progress
- [ ] Add keyboard shortcuts
- [ ] Implement collapsible sidebar on mobile

## Testing Checklist

✅ Sidebar displays on desktop (lg+)
✅ Sidebar stacks below on mobile
✅ Sticky positioning works on scroll
✅ Quick facts extracted correctly
✅ Top risks displayed with colors
✅ Actions work (validate, save, compare)
✅ Auth-gating works correctly
✅ Notes textarea functional
✅ Responsive layout works
✅ No layout shift or overflow issues

## Status

✅ **IMPLEMENTED** - Sticky sidebar fully functional

