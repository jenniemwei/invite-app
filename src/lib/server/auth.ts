import "server-only";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { redirect } from "next/navigation";
import { AppError } from "../domain";
import { dataMode, required } from "./config";
export async function authClient() {
  const jar = await cookies();
  return createServerClient(
    required("NEXT_PUBLIC_SUPABASE_URL"),
    required("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY"),
    {
      cookies: {
        getAll: () => jar.getAll(),
        setAll: (list) => {
          try {
            for (const c of list) jar.set(c.name, c.value, c.options);
          } catch {
            /* Server components cannot refresh cookies; route handlers can. */
          }
        },
      },
    },
  );
}
export async function hostIdentity() {
  if (dataMode() === "local") return "local-demo-host";
  const { data, error } = await (await authClient()).auth.getUser();
  if (error || !data.user) return null;
  return data.user.id;
}
export async function requireHost(page = false) {
  const id = await hostIdentity();
  if (id) return id;
  if (page) redirect("/login");
  throw new AppError("Please sign in to continue.", 401);
}
