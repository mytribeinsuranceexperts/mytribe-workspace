# Bitwarden Secrets Manager - Migration Plan

**Workspace:** myTribe Development
**Cost:** $6/month (Teams plan)
**Status:** Ready for Implementation

---

## Phase 1 Checklist

**Goal:** Secure existing secrets in Bitwarden (2-3 hours)

- [ ] **Step 1:** Account Setup (30 min) - Upgrade to Teams, create organization & projects
- [ ] **Step 2:** Install CLI (15 min) - Download bws, add to PATH, verify installation
- [ ] **Step 3:** Create Machine Account (10 min) - Generate token, set BWS_ACCESS_TOKEN
- [ ] **Step 4:** Migrate Secrets (60 min) - Add secrets for P0/P1 repos
- [ ] **Step 5:** Create Load Scripts (30 min) - Copy template to each repo, test workflow
- [ ] **Step 6:** Verify & Document (15 min) - Test commands, update CLAUDE.md files

**Phase 2 (Rotation/Automation):** Deferred until Phase 1 stable

---

## Executive Summary

**Objective:** Centralize development secrets in Bitwarden Secrets Manager for security, auditability, and team collaboration.

**Scope:** 7 active repositories, ~40 development secrets

**Benefits:**
- Centralized, cloud-hosted, encrypted storage
- Team-ready secret sharing
- CLI/SDK programmatic access
- Audit trail for compliance
- Cost-effective vs AWS Secrets Manager ($6 vs $16+/month)

**Strategy:**
- Development secrets ONLY (production stays in platform managers)
- Gradual migration, one project at a time
- PowerShell automation for Windows environment
- Semi-automated rotation via scripts

---

## Plan Selection: Teams ($6/month)

| Feature | Free | **Teams** | Enterprise |
|---------|------|-----------|------------|
| Cost | $0 | **$6/user/month** | $12/user/month |
| Projects | 3 | Unlimited | Unlimited |
| Machine Accounts | 3 | 20 (+$1 each) | 50 (+$1 each) |
| Event Logs | ❌ | ✅ | ✅ |
| API Access | ❌ | ✅ | ✅ |

**Why Teams?** Need >3 projects (21 planned), >3 machine accounts (10 needed), event logs, and API access.

---

## Secrets Strategy

### Store in Bitwarden (Development)
- Database connection strings (local Docker/Supabase)
- API keys (dev/staging)
- Service account credentials (dev/staging)
- OAuth client IDs/secrets (dev apps)
- CLI tokens (GitHub, Cloudflare, Railway - personal)
- CI/CD deployment tokens

### Keep in Platform Managers (Production)
- Railway: `DATABASE_URL`, `ANTHROPIC_API_KEY`, `JWT_SECRET_KEY`
- Cloudflare Workers: API tokens, env vars, KV bindings
- Auth0: Client secrets
- AWS Bedrock: IAM roles (no keys)

**Why?** Platform-managed secrets are auto-injected, zero-latency, encrypted at rest, no external dependencies.

**Exception:** Backup production credentials in Bitwarden (read-only, disaster recovery).

---

## Project Structure

### Organization
- **Name:** myTribe Development
- **Plan:** Teams ($6/month)
- **Projects:** 21 (dev/staging/prod per repo + shared)
- **Machine Accounts:** 10 (20 included)

### Projects List

```
myTribe Development/
├── Repository Projects (18)
│   ├── mytribe-origin (dev, staging, prod)
│   ├── mytribe-ai-research-platform (dev, staging, prod)
│   ├── website-and-cloudflare (dev, prod)
│   ├── comparison-forms (dev, staging, prod)
│   ├── sharepoint-forensics (dev)
│   ├── powerbi-automation (dev)
│   └── shared-infrastructure (dev, staging, prod)
├── github-ci-cd
├── admin-emergency-access
└── personal-development
```

### Machine Accounts (10)

| Account | Purpose | Access |
|---------|---------|--------|
| local-dev-windows | Primary dev machine | All dev projects |
| github-actions-ci | CI/CD pipeline | CI/CD + deployment projects |
| cloudflare-workers-dev | Local Wrangler | Cloudflare dev projects |
| railway-dev | Railway CLI | Railway dev projects |
| emergency-access | Backup access | All projects (read-only) |
| _(5 slots reserved)_ | Future use | - |

---

## Repository Secrets Inventory

### Priority Matrix

| Repository | Priority | Secrets Count | Status | Notes |
|------------|----------|---------------|--------|-------|
| mytribe-origin | 🔴 P0 | 20+ | NEW | Blocks Week 1 development |
| mytribe-ai-research-platform | 🟡 P1 | 8+ | 85% complete | Active development |
| website-and-cloudflare | 🟡 P1 | 15+ | Production | Migrate from .env |
| shared-infrastructure | 🔴 P0 | 8+ | Active | Blocks all projects |
| comparison-forms | 🟢 P2 | 0 | Phase 2B | Defer to Phase 4 |
| sharepoint-forensics | 🟢 P2 | 2 | Optional | Using interactive auth |
| powerbi-automation | 🟢 P3 | 0 | Planning | Defer until implementation |

### Detailed Secrets by Repository

#### 1. mytribe-origin (P0 - NEW Project)

**Stack:** TypeScript, Cloudflare Workers, Supabase, AWS Bedrock, Auth0

**Development Secrets:**

| Category | Secrets |
|----------|---------|
| **Database** | `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `NEON_DATABASE_URL`, `AI_QUERY_DATABASE_URL` |
| **AWS Bedrock** | `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION`, `AWS_BEDROCK_MODEL_ID` |
| **Cloudflare** | `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`, `CLOUDFLARE_ZONE_ID`, `CLOUDFLARE_SERVICE_TOKEN` |
| **Auth0** | `AUTH0_CLIENT_ID`, `AUTH0_CLIENT_SECRET`, `AUTH0_DOMAIN` |
| **APIs** | `GITHUB_TOKEN`, `ANTHROPIC_API_KEY` |

**PowerShell Script:** `mytribe-origin/scripts/load-secrets.ps1`

#### 2. mytribe-ai-research-platform (P1)

**Stack:** Python 3.12, FastAPI, PostgreSQL, Claude API

**Development Secrets:**

| Category | Secrets |
|----------|---------|
| **Database** | `DATABASE_URL` (local Docker) |
| **APIs** | `ANTHROPIC_API_KEY` (dev key) |
| **Security** | `JWT_SECRET_KEY` (dev key) |
| **Google OAuth** | `GOOGLE_OAUTH_CLIENT_ID`, `GOOGLE_OAUTH_CLIENT_SECRET`, `GOOGLE_APPLICATION_CREDENTIALS`, `GCP_PROJECT_ID` |

**Note:** Production keys stay in Railway dashboard

**PowerShell Script:** `mytribe-ai-research-platform/scripts/load-secrets.ps1`

#### 3. website-and-cloudflare (P1)

**Stack:** JavaScript ES6+, Cloudflare Workers (7 active), Webflow

**Development Secrets:**

| Category | Secrets |
|----------|---------|
| **Webflow** | `WEBFLOW_API_KEY`, `WEBFLOW_API_TOKEN`, `WEBFLOW_WEBHOOK_SECRET` |
| **Cloudflare** | `CLOUDFLARE_READ_ALL_TOKEN`, `CLOUDFLARE_CREATE_TOKENS`, `CLOUDFLARE_WORKERS_TOKEN`, `CLOUDFLARE_ANALYTICS_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`, `CLOUDFLARE_ZONE_ID` |
| **Postmark** | `POSTMARK_API_KEY`, `POSTMARK_SENDER` |
| **Google Cloud** | `GOOGLE_CLOUD_API_KEY`, `GOOGLE_CLOUD_SERVICE_ACCOUNT` |
| **Power BI** | `POWERBI_CLIENT_ID`, `POWERBI_CLIENT_SECRET`, `POWERBI_TENANT_ID` |

**Current Location:** `C:\Users\chris\.api-keys\.env` (outside repo)

**PowerShell Script:** `website-and-cloudflare/scripts/load-secrets.ps1`

#### 4. shared-infrastructure (P0)

**Stack:** MCP servers, CLI tools, GitHub Actions

**Development Secrets:**

| Category | Secrets |
|----------|---------|
| **GitHub Actions** | `BWS_ACCESS_TOKEN`, `GITHUB_TOKEN`, `CLOUDFLARE_API_TOKEN`, `RAILWAY_TOKEN`, `SUPABASE_ACCESS_TOKEN` |
| **MCP Auth** | `CLOUDFLARE_SERVICE_TOKEN` (Week 0 blocker) |

**PowerShell Script:** `scripts/load-shared-secrets.ps1` (workspace root)

#### 5. comparison-forms (P2)

**Stack:** React 19, TypeScript, Vite, Shadow DOM

**Status:** Phase 2B (65% complete), no secrets yet

**Future Secrets (Phase 4):**
- `VITE_API_BASE_URL`, `VITE_API_KEY` (Phase 4 - Integration)
- `VITE_GA_TRACKING_ID`, `VITE_HOTJAR_ID` (Phase 5 - Analytics)

**Action:** Defer until Phase 4

#### 6. sharepoint-forensics (P2)

**Stack:** PowerShell 5.1+, PnP.PowerShell, SharePoint Online

**Current:** Interactive auth (MFA) - no stored secrets

**Optional (app-only auth):**
- `SHAREPOINT_CLIENT_ID`, `SHAREPOINT_CLIENT_SECRET`, `SHAREPOINT_TENANT_ID`, `SHAREPOINT_ADMIN_EMAIL`

**Recommendation:** Keep interactive auth (more secure)

#### 7. powerbi-automation (P3)

**Stack:** Node.js, PBIP parser (planned)

**Status:** Not implemented yet

**Future Secrets:**
- `POWERBI_CLIENT_ID`, `POWERBI_CLIENT_SECRET`, `POWERBI_TENANT_ID`, `POWERBI_WORKSPACE_ID`

**Action:** Defer until implementation

---

## PHASE 1: Setup & Migration

**Goal:** Secure existing secrets in Bitwarden, establish basic workflow

**Timeline:** Week 0 (2-3 hours)

**Phase 2 (Rotation/Automation) deferred until Phase 1 stable**

### Step 1: Account Setup (30 min)

1. **Upgrade Bitwarden** to Teams plan ($6/month)
2. **Create organization:** "myTribe Development"
3. **Create projects** (start with P0/P1 only):
   - mytribe-origin-development
   - mytribe-ai-research-platform-development
   - website-and-cloudflare-development
   - shared-infrastructure-development
   - github-ci-cd
   - personal-development

### Step 2: Install CLI (15 min)

```powershell
# Download from https://github.com/bitwarden/sdk-sm/releases
# Extract to C:\Program Files\Bitwarden CLI\
# Add to PATH

# Verify installation
bws --version
```

### Step 3: Create Machine Account (10 min)

1. Create machine account: `local-dev-windows`
2. Grant access to all development projects
3. Generate access token
4. Set environment variable:
   ```powershell
   [System.Environment]::SetEnvironmentVariable('BWS_ACCESS_TOKEN', 'your-token', 'User')
   ```

### Step 4: Migrate Secrets (60 min)

**Priority Order:** mytribe-origin → shared-infrastructure → mytribe-ai-research-platform → website-and-cloudflare

**For each repository:**

1. **Get project ID:**
   ```powershell
   $projectId = bws project list --output json | ConvertFrom-Json |
                Where-Object { $_.name -eq "mytribe-origin-development" } |
                Select-Object -ExpandProperty id
   ```

2. **Add secrets:**
   ```powershell
   bws secret create "SUPABASE_URL" "http://localhost:54321" $projectId
   bws secret create "SUPABASE_ANON_KEY" "your-key" $projectId
   # Repeat for all secrets
   ```

3. **For website-and-cloudflare (migrate from .env):**
   ```powershell
   $envPath = "C:\Users\chris\.api-keys\.env"
   Get-Content $envPath | ForEach-Object {
       if ($_ -match "^([^=]+)=(.+)$") {
           bws secret create $matches[1] $matches[2] $projectId
       }
   }
   ```

### Step 5: Create Load Scripts (30 min)

**Copy template script to each repo:** `scripts/load-secrets.ps1` (see Appendix A)

**Test workflow:**
```powershell
cd C:\Users\chris\myTribe-Development\mytribe-origin
.\scripts\load-secrets.ps1 -Environment "development"
# Verify: $env:SUPABASE_URL should show value
```

### Step 6: Verify & Document (15 min)

- Run test commands with loaded secrets
- Update project CLAUDE.md files
- Document setup in security guides

**Phase 1 Complete!** Development secrets are secured and accessible via CLI.

---

## PHASE 2: Automation & Advanced Features

**Status:** DEFERRED - Implement after Phase 1 stabilizes

**Goal:** Implement rotation, monitoring, and advanced workflows

**Timeline:** Future

### Rotation Strategy

**Semi-Automated Approach:**
- Manual trigger + automated execution
- Calendar reminders for rotation dates
- PowerShell scripts handle API calls

**Rotation Schedule:**

| Secret Type | Frequency | Method |
|-------------|-----------|--------|
| Service Tokens | 30 days | Script + manual revocation |
| API Keys | 90 days | Script + manual generation |
| OAuth Secrets | 90 days | Script + manual generation |
| Database Passwords | 180 days | Script + manual update |
| JWT Secrets | 90 days | Script + manual generation |

**Calendar Setup:**
- Set Outlook reminders for rotation dates
- Run `.\scripts\rotate-secret.ps1` when triggered
- Update Bitwarden notes with rotation date

### Automation Scripts (Future)

**Workspace Root Scripts:**
- `scripts/rotate-secret.ps1` - Semi-automated rotation (see Appendix B)
- `scripts/audit-secrets.ps1` - Monthly audit report (see Appendix C)
- `scripts/run-with-secrets.ps1` - Execute commands with secrets

**Advanced (Optional):**
- Ansible playbooks for Linux server password rotation
- Windows Task Scheduler for automated audits
- Kubernetes Operator (not needed for current stack)

### GitHub Actions Integration

**Add to repository secrets:**
- `BWS_ACCESS_TOKEN` (chicken/egg: not stored in Bitwarden)

**Workflow example:**
```yaml
# .github/workflows/deploy.yml
- name: Load secrets from Bitwarden
  env:
    BWS_ACCESS_TOKEN: ${{ secrets.BWS_ACCESS_TOKEN }}
  run: |
    curl -LO https://github.com/bitwarden/sdk-sm/releases/latest/download/bws-x86_64-pc-windows-msvc.zip
    unzip bws-x86_64-pc-windows-msvc.zip
    .\bws.exe secret list --output env > .env
```

---

## Security Best Practices

### DO
- Use machine accounts for automation (not user tokens)
- Grant least-privilege access per project
- Rotate secrets every 90 days (API keys, OAuth)
- Use unique secrets per environment (dev ≠ staging ≠ prod)
- Review event logs monthly
- Document rotation dates in secret notes
- Backup production credentials (read-only)

### DON'T
- Commit `BWS_ACCESS_TOKEN` to git
- Share access tokens between developers
- Use development secrets in production
- Store production secrets in Bitwarden (use platform managers)
- Skip rotation reminders
- Grant all-project access to single machine account

---

## Disaster Recovery

| Scenario | Impact | Mitigation | Recovery Time |
|----------|--------|------------|---------------|
| **Bitwarden Outage** | Cannot load dev secrets | Use emergency backup vault (1Password) | <5 min |
| **Lost Access Token** | Cannot auth to CLI | Regenerate token in web vault | <10 min |
| **Secrets Compromised** | Security breach | Rotate all via scripts, audit logs, regenerate tokens | 1-2 hours |

**Production Impact:** None (secrets in platform managers)

---

## Cost Analysis

### Monthly Comparison

| Solution | Cost Breakdown | Total |
|----------|----------------|-------|
| **Bitwarden Teams** | 1 user ($6) + 10 machines (free) | **$6/month** |
| **AWS Secrets Manager** | 40 secrets × $0.40 + 10k API calls | **~$16/month** |

**Savings:** $10/month ($120/year)

### Time Savings

| Task | Before | After | Savings |
|------|--------|-------|---------|
| Find secret | 2-5 min | <30 sec | 90% |
| Update across projects | 10-30 min | 1-2 min | 95% |
| Rotation | 1-2 hours (manual) | 10-15 min (script) | 90% |

**Estimated:** 3-5 hours/month saved

---

## FAQ

### Why not store production secrets in Bitwarden?

Platform-native managers are auto-injected (zero-latency), managed by platform SLAs, no external API calls, encrypted at rest, and integrated with monitoring. Bitwarden excels at **development secrets** needing CLI access and team sharing.

### How do I rotate secrets without API access?

Manual process:
1. Generate new secret via service web UI
2. Update Bitwarden: `bws secret edit <ID> --value "new-value"`
3. Update production platform (Railway, Cloudflare)
4. Test thoroughly
5. Revoke old secret

### What if Bitwarden is down?

- Production unaffected (secrets in platform managers)
- Development: Use emergency backup vault
- Bitwarden SLA: 99.9% uptime (~4 min/month downtime)

### How do I share secrets with future team members?

1. Add user to organization
2. Grant access to specific projects
3. User generates own machine account token
4. User runs `.\scripts\load-secrets.ps1`

### Can rotation be fully automated?

Partially - Ansible/PowerShell can rotate server passwords, but most API keys require manual generation (no rotation API). **Recommended:** Semi-automated scripts + calendar reminders.

### What about CI/CD secrets?

Store `BWS_ACCESS_TOKEN` in GitHub repo secrets. Workflow retrieves other secrets from Bitwarden at runtime.

---

## Next Steps

1. **Review this plan** - Confirm approach with team
2. **Upgrade Bitwarden** - Purchase Teams plan ($6/month)
3. **Complete Phase 1** - Setup account, install CLI, migrate P0/P1 repos (2-3 hours)
4. **Test thoroughly** - Verify local dev workflow works
5. **Defer Phase 2** - Implement rotation/automation after Phase 1 stabilizes

---

## APPENDIX A: load-secrets.ps1 Template

```powershell
<#
.SYNOPSIS
  Load secrets from Bitwarden Secrets Manager

.PARAMETER Environment
  Environment to load (development, staging, production)

.EXAMPLE
  .\scripts\load-secrets.ps1 -Environment "development"

.NOTES
  Requires: BWS_ACCESS_TOKEN environment variable
#>

[CmdletBinding()]
param(
    [Parameter(Mandatory=$true)]
    [ValidateSet("development", "staging", "production")]
    [string]$Environment
)

# Verify BWS_ACCESS_TOKEN
if (-not $env:BWS_ACCESS_TOKEN) {
    Write-Error "BWS_ACCESS_TOKEN not set"
    exit 1
}

# Auto-detect project name from repo
$repoName = (Get-Item $PSScriptRoot).Parent.Name
$ProjectName = "$repoName-$Environment"

Write-Host "Loading secrets from: $ProjectName" -ForegroundColor Cyan

# Get all secrets
try {
    $secrets = bws secret list --output json | ConvertFrom-Json
}
catch {
    Write-Error "Failed to retrieve secrets: $_"
    exit 1
}

# Filter by project and export
$projectSecrets = $secrets | Where-Object { $_.projectName -like "*$Environment*" }

if ($projectSecrets.Count -eq 0) {
    Write-Warning "No secrets found for: $ProjectName"
    exit 0
}

$count = 0
foreach ($secret in $projectSecrets) {
    [System.Environment]::SetEnvironmentVariable($secret.key, $secret.value, 'Process')
    Write-Host "  ✓ $($secret.key)" -ForegroundColor Green
    $count++
}

Write-Host "`nLoaded $count secrets successfully!" -ForegroundColor Green
```

---

## APPENDIX B: rotate-secret.ps1 Template (Phase 2)

```powershell
<#
.SYNOPSIS
  Rotate a secret in Bitwarden

.PARAMETER SecretKey
  Secret key to rotate (e.g., "GITHUB_TOKEN")

.PARAMETER Service
  Service type (github, cloudflare, anthropic, etc.)

.PARAMETER ProjectName
  Bitwarden project name

.EXAMPLE
  .\scripts\rotate-secret.ps1 -SecretKey "GITHUB_TOKEN" -Service "github" -ProjectName "mytribe-origin-development"
#>

[CmdletBinding()]
param(
    [Parameter(Mandatory=$true)]
    [string]$SecretKey,

    [Parameter(Mandatory=$true)]
    [ValidateSet("github", "cloudflare", "anthropic", "auth0", "railway")]
    [string]$Service,

    [Parameter(Mandatory=$true)]
    [string]$ProjectName
)

Write-Host "Rotating secret: $SecretKey" -ForegroundColor Cyan

# Get project and secret IDs
$projects = bws project list --output json | ConvertFrom-Json
$project = $projects | Where-Object { $_.name -eq $ProjectName }

if (-not $project) {
    Write-Error "Project not found: $ProjectName"
    exit 1
}

$secrets = bws secret list --output json | ConvertFrom-Json
$currentSecret = $secrets | Where-Object {
    $_.key -eq $SecretKey -and $_.projectId -eq $project.id
}

if (-not $currentSecret) {
    Write-Error "Secret not found: $SecretKey"
    exit 1
}

# Prompt for new value (service-specific instructions)
switch ($Service) {
    "github" {
        Write-Host "Generate token at: https://github.com/settings/tokens"
        $newValue = Read-Host "Enter new token" -AsSecureString
    }
    "cloudflare" {
        Write-Host "Generate token at: https://dash.cloudflare.com/profile/api-tokens"
        $newValue = Read-Host "Enter new token" -AsSecureString
    }
    "anthropic" {
        Write-Host "Generate key at: https://console.anthropic.com/settings/keys"
        $newValue = Read-Host "Enter new key" -AsSecureString
    }
    default {
        Write-Error "Service rotation not implemented: $Service"
        exit 1
    }
}

# Convert SecureString to plain text
$BSTR = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($newValue)
$plainValue = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto($BSTR)

# Update Bitwarden
bws secret edit $currentSecret.id --value $plainValue

if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Secret rotated successfully!" -ForegroundColor Green

    # Log rotation
    $logEntry = @{
        Timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
        SecretKey = $SecretKey
        Service = $Service
        ProjectName = $ProjectName
    } | ConvertTo-Json

    Add-Content -Path "C:\Users\chris\myTribe-Development\.secrets-audit.jsonl" -Value $logEntry

    Write-Host "REMINDER: Update production secrets manually" -ForegroundColor Yellow
}
else {
    Write-Error "Failed to update Bitwarden"
    exit 1
}
```

---

## APPENDIX C: audit-secrets.ps1 Template (Phase 2)

```powershell
<#
.SYNOPSIS
  Audit secrets across all Bitwarden projects

.DESCRIPTION
  Lists all secrets with rotation status and recommendations

.EXAMPLE
  .\scripts\audit-secrets.ps1
#>

Write-Host "Bitwarden Secrets Audit" -ForegroundColor Cyan
Write-Host "========================`n" -ForegroundColor Cyan

# Get all secrets
$secrets = bws secret list --output json | ConvertFrom-Json

# Group by project
$projectGroups = $secrets | Group-Object -Property projectName

foreach ($group in $projectGroups) {
    Write-Host "`n$($group.Name)" -ForegroundColor Yellow
    Write-Host ("=" * $group.Name.Length) -ForegroundColor Yellow

    foreach ($secret in $group.Group) {
        Write-Host "  $($secret.key)" -ForegroundColor Green

        # Check rotation date from notes
        if ($secret.note -match "Last rotated: (\d{4}-\d{2}-\d{2})") {
            $lastRotated = [DateTime]::Parse($matches[1])
            $daysSince = (Get-Date) - $lastRotated

            Write-Host "    Last rotated: $($lastRotated.ToString('yyyy-MM-dd')) ($([math]::Floor($daysSince.TotalDays)) days ago)" -ForegroundColor Gray

            # Rotation recommendations
            if ($daysSince.TotalDays -gt 90) {
                Write-Host "    ⚠️  OVERDUE: Rotate now" -ForegroundColor Red
            } elseif ($daysSince.TotalDays -gt 60) {
                Write-Host "    ⚡ DUE SOON: Rotate within 30 days" -ForegroundColor Yellow
            } else {
                Write-Host "    ✓ Current" -ForegroundColor Green
            }
        } else {
            Write-Host "    ⚠️  No rotation date recorded" -ForegroundColor Yellow
        }
    }
}

Write-Host "`nTotal secrets: $($secrets.Count)" -ForegroundColor Cyan
```

---

## Resources

**Bitwarden Documentation:**
- [Secrets Manager Overview](https://bitwarden.com/help/secrets-manager-overview/)
- [CLI Documentation](https://bitwarden.com/help/secrets-manager-cli/)
- [Developer Quick Start](https://bitwarden.com/help/developer-quick-start/)

**Workspace Documentation:**
- CLAUDE.md - Security practices
- development-wiki/standards/security-practices.md
- Project-specific CLAUDE.md files

---

**Document Version:** 2.0
**Last Updated:** 2025-10-28
**Status:** Phase 1 Ready - Phase 2 Deferred

<!-- End of BITWARDEN-MIGRATION-PLAN.md -->
