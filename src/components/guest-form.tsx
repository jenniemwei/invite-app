"use client";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { ArrowRight } from "lucide-react";
import { Button, Field, ErrorNotice } from "./ui";
import { post } from "@/lib/client";
import { sampleGuest } from "@/lib/sample";
import type { Invitation } from "@/lib/domain";
export function GuestForm({ eventId }: { eventId: string }) {
  const router = useRouter();
  const [values, setValues] = useState({ guestName: "", personalNote: "" });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function submit(e: FormEvent) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      const v = await post<Invitation>(`/api/events/${eventId}/guests`, values);
      router.push(`/host/events/${eventId}/invitations/${v.id}`);
      router.refresh();
    } catch (e) {
      setError((e as Error).message);
      setBusy(false);
    }
  }
  return (
    <form onSubmit={submit} className="form-stack">
      <div className="form-intro">
        <button
          type="button"
          className="text-button"
          onClick={() => setValues(sampleGuest)}
        >
          Fill sample guest
        </button>
      </div>
      <Field label="Guest name">
        <input
          required
          maxLength={80}
          placeholder="Jamie"
          value={values.guestName}
          onChange={(e) => setValues({ ...values, guestName: e.target.value })}
        />
      </Field>
      <Field
        label="A note just for them"
        hint="Only someone with this guest’s private link can read it."
      >
        <textarea
          rows={5}
          maxLength={2000}
          placeholder="I’d love to have you there…"
          value={values.personalNote}
          onChange={(e) =>
            setValues({ ...values, personalNote: e.target.value })
          }
        />
      </Field>
      <ErrorNotice message={error} />
      <Button busy={busy}>
        Create guest invitation
        <ArrowRight size={17} aria-hidden="true" />
      </Button>
    </form>
  );
}
