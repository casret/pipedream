---
name: pd-slack
description: "Slack: Send messages, search conversations, list channels and users, reply to threads, and add reactions."
---

# pd-slack

> **PREREQUISITE:** Read `../pd-shared/SKILL.md` for auth and setup.

Run all commands from **this skill's directory** (the directory containing this SKILL.md):

```bash
npx tsx resources/pd-slack.ts <command> [flags]
```

| Command | Description | Key Flags |
|---------|-------------|-----------|
| `send` | Send a message | `--channel` ✓, `--text` ✓ |
| `reply` | Reply to a thread | `--channel` ✓, `--thread` ✓, `--text` ✓ |
| `triage` | Recent messages summary | `--channel` ✓, `--limit` |
| `threads` | Active threads | `--channel` ✓, `--limit` |
| `search` | Search messages | `--query` ✓, `--limit` |
| `channels` | List channels | `--types` (public_channel,private_channel), `--limit` |
| `find-channel` | Find channel by name | `--name` ✓ |
| `users` | List users | `--limit` |
| `find-user` | Find user by name or email | `--name` or `--email` ✓ |
| `react` | Add a reaction | `--channel` ✓, `--timestamp` ✓, `--emoji` ✓ |
| `update` | Update a message | `--channel` ✓, `--ts` ✓, `--text` ✓ |
| `topic` | Set channel topic | `--channel` ✓, `--topic` ✓ |
| `history` | Raw channel history | `--channel` ✓, `--limit`, `--cursor` |

## Examples

```bash
npx tsx resources/pd-slack.ts find-channel --name general
npx tsx resources/pd-slack.ts find-user --name Giao
npx tsx resources/pd-slack.ts find-user --email alice@company.com
npx tsx resources/pd-slack.ts send --channel C0123456789 --text 'Hello team!'
npx tsx resources/pd-slack.ts triage --channel C0123456789 --limit 10
npx tsx resources/pd-slack.ts search --query 'deployment failed'
npx tsx resources/pd-slack.ts reply --channel C0123456789 --thread 1234567890.123456 --text 'On it!'
npx tsx resources/pd-slack.ts react --channel C0123456789 --timestamp 1234567890.123456 --emoji eyes
```

## Tips

- **Resolve channel IDs first** with `channels` or `find-channel`. Slack requires `C`-prefixed IDs.
- **Find users by name** with `find-user --name` (fuzzy matches name, real_name, display_name) or by exact email with `--email`.
- **`triage`** returns truncated text + reaction counts — use `history` for full messages.
- **`search`** requires a user token (not bot). If it fails, the account may be a bot.
- [mrkdwn](https://api.slack.com/reference/surfaces/formatting): `*bold*`, `_italic_`, `<@U123>` mention, `<#C123>` channel link.

> [!CAUTION]
> `send`, `reply`, `update`, `react`, `topic` are **write** commands — confirm before executing.
