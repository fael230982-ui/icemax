import { equipment, serviceContracts, serviceOrders, stock } from "../mock-data";
import { previewContractVisits } from "@icemax/shared";
import type {
  CreateInvoiceDraftInput,
  CreateMaintenanceWindowInput,
  CreatePmocPlanInput,
  CreatePurchaseRequestInput,
  CreateWarrantyTermInput,
  OnboardTechnicianInput,
  ReleaseReadinessInput,
  SatisfactionSurveyInput,
} from "../schemas";

export function calculateSlaBoard() {
  const data = serviceOrders.map((order) => {
    const emergency = order.priority === "emergency";
    const targetMinutes = emergency ? 60 : order.priority === "high" ? 180 : 480;
    const elapsedMinutes = order.status === "in_progress" ? 42 : order.status === "en_route" ? 18 : 0;

    return {
      serviceOrderId: order.id,
      customer: order.customer,
      priority: order.priority,
      status: order.status,
      targetMinutes,
      elapsedMinutes,
      remainingMinutes: Math.max(0, targetMinutes - elapsedMinutes),
      risk: elapsedMinutes > targetMinutes * 0.75 ? "high" : emergency ? "attention" : "normal",
    };
  });

  return { data, total: data.length };
}

export function createWarrantyTerm(input: CreateWarrantyTermInput) {
  const issuedAt = new Date();
  const expiresAt = new Date(issuedAt);
  expiresAt.setDate(expiresAt.getDate() + input.coverageDays);

  return {
    id: `warranty-${Date.now()}`,
    status: "issued",
    issuedAt: issuedAt.toISOString(),
    expiresAt: expiresAt.toISOString(),
    ...input,
  };
}

export function createPmocPlan(input: CreatePmocPlanInput) {
  return {
    id: `pmoc-${Date.now()}`,
    status: "active",
    inspectionsPerYear: Math.ceil(12 / input.inspectionFrequencyMonths),
    requiredRecords: ["limpeza", "medicoes", "responsavel tecnico", "nao conformidades", "acoes corretivas"],
    ...input,
  };
}

export function createInvoiceDraft(input: CreateInvoiceDraftInput) {
  const subtotal = input.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  return {
    id: `invoice-${Date.now()}`,
    status: "draft",
    subtotal,
    total: subtotal,
    createdAt: new Date().toISOString(),
    ...input,
  };
}

export function onboardTechnician(input: OnboardTechnicianInput) {
  return {
    id: `tech-${Date.now()}`,
    status: input.documentStatus === "approved" ? "active" : "pending_documents",
    accessProfile: input.kind === "outsourced" ? "limited_field_access" : "field_access",
    ...input,
  };
}

export function createMaintenanceWindow(input: CreateMaintenanceWindowInput) {
  const contract = serviceContracts.find((item) => item.id === input.contractId);
  return {
    id: `window-${Date.now()}`,
    status: "planned",
    customer: contract?.customer ?? input.customerId,
    nextActions: ["confirmar disponibilidade", "agendar tecnico", "gerar OS preventiva"],
    ...input,
  };
}

export function recordSatisfactionSurvey(input: SatisfactionSurveyInput) {
  return {
    id: `survey-${Date.now()}`,
    npsGroup: input.score >= 9 ? "promoter" : input.score >= 7 ? "neutral" : "detractor",
    createdAt: new Date().toISOString(),
    ...input,
  };
}

export function getEquipmentTimeline(equipmentId: string) {
  const item = equipment.find((entry) => entry.id === equipmentId);
  const data = [
    { date: "2026-02-03", type: "install", title: "Cadastro inicial do equipamento" },
    { date: "2026-03-18", type: "preventive", title: "Preventiva e higienizacao" },
    { date: "2026-05-03", type: "service_order", title: "Atendimento corretivo vinculado" },
  ];

  return {
    equipment: item ?? { id: equipmentId },
    data,
    total: data.length,
  };
}

export function suggestPurchaseRequests() {
  const alerts = stock
    .filter((item) => item.quantity < item.minimum)
    .map((item) => ({
      sku: item.sku,
      name: item.name,
      location: item.location,
      currentQuantity: item.quantity,
      minimumStock: item.minimum,
      suggestedQuantity: Math.max(item.minimum * 2 - item.quantity, 1),
      reason: "estoque abaixo do minimo",
    }));

  return { data: alerts, total: alerts.length };
}

export function createPurchaseRequest(input: CreatePurchaseRequestInput) {
  return {
    id: `purchase-${Date.now()}`,
    status: "requested",
    requestedAt: new Date().toISOString(),
    ...input,
  };
}

export function createReleaseReadiness(input: ReleaseReadinessInput) {
  const checks = [
    { key: "typecheck", status: "required" },
    { key: "tests", status: "required" },
    { key: "web_build", status: "required" },
    { key: "docs_pdf", status: "required" },
    { key: "secrets_review", status: input.includeSecurityReview ? "required" : "skipped" },
  ];

  return {
    id: `release-${Date.now()}`,
    status: "pending_validation",
    createdAt: new Date().toISOString(),
    checks,
    ...input,
  };
}

export function createPostServicePlan(serviceOrderId: string) {
  const order = serviceOrders.find((item) => item.id === serviceOrderId);

  if (!order) {
    return null;
  }

  const urgent = order.priority === "emergency" || order.priority === "high";
  const followUpDate = new Date();
  followUpDate.setDate(followUpDate.getDate() + (urgent ? 2 : 7));

  return {
    serviceOrderId,
    customer: order.customer,
    equipment: order.equipment,
    status: "planned",
    communication: {
      emailCopyToCustomer: true,
      channels: ["email", "whatsapp"],
      subject: `Relatorio tecnico da OS ${serviceOrderId}`,
      message: `Ola, segue o resumo do atendimento realizado no equipamento ${order.equipment}.`,
    },
    warranty: {
      suggestedCoverageDays: urgent ? 90 : 60,
      term: "Garantia condicionada ao uso adequado do equipamento e ausencia de intervencao de terceiros.",
    },
    satisfaction: {
      sendAfterHours: 2,
      question: "Como voce avalia o atendimento tecnico recebido?",
    },
    followUp: {
      date: followUpDate.toISOString().slice(0, 10),
      reason: urgent ? "Confirmar estabilidade apos atendimento urgente." : "Confirmar satisfacao e funcionamento.",
    },
    commercialNextActions: [
      "Atualizar historico do equipamento.",
      "Verificar oportunidade de contrato recorrente.",
      "Sugerir preventiva quando houver reincidencia.",
    ],
  };
}

function recurrenceForOrder(order: (typeof serviceOrders)[number]) {
  const issue = order.issue.toLowerCase();

  if (order.priority === "emergency" || issue.includes("sem refrigeracao") || issue.includes("nao gela")) {
    return 3;
  }

  if (issue.includes("vazando") || issue.includes("dreno")) {
    return 4;
  }

  return 6;
}

export function createContractOpportunityFromServiceOrder(serviceOrderId: string) {
  const order = serviceOrders.find((item) => item.id === serviceOrderId);

  if (!order) {
    return null;
  }

  const recurrenceMonths = recurrenceForOrder(order);
  const visitsPerYear = Math.ceil(12 / recurrenceMonths);
  const estimatedMonthlyValue = recurrenceMonths === 3 ? 390 : recurrenceMonths === 4 ? 320 : 240;

  return {
    serviceOrderId,
    customer: order.customer,
    equipment: order.equipment,
    opportunityScore: order.priority === "emergency" ? 92 : order.priority === "high" ? 78 : 64,
    recommendedPlan: {
      name: recurrenceMonths === 3 ? "Contrato Essencial Trimestral" : recurrenceMonths === 4 ? "Contrato Preventivo Quadrimestral" : "Contrato Economico Semestral",
      recurrenceMonths,
      visitsPerYear,
      includesPreventive: true,
      includesCleaning: true,
      estimatedMonthlyValue,
      estimatedAnnualValue: estimatedMonthlyValue * 12,
    },
    reasoning: [
      `OS com prioridade ${order.priority}.`,
      `Problema informado: ${order.issue}.`,
      `Equipamento coberto sugerido: ${order.equipment}.`,
      "Contrato reduz urgencias, melhora previsibilidade de agenda e aumenta recorrencia de receita.",
    ],
    suggestedScope: [
      "Manutencao preventiva programada.",
      "Higienizacao conforme recorrencia contratada.",
      "Historico completo por equipamento.",
      "Prioridade de agenda para chamados corretivos.",
      "Relatorio tecnico por visita.",
    ],
    nextSteps: [
      "Validar quantidade real de equipamentos do cliente.",
      "Confirmar periodicidade desejada: 3, 4 ou 6 meses.",
      "Enviar proposta comercial com SLA e condicoes de garantia.",
      "Converter proposta aprovada em contrato recorrente.",
    ],
  };
}

export function createContractProposalFromServiceOrder(serviceOrderId: string) {
  const opportunity = createContractOpportunityFromServiceOrder(serviceOrderId);

  if (!opportunity) {
    return null;
  }

  const annualValue = opportunity.recommendedPlan.estimatedAnnualValue;
  const monthlyValue = opportunity.recommendedPlan.estimatedMonthlyValue;

  return {
    id: `proposal-${serviceOrderId}`,
    serviceOrderId,
    status: "draft_ready",
    customer: opportunity.customer,
    equipment: opportunity.equipment,
    title: `Proposta de manutencao recorrente - ${opportunity.customer}`,
    executiveSummary: `Com base no atendimento da OS ${serviceOrderId}, recomendamos o plano ${opportunity.recommendedPlan.name} para reduzir chamados emergenciais, manter o equipamento higienizado e aumentar a previsibilidade das visitas tecnicas.`,
    plan: opportunity.recommendedPlan,
    commercialTerms: {
      monthlyValue,
      annualValue,
      billingModel: "mensal recorrente",
      paymentDueDay: 10,
      minimumTermMonths: 12,
      renewal: "renovacao automatica mediante aceite do cliente",
      cancellationNoticeDays: 30,
    },
    includedServices: opportunity.suggestedScope,
    notIncludedServices: [
      "Troca de compressor, placa eletronica, serpentina ou motor.",
      "Pecas, gases refrigerantes e consumiveis fora do escopo preventivo.",
      "Servicos eletricos, civis ou adequacoes estruturais.",
      "Chamados causados por mau uso, oscilacao eletrica ou intervencao de terceiros.",
    ],
    serviceLevel: {
      preventiveScheduling: "agenda programada conforme recorrencia contratada",
      urgentSupport: "prioridade comercial para chamados corretivos",
      reportDelivery: "relatorio tecnico enviado apos cada visita",
      customerSignature: "assinatura digital no encerramento de cada OS",
    },
    customerMessages: {
      emailSubject: `Proposta de contrato de manutencao - OS ${serviceOrderId}`,
      emailBody: `Ola, identificamos uma oportunidade de reduzir paradas e aumentar a vida util do equipamento ${opportunity.equipment}. Segue proposta do plano ${opportunity.recommendedPlan.name}, com ${opportunity.recommendedPlan.visitsPerYear} visitas ao ano e investimento mensal estimado de R$ ${monthlyValue.toFixed(2)}.`,
      whatsappBody: `Ola! Apos a OS ${serviceOrderId}, recomendamos o plano ${opportunity.recommendedPlan.name} para manter o equipamento ${opportunity.equipment} em dia. Valor mensal estimado: R$ ${monthlyValue.toFixed(2)}.`,
    },
    acceptanceFlow: [
      "Enviar proposta para decisor do cliente.",
      "Registrar aceite por assinatura digital ou confirmacao formal.",
      "Criar contrato recorrente no sistema.",
      "Gerar calendario preventivo anual.",
      "Programar primeira visita preventiva.",
    ],
    internalChecklist: [
      "Validar quantidade de equipamentos cobertos.",
      "Confirmar endereco e janelas permitidas de atendimento.",
      "Revisar condicoes de garantia e exclusoes.",
      "Conferir margem antes do envio final.",
    ],
  };
}

export function createContractActivationPlanFromServiceOrder(serviceOrderId: string) {
  const proposal = createContractProposalFromServiceOrder(serviceOrderId);

  if (!proposal) {
    return null;
  }

  const startDate = new Date();
  startDate.setDate(startDate.getDate() + 7);
  const startDateOnly = startDate.toISOString().slice(0, 10);
  const visits = previewContractVisits({
    startDate: startDateOnly,
    recurrenceMonths: proposal.plan.recurrenceMonths as 3 | 4 | 6,
    occurrences: 4,
  });

  return {
    serviceOrderId,
    proposalId: proposal.id,
    status: "ready_for_acceptance",
    contractDraft: {
      name: proposal.plan.name,
      customer: proposal.customer,
      equipment: proposal.equipment,
      recurrenceMonths: proposal.plan.recurrenceMonths,
      startDate: startDateOnly,
      minimumTermMonths: proposal.commercialTerms.minimumTermMonths,
      monthlyValue: proposal.commercialTerms.monthlyValue,
      includedServices: proposal.includedServices,
      notIncludedServices: proposal.notIncludedServices,
    },
    firstYearCalendar: visits.map((visit) => ({
      ...visit,
      title: `Visita preventiva ${visit.sequence} - ${proposal.equipment}`,
      recommendedAction: visit.sequence === 1 ? "Confirmar aceite e agendar primeira preventiva." : "Manter visita no calendario recorrente.",
    })),
    firstServiceOrderDraft: {
      title: `Preventiva contratual - ${proposal.equipment}`,
      description: `Primeira visita do ${proposal.plan.name}. Executar checklist preventivo, higienizacao e registro fotografico.`,
      priority: "normal",
      scheduledDate: visits[0]?.expectedDate,
    },
    activationSteps: [
      "Receber aceite formal da proposta.",
      "Cadastrar contrato recorrente com vigencia minima de 12 meses.",
      "Vincular equipamentos cobertos e endereco de atendimento.",
      "Gerar calendario preventivo do primeiro ano.",
      "Criar primeira OS preventiva.",
      "Enviar confirmacao ao cliente por e-mail e WhatsApp.",
    ],
    governance: [
      "Registrar aceite e condicoes comerciais no historico do cliente.",
      "Auditar criacao do contrato e geracao das visitas.",
      "Bloquear alteracoes de valor sem permissao gerencial.",
      "Revisar renovacao 30 dias antes do vencimento.",
    ],
    communication: {
      customerConfirmation: `Contrato ${proposal.plan.name} pronto para ativacao. A primeira visita preventiva esta sugerida para ${visits[0]?.expectedDate}.`,
      internalNotification: `Criar contrato recorrente para ${proposal.customer}, vinculado a OS ${serviceOrderId}.`,
    },
  };
}

export function createContractAcceptancePackageFromServiceOrder(serviceOrderId: string) {
  const activationPlan = createContractActivationPlanFromServiceOrder(serviceOrderId);

  if (!activationPlan) {
    return null;
  }

  const contract = activationPlan.contractDraft;

  return {
    serviceOrderId,
    proposalId: activationPlan.proposalId,
    status: "acceptance_ready",
    acceptanceDocument: {
      title: `Aceite de contrato recorrente - ${contract.customer}`,
      customer: contract.customer,
      plan: contract.name,
      equipment: contract.equipment,
      startDate: contract.startDate,
      monthlyValue: contract.monthlyValue,
      minimumTermMonths: contract.minimumTermMonths,
      acceptanceText: `Declaro ciencia e aceite das condicoes do plano ${contract.name}, com recorrencia de ${contract.recurrenceMonths} meses, valor mensal de R$ ${contract.monthlyValue.toFixed(2)} e vigencia minima de ${contract.minimumTermMonths} meses.`,
      signatureFields: [
        "nome do responsavel",
        "documento",
        "cargo",
        "data do aceite",
        "assinatura digital",
      ],
    },
    requiredChecks: [
      { key: "customer_decision_maker", label: "Decisor do cliente confirmado", status: "required" },
      { key: "covered_equipment", label: "Equipamentos cobertos revisados", status: "required" },
      { key: "commercial_margin", label: "Margem comercial validada", status: "required" },
      { key: "billing_rule", label: "Regra de faturamento definida", status: "required" },
      { key: "lgpd_consent", label: "Consentimento de comunicacao registrado", status: "required" },
      { key: "first_visit_window", label: "Janela da primeira visita confirmada", status: "required" },
    ],
    operationalHandoff: {
      finance: [
        `Cadastrar cobranca mensal de R$ ${contract.monthlyValue.toFixed(2)}.`,
        "Configurar vencimento no dia combinado com o cliente.",
        "Associar cobranca ao contrato recorrente.",
      ],
      dispatch: [
        `Reservar agenda para ${activationPlan.firstServiceOrderDraft.scheduledDate}.`,
        "Definir tecnico responsavel pela primeira preventiva.",
        "Conferir pecas e materiais antes do deslocamento.",
      ],
      customerSuccess: [
        "Enviar boas-vindas ao contrato.",
        "Confirmar canais preferenciais de atendimento.",
        "Agendar revisao de satisfacao apos primeira preventiva.",
      ],
    },
    customerMessages: {
      emailSubject: `Aceite do contrato ${contract.name}`,
      emailBody: `Ola, segue o aceite do contrato ${contract.name}. Apos sua confirmacao, ativaremos o calendario preventivo e a primeira visita sugerida para ${activationPlan.firstServiceOrderDraft.scheduledDate}.`,
      whatsappBody: `Ola! Seu contrato ${contract.name} esta pronto para aceite. Confirmando, ativaremos a primeira preventiva em ${activationPlan.firstServiceOrderDraft.scheduledDate}.`,
    },
    finalActivation: {
      nextStatus: "active_contract_pending_first_visit",
      createdEntities: [
        "contrato recorrente",
        "calendario preventivo",
        "primeira OS preventiva",
        "rotina de cobranca",
        "registro de aceite",
      ],
      blockers: [
        "sem aceite formal",
        "sem responsavel financeiro confirmado",
        "sem equipamentos revisados",
      ],
    },
  };
}

export function createContractBillingPlan(contractId: string) {
  const contract = serviceContracts.find((item) => item.id === contractId);

  if (!contract) {
    return null;
  }

  const monthlyValue = contract.recurrenceMonths === 3 ? 390 : contract.recurrenceMonths === 4 ? 320 : 240;
  const startDate = new Date(`${contract.nextVisit}T00:00:00.000Z`);
  startDate.setDate(10);

  const installments = Array.from({ length: 12 }, (_, index) => {
    const dueDate = new Date(startDate);
    dueDate.setMonth(dueDate.getMonth() + index);

    return {
      sequence: index + 1,
      dueDate: dueDate.toISOString().slice(0, 10),
      amount: monthlyValue,
      status: index === 0 ? "next_due" : "planned",
      description: `${contract.plan} - mensalidade ${index + 1}/12`,
    };
  });

  return {
    contractId,
    customer: contract.customer,
    plan: contract.plan,
    status: "billing_ready",
    recurrenceMonths: contract.recurrenceMonths,
    coveredEquipment: contract.coveredEquipment,
    monthlyValue,
    annualValue: monthlyValue * 12,
    billingRules: {
      billingModel: "mensal recorrente",
      dueDay: 10,
      minimumTermMonths: 12,
      lateFeePercent: 2,
      monthlyInterestPercent: 1,
      invoiceDeliveryChannels: ["email", "whatsapp"],
    },
    installments,
    handoff: [
      "Conferir dados fiscais do cliente.",
      "Cadastrar forma de pagamento preferencial.",
      "Programar envio mensal de cobranca.",
      "Conciliar pagamento com contrato ativo.",
      "Bloquear renovacao automatica se houver inadimplencia critica.",
    ],
  };
}

export function createServiceOrderCommunicationPackage(serviceOrderId: string) {
  const order = serviceOrders.find((item) => item.id === serviceOrderId);

  if (!order) {
    return null;
  }

  const postServicePlan = createPostServicePlan(serviceOrderId);
  const completionReview = {
    professionalSummary: `Atendimento tecnico concluido para ${order.customer}, equipamento ${order.equipment}. As informacoes foram revisadas para envio ao cliente com linguagem clara e profissional.`,
    customerCopyEnabled: true,
  };

  return {
    serviceOrderId,
    customer: order.customer,
    equipment: order.equipment,
    status: "communication_ready",
    trigger: "service_order_completed",
    recipients: {
      companyEmail: "adm.rcsolutions@gmail.com",
      customerEmailCopy: "cliente@local.dev",
      whatsapp: "+5500000000000",
      internal: "operacao@icemax.local",
    },
    messages: [
      {
        channel: "email",
        template: "os_concluida_relatorio",
        subject: `Relatorio tecnico da OS ${serviceOrderId}`,
        body: `Ola, segue o relatorio tecnico da OS ${serviceOrderId}. ${completionReview.professionalSummary}`,
        copyToCustomer: completionReview.customerCopyEnabled,
      },
      {
        channel: "whatsapp",
        template: "os_concluida_resumo",
        body: `Ola! A OS ${serviceOrderId} foi concluida. O relatorio tecnico do equipamento ${order.equipment} sera enviado por e-mail.`,
        copyToCustomer: true,
      },
      {
        channel: "internal",
        template: "pos_atendimento_operacao",
        subject: `Pos-atendimento OS ${serviceOrderId}`,
        body: postServicePlan?.followUp.reason ?? "Confirmar satisfacao e atualizar historico do cliente.",
        copyToCustomer: false,
      },
    ],
    attachments: [
      { type: "technical_report", required: true, status: "ready_to_generate" },
      { type: "customer_signature", required: true, status: order.status === "completed" ? "expected" : "pending_completion" },
      { type: "photo_evidence", required: false, status: "optional" },
      { type: "warranty_term", required: false, status: "recommended" },
    ],
    governance: {
      lgpdBasis: "execucao de contrato e comunicacao de atendimento solicitado",
      auditEvent: "communication.service_order_package_prepared",
      resendPolicy: "permitir reenvio manual com justificativa operacional",
      blockedReasons: ["cliente sem e-mail e sem WhatsApp", "OS sem assinatura quando assinatura for obrigatoria", "relatorio tecnico ausente"],
    },
    nextActions: [
      "Gerar relatorio tecnico final.",
      "Anexar assinatura do cliente.",
      "Enviar e-mail para a empresa com copia opcional ao cliente.",
      "Enviar resumo por WhatsApp quando houver consentimento.",
      "Registrar envio na auditoria da OS.",
    ],
  };
}

export function createContractCommunicationPackage(contractId: string) {
  const contract = serviceContracts.find((item) => item.id === contractId);

  if (!contract) {
    return null;
  }

  const billingPlan = createContractBillingPlan(contractId);
  const nextInstallment = billingPlan?.installments[0];

  return {
    contractId,
    customer: contract.customer,
    plan: contract.plan,
    status: "communication_ready",
    trigger: "contract_billing_and_visit_reminders",
    recipients: {
      companyEmail: "adm.rcsolutions@gmail.com",
      customerEmailCopy: "cliente@local.dev",
      whatsapp: "+5500000000000",
      internal: "financeiro@icemax.local",
    },
    messages: [
      {
        channel: "email",
        template: "contrato_mensalidade",
        subject: `Mensalidade do contrato ${contract.plan}`,
        body: `Ola, a proxima mensalidade do contrato ${contract.plan} vence em ${nextInstallment?.dueDate} no valor de R$ ${billingPlan?.monthlyValue.toFixed(2)}.`,
        copyToCustomer: true,
      },
      {
        channel: "whatsapp",
        template: "lembrete_visita_contrato",
        body: `Ola! Sua proxima visita preventiva do contrato ${contract.plan} esta prevista para ${contract.nextVisit}.`,
        copyToCustomer: true,
      },
      {
        channel: "internal",
        template: "handoff_financeiro_contrato",
        subject: `Contrato pronto para cobranca - ${contract.customer}`,
        body: "Conferir dados fiscais, forma de pagamento e conciliacao da primeira mensalidade.",
        copyToCustomer: false,
      },
    ],
    automationRules: {
      billingReminderDaysBefore: [7, 2, 0],
      visitReminderDaysBefore: [5, 1],
      channels: ["email", "whatsapp", "internal"],
      pauseWhenDelinquent: true,
      requireConsentForWhatsapp: true,
    },
    governance: {
      lgpdBasis: "execucao de contrato recorrente",
      auditEvent: "communication.contract_package_prepared",
      resendPolicy: "reenvio permitido para cobranca, visita e aditivo contratual",
      blockedReasons: ["contrato inativo", "cliente sem canal valido", "inadimplencia critica sem aprovacao gerencial"],
    },
    nextActions: [
      "Programar lembrete de cobranca mensal.",
      "Programar lembrete de visita preventiva.",
      "Enviar aviso interno ao financeiro.",
      "Registrar consentimento de WhatsApp.",
      "Conciliar envio com calendario do contrato.",
    ],
  };
}
