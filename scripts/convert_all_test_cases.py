import csv
import re

# Read and properly parse the CSV file
source_file = 'docs/COMPREHENSIVE_TEST_CASES.csv'
output_file = 'docs/TEST_CASES_EZTEST_IMPORT.csv'

print("Reading CSV file...")

# Priority mapping
priority_map = {
    "Critical": "CRITICAL",
    "High": "HIGH",
    "Medium": "MEDIUM",
    "Low": "LOW"
}

# Status mapping
status_map = {
    "Not Tested": "ACTIVE",
    "Passed": "PASSED",
    "Failed": "FAILED",
    "Blocked": "BLOCKED"
}

# Category to Test Suite mapping
category_to_suite = {
    "Security": "Security Tests",
    "Discovery": "Discovery Tests",
    "Validation": "Validation Tests",
    "Payment": "Payment Tests",
    "User Management": "User Management Tests",
    "Dashboard": "Dashboard Tests",
    "Edge Cases": "Edge Case Tests",
    "Performance": "Performance Tests",
    "Integration": "Integration Tests",
    "Error Handling": "Error Handling Tests"
}

# Read CSV with proper handling of multi-line fields
rows = []
with open(source_file, 'r', encoding='utf-8') as f:
    reader = csv.DictReader(f)
    for row in reader:
        rows.append(row)

print(f"Total rows read: {len(rows)}")

# Filter to valid test cases (must have Test ID matching pattern and Test Case Title)
valid_test_id_pattern = re.compile(r'^TC-[A-Z]+-\d+$')
valid_cases = []

for row in rows:
    test_id = (row.get('Test ID') or '').strip()
    test_title = (row.get('Test Case Title') or '').strip()
    
    # Only include if Test ID matches pattern and has a title
    if test_id and valid_test_id_pattern.match(test_id) and test_title:
        valid_cases.append(row)

print(f"Valid test cases found: {len(valid_cases)}")

# Convert to EZTest format
converted_cases = []

for case in valid_cases:
    # Helper function to safely get and strip values
    def safe_get(key, default=''):
        val = case.get(key)
        return val.strip() if val else default
    
    # Map priority
    priority = safe_get('Priority')
    priority = priority_map.get(priority, priority.upper() if priority else 'MEDIUM')
    
    # Map status
    status = safe_get('Status')
    status = status_map.get(status, status if status else 'ACTIVE')
    
    # Get test suite
    category = safe_get('Category')
    test_suite = category_to_suite.get(category, f"{category} Tests" if category else "General Tests")
    
    # Build description
    description_parts = []
    test_id = safe_get('Test ID')
    if test_id:
        description_parts.append(f"Test ID: {test_id}")
    test_type = safe_get('Test Type')
    if test_type:
        description_parts.append(f"Type: {test_type}")
    notes = safe_get('Notes')
    if notes:
        description_parts.append(f"Notes: {notes}")
    description = " | ".join(description_parts)
    
    # Extract defect IDs from Notes
    defect_ids = ""
    if notes:
        defect_matches = re.findall(r'(DEF|BUG|DEFECT)-[A-Z0-9-]+', notes, re.IGNORECASE)
        if defect_matches:
            defect_ids = ", ".join(defect_matches)
    
    # Estimate time
    priority_for_time = safe_get('Priority', 'Medium')
    estimated_time = {
        "Critical": "30",
        "High": "20",
        "Medium": "15",
        "Low": "10"
    }.get(priority_for_time, "15")
    
    converted_case = {
        "Test Case Title": safe_get('Test Case Title'),
        "Module / Feature": safe_get('Category'),
        "Priority": priority,
        "Preconditions": safe_get('Preconditions'),
        "Test Steps": safe_get('Steps'),
        "Test Data": safe_get('Test Data'),
        "Expected Result": safe_get('Expected Result'),
        "Status": status,
        "Defect ID": defect_ids,
        "Description": description,
        "Estimated Time (minutes)": estimated_time,
        "Postconditions": "",
        "Test Suites": test_suite
    }
    
    converted_cases.append(converted_case)

# Write output CSV
fieldnames = [
    "Test Case Title", "Module / Feature", "Priority", "Preconditions",
    "Test Steps", "Test Data", "Expected Result", "Status", "Defect ID",
    "Description", "Estimated Time (minutes)", "Postconditions", "Test Suites"
]

with open(output_file, 'w', newline='', encoding='utf-8') as f:
    writer = csv.DictWriter(f, fieldnames=fieldnames)
    writer.writeheader()
    writer.writerows(converted_cases)

print(f"\nConversion complete!")
print(f"Converted {len(converted_cases)} test cases")
print(f"Output file: {output_file}")

