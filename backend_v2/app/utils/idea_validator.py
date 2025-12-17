"""
Idea Validator - Validates that generated ideas are concrete startup ideas,
not framework components or abstract concepts.
"""

from typing import Dict, Any, List, Optional
import re
import logging

logger = logging.getLogger(__name__)

# Framework terms that should NEVER appear as idea titles
FRAMEWORK_TERMS = {
    "business model", "business models",
    "target segment", "target segments", "customer segment", "customer segments",
    "value proposition", "value propositions",
    "revenue model", "revenue models",
    "market opportunity", "market opportunities",
    "customer persona", "customer personas",
    "go-to-market", "go to market", "gtm",
    "pricing strategy", "pricing strategies",
    "competitive analysis", "competitive landscape",
    "market research", "market analysis",
    "validation framework", "validation frameworks",
    "execution path", "execution plan",
    "risk mitigation", "risk assessment",
    "financial snapshot", "financial model",
    "timeline", "timelines",
    "decision checklist", "checklist",
    "next steps", "immediate next steps",
    "experiments", "validation questions",
    "key risks", "risks and mitigations",
    "customer persona", "target market",
    "delivery model", "delivery mode",
    "operational model", "operational models",
    "automation pattern", "automation patterns",
    "revenue pattern", "revenue patterns",
    "archetype", "archetypes",
    "framework", "frameworks",
    "strategy", "strategies",
    "methodology", "methodologies",
    "approach", "approaches",
    "concept", "concepts",
    "category", "categories",
    "type", "types",
    "model", "models",
    "system", "systems",
    "process", "processes",
    "method", "methods",
    "technique", "techniques",
    "tool", "tools",
    "platform", "platforms",
    "solution", "solutions",
    "service", "services",
    "product", "products",
}

# Abstract nouns that indicate framework components
ABSTRACT_NOUNS = {
    "analysis", "assessment", "evaluation", "review",
    "planning", "strategy", "plan", "roadmap",
    "framework", "structure", "architecture",
    "methodology", "approach", "method",
    "concept", "theory", "principle",
    "category", "classification", "taxonomy",
    "model", "template", "pattern",
    "system", "process", "workflow",
    "guide", "handbook", "manual",
    "checklist", "template", "blueprint"
}

# Words that indicate a concrete idea (must have at least one)
CONCRETE_INDICATORS = {
    "for", "help", "helps", "enable", "enables", "allows",
    "launch", "start", "create", "build", "develop",
    "provide", "provides", "offer", "offers", "deliver", "delivers",
    "connect", "connects", "match", "matches", "link", "links",
    "sell", "sells", "rent", "rents", "lease", "leases",
    "teach", "teaches", "train", "trains", "coach", "coaches",
    "cook", "cooks", "make", "makes", "design", "designs",
    "repair", "repairs", "fix", "fixes", "clean", "cleans",
    "deliver", "delivers", "ship", "ships", "transport", "transports"
}


def is_framework_term(text: str) -> bool:
    """
    Check if a text string is a framework term (e.g., "Business Models", "Target Segments").
    
    Args:
        text: Text to check (title, summary, etc.)
        
    Returns:
        True if text appears to be a framework term, False otherwise
    """
    if not text:
        return True
    
    text_lower = text.lower().strip()
    
    # Check against known framework terms
    for term in FRAMEWORK_TERMS:
        if term in text_lower:
            # Allow if it's part of a longer concrete phrase
            # e.g., "AI business model optimization tool" is OK, but "Business Models" is not
            if text_lower == term or text_lower.startswith(term + " ") or text_lower.endswith(" " + term):
                return True
    
    # Check if title is just an abstract noun
    words = text_lower.split()
    if len(words) <= 3:
        # Short titles that are just abstract nouns are likely framework terms
        if all(word in ABSTRACT_NOUNS for word in words):
            return True
        # If it's just one or two abstract nouns, it's likely a framework term
        if len(words) <= 2 and any(word in ABSTRACT_NOUNS for word in words):
            # Exception: if it contains a concrete indicator, it's OK
            if not any(indicator in text_lower for indicator in CONCRETE_INDICATORS):
                return True
    
    return False


def is_concrete_idea(title: str, summary: str = "") -> bool:
    """
    Check if an idea is concrete (has specific customer + problem + solution).
    
    A concrete idea must:
    1. NOT be a framework term
    2. Include a specific customer or target (who)
    3. Include a problem or need (what problem)
    4. Include a solution or offering (how)
    
    Args:
        title: Idea title
        summary: Idea summary (optional, helps validation)
        
    Returns:
        True if idea is concrete, False otherwise
    """
    if not title:
        return False
    
    # First check: is it a framework term?
    if is_framework_term(title):
        logger.warning(f"Rejected framework term as idea title: '{title}'")
        return False
    
    # Check if title follows pattern: [Who] + [Problem] + [Solution]
    # or at least has concrete indicators
    
    title_lower = title.lower()
    summary_lower = (summary or "").lower()
    combined = f"{title_lower} {summary_lower}"
    
    # Must have at least one concrete indicator
    has_concrete_indicator = any(indicator in combined for indicator in CONCRETE_INDICATORS)
    
    # Must NOT be just abstract nouns
    words = title_lower.split()
    is_just_abstract = len(words) <= 3 and all(word in ABSTRACT_NOUNS for word in words)
    
    if not has_concrete_indicator and is_just_abstract:
        logger.warning(f"Rejected abstract idea title: '{title}'")
        return False
    
    # Additional check: title should be descriptive, not just a category
    # Good: "Non-technical food founders launch cloud kitchens"
    # Bad: "Business Models" or "Target Segments"
    
    # If title is very short (1-2 words) and matches framework terms, reject
    if len(words) <= 2:
        if any(term in title_lower for term in ["model", "segment", "proposition", "framework", "strategy"]):
            logger.warning(f"Rejected short framework-like title: '{title}'")
            return False
    
    return True


def validate_idea(idea: Dict[str, Any]) -> bool:
    """
    Validate that an idea dictionary represents a concrete startup idea.
    
    Args:
        idea: Idea dictionary with 'title' and optionally 'summary'
        
    Returns:
        True if idea is valid, False otherwise
    """
    title = idea.get("title", "").strip()
    summary = idea.get("summary", "").strip()
    
    return is_concrete_idea(title, summary)


def filter_valid_ideas(ideas: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """
    Filter out framework terms and invalid ideas from a list.
    
    Args:
        ideas: List of idea dictionaries
        
    Returns:
        List of valid concrete ideas
    """
    valid_ideas = []
    rejected_count = 0
    
    for idea in ideas:
        if validate_idea(idea):
            valid_ideas.append(idea)
        else:
            rejected_count += 1
            logger.warning(f"Filtered out invalid idea: title='{idea.get('title', '')[:50]}'")
    
    if rejected_count > 0:
        logger.info(f"Filtered {rejected_count} invalid ideas, kept {len(valid_ideas)} valid ideas")
    
    return valid_ideas


def regenerate_title_from_fragments(problem_text: str, solution_text: str, delivery_mode_text: str = "") -> str:
    """
    Regenerate a concrete title from fragments, ensuring it's not a framework term.
    
    Args:
        problem_text: Problem description
        solution_text: Solution description
        delivery_mode_text: Delivery mode description
        
    Returns:
        Concrete title following pattern: [Who] + [Problem] + [Solution]
    """
    # Combine fragments to create a concrete title
    parts = []
    
    # Extract "who" from problem or solution
    # Look for customer indicators
    who_indicators = ["founders", "entrepreneurs", "businesses", "companies", "customers", "users", "clients"]
    who = None
    for indicator in who_indicators:
        if indicator in problem_text.lower():
            who = indicator
            break
        if indicator in solution_text.lower():
            who = indicator
            break
    
    # Extract problem (what they need)
    problem_clean = problem_text.strip().rstrip('.').lower()
    
    # Extract solution (how we help)
    solution_clean = solution_text.strip().rstrip('.').lower()
    
    # Build title: [Who] + [Solution] + [Problem context]
    if who:
        # Format: "Non-technical founders launch cloud kitchens"
        if solution_clean:
            # Use solution as main action
            title = f"{who.title()} {solution_clean}"
        else:
            title = f"{who.title()} {problem_clean}"
    else:
        # Fallback: use solution + problem
        if solution_clean and problem_clean:
            title = f"{solution_clean.title()} {problem_clean}"
        elif solution_clean:
            title = solution_clean.title()
        elif problem_clean:
            title = problem_clean.title()
        else:
            title = "Startup Idea"
    
    # Clean up title
    title = title.strip()
    # Remove trailing periods
    title = title.rstrip('.')
    # Capitalize properly
    words = title.split()
    if len(words) > 0:
        title = words[0].capitalize() + " " + " ".join(words[1:])
    
    # Ensure it's not a framework term
    if is_framework_term(title):
        # Try alternative: use delivery mode
        if delivery_mode_text:
            title = delivery_mode_text.strip().title()
        else:
            # Last resort: generic but concrete
            title = "Concrete Startup Opportunity"
    
    # Limit length
    if len(title) > 80:
        words = title.split()
        title = " ".join(words[:10])
    
    return title


