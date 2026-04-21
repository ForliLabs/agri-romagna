import {
  declarationsStore,
  vehiclesStore,
  optimizeRoute,
} from "@/lib/route-optimizer";

export async function GET() {
  const declarations = await declarationsStore.findAll();
  const vehicles = await vehiclesStore.findAll();

  const availableVehicles = vehicles.filter((v) => v.available);
  const routes = availableVehicles.map((vehicle) =>
    optimizeRoute(declarations, vehicle)
  );

  return Response.json({
    declarations,
    vehicles,
    optimizedRoutes: routes,
  });
}
