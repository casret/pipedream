---
name: recipe-notion-meeting-notes
description: "Notion recipe: Create structured meeting notes from a topic and attendees."
metadata:
  requires:
    skills: ["pd-notion"]
---

# Create Meeting Notes

> **PREREQUISITE:** Load `pd-notion`.

## Steps

1. `npx tsx resources/pd-notion.ts search --query 'Meeting Notes' --type page`
2. `npx tsx resources/pd-notion.ts create-page --parent PARENT_ID --title 'Sync — March 10'`
3. Append sections:
   ```bash
   npx tsx resources/pd-notion.ts append --id PAGE_ID --text '## Attendees' --type heading_2
   npx tsx resources/pd-notion.ts append --id PAGE_ID --text '## Agenda' --type heading_2
   npx tsx resources/pd-notion.ts append --id PAGE_ID --text '## Action Items' --type heading_2
   npx tsx resources/pd-notion.ts append --id PAGE_ID --text '## Decisions' --type heading_2
   ```

For database-tracked meetings: use `db-schema` then `add-row` with properties.
