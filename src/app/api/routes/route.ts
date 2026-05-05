import {
  declarationsStore,
  vehiclesStore,
  optimizeRoute,
} from "@/lib/route-optimizer";
import { authorizeRoute, createSuccessResponse } from "@/lib/api-response";
import { createProblemResponse, withErrorHandling } from "@/lib/api-errors";

/**
 * GET /api/routes — Returns declarations, vehicles, and optimized routes.
 * POST /api/routes — Submit harvest declarations or dispatch routes.
 */
export const GET = withErrorHandling(async (request: Request) => {
  const { denied } = await authorizeRoute(request, "logistics:read");
  if (denied) return denied;

  const declarations = await declarationsStore.findAll();
  const vehicles = await vehiclesStore.findAll();

  const availableVehicles = vehicles.filter((v) => v.available);
  const routes = availableVehicles.map((vehicle) =>
    optimizeRoute(declarations, vehicle)
  );

  const totalVolume = declarations.reduce((sum, d) => sum + d.volumeTonnes, 0);
  const bestRoute = routes.reduce((best, r) =>
    r.savings.distanceReductionPercent > (best?.savings.distanceReductionPercent ?? 0) ? r : best
  , routes[0]);

  return createSuccessResponse(
    {
      declarations,
      vehicles,
      optimizedRoutes: routes,
      recommendedRoute: bestRoute ?? null,
      summary: {
        totalDeclarations: declarations.length,
        totalVolumeTonnes: totalVolume,
        urgentDeclarations: declarations.filter((d) => d.priority === "urgente").length,
        availableVehicles: availableVehicles.length,
        estimatedSavingsEuros: bestRoute?.savings.fuelSavedEuros ?? 0,
      },
    },
    { meta: { domain: "logistics" } }
  );
});

export const POST = withErrorHandling(async (request: Request) => {
  const { denied } = await authorizeRoute(request, "logistics:write");
  if (denied) return denied;

  const body = (await request.json()) as {
    action: "submit-declaration" | "dispatch-route" | "update-vehicle";
    declaration?: Record<string, unknown>;
    vehicleId?: string;
    routeDate?: string;
    vehicleUpdates?: Record<string, unknown>;
  };

  if (body.action === "submit-declaration" && body.declaration) {
    const decl = {
      id: `decl-${Date.now()}`,
      farmId: body.declaration.farmId as string,
      farmName: body.declaration.farmName as string,
      location: body.declaration.location as string,
      lat: body.declaration.lat as number,
      lng: body.declaration.lng as number,
      crop: body.declaration.crop as string,
      volumeTonnes: body.declaration.volumeTonnes as number,
      readyDate: body.declaration.readyDate as string,
      timeWindowStart: (body.declaration.timeWindowStart as string) ?? "06:00",
      timeWindowEnd: (body.declaration.timeWindowEnd as string) ?? "18:00",
      priority: (body.declaration.priority as "normale" | "urgente" | "flessibile") ?? "normale",
      notes: (body.declaration.notes as string) ?? "",
    };
    await declarationsStore.create(decl);

    // Re-optimize with new declaration
    const allDeclarations = await declarationsStore.findAll();
    const vehicles = await vehiclesStore.findAll();
    const optimized = vehicles
      .filter((v) => v.available)
      .map((v) => optimizeRoute(allDeclarations, v));

    return createSuccessResponse(
      { declaration: decl, optimizedRoutes: optimized },
      { status: 201, meta: { domain: "logistics" } }
    );
  }

  if (body.action === "dispatch-route" && body.vehicleId) {
    const vehicle = await vehiclesStore.findById(body.vehicleId);
    if (!vehicle) {
      return createProblemResponse(404, "Veicolo non trovato", "Il veicolo specificato non esiste.");
    }

    const declarations = await declarationsStore.findAll();
    const route = optimizeRoute(declarations, vehicle);

    // In production, this would send push notifications to the driver
    const dispatchedAt = new Date().toISOString();

    return createSuccessResponse(
      {
        dispatched: true,
        dispatchedAt,
        route,
        driverNotification: {
          vehicleName: vehicle.name,
          plate: vehicle.plate,
          stopsCount: route.stops.length,
          totalKm: route.totalDistanceKm,
          estimatedDuration: `${Math.floor(route.totalTimeMins / 60)}h ${route.totalTimeMins % 60}min`,
        },
      },
      { meta: { domain: "logistics" } }
    );
  }

  if (body.action === "update-vehicle" && body.vehicleId && body.vehicleUpdates) {
    const updated = await vehiclesStore.update(body.vehicleId, body.vehicleUpdates);
    if (!updated) {
      return createProblemResponse(404, "Veicolo non trovato", "Il veicolo specificato non esiste.");
    }
    return createSuccessResponse({ vehicle: updated }, { meta: { domain: "logistics" } });
  }

  return createProblemResponse(400, "Azione non valida", "Usa: submit-declaration, dispatch-route, update-vehicle.");
});
