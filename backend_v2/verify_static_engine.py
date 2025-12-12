"""
Quick verification script to test static_engine functionality.

Run this to verify the static engine is working correctly.
"""
import sys
from pathlib import Path

# Add project root to path
project_root = Path(__file__).parent
sys.path.insert(0, str(project_root))

from app.static_engine.loader import load_industry_data
from app.static_engine.synthesizer import synthesize_ideas
from app.static_engine.report_builder import build_markdown_report


def main():
    print("="*60)
    print("STATIC ENGINE VERIFICATION")
    print("="*60)
    
    # Step 1: Load industry data
    print("\n1. Loading industry data...")
    industry_key = "ai"
    industry_data = load_industry_data(industry_key)
    
    if not industry_data:
        print(f"❌ FAILED: Could not load industry data for '{industry_key}'")
        print("   Make sure app/static_engine/static/industries/ai.json exists")
        return False
    
    print(f"   ✅ Loaded industry: {industry_key}")
    print(f"   - Business models: {len(industry_data.get('business_models', []))}")
    print(f"   - Problems: {len(industry_data.get('idea_fragments', {}).get('problems', []))}")
    print(f"   - Solutions: {len(industry_data.get('idea_fragments', {}).get('solutions', []))}")
    
    # Step 2: Test parameter mapping resolution
    print("\n2. Verifying parameter mappings...")
    idea_fragments = industry_data.get("idea_fragments", {})
    param_mappings = industry_data.get("parameter_mappings", {})
    
    valid_ids = {}
    for frag_type, fragments in idea_fragments.items():
        valid_ids[frag_type] = {f.get("id") for f in fragments if isinstance(f, dict) and "id" in f}
    
    errors = []
    for param_type, param_dict in param_mappings.items():
        for param_value, mapping in param_dict.items():
            for frag_type in ["problems", "solutions", "delivery_modes", 
                             "revenue_patterns", "automation_patterns"]:
                fragments = mapping.get(frag_type, [])
                for frag_ref in fragments:
                    frag_id = frag_ref.get("id") if isinstance(frag_ref, dict) else frag_ref
                    if frag_id and frag_id not in valid_ids.get(frag_type, set()):
                        errors.append(f"Invalid ID '{frag_id}' in {param_type}.{param_value}.{frag_type}")
    
    if errors:
        print(f"   ❌ FAILED: Found {len(errors)} invalid fragment ID references")
        for error in errors[:5]:
            print(f"      - {error}")
        if len(errors) > 5:
            print(f"      ... and {len(errors) - 5} more")
        return False
    
    print(f"   ✅ All parameter mappings resolve to valid IDs")
    
    # Step 3: Synthesize ideas
    print("\n3. Synthesizing ideas...")
    user_params = {
        "time_commitment": "<5",
        "budget_range": "$0-1k",
        "risk_tolerance": "Very Low",
        "skill_strength": "Beginner",
        "goal_type": "Extra Income",
        "work_style": "Solo"
    }
    
    ideas = synthesize_ideas(
        user_params=user_params,
        industry_data=industry_data,
        num_ideas=15,
        seed=42
    )
    
    if len(ideas) < 10 or len(ideas) > 20:
        print(f"   ❌ FAILED: Expected 10-20 ideas, got {len(ideas)}")
        return False
    
    print(f"   ✅ Generated {len(ideas)} unique ideas")
    
    # Check uniqueness
    combinations = set()
    for idea in ideas:
        combo = (
            idea.get("problem"),
            idea.get("solution"),
            idea.get("delivery_mode"),
            idea.get("revenue_pattern"),
            idea.get("automation_pattern")
        )
        if combo in combinations:
            print(f"   ❌ FAILED: Found duplicate idea combination")
            return False
        combinations.add(combo)
    
    print(f"   ✅ All ideas are unique")
    print(f"   - Sample idea: {ideas[0].get('problem', 'N/A')[:50]}...")
    
    # Step 4: Build report
    print("\n4. Building markdown report...")
    profile = {
        "core_motivations": "User wants to build a scalable business",
        "operating_constraints": "Limited budget and time",
        "strengths_and_capabilities": "Strong technical skills",
        "strategic_considerations": "Focus on automation",
        "viability_red_flags": "None identified",
        "pathway_recommendation": "Start with MVP approach"
    }
    
    report = build_markdown_report(
        profile=profile,
        idea_list=ideas,
        industry_data=industry_data
    )
    
    if len(report) < 100:
        print(f"   ❌ FAILED: Report too short ({len(report)} chars)")
        return False
    
    if "Idea" not in report and "idea" not in report.lower():
        print(f"   ❌ FAILED: Report missing ideas section")
        return False
    
    print(f"   ✅ Report generated ({len(report)} characters)")
    print(f"   - Contains ideas: {'Idea' in report or 'idea' in report.lower()}")
    print(f"   - Contains profile: {'Core Motivations' in report or 'Profile' in report}")
    print(f"   - Contains context: {'Context' in report or 'Value Propositions' in report}")
    
    # Step 5: Test determinism
    print("\n5. Testing determinism...")
    ideas2 = synthesize_ideas(
        user_params=user_params,
        industry_data=industry_data,
        num_ideas=15,
        seed=42  # Same seed
    )
    
    if len(ideas) != len(ideas2):
        print(f"   ❌ FAILED: Different number of ideas with same seed")
        return False
    
    if ideas != ideas2:
        print(f"   ❌ FAILED: Different ideas with same seed (non-deterministic)")
        return False
    
    print(f"   ✅ Deterministic output verified (same seed = same output)")
    
    # Summary
    print("\n" + "="*60)
    print("✅ ALL VERIFICATIONS PASSED")
    print("="*60)
    print("\nThe static_engine is working correctly!")
    print("\nTo use it in discovery_service:")
    print("  - Industry data must exist in app/static_engine/static/industries/")
    print("  - discovery_service will automatically use static engine if data exists")
    print("  - Falls back to LLM if static data is missing")
    
    return True


if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)


