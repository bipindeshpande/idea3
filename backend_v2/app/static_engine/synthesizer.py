"""
Idea synthesizer module.

Combines fragments from industry data into unique idea seeds using parameter mappings.
No LLM usage - purely deterministic with controlled randomness.
"""
import random
import hashlib
from typing import Dict, Any, List, Optional
import logging

logger = logging.getLogger(__name__)


# Skill-to-fragment keyword mapping
# Maps user-selected skills to fragment keywords that should be weighted higher
SKILL_FRAGMENT_MAPPING = {
    # Product Creation Skills
    "Cooking / Food Prep": {
        "keywords": ["cooking", "food", "meal", "prep", "kitchen", "recipe", "tiffin", "diet", "nutrition", "catering", "meal prep", "home-based food", "subscription food", "healthy cooking", "specialty diets", "local delivery"],
        "weight_boost": 3.0,
        "priority": "high"
    },
    "Crafting / Handmade": {
        "keywords": ["handmade", "craft", "etsy", "artisan", "product design", "custom", "personalized", "creative", "maker", "diy"],
        "weight_boost": 3.0,
        "priority": "high"
    },
    "Beauty Services": {
        "keywords": ["beauty", "salon", "spa", "skincare", "makeup", "wellness", "grooming", "cosmetics"],
        "weight_boost": 3.0,
        "priority": "high"
    },
    "Fitness Coaching": {
        "keywords": ["fitness", "coaching", "training", "workout", "exercise", "health", "wellness", "personal trainer"],
        "weight_boost": 3.0,
        "priority": "high"
    },
    "Photography / Videography": {
        "keywords": ["photography", "video", "videography", "content", "media", "visual", "creative", "production"],
        "weight_boost": 3.0,
        "priority": "high"
    },
    "Writing / Content": {
        "keywords": ["writing", "content", "blog", "copywriting", "editorial", "publishing", "author", "narrative"],
        "weight_boost": 3.0,
        "priority": "high"
    },
    "Graphic Design": {
        "keywords": ["design", "graphic", "visual", "branding", "creative", "art", "illustration"],
        "weight_boost": 3.0,
        "priority": "high"
    },
    "Coding": {
        "keywords": ["coding", "development", "software", "app", "tech", "programming", "developer", "technical"],
        "weight_boost": 3.0,
        "priority": "high"
    },
    "AI & Automation": {
        "keywords": ["ai", "automation", "machine learning", "artificial intelligence", "digital-first", "tech", "automated"],
        "weight_boost": 3.0,
        "priority": "high"
    },
    # Sales & Marketing Skills
    "Social Media": {
        "keywords": ["social media", "instagram", "facebook", "tiktok", "influencer", "community", "engagement"],
        "weight_boost": 2.5,
        "priority": "high"
    },
    "Customer Interaction": {
        "keywords": ["customer", "client", "service", "interaction", "support", "consulting", "coaching"],
        "weight_boost": 2.5,
        "priority": "high"
    },
    "Community Building": {
        "keywords": ["community", "network", "group", "membership", "engagement", "local", "neighborhood"],
        "weight_boost": 2.5,
        "priority": "high"
    },
    "Marketing / Advertising": {
        "keywords": ["marketing", "advertising", "promotion", "brand", "campaign", "outreach"],
        "weight_boost": 2.5,
        "priority": "high"
    },
    "SEO / Blogging": {
        "keywords": ["seo", "blog", "content", "writing", "online", "digital", "web"],
        "weight_boost": 2.5,
        "priority": "high"
    },
    # Operational Skills
    "Budgeting": {
        "keywords": ["budget", "finance", "cost", "pricing", "affordable", "low-cost"],
        "weight_boost": 2.0,
        "priority": "medium"
    },
    "Inventory Management": {
        "keywords": ["inventory", "stock", "supply", "logistics", "warehouse", "fulfillment"],
        "weight_boost": 2.0,
        "priority": "medium"
    },
    "Logistics": {
        "keywords": ["logistics", "delivery", "shipping", "fulfillment", "supply chain", "distribution"],
        "weight_boost": 2.0,
        "priority": "medium"
    },
    "Teaching / Coaching": {
        "keywords": ["teaching", "coaching", "education", "training", "mentor", "instructor", "course"],
        "weight_boost": 2.5,
        "priority": "high"
    },
    "Time Management": {
        "keywords": ["time", "efficient", "quick", "fast", "automated", "streamlined"],
        "weight_boost": 2.0,
        "priority": "medium"
    },
    "Project Management": {
        "keywords": ["project", "management", "organization", "planning", "coordination"],
        "weight_boost": 2.0,
        "priority": "medium"
    },
    # Digital Skills
    "AI Tools": {
        "keywords": ["ai", "automation", "digital", "tech", "tools", "software", "platform"],
        "weight_boost": 2.5,
        "priority": "high"
    },
    "Low-code / No-code": {
        "keywords": ["low-code", "no-code", "website", "platform", "builder", "digital", "online"],
        "weight_boost": 2.5,
        "priority": "high"
    },
    "Web Building": {
        "keywords": ["website", "web", "online", "digital", "storefront", "ecommerce", "platform"],
        "weight_boost": 2.5,
        "priority": "high"
    },
    "Automation": {
        "keywords": ["automation", "automated", "efficient", "streamlined", "digital", "tech"],
        "weight_boost": 2.5,
        "priority": "high"
    },
    "Data Analysis": {
        "keywords": ["data", "analytics", "insights", "metrics", "analysis", "reporting"],
        "weight_boost": 2.0,
        "priority": "medium"
    },
    # Personality Strengths
    "Empathy": {
        "keywords": ["service", "care", "support", "help", "community", "people", "wellness"],
        "weight_boost": 1.5,
        "priority": "medium"
    },
    "Leadership": {
        "keywords": ["team", "management", "coaching", "mentor", "organization", "community"],
        "weight_boost": 1.5,
        "priority": "medium"
    },
    "Problem Solving": {
        "keywords": ["solution", "solve", "fix", "improve", "optimize", "efficient"],
        "weight_boost": 1.5,
        "priority": "medium"
    },
    "Team Building": {
        "keywords": ["team", "collaboration", "community", "network", "partnership"],
        "weight_boost": 1.5,
        "priority": "medium"
    },
    "Persuasion": {
        "keywords": ["sales", "marketing", "persuasion", "influence", "communication"],
        "weight_boost": 1.5,
        "priority": "medium"
    }
}


def _normalize_param_value(value: str) -> str:
    """Normalize parameter values for matching."""
    if not value:
        return ""
    return value.strip()


def _get_fragments_for_param(
    industry_data: Dict[str, Any],
    param_type: str,
    param_value: str,
    fragment_type: str
) -> List[Dict[str, Any]]:
    """
    Get fragments for a specific parameter type and value.
    
    Args:
        industry_data: Full industry data
        param_type: e.g., "time_commitment", "budget_range"
        param_value: e.g., "<5", "$0-1k", "Very Low"
        fragment_type: e.g., "problems", "solutions"
        
    Returns:
        List of fragment objects with id, weight, priority (or string IDs converted to objects)
    """
    param_mappings = industry_data.get("parameter_mappings", {})
    param_dict = param_mappings.get(param_type, {})
    
    # Try exact match first
    if param_value in param_dict:
        mapping = param_dict[param_value]
        fragments = mapping.get(fragment_type, [])
        # Convert string IDs to objects if needed
        return [_normalize_fragment_ref(f) for f in fragments]
    
    # Try normalized match
    normalized_value = _normalize_param_value(param_value)
    for key, mapping in param_dict.items():
        if _normalize_param_value(key) == normalized_value:
            fragments = mapping.get(fragment_type, [])
            # Convert string IDs to objects if needed
            return [_normalize_fragment_ref(f) for f in fragments]
    
    # Fallback: return empty list
    logger.debug(f"No mapping found for {param_type}={param_value}, fragment_type={fragment_type}")
    return []


def _normalize_fragment_ref(frag_ref: Any) -> Dict[str, Any]:
    """
    Normalize fragment reference to object format.
    
    Handles both string IDs (legacy) and object format (new).
    """
    if isinstance(frag_ref, str):
        # Legacy format: just ID string
        return {"id": frag_ref, "weight": 3, "priority": "medium"}
    elif isinstance(frag_ref, dict):
        # New format: object with id, weight, priority
        return {
            "id": frag_ref.get("id", ""),
            "weight": frag_ref.get("weight", 3),
            "priority": frag_ref.get("priority", "medium")
        }
    else:
        # Invalid format, return default
        return {"id": str(frag_ref), "weight": 3, "priority": "medium"}


def _apply_skill_weighting(
    fragments: List[Dict[str, Any]],
    user_skills: Dict[str, Any],
    industry_data: Dict[str, Any]
) -> List[Dict[str, Any]]:
    """
    Apply skill-based weighting to fragments.
    
    If user has selected skills, boost weight of fragments that match skill keywords.
    
    Args:
        fragments: List of fragment objects with id, weight, priority
        user_skills: User skills dict (e.g., {"product_creation": ["Cooking / Food Prep"], ...})
        industry_data: Industry data to look up fragment text
        
    Returns:
        List of fragments with updated weights
    """
    if not user_skills or not fragments:
        return fragments
    
    # Extract all selected skills as a flat list
    selected_skills = []
    if isinstance(user_skills, dict):
        for category, skill_list in user_skills.items():
            if category != "other" and isinstance(skill_list, list):
                selected_skills.extend(skill_list)
    
    if not selected_skills:
        return fragments
    
    # Get fragment text from industry data
    idea_fragments = industry_data.get("idea_fragments", {})
    fragment_text_map = {}
    
    # Build a map of fragment ID -> text for all fragment types
    for frag_type in ["problems", "solutions", "delivery_modes", "revenue_patterns", "automation_patterns"]:
        frag_list = idea_fragments.get(frag_type, [])
        for frag in frag_list:
            if isinstance(frag, dict) and "id" in frag and "text" in frag:
                fragment_text_map[frag["id"]] = frag["text"].lower()
    
    # Apply skill-based weighting
    weighted_fragments = []
    for frag in fragments:
        frag_id = frag.get("id", "")
        frag_text = fragment_text_map.get(frag_id, "").lower()
        
        # Check if fragment text matches any skill keywords
        max_boost = 0.0
        max_priority = frag.get("priority", "medium")
        
        for skill_name in selected_skills:
            skill_mapping = SKILL_FRAGMENT_MAPPING.get(skill_name, {})
            keywords = skill_mapping.get("keywords", [])
            weight_boost = skill_mapping.get("weight_boost", 0.0)
            priority = skill_mapping.get("priority", "medium")
            
            # Check if any keyword matches fragment text
            for keyword in keywords:
                if keyword.lower() in frag_text:
                    if weight_boost > max_boost:
                        max_boost = weight_boost
                        max_priority = priority
                    break
        
        # Apply boost to weight
        new_weight = frag.get("weight", 3) + max_boost
        new_priority = max_priority if max_boost > 0 else frag.get("priority", "medium")
        
        weighted_fragments.append({
            "id": frag_id,
            "weight": new_weight,
            "priority": new_priority
        })
    
    return weighted_fragments


def _select_fragments_by_weight(
    fragments: List[Dict[str, Any]],
    min_count: int = 1,
    max_count: int = 3,
    seed: Optional[int] = None
) -> List[str]:
    """
    Select fragment IDs based on weight and priority.
    
    Higher weight and priority fragments are more likely to be selected.
    
    Args:
        fragments: List of fragment objects with id, weight, priority
        min_count: Minimum fragments to select
        max_count: Maximum fragments to select
        seed: Optional random seed for reproducibility
        
    Returns:
        List of fragment IDs
    """
    if not fragments:
        return []
    
    if seed is not None:
        random.seed(seed)
    
    # Sort by weight (descending) and priority (high > medium > low)
    priority_order = {"high": 3, "medium": 2, "low": 1}
    
    def sort_key(frag):
        weight = frag.get("weight", 3)
        priority = frag.get("priority", "medium")
        return (weight, priority_order.get(priority, 2))
    
    sorted_fragments = sorted(fragments, key=sort_key, reverse=True)
    
    # Select based on weighted probability
    selected = []
    count = min(max_count, len(sorted_fragments))
    
    # Always include top-weighted fragments, then add some randomness
    top_count = min(min_count, len(sorted_fragments))
    for i in range(top_count):
        if i < len(sorted_fragments):
            frag_id = sorted_fragments[i].get("id")
            if frag_id:
                selected.append(frag_id)
    
    # Add additional fragments with weighted probability
    remaining = sorted_fragments[top_count:]
    if remaining and len(selected) < count:
        # Weighted random selection from remaining
        weights = [f.get("weight", 3) for f in remaining]
        total_weight = sum(weights)
        
        if total_weight > 0:
            # Select remaining slots
            needed = count - len(selected)
            for _ in range(needed):
                if not remaining:
                    break
                
                # Weighted random choice
                r = random.uniform(0, total_weight)
                cumulative = 0
                selected_idx = None
                for i, frag in enumerate(remaining):
                    cumulative += weights[i]
                    if r <= cumulative:
                        frag_id = frag.get("id")
                        if frag_id and frag_id not in selected:
                            selected.append(frag_id)
                            selected_idx = i
                        break
                
                # Remove selected item from remaining
                if selected_idx is not None:
                    removed_weight = weights.pop(selected_idx)
                    remaining.pop(selected_idx)
                    total_weight -= removed_weight
    
    return selected


def _get_fragment_text(industry_data: Dict[str, Any], fragment_type: str, fragment_id: str) -> Optional[str]:
    """Get text for a fragment by ID."""
    idea_fragments = industry_data.get("idea_fragments", {})
    fragments_list = idea_fragments.get(fragment_type, [])
    
    for frag in fragments_list:
        if frag.get("id") == fragment_id:
            return frag.get("text")
    
    return None


def _generate_idea_id(problem_text: str, solution_text: str, idx: int) -> str:
    """Generate a unique ID for an idea based on its content."""
    # Create a hash from problem + solution for uniqueness
    content_hash = hashlib.md5(f"{problem_text}:{solution_text}".encode()).hexdigest()[:8]
    return f"{idx}_{content_hash}"


def _build_idea_title(solution_text: str, problem_text: str, delivery_mode_text: str = "", realism_level: int = 3) -> str:
    """Build a title from solution and problem, adjusted for realism level.
    
    CRITICAL: Title must be a concrete startup idea, NOT a framework term.
    """
    from app.utils.idea_validator import is_framework_term, regenerate_title_from_fragments
    
    if solution_text:
        # Use solution text as base, clean it up
        title = solution_text.strip()
        # Remove any trailing periods, make title case
        title = title.rstrip('.')
        # Take first part if it's a sentence
        if len(title) > 60:
            # Try to truncate at word boundary
            words = title.split()
            title = " ".join(words[:8])  # Roughly 60 chars with ~8 words
        
        # CRITICAL: Check if title is a framework term
        if is_framework_term(title):
            # Regenerate from fragments to ensure it's concrete
            title = regenerate_title_from_fragments(problem_text, solution_text, delivery_mode_text)
        else:
            # Adjust tone based on realism level
            if realism_level <= 2:
                # Lower realism: simpler, more encouraging
                title = title.replace("Enterprise", "Business").replace("Advanced", "Simple")
            elif realism_level >= 4:
                # Higher realism: more professional
                if not any(word in title.lower() for word in ["platform", "system", "solution"]):
                    title = f"{title} Platform"
        
        return title
    elif problem_text:
        # Fallback to problem-based title
        title = problem_text.strip().rstrip('.')
        if len(title) > 60:
            words = title.split()
            title = " ".join(words[:8])
        
        # CRITICAL: Check if title is a framework term
        if is_framework_term(title):
            # Regenerate from fragments
            title = regenerate_title_from_fragments(problem_text, solution_text or "", delivery_mode_text)
        
        return title
    
    # Last resort: generate from available fragments
    if delivery_mode_text:
        title = delivery_mode_text.strip().title()
        if is_framework_term(title):
            title = "Concrete Startup Opportunity"
        return title
    
    return "Concrete Startup Opportunity"


def _build_idea_summary(solution_text: str, delivery_mode_text: str, realism_level: int = 3) -> str:
    """Build a summary from solution and delivery mode, adjusted for realism level."""
    parts = []
    if solution_text:
        text = solution_text.strip().rstrip('.')
        # Adjust tone based on realism level
        if realism_level <= 2:
            # Lower realism: simpler, more encouraging language
            text = text.replace("sophisticated", "simple").replace("complex", "easy")
            parts.append(text)
        elif realism_level >= 4:
            # Higher realism: more detailed, professional
            parts.append(text)
        else:
            parts.append(text)
    
    if delivery_mode_text:
        delivery = delivery_mode_text.lower().strip().rstrip('.')
        if realism_level <= 2:
            parts.append(f"You can start this {delivery} - it's straightforward!")
        elif realism_level >= 4:
            parts.append(f"Delivery model: {delivery}. Requires careful planning and execution.")
        else:
            parts.append(f"This service can be delivered {delivery}.")
    
    summary = " ".join(parts)
    # Ensure it's a reasonable length (2-3 sentences)
    if len(summary) > 300:
        sentences = summary.split('.')
        summary = '.'.join(sentences[:2]) + '.'
    
    return summary


def _build_target_market(delivery_mode_text: str, user_params: Dict[str, Any], realism_level: int = 3) -> str:
    """Build target market description, adjusted for realism level."""
    preferred_work_style = user_params.get("preferred_work_style", "") or user_params.get("work_style", "")
    
    if delivery_mode_text:
        base = delivery_mode_text.strip().rstrip('.')
        if realism_level <= 2:
            return base  # Keep simple
        elif realism_level >= 4:
            return f"{base} - targeting specific market segments with clear demand"
        return base
    
    # Fallback based on work style
    if "Solo" in preferred_work_style or "Independent" in preferred_work_style:
        base = "Individual entrepreneurs and solo founders"
    elif "Small" in preferred_work_style or "collaborative" in preferred_work_style:
        base = "Small businesses and startup teams"
    elif "Remote" in preferred_work_style or "Remote-friendly" in preferred_work_style:
        base = "Remote-first businesses and distributed teams"
    else:
        base = "Small to medium businesses"
    
    if realism_level >= 4:
        base += " with validated market need"
    
    return base


def _build_validation_score(weight: float, priority: str) -> str:
    """Convert weight and priority to validation score (1-10)."""
    # Weight is typically 1-5, priority affects score
    base_score = int(weight * 2)  # Convert 1-5 to 2-10
    
    if priority == "high":
        base_score = min(10, base_score + 1)
    elif priority == "low":
        base_score = max(1, base_score - 1)
    
    return str(min(10, max(1, base_score)))


def _build_timeline(time_commitment: str, delivery_mode_text: str, realism_level: int = 3) -> str:
    """Build timeline estimate, adjusted for realism level."""
    if time_commitment:
        if "<5" in time_commitment or "less than" in time_commitment.lower():
            base = "2-4 weeks for MVP, 2-3 months to launch"
        elif "5-10" in time_commitment or "10-20" in time_commitment:
            base = "4-6 weeks for MVP, 3-4 months to launch"
        elif "20-40" in time_commitment or "Full-time" in time_commitment:
            base = "2-3 weeks for MVP, 1-2 months to launch"
        else:
            base = "4-8 weeks for MVP, 3-4 months to launch"
    else:
        base = "4-8 weeks for MVP, 3-4 months to launch"
    
    # Adjust based on realism level
    if realism_level <= 2:
        # Lower realism: optimistic, encouraging
        return base.replace("months", "months (with focused effort)")
    elif realism_level >= 4:
        # Higher realism: include buffer and dependencies
        return f"{base}. Note: Timeline assumes no major blockers and adequate resources."
    
    return base


def _build_why_this_fits(problem_text: str, solution_text: str, user_params: Dict[str, Any], realism_level: int = 3) -> str:
    """Build why this idea fits the user, adjusted for realism level."""
    parts = []
    
    founder_ambition = user_params.get("founder_ambition", "") or user_params.get("goal_type", "")
    time_commitment = user_params.get("time_commitment", "")
    budget_range = user_params.get("budget_range", "")
    
    if problem_text:
        if realism_level <= 2:
            parts.append(f"This solves {problem_text.lower().strip().rstrip('.')} - a real need!")
        elif realism_level >= 4:
            parts.append(f"Addresses validated market problem: {problem_text.lower().strip().rstrip('.')}")
        else:
            parts.append(f"Addresses the critical problem of {problem_text.lower().strip().rstrip('.')}")
    
    if founder_ambition:
        if realism_level <= 2:
            parts.append(f"perfect for your {founder_ambition.lower()} goal")
        elif realism_level >= 4:
            parts.append(f"strategically aligned with your {founder_ambition.lower()} objective")
        else:
            parts.append(f"aligns with your goal of {founder_ambition.lower()}")
    
    if time_commitment:
        if realism_level <= 2:
            parts.append(f"fits your {time_commitment} schedule")
        else:
            parts.append(f"fits within your {time_commitment} time commitment")
    
    if budget_range:
        if realism_level <= 2:
            parts.append(f"works with your {budget_range} budget - very affordable!")
        elif realism_level >= 4:
            parts.append(f"capital requirements align with your {budget_range} budget")
        else:
            parts.append(f"works with your {budget_range} budget")
    
    if solution_text:
        if realism_level <= 2:
            parts.append(f"uses {solution_text.lower().strip().rstrip('.')} - simple and effective!")
        else:
            parts.append(f"and leverages {solution_text.lower().strip().rstrip('.')}")
    
    if not parts:
        if realism_level <= 2:
            return "This idea is perfect for you - it matches your goals and is totally doable!"
        elif realism_level >= 4:
            return "This idea is strategically aligned with your constraints, capabilities, and market positioning."
        return "This idea is tailored to your specific constraints and goals."
    
    return ". ".join(parts) + "."


def _build_details_markdown(idea: Dict[str, Any], industry_data: Dict[str, Any], realism_level: int = 3) -> str:
    """Build markdown details block for an idea, adjusted for realism level."""
    sections = []
    
    if idea.get("problem"):
        problem = idea.get('problem')
        if realism_level <= 2:
            sections.append(f"**The Challenge:** {problem} - but you can solve this!")
        elif realism_level >= 4:
            sections.append(f"**Market Problem:** {problem}. Market validation recommended before full commitment.")
        else:
            sections.append(f"**Problem:** {problem}")
    
    if idea.get("solution"):
        solution = idea.get('solution')
        if realism_level <= 2:
            sections.append(f"**Your Solution:** {solution} - simple and effective!")
        elif realism_level >= 4:
            sections.append(f"**Proposed Solution:** {solution}. Consider MVP validation and competitive differentiation.")
        else:
            sections.append(f"**Solution:** {solution}")
    
    if idea.get("delivery_mode"):
        delivery = idea.get('delivery_mode')
        if realism_level <= 2:
            sections.append(f"**How to Start:** {delivery} - you can begin right away!")
        elif realism_level >= 4:
            sections.append(f"**Delivery Model:** {delivery}. Evaluate operational requirements and scalability constraints.")
        else:
            sections.append(f"**Delivery Mode:** {delivery}")
    
    if idea.get("revenue_pattern"):
        revenue = idea.get('revenue_pattern')
        if realism_level <= 2:
            sections.append(f"**Making Money:** {revenue} - straightforward revenue!")
        elif realism_level >= 4:
            sections.append(f"**Revenue Model:** {revenue}. Analyze unit economics, customer acquisition cost, and lifetime value.")
        else:
            sections.append(f"**Revenue Pattern:** {revenue}")
    
    if idea.get("automation_pattern") and realism_level >= 3:
        # Only show automation for higher realism levels
        sections.append(f"**Automation Pattern:** {idea.get('automation_pattern')}")
    
    if idea.get("archetypes") and realism_level >= 3:
        archetype_labels = []
        archetypes_list = industry_data.get("archetypes", [])
        for arch_id in idea.get("archetypes", []):
            for arch in archetypes_list:
                if arch.get("id") == arch_id:
                    archetype_labels.append(arch.get("label", arch_id))
                    break
            else:
                archetype_labels.append(arch_id)
        
        if archetype_labels:
            sections.append(f"**Business Archetype:** {', '.join(archetype_labels)}")
    
    if idea.get("weight"):
        if realism_level <= 2:
            sections.append(f"*Match Score: {idea.get('weight')}/5 - Great fit for you!*")
        elif realism_level >= 4:
            sections.append(f"*Validation Score: {idea.get('weight')}/5 ({idea.get('priority', 'medium')} priority). Conduct market research to validate assumptions.*")
        else:
            sections.append(f"*Relevance Score: {idea.get('weight')}/5 ({idea.get('priority', 'medium')} priority)*")
    
    return "\n\n".join(sections) if sections else ""


def _transform_to_structured_idea(
    idea: Dict[str, Any],
    idx: int,
    user_params: Dict[str, Any],
    industry_data: Dict[str, Any],
    realism_level: int = 3
) -> Dict[str, Any]:
    """Transform fragment-based idea to structured format.
    
    CRITICAL: Ensures title is a concrete startup idea, not a framework term.
    """
    from app.utils.idea_validator import is_concrete_idea
    
    problem_text = idea.get("problem", "")
    solution_text = idea.get("solution", "")
    delivery_mode_text = idea.get("delivery_mode", "")
    revenue_pattern_text = idea.get("revenue_pattern", "")
    weight = idea.get("weight", 3)
    priority = idea.get("priority", "medium")
    
    # Generate all required fields
    idea_id = _generate_idea_id(problem_text, solution_text, idx)
    title = _build_idea_title(solution_text, problem_text, delivery_mode_text, realism_level)
    summary = _build_idea_summary(solution_text, delivery_mode_text, realism_level)
    target_market = _build_target_market(delivery_mode_text, user_params, realism_level)
    revenue_model = revenue_pattern_text if revenue_pattern_text else "Subscription or usage-based model"
    validation_score = _build_validation_score(weight, priority)
    timeline = _build_timeline(user_params.get("time_commitment", ""), delivery_mode_text, realism_level)
    why_this_fits = _build_why_this_fits(problem_text, solution_text, user_params, realism_level)
    details_markdown = _build_details_markdown(idea, industry_data, realism_level)
    
    structured_idea = {
        "id": idea_id,
        "index": idx,
        "title": title,
        "summary": summary,
        "target_market": target_market,
        "revenue_model": revenue_model,
        "validation_score": validation_score,
        "timeline": timeline,
        "why_this_fits": why_this_fits,
        "details_markdown": details_markdown
    }
    
    # CRITICAL: Validate that this is a concrete idea
    if not is_concrete_idea(title, summary):
        # Log warning but don't fail - we'll filter later
        import logging
        logger = logging.getLogger(__name__)
        logger.warning(f"Generated idea with potentially invalid title: '{title}' - will be filtered")
    
    return structured_idea


def synthesize_ideas(
    user_params: Dict[str, Any],
    industry_data: Dict[str, Any],
    num_ideas: int = 15,
    seed: Optional[int] = None,
    realism_level: int = 3
) -> List[Dict[str, Any]]:
    """
    Synthesize unique idea seeds from industry fragments using parameter mappings.
    
    Uses parameter_mappings to filter and weight fragments, then combines them
    into 10-20 unique idea seeds. Adds controlled randomness so different users
    see different ideas even with same parameters.
    
    Args:
        user_params: User input parameters
            - time_commitment: e.g., "<5", "10-20", "Full-time"
            - budget_range: e.g., "$0-1k", "$1k-5k", "$5k-10k", "$10k+"
            - risk_tolerance: e.g., "Very Low", "Low", "Medium", "High"
            - skill_strength: e.g., "Beginner", "Intermediate", "Advanced", "Expert"
            - goal_type: e.g., "Extra Income", "Side Business", "Full Business", "Scalable Startup"
            - work_style: e.g., "Solo", "Small Team", "Remote", "Hybrid", "In-Person"
        industry_data: Industry data loaded from loader
        num_ideas: Number of ideas to generate (10-20)
        seed: Optional random seed for reproducibility
        
    Returns:
        List of structured idea dictionaries:
        [
            {
                "id": "1_a4f06a16",
                "index": 1,
                "title": "Idea Title",
                "summary": "2-3 sentence value proposition",
                "target_market": "Target customers description",
                "revenue_model": "How money is earned",
                "validation_score": "7",
                "timeline": "4-8 weeks for MVP, 3-4 months to launch",
                "why_this_fits": "Why this idea fits the user",
                "details_markdown": "Markdown block with all idea details"
            },
            ...
        ]
    """
    if seed is not None:
        random.seed(seed)
    else:
        # Use a seed based on user params for consistency
        seed_str = str(sorted(user_params.items()))
        seed = hash(seed_str) % (2**31)
        random.seed(seed)
    
    # Extract user parameters
    time_commitment = user_params.get("time_commitment", "")
    budget_range = user_params.get("budget_range", "")
    risk_tolerance = user_params.get("risk_tolerance", "")
    skill_strength = user_params.get("skill_strength", "")
    goal_type = user_params.get("goal_type", "")
    preferred_work_style = user_params.get("preferred_work_style", "") or user_params.get("work_style", "")
    startup_style = user_params.get("startup_style", "")
    business_region = user_params.get("business_region", "")
    
    # Collect fragments for each parameter
    all_problems = []
    all_solutions = []
    all_delivery_modes = []
    all_revenue_patterns = []
    all_automation_patterns = []
    all_archetypes = []
    
    # Collect from each parameter mapping
    param_types = [
        ("time_commitment", time_commitment),
        ("budget_range", budget_range),
        ("risk_tolerance", risk_tolerance),
        ("skill_strength", skill_strength),
        ("goal_type", goal_type),
        ("preferred_work_style", preferred_work_style),
        ("startup_style", startup_style),
        ("business_region", business_region),
    ]
    
    for param_type, param_value in param_types:
        if not param_value:
            continue
        
        # Get fragments for each type
        problems = _get_fragments_for_param(industry_data, param_type, param_value, "problems")
        solutions = _get_fragments_for_param(industry_data, param_type, param_value, "solutions")
        delivery_modes = _get_fragments_for_param(industry_data, param_type, param_value, "delivery_modes")
        revenue_patterns = _get_fragments_for_param(industry_data, param_type, param_value, "revenue_patterns")
        automation_patterns = _get_fragments_for_param(industry_data, param_type, param_value, "automation_patterns")
        
        # Get archetypes
        param_mappings = industry_data.get("parameter_mappings", {})
        param_dict = param_mappings.get(param_type, {})
        if param_value in param_dict:
            archetypes = param_dict[param_value].get("archetypes", [])
            all_archetypes.extend(archetypes)
        
        # Merge (avoid duplicates by ID)
        def merge_fragments(existing, new):
            existing_ids = {f.get("id") if isinstance(f, dict) else f: None for f in existing}
            for frag in new:
                frag_obj = _normalize_fragment_ref(frag)
                frag_id = frag_obj.get("id")
                if frag_id and frag_id not in existing_ids:
                    existing.append(frag_obj)
                    existing_ids[frag_id] = None
        
        merge_fragments(all_problems, problems)
        merge_fragments(all_solutions, solutions)
        merge_fragments(all_delivery_modes, delivery_modes)
        merge_fragments(all_revenue_patterns, revenue_patterns)
        merge_fragments(all_automation_patterns, automation_patterns)
    
    # Remove duplicate archetypes
    all_archetypes = list(set(all_archetypes))
    
    # If no fragments found, fallback to all fragments
    if not all_problems:
        idea_fragments = industry_data.get("idea_fragments", {})
        all_problems = [{"id": f.get("id"), "weight": 3, "priority": "medium"} 
                       for f in idea_fragments.get("problems", [])]
    if not all_solutions:
        idea_fragments = industry_data.get("idea_fragments", {})
        all_solutions = [{"id": f.get("id"), "weight": 3, "priority": "medium"} 
                        for f in idea_fragments.get("solutions", [])]
    if not all_delivery_modes:
        idea_fragments = industry_data.get("idea_fragments", {})
        all_delivery_modes = [{"id": f.get("id"), "weight": 3, "priority": "medium"} 
                             for f in idea_fragments.get("delivery_modes", [])]
    if not all_revenue_patterns:
        idea_fragments = industry_data.get("idea_fragments", {})
        all_revenue_patterns = [{"id": f.get("id"), "weight": 3, "priority": "medium"} 
                               for f in idea_fragments.get("revenue_patterns", [])]
    if not all_automation_patterns:
        idea_fragments = industry_data.get("idea_fragments", {})
        all_automation_patterns = [{"id": f.get("id"), "weight": 3, "priority": "medium"} 
                                 for f in idea_fragments.get("automation_patterns", [])]
    
    # Apply skill-based weighting to boost fragments matching user skills
    user_skills = user_params.get("skills", {})
    if user_skills:
        all_problems = _apply_skill_weighting(all_problems, user_skills, industry_data)
        all_solutions = _apply_skill_weighting(all_solutions, user_skills, industry_data)
        all_delivery_modes = _apply_skill_weighting(all_delivery_modes, user_skills, industry_data)
        all_revenue_patterns = _apply_skill_weighting(all_revenue_patterns, user_skills, industry_data)
        all_automation_patterns = _apply_skill_weighting(all_automation_patterns, user_skills, industry_data)
    
    # Generate unique combinations
    ideas = []
    used_combinations = set()
    
    # Select fragments with weighted probability
    selected_problems = _select_fragments_by_weight(all_problems, min_count=2, max_count=5, seed=seed)
    selected_solutions = _select_fragments_by_weight(all_solutions, min_count=2, max_count=5, seed=seed)
    selected_delivery_modes = _select_fragments_by_weight(all_delivery_modes, min_count=1, max_count=3, seed=seed)
    selected_revenue_patterns = _select_fragments_by_weight(all_revenue_patterns, min_count=1, max_count=3, seed=seed)
    selected_automation_patterns = _select_fragments_by_weight(all_automation_patterns, min_count=1, max_count=3, seed=seed)
    
    # Generate combinations
    attempts = 0
    max_attempts = num_ideas * 10
    
    while len(ideas) < num_ideas and attempts < max_attempts:
        attempts += 1
        
        # Randomly select one from each category
        problem_id = random.choice(selected_problems) if selected_problems else None
        solution_id = random.choice(selected_solutions) if selected_solutions else None
        delivery_id = random.choice(selected_delivery_modes) if selected_delivery_modes else None
        revenue_id = random.choice(selected_revenue_patterns) if selected_revenue_patterns else None
        automation_id = random.choice(selected_automation_patterns) if selected_automation_patterns else None
        
        # Create combination key
        combo_key = (problem_id, solution_id, delivery_id, revenue_id, automation_id)
        
        if combo_key in used_combinations:
            continue
        
        used_combinations.add(combo_key)
        
        # Get fragment texts
        problem_text = _get_fragment_text(industry_data, "problems", problem_id) if problem_id else ""
        solution_text = _get_fragment_text(industry_data, "solutions", solution_id) if solution_id else ""
        delivery_text = _get_fragment_text(industry_data, "delivery_modes", delivery_id) if delivery_id else ""
        revenue_text = _get_fragment_text(industry_data, "revenue_patterns", revenue_id) if revenue_id else ""
        automation_text = _get_fragment_text(industry_data, "automation_patterns", automation_id) if automation_id else ""
        
        # Calculate average weight and priority
        weights = []
        priorities = []
        for frag_list, frag_id in [(all_problems, problem_id), (all_solutions, solution_id),
                                   (all_delivery_modes, delivery_id), (all_revenue_patterns, revenue_id),
                                   (all_automation_patterns, automation_id)]:
            for frag in frag_list:
                if isinstance(frag, dict) and frag.get("id") == frag_id:
                    weights.append(frag.get("weight", 3))
                    priorities.append(frag.get("priority", "medium"))
                    break
        
        avg_weight = sum(weights) / len(weights) if weights else 3
        priority_counts = {"high": 0, "medium": 0, "low": 0}
        for p in priorities:
            priority_counts[p] = priority_counts.get(p, 0) + 1
        dominant_priority = max(priority_counts.items(), key=lambda x: x[1])[0] if priorities else "medium"
        
        # Keep raw idea for details_markdown generation
        raw_idea = {
            "problem": problem_text,
            "solution": solution_text,
            "delivery_mode": delivery_text,
            "revenue_pattern": revenue_text,
            "automation_pattern": automation_text,
            "archetypes": random.sample(all_archetypes, min(2, len(all_archetypes))) if all_archetypes else [],
            "weight": round(avg_weight, 1),
            "priority": dominant_priority
        }
        
        ideas.append(raw_idea)
    
    logger.info(f"Generated {len(ideas)} unique idea seeds from fragments")
    
    # Transform all ideas to structured format
    structured_ideas = []
    for idx, raw_idea in enumerate(ideas, 1):
        structured_idea = _transform_to_structured_idea(
            idea=raw_idea,
            idx=idx,
            user_params=user_params,
            industry_data=industry_data,
            realism_level=realism_level
        )
        structured_ideas.append(structured_idea)
    
    # CRITICAL: Filter out framework terms and invalid ideas
    from app.utils.idea_validator import filter_valid_ideas
    valid_ideas = filter_valid_ideas(structured_ideas)
    
    # If we filtered out too many, log a warning
    if len(valid_ideas) < len(structured_ideas):
        logger.warning(f"Filtered {len(structured_ideas) - len(valid_ideas)} invalid ideas (framework terms)")
    
    # If we don't have enough valid ideas, try to generate more
    if len(valid_ideas) < num_ideas:
        logger.info(f"Only {len(valid_ideas)} valid ideas generated, requested {num_ideas}")
    
    return valid_ideas[:num_ideas]  # Return up to requested number

