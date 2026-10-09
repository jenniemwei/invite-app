import { CalendarDays, MapPin, Clock3 } from "lucide-react";
import { formatDate, type Event, type Invitation } from "@/lib/domain";
export function InvitationCard({
  event,
  invitation,
}: {
  event: Event;
  invitation: Pick<Invitation, "guestName" | "personalNote">;
}) {
  return (
    <article className="invitation-card">
      <p className="eyebrow">Invitation for {invitation.guestName}</p>
      <h1>{event.title}</h1>
      <p className="invited-by">You’re invited by {event.hostName}</p>
      {invitation.personalNote && (
        <blockquote>{invitation.personalNote}</blockquote>
      )}
      <p className="event-description">{event.description}</p>
      <dl className="event-details">
        <div>
          <CalendarDays size={19} aria-hidden="true" />
          <dt className="sr-only">When</dt>
          <dd>{formatDate(event.startsAt, event.timeZone)}</dd>
        </div>
        <div>
          <MapPin size={19} aria-hidden="true" />
          <dt className="sr-only">Where</dt>
          <dd>{event.location}</dd>
        </div>
        <div>
          <Clock3 size={19} aria-hidden="true" />
          <dt className="sr-only">Response deadline</dt>
          <dd>
            Reply by {formatDate(event.deadline, event.timeZone)}
            {event.deadlineReason && <small>{event.deadlineReason}</small>}
          </dd>
        </div>
      </dl>
    </article>
  );
}
