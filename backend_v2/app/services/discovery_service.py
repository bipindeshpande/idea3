"""
Discovery Service - Main orchestration service
"""

from typing import Dict, Any, Optional, AsyncIterator, List
from datetime import datetime, timezone
import time
import re
from concurrent.futures import ThreadPoolExecutor, as_completed, TimeoutError as FutureTimeoutError
from sqlalchemy.orm import Session

from app.services.base_service import BaseService
from app.services.profile_analysis_service import ProfileAnalysisService
from app.services.psyche_scoring_service import PsycheScoringService
from app.services.prompt_builder import PromptBuilder
from app.services.llm_service import LLMService
from app.services.result_assembler import ResultAssembler
from app.services.cache_service import CacheService
from app.services.error_log_service import ErrorLogService
from app.models.run import Run
from app.models.discovery_result import DiscoveryResult
from app.core.config import settings
from app.core.database import SessionLocal
from app.core.logger import log_discovery_run, run_id_var
from app.services.conflict_detector import ConflictDetector


class DiscoveryService(BaseService):
    """Main orchestration service for the discovery pipeline."""

    def __init__(self, db: Session, redis_client=None):
        super().__init__(db, redis_client)
        self.profile_service = ProfileAnalysisService(db, redis_client)
        self.psyche_scoring_service = PsycheScoringService(db, redis_client)
        self.prompt_builder = PromptBuilder()
        self.llm_service = LLMService(db, redis_client)
        self.result_assembler = ResultAssembler()
        self.cache_service = CacheService(db, redis_client)
        self.error_log_service = ErrorLogService(db, redis_client)

    # ----------------------------------------------------------------------
    # PUBLIC API
    # ----------------------------------------------------------------------
    def run_discovery(
        self,
        inputs: Dict[str, Any],
        user_id: Optional[str] = None,
        run_id: Optional[str] = None
    ) -> Dict[str, Any]:
        
        # Track timing for structured logging
        timestamp_start = datetime.now(timezone.utc)
        start_time = time.perf_counter()
        cache_hit = False
        error_message = None
        
        # Set run_id in context for logging
        if run_id:
            run_id_var.set(run_id)

        # Check cache before running any LLM steps
        cache_key = self.cache_service.build_discovery_cache_key(inputs, user_id)
        cached_result = self.cache_service.get_json(cache_key, cache_type="discovery")
        
        if cached_result:
            cache_hit = True
            # Return cached result immediately
            # Create or fetch run record for tracking
            if run_id:
                run = self.db.query(Run).filter(Run.run_id == run_id).first()
                if not run:
                    run = Run(
                        run_id=run_id,
                        user_id=user_id,
                        inputs=inputs,
                        status="completed",
                        created_at=datetime.now(timezone.utc),
                        completed_at=datetime.now(timezone.utc)
                    )
                    self.db.add(run)
                else:
                    # Update user_id if it's missing and we have a user_id to set
                    if user_id and not run.user_id:
                        run.user_id = user_id
                        self._log(f"Updated cached run {run_id} with user_id={user_id}", "INFO")
            else:
                run = Run(
                    user_id=user_id,
                    inputs=inputs,
                    status="completed",
                    created_at=datetime.now(timezone.utc),
                    completed_at=datetime.now(timezone.utc)
                )
                self.db.add(run)
                self.db.commit()
                self.db.refresh(run)
            
            # Update discovery result if it exists
            discovery_result = self.db.query(DiscoveryResult).filter(
                DiscoveryResult.run_id == run.run_id
            ).first()
            
            if discovery_result:
                discovery_result.result = cached_result
                discovery_result.status = "completed"
                discovery_result.error_message = None
            else:
                discovery_result = DiscoveryResult(
                    run_id=run.run_id,
                    input_payload=inputs,
                    result=cached_result,
                    status="completed"
                )
                self.db.add(discovery_result)
            
            self.db.commit()
            
            # Log structured discovery run (cached)
            timestamp_end = datetime.now(timezone.utc)
            duration_ms = (time.perf_counter() - start_time) * 1000
            log_discovery_run(
                run_id=run.run_id,
                user_id=user_id,
                timestamp_start=timestamp_start,
                timestamp_end=timestamp_end,
                total_duration_ms=duration_ms,
                cache_hit=True
            )
            run_id_var.set(None)  # Clear context
            
            return {
                "success": True,
                "run_id": run.run_id,
                "outputs": cached_result,
                "cached": True,
                "cache_hit": True
            }

        # Create or fetch run record
        if run_id:
            run = self.db.query(Run).filter(Run.run_id == run_id).first()
            if not run:
                raise ValueError(f"Run {run_id} not found")
            # Update user_id if it's missing and we have a user_id to set
            if user_id and not run.user_id:
                run.user_id = user_id
                self.db.commit()
                self._log(f"Updated run {run_id} with user_id={user_id}", "INFO")
            # Update run_id in context
            run_id_var.set(run_id)
        else:
            run = Run(
                user_id=user_id,
                inputs=inputs,
                status="processing",
                created_at=datetime.now(timezone.utc)
            )
            self.db.add(run)
            self.db.commit()
            self.db.refresh(run)
            # Set run_id in context after creation
            run_id_var.set(run.run_id)

        try:
            # Run pipeline
            if settings.PARALLEL_EXECUTION:
                results = self._run_parallel(inputs, user_id=user_id, run_id=run.run_id)
            else:
                results = self._run_sequential(inputs, user_id=user_id, run_id=run.run_id)

            # Determine realism level for output
            realism_level = self.determine_realism_level(inputs)
            
            # Detect conflicts and get user message
            conflicts = ConflictDetector.detect_conflicts(inputs)
            conflict_message = ConflictDetector.build_user_message(conflicts, inputs)
            
            # Assemble structured outputs
            final_outputs = self.result_assembler.assemble(
                profile_analysis=results["profile_analysis"],
                stage2_output=results["recommendations"],
                realism_level=realism_level
            )
            
            # Add conflict adjustment message if conflicts detected
            if conflict_message:
                final_outputs["conflict_adjustment"] = conflict_message

            # Generate Final Recommendation (premium decision summary)
            if "structured_recommendations" in final_outputs and final_outputs["structured_recommendations"]:
                final_recommendation = self._generate_final_recommendation(
                    ideas=final_outputs["structured_recommendations"],
                    profile_analysis=results["profile_analysis"],
                    inputs=inputs,
                    run_id=run.run_id
                )
                if final_recommendation:
                    final_outputs["final_recommendation"] = final_recommendation

            # Save completed run
            run.status = "completed"
            run.profile_analysis = final_outputs["profile_analysis"]
            run.personalized_recommendations = final_outputs["personalized_recommendations"]
            run.reports = final_outputs
            run.completed_at = datetime.now(timezone.utc)
            self.db.commit()

            # Update discovery result if it exists (created by background task)
            # Otherwise create it (for synchronous execution)
            discovery_result = self.db.query(DiscoveryResult).filter(
                DiscoveryResult.run_id == run.run_id
            ).first()
            
            if discovery_result:
                # Update existing record
                discovery_result.result = final_outputs
                discovery_result.status = "completed"
                discovery_result.error_message = None
            else:
                # Create new record (for synchronous execution)
                discovery_result = DiscoveryResult(
                    run_id=run.run_id,
                    input_payload=inputs,
                    result=final_outputs,
                    status="completed"
                )
                self.db.add(discovery_result)
            
            self.db.commit()

            # Store in cache (7 days TTL)
            # Only cache successful completions, not failures
            # This also stores a backup copy in Postgres via CacheService.set()
            self.cache_service.set_json(
                cache_key,
                final_outputs,
                cache_type="discovery",
                ttl_seconds=60 * 60 * 24 * 7  # 7 days
            )

            # Log structured discovery run (success)
            timestamp_end = datetime.now(timezone.utc)
            duration_ms = (time.perf_counter() - start_time) * 1000
            log_discovery_run(
                run_id=run.run_id,
                user_id=user_id,
                timestamp_start=timestamp_start,
                timestamp_end=timestamp_end,
                total_duration_ms=duration_ms,
                cache_hit=False
            )
            run_id_var.set(None)  # Clear context

            return {
                "success": True,
                "run_id": run.run_id,
                "outputs": final_outputs,
                "cached": False,
                "cache_hit": False
            }

        except Exception as e:
            # Do NOT cache partial failures
            error_message = str(e)
            run.status = "failed"
            run.error_message = error_message
            self.db.commit()
            
            # Log error to database
            try:
                self.error_log_service.log_error(
                    error=e,
                    context={"inputs": inputs, "run_id": run.run_id},
                    user_id=user_id,
                    run_id=run.run_id,
                    severity="error"
                )
            except Exception as log_error:
                # Don't fail if error logging fails
                self._log(f"Failed to log error to database: {log_error}", "ERROR")
            
            # Log structured discovery run (failed)
            timestamp_end = datetime.now(timezone.utc)
            duration_ms = (time.perf_counter() - start_time) * 1000
            log_discovery_run(
                run_id=run.run_id if run else run_id,
                user_id=user_id,
                timestamp_start=timestamp_start,
                timestamp_end=timestamp_end,
                total_duration_ms=duration_ms,
                cache_hit=False,
                error=error_message
            )
            run_id_var.set(None)  # Clear context
            
            raise

    # ----------------------------------------------------------------------
    # PARALLEL PIPELINE
    # ----------------------------------------------------------------------
    def _run_parallel(self, inputs: Dict[str, Any], user_id: Optional[str] = None, run_id: Optional[str] = None) -> Dict[str, Any]:
        """
        Run profile analysis and idea generation in parallel.
        Note: Tool calls are no longer used in idea generation phase.
        """
        profile_result = None

        with ThreadPoolExecutor(max_workers=1) as executor:
            future_profile = executor.submit(self.profile_service.run, inputs, run_id)
            
            try:
                profile_result = future_profile.result(timeout=settings.STAGE1_TIMEOUT)
            except Exception as e:
                raise ValueError(f"Profile analysis failed: {e}")

        if not profile_result or "profile_analysis" not in profile_result:
            raise ValueError("Profile analysis returned invalid output.")

        profile_text = profile_result["profile_analysis"]
        
        # Extract and format profile analysis for recommendations prompt
        formatted_profile = self._format_profile_for_recommendations(profile_text, user_id=user_id)

        stage2_output = self._run_stage2(
            profile_analysis=formatted_profile,
            inputs=inputs,
            run_id=run_id,
        )

        return {
            "profile_analysis": profile_text,
            "recommendations": stage2_output
        }

    # ----------------------------------------------------------------------
    # SEQUENTIAL PIPELINE
    # ----------------------------------------------------------------------
    def _run_sequential(self, inputs: Dict[str, Any], user_id: Optional[str] = None, run_id: Optional[str] = None) -> Dict[str, Any]:
        """
        Run profile analysis and idea generation sequentially.
        Note: Tool calls are no longer used in idea generation phase.
        """
        profile_result = self.profile_service.run(inputs, run_id=run_id)
        profile_text = profile_result["profile_analysis"]
        
        # Extract and format profile analysis for recommendations prompt
        formatted_profile = self._format_profile_for_recommendations(profile_text, user_id=user_id)

        stage2_output = self._run_stage2(
            profile_analysis=formatted_profile,
            inputs=inputs,
            run_id=run_id,
        )

        return {
            "profile_analysis": profile_text,
            "recommendations": stage2_output
        }

    # ----------------------------------------------------------------------
    # HELPER METHODS
    # ----------------------------------------------------------------------
    @staticmethod
    def normalize_industry_name(name: str) -> str:
        """
        Normalize industry name to match static engine JSON file names.
        
        Maps common variations to the correct file names.
        """
        if not name:
            return ""
        
        mapping = {
            # Food & Beverage (has JSON: food_and_beverage.json, restaurant.json, food_delivery.json)
            "food & beverage": "food_and_beverage",
            "food and beverage": "food_and_beverage",
            "food and beverages": "food_and_beverage",
            "food_and_beverage": "food_and_beverage",
            "meal prep": "food_and_beverage",
            "meal preparation": "food_and_beverage",
            "restaurant": "restaurant",
            "restaurants": "restaurant",
            "food delivery": "food_delivery",
            "fooddelivery": "food_delivery",
            "food_delivery": "food_delivery",
            
            # AI & Automation (has JSON: ai.json)
            "ai": "ai",
            "artificial intelligence": "ai",
            "ai & automation": "ai",
            "ai and automation": "ai",
            "automation": "ai",
            
            # Finance / Accounting (has JSON: fintech.json)
            "finance": "fintech",
            "fintech": "fintech",
            "financial technology": "fintech",
            "finance / accounting": "fintech",
            "finance/accounting": "fintech",
            "accounting": "fintech",
            
            # Healthcare / Wellness / Beauty (has JSON: healthcare.json, healthtech.json)
            "healthcare": "healthcare",
            "health care": "healthcare",
            "health & wellness": "healthcare",
            "health and wellness": "healthcare",
            "healthcare / wellness": "healthcare",
            "beauty & wellness": "healthcare",
            "beauty and wellness": "healthcare",
            "beauty / wellness": "healthcare",
            "health tech": "healthtech",
            "healthtech": "healthtech",
            "health technology": "healthtech",
            
            # Retail & E-commerce (no JSON - will use LLM fallback)
            "retail & e-commerce": "retail_ecommerce",
            "retail and e-commerce": "retail_ecommerce",
            "retail / e-commerce": "retail_ecommerce",
            "retail/ecommerce": "retail_ecommerce",
            "e-commerce": "retail_ecommerce",
            "ecommerce": "retail_ecommerce",
            "retail": "retail_ecommerce",
            
            # Education (no JSON - will use LLM fallback)
            "education": "education",
            "edtech": "education",
            "education / edtech": "education",
            
            # Fitness & Sports (no JSON - will use LLM fallback)
            "fitness & sports": "fitness_sports",
            "fitness and sports": "fitness_sports",
            "fitness / sports": "fitness_sports",
            "fitness": "fitness_sports",
            "sports": "fitness_sports",
            
            # Kids & Parenting (no JSON - will use LLM fallback)
            "kids & parenting": "kids_parenting",
            "kids and parenting": "kids_parenting",
            "kids / parenting": "kids_parenting",
            "parenting": "kids_parenting",
            
            # Home Services (no JSON - will use LLM fallback)
            "home services": "home_services",
            "home service": "home_services",
            
            # Travel & Tourism (no JSON - will use LLM fallback)
            "travel & tourism": "travel_tourism",
            "travel and tourism": "travel_tourism",
            "travel / tourism": "travel_tourism",
            "travel": "travel_tourism",
            "tourism": "travel_tourism",
            
            # Manufacturing / Crafts (no JSON - will use LLM fallback)
            "manufacturing / crafts": "manufacturing_crafts",
            "manufacturing/crafts": "manufacturing_crafts",
            "manufacturing": "manufacturing_crafts",
            "crafts": "manufacturing_crafts",
            
            # Software / SaaS (no JSON - will use LLM fallback)
            "software / saas": "software_saas",
            "software/saas": "software_saas",
            "software": "software_saas",
            "saas": "software_saas",
            
            # Freelancing / Consulting (no JSON - will use LLM fallback)
            "freelancing / consulting": "freelancing_consulting",
            "freelancing/consulting": "freelancing_consulting",
            "freelancing": "freelancing_consulting",
            "consulting": "freelancing_consulting",
            
            # Agriculture / Gardening (no JSON - will use LLM fallback)
            "agriculture / gardening": "agriculture_gardening",
            "agriculture/gardening": "agriculture_gardening",
            "agriculture": "agriculture_gardening",
            "gardening": "agriculture_gardening",
            
            # Social Impact (no JSON - will use LLM fallback)
            "social impact": "social_impact",
            "social impact / non-profit": "social_impact",
            "non-profit": "social_impact",
            "nonprofit": "social_impact",
            
            # Local Services (no JSON - will use LLM fallback)
            "local services": "local_services",
            "local service": "local_services",
            
            # Other (no JSON - will use LLM fallback)
            "other": "other",
        }
        
        normalized = name.lower().strip()
        return mapping.get(normalized, normalized.replace(" ", "_"))
    
    @staticmethod
    def determine_realism_level(inputs: Dict[str, Any]) -> int:
        """
        Determine realism level (1-5) based on user intent inputs.
        
        Realism is calculated from:
        - founder_ambition (goal_type equivalent): 40% weight
        - time_commitment: 25% weight
        - budget_range: 20% weight
        - risk_tolerance: 15% weight
        
        Does NOT use skill_strength for realism calculation.
        
        Returns:
            Integer between 1 and 5:
            - 1: Teen-friendly, simple, encouraging, no regulations, minimal risks
            - 3: Practical, balanced, approachable details, light risks
            - 5: Founder-grade realism, include risks, economics, market realities
        """
        # Map founder_ambition (goal_type) to score (40% weight)
        founder_ambition = inputs.get("founder_ambition", "").lower()
        goal_scores = {
            "side income": 1,
            "turn hobby into business": 1,
            "part-time business": 2,
            "full-time business": 4,
            "scalable venture": 5,
        }
        goal_score = goal_scores.get(founder_ambition, 3)  # Default to 3 if not found
        
        # Map time_commitment to score (25% weight)
        time_commitment = inputs.get("time_commitment", "").lower()
        time_scores = {
            "<5 hrs/week": 1,
            "< 5 hrs/week": 1,
            "5–10 hrs/week": 2,
            "5-10 hrs/week": 2,
            "10–20 hrs/week": 3,
            "10-20 hrs/week": 3,
            "full-time": 5,
            "full time": 5,
        }
        time_score = time_scores.get(time_commitment, 3)  # Default to 3
        
        # Map budget_range to score (20% weight)
        budget_range = inputs.get("budget_range", "").lower()
        budget_scores = {
            "free / sweat-equity only": 1,
            "$0–100": 1,
            "$0-100": 1,
            "$100–1,000": 2,
            "$100-1,000": 2,
            "$1,000–5,000": 3,
            "$1,000-5,000": 3,
            "$1k-5k": 3,
            "$5,000–20,000": 4,
            "$5,000-20,000": 4,
            "$5k-20k": 4,
            "$20,000+": 5,
            "$20k+": 5,
            "$20 k and above": 5,
        }
        budget_score = budget_scores.get(budget_range, 3)  # Default to 3
        
        # Map risk_tolerance to score (15% weight)
        risk_tolerance = inputs.get("risk_tolerance", "").lower()
        risk_scores = {
            "low": 1,
            "very low": 1,
            "moderate": 3,
            "medium": 3,
            "high": 5,
        }
        risk_score = risk_scores.get(risk_tolerance, 3)  # Default to 3
        
        # Calculate weighted score
        weighted_score = (
            goal_score * 0.40 +
            time_score * 0.25 +
            budget_score * 0.20 +
            risk_score * 0.15
        )
        
        # Round to integer and clamp between 1 and 5
        realism_level = max(1, min(5, round(weighted_score)))
        
        return realism_level

    # ----------------------------------------------------------------------
    # STAGE 2 EXECUTION
    # ----------------------------------------------------------------------
    def _run_stage2(
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
        realism_level = self.determine_realism_level(inputs)
        
        # Try static engine path first
        industry_interest = self.normalize_industry_name(inputs.get("industry_interest", ""))
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
                    # Parse profile analysis JSON
                    import json
                    profile_data = {}
                    if profile_analysis:
                        try:
                            # Try to extract JSON from delimiters
                            start_marker = "---PROFILE_ANALYSIS_START---"
                            end_marker = "---PROFILE_ANALYSIS_END---"
                            start_idx = profile_analysis.find(start_marker)
                            end_idx = profile_analysis.find(end_marker)
                            
                            if start_idx != -1 and end_idx != -1:
                                json_text = profile_analysis[start_idx + len(start_marker):end_idx].strip()
                                profile_data = json.loads(json_text)
                            else:
                                # Try parsing entire profile_analysis as JSON
                                profile_data = json.loads(profile_analysis)
                        except (json.JSONDecodeError, ValueError):
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
                    ranked_ideas = self._rank_ideas(idea_seeds, profile_data, inputs)
                    
                    # Add lightweight next_steps to each idea (Discovery-level, not Validation-level)
                    ideas_with_next_steps = self._add_discovery_next_steps(ranked_ideas, profile_data, inputs)
                    
                    # Build report (uses details_markdown from structured ideas)
                    report = build_markdown_report(
                        profile=profile_data,
                        idea_list=ideas_with_next_steps,
                        industry_data=industry_data,
                        realism_level=realism_level
                    )
                    
                    # Store structured ideas for inclusion in reports
                    # The report string will be returned, but structured ideas are stored
                    # separately in the reports dict via result_assembler
                    self._log(f"Static engine: Generated {len(idea_seeds)} structured ideas for '{industry_interest}'", "INFO")
                    
                    # Clean structured ideas to ensure only seed-level fields (but keep enrichment.next_steps)
                    cleaned_ideas = self._clean_seed_ideas(ideas_with_next_steps)
                    
                    # Attach structured ideas to report for result_assembler to extract
                    # We'll encode the structured ideas as JSON in a special marker
                    import json
                    structured_json = json.dumps(cleaned_ideas)
                    # Embed in report with a special marker that result_assembler can extract
                    report_with_structured = f"{report}\n\n---STRUCTURED_IDEAS_START---\n{structured_json}\n---STRUCTURED_IDEAS_END---"
                    
                    return report_with_structured
                    
            except Exception as e:
                # Fall back to LLM if static engine fails
                import traceback
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

        system_prompt = """You are a startup advisor. You MUST output recommendations using the EXACT format specified in the prompt.

CRITICAL RULES:
- Output ONLY the IDEA blocks (### IDEA_1, ### IDEA_2, etc.)
- Do NOT include any intro text, explanations, or disclaimers
- Do NOT output markdown sections like ## SECTION or ### RECOMMENDATION
- Each IDEA block must have exactly these fields: title, summary, target_market, revenue_model, validation_score, timeline, why_this_fits
- Follow the format EXACTLY as specified.

IDEA TITLE REQUIREMENTS (CRITICAL):
- Each idea title MUST be a CONCRETE STARTUP IDEA, NOT a framework component or abstract concept
- DO NOT return: "Business Models", "Target Segments", "Value Propositions", "Revenue Models", "Market Opportunities", "Customer Personas", "Go-to-Market Strategy", "Pricing Strategies", "Validation Frameworks", "Execution Plans", or any other framework terms
- Each title MUST follow pattern: [Who] + [Problem] + [Solution]
- Examples of VALID titles: "Non-technical food founders launch cloud kitchens using shared commercial kitchens", "Local fitness coaches create personalized meal prep services for busy professionals"
- Examples of INVALID titles: "Business Models", "Target Segments", "Value Propositions" (these are framework terms, not ideas)
- ONLY return fully-formed, concrete startup ideas with specific customers, problems, and solutions

REALISM ENFORCEMENT:
- Ideas MUST match user's actual skills (if user only has cooking skills, NO tech/AI/software ideas)
- Ideas MUST fit user's time commitment, budget, preferred work style, and startup style
- Preferred work style influences operational complexity and founder-fit (solo vs team, hands-on vs remote, etc.)
- Startup style influences business model, delivery method, cost structure, and scalability (home-based vs local vs online, etc.)
- Business region influences pricing assumptions, feasibility, cultural fit, delivery models, legal complexity, and startup costs
- Ideas MUST be executable within user's earnings timeline
- Ideas MUST be from user's selected industry and sub-interest ONLY
- Ideas MUST be operationally simple and feasible for the user's skill level
- NO hallucinations, NO irrelevant tech, NO ideas from different industries
- NO framework terms, NO abstract concepts, NO strategy categories - ONLY concrete startup ideas"""

        llm_response = self.llm_service.generate(
            prompt=prompt,
            system_prompt=system_prompt,
            temperature=0.3,
            max_tokens=settings.MAX_TOKENS_STAGE2,
            run_id=run_id,
        )

        # Parse ideas from LLM response with uniqueness filtering
        from app.services.recommendation_parser import RecommendationParser
        parsed_ideas = RecommendationParser.parse_recommendations(llm_response["content"])
        
        # Regenerate if we have fewer than 3 unique ideas
        max_regeneration_attempts = 3
        regeneration_attempt = 0
        while len(parsed_ideas) < 3 and regeneration_attempt < max_regeneration_attempts:
            regeneration_attempt += 1
            logger.warning(f"Only {len(parsed_ideas)} unique ideas found. Regenerating (attempt {regeneration_attempt}/{max_regeneration_attempts})...")
            
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
            
            logger.info(f"After regeneration attempt {regeneration_attempt}: {len(parsed_ideas)} unique ideas")
        
        if len(parsed_ideas) < 3:
            logger.warning(f"Only {len(parsed_ideas)} unique ideas after {max_regeneration_attempts} attempts. Proceeding with available ideas.")
        
        # Parse profile analysis for ranking
        import json
        profile_data = {}
        if profile_analysis:
            try:
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
                profile_data = {"raw": profile_analysis}
        
        # Log parsed ideas before processing
        logger.info(f"[_run_stage2] Parsed {len(parsed_ideas)} ideas before ranking")
        for idx, idea in enumerate(parsed_ideas, 1):
            logger.info(f"[_run_stage2] Idea {idx}: id={idea.get('id')}, index={idea.get('index')}, title={(idea.get('title') or '')[:50]}")
        
        # Ensure deep cloning before ranking to prevent reference reuse
        import copy
        ranked_ideas = self._rank_ideas([copy.deepcopy(idea) for idea in parsed_ideas], profile_data, inputs)
        
        # Log ranked ideas
        logger.info(f"[_run_stage2] Ranked {len(ranked_ideas)} ideas")
        for idx, idea in enumerate(ranked_ideas, 1):
            logger.info(f"[_run_stage2] Ranked Idea {idx}: id={idea.get('id')}, index={idea.get('index')}, title={(idea.get('title') or '')[:50]}")
        
        # Add lightweight next_steps to each idea (Discovery-level, not Validation-level)
        # Deep clone again to prevent reference reuse
        ideas_with_next_steps = self._add_discovery_next_steps([copy.deepcopy(idea) for idea in ranked_ideas], profile_data, inputs)
        
        # Clean ideas to ensure only seed-level fields (but keep enrichment.next_steps)
        # Deep clone again to prevent reference reuse
        cleaned_ideas = self._clean_seed_ideas([copy.deepcopy(idea) for idea in ideas_with_next_steps])
        
        # Log final cleaned ideas
        logger.info(f"[_run_stage2] Final {len(cleaned_ideas)} cleaned ideas")
        for idx, idea in enumerate(cleaned_ideas, 1):
            logger.info(f"[_run_stage2] Final Idea {idx}: id={idea.get('id')}, index={idea.get('index')}, title={(idea.get('title') or '')[:50]}, summary={(idea.get('summary') or '')[:50]}")
        
        # Filter ideas by startup_category (tech vs non-tech)
        startup_category = inputs.get('startup_category', 'both')
        if startup_category and startup_category != 'both':
            from app.utils.startup_category_filter import filter_ideas_by_category
            filtered_ideas = filter_ideas_by_category(cleaned_ideas, startup_category)
            logger.info(f"[_run_stage2] Filtered {len(cleaned_ideas)} ideas to {len(filtered_ideas)} based on startup_category={startup_category}")
            
            # If we have fewer than 3 ideas after filtering, log a warning but proceed
            if len(filtered_ideas) < 3:
                logger.warning(f"[_run_stage2] Only {len(filtered_ideas)} ideas remain after filtering. Consider regenerating.")
            
            cleaned_ideas = filtered_ideas
        
        # Rebuild output with ranked ideas
        from app.services.recommendation_parser import RecommendationParser
        ranked_output = RecommendationParser.format_recommendations_for_frontend(cleaned_ideas)
        
        # Embed structured ideas in same format as static engine
        import json
        structured_json = json.dumps(cleaned_ideas)
        output_with_structured = f"{ranked_output}\n\n---STRUCTURED_IDEAS_START---\n{structured_json}\n---STRUCTURED_IDEAS_END---"
        
        return output_with_structured
    
    # ----------------------------------------------------------------------
    # STREAMING WORKFLOW
    # ----------------------------------------------------------------------
    def merge_idea_header(self, buffer: str, next_token: str) -> Optional[str]:
        """Merge '### IDEA_' + number into '### IDEA_1'."""
        stripped = buffer.strip()
        # Handle both "### IDEA" (with space) and "###IDEA" (without space)
        if stripped.startswith("### IDEA") or stripped.startswith("###IDEA"):
            # Check if next_token is a digit, or starts with underscore followed by digit (e.g., "_1")
            token_clean = next_token.strip()
            if token_clean.isdigit():
                # Normalize to "### IDEA_X" format (with space)
                merged = f"### IDEA_{token_clean}"
                return merged
            elif token_clean.startswith("_") and token_clean[1:].isdigit():
                # Handle "_1" format - extract digit and merge
                digit = token_clean[1:]
                merged = f"### IDEA_{digit}"
                return merged
        return None
    
    async def workflow_stream(
        self,
        inputs: Dict[str, Any],
        user_id: Optional[str] = None,
        run_id: Optional[str] = None
    ) -> AsyncIterator[str]:
        """
        Stream workflow output in buffered chunks instead of token-by-token.
        """
        import asyncio
        
        # 1. Run Profile Analysis
        loop = asyncio.get_event_loop()
        profile_result = await loop.run_in_executor(
            None,
            lambda: self.profile_service.analyze_profile(inputs, run_id=run_id)
        )
        profile_text = profile_result.get("profile_analysis", "")
        
        # Profile text already includes delimiters - yield it once
        if profile_text:
            yield profile_text
        yield "\n\n---PROFILE_END---\n\n"

        # 2. Format profile for recommendations prompt
        formatted_profile = self._format_profile_for_recommendations(profile_text, user_id=user_id)
        
        # 3. Determine realism level based on user intent
        realism_level = self.determine_realism_level(inputs)
        
        # 4. Try static engine first (fast path), fallback to LLM if needed
        industry_interest = self.normalize_industry_name(inputs.get("industry_interest", ""))
        static_engine_used = False
        
        if industry_interest:
            try:
                from app.static_engine.loader import load_industry_data
                from app.static_engine.synthesizer import synthesize_ideas
                from app.static_engine.report_builder import build_markdown_report
                
                self._log(f"[Stream] Attempting to load static engine data for industry: '{industry_interest}'", "INFO")
                
                # Load industry data
                industry_data = load_industry_data(industry_interest)
                
                if industry_data:
                    self._log(f"[Stream] Successfully loaded industry data for '{industry_interest}'", "INFO")
                    # Parse profile analysis JSON
                    import json
                    profile_data = {}
                    if profile_text:
                        try:
                            start_marker = "---PROFILE_ANALYSIS_START---"
                            end_marker = "---PROFILE_ANALYSIS_END---"
                            start_idx = profile_text.find(start_marker)
                            end_idx = profile_text.find(end_marker)
                            
                            if start_idx != -1 and end_idx != -1:
                                json_text = profile_text[start_idx + len(start_marker):end_idx].strip()
                                profile_data = json.loads(json_text)
                            else:
                                profile_data = json.loads(profile_text)
                        except (json.JSONDecodeError, ValueError):
                            profile_data = {"raw": profile_text}
                    
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
                    ranked_ideas = self._rank_ideas(idea_seeds, profile_data, inputs)
                    
                    # Clean structured ideas to ensure only seed-level fields
                    cleaned_ideas = self._clean_seed_ideas(ranked_ideas)
                    
                    # Filter ideas by startup_category (tech vs non-tech)
                    startup_category = inputs.get('startup_category', 'both')
                    if startup_category and startup_category != 'both':
                        from app.utils.startup_category_filter import filter_ideas_by_category
                        filtered_ideas = filter_ideas_by_category(cleaned_ideas, startup_category)
                        self._log(f"[Stream] Filtered {len(cleaned_ideas)} ideas to {len(filtered_ideas)} based on startup_category={startup_category}", "INFO")
                        
                        # If we have fewer than 3 ideas after filtering, log a warning but proceed
                        if len(filtered_ideas) < 3:
                            self._log(f"[Stream] Only {len(filtered_ideas)} ideas remain after filtering. Consider regenerating.", "WARNING")
                        
                        # Create a set of filtered idea IDs for quick lookup
                        filtered_ids = {idea.get('id') for idea in filtered_ideas}
                        
                        # Filter both cleaned_ideas and ranked_ideas to keep them in sync
                        cleaned_ideas = filtered_ideas
                        ranked_ideas = [idea for idea in ranked_ideas if idea.get('id') in filtered_ids]
                    
                    # Build report
                    report = build_markdown_report(
                        profile=profile_data,
                        idea_list=ranked_ideas,
                        industry_data=industry_data,
                        realism_level=realism_level
                    )
                    
                    # Embed structured ideas
                    structured_json = json.dumps(cleaned_ideas)
                    report_with_structured = f"{report}\n\n---STRUCTURED_IDEAS_START---\n{structured_json}\n---STRUCTURED_IDEAS_END---"
                    
                    # Stream the report as chunks (simulate streaming for consistency)
                    self._log(f"Static engine: Generated {len(cleaned_ideas)} ideas for '{industry_interest}'", "INFO")
                    static_engine_used = True
                    
                    # Yield report in chunks to simulate streaming
                    chunk_size = 100  # Characters per chunk
                    for i in range(0, len(report_with_structured), chunk_size):
                        chunk = report_with_structured[i:i + chunk_size]
                        yield chunk
                        # Small delay to simulate streaming (optional, can remove)
                        await asyncio.sleep(0.01)
                    
                    return  # Exit early, static engine completed
                    
            except Exception as e:
                # Fall back to LLM if static engine fails
                import traceback
                error_details = traceback.format_exc()
                self._log(f"[Stream] Static engine failed for '{industry_interest}': {e}, falling back to LLM", "WARNING")
                self._log(f"[Stream] Error details: {error_details}", "DEBUG")
        
        # 4. LLM fallback (only if static engine not used)
        if not static_engine_used:
            prompt = self.prompt_builder.build_idea_research_prompt(
                profile_analysis=formatted_profile,
                realism_level=realism_level,
                user_inputs=inputs
            )
        
        system_prompt = """You are a startup advisor. You MUST output recommendations using the EXACT format specified in the prompt.

CRITICAL RULES:
- Output ONLY the IDEA blocks (### IDEA_1, ### IDEA_2, etc.)
- Do NOT include any intro text, explanations, or disclaimers
- Do NOT output markdown sections like ## SECTION or ### RECOMMENDATION
- Each IDEA block must have exactly these fields: title, summary, target_market, revenue_model, validation_score, timeline, why_this_fits
- Follow the format EXACTLY as specified.

IDEA TITLE REQUIREMENTS (CRITICAL):
- Each idea title MUST be a CONCRETE STARTUP IDEA, NOT a framework component or abstract concept
- DO NOT return: "Business Models", "Target Segments", "Value Propositions", "Revenue Models", "Market Opportunities", "Customer Personas", "Go-to-Market Strategy", "Pricing Strategies", "Validation Frameworks", "Execution Plans", or any other framework terms
- Each title MUST follow pattern: [Who] + [Problem] + [Solution]
- Examples of VALID titles: "Non-technical food founders launch cloud kitchens using shared commercial kitchens", "Local fitness coaches create personalized meal prep services for busy professionals"
- Examples of INVALID titles: "Business Models", "Target Segments", "Value Propositions" (these are framework terms, not ideas)
- ONLY return fully-formed, concrete startup ideas with specific customers, problems, and solutions

REALISM ENFORCEMENT:
- Ideas MUST match user's actual skills (if user only has cooking skills, NO tech/AI/software ideas)
- Ideas MUST fit user's time commitment, budget, preferred work style, and startup style
- Preferred work style influences operational complexity and founder-fit (solo vs team, hands-on vs remote, etc.)
- Startup style influences business model, delivery method, cost structure, and scalability (home-based vs local vs online, etc.)
- Business region influences pricing assumptions, feasibility, cultural fit, delivery models, legal complexity, and startup costs
- Ideas MUST be executable within user's earnings timeline
- Ideas MUST be from user's selected industry and sub-interest ONLY
- Ideas MUST be operationally simple and feasible for the user's skill level
- NO hallucinations, NO irrelevant tech, NO ideas from different industries
- NO framework terms, NO abstract concepts, NO strategy categories - ONLY concrete startup ideas"""

        llm_stream = self.llm_service.generate_stream(
            prompt=prompt,
            system_prompt=system_prompt,
            temperature=0.3,
            max_tokens=settings.MAX_TOKENS_STAGE2,
        )

        # State machine for clean buffering
        # States: NORMAL, IDEA_HEADER, FIELD_VALUE
        buffer = ""
        state = "NORMAL"
        token_count = 0
        prev_char = ""
        in_profile = False
        
        async for chunk in llm_stream:
            token_count += 1
            t = chunk
            
            
            
            # Handle profile markers - pass through immediately, never buffer
            if "---PROFILE_ANALYSIS_START---" in t:
                if buffer.strip():
                    yield buffer.strip()
                    buffer = ""
                yield t
                in_profile = True
                state = "NORMAL"
                continue
                
            if "---PROFILE_ANALYSIS_END---" in t:
                if buffer.strip():
                    yield buffer.strip()
                    buffer = ""
                yield t
                in_profile = False
                state = "NORMAL"
                continue
            
            # Inside profile - accumulate everything, flush on end marker only
            if in_profile:
                buffer += t
                prev_char = t
                continue
            
            # Detect IDEA header start: "###" pattern
            if state == "NORMAL" and ("###" in buffer or (buffer == "" and t == "#")):
                buffer += t
                if "###" in buffer:
                    state = "IDEA_HEADER"
                prev_char = t
                continue
            
            # Building IDEA header
            if state == "IDEA_HEADER":
                buffer += t
                
                # Try to merge with number token
                merge_candidate = self.merge_idea_header(buffer, t)
                if merge_candidate:
                    buffer = merge_candidate
                    prev_char = t
                    continue
                
                # Check if we have a complete IDEA header pattern: "### IDEA_<digit>"
                buffer_stripped = buffer.strip()
                is_complete_header = bool(re.match(r"^###\s*IDEA_\d+$", buffer_stripped))
                is_partial_header = buffer_stripped.startswith("### IDEA_") and not is_complete_header
                
                # If we have a partial header (e.g., "### IDEA_" without digit, or "### IDEA__1" with double underscore), keep buffering
                if is_partial_header:
                    prev_char = t
                    continue
                
                # Header complete when we have "### IDEA_X" followed by newline/space
                if is_complete_header and (t == "\n" or t == " " or (t.strip() == "" and len(buffer) > 8)):
                    yield buffer
                    buffer = ""
                    state = "NORMAL"
                    prev_char = t
                    continue
                
                # If we have complete header but next token is not whitespace/digit, flush header
                if is_complete_header and len(buffer) >= 9 and not t.isdigit() and t not in [" ", "\n", ""]:
                    # Extract complete header
                    header_end = buffer.find("\n") if "\n" in buffer else len(buffer)
                    header = buffer[:header_end].rstrip()
                    remainder = buffer[header_end:] + t
                    yield header
                    buffer = remainder
                    state = "NORMAL"
                    prev_char = t
                    continue
                
                prev_char = t
                continue
            
            # Detect field start: alphanumeric followed by ":"
            if state == "NORMAL" and (t.isalnum() or t == "_") and ":" not in buffer:
                buffer += t
                # Check if we just completed a field name (ends with ":")
                if buffer.endswith(":"):
                    state = "FIELD_VALUE"
                prev_char = t
                continue
            
            # Building field value (after ":")
            if state == "FIELD_VALUE" or (state == "NORMAL" and ":" in buffer):
                if state == "NORMAL":
                    state = "FIELD_VALUE"
                
                buffer += t
                
                # Flush on sentence end: period followed by space/newline
                if prev_char == "." and (t == " " or t == "\n"):
                    yield buffer.strip()
                    buffer = ""
                    state = "NORMAL"
                    prev_char = t
                    continue
                
                prev_char = t
                continue
            
            # Handle double newline (flush outside fields)
            # BUT: Do NOT flush if we have a partial IDEA header
            if t == "\n" and prev_char == "\n" and state != "FIELD_VALUE":
                # Check if buffer contains a partial IDEA header that shouldn't be flushed
                buffer_stripped = buffer.strip()
                is_partial_idea_header = buffer_stripped.startswith("### IDEA_") and not bool(re.match(r"^###\s*IDEA_\d+$", buffer_stripped))
                
                if is_partial_idea_header:
                    prev_char = t
                    continue
                
                if buffer.strip():
                    yield buffer.strip()
                buffer = ""
                state = "NORMAL"
                prev_char = t
                continue
            
            # Default: accumulate
            buffer += t
            prev_char = t

        # Final flush
        if buffer.strip():
            flushed = buffer.strip()
            yield flushed
    
    def _format_profile_for_recommendations(self, profile_text: str, user_id: Optional[str] = None) -> str:
        """
        Extract and format profile analysis JSON for use in recommendations prompt.
        
        Converts JSON format to readable text format that the recommendations LLM can use.
        Also includes psyche profile if available.
        """
        if not profile_text:
            return profile_text
        
        import json
        import re
        
        # Extract JSON from delimited block
        start_marker = "---PROFILE_ANALYSIS_START---"
        end_marker = "---PROFILE_ANALYSIS_END---"
        
        start_idx = profile_text.find(start_marker)
        end_idx = profile_text.find(end_marker)
        
        formatted = []
        
        if start_idx >= 0 and end_idx > start_idx:
            # Extract JSON block
            json_start = start_idx + len(start_marker)
            json_text = profile_text[json_start:end_idx].strip()
            
            # Find the JSON object (first { to last })
            first_brace = json_text.find('{')
            last_brace = json_text.rfind('}')
            
            if first_brace >= 0 and last_brace > first_brace:
                json_text = json_text[first_brace:last_brace + 1]
                
                try:
                    profile_data = json.loads(json_text)
                    
                    # Format as readable text for recommendations prompt
                    formatted.append("## Profile Analysis Summary")
                    formatted.append("")
                    
                    if profile_data.get("core_motivations"):
                        formatted.append("### Core Motivations")
                        formatted.append(profile_data["core_motivations"])
                        formatted.append("")
                    
                    if profile_data.get("operating_constraints"):
                        formatted.append("### Operating Constraints")
                        formatted.append(profile_data["operating_constraints"])
                        formatted.append("")
                    
                    if profile_data.get("strengths_and_capabilities"):
                        formatted.append("### Strengths and Capabilities")
                        formatted.append(profile_data["strengths_and_capabilities"])
                        formatted.append("")
                    
                    if profile_data.get("strategic_considerations"):
                        formatted.append("### Strategic Considerations")
                        formatted.append(profile_data["strategic_considerations"])
                        formatted.append("")
                    
                    if profile_data.get("viability_red_flags"):
                        formatted.append("### Viability Red Flags")
                        formatted.append(profile_data["viability_red_flags"])
                        formatted.append("")
                    
                    if profile_data.get("pathway_recommendation"):
                        formatted.append("### Pathway Recommendation")
                        formatted.append(profile_data["pathway_recommendation"])
                        formatted.append("")
                except json.JSONDecodeError:
                    # If JSON parsing fails, return original text (fallback)
                    return profile_text
        
        # AI GUARDRAIL: Always include Psyche Profile if available (NON-NEGOTIABLE)
        # Never let AI infer psyche traits from free text - only use deterministic scores
        # Translate traits into behavioral descriptors to avoid psychological leakage
        if user_id:
            psyche_profile = self.psyche_scoring_service.get_profile_for_ai(user_id)
            if psyche_profile:
                formatted.append("## User Work Preferences (Deterministic)")
                formatted.append("")
                formatted.append("CRITICAL: The user has completed a structured assessment of their work preferences.")
                formatted.append("These behavioral patterns are DETERMINISTIC and must be used as-is. DO NOT infer or contradict these patterns from other context.")
                formatted.append("")
                
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
                        formatted.append("### How User Prefers to Work")
                        for behavior in behaviors:
                            formatted.append(f"- {behavior}")
                        formatted.append("")
                
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
                        formatted.append("### Decision-Making Approach")
                        for behavior in decision_behaviors:
                            formatted.append(f"- {behavior}")
                        formatted.append("")
                
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
                        formatted.append("### What Drives the User")
                        for behavior in motivation_behaviors:
                            formatted.append(f"- {behavior}")
                        formatted.append("")
                
                formatted.append("REQUIRED ACTIONS:")
                formatted.append("1. Filter ideas that conflict with the user's work preferences and decision-making approach")
                formatted.append("2. Rank ideas that best align with their motivation and how they prefer to work")
                formatted.append("3. Explain why each recommendation fits their preferences in practical, work-oriented terms")
                formatted.append("4. Warn about potential friction points based on their work style")
                formatted.append("")
                formatted.append("CRITICAL EXPLANATION RULE: When explaining why an idea fits, do NOT mention personality traits,")
                formatted.append("scores, assessment results, or psychological terms. Explain fit in practical, work-oriented terms only.")
                formatted.append("Example: 'This idea allows you to build deep expertise' NOT 'This fits your high mastery motivation'")
                formatted.append("")
                formatted.append("ABSOLUTE RULE: If any other context (profile analysis, intake form, etc.) suggests")
                formatted.append("different patterns than these deterministic preferences, TRUST THESE PREFERENCES. Do not infer or override.")
                formatted.append("")
        
        if formatted:
            return "\n".join(formatted)
        
        # If no delimiters found, return as-is (might be old format or already formatted)
        return profile_text
    
    def _rank_ideas(
        self,
        ideas: List[Dict[str, Any]],
        profile_analysis: Dict[str, Any],
        inputs: Dict[str, Any]
    ) -> List[Dict[str, Any]]:
        """
        Rank ideas based on profile match.
        
        Scoring factors:
        - validation_score (numeric, highest first)
        - constraints match (from profile_analysis.operating_constraints)
        - skill_strength match (from inputs)
        - time_commitment match (from inputs)
        - budget_range match (from inputs)
        - risk_tolerance match (from inputs)
        """
        if not ideas:
            return ideas
        
        # Extract profile and input data
        constraints_text = profile_analysis.get("operating_constraints", "").lower() if isinstance(profile_analysis, dict) else ""
        strengths_text = profile_analysis.get("strengths_and_capabilities", "").lower() if isinstance(profile_analysis, dict) else ""
        
        time_commitment = inputs.get("time_commitment", "").lower()
        budget_range = inputs.get("budget_range", "").lower()
        risk_tolerance = inputs.get("risk_tolerance", "").lower()
        skill_strength = inputs.get("skill_strength", "").lower()
        preferred_work_style = inputs.get("preferred_work_style", "").lower()
        startup_style = inputs.get("startup_style", "").lower()
        business_region = inputs.get("business_region", "").lower()
        
        # Extract user skills
        user_skills = inputs.get("skills", {})
        selected_skills = []
        if isinstance(user_skills, dict):
            for category, skill_list in user_skills.items():
                if category != "other" and isinstance(skill_list, list):
                    selected_skills.extend(skill_list)
        
        # Score each idea
        scored_ideas = []
        for idea in ideas:
            score = 0.0
            
            # Base score: validation_score (0-10, weight: 5.0)
            validation_score_str = str(idea.get("validation_score", "0"))
            try:
                # Extract numeric value from string (e.g., "7" or "7/10")
                match = re.search(r'\d+', validation_score_str)
                if match:
                    validation_num = float(match.group())
                    score += validation_num * 5.0
            except (ValueError, AttributeError):
                pass
            
            # Constraints match (weight: 2.0)
            why_fits = str(idea.get("why_this_fits", "")).lower()
            timeline = str(idea.get("timeline", "")).lower()
            combined_text = f"{why_fits} {timeline}"
            
            if constraints_text:
                # Check if idea mentions constraints or addresses them
                constraint_keywords = ["constraint", "limit", "budget", "time", "skill"]
                if any(keyword in combined_text for keyword in constraint_keywords):
                    score += 2.0
            
            # Time commitment match (weight: 1.5)
            if time_commitment:
                time_keywords = {
                    "<5": ["part-time", "few hours", "minimal", "side"],
                    "10-20": ["part-time", "10-20", "15 hours", "weekend"],
                    "full-time": ["full-time", "dedicated", "full focus"]
                }
                for key, keywords in time_keywords.items():
                    if key in time_commitment:
                        if any(kw in combined_text for kw in keywords):
                            score += 1.5
                        break
            
            # Budget range match (weight: 1.5)
            if budget_range:
                budget_keywords = {
                    "$0-1k": ["low cost", "free", "minimal", "bootstrap", "lean"],
                    "$1k-5k": ["affordable", "modest", "small budget"],
                    "$5k-10k": ["moderate", "reasonable"],
                    "$10k+": ["investment", "capital", "funding"]
                }
                for key, keywords in budget_keywords.items():
                    if key in budget_range:
                        if any(kw in combined_text for kw in keywords):
                            score += 1.5
                        break
            
            # Risk tolerance match (weight: 1.0)
            if risk_tolerance:
                risk_keywords = {
                    "very low": ["safe", "proven", "low risk", "stable"],
                    "low": ["moderate risk", "tested"],
                    "medium": ["balanced", "moderate"],
                    "high": ["innovative", "disruptive", "high potential"]
                }
                for key, keywords in risk_keywords.items():
                    if key in risk_tolerance.lower():
                        if any(kw in combined_text for kw in keywords):
                            score += 1.0
                        break
            
            # Skill strength match (weight: 1.0)
            if skill_strength and strengths_text:
                skill_keywords = {
                    "beginner": ["simple", "easy", "no-code", "template"],
                    "intermediate": ["moderate", "some experience"],
                    "advanced": ["technical", "complex", "expert"]
                }
                for key, keywords in skill_keywords.items():
                    if key in skill_strength.lower():
                        if any(kw in combined_text or kw in strengths_text for kw in keywords):
                            score += 1.0
                        break
            
            # Preferred work style match (weight: 1.5) - influences operational complexity and founder-fit
            if preferred_work_style:
                work_style_keywords = {
                    "independent": ["solo", "independent", "one-person", "individual"],
                    "solo": ["solo", "independent", "one-person", "individual"],
                    "collaborative": ["team", "collaborative", "partnership", "co-founder"],
                    "hands-on": ["hands-on", "active", "physical", "manual", "tactile"],
                    "active": ["hands-on", "active", "physical", "manual", "tactile"],
                    "creative": ["creative", "maker", "artistic", "design", "craft"],
                    "maker": ["creative", "maker", "artistic", "design", "craft"],
                    "people-facing": ["service", "people-facing", "customer-facing", "interaction", "client"],
                    "service-oriented": ["service", "people-facing", "customer-facing", "interaction", "client"],
                    "remote": ["remote", "online", "digital", "virtual", "distributed"],
                    "flexible": ["flexible", "adaptable", "varied"]
                }
                for key, keywords in work_style_keywords.items():
                    if key in preferred_work_style:
                        if any(kw in combined_text for kw in keywords):
                            score += 1.5
                        break
            
            # Startup style match (weight: 1.5) - influences business model, delivery, cost, scalability
            if startup_style:
                startup_style_keywords = {
                    "home-based": ["home-based", "home", "residential", "from home"],
                    "local service": ["local", "neighborhood", "community", "in-person", "on-site"],
                    "online-only": ["online", "digital", "web-based", "virtual", "remote"],
                    "content": ["content", "creator", "media", "publishing", "blog", "video"],
                    "creator-led": ["content", "creator", "media", "publishing", "blog", "video"],
                    "low-cost": ["low-cost", "bootstrap", "lean", "minimal", "affordable", "budget"],
                    "bootstrapped": ["low-cost", "bootstrap", "lean", "minimal", "affordable", "budget"],
                    "tech-assisted": ["tech-assisted", "technology", "automated", "digital tools"],
                    "community-driven": ["community", "local", "neighborhood", "engagement", "events"],
                    "local engagement": ["community", "local", "neighborhood", "engagement", "events"]
                }
                for key, keywords in startup_style_keywords.items():
                    if key in startup_style:
                        if any(kw in combined_text for kw in keywords):
                            score += 1.5
                        break
            
            # Business region match (weight: 1.5) - influences pricing, feasibility, cultural fit, delivery model
            if business_region:
                region_keywords = {
                    "united states": ["us", "usa", "canada", "north america", "dollar", "usd", "cad"],
                    "canada": ["us", "usa", "canada", "north america", "dollar", "usd", "cad"],
                    "europe": ["europe", "eu", "euro", "eur", "gdpr", "uk", "germany", "france"],
                    "india": ["india", "indian", "rupee", "inr", "mobile-first", "price-sensitive"],
                    "middle east": ["middle east", "uae", "saudi", "gulf", "arab", "dirham", "riyal"],
                    "southeast asia": ["southeast asia", "sea", "singapore", "thailand", "philippines", "indonesia", "vietnam"],
                    "africa": ["africa", "african", "mobile money", "m-pesa", "kenya", "nigeria", "south africa"],
                    "latin america": ["latin america", "mexico", "brazil", "argentina", "colombia", "peso", "real"],
                    "global": ["global", "online", "digital", "worldwide", "international", "remote"],
                    "online": ["global", "online", "digital", "worldwide", "international", "remote"]
                }
                for key, keywords in region_keywords.items():
                    if key in business_region:
                        if any(kw in combined_text for kw in keywords):
                            score += 1.5
                        break
            
            # Skill match (weight: 2.0) - critical for founder fit
            # Map skills to keywords that should appear in idea text
            if selected_skills:
                skill_keyword_map = {
                    "Cooking / Food Prep": ["cooking", "food", "meal", "prep", "kitchen", "recipe", "tiffin", "diet", "nutrition", "catering"],
                    "Crafting / Handmade": ["handmade", "craft", "etsy", "artisan", "product design", "custom", "personalized"],
                    "Beauty Services": ["beauty", "salon", "spa", "skincare", "makeup", "wellness", "grooming"],
                    "Fitness Coaching": ["fitness", "coaching", "training", "workout", "exercise", "health", "personal trainer"],
                    "Photography / Videography": ["photography", "video", "videography", "content", "media", "visual"],
                    "Writing / Content": ["writing", "content", "blog", "copywriting", "editorial", "publishing"],
                    "Graphic Design": ["design", "graphic", "visual", "branding", "creative", "art"],
                    "Coding": ["coding", "development", "software", "app", "tech", "programming"],
                    "AI & Automation": ["ai", "automation", "machine learning", "artificial intelligence", "digital-first"],
                    "Social Media": ["social media", "instagram", "facebook", "tiktok", "influencer", "community"],
                    "Customer Interaction": ["customer", "client", "service", "interaction", "support", "consulting"],
                    "Community Building": ["community", "network", "group", "membership", "engagement", "local"],
                    "Marketing / Advertising": ["marketing", "advertising", "promotion", "brand", "campaign"],
                    "SEO / Blogging": ["seo", "blog", "content", "writing", "online", "digital"],
                    "Teaching / Coaching": ["teaching", "coaching", "education", "training", "mentor", "instructor", "course"],
                    "Web Building": ["website", "web", "online", "digital", "storefront", "ecommerce"],
                    "AI Tools": ["ai", "automation", "digital", "tech", "tools", "software"],
                    "Low-code / No-code": ["low-code", "no-code", "website", "platform", "builder", "digital"],
                    "Automation": ["automation", "automated", "efficient", "streamlined", "digital"]
                }
                
                # Check if idea text matches any selected skill keywords
                idea_text = f"{str(idea.get('title', '')).lower()} {str(idea.get('summary', '')).lower()} {str(idea.get('target_market', '')).lower()} {combined_text}"
                
                for skill in selected_skills:
                    keywords = skill_keyword_map.get(skill, [])
                    if keywords:
                        if any(kw.lower() in idea_text for kw in keywords):
                            score += 2.0
                            break  # Only count once per idea
            
            scored_ideas.append((score, idea))
        
        # Sort by score (descending) and return ideas
        scored_ideas.sort(key=lambda x: x[0], reverse=True)
        
        # Deep clone ideas and update indices to reflect ranking
        import copy
        ranked = []
        for idx, (score, idea) in enumerate(scored_ideas, 1):
            # Deep clone to prevent reference reuse
            ranked_idea = copy.deepcopy(idea)
            ranked_idea['index'] = idx
            ranked_idea['rank_score'] = score
            ranked.append(ranked_idea)
        
        self._log(f"Ranked {len(ranked)} ideas by profile match", "INFO")
        return ranked
    
    def _add_discovery_next_steps(
        self,
        ideas: List[Dict[str, Any]],
        profile_data: Dict[str, Any],
        inputs: Dict[str, Any]
    ) -> List[Dict[str, Any]]:
        """
        Add lightweight, early-stage next steps to each idea for Discovery.
        
        These are 3-5 bullet points focusing on:
        - Test basic demand
        - Create a rough prototype
        - Talk to 2-3 people
        - Validate pricing
        - Create a simple landing page
        
        These are NOT validation-level deep next steps.
        """
        enriched_ideas = []
        
        # Deep clone to prevent reference reuse
        import copy
        for idea in ideas:
            enriched_idea = copy.deepcopy(idea)
            
            # Generate lightweight next_steps
            next_steps = self._generate_lightweight_next_steps(idea, profile_data, inputs)
            
            # Store in enrichment.next_steps
            enriched_idea["enrichment"] = {
                "next_steps": next_steps
            }
            
            enriched_ideas.append(enriched_idea)
        
        return enriched_ideas
    
    def _generate_lightweight_next_steps(
        self,
        idea: Dict[str, Any],
        profile_data: Dict[str, Any],
        inputs: Dict[str, Any]
    ) -> str:
        """
        Generate lightweight, early-stage next steps (3-5 bullets).
        
        Uses short LLM prompt focused on early validation, not deep planning.
        """
        try:
            idea_title = idea.get("title", "")
            idea_summary = idea.get("summary", "")
            target_market = idea.get("target_market", "")
            
            # Extract user constraints
            budget = inputs.get("budget_range", "")
            time_commitment = inputs.get("time_commitment", "")
            skills = inputs.get("skills", {})
            
            # Build skills string
            skill_list = []
            if isinstance(skills, dict):
                for category, skill_array in skills.items():
                    if category != "other" and isinstance(skill_array, list):
                        skill_list.extend(skill_array)
                    elif category == "other" and skill_array:
                        skill_list.append(str(skill_array))
            
            skills_str = ", ".join(skill_list) if skill_list else "general skills"
            
            # Extract operating constraints from profile
            constraints = ""
            if isinstance(profile_data, dict):
                constraints = profile_data.get("operating_constraints", "")
            elif isinstance(profile_data, str):
                # Try to extract from string
                if "operating_constraints" in profile_data.lower():
                    constraints = "Based on user's constraints"
            
            # Build lightweight prompt
            prompt = f"""Generate 3-5 lightweight, early-stage next steps for this startup idea.
Focus on SIMPLE, QUICK validation actions that can be done in 1-2 weeks.

**Idea:**
Title: {idea_title}
Summary: {idea_summary}
Target Market: {target_market}

**User Constraints:**
- Budget: {budget}
- Time Available: {time_commitment}
- Skills: {skills_str}
- Constraints: {constraints if constraints else "Standard startup constraints"}

**Requirements:**
- Return ONLY a bulleted list (3-5 items)
- Each item should be 1 short sentence
- Focus on early validation: testing demand, talking to people, simple prototypes
- Keep it lightweight - no 90-day plans or deep strategy
- Make it actionable and specific to this idea

**Format:**
- Test [specific validation method]
- Create [simple artifact]
- Talk to [target group]
- Validate [specific assumption]
- Build [minimal prototype]

Generate the next steps now:"""

            system_prompt = """You are a startup advisor helping founders with early-stage validation.
Generate lightweight, actionable next steps focused on quick validation.
Keep responses brief - 3-5 bullet points only. No long explanations."""

            response = self.llm_service.generate(
                prompt=prompt,
                system_prompt=system_prompt,
                temperature=0.7,
                max_tokens=300,  # Keep it short
                run_id=None
            )
            
            content = response.get("content", "").strip()
            
            # Clean up the response - ensure it's a bullet list
            if not content:
                # Fallback
                return "- Test basic demand with a simple landing page\n- Talk to 3-5 potential customers\n- Create a rough prototype or mockup\n- Validate pricing assumptions\n- Get initial feedback and iterate"
            
            # Normalize to bullet points
            lines = content.split("\n")
            bullets = []
            for line in lines:
                line = line.strip()
                if not line:
                    continue
                # Ensure it starts with a bullet
                if not line.startswith("-") and not line.startswith("*") and not line[0].isdigit():
                    line = "- " + line
                elif line[0].isdigit() and ". " in line:
                    # Convert numbered list to bullets
                    line = "- " + line.split(". ", 1)[1]
                bullets.append(line)
            
            result = "\n".join(bullets[:5])  # Max 5 bullets
            return result if result else "- Test basic demand\n- Talk to potential customers\n- Create a simple prototype"
            
        except Exception as e:
            self._log(f"Failed to generate lightweight next_steps: {e}", "WARNING")
            # Return simple fallback
            return "- Test basic demand with a simple landing page\n- Talk to 3-5 potential customers\n- Create a rough prototype\n- Validate pricing\n- Get feedback and iterate"
    
    def _generate_final_recommendation(
        self,
        ideas: List[Dict[str, Any]],
        profile_analysis: str,
        inputs: Dict[str, Any],
        run_id: Optional[str] = None
    ) -> Optional[Dict[str, Any]]:
        """
        Generate a premium Final Recommendation with structured decision, rationale, and recommended_path.
        
        Returns:
            {
                "decision": "pursue" | "pursue_with_caution" | "validate_further" | "consider_pivot" | "do_not_pursue",
                "rationale": [str, str, str],  # 3-5 rationale bullets
                "recommended_path": str  # Single sentence strategic direction
            }
        """
        try:
            if not ideas or len(ideas) == 0:
                return None
            
            # Extract top 3 ideas
            top_ideas = ideas[:3]
            
            # Parse profile analysis
            import json
            profile_data = {}
            if profile_analysis:
                try:
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
                    profile_data = {"raw": profile_analysis}
            
            # Extract user constraints and signals
            budget = inputs.get("budget_range", "not specified")
            time_commitment = inputs.get("time_commitment", "not specified")
            risk_tolerance = inputs.get("risk_tolerance", "moderate")
            goal_type = inputs.get("goal_type", "your goals")
            
            # Extract skills
            skills = inputs.get("skills", {})
            skill_list = []
            if isinstance(skills, dict):
                for category, skill_array in skills.items():
                    if category != "other" and isinstance(skill_array, list):
                        skill_list.extend(skill_array)
                    elif category == "other" and skill_array:
                        skill_list.append(str(skill_array))
            skills_str = ", ".join(skill_list[:5]) if skill_list else "general skills"
            
            # Extract experience level and ambition
            experience_level = inputs.get("experience_level", "not specified")
            ambition_level = inputs.get("ambition_level", "moderate")
            
            # Build idea summaries
            idea_summaries = []
            for idx, idea in enumerate(top_ideas, 1):
                title = idea.get("title", f"Idea {idx}")
                summary = idea.get("summary", "")
                validation_score = idea.get("validation_score", "")
                idea_summaries.append(f"{idx}. {title}: {summary} (Validation Score: {validation_score})")
            
            ideas_text = "\n".join(idea_summaries)
            
            # Extract feasibility signals from profile
            operating_constraints = profile_data.get("operating_constraints", "") if isinstance(profile_data, dict) else ""
            strengths = profile_data.get("strengths_and_capabilities", "") if isinstance(profile_data, dict) else ""
            red_flags = profile_data.get("viability_red_flags", "") if isinstance(profile_data, dict) else ""
            
            # Build prompt
            prompt = f"""You are a premium startup advisor providing a high-level strategic decision summary.

**Top Recommendations:**
{ideas_text}

**User Profile:**
- Budget: {budget}
- Time Commitment: {time_commitment}
- Risk Tolerance: {risk_tolerance}
- Goal Type: {goal_type}
- Experience Level: {experience_level}
- Ambition Level: {ambition_level}
- Skills: {skills_str}
- Operating Constraints: {operating_constraints[:200] if operating_constraints else "Standard constraints"}
- Strengths: {strengths[:200] if strengths else "General capabilities"}
- Red Flags: {red_flags[:200] if red_flags else "None identified"}

**Your Task:**
Generate a premium Final Recommendation that provides ONE clear decision, supported by 3-5 strategic insights.

**CRITICAL REQUIREMENTS:**
1. Decision must be ONE of these exact labels: "pursue", "pursue_with_caution", "validate_further", "consider_pivot", "do_not_pursue"
2. Rationale must be 3-5 bullets, each 1-2 sentences, mentioning specific signals (scores, constraints, insights)
3. Recommended path must be a single sentence representing the strategic direction
4. Do NOT repeat any step-by-step actions or tactical guidance
5. Do NOT repeat any content from Next Steps sections
6. Do NOT include lists of tasks
7. This section must ONLY contain: decision, strategic rationale, and strategic direction
8. Every rationale bullet must mention a specific signal (score, constraint, or insight)
9. No generic coaching language allowed
10. The decision must depend directly on the user's constraints and the idea's feasibility

**Output Format (JSON only):**
{{
  "decision": "<one of: pursue / pursue_with_caution / validate_further / consider_pivot / do_not_pursue>",
  "rationale": [
    "<1-2 sentence rationale #1 mentioning specific signal>",
    "<1-2 sentence rationale #2 mentioning specific signal>",
    "<1-2 sentence rationale #3 mentioning specific signal>",
    "<1-2 sentence rationale #4 mentioning specific signal>",
    "<1-2 sentence rationale #5 mentioning specific signal>"
  ],
  "recommended_path": "<a single sentence representing the strategic direction>"
}}

Generate the Final Recommendation now:"""

            system_prompt = """You are a premium startup advisor providing executive-level strategic summaries.
Your recommendations must be strategic, high-level, and decision-focused.
Do NOT include tactical steps, task lists, or action items.
Focus on: decision clarity, strategic rationale, and strategic direction.
Every insight must reference specific signals from the user's profile or idea analysis."""

            response = self.llm_service.generate(
                prompt=prompt,
                system_prompt=system_prompt,
                temperature=0.5,
                max_tokens=800,
                run_id=run_id
            )
            
            content = response.get("content", "").strip()
            
            # Parse JSON from response
            try:
                # Try to extract JSON from markdown code blocks
                import re
                json_match = re.search(r'```(?:json)?\s*(\{.*?\})\s*```', content, re.DOTALL)
                if json_match:
                    content = json_match.group(1)
                else:
                    # Try to find JSON object directly
                    json_match = re.search(r'\{.*?\}', content, re.DOTALL)
                    if json_match:
                        content = json_match.group(0)
                
                result = json.loads(content)
                
                # Validate decision
                valid_decisions = ["pursue", "pursue_with_caution", "validate_further", "consider_pivot", "do_not_pursue"]
                decision = result.get("decision", "").lower().strip()
                if decision not in valid_decisions:
                    self._log(f"Invalid decision '{decision}', falling back to 'validate_further'", "WARNING")
                    decision = "validate_further"
                else:
                    decision = decision  # Use the valid decision
                
                # Validate rationale (ensure it's a list of 3-5 items)
                rationale = result.get("rationale", [])
                if not isinstance(rationale, list):
                    rationale = [str(rationale)] if rationale else []
                rationale = [str(r).strip() for r in rationale if r and str(r).strip()]
                if len(rationale) < 3:
                    # Generate fallback rationale
                    rationale = [
                        f"Top recommendation aligns with your {goal_type} goals and {time_commitment} time commitment.",
                        f"Budget constraints ({budget}) are compatible with the recommended approach.",
                        f"Your {skills_str} skills provide a strong foundation for execution."
                    ]
                rationale = rationale[:5]  # Max 5 items
                
                # Validate recommended_path
                recommended_path = result.get("recommended_path", "").strip()
                if not recommended_path:
                    recommended_path = f"Proceed with validation and early-stage testing aligned with your {goal_type} objectives."
                
                return {
                    "decision": decision,
                    "rationale": rationale,
                    "recommended_path": recommended_path
                }
                
            except (json.JSONDecodeError, ValueError, KeyError) as e:
                self._log(f"Failed to parse Final Recommendation JSON: {e}", "WARNING")
                # Return fallback
                return {
                    "decision": "validate_further",
                    "rationale": [
                        f"Top recommendation shows alignment with your {goal_type} goals.",
                        f"Time commitment ({time_commitment}) and budget ({budget}) are compatible.",
                        f"Your skills and experience level support this direction."
                    ],
                    "recommended_path": f"Proceed with validation and early-stage testing aligned with your {goal_type} objectives."
                }
            
        except Exception as e:
            self._log(f"Failed to generate Final Recommendation: {e}", "WARNING")
            return None
    
    def _clean_seed_ideas(self, ideas: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Remove any tool/enrichment fields from seed ideas.
        
        Seed ideas should ONLY contain:
        - id, index, title, summary, target_market, revenue_model, 
          validation_score, timeline, why_this_fits, details_markdown
        
        Removes any fields like:
        - competitors, opportunity_space, market_trends, risks, 
          market_size, idea_patterns, enrichment, etc.
        """
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
        import copy
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
                        cleaned_idea[key] = {
                            "next_steps": value.get("next_steps", "")
                        }
                    else:
                        cleaned_idea[key] = value
                elif key in FORBIDDEN_FIELDS:
                    # Explicitly skip tool/enrichment fields (but enrichment.next_steps is allowed)
                    self._log(f"Removed tool field '{key}' from seed idea {idea.get('index', 'unknown')}", "DEBUG")
                # Ignore any other unexpected fields
        
            cleaned.append(cleaned_idea)
        
        return cleaned
    
    def _clean_stream_chunk(self, chunk: str) -> str:
        """
        Clean a stream chunk to remove JSON metadata.
        
        Removes patterns like {"run_id": "...", "status": "..."} from chunks.
        IMPORTANT: Does NOT filter profile analysis JSON delimiters.
        """
        if not chunk:
            return chunk
        
        # PROTECT: Don't filter if this contains profile analysis delimiters
        # Profile analysis JSON should be preserved intact
        if "---PROFILE_ANALYSIS_START---" in chunk or "---PROFILE_ANALYSIS_END---" in chunk:
            # This is profile analysis JSON - don't filter it
            return chunk
        
        import re
        
        # Remove JSON metadata patterns (only SSE metadata, not profile JSON)
        cleaned = re.sub(r'\{[^{}]*"run_id"[^{}]*"status"[^{}]*\}[-\s]*', '', chunk)
        cleaned = re.sub(r'\{[^{}]*"run_id"[^{}]*\}[-\s]*', '', cleaned)
        cleaned = re.sub(r'\{[^{}]*run_id[^{}]*\}[-\s]*', '', cleaned)
        
        return cleaned
    
