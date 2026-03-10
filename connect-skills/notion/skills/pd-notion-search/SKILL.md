---
name: pd-notion-search
description: "Notion: Search for pages and databases by title."
---

# notion search

> **PREREQUISITE:** Read `../pd-notion/SKILL.md` for all commands.

```bash
npx tsx resources/pd-notion.ts search --query 'Meeting Notes' [--type page|database] [--limit 10]
```

**Usually the first command you run** to find IDs. Omit `--query` for recent pages. Read-only.
