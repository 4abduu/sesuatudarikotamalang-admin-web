import { Order, OrderItem } from "./types";

export function variantLabel(item: OrderItem): string {
  return item.variant?.combination?.join(" / ") || "Varian default";
}

export function summarizeOrderItems(order: Order) {
  const items = order.items ?? [];
  const first = items[0];
  const sellers = items.reduce<{ name: string; isOfficial: boolean }[]>((all, item) => {
    const seller = item.product?.artisan;
    if (!seller) return all;
    if (!all.some((entry) => entry.name === seller.brandName)) all.push({ name: seller.brandName, isOfficial: seller.isOfficial === true });
    return all;
  }, []);
  return {
    lineCount: items.length,
    totalQuantity: items.reduce((sum, item) => sum + (item.quantity ?? 1), 0),
    firstName: first?.product?.name || "Produk",
    extraCount: Math.max(0, items.length - 1),
    sellers,
    hasMixedSellers: sellers.length > 1,
  };
}
