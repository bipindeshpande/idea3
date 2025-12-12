#!/usr/bin/env python3
"""
Script to add business_region parameter mappings to all industry JSON files.
"""
import json
import os
from pathlib import Path

# Business region mapping template
BUSINESS_REGION_MAPPING = {
    "United States / Canada": {
        "problems": [{"id": "problem_1", "weight": 5, "priority": "high"}],
        "solutions": [{"id": "solution_1", "weight": 5, "priority": "high"}],
        "delivery_modes": [{"id": "delivery_1", "weight": 5, "priority": "high"}],
        "revenue_patterns": [{"id": "revenue_15", "weight": 5, "priority": "high"}],
        "automation_patterns": [{"id": "auto_2", "weight": 5, "priority": "high"}],
        "archetypes": ["marketplace", "platform"]
    },
    "Europe": {
        "problems": [{"id": "problem_1", "weight": 5, "priority": "high"}],
        "solutions": [{"id": "solution_1", "weight": 5, "priority": "high"}],
        "delivery_modes": [{"id": "delivery_1", "weight": 5, "priority": "high"}],
        "revenue_patterns": [{"id": "revenue_15", "weight": 5, "priority": "high"}],
        "automation_patterns": [{"id": "auto_2", "weight": 5, "priority": "high"}],
        "archetypes": ["marketplace", "platform"]
    },
    "India": {
        "problems": [{"id": "problem_2", "weight": 5, "priority": "high"}],
        "solutions": [{"id": "solution_3", "weight": 5, "priority": "high"}],
        "delivery_modes": [{"id": "delivery_2", "weight": 5, "priority": "high"}],
        "revenue_patterns": [{"id": "revenue_1", "weight": 5, "priority": "high"}],
        "automation_patterns": [{"id": "auto_1", "weight": 5, "priority": "high"}],
        "archetypes": ["platform", "marketplace"]
    },
    "Middle East": {
        "problems": [{"id": "problem_1", "weight": 5, "priority": "high"}],
        "solutions": [{"id": "solution_1", "weight": 5, "priority": "high"}],
        "delivery_modes": [{"id": "delivery_1", "weight": 5, "priority": "high"}],
        "revenue_patterns": [{"id": "revenue_15", "weight": 5, "priority": "high"}],
        "automation_patterns": [{"id": "auto_2", "weight": 5, "priority": "high"}],
        "archetypes": ["marketplace", "platform"]
    },
    "Southeast Asia": {
        "problems": [{"id": "problem_2", "weight": 5, "priority": "high"}],
        "solutions": [{"id": "solution_3", "weight": 5, "priority": "high"}],
        "delivery_modes": [{"id": "delivery_2", "weight": 5, "priority": "high"}],
        "revenue_patterns": [{"id": "revenue_1", "weight": 5, "priority": "high"}],
        "automation_patterns": [{"id": "auto_1", "weight": 5, "priority": "high"}],
        "archetypes": ["platform", "marketplace"]
    },
    "Africa": {
        "problems": [{"id": "problem_2", "weight": 5, "priority": "high"}],
        "solutions": [{"id": "solution_3", "weight": 5, "priority": "high"}],
        "delivery_modes": [{"id": "delivery_2", "weight": 5, "priority": "high"}],
        "revenue_patterns": [{"id": "revenue_1", "weight": 5, "priority": "high"}],
        "automation_patterns": [{"id": "auto_1", "weight": 5, "priority": "high"}],
        "archetypes": ["platform", "marketplace"]
    },
    "Latin America": {
        "problems": [{"id": "problem_2", "weight": 5, "priority": "high"}],
        "solutions": [{"id": "solution_3", "weight": 5, "priority": "high"}],
        "delivery_modes": [{"id": "delivery_2", "weight": 5, "priority": "high"}],
        "revenue_patterns": [{"id": "revenue_1", "weight": 5, "priority": "high"}],
        "automation_patterns": [{"id": "auto_1", "weight": 5, "priority": "high"}],
        "archetypes": ["platform", "marketplace"]
    },
    "Global / Online": {
        "problems": [{"id": "problem_1", "weight": 5, "priority": "high"}],
        "solutions": [{"id": "solution_1", "weight": 5, "priority": "high"}],
        "delivery_modes": [{"id": "delivery_1", "weight": 5, "priority": "high"}],
        "revenue_patterns": [{"id": "revenue_15", "weight": 5, "priority": "high"}],
        "automation_patterns": [{"id": "auto_2", "weight": 5, "priority": "high"}],
        "archetypes": ["marketplace", "platform"]
    }
}

def add_business_region_to_file(file_path: Path):
    """Add business_region to a single JSON file."""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        # Check if business_region already exists
        param_mappings = data.get("parameter_mappings", {})
        if "business_region" in param_mappings:
            print(f"  ✓ {file_path.name} already has business_region")
            return True
        
        # Add business_region to parameter_mappings
        param_mappings["business_region"] = BUSINESS_REGION_MAPPING
        
        # Write back to file
        with open(file_path, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
        
        print(f"  ✓ Added business_region to {file_path.name}")
        return True
    except Exception as e:
        print(f"  ✗ Error processing {file_path.name}: {e}")
        return False

def main():
    """Main function to process all industry JSON files."""
    industries_dir = Path("backend_v2/app/static_engine/static/industries")
    
    if not industries_dir.exists():
        print(f"Error: Directory not found: {industries_dir}")
        return
    
    json_files = list(industries_dir.glob("*.json"))
    print(f"Found {len(json_files)} industry JSON files")
    
    success_count = 0
    for json_file in sorted(json_files):
        if add_business_region_to_file(json_file):
            success_count += 1
    
    print(f"\n✓ Successfully updated {success_count}/{len(json_files)} files")

if __name__ == "__main__":
    main()

