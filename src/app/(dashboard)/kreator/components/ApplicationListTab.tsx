import Link from "next/link";
import { Clock, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AppStatusBadge } from "@/app/(dashboard)/components/admin-ui";
import { ArtisanApplication } from "@/lib/types";
import { useClientPagination } from "@/hooks/useClientPagination";
import { PaginationBar } from "@/components/shared/PaginationBar";

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
  const {
    pageItems,
    page,
    setPage,
    pageSize,
    setPageSize,
    total,
    totalPages,
  } = useClientPagination(applications, {
    pageSize: 10,
  });

  if (applications.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card p-12 text-center text-sm text-muted-foreground">
        Tidak ada pengajuan konsinyasi baru yang menunggu tinjauan.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {pageItems.map((app) => {
        const photos = app.samplePhotos ?? (app.sampleFileUrl ? [app.sampleFileUrl] : []);
        const displayPhotos = photos.slice(0, 5);
        const remaining = photos.length - 5;

        return (
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

              {/* Thumbnail foto sampel */}
              {displayPhotos.length > 0 && (
                <div className="flex items-center gap-1.5 pt-1">
                  {displayPhotos.map((src, i) => (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      key={i}
                      src={src}
                      alt={`Sampel ${i + 1}`}
                      className="h-11 w-11 rounded-md object-cover border border-border"
                    />
                  ))}
                  {remaining > 0 && (
                    <span className="grid h-11 w-11 place-items-center rounded-md border border-border bg-secondary text-xs font-semibold text-muted-foreground">
                      +{remaining}
                    </span>
                  )}
                </div>
              )}

              <div className="mt-auto pt-2 border-t border-border">
                <Button asChild variant="outline" size="sm" className="w-full gap-1.5">
                  <Link href={`/kreator/pengajuan/${app.id}`}>
                    Lihat Detail &amp; Tinjau
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      })}
      </div>

      <PaginationBar
        page={page}
        totalPages={totalPages}
        total={total}
        pageSize={pageSize}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
        pageSizeOptions={[10, 20, 50]}
      />
    </div>
  );
}
