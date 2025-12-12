"""
Tests for synthesizer.py module.

Validates idea synthesis, uniqueness, and deterministic output.
"""
import pytest
from app.static_engine.synthesizer import (
    synthesize_ideas,
    _get_fragments_for_param,
    _normalize_fragment_ref,
    _select_fragments_by_weight
)


@pytest.fixture
def sample_industry_data():
    """Create sample industry data with diverse fragments."""
    return {
        "idea_fragments": {
            "problems": [
                {"id": "problem_1", "text": "Problem 1"},
                {"id": "problem_2", "text": "Problem 2"},
                {"id": "problem_3", "text": "Problem 3"},
                {"id": "problem_4", "text": "Problem 4"},
                {"id": "problem_5", "text": "Problem 5"},
                {"id": "problem_6", "text": "Problem 6"},
                {"id": "problem_7", "text": "Problem 7"},
                {"id": "problem_8", "text": "Problem 8"},
                {"id": "problem_9", "text": "Problem 9"},
                {"id": "problem_10", "text": "Problem 10"},
                {"id": "problem_11", "text": "Problem 11"},
                {"id": "problem_12", "text": "Problem 12"},
            ],
            "solutions": [
                {"id": "solution_1", "text": "Solution 1"},
                {"id": "solution_2", "text": "Solution 2"},
                {"id": "solution_3", "text": "Solution 3"},
                {"id": "solution_4", "text": "Solution 4"},
                {"id": "solution_5", "text": "Solution 5"},
                {"id": "solution_6", "text": "Solution 6"},
                {"id": "solution_7", "text": "Solution 7"},
                {"id": "solution_8", "text": "Solution 8"},
                {"id": "solution_9", "text": "Solution 9"},
                {"id": "solution_10", "text": "Solution 10"},
                {"id": "solution_11", "text": "Solution 11"},
                {"id": "solution_12", "text": "Solution 12"},
            ],
            "delivery_modes": [
                {"id": "delivery_1", "text": "Delivery 1"},
                {"id": "delivery_2", "text": "Delivery 2"},
                {"id": "delivery_3", "text": "Delivery 3"},
                {"id": "delivery_4", "text": "Delivery 4"},
                {"id": "delivery_5", "text": "Delivery 5"},
                {"id": "delivery_6", "text": "Delivery 6"},
            ],
            "revenue_patterns": [
                {"id": "revenue_1", "text": "Revenue 1"},
                {"id": "revenue_2", "text": "Revenue 2"},
                {"id": "revenue_3", "text": "Revenue 3"},
                {"id": "revenue_4", "text": "Revenue 4"},
                {"id": "revenue_5", "text": "Revenue 5"},
                {"id": "revenue_6", "text": "Revenue 6"},
            ],
            "automation_patterns": [
                {"id": "auto_1", "text": "Auto 1"},
                {"id": "auto_2", "text": "Auto 2"},
                {"id": "auto_3", "text": "Auto 3"},
                {"id": "auto_4", "text": "Auto 4"},
                {"id": "auto_5", "text": "Auto 5"},
                {"id": "auto_6", "text": "Auto 6"},
            ]
        },
        "parameter_mappings": {
            "time_commitment": {
                "<5": {
                    "problems": [
                        {"id": "problem_1", "weight": 5, "priority": "high"},
                        {"id": "problem_2", "weight": 4, "priority": "medium"},
                        {"id": "problem_3", "weight": 3, "priority": "low"}
                    ],
                    "solutions": [
                        {"id": "solution_1", "weight": 5, "priority": "high"},
                        {"id": "solution_2", "weight": 4, "priority": "medium"}
                    ],
                    "delivery_modes": [
                        {"id": "delivery_1", "weight": 5, "priority": "high"},
                        {"id": "delivery_2", "weight": 4, "priority": "medium"}
                    ],
                    "revenue_patterns": [
                        {"id": "revenue_1", "weight": 5, "priority": "high"},
                        {"id": "revenue_2", "weight": 4, "priority": "medium"}
                    ],
                    "automation_patterns": [
                        {"id": "auto_1", "weight": 5, "priority": "high"},
                        {"id": "auto_2", "weight": 4, "priority": "medium"}
                    ],
                    "archetypes": ["tool", "analytics"]
                },
                "10-20": {
                    "problems": [
                        {"id": "problem_4", "weight": 5, "priority": "high"},
                        {"id": "problem_5", "weight": 4, "priority": "medium"}
                    ],
                    "solutions": [
                        {"id": "solution_3", "weight": 5, "priority": "high"},
                        {"id": "solution_4", "weight": 4, "priority": "medium"}
                    ],
                    "delivery_modes": [
                        {"id": "delivery_3", "weight": 5, "priority": "high"}
                    ],
                    "revenue_patterns": [
                        {"id": "revenue_3", "weight": 5, "priority": "high"}
                    ],
                    "automation_patterns": [
                        {"id": "auto_3", "weight": 5, "priority": "high"}
                    ],
                    "archetypes": ["service"]
                }
            },
            "budget_range": {
                "$0-1k": {
                    "problems": [
                        {"id": "problem_1", "weight": 5, "priority": "high"},
                        {"id": "problem_6", "weight": 4, "priority": "medium"}
                    ],
                    "solutions": [
                        {"id": "solution_1", "weight": 5, "priority": "high"},
                        {"id": "solution_6", "weight": 4, "priority": "medium"}
                    ],
                    "delivery_modes": [
                        {"id": "delivery_1", "weight": 5, "priority": "high"}
                    ],
                    "revenue_patterns": [
                        {"id": "revenue_1", "weight": 5, "priority": "high"}
                    ],
                    "automation_patterns": [
                        {"id": "auto_1", "weight": 5, "priority": "high"}
                    ],
                    "archetypes": ["tool"]
                }
            },
            "risk_tolerance": {
                "Very Low": {
                    "problems": [{"id": "problem_1", "weight": 5, "priority": "high"}],
                    "solutions": [{"id": "solution_1", "weight": 5, "priority": "high"}],
                    "delivery_modes": [{"id": "delivery_1", "weight": 4, "priority": "medium"}],
                    "revenue_patterns": [{"id": "revenue_1", "weight": 5, "priority": "high"}],
                    "automation_patterns": [{"id": "auto_1", "weight": 4, "priority": "medium"}],
                    "archetypes": ["tool"]
                }
            },
            "skill_strength": {
                "Beginner": {
                    "problems": [{"id": "problem_1", "weight": 5, "priority": "high"}],
                    "solutions": [{"id": "solution_1", "weight": 5, "priority": "high"}],
                    "delivery_modes": [{"id": "delivery_1", "weight": 4, "priority": "medium"}],
                    "revenue_patterns": [{"id": "revenue_1", "weight": 5, "priority": "high"}],
                    "automation_patterns": [{"id": "auto_1", "weight": 4, "priority": "medium"}],
                    "archetypes": ["tool"]
                }
            },
            "goal_type": {
                "Extra Income": {
                    "problems": [{"id": "problem_1", "weight": 5, "priority": "high"}],
                    "solutions": [{"id": "solution_1", "weight": 5, "priority": "high"}],
                    "delivery_modes": [{"id": "delivery_1", "weight": 4, "priority": "medium"}],
                    "revenue_patterns": [{"id": "revenue_1", "weight": 5, "priority": "high"}],
                    "automation_patterns": [{"id": "auto_1", "weight": 4, "priority": "medium"}],
                    "archetypes": ["tool"]
                }
            },
            "work_style": {
                "Solo": {
                    "problems": [{"id": "problem_1", "weight": 5, "priority": "high"}],
                    "solutions": [{"id": "solution_1", "weight": 5, "priority": "high"}],
                    "delivery_modes": [{"id": "delivery_1", "weight": 4, "priority": "medium"}],
                    "revenue_patterns": [{"id": "revenue_1", "weight": 5, "priority": "high"}],
                    "automation_patterns": [{"id": "auto_1", "weight": 4, "priority": "medium"}],
                    "archetypes": ["tool"]
                }
            }
        },
        "archetypes": [
            {"id": "tool", "label": "AI Tool"},
            {"id": "analytics", "label": "Analytics Service"},
            {"id": "service", "label": "Service"}
        ]
    }


class TestIdeaSynthesis:
    """Test idea synthesis functionality."""
    
    def test_synthesize_produces_10_to_20_ideas(self, sample_industry_data):
        """Synthesize should produce 10-20 unique ideas."""
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
            industry_data=sample_industry_data,
            num_ideas=15
        )
        
        assert len(ideas) >= 10, f"Expected at least 10 ideas, got {len(ideas)}"
        assert len(ideas) <= 20, f"Expected at most 20 ideas, got {len(ideas)}"
    
    def test_synthesize_produces_unique_ideas(self, sample_industry_data):
        """All synthesized ideas should be unique."""
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
            industry_data=sample_industry_data,
            num_ideas=15,
            seed=42
        )
        
        # Check uniqueness by combination
        combinations = set()
        for idea in ideas:
            combo = (
                idea.get("problem"),
                idea.get("solution"),
                idea.get("delivery_mode"),
                idea.get("revenue_pattern"),
                idea.get("automation_pattern")
            )
            assert combo not in combinations, f"Duplicate idea found: {combo}"
            combinations.add(combo)
    
    def test_deterministic_output_with_fixed_seed(self, sample_industry_data):
        """Same seed should produce same output."""
        user_params = {
            "time_commitment": "<5",
            "budget_range": "$0-1k",
            "risk_tolerance": "Very Low",
            "skill_strength": "Beginner",
            "goal_type": "Extra Income",
            "work_style": "Solo"
        }
        
        ideas1 = synthesize_ideas(
            user_params=user_params,
            industry_data=sample_industry_data,
            num_ideas=15,
            seed=12345
        )
        
        ideas2 = synthesize_ideas(
            user_params=user_params,
            industry_data=sample_industry_data,
            num_ideas=15,
            seed=12345
        )
        
        # Should produce identical results
        assert len(ideas1) == len(ideas2)
        for i, (idea1, idea2) in enumerate(zip(ideas1, ideas2)):
            assert idea1 == idea2, f"Idea {i} differs: {idea1} != {idea2}"
    
    def test_different_seeds_produce_different_output(self, sample_industry_data):
        """Different seeds should produce different output."""
        user_params = {
            "time_commitment": "<5",
            "budget_range": "$0-1k",
            "risk_tolerance": "Very Low",
            "skill_strength": "Beginner",
            "goal_type": "Extra Income",
            "work_style": "Solo"
        }
        
        ideas1 = synthesize_ideas(
            user_params=user_params,
            industry_data=sample_industry_data,
            num_ideas=15,
            seed=11111
        )
        
        ideas2 = synthesize_ideas(
            user_params=user_params,
            industry_data=sample_industry_data,
            num_ideas=15,
            seed=22222
        )
        
        # Should produce different results (with high probability)
        # Check if at least one idea differs
        different = False
        for idea1, idea2 in zip(ideas1, ideas2):
            if idea1 != idea2:
                different = True
                break
        
        # With different seeds, results should differ (very high probability)
        assert different or len(ideas1) != len(ideas2), \
            "Different seeds should produce different results"
    
    def test_ideas_have_required_fields(self, sample_industry_data):
        """All ideas should have required fields."""
        user_params = {
            "time_commitment": "<5",
            "budget_range": "$0-1k"
        }
        
        ideas = synthesize_ideas(
            user_params=user_params,
            industry_data=sample_industry_data,
            num_ideas=10,
            seed=42
        )
        
        required_fields = ["problem", "solution", "delivery_mode", 
                          "revenue_pattern", "automation_pattern"]
        
        for idea in ideas:
            for field in required_fields:
                assert field in idea, f"Missing field {field} in idea"
                # Field should have a value (even if empty string)
                assert idea[field] is not None
    
    def test_ideas_use_valid_fragment_ids(self, sample_industry_data):
        """All idea fragments should reference valid IDs."""
        user_params = {
            "time_commitment": "<5",
            "budget_range": "$0-1k"
        }
        
        ideas = synthesize_ideas(
            user_params=user_params,
            industry_data=sample_industry_data,
            num_ideas=10,
            seed=42
        )
        
        # Collect all valid fragment IDs
        valid_ids = {}
        for frag_type, fragments in sample_industry_data["idea_fragments"].items():
            valid_ids[frag_type] = {f["id"] for f in fragments}
        
        # Verify all idea texts come from valid fragments
        for idea in ideas:
            # Check that texts match fragment texts
            for frag_type in ["problems", "solutions", "delivery_modes", 
                             "revenue_patterns", "automation_patterns"]:
                idea_text = idea.get(frag_type.replace("_", "_").replace("problems", "problem")
                                    .replace("solutions", "solution")
                                    .replace("delivery_modes", "delivery_mode")
                                    .replace("revenue_patterns", "revenue_pattern")
                                    .replace("automation_patterns", "automation_pattern"))
                
                if idea_text:
                    # Find matching fragment
                    found = False
                    for frag in sample_industry_data["idea_fragments"][frag_type]:
                        if frag["text"] == idea_text:
                            found = True
                            assert frag["id"] in valid_ids[frag_type]
                            break
                    
                    # Text should come from a valid fragment
                    assert found, f"Text '{idea_text}' not found in {frag_type} fragments"


class TestFragmentSelection:
    """Test fragment selection and weighting."""
    
    def test_get_fragments_for_param(self, sample_industry_data):
        """Should retrieve fragments for specific parameter."""
        fragments = _get_fragments_for_param(
            sample_industry_data,
            "time_commitment",
            "<5",
            "problems"
        )
        
        assert len(fragments) > 0
        assert all(isinstance(f, dict) for f in fragments)
        assert all("id" in f for f in fragments)
    
    def test_normalize_fragment_ref_string_id(self):
        """Should convert string ID to object format."""
        result = _normalize_fragment_ref("problem_1")
        assert result == {"id": "problem_1", "weight": 3, "priority": "medium"}
    
    def test_normalize_fragment_ref_object(self):
        """Should preserve object format."""
        original = {"id": "problem_1", "weight": 5, "priority": "high"}
        result = _normalize_fragment_ref(original)
        assert result == original
    
    def test_select_fragments_by_weight(self):
        """Should select fragments based on weight and priority."""
        fragments = [
            {"id": "frag_1", "weight": 5, "priority": "high"},
            {"id": "frag_2", "weight": 4, "priority": "medium"},
            {"id": "frag_3", "weight": 3, "priority": "low"},
            {"id": "frag_4", "weight": 2, "priority": "low"},
        ]
        
        selected = _select_fragments_by_weight(
            fragments,
            min_count=2,
            max_count=3,
            seed=42
        )
        
        assert len(selected) >= 2
        assert len(selected) <= 3
        assert all(isinstance(sid, str) for sid in selected)
        # High weight fragments should be more likely to be selected
        assert "frag_1" in selected  # Highest weight should be selected


class TestParameterMappingResolution:
    """Test that parameter mappings resolve to valid IDs."""
    
    def test_all_mapping_ids_exist_in_fragments(self, sample_industry_data):
        """All IDs in parameter mappings should exist in idea_fragments."""
        idea_fragments = sample_industry_data["idea_fragments"]
        param_mappings = sample_industry_data["parameter_mappings"]
        
        # Collect all fragment IDs by type
        fragment_ids = {}
        for frag_type, fragments in idea_fragments.items():
            fragment_ids[frag_type] = {f["id"] for f in fragments}
        
        # Check all parameter mapping references
        for param_type, param_dict in param_mappings.items():
            for param_value, mapping in param_dict.items():
                for frag_type in ["problems", "solutions", "delivery_modes",
                                 "revenue_patterns", "automation_patterns"]:
                    fragments = mapping.get(frag_type, [])
                    for frag_ref in fragments:
                        frag_id = frag_ref.get("id") if isinstance(frag_ref, dict) else frag_ref
                        assert frag_id in fragment_ids.get(frag_type, set()), \
                            f"ID {frag_id} in {param_type}.{param_value}.{frag_type} " \
                            f"not found in idea_fragments.{frag_type}"

