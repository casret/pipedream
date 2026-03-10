#!/usr/bin/env npx tsx
/**
 * pd-slack — Pipedream Connect CLI for Slack
 * Usage: npx tsx pd-slack.ts <command> [flags]
 */

import { makeProxyRequest, parseFlags, printJson, fatal } from "./pd-proxy.js";

const APP = "slack_v2";
const API = "https://slack.com/api";

async function slack(method: "GET" | "POST", endpoint: string, body?: Record<string, unknown>, query?: Record<string, string>) {
  let url = `${API}/${endpoint}`;
  if (query) url += `?${new URLSearchParams(query)}`;
  return makeProxyRequest({ appSlug: APP, method, url, body });
}

const { command, flags } = parseFlags(process.argv.slice(2));

switch (command) {
  case "send": {
    const channel = flags.channel ?? fatal("--channel required");
    const text = flags.text ?? fatal("--text required");
    printJson(await slack("POST", "chat.postMessage", { channel, text }));
    break;
  }
  case "reply": {
    const channel = flags.channel ?? fatal("--channel required");
    const thread = flags.thread ?? fatal("--thread required (message timestamp)");
    const text = flags.text ?? fatal("--text required");
    printJson(await slack("POST", "chat.postMessage", { channel, text, thread_ts: thread }));
    break;
  }
  case "triage": {
    const channel = flags.channel ?? fatal("--channel required");
    const resp = (await slack("GET", "conversations.history", undefined, { channel, limit: flags.limit ?? "15" })) as any;
    if (!resp.ok) fatal(resp.error ?? "Failed to fetch history");
    printJson((resp.messages ?? []).map((m: any) => ({
      ts: m.ts, user: m.user, text: m.text?.slice(0, 200),
      thread_reply_count: m.reply_count ?? 0,
      reactions: m.reactions?.map((r: any) => `${r.name}(${r.count})`).join(" ") ?? "",
    })));
    break;
  }
  case "threads": {
    const channel = flags.channel ?? fatal("--channel required");
    const resp = (await slack("GET", "conversations.history", undefined, { channel, limit: flags.limit ?? "20" })) as any;
    if (!resp.ok) fatal(resp.error ?? "Failed to fetch history");
    printJson((resp.messages ?? []).filter((m: any) => m.reply_count > 0).map((m: any) => ({
      ts: m.ts, user: m.user, text: m.text?.slice(0, 150),
      reply_count: m.reply_count, latest_reply: m.latest_reply,
    })));
    break;
  }
  case "search": {
    const query = flags.query ?? fatal("--query required");
    printJson(await slack("GET", "search.messages", undefined, {
      query, count: flags.limit ?? "10", sort: flags.sort ?? "timestamp", sort_dir: flags["sort-dir"] ?? "desc",
    }));
    break;
  }
  case "channels": {
    const resp = (await slack("GET", "conversations.list", undefined, {
      types: flags.types ?? "public_channel,private_channel", limit: flags.limit ?? "200",
      exclude_archived: flags.archived === "true" ? "false" : "true",
    })) as any;
    if (!resp.ok) fatal(resp.error ?? "Failed to list channels");
    printJson((resp.channels ?? []).map((c: any) => ({
      id: c.id, name: c.name, topic: c.topic?.value ?? "", purpose: c.purpose?.value ?? "", members: c.num_members,
    })));
    break;
  }
  case "find-channel": {
    const name = flags.name ?? fatal("--name required");
    const resp = (await slack("GET", "conversations.list", undefined, {
      types: "public_channel,private_channel", limit: "1000", exclude_archived: "true",
    })) as any;
    if (!resp.ok) fatal(resp.error ?? "Failed to list channels");
    const match = (resp.channels ?? []).find((c: any) => c.name === name || c.name === name.replace(/^#/, ""));
    if (!match) fatal(`Channel "${name}" not found`);
    printJson({ id: match.id, name: match.name, topic: match.topic?.value, purpose: match.purpose?.value });
    break;
  }
  case "users": {
    const resp = (await slack("GET", "users.list", undefined, { limit: flags.limit ?? "200" })) as any;
    if (!resp.ok) fatal(resp.error ?? "Failed to list users");
    printJson((resp.members ?? []).filter((u: any) => !u.deleted && !u.is_bot).map((u: any) => ({
      id: u.id, name: u.name, real_name: u.real_name, email: u.profile?.email ?? "", display_name: u.profile?.display_name ?? "",
    })));
    break;
  }
  case "find-user": {
    if (flags.email) {
      const resp = (await slack("GET", "users.lookupByEmail", undefined, { email: flags.email })) as any;
      if (!resp.ok) fatal(resp.error ?? `User with email "${flags.email}" not found`);
      const u = resp.user;
      printJson({ id: u.id, name: u.name, real_name: u.real_name, email: u.profile?.email, display_name: u.profile?.display_name });
    } else if (flags.name) {
      const query = flags.name.toLowerCase();
      const resp = (await slack("GET", "users.list", undefined, { limit: "200" })) as any;
      if (!resp.ok) fatal(resp.error ?? "Failed to list users");
      const matches = (resp.members ?? []).filter((u: any) => !u.deleted && !u.is_bot && (
        u.name?.toLowerCase().includes(query) ||
        u.real_name?.toLowerCase().includes(query) ||
        u.profile?.display_name?.toLowerCase().includes(query)
      ));
      if (!matches.length) fatal(`No user matching "${flags.name}" found`);
      printJson(matches.map((u: any) => ({ id: u.id, name: u.name, real_name: u.real_name, email: u.profile?.email ?? "", display_name: u.profile?.display_name ?? "" })));
    } else {
      fatal("--email or --name required");
    }
    break;
  }
  case "react": {
    const channel = flags.channel ?? fatal("--channel required");
    const timestamp = flags.timestamp ?? flags.ts ?? fatal("--timestamp required");
    const emoji = flags.emoji ?? fatal("--emoji required (without colons)");
    printJson(await slack("POST", "reactions.add", { channel, timestamp, name: emoji }));
    break;
  }
  case "update": {
    const channel = flags.channel ?? fatal("--channel required");
    const ts = flags.ts ?? fatal("--ts required");
    const text = flags.text ?? fatal("--text required");
    printJson(await slack("POST", "chat.update", { channel, ts, text }));
    break;
  }
  case "topic": {
    const channel = flags.channel ?? fatal("--channel required");
    const topic = flags.topic ?? fatal("--topic required");
    printJson(await slack("POST", "conversations.setTopic", { channel, topic }));
    break;
  }
  case "history": {
    const channel = flags.channel ?? fatal("--channel required");
    const q: Record<string, string> = { channel, limit: flags.limit ?? "20" };
    if (flags.cursor) q.cursor = flags.cursor;
    if (flags.oldest) q.oldest = flags.oldest;
    if (flags.latest) q.latest = flags.latest;
    printJson(await slack("GET", "conversations.history", undefined, q));
    break;
  }
  default:
    console.error(`pd-slack: unknown command "${command}"\nCommands: send, reply, triage, threads, search, channels, find-channel, users, find-user, react, update, topic, history`);
    process.exit(1);
}
