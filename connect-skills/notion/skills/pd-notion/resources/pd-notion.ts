#!/usr/bin/env npx tsx
/**
 * pd-notion — Pipedream Connect CLI for Notion
 * Usage: npx tsx pd-notion.ts <command> [flags]
 */

import { makeProxyRequest, parseFlags, printJson, fatal } from "./pd-proxy.js";

const APP = "notion";
const API = "https://api.notion.com/v1";
const HDR = { "Notion-Version": "2022-06-28" };

async function notion(method: "GET" | "POST" | "PATCH" | "DELETE", path: string, body?: Record<string, unknown>, query?: Record<string, string>) {
  let url = `${API}${path}`;
  if (query) url += `?${new URLSearchParams(query)}`;
  return makeProxyRequest({ appSlug: APP, method, url, body, headers: HDR });
}

function rt(text: string) { return [{ text: { content: text } }]; }

function plainText(a: any[]): string {
  if (!Array.isArray(a)) return "";
  return a.map((r) => r.plain_text ?? r.text?.content ?? "").join("");
}

function propVal(p: any): string {
  if (!p) return "";
  switch (p.type) {
    case "title": return plainText(p.title);
    case "rich_text": return plainText(p.rich_text);
    case "select": return p.select?.name ?? "";
    case "multi_select": return (p.multi_select ?? []).map((s: any) => s.name).join(", ");
    case "number": return String(p.number ?? "");
    case "checkbox": return String(p.checkbox);
    case "date": return p.date?.start ?? "";
    case "url": return p.url ?? "";
    case "email": return p.email ?? "";
    case "status": return p.status?.name ?? "";
    case "relation": return (p.relation ?? []).map((r: any) => r.id).join(", ");
    default: return `[${p.type}]`;
  }
}

function blockText(b: any): string {
  const t = b.type, d = b[t];
  if (!d) return "";
  const txt = d.rich_text ? plainText(d.rich_text) : "";
  switch (t) {
    case "heading_1": return `# ${txt}`;
    case "heading_2": return `## ${txt}`;
    case "heading_3": return `### ${txt}`;
    case "paragraph": return txt;
    case "bulleted_list_item": return `• ${txt}`;
    case "numbered_list_item": return `1. ${txt}`;
    case "to_do": return `${d.checked ? "☑" : "☐"} ${txt}`;
    case "toggle": return `▸ ${txt}`;
    case "code": return `\`\`\`${d.language ?? ""}\n${txt}\n\`\`\``;
    case "quote": return `> ${txt}`;
    case "divider": return "---";
    case "callout": return `💡 ${txt}`;
    default: return `[${t}]`;
  }
}

function parseProp(type: string, value: string): any {
  switch (type) {
    case "title": return { title: rt(value) };
    case "rich_text": return { rich_text: rt(value) };
    case "select": return { select: { name: value } };
    case "multi_select": return { multi_select: value.split(",").map((v) => ({ name: v.trim() })) };
    case "number": return { number: Number(value) };
    case "checkbox": return { checkbox: value === "true" };
    case "date": return { date: { start: value } };
    case "url": return { url: value };
    case "email": return { email: value };
    case "status": return { status: { name: value } };
    default: fatal(`Unsupported property type: ${type}`);
  }
}

function parseProps(propFlag: string | string[] | undefined): Record<string, any> {
  if (!propFlag) return {};
  const props = Array.isArray(propFlag) ? propFlag : [propFlag];
  const out: Record<string, any> = {};
  for (const p of props) {
    const [name, type, ...rest] = p.split(":");
    out[name] = parseProp(type, rest.join(":"));
  }
  return out;
}

const { command, flags } = parseFlags(process.argv.slice(2));

switch (command) {
  case "search": {
    const body: Record<string, unknown> = { page_size: Number(flags.limit ?? "10") };
    if (flags.query) body.query = flags.query;
    if (flags.type === "page" || flags.type === "database") body.filter = { property: "object", value: flags.type };
    const resp = (await notion("POST", "/search", body)) as any;
    printJson((resp.results ?? []).map((r: any) => ({
      id: r.id, type: r.object,
      title: r.properties?.Name?.title?.[0]?.plain_text ?? r.properties?.title?.title?.[0]?.plain_text ?? r.title?.[0]?.plain_text ?? "(untitled)",
      url: r.url, last_edited: r.last_edited_time,
    })));
    break;
  }
  case "page": {
    const id = flags.id ?? fatal("--id required");
    const page = (await notion("GET", `/pages/${id}`)) as any;
    const blocks = (await notion("GET", `/blocks/${id}/children`, undefined, { page_size: flags.limit ?? "100" })) as any;
    const properties: Record<string, string> = {};
    for (const [n, p] of Object.entries(page.properties ?? {})) properties[n] = propVal(p);
    const title = propVal(Object.values(page.properties ?? {}).find((p: any) => p.type === "title"));
    printJson({ id: page.id, title, url: page.url, properties, content: (blocks.results ?? []).map(blockText).filter(Boolean).join("\n") });
    break;
  }
  case "create-page": {
    const parent = flags.parent ?? fatal("--parent required");
    const title = flags.title ?? fatal("--title required");
    const isDb = flags["parent-type"] === "database";
    const body: Record<string, unknown> = {
      parent: isDb ? { database_id: parent } : { page_id: parent },
      properties: { ...(isDb ? { Name: { title: rt(title) } } : { title: { title: rt(title) } }), ...parseProps(flags.prop) },
    };
    if (flags.content) body.children = [{ object: "block", type: "paragraph", paragraph: { rich_text: rt(flags.content) } }];
    const r = (await notion("POST", "/pages", body)) as any;
    printJson({ id: r.id, url: r.url });
    break;
  }
  case "update-page": {
    const id = flags.id ?? fatal("--id required");
    const properties = parseProps(flags.prop);
    if (!Object.keys(properties).length) fatal("--prop required");
    const r = (await notion("PATCH", `/pages/${id}`, { properties })) as any;
    printJson({ id: r.id, url: r.url });
    break;
  }
  case "append": {
    const id = flags.id ?? fatal("--id required");
    const text = flags.text ?? fatal("--text required");
    const type = flags.type ?? "paragraph";
    await notion("PATCH", `/blocks/${id}/children`, { children: text.split("\\n").map((line) => ({ object: "block", type, [type]: { rich_text: rt(line) } })) });
    console.log("Appended successfully.");
    break;
  }
  case "db-schema": {
    const id = flags.id ?? fatal("--id required");
    const db = (await notion("GET", `/databases/${id}`)) as any;
    const schema: Record<string, any> = {};
    for (const [n, p] of Object.entries(db.properties ?? {}) as any[]) {
      const e: any = { type: p.type };
      if (p.type === "select") e.options = p.select?.options?.map((o: any) => o.name);
      if (p.type === "multi_select") e.options = p.multi_select?.options?.map((o: any) => o.name);
      if (p.type === "status") e.options = p.status?.options?.map((o: any) => o.name);
      schema[n] = e;
    }
    printJson({ id: db.id, title: db.title?.[0]?.plain_text ?? "(untitled)", properties: schema });
    break;
  }
  case "query-db": {
    const id = flags.id ?? fatal("--id required");
    const body: Record<string, unknown> = { page_size: Number(flags.limit ?? "20") };
    if (flags.filter) { try { body.filter = JSON.parse(flags.filter); } catch { fatal("--filter must be valid JSON"); } }
    if (flags.sort) { try { body.sorts = JSON.parse(flags.sort); } catch { fatal("--sort must be valid JSON"); } }
    const resp = (await notion("POST", `/databases/${id}/query`, body)) as any;
    printJson((resp.results ?? []).map((r: any) => {
      const row: Record<string, string> = { id: r.id };
      for (const [n, p] of Object.entries(r.properties ?? {})) row[n] = propVal(p);
      return row;
    }));
    break;
  }
  case "add-row": {
    const db = flags.db ?? fatal("--db required");
    const properties = parseProps(flags.prop);
    if (!Object.keys(properties).length) fatal("--prop required");
    const r = (await notion("POST", "/pages", { parent: { database_id: db }, properties })) as any;
    printJson({ id: r.id, url: r.url });
    break;
  }
  case "users": {
    const resp = (await notion("GET", "/users")) as any;
    printJson((resp.results ?? []).map((u: any) => ({ id: u.id, name: u.name, type: u.type, email: u.person?.email ?? "" })));
    break;
  }
  case "comment": {
    const id = flags.id ?? fatal("--id required");
    const text = flags.text ?? fatal("--text required");
    await notion("POST", "/comments", { parent: { page_id: id }, rich_text: rt(text) });
    console.log("Comment added.");
    break;
  }
  default:
    console.error(`pd-notion: unknown command "${command}"\nCommands: search, page, create-page, update-page, append, db-schema, query-db, add-row, users, comment`);
    process.exit(1);
}
