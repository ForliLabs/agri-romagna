import { ordersStore, productsStore, subscriptionBoxes, getMarketplaceSummary } from "@/lib/marketplace-data";
import type { Order, OrderItem, OrderStatus, ProductCategory, ProductAvailability } from "@/lib/marketplace-data";
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

  const [allProducts, allOrders] = await Promise.all([productsStore.findAll(), ordersStore.findAll()]);

  let products = allProducts;
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

  const totalRevenue = allOrders.reduce((sum, order) => sum + order.totalEur, 0);

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
        categories: [...new Set(allProducts.map((p) => p.category))],
        organicCount: allProducts.filter((p) => p.organic).length,
        dopCount: allProducts.filter((p) => p.dop).length,
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
      const product = await productsStore.findById(item.productId);
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

    await ordersStore.create(newOrder);
    return createSuccessResponse(
      { order: newOrder },
      { status: 201, meta: { domain: "marketplace" } }
    );
  }

  if (body.action === "update-order-status" && body.orderId && body.status) {
    const updated = await ordersStore.update(body.orderId, { status: body.status as OrderStatus });
    if (!updated) {
      return createProblemResponse(404, "Ordine non trovato", "L'ordine specificato non esiste.");
    }
    return createSuccessResponse({ order: updated }, { meta: { domain: "marketplace" } });
  }

  if (body.action === "add-product" && body.product) {
    const product = {
      id: `prod-${Date.now()}`,
      name: body.product.name as string,
      description: body.product.description as string,
      category: body.product.category as ProductCategory,
      farmId: body.product.farmId as string,
      farmName: body.product.farmName as string,
      priceEur: body.product.priceEur as number,
      unit: body.product.unit as string,
      availability: (body.product.availability as ProductAvailability) ?? "disponibile",
      stockKg: (body.product.stockKg as number) ?? 0,
      organic: (body.product.organic as boolean) ?? false,
      dop: (body.product.dop as boolean) ?? false,
      imageAlt: (body.product.imageAlt as string) ?? "",
      harvestDate: body.product.harvestDate as string | undefined,
      shelfLifeDays: body.product.shelfLifeDays as number | undefined,
    };
    await productsStore.create(product);
    return createSuccessResponse(
      { product },
      { status: 201, meta: { domain: "marketplace" } }
    );
  }

  if (body.action === "update-stock" && body.productId && body.stockDelta !== undefined) {
    const product = await productsStore.findById(body.productId);
    if (!product) {
      return createProblemResponse(404, "Prodotto non trovato", "Il prodotto specificato non esiste.");
    }
    const newStock = Math.max(0, product.stockKg + body.stockDelta);
    const availability = newStock <= 0 ? "esaurito" : product.availability === "esaurito" ? "disponibile" : product.availability;
    const updated = await productsStore.update(body.productId, {
      stockKg: newStock,
      availability,
    });
    return createSuccessResponse({ product: updated }, { meta: { domain: "marketplace" } });
  }

  return createProblemResponse(
    400,
    "Azione non valida",
    "Usa: create-order, update-order-status, add-product, update-stock."
  );
});
