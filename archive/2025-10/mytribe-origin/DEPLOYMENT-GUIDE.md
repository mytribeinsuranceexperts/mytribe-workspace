# Deployment Guide: Security Fixes

## Pre-Deployment Checklist

### Code Changes Verified
- [x] src/utils/cors.ts created (27 lines)
- [x] src/utils/env.ts created (46 lines)
- [x] src/workers/index.ts updated
- [x] src/handlers/auth.ts updated
- [x] src/middleware/auth.ts updated

### Files to Deploy
1. src/utils/cors.ts (NEW)
2. src/utils/env.ts (NEW)
3. src/workers/index.ts (MODIFIED)
4. src/handlers/auth.ts (MODIFIED)
5. src/middleware/auth.ts (MODIFIED)

---

## Deployment Steps

### Step 1: Verify Environment Variables
Navigate to: Cloudflare Dashboard > Workers > Settings > Variables

Ensure these 5 secrets are configured:
- SUPABASE_URL
- SUPABASE_SERVICE_ROLE_KEY
- JWT_SECRET
- CLOUDFLARE_AWS_ACCESS_KEY_ID
- CLOUDFLARE_AWS_SECRET_ACCESS_KEY

All 5 MUST be present or worker will return 500 error.

### Step 2: Deploy to Cloudflare Workers
```bash
cd c:\Users\chris\myTribe-Development\mytribe-origin
npx wrangler deploy
```

### Step 3: Verify Deployment
Check deployment status in Cloudflare dashboard - should show "Active"

### Step 4: Test CORS from Allowed Origins

#### From Production Origin:
```bash
curl -i -X OPTIONS https://mytribe-origin-api.workers.dev/auth/login \
  -H "Origin: https://mytribe-origin.pages.dev" \
  -H "Access-Control-Request-Method: POST"
```

Expected: Access-Control-Allow-Origin: https://mytribe-origin.pages.dev

#### From Development Origin:
```bash
curl -i -X OPTIONS https://mytribe-origin-api.workers.dev/auth/login \
  -H "Origin: http://localhost:5173" \
  -H "Access-Control-Request-Method: POST"
```

Expected: Access-Control-Allow-Origin: http://localhost:5173

#### From Blocked Origin:
```bash
curl -i -X OPTIONS https://mytribe-origin-api.workers.dev/auth/login \
  -H "Origin: https://evil.com" \
  -H "Access-Control-Request-Method: POST"
```

Expected: Fallback to production origin

### Step 5: Test Auth Endpoint with CORS

```bash
curl -X POST https://mytribe-origin-api.workers.dev/auth/login \
  -H "Content-Type: application/json" \
  -H "Origin: http://localhost:5173" \
  -d '{"email":"test@example.com","password":"wrong"}'
```

Expected response should include CORS headers:
- Access-Control-Allow-Origin: http://localhost:5173

### Step 6: Monitor Logs
Check Recent Logs in Cloudflare Workers dashboard for validation errors.

### Step 7: Test Health Endpoint
```bash
curl https://mytribe-origin-api.workers.dev/health
```

Should return 200 with service info.

---

## Success Criteria

1. CORS restricted to whitelisted origins only
2. All error responses include CORS headers
3. Environment validation passes (no 500 errors from config)
4. No regression in authentication flow
5. Frontend can access from allowed origins

---

## Rollback Plan

If issues occur, rollback via Cloudflare Workers dashboard:
1. Go to Deployments
2. Click Rollback on previous version

---

## Allowed Origins

- Production: https://mytribe-origin.pages.dev
- Development: http://localhost:5173

To add new origins, edit src/utils/cors.ts and redeploy.

---

**Status:** Ready for Deployment
**Risk Level:** LOW
