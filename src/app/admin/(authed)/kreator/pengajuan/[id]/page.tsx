import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { applicationMap } from "@/data/admin/applications";
import { ApplicationDetail } from "./application-detail";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const app = applicationMap[id];
  if (!app) return { title: "Pengajuan tidak ditemukan" };
  return {
    title: `Pengajuan: ${app.applicantName}`,
    description: `Pengajuan konsinyasi dari ${app.brandName}.`,
  };
}

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const app = applicationMap[id];
  if (!app) notFound();

  return <ApplicationDetail application={app} />;
}
