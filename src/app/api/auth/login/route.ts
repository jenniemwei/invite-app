import { z } from "zod";
import { authClient } from "@/lib/server/auth";
import { api, body, guardOrigin } from "@/lib/server/http";
import { AppError } from "@/lib/domain";
export async function POST(req: Request) {
  return api(async () => {
    guardOrigin(req);
    const values = z
      .object({ email: z.string().email(), password: z.string().min(1) })
      .parse(await body(req));
    const { error } = await (
      await authClient()
    ).auth.signInWithPassword(values);
    if (error)
      throw new AppError("The email or password was not recognized.", 401);
    return { ok: true };
  });
}
