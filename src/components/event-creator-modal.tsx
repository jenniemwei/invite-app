"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import { EventForm } from "@/components/event-form";

const subscribe = () => () => {};
const getPortalRoot = () => document.querySelector(".device-frame");
const getServerRoot = () => null;

export function EventCreatorModal() {
  const router = useRouter();
  const root = useSyncExternalStore(subscribe, getPortalRoot, getServerRoot);
  const dialog = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!root || !dialog.current) return;
    const viewport = document.getElementById("app-viewport");
    const previousFocus = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    const previousInert = viewport?.inert ?? false;
    document.body.style.overflow = "hidden";
    if (viewport) viewport.inert = true;
    dialog.current.focus();
    return () => {
      document.body.style.overflow = previousOverflow;
      if (viewport) viewport.inert = previousInert;
      if (previousFocus?.isConnected && previousFocus !== document.body) {
        previousFocus.focus({ preventScroll: true });
      } else {
        document
          .querySelector<HTMLElement>('a[href="/host/events/new"]')
          ?.focus({ preventScroll: true });
      }
    };
  }, [root]);

  if (!root) return null;
  const close = () => router.replace("/host", { scroll: false });

  return createPortal(
    <div
      className="creator-overlay"
      onClick={(event) => {
        if (event.target === event.currentTarget) close();
      }}
    >
      <div
        className="creator-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="creator-title"
        tabIndex={-1}
        ref={dialog}
        onKeyDown={(event) => {
          if (event.key === "Escape") {
            event.preventDefault();
            close();
          }
          if (event.key !== "Tab") return;
          const controls = Array.from(
            event.currentTarget.querySelectorAll<HTMLElement>(
              'button:not(:disabled), input:not(:disabled), textarea:not(:disabled), a[href], [tabindex="0"]',
            ),
          ).filter((el) => el.getClientRects().length > 0);
          const first = controls[0];
          const last = controls[controls.length - 1];
          if (
            event.shiftKey &&
            (document.activeElement === first ||
              document.activeElement === event.currentTarget)
          ) {
            event.preventDefault();
            last?.focus();
          } else if (!event.shiftKey && document.activeElement === last) {
            event.preventDefault();
            first?.focus();
          }
        }}
      >
        <div className="creator-header">
          <h1 id="creator-title">Create invitation</h1>
          <button
            type="button"
            className="creator-close"
            aria-label="Close invitation creator"
            onClick={close}
          >
            <X size={22} aria-hidden="true" />
          </button>
        </div>
        <div className="creator-body">
          <EventForm />
        </div>
      </div>
    </div>,
    root,
  );
}
