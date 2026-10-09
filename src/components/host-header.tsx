"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { LogoutButton } from "@/components/host-controls";

export function HostHeader({ local }: { local: boolean }) {
  const pathname = usePathname();
  const match = pathname.match(
    /^\/host\/events\/([^/]+)(?:\/invitations\/[^/]+)?\/?$/,
  );
  const detail = !!match && match[1] !== "new";
  const guestPreview = detail && pathname.includes("/invitations/");
  const backHref = guestPreview ? `/host/events/${match![1]}` : "/host";

  return (
    <header className="site-header" data-detail={detail}>
      <div className="header-inner">
        {detail && (
          <Link
            href={backHref}
            className="header-back"
            aria-label={
              guestPreview ? "Back to guest list" : "Back to your events"
            }
          >
            <ArrowLeft size={20} aria-hidden="true" />
            Back
          </Link>
        )}
        <Link
          href="/host"
          aria-label="Invitations home"
          className="host-home-link"
        >
          <span className="app-label">Invitations</span>
        </Link>
        <nav aria-label="Main navigation" className="host-main-nav">
          <Link href="/host" className="nav-link">
            Your events
          </Link>
          {!local && <LogoutButton />}
          <span className="avatar" aria-label="Host workspace">
            H
          </span>
        </nav>
      </div>
    </header>
  );
}
