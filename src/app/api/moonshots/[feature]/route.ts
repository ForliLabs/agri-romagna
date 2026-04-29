import { getMoonshotFeature, isMoonshotFeatureId } from "@/lib/moonshot-operating-system";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ feature: string }> }
) {
  const { feature } = await params;

  if (!isMoonshotFeatureId(feature)) {
    return Response.json({ error: "Moonshot non trovato." }, { status: 404 });
  }

  return Response.json(getMoonshotFeature(feature));
}
