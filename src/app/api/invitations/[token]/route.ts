import { guestInvitation, respond } from "@/lib/server/service";
import { api, body, guardOrigin } from "@/lib/server/http";
export async function GET(
  _req: Request,
  ctx: { params: Promise<{ token: string }> },
) {
  return api(async () => guestInvitation((await ctx.params).token));
}
export async function POST(
  req: Request,
  ctx: { params: Promise<{ token: string }> },
) {
  return api(async () => {
    guardOrigin(req);
    return respond((await ctx.params).token, await body(req));
  });
}
