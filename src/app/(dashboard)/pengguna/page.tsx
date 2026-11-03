import { AdminPageHeader } from "@/app/(dashboard)/components/admin-ui";
import { UserListContent } from "./components/UserListContent";

export default function PenggunaPage() {
  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Pengguna"
        description="Cari pengguna dan hapus foto profil yang tidak pantas."
      />
      <UserListContent />
    </div>
  );
}
