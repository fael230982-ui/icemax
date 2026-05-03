export const tenant = {
  id: "tenant-icemax",
  name: "ICEMAX Ar Condicionado",
  supportEmail: "adm.rcsolutions@gmail.com",
  primaryColor: "#0B7CEB",
  secondaryColor: "#28D8FF",
};

export const dashboardMetrics = [
  { key: "open_orders", label: "OS abertas", value: 18, detail: "5 urgentes" },
  { key: "completed_today", label: "Concluidas hoje", value: 11, detail: "Tempo medio 1h42" },
  { key: "active_contracts", label: "Contratos ativos", value: 24, detail: "6 visitas proximas" },
  { key: "stock_alerts", label: "Pecas em alerta", value: 9, detail: "Reposicao sugerida" },
];

export const serviceOrders = [
  {
    id: "1048",
    tenantId: tenant.id,
    customer: "ClimaSul Hotel",
    equipment: "Carrier Piso Teto 60.000 BTUs",
    issue: "Sem refrigeracao",
    priority: "emergency",
    technician: "Rafael Martins",
    status: "in_progress",
    eta: null,
  },
  {
    id: "1049",
    tenantId: tenant.id,
    customer: "Mercado Avante",
    equipment: "Split Hi Wall 24.000 BTUs",
    issue: "Dreno vazando",
    priority: "high",
    technician: "Joao Pereira",
    status: "scheduled",
    eta: "14:00",
  },
  {
    id: "1050",
    tenantId: tenant.id,
    customer: "Clinica Vida",
    equipment: "Cassete 36.000 BTUs",
    issue: "Preventiva trimestral",
    priority: "normal",
    technician: "Equipe Norte",
    status: "en_route",
    eta: "08:43",
  },
];

export const serviceContracts = [
  {
    id: "contract-001",
    tenantId: tenant.id,
    customer: "Clinica Vida",
    plan: "Preventiva + higienizacao",
    recurrenceMonths: 3,
    nextVisit: "2026-05-12",
    status: "upcoming",
    coveredEquipment: 8,
  },
  {
    id: "contract-002",
    tenantId: tenant.id,
    customer: "ClimaSul Hotel",
    plan: "Preventiva completa",
    recurrenceMonths: 4,
    nextVisit: "2026-05-20",
    status: "generate_order",
    coveredEquipment: 18,
  },
  {
    id: "contract-003",
    tenantId: tenant.id,
    customer: "Mercado Avante",
    plan: "Higienizacao programada",
    recurrenceMonths: 6,
    nextVisit: "2026-06-02",
    status: "scheduled",
    coveredEquipment: 5,
  },
];

export const floorPlans = [
  {
    id: "floor-001",
    tenantId: tenant.id,
    customer: "ClimaSul Hotel",
    name: "Terreo - area comum",
    equipmentCount: 12,
    points: [
      { equipmentCode: "ICM-AC-0001", label: "Recepcao", x: 22, y: 34 },
      { equipmentCode: "ICM-AC-0002", label: "Restaurante", x: 58, y: 48 },
      { equipmentCode: "ICM-AC-0003", label: "Sala eventos", x: 76, y: 25 },
    ],
  },
];

export const qrLabels = [
  {
    id: "qr-001",
    tenantId: tenant.id,
    equipmentCode: "ICM-AC-0001",
    equipment: "Carrier Piso Teto 60.000 BTUs",
    customer: "ClimaSul Hotel",
    installLocation: "Recepcao",
    qrPayload: "icemax://equipment/ICM-AC-0001",
  },
  {
    id: "qr-002",
    tenantId: tenant.id,
    equipmentCode: "ICM-AC-0002",
    equipment: "Split Hi Wall 24.000 BTUs",
    customer: "Mercado Avante",
    installLocation: "Caixa 03",
    qrPayload: "icemax://equipment/ICM-AC-0002",
  },
];
