/**
 * Sample data for development auto-fill functionality
 */

export const getAutoFillData = () => ({
  screen1: {
    industry: "SaaS / Software",
    geography: "US",
    stage: "Early Research",
    commitment: "Full-time Startup",
  },
  screen2: {
    problem_category: "Inefficiency",
    solution_type: "SaaS / Online Platform",
    user_type: "SMBs",
    revenue_model: "Subscription",
    unique_moat: "Superior UX",
    business_archetype: "Online software / AI product (SaaS / app / tool)",
  },
  structuredDescription: `1. Problem: 
Small businesses struggle to manage customer relationships effectively. They use multiple disconnected tools (email, spreadsheets, CRM) which leads to lost opportunities, poor follow-up, and inefficient workflows.

2. Solution:
An AI-powered all-in-one customer relationship platform that integrates email, CRM, task management, and automated follow-ups. Uses AI to suggest optimal contact times, personalize messages, and prioritize leads.

3. User:
Small to medium businesses (SMBs) with 5-50 employees, particularly in service industries like consulting, agencies, and professional services. They need better organization but can't afford enterprise CRM solutions.

4. Differentiation:
Unlike generic CRMs, this platform is built specifically for SMB workflows with AI that learns from their communication patterns. More affordable than enterprise solutions, more powerful than basic tools.

5. Monetization:
Freemium model with basic features free. Paid tiers starting at $29/month for advanced AI features, integrations, and team collaboration. Enterprise plans for larger teams.

6. Scope/Region:
Launch in US market first, targeting tech-savvy SMBs. Expand to English-speaking markets (Canada, UK, Australia) in year 2.`,
  optional: {
    initial_budget: "$1k–$10k",
    delivery_channel: "Online only",
    constraints: ["Limited Budget", "Limited Time"],
    competitors: "HubSpot, Salesforce (too expensive), Pipedrive (lacks AI features)",
  },
});

