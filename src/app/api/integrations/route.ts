import {
  federationStore,
  getActiveWebhooks,
  getDataFlowSummary,
  getIntegrationById,
  getIntegrationHealthReport,
  integrationsStore,
  webhooksStore,
} from "@/lib/integration-gateway";
import { authorizeRoute } from "@/lib/api-response";
import { validateBody } from "@/lib/api-errors";
import { z } from "zod";

const integrationActionSchema = z.object({
  action: z.enum(["refresh", "test-connection"]),
  integrationId: z.string().min(1, "integrationId obbligatorio").optional(),
});

export async function GET(request: Request) {
  const { denied } = await authorizeRoute(request, "interoperability:read");
  if (denied) return denied;

  const { searchParams } = new URL(request.url);
  const view = searchParams.get("view");
  const integrationId = searchParams.get("id");

  if (integrationId) {
    const integration = getIntegrationById(integrationId);
    if (!integration) {
      return Response.json({ error: "Integrazione non trovata." }, { status: 404 });
    }
    return Response.json(integration);
  }

  if (view === "health") {
    return Response.json(getIntegrationHealthReport());
  }

  if (view === "webhooks") {
    return Response.json({ webhooks: getActiveWebhooks() });
  }

  if (view === "flow") {
    return Response.json(getDataFlowSummary());
  }

  const integrations = await integrationsStore.findAll();
  const webhooks = await webhooksStore.findAll();
  const federation = await federationStore.findAll();

  return Response.json({
    health: getIntegrationHealthReport(),
    integrations,
    webhooks,
    federationSources: federation,
    dataFlow: getDataFlowSummary(),
  });
}

export async function POST(request: Request) {
  const { denied } = await authorizeRoute(request, "interoperability:read");
  if (denied) return denied;

  const { data: payload, error } = await validateBody(request, integrationActionSchema);
  if (error) return error;

  if (payload.action === "test-connection" && payload.integrationId) {
    const integration = getIntegrationById(payload.integrationId);
    if (!integration) {
      return Response.json({ error: "Integrazione non trovata." }, { status: 404 });
    }
    return Response.json({ success: true, integrationId: payload.integrationId, status: integration.status });
  }

  return Response.json({ refreshed: true, health: getIntegrationHealthReport() });
}
