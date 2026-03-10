---
name: pd-github-file
description: "GitHub: Read a file from a repository."
---

# github file

> **PREREQUISITE:** Read `../pd-github/SKILL.md` for all commands.

```bash
npx tsx resources/pd-github.ts file --repo <OWNER/REPO> --path <PATH> [--ref branch]
```

Prints decoded file content to stdout. For directories, returns JSON listing. Read-only.
