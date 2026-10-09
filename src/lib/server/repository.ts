import "server-only";
import { createClient } from "@supabase/supabase-js";
import { readFile, writeFile, mkdir, rename } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import {
  AppError,
  emptyStore,
  type Event,
  type Invitation,
  type Response,
  type Delivery,
  type Store,
} from "../domain";
import { dataMode, required } from "./config";
import { dataDirectory } from "./tokens";
export interface Repository {
  events(ownerId: string): Promise<Event[]>;
  event(id: string): Promise<Event | null>;
  saveEvent(value: Event): Promise<void>;
  invitations(eventId: string): Promise<Invitation[]>;
  invitationById(id: string): Promise<Invitation | null>;
  invitationByHash(hash: string): Promise<Invitation | null>;
  saveInvitation(value: Invitation): Promise<void>;
  response(id: string): Promise<Response | null>;
  saveResponse(value: Response): Promise<void>;
  delivery(id: string): Promise<Delivery | null>;
  saveDelivery(value: Delivery): Promise<void>;
}
let queue: Promise<unknown> = Promise.resolve();
const storeFile = () => path.join(dataDirectory(), "invitations.json");
async function readStore(): Promise<Store> {
  try {
    const data = JSON.parse(await readFile(storeFile(), "utf8"));
    if (
      !data ||
      !["events", "invitations", "responses", "deliveries"].every((k) =>
        Array.isArray(data[k]),
      )
    )
      throw new Error("Invalid store");
    return data;
  } catch (e) {
    if ((e as NodeJS.ErrnoException).code === "ENOENT") return emptyStore();
    throw new AppError(
      "The demo store could not be read. Your saved data has not been replaced.",
      503,
    );
  }
}
async function mutate(fn: (s: Store) => void) {
  const job = queue.then(async () => {
    const s = await readStore();
    fn(s);
    await mkdir(dataDirectory(), { recursive: true });
    const tmp = `${storeFile()}.${randomUUID()}.tmp`;
    await writeFile(tmp, JSON.stringify(s, null, 2), { mode: 0o600 });
    await rename(tmp, storeFile());
  });
  queue = job.catch(() => {});
  return job;
}
function replace<T>(items: T[], item: T, match: (x: T) => boolean) {
  const n = items.findIndex(match);
  if (n < 0) items.push(item);
  else items[n] = item;
}
class LocalRepository implements Repository {
  async events(ownerId: string) {
    return (await readStore()).events.filter((e) => e.ownerId === ownerId);
  }
  async event(id: string) {
    return (await readStore()).events.find((e) => e.id === id) ?? null;
  }
  async saveEvent(v: Event) {
    await mutate((s) => replace(s.events, v, (e) => e.id === v.id));
  }
  async invitations(eventId: string) {
    return (await readStore()).invitations.filter((i) => i.eventId === eventId);
  }
  async invitationById(id: string) {
    return (await readStore()).invitations.find((i) => i.id === id) ?? null;
  }
  async invitationByHash(hash: string) {
    return (
      (await readStore()).invitations.find((i) => i.tokenHash === hash) ?? null
    );
  }
  async saveInvitation(v: Invitation) {
    await mutate((s) => replace(s.invitations, v, (i) => i.id === v.id));
  }
  async response(id: string) {
    return (
      (await readStore()).responses.find((v) => v.invitationId === id) ?? null
    );
  }
  async saveResponse(v: Response) {
    await mutate((s) =>
      replace(s.responses, v, (x) => x.invitationId === v.invitationId),
    );
  }
  async delivery(id: string) {
    return (
      (await readStore()).deliveries.find((v) => v.invitationId === id) ?? null
    );
  }
  async saveDelivery(v: Delivery) {
    await mutate((s) =>
      replace(s.deliveries, v, (x) => x.invitationId === v.invitationId),
    );
  }
}
class SupabaseRepository implements Repository {
  private db = createClient(
    required("NEXT_PUBLIC_SUPABASE_URL"),
    required("SUPABASE_SERVICE_ROLE_KEY"),
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
  private async all<T>(
    table: string,
    field: string,
    value: string,
  ): Promise<T[]> {
    const { data, error } = await this.db
      .from(table)
      .select("*")
      .eq(field, value);
    if (error)
      throw new AppError(
        "The data service is unavailable. Please try again.",
        503,
      );
    return data as T[];
  }
  private async one<T>(
    table: string,
    field: string,
    value: string,
  ): Promise<T | null> {
    const rows = await this.all<T>(table, field, value);
    return rows[0] ?? null;
  }
  private async put(table: string, value: Record<string, unknown>) {
    const { error } = await this.db.from(table).upsert(value);
    if (error)
      throw new AppError(
        "Your changes could not be saved. Please try again.",
        503,
      );
  }
  events(id: string) {
    return this.all<Event>("events", "ownerId", id);
  }
  event(id: string) {
    return this.one<Event>("events", "id", id);
  }
  saveEvent(v: Event) {
    return this.put("events", v);
  }
  invitations(id: string) {
    return this.all<Invitation>("invitations", "eventId", id);
  }
  invitationById(id: string) {
    return this.one<Invitation>("invitations", "id", id);
  }
  invitationByHash(hash: string) {
    return this.one<Invitation>("invitations", "tokenHash", hash);
  }
  saveInvitation(v: Invitation) {
    return this.put("invitations", v);
  }
  response(id: string) {
    return this.one<Response>("responses", "invitationId", id);
  }
  saveResponse(v: Response) {
    return this.put("responses", v);
  }
  delivery(id: string) {
    return this.one<Delivery>("deliveries", "invitationId", id);
  }
  saveDelivery(v: Delivery) {
    return this.put("deliveries", v);
  }
}
let instance: Repository | undefined;
export function repository(): Repository {
  return (instance ??=
    dataMode() === "supabase"
      ? new SupabaseRepository()
      : new LocalRepository());
}
