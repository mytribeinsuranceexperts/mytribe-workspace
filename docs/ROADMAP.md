# AI Research Platform Roadmap

## Roadmap Summary

### Quick Wins (High Priority)
- **Admin controls and user management:** Email-based invitations, manage pending invites, password resets (self-service and admin-initiated).
- **Logging and error monitoring:** Frontend, backend, and AI pipeline telemetry plus full query/result logging.
- **User experience enhancements:** Query history per user and curated example prompts per dataset.
- **Staging environment:** Dedicated environment to validate data and features prior to production deploys.

### Longer-Term Objectives
- Conversational follow-ups for multi-turn analysis.
- Data pre-processing and staging pipeline before production ingest.
- External API integration with structured schema and access controls.
- Automated source attributions and internal content linking.
- Advanced external data discovery agent for authoritative sources.
- Long-term: end-to-end research task automation across internal/external data.

---

## Quick Win Detail

### 1. Admin Controls and User Management
- **Goal:** Empower platform admins to control access without developer intervention.
- **Scope:**
  - Admin dashboard with invite list, pending/accepted states, and resend/revoke actions.
  - Email invitation flow with unique, expiring tokens.
  - Password reset: user self-service flow (email token + reset form) and admin-triggered reset link.
- **Implementation Notes:**
  - Backend: extend FastAPI auth endpoints, add invitation + reset tables/models, enforce token expiry.
  - Frontend: create admin-only views; reuse JWT roles/claims for authorization.
  - Integrations: leverage existing email provider or configure new transactional email service.
- **Dependencies & Risks:** Requires reliable outbound email; ensure audit logging covers admin actions; consider rate limiting reset requests.
- **Acceptance Criteria:** Admins can invite & manage users end-to-end; users can reset passwords securely; all actions logged.

### 2. Logging and Error Monitoring
- **Goal:** Achieve observability across frontend, backend, and AI workflows.
- **Scope:**
  - Centralized logging (e.g., Railway logs + structured JSON or external service).
  - Capture client-side errors with user/session context.
  - Persist AI prompts, generated SQL, execution metadata, and final responses with PII safeguards.
- **Implementation Notes:**
  - Backend: introduce logging middleware, correlate request IDs, ship logs to chosen sink.
  - Frontend: integrate lightweight error tracking (Sentry, LogRocket, or custom API).
  - AI: wrap Claude calls with success/failure logging and latency metrics.
- **Dependencies & Risks:** Ensure compliance with data retention policies; redact sensitive tokens; plan storage for query logs.
- **Acceptance Criteria:** Errors surfaced within minutes, query history available for audits, dashboards/alerts configured.

### 3. User Experience Enhancements
- **Goal:** Increase usability and repeat engagement.
- **Scope:**
  - Per-user query history view with filters (date, dataset).
  - Ability to re-run or save notable queries.
  - Dataset-specific starter prompts surfaced on dashboard and query input.
- **Implementation Notes:**
  - Backend: extend schema for query history (reuse logging data where possible); expose APIs for listing/rerunning.
  - Frontend: add history route, quick actions, and prompt selector UI.
  - Content: collaborate with subject-matter experts to curate prompt library.
- **Dependencies & Risks:** Need pagination & access controls; ensure history respects rate limits; handle large result payload storage.
- **Acceptance Criteria:** Users can access past queries within <3 clicks; example prompts visible by default; analytics shows increased successful query rate.

### 4. Staging Environment
- **Goal:** Safely validate data and features before production releases.
- **Scope:**
  - Provision staging instances for backend, frontend, and database (Railway or alternative).
  - Automated deploy pipeline (CI) targeting staging prior to manual promotion.
  - Seed anonymized dataset for realistic testing.
- **Implementation Notes:**
  - Infrastructure: extend Railway configs (`railway.toml`) or adopt environment-specific variables.
  - Process: define promotion checklist, smoke tests, and rollback procedures.
  - Tooling: update docs (PRODUCTION/STAGING guide) and scripts (`start.sh`, deployment scripts) for environment selection.
- **Dependencies & Risks:** Additional cost for staging resources; keep secrets isolated; ensure data sync strategy avoids leakage.
- **Acceptance Criteria:** Every change deploys to staging first; QA sign-off recorded; production deploys become predictable and reversible.

---

## Next Steps
- Prioritize implementation order with stakeholders and align on tooling (email service, logging stack, staging infra).
- Break down work into tickets with estimates.
- Schedule discovery sessions for longer-term items once quick wins are underway.
