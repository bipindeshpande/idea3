# Backend-Frontend API Connection Audit

## Summary

This document compares all backend API endpoints with frontend API calls to identify:
- ✅ Properly connected endpoints
- ❌ Missing backend endpoints (frontend calls but backend doesn't have)
- ⚠️ Unused backend endpoints (backend has but frontend doesn't use)

---

## Backend Endpoints (Available)

### Discovery Endpoints
1. ✅ `POST /api/discovery` - Streaming discovery endpoint
2. ✅ `POST /api/discovery/run` - Background job discovery
3. ✅ `GET /api/discovery/status/{run_id}` - Check job status
4. ✅ `GET /api/user/run/{run_id}` - Get run details (in discovery.py)

### Authentication Endpoints
5. ✅ `POST /api/auth/register` - User registration
6. ✅ `POST /api/auth/login` - User login
7. ✅ `GET /api/auth/me` - Get current authenticated user (IMPLEMENTED)

### Run History Endpoints
7. ✅ `GET /api/runs` - List runs (paginated)
8. ✅ `GET /api/runs/{run_id}` - Get run details
9. ✅ `DELETE /api/runs/{run_id}` - Soft delete run

### History Endpoints
10. ✅ `GET /api/history` - Get recent discovery runs
11. ✅ `GET /api/history/{run_id}` - Get discovery result by run_id

### Admin Endpoints
12. ✅ `GET /api/admin/metrics` - Admin metrics
13. ✅ `GET /api/admin/observability` - Observability dashboard

### User Endpoints
16. ✅ `GET /api/user/dashboard` - Get dashboard summary metrics (IMPLEMENTED)
17. ✅ `GET /api/user/activity` - Get user activity list (IMPLEMENTED)
18. ✅ `GET /api/user/actions` - Get user actions feed (IMPLEMENTED)
19. ✅ `GET /api/user/notes` - Get user notes list (IMPLEMENTED)

### Subscription Endpoints
20. ✅ `GET /api/subscription/status` - Get subscription details (IMPLEMENTED)

### System Endpoints
21. ✅ `GET /health` - Health check
22. ✅ `GET /` - Root endpoint

---

## Frontend API Calls (What Frontend Needs)

### ✅ Connected Endpoints (Backend Has These)

1. ✅ `POST /api/discovery` - Used in `frontend/src/utils/discovery.js`
2. ✅ `GET /api/runs` - Used in `frontend/src/utils/runs.js`
3. ✅ `GET /api/runs/{run_id}` - Used in `frontend/src/utils/runs.js`
4. ✅ `GET /api/user/run/{run_id}` - Used in multiple places
5. ✅ `POST /api/auth/register` - Used in `frontend/src/context/AuthContext.jsx`
6. ✅ `POST /api/auth/login` - Used in `frontend/src/context/AuthContext.jsx`
7. ✅ `GET /api/auth/me` - Used in `frontend/src/context/AuthContext.jsx:74` (IMPLEMENTED)
8. ✅ `GET /api/user/dashboard` - Used in `frontend/src/pages/dashboard/Dashboard.jsx:175` (IMPLEMENTED)
9. ✅ `GET /api/user/activity` - Used in multiple places (IMPLEMENTED)
10. ✅ `GET /api/user/actions` - Used in `frontend/src/pages/discovery/RecommendationDetail.jsx:312` (IMPLEMENTED)
11. ✅ `GET /api/user/notes` - Used in `frontend/src/pages/discovery/RecommendationDetail.jsx:366` (IMPLEMENTED)
12. ✅ `GET /api/subscription/status` - Used in multiple places (IMPLEMENTED)
13. ✅ `GET /api/admin/metrics` - Used in `frontend/src/pages/admin/Admin.jsx` (as `/api/admin/stats`)

---

## ❌ Missing Backend Endpoints (Frontend Calls But Backend Doesn't Have)

### Authentication Endpoints
1. ✅ `GET /api/auth/me` - Get current user (IMPLEMENTED - see line 7 above)
2. ❌ `POST /api/auth/logout` - Logout user (called in `AuthContext.jsx:216`)
3. ❌ `POST /api/auth/forgot-password` - Password reset request (called in `AuthContext.jsx:235`)
4. ❌ `POST /api/auth/reset-password` - Reset password with token (called in `AuthContext.jsx:252`)
5. ❌ `POST /api/auth/change-password` - Change password (called in `AuthContext.jsx:273`)

### User Endpoints
6. ✅ `GET /api/user/dashboard` - Get dashboard data (IMPLEMENTED - see line 8 above)
7. ✅ `GET /api/user/activity` - Get user activity (IMPLEMENTED - see line 9 above)
8. ✅ `GET /api/user/actions` - Get user actions (IMPLEMENTED - see line 10 above)
9. ❌ `POST /api/user/actions` - Create action (called in `RecommendationDetail.jsx:312`)
10. ❌ `GET /api/user/actions?idea_id={id}` - Get actions for idea (called in `RecommendationDetail.jsx:269`)
11. ❌ `PUT /api/user/actions/{actionId}` - Update action (called in `RecommendationDetail.jsx:341`)
12. ✅ `GET /api/user/notes` - Get user notes (IMPLEMENTED - see line 11 above, supports idea_id filter)
13. ✅ `GET /api/user/notes?idea_id={id}` - Get notes for idea (IMPLEMENTED - query parameter supported)
14. ❌ `POST /api/user/notes` - Create note (called in `RecommendationDetail.jsx:366`)
15. ❌ `GET /api/user/compare-sessions` - Compare sessions (called in `Dashboard.jsx:467`, `CompareSessions.jsx:93`)
16. ❌ `GET /api/user/smart-recommendations` - Smart recommendations (called in `RecommendationsReport.jsx:71`)
17. ❌ `GET /api/user/usage` - Get usage stats (called in `FounderConnect.jsx:51`)

### Subscription Endpoints
18. ✅ `GET /api/subscription/status` - Get subscription status (IMPLEMENTED - see line 12 above)
19. ❌ `POST /api/subscription/cancel` - Cancel subscription (called in `Account.jsx:149`, `ManageSubscription.jsx:52`)
20. ❌ `POST /api/subscription/change-plan` - Change plan (called in `Account.jsx:196`, `ManageSubscription.jsx:85`)
21. ❌ `POST /api/subscription/activate-dev` - Activate dev subscription (called in `PaymentModal.jsx:21`)

### Founder Connect Endpoints
22. ❌ `GET /api/founder/psychology` - Get founder psychology (called in multiple places)
23. ❌ `GET /api/founder/profile` - Get founder profile (called in multiple places)
24. ❌ `POST /api/founder/profile` - Update founder profile (called in `FounderConnect.jsx:401`)
25. ❌ `GET /api/founder/connections` - Get connections (called in `FounderConnect.jsx:52`)
26. ❌ `GET /api/founder/connections/{id}/detail` - Get connection details (called in `FounderConnect.jsx:1302`)
27. ❌ `POST /api/founder/connections/{id}/respond` - Respond to connection (called in `FounderConnect.jsx:1253`)
28. ❌ `DELETE /api/founder/connections/{id}` - Delete connection (called in `FounderConnect.jsx:1278`)
29. ❌ `GET /api/founder/ideas` - Get founder ideas (called in multiple places)
30. ❌ `POST /api/founder/ideas` - Create idea listing (called in `FounderConnect.jsx:85`, `OpenForCollaboratorsButton.jsx:92`)
31. ❌ `GET /api/founder/ideas/{id}` - Get idea details (called in `FounderConnect.jsx:720`)
32. ❌ `GET /api/founder/ideas/browse` - Browse ideas (called in `FounderConnect.jsx:100`)
33. ❌ `GET /api/founder/people/browse` - Browse people (called in `FounderConnect.jsx:115`)
34. ❌ `POST /api/founder/connect` - Send connection request (called in `FounderConnect.jsx:853, 1070`)

### Validation Endpoints
35. ❌ `GET /api/validate-idea/{id}` - Validate idea (called in `Dashboard.jsx:539`)

### Payment Endpoints
36. ❌ `POST /api/payment/create-intent` - Create payment intent (called in `PaymentModal.jsx:111`)
37. ❌ `POST /api/payment/confirm` - Confirm payment (called in `PaymentModal.jsx:161`)

### Other Endpoints
38. ❌ `GET /api/public/usage-stats` - Public usage stats (called in `Landing.jsx:20`)
39. ❌ `POST /api/contact` - Contact form (called in `Contact.jsx:31`)
40. ❌ `POST /api/enhance-report` - Enhance report (called in `RecommendationsReport.jsx:182`)

### Admin Endpoints (Mismatched Names)
41. ❌ `GET /api/admin/stats` - Admin stats (frontend calls this, backend has `/api/admin/metrics`)
42. ❌ `POST /api/admin/login` - Admin login (called in `Admin.jsx:65`)
43. ❌ `POST /api/admin/save-validation-questions` - Save validation questions (called in `Admin.jsx:350`)
44. ❌ `POST /api/admin/save-intake-fields` - Save intake fields (called in `Admin.jsx:592`)
45. ❌ `GET /api/admin/users` - List users (called in `Admin.jsx:964`)
46. ❌ `GET /api/admin/user/{userId}` - Get user details (called in `Admin.jsx:984`)
47. ❌ `PUT /api/admin/user/{userId}/subscription` - Update user subscription (called in `Admin.jsx:1097`)
48. ❌ `GET /api/admin/payments` - Get payments (called in `Admin.jsx:1230`)
49. ❌ `GET /api/admin/reports/export` - Export reports (called in `Admin.jsx:1627`)
50. ❌ `GET /api/admin/settings` - Get settings (called in `Admin.jsx:1519`)
51. ❌ `POST /api/admin/settings` - Update settings (called in `Admin.jsx:1545`)
52. ❌ `POST /api/admin/forgot-password` - Admin forgot password (called in `AdminForgotPassword.jsx:19`)
53. ❌ `POST /api/admin/reset-password` - Admin reset password (called in `AdminResetPassword.jsx:40`)

---

## ⚠️ Unused Backend Endpoints (Backend Has But Frontend Doesn't Use)

1. ⚠️ `POST /api/discovery/run` - Background job endpoint (frontend uses streaming instead)
2. ⚠️ `GET /api/discovery/status/{run_id}` - Job status (frontend doesn't use background jobs)
3. ⚠️ `GET /api/history` - History endpoint (frontend uses `/api/runs` instead)
4. ⚠️ `GET /api/history/{run_id}` - History by ID (frontend uses `/api/runs/{run_id}` instead)
5. ⚠️ `GET /api/admin/observability` - Observability dashboard (frontend doesn't use this)

---

## Recommendations

### High Priority (Core Functionality)
1. **Add `/api/auth/me`** - Essential for checking authentication status
2. **Add `/api/user/dashboard`** - Core dashboard functionality
3. **Add `/api/user/activity`** - Used throughout the app
4. **Fix `/api/admin/stats`** - Either rename backend endpoint or update frontend to use `/api/admin/metrics`

### Medium Priority (User Features)
5. **Add subscription endpoints** - If subscription features are needed
6. **Add user actions/notes endpoints** - For idea management
7. **Add password reset endpoints** - For user account management

### Low Priority (Optional Features)
8. **Add founder connect endpoints** - If this feature is being used
9. **Add validation endpoints** - If idea validation is needed
10. **Add payment endpoints** - If payment processing is needed

### Decision Needed
- **Background jobs**: Frontend uses streaming (`/api/discovery`) but backend also has `/api/discovery/run`. Decide which to use.
- **History vs Runs**: Frontend uses `/api/runs` but backend also has `/api/history`. Consider consolidating.

---

## Next Steps

1. Review this audit with the team
2. Prioritize which missing endpoints to implement
3. Decide on endpoint naming consistency (e.g., `/api/admin/stats` vs `/api/admin/metrics`)
4. Create implementation plan for high-priority endpoints
5. Update frontend or backend to align on unused endpoints

