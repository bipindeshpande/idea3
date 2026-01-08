# Convert Comprehensive Test Cases to EZTest Import Template Format
# Properly handles multi-line CSV fields using a robust parser

$sourceFile = "docs/COMPREHENSIVE_TEST_CASES.csv"
$outputFile = "docs/TEST_CASES_EZTEST_IMPORT.csv"

Write-Host "Converting test cases with proper CSV parsing..." -ForegroundColor Green

# Use a Python-like CSV parser approach for PowerShell
# Read the file and parse it properly handling quoted multi-line fields
$csvText = Get-Content -Path $sourceFile -Raw -Encoding UTF8

# Simple CSV parser that handles quoted fields with newlines
function Parse-CsvProperly {
    param([string]$csvText)
    
    $lines = $csvText -split "`r?`n"
    $headerLine = $lines[0]
    $headers = @()
    
    # Parse header
    $inQuotes = $false
    $currentField = ""
    foreach ($char in $headerLine.ToCharArray()) {
        if ($char -eq '"') {
            $inQuotes = -not $inQuotes
        }
        elseif ($char -eq ',' -and -not $inQuotes) {
            $headers += $currentField.Trim()
            $currentField = ""
        }
        else {
            $currentField += $char
        }
    }
    if ($currentField) { $headers += $currentField.Trim() }
    
    $records = @()
    $i = 1
    
    while ($i -lt $lines.Count) {
        $record = @{}
        $fieldIndex = 0
        $currentField = ""
        $inQuotes = $false
        $line = $lines[$i]
        
        # Check if this line starts a new record (starts with TC- pattern)
        if ($line -match '^TC-[A-Z]+-\d+,') {
            # Parse this line and continue until we hit the next TC- pattern or end
            $fullRecord = $line
            
            # Continue reading lines until we hit the next record start or end of file
            $i++
            while ($i -lt $lines.Count) {
                $nextLine = $lines[$i]
                # Check if next line starts a new record
                if ($nextLine -match '^TC-[A-Z]+-\d+,') {
                    break
                }
                # Check if we've closed all quotes (end of current record)
                $quoteCount = ($fullRecord.ToCharArray() | Where-Object { $_ -eq '"' }).Count
                if ($quoteCount % 2 -eq 0 -and -not ($fullRecord -match '"[^"]*$')) {
                    # Might be end of record, but check next line
                    $fullRecord += "`n" + $nextLine
                    $i++
                } else {
                    $fullRecord += "`n" + $nextLine
                    $i++
                }
            }
            
            # Now parse the full record
            $inQuotes = $false
            $currentField = ""
            $fieldIndex = 0
            
            foreach ($char in $fullRecord.ToCharArray()) {
                if ($char -eq '"') {
                    $inQuotes = -not $inQuotes
                    $currentField += $char
                }
                elseif ($char -eq ',' -and -not $inQuotes) {
                    if ($fieldIndex -lt $headers.Count) {
                        $fieldName = $headers[$fieldIndex]
                        $value = $currentField.Trim('"').Trim()
                        $record[$fieldName] = $value
                    }
                    $currentField = ""
                    $fieldIndex++
                }
                else {
                    $currentField += $char
                }
            }
            
            # Add last field
            if ($currentField -and $fieldIndex -lt $headers.Count) {
                $fieldName = $headers[$fieldIndex]
                $value = $currentField.Trim('"').Trim()
                $record[$fieldName] = $value
            }
            
            if ($record.Count -gt 0) {
                $records += [PSCustomObject]$record
            }
        } else {
            $i++
        }
    }
    
    return $records
}

# Try using a different approach - read line by line and reconstruct records
Write-Host "Parsing CSV file..." -ForegroundColor Yellow

# Read all lines
$allLines = Get-Content -Path $sourceFile -Encoding UTF8
$headerLine = $allLines[0]
$headers = $headerLine -split ',' | ForEach-Object { $_.Trim('"') }

$records = @()
$currentRecord = @{}
$currentFields = @()
$i = 1
$inQuotedField = $false
$currentFieldValue = ""

while ($i -lt $allLines.Count) {
    $line = $allLines[$i]
    
    # Check if this line starts a new record
    if ($line -match '^TC-[A-Z]+-\d+,') {
        # Save previous record if exists
        if ($currentFields.Count -gt 0) {
            $record = @{}
            for ($j = 0; $j -lt [Math]::Min($headers.Count, $currentFields.Count); $j++) {
                $record[$headers[$j]] = $currentFields[$j]
            }
            if ($record.'Test ID' -and $record.'Test Case Title') {
                $records += [PSCustomObject]$record
            }
        }
        
        # Start new record
        $currentFields = @()
        $currentFieldValue = ""
        $inQuotedField = $false
    }
    
    # Parse the line
    $chars = $line.ToCharArray()
    $fieldValue = ""
    $fieldStart = 0
    
    for ($j = 0; $j -lt $chars.Length; $j++) {
        $char = $chars[$j]
        
        if ($char -eq '"') {
            $inQuotedField = -not $inQuotedField
            if ($inQuotedField) {
                $fieldValue += $char
            }
        }
        elseif ($char -eq ',' -and -not $inQuotedField) {
            $currentFields += $fieldValue.Trim('"')
            $fieldValue = ""
        }
        else {
            $fieldValue += $char
        }
    }
    
    # If still in quoted field, this line continues to next
    if ($inQuotedField) {
        $currentFieldValue += $fieldValue + "`n"
    } else {
        if ($fieldValue) {
            $currentFields += $fieldValue.Trim('"')
        }
        $currentFieldValue = ""
    }
    
    $i++
}

# Add last record
if ($currentFields.Count -gt 0) {
    $record = @{}
    for ($j = 0; $j -lt [Math]::Min($headers.Count, $currentFields.Count); $j++) {
        $record[$headers[$j]] = $currentFields[$j]
    }
    if ($record.'Test ID' -and $record.'Test Case Title') {
        $records += [PSCustomObject]$record
    }
}

Write-Host "Found $($records.Count) test cases with both Test ID and Title" -ForegroundColor Yellow

# Now convert to EZTest format
$priorityMap = @{
    "Critical" = "CRITICAL"
    "High" = "HIGH"
    "Medium" = "MEDIUM"
    "Low" = "LOW"
}

$statusMap = @{
    "Not Tested" = "ACTIVE"
    "Passed" = "PASSED"
    "Failed" = "FAILED"
    "Blocked" = "BLOCKED"
}

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

foreach ($case in $records) {
    $priority = if ($case.Priority -and $priorityMap.ContainsKey($case.Priority)) { 
        $priorityMap[$case.Priority] 
    } elseif ($case.Priority) { 
        $case.Priority.ToUpper() 
    } else {
        "MEDIUM"
    }
    
    $status = if ($case.Status -and $statusMap.ContainsKey($case.Status)) { 
        $statusMap[$case.Status] 
    } elseif ($case.Status) { 
        $case.Status 
    } else {
        "ACTIVE"
    }
    
    $testSuite = if ($case.Category -and $categoryToSuite.ContainsKey($case.Category)) {
        $categoryToSuite[$case.Category]
    } elseif ($case.Category) {
        "$($case.Category) Tests"
    } else {
        "General Tests"
    }
    
    $description = ""
    if ($case.'Test ID') { $description = "Test ID: $($case.'Test ID')" }
    if ($case.'Test Type') { $description += if ($description) { " | Type: $($case.'Test Type')" } else { "Type: $($case.'Test Type')" } }
    if ($case.Notes) { $description += if ($description) { " | Notes: $($case.Notes)" } else { $case.Notes } }
    
    $defectIds = ""
    if ($case.Notes) {
        $defectMatches = [regex]::Matches($case.Notes, "(DEF|BUG|DEFECT)-[A-Z0-9-]+", [System.Text.RegularExpressions.RegexOptions]::IgnoreCase)
        if ($defectMatches.Count -gt 0) {
            $defectIds = ($defectMatches | ForEach-Object { $_.Value }) -join ", "
        }
    }
    
    $priorityForTime = if ($case.Priority) { $case.Priority } else { "Medium" }
    $estimatedTime = switch ($priorityForTime) {
        "Critical" { "30" }
        "High" { "20" }
        "Medium" { "15" }
        "Low" { "10" }
        default { "15" }
    }
    
    $testSteps = if ($case.Steps) { $case.Steps } else { "" }
    $expectedResult = if ($case.'Expected Result') { $case.'Expected Result' } else { "" }
    
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

$convertedCases | Export-Csv -Path $outputFile -NoTypeInformation -Encoding UTF8

Write-Host "Conversion complete!" -ForegroundColor Green
Write-Host "Converted $($convertedCases.Count) test cases" -ForegroundColor Green
Write-Host "Output file: $outputFile" -ForegroundColor Cyan

