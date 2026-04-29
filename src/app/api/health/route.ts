import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const checks: Record<string, { status: string; latencyMs?: number; error?: string }> = {};

  // Database check
  const dbStart = Date.now();
  try {
    await prisma.cooperative.count();
    checks.database = { status: "healthy", latencyMs: Date.now() - dbStart };
  } catch (error) {
    checks.database = {
      status: "unhealthy",
      latencyMs: Date.now() - dbStart,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }

  // Memory check
  const memUsage = process.memoryUsage();
  checks.memory = {
    status: memUsage.heapUsed < 512 * 1024 * 1024 ? "healthy" : "warning",
    latencyMs: 0,
  };

  const allHealthy = Object.values(checks).every((c) => c.status === "healthy");

  return Response.json(
    {
      status: allHealthy ? "healthy" : "degraded",
      version: process.env.npm_package_version ?? "0.1.0",
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      checks,
      memory: {
        heapUsedMB: Math.round(memUsage.heapUsed / 1024 / 1024),
        heapTotalMB: Math.round(memUsage.heapTotal / 1024 / 1024),
        rssMB: Math.round(memUsage.rss / 1024 / 1024),
      },
    },
    { status: allHealthy ? 200 : 503 }
  );
}
