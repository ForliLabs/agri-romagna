import { ordersStore, productsStore } from "@/lib/marketplace-data";

export async function GET() {
  const [products, orders] = await Promise.all([productsStore.findAll(), ordersStore.findAll()]);
  const totalRevenue = orders.reduce((sum, order) => sum + order.totalEur, 0);

  return Response.json({
    products,
    orders,
    summary: {
      totalProducts: products.length,
      availableProducts: products.filter((product) => product.availability !== "esaurito").length,
      totalOrders: orders.length,
      totalRevenue,
    },
  });
}
