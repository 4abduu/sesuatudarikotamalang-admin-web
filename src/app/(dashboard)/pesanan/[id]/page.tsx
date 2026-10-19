import type { Metadata } from "next";
import { OrderDetailContent } from "./components/order-detail";

export const metadata: Metadata = {
  title: "Detail Pesanan",
};

export default async function PesananDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <OrderDetailContent orderId={id} />;
}
