import { NextResponse } from "next/server";
import { submissionSchema, buildRow } from "@/lib/schema";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

// Best-effort rate limit (memory of one server instance). Generous on purpose:
// many phones on Tunisian mobile networks share one public IP address.
const hits = new Map<string, number[]>();
const WINDOW_MS = 10 * 60 * 1000;
const LIMIT = 30;

function limited(ip: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 5000) {
    hits.forEach((v, k) => {
      if (!v.some((t) => now - t < WINDOW_MS)) hits.delete(k);
    });
  }
  return recent.length > LIMIT;
}

function fail(status: number, error: string, fields?: string[]) {
  return NextResponse.json({ ok: false, error, fields }, { status, headers: { "Cache-Control": "no-store" } });
}

export async function POST(req: Request) {
  const scriptUrl = process.env.APPS_SCRIPT_URL;
  const secret = process.env.APPS_SCRIPT_SECRET;
  if (!scriptUrl || !secret) {
    console.error("Missing APPS_SCRIPT_URL or APPS_SCRIPT_SECRET environment variable.");
    return fail(500, "server_config");
  }

  const ip = (req.headers.get("x-forwarded-for") ?? "unknown").split(",")[0].trim();
  if (limited(ip)) return fail(429, "rate_limited");

  let body: unknown;
  try {
    const text = await req.text();
    if (text.length > 20000) return fail(413, "too_large");
    body = JSON.parse(text);
  } catch {
    return fail(400, "bad_json");
  }

  // Honeypot: real people never fill this hidden field. Bots do. Nothing is stored.
  const trap = (body as { website?: unknown } | null)?.website;
  if (typeof trap === "string" && trap.trim() !== "") {
    return NextResponse.json({ ok: true });
  }

  const parsed = submissionSchema.safeParse(body);
  if (!parsed.success) {
    return fail(422, "invalid", parsed.error.issues.map((i) => i.path.join(".")));
  }

  const row = buildRow(parsed.data);
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 20000);
  try {
    const res = await fetch(scriptUrl, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({ secret, row }),
      redirect: "follow",
      cache: "no-store",
      signal: ctrl.signal,
    });
    const text = await res.text();
    let result: { ok?: boolean; error?: string } = {};
    try {
      result = JSON.parse(text);
    } catch {
      /* not JSON: probably a Google sign-in or error page */
    }
    if (!res.ok || result.ok !== true) {
      console.error("Apps Script did not confirm storage:", res.status, result.error ?? text.slice(0, 200));
      return fail(502, "storage_failed");
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Apps Script request failed:", err);
    return fail(502, "storage_failed");
  } finally {
    clearTimeout(timer);
  }
}
