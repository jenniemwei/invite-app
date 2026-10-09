"use client";
import { useEffect, useState } from "react";
import { LoaderCircle } from "lucide-react";
import { Button, ErrorNotice } from "./ui";
import { InvitationCard } from "./invitation-card";
import { scrollToAppTop } from "@/lib/client";
import { type GuestDetail } from "@/lib/domain";
import { ResponseForm } from "./response-form";
import { ResponseCompletion } from "./response-completion";
export function GuestExperience({ token }: { token: string }) {
  const [detail, setDetail] = useState<GuestDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retry, setRetry] = useState(0);
  const [complete, setComplete] = useState(false);
  useEffect(() => {
    const c = new AbortController();
    fetch(`/api/invitations/${token}`, { signal: c.signal, cache: "no-store" })
      .then(async (r) => {
        const d = await r.json();
        if (!r.ok) throw new Error(d.error);
        setDetail(d);
        setComplete(d.response.status !== "unanswered");
      })
      .catch((e) => {
        if (e.name !== "AbortError")
          setError(e.message || "Your invitation could not be loaded.");
      })
      .finally(() => {
        if (!c.signal.aborted) setLoading(false);
      });
    return () => c.abort();
  }, [token, retry]);
  if (loading)
    return (
      <section className="guest-state" aria-live="polite">
        <LoaderCircle size={30} className="spin" aria-hidden="true" />
        <h1>Opening your invitation</h1>
        <p>Something good is on the way.</p>
      </section>
    );
  if (!detail)
    return (
      <section className="guest-state">
        <h1>We couldn’t open this invitation.</h1>
        <ErrorNotice message={error} />
        <p>Check the link with your host, or try again.</p>
        <Button
          secondary
          onClick={() => {
            setLoading(true);
            setError("");
            setRetry(retry + 1);
          }}
        >
          Try again
        </Button>
      </section>
    );
  if (complete)
    return (
      <ResponseCompletion detail={detail} onEdit={() => setComplete(false)} />
    );
  return (
    <>
      <InvitationCard event={detail.event} invitation={detail.invitation} />
      <ResponseForm
        detail={detail}
        token={token}
        onSaved={(d) => {
          setDetail(d);
          setComplete(true);
          scrollToAppTop();
        }}
      />
    </>
  );
}
