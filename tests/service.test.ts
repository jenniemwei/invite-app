import { beforeAll, afterAll, describe, it, expect } from "vitest";
import { mkdtemp, rm, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import {
  createEvent,
  addGuest,
  hostGuests,
  guestInvitation,
  respond,
  copyLink,
  hostInvitation,
} from "../src/lib/server/service";
import { invitationToken } from "../src/lib/server/tokens";
import { sampleEvent } from "../src/lib/sample";
let dir: string;
beforeAll(async () => {
  dir = await mkdtemp(path.join(tmpdir(), "invitations-test-"));
  process.env.DEMO_DATA_DIR = dir;
  process.env.DATA_MODE = "local";
});
afterAll(async () => {
  await rm(dir, { recursive: true, force: true });
});
describe("persisted invitation service", () => {
  it("keeps two guests separate through links, responses and host readback", async () => {
    const e = await createEvent("host", sampleEvent());
    const j = await addGuest("host", e.id, {
      guestName: "Jamie",
      personalNote: "Jamie's note",
    });
    const s = await addGuest("host", e.id, {
      guestName: "Sam",
      personalNote: "Sam's note",
    });
    const jt = await invitationToken(j.id),
      st = await invitationToken(s.id);
    expect(jt).not.toBe(st);
    expect((await guestInvitation(st)).invitation.personalNote).toBe(
      "Sam's note",
    );
    await respond(jt, { status: "yes", note: "See you" });
    await respond(jt, { status: "yes", note: "See you" });
    const rows = await hostGuests("host", e.id);
    expect(rows.filter((r) => r.response.status === "yes")).toHaveLength(1);
    expect(rows.find((r) => r.invitation.id === s.id)?.response.status).toBe(
      "unanswered",
    );
    expect(rows.find((r) => r.invitation.id === j.id)?.delivery.status).toBe(
      "not_sent",
    );
    await copyLink("host", e.id, j.id);
    expect(
      (await hostGuests("host", e.id)).find((r) => r.invitation.id === j.id)
        ?.delivery.status,
    ).toBe("link_copied");
    const saved = JSON.parse(
      await readFile(path.join(dir, "invitations.json"), "utf8"),
    );
    expect(
      saved.responses.filter(
        (r: { invitationId: string }) => r.invitationId === j.id,
      ),
    ).toHaveLength(1);
    expect(JSON.stringify(saved)).not.toContain(jt);
  });
  it("denies another host and invalid tokens", async () => {
    const e = await createEvent("owner", sampleEvent());
    const g = await addGuest("owner", e.id, {
      guestName: "Jamie",
      personalNote: "",
    });
    await expect(hostInvitation("stranger", e.id, g.id)).rejects.toThrow(
      /unavailable/,
    );
    await expect(guestInvitation("invalid")).rejects.toThrow(/not valid/);
    await expect(guestInvitation("a".repeat(64))).rejects.toThrow(
      /unavailable/,
    );
  });
  it("rejects revoked links", async () => {
    const e = await createEvent("owner", sampleEvent());
    const g = await addGuest("owner", e.id, {
      guestName: "Revoked",
      personalNote: "",
    });
    const filename = path.join(dir, "invitations.json");
    const saved = JSON.parse(await readFile(filename, "utf8"));
    saved.invitations.find((i: { id: string }) => i.id === g.id).revoked = true;
    await writeFile(filename, JSON.stringify(saved));
    await expect(
      respond(await invitationToken(g.id), { status: "yes" }),
    ).rejects.toThrow(/unavailable/);
  });
  it("does not overwrite a corrupt store", async () => {
    const filename = path.join(dir, "invitations.json");
    const original = await readFile(filename, "utf8");
    await writeFile(filename, "broken");
    await expect(createEvent("host", sampleEvent())).rejects.toThrow(
      /could not be read/,
    );
    expect(await readFile(filename, "utf8")).toBe("broken");
    await writeFile(filename, original);
  });
});
