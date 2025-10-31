# Security Guidelines

## API Keys & Credentials

**Rule:** Never commit API keys, tokens, or passwords to git.

### MCP Server Authentication

**Two types, two approaches:**

#### Command-Based Servers (GitHub, Railway, etc.)
Use environment variables - processes inherit them automatically.

**Set:**
```powershell
[System.Environment]::SetEnvironmentVariable('GITHUB_PERSONAL_ACCESS_TOKEN', 'token', 'User')
```

**View:**
```powershell
$env:GITHUB_PERSONAL_ACCESS_TOKEN
```

**Required:**
- `GITHUB_PERSONAL_ACCESS_TOKEN` - GitHub token (repos, PRs, issues)
- `NEON_API_KEY` - Neon PostgreSQL (dev/staging database branching)
- `AUTH0_DOMAIN`, `AUTH0_CLIENT_ID`, `AUTH0_CLIENT_SECRET` - Auth0 (MCP OAuth 2.1)
- `MCP_AWS_ACCESS_KEY_ID`, `MCP_AWS_SECRET_ACCESS_KEY` - AWS Bedrock (MCP server, local development)
- `AWS_REGION` - AWS region (us-east-1)

**Production (Cloudflare Workers):**
- Store as `CLOUDFLARE_AWS_ACCESS_KEY_ID`, `CLOUDFLARE_AWS_SECRET_ACCESS_KEY` in Bitwarden
- Deploy to Cloudflare as `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY` (runtime expects standard names)

#### HTTP-Based Servers (Supabase, Cloudflare)
Tokens must be in `.mcp.json` (Claude Code can't expand env vars in HTTP headers).

**Security:** `.mcp.json` is gitignored - safe from accidental commits.

**After changes:** Restart Claude Code.

### Files to Keep Secure

- `.env` files - Never commit (use `.env.example` templates)
- `.mcp.json` - Already in `.gitignore` (REQUIRED for HTTP MCP servers)
- Database connection strings - Use environment variables
- API credentials - Use environment variables or secret management
- Master credential vault: `C:\Users\chris\api-keys\.env` (outside workspace)

### Credential Rotation

When rotating credentials:
1. Generate new key at provider
2. Update environment variable
3. Restart Claude Code/relevant services
4. Revoke old key at provider

---

**Last Updated:** 2025-10-27
