#!/usr/bin/env npx tsx
/**
 * pd-github — Pipedream Connect CLI for GitHub
 * Usage: npx tsx pd-github.ts <command> [flags]
 */

import { makeProxyRequest, parseFlags, printJson, fatal } from "./pd-proxy.js";

const APP = "github";
const API = "https://api.github.com";

async function gh(method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE", path: string, body?: Record<string, unknown>, query?: Record<string, string>) {
  let url = `${API}${path}`;
  if (query) url += `?${new URLSearchParams(query)}`;
  return makeProxyRequest({ appSlug: APP, method, url, body });
}

function repo(): string { return flags.repo ?? fatal("--repo required (owner/repo)"); }

const { command, flags } = parseFlags(process.argv.slice(2));

switch (command) {
  case "whoami": {
    const u = (await gh("GET", "/user")) as any;
    printJson({ login: u.login, name: u.name, email: u.email, url: u.html_url });
    break;
  }
  case "repos": {
    const path = flags.org ? `/orgs/${flags.org}/repos` : "/user/repos";
    const q: Record<string, string> = { per_page: flags.limit ?? "30", sort: flags.sort ?? "updated" };
    if (!flags.org) q.type = flags.type ?? "owner";
    const repos = (await gh("GET", path, undefined, q)) as any[];
    printJson(repos.map((r) => ({ full_name: r.full_name, description: r.description, language: r.language, stars: r.stargazers_count, updated: r.updated_at, private: r.private, url: r.html_url })));
    break;
  }
  case "repo": {
    const r = (await gh("GET", `/repos/${repo()}`)) as any;
    printJson({ full_name: r.full_name, description: r.description, language: r.language, stars: r.stargazers_count, forks: r.forks_count, open_issues: r.open_issues_count, default_branch: r.default_branch, url: r.html_url });
    break;
  }
  case "issues": {
    const q: Record<string, string> = { state: flags.state ?? "open", per_page: flags.limit ?? "20", sort: "updated", direction: "desc" };
    if (flags.label) q.labels = flags.label;
    if (flags.assignee) q.assignee = flags.assignee;
    const issues = ((await gh("GET", `/repos/${repo()}/issues`, undefined, q)) as any[]).filter((i) => !i.pull_request);
    printJson(issues.map((i) => ({ number: i.number, title: i.title, state: i.state, author: i.user?.login, labels: i.labels?.map((l: any) => l.name), comments: i.comments, created: i.created_at, updated: i.updated_at, url: i.html_url })));
    break;
  }
  case "create-issue": {
    const body: Record<string, unknown> = { title: flags.title ?? fatal("--title required") };
    if (flags.body) body.body = flags.body;
    if (flags.labels) body.labels = flags.labels.split(",");
    if (flags.assignees) body.assignees = flags.assignees.split(",");
    const issue = (await gh("POST", `/repos/${repo()}/issues`, body)) as any;
    printJson({ number: issue.number, title: issue.title, url: issue.html_url });
    break;
  }
  case "close-issue": {
    const number = flags.number ?? fatal("--number required");
    printJson(await gh("PATCH", `/repos/${repo()}/issues/${number}`, { state: "closed", ...(flags.reason ? { state_reason: flags.reason } : {}) }));
    break;
  }
  case "comment": {
    const number = flags.number ?? fatal("--number required");
    const body = flags.body ?? fatal("--body required");
    const r = (await gh("POST", `/repos/${repo()}/issues/${number}/comments`, { body })) as any;
    printJson({ id: r.id, url: r.html_url });
    break;
  }
  case "prs": {
    const prs = (await gh("GET", `/repos/${repo()}/pulls`, undefined, { state: flags.state ?? "open", per_page: flags.limit ?? "20", sort: "updated", direction: "desc" })) as any[];
    printJson(prs.map((p) => ({ number: p.number, title: p.title, state: p.state, author: p.user?.login, base: p.base?.ref, head: p.head?.ref, created: p.created_at, updated: p.updated_at, url: p.html_url })));
    break;
  }
  case "pr-summary": {
    const prs = (await gh("GET", `/repos/${repo()}/pulls`, undefined, { state: "open", per_page: "10", sort: "updated", direction: "desc" })) as any[];
    console.log(`${prs.length} open PR(s) in ${repo()}:`);
    printJson(prs.map((p) => ({ number: p.number, title: p.title, author: p.user?.login, additions: p.additions, deletions: p.deletions, changed_files: p.changed_files, reviews_pending: p.requested_reviewers?.length ?? 0, created: p.created_at, url: p.html_url })));
    break;
  }
  case "create-pr": {
    const body: Record<string, unknown> = { title: flags.title ?? fatal("--title required"), head: flags.head ?? fatal("--head required"), base: flags.base ?? "main" };
    if (flags.body) body.body = flags.body;
    if (flags.draft === "true") body.draft = true;
    const pr = (await gh("POST", `/repos/${repo()}/pulls`, body)) as any;
    printJson({ number: pr.number, title: pr.title, url: pr.html_url });
    break;
  }
  case "file": {
    const path = flags.path ?? fatal("--path required");
    const q: Record<string, string> = {};
    if (flags.ref) q.ref = flags.ref;
    const r = (await gh("GET", `/repos/${repo()}/contents/${path}`, undefined, q)) as any;
    if (r.content) console.log(Buffer.from(r.content, "base64").toString("utf-8"));
    else printJson(r);
    break;
  }
  case "write-file": {
    const path = flags.path ?? fatal("--path required");
    const content = flags.content ?? fatal("--content required");
    const body: Record<string, unknown> = { message: flags.message ?? `Update ${path}`, content: Buffer.from(content).toString("base64") };
    if (flags.sha) body.sha = flags.sha;
    if (flags.branch) body.branch = flags.branch;
    printJson(await gh("PUT", `/repos/${repo()}/contents/${path}`, body));
    break;
  }
  case "commits": {
    const q: Record<string, string> = { per_page: flags.limit ?? "10" };
    if (flags.branch) q.sha = flags.branch;
    const commits = (await gh("GET", `/repos/${repo()}/commits`, undefined, q)) as any[];
    printJson(commits.map((c) => ({ sha: c.sha.slice(0, 8), message: c.commit.message.split("\n")[0], author: c.commit.author?.name, date: c.commit.author?.date, url: c.html_url })));
    break;
  }
  case "search": {
    const query = flags.query ?? fatal("--query required");
    const resp = (await gh("GET", "/search/issues", undefined, { q: query, per_page: flags.limit ?? "10", sort: flags.sort ?? "updated", order: flags.order ?? "desc" })) as any;
    printJson((resp.items ?? []).map((i: any) => ({ number: i.number, title: i.title, type: i.pull_request ? "pr" : "issue", state: i.state, repo: i.repository_url?.split("/").slice(-2).join("/"), author: i.user?.login, url: i.html_url })));
    break;
  }
  default:
    console.error(`pd-github: unknown command "${command}"\nCommands: whoami, repos, repo, issues, create-issue, close-issue, comment, prs, pr-summary, create-pr, file, write-file, commits, search`);
    process.exit(1);
}
