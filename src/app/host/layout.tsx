import { HostHeader } from "@/components/host-header";
import { requireHost } from "@/lib/server/auth";
import { dataMode } from "@/lib/server/config";
export const dynamic = "force-dynamic";
export default async function HostLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireHost(true);
  const local = dataMode() === "local";
  return (
    <>
      <HostHeader local={local} />
      <main id="main" className="host-main">
        {children}
      </main>
      <footer className="site-footer">
        <span>Invitation prototype</span>
      </footer>
    </>
  );
}
