import { describe, it, expect } from "vitest";
import {
  makeResponse,
  initialResponse,
  validateEvent,
  type Event,
} from "../src/lib/domain";
const now = new Date("2026-10-01T12:00:00Z");
const event: Event = {
  id: "event",
  ownerId: "host",
  title: "Dinner",
  hostName: "Alex",
  description: "",
  location: "Home",
  startsAt: "2026-10-12T19:00:00Z",
  deadline: "2026-10-10T19:00:00Z",
  deadlineReason: "",
  timeZone: "America/Los_Angeles",
  createdAt: now.toISOString(),
};
describe("response rules", () => {
  it("only yes counts", () => {
    for (const status of ["yes", "maybe", "no"] as const) {
      const r = makeResponse(
        event,
        initialResponse("jamie"),
        { status, followUpAt: "2026-10-05T12:00:00Z" },
        now,
      );
      expect(r.countingAssumption).toBe(
        status === "yes" ? "included" : "not_included",
      );
    }
  });
  it("requires a future maybe date within the deadline", () => {
    for (const followUpAt of [
      null,
      "2026-09-01T12:00:00Z",
      "2026-10-11T12:00:00Z",
    ]) {
      expect(() =>
        makeResponse(
          event,
          initialResponse("jamie"),
          { status: "maybe", followUpAt },
          now,
        ),
      ).toThrow();
    }
  });
  it("clears follow-up when changing to yes", () => {
    const maybe = makeResponse(
      event,
      initialResponse("jamie"),
      { status: "maybe", followUpAt: "2026-10-05T12:00:00Z" },
      now,
    );
    expect(
      makeResponse(event, maybe, { status: "yes" }, now).followUpAt,
    ).toBeNull();
  });
  it("blocks new yes at the deadline but allows a decline", () => {
    const late = new Date(event.deadline);
    expect(() =>
      makeResponse(event, initialResponse("jamie"), { status: "yes" }, late),
    ).toThrow(/closed/);
    expect(
      makeResponse(event, initialResponse("jamie"), { status: "no" }, late)
        .status,
    ).toBe("no");
  });
  it("allows an already confirmed guest to keep their yes after the deadline", () => {
    const yes = makeResponse(
      event,
      initialResponse("jamie"),
      { status: "yes" },
      now,
    );
    expect(
      makeResponse(
        event,
        yes,
        { status: "yes", note: "Still coming" },
        new Date(event.startsAt),
      ).note,
    ).toBe("Still coming");
  });
  it("rejects event deadlines after the event", () => {
    expect(() =>
      validateEvent({ ...event, deadline: "2026-10-20T12:00:00Z" }, now),
    ).toThrow();
  });
  it("never counts silence", () => {
    expect(initialResponse("sam").countingAssumption).toBe("not_included");
  });
});
