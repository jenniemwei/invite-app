import Link from "next/link";
export default function NotFound() {
  return (
    <main id="main" className="guest-state">
      <h1>This page isn’t here.</h1>
      <p>
        If you’re opening an invitation, ask your host for the original link.
      </p>
      <Link className="button secondary" href="/host">
        Go to your events
      </Link>
    </main>
  );
}
