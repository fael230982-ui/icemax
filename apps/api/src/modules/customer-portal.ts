import type { FastifyInstance } from "fastify";
import { isPrismaEnabled } from "../config";
import { serviceContracts, serviceOrders, tenant, technicianLocations } from "../mock-data";
import { issueMockPublicAccessToken, issuePrismaPublicAccessToken } from "../repositories/public-access-token-repository";
import {
  customerPortalAttachmentSchema,
  customerPortalOrderSchema,
  customerPortalTriageSchema,
  parseBody,
  type CustomerPortalAttachmentInput,
  type CustomerPortalTriageInput,
} from "../schemas";
import { recordAuditEvent } from "../services/audit-service";
import { createContractBillingPlan } from "../services/business-suite-service";
import { getPublicAccessTokenSecurityPolicy } from "../services/public-access-token-service";

function classifyPortalTriage(input: CustomerPortalTriageInput) {
  const description = input.problemDescription.toLowerCase();
  const emergencyTerms = ["faisca", "queimado", "fumaca", "curto", "hospital", "clinica", "servidor", "camara fria", "vazamento grande"];
  const highTerms = ["vazamento", "nao gela", "congelando", "gelo", "barulho", "alarme", "erro", "dreno"];
  const emergencySignals = [
    input.urgency === "emergency",
    input.hasElectricalRisk,
    input.hasCriticalEnvironment,
    emergencyTerms.some((term) => description.includes(term)),
  ].filter(Boolean).length;
  const highSignals = [
    input.urgency === "high",
    input.hasLeak,
    highTerms.some((term) => description.includes(term)),
  ].filter(Boolean).length;
  const suggestedPriority = emergencySignals > 0 ? "emergency" : highSignals > 0 ? "high" : "normal";
  const score = Math.min(100, emergencySignals * 45 + highSignals * 22 + (input.hasPhoto ? 6 : 0) + 28);
  const serviceType = description.includes("higien") || description.includes("limpeza")
    ? "cleaning"
    : description.includes("prevent")
      ? "preventive"
      : "corrective";

  return {
    status: "triage_ready",
    tenantSlug: input.tenantSlug,
    serviceType,
    suggestedPriority,
    score,
    requiredChecklist: [
      "Confirmar endereco, acesso ao equipamento e responsavel no local.",
      "Registrar tipo, local e identificacao do equipamento.",
      input.hasPhoto ? "Anexar fotos recebidas na OS." : "Solicitar foto do equipamento e do sintoma antes do despacho.",
      suggestedPriority === "emergency" ? "Acionar responsavel operacional antes de encaixar rota." : "Validar melhor janela de atendimento com o cliente.",
      input.hasElectricalRisk ? "Orientar o cliente a desligar o equipamento ate avaliacao tecnica." : "Confirmar se o equipamento pode permanecer ligado ate a visita.",
    ],
    customerGuidance: [
      "Liberar acesso ao ambiente e ao quadro eletrico relacionado ao equipamento.",
      "Evitar novas tentativas de reparo por terceiros antes da chegada do tecnico.",
      input.hasLeak ? "Proteger a area abaixo do vazamento e retirar itens sensiveis." : "Manter o local identificado para agilizar a vistoria.",
    ],
    dispatchGuidance: {
      routeMode: suggestedPriority === "emergency" ? "prioritize_nearest_available" : "fit_best_window",
      requiresSupervisorReview: suggestedPriority === "emergency" || input.hasElectricalRisk,
      recommendedSlaMinutes: suggestedPriority === "emergency" ? 90 : suggestedPriority === "high" ? 240 : 1440,
    },
    communication: {
      whatsappTemplate: "portal_triage_received",
      emailTemplate: "portal_triage_summary",
      message: `Solicitacao recebida com prioridade sugerida ${suggestedPriority}. A empresa fara a triagem antes do despacho.`,
    },
  };
}

function buildCustomerTracking(serviceOrderId: string) {
  const order = serviceOrders.find((item) => item.id === serviceOrderId);

  if (!order) {
    return null;
  }

  const technician = technicianLocations.find((item) => item.serviceOrderId === serviceOrderId || item.technician === order.technician);
  const statusLabels: Record<string, string> = {
    open: "Solicitacao recebida",
    scheduled: "Atendimento agendado",
    en_route: "Tecnico em deslocamento",
    in_progress: "Atendimento em andamento",
    completed: "Atendimento concluido",
    cancelled: "Atendimento cancelado",
  };
  const timeline = [
    { key: "requested", label: "Solicitacao recebida", status: "done" },
    { key: "scheduled", label: "Agenda definida", status: ["scheduled", "en_route", "in_progress", "completed"].includes(order.status) ? "done" : "pending" },
    { key: "en_route", label: "Tecnico a caminho", status: ["en_route", "in_progress", "completed"].includes(order.status) ? "done" : "pending" },
    { key: "in_progress", label: "Atendimento em execucao", status: ["in_progress", "completed"].includes(order.status) ? "done" : "pending" },
    { key: "completed", label: "Relatorio e assinatura", status: order.status === "completed" ? "done" : "pending" },
  ];

  return {
    serviceOrderId,
    tenant: {
      name: tenant.name,
      supportEmail: tenant.supportEmail,
      primaryColor: tenant.primaryColor,
      secondaryColor: tenant.secondaryColor,
    },
    status: order.status,
    statusLabel: statusLabels[order.status] ?? "Atendimento em acompanhamento",
    customer: order.customer,
    equipment: order.equipment,
    issue: order.priority === "emergency" ? "Atendimento prioritario" : order.issue,
    priority: order.priority,
    eta: order.eta ?? (order.status === "in_progress" ? "tecnico no local" : "a confirmar"),
    technician: {
      name: order.technician,
      status: technician?.status ?? order.status,
      lastLocationAt: technician?.capturedAt,
      locationShared: Boolean(technician),
    },
    timeline,
    customerActions: [
      order.status === "scheduled" ? "Aguardar chegada do tecnico no horario previsto." : "Acompanhar atualizacoes do atendimento.",
      order.status === "completed" ? "Conferir relatorio tecnico enviado pela empresa." : "Manter acesso ao equipamento liberado.",
      "Em caso de duvida, responder pelo canal de atendimento informado pela empresa.",
    ],
    privacy: {
      publicLink: true,
      hidesFinancialData: true,
      hidesInternalNotes: true,
      hidesTechnicianPersonalPhone: true,
    },
    refreshSeconds: 45,
  };
}

async function createTrackingSharePackage(serviceOrderId: string) {
  const tracking = buildCustomerTracking(serviceOrderId);

  if (!tracking) {
    return null;
  }

  const tokenPackage = isPrismaEnabled()
    ? await issuePrismaPublicAccessToken({
        tenantId: tenant.id,
        prefix: "track",
        scope: "service_order_tracking",
        entityType: "service_order",
        entityId: serviceOrderId,
        expiresInDays: 7,
        path: "/acompanhamento/{token}",
        metadata: {
          customer: tracking.customer,
          hidesFinancialData: tracking.privacy.hidesFinancialData,
          hidesInternalNotes: tracking.privacy.hidesInternalNotes,
        },
      })
    : await issueMockPublicAccessToken({
        tenantId: tenant.id,
        prefix: "track",
        scope: "service_order_tracking",
        entityType: "service_order",
        entityId: serviceOrderId,
        expiresInDays: 7,
        path: "/acompanhamento/{token}",
        metadata: {
          customer: tracking.customer,
          hidesFinancialData: tracking.privacy.hidesFinancialData,
          hidesInternalNotes: tracking.privacy.hidesInternalNotes,
        },
      });

  return {
    serviceOrderId,
    status: "share_package_ready",
    token: tokenPackage.token,
    tokenHashPreview: tokenPackage.tokenHashPreview,
    publicUrl: tokenPackage.publicUrl,
    issuedAt: tokenPackage.issuedAt,
    expiresAt: tokenPackage.expiresAt,
    expiresInDays: tokenPackage.expiresInDays,
    customer: tracking.customer,
    channels: [
      {
        channel: "whatsapp",
        recipient: "+5500000000000",
        template: "os_tracking_link",
        message: `Ola! Acompanhe sua OS ${serviceOrderId} pelo link: ${tokenPackage.publicUrl}`,
      },
      {
        channel: "email",
        recipient: "cliente@local.dev",
        subject: `Acompanhamento da OS ${serviceOrderId}`,
        template: "os_tracking_link_email",
        message: `Ola, voce pode acompanhar o andamento da sua OS ${serviceOrderId} pelo link ${tokenPackage.publicUrl}.`,
      },
    ],
    security: {
      tokenType: "opaque_public_access_token",
      requiresLogin: false,
      expiresAutomatically: true,
      hidesFinancialData: tracking.privacy.hidesFinancialData,
      hidesInternalNotes: tracking.privacy.hidesInternalNotes,
      canBeRevoked: true,
      rawTokenPersisted: tokenPackage.rawTokenPersisted,
      hashPersistedInProduction: tokenPackage.hashPersistedInProduction,
      persistence: tokenPackage.persistence,
      scope: tokenPackage.scope,
    },
    audit: {
      event: "customer_portal.tracking_link_created",
      entity: "service_order",
      entityId: serviceOrderId,
    },
    nextActions: [
      "Validar abertura do link contra hash persistido quando banco real estiver ativo.",
      "Enviar link pela fila de comunicacao.",
      "Registrar abertura do link em auditoria.",
      "Expirar link apos prazo configurado.",
    ],
  };
}

function createAttachmentManifest(serviceOrderId: string, input: CustomerPortalAttachmentInput) {
  const accepted = input.attachments.map((item, index) => {
    const kind = item.mimeType === "application/pdf" ? "document" : "photo";
    const diagnosticHint = kind === "photo"
      ? item.caption ?? "Foto recebida para apoiar triagem visual."
      : "Documento recebido para conferencia administrativa.";

    return {
      id: `portal-att-${serviceOrderId}-${index + 1}`,
      fileName: item.fileName,
      mimeType: item.mimeType,
      sizeBytes: item.sizeBytes,
      kind,
      caption: item.caption,
      diagnosticHint,
      accepted: true,
    };
  });
  const photos = accepted.filter((item) => item.kind === "photo");

  return {
    serviceOrderId,
    tenantSlug: input.tenantSlug,
    status: "attachment_manifest_ready",
    accepted,
    summary: {
      total: accepted.length,
      photos: photos.length,
      documents: accepted.length - photos.length,
      maxFileSizeMb: 10,
    },
    aiPreparation: {
      readyForVisionAnalysis: photos.length > 0,
      photoHints: photos.map((item) => item.diagnosticHint),
      recommendedPrompt: photos.length > 0
        ? "Analise as fotos recebidas junto com a descricao da OS e sugira causas provaveis, riscos e pecas provaveis."
        : "Sem foto tecnica disponivel para analise visual.",
    },
    privacy: {
      customerEmailStored: Boolean(input.customerEmail),
      hidesInternalNotes: true,
      requiresVirusScanBeforeStorage: true,
      requiresSensitiveDataReview: true,
    },
    nextActions: [
      "Salvar arquivos em storage privado por tenant.",
      "Vincular anexos a OS no banco real.",
      "Executar antivirus e validacao de tipo real do arquivo.",
      "Enviar fotos aceitas para diagnostico por IA quando a chave estiver configurada.",
    ],
  };
}

function buildCustomerBillingSummary(tenantSlug: string) {
  const contracts = serviceContracts.map((contract) => {
    const billingPlan = createContractBillingPlan(contract.id);
    const nextInstallment = billingPlan?.installments[0];
    const status = contract.status === "generate_order" ? "visita_pendente" : contract.status === "scheduled" ? "em_dia" : "proximo_vencimento";

    return {
      contractId: contract.id,
      customer: contract.customer,
      plan: contract.plan,
      recurrenceMonths: contract.recurrenceMonths,
      coveredEquipment: contract.coveredEquipment,
      nextVisit: contract.nextVisit,
      nextDueDate: nextInstallment?.dueDate,
      nextAmount: nextInstallment?.amount,
      status,
      customerAction: status === "visita_pendente"
        ? "Aguardar confirmacao da empresa para a proxima visita preventiva."
        : "Manter dados de contato e acesso ao equipamento atualizados.",
    };
  });

  return {
    tenantSlug,
    tenant: {
      name: tenant.name,
      supportEmail: tenant.supportEmail,
      primaryColor: tenant.primaryColor,
      secondaryColor: tenant.secondaryColor,
    },
    generatedAt: new Date().toISOString(),
    summary: {
      contracts: contracts.length,
      monthlyTotal: contracts.reduce((sum, contract) => sum + (contract.nextAmount ?? 0), 0),
      coveredEquipment: contracts.reduce((sum, contract) => sum + contract.coveredEquipment, 0),
      upcomingVisits: contracts.filter((contract) => contract.status === "visita_pendente" || contract.status === "proximo_vencimento").length,
    },
    contracts,
    privacy: {
      customerVisible: true,
      hidesInternalMargin: true,
      hidesCollectionPolicy: true,
      hidesInternalNotes: true,
      requiresSecureCustomerIdentityInProduction: true,
    },
    nextActions: [
      "Confirmar identidade do cliente antes de liberar dados reais.",
      "Conectar pagamentos somente apos escolha de provedor financeiro.",
      "Permitir download de comprovantes quando storage privado estiver configurado.",
    ],
  };
}

async function createCustomerBillingAccessPackage(tenantSlug: string) {
  const billingSummary = buildCustomerBillingSummary(tenantSlug);
  const tokenPackage = isPrismaEnabled()
    ? await issuePrismaPublicAccessToken({
        tenantId: tenant.id,
        prefix: "billing",
        scope: "billing_summary",
        entityType: "customer_portal",
        entityId: tenantSlug,
        expiresInDays: 3,
        path: `/portal/${tenantSlug}?billingToken={token}`,
        metadata: {
          coveredEquipment: billingSummary.summary.coveredEquipment,
          contracts: billingSummary.summary.contracts,
          requiresCustomerIdentityInProduction: true,
        },
      })
    : await issueMockPublicAccessToken({
        tenantId: tenant.id,
        prefix: "billing",
        scope: "billing_summary",
        entityType: "customer_portal",
        entityId: tenantSlug,
        expiresInDays: 3,
        path: `/portal/${tenantSlug}?billingToken={token}`,
        metadata: {
          coveredEquipment: billingSummary.summary.coveredEquipment,
          contracts: billingSummary.summary.contracts,
          requiresCustomerIdentityInProduction: true,
        },
      });

  return {
    tenantSlug,
    status: "billing_access_package_ready",
    token: tokenPackage.token,
    tokenHashPreview: tokenPackage.tokenHashPreview,
    publicUrl: tokenPackage.publicUrl,
    issuedAt: tokenPackage.issuedAt,
    expiresAt: tokenPackage.expiresAt,
    expiresInDays: tokenPackage.expiresInDays,
    tenant: billingSummary.tenant,
    accessScope: [
      "contracts_summary",
      "next_due_dates",
      "covered_equipment",
      "next_visits",
      "customer_actions",
    ],
    restrictions: [
      "Nao exibe margem interna.",
      "Nao exibe politicas internas de cobranca.",
      "Nao exibe observacoes administrativas.",
      "Nao permite alteracao de contrato ou pagamento real.",
    ],
    channels: [
      {
        channel: "email",
        recipient: "cliente@local.dev",
        subject: "Acesso ao resumo do contrato",
        template: "customer_billing_access_email",
        message: `Acesse o resumo dos seus contratos pelo link ${tokenPackage.publicUrl}.`,
      },
      {
        channel: "whatsapp",
        recipient: "+5500000000000",
        template: "customer_billing_access_whatsapp",
        message: `Ola! Seu resumo de contrato esta disponivel por 3 dias: ${tokenPackage.publicUrl}`,
      },
    ],
    security: {
      tokenType: "opaque_public_access_token",
      requiresCustomerIdentityInProduction: true,
      expiresAutomatically: true,
      canBeRevoked: true,
      auditEveryAccess: true,
      rawTokenPersisted: tokenPackage.rawTokenPersisted,
      hashPersistedInProduction: tokenPackage.hashPersistedInProduction,
      persistence: tokenPackage.persistence,
      scope: tokenPackage.scope,
    },
    audit: {
      event: "customer_portal.billing_access_link_created",
      entity: "customer_portal",
      entityId: tenantSlug,
    },
    nextActions: [
      "Validar abertura do link contra hash persistido quando banco real estiver ativo.",
      "Exigir validacao de identidade antes de exibir dados reais.",
      "Enviar link pela fila oficial de comunicacao quando provedores estiverem configurados.",
      "Registrar abertura, expiracao e revogacao do link em auditoria.",
    ],
  };
}

function buildCustomerPortalAccessPolicy(tenantSlug: string) {
  return {
    tenantSlug,
    generatedAt: new Date().toISOString(),
    zones: [
      {
        key: "service_order_request",
        label: "Abertura de solicitacao",
        accessLevel: "public_form",
        allowedData: ["dados de contato", "endereco", "descricao do problema", "opt-in WhatsApp"],
        blockedData: ["historico financeiro", "notas internas", "margem", "politica de cobranca"],
        identityRequirement: "validacao posterior pela empresa",
      },
      {
        key: "service_order_tracking",
        label: "Acompanhamento da OS",
        accessLevel: "opaque_link",
        allowedData: ["status da OS", "linha do tempo", "ETA", "nome do tecnico"],
        blockedData: ["telefone pessoal do tecnico", "notas internas", "dados financeiros"],
        identityRequirement: "token com expiracao",
      },
      {
        key: "billing_summary",
        label: "Resumo financeiro",
        accessLevel: "secure_customer_area",
        allowedData: ["contratos", "proximos vencimentos", "equipamentos cobertos", "proximas visitas"],
        blockedData: ["margem interna", "politica de cobranca", "score comercial", "observacoes administrativas"],
        identityRequirement: "token + confirmacao de identidade em producao",
      },
    ],
    enforcement: {
      mockMode: true,
      denyByDefaultInProduction: true,
      auditEverySensitiveAccess: true,
      hashTokensInDatabase: true,
      rawTokenPersisted: false,
      rawTokenReturnedOnlyOnCreation: true,
      rotateTokensOnCustomerRequest: true,
    },
    releaseChecks: [
      { key: "token_hashing", status: "required_before_production", detail: "Persistir apenas hash do token." },
      { key: "customer_identity", status: "required_before_production", detail: "Validar e-mail, telefone ou documento antes de dados financeiros." },
      { key: "access_audit", status: "required_before_production", detail: "Auditar abertura, expiracao e revogacao." },
      { key: "tenant_isolation", status: "required_before_production", detail: "Garantir que um tenant nunca leia dados de outro." },
    ],
  };
}

function buildCustomerExternalSharingPolicy(tenantSlug: string) {
  const channels = [
    {
      channel: "email",
      allowed: true,
      allowedPayloads: ["relatorio tecnico", "termo de garantia", "comprovante de conclusao"],
      requiredControls: ["fila auditada", "destinatario validado", "copia opcional ao cliente"],
      blockedPayloads: ["notas internas", "margem", "telefone pessoal do tecnico"],
    },
    {
      channel: "portal",
      allowed: true,
      allowedPayloads: ["status da OS", "historico liberado", "documentos aprovados"],
      requiredControls: ["token expiravel", "auditoria de acesso", "escopo por cliente"],
      blockedPayloads: ["financeiro sem identidade confirmada", "documentos sem antivirus"],
    },
    {
      channel: "public_link",
      allowed: false,
      allowedPayloads: ["acompanhamento basico da OS"],
      requiredControls: ["token opaco", "expiracao curta", "revogacao"],
      blockedPayloads: ["assinatura", "relatorio completo", "fotos", "dados financeiros"],
    },
    {
      channel: "whatsapp",
      allowed: true,
      allowedPayloads: ["link de acompanhamento", "confirmacao de agenda", "aviso de conclusao"],
      requiredControls: ["opt-in", "template aprovado", "registro de envio"],
      blockedPayloads: ["anexo sensivel direto", "cobranca detalhada sem identidade"],
    },
  ];

  return {
    tenantSlug,
    generatedAt: new Date().toISOString(),
    status: "sharing_policy_ready",
    defaultDecision: "deny_sensitive_until_verified",
    channels,
    evidenceRules: [
      "Fotos, assinaturas e plantas exigem storage privado antes de compartilhamento externo.",
      "Relatorio final so deve sair apos manifesto de evidencias sem bloqueios obrigatorios.",
      "Dados financeiros exigem confirmacao de identidade do cliente em producao.",
      "Todo envio externo deve registrar tenantId, entidade, destinatario, canal e provedor.",
    ],
    summary: {
      channels: channels.length,
      allowedChannels: channels.filter((item) => item.allowed).length,
      blockedChannels: channels.filter((item) => !item.allowed).length,
      sensitivePayloadsBlockedOnPublicLink: channels.find((item) => item.channel === "public_link")?.blockedPayloads.length ?? 0,
    },
    governance: {
      auditEvent: "customer_portal.external_sharing_policy_viewed",
      denyByDefault: true,
      requiresEvidenceManifest: true,
      requiresPrivateStorageForSensitiveFiles: true,
      requiresProviderReceipt: true,
    },
  };
}

export async function registerCustomerPortalRoutes(app: FastifyInstance) {
  app.get("/customer-portal/:tenantSlug/config", async (request) => {
    const { tenantSlug } = request.params as { tenantSlug: string };

    return {
      tenantSlug,
      companyName: tenant.name,
      supportEmail: tenant.supportEmail,
      primaryColor: tenant.primaryColor,
      secondaryColor: tenant.secondaryColor,
      serviceOrderOpeningEnabled: true,
      whatsappOptInEnabled: true,
    };
  });

  app.get("/customer-portal/:tenantSlug/billing-summary", async (request) => {
    const { tenantSlug } = request.params as { tenantSlug: string };

    return buildCustomerBillingSummary(tenantSlug);
  });

  app.get("/customer-portal/:tenantSlug/access-policy", async (request) => {
    const { tenantSlug } = request.params as { tenantSlug: string };

    return buildCustomerPortalAccessPolicy(tenantSlug);
  });

  app.get("/customer-portal/:tenantSlug/public-token-policy", async (request) => {
    const { tenantSlug } = request.params as { tenantSlug: string };

    return {
      tenantSlug,
      ...getPublicAccessTokenSecurityPolicy(),
    };
  });

  app.get("/customer-portal/:tenantSlug/external-sharing-policy", async (request) => {
    const { tenantSlug } = request.params as { tenantSlug: string };

    return buildCustomerExternalSharingPolicy(tenantSlug);
  });

  app.post("/customer-portal/:tenantSlug/billing-access-link", async (request, reply) => {
    const { tenantSlug } = request.params as { tenantSlug: string };
    const accessPackage = await createCustomerBillingAccessPackage(tenantSlug);

    await recordAuditEvent({
      tenantId: tenant.id,
      action: accessPackage.audit.event,
      entity: accessPackage.audit.entity,
      entityId: accessPackage.audit.entityId,
      metadata: {
        expiresAt: accessPackage.expiresAt,
        accessScope: accessPackage.accessScope,
        channels: accessPackage.channels.map((item) => item.channel),
      },
    });

    return reply.code(201).send(accessPackage);
  });

  app.post("/customer-portal/service-orders", async (request, reply) => {
    const input = parseBody(customerPortalOrderSchema, request.body);
    const triage = classifyPortalTriage({
      tenantSlug: input.tenantSlug,
      equipmentType: input.equipmentType,
      problemDescription: input.problemDescription,
      urgency: input.urgency,
      hasLeak: /vaz|gote|agua|dreno/i.test(input.problemDescription),
      hasElectricalRisk: /faisca|curto|queim|fumaca|disjuntor/i.test(input.problemDescription),
      hasCriticalEnvironment: /clinica|hospital|servidor|laboratorio|camara fria/i.test(input.problemDescription),
      hasPhoto: false,
    });
    const order = {
      id: `portal-os-${Date.now()}`,
      tenantId: tenant.id,
      openedBy: "customer_portal",
      customerName: input.customerName,
      customerEmail: input.customerEmail,
      customerPhone: input.customerPhone,
      address: input.address,
      equipmentType: input.equipmentType,
      equipmentLabel: input.equipmentLabel,
      title: `Solicitacao do cliente - ${input.equipmentType}`,
      description: input.problemDescription,
      priority: input.urgency,
      status: "open",
      allowWhatsapp: input.allowWhatsapp,
      triage,
      createdAt: new Date().toISOString(),
    };

    await recordAuditEvent({
      tenantId: tenant.id,
      action: "customer_portal.service_order_requested",
      entity: "service_order",
      entityId: order.id,
      metadata: {
        tenantSlug: input.tenantSlug,
        urgency: input.urgency,
        allowWhatsapp: input.allowWhatsapp,
        suggestedPriority: triage.suggestedPriority,
        serviceType: triage.serviceType,
      },
    });

    return reply.code(201).send(order);
  });

  app.post("/customer-portal/triage", async (request, reply) => {
    const input = parseBody(customerPortalTriageSchema, request.body);
    const triage = classifyPortalTriage(input);

    await recordAuditEvent({
      tenantId: tenant.id,
      action: "customer_portal.triage_prepared",
      entity: "customer_portal",
      entityId: input.tenantSlug,
      metadata: {
        suggestedPriority: triage.suggestedPriority,
        serviceType: triage.serviceType,
        requiresSupervisorReview: triage.dispatchGuidance.requiresSupervisorReview,
      },
    });

    return reply.code(201).send(triage);
  });

  app.get("/customer-portal/service-orders/:id/tracking", async (request, reply) => {
    const { id } = request.params as { id: string };
    const tracking = buildCustomerTracking(id);

    if (!tracking) {
      return reply.code(404).send({ message: "OS nao encontrada para acompanhamento do cliente." });
    }

    return tracking;
  });

  app.post("/customer-portal/service-orders/:id/tracking-link", async (request, reply) => {
    const { id } = request.params as { id: string };
    const sharePackage = await createTrackingSharePackage(id);

    if (!sharePackage) {
      return reply.code(404).send({ message: "OS nao encontrada para gerar link de acompanhamento." });
    }

    await recordAuditEvent({
      tenantId: tenant.id,
      action: sharePackage.audit.event,
      entity: sharePackage.audit.entity,
      entityId: sharePackage.audit.entityId,
      metadata: {
        expiresAt: sharePackage.expiresAt,
        channels: sharePackage.channels.map((item) => item.channel),
      },
    });

    return reply.code(201).send(sharePackage);
  });

  app.post("/customer-portal/service-orders/:id/attachments", async (request, reply) => {
    const { id } = request.params as { id: string };
    const input = parseBody(customerPortalAttachmentSchema, request.body);
    const manifest = createAttachmentManifest(id, input);

    await recordAuditEvent({
      tenantId: tenant.id,
      action: "customer_portal.attachments_manifest_created",
      entity: "service_order",
      entityId: id,
      metadata: {
        tenantSlug: input.tenantSlug,
        total: manifest.summary.total,
        photos: manifest.summary.photos,
        documents: manifest.summary.documents,
      },
    });

    return reply.code(201).send(manifest);
  });
}
