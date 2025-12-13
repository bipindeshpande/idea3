# React Codebase Modularization Plan

## Overview
This plan outlines the refactoring of the React codebase into a fully modular, component-based architecture.

## Goals
1. Break large JSX files into smaller reusable components
2. Extract repeated UI patterns into shared components
3. Create layout wrappers for common page structures
4. Maintain all functionality unchanged
5. No breaking changes to routes, logic, hooks, context, or API calls

## Component Extraction Plan

### Phase 1: Layout Components (`/components/layout`)

#### 1.1 PageHeader.jsx
**Purpose:** Standard page header with accent glow
**Pattern Found In:**
- FounderPsychology.jsx
- PsycheQuestionnaire.jsx
- PsycheProfile.jsx
- PsycheComplete.jsx
- FounderConnect.jsx
- ResetPassword.jsx
- About.jsx
- Contact.jsx
- Privacy.jsx
- Terms.jsx

**Props:**
```jsx
{
  title: string,
  subtitle?: string,
  showAccent?: boolean
}
```

#### 1.2 PageContainer.jsx
**Purpose:** Standard page container wrapper
**Pattern Found In:** Most pages

**Props:**
```jsx
{
  children: ReactNode,
  maxWidth?: string,
  className?: string
}
```

#### 1.3 SectionHeader.jsx
**Purpose:** Section headers with consistent styling
**Pattern Found In:** Multiple pages

**Props:**
```jsx
{
  title: string,
  description?: string,
  icon?: string
}
```

### Phase 2: UI Components (`/components/ui`)

#### 2.1 Card.jsx
**Purpose:** Standard card container
**Pattern:** `rounded-xl border border-gray-200 shadow-sm bg-white p-6 md:p-7`
**Found In:** Almost every page

**Props:**
```jsx
{
  children: ReactNode,
  className?: string,
  padding?: 'sm' | 'md' | 'lg'
}
```

#### 2.2 Button.jsx
**Purpose:** Standardized buttons (primary, secondary)
**Patterns:**
- Primary: `px-5 py-2.5 rounded-lg font-medium text-white bg-indigo-600 hover:bg-indigo-700`
- Secondary: `px-5 py-2.5 rounded-lg font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100`

**Props:**
```jsx
{
  children: ReactNode,
  variant?: 'primary' | 'secondary',
  onClick?: () => void,
  disabled?: boolean,
  type?: 'button' | 'submit' | 'reset',
  className?: string
}
```

#### 2.3 FormInput.jsx
**Purpose:** Standardized form input
**Pattern:** `w-full rounded-xl border border-gray-200 bg-white p-3 text-gray-900 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100`

**Props:**
```jsx
{
  type?: string,
  value: string,
  onChange: (e) => void,
  placeholder?: string,
  error?: string,
  label?: string,
  required?: boolean,
  className?: string
}
```

#### 2.4 FormSelect.jsx
**Purpose:** Standardized select dropdown
**Props:** Similar to FormInput

#### 2.5 FormTextarea.jsx
**Purpose:** Standardized textarea
**Props:** Similar to FormInput + rows

#### 2.6 EmptyState.jsx
**Purpose:** Empty state display
**Pattern Found In:**
- DashboardActiveIdeasTab.jsx
- RecommendationsReport.jsx
- Multiple other components

**Props:**
```jsx
{
  title: string,
  description: string,
  icon?: string,
  action?: { label: string, onClick: () => void }
}
```

#### 2.7 AccentGlow.jsx
**Purpose:** Reusable accent glow effect
**Pattern:** `absolute -top-10 -left-10 w-[260px] h-[260px] rounded-full bg-indigo-300 opacity-[0.09] blur-2xl pointer-events-none`

**Props:**
```jsx
{
  className?: string
}
```

### Phase 3: Common Components (`/components/common`)

#### 3.1 Navigation.jsx
**Purpose:** Extract Navigation component from App.jsx
**Current:** ~450 lines in App.jsx
**New:** Separate file with all navigation logic

#### 3.2 Tabs.jsx
**Purpose:** Reusable tabbed interface
**Pattern Found In:**
- FounderConnect.jsx
- Dashboard.jsx
- Multiple other pages

**Props:**
```jsx
{
  tabs: Array<{ id: string, label: string, badge?: number }>,
  activeTab: string,
  onTabChange: (id: string) => void
}
```

#### 3.3 ReviewScreen.jsx
**Purpose:** Extract review screen from Home.jsx
**Current:** ~40 lines of JSX in Home.jsx
**New:** Separate component

**Props:**
```jsx
{
  inputs: object,
  onEdit?: () => void
}
```

### Phase 4: Feature-Specific Components

#### 4.1 ProfileTab.jsx
**Purpose:** Extract ProfileTab from FounderConnect.jsx
**Current:** ~800+ lines in FounderConnect.jsx
**New:** Separate component file

#### 4.2 CreditCounter.jsx
**Purpose:** Extract from FounderConnect.jsx
**Current:** ~80 lines inline
**New:** Separate component

#### 4.3 PricingTierCard.jsx
**Purpose:** Extract pricing tier card from Pricing.jsx
**Current:** Inline in Pricing.jsx
**New:** Separate component

## File-by-File Refactoring Order

### Step 1: Create Base Components
1. Create `/components/layout/PageHeader.jsx`
2. Create `/components/layout/PageContainer.jsx`
3. Create `/components/layout/SectionHeader.jsx`
4. Create `/components/ui/Card.jsx`
5. Create `/components/ui/Button.jsx`
6. Create `/components/ui/AccentGlow.jsx`
7. Create `/components/ui/FormInput.jsx`
8. Create `/components/ui/FormSelect.jsx`
9. Create `/components/ui/FormTextarea.jsx`
10. Create `/components/ui/EmptyState.jsx`

### Step 2: Extract Large Components
11. Extract Navigation from App.jsx → `/components/common/Navigation.jsx`
12. Extract ReviewScreen from Home.jsx → `/components/discovery/ReviewScreen.jsx`
13. Extract ProfileTab from FounderConnect.jsx → `/components/founder/ProfileTab.jsx`
14. Extract CreditCounter from FounderConnect.jsx → `/components/founder/CreditCounter.jsx`
15. Create `/components/common/Tabs.jsx`

### Step 3: Update Pages (in order)
16. Update Landing.jsx
17. Update Home.jsx
18. Update FounderConnect.jsx
19. Update FounderPsychology.jsx
20. Update PsycheQuestionnaire.jsx
21. Update PsycheProfile.jsx
22. Update PsycheComplete.jsx
23. Update Auth pages (Login, Register, ForgotPassword, ResetPassword)
24. Update Public pages (About, Contact, Pricing, Privacy, Terms)
25. Update Dashboard pages
26. Update Discovery pages
27. Update Validation pages
28. Update Resources pages

### Step 4: Final Verification
29. Test all routes
30. Verify no breaking changes
31. Check build succeeds

## Implementation Rules

1. **For JSX groups > 30 lines:** Create new component
2. **For repeated patterns:** Extract to common component
3. **Keep props simple:** Avoid deep prop drilling
4. **Maintain functionality:** No logic changes, only UI reorganization
5. **Update imports:** Ensure all imports are updated after extraction
6. **Test incrementally:** Verify after each major extraction

## Notes

- All components should follow the unified design system
- Use TypeScript-style prop documentation (JSDoc comments)
- Keep components focused and single-purpose
- Maintain backward compatibility during transition

