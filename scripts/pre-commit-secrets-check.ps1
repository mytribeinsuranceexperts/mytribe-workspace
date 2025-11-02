#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Pre-commit hook to detect secrets and sensitive data before committing

.DESCRIPTION
    Scans staged files for potential secrets, API keys, credentials, and other
    sensitive information. Prevents commits containing secrets from being made.

.NOTES
    Install: Copy to .git/hooks/pre-commit (without .ps1 extension)
    Or use with Husky for Node.js projects
#>

# Secret patterns to detect
$SECRET_PATTERNS = @(
    # API Keys
    @{Pattern = 'ANTHROPIC_API_KEY\s*=\s*sk-ant-[a-zA-Z0-9-_]+'; Name = 'Anthropic API Key'}
    @{Pattern = 'OPENAI_API_KEY\s*=\s*sk-[a-zA-Z0-9]+'; Name = 'OpenAI API Key'}
    @{Pattern = 'CLOUDFLARE_API_TOKEN\s*=\s*[a-zA-Z0-9_-]{40,}'; Name = 'Cloudflare API Token'}
    @{Pattern = 'WEBFLOW_API_KEY\s*=\s*[a-f0-9]{64}'; Name = 'Webflow API Key'}

    # AWS Credentials
    @{Pattern = 'AKIA[0-9A-Z]{16}'; Name = 'AWS Access Key'}
    @{Pattern = 'aws_secret_access_key\s*=\s*[A-Za-z0-9/+=]{40}'; Name = 'AWS Secret Key'}

    # Generic Secrets
    @{Pattern = '[''"]?[A-Z_]*API_KEY[''"]?\s*[:=]\s*[''"][^''"]+[''"]'; Name = 'API Key'}
    @{Pattern = '[''"]?[A-Z_]*SECRET[''"]?\s*[:=]\s*[''"][^''"]+[''"]'; Name = 'Secret'}
    @{Pattern = '[''"]?[A-Z_]*PASSWORD[''"]?\s*[:=]\s*[''"][^''"]+[''"]'; Name = 'Password'}
    @{Pattern = '[''"]?[A-Z_]*TOKEN[''"]?\s*[:=]\s*[''"][^''"]+[''"]'; Name = 'Token'}
    @{Pattern = 'Bearer\s+[a-zA-Z0-9_-]{32,}'; Name = 'Bearer Token'}

    # Private Keys
    @{Pattern = '-----BEGIN (RSA |OPENSSH )?PRIVATE KEY-----'; Name = 'Private Key'}
    @{Pattern = '-----BEGIN CERTIFICATE-----'; Name = 'Certificate'}

    # Database URLs with passwords
    @{Pattern = 'postgres://[^:]+:[^@]+@'; Name = 'PostgreSQL URL with password'}
    @{Pattern = 'mysql://[^:]+:[^@]+@'; Name = 'MySQL URL with password'}

    # JWT Secrets
    @{Pattern = 'JWT_SECRET\s*=\s*[a-zA-Z0-9_-]{32,}'; Name = 'JWT Secret'}
)

# Files that should never contain secrets
$SENSITIVE_FILES = @(
    '*.env',
    '.env.*',
    '*secrets*.txt',
    '*credentials*.txt',
    '*vars.txt',
    '*.pem',
    '*.key',
    '*.json.key',
    '*service-account*.json',
    '.mcp.json'
)

Write-Host "🔍 Checking staged files for secrets..." -ForegroundColor Cyan

# Get list of staged files
$stagedFiles = git diff --cached --name-only --diff-filter=ACM

if (-not $stagedFiles) {
    Write-Host "✅ No files staged for commit" -ForegroundColor Green
    exit 0
}

$secretsFound = $false
$fileIssues = @()

foreach ($file in $stagedFiles) {
    # Skip deleted files
    if (-not (Test-Path $file)) {
        continue
    }

    # Check if file matches sensitive file patterns
    foreach ($pattern in $SENSITIVE_FILES) {
        if ($file -like $pattern) {
            $fileIssues += "⚠️  BLOCKED: Attempting to commit sensitive file: $file"
            $secretsFound = $true
        }
    }

    # Read file content (skip binary files)
    try {
        $content = Get-Content $file -Raw -ErrorAction Stop
    } catch {
        continue
    }

    # Scan for secret patterns
    foreach ($secretPattern in $SECRET_PATTERNS) {
        if ($content -match $secretPattern.Pattern) {
            $matches = [regex]::Matches($content, $secretPattern.Pattern)
            foreach ($match in $matches) {
                $lineNumber = ($content.Substring(0, $match.Index) -split "`n").Count
                $fileIssues += "🔴 BLOCKED: $($secretPattern.Name) detected in ${file}:${lineNumber}"
                $secretsFound = $true
            }
        }
    }
}

if ($secretsFound) {
    Write-Host ""
    Write-Host "❌ COMMIT BLOCKED: Secrets detected in staged files!" -ForegroundColor Red
    Write-Host ""
    foreach ($issue in $fileIssues) {
        Write-Host $issue -ForegroundColor Yellow
    }
    Write-Host ""
    Write-Host "To fix:" -ForegroundColor Cyan
    Write-Host "  1. Remove secrets from files (use .env.local or environment variables)"
    Write-Host "  2. Ensure .gitignore blocks sensitive files"
    Write-Host "  3. Use .env.example for templates (with placeholder values)"
    Write-Host ""
    Write-Host "To bypass this check (NOT RECOMMENDED):" -ForegroundColor DarkGray
    Write-Host "  git commit --no-verify" -ForegroundColor DarkGray
    Write-Host ""
    exit 1
}

Write-Host "✅ No secrets detected - commit allowed" -ForegroundColor Green
exit 0
