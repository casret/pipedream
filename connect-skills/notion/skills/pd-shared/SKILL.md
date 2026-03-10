---
name: pd-shared
description: "Pipedream Connect: Shared auth, setup, CLI patterns, and generic proxy for making any API call to 2,000+ apps."
---

# Pipedream Connect — Shared Reference

All `pd-*` CLI tools use the Pipedream Connect proxy for authenticated API requests. Zero npm dependencies.

## Authentication

Set env vars directly or in a file pointed to by `PIPEDREAM_CONNECT_ENV`:

### Option A: JWT Token (recommended)

```bash
PIPEDREAM_TOKEN=eyJhbG...              # Short-lived OAuth access token (1 hour)
PIPEDREAM_PROJECT_ID=proj_xxx
PIPEDREAM_ENVIRONMENT=development
PIPEDREAM_EXTERNAL_USER_ID=user-123
```

### Option B: Client Credentials (developers / CI)

```bash
PIPEDREAM_CLIENT_ID=xxx
PIPEDREAM_CLIENT_SECRET=xxx
PIPEDREAM_PROJECT_ID=proj_xxx
PIPEDREAM_ENVIRONMENT=development
PIPEDREAM_EXTERNAL_USER_ID=user-123
```

### Per-App Account IDs

Each app needs a connected account ID (the `apn_` prefixed value):

```bash
PIPEDREAM_ACCOUNT_ID_SLACK_V2=apn_xxx
PIPEDREAM_ACCOUNT_ID_GITHUB=apn_xxx
PIPEDREAM_ACCOUNT_ID_NOTION=apn_xxx
```

The env var name is `PIPEDREAM_ACCOUNT_ID_` + the app slug in UPPER_SNAKE_CASE.

## Running CLI Tools

Run all commands from **the skill's directory** (the directory containing the SKILL.md you're reading):

```bash
npx tsx resources/pd-<app>.ts <command> [--flag value]
```

Output is JSON. Errors go to stderr. `--limit N` controls pagination.

## Generic Proxy — Making Any API Call

If the CLI tools don't cover an API endpoint you need, you can call any API directly through the Pipedream Connect proxy. The proxy handles authentication automatically.

### Writing a one-off script (IMPORTANT)

Scripts that use `makeProxyRequest` **must be saved inside the `resources/` directory** of a skill — that directory has a `package.json` with `"type": "module"` which is required for top-level `await` to work. Scripts placed in `/tmp/` or elsewhere, or using `npx tsx -e`, **will fail** with a CJS error.

**Correct pattern:**

```bash
# 1. Write the script INTO the resources/ directory of any pd-* skill
cat > resources/_custom.ts << 'EOF'
import { makeProxyRequest } from "./pd-proxy.js";
const resp = await makeProxyRequest({
  appSlug: "slack_v2",
  method: "GET",
  url: "https://slack.com/api/users.getPresence?user=U12345",
});
console.log(JSON.stringify(resp, null, 2));
EOF

# 2. Run it from the skill directory
npx tsx resources/_custom.ts

# 3. Clean up
rm resources/_custom.ts
```

**Common mistakes that will NOT work:**
- `npx tsx -e 'import ...; await ...'` — fails (CJS mode, no top-level await)
- Writing to `/tmp/script.ts` and importing from skill dir — fails (wrong module context)
- `node -e '...'` — fails (no TypeScript, no ESM)

### makeProxyRequest API

```typescript
import { makeProxyRequest } from "./pd-proxy.js";

// GET
const result = await makeProxyRequest({
  appSlug: "slack_v2",    // app slug (determines which account to use)
  method: "GET",
  url: "https://slack.com/api/emoji.list",
});

// POST with body
const result = await makeProxyRequest({
  appSlug: "github",
  method: "POST",
  url: "https://api.github.com/repos/owner/repo/issues",
  body: { title: "Bug report", body: "Details..." },
});

// With custom headers (e.g. Notion requires Notion-Version)
const result = await makeProxyRequest({
  appSlug: "notion",
  method: "POST",
  url: "https://api.notion.com/v1/search",
  body: { query: "Meeting Notes" },
  headers: { "Notion-Version": "2022-06-28" },
});
```

### Key Details

- **Auth is automatic.** The proxy injects the user's OAuth token or API key into the upstream request.
- **App slugs** determine which account to use: `slack_v2`, `github`, `notion`, `google_sheets`, `linear_app`, `jira`, etc.
- **Any API is supported** as long as Pipedream has an integration for that app (2,000+ apps).
- **Rate limits:** 1,000 requests per 5 minutes per project. 30-second timeout per request.

### Common App Slugs and Base URLs

| App | Slug | Base URL |
|-----|------|----------|
| Slack | `slack_v2` | `https://slack.com/api/` |
| GitHub | `github` | `https://api.github.com/` |
| Notion | `notion` | `https://api.notion.com/v1/` |
| Google Sheets | `google_sheets` | `https://sheets.googleapis.com/v4/` |
| Linear | `linear_app` | `https://api.linear.app/` |
| Airtable | `airtable_oauth` | `https://api.airtable.com/v0/` |
| HubSpot | `hubspot` | `https://api.hubapi.com/` |
| Stripe | `stripe` | `https://api.stripe.com/v1/` |

## Security

- **Never** output tokens or credentials
- **Confirm** with the user before write/delete commands
- If 401, the token may have expired — get a fresh one
