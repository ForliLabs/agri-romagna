import { lotsStore, buildDPP } from "@/lib/traceability-data";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const lotId = url.searchParams.get("lotId");

  if (lotId) {
    const dpp = buildDPP(lotId);
    if (!dpp) {
      return Response.json({ error: "Lotto non trovato." }, { status: 404 });
    }
    return Response.json(dpp);
  }

  const lots = await lotsStore.findAll();
  return Response.json({ lots });
}
