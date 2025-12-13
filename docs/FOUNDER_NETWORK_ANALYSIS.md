# Founder Network Functionality - Analysis & Implementation Plan

## Executive Summary

The Founder Network feature is a comprehensive co-founder matching and collaboration platform that allows users to:
- Create and manage founder profiles
- List startup ideas for collaboration
- Browse and connect with other founders
- Manage connection requests
- Track connection usage/credits

**Current Status**: Frontend is ~90% complete, Backend is ~10% complete (only psychology endpoints exist as stubs).

---

## 1. Current Implementation Status

### ✅ Frontend (Fully Implemented)

#### 1.1 Pages & Components
- **`FounderConnect.jsx`** (1,332 lines) - Main hub with 5 tabs:
  - **Profile Tab**: Create/edit founder profile
  - **Listings Tab**: Manage idea listings
  - **Browse Ideas Tab**: Discover ideas seeking collaborators
  - **Browse People Tab**: Find other founders
  - **Connections Tab**: Manage connection requests (sent/received)

- **`FounderPsychology.jsx`** (477 lines) - Psychology assessment form
- **`OpenForCollaboratorsButton.jsx`** (224 lines) - Button to create listings from ideas

#### 1.2 Key Frontend Features

**Profile Management:**
- Full name, bio, skills, experience
- Location, LinkedIn, website
- Primary skills (array)
- Industries of interest (array)
- Looking for (co-founder, team member, advisor, etc.)
- Commitment level (full-time, part-time, etc.)
- Public/private profile toggle
- Form validation with required fields

**Idea Listings:**
- Create listings from discovery/validation ideas
- Title, industry, stage, skills needed
- Brief description
- Link to source (run_id or validation_id)
- Edit/delete listings
- View listing details

**Browse & Discovery:**
- Filter ideas by: industry, stage, skills_needed, commitment_level, location
- Filter people by: skills, industries, commitment level, location
- Match reasons display (why this idea/person matches)
- Connection credit tracking
- Subscription tier limits (Free: 3/month, Starter: 15/month, Pro: Unlimited)

**Connections:**
- Send connection requests to ideas or people
- Accept/decline incoming requests
- Withdraw sent requests
- View connection details
- Track connection status (pending, accepted, declined)

**Psychology Assessment:**
- Motivation (with "Other" option)
- Biggest fear/barrier
- Decision-making style
- Energy pattern
- Consistency pattern
- Risk approach
- Success definition
- Founder archetype (required)

#### 1.3 Frontend API Calls (Expected Endpoints)

**Profile Endpoints:**
- `GET /api/founder/profile` - Get current user's profile
- `POST /api/founder/profile` - Create/update profile

**Psychology Endpoints:**
- `GET /api/founder/psychology` - Get psychology data
- `POST /api/founder/psychology` - Save psychology data

**Idea Listings:**
- `GET /api/founder/ideas` - Get user's listings
- `POST /api/founder/ideas` - Create new listing
- `GET /api/founder/ideas/{id}` - Get listing details
- `GET /api/founder/ideas/browse?page=1&per_page=20&industry=X&stage=Y` - Browse public listings

**People Browse:**
- `GET /api/founder/people/browse?page=1&per_page=20&skills=X&industries=Y` - Browse founder profiles

**Connections:**
- `GET /api/founder/connections` - Get connections (returns `{sent: [], received: []}`)
- `POST /api/founder/connect` - Send connection request
  - Body: `{idea_listing_id: string}` OR `{recipient_profile_id: string}`
- `PUT /api/founder/connections/{id}/respond` - Accept/decline request
  - Body: `{action: "accept" | "decline"}`
- `DELETE /api/founder/connections/{id}` - Withdraw/delete connection
- `GET /api/founder/connections/{id}/detail` - Get connection details

**Usage/Credits:**
- `GET /api/user/usage` - Get usage stats including connection credits
  - Expected: `{usage: {connections: {used: 0, limit: 3, remaining: 3}}}`

---

### ⚠️ Backend (Partially Implemented)

#### 2.1 What Exists
- **`backend_v2/app/api/routes/founder.py`** (79 lines)
  - `GET /api/founder/psychology` - Returns empty structure (stub)
  - `POST /api/founder/psychology` - Returns success without saving (stub)
  - Both marked with `TODO: Implement actual database storage`

#### 2.2 What's Missing

**Database Models:**
- ❌ `FounderProfile` model
- ❌ `IdeaListing` model
- ❌ `Connection` model
- ❌ `FounderPsychology` model (or add to User/Profile)

**API Endpoints:**
- ❌ All profile endpoints (GET/POST)
- ❌ All idea listing endpoints (GET/POST/GET by ID/Browse)
- ❌ All people browse endpoints
- ❌ All connection endpoints (GET/POST/PUT/DELETE/Detail)
- ❌ Usage/credits tracking for connections

**Services:**
- ❌ `FounderService` for business logic
- ❌ Connection matching algorithm
- ❌ Credit/usage tracking service

---

## 2. Database Schema Design

### 2.1 FounderProfile Table
```sql
CREATE TABLE founder_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    
    -- Basic Info
    full_name VARCHAR(255) NOT NULL,
    bio TEXT NOT NULL,
    location VARCHAR(255),
    linkedin_url VARCHAR(500),
    website_url VARCHAR(500),
    
    -- Skills & Interests
    primary_skills JSONB NOT NULL DEFAULT '[]', -- Array of strings
    industries_of_interest JSONB NOT NULL DEFAULT '[]', -- Array of strings
    skills JSONB DEFAULT '[]', -- Legacy/backup
    
    -- Preferences
    looking_for VARCHAR(100), -- co-founder, team_member, advisor, etc.
    commitment_level VARCHAR(50), -- full_time, part_time, etc.
    experience_summary TEXT,
    
    -- Visibility
    is_public BOOLEAN DEFAULT true,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(user_id),
    INDEX idx_founder_profiles_public (is_public, created_at),
    INDEX idx_founder_profiles_skills (primary_skills) USING GIN,
    INDEX idx_founder_profiles_industries (industries_of_interest) USING GIN
);
```

### 2.2 FounderPsychology Table
```sql
CREATE TABLE founder_psychology (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    
    motivation VARCHAR(255),
    motivation_other TEXT,
    fear VARCHAR(255),
    fear_other TEXT,
    decision_style VARCHAR(50),
    energy_pattern VARCHAR(50),
    consistency_pattern VARCHAR(50),
    risk_approach VARCHAR(50),
    success_definition VARCHAR(255),
    success_other TEXT,
    archetype VARCHAR(50), -- Visionary, Builder, Operator, etc.
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(user_id)
);
```

### 2.3 IdeaListing Table
```sql
CREATE TABLE idea_listings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    
    -- Idea Info
    title VARCHAR(500) NOT NULL,
    brief_description TEXT NOT NULL,
    industry VARCHAR(255),
    stage VARCHAR(50), -- idea, mvp, launched, etc.
    skills_needed JSONB DEFAULT '[]', -- Array of strings
    
    -- Source Tracking
    source_type VARCHAR(50), -- 'discovery' or 'validation'
    source_id VARCHAR(255), -- run_id or validation_id
    
    -- Metadata
    is_active BOOLEAN DEFAULT true,
    views_count INTEGER DEFAULT 0,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE, -- Soft delete
    
    INDEX idx_idea_listings_user (user_id, is_active),
    INDEX idx_idea_listings_browse (is_active, industry, stage, created_at),
    INDEX idx_idea_listings_skills (skills_needed) USING GIN
);
```

### 2.4 Connection Table
```sql
CREATE TABLE connections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Participants
    sender_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    recipient_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    
    -- Connection Type
    connection_type VARCHAR(50) NOT NULL, -- 'idea' or 'profile'
    idea_listing_id UUID REFERENCES idea_listings(id) ON DELETE CASCADE,
    recipient_profile_id UUID REFERENCES founder_profiles(id) ON DELETE CASCADE,
    
    -- Status
    status VARCHAR(50) NOT NULL DEFAULT 'pending', -- pending, accepted, declined, withdrawn
    
    -- Optional Message
    message TEXT,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    responded_at TIMESTAMP WITH TIME ZONE,
    
    -- Constraints
    CHECK (
        (connection_type = 'idea' AND idea_listing_id IS NOT NULL) OR
        (connection_type = 'profile' AND recipient_profile_id IS NOT NULL)
    ),
    
    INDEX idx_connections_sender (sender_id, status),
    INDEX idx_connections_recipient (recipient_id, status),
    INDEX idx_connections_idea (idea_listing_id),
    INDEX idx_connections_status (status, created_at)
);
```

### 2.5 ConnectionUsage Table (for credit tracking)
```sql
CREATE TABLE connection_usage (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    connection_id UUID NOT NULL REFERENCES connections(id) ON DELETE CASCADE,
    
    -- Track monthly usage
    usage_month DATE NOT NULL, -- First day of month (e.g., '2024-01-01')
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(user_id, connection_id, usage_month),
    INDEX idx_connection_usage_user_month (user_id, usage_month)
);
```

---

## 3. Implementation Plan

### Phase 1: Database Models & Migrations (Priority: HIGH)

**Tasks:**
1. Create SQLAlchemy models:
   - `app/models/founder_profile.py`
   - `app/models/founder_psychology.py`
   - `app/models/idea_listing.py`
   - `app/models/connection.py`
   - `app/models/connection_usage.py`

2. Create Alembic migration:
   - `009_add_founder_network_tables.py`
   - Include all 5 tables with proper indexes

3. Update `app/models/user.py`:
   - Add relationships: `founder_profile`, `idea_listings`, `sent_connections`, `received_connections`

4. Update `app/models/__init__.py`:
   - Export new models

**Estimated Time:** 4-6 hours

---

### Phase 2: Founder Service (Priority: HIGH)

**Create `app/services/founder_service.py`:**

**Methods Needed:**
1. **Profile Management:**
   - `get_founder_profile(user_id)` - Get profile by user_id
   - `create_or_update_profile(user_id, profile_data)` - Upsert profile
   - `get_public_profiles(filters, page, per_page)` - Browse people

2. **Psychology:**
   - `get_psychology(user_id)` - Get psychology data
   - `save_psychology(user_id, psychology_data)` - Save/update

3. **Idea Listings:**
   - `get_user_listings(user_id)` - Get user's listings
   - `create_listing(user_id, listing_data)` - Create new listing
   - `get_listing(listing_id)` - Get by ID
   - `update_listing(listing_id, user_id, updates)` - Update listing
   - `delete_listing(listing_id, user_id)` - Soft delete
   - `browse_listings(filters, page, per_page)` - Browse public listings

4. **Connections:**
   - `get_user_connections(user_id)` - Get sent/received connections
   - `send_connection_request(sender_id, request_data)` - Create connection
   - `respond_to_connection(connection_id, recipient_id, action)` - Accept/decline
   - `withdraw_connection(connection_id, sender_id)` - Withdraw request
   - `get_connection_detail(connection_id, user_id)` - Get details
   - `check_connection_credits(user_id, subscription_type)` - Check limits

5. **Matching Logic:**
   - `calculate_match_score(profile1, profile2)` - For people matching
   - `calculate_idea_match(profile, idea)` - For idea matching

**Estimated Time:** 8-12 hours

---

### Phase 3: API Endpoints (Priority: HIGH)

**Update `app/api/routes/founder.py`:**

**Profile Endpoints:**
```python
GET  /api/founder/profile
POST /api/founder/profile
```

**Psychology Endpoints:**
```python
GET  /api/founder/psychology
POST /api/founder/psychology
```

**Idea Listing Endpoints:**
```python
GET  /api/founder/ideas
POST /api/founder/ideas
GET  /api/founder/ideas/{listing_id}
PUT  /api/founder/ideas/{listing_id}
DELETE /api/founder/ideas/{listing_id}
GET  /api/founder/ideas/browse
```

**People Browse:**
```python
GET  /api/founder/people/browse
```

**Connections:**
```python
GET  /api/founder/connections
POST /api/founder/connect
PUT  /api/founder/connections/{connection_id}/respond
DELETE /api/founder/connections/{connection_id}
GET  /api/founder/connections/{connection_id}/detail
```

**All endpoints require:**
- Authentication (`get_current_user`)
- Proper error handling
- Input validation (Pydantic models)
- Response formatting matching frontend expectations

**Estimated Time:** 6-8 hours

---

### Phase 4: Usage/Credits Tracking (Priority: MEDIUM)

**Update `app/services/user_service.py`:**

Add method:
```python
def get_user_usage(self, user_id: str) -> Dict[str, Any]:
    """Get usage stats including connection credits"""
    # Count connections this month
    # Get subscription limits
    # Return formatted usage object
```

**Update `app/api/routes/user.py`:**

Ensure `GET /api/user/usage` returns:
```json
{
  "success": true,
  "usage": {
    "connections": {
      "used": 2,
      "limit": 3,
      "remaining": 1
    }
  }
}
```

**Connection Credit Logic:**
- Track connections created in current month
- Free tier: 3/month
- Starter tier: 15/month
- Pro/Annual: Unlimited (999)
- Reset on 1st of each month

**Estimated Time:** 3-4 hours

---

### Phase 5: Matching Algorithm (Priority: LOW - Enhancement)

**Features:**
1. **People Matching:**
   - Match on shared skills
   - Match on shared industries
   - Match on complementary skills
   - Match on commitment level
   - Match on location (optional)

2. **Idea Matching:**
   - Match user skills to idea's `skills_needed`
   - Match user industries to idea's industry
   - Match commitment level
   - Calculate match score (0-100)

3. **Display Match Reasons:**
   - Show top 3 match reasons
   - Format: "Match on: Skill X · Industry Y · Commitment Level"

**Estimated Time:** 4-6 hours

---

## 4. Data Flow Examples

### 4.1 Creating a Profile
```
User fills form → POST /api/founder/profile
→ FounderService.create_or_update_profile()
→ Insert/Update founder_profiles table
→ Return profile object
→ Frontend updates UI
```

### 4.2 Creating Idea Listing
```
User clicks "Open for Collaborators" → POST /api/founder/ideas
→ FounderService.create_listing()
→ Insert idea_listings table
→ Return listing object
→ Frontend navigates to listings tab
```

### 4.3 Sending Connection Request
```
User clicks "Connect" → POST /api/founder/connect
→ Check connection credits (usage_service)
→ FounderService.send_connection_request()
→ Insert connections table
→ Insert connection_usage table (for credit tracking)
→ Return connection object
→ Frontend updates button state
```

### 4.4 Browsing Ideas
```
User opens Browse Ideas tab → GET /api/founder/ideas/browse?industry=X&stage=Y
→ FounderService.browse_listings(filters)
→ Query idea_listings WHERE is_active=true AND filters
→ Calculate match reasons (if user has profile)
→ Return paginated results
→ Frontend displays with match reasons
```

---

## 5. Key Considerations

### 5.1 Security
- All endpoints require authentication
- Users can only edit their own profiles/listings
- Users can only respond to connections sent to them
- Validate ownership before DELETE operations
- Rate limiting on connection requests

### 5.2 Performance
- Use GIN indexes on JSONB arrays (skills, industries)
- Paginate browse endpoints (default 20 per page)
- Cache public profiles/listings (optional)
- Optimize connection queries with proper indexes

### 5.3 Data Integrity
- Soft delete for listings (preserve connection history)
- Cascade deletes for connections when user/profile deleted
- Unique constraints (one profile per user, one connection per pair)
- Check constraints (connection_type validation)

### 5.4 User Experience
- Show match reasons to help users decide
- Display connection credits prominently
- Clear error messages for credit limits
- Auto-create profile when user first accesses Founder Connect
- Pre-fill listing data from discovery/validation

---

## 6. Testing Checklist

### 6.1 Profile
- [ ] Create profile with all fields
- [ ] Update profile
- [ ] Validate required fields
- [ ] Test public/private toggle
- [ ] Test skills/industries arrays

### 6.2 Listings
- [ ] Create listing from discovery idea
- [ ] Create listing from validation idea
- [ ] Edit listing
- [ ] Delete listing (soft delete)
- [ ] Browse listings with filters
- [ ] Pagination works

### 6.3 Connections
- [ ] Send connection to idea
- [ ] Send connection to profile
- [ ] Accept connection
- [ ] Decline connection
- [ ] Withdraw connection
- [ ] Credit tracking (counts correctly)
- [ ] Credit limits enforced

### 6.4 Psychology
- [ ] Save psychology data
- [ ] Load psychology data
- [ ] Validate archetype required

### 6.5 Edge Cases
- [ ] User without profile tries to create listing
- [ ] User at credit limit tries to connect
- [ ] Duplicate connection requests
- [ ] Browse with no results
- [ ] Invalid filters

---

## 7. Estimated Total Implementation Time

- **Phase 1 (Models):** 4-6 hours
- **Phase 2 (Service):** 8-12 hours
- **Phase 3 (API):** 6-8 hours
- **Phase 4 (Credits):** 3-4 hours
- **Phase 5 (Matching):** 4-6 hours (optional)

**Total (Phases 1-4):** 21-30 hours
**With Matching:** 25-36 hours

---

## 8. Next Steps

1. **Review this plan** with team
2. **Prioritize phases** based on business needs
3. **Start with Phase 1** (database models)
4. **Test incrementally** after each phase
5. **Deploy to staging** after Phase 3
6. **Add matching algorithm** (Phase 5) as enhancement

---

## 9. Files to Create/Modify

### New Files:
- `backend_v2/app/models/founder_profile.py`
- `backend_v2/app/models/founder_psychology.py`
- `backend_v2/app/models/idea_listing.py`
- `backend_v2/app/models/connection.py`
- `backend_v2/app/models/connection_usage.py`
- `backend_v2/app/services/founder_service.py`
- `backend_v2/migrations/versions/009_add_founder_network_tables.py`

### Files to Modify:
- `backend_v2/app/models/user.py` (add relationships)
- `backend_v2/app/models/__init__.py` (export new models)
- `backend_v2/app/api/routes/founder.py` (add all endpoints)
- `backend_v2/app/services/user_service.py` (add usage tracking)
- `backend_v2/app/api/routes/user.py` (update usage endpoint)

---

## 10. API Response Examples

### GET /api/founder/profile
```json
{
  "success": true,
  "profile": {
    "id": "uuid",
    "user_id": "uuid",
    "full_name": "John Doe",
    "bio": "Experienced founder...",
    "primary_skills": ["Product Management", "Marketing"],
    "industries_of_interest": ["AI", "SaaS"],
    "looking_for": "co-founder",
    "commitment_level": "full_time",
    "is_public": true,
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
  }
}
```

### GET /api/founder/connections
```json
{
  "success": true,
  "sent": [
    {
      "id": "uuid",
      "status": "pending",
      "connection_type": "idea",
      "idea_listing": {...},
      "recipient": {...},
      "created_at": "2024-01-01T00:00:00Z"
    }
  ],
  "received": [
    {
      "id": "uuid",
      "status": "pending",
      "connection_type": "profile",
      "sender": {...},
      "created_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

### GET /api/founder/ideas/browse
```json
{
  "success": true,
  "listings": [
    {
      "id": "uuid",
      "title": "AI-Powered Analytics Platform",
      "industry": "SaaS",
      "stage": "idea",
      "skills_needed": ["Backend Development", "Data Science"],
      "match_reasons": ["Backend Development", "SaaS"],
      "creator": {
        "full_name": "Jane Smith",
        "location": "San Francisco"
      }
    }
  ],
  "pagination": {
    "page": 1,
    "per_page": 20,
    "total": 45,
    "total_pages": 3
  }
}
```

---

**End of Analysis**

