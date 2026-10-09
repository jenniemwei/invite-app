import Link from "next/link";
import { ArrowLeft, ArrowUpRight, LoaderCircle } from "lucide-react";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { statusLabels, type RSVP } from "@/lib/domain";
export function Button({
  children,
  busy,
  secondary,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  busy?: boolean;
  secondary?: boolean;
}) {
  return (
    <button
      {...props}
      disabled={props.disabled || busy}
      className={`button ${secondary ? "secondary" : ""} ${props.className || ""}`}
    >
      {busy && <LoaderCircle size={16} className="spin" aria-hidden="true" />}
      {children}
    </button>
  );
}
export function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <label className="field">
      <span>{label}</span>
      {children}
      {hint && <small>{hint}</small>}
    </label>
  );
}
export function ErrorNotice({ message }: { message?: string }) {
  return message ? (
    <div className="error-notice" role="alert">
      {message}
    </div>
  ) : null;
}
export function Status({ status }: { status: RSVP }) {
  return (
    <span className={`status status-${status}`}>
      <span aria-hidden="true" />
      {statusLabels[status]}
    </span>
  );
}
export function BackLink({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) {
  return (
    <Link href={href} className="back-link">
      <ArrowLeft size={16} aria-hidden="true" />
      {children}
    </Link>
  );
}
export function EmptyState({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="empty-state">
      <h2>{title}</h2>
      <p>{children}</p>
    </div>
  );
}
export function ExternalMark() {
  return <ArrowUpRight size={16} aria-hidden="true" />;
}
