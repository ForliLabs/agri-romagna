import { productsStore, ordersStore, getMarketplaceSummary } from "@/lib/marketplace-data";

export async function GET() {
  const products = await productsStore.findAll();
  const orders = await ordersStore.findAll();
  const summary = getMarketplaceSummary();

  return Response.json({ products, orders, summary });
}
