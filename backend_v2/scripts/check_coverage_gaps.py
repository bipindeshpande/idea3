#!/usr/bin/env python3
"""
Script to identify files with lowest test coverage.
Run after: pytest --cov=app --cov-report=xml
"""

import xml.etree.ElementTree as ET
import sys
from pathlib import Path

def parse_coverage_xml(xml_path="coverage.xml"):
    """Parse coverage.xml and return coverage data"""
    try:
        tree = ET.parse(xml_path)
        root = tree.getroot()
        
        files = []
        for package in root.findall(".//package"):
            for class_elem in package.findall(".//class"):
                filename = class_elem.get("filename")
                if not filename:
                    continue
                
                # Get line rate (coverage percentage)
                line_rate = float(class_elem.get("line-rate", 0)) * 100
                
                # Get line counts
                lines_covered = int(class_elem.get("lines-covered", 0))
                lines_valid = int(class_elem.get("lines-valid", 0))
                lines_missing = lines_valid - lines_covered
                
                files.append({
                    "filename": filename,
                    "coverage": line_rate,
                    "covered": lines_covered,
                    "total": lines_valid,
                    "missing": lines_missing
                })
        
        return files
    except FileNotFoundError:
        print(f"Error: {xml_path} not found. Run 'pytest --cov=app --cov-report=xml' first.")
        sys.exit(1)
    except Exception as e:
        print(f"Error parsing coverage.xml: {e}")
        sys.exit(1)

def filter_app_files(files):
    """Filter to only app/ files, exclude tests"""
    return [
        f for f in files 
        if f["filename"].startswith("app/") 
        and "test" not in f["filename"].lower()
    ]

def categorize_by_coverage(files):
    """Categorize files by coverage level"""
    categories = {
        "critical": [],  # 0-20%
        "high": [],       # 20-40%
        "medium": [],     # 40-60%
        "good": [],       # 60-80%
        "excellent": []   # 80-100%
    }
    
    for file in files:
        cov = file["coverage"]
        if cov < 20:
            categories["critical"].append(file)
        elif cov < 40:
            categories["high"].append(file)
        elif cov < 60:
            categories["medium"].append(file)
        elif cov < 80:
            categories["good"].append(file)
        else:
            categories["excellent"].append(file)
    
    return categories

def print_summary(categories):
    """Print coverage summary"""
    print("\n" + "="*80)
    print("TEST COVERAGE GAP ANALYSIS")
    print("="*80)
    
    total_files = sum(len(cat) for cat in categories.values())
    
    print(f"\n📊 Overall Summary:")
    print(f"   Total files analyzed: {total_files}")
    print(f"   Critical (0-20%):     {len(categories['critical'])} files")
    print(f"   High Priority (20-40%): {len(categories['high'])} files")
    print(f"   Medium (40-60%):      {len(categories['medium'])} files")
    print(f"   Good (60-80%):        {len(categories['good'])} files")
    print(f"   Excellent (80-100%):  {len(categories['excellent'])} files")
    
    # Print critical files
    if categories["critical"]:
        print(f"\n🔴 CRITICAL PRIORITY (0-20% coverage):")
        print("-" * 80)
        sorted_critical = sorted(categories["critical"], key=lambda x: x["coverage"])
        for file in sorted_critical[:20]:  # Top 20
            print(f"   {file['coverage']:5.1f}% | {file['missing']:4d} lines | {file['filename']}")
        if len(categories["critical"]) > 20:
            print(f"   ... and {len(categories['critical']) - 20} more files")
    
    # Print high priority files
    if categories["high"]:
        print(f"\n🟠 HIGH PRIORITY (20-40% coverage):")
        print("-" * 80)
        sorted_high = sorted(categories["high"], key=lambda x: x["coverage"])
        for file in sorted_high[:15]:  # Top 15
            print(f"   {file['coverage']:5.1f}% | {file['missing']:4d} lines | {file['filename']}")
        if len(categories["high"]) > 15:
            print(f"   ... and {len(categories['high']) - 15} more files")
    
    # Print medium priority files
    if categories["medium"]:
        print(f"\n🟡 MEDIUM PRIORITY (40-60% coverage):")
        print("-" * 80)
        sorted_medium = sorted(categories["medium"], key=lambda x: x["coverage"])
        for file in sorted_medium[:10]:  # Top 10
            print(f"   {file['coverage']:5.1f}% | {file['missing']:4d} lines | {file['filename']}")
        if len(categories["medium"]) > 10:
            print(f"   ... and {len(categories['medium']) - 10} more files")

def print_recommendations(categories):
    """Print actionable recommendations"""
    print("\n" + "="*80)
    print("RECOMMENDATIONS")
    print("="*80)
    
    if categories["critical"]:
        print("\n1. 🔴 Start with Critical Priority files (0-20% coverage):")
        top_critical = sorted(categories["critical"], key=lambda x: x["missing"], reverse=True)[:5]
        for i, file in enumerate(top_critical, 1):
            print(f"   {i}. {file['filename']}")
            print(f"      Current: {file['coverage']:.1f}% | Missing: {file['missing']} lines")
            print(f"      Impact: High | Estimated time: 2-4 hours")
    
    if categories["high"]:
        print("\n2. 🟠 Next, tackle High Priority files (20-40% coverage):")
        top_high = sorted(categories["high"], key=lambda x: x["missing"], reverse=True)[:3]
        for i, file in enumerate(top_high, 1):
            print(f"   {i}. {file['filename']}")
            print(f"      Current: {file['coverage']:.1f}% | Missing: {file['missing']} lines")
            print(f"      Impact: Medium | Estimated time: 1-3 hours")

def main():
    """Main function"""
    xml_path = sys.argv[1] if len(sys.argv) > 1 else "coverage.xml"
    
    print("Parsing coverage data...")
    files = parse_coverage_xml(xml_path)
    app_files = filter_app_files(files)
    categories = categorize_by_coverage(app_files)
    
    print_summary(categories)
    print_recommendations(categories)
    
    print("\n" + "="*80)
    print("Next Steps:")
    print("1. Review the critical priority files above")
    print("2. Start with files that have the most missing lines")
    print("3. Focus on business-critical code first")
    print("4. See HOW_TO_INCREASE_TEST_COVERAGE.md for detailed strategies")
    print("="*80 + "\n")

if __name__ == "__main__":
    main()

