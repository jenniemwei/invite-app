import { requireHost } from "@/lib/server/auth";
import { createEvent } from "@/lib/server/service";
import { api, body, guardOrigin } from "@/lib/server/http";
export async function POST(req: Request) {
  return api(async () => {
    guardOrigin(req);
    return createEvent(await requireHost(), await body(req));
  });
}
