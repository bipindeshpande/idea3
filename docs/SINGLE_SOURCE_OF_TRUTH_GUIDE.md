# Single Source of Truth (SSOT) Architecture Guide

## Overview

This guide explains strategies to avoid code duplication and ensure changes in one place reflect everywhere. This is the foundation of maintainable, scalable codebases.

---

## 🎯 Core Principles

1. **DRY (Don't Repeat Yourself)**: Every piece of knowledge should have a single, unambiguous representation
2. **Single Source of Truth**: One authoritative location for each piece of data/logic
3. **Composition over Duplication**: Build complex things from simple, reusable pieces
4. **Configuration over Code**: Extract values to config files

---

## 📋 Strategies & Patterns

### 1. **CSS Variables / Design Tokens** ✅ (Partially Implemented)

**What it is**: Centralized design values in CSS variables

**Current State**: You have `--mkt-*` and `--ui-*` tokens, but they're duplicated

**How it works**:
```css
/* Single source - theme.css */
:root {
  --color-primary: #2563EB;
  --spacing-md: 24px;
  --radius-card: 16px;
}

/* Used everywhere - no duplication */
.button { background: var(--color-primary); }
.card { padding: var(--spacing-md); border-radius: var(--radius-card); }
```

**Benefits**:
- Change color once → updates everywhere
- Consistent spacing automatically
- Easy theme switching
- Type-safe if using TypeScript

**Improvement Needed**:
- Merge `--mkt-*` and `--ui-*` into unified system
- Remove duplicate definitions
- Create semantic aliases (e.g., `--primary` → `--accent`)

---

### 2. **Component Composition** ✅ (Partially Implemented)

**What it is**: Reusable components instead of copying code

**Current State**: You have some reusable components, but also duplicates

**How it works**:
```jsx
// ❌ BAD: Duplicated button code
<button className="px-6 py-3 bg-blue-500 text-white">Click</button>
<button className="px-6 py-3 bg-blue-500 text-white">Submit</button>

// ✅ GOOD: Single Button component
<Button variant="primary">Click</Button>
<Button variant="primary">Submit</Button>

// Change Button once → all buttons update
```

**Your Current Pattern**:
```jsx
// You have UIButton, but also inline buttons
<UIButton variant="primary">...</UIButton>  // ✅ Good
<button className="px-6 py-3 bg-blue-500">...</button>  // ❌ Bad
```

**Benefits**:
- Change button style once → all buttons update
- Consistent behavior
- Easier testing
- Better maintainability

**Improvement Needed**:
- Audit all buttons → replace with UIButton
- Audit all cards → replace with UICard
- Create component library documentation

---

### 3. **Configuration Files** ✅ (Partially Implemented)

**What it is**: Extract data/content to separate config files

**Current State**: You have `data/marketing/*.js` files

**How it works**:
```jsx
// ❌ BAD: Hardcoded in component
function HomePage() {
  return <Hero title="Find your startup" subtitle="AI-powered..." />
}

// ✅ GOOD: Config file
// data/marketing/home.js
export const heroData = {
  title: "Find your startup",
  subtitle: "AI-powered..."
}

// pages/Home.jsx
import { heroData } from "../data/marketing/home.js"
function HomePage() {
  return <Hero {...heroData} />
}
```

**Your Current Pattern**:
```jsx
// ✅ You're doing this correctly
import { heroData } from "../../data/marketing/home.js"
```

**Benefits**:
- Change content without touching components
- Easy A/B testing
- Content management
- Translation-ready

**Improvement Needed**:
- Extract more hardcoded content to config
- Create content management structure
- Consider CMS integration for non-technical edits

---

### 4. **Shared Utilities / Helpers**

**What it is**: Common functions in one place

**How it works**:
```jsx
// ❌ BAD: Duplicated function
function formatDate(date) { /* ... */ }  // In component A
function formatDate(date) { /* ... */ }  // In component B

// ✅ GOOD: Shared utility
// utils/formatters.js
export function formatDate(date) { /* ... */ }

// components/A.jsx
import { formatDate } from "../utils/formatters.js"

// components/B.jsx
import { formatDate } from "../utils/formatters.js"
```

**Your Current State**:
- You have `utils/` folder ✅
- But may have duplicate functions

**Benefits**:
- Fix bug once → fixed everywhere
- Consistent behavior
- Easier testing
- Better organization

**Improvement Needed**:
- Audit for duplicate functions
- Consolidate similar utilities
- Create utility documentation

---

### 5. **Layout Components** ✅ (Implemented)

**What it is**: Reusable layout wrappers

**How it works**:
```jsx
// ✅ GOOD: Single layout component
<MarketingLayout>
  <HomePage />
</MarketingLayout>

<MarketingLayout>
  <PricingPage />
</MarketingLayout>

// Change MarketingLayout once → all marketing pages update
```

**Your Current Pattern**:
```jsx
// ✅ You're using this correctly
<MarketingLayout fullWidth={true}>
  <HeroSection data={heroData} />
</MarketingLayout>
```

**Benefits**:
- Change navigation once → all pages update
- Consistent layout
- Easy to add global features (analytics, etc.)

---

### 6. **Constants / Enums**

**What it is**: Shared constant values

**How it works**:
```jsx
// ❌ BAD: Magic strings everywhere
if (status === "pending") { ... }
if (status === "pending") { ... }  // Duplicated

// ✅ GOOD: Constants file
// constants/status.js
export const STATUS = {
  PENDING: "pending",
  COMPLETED: "completed",
  FAILED: "failed"
}

// components/A.jsx
import { STATUS } from "../constants/status.js"
if (status === STATUS.PENDING) { ... }

// components/B.jsx
import { STATUS } from "../constants/status.js"
if (status === STATUS.PENDING) { ... }
```

**Benefits**:
- Change value once → updates everywhere
- Type-safe (if using TypeScript)
- Prevents typos
- Better IDE autocomplete

**Improvement Needed**:
- Create constants for:
  - Route paths
  - API endpoints
  - Status values
  - Error messages
  - Validation rules

---

### 7. **Type Definitions / Interfaces**

**What it is**: Shared data structures (if using TypeScript)

**How it works**:
```typescript
// types/user.ts
export interface User {
  id: string;
  email: string;
  name: string;
}

// components/A.tsx
import { User } from "../types/user.ts"
function UserCard({ user }: { user: User }) { ... }

// components/B.tsx
import { User } from "../types/user.ts"
function UserProfile({ user }: { user: User }) { ... }
```

**Benefits**:
- Change structure once → TypeScript catches all issues
- Self-documenting
- Better IDE support
- Prevents bugs

**Note**: You're using JavaScript, but can use JSDoc for similar benefits

---

### 8. **Hooks / Custom Hooks**

**What it is**: Reusable React logic

**How it works**:
```jsx
// ❌ BAD: Duplicated logic
function ComponentA() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    // Fetch logic...
  }, []);
}

function ComponentB() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    // Same fetch logic...
  }, []);
}

// ✅ GOOD: Custom hook
// hooks/useData.js
export function useData() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    // Fetch logic...
  }, []);
  return { data, loading };
}

// components/A.jsx
import { useData } from "../hooks/useData.js"
function ComponentA() {
  const { data, loading } = useData();
}

// components/B.jsx
import { useData } from "../hooks/useData.js"
function ComponentB() {
  const { data, loading } = useData();
}
```

**Your Current State**:
- You have `context/` for shared state ✅
- May have duplicate logic in components

**Benefits**:
- Change logic once → updates everywhere
- Consistent behavior
- Easier testing
- Better organization

---

### 9. **API Client / Service Layer**

**What it is**: Centralized API calls

**How it works**:
```jsx
// ❌ BAD: Duplicated API calls
async function fetchUser(id) {
  const res = await fetch(`/api/users/${id}`);
  return res.json();
}

async function fetchUserProfile(id) {
  const res = await fetch(`/api/users/${id}`);  // Duplicated
  return res.json();
}

// ✅ GOOD: API service
// services/api.js
export const api = {
  async getUser(id) {
    const res = await fetch(`/api/users/${id}`);
    return res.json();
  }
}

// components/A.jsx
import { api } from "../services/api.js"
const user = await api.getUser(id);

// components/B.jsx
import { api } from "../services/api.js"
const user = await api.getUser(id);
```

**Benefits**:
- Change API endpoint once → updates everywhere
- Consistent error handling
- Easy to add authentication
- Better testing

**Your Current State**:
- Backend has service layer ✅
- Frontend may have duplicate fetch calls

---

### 10. **Theme Provider / Context**

**What it is**: Shared theme/configuration via React Context

**How it works**:
```jsx
// ✅ GOOD: Theme context
<ThemeProvider>
  <App />
</ThemeProvider>

// Any component can access
const { theme, setTheme } = useTheme();
```

**Your Current State**:
- You have `ThemeContext.jsx` ✅
- Good pattern for global state

**Benefits**:
- Change theme once → entire app updates
- Consistent theming
- Easy dark mode
- Better UX

---

## 🏗️ Recommended Architecture

### File Structure for SSOT

```
frontend/src/
├── styles/
│   ├── tokens.css          # ✅ Single source for all design tokens
│   ├── base.css            # Base styles
│   └── utilities.css       # Utility classes
│
├── constants/
│   ├── routes.js           # All route paths
│   ├── api.js              # API endpoints
│   ├── status.js           # Status values
│   └── messages.js         # Error/success messages
│
├── config/
│   ├── theme.js            # Theme configuration
│   ├── breakpoints.js      # Responsive breakpoints
│   └── validation.js        # Validation rules
│
├── data/
│   └── marketing/          # ✅ Content data (you have this)
│       ├── home.js
│       └── pricing.js
│
├── components/
│   ├── ui/                 # ✅ Base components (you have this)
│   │   ├── Button.jsx     # Single button component
│   │   ├── Card.jsx        # Single card component
│   │   └── Input.jsx       # Single input component
│   │
│   └── shared/             # Shared complex components
│       ├── Navigation.jsx
│       └── Footer.jsx
│
├── hooks/                  # ✅ Custom hooks (create this)
│   ├── useAuth.js
│   ├── useApi.js
│   └── useTheme.js
│
├── services/              # API services
│   └── api.js
│
└── utils/                 # ✅ Utilities (you have this)
    ├── formatters/
    └── validators/
```

---

## 📊 Current State Analysis

### ✅ What You're Doing Well

1. **CSS Variables**: You have design tokens (though duplicated)
2. **Component Library**: You have `ui/` components
3. **Data Files**: You have `data/marketing/` for content
4. **Context**: You have React Context for global state
5. **Layouts**: You have reusable layout components
6. **Utils**: You have utility functions

### ❌ What Needs Improvement

1. **Duplicate Tokens**: `--mkt-*` and `--ui-*` should be unified
2. **Hardcoded Values**: Some colors/spacing still hardcoded
3. **Duplicate Components**: Some components duplicated
4. **Missing Constants**: Route paths, API endpoints not centralized
5. **Duplicate Logic**: Some hooks/logic duplicated in components

---

## 🎯 Implementation Priority

### Phase 1: Design Tokens (Highest Impact)
**Goal**: Single source for all design values

**Actions**:
1. Merge `--mkt-*` and `--ui-*` tokens
2. Remove duplicate definitions
3. Create semantic aliases
4. Document all tokens

**Impact**: Change color once → entire app updates

### Phase 2: Component Unification
**Goal**: Single component for each UI pattern

**Actions**:
1. Audit all buttons → use UIButton
2. Audit all cards → use UICard
3. Audit all inputs → use UIInput
4. Remove duplicate components

**Impact**: Change component once → all instances update

### Phase 3: Constants & Config
**Goal**: Centralize all constant values

**Actions**:
1. Create `constants/routes.js` for all paths
2. Create `constants/api.js` for endpoints
3. Create `constants/messages.js` for text
4. Extract hardcoded values

**Impact**: Change route/endpoint once → updates everywhere

### Phase 4: Utilities & Hooks
**Goal**: Shared logic in one place

**Actions**:
1. Audit for duplicate functions
2. Consolidate utilities
3. Create custom hooks for common patterns
4. Document all utilities

**Impact**: Fix bug once → fixed everywhere

---

## 💡 Quick Wins

### 1. Unify Design Tokens (2-3 hours)
```css
/* Before: Duplicated */
--mkt-primary: #2563eb;
--accent: #2563EB;

/* After: Single source */
--color-primary: #2563EB;
--mkt-primary: var(--color-primary);
--accent: var(--color-primary);
```

### 2. Create Route Constants (1 hour)
```js
// constants/routes.js
export const ROUTES = {
  HOME: "/",
  DASHBOARD: "/dashboard",
  PRICING: "/pricing",
  // ... all routes
}

// Usage
<Link to={ROUTES.DASHBOARD}>Dashboard</Link>
```

### 3. Centralize API Endpoints (1 hour)
```js
// constants/api.js
export const API = {
  BASE_URL: "/api",
  DISCOVERY: "/api/discovery",
  USER: "/api/user",
  // ... all endpoints
}
```

### 4. Extract Messages (1 hour)
```js
// constants/messages.js
export const MESSAGES = {
  ERROR: {
    GENERIC: "Something went wrong",
    NETWORK: "Network error. Please try again.",
  },
  SUCCESS: {
    SAVED: "Saved successfully",
    DELETED: "Deleted successfully",
  }
}
```

---

## 🔄 Maintenance Strategy

### Regular Audits
- **Weekly**: Check for new hardcoded values
- **Monthly**: Review for duplicate code
- **Quarterly**: Full architecture review

### Code Review Checklist
- [ ] No hardcoded colors/spacing
- [ ] Using design tokens
- [ ] Using shared components
- [ ] Using constants for strings
- [ ] No duplicate logic

### Documentation
- Document all design tokens
- Document all components
- Document all constants
- Keep architecture diagram updated

---

## 📚 Best Practices

1. **Always use tokens** - Never hardcode design values
2. **Compose, don't duplicate** - Build from existing components
3. **Extract to config** - Move data to config files
4. **Create constants** - Centralize all strings/values
5. **Share utilities** - Common functions in one place
6. **Document everything** - Make it easy to find

---

## 🎓 Examples from Your Codebase

### ✅ Good Example: Data Files
```js
// data/marketing/home.js - Single source
export const heroData = { ... }

// pages/Home.jsx - Uses config
import { heroData } from "../data/marketing/home.js"
<Hero {...heroData} />
```

### ❌ Bad Example: Duplicate Tokens
```css
/* theme.css - Duplicated */
--mkt-primary: #2563eb;
--accent: #2563EB;  /* Same color, different name */
```

### ✅ Good Example: Layout Component
```jsx
// layouts/MarketingLayout.jsx - Reusable
<MarketingLayout>
  <HomePage />
</MarketingLayout>
```

### ❌ Bad Example: Inline Styles
```jsx
// ❌ Hardcoded
<div style={{ padding: "24px", color: "#2563EB" }}>

// ✅ Should use tokens
<div className="ui-pad-md" style={{ color: "var(--color-primary)" }}>
```

---

## 🚀 Next Steps

1. **Audit Current State**: Identify all duplicates
2. **Prioritize**: Start with highest impact (design tokens)
3. **Implement Gradually**: Don't break everything at once
4. **Document**: Keep track of changes
5. **Test**: Ensure changes don't break functionality

---

*This is a living document - update as you implement improvements.*

