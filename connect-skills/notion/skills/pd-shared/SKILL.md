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

The tools are in the `resources/` directory alongside this skill:

```bash
npx tsx resources/pd-<app>.ts <command> [--flag value]
```

Output is JSON. Errors go to stderr. `--limit N` controls pagination.

## Generic Proxy — Making Any API Call

If the CLI tools don't cover an API endpoint you need, you can call any API directly through the Pipedream Connect proxy. The proxy handles authentication automatically — it injects the user's OAuth token or API key into the upstream request.

### How It Works

The proxy URL pattern is:

```
POST|GET|PUT|PATCH|DELETE
https://api.pipedream.com/v1/connect/{project_id}/proxy/{base64_url}
  ?external_user_id={user_id}
  &account_id={apn_xxx}
```

Where `{base64_url}` is the target API URL encoded as URL-safe Base64.

### Quick Reference: curl

```bash
# 1. Get a bearer token (skip if you have PIPEDREAM_TOKEN)
TOKEN=$(curl -s -X POST https://api.pipedream.com/v1/oauth/token \
  -H "Content-Type: application/json" \
  -d "{\"grant_type\":\"client_credentials\",\"client_id\":\"$PIPEDREAM_CLIENT_ID\",\"client_secret\":\"$PIPEDREAM_CLIENT_SECRET\"}" \
  | python3 -c "import sys,json;print(json.load(sys.stdin)['access_token'])")

# 2. Base64-encode the target URL
URL64=$(echo -n "https://slack.com/api/chat.postMessage" | base64 -w0 | tr '+/' '-_' | tr -d '=')

# 3. Make the proxied request
curl -X POST "https://api.pipedream.com/v1/connect/$PIPEDREAM_PROJECT_ID/proxy/$URL64?external_user_id=$PIPEDREAM_EXTERNAL_USER_ID&account_id=apn_xxx" \
  -H "Authorization: Bearer $TOKEN" \
  -H "x-pd-environment: $PIPEDREAM_ENVIRONMENT" \
  -H "Content-Type: application/json" \
  -d '{"channel": "C0123456789", "text": "Hello!"}'
```

### Quick Reference: Node.js / TypeScript

You can import the proxy engine directly from `resources/pd-proxy.ts`:

```typescript
import { makeProxyRequest } from "./resources/pd-proxy.js";

// GET request
const channels = await makeProxyRequest({
  appSlug: "slack_v2",
  method: "GET",
  url: "https://slack.com/api/conversations.list?limit=100",
});

// POST request with body
const result = await makeProxyRequest({
  appSlug: "github",
  method: "POST",
  url: "https://api.github.com/repos/owner/repo/issues",
  body: { title: "Bug report", body: "Details..." },
});

// Request with custom headers (forwarded to upstream via x-pd-proxy- prefix)
const page = await makeProxyRequest({
  appSlug: "notion",
  method: "POST",
  url: "https://api.notion.com/v1/search",
  body: { query: "Meeting Notes" },
  headers: { "Notion-Version": "2022-06-28" },
});
```

### Key Details

- **Auth is automatic.** The proxy looks up the user's connected account and injects their credentials (OAuth token, API key, etc.) into the upstream request. You never handle tokens yourself.
- **Custom headers** must use the `x-pd-proxy-` prefix when calling the proxy REST API directly. The `makeProxyRequest()` helper handles this for you.
- **App slugs** determine which account to use. The slug matches the Pipedream app name (e.g. `slack_v2`, `github`, `notion`, `google_sheets`, `linear`, `jira`).
- **Any API is supported** as long as Pipedream has an integration for that app. The proxy works with 2,000+ apps.
- **Rate limits:** 1,000 requests per 5 minutes per project. 30-second timeout per request.

### Common App Slugs and Base URLs

| App | Slug | Base URL |
|-----|------|----------|
| Slack | `slack_v2` | `https://slack.com/api/` |
| GitHub | `github` | `https://api.github.com/` |
| Notion | `notion` | `https://api.notion.com/v1/` |
| Google Sheets | `google_sheets` | `https://sheets.googleapis.com/v4/` |
| Linear | `linear_app` | `https://api.linear.app/` |
| Jira | `jira` | (uses relative paths — dynamic domain) |
| Airtable | `airtable_oauth` | `https://api.airtable.com/v0/` |
| HubSpot | `hubspot` | `https://api.hubapi.com/` |
| Stripe | `stripe` | `https://api.stripe.com/v1/` |
| Twilio | `twilio` | `https://api.twilio.com/` |

For apps with dynamic domains (Jira, GitLab, Zendesk), use **relative paths** instead of full URLs — the proxy resolves the domain from the user's account.

## Security

- **Never** output tokens or credentials
- **Confirm** with the user before write/delete commands
- If 401, the token may have expired — get a fresh one
