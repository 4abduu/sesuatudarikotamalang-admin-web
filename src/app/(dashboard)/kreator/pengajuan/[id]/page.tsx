import { ApplicationDetail } from "./components/application-detail";

export const metadata = {
  title: "Tinjau Pengajuan Kreator",
  description: "Tinjau pengajuan konsinyasi kreator dan tentukan keputusan persetujuan.",
};

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ApplicationDetail applicationId={id} />;
}
