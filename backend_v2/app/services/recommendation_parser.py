"""
Recommendation Parser – Parses structured recommendation format from LLM output.

Parses the strict format:
### IDEA_1
title: ...
summary: ...
...
"""

from typing import Dict, Any, List, Optional
import re
import uuid
import copy
import logging

logger = logging.getLogger(__name__)


class RecommendationParser:
    """
    Parses recommendations from the strict IDEA_X format.
    """
    
    @staticmethod
    def parse_recommendations(text: str) -> List[Dict[str, Any]]:
        """
        Parse recommendations from text using the strict format.
        
        Args:
            text: Raw LLM output text
            
        Returns:
            List of recommendation dictionaries with keys:
            - id (UUID string)
            - index
            - title
            - summary
            - target_market
            - revenue_model
            - validation_score
            - timeline
            - why_this_fits
        """
        if not text:
            return []
        
        # Split by IDEA markers
        # Pattern: ### IDEA_1, ### IDEA_2, etc.
        idea_pattern = r'###\s*IDEA_(\d+)'
        segments = re.split(idea_pattern, text)
        
        recommendations = []
        
        # segments[0] is text before first IDEA, skip it
        # Then pairs: (number, content)
        for i in range(1, len(segments), 2):
            if i + 1 >= len(segments):
                break
                
            idea_number = segments[i]
            idea_content = segments[i + 1].strip()
            
            if not idea_content:
                continue
            
            # Parse key: value pairs
            parsed = RecommendationParser._parse_idea_block(idea_content)
            if parsed:
                # Generate unique UUID for each idea
                parsed['id'] = str(uuid.uuid4())
                parsed['index'] = int(idea_number)
                # Deep clone to prevent reference reuse
                recommendations.append(copy.deepcopy(parsed))
        
        # Apply uniqueness filter
        unique_recommendations = RecommendationParser._filter_unique_ideas(recommendations)
        
        # Log results for verification
        logger.info(f"Parsed {len(recommendations)} ideas, {len(unique_recommendations)} unique after filtering")
        for idx, idea in enumerate(unique_recommendations, 1):
            logger.info(f"Idea {idx}: id={idea.get('id')}, title={idea.get('title', '')[:50]}, summary={idea.get('summary', '')[:50]}")
        
        return unique_recommendations
    
    @staticmethod
    def _parse_idea_block(content: str) -> Optional[Dict[str, Any]]:
        """
        Parse a single IDEA block into a dictionary.
        
        Expected format:
        title: ...
        summary: ...
        target_market: ...
        revenue_model: ...
        validation_score: ...
        timeline: ...
        why_this_fits: ...
        """
        result = {}
        
        # Pattern to match "key: value" where value can span multiple lines
        # until the next key: pattern
        lines = content.split('\n')
        current_key = None
        current_value = []
        
        for line in lines:
            line = line.strip()
            if not line:
                if current_key and current_value:
                    result[current_key] = ' '.join(current_value).strip()
                    current_value = []
                continue
            
            # Check if this line starts a new key: value pair
            if ':' in line:
                # Save previous key-value if exists
                if current_key and current_value:
                    result[current_key] = ' '.join(current_value).strip()
                    current_value = []
                
                # Extract new key and value
                parts = line.split(':', 1)
                if len(parts) == 2:
                    current_key = parts[0].strip().lower()
                    value_part = parts[1].strip()
                    if value_part:
                        current_value = [value_part]
                    else:
                        current_value = []
                else:
                    # Malformed, skip
                    continue
            else:
                # Continuation of previous value
                if current_key:
                    current_value.append(line)
        
        # Save last key-value
        if current_key and current_value:
            result[current_key] = ' '.join(current_value).strip()
        
        # Validate required fields
        required_fields = ['title', 'summary', 'target_market', 'revenue_model', 
                          'validation_score', 'timeline', 'why_this_fits']
        
        # Check if we have at least title and summary (minimum required)
        if 'title' in result and 'summary' in result:
            # Fill missing fields with empty strings
            for field in required_fields:
                if field not in result:
                    result[field] = ""
            return result
        
        return None
    
    @staticmethod
    def _filter_unique_ideas(ideas: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Filter out duplicate ideas based on title and summary.
        Ensures each idea has a unique title and summary.
        Fixes duplicate IDs by appending index suffix.
        
        Args:
            ideas: List of idea dictionaries
            
        Returns:
            List of unique ideas (deep cloned)
        """
        if not ideas:
            return []
        
        seen_titles = set()
        seen_summaries = set()
        seen_ids = {}  # Track ID occurrences: {id: count}
        unique_ideas = []
        
        for idea in ideas:
            # Deep clone to prevent reference reuse
            idea_copy = copy.deepcopy(idea)
            
            title = (idea_copy.get('title') or '').strip().lower()
            summary = (idea_copy.get('summary') or '').strip().lower()
            
            # Skip if title or summary is empty
            if not title or not summary:
                logger.warning(f"Skipping idea with empty title or summary: id={idea_copy.get('id')}")
                continue
            
            # Skip if we've seen this exact title or summary before
            if title in seen_titles:
                logger.warning(f"Skipping duplicate title: '{title[:50]}...' (id={idea_copy.get('id')})")
                continue
            
            if summary in seen_summaries:
                logger.warning(f"Skipping duplicate summary: '{summary[:50]}...' (id={idea_copy.get('id')})")
                continue
            
            # Handle duplicate IDs by appending suffix
            original_id = idea_copy.get('id')
            if original_id:
                if original_id in seen_ids:
                    count = seen_ids[original_id]
                    seen_ids[original_id] = count + 1
                    idea_copy['id'] = f"{original_id}-{count + 1}"
                    logger.warning(f"Duplicate ID detected: {original_id}, renamed to {idea_copy['id']}")
                else:
                    seen_ids[original_id] = 1
            
            # Add to unique set
            seen_titles.add(title)
            seen_summaries.add(summary)
            unique_ideas.append(idea_copy)
        
        return unique_ideas
    
    @staticmethod
    def format_recommendations_for_frontend(recommendations: List[Dict[str, Any]]) -> str:
        """
        Format parsed recommendations back to a readable format for frontend.
        
        This is used as a fallback when frontend needs markdown format.
        """
        if not recommendations:
            return ""
        
        lines = []
        for rec in recommendations:
            index = rec.get('index', 0)
            title = rec.get('title', f'Idea {index}')
            summary = rec.get('summary', '')
            target_market = rec.get('target_market', '')
            revenue_model = rec.get('revenue_model', '')
            validation_score = rec.get('validation_score', '')
            timeline = rec.get('timeline', '')
            why_this_fits = rec.get('why_this_fits', '')
            
            lines.append(f"### {index}. **{title}**")
            lines.append("")
            if summary:
                lines.append(f"**Summary:** {summary}")
            if target_market:
                lines.append(f"**Target Market:** {target_market}")
            if revenue_model:
                lines.append(f"**Revenue Model:** {revenue_model}")
            if validation_score:
                lines.append(f"**Validation Score:** {validation_score}/10")
            if timeline:
                lines.append(f"**Timeline:** {timeline}")
            if why_this_fits:
                lines.append(f"**Why This Fits:** {why_this_fits}")
            lines.append("")
        
        return "\n".join(lines)

