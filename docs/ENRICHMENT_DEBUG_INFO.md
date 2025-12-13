# Enrichment Pipeline Debug Information

## 1. Fully Assembled Enrichment Prompt Text

The enrichment prompt is built in `backend_v2/app/services/tool_service.py` in the `_build_enrichment_prompt` method.

### System Prompt (sent to LLM):
```
You are an expert startup advisor creating a comprehensive playbook. Provide detailed, personalized insights for this specific startup idea, considering the user's unique constraints, strengths, and motivations.

CRITICAL: You MUST output EXACTLY these sections in this EXACT order with these EXACT headings. Use markdown format with ### for headings.

### Intro
### Why this Idea Fits You
### Financial Snapshot
### Execution Path
### Customer Persona
### Market Opportunity
### Key Risks & Mitigations
### Validation Questions
### Immediate Experiments
### Immediate Next Steps
### Timeline & Effort
### Decision Checklist
### Additional Insights

RULES:
- Use EXACTLY these headings - no variations, no synonyms, no different capitalization
- Every section MUST appear - even if empty, include the heading
- Use markdown format: ### Heading (with three # symbols)
- Each section should contain 3-5 sentences of actionable, personalized insights
- Return ONLY the sections above - no other content
```

### User Prompt Template:
```
Create a comprehensive startup playbook for this specific idea in the {industry} industry.

IDEA:
Title: {idea_title}
Summary: {idea_summary}
Target Market: {target_market}
Revenue Model: {revenue_model}

USER PROFILE:
Operating Constraints: {constraints}
Strengths & Capabilities: {strengths}
Core Motivations: {motivations}
Strategic Considerations: {strategic}
Viability Red Flags: {red_flags}

You MUST output EXACTLY these sections in this EXACT order with these EXACT markdown headings:

### Intro
Provide a brief introduction to this idea and why it's worth exploring.

### Why this Idea Fits You
Analyze how well this idea fits the user's profile. Highlight which strengths are most valuable, which constraints need workarounds, and specific ways to leverage their unique situation.

### Financial Snapshot
Provide specific cost estimates (setup, monthly, scaling) and financial projections. Consider their budget constraints and suggest cost-effective alternatives. Include startup costs, break-even timeline, and revenue potential.

### Execution Path
Provide a phased execution plan with specific steps:
- MVP Phase: What to build first, timeline, key features
- Build Phase: Next iteration, feature additions, validation milestones
- Launch Phase: Go-to-market activities and initial customer acquisition
- Scale Phase: Growth strategies, team needs, infrastructure requirements

### Customer Persona
Describe the ideal customer profile - demographics, pain points, goals, buying behavior, and how to reach them.

### Market Opportunity
What is the market size, growth potential, and validation approach? Provide specific data points, TAM/SAM/SOM estimates, and how the user's strengths align with market needs. Identify growth opportunities that leverage the user's capabilities.

### Key Risks & Mitigations
What are the specific risks for this user given their operating constraints? For each risk, provide concrete mitigation strategies. Be specific about how their constraints (time, budget, skills) impact this particular idea.

### Validation Questions
Provide 5-10 specific questions to validate demand, willingness to pay, and problem-solution fit. These should be questions to ask during customer interviews or surveys.

### Immediate Experiments
List 3-5 quick experiments to test assumptions and validate the idea early. These should be low-cost, fast experiments the user can run in the next 30 days.

### Immediate Next Steps
Create a week-by-week action plan for the first 30-60 days. Include specific tasks, milestones, and success metrics. Make it actionable given their time commitment.

### Timeline & Effort
Provide realistic timeline estimates for key milestones (MVP, launch, break-even, etc.) and the effort required at each phase. Consider the user's time commitment and skills.

### Decision Checklist
Provide a checklist of key decision points and criteria to evaluate whether to proceed with this idea. Include go/no-go criteria.

### Additional Insights
Any additional insights, opportunities, partnerships, or considerations that don't fit in the above sections.

CRITICAL: Use EXACTLY these headings with ### markdown format. Every section MUST appear, even if some content is brief.
```

**Note:** The full prompt with actual values will be logged to backend logs when enrichment is called. Check backend logs for the complete prompt with real data.

---

## 2. Raw Enrichment Markdown Returned by LLM

The raw markdown response from the LLM is now logged in:
- **Backend logs**: `ToolService: RAW ENRICHMENT MARKDOWN (BEFORE PARSING)` section
- **API logs**: When using JSON format, the full raw content is logged

To see it:
1. Check backend console/logs when enrichment is called
2. Look for the section marked `RAW ENRICHMENT MARKDOWN (BEFORE PARSING)`
3. The full content will be printed there

---

## 3. JSON Payload Returned to Frontend for activeIdea.body

The JSON payload structure returned by `/api/discovery/enrich_idea?format=json`:

```json
{
  "success": true,
  "enrichment": {
    "body": "<raw markdown content here>",
    "parsed": {
      "intro": "...",
      "why_fits": "...",
      "financial_snapshot": "...",
      "execution_path": "...",
      "customer_persona": "...",
      "market_opportunity": "...",
      "key_risks": "...",
      "validation_questions": "...",
      "immediate_experiments": "...",
      "immediate_next_steps": "...",
      "timeline_effort": "...",
      "decision_checklist": "...",
      "additional_insights": "..."
    }
  }
}
```

**Note:** The full JSON payload is logged in backend logs under `ENRICHMENT API RESPONSE (JSON FORMAT)` section.

For SSE streaming format, the raw markdown is streamed directly and should be accumulated in `activeIdea.body`.

---

## 4. Console.log("SECTIONS PARSED:", sections) Output

The console.log has been added in `RecommendationDetail.jsx` at line 473:

```javascript
console.log("SECTIONS PARSED:", merged);
```

This will output the complete parsed sections object to the browser console. Check the browser DevTools console when viewing a recommendation detail page.

---

## 5. Frontend Expected Section Headings

All frontend expected section headings are defined in `frontend/src/utils/formatters/recommendationFormatters.js`:

### FIXED_HEADINGS Mapping:
```javascript
const FIXED_HEADINGS = {
  "### intro": "intro",
  "### why this idea fits you": "why_fits",
  "### financial snapshot": "financial_snapshot",
  "### execution path": "execution_path",
  "### customer persona": "customer_persona",
  "### market opportunity": "market_opportunity",
  "### key risks & mitigations": "key_risks",
  "### validation questions": "validation_questions",
  "### immediate experiments": "immediate_experiments",
  "### immediate next steps": "immediate_next_steps",
  "### timeline & effort": "timeline_effort",
  "### decision checklist": "decision_checklist",
  "### additional insights": "additional_insights",
};
```

### DEFAULT_SECTIONS (in RecommendationDetail.jsx):
```javascript
const DEFAULT_SECTIONS = {
  intro: "",
  why_fits: "",
  financial_snapshot: "",
  execution_path: "",
  customer_persona: "",
  market_opportunity: "",
  key_risks: "",
  validation_questions: "",
  immediate_experiments: "",
  immediate_next_steps: "",
  timeline_effort: "",
  decision_checklist: "",
  additional_insights: "",
};
```

### Matching Rules:
- Headings must match **exactly** (case-insensitive) after `### ` prefix
- The parser looks for `### Heading` format
- Content after each heading is collected until the next heading
- Empty sections will have empty strings

---

## How to View the Debug Information

### Backend Logs:
1. Check your backend console/logs when calling enrichment
2. Look for sections marked with `===` separators:
   - `FULL ENRICHMENT PROMPT:`
   - `RAW ENRICHMENT MARKDOWN (BEFORE PARSING):`
   - `PARSED ENRICHMENT RESULT:`
   - `ENRICHMENT API RESPONSE (JSON FORMAT):`

### Frontend Console:
1. Open browser DevTools (F12)
2. Go to Console tab
3. Navigate to a recommendation detail page
4. Look for logs:
   - `splitIdeaSections: Parsing body...`
   - `splitIdeaSections: Found heading: ...`
   - `RecommendationDetail: Parsed sections`
   - `SECTIONS PARSED: {...}`

---

## Expected Flow:

1. **Backend generates prompt** → Logged in backend
2. **LLM returns markdown** → Logged in backend as "RAW ENRICHMENT MARKDOWN"
3. **Backend parses markdown** → Logged in backend as "PARSED ENRICHMENT RESULT"
4. **Backend returns to frontend** → Logged in backend as "JSON PAYLOAD RETURNED TO FRONTEND"
5. **Frontend receives body** → Logged in browser console
6. **Frontend parses sections** → Logged in browser console
7. **Final sections object** → Logged as "SECTIONS PARSED:" in browser console

