import Link from "next/link";
import { PageHeader } from "./PageHeader";
import { Warning } from "./Warning";

/**
 * PlaceholderPage — scaffolded page shell used until a feature is fully wired.
 * Every Got Mail page follows the same shape so the UX stays consistent while
 * features land one by one.
 */
export function PlaceholderPage({
  eyebrow,
  title,
  subtitle,
  bullets,
  warn,
  ctaHref,
  ctaLabel,
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
  bullets: string[];
  warn?: string;
  ctaHref?: string;
  ctaLabel?: string;
}) {
  return (
    <div>
      <PageHeader
        eyebrow={eyebrow}
        title={title}
        subtitle={subtitle}
        actions={
          ctaHref && ctaLabel ? (
            <Link href={ctaHref} className="btn-primary">
              {ctaLabel}
            </Link>
          ) : undefined
        }
      />
      <div className="panel p-6">
        <h3 className="font-display text-xl text-white">What this page does</h3>
        <ul className="mt-3 space-y-1.5 text-sm text-white/80">
          {bullets.map((b) => (
            <li key={b} className="flex gap-2">
              <span className="text-envelope-500">★</span>
              <span>{b}</span>
            </li>
          ))}
        </ul>
      </div>
      {warn && (
        <div className="mt-6">
          <Warning title="Note" tone="info">
            {warn}
          </Warning>
        </div>
      )}
    </div>
  );
}
