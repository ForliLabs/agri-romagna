import {
  getSyncStatus,
  mobileFeatureStore,
  offlineQueueStore,
} from "@/lib/mobile-field-data";
import { withAuth } from "@/lib/api-response";

export const GET = withAuth("mobile:read", async () => {
  const [features, offlineQueue] = await Promise.all([
    mobileFeatureStore.findAll(),
    offlineQueueStore.findAll(),
  ]);

  return Response.json({
    features,
    offlineQueue,
    syncStatus: getSyncStatus(),
  });
});
