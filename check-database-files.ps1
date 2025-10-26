# Check for database files in Recycle Bin
$shell = New-Object -ComObject Shell.Application
$recycleBin = $shell.Namespace(0x0A)
$items = $recycleBin.Items()

Write-Host "=== Searching for Database Files in Recycle Bin ===" -ForegroundColor Cyan
Write-Host ""

$dbExtensions = @('.db', '.sqlite', '.sqlite3', '.sql', '.mdb', '.accdb', '.dbf')
$foundDatabases = @()

foreach ($item in $items) {
    $name = $recycleBin.GetDetailsOf($item, 0)
    $originalLocation = $recycleBin.GetDetailsOf($item, 1)
    $dateDeleted = $recycleBin.GetDetailsOf($item, 2)
    $size = $recycleBin.GetDetailsOf($item, 3)

    foreach ($ext in $dbExtensions) {
        if ($name -like "*$ext") {
            Write-Host "FOUND: $name" -ForegroundColor Yellow
            Write-Host "  Type: Database file ($ext)" -ForegroundColor White
            Write-Host "  Original Location: $originalLocation" -ForegroundColor White
            Write-Host "  Date Deleted: $dateDeleted" -ForegroundColor White
            Write-Host "  Size: $size" -ForegroundColor White
            Write-Host ""

            $foundDatabases += [PSCustomObject]@{
                Name = $name
                Extension = $ext
                Location = $originalLocation
                DateDeleted = $dateDeleted
                Size = $size
            }
            break
        }
    }
}

if ($foundDatabases.Count -eq 0) {
    Write-Host "No database files found in Recycle Bin" -ForegroundColor Green
} else {
    Write-Host "=====================================" -ForegroundColor Red
    Write-Host "TOTAL DATABASE FILES FOUND: $($foundDatabases.Count)" -ForegroundColor Red
    Write-Host "=====================================" -ForegroundColor Red
}
