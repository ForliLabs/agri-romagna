import {
  apiConsumerStore,
  apiEndpointStore,
  dataProductStore,
  getAPIMetrics,
} from "@/lib/marketplace-api-data";

export async function GET() {
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
}
