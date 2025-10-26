# Restore .env.example file from Recycle Bin to website-and-cloudflare repo
# Target: .env.example from "Development Projects" (2.64 KB, deleted Oct 13)

Write-Host "=== Restoring .env.example File from Recycle Bin ===" -ForegroundColor Cyan
Write-Host ""

# Target location for restored file
$targetLocation = "C:\Users\chris\myTribe Development\website-and-cloudflare"
$targetFile = Join-Path $targetLocation ".env.example"

# Check if target directory exists
if (-not (Test-Path $targetLocation)) {
    Write-Host "ERROR: Target directory does not exist: $targetLocation" -ForegroundColor Red
    exit 1
}

# Initialize Shell COM object
$shell = New-Object -ComObject Shell.Application
$recycleBin = $shell.Namespace(0x0A)

if ($null -eq $recycleBin) {
    Write-Host "ERROR: Unable to access Recycle Bin" -ForegroundColor Red
    exit 1
}

# Get all items in Recycle Bin
$items = $recycleBin.Items()

Write-Host "Searching for .env.example file..." -ForegroundColor Yellow
Write-Host "  Looking for: .env.example" -ForegroundColor Gray
Write-Host "  From: C:\Users\chris\Development Projects" -ForegroundColor Gray
Write-Host "  Size: 2.64 KB" -ForegroundColor Gray
Write-Host ""

$found = $false
$targetItem = $null

foreach ($item in $items) {
    $name = $recycleBin.GetDetailsOf($item, 0)
    $originalLocation = $recycleBin.GetDetailsOf($item, 1)
    $size = $recycleBin.GetDetailsOf($item, 3)

    # Match criteria: name is ".env.example", from Development Projects, size is 2.64 KB
    if ($name -eq ".env.example" -and
        $originalLocation -eq "C:\Users\chris\Development Projects" -and
        $size -like "*2.6*") {

        $found = $true
        $targetItem = $item

        Write-Host "FOUND target file!" -ForegroundColor Green
        Write-Host "  Name: $name" -ForegroundColor White
        Write-Host "  Original Location: $originalLocation" -ForegroundColor White
        Write-Host "  Size: $size" -ForegroundColor White
        Write-Host ""
        break
    }
}

if (-not $found) {
    Write-Host "ERROR: Could not find the target .env.example file in Recycle Bin" -ForegroundColor Red
    Write-Host ""
    Write-Host "Searching for any .env.example files..." -ForegroundColor Yellow
    foreach ($item in $items) {
        $name = $recycleBin.GetDetailsOf($item, 0)
        if ($name -eq ".env.example") {
            $originalLocation = $recycleBin.GetDetailsOf($item, 1)
            $size = $recycleBin.GetDetailsOf($item, 3)
            Write-Host "  Found: $name from $originalLocation ($size)" -ForegroundColor Gray
        }
    }
    exit 1
}

# Check if file already exists at target location
if (Test-Path $targetFile) {
    Write-Host "WARNING: A .env.example file already exists at target location" -ForegroundColor Yellow
    Write-Host "  Location: $targetFile" -ForegroundColor White
    Write-Host ""

    $timestamp = Get-Date -Format "yyyy-MM-dd_HHmmss"
    $backupFile = Join-Path $targetLocation ".env.example.backup.$timestamp"

    Write-Host "Creating backup of existing file..." -ForegroundColor Yellow
    Copy-Item $targetFile $backupFile
    Write-Host "  Backup created: $backupFile" -ForegroundColor Green
    Write-Host ""
}

# Restore the file
Write-Host "Restoring file to: $targetLocation" -ForegroundColor Yellow
Write-Host ""

try {
    # Get the folder object for the target location
    $targetFolder = $shell.Namespace($targetLocation)

    if ($null -eq $targetFolder) {
        Write-Host "ERROR: Unable to access target folder" -ForegroundColor Red
        exit 1
    }

    # Move the item from Recycle Bin to target folder
    $targetFolder.MoveHere($targetItem)

    # Wait a moment for the file system to catch up
    Start-Sleep -Milliseconds 500

    # Verify the file was restored
    if (Test-Path $targetFile) {
        Write-Host "SUCCESS!" -ForegroundColor Green
        Write-Host ""
        Write-Host "File restored to: $targetFile" -ForegroundColor Green
        Write-Host ""

        # Show file info
        $fileInfo = Get-Item $targetFile
        Write-Host "File Information:" -ForegroundColor Cyan
        Write-Host "  Full Path: $($fileInfo.FullName)" -ForegroundColor White
        Write-Host "  Size: $($fileInfo.Length) bytes" -ForegroundColor White
        Write-Host "  Last Modified: $($fileInfo.LastWriteTime)" -ForegroundColor White
        Write-Host ""

        Write-Host "NOTES:" -ForegroundColor Yellow
        Write-Host "  1. This file is a TEMPLATE - it should be safe to commit to git" -ForegroundColor White
        Write-Host "  2. It documents which environment variables are needed" -ForegroundColor White
        Write-Host "  3. Developers copy this to .env and fill in actual values" -ForegroundColor White
        Write-Host "  4. Make sure it contains NO actual API keys or secrets" -ForegroundColor White
        Write-Host ""

    } else {
        Write-Host "ERROR: File restoration appeared to succeed but file not found at target location" -ForegroundColor Red
        Write-Host "The file may have been restored to its original location instead." -ForegroundColor Yellow
        Write-Host "Check: C:\Users\chris\Development Projects\.env.example" -ForegroundColor White
        Write-Host ""
        Write-Host "If found there, move it manually:" -ForegroundColor Yellow
        Write-Host "  Move-Item 'C:\Users\chris\Development Projects\.env.example' '$targetFile'" -ForegroundColor White
        exit 1
    }

} catch {
    Write-Host "ERROR during restoration: $_" -ForegroundColor Red
    Write-Host ""
    Write-Host "Alternative method: Restore manually via Windows Explorer" -ForegroundColor Yellow
    Write-Host "  1. Open Recycle Bin" -ForegroundColor White
    Write-Host "  2. Find .env.example (2.64 KB, from Development Projects)" -ForegroundColor White
    Write-Host "  3. Right-click and select 'Restore'" -ForegroundColor White
    Write-Host "  4. It will restore to: C:\Users\chris\Development Projects\" -ForegroundColor White
    Write-Host "  5. Then move it to: $targetLocation" -ForegroundColor White
    exit 1
}
