"use client";

import { useCallback, useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { ApiError, apiFetch } from "@/lib/api";
import { RemoveAvatarDialog } from "./RemoveAvatarDialog";
import { PaginationBar } from "@/components/shared/PaginationBar";

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: "buyer" | "creator" | "admin";
  avatarUrl: string | null;
  createdAt: string;
}

interface UsersResponse {
  users: AdminUser[];
  pagination?: { page: number; limit: number; total: number; totalPages: number };
}

const ROLE_LABEL: Record<AdminUser["role"], string> = {
  buyer: "Pembeli",
  creator: "Kreator",
  admin: "Admin",
};
const LIMIT = 20;

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return (parts.slice(0, 2).map((p) => p[0]).join("") || "?").toUpperCase();
}

function formatDate(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "-";
  return d.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
}

/** Daftar pengguna dengan pencarian dan tombol hapus foto profil (moderasi). */
export function UserListContent() {
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [role, setRole] = useState<string>("all");
  const [onlyWithPhoto, setOnlyWithPhoto] = useState(true);
  const [page, setPage] = useState(1);

  const [users, setUsers] = useState<AdminUser[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [preview, setPreview] = useState<AdminUser | null>(null);
  const [removing, setRemoving] = useState<AdminUser | null>(null);

  // Tunggu 400 ms setelah berhenti mengetik sebelum mencari.
  useEffect(() => {
    const t = setTimeout(() => {
      setSearch(searchInput.trim().slice(0, 100));
      setPage(1);
    }, 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ page: String(page), limit: String(LIMIT) });
      if (search) params.set("search", search);
      if (role !== "all") params.set("role", role);
      if (onlyWithPhoto) params.set("hasAvatar", "true");
      const res = await apiFetch<UsersResponse>(`/api/admin/users?${params.toString()}`);
      setUsers(res.users ?? []);
      setTotalPages(res.pagination?.totalPages ?? 1);
      setTotal(res.pagination?.total ?? res.users?.length ?? 0);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Gagal memuat pengguna.");
    } finally {
      setLoading(false);
    }
  }, [page, search, role, onlyWithPhoto]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Input
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Cari nama atau email"
          maxLength={100}
          className="sm:max-w-xs"
          aria-label="Cari pengguna"
        />
        <Select
          value={role}
          onValueChange={(v) => {
            setRole(v);
            setPage(1);
          }}
        >
          <SelectTrigger className="sm:w-40" aria-label="Filter peran">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua peran</SelectItem>
            <SelectItem value="buyer">Pembeli</SelectItem>
            <SelectItem value="creator">Kreator</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
          </SelectContent>
        </Select>
        <label className="flex items-center gap-2 text-sm">
          <Switch
            checked={onlyWithPhoto}
            onCheckedChange={(v) => {
              setOnlyWithPhoto(v);
              setPage(1);
            }}
          />
          Hanya yang punya foto
        </label>
      </div>

      {error ? (
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm">
          <p className="text-destructive">{error}</p>
          <Button type="button" variant="outline" size="sm" className="mt-3" onClick={load}>
            Coba lagi
          </Button>
        </div>
      ) : loading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full rounded-xl" />
          ))}
        </div>
      ) : users.length === 0 ? (
        <p className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">
          Tidak ada pengguna yang cocok.
        </p>
      ) : (
        <ul className="divide-y rounded-xl border">
          {users.map((u) => (
            <li key={u.id} className="flex items-center gap-3 p-3">
              <button
                type="button"
                aria-label={`Lihat foto ${u.name}`}
                disabled={!u.avatarUrl}
                onClick={() => setPreview(u)}
                className="rounded-full disabled:cursor-default"
              >
                <Avatar className="size-12">
                  {u.avatarUrl && <AvatarImage src={u.avatarUrl} alt={u.name} />}
                  <AvatarFallback>{initials(u.name)}</AvatarFallback>
                </Avatar>
              </button>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="truncate font-medium">{u.name}</p>
                  <Badge variant="secondary">{ROLE_LABEL[u.role]}</Badge>
                </div>
                <p className="truncate text-sm text-muted-foreground">{u.email}</p>
                <p className="text-xs text-muted-foreground">Bergabung {formatDate(u.createdAt)}</p>
              </div>
              {u.avatarUrl && u.role !== "admin" && (
                <Button type="button" variant="outline" size="sm" onClick={() => setRemoving(u)}>
                  Hapus foto
                </Button>
              )}
            </li>
          ))}
        </ul>
      )}

      {!loading && !error && total > 0 && (
        <PaginationBar
          page={page}
          totalPages={totalPages}
          total={total}
          pageSize={LIMIT}
          onPageChange={setPage}
        />
      )}

      <Dialog open={!!preview} onOpenChange={(o) => !o && setPreview(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{preview?.name}</DialogTitle>
            <DialogDescription>{preview?.email}</DialogDescription>
          </DialogHeader>
          {preview?.avatarUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={preview.avatarUrl}
              alt={`Foto profil ${preview.name}`}
              className="max-h-[60vh] w-full rounded-lg object-contain"
            />
          )}
        </DialogContent>
      </Dialog>

      {removing && (
        <RemoveAvatarDialog
          open
          onOpenChange={(o) => !o && setRemoving(null)}
          target="pengguna"
          id={removing.id}
          name={removing.name}
          isCreator={removing.role === "creator"}
          onDone={() => {
            setRemoving(null);
            load();
          }}
        />
      )}
    </div>
  );
}

