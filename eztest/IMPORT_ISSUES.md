# EZTest Import Issues

## Critical Issue: Broken Imports

The eztest directory contains **118 broken import statements** that reference paths that do not exist:

- `@/frontend/reusable-components/*`
- `@/frontend/reusable-elements/*`
- `@/frontend/components/*`
- `@/frontend/context/*`

### Root Cause

The current eztest directory is a **partial copy** that doesn't have the complete directory structure. The setup scripts indicate that eztest should be cloned from GitHub:

```bash
cd eztest
git clone https://github.com/houseoffoss/eztest.git source
```

Then files are copied from `source/` to the root of eztest for Docker builds.

### Current State

- ❌ `frontend/` directory does NOT exist
- ❌ All imports from `@/frontend/*` will fail at runtime
- ❌ Application cannot run with current state

### Required Fix

**Option 1: Proper Setup (Recommended)**
1. Remove current eztest directory (except setup scripts)
2. Follow the setup instructions in `eztest/README.md`
3. Clone the repository: `git clone https://github.com/houseoffoss/eztest.git source`
4. Run setup scripts to copy files properly

**Option 2: Fix Imports**
If you want to keep the current structure, update all imports:
- `@/frontend/reusable-components` → `@/components`
- `@/frontend/reusable-elements` → Create this directory structure or update imports
- `@/frontend/components` → `@/app/components` or appropriate path
- `@/frontend/context` → `@/app/components/layout` or appropriate path

**Option 3: Remove**
If eztest is not needed for this project, remove the entire directory.

### Files with Broken Imports

- `lib/sidebar-config.ts`
- `app/ui/page.tsx`
- `app/settings/account/page.tsx`
- All files in `app/projects/**/*.tsx`
- All files in `app/profile/**/*.tsx`
- `app/dashboard/page.tsx`
- All files in `app/components/**/*.tsx`
- `app/auth/reset-password/page.tsx`

**Total: 118 import errors**

### Next Steps

1. Decide if eztest is needed for this project
2. If yes: Follow proper setup from GitHub
3. If no: Remove the eztest directory
4. Update this file once resolved

