import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { orderMap } from "@/data/admin/orders";
import { OrderDetail } from "./order-detail";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const order = orderMap[id];
  return {
    title: order ? `Pesanan ${order.orderNumber}` : "Pesanan tidak ditemukan",
  };
}

export default async function PesananDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = orderMap[id];
  if (!order) notFound();
  return <OrderDetail order={order} />;
}
