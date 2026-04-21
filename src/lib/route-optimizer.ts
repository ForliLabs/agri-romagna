import { InMemoryStore } from "@/lib/db";

// --- Route Optimizer Types ---

export interface HarvestDeclaration {
  id: string;
  farmId: string;
  farmName: string;
  location: string;
  lat: number;
  lng: number;
  crop: string;
  volumeTonnes: number;
  readyDate: string;
  timeWindowStart: string;
  timeWindowEnd: string;
  priority: "normale" | "urgente" | "flessibile";
  notes: string;
}

export interface Vehicle {
  id: string;
  name: string;
  plate: string;
  capacityTonnes: number;
  type: "frigo" | "bilico" | "vasca" | "furgone";
  available: boolean;
  fuelCostPerKm: number;
}

export interface OptimizedStop {
  order: number;
  farmId: string;
  farmName: string;
  arrivalTime: string;
  departureTime: string;
  volumeTonnes: number;
  distanceFromPrevKm: number;
}

export interface OptimizedRoute {
  id: string;
  date: string;
  vehicleId: string;
  vehicleName: string;
  stops: OptimizedStop[];
  totalDistanceKm: number;
  totalTimeMins: number;
  totalVolumeTonnes: number;
  capacityUtilization: number;
  estimatedFuelCost: number;
  savings: {
    distanceReductionPercent: number;
    fuelSavedEuros: number;
    timesSavedMins: number;
  };
}

// --- Seed Data ---

export const harvestDeclarations: HarvestDeclaration[] = [
  {
    id: "decl-tondini-pesche",
    farmId: "azienda-tondini",
    farmName: "Az. Agricola Tondini",
    location: "Bertinoro",
    lat: 44.1490,
    lng: 12.1340,
    crop: "Pesche",
    volumeTonnes: 4.5,
    readyDate: "2026-06-18",
    timeWindowStart: "06:00",
    timeWindowEnd: "12:00",
    priority: "urgente",
    notes: "Raccolta mattiniera per freschezza. Accesso da Via Collinello.",
  },
  {
    id: "decl-sanvittore-uva",
    farmId: "podere-san-vittore",
    farmName: "Podere San Vittore",
    location: "Forlimpopoli",
    lat: 44.1880,
    lng: 12.1280,
    crop: "Sangiovese",
    volumeTonnes: 8,
    readyDate: "2026-09-12",
    timeWindowStart: "05:30",
    timeWindowEnd: "14:00",
    priority: "normale",
    notes: "Cassette da 18 kg. Verificare grado zuccherino prima del ritiro.",
  },
  {
    id: "decl-fratta-frutta",
    farmId: "tenuta-fratta",
    farmName: "Tenuta La Fratta",
    location: "Cesena",
    lat: 44.1396,
    lng: 12.2432,
    crop: "Susine",
    volumeTonnes: 6,
    readyDate: "2026-07-10",
    timeWindowStart: "07:00",
    timeWindowEnd: "16:00",
    priority: "flessibile",
    notes: "Pallet standard. Piazzale di carico ampio.",
  },
  {
    id: "decl-cabianca-grano",
    farmId: "azienda-ca-bianca",
    farmName: "Azienda Cà Bianca",
    location: "Faenza",
    lat: 44.2867,
    lng: 11.8808,
    crop: "Grano tenero",
    volumeTonnes: 18,
    readyDate: "2026-07-06",
    timeWindowStart: "08:00",
    timeWindowEnd: "18:00",
    priority: "flessibile",
    notes: "Carico diretto su bilico. Pesa disponibile in azienda.",
  },
];

export const vehicles: Vehicle[] = [
  {
    id: "vehicle-frigo",
    name: "Autocarro frigo RF-218",
    plate: "FC-218-RF",
    capacityTonnes: 18,
    type: "frigo",
    available: true,
    fuelCostPerKm: 0.85,
  },
  {
    id: "vehicle-bilico",
    name: "Bilico leggero RA-074",
    plate: "RA-074-BL",
    capacityTonnes: 24,
    type: "bilico",
    available: true,
    fuelCostPerKm: 1.10,
  },
  {
    id: "vehicle-vasca",
    name: "Vasca uva FC-331",
    plate: "FC-331-VU",
    capacityTonnes: 20,
    type: "vasca",
    available: true,
    fuelCostPerKm: 0.95,
  },
  {
    id: "vehicle-furgone",
    name: "Furgone consegne FC-112",
    plate: "FC-112-FC",
    capacityTonnes: 3.5,
    type: "furgone",
    available: true,
    fuelCostPerKm: 0.45,
  },
];

// Greedy nearest-neighbor VRP solver
function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// Hub: Forlì cooperative hub
const HUB = { lat: 44.2227, lng: 12.0408, name: "Hub cooperativo Forlì" };

export function optimizeRoute(
  declarations: HarvestDeclaration[],
  vehicle: Vehicle
): OptimizedRoute {
  const remaining = [...declarations].filter((d) => d.volumeTonnes <= vehicle.capacityTonnes);
  const stops: OptimizedStop[] = [];
  let currentLat = HUB.lat;
  let currentLng = HUB.lng;
  let currentLoad = 0;
  let totalDistance = 0;
  let currentTimeMins = 6 * 60; // Start at 06:00

  // Sort by priority first (urgente first), then greedy nearest neighbor
  remaining.sort((a, b) => {
    const priorityOrder = { urgente: 0, normale: 1, flessibile: 2 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });

  const unvisited = [...remaining];

  while (unvisited.length > 0) {
    // Find nearest unvisited that fits in remaining capacity
    let bestIdx = -1;
    let bestDist = Infinity;

    for (let i = 0; i < unvisited.length; i++) {
      if (currentLoad + unvisited[i].volumeTonnes > vehicle.capacityTonnes) continue;
      const dist = haversineKm(currentLat, currentLng, unvisited[i].lat, unvisited[i].lng);
      // Road distance ≈ 1.3× straight line
      if (dist < bestDist) {
        bestDist = dist;
        bestIdx = i;
      }
    }

    if (bestIdx === -1) break;

    const decl = unvisited.splice(bestIdx, 1)[0];
    const roadDist = +(bestDist * 1.3).toFixed(1);
    const travelMins = Math.round(roadDist / 0.7); // ~42 km/h avg rural
    currentTimeMins += travelMins;
    const loadMins = Math.round(decl.volumeTonnes * 8); // ~8 min per tonne

    stops.push({
      order: stops.length + 1,
      farmId: decl.farmId,
      farmName: decl.farmName,
      arrivalTime: `${String(Math.floor(currentTimeMins / 60)).padStart(2, "0")}:${String(currentTimeMins % 60).padStart(2, "0")}`,
      departureTime: `${String(Math.floor((currentTimeMins + loadMins) / 60)).padStart(2, "0")}:${String((currentTimeMins + loadMins) % 60).padStart(2, "0")}`,
      volumeTonnes: decl.volumeTonnes,
      distanceFromPrevKm: roadDist,
    });

    totalDistance += roadDist;
    currentLoad += decl.volumeTonnes;
    currentTimeMins += loadMins;
    currentLat = decl.lat;
    currentLng = decl.lng;
  }

  // Return to hub
  const returnDist = +(haversineKm(currentLat, currentLng, HUB.lat, HUB.lng) * 1.3).toFixed(1);
  totalDistance += returnDist;
  currentTimeMins += Math.round(returnDist / 0.7);

  // Compare with naive sequential distance
  const naiveDistance = declarations.reduce((sum, d) => {
    return sum + haversineKm(HUB.lat, HUB.lng, d.lat, d.lng) * 1.3 * 2;
  }, 0);
  const distReduction = Math.round(((naiveDistance - totalDistance) / naiveDistance) * 100);

  return {
    id: `route-opt-${Date.now()}`,
    date: declarations[0]?.readyDate ?? new Date().toISOString().slice(0, 10),
    vehicleId: vehicle.id,
    vehicleName: vehicle.name,
    stops,
    totalDistanceKm: +totalDistance.toFixed(1),
    totalTimeMins: currentTimeMins - 6 * 60,
    totalVolumeTonnes: currentLoad,
    capacityUtilization: Math.round((currentLoad / vehicle.capacityTonnes) * 100),
    estimatedFuelCost: +(totalDistance * vehicle.fuelCostPerKm).toFixed(2),
    savings: {
      distanceReductionPercent: Math.max(0, distReduction),
      fuelSavedEuros: +((naiveDistance - totalDistance) * vehicle.fuelCostPerKm).toFixed(2),
      timesSavedMins: Math.max(0, Math.round((naiveDistance / 0.7) * 60 - (currentTimeMins - 6 * 60))),
    },
  };
}

export const declarationsStore = new InMemoryStore<HarvestDeclaration>();
declarationsStore.seed(harvestDeclarations.map((d) => ({ ...d })));

export const vehiclesStore = new InMemoryStore<Vehicle>();
vehiclesStore.seed(vehicles.map((v) => ({ ...v })));
