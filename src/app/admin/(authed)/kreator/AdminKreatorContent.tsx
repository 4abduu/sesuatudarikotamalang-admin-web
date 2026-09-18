"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Users,
  UserPlus,
  MapPin,
  Package,
  Power,
  PowerOff,
  ArrowRight,
  Clock,
} from "lucide-react";
import { toast } from "sonner";
import { AdminPageHeader, AppStatusBadge } from "@/components/admin/admin-ui";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { ArtImage } from "@/components/site/art-image";
import { RatingStars } from "@/components/site/rating-stars";
import { creators } from "@/data/creators";
import { productsByCreator } from "@/data/products";
import { pendingApplications } from "@/data/admin/applications";
import { cn } from "@/lib/utils";

/**
 * Kelola Kreator page BODY — admin kreator management with two Tabs:
 * "Kreator Aktif" and "Pengajuan Baru".
 *
 * Extracted from `kreator/page.tsx` so the same body can be rendered inside
 * the export-figma combo page (without AdminShell).
 *
 * `forceMountAll` prop: when true, all `TabsContent` get `forceMount` so
 * both tabs render stacked (used by the export-figma combo page so all
 * content is visible without interaction).
 */
export function AdminKreatorContent({ forceMountAll = false }: { forceMountAll?: boolean }) {
  const [inactiveIds, setInactiveIds] = useState<string[]>([]);

  const toggleInactive = (id: string, currentlyInactive: boolean) => {
    if (currentlyInactive) {
      setInactiveIds((prev) => prev.filter((x) => x !== id));
      toast.success("Kreator diaktifkan kembali (dummy)");
    } else {
      setInactiveIds((prev) => [...prev, id]);
      toast.success("Kreator dinonaktifkan (dummy)");
    }
  };

  return (
    <div>
      <AdminPageHeader
        title="Kelola Kreator"
        description="Kelola kreator aktif dan pengajuan konsinyasi baru."
      />

      <Tabs defaultValue="aktif" className="w-full">
        <TabsList className="h-auto">
          <TabsTrigger value="aktif" className="gap-1.5">
            <Users className="h-4 w-4" />
            Kreator Aktif ({creators.length})
          </TabsTrigger>
          <TabsTrigger value="pengajuan" className="gap-1.5">
            <UserPlus className="h-4 w-4" />
            Pengajuan Baru ({pendingApplications.length})
          </TabsTrigger>
        </TabsList>

        {/* ============================== KREATOR AKTIF ============================== */}
        <TabsContent
          value="aktif"
          className="mt-5"
          {...(forceMountAll ? { forceMount: true as const } : {})}
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {creators.map((c) => {
              const isInactive = inactiveIds.includes(c.id);
              const productCount = productsByCreator(c.id).length || c.productCount;
              return (
                <Card
                  key={c.id}
                  className={cn(
                    "gap-0 overflow-hidden py-0 transition-opacity",
                    isInactive && "opacity-60",
                  )}
                >
                  <CardContent className="p-5">
                    <div className="flex items-start gap-4">
                      <ArtImage
                        variant="creator"
                        seed={c.id}
                        label={c.name}
                        className="h-16 w-16 shrink-0 rounded-full ring-2 ring-border"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <h3 className="truncate font-display text-base font-bold text-foreground">
                              {c.name}
                            </h3>
                            <p className="truncate text-xs text-muted-foreground">
                              @{c.handle}
                            </p>
                          </div>
                          {isInactive && (
                            <Badge
                              variant="secondary"
                              className="shrink-0 bg-muted text-muted-foreground"
                            >
                              Nonaktif
                            </Badge>
                          )}
                        </div>

                        <div className="mt-2 flex flex-wrap items-center gap-1.5">
                          <Badge
                            variant="secondary"
                            className="bg-primary/10 text-primary"
                          >
                            {c.specialty}
                          </Badge>
                          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                            <MapPin className="h-3 w-3" />
                            {c.city}
                          </span>
                        </div>

                        <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
                          <span className="inline-flex items-center gap-1">
                            <Package className="h-3.5 w-3.5" />
                            {productCount} produk
                          </span>
                          <RatingStars value={c.rating} showValue />
                        </div>

                        <div className="mt-3 flex items-center justify-between gap-2">
                          <Link
                            href={`/kreator/${c.id}`}
                            className="text-xs font-semibold text-primary hover:underline"
                          >
                            Lihat profil publik
                          </Link>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className={cn(
                                  "gap-1.5",
                                  isInactive
                                    ? "text-accent hover:bg-accent hover:text-accent-foreground"
                                    : "text-destructive hover:bg-destructive hover:text-white",
                                )}
                              >
                                {isInactive ? (
                                  <>
                                    <Power className="h-3.5 w-3.5" />
                                    Aktifkan Kembali
                                  </>
                                ) : (
                                  <>
                                    <PowerOff className="h-3.5 w-3.5" />
                                    Nonaktifkan
                                  </>
                                )}
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  {isInactive
                                    ? "Aktifkan kreator ini?"
                                    : "Nonaktifkan kreator ini?"}
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  {isInactive
                                    ? `${c.name} akan kembali aktif dan produknya tampil di katalog.`
                                    : `${c.name} akan disembunyikan dari katalog. Produk yang sudah tayang tetap ada, tapi kreator tidak bisa unggah produk baru.`}
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Batal</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() =>
                                    toggleInactive(c.id, isInactive)
                                  }
                                >
                                  {isInactive ? "Ya, aktifkan" : "Ya, nonaktifkan"}
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* ============================== PENGAJUAN BARU ============================== */}
        <TabsContent
          value="pengajuan"
          className="mt-5"
          {...(forceMountAll ? { forceMount: true as const } : {})}
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {pendingApplications.map((app) => (
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
                    <Badge
                      variant="secondary"
                      className="bg-primary/10 text-primary"
                    >
                      {app.category}
                    </Badge>
                    <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {app.submittedAt}
                    </span>
                  </div>

                  <p className="line-clamp-2 text-sm leading-relaxed text-foreground/80">
                    {app.description}
                  </p>

                  <div className="mt-auto pt-1">
                    <Button asChild variant="outline" size="sm" className="w-full gap-1.5">
                      <Link href={`/admin/kreator/pengajuan/${app.id}`}>
                        Lihat Detail
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
