# Security Fixes: Before and After Code Snippets

## Fix 1: Restricted CORS (CRITICAL)

### BEFORE - Unrestricted Access
```typescript
// src/workers/index.ts - Line 31
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',  // VULNERABLE: Allows ANY domain
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Content-Type': 'application/json',
};
```

**Risk:** CSRF attacks, XSS from malicious sites, data exfiltration

### AFTER - Whitelisted Origins Only
```typescript
// src/utils/cors.ts (NEW FILE)
export const ALLOWED_ORIGINS = [
  'https://mytribe-origin.pages.dev',  // Production
  'http://localhost:5173',              // Development
];

export function getCorsHeaders(requestOrigin: string | null): Record<string, string> {
  const origin = isAllowedOrigin(requestOrigin) ? requestOrigin : ALLOWED_ORIGINS[0];
  return {
    'Access-Control-Allow-Origin': origin,  // SECURE: Dynamic based on whitelist
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400',
    'Content-Type': 'application/json',
  };
}

// src/workers/index.ts - Line 30, 49
const requestOrigin = request.headers.get('origin');
const corsHeaders = getCorsHeaders(requestOrigin);  // Dynamic per request
```

**Security:** Only whitelisted origins can access API

---

## Fix 2: Add CORS Headers to Error Responses (HIGH)

### BEFORE - Missing CORS Headers
```typescript
// src/handlers/auth.ts - Line 48-58
if (!body.email || !body.password) {
  return new Response(
    JSON.stringify({
      error: 'Validation Failed',
      message: 'Email and password are required',
    }),
    {
      status: 400,
      headers: { 'Content-Type': 'application/json' }  // MISSING: CORS headers
    }
  );
}
```

**Result:** Browser blocks error response - Frontend gets CORS error, not the actual error message

### AFTER - CORS Headers on All Errors
```typescript
// src/handlers/auth.ts - Line 37-41
export async function handleLogin(
  request: Request,
  env: Env,
  corsHeaders: Record<string, string>  // NEW: corsHeaders parameter
): Promise<Response>

// Line 52-62
if (!body.email || !body.password) {
  return new Response(
    JSON.stringify({
      error: 'Validation Failed',
      message: 'Email and password are required',
    }),
    {
      status: 400,
      headers: corsHeaders  // FIXED: Includes CORS headers
    }
  );
}
```

**All 5 Error Responses Updated:**
- Line 60: Validation error (400) - corsHeaders
- Line 86: Database error (500) - corsHeaders
- Line 108: User not found (401) - corsHeaders
- Line 126: Invalid password (401) - corsHeaders
- Line 168: Catch block error (500) - corsHeaders

**Security:** Frontend can now properly handle error responses with correct CORS headers

---

## Fix 3: Environment Validation (HIGH)

### BEFORE - No Validation
```typescript
// src/workers/index.ts
export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    // VULNERABLE: env secrets used without checking if they exist
    // If JWT_SECRET missing, will fail cryptically when signing tokens
  }
}
```

**Risk:** Missing secrets cause runtime errors with unclear error messages

### AFTER - Validation at Startup
```typescript
// src/utils/env.ts (NEW FILE)
export const REQUIRED_ENV_VARS = [
  'SUPABASE_URL',
  'SUPABASE_SERVICE_ROLE_KEY',
  'JWT_SECRET',
  'CLOUDFLARE_AWS_ACCESS_KEY_ID',
  'CLOUDFLARE_AWS_SECRET_ACCESS_KEY',
];

export function validateEnvironment(env: Env): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  for (const varName of REQUIRED_ENV_VARS) {
    const value = env[varName as keyof Env];
    if (!value || typeof value !== 'string' || value.trim() === '') {
      errors.push(`Missing required environment variable: ${varName}`);
    }
  }
  return { valid: errors.length === 0, errors };
}

// src/workers/index.ts - Line 32-46
const envValidation = validateEnvironment(env);
if (!envValidation.valid) {
  console.error('Environment validation failed:', envValidation.errors);
  return new Response(
    JSON.stringify({
      error: 'Configuration Error',
      message: 'Server is not properly configured',
    }),
    { status: 500, headers: { 'Content-Type': 'application/json' } }
  );
}
```

**Security:** Missing secrets detected immediately with clear error message

---

## Updated Function Signatures

### handleLogin() - Now Accepts corsHeaders
```typescript
// BEFORE
export async function handleLogin(request: Request, env: Env): Promise<Response>

// AFTER
export async function handleLogin(
  request: Request,
  env: Env,
  corsHeaders: Record<string, string>
): Promise<Response>

// CALLER - Line 84 in index.ts
return await handleLogin(request, env, corsHeaders);
```

### createAuthErrorResponse() - Now Accepts Optional corsHeaders
```typescript
// BEFORE
export function createAuthErrorResponse(error: AuthenticationError): Response

// AFTER
export function createAuthErrorResponse(
  error: AuthenticationError,
  corsHeaders?: Record<string, string>
): Response

// CALLER - Line 136 in index.ts
return createAuthErrorResponse(error, corsHeaders);
```

---

## Summary of Changes

| Component | Lines Changed | Type | Impact |
|-----------|---------------|------|--------|
| CORS Utility | src/utils/cors.ts | NEW | Prevents CSRF attacks |
| Env Validator | src/utils/env.ts | NEW | Detects config errors |
| Worker Index | src/workers/index.ts | 10+ lines | Integrates CORS + validation |
| Auth Handler | src/handlers/auth.ts | 5 responses | Adds CORS to all errors |
| Auth Middleware | src/middleware/auth.ts | 8 lines | Accepts optional corsHeaders |

**Total Changes:** ~150 lines of new/modified code
**Security Impact:** CRITICAL - Fixes 3 major vulnerabilities
**Performance Impact:** None (minimal overhead)
**Testing Impact:** Easy to verify with curl

