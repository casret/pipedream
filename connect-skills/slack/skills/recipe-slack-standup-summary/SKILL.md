---
name: recipe-slack-standup-summary
description: "Slack recipe: Generate a standup summary from recent channel activity and active threads."
metadata:
  requires:
    skills: ["pd-slack"]
---

# Standup Summary from Slack

> **PREREQUISITE:** Load `pd-slack`.

## Steps

1. `npx tsx resources/pd-slack.ts find-channel --name engineering`
2. `npx tsx resources/pd-slack.ts triage --channel CHANNEL_ID --limit 20`
3. `npx tsx resources/pd-slack.ts threads --channel CHANNEL_ID --limit 20`
4. Summarize: key messages, active threads (by reply count), notable reactions, unanswered questions.

Combine with `pd-github pr-summary` for a complete engineering standup.
