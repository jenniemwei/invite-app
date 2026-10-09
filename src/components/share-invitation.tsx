"use client";
import { useSyncExternalStore, useState } from "react";
import { Copy, ArrowUpRight, Check } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button, ErrorNotice, Field } from "./ui";
import { post } from "@/lib/client";
const subscribe = () => () => {};
const originSnapshot = () => window.location.origin;
const serverSnapshot = () => "";
export function ShareInvitation({
  path,
  eventId,
  invitationId,
}: {
  path: string;
  eventId: string;
  invitationId: string;
}) {
  const origin = useSyncExternalStore(
    subscribe,
    originSnapshot,
    serverSnapshot,
  );
  const url = `${origin}${path}`;
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  async function copy() {
    setError("");
    try {
      if (!navigator.clipboard)
        throw new Error(
          "Select and copy the link below. Automatic copying requires HTTPS or localhost.",
        );
      await navigator.clipboard.writeText(url);
      setCopied(true);
      await post(`/api/events/${eventId}/guests/${invitationId}/copied`);
      router.refresh();
    } catch (e) {
      setError((e as Error).message);
    }
  }
  return (
    <section className="share-panel">
      <p className="eyebrow">A link just for them</p>
      <h2>Ready when you are.</h2>
      <p>
        Send this invitation in a personal message. Anyone with the link can
        view and respond to it.
      </p>
      <Field label="Private invitation link">
        <input readOnly value={url} onFocus={(e) => e.target.select()} />
      </Field>
      <div className="share-actions">
        <Button onClick={copy}>
          {copied ? (
            <Check size={16} aria-hidden="true" />
          ) : (
            <Copy size={16} aria-hidden="true" />
          )}
          {copied ? "Link copied" : "Copy invitation link"}
        </Button>
        <a
          className="button secondary"
          href={path}
          target="_blank"
          rel="noreferrer"
        >
          Open guest experience
          <ArrowUpRight size={16} aria-hidden="true" />
        </a>
      </div>
      <p className="fine-print" role="status">
        {copied
          ? "Copied to your clipboard. No message has been sent."
          : "Sharing is manual. Copying a link does not mark it as delivered."}
      </p>
      <ErrorNotice message={error} />
    </section>
  );
}
