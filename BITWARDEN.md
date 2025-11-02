# Bitwarden Secrets Manager

Bitwarden Secrets Manager is a centralized, encrypted vault for storing development secrets (API keys, tokens, credentials) across myTribe projects. Accessible via CLI with PowerShell scripts.

**Plan:** Teams ($6/month) | **Organization:** myTribe Development | **Status:** Phase 1 Complete

---

## Projects & IDs

| Project | ID |
|---------|-----|
| website-and-cloudflare-development | b675d124-01a9-4cd7-a4dd-b38500c99f8b |
| mytribe-ai-research-platform-development | b099ac3b-1adf-4072-a118-b38500c99660 |
| shared-infrastructure-development | 70203acf-818b-4724-94b7-b38500c98327 |
| mytribe-origin-development | fcc0f3e0-cc91-4261-9804-b38500c97529 |
| github-ci-cd | d9d965d2-3dd9-4d8d-bd00-b38500c98c6e |
| personal-development | 7e554a6a-602a-4872-a336-b38500c9a9b8 |

---

## Shared Secrets Across Projects

These secrets are stored in Bitwarden and used by multiple projects:

- **ANTHROPIC_API_KEY** - Claude API access (mytribe-ai-research-platform, shared-infrastructure, mytribe-origin)
- **CLOUDFLARE_ACCOUNT_ID** - Cloudflare account identifier (website-and-cloudflare, shared-infrastructure, mytribe-origin)
- **CLOUDFLARE_API_TOKEN** - Cloudflare API authentication (website-and-cloudflare, shared-infrastructure, mytribe-origin)

**Note on Supabase Keys:** Supabase is deprecating `service_role` keys in favor of `SUPABASE_SECRET_API_KEY`. Projects using Supabase should configure BOTH keys for backward compatibility. See project-specific CLAUDE.md files for details.

Project-specific secrets are documented in each project's `CLAUDE.md` file.

---

## Usage

### Load Secrets for Development

```powershell
cd C:\Users\chris\myTribe-Development\<project-name>
.\scripts\load-secrets.ps1
# Secrets now available as environment variables
$env:CLOUDFLARE_ACCOUNT_ID
```

### List All Secrets

```powershell
bws secret list -o table
```

### List All Projects

```powershell
bws project list -o table
```

### Add New Secret

```powershell
bws secret create "SECRET_NAME" "secret-value" <project-id>
```

### Update Secret

```powershell
bws secret list -o table  # Get secret ID
bws secret edit <secret-id> --value "new-value"
```

### Delete Secret

```powershell
bws secret delete <secret-id>
```

---

## Project-Specific Configuration

Each project contains its own `CLAUDE.md` file with:
- Project-specific secrets list
- Load script location and usage
- Environment variable names
- Service-specific setup notes

Refer to the project's CLAUDE.md for details.

---

## Security Notes

- All development API keys, tokens, and credentials are stored in Bitwarden
- Production secrets stay in platform managers (Railway, Cloudflare, etc.)
- `BWS_ACCESS_TOKEN` is required - set as a Windows environment variable
- Never commit Bitwarden tokens to git
- Requires `bws` CLI v1.0.0+ (installed locally)

---

**Last Updated:** 2025-10-29 | **Phase 1 Status:** Complete
