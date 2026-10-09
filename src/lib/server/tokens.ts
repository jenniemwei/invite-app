import "server-only";
import { createHash, createHmac, randomBytes } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { dataMode, required } from "./config";
export const dataDirectory = () =>
  path.resolve(
    /* turbopackIgnore: true */ process.env.DEMO_DATA_DIR || ".data",
  );
let keyPromise: Promise<string> | undefined;
async function key() {
  if (dataMode() === "supabase") {
    const k = required("INVITATION_SECRET");
    if (k.length < 32)
      throw new Error(
        "INVITATION_SECRET must contain at least 32 random characters.",
      );
    return k;
  }
  return (keyPromise ??= (async () => {
    const dir = dataDirectory();
    await mkdir(dir, { recursive: true });
    const file = path.join(dir, "invitation-key");
    try {
      await writeFile(file, randomBytes(32).toString("hex"), {
        flag: "wx",
        mode: 0o600,
      });
    } catch (e) {
      if ((e as NodeJS.ErrnoException).code !== "EEXIST") throw e;
    }
    return (await readFile(file, "utf8")).trim();
  })());
}
// Stable, unguessable capability for this invitation. Only its hash is stored in the database.
export async function invitationToken(id: string) {
  return createHmac("sha256", await key())
    .update(id)
    .digest("hex");
}
export function tokenHash(token: string) {
  return createHash("sha256").update(token).digest("hex");
}
