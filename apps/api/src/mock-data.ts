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

export const customers = [
  {
    id: "customer-001",
    tenantId: tenant.id,
    name: "ClimaSul Hotel",
    email: "cliente@climasul.local",
    phone: "+5500000000000",
  },
  {
    id: "customer-002",
    tenantId: tenant.id,
    name: "Clinica Vida",
    email: "cliente@clinicavida.local",
    phone: "+5500000000001",
  },
];

export const equipment = [
  {
    id: "equipment-001",
    tenantId: tenant.id,
    customerId: "customer-001",
    type: "split_piso_teto",
    brand: "Carrier",
    model: "Piso Teto 60.000",
    serialNumber: "ICM-AC-0001",
    capacityBtu: 60000,
    installationLocation: "Recepcao",
  },
  {
    id: "equipment-002",
    tenantId: tenant.id,
    customerId: "customer-002",
    type: "cassete",
    brand: "Midea",
    model: "Cassete 36.000",
    serialNumber: "ICM-AC-0002",
    capacityBtu: 36000,
    installationLocation: "Sala 03",
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

export const quotes = [
  {
    id: "quote-001",
    number: "ORC-2026-001",
    serviceOrderId: "1048",
    customer: "ClimaSul Hotel",
    status: "sent",
    total: 1840,
    validUntil: "2026-05-10",
    items: [
      { kind: "service", description: "Diagnostico e teste de estanqueidade", quantity: 1, unitPrice: 450 },
      { kind: "part", description: "Reposicao de fluido refrigerante", quantity: 1, unitPrice: 1390 },
    ],
  },
  {
    id: "quote-002",
    number: "ORC-2026-002",
    serviceOrderId: "1049",
    customer: "Mercado Avante",
    status: "approved",
    total: 620,
    validUntil: "2026-05-08",
    items: [
      { kind: "service", description: "Correcao de dreno e higienizacao", quantity: 1, unitPrice: 620 },
    ],
  },
];

export const checklistTemplates = [
  {
    id: "checklist-001",
    name: "Preventiva split",
    serviceType: "preventive",
    items: [
      "Limpeza dos filtros",
      "Verificacao do dreno",
      "Medicao de temperatura",
      "Inspecao eletrica",
      "Fotos antes e depois",
    ],
  },
  {
    id: "checklist-002",
    name: "Higienizacao",
    serviceType: "cleaning",
    items: [
      "Protecao do ambiente",
      "Aplicacao de produto adequado",
      "Limpeza da evaporadora",
      "Teste final de funcionamento",
    ],
  },
];

export const stock = [
  { sku: "CAP-45", name: "Capacitor 45uF", location: "Almoxarifado", quantity: 4, minimum: 6 },
  { sku: "BD-001", name: "Bomba de dreno", location: "Veiculo Rafael", quantity: 2, minimum: 1 },
  { sku: "R410A", name: "Fluido R410A", location: "Almoxarifado", quantity: 1, minimum: 3 },
];

export const manuals = [
  { id: "manual-001", title: "Carrier Piso Teto 60k", brand: "Carrier", model: "Piso Teto 60.000", equipmentType: "split" },
  { id: "manual-002", title: "Midea Cassete 36k", brand: "Midea", model: "Cassete 36.000", equipmentType: "cassete" },
];

export const aiRequests = [
  {
    id: "ai-001",
    type: "text_improvement",
    inputText: "limpei filtro e tava com pouco gas",
    outputText: "Foi realizada a limpeza dos filtros e identificada baixa carga de fluido refrigerante.",
  },
  {
    id: "ai-002",
    type: "issue_cause_suggestion",
    inputText: "foto com serpentina congelada e relato de pouca ventilacao",
    outputText: "Possiveis causas: filtro obstruido, baixa vazao de ar ou baixa carga de fluido.",
  },
];

export const notifications = [
  { id: "notif-001", channel: "email", recipient: "ordens@icemax.com.br", subject: "OS #1048 concluida", status: "pending" },
  { id: "notif-002", channel: "email", recipient: "cliente@climasul.com.br", subject: "Aprovacao de orcamento", status: "sent" },
  { id: "notif-003", channel: "whatsapp", recipient: "+5500000000000", subject: "Link de acompanhamento da OS", status: "queued" },
];

export const integrations = [
  { provider: "openai", label: "OpenAI", status: "not_configured", requiredEnv: "OPENAI_API_KEY" },
  { provider: "google_maps", label: "Google Maps", status: "not_configured", requiredEnv: "MAPS_API_KEY" },
  { provider: "email", label: "E-mail transacional", status: "not_configured", requiredEnv: "EMAIL_API_KEY" },
  { provider: "whatsapp", label: "WhatsApp Business", status: "not_configured", requiredEnv: "WHATSAPP_ACCESS_TOKEN" },
];

export const whatsappTemplates = [
  {
    name: "os_tracking_link",
    title: "Acompanhamento de OS",
    body: "Ola, sua ordem de servico esta em andamento. Acompanhe pelo link: {{tracking_link}}",
  },
  {
    name: "quote_approval",
    title: "Aprovacao de orcamento",
    body: "Seu orcamento esta pronto para aprovacao: {{approval_link}}",
  },
  {
    name: "contract_visit_reminder",
    title: "Lembrete de manutencao",
    body: "Sua manutencao preventiva esta prevista para {{visit_date}}.",
  },
];
