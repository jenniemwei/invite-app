import type { Metadata } from "next";
import "./globals.css";
import { PreviewShell } from "@/components/preview-shell";
export const metadata: Metadata = {
  title: { default: "Personal invitations", template: "%s · Invitations" },
  description: "A personal invitation. A little room to respond.",
  robots: { index: false, follow: false },
};
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body>
        <a className="skip-link" href="#main">
          Skip to content
        </a>
        <PreviewShell>{children}</PreviewShell>
      </body>
    </html>
  );
}
