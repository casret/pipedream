---
name: pd-slack-triage
description: "Slack: Show recent messages summary for a channel — quick inbox scan."
---

# slack triage

> **PREREQUISITE:** Read `../pd-shared/SKILL.md` for auth and `../pd-slack/SKILL.md` for all commands.

```bash
npx tsx resources/pd-slack.ts triage --channel <ID> [--limit N]
```

Returns per-message: `ts`, `user`, `text` (truncated), `thread_reply_count`, `reactions`.

```bash
npx tsx resources/pd-slack.ts triage --channel C0123456789 --limit 10
```

Read-only. Use `history` for full messages.
