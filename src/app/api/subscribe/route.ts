import { createHash, createHmac } from "node:crypto";

import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function isSameOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return false;
  try {
    const parsed = new URL(origin);
    const configured = process.env.SITE_ORIGIN?.trim();
    if (configured && parsed.origin === new URL(configured).origin) return true;
    const loopback = new Set(["localhost", "127.0.0.1", "::1"]);
    return (
      process.env.NODE_ENV !== "production" && loopback.has(parsed.hostname)
    );
  } catch {
    return false;
  }
}

function signedProxyFingerprint(request: Request, secret: string) {
  const origin = new URL(request.url);
  const local = new Set(["localhost", "127.0.0.1", "::1"]).has(origin.hostname);
  const clientIp = process.env.VERCEL
    ? request.headers.get("x-vercel-forwarded-for")
    : local
      ? request.headers.get("x-forwarded-for")
      : null;
  const userAgent = request.headers.get("user-agent")?.slice(0, 256) ?? "";
  const fingerprint = createHash("sha256")
    .update(`${clientIp?.trim() || "unknown"}\n${userAgent}`)
    .digest("hex");
  return {
    fingerprint,
    signature: createHmac("sha256", secret).update(fingerprint).digest("hex"),
  };
}

function signupEndpoint(value: string): string {
  const endpoint = new URL(value);
  const loopback = new Set(["localhost", "127.0.0.1", "::1"]).has(
    endpoint.hostname,
  );
  if (
    endpoint.protocol !== "https:" &&
    !(endpoint.protocol === "http:" && loopback)
  ) {
    throw new Error("Signup endpoint must use HTTPS.");
  }
  return endpoint.toString();
}

export async function POST(request: Request) {
  if (!isSameOrigin(request)) {
    return NextResponse.json({ error: "Invalid origin." }, { status: 403 });
  }
  const configuredEndpoint = process.env.EMAIL_SIGNUP_ENDPOINT?.trim();
  const secret = process.env.EMAIL_INGEST_SECRET?.trim();
  if (
    !configuredEndpoint ||
    !secret ||
    Buffer.byteLength(secret, "utf8") < 32
  ) {
    return NextResponse.json(
      { error: "Email signup is not configured." },
      { status: 503 },
    );
  }
  let endpoint: string;
  try {
    endpoint = signupEndpoint(configuredEndpoint);
  } catch {
    return NextResponse.json(
      { error: "Email signup is not configured." },
      { status: 503 },
    );
  }

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  try {
    const proxy = signedProxyFingerprint(request, secret);
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${secret}`,
        "Content-Type": "application/json",
        "User-Agent": request.headers.get("user-agent") ?? "kasptrax.com",
        "X-Renders-Proxy-Fingerprint": proxy.fingerprint,
        "X-Renders-Proxy-Signature": proxy.signature,
      },
      body: JSON.stringify({
        email: body.email,
        website: body.website,
        topic: "kasp_updates",
      }),
      cache: "no-store",
      signal: AbortSignal.timeout(10_000),
    });
    if (!response.ok) {
      return NextResponse.json(
        { error: "Email signup is temporarily unavailable." },
        { status: response.status >= 500 ? 503 : 400 },
      );
    }
    return NextResponse.json({ accepted: true }, { status: 202 });
  } catch {
    return NextResponse.json(
      { error: "Email signup is temporarily unavailable." },
      { status: 503 },
    );
  }
}
