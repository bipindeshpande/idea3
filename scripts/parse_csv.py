import csv
import sys

# Read the CSV file properly handling multi-line quoted fields
with open('docs/COMPREHENSIVE_TEST_CASES.csv', 'r', encoding='utf-8') as f:
    reader = csv.DictReader(f)
    rows = list(reader)

print(f'Total rows parsed: {len(rows)}')
print(f'Rows with Test ID: {sum(1 for r in rows if r.get("Test ID"))}')
print(f'Rows with Test Case Title: {sum(1 for r in rows if r.get("Test Case Title"))}')
print(f'Rows with both Test ID and Title: {sum(1 for r in rows if r.get("Test ID") and r.get("Test Case Title"))}')

# Get unique Test IDs
test_ids = [r.get("Test ID") for r in rows if r.get("Test ID")]
unique_test_ids = list(set(test_ids))
print(f'\nUnique Test IDs: {len(unique_test_ids)}')

# Show first few and last few
if len(unique_test_ids) > 0:
    print(f'\nFirst 5 Test IDs: {unique_test_ids[:5]}')
    print(f'Last 5 Test IDs: {unique_test_ids[-5:]}')

