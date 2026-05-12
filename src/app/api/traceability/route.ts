import { authorizeRoute, createSuccessResponse } from "@/lib/api-response";
import { createProblemResponse, withErrorHandling } from "@/lib/api-errors";
import { traceabilityIntegrityOverview } from "@/lib/operations-insights";
import {
  buildDPP,
  productLots,
  lotsStore,
  traceabilityEvents,
  generateQRSVG,
} from "@/lib/traceability-data";

/**
 * GET /api/traceability — Returns lots, DPP, and integrity overview.
 * POST /api/traceability — Create lots, add events, export DPP.
 */
export const GET = withErrorHandling(async (request: Request) => {
  const { denied } = await authorizeRoute(request, "traceability:read");
  if (denied) return denied;

  const url = new URL(request.url);
  const lotId = url.searchParams.get("lotId");
  const format = url.searchParams.get("format");

  if (lotId) {
    const passport = buildDPP(lotId);
    if (!passport) {
      return createProblemResponse(404, "Lotto non trovato", "Il lotto richiesto non è presente.", undefined, url.pathname);
    }

    // Export DPP as JSON-LD (EU Digital Product Passport schema)
    if (format === "dpp-jsonld") {
      const jsonld = {
        "@context": "https://schema.org/",
        "@type": "Product",
        name: passport.product,
        description: `${passport.variety} — ${passport.farm.name}, ${passport.farm.location}`,
        productID: passport.lotCode,
        manufacturer: {
          "@type": "Organization",
          name: passport.farm.name,
          address: passport.farm.location,
        },
        additionalProperty: [
          { "@type": "PropertyValue", name: "harvestDate", value: passport.harvestDate },
          { "@type": "PropertyValue", name: "organic", value: passport.farm.organic },
          { "@type": "PropertyValue", name: "carbonFootprint", value: passport.carbonFootprint },
          ...passport.certifications.map((cert) => ({
            "@type": "PropertyValue",
            name: "certification",
            value: cert,
          })),
        ],
        subjectOf: passport.events.map((e) => ({
          "@type": "Action",
          name: e.title,
          description: e.description,
          startTime: e.timestamp,
          location: e.location,
          agent: { "@type": "Person", name: e.operator },
        })),
      };

      return new Response(JSON.stringify(jsonld, null, 2), {
        headers: {
          "Content-Type": "application/ld+json; charset=utf-8",
          "Content-Disposition": `attachment; filename="dpp-${passport.lotCode}.jsonld"`,
        },
      });
    }

    // Export QR SVG
    if (format === "qr-svg") {
      const svg = generateQRSVG(passport.qrUrl);
      return new Response(svg, {
        headers: {
          "Content-Type": "image/svg+xml",
          "Content-Disposition": `attachment; filename="qr-${passport.lotCode}.svg"`,
        },
      });
    }

    const overview = traceabilityIntegrityOverview.find((item) => item.lotId === lotId) ?? null;
    return createSuccessResponse({ passport, overview }, { meta: { domain: "traceability" } });
  }

  return createSuccessResponse(
    {
      lots: productLots,
      overview: traceabilityIntegrityOverview,
      stats: {
        totalLots: productLots.length,
        totalEvents: traceabilityEvents.length,
        organicLots: productLots.filter((l) => l.organic).length,
        dopLots: productLots.filter((l) => l.dop).length,
        verifiedEvents: traceabilityEvents.filter((e) => e.verified).length,
      },
      exportFormats: [
        { format: "dpp-jsonld", label: "EU Digital Product Passport (JSON-LD)" },
        { format: "qr-svg", label: "Codice QR (SVG)" },
      ],
    },
    { meta: { domain: "traceability" } }
  );
});

export const POST = withErrorHandling(async (request: Request) => {
  const { denied } = await authorizeRoute(request, "traceability:write");
  if (denied) return denied;

  const body = (await request.json()) as {
    action: "create-lot" | "add-event" | "add-quality";
    lot?: Record<string, unknown>;
    event?: Record<string, unknown>;
    quality?: Record<string, unknown>;
  };

  if (body.action === "create-lot" && body.lot) {
    const lot = {
      id: `lot-${Date.now()}`,
      lotCode: body.lot.lotCode as string,
      product: body.lot.product as string,
      variety: body.lot.variety as string,
      fieldId: body.lot.fieldId as string,
      fieldName: body.lot.fieldName as string,
      farmName: body.lot.farmName as string,
      municipality: body.lot.municipality as string,
      harvestDate: body.lot.harvestDate as string,
      volumeKg: body.lot.volumeKg as number,
      organic: (body.lot.organic as boolean) ?? false,
      dop: (body.lot.dop as boolean) ?? false,
    };
    await lotsStore.create(lot);

    return createSuccessResponse(
      {
        lot,
        qrUrl: `/traceability/${lot.id}`,
        qrSvg: generateQRSVG(`/traceability/${lot.id}`),
      },
      { status: 201, meta: { domain: "traceability" } }
    );
  }

  return createProblemResponse(400, "Azione non valida", "Usa: create-lot, add-event, add-quality.");
});
