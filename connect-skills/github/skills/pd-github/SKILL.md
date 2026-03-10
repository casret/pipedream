---
name: pd-github
description: "GitHub: Create and search issues, manage pull requests, read and write files, list repos, and comment."
---

# pd-github

> **PREREQUISITE:** Read `../pd-shared/SKILL.md` for auth and setup.

```bash
npx tsx resources/pd-github.ts <command> [flags]
```

| Command | Description | Key Flags |
|---------|-------------|-----------|
| `whoami` | Authenticated user | — |
| `repos` | List repositories | `--org`, `--sort`, `--limit` |
| `repo` | Repository info | `--repo` ✓ |
| `issues` | List issues | `--repo` ✓, `--state`, `--label`, `--assignee`, `--limit` |
| `create-issue` | Create an issue | `--repo` ✓, `--title` ✓, `--body`, `--labels`, `--assignees` |
| `close-issue` | Close an issue | `--repo` ✓, `--number` ✓ |
| `comment` | Comment on issue/PR | `--repo` ✓, `--number` ✓, `--body` ✓ |
| `prs` | List pull requests | `--repo` ✓, `--state`, `--limit` |
| `pr-summary` | Summarize open PRs | `--repo` ✓ |
| `create-pr` | Create a PR | `--repo` ✓, `--title` ✓, `--head` ✓, `--base`, `--draft` |
| `file` | Read a file | `--repo` ✓, `--path` ✓, `--ref` |
| `write-file` | Create/update file | `--repo` ✓, `--path` ✓, `--content` ✓, `--sha`, `--branch` |
| `commits` | Recent commits | `--repo` ✓, `--branch`, `--limit` |
| `search` | Search issues/PRs | `--query` ✓, `--limit` |

## Examples

```bash
npx tsx resources/pd-github.ts whoami
npx tsx resources/pd-github.ts issues --repo owner/repo --label bug
npx tsx resources/pd-github.ts create-issue --repo owner/repo --title 'Bug' --labels 'bug,high'
npx tsx resources/pd-github.ts pr-summary --repo owner/repo
npx tsx resources/pd-github.ts file --repo owner/repo --path README.md
npx tsx resources/pd-github.ts search --query 'repo:owner/repo is:pr is:open review:required'
```

## Tips

- Repo format: `owner/repo`. `file` auto-decodes Base64. `write-file` needs `--sha` for updates.
- `--labels`/`--assignees` are comma-separated.
- [GitHub search syntax](https://docs.github.com/en/search-github/searching-on-github/searching-issues-and-pull-requests) for `search`.

> [!CAUTION]
> `create-issue`, `close-issue`, `comment`, `create-pr`, `write-file` are **write** commands.
