"use client";

import { useEffect, useState, useCallback } from "react";
import { Users, UserPlus, AlertTriangle, Loader2, RefreshCw } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { apiFetch, ApiError } from "@/lib/api";
import { Artisan, ArtisanApplication } from "@/lib/types";

import { CreatorListTab } from "./CreatorListTab";
import { ApplicationListTab } from "./ApplicationListTab";

export function CreatorContent() {
  const [artisans, setArtisans] = useState<Artisan[]>([]);
  const [applications, setApplications] = useState<ArtisanApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [artRes, appRes] = await Promise.all([
        apiFetch<{ artisans: Artisan[] }>("/api/admin/artisans"),
        apiFetch<{ applications: ArtisanApplication[] }>("/api/admin/applications"),
      ]);
      setArtisans(artRes.artisans || []);
      setApplications(appRes.applications || []);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Gagal memuat data kreator dari server");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleStatusUpdated = (updatedId: number | string, newStatus: "aktif" | "nonaktif") => {
    setArtisans((prev) =>
      prev.map((a) => (a.id === updatedId ? { ...a, status: newStatus } : a))
    );
  };

  if (loading) {
    return (
      <div className="grid min-h-[350px] place-items-center rounded-xl border border-border bg-card p-12">
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm font-medium">Memuat data kreator…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="grid min-h-[300px] place-items-center rounded-xl border border-destructive/30 bg-destructive/5 p-12 text-center">
        <div className="flex flex-col items-center gap-4 max-w-md">
          <AlertTriangle className="h-10 w-10 text-destructive" />
          <div>
            <h3 className="text-base font-bold text-foreground">Gagal Memuat Kreator</h3>
            <p className="mt-1 text-sm text-muted-foreground">{error}</p>
          </div>
          <Button onClick={fetchData} variant="outline" className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Coba Lagi
          </Button>
        </div>
      </div>
    );
  }

  return (
    <Tabs defaultValue="aktif" className="w-full">
      <TabsList className="h-auto">
        <TabsTrigger value="aktif" className="gap-1.5">
          <Users className="h-4 w-4" />
          Kreator Aktif ({artisans.length})
        </TabsTrigger>
        <TabsTrigger value="pengajuan" className="gap-1.5">
          <UserPlus className="h-4 w-4" />
          Pengajuan Baru ({applications.length})
        </TabsTrigger>
      </TabsList>

      {/* Tab Kreator Terdaftar */}
      <TabsContent value="aktif" className="mt-5">
        <CreatorListTab
          artisans={artisans}
          onStatusUpdated={handleStatusUpdated}
        />
      </TabsContent>

      {/* Tab Pengajuan Konsinyasi */}
      <TabsContent value="pengajuan" className="mt-5">
        <ApplicationListTab applications={applications} />
      </TabsContent>
    </Tabs>
  );
}
