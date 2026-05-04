import { equipment, manuals, serviceContracts, serviceOrders, stock } from "../mock-data";
import { previewContractVisits } from "@icemax/shared";
import { recommendMockDispatchAssignments } from "./dispatch-service";
import type {
  CreateInvoiceDraftInput,
  CreateMaintenanceWindowInput,
  CreatePmocPlanInput,
  CreatePurchaseRequestInput,
  CreateWarrantyTermInput,
  OnboardTechnicianInput,
  ReleaseReadinessInput,
  ReserveServiceOrderPartsInput,
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

export function createServiceOrderWarrantyPackage(serviceOrderId: string) {
  const order = serviceOrders.find((item) => item.id === serviceOrderId);

  if (!order) {
    return null;
  }

  const urgent = order.priority === "emergency" || order.priority === "high";
  const coverageDays = urgent ? 90 : 60;
  const issuedAt = new Date();
  const expiresAt = new Date(issuedAt);
  expiresAt.setDate(expiresAt.getDate() + coverageDays);

  return {
    serviceOrderId,
    customer: order.customer,
    equipment: order.equipment,
    status: "warranty_ready",
    termDraft: {
      title: `Termo de garantia - OS ${serviceOrderId}`,
      coverageDays,
      issuedAt: issuedAt.toISOString(),
      expiresAt: expiresAt.toISOString(),
      coverageText: "Garantia sobre a mao de obra executada e pecas fornecidas pela empresa, limitada ao escopo descrito na ordem de servico.",
      exclusions: [
        "Mau uso, falta de limpeza ou operacao fora das recomendacoes do fabricante.",
        "Intervencao de terceiros sem autorizacao da empresa.",
        "Oscilacao eletrica, infraestrutura inadequada ou problemas civis preexistentes.",
        "Defeitos em componentes nao substituidos ou nao cobertos pela OS.",
      ],
      customerAcknowledgement: "Declaro ter recebido as orientacoes tecnicas, condicoes de garantia e recomendacoes de manutencao preventiva.",
      signatureFields: ["nome do responsavel", "documento", "data", "assinatura digital"],
    },
    operationalChecks: [
      { key: "service_scope", label: "Escopo executado descrito no relatorio", status: "required" },
      { key: "customer_signature", label: "Assinatura do cliente coletada", status: "required" },
      { key: "parts_traceability", label: "Pecas fornecidas rastreadas na OS", status: "recommended" },
      { key: "photo_evidence", label: "Evidencias fotograficas anexadas", status: "recommended" },
      { key: "email_delivery", label: "Envio por e-mail preparado", status: "required" },
    ],
    customerMessages: {
      emailSubject: `Termo de garantia da OS ${serviceOrderId}`,
      emailBody: `Ola, segue o termo de garantia da OS ${serviceOrderId} referente ao equipamento ${order.equipment}. A cobertura e valida por ${coverageDays} dias, conforme condicoes descritas no documento.`,
      whatsappBody: `Ola! O termo de garantia da OS ${serviceOrderId} esta pronto. A cobertura prevista e de ${coverageDays} dias conforme condicoes do atendimento.`,
    },
    audit: {
      event: "warranty.service_order_package_prepared",
      entity: "service_order",
      entityId: serviceOrderId,
    },
    nextActions: [
      "Conferir se o relatorio tecnico final esta completo.",
      "Anexar assinatura digital do cliente.",
      "Emitir termo de garantia vinculado a OS.",
      "Enviar e-mail para a empresa com copia opcional ao cliente.",
      "Registrar aceite e envio na auditoria operacional.",
    ],
  };
}

export function createPostServiceCommandCenter(serviceOrderId: string) {
  const plan = createPostServicePlan(serviceOrderId);
  const warranty = createServiceOrderWarrantyPackage(serviceOrderId);
  const opportunity = createContractOpportunityFromServiceOrder(serviceOrderId);
  const order = serviceOrders.find((item) => item.id === serviceOrderId);

  if (!plan || !warranty || !order) {
    return null;
  }

  const urgent = order.priority === "emergency" || order.priority === "high";
  const commercialScore = opportunity?.opportunityScore ?? (urgent ? 78 : 52);

  return {
    serviceOrderId,
    customer: order.customer,
    equipment: order.equipment,
    status: "post_service_active",
    generatedAt: new Date().toISOString(),
    summary: {
      warrantyDays: warranty.termDraft.coverageDays,
      followUpDate: plan.followUp.date,
      satisfactionAfterHours: plan.satisfaction.sendAfterHours,
      commercialScore,
      priority: order.priority,
    },
    tasks: [
      {
        key: "send_final_report",
        label: "Enviar relatorio final",
        owner: "operacao",
        due: new Date().toISOString().slice(0, 10),
        status: "pending_provider",
      },
      {
        key: "issue_warranty",
        label: "Emitir termo de garantia",
        owner: "qualidade",
        due: new Date().toISOString().slice(0, 10),
        status: "ready",
      },
      {
        key: "satisfaction_survey",
        label: "Enviar pesquisa de satisfacao",
        owner: "sucesso_cliente",
        due: plan.followUp.date,
        status: "scheduled",
      },
      {
        key: "technical_followup",
        label: "Confirmar funcionamento",
        owner: "pos_atendimento",
        due: plan.followUp.date,
        status: urgent ? "priority" : "scheduled",
      },
      {
        key: "contract_offer",
        label: "Avaliar contrato recorrente",
        owner: "comercial",
        due: plan.followUp.date,
        status: commercialScore >= 70 ? "recommended" : "monitor",
      },
    ],
    warranty,
    communication: plan.communication,
    satisfaction: plan.satisfaction,
    commercial: {
      opportunityStatus: commercialScore >= 70 ? "recommended" : "monitor",
      score: commercialScore,
      nextActions: plan.commercialNextActions,
    },
    governance: {
      auditEvent: "post_service.command_center_viewed",
      requiresCloseoutArchive: true,
      requiresCustomerConsentForSurvey: true,
      hidesInternalMargin: true,
    },
  };
}

export function createServiceOrderManualPackage(serviceOrderId: string) {
  const order = serviceOrders.find((item) => item.id === serviceOrderId);

  if (!order) {
    return null;
  }

  const orderEquipment = order.equipment.toLowerCase();
  const matches = manuals.filter((manual) => {
    const brand = manual.brand.toLowerCase();
    const model = manual.model.toLowerCase();
    const type = manual.equipmentType.toLowerCase();

    return orderEquipment.includes(brand) || orderEquipment.includes(model.split(" ")[0]) || orderEquipment.includes(type);
  });
  const selectedManual = matches[0] ?? manuals[0];

  return {
    serviceOrderId,
    customer: order.customer,
    equipment: order.equipment,
    status: selectedManual ? "manual_package_ready" : "manual_missing",
    selectedManual: selectedManual
      ? {
          id: selectedManual.id,
          title: selectedManual.title,
          brand: selectedManual.brand,
          model: selectedManual.model,
          equipmentType: selectedManual.equipmentType,
          source: "mock_catalog",
        }
      : null,
    alternatives: matches.slice(1).map((manual) => ({
      id: manual.id,
      title: manual.title,
      brand: manual.brand,
      model: manual.model,
    })),
    fieldChecklist: [
      "Conferir modelo e capacidade na etiqueta do equipamento.",
      "Validar tensao eletrica e disjuntor antes de intervir.",
      "Consultar codigos de erro informados no display ou controle.",
      "Registrar foto da placa de identificacao quando houver divergencia.",
      "Anotar qualquer diferenca entre manual e equipamento instalado.",
    ],
    safetyNotes: [
      "Desenergizar equipamento antes de acessar componentes internos.",
      "Usar EPI adequado e bloquear religamento acidental.",
      "Nao improvisar componente fora da especificacao do fabricante.",
    ],
    offlinePack: {
      shouldCacheBeforeDispatch: true,
      suggestedFileName: `${selectedManual?.brand ?? "manual"}-${serviceOrderId}.pdf`.toLowerCase().replace(/[^a-z0-9.-]/g, "-"),
      cacheKey: `manual:${serviceOrderId}:${selectedManual?.id ?? "missing"}`,
    },
    nextActions: [
      "Baixar manual no app antes da saida.",
      "Confirmar modelo real por QR Code ou etiqueta.",
      "Abrir checklist tecnico do fabricante durante o atendimento.",
      "Sinalizar ausencia de manual para importacao posterior.",
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

export function createContractOpportunityPipeline() {
  const rows = serviceOrders.map((order) => {
    const opportunity = createContractOpportunityFromServiceOrder(order.id);
    const postService = createPostServiceCommandCenter(order.id);
    const existingContract = serviceContracts.find((contract) => contract.customer === order.customer);

    if (!opportunity) {
      return null;
    }

    const stage = existingContract
      ? "existing_contract"
      : opportunity.opportunityScore >= 85
        ? "proposal_priority"
        : opportunity.opportunityScore >= 70
          ? "proposal_recommended"
          : "nurture";
    const nextContactDate = postService?.summary.followUpDate ?? new Date().toISOString().slice(0, 10);

    return {
      serviceOrderId: order.id,
      customer: order.customer,
      equipment: order.equipment,
      issue: order.issue,
      priority: order.priority,
      stage,
      opportunityScore: opportunity.opportunityScore,
      recommendedPlan: opportunity.recommendedPlan,
      recurringRevenue: {
        monthly: opportunity.recommendedPlan.estimatedMonthlyValue,
        annual: opportunity.recommendedPlan.estimatedAnnualValue,
      },
      nextContactDate,
      existingContractId: existingContract?.id ?? null,
      risks: [
        ...(order.priority === "emergency" ? ["Cliente teve urgencia; abordar preventiva sem parecer oportunismo."] : []),
        ...(existingContract ? ["Cliente ja possui contrato; avaliar upsell ou equipamento adicional."] : []),
        ...(opportunity.opportunityScore < 70 ? ["Score comercial moderado; nutrir com educacao preventiva."] : []),
      ],
      nextAction: existingContract
        ? "Avaliar inclusao do equipamento ou melhoria do contrato atual."
        : opportunity.opportunityScore >= 70
          ? "Preparar proposta recorrente e abordar decisor no follow-up."
          : "Manter contato educativo e revisar reincidencia no proximo atendimento.",
    };
  }).filter((row): row is NonNullable<typeof row> => Boolean(row));

  return {
    generatedAt: new Date().toISOString(),
    summary: {
      opportunities: rows.length,
      priority: rows.filter((row) => row.stage === "proposal_priority").length,
      recommended: rows.filter((row) => row.stage === "proposal_recommended").length,
      nurture: rows.filter((row) => row.stage === "nurture").length,
      existingContracts: rows.filter((row) => row.stage === "existing_contract").length,
      estimatedMonthlyRevenue: rows.reduce((sum, row) => sum + (row.stage === "existing_contract" ? 0 : row.recurringRevenue.monthly), 0),
    },
    governance: {
      auditEvent: "commercial.contract_opportunity_pipeline_viewed",
      hidesInternalMargin: true,
      requiresHumanApprovalBeforeProposal: true,
      source: "post_service_and_service_order_history",
    },
    rows: rows.sort((a, b) => b.opportunityScore - a.opportunityScore),
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

export function createRecurringBillingBoard() {
  const rows = serviceContracts.map((contract) => {
    const billingPlan = createContractBillingPlan(contract.id);
    const nextInstallment = billingPlan?.installments[0];
    const overdueRisk = contract.status === "generate_order" ? "attention" : contract.status === "upcoming" ? "low" : "monitor";

    return {
      contractId: contract.id,
      customer: contract.customer,
      plan: contract.plan,
      status: contract.status,
      recurrenceMonths: contract.recurrenceMonths,
      coveredEquipment: contract.coveredEquipment,
      monthlyValue: billingPlan?.monthlyValue ?? 0,
      annualValue: billingPlan?.annualValue ?? 0,
      nextDueDate: nextInstallment?.dueDate ?? null,
      nextAmount: nextInstallment?.amount ?? 0,
      overdueRisk,
      riskReasons: [
        ...(contract.status === "generate_order" ? ["Visita contratual exige geracao de OS antes da cobranca."] : []),
        ...(contract.coveredEquipment >= 15 ? ["Contrato com muitos equipamentos exige conferencia fiscal e escopo."] : []),
        ...(contract.recurrenceMonths === 6 ? ["Recorrencia semestral aumenta intervalo de contato com o cliente."] : []),
      ],
      nextAction: contract.status === "generate_order"
        ? "Gerar OS preventiva e confirmar faturamento da mensalidade."
        : "Conferir dados fiscais e programar envio da proxima cobranca.",
    };
  });

  return {
    generatedAt: new Date().toISOString(),
    summary: {
      contracts: rows.length,
      monthlyRecurringRevenue: rows.reduce((sum, row) => sum + row.monthlyValue, 0),
      annualRecurringRevenue: rows.reduce((sum, row) => sum + row.annualValue, 0),
      attention: rows.filter((row) => row.overdueRisk === "attention").length,
      nextDueTotal: rows.reduce((sum, row) => sum + row.nextAmount, 0),
    },
    governance: {
      auditEvent: "billing.recurring_board_viewed",
      hidesInternalMargin: true,
      requiresFiscalReviewBeforeInvoice: true,
      mockUntilPaymentProviderConfigured: true,
    },
    rows: rows.sort((a, b) => (a.nextDueDate ?? "").localeCompare(b.nextDueDate ?? "")),
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

function likelySkusForOrder(serviceOrderId: string) {
  const order = serviceOrders.find((item) => item.id === serviceOrderId);
  const issue = order?.issue.toLowerCase() ?? "";

  if (issue.includes("dreno") || issue.includes("vazando")) {
    return ["BD-001"];
  }

  if (issue.includes("refrigeracao") || issue.includes("gela") || issue.includes("gas")) {
    return ["R410A", "CAP-45"];
  }

  return ["CAP-45"];
}

export function createServiceOrderPartsReservation(input: ReserveServiceOrderPartsInput) {
  const order = serviceOrders.find((item) => item.id === input.serviceOrderId);

  if (!order) {
    return null;
  }

  const requestedSkus = input.requestedSkus.length ? input.requestedSkus : likelySkusForOrder(input.serviceOrderId);
  const items = requestedSkus.map((sku) => {
    const item = stock.find((stockItem) => stockItem.sku === sku);
    const requestedQuantity = sku === "R410A" ? 1 : 1;
    const availableQuantity = item?.quantity ?? 0;
    const reservedQuantity = Math.min(requestedQuantity, availableQuantity);
    const missingQuantity = Math.max(0, requestedQuantity - availableQuantity);

    return {
      sku,
      name: item?.name ?? "Peca nao cadastrada",
      sourceLocation: item?.location ?? input.sourceLocation,
      targetLocation: input.targetLocation,
      requestedQuantity,
      availableQuantity,
      reservedQuantity,
      missingQuantity,
      belowMinimumAfterReservation: item ? availableQuantity - reservedQuantity <= item.minimum : true,
      status: missingQuantity > 0 ? "missing" : "reserved_mock",
    };
  });
  const missing = items.filter((item) => item.missingQuantity > 0);
  const belowMinimum = items.filter((item) => item.belowMinimumAfterReservation);

  return {
    id: `reservation-${input.serviceOrderId}-${Date.now()}`,
    serviceOrderId: input.serviceOrderId,
    technicianUserId: input.technicianUserId,
    customer: order.customer,
    equipment: order.equipment,
    status: missing.length ? "needs_purchase_or_transfer" : belowMinimum.length ? "reserved_with_restock_alert" : "reserved",
    sourceLocation: input.sourceLocation,
    targetLocation: input.targetLocation,
    items,
    summary: {
      requested: items.length,
      reserved: items.filter((item) => item.reservedQuantity > 0).length,
      missing: missing.length,
      belowMinimum: belowMinimum.length,
    },
    stockMovements: items
      .filter((item) => item.reservedQuantity > 0)
      .map((item) => ({
        sku: item.sku,
        from: item.sourceLocation,
        to: item.targetLocation,
        quantity: item.reservedQuantity,
        reason: `Reserva para OS ${input.serviceOrderId}`,
        status: "planned_mock",
      })),
    purchaseSuggestions: [...missing, ...belowMinimum].map((item) => ({
      sku: item.sku,
      name: item.name,
      suggestedQuantity: Math.max(item.missingQuantity, 2),
      reason: item.missingQuantity > 0 ? "Peca provavel indisponivel para a OS." : "Estoque ficara abaixo do minimo apos reserva.",
    })),
    dispatchImpact: {
      canDispatch: missing.length === 0,
      message: missing.length
        ? "Resolver falta de peca antes de liberar deslocamento."
        : "Pecas provaveis reservadas para carregamento do tecnico.",
    },
    nextActions: [
      "Confirmar separacao fisica das pecas.",
      "Transferir itens para estoque do veiculo do tecnico.",
      "Abrir compra se houver item faltante ou abaixo do minimo.",
      "Sincronizar reserva com pacote offline do tecnico.",
    ],
  };
}

type CommunicationMessage = {
  channel: string;
  template: string;
  subject?: string;
  body: string;
  copyToCustomer: boolean;
};

function queueItemsFromMessages(params: {
  sourceType: "service_order" | "contract";
  sourceId: string;
  trigger: string;
  recipients: Record<string, string>;
  messages: CommunicationMessage[];
}) {
  return params.messages.map((message, index) => {
    const recipient = message.channel === "email"
      ? params.recipients.companyEmail
      : message.channel === "whatsapp"
        ? params.recipients.whatsapp
        : params.recipients.internal;

    return {
      id: `queue-${params.sourceType}-${params.sourceId}-${message.channel}-${index + 1}`,
      sourceType: params.sourceType,
      sourceId: params.sourceId,
      trigger: params.trigger,
      channel: message.channel,
      provider: message.channel === "whatsapp" ? "whatsapp_business_pending" : message.channel === "email" ? "email_provider_pending" : "internal_notification",
      recipient,
      template: message.template,
      subject: message.subject,
      body: message.body,
      copyToCustomer: message.copyToCustomer,
      status: "queued_mock",
      priority: message.channel === "internal" ? "normal" : "high",
      attempts: 0,
      maxAttempts: 3,
      idempotencyKey: `${params.sourceType}:${params.sourceId}:${message.channel}:${message.template}`,
      scheduledFor: new Date().toISOString(),
    };
  });
}

export function createServiceOrderCommunicationQueue(serviceOrderId: string) {
  const communicationPackage = createServiceOrderCommunicationPackage(serviceOrderId);

  if (!communicationPackage) {
    return null;
  }

  const items = queueItemsFromMessages({
    sourceType: "service_order",
    sourceId: serviceOrderId,
    trigger: communicationPackage.trigger,
    recipients: communicationPackage.recipients,
    messages: communicationPackage.messages,
  });

  return {
    sourceType: "service_order",
    sourceId: serviceOrderId,
    status: "queued_mock",
    total: items.length,
    readyToSend: items.filter((item) => item.status === "queued_mock").length,
    blocked: 0,
    preflight: [
      { key: "technical_report", status: "required", result: "ready_to_generate" },
      { key: "customer_signature", status: "required", result: "expected_or_pending_completion" },
      { key: "lgpd_basis", status: "ok", result: communicationPackage.governance.lgpdBasis },
      { key: "provider_credentials", status: "pending_external_key", result: "fila criada sem envio real" },
    ],
    items,
    audit: {
      event: "communication.service_order_queue_created",
      entity: "service_order",
      entityId: serviceOrderId,
    },
    nextActions: [
      "Persistir itens da fila no banco real.",
      "Processar fila quando provedor de e-mail estiver configurado.",
      "Processar WhatsApp somente com consentimento valido.",
      "Registrar resposta do provedor em auditoria.",
    ],
  };
}

export function createContractCommunicationQueue(contractId: string) {
  const communicationPackage = createContractCommunicationPackage(contractId);

  if (!communicationPackage) {
    return null;
  }

  const items = queueItemsFromMessages({
    sourceType: "contract",
    sourceId: contractId,
    trigger: communicationPackage.trigger,
    recipients: communicationPackage.recipients,
    messages: communicationPackage.messages,
  });

  return {
    sourceType: "contract",
    sourceId: contractId,
    status: "queued_mock",
    total: items.length,
    readyToSend: items.filter((item) => item.status === "queued_mock").length,
    blocked: 0,
    automationRules: communicationPackage.automationRules,
    preflight: [
      { key: "contract_status", status: "ok", result: "contrato apto para comunicacao recorrente" },
      { key: "billing_rule", status: "ok", result: "mensalidade e vencimento identificados" },
      { key: "lgpd_basis", status: "ok", result: communicationPackage.governance.lgpdBasis },
      { key: "provider_credentials", status: "pending_external_key", result: "fila criada sem envio real" },
    ],
    items,
    audit: {
      event: "communication.contract_queue_created",
      entity: "contract",
      entityId: contractId,
    },
    nextActions: [
      "Persistir recorrencia de lembretes no banco real.",
      "Criar job de cobranca conforme dias configurados.",
      "Criar job de lembrete de visita preventiva.",
      "Pausar automacao se contrato ficar inadimplente.",
    ],
  };
}

export function createDayCommandCenter() {
  const dispatch = recommendMockDispatchAssignments();
  const urgentOrders = serviceOrders.filter((order) => order.priority === "emergency" || order.priority === "high");
  const blockedStock = stock.filter((item) => item.quantity <= item.minimum);
  const contractVisits = serviceContracts.map((contract) => {
    const billingPlan = createContractBillingPlan(contract.id);

    return {
      contractId: contract.id,
      customer: contract.customer,
      nextVisit: contract.nextVisit,
      status: contract.status,
      recurrenceMonths: contract.recurrenceMonths,
      coveredEquipment: contract.coveredEquipment,
      nextInstallment: billingPlan?.installments[0],
      communicationStatus: "ready",
    };
  });

  const serviceOrderCommunications = urgentOrders.map((order) => createServiceOrderCommunicationPackage(order.id)).filter(Boolean);
  const immediateDispatch = dispatch.data.filter((item) => item.recommendedTechnician.score >= 55);
  const blockedDispatch = serviceOrders
    .map((order) => ({
      order,
      readiness: order.id === "1048" ? "attention" : blockedStock.length ? "blocked" : "ready",
    }))
    .filter((item) => item.readiness !== "ready");

  return {
    date: new Date().toISOString().slice(0, 10),
    tenant: "ICEMAX Ar Condicionado",
    status: blockedDispatch.length || blockedStock.length ? "attention" : "ready",
    summary: {
      serviceOrders: serviceOrders.length,
      urgentOrders: urgentOrders.length,
      techniciansEvaluated: dispatch.summary.techniciansEvaluated,
      contractsWithUpcomingVisits: contractVisits.length,
      stockAlerts: blockedStock.length,
      communicationsReady: serviceOrderCommunications.length + contractVisits.length,
    },
    priorityQueue: urgentOrders.map((order) => ({
      serviceOrderId: order.id,
      customer: order.customer,
      issue: order.issue,
      priority: order.priority,
      status: order.status,
      technician: order.technician,
      eta: order.eta,
      recommendedAction: order.priority === "emergency" ? "acompanhar em tempo real e preparar comunicacao de conclusao" : "confirmar rota, peca provavel e janela do cliente",
    })),
    dispatch: {
      strategy: dispatch.strategy,
      immediateDispatch,
      blocked: blockedDispatch.map((item) => ({
        serviceOrderId: item.order.id,
        customer: item.order.customer,
        status: item.readiness,
        reason: item.readiness === "attention" ? "OS urgente exige acompanhamento do gestor." : "Ha peca em alerta antes do deslocamento.",
      })),
    },
    contracts: contractVisits,
    stockAlerts: blockedStock.map((item) => ({
      sku: item.sku,
      name: item.name,
      location: item.location,
      quantity: item.quantity,
      minimum: item.minimum,
      recommendedAction: "abrir solicitacao de compra ou transferir de outro estoque",
    })),
    communications: {
      serviceOrders: serviceOrderCommunications,
      contracts: serviceContracts.map((contract) => createContractCommunicationPackage(contract.id)).filter(Boolean),
    },
    managerDecisions: [
      "Priorizar OS emergencial antes de encaixes comerciais.",
      "Confirmar disponibilidade de R410A antes de novo deslocamento corretivo.",
      "Liberar lembretes de contrato para visitas dos proximos dias.",
      "Revisar comunicacoes pendentes antes do fim do expediente.",
      "Registrar qualquer bloqueio critico na auditoria operacional.",
    ],
  };
}
