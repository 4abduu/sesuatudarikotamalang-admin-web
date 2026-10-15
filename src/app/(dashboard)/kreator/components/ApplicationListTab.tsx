import Link from "next/link";
import { Clock, ArrowRight, UserCheck } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AppStatusBadge } from "@/app/(dashboard)/components/admin-ui";
import { ArtisanApplication } from "@/lib/types";

interface ApplicationListTabProps {
  applications: ArtisanApplication[];
}

function formatDateID(iso: string) {
  if (!iso) return "-";
  return new Date(iso).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function ApplicationListTab({ applications }: ApplicationListTabProps) {
  if (applications.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card p-12 text-center text-sm text-muted-foreground">
        Tidak ada pengajuan konsinyasi baru yang menunggu tinjauan.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {applications.map((app) => (
        <Card key={app.id} className="gap-0 py-0">
          <CardContent className="flex flex-col gap-3 p-5">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <h3 className="truncate font-display text-base font-bold text-foreground">
                  {app.applicantName}
                </h3>
                <p className="truncate text-xs text-muted-foreground">
                  {app.brandName}
                </p>
              </div>
              <AppStatusBadge status={app.status} />
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              <Badge variant="secondary" className="bg-primary/10 text-primary">
                {app.category?.name || "Kategori Umum"}
              </Badge>
              <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                {formatDateID(app.submittedAt)}
              </span>
            </div>

            <p className="line-clamp-2 text-sm leading-relaxed text-foreground/80">
              {app.description}
            </p>

            <div className="mt-auto pt-2 border-t border-border">
              <Button asChild variant="outline" size="sm" className="w-full gap-1.5">
                <Link href={`/kreator/pengajuan/${app.id}`}>
                  Lihat Detail & Tinjau
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
