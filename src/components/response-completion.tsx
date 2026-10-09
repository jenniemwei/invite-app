"use client";
import { Check, Clock3, Heart } from "lucide-react";
import { Button } from "./ui";
import { formatDate, type GuestDetail } from "@/lib/domain";
export function ResponseCompletion({
  detail,
  onEdit,
}: {
  detail: GuestDetail;
  onEdit: () => void;
}) {
  return (
    <section className="completion">
      <div className="completion-icon" aria-hidden="true">
        {detail.response.status === "yes" ? (
          <Check size={32} />
        ) : detail.response.status === "maybe" ? (
          <Clock3 size={32} />
        ) : (
          <Heart size={32} />
        )}
      </div>
      <p className="eyebrow">Your response is saved</p>
      <h1>
        {detail.response.status === "yes"
          ? "There’s a place for you."
          : detail.response.status === "maybe"
            ? "A little breathing room."
            : "Thanks for letting them know."}
      </h1>
      <p>
        {detail.response.status === "yes"
          ? `${detail.event.hostName} can count you in for ${detail.event.title}.`
          : detail.response.status === "maybe"
            ? `${detail.event.hostName} knows you need time. You’re not included in the confirmed headcount yet.`
            : `${detail.event.hostName} knows you can’t make it. You’re not included in the headcount.`}
      </p>
      <div className="confirmation-summary">
        <strong>{detail.event.title}</strong>
        <span>{formatDate(detail.event.startsAt, detail.event.timeZone)}</span>
        {detail.response.followUpAt && (
          <>
            <hr />
            <strong>Your follow-up date</strong>
            <span>{formatDate(detail.response.followUpAt)}</span>
            <small>
              No automatic reminder is scheduled. Return through this link when
              you know.
            </small>
          </>
        )}
        {detail.response.note && (
          <>
            <hr />
            <strong>Your note to {detail.event.hostName}</strong>
            <p>{detail.response.note}</p>
          </>
        )}
      </div>
      <Button secondary onClick={onEdit}>
        View invitation or change response
      </Button>
      <p className="fine-print">
        You can close this page. Your link will bring you back here.
      </p>
    </section>
  );
}
