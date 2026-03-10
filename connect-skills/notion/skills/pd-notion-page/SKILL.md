---
name: pd-notion-page
description: "Notion: Read a page — properties and content rendered as text."
---

# notion page

> **PREREQUISITE:** Read `../pd-notion/SKILL.md` for all commands.

```bash
npx tsx resources/pd-notion.ts page --id <PAGE_ID>
```

Returns `id`, `title`, `url`, `properties` (extracted values), `content` (blocks as text). Read-only. Use `search` to find page IDs.
