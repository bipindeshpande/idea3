# AI Change Control Policy

**Purpose**: Ensure AI assistants make minimal, targeted changes and don't break working code.

**Last Updated**: January 2025

---

## 🎯 Problem Statement

When requesting changes, AI assistants sometimes:
- Fix unrelated errors in other files
- Refactor working code "while they're at it"
- Update dependencies unnecessarily
- Make improvements that weren't requested
- Touch files that weren't mentioned

This is risky, especially after moving to production or during maintenance/enhancement phases.

---

## ✅ Solution: Conservative Change Policy

### 1. **Explicit Scope Required**

Always specify exactly what should change:

**Good Request**:
```
"Add validation to the email field in UserForm.jsx"
```

**Better Request**:
```
"Add email validation to UserForm.jsx. 
Only change UserForm.jsx. 
Don't touch any other files."
```

### 2. **Use Explicit Instructions**

When requesting changes, you can add:

```
"ONLY modify [specific file/function]. 
DO NOT fix errors in other files. 
DO NOT refactor anything else."
```

### 3. **Review Changes Before Committing**

Always review the git diff before committing:
```bash
git diff
# or
git status
git diff [filename]
```

### 4. **Use Git Branches**

For production-critical changes:
```bash
git checkout -b feature/your-change-name
# Make changes
# Test thoroughly
git diff main  # Review all changes
# Only merge if satisfied
```

---

## 🔒 Guidelines for AI Interactions

### What AI Should Do:

1. ✅ **Only modify requested files/functions**
2. ✅ **Ask for confirmation if scope is unclear**
3. ✅ **List all files that will be modified BEFORE making changes**
4. ✅ **Fix errors ONLY if they're in the files being changed**
5. ✅ **Explain what was changed and why**

### What AI Should NOT Do:

1. ❌ **Fix unrelated linter errors**
2. ❌ **Refactor working code**
3. ❌ **Update dependencies**
4. ❌ **Improve code quality "while we're at it"**
5. ❌ **Touch files not mentioned in the request**

---

## 📋 Workflow Examples

### Example 1: Simple Change

**Request**: "Add a 'Cancel' button to the form in `components/Form.jsx`"

**AI Should**:
- Modify only `components/Form.jsx`
- Add only the Cancel button
- Not fix lint errors elsewhere
- Not refactor the form logic

**You Should**:
- Review the diff: `git diff components/Form.jsx`
- Test the change
- Commit if satisfied

### Example 2: Bug Fix

**Request**: "Fix the authentication error in `api/auth.js`"

**AI Should**:
- Modify only `api/auth.js`
- Fix only the authentication issue
- Not refactor other parts of auth logic
- Not fix unrelated errors

**You Should**:
- Review: `git diff api/auth.js`
- Test authentication flow
- Verify no other functionality broke

### Example 3: Enhancement

**Request**: "Add pagination to the user list in `pages/Users.jsx`"

**AI Should**:
- Modify only `pages/Users.jsx` (and related files if absolutely necessary)
- Add only pagination logic
- Ask if other files need changes (like API endpoints)
- Not refactor the entire user list component

**You Should**:
- Review all changes
- Test pagination thoroughly
- Check if API changes are needed separately

---

## 🛡️ Safety Checklist

Before approving AI changes:

- [ ] Only the requested files were modified?
- [ ] No unrelated files touched?
- [ ] No dependency updates?
- [ ] No "improvements" made that weren't requested?
- [ ] Changes are minimal and focused?
- [ ] Git diff shows only expected changes?

---

## 🚨 Red Flags

Stop and review carefully if AI:

1. Modified more files than mentioned
2. Fixed errors in unrelated files
3. Updated dependencies
4. Refactored code structure
5. Made "improvements" not requested
6. Changed working code "while at it"

---

## 💡 Best Practices for You

### 1. **Be Explicit in Requests**

Instead of: "Fix the bug"
Say: "Fix the null pointer error in `utils/helpers.js` line 45. Only modify that file."

### 2. **Review Diffs Before Committing**

```bash
# See all changes
git diff

# See changes to specific file
git diff path/to/file.js

# See staged changes
git diff --cached
```

### 3. **Use Feature Branches**

```bash
git checkout -b fix/specific-issue
# Make AI changes
# Review diff
# Test
# Merge to main only if satisfied
```

### 4. **Test After Changes**

Even for small changes:
- Run the affected feature
- Verify nothing else broke
- Check for console errors

### 5. **Use `.cursorrules` File**

The `.cursorrules` file in the project root contains instructions for AI. We've set it up to enforce minimal changes.

---

## 📝 Template for Change Requests

Use this template when requesting changes:

```
Request: [What you want changed]

Files to modify: [List specific files]

Scope: [What should be changed in those files]

Constraints: 
- Do NOT modify: [List files/areas to avoid]
- Do NOT fix errors in: [List areas]
- Do NOT refactor: [List areas]

Expected outcome: [What should happen after the change]
```

---

## 🔄 If Something Goes Wrong

If AI made unwanted changes:

1. **Don't commit**: `git reset` or `git checkout -- <file>`
2. **Review what changed**: `git diff`
3. **Re-request**: Be more explicit about scope
4. **Reference this policy**: "Please follow the AI Change Policy"

---

## 📚 Related Documents

- `.cursorrules` - AI configuration file (project root)
- `docs/CODE_REVIEW.md` - Code review practices
- Git workflow documentation

---

**Remember**: Working code in production is more valuable than perfect code. Only change what's necessary.

