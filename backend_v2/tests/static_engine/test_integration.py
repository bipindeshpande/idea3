"""
Integration test to verify static_engine works end-to-end.

This test simulates the actual workflow used by discovery_service.
"""
import pytest
import json
import sys
from pathlib import Path

# Add project root to path
project_root = Path(__file__).parent.parent.parent
sys.path.insert(0, str(project_root))

from app.static_engine.loader import load_industry_data
from app.static_engine.synthesizer import synthesize_ideas
from app.static_engine.report_builder import build_markdown_report


def test_end_to_end_workflow():
    """
    Test the complete workflow: load -> synthesize -> build report.
    
    This simulates what discovery_service does when using static engine.
    """
    # Step 1: Load industry data
    industry_key = "ai"
    industry_data = load_industry_data(industry_key)
    
    assert industry_data is not None, f"Failed to load industry data for '{industry_key}'"
    assert "idea_fragments" in industry_data, "Industry data missing idea_fragments"
    assert "parameter_mappings" in industry_data, "Industry data missing parameter_mappings"
    
    # Step 2: Prepare user parameters (simulating discovery inputs)
    user_params = {
        "time_commitment": "<5",
        "budget_range": "$0-1k",
        "risk_tolerance": "Very Low",
        "skill_strength": "Beginner",
        "goal_type": "Extra Income",
        "work_style": "Solo"
    }
    
    # Step 3: Synthesize ideas
    ideas = synthesize_ideas(
        user_params=user_params,
        industry_data=industry_data,
        num_ideas=15,
        seed=42  # Fixed seed for deterministic testing
    )
    
    assert len(ideas) >= 10, f"Expected at least 10 ideas, got {len(ideas)}"
    assert len(ideas) <= 20, f"Expected at most 20 ideas, got {len(ideas)}"
    
    # Verify ideas have required fields
    for idea in ideas:
        assert "problem" in idea
        assert "solution" in idea
        assert "delivery_mode" in idea
        assert "revenue_pattern" in idea
        assert "automation_pattern" in idea
    
    # Step 4: Prepare profile (simulating profile analysis output)
    profile = {
        "core_motivations": "User wants to build a scalable business with minimal time commitment",
        "operating_constraints": "Limited budget ($0-1k) and time (<5 hours/week)",
        "strengths_and_capabilities": "Beginner-level skills, comfortable working solo",
        "strategic_considerations": "Focus on low-risk, extra income opportunities",
        "viability_red_flags": "None identified for low-risk approach",
        "pathway_recommendation": "Start with MVP approach using existing tools"
    }
    
    # Step 5: Build report
    report = build_markdown_report(
        profile=profile,
        idea_list=ideas,
        industry_data=industry_data
    )
    
    assert len(report) > 0, "Report should not be empty"
    assert "Idea" in report or "idea" in report.lower(), "Report should contain ideas"
    
    # Verify report contains idea content
    for idea in ideas[:3]:  # Check first 3 ideas
        if idea.get("problem"):
            assert idea["problem"] in report, f"Report missing problem: {idea['problem']}"
    
    print(f"\n✅ End-to-end test passed!")
    print(f"   - Loaded industry: {industry_key}")
    print(f"   - Generated {len(ideas)} ideas")
    print(f"   - Report length: {len(report)} characters")
    print(f"   - First idea problem: {ideas[0].get('problem', 'N/A')[:50]}...")


def test_static_engine_vs_llm_fallback():
    """
    Verify that static engine works and LLM fallback is available.
    """
    # Test with existing industry
    industry_data = load_industry_data("ai")
    assert industry_data is not None, "Static engine should work for 'ai' industry"
    
    # Test with non-existent industry (should return None, triggering LLM fallback)
    industry_data_missing = load_industry_data("nonexistent_industry_xyz")
    assert industry_data_missing is None, "Non-existent industry should return None (triggers LLM fallback)"
    
    print("\n✅ Fallback mechanism verified:")
    print("   - Static engine works for existing industries")
    print("   - Returns None for missing industries (triggers LLM fallback)")


def test_parameter_mapping_resolution():
    """
    Verify that all parameter mappings resolve to valid fragment IDs.
    """
    industry_data = load_industry_data("ai")
    assert industry_data is not None
    
    idea_fragments = industry_data.get("idea_fragments", {})
    param_mappings = industry_data.get("parameter_mappings", {})
    
    # Collect all valid fragment IDs
    valid_ids = {}
    for frag_type, fragments in idea_fragments.items():
        valid_ids[frag_type] = {f.get("id") for f in fragments if isinstance(f, dict) and "id" in f}
    
    # Verify all parameter mapping references
    errors = []
    for param_type, param_dict in param_mappings.items():
        for param_value, mapping in param_dict.items():
            for frag_type in ["problems", "solutions", "delivery_modes", 
                             "revenue_patterns", "automation_patterns"]:
                fragments = mapping.get(frag_type, [])
                for frag_ref in fragments:
                    frag_id = frag_ref.get("id") if isinstance(frag_ref, dict) else frag_ref
                    if frag_id and frag_id not in valid_ids.get(frag_type, set()):
                        errors.append(
                            f"Invalid ID '{frag_id}' in {param_type}.{param_value}.{frag_type}"
                        )
    
    assert len(errors) == 0, f"Found {len(errors)} invalid fragment ID references:\n" + "\n".join(errors[:10])
    print(f"\n✅ All {sum(len(v) for v in valid_ids.values())} fragment IDs are valid")
    print(f"   - Verified all parameter mapping references")


if __name__ == "__main__":
    """Run integration tests directly."""
    print("="*60)
    print("STATIC ENGINE INTEGRATION TESTS")
    print("="*60)
    
    try:
        test_end_to_end_workflow()
        test_static_engine_vs_llm_fallback()
        test_parameter_mapping_resolution()
        print("\n" + "="*60)
        print("✅ ALL INTEGRATION TESTS PASSED")
        print("="*60)
    except Exception as e:
        print(f"\n❌ TEST FAILED: {e}")
        import traceback
        traceback.print_exc()
        exit(1)

