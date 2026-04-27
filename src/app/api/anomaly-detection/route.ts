import {
  anomalyCorrelationsStore,
  anomalyDigestsStore,
  anomaliesStore,
  anomalyStreamsStore,
  getActiveAnomalies,
  getAnomalyDigest,
  getDetectionModels,
  detectionModelsStore,
} from "@/lib/anomaly-detection-data";

export async function GET() {
  const [streams, anomalies, correlations, models, digests] = await Promise.all([
    anomalyStreamsStore.findAll(),
    anomaliesStore.findAll(),
    anomalyCorrelationsStore.findAll(),
    detectionModelsStore.findAll(),
    anomalyDigestsStore.findAll(),
  ]);

  return Response.json({
    activeAnomalies: getActiveAnomalies(),
    latestDigest: getAnomalyDigest(),
    streams,
    anomalies,
    correlations,
    models: getDetectionModels(),
    detectionModels: models,
    digests,
  });
}
