export const tenant = {
  name: "ICEMAX Ar Condicionado",
  label: "Empresa piloto",
  email: "adm.rcsolutions@gmail.com",
};

export const metrics = [
  { label: "OS abertas", value: "18", detail: "5 urgentes", tone: "danger" },
  { label: "Concluidas hoje", value: "11", detail: "Tempo medio 1h42", tone: "success" },
  { label: "Contratos ativos", value: "24", detail: "6 visitas proximas", tone: "info" },
  { label: "Pecas em alerta", value: "9", detail: "Reposicao sugerida", tone: "warning" },
];

export const orders = [
  {
    id: "#1048",
    customer: "ClimaSul Hotel",
    equipment: "Carrier Piso Teto 60.000 BTUs",
    issue: "Sem refrigeracao",
    priority: "Emergencia",
    technician: "Rafael Martins",
    status: "Em atendimento",
    eta: "No local",
  },
  {
    id: "#1049",
    customer: "Mercado Avante",
    equipment: "Split Hi Wall 24.000 BTUs",
    issue: "Dreno vazando",
    priority: "Alta",
    technician: "Joao Pereira",
    status: "Agendada",
    eta: "14:00",
  },
  {
    id: "#1050",
    customer: "Clinica Vida",
    equipment: "Cassete 36.000 BTUs",
    issue: "Preventiva trimestral",
    priority: "Normal",
    technician: "Equipe Norte",
    status: "Em rota",
    eta: "08:43",
  },
];

export const technicians = [
  { name: "Rafael Martins", kind: "Interno", status: "Em atendimento", location: "Ultima posicao ha 2 min" },
  { name: "Joao Pereira", kind: "Interno", status: "Em rota", location: "Chegada prevista 08:43" },
  { name: "Equipe Norte", kind: "Terceirizado", status: "OS atribuida", location: "Acesso limitado" },
];

export const stockAlerts = [
  { item: "Capacitor 45uF", location: "Almoxarifado", balance: "4 un", status: "Minimo" },
  { item: "Bomba de dreno", location: "Veiculo Rafael", balance: "2 un", status: "OK" },
  { item: "Fluido R410A", location: "Almoxarifado", balance: "1 cilindro", status: "Critico" },
];

export const serviceFlow = [
  "Aberta",
  "Agendada",
  "Em rota",
  "Em atendimento",
  "Assinatura",
  "PDF e e-mail",
];

export const contracts = [
  {
    customer: "Clinica Vida",
    plan: "Preventiva + higienizacao",
    recurrence: "A cada 3 meses",
    nextVisit: "12/05/2026",
    status: "Proxima visita",
  },
  {
    customer: "ClimaSul Hotel",
    plan: "Preventiva completa",
    recurrence: "A cada 4 meses",
    nextVisit: "20/05/2026",
    status: "Gerar OS",
  },
  {
    customer: "Mercado Avante",
    plan: "Higienizacao programada",
    recurrence: "A cada 6 meses",
    nextVisit: "02/06/2026",
    status: "Agendada",
  },
];

export const floorPlan = {
  customer: "ClimaSul Hotel",
  name: "Terreo - area comum",
  equipmentCount: 12,
  points: [
    { label: "Recepcao", code: "ICM-AC-0001", left: "22%", top: "34%" },
    { label: "Restaurante", code: "ICM-AC-0002", left: "58%", top: "48%" },
    { label: "Sala eventos", code: "ICM-AC-0003", left: "76%", top: "25%" },
  ],
};

export const qrLabels = [
  { code: "ICM-AC-0001", customer: "ClimaSul Hotel", location: "Recepcao" },
  { code: "ICM-AC-0002", customer: "Mercado Avante", location: "Caixa 03" },
];

export const quotes = [
  { number: "ORC-2026-001", customer: "ClimaSul Hotel", status: "Enviado", total: "R$ 1.840,00" },
  { number: "ORC-2026-002", customer: "Mercado Avante", status: "Aprovado", total: "R$ 620,00" },
];

export const checklists = [
  { name: "Preventiva split", items: 5, requiredPhotos: true },
  { name: "Higienizacao", items: 4, requiredPhotos: true },
  { name: "Corretiva", items: 6, requiredPhotos: false },
];

export const manuals = [
  { title: "Carrier Piso Teto 60k", detail: "Carrier - Piso Teto" },
  { title: "Midea Cassete 36k", detail: "Midea - Cassete" },
];

export const notifications = [
  { channel: "E-mail", subject: "OS concluida", status: "Pendente" },
  { channel: "E-mail", subject: "Aprovacao de orcamento", status: "Enviado" },
  { channel: "Interno", subject: "Contrato vence em 7 dias", status: "Fila" },
];
