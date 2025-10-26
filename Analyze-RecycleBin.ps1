# Analyze Windows Recycle Bin for Lost Project Files
# Created: 2025-10-15
# Purpose: Identify potentially important files deleted during repository reorganization

param(
    [string]$OutputPath = ".\recycle-bin-analysis.csv",
    [string]$ReportPath = ".\recycle-bin-report.txt"
)

Write-Host "=== myTribe Development - Recycle Bin Analysis ===" -ForegroundColor Cyan
Write-Host "Analyzing Windows Recycle Bin for deleted project files..." -ForegroundColor Yellow
Write-Host ""

# Initialize Shell COM object to access Recycle Bin
$shell = New-Object -ComObject Shell.Application
$recycleBin = $shell.Namespace(0x0A)

if ($null -eq $recycleBin) {
    Write-Host "ERROR: Unable to access Recycle Bin" -ForegroundColor Red
    exit 1
}

# Get all items in Recycle Bin
$items = $recycleBin.Items()
$totalItems = $items.Count

Write-Host "Found $totalItems items in Recycle Bin" -ForegroundColor Green
Write-Host "Analyzing items..." -ForegroundColor Yellow
Write-Host ""

# Project paths to monitor
$projectPaths = @(
    "C:\Users\chris\myTribe Development",
    "C:\Users\chris\Development Projects",
    "C:\Users\chris\mytribe-ai-research-platform"
)

# Critical file patterns
$criticalFiles = @{
    'Configuration' = @('*.gitignore', 'package.json', 'wrangler.toml', 'requirements.txt', 'pyproject.toml', '.env.example', 'tsconfig.json', 'vitest.config.js', 'playwright.config.js')
    'Documentation' = @('README.md', 'CHANGELOG.md', 'SECURITY.md', 'CLAUDE.md', '*.md')
    'Source Code' = @('*.js', '*.ts', '*.py', '*.ps1', '*.tsx', '*.jsx', '*.html', '*.css')
    'Database' = @('*.db', '*.sqlite', '*.sqlite3', '*.sql')
    'Data' = @('*.xlsx', '*.csv', '*.json', '*.xml')
    'Git' = @('.git', '.gitattributes', '.github')
}

# Results array
$results = @()

# Process each item
$counter = 0
foreach ($item in $items) {
    $counter++
    Write-Progress -Activity "Analyzing Recycle Bin Items" -Status "Processing item $counter of $totalItems" -PercentComplete (($counter / $totalItems) * 100)

    try {
        # Get item properties
        $name = $recycleBin.GetDetailsOf($item, 0)
        $originalLocation = $recycleBin.GetDetailsOf($item, 1)
        $dateDeleted = $recycleBin.GetDetailsOf($item, 2)
        $size = $recycleBin.GetDetailsOf($item, 3)
        $type = $recycleBin.GetDetailsOf($item, 4)

        # Skip if no original location (malformed entry)
        if ([string]::IsNullOrWhiteSpace($originalLocation)) {
            continue
        }

        # Check if from project directories
        $isProjectFile = $false
        $projectPath = ""
        foreach ($path in $projectPaths) {
            if ($originalLocation -like "$path*") {
                $isProjectFile = $true
                $projectPath = $path
                break
            }
        }

        # Determine priority and category
        $priority = "Low"
        $category = "Other"
        $reason = ""

        if ($isProjectFile) {
            # Check against critical file patterns
            foreach ($cat in $criticalFiles.Keys) {
                foreach ($pattern in $criticalFiles[$cat]) {
                    if ($name -like $pattern -or $originalLocation -like "*\$pattern") {
                        $category = $cat
                        $priority = "High"
                        $reason = "$cat file from project"
                        break
                    }
                }
                if ($priority -eq "High") { break }
            }

            # Special cases for critical priority
            if ($name -eq "README.md" -or $name -eq "package.json" -or $name -eq ".gitignore") {
                $priority = "Critical"
                $reason = "Essential $category file"
            }

            # Git directories are critical
            if ($name -eq ".git" -or $originalLocation -like "*\.git\*") {
                $priority = "Critical"
                $category = "Git Repository"
                $reason = "Git repository data - CRITICAL!"
            }

            # Documentation from specific directories
            if ($originalLocation -like "*\development-wiki\*" -or $originalLocation -like "*\docs\*") {
                if ($priority -eq "Low") {
                    $priority = "Medium"
                    $category = "Documentation"
                    $reason = "Documentation file"
                }
            }

            # Worker/Cloudflare files
            if ($originalLocation -like "*\Cloudflare\*" -and ($name -like "*.js" -or $name -like "*.ts")) {
                $priority = "High"
                $category = "Worker Code"
                $reason = "Cloudflare Worker source code"
            }

            # Research data
            if ($originalLocation -like "*\research-data\*" -or $originalLocation -like "*\data\*") {
                $priority = "Medium"
                $category = "Research Data"
                $reason = "Research or data file"
            }

            # Scripts
            if ($name -like "*.ps1" -and $originalLocation -like "*\sharepoint-forensics\*") {
                $priority = "High"
                $category = "PowerShell Script"
                $reason = "SharePoint forensics script"
            }

            # Set default reason for project files
            if ([string]::IsNullOrWhiteSpace($reason)) {
                $priority = "Medium"
                $reason = "File from project directory"
            }
        }

        # Create result object
        $result = [PSCustomObject]@{
            Name = $name
            OriginalLocation = $originalLocation
            DateDeleted = $dateDeleted
            Size = $size
            Type = $type
            Priority = $priority
            Category = $category
            Reason = $reason
            IsProjectFile = $isProjectFile
            FromProject = $projectPath
        }

        $results += $result

    } catch {
        Write-Warning "Error processing item: $_"
        continue
    }
}

Write-Progress -Activity "Analyzing Recycle Bin Items" -Completed

# Filter and sort results
$projectFiles = $results | Where-Object { $_.IsProjectFile -eq $true } | Sort-Object @{Expression="Priority"; Descending=$true}, DateDeleted -Descending

Write-Host ""
Write-Host "=== Analysis Complete ===" -ForegroundColor Cyan
Write-Host "Total items in Recycle Bin: $totalItems" -ForegroundColor White
Write-Host "Project-related items: $($projectFiles.Count)" -ForegroundColor Yellow
Write-Host ""

# Count by priority
$critical = ($projectFiles | Where-Object { $_.Priority -eq "Critical" }).Count
$high = ($projectFiles | Where-Object { $_.Priority -eq "High" }).Count
$medium = ($projectFiles | Where-Object { $_.Priority -eq "Medium" }).Count
$low = ($projectFiles | Where-Object { $_.Priority -eq "Low" }).Count

Write-Host "Priority Breakdown:" -ForegroundColor Cyan
Write-Host "  Critical: $critical items" -ForegroundColor Red
Write-Host "  High:     $high items" -ForegroundColor Magenta
Write-Host "  Medium:   $medium items" -ForegroundColor Yellow
Write-Host "  Low:      $low items" -ForegroundColor Gray
Write-Host ""

# Export to CSV
try {
    $projectFiles | Export-Csv -Path $OutputPath -NoTypeInformation -Encoding UTF8
    Write-Host "CSV report saved to: $OutputPath" -ForegroundColor Green
} catch {
    Write-Warning "Failed to save CSV: $_"
}

# Generate detailed text report
$report = @"
====================================================================
  myTribe Development - Recycle Bin Analysis Report
  Generated: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")
====================================================================

SUMMARY
-------
Total items in Recycle Bin: $totalItems
Project-related items found: $($projectFiles.Count)

Priority Breakdown:
  - Critical: $critical items
  - High:     $high items
  - Medium:   $medium items
  - Low:      $low items

====================================================================
CRITICAL PRIORITY ITEMS (Immediate attention required)
====================================================================

"@

# Add critical items
$criticalItems = $projectFiles | Where-Object { $_.Priority -eq "Critical" }
if ($criticalItems.Count -gt 0) {
    foreach ($item in $criticalItems) {
        $report += @"

[CRITICAL] $($item.Name)
  Original Location: $($item.OriginalLocation)
  Date Deleted: $($item.DateDeleted)
  Size: $($item.Size)
  Type: $($item.Type)
  Category: $($item.Category)
  Reason: $($item.Reason)

  RECOMMENDATION: RESTORE IMMEDIATELY
  ------------------------------------------------------------

"@
    }
} else {
    $report += "`n  No critical items found.`n"
}

$report += @"

====================================================================
HIGH PRIORITY ITEMS (Should be reviewed)
====================================================================

"@

# Add high priority items
$highItems = $projectFiles | Where-Object { $_.Priority -eq "High" }
if ($highItems.Count -gt 0) {
    foreach ($item in $highItems) {
        $report += @"

[HIGH] $($item.Name)
  Original Location: $($item.OriginalLocation)
  Date Deleted: $($item.DateDeleted)
  Size: $($item.Size)
  Category: $($item.Category)
  Reason: $($item.Reason)

  RECOMMENDATION: Review and restore if needed
  ------------------------------------------------------------

"@
    }
} else {
    $report += "`n  No high priority items found.`n"
}

$report += @"

====================================================================
MEDIUM PRIORITY ITEMS (Review recommended)
====================================================================

"@

# Add medium priority items (limit to first 20)
$mediumItems = $projectFiles | Where-Object { $_.Priority -eq "Medium" } | Select-Object -First 20
if ($mediumItems.Count -gt 0) {
    foreach ($item in $mediumItems) {
        $report += "`n[$($item.Category)] $($item.Name) - $($item.OriginalLocation)"
    }
    if (($projectFiles | Where-Object { $_.Priority -eq "Medium" }).Count -gt 20) {
        $report += "`n`n  ... and $(($projectFiles | Where-Object { $_.Priority -eq "Medium" }).Count - 20) more medium priority items (see CSV for full list)"
    }
} else {
    $report += "`n  No medium priority items found."
}

$report += @"


====================================================================
ANALYSIS BY CATEGORY
====================================================================

"@

# Group by category
$byCategory = $projectFiles | Group-Object Category | Sort-Object Count -Descending
foreach ($cat in $byCategory) {
    $report += "`n$($cat.Name): $($cat.Count) items"
}

$report += @"


====================================================================
RECOMMENDATIONS
====================================================================

1. IMMEDIATE ACTIONS:
   - Review all CRITICAL items immediately
   - Restore any .git folders or repository data
   - Restore configuration files (package.json, wrangler.toml, etc.)

2. VERIFICATION STEPS:
   - Check each repository for git integrity (git status, git log)
   - Verify all package.json files exist in appropriate locations
   - Ensure all README.md and documentation files are present
   - Confirm Cloudflare Workers have their source code

3. DATA INTEGRITY:
   - Compare current structure with reorganization plan
   - Check research database files are intact
   - Verify Excel data files in data/ directory

4. RECOVERY PROCESS:
   - Open Recycle Bin in Windows Explorer
   - Sort by "Original Location"
   - Restore files one by one to their original locations
   - Or use PowerShell: Restore items programmatically

====================================================================
NEXT STEPS
====================================================================

1. Review this report and the CSV file
2. Open Windows Recycle Bin to verify items
3. Restore critical items immediately
4. Verify repository integrity after restoration
5. Run git status on all repositories
6. Update documentation if any files were lost permanently

====================================================================
For detailed item list, see: $OutputPath
====================================================================

"@

# Save report
try {
    $report | Out-File -FilePath $ReportPath -Encoding UTF8
    Write-Host "Detailed report saved to: $ReportPath" -ForegroundColor Green
} catch {
    Write-Warning "Failed to save report: $_"
}

Write-Host ""
Write-Host "=== Quick Summary of Critical/High Items ===" -ForegroundColor Cyan

# Display top critical and high priority items
$topItems = $projectFiles | Where-Object { $_.Priority -eq "Critical" -or $_.Priority -eq "High" } | Select-Object -First 15
if ($topItems.Count -gt 0) {
    foreach ($item in $topItems) {
        $color = if ($item.Priority -eq "Critical") { "Red" } else { "Magenta" }
        Write-Host "[$($item.Priority)] $($item.Name)" -ForegroundColor $color
        Write-Host "  Location: $($item.OriginalLocation)" -ForegroundColor Gray
        Write-Host "  Reason: $($item.Reason)" -ForegroundColor Gray
        Write-Host ""
    }

    if (($projectFiles | Where-Object { $_.Priority -eq "Critical" -or $_.Priority -eq "High" }).Count -gt 15) {
        Write-Host "... and more. See full report for complete list." -ForegroundColor Yellow
    }
} else {
    Write-Host "Good news! No critical or high priority project files found in Recycle Bin." -ForegroundColor Green
}

Write-Host ""
Write-Host "=== Analysis Complete ===" -ForegroundColor Cyan
Write-Host "Review the detailed report at: $ReportPath" -ForegroundColor White
Write-Host "CSV data available at: $OutputPath" -ForegroundColor White
Write-Host ""
