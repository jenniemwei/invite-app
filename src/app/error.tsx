"use client";
import { Button } from "@/components/ui";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <main id="main" className="guest-state">
      <h1>Something needs a moment.</h1>
      <p>
        We couldn’t load this page. Please try again. If it continues, check the
        server configuration.
      </p>
      <Button onClick={reset}>Try again</Button>
      <a href="/host" className="back-link">
        Return to your events
      </a>
    </main>
  );
}
