import { serviceOrderStops, technicianLocations } from "../mock-data";
import type { OptimizeRouteInput, TechnicianLocationInput } from "../schemas";

const priorityWeight: Record<string, number> = {
  emergency: 0,
  high: 1,
  normal: 2,
  low: 3,
};

type Coordinate = {
  latitude: number;
  longitude: number;
};

function distanceKm(a: Coordinate, b: Coordinate) {
  const earthRadiusKm = 6371;
  const dLat = ((b.latitude - a.latitude) * Math.PI) / 180;
  const dLon = ((b.longitude - a.longitude) * Math.PI) / 180;
  const lat1 = (a.latitude * Math.PI) / 180;
  const lat2 = (b.latitude * Math.PI) / 180;
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.sin(dLon / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);

  return 2 * earthRadiusKm * Math.asin(Math.sqrt(h));
}

export function listMockTechnicianLocations() {
  return {
    data: technicianLocations,
    total: technicianLocations.length,
  };
}

export function recordMockTechnicianLocation(tenantId: string, technicianUserId: string, input: TechnicianLocationInput) {
  return {
    id: `loc-${Date.now()}`,
    tenantId,
    technicianUserId,
    status: "reported",
    ...input,
    capturedAt: input.capturedAt ?? new Date().toISOString(),
  };
}

export function optimizeMockRoute(input: OptimizeRouteInput) {
  const technician = technicianLocations.find((item) => item.technicianUserId === input.technicianUserId);
  const origin = input.origin ?? technician ?? technicianLocations[0];
  const stops = serviceOrderStops
    .filter((stop) => input.serviceOrderIds.includes(stop.serviceOrderId))
    .map((stop) => ({
      ...stop,
      distanceFromOriginKm: Number(distanceKm(origin, stop).toFixed(2)),
    }))
    .sort((a, b) => {
      const priorityDelta = priorityWeight[a.priority] - priorityWeight[b.priority];
      return priorityDelta || a.distanceFromOriginKm - b.distanceFromOriginKm;
    });

  let cursor = origin;
  let totalDistanceKm = 0;
  const orderedStops = stops.map((stop, index) => {
    const legDistanceKm = distanceKm(cursor, stop);
    totalDistanceKm += legDistanceKm;
    cursor = stop;

    return {
      sequence: index + 1,
      serviceOrderId: stop.serviceOrderId,
      customer: stop.customer,
      priority: stop.priority,
      latitude: stop.latitude,
      longitude: stop.longitude,
      legDistanceKm: Number(legDistanceKm.toFixed(2)),
      estimatedTravelMinutes: Math.max(5, Math.round((legDistanceKm / 28) * 60)),
    };
  });

  return {
    technicianUserId: input.technicianUserId,
    origin,
    stops: orderedStops,
    totalDistanceKm: Number(totalDistanceKm.toFixed(2)),
    totalTravelMinutes: orderedStops.reduce((sum, stop) => sum + stop.estimatedTravelMinutes, 0),
    strategy: "priority_then_distance",
  };
}
