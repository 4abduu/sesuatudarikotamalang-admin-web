import type { Metadata } from "next";
import { ProductEditContent } from "./components/product-form";

export const metadata: Metadata = {
  title: "Edit Produk",
};

export default async function ProductEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ProductEditContent productId={id} />;
}
