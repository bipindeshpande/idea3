# app/services/tool_service.py
from typing import Dict, Any, Optional
import json

from app.services.base_service import BaseService
from app.services.llm_service import LLMService
from app.services.psyche_scoring_service import PsycheScoringService
from app.utils.file_logger import write_to_log, write_section_to_log


class ToolService(BaseService):
    """
    Handles idea-specific enrichment via premium LLM calls.
    Used only for on-demand enrichment of individual ideas.
    """

    def __init__(self, db, redis_client=None):
        super().__init__(db, redis_client)
        self.llm_service = LLMService(db, redis_client)
        self.psyche_scoring_service = PsycheScoringService(db, redis_client)
        # Test file logger on initialization
        try:
            write_to_log("ToolService initialized", "INFO", "ToolService")
        except Exception as e:
            print(f"Warning: File logger test failed: {e}")

    # ------------------------------------------------------------------
    # PUBLIC API
    # ------------------------------------------------------------------
    async def enrich_idea_stream(
        self,
        idea: Dict[str, Any],
        industry: str,
        profile_analysis: Dict[str, Any],
        run_id: Optional[str] = None,
        user_id: Optional[str] = None
    ):
        """
        Stream enriched playbook for a specific idea (SSE format).
        
        Yields chunks of the enriched playbook as it's generated.
        """
        idea_title = idea.get("title", "")
        idea_summary = idea.get("summary", "")
        
        if not idea_title or not idea_summary:
            self._log("ToolService: enrich_idea_stream called with missing title or summary", "WARNING")
            yield "data: [ERROR] Idea must have title and summary\n\n"
            return
        
        # Build personalized enrichment prompt
        prompt = self._build_enrichment_prompt(idea, industry, profile_analysis, user_id)
        
        system_prompt = self._build_enrichment_system_prompt()
        
        try:
            self._log(f"ToolService: Streaming enrichment for idea '{idea_title}' in '{industry}'", "INFO")
            
            # Log streaming start
            try:
                write_to_log(f"Enrichment streaming started for idea: {idea_title} in industry: {industry}", "INFO", "ToolService")
            except Exception as log_err:
                print(f"Warning: Failed to write streaming start log: {log_err}")
            
            # Stream LLM response
            async for chunk in self.llm_service.generate_stream(
                prompt=prompt,
                system_prompt=system_prompt,
                temperature=0.4,
                max_tokens=4000,
                run_id=run_id
            ):
                yield chunk
            
            self._log(f"ToolService: Enrichment streaming completed for '{idea_title}'", "INFO")
            
            # Log streaming completion
            try:
                write_to_log(f"Enrichment streaming completed for idea: {idea_title}", "INFO", "ToolService")
            except Exception as log_err:
                print(f"Warning: Failed to write streaming completion log: {log_err}")
            
        except Exception as e:
            self._log(f"ToolService: Idea enrichment streaming failed for '{idea_title}': {e}", "WARNING")
            # Log streaming error
            try:
                import traceback
                error_details = f"Error: {str(e)}\n\nTraceback:\n{traceback.format_exc()}"
                write_section_to_log(f"ENRICHMENT STREAMING ERROR for '{idea_title}'", error_details, "ERROR", "ToolService")
            except Exception as log_err:
                print(f"Warning: Failed to write streaming error log: {log_err}")
            yield f"data: [ERROR] Enrichment failed: {str(e)}\n\n"
    
    def enrich_idea(
        self,
        idea: Dict[str, Any],
        industry: str,
        profile_analysis: Dict[str, Any],
        run_id: Optional[str] = None,
        user_id: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Get personalized research for a specific idea.
        
        Uses:
        - Idea details (title, summary)
        - Industry context
        - User's profile (constraints, strengths, motivations)
        
        Returns personalized insights:
        - competitors: Specific competitors given user's constraints
        - market_validation: Market fit given user's strengths
        - risks: Risks specific to user's situation
        - opportunities: Opportunities leveraging user's capabilities
        """
        idea_title = idea.get("title", "")
        idea_summary = idea.get("summary", "")
        
        if not idea_title or not idea_summary:
            self._log("ToolService: enrich_idea called with missing title or summary", "WARNING")
            return self._get_empty_enrichment_output()
        
        # Build personalized enrichment prompt
        prompt = self._build_enrichment_prompt(idea, industry, profile_analysis, user_id)
        
        system_prompt = self._build_enrichment_system_prompt()
        
        try:
            self._log(f"ToolService: Enriching idea '{idea_title}' in '{industry}'", "INFO")
            
            # Always log that enrichment started
            try:
                write_to_log(f"Enrichment started for idea: {idea_title} in industry: {industry}", "INFO", "ToolService")
            except Exception as log_err:
                print(f"Warning: Failed to write start log: {log_err}")
            
            # Log full prompt for debugging to file
            try:
                full_prompt_text = f"SYSTEM PROMPT:\n{system_prompt}\n\n" + "-"*80 + "\n\n" + f"USER PROMPT:\n{prompt}"
                write_section_to_log("FULL ENRICHMENT PROMPT", full_prompt_text, "DEBUG", "ToolService")
            except Exception as log_err:
                print(f"Warning: Failed to write prompt log: {log_err}")
                import traceback
                traceback.print_exc()
            
            response = self.llm_service.generate(
                prompt=prompt,
                system_prompt=system_prompt,
                temperature=0.4,
                max_tokens=4000,
                run_id=run_id
            )
            
            content = response.get("content", "")
            
            # Log raw LLM response before parsing to file
            try:
                raw_content_text = f"Content length: {len(content)}\n\nFull content:\n{content}"
                write_section_to_log("RAW ENRICHMENT MARKDOWN (BEFORE PARSING)", raw_content_text, "DEBUG", "ToolService")
            except Exception as log_err:
                print(f"Warning: Failed to write raw content log: {log_err}")
                import traceback
                traceback.print_exc()
            
            result = self._parse_enrichment_response(content)
            
            # Log parsed result to file
            try:
                import json
                parsed_result_text = json.dumps(result, indent=2)
                write_section_to_log("PARSED ENRICHMENT RESULT", parsed_result_text, "DEBUG", "ToolService")
            except Exception as log_err:
                print(f"Warning: Failed to write parsed result log: {log_err}")
                import traceback
                traceback.print_exc()
            
            # Log completion
            try:
                write_to_log(f"Enrichment completed for idea: {idea_title}", "INFO", "ToolService")
            except Exception as log_err:
                print(f"Warning: Failed to write completion log: {log_err}")
            
            self._log(f"ToolService: Enrichment completed for '{idea_title}'", "INFO")
            # Return both parsed result and raw content
            return {
                "parsed": result,
                "raw_content": content
            }
            
        except Exception as e:
            self._log(f"ToolService: Idea enrichment failed for '{idea_title}': {e}", "WARNING")
            # Log error to file
            try:
                import traceback
                error_details = f"Error: {str(e)}\n\nTraceback:\n{traceback.format_exc()}"
                write_section_to_log(f"ENRICHMENT ERROR for '{idea_title}'", error_details, "ERROR", "ToolService")
            except Exception as log_err:
                print(f"Warning: Failed to write error log: {log_err}")
            empty_result = self._get_empty_enrichment_output()
            return {
                "parsed": empty_result,
                "raw_content": ""
            }
    
    def _build_enrichment_system_prompt(self) -> str:
        """Build the system prompt for enrichment with all required instructions."""
        return """You are an expert startup advisor creating a comprehensive playbook. Provide detailed, personalized insights for this specific startup idea, considering the user's unique constraints, strengths, and motivations.

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

### Why this Idea Fits You - CRITICAL INSTRUCTIONS:

In this section, you MUST:
1. Clearly state ONE strong reason this idea fits the user (grounded in their constraints, preferences, or operating style)
2. Clearly state ONE meaningful tension or stretch this idea creates for the user (a practical challenge they'll face)

Both must be grounded in the user's constraints, preferences, or operating style.

Do NOT:
- Use personality trait names (e.g., "high conscientiousness", "low risk tolerance")
- Mention assessments or scores
- Use psychological terminology
- Frame in terms of traits or psychological labels

Frame everything in practical terms:
- Work style preferences (e.g., "structured planning", "fast iteration")
- Execution preferences (e.g., "thoroughness over speed", "flexibility over structure")
- Risk comfort (e.g., "cautious with irreversible risk", "comfortable with calculated risks")
- Constraints (e.g., "time commitment", "budget limitations", "skill requirements")

REQUIRED ACTIONS (Global):
- Filter ideas that conflict with the user's work preferences and decision-making approach
- Rank ideas that best align with their motivation and how they prefer to work
- Explain why each recommendation fits their preferences in practical, work-oriented terms
- Warn about potential friction points based on their work style
- If applicable, explicitly mention ONE alternative direction, approach, or variant that was deprioritized or excluded due to the user's preferences or constraints
  * This should be phrased practically (e.g., speed, risk, structure, effort), not psychologically
  * Example: "More speculative, research-heavy analytics products were deprioritized due to your preference for structured execution and cautious risk posture."

CRITICAL EXPLANATION RULE:
Do NOT mention personality traits, scores, assessments, or labels.
All explanations must be framed in practical work style, execution preferences, risk comfort, and constraints.
Example: "This idea allows you to build deep expertise" NOT "This fits your high mastery motivation"
Example: "This requires rapid pivoting" NOT "This conflicts with your low openness trait"

ABSOLUTE RULE: If any other context suggests different patterns than the user's deterministic preferences, TRUST THE PREFERENCES. Do not infer or override."""
    
    def _build_enrichment_prompt(
        self,
        idea: Dict[str, Any],
        industry: str,
        profile: Dict[str, Any],
        user_id: Optional[str] = None
    ) -> str:
        """Build premium enrichment prompt with comprehensive playbook."""
        idea_title = idea.get("title", "")
        idea_summary = idea.get("summary", "")
        target_market = idea.get("target_market", "")
        revenue_model = idea.get("revenue_model", "")
        
        # Ensure profile is a dict (handle case where it might be a string or None)
        if not isinstance(profile, dict):
            profile = {}
        
        # Extract profile fields
        constraints = profile.get("operating_constraints", "Not specified")
        strengths = profile.get("strengths_and_capabilities", "Not specified")
        motivations = profile.get("core_motivations", "Not specified")
        red_flags = profile.get("viability_red_flags", "None identified")
        strategic = profile.get("strategic_considerations", "")
        
        # Get psyche profile if user_id is available
        psyche_section = ""
        if user_id:
            psyche_profile = self.psyche_scoring_service.get_profile_for_ai(user_id)
            if psyche_profile:
                psyche_section = "\n\nUSER WORK PREFERENCES (Deterministic):\n"
                psyche_section += "CRITICAL: These behavioral patterns are DETERMINISTIC and must be used as-is. DO NOT infer or contradict these patterns from other context.\n"
                
                # Translate personality traits into behavioral descriptors
                if psyche_profile.get("personality"):
                    personality = psyche_profile["personality"]
                    behaviors = []
                    
                    # Openness (O)
                    if personality.get("O", 0.5) > 0.67:
                        behaviors.append("User prefers exploring new ideas and possibilities over following established paths.")
                    elif personality.get("O", 0.5) < 0.33:
                        behaviors.append("User prefers proven approaches and familiar methods over experimental ones.")
                    
                    # Conscientiousness (C)
                    if personality.get("C", 0.5) > 0.67:
                        behaviors.append("User prefers structured planning, organization, and clarity over fast iteration.")
                    elif personality.get("C", 0.5) < 0.33:
                        behaviors.append("User prefers flexibility and spontaneity over rigid structure.")
                    
                    # Extraversion (E)
                    if personality.get("E", 0.5) > 0.67:
                        behaviors.append("User is energized by collaboration and team interaction.")
                    elif personality.get("E", 0.5) < 0.33:
                        behaviors.append("User prefers working independently or in small, focused groups.")
                    
                    # Agreeableness (A)
                    if personality.get("A", 0.5) > 0.67:
                        behaviors.append("User prefers finding common ground and building consensus.")
                    elif personality.get("A", 0.5) < 0.33:
                        behaviors.append("User is comfortable challenging ideas and engaging in debate.")
                    
                    # Neuroticism (N) - inverted to stress response
                    if personality.get("N", 0.5) < 0.33:
                        behaviors.append("User stays calm and adapts well when things go wrong.")
                    elif personality.get("N", 0.5) > 0.67:
                        behaviors.append("User may feel more stress under uncertainty and prefers stable situations.")
                    
                    if behaviors:
                        psyche_section += "\nHow User Prefers to Work:\n"
                        for behavior in behaviors:
                            psyche_section += f"- {behavior}\n"
                
                # Translate decision style into behavioral descriptors
                if psyche_profile.get("decision_style"):
                    decision = psyche_profile["decision_style"]
                    decision_behaviors = []
                    
                    if "risk" in decision:
                        if decision["risk"] < 0.4:
                            decision_behaviors.append("User is cautious with irreversible risk, especially early in a venture.")
                        elif decision["risk"] > 0.6:
                            decision_behaviors.append("User is comfortable taking calculated risks when the potential payoff is clear.")
                    
                    if "speed_vs_certainty" in decision:
                        if decision["speed_vs_certainty"] > 0.6:
                            decision_behaviors.append("User prefers thoroughness and certainty over speed when making important decisions.")
                        elif decision["speed_vs_certainty"] < 0.4:
                            decision_behaviors.append("User prefers quick action and iteration over waiting for perfect information.")
                    
                    if "maximize" in decision:
                        if decision["maximize"] > 0.6:
                            decision_behaviors.append("User tends to compare many options thoroughly before choosing.")
                        elif decision["maximize"] < 0.4:
                            decision_behaviors.append("User is comfortable choosing the first option that meets their core requirements.")
                    
                    if decision_behaviors:
                        psyche_section += "\nDecision-Making Approach:\n"
                        for behavior in decision_behaviors:
                            psyche_section += f"- {behavior}\n"
                
                # Translate motivation into behavioral descriptors
                if psyche_profile.get("motivation"):
                    motivation = psyche_profile["motivation"]
                    # Find dominant motivation
                    dominant = max(motivation.items(), key=lambda x: x[1])
                    motivation_behaviors = []
                    
                    if dominant[1] > 0.4:  # Significant preference
                        if dominant[0] == "mastery":
                            motivation_behaviors.append("User is motivated by skill-building, depth, and expertise over quick wins.")
                        elif dominant[0] == "autonomy":
                            motivation_behaviors.append("User is motivated by independence, control, and freedom to work on their own terms.")
                        elif dominant[0] == "purpose":
                            motivation_behaviors.append("User is motivated by meaningful impact and creating change over personal gain.")
                    
                    if motivation_behaviors:
                        psyche_section += "\nWhat Drives the User:\n"
                        for behavior in motivation_behaviors:
                            psyche_section += f"- {behavior}\n"
        
        prompt = f"""Create a comprehensive startup playbook for this specific idea in the {industry} industry.

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
Viability Red Flags: {red_flags}{psyche_section}

You MUST output EXACTLY these sections in this EXACT order with these EXACT markdown headings:

### Intro
Provide a brief introduction to this idea and why it's worth exploring.

### Why this Idea Fits You
In this section, you MUST:
1. Clearly state ONE strong reason this idea fits the user (grounded in their constraints, preferences, or operating style)
2. Clearly state ONE meaningful tension or stretch this idea creates for the user (a practical challenge they'll face)

Both must be grounded in the user's constraints, preferences, or operating style. Frame everything in practical work style, execution preferences, risk comfort, and constraints - NOT personality traits or psychological terms.

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

CRITICAL: Use EXACTLY these headings with ### markdown format. Every section MUST appear, even if some content is brief."""
        
        return prompt
    
    def _parse_enrichment_response(self, content: str) -> Dict[str, Any]:
        """
        Parse LLM enrichment response into structured output.
        Expects markdown format with ### headings matching the prompt.
        """
        import re
        
        # Map markdown headings to field names (matching frontend expectations)
        HEADING_TO_FIELD = {
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
        }
        
        # Initialize result with all expected fields (matching frontend DEFAULT_SECTIONS)
        result = {
            "intro": "",
            "why_fits": "",
            "financial_snapshot": "",
            "execution_path": "",
            "customer_persona": "",
            "market_opportunity": "",
            "key_risks": "",
            "validation_questions": "",
            "immediate_experiments": "",
            "immediate_next_steps": "",
            "timeline_effort": "",
            "decision_checklist": "",
            "additional_insights": "",
        }
        
        if not content or not content.strip():
            self._log("ToolService: _parse_enrichment_response called with empty content", "WARNING")
            return result
        
        # Log raw content for debugging
        self._log(f"ToolService: Parsing enrichment response (length: {len(content)})", "INFO")
        self._log(f"ToolService: First 500 chars: {content[:500]}", "DEBUG")
        
        # Parse markdown sections
        lines = content.split("\n")
        current_field = None
        current_content = []
        
        for line in lines:
            trimmed = line.strip()
            
            # Check if this is a markdown heading (### Heading)
            heading_match = re.match(r'^###\s+(.+)$', trimmed, re.IGNORECASE)
            if heading_match:
                # Save previous section
                if current_field and current_content:
                    result[current_field] = "\n".join(current_content).strip()
                    current_content = []
                
                # Find matching field for this heading
                heading_text = trimmed.lower()
                current_field = None
                
                # Try exact match first
                if heading_text in HEADING_TO_FIELD:
                    current_field = HEADING_TO_FIELD[heading_text]
                else:
                    # Try fuzzy matching (handle variations)
                    for heading_pattern, field_name in HEADING_TO_FIELD.items():
                        # Normalize both for comparison (remove ###, lowercase, strip)
                        normalized_pattern = heading_pattern.replace("###", "").strip().lower()
                        normalized_heading = heading_text.replace("###", "").strip().lower()
                        
                        # Check if they match (allowing for minor variations)
                        if normalized_heading == normalized_pattern:
                            current_field = field_name
                            break
                        # Also check if heading contains key words
                        elif any(word in normalized_heading for word in normalized_pattern.split() if len(word) > 3):
                            # More lenient matching for headings like "Key Risks & Mitigations"
                            if "risk" in normalized_heading and "risk" in normalized_pattern:
                                current_field = field_name
                                break
                            elif "timeline" in normalized_heading and "timeline" in normalized_pattern:
                                current_field = field_name
                                break
                
                if current_field:
                    self._log(f"ToolService: Found section '{current_field}' for heading '{trimmed}'", "DEBUG")
                else:
                    self._log(f"ToolService: No match for heading '{trimmed}'", "WARNING")
                    # Don't set current_field, so content goes nowhere until next valid heading
                continue
            
            # If we have a current field, add this line to its content
            if current_field:
                current_content.append(line)
        
        # Save last section
        if current_field and current_content:
            result[current_field] = "\n".join(current_content).strip()
        
        # Log parsing results
        sections_found = [k for k, v in result.items() if v]
        self._log(f"ToolService: Parsed {len(sections_found)} sections with content: {sections_found}", "INFO")
        
        return result
    
    def _get_empty_enrichment_output(self) -> Dict[str, Any]:
        """Return empty enrichment output structure (matching frontend expectations)."""
        return {
            "intro": "",
            "why_fits": "",
            "financial_snapshot": "",
            "execution_path": "",
            "customer_persona": "",
            "market_opportunity": "",
            "key_risks": "",
            "validation_questions": "",
            "immediate_experiments": "",
            "immediate_next_steps": "",
            "timeline_effort": "",
            "decision_checklist": "",
            "additional_insights": "",
        }
    
