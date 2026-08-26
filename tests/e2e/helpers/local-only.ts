import fs from "node:fs";
import path from "node:path";

export function ensureLocalSupabaseTarget(): void {
  let url = process.env.NEXT_PUBLIC_SUPABASE_URL;

  if (!url) {
    const envPath = path.resolve(process.cwd(), ".env.local");
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, "utf8");
      const match = content.match(/^NEXT_PUBLIC_SUPABASE_URL=(.+)$/m);
      if (match) {
        url = match[1].trim();
      }
    }
  }

  if (!url) {
    throw new Error(
      "HARD LOCAL GUARD: NEXT_PUBLIC_SUPABASE_URL is not set. Refusing to run E2E tests.",
    );
  }

  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    throw new Error(
      "HARD LOCAL GUARD: NEXT_PUBLIC_SUPABASE_URL is not a valid URL. Refusing to run E2E tests.",
    );
  }

  const isLocalHost =
    parsed.hostname === "127.0.0.1" || parsed.hostname === "localhost";
  const isLocalPort = parsed.port === "54321";

  if (!isLocalHost || !isLocalPort || parsed.protocol !== "http:") {
    throw new Error(
      `HARD LOCAL GUARD: Refusing to execute E2E tests against non-local Supabase target (${parsed.hostname}). Only local 127.0.0.1:54321 is permitted.`,
    );
  }

  // Safe non-secret log
  console.log("Stage-9 E2E target confirmed: local Supabase");
}
