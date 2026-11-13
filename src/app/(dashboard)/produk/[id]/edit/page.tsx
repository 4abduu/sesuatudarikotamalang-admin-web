import type { Metadata } from "next";
import { ProductEditContent } from "./components/product-form";

export const metadata: Metadata = {
  title: "Edit Produk",
};

export default async function ProductEditPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ from?: string }>;
}) {
  const { id } = await params;
  const { from } = await searchParams;
  return <ProductEditContent productId={id} from={from} />;
}
