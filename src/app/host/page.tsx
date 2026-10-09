import Link from "next/link";
import { Plus, ArrowUpRight, CalendarDays, MapPin } from "lucide-react";
import { requireHost } from "@/lib/server/auth";
import { repository } from "@/lib/server/repository";
import { hostGuests } from "@/lib/server/service";
import { formatDate } from "@/lib/domain";
import { EmptyState } from "@/components/ui";
export default async function HostHome() {
  const owner = await requireHost(true);
  const events = (await repository().events(owner)).sort((a, b) =>
    b.createdAt.localeCompare(a.createdAt),
  );
  const cards = await Promise.all(
    events.map(async (e) => ({
      event: e,
      guests: await hostGuests(owner, e.id),
    })),
  );
  return (
    <>
      <div className="page-heading">
        <Link className="button" href="/host/events/new">
          <Plus size={18} aria-hidden="true" />
          Create invitation
        </Link>
      </div>
      <div className="section-heading">
        <h2>
          Your events <span className="count">{events.length}</span>
        </h2>
      </div>
      {cards.length ? (
        <div className="event-grid">
          {cards.map(({ event: e, guests }) => (
            <Link
              className="event-tile"
              key={e.id}
              href={`/host/events/${e.id}`}
            >
              <div className="tile-body">
                <div className="tile-title">
                  <h2>{e.title}</h2>
                  <ArrowUpRight size={20} aria-hidden="true" />
                </div>
                <p>
                  <CalendarDays size={15} aria-hidden="true" />
                  {formatDate(e.startsAt, e.timeZone)}
                </p>
                <p>
                  <MapPin size={15} aria-hidden="true" />
                  {e.location}
                </p>
                <div className="tile-meta">
                  <span>
                    {guests.length} guest{guests.length !== 1 ? "s" : ""}{" "}
                    invited
                  </span>
                  <strong>
                    {guests.filter((g) => g.response.status === "yes").length}{" "}
                    confirmed
                  </strong>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="empty-panel">
          <EmptyState title="No events yet">
            Create an event, add guests, and write a personal note for each
            invitation.
          </EmptyState>
          <Link className="button secondary" href="/host/events/new">
            Create your first invitation
            <ArrowUpRight size={16} aria-hidden="true" />
          </Link>
        </div>
      )}
    </>
  );
}
