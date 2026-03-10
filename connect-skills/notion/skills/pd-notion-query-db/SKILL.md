---
name: pd-notion-query-db
description: "Notion: Query a database with filters and sorts."
---

# notion query-db

> **PREREQUISITE:** Read `../pd-notion/SKILL.md` for all commands.

```bash
npx tsx resources/pd-notion.ts query-db --id <DB_ID> [--filter JSON] [--sort JSON] [--limit 20]
```

**Always run `db-schema` first.** Filter operators: `equals`, `contains`, `greater_than`, `before`, etc. ([Notion filter docs](https://developers.notion.com/reference/post-database-query-filter)). Read-only.
