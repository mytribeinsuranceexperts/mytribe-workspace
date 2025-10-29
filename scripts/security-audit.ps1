#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Comprehensive security audit script for myTribe Development workspace

.DESCRIPTION
    Scans the entire workspace for:
    - Exposed secrets in files
    - Unprotected .env files
    - Missing .gitignore patterns
    - Secrets in git history
    - Files outside workspace that may contain secrets

.PARAMETER Scope
    Scope of scan: 'workspace' (default), 'local', or 'full'

.PARAMETER OutputFormat
    Output format: 'console' (default) or 'json'

.EXAMPLE
    .\security-audit.ps1 -Scope workspace
    .\security-audit.ps1 -Scope full -OutputFormat json > audit-report.json
#>

param(
    [ValidateSet('workspace', 'local', 'full')]
    [string]$Scope = 'workspace',

    [ValidateSet('console', 'json')]
    [string]$OutputFormat = 'console'
)

$WORKSPACE_ROOT = "C:\Users\chris\myTribe-Development"
$REPOS = @(
    'mytribe-ai-research-platform',
    'website-and-cloudflare',
    'comparison-forms',
    'sharepoint-forensics',
    'powerbi-automation',
    'mytribe-origin'
)

# Secret patterns
$SECRET_PATTERNS = @(
    @{Pattern = 'sk-ant-[a-zA-Z0-9-_]+'; Name = 'Anthropic API Key'; Severity = 'CRITICAL'}
    @{Pattern = 'AKIA[0-9A-Z]{16}'; Name = 'AWS Access Key'; Severity = 'CRITICAL'}
    @{Pattern = 'sk-[a-zA-Z0-9]{32,}'; Name = 'OpenAI API Key'; Severity = 'CRITICAL'}
    @{Pattern = '[a-f0-9]{64}'; Name = 'Potential API Key (64 hex)'; Severity = 'HIGH'}
    @{Pattern = 'Bearer\s+[a-zA-Z0-9_-]{32,}'; Name = 'Bearer Token'; Severity = 'HIGH'}
    @{Pattern = '-----BEGIN (RSA |OPENSSH )?PRIVATE KEY-----'; Name = 'Private Key'; Severity = 'CRITICAL'}
    @{Pattern = 'postgres://[^:]+:[^@]+@'; Name = 'PostgreSQL URL with password'; Severity = 'HIGH'}
)

$findings = @{
    critical = @()
    high = @()
    medium = @()
    low = @()
    info = @()
}

function Write-Finding {
    param(
        [string]$Severity,
        [string]$Message,
        [string]$File = "",
        [string]$Remediation = ""
    )

    $finding = @{
        severity = $Severity
        message = $Message
        file = $File
        remediation = $Remediation
        timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    }

    $findings[$Severity.ToLower()] += $finding

    if ($OutputFormat -eq 'console') {
        $color = switch ($Severity) {
            'CRITICAL' { 'Red' }
            'HIGH' { 'Yellow' }
            'MEDIUM' { 'Cyan' }
            'LOW' { 'Gray' }
            'INFO' { 'White' }
        }

        Write-Host "[$Severity] $Message" -ForegroundColor $color
        if ($File) {
            Write-Host "  File: $File" -ForegroundColor DarkGray
        }
        if ($Remediation) {
            Write-Host "  Fix: $Remediation" -ForegroundColor DarkGray
        }
    }
}

function Scan-FileForSecrets {
    param([string]$FilePath)

    if (-not (Test-Path $FilePath)) {
        return
    }

    try {
        $content = Get-Content $FilePath -Raw -ErrorAction Stop
    } catch {
        return
    }

    foreach ($pattern in $SECRET_PATTERNS) {
        if ($content -match $pattern.Pattern) {
            Write-Finding -Severity $pattern.Severity `
                -Message "$($pattern.Name) detected" `
                -File $FilePath `
                -Remediation "Remove secret and rotate credential"
        }
    }
}

function Check-GitignoreCoverage {
    param([string]$RepoPath)

    $gitignorePath = Join-Path $RepoPath '.gitignore'

    if (-not (Test-Path $gitignorePath)) {
        Write-Finding -Severity 'HIGH' `
            -Message "Missing .gitignore file" `
            -File $RepoPath `
            -Remediation "Create .gitignore with security patterns"
        return
    }

    $gitignore = Get-Content $gitignorePath -Raw

    $requiredPatterns = @(
        @{Pattern = '\.env'; Name = '.env files'}
        @{Pattern = '\.mcp\.json'; Name = '.mcp.json'}
        @{Pattern = '\*\.key'; Name = '*.key files'}
        @{Pattern = '\*\.pem'; Name = '*.pem files'}
        @{Pattern = 'credentials\.json'; Name = 'credentials.json'}
    )

    foreach ($req in $requiredPatterns) {
        if ($gitignore -notmatch $req.Pattern) {
            Write-Finding -Severity 'MEDIUM' `
                -Message "Missing gitignore pattern: $($req.Name)" `
                -File $gitignorePath `
                -Remediation "Add pattern to .gitignore"
        }
    }
}

function Check-EnvFiles {
    param([string]$RepoPath)

    $envFiles = Get-ChildItem -Path $RepoPath -Filter '.env*' -Recurse -File | Where-Object {
        $_.Name -notlike '*.example'
    }

    foreach ($envFile in $envFiles) {
        # Check if file is tracked in git
        Push-Location $RepoPath
        $tracked = git ls-files $envFile.FullName 2>$null
        Pop-Location

        if ($tracked) {
            Write-Finding -Severity 'HIGH' `
                -Message "Environment file is tracked in git" `
                -File $envFile.FullName `
                -Remediation "Add to .gitignore and remove from git history"
        }

        # Scan for actual secrets
        Scan-FileForSecrets -FilePath $envFile.FullName
    }
}

function Scan-GitHistory {
    param([string]$RepoPath)

    Push-Location $RepoPath

    # Check for .env files in history
    $envInHistory = git log --all --full-history --oneline -- '*.env' 2>$null

    if ($envInHistory) {
        Write-Finding -Severity 'CRITICAL' `
            -Message ".env files found in git history" `
            -File $RepoPath `
            -Remediation "Use git filter-repo to remove from history"
    }

    # Check for .mcp.json in history
    $mcpInHistory = git log --all --full-history --oneline -- '.mcp.json' 2>$null

    if ($mcpInHistory) {
        Write-Finding -Severity 'HIGH' `
            -Message ".mcp.json found in git history" `
            -File $RepoPath `
            -Remediation "Verify no secrets were committed, rotate if needed"
    }

    Pop-Location
}

# Main execution
Write-Host ""
Write-Host "🔐 myTribe Development Security Audit" -ForegroundColor Cyan
Write-Host "=" * 60 -ForegroundColor Cyan
Write-Host ""

# Scan workspace repos
if ($Scope -in @('workspace', 'full')) {
    Write-Host "📂 Scanning workspace repositories..." -ForegroundColor Yellow

    foreach ($repo in $REPOS) {
        $repoPath = Join-Path $WORKSPACE_ROOT $repo

        if (-not (Test-Path $repoPath)) {
            continue
        }

        Write-Host "  Scanning: $repo" -ForegroundColor Gray

        Check-GitignoreCoverage -RepoPath $repoPath
        Check-EnvFiles -RepoPath $repoPath
        Scan-GitHistory -RepoPath $repoPath
    }
}

# Scan local machine
if ($Scope -in @('local', 'full')) {
    Write-Host ""
    Write-Host "💻 Scanning local machine for exposed secrets..." -ForegroundColor Yellow

    $localPaths = @(
        'C:\Users\chris\api-keys',
        'C:\Users\chris\.aws',
        'C:\Users\chris\.config\neonctl',
        'C:\Users\chris\AppData\Local\Temp'
    )

    foreach ($path in $localPaths) {
        if (Test-Path $path) {
            Get-ChildItem -Path $path -Recurse -File -ErrorAction SilentlyContinue | ForEach-Object {
                if ($_.Extension -in @('.env', '.txt', '.json', '.key', '.pem')) {
                    Scan-FileForSecrets -FilePath $_.FullName
                }
            }
        }
    }
}

# Output results
Write-Host ""
Write-Host "=" * 60 -ForegroundColor Cyan
Write-Host "📊 Audit Summary" -ForegroundColor Cyan
Write-Host ""

if ($OutputFormat -eq 'json') {
    $findings | ConvertTo-Json -Depth 10
} else {
    $totalFindings = $findings.critical.Count + $findings.high.Count + $findings.medium.Count + $findings.low.Count

    Write-Host "  CRITICAL: $($findings.critical.Count)" -ForegroundColor Red
    Write-Host "  HIGH:     $($findings.high.Count)" -ForegroundColor Yellow
    Write-Host "  MEDIUM:   $($findings.medium.Count)" -ForegroundColor Cyan
    Write-Host "  LOW:      $($findings.low.Count)" -ForegroundColor Gray
    Write-Host "  INFO:     $($findings.info.Count)" -ForegroundColor White
    Write-Host ""
    Write-Host "  Total:    $totalFindings" -ForegroundColor White
    Write-Host ""

    if ($totalFindings -eq 0) {
        Write-Host "✅ No security issues found!" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Security issues detected - review findings above" -ForegroundColor Yellow
    }
}

Write-Host ""
