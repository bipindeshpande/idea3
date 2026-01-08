# Pending API Tests Summary

## ✅ Completed API Test Files (11 files)

1. **test_admin_api.py** ✅ - Admin endpoints (8 tests)
2. **test_auth_api.py** ✅ - Authentication endpoints (9 tests)
3. **test_contact_api.py** ✅ - Contact form endpoint (10 tests)
4. **test_discovery_api.py** ✅ - Discovery endpoints (19 tests)
5. **test_enhance_report.py** ✅ - Report enhancement (4 tests)
6. **test_founder_api.py** ✅ - Founder network endpoints (34 tests)
7. **test_history_api.py** ✅ - History endpoints (11 tests)
8. **test_public_api.py** ✅ - Public endpoints (1 test)
9. **test_runs_api.py** ✅ - Runs endpoints (21 tests)
10. **test_user_api.py** ✅ - User endpoints (9 tests)
11. **test_validation_api.py** ✅ - Validation endpoints (18 tests)

**Total Completed: 144 integration tests**

---

## ❌ Missing API Test Files (4 files)

### 1. **test_frameworks_api.py** ❌
**Route:** `backend_v2/app/api/routes/frameworks.py`  
**Coverage:** 35% (currently untested)

**Endpoints to test:**
- `POST /api/frameworks` - Create framework
  - ✅ Success case
  - ✅ Without authentication (401)
  - ✅ Invalid template ID
  - ✅ Missing required fields
  
- `GET /api/frameworks` - List frameworks
  - ✅ Success case
  - ✅ Without authentication (401)
  - ✅ Filter by status
  - ✅ Filter by template_id
  - ✅ Filter by linked_idea_id
  - ✅ Filter by linked_validation_id
  - ✅ Empty list
  
- `GET /api/frameworks/{framework_id}` - Get framework
  - ✅ Success case
  - ✅ Without authentication (401)
  - ✅ Not found (404)
  - ✅ Unauthorized (different user)
  
- `PUT /api/frameworks/{framework_id}` - Update framework
  - ✅ Success case
  - ✅ Without authentication (401)
  - ✅ Not found (404)
  - ✅ Unauthorized (different user)
  - ✅ Partial update
  
- `DELETE /api/frameworks/{framework_id}` - Delete framework
  - ✅ Success case
  - ✅ Without authentication (401)
  - ✅ Not found (404)
  - ✅ Unauthorized (different user)
  
- `POST /api/frameworks/populate-template` - Populate template
  - ✅ Success case
  - ✅ Without authentication (401)
  - ✅ Invalid template content
  - ✅ With validation_id
  - ✅ With idea_id
  
- `GET /api/frameworks/templates` - List templates
  - ✅ Success case
  - ✅ Without authentication (should work)
  - ✅ Filter by category

**Estimated tests:** ~25-30 tests

---

### 2. **test_subscription_api.py** ❌
**Route:** `backend_v2/app/api/routes/subscription.py`  
**Coverage:** 44% (currently untested)

**Endpoints to test:**
- `GET /api/subscription/status` - Get subscription status
  - ✅ Success case
  - ✅ Without authentication (401)
  - ✅ Free tier user
  - ✅ Pro tier user
  - ✅ Expired subscription
  
- `POST /api/subscription/activate-dev` - Activate dev subscription
  - ✅ Success case
  - ✅ Without authentication (401)
  - ✅ Invalid subscription type
  - ✅ Already active subscription
  
- `POST /api/subscription/cancel` - Cancel subscription
  - ✅ Success case
  - ✅ Without authentication (401)
  - ✅ No active subscription
  - ✅ With cancellation reason
  
- `POST /api/subscription/change-plan` - Change subscription plan
  - ✅ Success case
  - ✅ Without authentication (401)
  - ✅ Invalid plan_id
  - ✅ Missing plan_id/subscription_type
  - ✅ Upgrade from free to pro
  - ✅ Downgrade from pro to free

**Estimated tests:** ~15-20 tests

---

### 3. **test_payment_api.py** ❌
**Route:** `backend_v2/app/api/routes/payment.py`  
**Coverage:** 70% (currently untested, but mock implementation)

**Endpoints to test:**
- `POST /api/payment/create-intent` - Create payment intent
  - ✅ Success case
  - ✅ Without authentication (401)
  - ✅ Invalid amount (negative, zero)
  - ✅ Invalid currency
  - ✅ With plan_id
  - ✅ Without plan_id
  
- `POST /api/payment/confirm` - Confirm payment
  - ✅ Success case
  - ✅ Without authentication (401)
  - ✅ Invalid payment_intent_id
  - ✅ Missing payment_intent_id
  - ✅ With plan_id
  - ✅ Without plan_id

**Note:** These are mock implementations. In production, would need Stripe integration tests.

**Estimated tests:** ~10-12 tests

---

### 4. **test_psyche_api.py** ❌
**Route:** `backend_v2/app/api/routes/psyche.py`  
**Coverage:** 45% (currently untested)

**Endpoints to test:**
- `GET /api/psyche/questions` - Get questionnaire questions
  - ✅ Success case
  - ✅ Without authentication (should work)
  - ✅ Verify question structure
  - ✅ Verify all questions present
  
- `POST /api/psyche/submit` - Submit questionnaire
  - ✅ Success case
  - ✅ Without authentication (401)
  - ✅ Empty answers
  - ✅ Invalid question_id
  - ✅ Invalid answer_id
  - ✅ Missing required answers
  - ✅ With optional_text
  - ✅ Without optional_text
  
- `GET /api/psyche/profile` - Get user profile
  - ✅ Success case
  - ✅ Without authentication (401)
  - ✅ No profile found
  - ✅ Verify profile structure
  
- `GET /api/psyche/profile/ai` - Get profile for AI
  - ✅ Success case
  - ✅ Without authentication (401)
  - ✅ No profile found
  - ✅ Verify AI-formatted structure
  - ✅ Verify no raw answers included

**Estimated tests:** ~15-18 tests

---

## Summary

**Total Missing Tests:** ~65-80 tests across 4 API test files

**Priority Order:**
1. 🔴 **test_subscription_api.py** - High priority (user billing/subscription management)
2. 🔴 **test_psyche_api.py** - High priority (user profiling feature)
3. 🟡 **test_frameworks_api.py** - Medium priority (business logic feature)
4. 🟡 **test_payment_api.py** - Low priority (mock implementation, will need Stripe integration later)

---

## Next Steps

1. Create `test_subscription_api.py` with comprehensive subscription management tests
2. Create `test_psyche_api.py` with questionnaire and profile tests
3. Create `test_frameworks_api.py` with framework CRUD tests
4. Create `test_payment_api.py` with payment intent tests (mock implementation)

After completing these, all API routes will have integration test coverage!

