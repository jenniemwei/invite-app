import "server-only";
export function dataMode(): "local" | "supabase" {
  const mode = process.env.DATA_MODE ?? "local";
  if (mode !== "local" && mode !== "supabase")
    throw new Error("DATA_MODE must be local or supabase.");
  if (mode === "local" && process.env.VERCEL)
    throw new Error(
      "Local demo storage cannot run on Vercel. Configure DATA_MODE=supabase before deployment.",
    );
  return mode;
}
export function required(name: string) {
  const value = process.env[name];
  if (!value) throw new Error(`Missing server configuration: ${name}`);
  return value;
}
