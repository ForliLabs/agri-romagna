import { executeOnboarding, generateSampleData, type OnboardingData } from "@/lib/onboarding-service";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const action = body.action ?? "onboard";

    if (action === "generate-sample-data") {
      if (!body.cooperativeId) {
        return Response.json(
          { error: "cooperativeId è obbligatorio." },
          { status: 400 }
        );
      }
      const result = await generateSampleData(body.cooperativeId);
      return Response.json(result);
    }

    // Validate onboarding data
    const data = body as OnboardingData;
    if (!data.cooperative?.name || !data.admin?.email || !data.admin?.password || !data.admin?.name) {
      return Response.json(
        { error: "Dati cooperativa e amministratore obbligatori." },
        { status: 400 }
      );
    }

    if (!data.cooperative.region || !data.cooperative.province) {
      return Response.json(
        { error: "Regione e provincia della cooperativa sono obbligatori." },
        { status: 400 }
      );
    }

    const result = await executeOnboarding(data);
    return Response.json(
      {
        success: true,
        message: "Cooperativa creata con successo!",
        ...result,
      },
      { status: 201 }
    );
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Errore durante l'onboarding." },
      { status: 500 }
    );
  }
}
