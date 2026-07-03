# Overall Functionality Implemented

This document describes the **complete functionality** of the startup-idea platform: what the product does, how users interact with it, and how the frontend and backend work together.

---

## 1. Product Overview

The application is a **startup idea discovery and validation platform**. It helps users:

1. **Discover** personalized startup ideas based on their profile (skills, constraints, interests).
2. **Validate** specific ideas using a structured framework (market, problem, solution, etc.).
3. **Manage** their discovery runs, validations, and recommendations in a workspace (dashboard).
4. **Connect** with other founders and access resources (templates, blog, psychology/psyche tools).

**Tech stack:**

- **Frontend:** React (Vite), React Router, Tailwind CSS. Runs on port 5173 (dev).
- **Backend:** FastAPI, PostgreSQL, Redis (optional). Runs on port 8000.
- **Auth:** JWT (Bearer token); session token stored in frontend localStorage.

---

## 2. User Flows and Features (Detailed)

### 2.1 Authentication

**Purpose:** Secure sign-up, sign-in, and account recovery.

**User flow:**

1. **Register** — User enters email and password. Backend creates account (bcrypt-hashed password) and returns success.
2. **Login** — User enters credentials. Backend validates and returns JWT + session token. Frontend stores token and uses it on all `/api` requests.
3. **Forgot password** — User submits email. Backend sends reset link (implementation may be email-service dependent).
4. **Reset password** — User opens link and sets new password. Backend updates and confirms.
5. **Session** — Frontend sends `Authorization: Bearer <token>` on API calls. Backend validates JWT. After 30 minutes of inactivity, frontend clears token and user is logged out.
6. **Subscription gate** — For protected routes, frontend calls `GET /api/subscription/status`. If subscription is inactive, user sees “Subscription expired” and a link to pricing; they cannot access discovery/validation/dashboard until active.

**Backend:**

- **POST /api/auth/register** — Create user (email, hashed password).
- **POST /api/auth/login** — Return JWT and session token.
- **GET /api/auth/me** — Return current user (used by frontend to restore session).
- **POST /api/auth/logout**, **forgot-password**, **reset-password**, **change-password** — Standard auth operations.
- `AuthService` handles registration and login; `User` model in PostgreSQL.

---

### 2.2 Discovery (Personalized Startup Ideas)

**Purpose:** Generate a **profile analysis** and a set of **personalized startup recommendations** from a structured intake form.

**User flow:**

1. **Intake form (Advisor / Discover)**  
   User fills a multi-step form:
   - **Startup category** (e.g. type of business).
   - **About you:** time commitment, budget range, risk tolerance, work style, startup style, skills (technical, creative, physical, business, soft, other), customer interaction preference, location/context.
   - **Interests & goals:** industry interest, sub-interest area, business type, earnings timeline, founder ambition, experience summary.

   Form is validated (required fields, at least one skill category). User can **save a draft** (localStorage) and **restore** it later.

2. **Review step**  
   User reviews inputs and clicks “Run discovery” (or equivalent).

3. **Run discovery**  
   Frontend sends intake payload to the backend. Backend runs a **two-stage pipeline** and streams the result back using **Server-Sent Events (SSE)**:
   - **Stage 1 — Profile analysis:** LLM (e.g. OpenAI/Anthropic) analyzes the inputs and produces a structured profile (strengths, constraints, fit, etc.). Result can be cached (e.g. Redis) by input hash.
   - **Stage 2 — Recommendations:** Using the profile and inputs, the system generates a list of **personalized startup ideas** (e.g. markdown or structured JSON). Static engine may be used for some industries before falling back to LLM.

   The frontend shows **streaming output** (progress text) and, when done, parses the stream into:
   - **Profile report** — Shown on “Profile report” view.
   - **Personalized recommendations** — List of ideas; each idea can be opened in a **Recommendation detail** page.

4. **Saving runs**  
   Backend creates a **Run** record (with optional `run_id` from streaming), stores profile + recommendations, and can persist to PostgreSQL. Frontend also keeps a local copy of recent runs (e.g. in ReportsContext / localStorage) for quick access.

5. **Caching**  
   If the same (or equivalent) inputs were recently processed, backend may return **cached** profile + recommendations. Frontend shows a “cached” indicator so the user knows no new LLM run was performed.

**Backend (summary):**

- **POST /api/discovery** — Main streaming endpoint: runs full pipeline, streams SSE; optionally saves Run and DiscoveryResult in DB.
- **POST /api/discovery/run** — Async run (returns 202 with run_id); status polled separately.
- **GET /api/discovery/status/{run_id}** — Status of async run.
- **GET /api/user/run/{run_id}** — Get run and its results (profile + recommendations).
- **POST /api/discovery/enrich_idea** — Enrich a single idea (e.g. more detail).
- **POST /api/enhance-report** — Enhance existing report (e.g. rephrase or expand).

**Services:** `DiscoveryService` (orchestrator), `ProfileAnalysisService` (Stage 1), `Stage2Service` (recommendations), `CacheService`, `ResultAssembler`, `ProfileFormatter`, stream processor. LLM via `LLMService`; config: `OPENAI_API_KEY`, `ANTHROPIC_API_KEY`, cache TTLs.

---

### 2.3 Recommendation Detail (Single Idea)

**Purpose:** View one recommended idea in depth, with optional **actions**, **notes**, and **enrichment**.

**User flow:**

1. From the recommendations list (or dashboard), user clicks an idea and lands on **Recommendation detail** (e.g. `/dashboard/recommendations/:ideaIndex` or `/results/recommendations/:ideaIndex`).
2. **Tabs** (or sections) typically include:
   - **At a glance** — Summary, fit, pros/cons, etc.
   - **Actions & notes** — User-defined action items and notes for this idea (stored per idea in backend).
   - **Enrichment** — Optional “enrich” button; frontend calls **POST /api/discovery/enrich_idea** to get more detail; result can be cached in context.
3. **Persona modal** — Some UIs show a “persona” or segment view for the idea (e.g. target customer).
4. **Conflicts / unparseable** — If the backend returns conflicting or unparseable data, the UI can show warnings or fallback text.

**Backend:**

- **GET /api/user/actions?idea_id=...** — List actions for an idea.
- **POST /api/user/actions** — Create action.
- **PUT /api/user/actions/{action_id}**, **DELETE /api/user/actions/{action_id}** — Update/delete action.
- **GET /api/user/notes?idea_id=...**, **POST /api/user/notes**, **PUT /api/user/notes/{note_id}**, **DELETE /api/user/notes/{note_id}** — Same for notes.
- **POST /api/discovery/enrich_idea** — Enrich one idea (e.g. LLM call); returns enriched content.
- **GET /api/user/smart-recommendations** — Optional: get smart/contextual recommendations.

Models: `Action`, `Note` (and Run/DiscoveryResult for the idea source).

---

### 2.4 Validation (Idea Validation)

**Purpose:** Evaluate a **specific idea** (user’s own or one from recommendations) using a structured validation framework and get **scores + analysis + next steps**.

**User flow:**

1. **Validate idea** — User goes to “Validate idea” (e.g. `/validate-idea`). Optionally they can pre-fill from a recommendation (idea_id / idea_metadata).
2. **Multi-step form:**
   - **Screen 1** — Category/parameter answers (e.g. market size, problem clarity, solution fit — from `validationQuestions` config).
   - **Screen 2** — Idea explanation (free text).
   - **Screen 3** — Conclusion / summary.
   Conflict checks (e.g. contradictory answers) can be run on the frontend before submit.
3. **Submit** — Frontend sends **category_answers** and **idea_explanation** (and optionally **idea_id**, **idea_metadata**, **include_next_steps**) to **POST /api/validate-idea**.
4. **Backend** runs `ValidationService`:
   - Builds prompts from category_answers + idea_explanation.
   - Calls LLM to produce **validation analysis** (scores, strengths, risks, etc.).
   - Optionally generates **next_steps** (personalized, using user profile if available).
   - Saves a **Validation** record and returns **validation_id** and the validation payload.
5. **Result page** — User is redirected to a **Validation result** view showing scores, analysis, and next steps.
6. **Edit / revalidate** — User can open an existing validation (e.g. **GET /api/validate-idea/{id}**) and submit again with **PUT /api/validate-idea/{id}** or use a “revalidate” flow.

**Dashboard:** Validations are listed in the dashboard (from **GET /api/user/activity** or similar). User can **delete** a validation; frontend may call **DELETE /api/validate-idea/{id}** (if backend implements it) or only remove it from local state.

**Backend:**

- **POST /api/validate-idea** — Create validation; returns validation_id and validation object.
- **PUT /api/validate-idea/{validation_id}** — Update validation.
- **GET /api/validate-idea/{validation_id}** — Get one validation.
- `ValidationService` uses modular components (e.g. ValidationAnalysis, ValidationPromptBuilder, UserProfileRetriever). Config: validation timeouts, max tokens, temperature.

---

### 2.5 Dashboard and Workspace

**Purpose:** Central place to see **ideas**, **validations**, **run history**, and to **compare** sessions or runs.

**User flow:**

1. After login, user is redirected to **Dashboard** (e.g. `/dashboard`).
2. **Tabs** (or equivalent):
   - **Ideas** — List of ideas extracted from discovery runs (from API and/or local runs). User can **select two** and click **Compare** to see a side-by-side comparison (backend: **POST /api/user/compare-sessions** with two run/session identifiers).
   - **Validations** — List of saved validations (from **GET /api/user/activity**). User can open one or delete it.
   - **History** — Run history: list of discovery runs (from **GET /api/runs**). User can open a run (**GET /api/runs/{run_id}** or **GET /api/user/run/{run_id}**) or delete it (**DELETE /api/runs/{run_id}** or **DELETE /api/user/run/{run_id}**).
3. **Profile report / Recommendations report** — Shortcuts to the latest (or selected) profile report and recommendations list; from there user can open **Recommendation detail**.
4. **Frameworks** — Link to **Workspace frameworks** (saved templates/frameworks). Backend: **GET/POST/PUT/DELETE /api/frameworks**, **POST /api/frameworks/{id}/export**, **POST /api/frameworks/populate-template**.
5. **Account** — Link to account/settings: subscription, preferences (**PUT /api/user/preferences**), cancel/change plan, psyche/founder psychology links.

**Backend:**

- **GET /api/user/dashboard** — Aggregated dashboard data.
- **GET /api/user/activity** — Activity (runs, validations) for current user.
- **GET /api/runs** — Paginated runs; **GET /api/runs/stats**; **GET/DELETE /api/runs/{run_id}**.
- **GET /api/user/run/{run_id}**, **DELETE /api/user/run/{run_id}**.
- **POST /api/user/compare-sessions** — Compare two sessions (request body carries identifiers); returns comparison payload.
- **GET /api/user/usage** — Usage stats for the user.

---

### 2.6 Founder and Psychology (Psyche)

**Purpose:** Founder-facing tools: **psychology content**, **psyche questionnaire**, **profile**, and **founder connect** (ideas, people, connections).

**User flow:**

1. **Founder psychology** — Content page; may call **GET /api/founder/psychology** to load or save state (**POST /api/founder/psychology**).
2. **Founder profile** — **GET/POST /api/founder/profile** — View or update founder profile (e.g. open for collaborators, bio).
3. **Psyche questionnaire** — Multi-step form; **GET /api/psyche/questions** for questions; **POST /api/psyche/submit** to submit answers. Backend scores and stores **PsycheProfile**.
4. **Psyche profile** — **GET /api/psyche/profile** (and optionally **GET /api/psyche/profile/ai**) to view the computed psyche profile.
5. **Founder connect:**
   - **Browse ideas** — **GET /api/founder/ideas/browse** (or **GET /api/founder/connect**).
   - **My ideas** — **GET /api/founder/ideas**, **POST /api/founder/ideas**, **GET/PUT /api/founder/ideas/{listing_id}** — List and manage “idea listings.”
   - **Browse people** — **GET /api/founder/people/browse**.
   - **Connections** — **POST /api/founder/connect** to request a connection; **GET /api/founder/connections**; **PUT /api/founder/connections/{id}/respond** (accept/decline); **DELETE /api/founder/connections/{id}**; **GET /api/founder/connections/{id}/detail**.

**Backend:** `FounderService`, `PsycheScoringService`; models: `FounderProfile`, `FounderPsychology`, `FounderIdeaListing`, `FounderConnection`, `PsycheProfile`.

---

### 2.7 Subscription and Payments

**Purpose:** Control access to paid features (e.g. discovery, validation) and manage subscription state.

**User flow:**

1. **Status** — Frontend calls **GET /api/subscription/status** to know if the user has an active subscription. If not, protected routes show “Subscription expired” and link to **Pricing**.
2. **Pricing page** — User selects a plan and may:
   - **Activate in dev** — **POST /api/subscription/activate-dev** (e.g. for testing without payment).
   - **Pay** — Frontend creates intent (**POST /api/payment/create-intent**) and, after Stripe confirmation, confirms (**POST /api/payment/confirm**). Backend currently **mocks** Stripe (returns mock success); real integration is TODO.
3. **Account** — User can **cancel** or **change plan** via **POST /api/subscription/cancel** and **POST /api/subscription/change-plan**.

**Backend:** Subscription state stored (e.g. on User or related table); `UserService` methods for activate-dev, cancel, change-plan. Payment endpoints are stubs.

---

### 2.8 Resources, Blog, and Help

**Purpose:** Static and dynamic content: templates, methodology, blog, and in-app help.

**User flow:**

- **Resources** — **Resource templates** page (e.g. `/resources/templates`); **Validation methodology** page; **Advisor resources**; **How advisor thinks** (protected). Some content may be driven by config or CMS; backend may expose **GET /api/public/usage-stats** for public stats.
- **Blog** — List (e.g. `/blog`) and **blog article** by slug (`/blog/:slug`). Content from frontend data (e.g. markdown or JSON).
- **Help** — In-app help pages (e.g. validate-idea, discover, founder-network, workspace, frameworks, account, recommendation-detail). These are protected routes that render static or semi-static content.

**Backend:** **POST /api/contact** for contact form; optional **GET /api/public/usage-stats**. No heavy “CMS” in the described routes; content is largely frontend-driven.

---

### 2.9 Admin

**Purpose:** Internal admin panel for users, payments, settings, validation questions, and reports.

**User flow:**

1. Admin goes to **/admin** and logs in with **POST /api/admin/login** (admin password from config).
2. **Dashboard** — **GET /api/admin/stats** (optional time_range) for high-level metrics.
3. **Users** — **GET /api/admin/users**; **GET /api/admin/user/{user_id}**; **PUT/POST /api/admin/user/{user_id}/subscription** to manage subscription.
4. **Payments** — **GET /api/admin/payments**.
5. **Settings** — **GET/POST /api/admin/settings** (e.g. system-wide config).
6. **Validation questions** — **POST /api/admin/save-validation-questions** to update the validation form questions (used by validation flow).
7. **Intake fields** — **POST /api/admin/save-intake-fields** to update discovery intake schema.
8. **Reports export** — **GET /api/admin/reports/export?type=...**.
9. **Forgot / reset password** — **POST /api/admin/forgot-password**, **POST /api/admin/reset-password** for admin account.
10. **Metrics / observability** — **GET /api/admin/metrics**, **GET /api/admin/observability** (e.g. internal health or metrics).

**Backend:** `AdminUserService`, `AdminConfigService`, `AdminReportService`, `AdminMetricsService`, `ObservabilityService`; config: `ADMIN_PASSWORD`.

---

## 3. Frontend–Backend Integration Summary

| Feature           | Main frontend entry              | Main backend APIs                                                                 |
|-------------------|----------------------------------|------------------------------------------------------------------------------------|
| Auth              | Login/Register/Forgot/Reset      | /api/auth/register, login, me, forgot-password, reset-password, change-password   |
| Discovery         | Advisor/Discover intake → run   | POST /api/discovery (SSE), /api/user/run/{id}, enrich_idea, enhance-report          |
| Recommendation    | Recommendation detail page       | /api/user/actions, /api/user/notes, /api/discovery/enrich_idea                     |
| Validation        | Validate-idea form → result      | POST/PUT/GET /api/validate-idea, /api/validate-idea/{id}                           |
| Dashboard         | Dashboard tabs, compare, history | /api/user/dashboard, activity, compare-sessions; /api/runs, /api/user/run/{id}     |
| Runs              | Run history, delete run          | GET/DELETE /api/runs, /api/runs/{id}; /api/user/run/{id}                           |
| Founder / Psyche  | Founder + Psyche pages           | /api/founder/*, /api/psyche/*                                                      |
| Subscription      | Status, pricing, account         | /api/subscription/status, activate-dev, cancel, change-plan                       |
| Payments          | Payment modal, confirm           | /api/payment/create-intent, confirm (mock)                                         |
| Frameworks        | Workspace frameworks             | /api/frameworks CRUD, export, populate-template                                    |
| Admin             | Admin panel                      | /api/admin/*                                                                      |
| Contact           | Contact form                     | POST /api/contact                                                                 |

---

## 4. Data and Persistence

- **PostgreSQL:** Users, Runs, DiscoveryResults, Validations, Actions, Notes, FounderProfile, FounderPsychology, FounderIdeaListing, FounderConnection, PsycheProfile, SavedFramework, ContactSubmission, and operational tables (e.g. cache, usage, rate limits, error logs).
- **Redis (optional):** Caching for profile analysis, recommendations, and possibly other LLM/output caches to reduce cost and latency.
- **Frontend:** Session token and optionally draft intake, recent runs, and validation list in localStorage for offline/quick access; sensitive data should not be stored in plain text.

---

## 5. Security and Configuration

- **Auth:** JWT (HS256), expiry (e.g. 30 minutes), secure password hashing (bcrypt). Admin routes protected by separate admin password.
- **CORS:** Backend allows configured origins (e.g. localhost:5173, 3000) for frontend.
- **Config:** `.env` (or equivalent) for database URL, Redis URL, LLM API keys, secret key, admin password, feature flags, and timeouts. See `backend_v2/app/core/config.py` for full list.

---

This document reflects the **overall functionality implemented** as of the current codebase and can be used to explain the system to stakeholders or for onboarding.
