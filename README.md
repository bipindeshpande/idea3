# Idea Bunch - Startup Discovery SaaS Platform

## Overview

Idea Bunch is an AI-powered SaaS platform that helps professionals discover, validate, and prioritize startup ideas matched to their skills, constraints, and goals. The platform provides personalized recommendations, validation frameworks, and founder networking capabilities.

---

## Core Features

### 🎯 **AI-Powered Startup Discovery**
- Personalized startup idea recommendations based on user profile
- Two-stage AI analysis pipeline:
  - **Stage 1**: Profile analysis from intake form inputs
  - **Stage 2**: Personalized recommendations with detailed fit analysis
- Real-time streaming results with progress indicators
- Parallel execution for faster processing
- Redis + Database-backed caching for performance

### ✅ **Idea Validation**
- Comprehensive validation framework
- Parameter-based scoring system
- Risk assessment and mitigation strategies
- Financial outlook and breakeven analysis
- Validation reports with radar charts and score legends

### 👥 **Founder Network**
- Founder Connect: Network with other founders
- Founder Psychology: Psychological profiling and insights
- Open for Collaborators: Find co-founders and team members
- Credit system for network interactions

### 📊 **Dashboard & Analytics**
- Multi-tab dashboard interface:
  - **Ideas Tab**: View all discovered startup ideas
  - **Validations Tab**: Track validation results
  - **History Tab**: Complete run history
  - **Insights Tab**: Analytics and metrics
  - **Sessions Tab**: Active discovery sessions
  - **Compare Tab**: Compare multiple sessions side-by-side
- Session management and comparison tools
- Activity feed and action tracking
- Notes and annotations system

---

## Public Pages (No Authentication Required)

### 🏠 **Home Page** (`/`)
- Hero section with value proposition
- Marketing content and CTAs
- SEO optimized

### 📄 **Product Pages**
- **Product Overview** (`/product`): Main product information
- **Product Discover** (`/product/discover`): Discovery feature details
- **Product Validate** (`/product/validate`): Validation feature details
- **Product Network** (`/product/network`): Network feature details

### 💰 **Pricing** (`/pricing`)
- Subscription tiers and pricing
- Payment modal integration
- Feature comparison table
- Guarantee blocks and value propositions

### 📚 **Resources**
- **Resources Hub** (`/resources`): Main resources page
- **Templates** (`/resources/templates`): Downloadable templates
- **Frameworks** (`/resources/frameworks`): Startup frameworks
- **Advisor Resources** (`/advisor-resources`): Additional resources
- **Blog** (`/blog`): Blog articles and content
- **Blog Articles** (`/blog/:slug`): Individual blog posts

### ℹ️ **Information Pages**
- **About** (`/about`): Company information
- **Contact** (`/contact`): Contact form and information
- **Privacy Policy** (`/privacy`): Privacy policy
- **Terms of Service** (`/terms`): Terms and conditions

---

## User Features (Authentication Required)

### 🔐 **Authentication**
- User registration (`/register`)
- Login (`/login`)
- Password reset flow:
  - Forgot password (`/forgot-password`)
  - Reset password (`/reset-password`)
- Protected routes with subscription validation
- Session management

### 🎯 **Discovery Flow** (`/advisor`)
1. **Intake Screen**: Profile questionnaire
   - Goal type selection
   - Time commitment
   - Budget range
   - Interest areas
   - Work style preferences
   - Skill strengths
   - Experience summary

2. **Profile Report** (`/results/profile`): 
   - Detailed profile analysis
   - Strengths and opportunities
   - Personalized insights

3. **Recommendations Report** (`/results/recommendations`):
   - Top 3 ranked startup ideas
   - Fit analysis for each idea
   - Comparison matrix
   - Financial projections

4. **Recommendation Detail** (`/results/recommendations/:ideaIndex`):
   - Detailed breakdown of each idea
   - Financial outlook
   - Risk assessment
   - Action items and next steps

### ✅ **Idea Validation** (`/validate-idea`)
- Step-by-step validation process
- Parameter scoring:
  - Market size
  - Competition
  - Technical feasibility
  - Financial viability
  - Team requirements
- Real-time scoring updates
- Validation result report (`/validate-result`)
- PDF export capability

### 🧠 **Psychology Profiling**
- **Questionnaire** (`/psyche/questionnaire`): Psychological assessment
- **Profile** (`/psyche/profile`): Psychological profile results
- **Complete** (`/psyche/complete`): Completion screen

---

## Dashboard Features (`/dashboard`)

### 📊 **Dashboard Tabs**

#### **Ideas Tab** (`?tab=ideas`)
- View all discovered startup ideas
- Filter and search functionality
- Idea cards with key metrics
- Quick actions (validate, compare, share)

#### **Validations Tab** (`?tab=validations`)
- All validation results
- Score summaries
- Status indicators
- Quick access to detailed reports

#### **History Tab** (`?tab=history`)
- Complete run history
- Chronological timeline
- Filter by date, type, status
- Quick replay functionality

#### **Insights Tab** (`?tab=insights`)
- Analytics dashboard
- Trend analysis
- Success metrics
- Recommendations based on history

#### **Sessions Tab** (`?tab=sessions`)
- Active discovery sessions
- Session cards with progress
- Resume functionality
- Session management

### 🔄 **Compare Sessions** (`/dashboard/compare`)
- Side-by-side comparison
- Multi-session analysis
- Difference highlighting
- Export comparison reports

### 📜 **Run History** (`/dashboard/runs`)
- Detailed run history page
- Pagination support
- Filter and search
- Run details and metadata

### 👤 **Account Management** (`/account`)
- User profile settings
- Subscription management
- Billing information
- Preferences and settings

---

## Founder Features

### 🤝 **Founder Connect** (`/founder-connect`)
- Network with other founders
- Profile browsing
- Connection requests
- Collaboration opportunities
- Credit-based interactions

### 🧠 **Founder Psychology** (`/founder-psychology`)
- Psychological profiling
- Personality insights
- Behavioral analysis
- Team fit recommendations

---

## Resources & Templates

### 📋 **Available Templates**
1. **Business Plan Template**: Complete business plan structure
2. **Pitch Deck Template**: Investor pitch deck framework
3. **Customer Outreach Email Template**: Email templates for customer interviews
4. **Competitive Analysis Template**: Competitor analysis framework
5. **Customer Interview Script**: Interview questions and guide
6. **MVP Prioritization Matrix**: Feature prioritization tool
7. **Problem Validation Checklist**: Problem validation framework
8. **Pricing Validation Method**: Pricing strategy validation
9. **Landing Page Test Framework**: Landing page testing guide

### 📚 **Frameworks**
- Startup frameworks library
- Validation methodologies
- Business model templates
- Growth strategies

---

## Admin Features (`/admin`)

### 🔐 **Admin Authentication**
- Admin login (`/admin`)
- Admin password reset (`/admin/forgot-password`, `/admin/reset-password`)
- Separate admin interface (isolated from main app)

### 📊 **Admin Dashboard**
- System metrics and analytics
- Observability dashboard
- User activity monitoring
- API usage statistics
- Error logging and monitoring
- LLM usage tracking

---

## Technical Features

### 🏗️ **Architecture**
- **Frontend**: React + Vite
- **Backend**: FastAPI (Python)
- **Database**: PostgreSQL with JSONB support
- **Caching**: Redis + Database dual-layer caching
- **LLM Integration**: OpenAI and Anthropic (Claude) APIs

### 🎨 **UI/UX Features**
- **Layouts**:
  - Marketing Layout: Public pages with navigation and footer
  - Workspace Layout: Dashboard with sidebar navigation
  - Focus Layout: Focused work mode
- **Theme System**: Light/Dark mode support
- **Responsive Design**: Mobile-first approach
- **Loading States**: Progress indicators and skeletons
- **Error Handling**: Error boundaries and user-friendly messages

### 🔄 **Real-time Features**
- Server-Sent Events (SSE) for streaming results
- Real-time progress updates
- Live validation scoring
- Background job processing

### 💾 **Data Management**
- Local storage caching
- Session persistence
- Run history storage
- Notes and annotations
- Export capabilities (PDF, Markdown)

### 🔒 **Security Features**
- Protected routes
- Subscription validation
- Admin route isolation
- Secure authentication
- Password reset flow

### 📱 **API Integration**
- RESTful API endpoints
- Streaming endpoints
- Background job processing
- Status polling
- Error handling and retries

---

## Key Workflows

### 1. **Discovery Workflow**
```
User Registration → Login → Intake Form → 
Profile Analysis → Recommendations → 
Detailed Idea View → Validation → Dashboard
```

### 2. **Validation Workflow**
```
Select Idea → Validation Form → 
Parameter Scoring → Results Report → 
PDF Export → Dashboard Storage
```

### 3. **Founder Network Workflow**
```
Profile Setup → Browse Founders → 
Connection Request → Collaboration → 
Credit Management
```

---

## Data Models

### **User**
- Authentication credentials
- Subscription status
- Preferences and settings
- Activity history

### **Run**
- Discovery inputs
- Profile analysis results
- Personalized recommendations
- Status and timestamps

### **Validation**
- Idea details
- Parameter scores
- Risk assessments
- Financial projections

### **Founder Profile**
- Psychological profile
- Skills and interests
- Collaboration preferences
- Network connections

---

## Performance Optimizations

- **Caching**: Redis + Database dual-layer caching
- **Parallel Processing**: Stage 1 and tool preprocessing in parallel
- **Streaming**: Real-time result delivery via SSE
- **Lazy Loading**: Code splitting for heavy components
- **Optimized Queries**: Database indexing and JSONB operations

---

## Development Features

- **Error Boundaries**: Graceful error handling
- **Loading States**: User feedback during operations
- **Toast Notifications**: User action feedback
- **Form Validation**: Client and server-side validation
- **SEO Optimization**: Meta tags and structured data
- **Accessibility**: ARIA labels and keyboard navigation

---

## Future Enhancements (Planned)

- Enhanced analytics and insights
- Advanced comparison tools
- Team collaboration features
- API access for integrations
- Mobile applications
- Advanced AI models integration

---

## Support & Documentation

- **API Documentation**: Available in backend docs
- **Architecture Docs**: See `backend_v2/docs/`
- **Deployment Guides**: See deployment documentation
- **Troubleshooting**: See troubleshooting guides

---

*Last Updated: December 2024*

