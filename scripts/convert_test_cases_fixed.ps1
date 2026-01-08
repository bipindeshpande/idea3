# Convert Comprehensive Test Cases to EZTest Import Template Format
# Fixed version that properly handles multi-line CSV fields

$sourceFile = "docs/COMPREHENSIVE_TEST_CASES.csv"
$outputFile = "docs/TEST_CASES_EZTEST_IMPORT.csv"

Write-Host "Converting test cases (handling multi-line fields)..." -ForegroundColor Green

# Read the CSV file as raw text first to handle multi-line fields properly
$csvContent = Get-Content -Path $sourceFile -Raw -Encoding UTF8

# Parse CSV manually to handle multi-line quoted fields
function Parse-CsvWithMultiline {
    param([string]$csvText)
    
    $lines = $csvText -split "`r?`n"
    $header = $lines[0] -split ','
    $records = @()
    $currentRecord = @{}
    $currentField = ""
    $inQuotes = $false
    $fieldIndex = 0
    
    for ($i = 1; $i -lt $lines.Count; $i++) {
        $line = $lines[$i]
        
        # Check if this line starts a new record (starts with a Test ID pattern)
        if ($line -match '^TC-[A-Z]+-\d+,' -and $currentRecord.Count -gt 0) {
            # Save previous record
            if ($currentRecord.Count -gt 0) {
                $records += [PSCustomObject]$currentRecord
            }
            # Start new record
            $currentRecord = @{}
            $currentField = ""
            $inQuotes = $false
            $fieldIndex = 0
        }
        
        # Parse the line
        $chars = $line.ToCharArray()
        for ($j = 0; $j -lt $chars.Length; $j++) {
            $char = $chars[$j]
            
            if ($char -eq '"') {
                $inQuotes = -not $inQuotes
            }
            elseif ($char -eq ',' -and -not $inQuotes) {
                # End of field
                if ($fieldIndex -lt $header.Count) {
                    $fieldName = $header[$fieldIndex].Trim()
                    $currentRecord[$fieldName] = $currentField.Trim('"')
                }
                $currentField = ""
                $fieldIndex++
            }
            else {
                $currentField += $char
            }
        }
        
        # If we're still in quotes, add newline to current field
        if ($inQuotes) {
            $currentField += "`n"
        }
    }
    
    # Add last record
    if ($currentRecord.Count -gt 0) {
        if ($fieldIndex -lt $header.Count) {
            $fieldName = $header[$fieldIndex].Trim()
            $currentRecord[$fieldName] = $currentField.Trim('"')
        }
        $records += [PSCustomObject]$currentRecord
    }
    
    return $records
}

# Use a simpler approach - read with proper CSV handling
try {
    # Try using a more robust CSV parser
    $sourceContent = Import-Csv -Path $sourceFile -Encoding UTF8
    
    # Filter to only records that have Test ID (actual test cases)
    $validCases = $sourceContent | Where-Object { 
        $_.'Test ID' -and 
        $_.'Test ID' -match '^TC-[A-Z]+-\d+$' 
    }
    
    Write-Host "Found $($validCases.Count) valid test cases" -ForegroundColor Yellow
    
} catch {
    Write-Host "Error reading CSV: $_" -ForegroundColor Red
    exit 1
}

# Priority mapping
$priorityMap = @{
    "Critical" = "CRITICAL"
    "High" = "HIGH"
    "Medium" = "MEDIUM"
    "Low" = "LOW"
}

# Status mapping
$statusMap = @{
    "Not Tested" = "ACTIVE"
    "Passed" = "PASSED"
    "Failed" = "FAILED"
    "Blocked" = "BLOCKED"
}

# Category to Test Suite mapping
$categoryToSuite = @{
    "Security" = "Security Tests"
    "Discovery" = "Discovery Tests"
    "Validation" = "Validation Tests"
    "Payment" = "Payment Tests"
    "User Management" = "User Management Tests"
    "Dashboard" = "Dashboard Tests"
    "Edge Cases" = "Edge Case Tests"
    "Performance" = "Performance Tests"
    "Integration" = "Integration Tests"
    "Error Handling" = "Error Handling Tests"
}

$convertedCases = @()

foreach ($case in $validCases) {
    # Skip if no Test Case Title
    if (-not $case.'Test Case Title' -or $case.'Test Case Title' -eq '') {
        continue
    }
    
    # Map priority (handle null/empty)
    $priority = if ($case.Priority -and $priorityMap.ContainsKey($case.Priority)) { 
        $priorityMap[$case.Priority] 
    } elseif ($case.Priority) { 
        $case.Priority.ToUpper() 
    } else {
        "MEDIUM"
    }
    
    # Map status (handle null/empty)
    $status = if ($case.Status -and $statusMap.ContainsKey($case.Status)) { 
        $statusMap[$case.Status] 
    } elseif ($case.Status) { 
        $case.Status 
    } else {
        "ACTIVE"
    }
    
    # Get test suite from category (handle null/empty)
    $testSuite = if ($case.Category -and $categoryToSuite.ContainsKey($case.Category)) {
        $categoryToSuite[$case.Category]
    } elseif ($case.Category) {
        "$($case.Category) Tests"
    } else {
        "General Tests"
    }
    
    # Build description from Test ID, Test Type, and Notes (handle nulls)
    $description = ""
    if ($case.'Test ID') {
        $description = "Test ID: $($case.'Test ID')"
    }
    if ($case.'Test Type') {
        $description += if ($description) { " | Type: $($case.'Test Type')" } else { "Type: $($case.'Test Type')" }
    }
    if ($case.Notes) {
        $description += if ($description) { " | Notes: $($case.Notes)" } else { $case.Notes }
    }
    
    # Extract defect IDs from Notes if present
    $defectIds = ""
    if ($case.Notes) {
        $defectMatches = [regex]::Matches($case.Notes, "(DEF|BUG|DEFECT)-[A-Z0-9-]+", [System.Text.RegularExpressions.RegexOptions]::IgnoreCase)
        if ($defectMatches.Count -gt 0) {
            $defectIds = ($defectMatches | ForEach-Object { $_.Value }) -join ", "
        }
    }
    
    # Estimate time based on priority
    $priorityForTime = if ($case.Priority) { $case.Priority } else { "Medium" }
    $estimatedTime = switch ($priorityForTime) {
        "Critical" { "30" }
        "High" { "20" }
        "Medium" { "15" }
        "Low" { "10" }
        default { "15" }
    }
    
    # Clean up steps - preserve line breaks but ensure proper formatting
    $testSteps = if ($case.Steps) {
        $case.Steps -replace "`r`n", "`n" -replace "`n", "`n"
    } else {
        ""
    }
    
    # Clean up expected result
    $expectedResult = if ($case.'Expected Result') {
        $case.'Expected Result' -replace "`r`n", "`n" -replace "`n", "`n"
    } else {
        ""
    }
    
    $convertedCase = [PSCustomObject]@{
        "Test Case Title" = $case.'Test Case Title'
        "Module / Feature" = if ($case.Category) { $case.Category } else { "" }
        "Priority" = $priority
        "Preconditions" = if ($case.Preconditions) { $case.Preconditions } else { "" }
        "Test Steps" = $testSteps
        "Test Data" = if ($case.'Test Data') { $case.'Test Data' } else { "" }
        "Expected Result" = $expectedResult
        "Status" = $status
        "Defect ID" = $defectIds
        "Description" = $description
        "Estimated Time (minutes)" = $estimatedTime
        "Postconditions" = ""
        "Test Suites" = $testSuite
    }
    
    $convertedCases += $convertedCase
}

# Export to CSV with proper encoding
$convertedCases | Export-Csv -Path $outputFile -NoTypeInformation -Encoding UTF8

Write-Host "Conversion complete!" -ForegroundColor Green
Write-Host "Converted $($convertedCases.Count) test cases" -ForegroundColor Green
Write-Host "Output file: $outputFile" -ForegroundColor Cyan

