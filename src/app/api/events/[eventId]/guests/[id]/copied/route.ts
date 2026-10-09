import { requireHost } from "@/lib/server/auth";
import { copyLink } from "@/lib/server/service";
import { api, guardOrigin } from "@/lib/server/http";
export async function POST(
  req: Request,
  ctx: { params: Promise<{ eventId: string; id: string }> },
) {
  return api(async () => {
    guardOrigin(req);
    const { eventId, id } = await ctx.params;
    await copyLink(await requireHost(), eventId, id);
    return { ok: true };
  });
}
