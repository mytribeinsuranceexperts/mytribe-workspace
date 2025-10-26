# Check for .env files in Recycle Bin
$shell = New-Object -ComObject Shell.Application
$recycleBin = $shell.Namespace(0x0A)
$items = $recycleBin.Items()

Write-Host "Searching for .env files in Recycle Bin..." -ForegroundColor Yellow
Write-Host ""

$envFiles = @()

foreach ($item in $items) {
    $name = $recycleBin.GetDetailsOf($item, 0)
    if ($name -like "*.env*") {
        $originalLocation = $recycleBin.GetDetailsOf($item, 1)
        $dateDeleted = $recycleBin.GetDetailsOf($item, 2)
        $size = $recycleBin.GetDetailsOf($item, 3)

        Write-Host "FOUND: $name" -ForegroundColor Red
        Write-Host "  Original Location: $originalLocation" -ForegroundColor White
        Write-Host "  Date Deleted: $dateDeleted" -ForegroundColor White
        Write-Host "  Size: $size" -ForegroundColor White
        Write-Host ""

        $envFiles += [PSCustomObject]@{
            Name = $name
            Location = $originalLocation
            DateDeleted = $dateDeleted
            Size = $size
        }
    }
}

if ($envFiles.Count -eq 0) {
    Write-Host "No .env files found in Recycle Bin" -ForegroundColor Green
} else {
    Write-Host "Total .env files found: $($envFiles.Count)" -ForegroundColor Yellow
}
