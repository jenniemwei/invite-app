import "server-only";
import { randomUUID } from "node:crypto";
import {
  AppError,
  guestInput,
  initialResponse,
  makeResponse,
  validateEvent,
  type GuestDetail,
  type HostGuest,
} from "../domain";
import { repository } from "./repository";
import { invitationToken, tokenHash } from "./tokens";
export async function ownedEvent(owner: string, eventId: string) {
  const event = await repository().event(eventId);
  if (!event || event.ownerId !== owner)
    throw new AppError("This event is unavailable.", 404);
  return event;
}
export async function createEvent(owner: string, input: unknown) {
  const event = {
    ...validateEvent(input),
    id: randomUUID(),
    ownerId: owner,
    createdAt: new Date().toISOString(),
  };
  await repository().saveEvent(event);
  return event;
}
export async function addGuest(owner: string, eventId: string, input: unknown) {
  await ownedEvent(owner, eventId);
  const v = guestInput.parse(input);
  const id = randomUUID();
  const invitation = {
    ...v,
    id,
    eventId,
    tokenHash: tokenHash(await invitationToken(id)),
    revoked: false,
    createdAt: new Date().toISOString(),
  };
  await repository().saveInvitation(invitation);
  return invitation;
}
export async function hostGuests(
  owner: string,
  eventId: string,
): Promise<HostGuest[]> {
  await ownedEvent(owner, eventId);
  const db = repository();
  return Promise.all(
    (await db.invitations(eventId)).map(async (invitation) => ({
      invitation,
      response:
        (await db.response(invitation.id)) ?? initialResponse(invitation.id),
      delivery: (await db.delivery(invitation.id)) ?? {
        invitationId: invitation.id,
        status: "not_sent",
        updatedAt: null,
      },
    })),
  );
}
export async function hostInvitation(
  owner: string,
  eventId: string,
  id: string,
) {
  const event = await ownedEvent(owner, eventId);
  const invitation = await repository().invitationById(id);
  if (!invitation || invitation.eventId !== eventId)
    throw new AppError("This invitation is unavailable.", 404);
  return { event, invitation };
}
export async function guestInvitation(token: string): Promise<GuestDetail> {
  if (!/^[a-f0-9]{64}$/.test(token))
    throw new AppError(
      "This invitation link is not valid. Ask the host for the original link.",
      404,
    );
  const db = repository();
  const invitation = await db.invitationByHash(tokenHash(token));
  if (!invitation || invitation.revoked)
    throw new AppError(
      "This invitation is unavailable. Please check with the host.",
      404,
    );
  const event = await db.event(invitation.eventId);
  if (!event) throw new AppError("This event is unavailable.", 404);
  const { tokenHash: _private, ...safe } = invitation;
  void _private;
  return {
    event: { ...event, ownerId: "" },
    invitation: safe,
    response:
      (await db.response(invitation.id)) ?? initialResponse(invitation.id),
  };
}
export async function respond(token: string, input: unknown) {
  const detail = await guestInvitation(token);
  const response = makeResponse(detail.event, detail.response, input);
  await repository().saveResponse(response);
  return { ...detail, response };
}
export async function copyLink(owner: string, eventId: string, id: string) {
  await hostInvitation(owner, eventId, id);
  await repository().saveDelivery({
    invitationId: id,
    status: "link_copied",
    updatedAt: new Date().toISOString(),
  });
}
