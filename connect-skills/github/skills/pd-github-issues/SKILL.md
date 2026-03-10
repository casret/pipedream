---
name: pd-github-issues
description: "GitHub: List and filter issues in a repository."
---

# github issues

> **PREREQUISITE:** Read `../pd-github/SKILL.md` for all commands.

```bash
npx tsx resources/pd-github.ts issues --repo <OWNER/REPO> [--state open] [--label bug] [--limit 20]
```

Read-only. PRs are auto-filtered out. For full-text search use `search` instead.
