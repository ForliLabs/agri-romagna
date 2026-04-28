import { farm } from "@/lib/data";
import { fieldQueries } from "@/lib/data-layer";

export async function GET() {
  const fields = await fieldQueries.findAll();
  return Response.json({ farm, fields });
}

export async function POST(request: Request) {
  const payload = await request.json();

  if (
    !payload.name ||
    !payload.crop ||
    typeof payload.areaHa !== "number" ||
    !payload.status ||
    !payload.plantingDate
  ) {
    return Response.json(
      { error: "Campi richiesti: name, crop, areaHa, status, plantingDate." },
      { status: 400 }
    );
  }

  const field = await fieldQueries.create({
    id: payload.id ?? `field-${crypto.randomUUID()}`,
    name: payload.name,
    crop: payload.crop,
    areaHa: payload.areaHa,
    status: payload.status,
    plantingDate: payload.plantingDate,
    municipality: payload.municipality ?? farm.location,
    expectedHarvest: payload.expectedHarvest ?? new Date().toISOString().slice(0, 10),
    expectedVolume: payload.expectedVolume ?? 0,
    health: payload.health ?? "Monitoraggio iniziale impostato",
    irrigation: payload.irrigation ?? "Da configurare",
    notes: payload.notes ?? "Nuovo appezzamento registrato via API.",
    farmId: payload.farmId ?? "azienda-tondini",
  });

  return Response.json({ field }, { status: 201 });
}
