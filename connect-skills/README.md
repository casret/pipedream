# Pipedream Connect Skills

Agent skills for [Pipedream Connect](https://pipedream.com/docs/connect/) — authenticated API access to 2,000+ apps.

## Install

```bash
# Install skills for a specific app
npx skills add https://github.com/PipedreamHQ/pipedream-connect-skills/tree/main/slack
npx skills add https://github.com/PipedreamHQ/pipedream-connect-skills/tree/main/github
npx skills add https://github.com/PipedreamHQ/pipedream-connect-skills/tree/main/notion

# Or pick specific skills from the whole repo
npx skills add PipedreamHQ/pipedream-connect-skills --skill pd-slack pd-slack-send
```

## Apps

### [Slack](slack/)

| Skill | Description |
|-------|-------------|
| pd-slack | All commands: send, reply, search, channels, users, reactions |
| pd-slack-send | Send a message |
| pd-slack-triage | Recent messages summary |
| pd-slack-threads | Active threads in a channel |
| pd-slack-find | Find channels by name or users by email |
| recipe-slack-standup-summary | Standup summary from channel activity |

### [GitHub](github/)

| Skill | Description |
|-------|-------------|
| pd-github | All commands: issues, PRs, files, repos, search, comments |
| pd-github-issues | List and filter issues |
| pd-github-create-issue | Create a new issue |
| pd-github-pr-summary | Summarize open PRs |
| pd-github-file | Read a file from a repo |
| recipe-github-triage | Triage a repo: issues + PRs + stale items |

### [Notion](notion/)

| Skill | Description |
|-------|-------------|
| pd-notion | All commands: search, pages, databases, blocks, comments |
| pd-notion-search | Search pages and databases |
| pd-notion-page | Read a page (properties + content) |
| pd-notion-create-page | Create a page or database row |
| pd-notion-query-db | Query a database with filters |
| recipe-notion-meeting-notes | Create structured meeting notes |

## Setup

See `pd-shared` in any app for full auth docs. Quick start:

```bash
export PIPEDREAM_TOKEN=eyJhbG...              # or CLIENT_ID + CLIENT_SECRET
export PIPEDREAM_PROJECT_ID=proj_xxx
export PIPEDREAM_ENVIRONMENT=development
export PIPEDREAM_EXTERNAL_USER_ID=user-123
export PIPEDREAM_ACCOUNT_ID_SLACK_V2=apn_xxx  # per-app
```

## Adding a New App

Each app is a self-contained directory:

```
<app>/
├── resources/
│   ├── pd-proxy.ts      ← shared proxy engine (copy from any existing app)
│   └── pd-<app>.ts      ← CLI tool with subcommands
└── skills/
    ├── pd-shared/SKILL.md
    ├── pd-<app>/SKILL.md
    ├── pd-<app>-<helper>/SKILL.md
    └── recipe-<app>-<name>/SKILL.md
```

## License

MIT
