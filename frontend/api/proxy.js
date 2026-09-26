// Forwards /api/* from the Vercel site to the FastAPI backend on Render (vercel.json sends every
// /api path here). Going through the site's own domain keeps the login cookie first-party.
// A function is used instead of a plain external rewrite: those time out on the way to Render.
const BACKEND_URL = (process.env.BACKEND_URL || "https://architect-api-c5j7.onrender.com").replace(/\/$/, "");

// Headers that describe this hop, not the request itself.
const HOP_HEADERS = ["host", "connection", "content-length", "accept-encoding", "transfer-encoding"];

async function forward(request) {
  const incoming = new URL(request.url);
  const path = incoming.searchParams.get("path") || "";
  incoming.searchParams.delete("path");
  const query = incoming.searchParams.toString();
  const target = `${BACKEND_URL}/api/${path}${query ? `?${query}` : ""}`;

  const headers = new Headers(request.headers);
  HOP_HEADERS.forEach((name) => headers.delete(name));
  const hasBody = !["GET", "HEAD"].includes(request.method);

  let upstream;
  try {
    upstream = await fetch(target, {
      method: request.method,
      headers,
      body: hasBody ? await request.arrayBuffer() : undefined,
      redirect: "manual",
    });
  } catch {
    return Response.json({ detail: "The Architect server is starting up. Please try again in a moment." }, { status: 503 });
  }

  const responseHeaders = new Headers(upstream.headers);
  // fetch has already decompressed the body, so its original encoding and length no longer apply.
  ["content-encoding", "content-length", "transfer-encoding", "connection"].forEach((name) => responseHeaders.delete(name));
  const body = upstream.status === 204 || request.method === "HEAD" ? null : await upstream.arrayBuffer();
  return new Response(body, { status: upstream.status, headers: responseHeaders });
}

export const GET = forward;
export const POST = forward;
export const PUT = forward;
export const PATCH = forward;
export const DELETE = forward;
export const HEAD = forward;
