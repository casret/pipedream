---
name: pd-notion-create-page
description: "Notion: Create a new page or add a row to a database."
---

# notion create-page / add-row

> **PREREQUISITE:** Read `../pd-notion/SKILL.md` for all commands.

```bash
# Page under a page
npx tsx resources/pd-notion.ts create-page --parent PAGE_ID --title 'New Page' [--content TEXT]

# Row in a database
npx tsx resources/pd-notion.ts add-row --db DB_ID --prop 'Name:title:Task' --prop 'Status:select:Todo'
```

Check `db-schema` first for property names/types.

> [!CAUTION]
> **Write** commands — confirm before executing.
