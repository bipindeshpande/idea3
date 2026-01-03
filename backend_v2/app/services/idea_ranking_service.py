"""
Idea Ranking Service - Ranks ideas based on profile match.
"""
import re
import copy
from typing import Dict, Any, List
from app.services.base_service import BaseService


class IdeaRankingService(BaseService):
    """Service for ranking ideas based on profile match."""
    
    def rank_ideas(
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
        ranked = []
        for idx, (score, idea) in enumerate(scored_ideas, 1):
            # Deep clone to prevent reference reuse
            ranked_idea = copy.deepcopy(idea)
            ranked_idea['index'] = idx
            ranked_idea['rank_score'] = score
            ranked.append(ranked_idea)
        
        self._log(f"Ranked {len(ranked)} ideas by profile match", "INFO")
        return ranked

