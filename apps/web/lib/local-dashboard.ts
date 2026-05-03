import {
  checklists,
  contracts,
  floorPlan,
  integrations,
  manuals,
  metrics,
  notifications,
  orders,
  qrLabels,
  quality,
  quotes,
  serviceFlow,
  stockAlerts,
  technicians,
  tenant,
} from "../app/data";

export function getLocalDashboardData() {
  return {
    checklists,
    contracts,
    floorPlan,
    integrations,
    manuals,
    metrics,
    notifications,
    orders,
    qrLabels,
    quality,
    quotes,
    serviceFlow,
    stockAlerts,
    technicians,
    tenant,
  };
}
