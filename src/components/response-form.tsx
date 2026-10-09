"use client";
import { useState, type FormEvent } from "react";
import { ArrowRight } from "lucide-react";
import { Button, Field, ErrorNotice } from "./ui";
import { localInput, type GuestDetail } from "@/lib/domain";
import { post } from "@/lib/client";
export function ResponseForm({
  detail,
  token,
  onSaved,
}: {
  detail: GuestDetail;
  token: string;
  onSaved: (d: GuestDetail) => void;
}) {
  const [status, setStatus] = useState(
    detail.response.status === "unanswered" ? "" : detail.response.status,
  );
  const [followUp, setFollowUp] = useState(
    detail.response.followUpAt
      ? localInput(new Date(detail.response.followUpAt))
      : "",
  );
  const [note, setNote] = useState(detail.response.note);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const choices = [
    { value: "yes", title: "Yes, I’ll be there", detail: "Count me in." },
    {
      value: "maybe",
      title: "I need time",
      detail: "I’ll choose a date to get back to you.",
    },
    {
      value: "no",
      title: "I can’t attend",
      detail: "Thanks for thinking of me.",
    },
  ];
  async function submit(e: FormEvent) {
    e.preventDefault();
    if (busy) return;
    setError("");
    setBusy(true);
    try {
      onSaved(
        await post<GuestDetail>(`/api/invitations/${token}`, {
          status,
          followUpAt:
            status === "maybe" && followUp
              ? new Date(followUp).toISOString()
              : null,
          note,
        }),
      );
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <form onSubmit={submit} className="response-form">
      <fieldset disabled={busy}>
        <legend>What can {detail.event.hostName} plan around?</legend>
        <p className="muted">
          A clear answer helps, even if you need more time.
        </p>
        <div className="response-choices">
          {choices.map((c) => (
            <label
              key={c.value}
              className={`response-choice ${status === c.value ? "selected" : ""}`}
            >
              <input
                required
                type="radio"
                name="response"
                value={c.value}
                checked={status === c.value}
                onChange={() => setStatus(c.value as typeof status)}
              />
              <span>
                <strong>{c.title}</strong>
                <small>{c.detail}</small>
              </span>
            </label>
          ))}
        </div>
        {status === "maybe" && (
          <div className="follow-up">
            <Field
              label="When can you get back to them?"
              hint="Use your device’s local time. This date won’t automatically confirm you."
            >
              <input
                required
                type="datetime-local"
                max={localInput(new Date(detail.event.deadline))}
                value={followUp}
                onChange={(e) => setFollowUp(e.target.value)}
              />
            </Field>
          </div>
        )}
        <Field label={`A note to ${detail.event.hostName} (optional)`}>
          <textarea
            rows={3}
            maxLength={2000}
            placeholder="Anything you’d like them to know…"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </Field>
      </fieldset>
      <ErrorNotice message={error} />
      <Button busy={busy} disabled={!status}>
        Confirm response
        <ArrowRight size={17} aria-hidden="true" />
      </Button>
      <p className="fine-print">
        Your answer goes only to your host. You can come back to change it.
      </p>
    </form>
  );
}
