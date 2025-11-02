# CQC Documentation Cleanup Script
# Organizes files into Keep, Archive, and deletes temporary files

$ErrorActionPreference = "Stop"

# Define base directories
$apiCqcDir = "C:\Users\chris\myTribe-Development\APIs\CQC"
$dataCqcDir = "C:\Users\chris\myTribe-Development\mytribe-origin\Data\CQC"

# Create archive directories
$archiveDir = Join-Path $apiCqcDir "archive"
$researchArchive = Join-Path $archiveDir "research-2025-11"
$sessionsArchive = Join-Path $archiveDir "sessions-2025-11"

Write-Host "=== CQC Documentation Cleanup ===" -ForegroundColor Cyan
Write-Host ""

# Create archive structure
Write-Host "Creating archive directories..." -ForegroundColor Yellow
New-Item -ItemType Directory -Force -Path $researchArchive | Out-Null
New-Item -ItemType Directory -Force -Path $sessionsArchive | Out-Null

# Files to archive from root workspace
$researchFilesToArchive = @(
    "RESEARCH_COMPLETE_SUMMARY.txt",
    "CQC-RESEARCH-SUMMARY-2025-11-02.md",
    "CQC-API-COMPLIANCE-RESEARCH.md",
    "CQC-API-INTEGRATION-GUIDE.md",
    "CQC-API-QUICK-SUMMARY.md"
)

Write-Host "Archiving research documentation from workspace root..." -ForegroundColor Yellow
foreach ($file in $researchFilesToArchive) {
    $sourcePath = Join-Path "C:\Users\chris\myTribe-Development" $file
    if (Test-Path $sourcePath) {
        $destPath = Join-Path $researchArchive $file
        Move-Item -Path $sourcePath -Destination $destPath -Force
        Write-Host "  Archived: $file" -ForegroundColor Green
    }
}

# Files to delete from workspace root (temporary)
$tempFilesToDelete = @(
    "c:UserschrismyTribe-Developmentmytribe-originDataCQCinitial-implementationtestssample_cqc_response.json"
)

Write-Host "`nDeleting temporary files from workspace root..." -ForegroundColor Yellow
foreach ($file in $tempFilesToDelete) {
    if (Test-Path $file) {
        Remove-Item -Path $file -Force
        Write-Host "  Deleted: $file" -ForegroundColor Red
    }
}

# Archive planning documents from APIs\CQC
$planningDocs = @(
    "INTEGRATION_PLAN.md",
    "FILTERING_OPTIONS.md",
    "SERVICE_TYPES_BREAKDOWN.md",
    "RESEARCH_VERIFICATION.md",
    "EMAIL_DRAFT.md"
)

Write-Host "`nArchiving planning docs from APIs\CQC..." -ForegroundColor Yellow
foreach ($file in $planningDocs) {
    $sourcePath = Join-Path $apiCqcDir $file
    if (Test-Path $sourcePath) {
        $destPath = Join-Path $researchArchive $file
        Move-Item -Path $sourcePath -Destination $destPath -Force
        Write-Host "  Archived: $file" -ForegroundColor Green
    }
}

# Archive session transcripts from mytribe-origin\Data\CQC
$sessionFiles = @(
    "PHASE_0_TRANSCRIPT.md",
    "SESSION_311025.md"
)

Write-Host "`nArchiving session transcripts from Data\CQC..." -ForegroundColor Yellow
foreach ($file in $sessionFiles) {
    $sourcePath = Join-Path $dataCqcDir $file
    if (Test-Path $sourcePath) {
        $destPath = Join-Path $sessionsArchive $file
        Move-Item -Path $sourcePath -Destination $destPath -Force
        Write-Host "  Archived: $file" -ForegroundColor Green
    }
}

# Archive test outputs
$testOutputDir = Join-Path $dataCqcDir "initial-implementation\tests\output"
if (Test-Path $testOutputDir) {
    $outputArchive = Join-Path $archiveDir "test-outputs-2025-11"
    New-Item -ItemType Directory -Force -Path $outputArchive | Out-Null

    Write-Host "`nArchiving test outputs..." -ForegroundColor Yellow
    Get-ChildItem -Path $testOutputDir -File | ForEach-Object {
        $destPath = Join-Path $outputArchive $_.Name
        Move-Item -Path $_.FullName -Destination $destPath -Force
        Write-Host "  Archived: $($_.Name)" -ForegroundColor Green
    }
}

Write-Host "`n=== Cleanup Complete ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "Summary:" -ForegroundColor White
Write-Host "  - Research docs archived to: $researchArchive" -ForegroundColor Gray
Write-Host "  - Session transcripts archived to: $sessionsArchive" -ForegroundColor Gray
Write-Host "  - Test outputs archived to: archive\test-outputs-2025-11" -ForegroundColor Gray
Write-Host ""
Write-Host "Files kept in place:" -ForegroundColor White
Write-Host "  APIs\CQC:" -ForegroundColor Gray
Write-Host "    - README.md (Quick reference)" -ForegroundColor Gray
Write-Host "    - COMPLIANCE.md (Compliance checklist)" -ForegroundColor Gray
Write-Host "    - COMPLIANCE_REPORT.md (Detailed compliance)" -ForegroundColor Gray
Write-Host ""
Write-Host "  Data\CQC:" -ForegroundColor Gray
Write-Host "    - README.md (Implementation status)" -ForegroundColor Gray
Write-Host "    - initial-implementation/ (All implementation files)" -ForegroundColor Gray
Write-Host ""
