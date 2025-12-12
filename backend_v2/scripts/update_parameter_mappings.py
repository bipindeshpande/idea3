"""
Script to update parameter_mappings in all industry JSON files.

This script:
1. Renames "work_style" to "preferred_work_style" 
2. Maps old work_style values to new preferred_work_style values
3. Adds "startup_style" parameter_mappings with default mappings
"""

import json
import sys
from pathlib import Path

# Add project root to path
project_root = Path(__file__).parent.parent
sys.path.insert(0, str(project_root))

# Mapping from old work_style values to new preferred_work_style values
WORK_STYLE_MAPPING = {
    "Solo": "Independent / Solo",
    "Small Team": "Small collaborative team",
    "Remote": "Remote-friendly",
    "Hybrid": "Flexible / No preference",
    "In-Person": "People-facing / Service-oriented"
}

# Default startup_style mappings (can be customized per industry)
DEFAULT_STARTUP_STYLE_MAPPING = {
    "Home-based business": {
        "problems": ["problem_1"],
        "solutions": ["solution_1"],
        "delivery_modes": ["delivery_1"],
        "revenue_patterns": ["revenue_1"],
        "automation_patterns": ["auto_1"]
    },
    "Local service business": {
        "problems": ["problem_2"],
        "solutions": ["solution_2"],
        "delivery_modes": ["delivery_2"],
        "revenue_patterns": ["revenue_2"],
        "automation_patterns": ["auto_2"]
    },
    "Online-only business": {
        "problems": ["problem_3"],
        "solutions": ["solution_3"],
        "delivery_modes": ["delivery_3"],
        "revenue_patterns": ["revenue_3"],
        "automation_patterns": ["auto_3"]
    },
    "Content / creator-led business": {
        "problems": ["problem_4"],
        "solutions": ["solution_4"],
        "delivery_modes": ["delivery_4"],
        "revenue_patterns": ["revenue_4"],
        "automation_patterns": ["auto_4"]
    },
    "Low-cost / bootstrapped": {
        "problems": ["problem_1"],
        "solutions": ["solution_1"],
        "delivery_modes": ["delivery_1"],
        "revenue_patterns": ["revenue_1"],
        "automation_patterns": ["auto_1"]
    },
    "Tech-assisted but not tech-intensive": {
        "problems": ["problem_2"],
        "solutions": ["solution_2"],
        "delivery_modes": ["delivery_2"],
        "revenue_patterns": ["revenue_2"],
        "automation_patterns": ["auto_2"]
    },
    "Community-driven / local engagement": {
        "problems": ["problem_5"],
        "solutions": ["solution_5"],
        "delivery_modes": ["delivery_5"],
        "revenue_patterns": ["revenue_5"],
        "automation_patterns": ["auto_5"]
    }
}

def update_industry_file(file_path: Path, dry_run: bool = False):
    """Update a single industry JSON file."""
    print(f"\nProcessing: {file_path.name}")
    
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
    except Exception as e:
        print(f"  ❌ Error reading file: {e}")
        return False
    
    if "parameter_mappings" not in data:
        print(f"  ⚠️  No parameter_mappings found, skipping")
        return False
    
    param_mappings = data["parameter_mappings"]
    updated = False
    
    # 1. Rename work_style to preferred_work_style and map values
    if "work_style" in param_mappings:
        old_work_style = param_mappings["work_style"]
        new_preferred_work_style = {}
        
        for old_key, old_value in old_work_style.items():
            # Map to new key
            new_key = WORK_STYLE_MAPPING.get(old_key, old_key)
            
            # If key already exists, merge (keep existing structure)
            if new_key in new_preferred_work_style:
                # Merge fragment references
                for frag_type in ["problems", "solutions", "delivery_modes", "revenue_patterns", "automation_patterns"]:
                    if frag_type in old_value:
                        existing = new_preferred_work_style[new_key].get(frag_type, [])
                        new_items = old_value.get(frag_type, [])
                        # Deduplicate
                        combined = existing + [item for item in new_items if item not in existing]
                        new_preferred_work_style[new_key][frag_type] = combined
            else:
                new_preferred_work_style[new_key] = old_value.copy()
        
        # Add all new preferred_work_style options if missing
        for new_option in [
            "Independent / Solo",
            "Small collaborative team", 
            "Hands-on / Active work",
            "Creative / Maker work",
            "People-facing / Service-oriented",
            "Remote-friendly",
            "Flexible / No preference"
        ]:
            if new_option not in new_preferred_work_style:
                # Use default structure (can be customized)
                new_preferred_work_style[new_option] = {
                    "problems": ["problem_1"],
                    "solutions": ["solution_1"],
                    "delivery_modes": ["delivery_1"],
                    "revenue_patterns": ["revenue_1"],
                    "automation_patterns": ["auto_1"]
                }
        
        param_mappings["preferred_work_style"] = new_preferred_work_style
        del param_mappings["work_style"]
        updated = True
        print(f"  ✅ Renamed work_style → preferred_work_style and mapped values")
    
    # 2. Add startup_style if missing
    if "startup_style" not in param_mappings:
        param_mappings["startup_style"] = DEFAULT_STARTUP_STYLE_MAPPING.copy()
        updated = True
        print(f"  ✅ Added startup_style parameter_mappings")
    
    if updated and not dry_run:
        # Write back to file
        with open(file_path, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
        print(f"  ✅ Saved updates")
    elif updated:
        print(f"  ℹ️  Would update (dry run)")
    
    return updated

def main():
    import argparse
    parser = argparse.ArgumentParser(description="Update parameter_mappings in industry JSON files")
    parser.add_argument("--dry-run", action="store_true", help="Show what would be updated without making changes")
    parser.add_argument("--industry", help="Update only a specific industry file")
    args = parser.parse_args()
    
    static_dir = project_root / "app" / "static_engine" / "static" / "industries"
    
    if not static_dir.exists():
        print(f"❌ Directory not found: {static_dir}")
        return 1
    
    json_files = list(static_dir.glob("*.json"))
    
    if args.industry:
        json_files = [f for f in json_files if f.stem == args.industry]
        if not json_files:
            print(f"❌ Industry file not found: {args.industry}")
            return 1
    
    print(f"Found {len(json_files)} industry file(s)")
    
    updated_count = 0
    for json_file in json_files:
        if update_industry_file(json_file, dry_run=args.dry_run):
            updated_count += 1
    
    print(f"\n{'Would update' if args.dry_run else 'Updated'} {updated_count} file(s)")
    return 0

if __name__ == "__main__":
    sys.exit(main())

