"""
Tests for discovery_utils.py module.

Tests industry name normalization and realism level determination.
"""
import pytest
from app.services.discovery_utils import normalize_industry_name, determine_realism_level


class TestNormalizeIndustryName:
    """Test normalize_industry_name function."""
    
    def test_normalize_food_and_beverage(self):
        """Should normalize food & beverage variations."""
        assert normalize_industry_name("food & beverage") == "food_and_beverage"
        assert normalize_industry_name("food and beverage") == "food_and_beverage"
        assert normalize_industry_name("food and beverages") == "food_and_beverage"
        assert normalize_industry_name("food_and_beverage") == "food_and_beverage"
        assert normalize_industry_name("meal prep") == "food_and_beverage"
        assert normalize_industry_name("meal preparation") == "food_and_beverage"
    
    def test_normalize_restaurant(self):
        """Should normalize restaurant variations."""
        assert normalize_industry_name("restaurant") == "restaurant"
        assert normalize_industry_name("restaurants") == "restaurant"
    
    def test_normalize_food_delivery(self):
        """Should normalize food delivery variations."""
        assert normalize_industry_name("food delivery") == "food_delivery"
        assert normalize_industry_name("fooddelivery") == "food_delivery"
        assert normalize_industry_name("food_delivery") == "food_delivery"
    
    def test_normalize_ai(self):
        """Should normalize AI & automation variations."""
        assert normalize_industry_name("ai") == "ai"
        assert normalize_industry_name("artificial intelligence") == "ai"
        assert normalize_industry_name("ai & automation") == "ai"
        assert normalize_industry_name("ai and automation") == "ai"
        assert normalize_industry_name("automation") == "ai"
    
    def test_normalize_fintech(self):
        """Should normalize finance/fintech variations."""
        assert normalize_industry_name("finance") == "fintech"
        assert normalize_industry_name("fintech") == "fintech"
        assert normalize_industry_name("financial technology") == "fintech"
        assert normalize_industry_name("finance / accounting") == "fintech"
        assert normalize_industry_name("finance/accounting") == "fintech"
        assert normalize_industry_name("accounting") == "fintech"
    
    def test_normalize_healthcare(self):
        """Should normalize healthcare variations."""
        assert normalize_industry_name("healthcare") == "healthcare"
        assert normalize_industry_name("health care") == "healthcare"
        assert normalize_industry_name("health & wellness") == "healthcare"
        assert normalize_industry_name("health and wellness") == "healthcare"
        assert normalize_industry_name("healthcare / wellness") == "healthcare"
        assert normalize_industry_name("beauty & wellness") == "healthcare"
    
    def test_normalize_healthtech(self):
        """Should normalize healthtech variations."""
        assert normalize_industry_name("health tech") == "healthtech"
        assert normalize_industry_name("healthtech") == "healthtech"
        assert normalize_industry_name("health technology") == "healthtech"
    
    def test_normalize_retail_ecommerce(self):
        """Should normalize retail & e-commerce variations."""
        assert normalize_industry_name("retail & e-commerce") == "retail_ecommerce"
        assert normalize_industry_name("retail and e-commerce") == "retail_ecommerce"
        assert normalize_industry_name("retail / e-commerce") == "retail_ecommerce"
        assert normalize_industry_name("retail/ecommerce") == "retail_ecommerce"
        assert normalize_industry_name("e-commerce") == "retail_ecommerce"
        assert normalize_industry_name("ecommerce") == "retail_ecommerce"
        assert normalize_industry_name("retail") == "retail_ecommerce"
    
    def test_normalize_education(self):
        """Should normalize education variations."""
        assert normalize_industry_name("education") == "education"
        assert normalize_industry_name("edtech") == "education"
        assert normalize_industry_name("education / edtech") == "education"
    
    def test_normalize_fitness_sports(self):
        """Should normalize fitness & sports variations."""
        assert normalize_industry_name("fitness & sports") == "fitness_sports"
        assert normalize_industry_name("fitness and sports") == "fitness_sports"
        assert normalize_industry_name("fitness / sports") == "fitness_sports"
        assert normalize_industry_name("fitness") == "fitness_sports"
        assert normalize_industry_name("sports") == "fitness_sports"
    
    def test_normalize_kids_parenting(self):
        """Should normalize kids & parenting variations."""
        assert normalize_industry_name("kids & parenting") == "kids_parenting"
        assert normalize_industry_name("kids and parenting") == "kids_parenting"
        assert normalize_industry_name("kids / parenting") == "kids_parenting"
        assert normalize_industry_name("parenting") == "kids_parenting"
    
    def test_normalize_home_services(self):
        """Should normalize home services variations."""
        assert normalize_industry_name("home services") == "home_services"
        assert normalize_industry_name("home service") == "home_services"
    
    def test_normalize_travel_tourism(self):
        """Should normalize travel & tourism variations."""
        assert normalize_industry_name("travel & tourism") == "travel_tourism"
        assert normalize_industry_name("travel and tourism") == "travel_tourism"
        assert normalize_industry_name("travel / tourism") == "travel_tourism"
        assert normalize_industry_name("travel") == "travel_tourism"
        assert normalize_industry_name("tourism") == "travel_tourism"
    
    def test_normalize_manufacturing_crafts(self):
        """Should normalize manufacturing / crafts variations."""
        assert normalize_industry_name("manufacturing / crafts") == "manufacturing_crafts"
        assert normalize_industry_name("manufacturing/crafts") == "manufacturing_crafts"
        assert normalize_industry_name("manufacturing") == "manufacturing_crafts"
        assert normalize_industry_name("crafts") == "manufacturing_crafts"
    
    def test_normalize_software_saas(self):
        """Should normalize software / SaaS variations."""
        assert normalize_industry_name("software / saas") == "software_saas"
        assert normalize_industry_name("software/saas") == "software_saas"
        assert normalize_industry_name("software") == "software_saas"
        assert normalize_industry_name("saas") == "software_saas"
    
    def test_normalize_freelancing_consulting(self):
        """Should normalize freelancing / consulting variations."""
        assert normalize_industry_name("freelancing / consulting") == "freelancing_consulting"
        assert normalize_industry_name("freelancing/consulting") == "freelancing_consulting"
        assert normalize_industry_name("freelancing") == "freelancing_consulting"
        assert normalize_industry_name("consulting") == "freelancing_consulting"
    
    def test_normalize_agriculture_gardening(self):
        """Should normalize agriculture / gardening variations."""
        assert normalize_industry_name("agriculture / gardening") == "agriculture_gardening"
        assert normalize_industry_name("agriculture/gardening") == "agriculture_gardening"
        assert normalize_industry_name("agriculture") == "agriculture_gardening"
        assert normalize_industry_name("gardening") == "agriculture_gardening"
    
    def test_normalize_social_impact(self):
        """Should normalize social impact variations."""
        assert normalize_industry_name("social impact") == "social_impact"
        assert normalize_industry_name("social impact / non-profit") == "social_impact"
        assert normalize_industry_name("non-profit") == "social_impact"
        assert normalize_industry_name("nonprofit") == "social_impact"
    
    def test_normalize_local_services(self):
        """Should normalize local services variations."""
        assert normalize_industry_name("local services") == "local_services"
        assert normalize_industry_name("local service") == "local_services"
    
    def test_normalize_other(self):
        """Should normalize 'other'."""
        assert normalize_industry_name("other") == "other"
    
    def test_normalize_case_insensitive(self):
        """Should handle case variations."""
        assert normalize_industry_name("AI") == "ai"
        assert normalize_industry_name("FinTech") == "fintech"
        assert normalize_industry_name("FOOD & BEVERAGE") == "food_and_beverage"
    
    def test_normalize_with_whitespace(self):
        """Should handle whitespace."""
        assert normalize_industry_name("  ai  ") == "ai"
        assert normalize_industry_name("  food & beverage  ") == "food_and_beverage"
    
    def test_normalize_unknown_industry(self):
        """Should convert unknown industry to snake_case."""
        assert normalize_industry_name("unknown industry") == "unknown_industry"
        assert normalize_industry_name("new category") == "new_category"
    
    def test_normalize_empty_string(self):
        """Should handle empty string."""
        assert normalize_industry_name("") == ""
    
    def test_normalize_none(self):
        """Should handle None gracefully."""
        # Function should handle None, but let's test what happens
        result = normalize_industry_name(None)
        # Should either return empty string or handle gracefully
        assert result is not None


class TestDetermineRealismLevel:
    """Test determine_realism_level function."""
    
    def test_realism_level_side_income(self):
        """Side income should result in low realism (1)."""
        inputs = {
            "founder_ambition": "side income",
            "time_commitment": "<5 hrs/week",
            "budget_range": "$0-100",
            "risk_tolerance": "low"
        }
        result = determine_realism_level(inputs)
        assert result == 1
    
    def test_realism_level_scalable_venture(self):
        """Scalable venture should result in high realism (5)."""
        inputs = {
            "founder_ambition": "scalable venture",
            "time_commitment": "full-time",
            "budget_range": "$20k+",
            "risk_tolerance": "high"
        }
        result = determine_realism_level(inputs)
        assert result == 5
    
    def test_realism_level_full_time_business(self):
        """Full-time business should result in medium-high realism (4)."""
        inputs = {
            "founder_ambition": "full-time business",
            "time_commitment": "full-time",
            "budget_range": "$5k-20k",
            "risk_tolerance": "moderate"
        }
        result = determine_realism_level(inputs)
        assert result >= 3  # Should be at least medium
    
    def test_realism_level_part_time_business(self):
        """Part-time business should result in medium realism (2)."""
        inputs = {
            "founder_ambition": "part-time business",
            "time_commitment": "5-10 hrs/week",
            "budget_range": "$100-1,000",
            "risk_tolerance": "low"
        }
        result = determine_realism_level(inputs)
        assert 2 <= result <= 3
    
    def test_realism_level_turn_hobby_into_business(self):
        """Turn hobby into business should result in low realism (1)."""
        inputs = {
            "founder_ambition": "turn hobby into business",
            "time_commitment": "<5 hrs/week",
            "budget_range": "$0-100",
            "risk_tolerance": "very low"
        }
        result = determine_realism_level(inputs)
        assert result == 1
    
    def test_realism_level_time_commitment_variations(self):
        """Should handle different time commitment formats."""
        inputs1 = {
            "founder_ambition": "full-time business",
            "time_commitment": "<5 hrs/week",
            "budget_range": "$1k-5k",
            "risk_tolerance": "moderate"
        }
        result1 = determine_realism_level(inputs1)
        
        inputs2 = {
            "founder_ambition": "full-time business",
            "time_commitment": "< 5 hrs/week",  # With space
            "budget_range": "$1k-5k",
            "risk_tolerance": "moderate"
        }
        result2 = determine_realism_level(inputs2)
        
        assert result1 == result2
    
    def test_realism_level_budget_variations(self):
        """Should handle different budget range formats."""
        inputs1 = {
            "founder_ambition": "full-time business",
            "time_commitment": "10-20 hrs/week",
            "budget_range": "$0–100",  # En dash
            "risk_tolerance": "moderate"
        }
        result1 = determine_realism_level(inputs1)
        
        inputs2 = {
            "founder_ambition": "full-time business",
            "time_commitment": "10-20 hrs/week",
            "budget_range": "$0-100",  # Hyphen
            "risk_tolerance": "moderate"
        }
        result2 = determine_realism_level(inputs2)
        
        assert result1 == result2
    
    def test_realism_level_risk_tolerance_variations(self):
        """Should handle different risk tolerance values."""
        inputs_low = {
            "founder_ambition": "full-time business",
            "time_commitment": "10-20 hrs/week",
            "budget_range": "$1k-5k",
            "risk_tolerance": "low"
        }
        result_low = determine_realism_level(inputs_low)
        
        inputs_very_low = {
            "founder_ambition": "full-time business",
            "time_commitment": "10-20 hrs/week",
            "budget_range": "$1k-5k",
            "risk_tolerance": "very low"
        }
        result_very_low = determine_realism_level(inputs_very_low)
        
        inputs_high = {
            "founder_ambition": "full-time business",
            "time_commitment": "10-20 hrs/week",
            "budget_range": "$1k-5k",
            "risk_tolerance": "high"
        }
        result_high = determine_realism_level(inputs_high)
        
        assert result_low <= result_high
        assert result_very_low <= result_high
    
    def test_realism_level_missing_fields(self):
        """Should default to 3 when fields are missing."""
        inputs = {}
        result = determine_realism_level(inputs)
        assert result == 3  # Default
    
    def test_realism_level_partial_fields(self):
        """Should calculate with available fields."""
        inputs = {
            "founder_ambition": "scalable venture",
            "time_commitment": "full-time"
            # Missing budget_range and risk_tolerance
        }
        result = determine_realism_level(inputs)
        assert 1 <= result <= 5
    
    def test_realism_level_unknown_values(self):
        """Should default to 3 for unknown values."""
        inputs = {
            "founder_ambition": "unknown ambition",
            "time_commitment": "unknown time",
            "budget_range": "unknown budget",
            "risk_tolerance": "unknown risk"
        }
        result = determine_realism_level(inputs)
        assert result == 3  # All default to 3
    
    def test_realism_level_clamped_between_1_and_5(self):
        """Result should always be between 1 and 5."""
        # Test with extreme combinations
        inputs_min = {
            "founder_ambition": "side income",
            "time_commitment": "<5 hrs/week",
            "budget_range": "$0-100",
            "risk_tolerance": "very low"
        }
        result_min = determine_realism_level(inputs_min)
        assert result_min >= 1
        
        inputs_max = {
            "founder_ambition": "scalable venture",
            "time_commitment": "full-time",
            "budget_range": "$20k+",
            "risk_tolerance": "high"
        }
        result_max = determine_realism_level(inputs_max)
        assert result_max <= 5
    
    def test_realism_level_weighted_calculation(self):
        """Should use weighted calculation correctly."""
        # Goal (40%) + Time (25%) + Budget (20%) + Risk (15%)
        # If all are 3, result should be 3
        inputs = {
            "founder_ambition": "unknown",  # Defaults to 3
            "time_commitment": "unknown",   # Defaults to 3
            "budget_range": "unknown",      # Defaults to 3
            "risk_tolerance": "unknown"     # Defaults to 3
        }
        result = determine_realism_level(inputs)
        assert result == 3
    
    def test_realism_level_case_insensitive(self):
        """Should handle case variations."""
        inputs1 = {
            "founder_ambition": "SIDE INCOME",
            "time_commitment": "<5 HRS/WEEK",
            "budget_range": "$0-100",
            "risk_tolerance": "LOW"
        }
        result1 = determine_realism_level(inputs1)
        
        inputs2 = {
            "founder_ambition": "side income",
            "time_commitment": "<5 hrs/week",
            "budget_range": "$0-100",
            "risk_tolerance": "low"
        }
        result2 = determine_realism_level(inputs2)
        
        assert result1 == result2

