import { GuestExperience } from "@/components/guest-experience";
import { dataMode } from "@/lib/server/config";
export const dynamic = "force-dynamic";
export const metadata = {
  title: "Your personal invitation",
  description:
    "You have a personal invitation. Open it to read the details and respond.",
};
export default async function GuestPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  return (
    <div className="guest-page">
      <header className="guest-header">
        <span className="app-label">Your invitation</span>
      </header>
      <main id="main" className="guest-main">
        <GuestExperience key={token} token={token} />
      </main>
      <footer className="guest-footer">
        <small>
          {dataMode() === "local"
            ? "Local web demo · saved on the host’s development server"
            : "Web prototype · responses saved online"}
        </small>
      </footer>
    </div>
  );
}
