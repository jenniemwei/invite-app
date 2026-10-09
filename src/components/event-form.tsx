"use client";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button, ErrorNotice, Field } from "./ui";
import { sampleEvent } from "@/lib/sample";
import { localInput, type Event } from "@/lib/domain";
import { post } from "@/lib/client";
export function EventForm() {
  const router = useRouter();
  const [values, setValues] = useState({
    title: "",
    hostName: "",
    description: "",
    location: "",
    startsAt: "",
    deadline: "",
    deadlineReason: "",
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  function set(key: keyof typeof values, value: string) {
    setValues((v) => ({ ...v, [key]: value }));
  }
  async function submit(e: FormEvent) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      const event = await post<Event>("/api/events", {
        ...values,
        startsAt: new Date(values.startsAt).toISOString(),
        deadline: new Date(values.deadline).toISOString(),
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      });
      router.replace(`/host/events/${event.id}`);
      router.refresh();
    } catch (e) {
      setError((e as Error).message);
      setBusy(false);
    }
  }
  function fill() {
    const s = sampleEvent();
    setValues({
      ...s,
      startsAt: localInput(new Date(s.startsAt)),
      deadline: localInput(new Date(s.deadline)),
    });
  }
  return (
    <form onSubmit={submit} className="form-stack">
      <div className="form-intro">
        <Button secondary type="button" onClick={fill}>
          <Sparkles size={15} aria-hidden="true" />
          Fill with sample details
        </Button>
      </div>
      <Field label="Event title">
        <input
          required
          maxLength={120}
          placeholder="Dinner at mine"
          value={values.title}
          onChange={(e) => set("title", e.target.value)}
        />
      </Field>
      <Field label="Your name">
        <input
          required
          autoComplete="given-name"
          maxLength={80}
          placeholder="How your guests know you"
          value={values.hostName}
          onChange={(e) => set("hostName", e.target.value)}
        />
      </Field>
      <Field label="A little about the plan">
        <textarea
          maxLength={2000}
          rows={3}
          placeholder="What should people look forward to?"
          value={values.description}
          onChange={(e) => set("description", e.target.value)}
        />
      </Field>
      <div className="form-grid">
        <Field label="Date and time" hint="Times use your device’s time zone.">
          <input
            required
            type="datetime-local"
            value={values.startsAt}
            onChange={(e) => set("startsAt", e.target.value)}
          />
        </Field>
        <Field label="Reply by">
          <input
            required
            type="datetime-local"
            value={values.deadline}
            onChange={(e) => set("deadline", e.target.value)}
          />
        </Field>
      </div>
      <Field label="Location">
        <input
          required
          maxLength={250}
          placeholder="Where the event will take place"
          value={values.location}
          onChange={(e) => set("location", e.target.value)}
        />
      </Field>
      <Field
        label="Why you need a reply"
        hint="Optional. A little context makes it easier to respond."
      >
        <input
          maxLength={400}
          placeholder="So I can plan the groceries."
          value={values.deadlineReason}
          onChange={(e) => set("deadlineReason", e.target.value)}
        />
      </Field>
      <ErrorNotice message={error} />
      <div className="form-footer">
        <p>You’ll add guests and personal notes next.</p>
        <Button busy={busy}>
          Create event
          <ArrowRight size={17} aria-hidden="true" />
        </Button>
      </div>
    </form>
  );
}
