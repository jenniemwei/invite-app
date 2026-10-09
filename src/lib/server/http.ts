import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { AppError } from "../domain";
export function guardOrigin(req: Request) {
  const origin = req.headers.get("origin");
  // Next.js can normalize request.url to localhost behind its listener/proxy.
  // The browser Origin must match the request's actual Host and transport.
  const requestURL = new URL(req.url);
  const host = req.headers.get("host") || requestURL.host;
  const forwardedProtocol = req.headers.get("x-forwarded-proto");
  const protocol =
    forwardedProtocol === "https" ? "https:" : requestURL.protocol;
  const expected = `${protocol}//${host}`;
  if (!origin || origin !== expected)
    throw new AppError(
      "This request could not be verified. Reload the page and try again.",
      403,
    );
}
export async function body(req: Request) {
  if (Number(req.headers.get("content-length") || 0) > 16000)
    throw new AppError("This request is too large.", 413);
  const text = await req.text();
  if (text.length > 16000)
    throw new AppError("This request is too large.", 413);
  try {
    return JSON.parse(text);
  } catch {
    throw new AppError("The submitted data could not be read.");
  }
}
export async function api(work: () => Promise<unknown>) {
  try {
    return NextResponse.json(await work(), {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (e) {
    if (e instanceof ZodError)
      return NextResponse.json(
        { error: e.issues[0]?.message ?? "Check your information." },
        { status: 400 },
      );
    if (e instanceof AppError)
      return NextResponse.json({ error: e.message }, { status: e.status });
    console.error(
      "Request failed:",
      e instanceof Error ? e.message : "unknown error",
    );
    return NextResponse.json(
      {
        error:
          "Something went wrong. Your changes may not have saved. Refresh and try again.",
      },
      { status: 500 },
    );
  }
}
