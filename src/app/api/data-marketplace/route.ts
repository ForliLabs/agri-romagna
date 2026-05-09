import {
  apiConsumerStore,
  apiEndpointStore,
  dataProductStore,
  getAPIMetrics,
} from "@/lib/marketplace-api-data";
import { withAuth } from "@/lib/api-response";

export const GET = withAuth("data-marketplace:read", async () => {
  const [endpoints, consumers, dataProducts] = await Promise.all([
    apiEndpointStore.findAll(),
    apiConsumerStore.findAll(),
    dataProductStore.findAll(),
  ]);

  return Response.json({
    metrics: getAPIMetrics(),
    endpoints,
    consumers,
    dataProducts,
  });
});
