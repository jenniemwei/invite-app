import { z } from "zod";

export type RSVP = "unanswered" | "yes" | "maybe" | "no";
export type Event = {
  id: string;
  ownerId: string;
  title: string;
  hostName: string;
  description: string;
  startsAt: string;
  timeZone: string;
  location: string;
  deadline: string;
  deadlineReason: string;
  createdAt: string;
};
export type Invitation = {
  id: string;
  eventId: string;
  guestName: string;
  personalNote: string;
  tokenHash: string;
  revoked: boolean;
  createdAt: string;
};
export type Delivery = {
  invitationId: string;
  status: "not_sent" | "link_copied";
  updatedAt: string | null;
};
export type Response = {
  invitationId: string;
  status: RSVP;
  followUpAt: string | null;
  countingAssumption: "included" | "not_included";
  note: string;
  updatedAt: string | null;
};
export type GuestDetail = {
  event: Event;
  invitation: Omit<Invitation, "tokenHash">;
  response: Response;
};
export type HostGuest = {
  invitation: Invitation;
  response: Response;
  delivery: Delivery;
};
export type Store = {
  events: Event[];
  invitations: Invitation[];
  responses: Response[];
  deliveries: Delivery[];
};
export const emptyStore = (): Store => ({
  events: [],
  invitations: [],
  responses: [],
  deliveries: [],
});
export const initialResponse = (invitationId: string): Response => ({
  invitationId,
  status: "unanswered",
  followUpAt: null,
  countingAssumption: "not_included",
  note: "",
  updatedAt: null,
});
export const statusLabels: Record<RSVP, string> = {
  unanswered: "No response",
  yes: "Confirmed",
  maybe: "Needs time",
  no: "Declined",
};
export class AppError extends Error {
  constructor(
    message: string,
    public status = 400,
  ) {
    super(message);
  }
}
const text = (max: number) => z.string().trim().max(max);
const instant = z.string().datetime({ offset: true });
export const eventInput = z.object({
  title: text(120).min(1, "Add an event title."),
  hostName: text(80).min(1, "Add your name."),
  description: text(2000),
  location: text(250).min(1, "Add a location."),
  startsAt: instant,
  deadline: instant,
  timeZone: z.string().refine((v) => {
    try {
      new Intl.DateTimeFormat("en", { timeZone: v });
      return true;
    } catch {
      return false;
    }
  }, "Choose a valid time zone."),
  deadlineReason: text(400),
});
export const guestInput = z.object({
  guestName: text(80).min(1, "Add a guest name."),
  personalNote: text(2000),
});
export const responseInput = z.object({
  status: z.enum(["yes", "maybe", "no"]),
  followUpAt: instant.nullable().optional(),
  note: text(2000).default(""),
});
export function validateEvent(input: unknown, now = new Date()) {
  const value = eventInput.parse(input);
  if (
    Date.parse(value.startsAt) <= +now ||
    Date.parse(value.deadline) <= +now ||
    Date.parse(value.deadline) > Date.parse(value.startsAt)
  )
    throw new AppError(
      "Choose a future event time and a response deadline between now and the event.",
    );
  return value;
}
export function makeResponse(
  event: Event,
  previous: Response,
  input: unknown,
  now = new Date(),
): Response {
  const value = responseInput.parse(input);
  const cutoff = Math.min(
    Date.parse(event.deadline),
    Date.parse(event.startsAt),
  );
  if (value.status === "yes" && +now >= cutoff && previous.status !== "yes")
    throw new AppError(
      "The response window has closed. Check with the host before being counted in. Your response has not changed.",
    );
  if (
    value.status === "maybe" &&
    (!value.followUpAt ||
      Date.parse(value.followUpAt) <= +now ||
      Date.parse(value.followUpAt) > cutoff)
  )
    throw new AppError(
      "Choose a future follow-up time no later than the response deadline.",
    );
  return {
    invitationId: previous.invitationId,
    status: value.status,
    followUpAt: value.status === "maybe" ? value.followUpAt! : null,
    countingAssumption: value.status === "yes" ? "included" : "not_included",
    note: value.note,
    updatedAt: now.toISOString(),
  };
}
export function formatDate(value: string, timeZone?: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short",
    timeZone,
  }).format(new Date(value));
}
export function localInput(value: Date) {
  return new Date(+value - value.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 16);
}
