---
name: pd-slack-send
description: "Slack: Send a message to a channel or user."
---

# slack send

> **PREREQUISITE:** Read `../pd-shared/SKILL.md` for auth and `../pd-slack/SKILL.md` for all commands.

```bash
npx tsx resources/pd-slack.ts send --channel <ID> --text <TEXT>
```

| Flag | Required | Description |
|------|----------|-------------|
| `--channel` | ✓ | Channel ID (use `find-channel` to look up by name) |
| `--text` | ✓ | Message text (supports [mrkdwn](https://api.slack.com/reference/surfaces/formatting)) |

```bash
npx tsx resources/pd-slack.ts send --channel C0123456789 --text 'Deploy complete ✅'
```

> [!CAUTION]
> **Write** command — confirm with the user before executing.
