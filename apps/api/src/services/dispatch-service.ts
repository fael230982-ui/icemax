import { serviceOrders, serviceOrderStops, technicianLocations } from "../mock-data";
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

const technicianStatusPenalty: Record<string, number> = {
  available: 0,
  en_route: 18,
  in_progress: 35,
  reported: 8,
};

const serviceOrderPriorityScore: Record<string, number> = {
  emergency: 100,
  high: 72,
  normal: 45,
  low: 20,
};

function explainRecommendation(params: {
  priority: string;
  technicianStatus: string;
  distanceKm: number;
  score: number;
}) {
  const reasons = [
    `Prioridade ${params.priority} considerada no score.`,
    `Tecnico com status ${params.technicianStatus}.`,
    `Deslocamento estimado de ${params.distanceKm.toFixed(2)} km.`,
  ];

  if (params.score >= 80) {
    reasons.push("Recomendacao forte para acionamento imediato.");
  } else if (params.score >= 55) {
    reasons.push("Boa opcao para encaixe na agenda.");
  } else {
    reasons.push("Opcao secundaria; avaliar impacto na rota.");
  }

  return reasons;
}

export function recommendMockDispatchAssignments(input?: { serviceOrderIds?: string[] }) {
  const candidateStops = serviceOrderStops.filter((stop) => !input?.serviceOrderIds?.length || input.serviceOrderIds.includes(stop.serviceOrderId));
  const data = candidateStops.map((stop) => {
    const order = serviceOrders.find((item) => item.id === stop.serviceOrderId);
    const candidates = technicianLocations.map((technician) => {
      const distance = distanceKm(technician, stop);
      const priorityScore = serviceOrderPriorityScore[stop.priority] ?? 40;
      const statusPenalty = technicianStatusPenalty[technician.status] ?? 12;
      const distancePenalty = Math.min(45, distance * 6);
      const sameOrderBonus = technician.serviceOrderId === stop.serviceOrderId ? 18 : 0;
      const score = Math.max(0, Math.round(priorityScore - statusPenalty - distancePenalty + sameOrderBonus));

      return {
        technicianUserId: technician.technicianUserId,
        technician: technician.technician,
        technicianStatus: technician.status,
        currentServiceOrderId: technician.serviceOrderId,
        distanceKm: Number(distance.toFixed(2)),
        estimatedTravelMinutes: Math.max(5, Math.round((distance / 28) * 60)),
        score,
        reasons: explainRecommendation({
          priority: stop.priority,
          technicianStatus: technician.status,
          distanceKm: distance,
          score,
        }),
      };
    }).sort((a, b) => b.score - a.score || a.estimatedTravelMinutes - b.estimatedTravelMinutes);

    return {
      serviceOrderId: stop.serviceOrderId,
      customer: stop.customer,
      issue: order?.issue ?? "Atendimento tecnico",
      priority: stop.priority,
      recommendedTechnician: candidates[0],
      alternatives: candidates.slice(1),
    };
  }).sort((a, b) => (serviceOrderPriorityScore[b.priority] ?? 0) - (serviceOrderPriorityScore[a.priority] ?? 0));

  return {
    strategy: "priority_status_distance_score",
    generatedAt: new Date().toISOString(),
    summary: {
      serviceOrders: data.length,
      techniciansEvaluated: technicianLocations.length,
      immediateActions: data.filter((item) => item.recommendedTechnician.score >= 80).length,
    },
    data,
  };
}
