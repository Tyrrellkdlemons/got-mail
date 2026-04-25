import { redirect } from "next/navigation";
import Link from "next/link";
import { isAdminAuthed } from "@/lib/admin-auth";
import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/ui/PageHeader";
import { Section } from "@/components/ui/Section";
import { StatCard } from "@/components/ui/StatCard";
import { Warning } from "@/components/ui/Warning";
import {
  Users2, Mail, ShieldCheck, AlertTriangle, Zap, Database, KeyRound, RefreshCcw, FlaskConical, Flame,
} from "lucide-react";
import { AdminActions } from "./admin-actions-client";

export const dynamic = "force-dynamic";

export default async function AdminPanel() {
  if (!(await isAdminAuthed())) {
    redirect("/__admin/login");
  }

  // Pull a snapshot of system state.
  const [workspace, contactCount, segmentCount, campaignCount, identityCount, domainCount, suppressionCount, sourceCount, recentSends, recentEvents] =
    await Promise.all([
      prisma.workspace.findFirst({ where: { slug: "default" } }).catch(() => null),
      prisma.contact.count().catch(() => 0),
      prisma.segment.count().catch(() => 0),
      prisma.campaign.count().catch(() => 0),
      prisma.sendingIdentity.count().catch(() => 0),
      prisma.domain.count().catch(() => 0),
      prisma.suppression.count().catch(() => 0),
      prisma.sourceResearchItem.count().catch(() => 0),
      prisma.emailSend.findMany({ orderBy: { sentAt: "desc" }, take: 5 }).catch(() => []),
      prisma.emailEvent.findMany({ orderBy: { occurredAt: "desc" }, take: 5 }).catch(() => []),
    ]);

  const env = process.env;
  const providerStatus = [
    { kind: "Brevo",        env: "BREVO_API_KEY",        present: !!env.BREVO_API_KEY,    note: "Account suspended (ticket #5332419)" },
    { kind: "Gmail SMTP",   env: "GMAIL_USER + GMAIL_APP_PASSWORD", present: !!(env.GMAIL_USER && env.GMAIL_APP_PASSWORD), note: "✓ live · 500/day" },
    { kind: "Resend",       env: "RESEND_API_KEY",       present: !!env.RESEND_API_KEY,    note: "—" },
    { kind: "Mailjet",      env: "MAILJET_API_KEY",      present: !!env.MAILJET_API_KEY,   note: "—" },
    { kind: "Postmark",     env: "POSTMARK_SERVER_TOKEN", present: !!env.POSTMARK_SERVER_TOKEN, note: "—" },
    { kind: "SendGrid",     env: "SENDGRID_API_KEY",     present: !!env.SENDGRID_API_KEY,  note: "—" },
    { kind: "MailerSend",   env: "MAILERSEND_API_KEY",   present: !!env.MAILERSEND_API_KEY, note: "—" },
    { kind: "SMTP2GO",      env: "SMTP2GO_API_KEY",      present: !!env.SMTP2GO_API_KEY,   note: "—" },
    { kind: "Elastic",      env: "ELASTICEMAIL_API_KEY", present: !!env.ELASTICEMAIL_API_KEY, note: "—" },
    { kind: "Mailtrap",     env: "MAILTRAP_API_TOKEN",   present: !!env.MAILTRAP_API_TOKEN, note: "sandbox only on free tier" },
    { kind: "ZeptoMail",    env: "ZEPTOMAIL_API_KEY",    present: !!env.ZEPTOMAIL_API_KEY, note: "—" },
    { kind: "SMTP fallback", env: "SMTP_HOST + SMTP_USER + SMTP_PASS", present: !!(env.SMTP_HOST && env.SMTP_USER && env.SMTP_PASS), note: env.SMTP_HOST?.includes("sandbox") ? "Mailtrap sandbox" : "configured" },
    { kind: "Postal (OSS)",  env: "POSTAL_BASE_URL + POSTAL_API_KEY", present: !!(env.POSTAL_BASE_URL && env.POSTAL_API_KEY), note: env.POSTAL_BASE_URL ? "configured" : "self-host needed" },
    { kind: "listmonk (OSS)", env: "LISTMONK_BASE_URL + LISTMONK_USERNAME + LISTMONK_PASSWORD", present: !!(env.LISTMONK_BASE_URL && env.LISTMONK_USERNAME && env.LISTMONK_PASSWORD), note: env.LISTMONK_BASE_URL ? "configured" : "self-host needed" },
    { kind: "Mautic (OSS)",  env: "MAUTIC_BASE_URL + MAUTIC_USERNAME + MAUTIC_PASSWORD", present: !!(env.MAUTIC_BASE_URL && env.MAUTIC_USERNAME && env.MAUTIC_PASSWORD), note: env.MAUTIC_BASE_URL ? "configured" : "self-host needed" },
  ];

  return (
    <div>
      <PageHeader
        eyebrow="★ admin · authenticated"
        title="Got Mail control panel"
        subtitle={workspace ? `Workspace: ${workspace.name} (${workspace.slug})` : "No workspace yet — run the seed."}
        actions={
          <>
            <Link href="/dashboard" className="btn-secondary">← Back to public site</Link>
            <form action="/api/__admin/auth" method="POST">
              <button
                type="button"
                className="btn-secondary"
                onClick={async () => {
                  await fetch("/api/__admin/auth", { method: "DELETE" });
                  window.location.href = "/";
                }}
              >
                Sign out
              </button>
            </form>
          </>
        }
      />

      <Section title="At a glance">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-8">
          <StatCard label="Contacts" value={contactCount} icon={<Users2 />} />
          <StatCard label="Segments" value={segmentCount} icon={<ShieldCheck />} />
          <StatCard label="Campaigns" value={campaignCount} icon={<Mail />} />
          <StatCard label="Identities" value={identityCount} icon={<Zap />} />
          <StatCard label="Domains" value={domainCount} icon={<ShieldCheck />} />
          <StatCard label="Suppressed" value={suppressionCount} icon={<AlertTriangle />} tone="warn" />
          <StatCard label="Sources" value={sourceCount} icon={<Database />} />
          <StatCard label="Recent sends" value={recentSends.length} icon={<Mail />} />
        </div>
      </Section>

      <Section title="Provider keys">
        <div className="overflow-hidden rounded-chunky border border-white/10 bg-white/5">
          <table className="w-full text-sm">
            <thead className="bg-aol-900/60 font-retro text-[10px] uppercase tracking-widest text-envelope-500">
              <tr>
                <th className="px-4 py-3 text-left">Provider</th>
                <th className="px-4 py-3 text-left">Env</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Note</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {providerStatus.map((p) => (
                <tr key={p.kind} className="hover:bg-white/5">
                  <td className="px-4 py-3 font-semibold">{p.kind}</td>
                  <td className="px-4 py-3 font-mono text-xs text-white/60">{p.env}</td>
                  <td className="px-4 py-3">
                    {p.present ? (
                      <span className="tag-good">configured</span>
                    ) : (
                      <span className="tag">missing</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-xs text-white/70">{p.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <Section title="Recent email sends">
        {recentSends.length === 0 ? (
          <div className="text-sm text-white/60">No sends yet. Try one from <Link href="/test-send" className="underline">/test-send</Link>.</div>
        ) : (
          <div className="overflow-hidden rounded-chunky border border-white/10 bg-white/5">
            <table className="w-full text-sm">
              <thead className="bg-aol-900/60 font-retro text-[10px] uppercase tracking-widest text-envelope-500">
                <tr>
                  <th className="px-4 py-3 text-left">When</th>
                  <th className="px-4 py-3 text-left">To</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-left">Provider</th>
                  <th className="px-4 py-3 text-left">Provider msg id</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {recentSends.map((s: any) => (
                  <tr key={s.id} className="hover:bg-white/5">
                    <td className="px-4 py-3 font-mono text-xs text-white/60">{new Date(s.sentAt).toISOString().replace("T", " ").slice(0, 19)}</td>
                    <td className="px-4 py-3 font-mono">{s.toEmail}</td>
                    <td className="px-4 py-3">{s.status}</td>
                    <td className="px-4 py-3 text-xs text-white/70">{s.providerKind ?? "—"}</td>
                    <td className="px-4 py-3 font-mono text-xs text-white/60 break-all">{s.messageId ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Section>

      <Section title="Dangerous actions">
        <Warning title="Read before clicking" tone="warn">
          These actions modify or delete data. There's a confirmation prompt for each, but they execute immediately on confirm.
        </Warning>
        <AdminActions />
      </Section>

      <Section title="Backdoor entry points">
        <div className="text-sm text-white/70">
          See <code className="font-mono">BACKDOORS.md</code> in the repo for the three ways to reach this page (konami, logo clicks, secret URL).
          Token cookie is signed with HMAC-SHA256 and expires in 24h. Rotate <code className="font-mono">ADMIN_TOKEN</code> in your <code className="font-mono">.env</code> + Netlify env vars to invalidate all existing sessions.
        </div>
      </Section>
    </div>
  );
}
