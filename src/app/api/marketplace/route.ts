import { subscriptionBoxes, getMarketplaceSummary, marketplaceProducts, orders } from "@/lib/marketplace-data";
import type { Order, OrderItem } from "@/lib/marketplace-data";
import { marketplaceProductQueries, orderQueries } from "@/lib/data-layer";
import { authorizeRoute, createSuccessResponse } from "@/lib/api-response";
import { createProblemResponse, withErrorHandling } from "@/lib/api-errors";
import {
  marketplaceChannelMix,
  marketplaceFulfillmentQueue,
  marketplaceInventoryAlerts,
} from "@/lib/operations-insights";

/**
 * GET /api/marketplace — Returns products, orders, subscriptions, and analytics.
 * POST /api/marketplace — Create orders, manage products, manage subscriptions.
 */
export const GET = withErrorHandling(async (request: Request) => {
  const { denied } = await authorizeRoute(request, "marketplace:read");
  if (denied) return denied;

  const url = new URL(request.url);
  const category = url.searchParams.get("category");
  const searchQuery = url.searchParams.get("q");
  const organic = url.searchParams.get("organic");
  const availability = url.searchParams.get("availability");

  // Use Prisma data if available, fall back to seed data
  const dbProducts = await marketplaceProductQueries.findAll() as { id: string }[];
  const dbOrders = await orderQueries.findAll() as { id: string }[];
  const allProducts = dbProducts.length > 0 ? dbProducts : marketplaceProducts;
  const allOrders = dbOrders.length > 0 ? dbOrders : orders;

  type ProductRecord = typeof marketplaceProducts[number];
  let products = allProducts as ProductRecord[];
  if (category) {
    products = products.filter((p) => p.category === category);
  }
  if (organic === "true") {
    products = products.filter((p) => p.organic);
  }
  if (availability) {
    products = products.filter((p) => p.availability === availability);
  }
  if (searchQuery) {
    const q = searchQuery.toLowerCase();
    products = products.filter(
      (p) => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q)
    );
  }

  type OrderRecord = typeof orders[number];
  const typedOrders = allOrders as OrderRecord[];
  const totalRevenue = typedOrders.reduce((sum, order) => sum + order.totalEur, 0);

  return createSuccessResponse(
    {
      products,
      orders: allOrders,
      subscriptionBoxes,
      fulfillmentQueue: marketplaceFulfillmentQueue,
      inventoryAlerts: marketplaceInventoryAlerts,
      channelMix: marketplaceChannelMix,
      summary: {
        ...getMarketplaceSummary(),
        totalRevenue,
        categories: [...new Set((allProducts as ProductRecord[]).map((p) => p.category))],
        organicCount: (allProducts as ProductRecord[]).filter((p) => p.organic).length,
        dopCount: (allProducts as ProductRecord[]).filter((p) => p.dop).length,
      },
    },
    { meta: { domain: "marketplace" } }
  );
});

export const POST = withErrorHandling(async (request: Request) => {
  const { denied } = await authorizeRoute(request, "marketplace:write");
  if (denied) return denied;

  const body = (await request.json()) as {
    action: "create-order" | "update-order-status" | "add-product" | "update-stock";
    order?: {
      customerId: string;
      customerName: string;
      customerEmail: string;
      items: { productId: string; quantity: number }[];
      deliveryMethod: string;
      notes?: string;
    };
    orderId?: string;
    status?: string;
    product?: Record<string, unknown>;
    productId?: string;
    stockDelta?: number;
  };

  if (body.action === "create-order" && body.order) {
    const { order: orderInput } = body;

    // Resolve product details and calculate totals
    const items: OrderItem[] = [];
    let totalEur = 0;

    for (const item of orderInput.items) {
      // Look up from seed data (products store is read from Prisma or seed)
      const product = marketplaceProducts.find((p) => p.id === item.productId);
      if (!product) {
        return createProblemResponse(
          400,
          "Prodotto non trovato",
          `Il prodotto ${item.productId} non è disponibile.`
        );
      }
      if (product.availability === "esaurito") {
        return createProblemResponse(
          400,
          "Prodotto esaurito",
          `${product.name} non è attualmente disponibile.`
        );
      }

      const subtotal = +(product.priceEur * item.quantity).toFixed(2);
      items.push({
        productId: product.id,
        productName: product.name,
        quantity: item.quantity,
        unit: product.unit,
        priceEur: product.priceEur,
        subtotalEur: subtotal,
      });
      totalEur += subtotal;
    }

    const newOrder: Order = {
      id: `ord-${Date.now()}`,
      customerId: orderInput.customerId,
      customerName: orderInput.customerName,
      customerEmail: orderInput.customerEmail,
      status: "nuovo",
      items,
      totalEur: +totalEur.toFixed(2),
      createdAt: new Date().toISOString(),
      deliveryMethod: orderInput.deliveryMethod as Order["deliveryMethod"],
      notes: orderInput.notes ?? "",
    };

    return createSuccessResponse(
      { order: newOrder },
      { status: 201, meta: { domain: "marketplace" } }
    );
  }

  if (body.action === "add-product" && body.product) {
    const product = await marketplaceProductQueries.create({
      name: body.product.name as string,
      category: (body.product.category as string) ?? "trasformati",
      price: (body.product.priceEur as number) ?? 0,
      unit: (body.product.unit as string) ?? "kg",
      farmId: (body.product.farmId as string) ?? "azienda-tondini",
      organic: (body.product.organic as boolean) ?? false,
      available: (body.product.availability as string) !== "esaurito",
    });
    return createSuccessResponse(
      { product },
      { status: 201, meta: { domain: "marketplace" } }
    );
  }

  return createProblemResponse(
    400,
    "Azione non valida",
    "Usa: create-order, add-product."
  );
});
