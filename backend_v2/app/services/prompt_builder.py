"""
PromptBuilder – Constructs all LLM prompts used in the Discovery pipeline.

This class builds:
1. Stage 2 prompt  – Idea Research + Recommendations

Note: Profile Analysis prompt is built in ProfileAnalysisService._build_profile_prompt()
to use the new universal intake schema.
"""

from typing import Dict, Any
from app.services.conflict_detector import ConflictDetector


class PromptBuilder:
    """
    Builds structured prompts for the Discovery pipeline.
    """

    # ----------------------------------------------------------------------
    # STAGE 2 – IDEA RESEARCH + RECOMMENDATIONS PROMPT
    # ----------------------------------------------------------------------
    @staticmethod
    def build_idea_research_prompt(
        profile_analysis: str,
        realism_level: int = 3,
        user_inputs: Dict[str, Any] = None
    ) -> str:
        """
        Build the Stage 2 prompt using:
        - Stage 1 output (profile_analysis)
        - realism_level (1-5) to adjust tone and depth
        - user_inputs: All user input parameters for personalization
        
        Note: Tool results are no longer used in idea generation.
        Enrichment is handled separately via /discovery/enrich_idea endpoint.
        """
        user_inputs = user_inputs or {}
        
        # Extract skills as readable text - new format with capability groups
        skills_list = []
        skills = user_inputs.get("skills", {})
        if isinstance(skills, dict):
            for category, values in skills.items():
                if category != "other" and isinstance(values, list) and values:
                    skills_list.extend(values)
                elif category == "other" and values:
                    skills_list.append(values)
        
        # Format skills for prompt
        if skills_list:
            skills_text = "\n".join([f"- {skill}" for skill in skills_list])
        else:
            skills_text = "No specific skills selected"
        
        # Get startup category
        startup_category = user_inputs.get('startup_category', 'both')
        
        # Detect soft conflicts and build adjustment instructions
        conflicts = ConflictDetector.detect_conflicts(user_inputs)
        conflict_instructions = ConflictDetector.build_adjustment_instructions(conflicts, user_inputs)
        
        # Format user inputs section
        user_inputs_section = f"""
USER INPUT PROFILE (STRUCTURED):

- Startup Category: {startup_category}
- Industry Interest: {user_inputs.get('industry_interest', 'Not specified')}
- Sub-Interest: {user_inputs.get('sub_interest_area', 'Not specified')}
- Time Commitment: {user_inputs.get('time_commitment', 'Not specified')}
- Budget Range: {user_inputs.get('budget_range', 'Not specified')}
- Work Style: {user_inputs.get('preferred_work_style', user_inputs.get('work_style', 'Not specified'))}
- Startup Style: {user_inputs.get('startup_style', 'Not specified')}
- Customer Interaction Preference: {user_inputs.get('customer_interaction', 'Not specified')}
- Location: {user_inputs.get('location_context', 'Not specified')}
- Business Region: {user_inputs.get('business_region', 'Not specified')}
- Business Type: {user_inputs.get('business_type', 'Not specified')}
- Earnings Timeline: {user_inputs.get('earnings_timeline', 'Not specified')}
- Founder Ambition: {user_inputs.get('founder_ambition', 'Not specified')}

### Founder Skill Profile
List of skills selected:
{skills_text}

CRITICAL: Only propose ideas that directly match these skills OR require capabilities adjacent to them. 
- If user selected "Cooking / Food Prep" → ONLY suggest food/cooking/meal prep ideas
- If user selected "Crafting / Handmade" → ONLY suggest handmade/product design/Etsy-style ideas
- If user selected physical/home-based skills → AVOID AI-heavy, tech-intensive, or app development ideas
- If user did NOT select "Coding" or "AI & Automation" → DO NOT suggest software/app/AI platform ideas
- Match ideas to actual practical capabilities the user has demonstrated
"""
        
        # Extract profile analysis fields
        profile_data = {}
        try:
            import json
            start_marker = "---PROFILE_ANALYSIS_START---"
            end_marker = "---PROFILE_ANALYSIS_END---"
            start_idx = profile_analysis.find(start_marker)
            end_idx = profile_analysis.find(end_marker)
            
            if start_idx != -1 and end_idx != -1:
                json_text = profile_analysis[start_idx + len(start_marker):end_idx].strip()
                profile_data = json.loads(json_text)
            else:
                profile_data = json.loads(profile_analysis)
        except (json.JSONDecodeError, ValueError):
            profile_data = {}
        
        # Format psychological profile section
        psychological_profile_section = f"""
PSYCHOLOGICAL PROFILE SUMMARY:

- Core Motivations: {profile_data.get('core_motivations', 'Not available')}
- Operating Constraints: {profile_data.get('operating_constraints', 'Not available')}
- Strengths: {profile_data.get('strengths_and_capabilities', 'Not available')}
- Strategic Considerations: {profile_data.get('strategic_considerations', 'Not available')}
- Red Flags: {profile_data.get('viability_red_flags', 'Not available')}
- Pathway Recommendation: {profile_data.get('pathway_recommendation', 'Not available')}
"""
        
        # Adjust prompt tone based on realism level
        if realism_level <= 2:
            tone_instruction = """
Tone Guidelines:
- Use simple, encouraging, and accessible language
- Focus on ease of getting started
- Avoid complex business jargon
- Emphasize fun and achievable goals
- Do not mention regulations, compliance, or complex risks
- Keep descriptions optimistic and straightforward
"""
        elif realism_level >= 4:
            tone_instruction = """
Tone Guidelines:
- Use professional, founder-grade language
- Include realistic considerations (risks, market dynamics, competition)
- Mention economic factors and business strategy
- Provide actionable, detailed execution steps
- Address market validation and competitive landscape
- Include realistic timelines and resource requirements
"""
        else:
            tone_instruction = """
Tone Guidelines:
- Use practical, balanced language
- Include light risks and considerations
- Provide approachable details
- Mention simple competitor notes
- Keep tone encouraging but realistic
"""
        
        return f"""
You are StartupIdeaGPT. Generate personalized startup ideas that deeply understand the user's context, constraints, and goals.

{user_inputs_section}

{psychological_profile_section}

REALISM RULES YOU MUST FOLLOW:

1. Ideas must match the user's actual skills.
   If the user only has cooking skills, do NOT suggest apps, AI platforms, software startups, or businesses requiring technical staff.
   ONLY suggest ideas that can be executed with the user's stated skills.

2. Ideas must fit within:
   - User's time commitment (e.g., if 10-20 hrs/week, ideas must be part-time feasible)
   - User's budget range (e.g., if $5k-20k, ideas must be executable within that budget)
   - User's preferred work style (influences operational complexity and founder-fit):
     * Independent/Solo: Ideas must be executable by one person
     * Small collaborative team: Ideas can involve 2-5 people
     * Hands-on/Active work: Ideas require physical activity or manual work
     * Creative/Maker work: Ideas involve design, art, or creative production
     * People-facing/Service-oriented: Ideas require direct customer interaction
     * Remote-friendly: Ideas can be done from anywhere
     * Flexible/No preference: Ideas can vary in work style
   - User's startup style (influences business model, delivery, cost, scalability):
     * Home-based business: Ideas must work from a home office/workspace
     * Local service business: Ideas serve local/neighborhood customers
     * Online-only business: Ideas are fully digital with no physical presence
     * Content/creator-led business: Ideas focus on content creation or creator economy
     * Low-cost/bootstrapped: Ideas must be executable with minimal capital
     * Tech-assisted but not tech-intensive: Ideas use tech tools but don't require deep technical skills
     * Community-driven/local engagement: Ideas involve local community participation
   - User's customer interaction comfort level

3. Ideas must be realistically executable within the user's earnings timeline (e.g., 90 days means ideas must generate revenue quickly).

4. Ideas must be grounded in the user's chosen industry.
   Do not suggest ideas from different industries.

5. Keep ideas operationally simple and executable for a non-technical founder.
   Avoid complex technical requirements unless the user has technical skills.

6. Avoid overly complex, high-risk, long-development, or venture-style ideas unless user profile clearly supports it.

STARTUP CATEGORY RULE (CRITICAL):
The user has selected startup_category: {startup_category}

If startup_category == "tech":
- Generate ONLY tech / online / software / AI / digital businesses
- Ideas must be primarily digital products, software platforms, AI tools, or online services
- NO physical products, NO offline services, NO brick-and-mortar businesses
- Examples: SaaS platforms, AI chatbots, mobile apps, web applications, digital marketplaces, online courses
- Filter out any non-tech ideas after generation

If startup_category == "non_tech":
- Generate ONLY non-tech, physical, operational, offline or service-based businesses
- Ideas must involve physical products, in-person services, or offline operations
- NO software development, NO AI platforms, NO pure digital products
- Examples: restaurants, physical retail, home services, consulting services, manufacturing, local services
- Filter out any tech ideas after generation

If startup_category == "both":
- You can propose any reasonable mix of tech and non-tech ideas
- Balance the ideas based on user's skills and preferences

INDUSTRY BOUNDARY RULE:
All ideas MUST come from the user's selected industry and sub-interest.
No exceptions.
If user selects Food & Beverage + Meal Prep, ideas must be food prep related.
If user selects AI & Automation + Chatbots, ideas must be chatbot related.
Stay strictly within the industry boundary.

{conflict_instructions}

BUSINESS REGION CONSIDERATIONS:
The user's Business Region ({user_inputs.get('business_region', 'Not specified')}) must influence idea feasibility:

- Pricing assumptions: Adjust pricing to match regional purchasing power and market rates
- Feasibility: Consider regional regulations, infrastructure, and market maturity
- Cultural fit: Ensure ideas align with local customs, preferences, and business practices
- Delivery model: Adapt delivery methods (pickup vs delivery vs digital) based on regional logistics
- Legal complexity: Account for regional business registration, licensing, and compliance requirements
- Startup costs: Adjust cost estimates based on regional labor, materials, and service costs

Regional Guidelines:
- United States / Canada: Consider established infrastructure, higher purchasing power, regulatory compliance
- Europe: Account for GDPR, diverse languages/cultures, strong consumer protections
- India: Consider price sensitivity, mobile-first adoption, local payment methods
- Middle East: Account for cultural considerations, payment preferences, local partnerships
- Southeast Asia: Consider mobile-first, price sensitivity, diverse languages
- Africa: Account for infrastructure challenges, mobile money, local partnerships
- Latin America: Consider payment methods, language, local market dynamics
- Global / Online: Focus on digital-first, scalable, location-independent models

{tone_instruction}

OUTPUT FORMAT:
Always output structured startup ideas ONLY in the following format:

### IDEA_1
title: <title>
summary: <2–3 sentence value proposition>
target_market: <target customers>
revenue_model: <how money is earned>
validation_score: <1–10>
timeline: <time to launch>
why_this_fits: <tie explicitly to user profile>

### IDEA_2
...

CRITICAL: IDEA TITLE REQUIREMENTS

Each idea title MUST be a CONCRETE STARTUP IDEA, NOT a framework component or abstract concept.

VALID IDEA TITLES (examples):
- "Non-technical food founders launch cloud kitchens using shared commercial kitchens and Instagram-based ordering"
- "Local fitness coaches create personalized meal prep services for busy professionals"
- "Home-based crafters build Etsy stores selling custom pet accessories"
- "Remote consultants offer AI-powered business automation for small businesses"

INVALID IDEA TITLES (DO NOT USE):
- "Business Models" ❌
- "Target Segments" ❌
- "Value Propositions" ❌
- "Revenue Models" ❌
- "Market Opportunities" ❌
- "Customer Personas" ❌
- "Go-to-Market Strategy" ❌
- "Pricing Strategies" ❌
- "Validation Frameworks" ❌
- "Execution Plans" ❌
- Any abstract noun or framework term ❌

TITLE FORMAT REQUIREMENT:
Each title MUST follow this pattern: [Who] + [Problem] + [Solution]

Examples:
- "[Non-technical founders] + [struggling to start food businesses] + [launch cloud kitchens using shared kitchens]"
- "[Local fitness coaches] + [need additional income] + [create personalized meal prep services]"
- "[Home-based crafters] + [want to monetize skills] + [build Etsy stores selling custom accessories]"

Each IDEA block MUST be:
- A CONCRETE STARTUP IDEA (not a framework, concept, or strategy term)
- Practical, realistic, and relevant to the user's constraints
- Clear, concrete, and operationally feasible
- Grounded in the user's industry and sub-interest
- Executable with the user's skills, time, and budget
- Aligned with the user's psychological profile
- Include a specific customer (who), specific problem (what), and specific solution (how)

Rules:
- NO markdown formatting except the ### headers.
- NO bold text, no italics, no lists.
- NO code blocks.
- NEVER break tokens across lines.
- Never stream single words per line.
- Each field appears on ONE line only.
- Output must be plain text, not markdown.
- Adjust all content (titles, summaries, descriptions) to match the tone guidelines above.
- DO NOT return frameworks, categories, strategy terms, or abstract concepts as ideas.
- ONLY return fully-formed, concrete startup ideas.
"""


# End of PromptBuilder
