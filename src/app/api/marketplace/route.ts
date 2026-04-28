import { marketplaceProductQueries, orderQueries } from "@/lib/data-layer";

export async function GET() {
  const products = await marketplaceProductQueries.findAll();
  const orders = await orderQueries.findAll();
  const totalRevenue = (orders as any[]).reduce(
    (sum: number, o: any) => sum + (o.totalPrice || 0),
    0
  );

  return Response.json({
    products,
    orders,
    summary: {
      totalProducts: (products as any[]).length,
      availableProducts: (products as any[]).filter((p: any) => p.available).length,
      totalOrders: (orders as any[]).length,
      totalRevenue,
    },
  });
}
