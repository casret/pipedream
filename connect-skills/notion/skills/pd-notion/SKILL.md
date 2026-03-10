---
name: pd-notion
description: "Notion: Search pages and databases, create and update pages, query databases, and manage content."
---

# pd-notion

> **PREREQUISITE:** Read `../pd-shared/SKILL.md` for auth and setup.

```bash
npx tsx resources/pd-notion.ts <command> [flags]
```

| Command | Description | Key Flags |
|---------|-------------|-----------|
| `search` | Search pages/databases | `--query`, `--type` (page\|database), `--limit` |
| `page` | Read page + content | `--id` ✓ |
| `create-page` | Create a page | `--parent` ✓, `--title` ✓, `--parent-type`, `--content`, `--prop` |
| `update-page` | Update properties | `--id` ✓, `--prop` ✓ |
| `append` | Append blocks | `--id` ✓, `--text` ✓, `--type` |
| `db-schema` | Database columns/types | `--id` ✓ |
| `query-db` | Query database | `--id` ✓, `--filter` (JSON), `--sort` (JSON), `--limit` |
| `add-row` | Add database row | `--db` ✓, `--prop` ✓ |
| `users` | List users | — |
| `comment` | Comment on page | `--id` ✓, `--text` ✓ |

### Property format: `--prop 'Name:type:value'`

Types: `title`, `rich_text`, `select`, `multi_select`, `number`, `checkbox`, `date`, `url`, `email`, `status`.

## Examples

```bash
npx tsx resources/pd-notion.ts search --query 'Meeting Notes' --type page
npx tsx resources/pd-notion.ts page --id abc123
npx tsx resources/pd-notion.ts db-schema --id DB_ID
npx tsx resources/pd-notion.ts query-db --id DB_ID --filter '{"property":"Status","select":{"equals":"In Progress"}}'
npx tsx resources/pd-notion.ts add-row --db DB_ID --prop 'Name:title:Fix bug' --prop 'Status:select:Todo'
npx tsx resources/pd-notion.ts create-page --parent PAGE_ID --title 'New Page' --content 'Hello world'
```

## Tips

- **Search first** to find IDs. **`db-schema` before `query-db`/`add-row`.**
- `page` renders blocks as text: `#` headings, `•` bullets, `☑`/`☐` todos.
- `--parent-type database` required when parent is a database.

> [!CAUTION]
> `create-page`, `update-page`, `append`, `add-row`, `comment` are **write** commands.
