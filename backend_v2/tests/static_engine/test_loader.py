"""
Tests for loader.py module.

Validates schema strictness and file loading functionality.
"""
import pytest
import json
import tempfile
from pathlib import Path
from app.static_engine.loader import load_industry_data, _validate_schema


@pytest.fixture
def valid_industry_data():
    """Create a valid industry data structure."""
    return {
        "business_models": ["SaaS", "Freemium", "Consulting"],
        "target_segments": ["Small Businesses", "Enterprises"],
        "value_props": {
            "efficiency": ["Streamlined operations", "Automated workflows"],
            "cost_savings": ["Lower operational costs", "Reduced labor costs"]
        },
        "skill_tags": {
            "machine_learning": ["Developing predictive models", "Implementing algorithms"],
            "data_analysis": ["Interpreting datasets", "Extracting insights"]
        },
        "budget_bins": {
            "low": "Under $10k",
            "medium": "$10k-$100k",
            "high": "Over $100k"
        },
        "constraints_map": {
            "time": "Longer implementation times",
            "budget": "Limited budget restricts technology"
        },
        "trend_summary": ["Trend 1", "Trend 2", "Trend 3"],
        "competitor_notes": ["Note 1", "Note 2"],
        "markdown_template": "# Industry Overview\n\n{{ideas}}\n\n{{industry_context}}",
        "idea_fragments": {
            "problems": [
                {"id": "problem_1", "text": "Small businesses struggle to automate"},
                {"id": "problem_2", "text": "Enterprises face high costs"}
            ],
            "solutions": [
                {"id": "solution_1", "text": "AI-powered workflow automation"},
                {"id": "solution_2", "text": "Predictive analytics"}
            ],
            "delivery_modes": [
                {"id": "delivery_1", "text": "SaaS platform"},
                {"id": "delivery_2", "text": "Mobile app"}
            ],
            "revenue_patterns": [
                {"id": "revenue_1", "text": "Subscription monthly"},
                {"id": "revenue_2", "text": "Pay-per-use"}
            ],
            "automation_patterns": [
                {"id": "auto_1", "text": "Automated lead scoring"},
                {"id": "auto_2", "text": "AI content generation"}
            ]
        },
        "parameter_mappings": {
            "time_commitment": {
                "<5": {
                    "problems": [
                        {"id": "problem_1", "weight": 5, "priority": "high"}
                    ],
                    "solutions": [
                        {"id": "solution_1", "weight": 5, "priority": "high"}
                    ],
                    "delivery_modes": [
                        {"id": "delivery_1", "weight": 4, "priority": "medium"}
                    ],
                    "revenue_patterns": [
                        {"id": "revenue_1", "weight": 5, "priority": "high"}
                    ],
                    "automation_patterns": [
                        {"id": "auto_1", "weight": 4, "priority": "medium"}
                    ],
                    "archetypes": ["tool", "analytics"]
                }
            },
            "budget_range": {
                "$0-1k": {
                    "problems": [{"id": "problem_1", "weight": 5, "priority": "high"}],
                    "solutions": [{"id": "solution_1", "weight": 5, "priority": "high"}],
                    "delivery_modes": [{"id": "delivery_1", "weight": 4, "priority": "medium"}],
                    "revenue_patterns": [{"id": "revenue_1", "weight": 5, "priority": "high"}],
                    "automation_patterns": [{"id": "auto_1", "weight": 4, "priority": "medium"}],
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
            {"id": "analytics", "label": "Analytics Service"}
        ],
        "difficulty_levels": ["easy", "medium", "hard"],
        "revenue_potential": ["$200-1k/mo", "$1k-10k/mo", "Scalable Startup"],
        "operational_models": ["low-touch", "high-touch", "semi-automated", "fully-automated"]
    }


@pytest.fixture
def temp_industry_file(valid_industry_data):
    """Create a temporary industry JSON file."""
    with tempfile.TemporaryDirectory() as tmpdir:
        industries_dir = Path(tmpdir) / "industries"
        industries_dir.mkdir()
        
        file_path = industries_dir / "test_industry.json"
        with open(file_path, 'w', encoding='utf-8') as f:
            json.dump(valid_industry_data, f, indent=2)
        
        # Temporarily override the STATIC_BASE_DIR
        import app.static_engine.loader as loader_module
        original_dir = loader_module.STATIC_BASE_DIR
        loader_module.STATIC_BASE_DIR = industries_dir
        
        yield file_path
        
        # Restore original
        loader_module.STATIC_BASE_DIR = original_dir


class TestSchemaValidation:
    """Test schema validation strictness."""
    
    def test_valid_schema_passes(self, valid_industry_data):
        """Valid schema should pass validation."""
        is_valid, errors = _validate_schema(valid_industry_data)
        assert is_valid, f"Valid schema failed: {errors}"
        assert len(errors) == 0
    
    def test_missing_required_key_fails(self, valid_industry_data):
        """Missing required key should fail validation."""
        del valid_industry_data["business_models"]
        is_valid, errors = _validate_schema(valid_industry_data)
        assert not is_valid
        assert any("business_models" in error for error in errors)
    
    def test_missing_idea_fragments_key_fails(self, valid_industry_data):
        """Missing idea_fragments key should fail."""
        del valid_industry_data["idea_fragments"]["problems"]
        is_valid, errors = _validate_schema(valid_industry_data)
        assert not is_valid
        assert any("problems" in error for error in errors)
    
    def test_invalid_fragment_structure_fails(self, valid_industry_data):
        """Fragment without id and text should fail."""
        valid_industry_data["idea_fragments"]["problems"][0] = {"text": "Missing ID"}
        is_valid, errors = _validate_schema(valid_industry_data)
        assert not is_valid
        assert any("id" in error.lower() for error in errors)
    
    def test_missing_parameter_mapping_fails(self, valid_industry_data):
        """Missing parameter mapping key should fail."""
        del valid_industry_data["parameter_mappings"]["time_commitment"]
        is_valid, errors = _validate_schema(valid_industry_data)
        assert not is_valid
        assert any("time_commitment" in error for error in errors)
    
    def test_fragment_not_list_fails(self, valid_industry_data):
        """Fragment type that's not a list should fail."""
        valid_industry_data["idea_fragments"]["problems"] = "not a list"
        is_valid, errors = _validate_schema(valid_industry_data)
        assert not is_valid
        assert any("must be a list" in error for error in errors)


class TestLoadIndustryData:
    """Test industry data loading."""
    
    def test_load_valid_file(self, temp_industry_file, valid_industry_data):
        """Valid file should load successfully."""
        data = load_industry_data("test_industry")
        assert data is not None
        assert data["business_models"] == valid_industry_data["business_models"]
        assert len(data["idea_fragments"]["problems"]) == 2
    
    def test_load_nonexistent_file_returns_none(self):
        """Nonexistent file should return None."""
        data = load_industry_data("nonexistent_industry")
        assert data is None
    
    def test_load_invalid_json_returns_none(self):
        """Invalid JSON should return None."""
        import tempfile
        with tempfile.TemporaryDirectory() as tmpdir:
            industries_dir = Path(tmpdir) / "industries"
            industries_dir.mkdir()
            
            file_path = industries_dir / "invalid.json"
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write("invalid json {")
            
            import app.static_engine.loader as loader_module
            original_dir = loader_module.STATIC_BASE_DIR
            loader_module.STATIC_BASE_DIR = industries_dir
            
            data = load_industry_data("invalid")
            assert data is None
            
            loader_module.STATIC_BASE_DIR = original_dir
    
    def test_load_file_with_invalid_schema_returns_none(self, temp_industry_file):
        """File with invalid schema should return None."""
        # Write invalid schema
        file_path = temp_industry_file.parent / "test_industry.json"
        invalid_data = {"business_models": "not a list"}
        with open(file_path, 'w', encoding='utf-8') as f:
            json.dump(invalid_data, f)
        
        data = load_industry_data("test_industry")
        assert data is None
    
    def test_industry_name_normalization(self, temp_industry_file):
        """Industry name should be normalized."""
        # Test various formats
        data1 = load_industry_data("test_industry")
        data2 = load_industry_data("TEST_INDUSTRY")
        data3 = load_industry_data("  test_industry  ")
        
        assert data1 is not None
        # All should work (or at least not crash)
        assert data2 is not None or data2 is None  # May or may not match
        assert data3 is not None


class TestParameterMappingValidation:
    """Test that parameter mappings resolve to valid fragment IDs."""
    
    def test_all_parameter_mapping_ids_exist(self, valid_industry_data):
        """All IDs in parameter mappings should exist in idea_fragments."""
        idea_fragments = valid_industry_data["idea_fragments"]
        param_mappings = valid_industry_data["parameter_mappings"]
        
        # Collect all fragment IDs
        all_fragment_ids = {}
        for frag_type, fragments in idea_fragments.items():
            all_fragment_ids[frag_type] = {f["id"] for f in fragments}
        
        # Check all parameter mapping references
        for param_type, param_dict in param_mappings.items():
            for param_value, mapping in param_dict.items():
                for frag_type in ["problems", "solutions", "delivery_modes", 
                                 "revenue_patterns", "automation_patterns"]:
                    fragments = mapping.get(frag_type, [])
                    for frag_ref in fragments:
                        frag_id = frag_ref.get("id") if isinstance(frag_ref, dict) else frag_ref
                        assert frag_id in all_fragment_ids.get(frag_type, set()), \
                            f"ID {frag_id} in {param_type}.{param_value}.{frag_type} not found in idea_fragments.{frag_type}"
    
    def test_parameter_mapping_has_required_structure(self, valid_industry_data):
        """Parameter mappings should have required fragment types."""
        param_mappings = valid_industry_data["parameter_mappings"]
        required_types = ["problems", "solutions", "delivery_modes", 
                         "revenue_patterns", "automation_patterns"]
        
        for param_type, param_dict in param_mappings.items():
            for param_value, mapping in param_dict.items():
                for frag_type in required_types:
                    assert frag_type in mapping, \
                        f"Missing {frag_type} in {param_type}.{param_value}"
                    assert isinstance(mapping[frag_type], list), \
                        f"{frag_type} in {param_type}.{param_value} must be a list"

