import type { Metadata } from "next";
import "./globals.css";
import { AppShell } from "@/components/layout/AppShell";

export const metadata: Metadata = {
  title: "Got Mail — ethical email, zero blocklists",
  description:
    "Discover trusted free & low-cost email providers, verify your domain, and send compliant 1,000+ recipient campaigns without torching your sender reputation.",
  applicationName: "Got Mail",
  authors: [{ name: "Got Mail" }],
  keywords: [
    "email marketing",
    "ethical email",
    "CAN-SPAM",
    "GDPR",
    "SPF DKIM DMARC",
    "open source email",
    "listmonk",
    "Mautic",
    "Brevo",
    "Mailjet",
    "Resend",
  ],
  openGraph: {
    title: "Got Mail",
    description:
      "You've got... ethical email. Find free providers, set up your domain, send 1,000+ campaigns safely.",
    url: "/",
    siteName: "Got Mail",
    locale: "en_US",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="crt min-h-screen font-body text-white antialiased">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
