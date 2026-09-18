import { cn } from "@/lib/utils";

type ArtProps = {
  className?: string;
  stroke?: string;
  strokeWidth?: number;
};

/* Hand-drawn line art ornaments inspired by Kayutangan heritage & craft market */
export function LeafSprig({ className, stroke = "currentColor", strokeWidth = 2 }: ArtProps) {
  return (
    <svg
      viewBox="0 0 120 120"
      fill="none"
      className={className}
      stroke={stroke}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M60 110 C60 80 60 40 60 14" />
      <path d="M60 30 C48 28 38 22 32 12 C44 10 54 16 60 28" />
      <path d="M60 30 C72 28 82 22 88 12 C76 10 66 16 60 28" />
      <path d="M60 52 C46 50 34 44 26 32 C40 30 52 38 60 50" />
      <path d="M60 52 C74 50 86 44 94 32 C80 30 68 38 60 50" />
      <path d="M60 74 C48 72 38 66 30 56 C42 54 52 60 60 72" />
      <path d="M60 74 C72 72 82 66 90 56 C78 54 68 60 60 72" />
    </svg>
  );
}

export function Swirl({ className, stroke = "currentColor", strokeWidth = 2 }: ArtProps) {
  return (
    <svg
      viewBox="0 0 120 120"
      fill="none"
      className={className}
      stroke={stroke}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M60 18 C30 18 18 42 30 66 C40 86 64 84 70 64 C74 50 60 42 50 50 C44 55 46 66 56 66" />
      <path d="M84 40 C96 52 96 74 80 86" />
      <circle cx="60" cy="60" r="3" />
    </svg>
  );
}

export function HandPrint({ className, stroke = "currentColor", strokeWidth = 2 }: ArtProps) {
  return (
    <svg
      viewBox="0 0 120 120"
      fill="none"
      className={className}
      stroke={stroke}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M44 104 C36 100 34 88 36 76 L36 50 C36 45 30 45 30 50 L30 70" />
      <path d="M50 70 L50 36 C50 31 44 31 44 36 L44 66" />
      <path d="M60 66 L60 28 C60 23 54 23 54 28 L54 62" />
      <path d="M70 70 L70 36 C70 31 64 31 64 36 L64 66" />
      <path d="M80 80 C80 70 84 56 80 48 C78 44 74 46 74 50 L76 70" />
      <path d="M40 80 C32 80 28 90 32 98 C36 106 50 108 60 108 C70 108 84 106 88 96 C90 90 86 84 80 82" />
    </svg>
  );
}

export function HeritageWindow({ className, stroke = "currentColor", strokeWidth = 2 }: ArtProps) {
  return (
    <svg
      viewBox="0 0 120 120"
      fill="none"
      className={className}
      stroke={stroke}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M30 100 L30 48 C30 40 38 30 60 28 C82 30 90 40 90 48 L90 100" />
      <path d="M30 100 L90 100" />
      <path d="M60 28 L60 100" />
      <path d="M30 58 L90 58" />
      <path d="M42 70 L54 70 L54 100 L42 100 Z" />
      <path d="M66 70 L78 70 L78 100 L66 100 Z" />
      <path d="M44 44 C50 38 70 38 76 44" />
    </svg>
  );
}

export function SunMotif({ className, stroke = "currentColor", strokeWidth = 2 }: ArtProps) {
  return (
    <svg
      viewBox="0 0 120 120"
      fill="none"
      className={className}
      stroke={stroke}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="60" cy="60" r="20" />
      {Array.from({ length: 12 }).map((_, i) => {
        const a = (i * 30 * Math.PI) / 180;
        const x1 = (60 + Math.cos(a) * 26).toFixed(2);
        const y1 = (60 + Math.sin(a) * 26).toFixed(2);
        const x2 = (60 + Math.cos(a) * 40).toFixed(2);
        const y2 = (60 + Math.sin(a) * 40).toFixed(2);
        return <path key={i} d={`M${x1} ${y1} L${x2} ${y2}`} />;
      })}
    </svg>
  );
}

export function OrnamentDivider({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center justify-center gap-3 text-primary/40", className)}>
      <span className="h-px w-12 bg-primary/30 sm:w-20" />
      <LeafSprig className="h-5 w-5" strokeWidth={2} />
      <span className="h-px w-12 bg-primary/30 sm:w-20" />
    </div>
  );
}

const motifByCategory: Record<string, React.FC<ArtProps>> = {
  postcard: HeritageWindow,
  "pin-enamel": SunMotif,
  apparel: Swirl,
  stiker: LeafSprig,
  "kriya-kayu": LeafSprig,
  "tote-bag": Swirl,
  keramik: SunMotif,
  zine: HeritageWindow,
};

export function CategoryMotif({
  category,
  className,
  stroke,
  strokeWidth,
}: {
  category: string;
  className?: string;
  stroke?: string;
  strokeWidth?: number;
}) {
  const M = motifByCategory[category] ?? LeafSprig;
  return <M className={className} stroke={stroke} strokeWidth={strokeWidth} />;
}
