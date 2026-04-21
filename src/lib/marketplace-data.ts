import { InMemoryStore } from "@/lib/db";

// --- Marketplace Types ---

export type ProductCategory = "vino" | "frutta" | "cereali" | "olio" | "ortaggi" | "trasformati";
export type OrderStatus = "nuovo" | "confermato" | "in_preparazione" | "spedito" | "consegnato" | "annullato";
export type ProductAvailability = "disponibile" | "prenotabile" | "esaurito" | "stagionale";

export interface MarketplaceProduct {
  id: string;
  name: string;
  description: string;
  category: ProductCategory;
  farmId: string;
  farmName: string;
  priceEur: number;
  unit: string;
  availability: ProductAvailability;
  stockKg: number;
  organic: boolean;
  dop: boolean;
  imageAlt: string;
  harvestDate?: string;
  shelfLifeDays?: number;
}

export interface Order {
  id: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  status: OrderStatus;
  items: OrderItem[];
  totalEur: number;
  createdAt: string;
  deliveryMethod: "ritiro_cascina" | "consegna_locale" | "spedizione";
  notes: string;
}

export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  unit: string;
  priceEur: number;
  subtotalEur: number;
}

export interface SubscriptionBox {
  id: string;
  name: string;
  description: string;
  priceEur: number;
  frequency: "settimanale" | "bisettimanale" | "mensile";
  contents: string[];
  subscribers: number;
  active: boolean;
}

// --- Seed Data ---

export const marketplaceProducts: MarketplaceProduct[] = [
  {
    id: "prod-sangiovese-sfuso",
    name: "Sangiovese di Romagna — Sfuso",
    description: "Vino rosso Sangiovese dal vigneto Collina Sud. Vinificazione tradizionale in cantina cooperativa. Ideale con primi piatti romagnoli e carni grigliate.",
    category: "vino",
    farmId: "azienda-tondini",
    farmName: "Az. Agricola Tondini",
    priceEur: 6.50,
    unit: "litro",
    availability: "disponibile",
    stockKg: 2500,
    organic: true,
    dop: false,
    imageAlt: "Bottiglia di Sangiovese di Romagna",
    harvestDate: "2025-09-15",
  },
  {
    id: "prod-albana-docg",
    name: "Albana di Romagna DOCG",
    description: "Vino bianco DOCG da uve Albana raccolte a mano in Vigna Argine Est. Note di pesca bianca, miele d'acacia e mandorla. Affinamento in acciaio 6 mesi.",
    category: "vino",
    farmId: "azienda-tondini",
    farmName: "Az. Agricola Tondini",
    priceEur: 12.00,
    unit: "bottiglia 0.75L",
    availability: "prenotabile",
    stockKg: 800,
    organic: true,
    dop: true,
    imageAlt: "Bottiglia di Albana di Romagna DOCG",
    harvestDate: "2025-08-28",
  },
  {
    id: "prod-pesche-cassetta",
    name: "Pesche di Romagna — Cassetta 5 kg",
    description: "Pesche a pasta gialla dal Frutteto San Mamante. Calibro 68-73 mm, raccolte al punto ottimale di maturazione. Perfette per consumo fresco e confetture.",
    category: "frutta",
    farmId: "azienda-tondini",
    farmName: "Az. Agricola Tondini",
    priceEur: 15.00,
    unit: "cassetta 5 kg",
    availability: "stagionale",
    stockKg: 1500,
    organic: false,
    dop: false,
    imageAlt: "Cassetta di pesche romagnole",
    harvestDate: "2026-06-18",
    shelfLifeDays: 7,
  },
  {
    id: "prod-farina-grano",
    name: "Farina di grano tenero tipo 2",
    description: "Macinata a pietra da grano tenero romagnolo coltivato senza irrigazione. Ideale per piadina, pasta fresca e pane. Confezione da 1 kg.",
    category: "cereali",
    farmId: "azienda-tondini",
    farmName: "Az. Agricola Tondini",
    priceEur: 3.80,
    unit: "kg",
    availability: "disponibile",
    stockKg: 5000,
    organic: false,
    dop: false,
    imageAlt: "Sacco di farina di grano tenero",
    harvestDate: "2025-07-06",
    shelfLifeDays: 365,
  },
  {
    id: "prod-miele-acacia",
    name: "Miele di Acacia della Romagna",
    description: "Miele millefiori raccolto sulle colline tra Bertinoro e Meldola. Cristallizzazione lenta, dolcezza delicata.",
    category: "trasformati",
    farmId: "podere-san-vittore",
    farmName: "Podere San Vittore",
    priceEur: 9.50,
    unit: "vasetto 500g",
    availability: "disponibile",
    stockKg: 200,
    organic: false,
    dop: false,
    imageAlt: "Vasetto di miele d'acacia",
  },
  {
    id: "prod-susine-cassetta",
    name: "Susine di Romagna — Cassetta 3 kg",
    description: "Susine dalla Tenuta La Fratta. Varietà locale, polpa soda e dolce. Raccolte a mano.",
    category: "frutta",
    farmId: "tenuta-fratta",
    farmName: "Tenuta La Fratta",
    priceEur: 10.00,
    unit: "cassetta 3 kg",
    availability: "stagionale",
    stockKg: 600,
    organic: false,
    dop: false,
    imageAlt: "Cassetta di susine romagnole",
    harvestDate: "2026-07-10",
    shelfLifeDays: 10,
  },
];

export const orders: Order[] = [
  {
    id: "ord-001",
    customerId: "cust-rossi",
    customerName: "Famiglia Rossi",
    customerEmail: "rossi@email.it",
    status: "confermato",
    items: [
      { productId: "prod-pesche-cassetta", productName: "Pesche — Cassetta 5 kg", quantity: 2, unit: "cassetta", priceEur: 15, subtotalEur: 30 },
      { productId: "prod-farina-grano", productName: "Farina grano tenero", quantity: 3, unit: "kg", priceEur: 3.80, subtotalEur: 11.40 },
    ],
    totalEur: 41.40,
    createdAt: "2026-06-15T10:30:00+02:00",
    deliveryMethod: "ritiro_cascina",
    notes: "Ritiro sabato mattina in cascina.",
  },
  {
    id: "ord-002",
    customerId: "cust-bianchi",
    customerName: "Ristorante La Pergola",
    customerEmail: "info@lapergola.it",
    status: "in_preparazione",
    items: [
      { productId: "prod-sangiovese-sfuso", productName: "Sangiovese sfuso", quantity: 50, unit: "litro", priceEur: 6.50, subtotalEur: 325 },
      { productId: "prod-albana-docg", productName: "Albana DOCG", quantity: 12, unit: "bottiglia", priceEur: 12, subtotalEur: 144 },
    ],
    totalEur: 469,
    createdAt: "2026-06-14T14:00:00+02:00",
    deliveryMethod: "consegna_locale",
    notes: "Consegna mercoledì pomeriggio. Fattura intestata a P.IVA.",
  },
  {
    id: "ord-003",
    customerId: "cust-verdi",
    customerName: "Marco Verdi",
    customerEmail: "marco.verdi@email.it",
    status: "nuovo",
    items: [
      { productId: "prod-miele-acacia", productName: "Miele di Acacia", quantity: 2, unit: "vasetto", priceEur: 9.50, subtotalEur: 19 },
    ],
    totalEur: 19,
    createdAt: "2026-06-16T08:15:00+02:00",
    deliveryMethod: "spedizione",
    notes: "Spedizione a Cesena.",
  },
];

export const subscriptionBoxes: SubscriptionBox[] = [
  {
    id: "box-stagionale",
    name: "Cassetta Stagionale Romagna",
    description: "Selezione mensile di prodotti freschi dalla cooperativa. Frutta, verdura e un prodotto trasformato a sorpresa.",
    priceEur: 35,
    frequency: "mensile",
    contents: ["Frutta di stagione (3 kg)", "Verdura di stagione (2 kg)", "Prodotto trasformato"],
    subscribers: 28,
    active: true,
  },
  {
    id: "box-vino",
    name: "Cantina Romagnola",
    description: "2 bottiglie di vino della cooperativa ogni mese: un rosso e un bianco dalle vigne di Bertinoro.",
    priceEur: 22,
    frequency: "mensile",
    contents: ["1 bottiglia Sangiovese", "1 bottiglia Albana/Trebbiano"],
    subscribers: 15,
    active: true,
  },
];

// Marketplace summary
export function getMarketplaceSummary() {
  const totalGMV = orders.reduce((sum, o) => sum + o.totalEur, 0);
  return {
    totalProducts: marketplaceProducts.length,
    availableProducts: marketplaceProducts.filter((p) => p.availability === "disponibile").length,
    totalOrders: orders.length,
    pendingOrders: orders.filter((o) => o.status === "nuovo" || o.status === "confermato").length,
    gmvEur: totalGMV,
    totalSubscribers: subscriptionBoxes.reduce((sum, b) => sum + b.subscribers, 0),
  };
}

export const productsStore = new InMemoryStore<MarketplaceProduct>();
productsStore.seed(marketplaceProducts.map((p) => ({ ...p })));

export const ordersStore = new InMemoryStore<Order>();
ordersStore.seed(orders.map((o) => ({ ...o })));
