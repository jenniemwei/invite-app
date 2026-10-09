import { requireHost } from "@/lib/server/auth";
import { hostInvitation } from "@/lib/server/service";
import { invitationToken } from "@/lib/server/tokens";
import { initialResponse, formatDate } from "@/lib/domain";
import { repository } from "@/lib/server/repository";
import { BackLink, Status } from "@/components/ui";
import { InvitationCard } from "@/components/invitation-card";
import { ShareInvitation } from "@/components/share-invitation";
export default async function Preview({
  params,
}: {
  params: Promise<{ eventId: string; invitationId: string }>;
}) {
  const { eventId, invitationId } = await params;
  const { event, invitation } = await hostInvitation(
    await requireHost(true),
    eventId,
    invitationId,
  );
  const response =
    (await repository().response(invitationId)) ??
    initialResponse(invitationId);
  const token = await invitationToken(invitationId);
  return (
    <>
      <BackLink href={`/host/events/${eventId}`}>Back to guest list</BackLink>
      <div className="page-heading compact">
        <div>
          <p className="eyebrow">Invitation preview</p>
          <h1>A little note for {invitation.guestName}.</h1>
          <p>This is what they’ll see when they open their link.</p>
        </div>
        <Status status={response.status} />
      </div>
      <div className="preview-grid">
        <div>
          <InvitationCard event={event} invitation={invitation} />
        </div>
        <div>
          <ShareInvitation
            path={`/i/${token}`}
            eventId={eventId}
            invitationId={invitationId}
          />
          <section className="panel response-overview">
            <h2>Their response</h2>
            <Status status={response.status} />
            <p>
              {response.countingAssumption === "included"
                ? "Included in headcount"
                : "Not included in headcount"}
            </p>
            {response.followUpAt && (
              <p>Follow up: {formatDate(response.followUpAt)}</p>
            )}
            {response.note && <blockquote>{response.note}</blockquote>}
          </section>
        </div>
      </div>
    </>
  );
}
