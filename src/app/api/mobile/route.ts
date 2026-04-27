import {
  getSyncStatus,
  mobileFeatureStore,
  offlineQueueStore,
} from "@/lib/mobile-field-data";

export async function GET() {
  const [features, offlineQueue] = await Promise.all([
    mobileFeatureStore.findAll(),
    offlineQueueStore.findAll(),
  ]);

  return Response.json({
    features,
    offlineQueue,
    syncStatus: getSyncStatus(),
  });
}
