"""
Stage 2 Service - Generates recommendations (seed ideas) for discovery.
"""
import json
import copy
import traceback
from typing import Dict, Any, Optional
from app.services.base_service import BaseService
from app.services.prompt_builder import PromptBuilder
from app.services.llm_service import LLMService
from app.services.idea_ranking_service import IdeaRankingService
from app.services.idea_enrichment_service import IdeaEnrichmentService
from app.services.discovery_utils import normalize_industry_name, determine_realism_level
from app.core.config import settings


class Stage2Service(BaseService):
    """Service for Stage 2 execution: generating recommendations."""
    
    def __init__(self, db, redis_client=None):
        super().__init__(db, redis_client)
        self.prompt_builder = PromptBuilder()
        self.llm_service = LLMService(db, redis_client)
        self.idea_ranking_service = IdeaRankingService(db, redis_client)
        self.idea_enrichment_service = IdeaEnrichmentService(db, redis_client)
    
    def run_stage2(
        self,
        profile_analysis: str,
        inputs: Dict[str, Any],
        run_id: Optional[str] = None
    ) -> str:
        """
        Run Stage 2: Generate recommendations (seed ideas only).
        
        Tries static engine first, falls back to LLM if static data not available.
        No tool calls or enrichment - only generates seed ideas.
        """
        # Determine realism level based on user intent
        realism_level = determine_realism_level(inputs)
        
        # Try static engine path first
        industry_interest = normalize_industry_name(inputs.get("industry_interest", ""))
        if industry_interest:
            try:
                from app.static_engine.loader import load_industry_data
                from app.static_engine.synthesizer import synthesize_ideas
                from app.static_engine.report_builder import build_markdown_report
                
                self._log(f"Attempting to load static engine data for industry: '{industry_interest}'", "INFO")
                
                # Load industry data
                industry_data = load_industry_data(industry_interest)
                
                if industry_data:
                    self._log(f"Successfully loaded industry data for '{industry_interest}'", "INFO")
                    # Parse profile analysis JSON using shared parser library
                    profile_data = {}
                    if profile_analysis:
                        try:
                            from app.services.parsers.profile_parser import ProfileParser
                            parsed = ProfileParser.extract_json(profile_analysis)
                            profile_data = parsed if parsed else {"raw": profile_analysis}
                        except Exception:
                            # If parsing fails, use as string
                            profile_data = {"raw": profile_analysis}
                    
                    # Synthesize ideas (returns structured ideas)
                    idea_seeds = synthesize_ideas(
                        user_params=inputs,
                        industry_data=industry_data,
                        num_ideas=15,
                        realism_level=realism_level
                    )
                    
                    # Check if static engine generated ideas
                    if not idea_seeds or len(idea_seeds) == 0:
                        self._log(f"Static engine returned 0 ideas for '{industry_interest}', falling back to LLM", "WARNING")
                        raise ValueError("Static engine returned no ideas")
                    
                    # Rank ideas based on profile match
                    ranked_ideas = self.idea_ranking_service.rank_ideas(idea_seeds, profile_data, inputs)
                    
                    # Add lightweight next_steps to each idea (Discovery-level, not Validation-level)
                    ideas_with_next_steps = self.idea_enrichment_service.add_discovery_next_steps(
                        ranked_ideas, profile_data, inputs
                    )
                    
                    # Log next_steps addition for static engine
                    for idx, idea in enumerate(ideas_with_next_steps, 1):
                        has_next_steps = bool(idea.get("enrichment", {}).get("next_steps"))
                        next_steps_preview = (idea.get("enrichment", {}).get("next_steps", "") or "")[:100]
                        self._log(f"[Static Engine] After add_discovery_next_steps - Idea {idx}: has_next_steps={has_next_steps}, preview={next_steps_preview}", "INFO")
                    
                    # Build report (uses details_markdown from structured ideas)
                    report = build_markdown_report(
                        profile=profile_data,
                        idea_list=ideas_with_next_steps,
                        industry_data=industry_data,
                        realism_level=realism_level
                    )
                    
                    # Store structured ideas for inclusion in reports
                    self._log(f"Static engine: Generated {len(idea_seeds)} structured ideas for '{industry_interest}'", "INFO")
                    
                    # Clean structured ideas to ensure only seed-level fields (but keep enrichment.next_steps)
                    cleaned_ideas = self.clean_seed_ideas(ideas_with_next_steps)
                    
                    # Log cleaned ideas with next_steps check for static engine
                    for idx, idea in enumerate(cleaned_ideas, 1):
                        has_next_steps = bool(idea.get("enrichment", {}).get("next_steps"))
                        self._log(f"[Static Engine] Cleaned Idea {idx}: has_next_steps={has_next_steps}", "INFO")
                    
                    # Attach structured ideas to report for result_assembler to extract
                    structured_json = json.dumps(cleaned_ideas)
                    # Embed in report with a special marker that result_assembler can extract
                    report_with_structured = f"{report}\n\n---STRUCTURED_IDEAS_START---\n{structured_json}\n---STRUCTURED_IDEAS_END---"
                    
                    return report_with_structured
                    
            except Exception as e:
                # Fall back to LLM if static engine fails
                error_details = traceback.format_exc()
                self._log(f"Static engine failed for '{industry_interest}': {e}, falling back to LLM", "WARNING")
                self._log(f"Error details: {error_details}", "DEBUG")
        
        # LLM fallback (original logic)
        # Build prompt for Stage 2 with all user inputs
        prompt = self.prompt_builder.build_idea_research_prompt(
            profile_analysis=profile_analysis,
            realism_level=realism_level,
            user_inputs=inputs
        )

        system_prompt = self.prompt_builder.build_idea_research_system_prompt()

        llm_response = self.llm_service.generate(
            prompt=prompt,
            system_prompt=system_prompt,
            temperature=0.3,
            max_tokens=settings.MAX_TOKENS_STAGE2,
            run_id=run_id,
        )

        # Parse ideas from LLM response with uniqueness filtering
        # Use shared parser library (single source of truth)
        from app.services.parsers.recommendation_parser import RecommendationParser
        parsed_ideas = RecommendationParser.parse_recommendations(llm_response["content"])
        
        # Regenerate if we have fewer than 3 unique ideas
        max_regeneration_attempts = 3
        regeneration_attempt = 0
        while len(parsed_ideas) < 3 and regeneration_attempt < max_regeneration_attempts:
            regeneration_attempt += 1
            self._log(f"Only {len(parsed_ideas)} unique ideas found. Regenerating (attempt {regeneration_attempt}/{max_regeneration_attempts})...", "WARNING")
            
            # Regenerate with slightly higher temperature to encourage diversity
            llm_response = self.llm_service.generate(
                prompt=prompt,
                system_prompt=system_prompt,
                temperature=0.4,  # Slightly higher for diversity
                max_tokens=settings.MAX_TOKENS_STAGE2,
                run_id=run_id,
            )
            
            new_ideas = RecommendationParser.parse_recommendations(llm_response["content"])
            
            # Merge with existing ideas (uniqueness filter will handle duplicates)
            all_ideas = parsed_ideas + new_ideas
            parsed_ideas = RecommendationParser._filter_unique_ideas(all_ideas)
            
            self._log(f"After regeneration attempt {regeneration_attempt}: {len(parsed_ideas)} unique ideas", "INFO")
        
        if len(parsed_ideas) < 3:
            self._log(f"Only {len(parsed_ideas)} unique ideas after {max_regeneration_attempts} attempts. Proceeding with available ideas.", "WARNING")
        
        # Parse profile analysis for ranking using shared parser library
        profile_data = {}
        if profile_analysis:
            try:
                from app.services.parsers.profile_parser import ProfileParser
                parsed = ProfileParser.extract_json(profile_analysis)
                profile_data = parsed if parsed else {"raw": profile_analysis}
            except Exception:
                profile_data = {"raw": profile_analysis}
        
        # Log parsed ideas before processing
        self._log(f"[run_stage2] Parsed {len(parsed_ideas)} ideas before ranking", "INFO")
        for idx, idea in enumerate(parsed_ideas, 1):
            self._log(f"[run_stage2] Idea {idx}: id={idea.get('id')}, index={idea.get('index')}, title={(idea.get('title') or '')[:50]}", "INFO")
        
        # Ensure deep cloning before ranking to prevent reference reuse
        ranked_ideas = self.idea_ranking_service.rank_ideas(
            [copy.deepcopy(idea) for idea in parsed_ideas], profile_data, inputs
        )
        
        # Log ranked ideas
        self._log(f"[run_stage2] Ranked {len(ranked_ideas)} ideas", "INFO")
        for idx, idea in enumerate(ranked_ideas, 1):
            self._log(f"[run_stage2] Ranked Idea {idx}: id={idea.get('id')}, index={idea.get('index')}, title={(idea.get('title') or '')[:50]}", "INFO")
        
        # Add lightweight next_steps to each idea (Discovery-level, not Validation-level)
        # Deep clone again to prevent reference reuse
        ideas_with_next_steps = self.idea_enrichment_service.add_discovery_next_steps(
            [copy.deepcopy(idea) for idea in ranked_ideas], profile_data, inputs
        )
        
        # Log next_steps addition
        for idx, idea in enumerate(ideas_with_next_steps, 1):
            has_next_steps = bool(idea.get("enrichment", {}).get("next_steps"))
            next_steps_preview = (idea.get("enrichment", {}).get("next_steps", "") or "")[:100]
            self._log(f"[run_stage2] After add_discovery_next_steps - Idea {idx}: has_next_steps={has_next_steps}, preview={next_steps_preview}", "INFO")
        
        # Clean ideas to ensure only seed-level fields (but keep enrichment.next_steps)
        # Deep clone again to prevent reference reuse
        cleaned_ideas = self.clean_seed_ideas([copy.deepcopy(idea) for idea in ideas_with_next_steps])
        
        # Log final cleaned ideas with next_steps check
        self._log(f"[run_stage2] Final {len(cleaned_ideas)} cleaned ideas", "INFO")
        for idx, idea in enumerate(cleaned_ideas, 1):
            has_next_steps = bool(idea.get("enrichment", {}).get("next_steps"))
            next_steps_preview = (idea.get("enrichment", {}).get("next_steps", "") or "")[:100]
            self._log(f"[run_stage2] Final Idea {idx}: id={idea.get('id')}, index={idea.get('index')}, title={(idea.get('title') or '')[:50]}, has_next_steps={has_next_steps}, next_steps_preview={next_steps_preview}", "INFO")
        
        # Filter ideas by startup_category (tech vs non-tech)
        startup_category = inputs.get('startup_category', 'both')
        if startup_category and startup_category != 'both':
            from app.utils.startup_category_filter import filter_ideas_by_category
            filtered_ideas = filter_ideas_by_category(cleaned_ideas, startup_category)
            self._log(f"[run_stage2] Filtered {len(cleaned_ideas)} ideas to {len(filtered_ideas)} based on startup_category={startup_category}", "INFO")
            
            # If we have fewer than 3 ideas after filtering, log a warning but proceed
            if len(filtered_ideas) < 3:
                self._log(f"[run_stage2] Only {len(filtered_ideas)} ideas remain after filtering. Consider regenerating.", "WARNING")
            
            cleaned_ideas = filtered_ideas
        
        # Rebuild output with ranked ideas
        ranked_output = RecommendationParser.format_recommendations_for_frontend(cleaned_ideas)
        
        # Embed structured ideas in same format as static engine
        structured_json = json.dumps(cleaned_ideas)
        output_with_structured = f"{ranked_output}\n\n---STRUCTURED_IDEAS_START---\n{structured_json}\n---STRUCTURED_IDEAS_END---"
        
        return output_with_structured
    
    def clean_seed_ideas(self, ideas):
        """
        Remove any tool/enrichment fields from seed ideas.
        
        Seed ideas should ONLY contain:
        - id, index, title, summary, target_market, revenue_model, 
          validation_score, timeline, why_this_fits, details_markdown
        
        Removes any fields like:
        - competitors, opportunity_space, market_trends, risks, 
          market_size, idea_patterns, enrichment, etc.
        """
        from typing import List, Dict, Any
        
        # Allowed seed-level fields only
        ALLOWED_SEED_FIELDS = {
            "id", "index", "title", "summary", "target_market", 
            "revenue_model", "validation_score", "timeline", 
            "why_this_fits", "details_markdown", "rank_score",
            "enrichment"  # Allow enrichment object with next_steps
        }
        
        # Tool/enrichment fields to explicitly remove
        FORBIDDEN_FIELDS = {
            "competitors", "opportunity_space", "market_trends", 
            "risks", "market_size", "idea_patterns", "enrichment",
            "market_validation", "risks_and_mitigations", 
            "go_to_market_plan", "execution_roadmap", "founder_fit",
            "ninety_day_action_plan", "cost_and_tech_stack",
            "revenue_models", "opportunity_landscape"
        }
        
        # Deep clone to prevent reference reuse
        cleaned = []
        for idea in ideas:
            cleaned_idea = {}
            # Deep clone the idea first
            idea_copy = copy.deepcopy(idea)
            for key, value in idea_copy.items():
                # Only include allowed seed fields
                if key in ALLOWED_SEED_FIELDS:
                    # Special handling for enrichment - only keep next_steps
                    if key == "enrichment" and isinstance(value, dict):
                        next_steps_value = value.get("next_steps", "")
                        if next_steps_value:
                            cleaned_idea[key] = {
                                "next_steps": next_steps_value
                            }
                            self._log(f"Preserved enrichment.next_steps for idea {idea.get('index', 'unknown')}: length={len(next_steps_value)}", "DEBUG")
                        else:
                            self._log(f"WARNING: enrichment.next_steps is empty for idea {idea.get('index', 'unknown')}, skipping enrichment", "WARNING")
                    else:
                        cleaned_idea[key] = value
                elif key in FORBIDDEN_FIELDS:
                    # Explicitly skip tool/enrichment fields (but enrichment.next_steps is allowed via ALLOWED_SEED_FIELDS)
                    # Note: "enrichment" is in FORBIDDEN_FIELDS but handled above via ALLOWED_SEED_FIELDS
                    if key != "enrichment":  # Don't log for enrichment since it's handled above
                        self._log(f"Removed tool field '{key}' from seed idea {idea.get('index', 'unknown')}", "DEBUG")
                # Ignore any other unexpected fields
        
            cleaned.append(cleaned_idea)
        
        return cleaned

