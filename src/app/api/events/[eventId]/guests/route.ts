import { requireHost } from "@/lib/server/auth";
import { addGuest } from "@/lib/server/service";
import { api, body, guardOrigin } from "@/lib/server/http";
export async function POST(
  req: Request,
  ctx: { params: Promise<{ eventId: string }> },
) {
  return api(async () => {
    guardOrigin(req);
    return addGuest(
      await requireHost(),
      (await ctx.params).eventId,
      await body(req),
    );
  });
}
