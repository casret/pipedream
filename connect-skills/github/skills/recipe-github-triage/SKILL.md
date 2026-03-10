---
name: recipe-github-triage
description: "GitHub recipe: Triage a repository — open issues, pending PRs, stale items."
metadata:
  requires:
    skills: ["pd-github"]
---

# Triage a GitHub Repository

> **PREREQUISITE:** Load `pd-github`.

## Steps

1. `npx tsx resources/pd-github.ts repo --repo owner/repo`
2. `npx tsx resources/pd-github.ts issues --repo owner/repo --state open --limit 15`
3. `npx tsx resources/pd-github.ts pr-summary --repo owner/repo`
4. `npx tsx resources/pd-github.ts commits --repo owner/repo --limit 5`
5. Summarize: issue breakdown by label, PRs awaiting review, stale issues, recent velocity.

Combine with Slack to post the report to a team channel.
