import { cn } from "@/lib/utils";

export function Section({
  title,
  description,
  children,
  actions,
  className,
}: {
  title?: React.ReactNode;
  description?: React.ReactNode;
  children: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("mb-8", className)}>
      {(title || actions) && (
        <div className="mb-3 flex items-center justify-between">
          <div>
            {title && (
              <h2 className="font-display text-2xl text-white">{title}</h2>
            )}
            {description && (
              <p className="text-sm text-white/60">{description}</p>
            )}
          </div>
          {actions && <div className="flex gap-2">{actions}</div>}
        </div>
      )}
      {children}
    </section>
  );
}
