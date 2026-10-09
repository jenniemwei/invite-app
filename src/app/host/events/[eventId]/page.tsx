import Link from "next/link";
import { Plus, ArrowUpRight, CalendarDays, MapPin } from "lucide-react";
import { requireHost } from "@/lib/server/auth";
import { ownedEvent, hostGuests } from "@/lib/server/service";
import { formatDate, type RSVP } from "@/lib/domain";
import { BackLink, Status } from "@/components/ui";
import { GuestForm } from "@/components/guest-form";
import { RefreshButton } from "@/components/host-controls";
export default async function EventPage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const { eventId } = await params;
  const owner = await requireHost(true);
  const event = await ownedEvent(owner, eventId);
  const guests = await hostGuests(owner, eventId);
  const groups: [RSVP, string][] = [
    ["yes", "Confirmed"],
    ["maybe", "Need time"],
    ["no", "Declined"],
    ["unanswered", "No response"],
  ];
  return (
    <>
      <BackLink href="/host">Your events</BackLink>
      <div className="page-heading compact">
        <div>
          <h1>{event.title}</h1>
          <div className="inline-details">
            <span>
              <CalendarDays size={16} aria-hidden="true" />
              {formatDate(event.startsAt, event.timeZone)}
            </span>
            <span>
              <MapPin size={16} aria-hidden="true" />
              {event.location}
            </span>
          </div>
        </div>
        <RefreshButton />
      </div>
      <div className="stats-grid">
        {groups.map(([s, label]) => (
          <div className={`stat stat-${s}`} key={s}>
            <span>{label}</span>
            <strong>
              {guests.filter((g) => g.response.status === s).length}
            </strong>
            {s === "yes" && <small>Included in headcount</small>}
            {s === "maybe" && <small>Not counted yet</small>}
          </div>
        ))}
      </div>
      <div className="workspace-grid">
        <section>
          <div className="section-heading">
            <h2>
              Your guests <span className="count">{guests.length}</span>
            </h2>
            <a className="text-button" href="#add-guest">
              <Plus size={16} aria-hidden="true" />
              Add guest
            </a>
          </div>
          {guests.length ? (
            <div className="guest-list">
              {groups.map(([status, label]) => {
                const rows = guests.filter((g) => g.response.status === status);
                return rows.length ? (
                  <section className="guest-group" key={status}>
                    <h3>{label}</h3>
                    {rows.map((g) => (
                      <Link
                        key={g.invitation.id}
                        className="guest-row"
                        href={`/host/events/${eventId}/invitations/${g.invitation.id}`}
                      >
                        <span className="guest-avatar" aria-hidden="true">
                          {g.invitation.guestName[0]}
                        </span>
                        <div className="guest-info">
                          <strong>{g.invitation.guestName}</strong>
                          <small>
                            {g.delivery.status === "link_copied"
                              ? "Link copied"
                              : "Link not shared"}
                            {g.response.followUpAt
                              ? ` · Follow up ${formatDate(g.response.followUpAt)}`
                              : ""}
                          </small>
                          {g.response.note && <p>“{g.response.note}”</p>}
                        </div>
                        <Status status={g.response.status} />
                        <ArrowUpRight size={16} aria-hidden="true" />
                      </Link>
                    ))}
                  </section>
                ) : null;
              })}
            </div>
          ) : (
            <div className="panel empty-guests">
              <h3>The table is yours to fill.</h3>
              <p>
                Add your first guest and write them a little note. Their private
                link will be ready to share.
              </p>
            </div>
          )}
          <p className="fine-print">
            Only confirmed guests count toward attendance. No response never
            becomes a yes.
          </p>
        </section>
        <aside>
          <section id="add-guest" className="panel">
            <h2>Invite someone.</h2>
            <GuestForm eventId={eventId} />
          </section>
          <div className="deadline-note">
            <strong>
              Replies by {formatDate(event.deadline, event.timeZone)}
            </strong>
            <p>
              {event.deadlineReason ||
                "Guests can ask for time without being counted in."}
            </p>
          </div>
        </aside>
      </div>
    </>
  );
}
