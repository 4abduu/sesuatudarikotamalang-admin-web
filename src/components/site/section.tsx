import { cn } from "@/lib/utils";
import { OrnamentDivider } from "./line-art";

export function SectionTitle({
  eyebrow,
  title,
  align = "center",
  className,
}: {
  eyebrow?: string;
  title: string;
  align?: "center" | "left";
  className?: string;
}) {
  return (
    <div className={cn(align === "center" ? "text-center" : "text-left", className)}>
      {eyebrow && (
        <p className="font-display text-sm font-semibold uppercase tracking-wider text-primary">
          {eyebrow}
        </p>
      )}
      <h2 className="mt-1 font-display text-2xl font-extrabold text-foreground md:text-3xl">
        {title}
      </h2>
    </div>
  );
}

export function PageHeader({
  eyebrow,
  title,
  subtitle,
  children,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="border-b border-border/60 bg-secondary/30">
      <div className="mx-auto max-w-6xl px-4 py-8 md:py-12">
        {eyebrow && (
          <p className="font-display text-sm font-semibold uppercase tracking-wider text-primary">
            {eyebrow}
          </p>
        )}
        <h1 className="mt-1 font-display text-3xl font-extrabold text-foreground md:text-4xl">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground md:text-base">
            {subtitle}
          </p>
        )}
        {children}
      </div>
      <div className="mx-auto max-w-6xl px-4 pb-6">
        <OrnamentDivider />
      </div>
    </div>
  );
}

export function PageContainer({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("mx-auto max-w-6xl px-4 py-8 md:py-12", className)}>
      {children}
    </div>
  );
}
