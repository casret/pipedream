---
name: pd-slack-threads
description: "Slack: Show active threads in a channel — find ongoing conversations."
---

# slack threads

> **PREREQUISITE:** Read `../pd-shared/SKILL.md` for auth and `../pd-slack/SKILL.md` for all commands.

```bash
npx tsx resources/pd-slack.ts threads --channel <ID> [--limit N]
```

Returns messages with replies: `ts`, `user`, `text`, `reply_count`, `latest_reply`. Use `ts` with `reply --thread` to join a conversation. Read-only.
