"""Stream processing for discovery workflow"""
from typing import Dict, Any, Optional, AsyncIterator
import asyncio
import re
import json

from app.services.discovery_utils import normalize_industry_name, determine_realism_level
from app.core.config import settings
from app.services.discovery.stream_schemas import StreamChunk


class DiscoveryStreamProcessor:
    """Handles streaming logic for discovery workflow"""
    
    def __init__(self, profile_service, profile_formatter, stage2_service, logger):
        self.profile_service = profile_service
        self.profile_formatter = profile_formatter
        self.stage2_service = stage2_service
        self._log = logger
    
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
        Stream workflow output using structured JSON lines format.
        Each chunk is a JSON object with a type field for robust parsing.
        """
        # Send metadata first
        yield StreamChunk.create_metadata(version="1.0", sections=["profile", "recommendations"])
        
        # 1. Run Profile Analysis
        loop = asyncio.get_event_loop()
        profile_result = await loop.run_in_executor(
            None,
            lambda: self.profile_service.analyze_profile(inputs, run_id=run_id)
        )
        profile_text = profile_result.get("profile_analysis", "")
        
        # Stream profile section using structured format
        yield StreamChunk.create_profile_start()
        
        if profile_text:
            # Stream profile text in chunks for consistency
            chunk_size = 500  # Characters per chunk
            for i in range(0, len(profile_text), chunk_size):
                chunk_text = profile_text[i:i + chunk_size]
                yield StreamChunk.create_profile_chunk(chunk_text)
        
        yield StreamChunk.create_profile_end()

        # 2. Format profile for recommendations prompt
        formatted_profile = self.profile_formatter.format_profile_for_recommendations(profile_text, user_id=user_id)
        
        # 3. Determine realism level based on user intent
        realism_level = determine_realism_level(inputs)
        
        # 4. Try static engine first (fast path), fallback to LLM if needed
        industry_interest = normalize_industry_name(inputs.get("industry_interest", ""))
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
                    # Parse profile analysis JSON using shared parser library
                    profile_data = {}
                    if profile_text:
                        try:
                            from app.services.parsers.profile_parser import ProfileParser
                            parsed = ProfileParser.extract_json(profile_text)
                            profile_data = parsed if parsed else {"raw": profile_text}
                        except Exception:
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
                    ranked_ideas = self.stage2_service.idea_ranking_service.rank_ideas(idea_seeds, profile_data, inputs)
                    
                    # Clean structured ideas to ensure only seed-level fields
                    cleaned_ideas = self.stage2_service.clean_seed_ideas(ranked_ideas)
                    
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
                    
                    # Stream recommendations using structured format
                    self._log(f"Static engine: Generated {len(cleaned_ideas)} ideas for '{industry_interest}'", "INFO")
                    static_engine_used = True
                    
                    yield StreamChunk.create_recommendation_start()
                    
                    # Yield report in chunks using structured format
                    chunk_size = 500  # Characters per chunk
                    for i in range(0, len(report_with_structured), chunk_size):
                        chunk_text = report_with_structured[i:i + chunk_size]
                        yield StreamChunk.create_recommendation_chunk(chunk_text)
                        # Small delay to simulate streaming (optional, can remove)
                        await asyncio.sleep(0.01)
                    
                    yield StreamChunk.create_recommendation_end()
                    yield StreamChunk.create_complete()
                    
                    return  # Exit early, static engine completed
                    
            except Exception as e:
                # Fall back to LLM if static engine fails
                import traceback
                error_details = traceback.format_exc()
                self._log(f"[Stream] Static engine failed for '{industry_interest}': {e}, falling back to LLM", "WARNING")
                self._log(f"[Stream] Error details: {error_details}", "DEBUG")
        
        # 4. LLM fallback (only if static engine not used)
        if not static_engine_used:
            # Use stage2_service for LLM-based idea generation in streaming mode
            # Note: For streaming, we use the LLM service directly from stage2_service
            prompt = self.stage2_service.prompt_builder.build_idea_research_prompt(
                profile_analysis=formatted_profile,
                realism_level=realism_level,
                user_inputs=inputs
            )
        
            system_prompt = self.stage2_service.prompt_builder.build_idea_research_system_prompt()

            llm_stream = self.stage2_service.llm_service.generate_stream(
                prompt=prompt,
                system_prompt=system_prompt,
                temperature=0.3,
                max_tokens=settings.MAX_TOKENS_STAGE2,
            )

            # Stream recommendations section start
            yield StreamChunk.create_recommendation_start()
            
            # Buffer for accumulating recommendation text chunks
            buffer = ""
            chunk_size = 500  # Accumulate before sending structured chunks
            
            async for chunk in llm_stream:
                if chunk:
                    buffer += chunk
                    
                    # When buffer reaches chunk_size, send as structured chunk
                    if len(buffer) >= chunk_size:
                        yield StreamChunk.create_recommendation_chunk(buffer)
                        buffer = ""
            
            # Send remaining buffer
            if buffer.strip():
                yield StreamChunk.create_recommendation_chunk(buffer)
            
            # End recommendations section
            yield StreamChunk.create_recommendation_end()
            
            # Send completion marker
            yield StreamChunk.create_complete()
    
    async def workflow_stream_ai_first(
        self,
        inputs: Dict[str, Any],
        user_id: Optional[str] = None,
        run_id: Optional[str] = None
    ) -> AsyncIterator[str]:
        """
        AI-First workflow: Try LLM for recommendations first, fallback to static engine if LLM fails.
        
        Flow:
        1. Profile Analysis (LLM - always runs)
        2. Try LLM for recommendations (with timeout)
        3. If LLM fails/times out → Fallback to Static Engine (if industry is supported)
        4. If static engine also unavailable → Return error
        """
        # Send metadata first
        yield StreamChunk.create_metadata(version="1.0", sections=["profile", "recommendations"])
        
        # 1. Run Profile Analysis (same as standard workflow)
        loop = asyncio.get_event_loop()
        profile_result = await loop.run_in_executor(
            None,
            lambda: self.profile_service.analyze_profile(inputs, run_id=run_id)
        )
        profile_text = profile_result.get("profile_analysis", "")
        
        # Stream profile section using structured format
        yield StreamChunk.create_profile_start()
        
        if profile_text:
            # Stream profile text in chunks for consistency
            chunk_size = 500  # Characters per chunk
            for i in range(0, len(profile_text), chunk_size):
                chunk_text = profile_text[i:i + chunk_size]
                yield StreamChunk.create_profile_chunk(chunk_text)
        
        yield StreamChunk.create_profile_end()

        # 2. Format profile for recommendations prompt
        formatted_profile = self.profile_formatter.format_profile_for_recommendations(profile_text, user_id=user_id)
        
        # 3. Determine realism level based on user intent
        realism_level = determine_realism_level(inputs)
        
        # 4. Try LLM first (AI-first path)
        llm_success = False
        industry_interest = normalize_industry_name(inputs.get("industry_interest", ""))
        
        try:
            self._log(f"[AI-First] Attempting LLM recommendations for user_id={user_id}", "INFO")
            
            # Build prompts for LLM
            prompt = self.stage2_service.prompt_builder.build_idea_research_prompt(
                profile_analysis=formatted_profile,
                realism_level=realism_level,
                user_inputs=inputs
            )
            
            system_prompt = self.stage2_service.prompt_builder.build_idea_research_system_prompt()

            # Stream LLM recommendations with timeout
            llm_stream = self.stage2_service.llm_service.generate_stream(
                prompt=prompt,
                system_prompt=system_prompt,
                temperature=0.3,
                max_tokens=settings.MAX_TOKENS_STAGE2,
            )

            # Stream recommendations section start
            yield StreamChunk.create_recommendation_start()
            
            # Buffer for accumulating recommendation text chunks
            buffer = ""
            chunk_size = 500  # Accumulate before sending structured chunks
            
            # Add timeout wrapper for LLM streaming
            timeout_seconds = 45  # Fallback to static after 45s
            try:
                async with asyncio.timeout(timeout_seconds):
                    async for chunk in llm_stream:
                        if chunk:
                            buffer += chunk
                            
                            # When buffer reaches chunk_size, send as structured chunk
                            if len(buffer) >= chunk_size:
                                yield StreamChunk.create_recommendation_chunk(buffer)
                                buffer = ""
                    
                    # Send remaining buffer
                    if buffer.strip():
                        yield StreamChunk.create_recommendation_chunk(buffer)
                    
                    llm_success = True
                    self._log(f"[AI-First] LLM recommendations completed successfully", "INFO")
                    
            except asyncio.TimeoutError:
                self._log(f"[AI-First] LLM timed out after {timeout_seconds}s, falling back to static engine", "WARNING")
                llm_success = False
            
            if llm_success:
                # End recommendations section
                yield StreamChunk.create_recommendation_end()
                
                # Send completion marker
                yield StreamChunk.create_complete()
                return  # Exit successfully
                
        except Exception as e:
            # LLM failed - log and attempt static fallback
            import traceback
            error_details = traceback.format_exc()
            self._log(f"[AI-First] LLM failed: {e}, attempting static engine fallback", "WARNING")
            self._log(f"[AI-First] Error details: {error_details}", "DEBUG")
        
        # 5. Fallback to Static Engine (only if LLM failed)
        if not llm_success:
            self._log(f"[AI-First] Falling back to static engine for industry: '{industry_interest}'", "INFO")
            
            if industry_interest:
                try:
                    from app.static_engine.loader import load_industry_data
                    from app.static_engine.synthesizer import synthesize_ideas
                    from app.static_engine.report_builder import build_markdown_report
                    
                    # Load industry data
                    industry_data = load_industry_data(industry_interest)
                    
                    if industry_data:
                        self._log(f"[AI-First Fallback] Successfully loaded industry data for '{industry_interest}'", "INFO")
                        # Parse profile analysis JSON
                        profile_data = {}
                        if profile_text:
                            try:
                                from app.services.parsers.profile_parser import ProfileParser
                                parsed = ProfileParser.extract_json(profile_text)
                                profile_data = parsed if parsed else {"raw": profile_text}
                            except Exception:
                                profile_data = {"raw": profile_text}
                        
                        # Synthesize ideas
                        idea_seeds = synthesize_ideas(
                            user_params=inputs,
                            industry_data=industry_data,
                            num_ideas=15,
                            realism_level=realism_level
                        )
                        
                        # Check if static engine generated ideas
                        if not idea_seeds or len(idea_seeds) == 0:
                            self._log(f"[AI-First Fallback] Static engine returned 0 ideas", "ERROR")
                            raise ValueError("Static engine returned no ideas")
                        
                        # Rank ideas based on profile match
                        ranked_ideas = self.stage2_service.idea_ranking_service.rank_ideas(idea_seeds, profile_data, inputs)
                        
                        # Clean structured ideas
                        cleaned_ideas = self.stage2_service.clean_seed_ideas(ranked_ideas)
                        
                        # Filter ideas by startup_category
                        startup_category = inputs.get('startup_category', 'both')
                        if startup_category and startup_category != 'both':
                            from app.utils.startup_category_filter import filter_ideas_by_category
                            filtered_ideas = filter_ideas_by_category(cleaned_ideas, startup_category)
                            self._log(f"[AI-First Fallback] Filtered {len(cleaned_ideas)} ideas to {len(filtered_ideas)} based on startup_category={startup_category}", "INFO")
                            
                            if len(filtered_ideas) < 3:
                                self._log(f"[AI-First Fallback] Only {len(filtered_ideas)} ideas remain after filtering", "WARNING")
                            
                            filtered_ids = {idea.get('id') for idea in filtered_ideas}
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
                        
                        # Stream recommendations using structured format
                        self._log(f"[AI-First Fallback] Generated {len(cleaned_ideas)} ideas from static engine", "INFO")
                        
                        # If we haven't started streaming recommendations yet, start now
                        if not llm_success:
                            yield StreamChunk.create_recommendation_start()
                        
                        # Yield report in chunks using structured format
                        chunk_size = 500
                        for i in range(0, len(report_with_structured), chunk_size):
                            chunk_text = report_with_structured[i:i + chunk_size]
                            yield StreamChunk.create_recommendation_chunk(chunk_text)
                            await asyncio.sleep(0.01)
                        
                        yield StreamChunk.create_recommendation_end()
                        yield StreamChunk.create_complete()
                        
                        return  # Exit successfully with static fallback
                        
                except Exception as e:
                    # Static engine also failed
                    import traceback
                    error_details = traceback.format_exc()
                    self._log(f"[AI-First Fallback] Static engine also failed: {e}", "ERROR")
                    self._log(f"[AI-First Fallback] Error details: {error_details}", "ERROR")
            else:
                self._log(f"[AI-First Fallback] No industry selected, cannot use static engine fallback", "ERROR")
            
            # Both LLM and static engine failed - return error
            yield StreamChunk.create_recommendation_start()
            yield StreamChunk.create_recommendation_chunk(
                "⚠️ **AI recommendations temporarily unavailable**\n\n"
                "We encountered an issue generating your personalized recommendations. "
                "Please try again, or select a specific industry to use our fast-track recommendations."
            )
            yield StreamChunk.create_recommendation_end()
            yield StreamChunk.create_complete()

