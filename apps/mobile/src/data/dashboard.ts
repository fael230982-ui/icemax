export const orders = [
  { id: "#1048", customer: "ClimaSul Hotel", status: "Em atendimento", detail: "Sem refrigeracao", priority: "Emergencia" },
  { id: "#1050", customer: "Clinica Vida", status: "Em rota", detail: "Preventiva trimestral", priority: "Normal" },
  { id: "#1051", customer: "Mercado Avante", status: "Agendada", detail: "Dreno vazando", priority: "Alta" },
];

export const tools = [
  { title: "Checklist", detail: "Itens obrigatorios por servico" },
  { title: "QR Code", detail: "Abrir ficha do equipamento" },
  { title: "Manuais", detail: "Consulta por marca e modelo" },
  { title: "Pecas", detail: "Baixa e solicitacao em campo" },
  { title: "WhatsApp", detail: "Enviar link ao cliente" },
  { title: "Check-in/out", detail: "Registrar chegada e saida" },
];

export const contracts = [
  { customer: "Clinica Vida", due: "12/05/2026", cycle: "3 meses" },
  { customer: "ClimaSul Hotel", due: "20/05/2026", cycle: "4 meses" },
];

export const quality = [
  { title: "KM", value: "36 km hoje" },
  { title: "Satisfacao", value: "Pesquisa apos OS" },
  { title: "Offline", value: "Sincronizacao pendente: 0" },
  { title: "Fotos", value: "Obrigatorias por checklist" },
];

export const visitPreparation = [
  { title: "Despacho", detail: "OS 1048 exige aprovacao gerencial por emergencia" },
  { title: "Rota", detail: "Tecnico Rafael Martins, 12 min estimados ate o cliente" },
  { title: "Pecas", detail: "R410A e capacitor 45uF devem ser conferidos antes da saida" },
  { title: "Diagnostico", detail: "Possivel baixa vazao, filtro obstruido ou carga de fluido" },
  { title: "Seguranca", detail: "Confirmar acesso e registrar fotos antes de intervir" },
  { title: "Cliente", detail: "Enviar aviso de deslocamento quando pacote for liberado" },
];

export const executionSteps = [
  { title: "Check-in", detail: "Registrar chegada com localizacao" },
  { title: "Checklist", detail: "Responder itens obrigatorios" },
  { title: "Fotos", detail: "Antes, durante e depois" },
  { title: "Pecas", detail: "Informar consumo em campo" },
  { title: "Orcamento", detail: "Gerar aprovacao quando necessario" },
  { title: "Assinatura", detail: "Coletar aceite do cliente" },
];
