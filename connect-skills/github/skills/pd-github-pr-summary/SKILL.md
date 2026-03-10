---
name: pd-github-pr-summary
description: "GitHub: Summarize open pull requests — quick review dashboard."
---

# github pr-summary

> **PREREQUISITE:** Read `../pd-github/SKILL.md` for all commands.

```bash
npx tsx resources/pd-github.ts pr-summary --repo <OWNER/REPO>
```

Shows count + per-PR: number, title, author, additions/deletions, pending reviewers. Read-only.
