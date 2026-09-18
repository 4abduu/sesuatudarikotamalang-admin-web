import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { productMap } from "@/data/products";
import { ProductForm } from "./product-form";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const product = productMap[id];
  return { title: product ? `Edit: ${product.name}` : "Edit Produk" };
}

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = productMap[id];
  if (!product) notFound();
  return <ProductForm product={product} mode="edit" />;
}
