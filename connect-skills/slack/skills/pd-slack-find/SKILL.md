---
name: pd-slack-find
description: "Slack: Find channels by name or users by name or email."
---

# slack find-channel / find-user

> **PREREQUISITE:** Read `../pd-shared/SKILL.md` for auth and `../pd-slack/SKILL.md` for all commands.

Run from **this skill's directory**:

```bash
npx tsx resources/pd-slack.ts find-channel --name general
npx tsx resources/pd-slack.ts find-user --name Giao
npx tsx resources/pd-slack.ts find-user --email alice@company.com
```

- `--name` fuzzy-matches against username, real name, and display name
- `--email` does an exact lookup (faster, returns one result)

**Always use these before `send` or `reply`** — Slack requires IDs, not names. Read-only.
