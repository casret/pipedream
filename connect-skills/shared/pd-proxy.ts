/**
 * Pipedream Connect proxy engine — shared by all pd-* CLI tools.
 * Zero npm dependencies. Uses the REST API directly with fetch.
 */

import { readFileSync, existsSync } from "fs";

const envFile = process.env.PIPEDREAM_CONNECT_ENV;
if (envFile && existsSync(envFile)) {
  for (const line of readFileSync(envFile, "utf-8").split("\n")) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const eq = t.indexOf("=");
    if (eq > 0) {
      const k = t.slice(0, eq);
      if (!process.env[k]) process.env[k] = t.slice(eq + 1);
    }
  }
}

let cachedToken: string | undefined;

async function getAccessToken(): Promise<string> {
  const token = process.env.PIPEDREAM_TOKEN;
  if (token) return token;
  if (cachedToken) return cachedToken;

  const clientId = process.env.PIPEDREAM_CLIENT_ID;
  const clientSecret = process.env.PIPEDREAM_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    throw new Error("Auth required. Set PIPEDREAM_TOKEN or PIPEDREAM_CLIENT_ID + PIPEDREAM_CLIENT_SECRET");
  }

  const resp = await fetch("https://api.pipedream.com/v1/oauth/token", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ grant_type: "client_credentials", client_id: clientId, client_secret: clientSecret }),
  });

  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`OAuth token exchange failed (${resp.status}): ${text}`);
  }

  const data = (await resp.json()) as { access_token: string };
  cachedToken = data.access_token;
  return cachedToken;
}

export interface ProxyRequestOpts {
  appSlug: string;
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  url: string;
  body?: Record<string, unknown>;
  headers?: Record<string, string>;
  accountId?: string;
  externalUserId?: string;
}

export async function makeProxyRequest(opts: ProxyRequestOpts): Promise<unknown> {
  const projectId = process.env.PIPEDREAM_PROJECT_ID;
  const environment = process.env.PIPEDREAM_ENVIRONMENT ?? "development";
  if (!projectId) throw new Error("Missing PIPEDREAM_PROJECT_ID");

  const envKey = `PIPEDREAM_ACCOUNT_ID_${opts.appSlug.toUpperCase().replace(/-/g, "_")}`;
  const accountId = opts.accountId ?? process.env[envKey];
  if (!accountId) throw new Error(`Missing account ID. Set ${envKey}`);

  const externalUserId = opts.externalUserId ?? process.env.PIPEDREAM_EXTERNAL_USER_ID;
  if (!externalUserId) throw new Error("Missing PIPEDREAM_EXTERNAL_USER_ID");

  const token = await getAccessToken();
  const url64 = Buffer.from(opts.url).toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");

  const proxyUrl = `https://api.pipedream.com/v1/connect/${projectId}/proxy/${url64}?external_user_id=${encodeURIComponent(externalUserId)}&account_id=${encodeURIComponent(accountId)}`;

  const fetchHeaders: Record<string, string> = {
    Authorization: `Bearer ${token}`,
    "x-pd-environment": environment,
    "Content-Type": "application/json",
  };

  if (opts.headers) {
    for (const [k, v] of Object.entries(opts.headers)) {
      fetchHeaders[`x-pd-proxy-${k.toLowerCase()}`] = v;
    }
  }

  const fetchOpts: RequestInit = { method: opts.method, headers: fetchHeaders };
  if (opts.body) fetchOpts.body = JSON.stringify(opts.body);

  const resp = await fetch(proxyUrl, fetchOpts);
  const text = await resp.text();
  if (!resp.ok) throw new Error(`HTTP ${resp.status}: ${text}`);
  try { return JSON.parse(text); } catch { return text; }
}

export function parseFlags(argv: string[]): { command: string; flags: Record<string, string>; positional: string[] } {
  const flags: Record<string, string> = {};
  const positional: string[] = [];
  let command = "";
  for (let i = 0; i < argv.length; i++) {
    if (argv[i].startsWith("--")) {
      const key = argv[i].slice(2);
      if (i + 1 >= argv.length || argv[i + 1]?.startsWith("--")) flags[key] = "true";
      else flags[key] = argv[++i];
    } else if (!command && !argv[i].startsWith("-")) command = argv[i];
    else positional.push(argv[i]);
  }
  return { command, flags, positional };
}

export function printJson(data: unknown, compact = false) { console.log(JSON.stringify(data, null, compact ? 0 : 2)); }
export function fatal(msg: string): never { console.error(`Error: ${msg}`); process.exit(1); }
