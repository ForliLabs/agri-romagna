import { healthMonitor } from "@/lib/health-monitor";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

// Register database health check (requires prisma import)
healthMonitor.registerCheck("database", async () => {
  const start = Date.now();
  try {
    await prisma.cooperative.count();
    return {
      name: "database",
      status: "healthy",
      latencyMs: Date.now() - start,
      message: "SQLite connection OK",
    };
  } catch (error) {
    return {
      name: "database",
      status: "unhealthy",
      latencyMs: Date.now() - start,
      message: error instanceof Error ? error.message : "Database unreachable",
    };
  }
});

/**
 * GET /api/health — Full health report with all dependency checks.
 * Supports ?probe=liveness|readiness for Kubernetes-style probes.
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const probe = url.searchParams.get("probe");

  if (probe === "liveness") {
    const result = await healthMonitor.liveness();
    return Response.json(result, { status: result.alive ? 200 : 503 });
  }

  if (probe === "readiness") {
    const result = await healthMonitor.readiness();
    return Response.json(result, { status: result.ready ? 200 : 503 });
  }

  const report = await healthMonitor.check();
  return Response.json(report, {
    status: report.status === "unhealthy" ? 503 : 200,
  });
}
