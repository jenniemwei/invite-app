import { authClient } from "@/lib/server/auth";
import { api, guardOrigin } from "@/lib/server/http";
export async function POST(req: Request) {
  return api(async () => {
    guardOrigin(req);
    await (await authClient()).auth.signOut();
    return { ok: true };
  });
}
