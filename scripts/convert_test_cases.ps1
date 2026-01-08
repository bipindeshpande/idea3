# Convert Comprehensive Test Cases to EZTest Import Template Format

$sourceFile = "docs/COMPREHENSIVE_TEST_CASES.csv"
$templateFile = "c:\Users\bipin\Downloads\test-cases-import-template.csv"
$outputFile = "docs/TEST_CASES_EZTEST_IMPORT.csv"

Write-Host "Converting test cases..." -ForegroundColor Green

# Read source file
$sourceContent = Import-Csv -Path $sourceFile

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

foreach ($case in $sourceContent) {
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
    
    # Extract defect IDs from Notes if present (looking for patterns like DEF-xxx, BUG-xxx)
    $defectIds = ""
    if ($case.Notes) {
        $defectMatches = [regex]::Matches($case.Notes, "(DEF|BUG|DEFECT)-[A-Z0-9-]+", [System.Text.RegularExpressions.RegexOptions]::IgnoreCase)
        if ($defectMatches.Count -gt 0) {
            $defectIds = ($defectMatches | ForEach-Object { $_.Value }) -join ", "
        }
    }
    
    # Estimate time based on priority and complexity
    $priorityForTime = if ($case.Priority) { $case.Priority } else { "Medium" }
    $estimatedTime = switch ($priorityForTime) {
        "Critical" { "30" }
        "High" { "20" }
        "Medium" { "15" }
        "Low" { "10" }
        default { "15" }
    }
    
    # Clean up steps - ensure proper line breaks (handle nulls)
    $testSteps = if ($case.Steps) {
        $case.Steps -replace "`r`n", "`n" -replace "`n", "`n"
    } else {
        ""
    }
    
    # Clean up expected result (handle nulls)
    $expectedResult = if ($case.'Expected Result') {
        $case.'Expected Result' -replace "`r`n", "`n" -replace "`n", "`n"
    } else {
        ""
    }
    
    $convertedCase = [PSCustomObject]@{
        "Test Case Title" = if ($case.'Test Case Title') { $case.'Test Case Title' } else { "" }
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

# Export to CSV
$convertedCases | Export-Csv -Path $outputFile -NoTypeInformation -Encoding UTF8

Write-Host "Conversion complete!" -ForegroundColor Green
Write-Host "Converted $($convertedCases.Count) test cases" -ForegroundColor Green
Write-Host "Output file: $outputFile" -ForegroundColor Cyan

