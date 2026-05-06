"use client";

import { FormEvent, useState } from "react";
import { icemaxApi } from "../../lib/api";

type PublicTokenInventoryItem = {
  id: string;
  scope: string;
  entityType: string;
  entityId: string;
  status: string;
  tokenHashPreview?: string;
  expiresAt?: string;
  revokedAt?: string;
};

type PublicTokenInventoryResponse = {
  data?: PublicTokenInventoryItem[];
  summary?: Record<string, number>;
  total?: number;
};

type MobileOfflineEscalationItem = {
  id: string;
  technicianName: string;
  serviceOrderId: string;
  customer: string;
  actionLabel: string;
  priority: string;
  retryCount: number;
  ageHours?: number;
  severityScore: number;
  slaStatus: string;
  blockedReason: string;
  likelyCause?: string;
  recommendedAction: string;
  owner: string;
  impact?: string;
  source?: string;
  requestedFromMobile?: boolean;
  requestedAt?: string | null;
  mobileNote?: string | null;
};

type MobileOfflineEscalationResponse = {
  summary?: {
    total: number;
    critical: number;
    high: number;
    oldestAgeHours: number;
    highestSeverityScore: number;
    managerReviewRequests?: number;
    oldestManagerReviewAgeHours?: number;
  };
  data?: MobileOfflineEscalationItem[];
};

function encodeTextFile(content: string) {
  return btoa(unescape(encodeURIComponent(content)));
}

export function OperationsConsole() {
  const [token, setToken] = useState("");
  const [publicTokenRecordId, setPublicTokenRecordId] = useState("");
  const [publicTokenRevocationReason, setPublicTokenRevocationReason] = useState("Link revogado por solicitacao operacional.");
  const [publicTokenInventory, setPublicTokenInventory] = useState<PublicTokenInventoryResponse | null>(null);
  const [mobileOfflineEscalations, setMobileOfflineEscalations] = useState<MobileOfflineEscalationResponse | null>(null);
  const [publicTokenStatusFilter, setPublicTokenStatusFilter] = useState("all");
  const [publicTokenScopeFilter, setPublicTokenScopeFilter] = useState("");
  const [mobileOfflineSourceFilter, setMobileOfflineSourceFilter] = useState("all");
  const [mobileOfflinePriorityFilter, setMobileOfflinePriorityFilter] = useState("all");
  const [mobileOfflineOwnerFilter, setMobileOfflineOwnerFilter] = useState("all");
  const [mobileOfflineTechnicianFilter, setMobileOfflineTechnicianFilter] = useState("all");
  const [mobileOfflineSort, setMobileOfflineSort] = useState("severity_desc");
  const [compactActionStatus, setCompactActionStatus] = useState<Record<string, string>>({});
  const [expandedCompactOfflineCards, setExpandedCompactOfflineCards] = useState<Record<string, boolean>>({});
  const [compactMobileOnly, setCompactMobileOnly] = useState(false);
  const [status, setStatus] = useState("Pronto para operar com a API local.");
  const [result, setResult] = useState("");
  const mobileOfflineItems = mobileOfflineEscalations?.data ?? [];
  const mobileOfflineTechnicians = Array.from(new Set(mobileOfflineItems.map((item) => item.technicianName))).sort();
  const mobileOfflineOwners = Array.from(new Set(mobileOfflineItems.map((item) => item.owner))).sort();
  const filteredMobileOfflineItems = mobileOfflineItems.filter((item) => {
    const sourceMatches = mobileOfflineSourceFilter === "all"
      || (mobileOfflineSourceFilter === "mobile" && item.requestedFromMobile)
      || (mobileOfflineSourceFilter === "sync_guard" && !item.requestedFromMobile);
    const priorityMatches = mobileOfflinePriorityFilter === "all" || item.priority === mobileOfflinePriorityFilter;
    const ownerMatches = mobileOfflineOwnerFilter === "all" || item.owner === mobileOfflineOwnerFilter;
    const technicianMatches = mobileOfflineTechnicianFilter === "all" || item.technicianName === mobileOfflineTechnicianFilter;

    return sourceMatches && priorityMatches && ownerMatches && technicianMatches;
  });
  const sortedMobileOfflineItems = [...filteredMobileOfflineItems].sort((left, right) => {
    if (mobileOfflineSort === "age_desc") {
      return (right.ageHours ?? 0) - (left.ageHours ?? 0) || right.severityScore - left.severityScore;
    }

    if (mobileOfflineSort === "priority_desc") {
      const priorityWeight = { critical: 2, high: 1 } as Record<string, number>;
      return (priorityWeight[right.priority] ?? 0) - (priorityWeight[left.priority] ?? 0)
        || right.severityScore - left.severityScore;
    }

    if (mobileOfflineSort === "mobile_first") {
      return Number(right.requestedFromMobile) - Number(left.requestedFromMobile)
        || right.severityScore - left.severityScore;
    }

    return right.severityScore - left.severityScore || right.retryCount - left.retryCount;
  });
  const compactMobileOfflineFilteredItems = sortedMobileOfflineItems
    .filter((item) => !compactMobileOnly || item.requestedFromMobile);
  const compactMobileOfflineItems = compactMobileOfflineFilteredItems.slice(0, 6);
  const hasCompactMobileOfflineSourceItems = Boolean(sortedMobileOfflineItems.length);
  const compactMobileRequestCount = sortedMobileOfflineItems.filter((item) => item.requestedFromMobile).length;
  const hiddenCompactMobileOfflineCount = Math.max(compactMobileOfflineFilteredItems.length - compactMobileOfflineItems.length, 0);
  const hasActiveMobileOfflineFilters = mobileOfflineSourceFilter !== "all"
    || mobileOfflinePriorityFilter !== "all"
    || mobileOfflineOwnerFilter !== "all"
    || mobileOfflineTechnicianFilter !== "all"
    || mobileOfflineSort !== "severity_desc"
    || compactMobileOnly;
  const getEscalationSeverityClass = (score: number) => (
    score >= 85 ? "badge badgeDanger" : score >= 65 ? "badge badgeWarning" : "badge badgeNeutral"
  );
  const getEscalationPriorityClass = (priority: string) => (
    priority === "critical" ? "badge badgeDanger" : priority === "high" ? "badge badgeWarning" : "badge badgeNeutral"
  );

  async function run(label: string, action: () => Promise<unknown>) {
    try {
      setStatus(`${label}: enviando...`);
      const response = await action();
      setResult(JSON.stringify(response, null, 2));
      setStatus(`${label}: concluido.`);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Falha inesperada.");
    }
  }

  async function runCompactMobileOfflineAction(recordId: string, label: string, action: () => Promise<unknown>) {
    setCompactActionStatus((current) => ({ ...current, [recordId]: `${label}: em andamento.` }));

    try {
      setStatus(`${label}: enviando...`);
      const response = await action();
      setResult(JSON.stringify(response, null, 2));
      setStatus(`${label}: concluido.`);
      setCompactActionStatus((current) => ({ ...current, [recordId]: `${label}: concluido.` }));
    } catch (error) {
      const message = error instanceof Error ? error.message : "Falha inesperada.";
      setStatus(message);
      setCompactActionStatus((current) => ({ ...current, [recordId]: `${label}: falhou.` }));
    }
  }

  function toggleCompactOfflineCard(recordId: string) {
    setExpandedCompactOfflineCards((current) => ({ ...current, [recordId]: !current[recordId] }));
  }

  function resetMobileOfflineFilters() {
    setMobileOfflineSourceFilter("all");
    setMobileOfflinePriorityFilter("all");
    setMobileOfflineOwnerFilter("all");
    setMobileOfflineTechnicianFilter("all");
    setMobileOfflineSort("severity_desc");
    setCompactMobileOnly(false);
  }

  function submitCustomer(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    void run("Cliente", () =>
      icemaxApi.createCustomer({
        name: String(form.get("name")),
        email: String(form.get("email")),
        phone: String(form.get("phone")),
      }, token || undefined),
    );
  }

  function submitOrder(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    void run("OS", () =>
      icemaxApi.createServiceOrder({
        customerId: String(form.get("customerId")),
        equipmentId: String(form.get("equipmentId")) || undefined,
        title: String(form.get("title")),
        description: String(form.get("description")),
        priority: String(form.get("priority")),
      }, token || undefined),
    );
  }

  function submitQr(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    void run("Etiqueta QR", () =>
      icemaxApi.createQrLabel({
        equipmentCode: String(form.get("equipmentCode")),
        equipment: String(form.get("equipment")),
        customer: String(form.get("customer")),
        installLocation: String(form.get("installLocation")),
      }, token || undefined),
    );
  }

  function uploadSample() {
    void run("Upload", () =>
      icemaxApi.uploadFile({
        folder: "uploads",
        fileName: `relatorio-campo-${Date.now()}.txt`,
        mimeType: "text/plain",
        base64: encodeTextFile("Arquivo tecnico gerado pelo painel ICEMAX."),
      }, token || undefined),
    );
  }

  function loadAudit() {
    void run("Auditoria", () => icemaxApi.auditLog(token || undefined));
  }

  function optimizeRoute() {
    void run("Rota otimizada", () =>
      icemaxApi.optimizeRoute({
        technicianUserId: "tech-001",
        serviceOrderIds: ["1048", "1049", "1050"],
      }, token || undefined),
    );
  }

  function loadDispatchRecommendations() {
    void run("Despacho inteligente", () => icemaxApi.dispatchRecommendations(token || undefined));
  }

  function loadQuoteExecutionDispatchQueue() {
    void run("Fila de orcamentos aprovados", () => icemaxApi.quoteExecutionDispatchQueue(token || undefined));
  }

  function loadFieldFinalizationBoard() {
    void run("Board de finalizacao", () => icemaxApi.fieldFinalizationBoard(token || undefined));
  }

  function createDispatchAssignmentDecision() {
    void run("Aceite do tecnico", () =>
      icemaxApi.createDispatchAssignmentDecision({
        quoteId: "quote-002",
        serviceOrderId: "1049",
        technicianUserId: "tech-002",
        decision: "accepted",
        reason: "Tecnico confirmou janela e rota pelo painel.",
      }, token || undefined),
    );
  }

  function loadDispatchReadiness() {
    void run("Prontidao da OS", () => icemaxApi.dispatchReadiness("1048", "tech-001", token || undefined));
  }

  function loadDispatchDepartureCommunication() {
    void run("Aviso de deslocamento", () => icemaxApi.dispatchDepartureCommunication("1049", "tech-002", "quote-002", token || undefined));
  }

  function loadDispatchRouteTracking() {
    void run("Acompanhamento de rota", () => icemaxApi.dispatchRouteTracking("1049", "tech-002", "quote-002", token || undefined));
  }

  function loadDispatchArrivalCheckIn() {
    void run("Pacote de chegada", () => icemaxApi.dispatchArrivalCheckIn("1049", "tech-002", "quote-002", token || undefined));
  }

  function loadFieldExecutionStart() {
    void run("Inicio da execucao", () => icemaxApi.fieldExecutionStart("1049", "tech-002", "quote-002", token || undefined));
  }

  function loadFieldExecutionEvidence() {
    void run("Evidencias em campo", () => icemaxApi.fieldExecutionEvidence("1049", "tech-002", "quote-002", token || undefined));
  }

  function loadFieldExecutionCloseout() {
    void run("Fechamento tecnico", () => icemaxApi.fieldExecutionCloseout("1049", "tech-002", "quote-002", token || undefined));
  }

  function loadFieldCustomerSignature() {
    void run("Assinatura do cliente", () => icemaxApi.fieldCustomerSignature("1049", "tech-002", "quote-002", token || undefined));
  }

  function recordFieldCustomerSignature() {
    void run("Registrar assinatura", () =>
      icemaxApi.recordFieldCustomerSignature("1049", {
        quoteId: "quote-002",
        technicianUserId: "tech-002",
        responsibleName: "Cliente Decisor",
        responsibleRole: "Gerente da unidade",
        emailCopyToCustomer: false,
        acceptedTerms: true,
      }, token || undefined),
    );
  }

  function loadFieldCompletionEmail() {
    void run("E-mail de conclusao", () => icemaxApi.fieldCompletionEmail("1049", "tech-002", "quote-002", "false", token || undefined));
  }

  function queueFieldCompletionEmail() {
    void run("Enfileirar e-mail final", () =>
      icemaxApi.queueFieldCompletionEmail("1049", {
        quoteId: "quote-002",
        technicianUserId: "tech-002",
        emailCopyToCustomer: false,
        includeWarrantyTerms: true,
      }, token || undefined),
    );
  }

  function createVisitPreparation() {
    void run("Preparo da visita", () =>
      icemaxApi.createVisitPreparation({
        serviceOrderId: "1048",
        technicianUserId: "tech-001",
        includeVisualDiagnosis: true,
        includeCustomerPortalEvidence: true,
      }, token || undefined),
    );
  }

  function reserveServiceOrderParts() {
    void run("Reserva de pecas", () =>
      icemaxApi.reserveServiceOrderParts("1048", {
        technicianUserId: "tech-001",
        sourceLocation: "Almoxarifado",
        targetLocation: "Veiculo Rafael",
        requestedSkus: ["R410A", "CAP-45"],
      }, token || undefined),
    );
  }

  function loadLocations() {
    void run("Localizacao da equipe", () => icemaxApi.technicianLocations(token || undefined));
  }

  function loadFloorPlanOperationalView() {
    void run("Planta operacional", () => icemaxApi.floorPlanOperationalView("floor-001", token || undefined));
  }

  function improveText() {
    void run("Revisao IA", () =>
      icemaxApi.improveText({
        text: "limpei filtro e tava com pouco gas, precisa olhar vazamento",
        tone: "professional",
      }, token || undefined),
    );
  }

  function suggestCauses() {
    void run("Causas provaveis", () =>
      icemaxApi.suggestCauses({
        description: "serpentina congelada e cliente relata que nao gela",
        photoHints: ["gelo na evaporadora", "filtro sujo"],
        equipmentType: "split",
      }, token || undefined),
    );
  }

  function createVisualDiagnosisPackage() {
    void run("Diagnostico visual IA", () =>
      icemaxApi.createVisualDiagnosisPackage({
        serviceOrderId: "1048",
        equipmentType: "split piso teto",
        description: "Cliente relata que nao gela e foto mostra serpentina congelada.",
        photoHints: ["gelo na evaporadora", "filtro escurecido", "sem agua aparente no dreno"],
        symptoms: ["baixa refrigeracao", "ambiente critico", "vento fraco"],
      }, token || undefined),
    );
  }

  function reviewServiceOrderCompletion() {
    void run("Revisao de conclusao da OS", async () => {
      const results = await Promise.all([
        icemaxApi.serviceOrderCompletionReview("1048", token || undefined),
        icemaxApi.serviceOrderEvidenceManifest("1048", token || undefined),
      ]);

      return { checks: results.length, results };
    });
  }

  function loadPostServicePlan() {
    void run("Pos-atendimento", () => icemaxApi.postServicePlan("1048", token || undefined));
  }

  function loadServiceOrderWarrantyPackage() {
    void run("Garantia da OS", () => icemaxApi.serviceOrderWarrantyPackage("1048", token || undefined));
  }

  function loadServiceOrderManualPackage() {
    void run("Manual tecnico da OS", () => icemaxApi.serviceOrderManualPackage("1048", token || undefined));
  }

  function loadContractOpportunity() {
    void run("Oportunidade de contrato", () => icemaxApi.contractOpportunity("1048", token || undefined));
  }

  function loadContractProposal() {
    void run("Proposta de contrato", () => icemaxApi.contractProposal("1048", token || undefined));
  }

  function loadContractActivationPlan() {
    void run("Ativacao de contrato", () => icemaxApi.contractActivationPlan("1048", token || undefined));
  }

  function loadContractAcceptancePackage() {
    void run("Aceite de contrato", () => icemaxApi.contractAcceptancePackage("1048", token || undefined));
  }

  function activateAcceptedContract() {
    void run("Contrato ativo", () =>
      icemaxApi.activateContractAcceptance("1048", {
        acceptedByName: "Cliente Decisor",
        acceptedByDocument: "000.000.000-00",
        customerId: "customer-001",
        equipmentIds: ["equipment-001"],
        generateVisits: 4,
      }, token || undefined),
    );
  }

  function createPortalOrder() {
    void run("Portal do cliente", () =>
      icemaxApi.createPortalOrder({
        tenantSlug: "icemax",
        customerName: "Cliente Portal",
        customerEmail: "cliente.portal@local.dev",
        customerPhone: "+5500000000000",
        address: "Rua Teste, 100",
        equipmentType: "Split Hi Wall",
        equipmentLabel: "Sala principal",
        problemDescription: "Equipamento nao esta refrigerando adequadamente.",
        urgency: "high",
        allowWhatsapp: true,
      }),
    );
  }

  function loadCustomerTracking() {
    void run("Acompanhamento cliente", () => icemaxApi.customerOrderTracking("1048"));
  }

  function loadPublicTokenInventory() {
    void run("Inventario de links publicos", () =>
      icemaxApi.customerPortalPublicTokens(token || undefined, {
        status: publicTokenStatusFilter,
        scope: publicTokenScopeFilter || undefined,
      }).then((response) => {
        setPublicTokenInventory(response as PublicTokenInventoryResponse);
        return response;
      }),
    );
  }

  function revokePublicTokenRecordById(recordId: string, reason: string) {
    if (!window.confirm("Confirma revogar este link publico?")) {
      return;
    }

    void run("Revogar link publico", async () => {
      const response = await icemaxApi.revokeCustomerPortalPublicTokenRecord(recordId, { reason }, token || undefined);
      const inventory = await icemaxApi.customerPortalPublicTokens(token || undefined, {
        status: publicTokenStatusFilter,
        scope: publicTokenScopeFilter || undefined,
      });
      setPublicTokenInventory(inventory as PublicTokenInventoryResponse);
      return { revocation: response, inventory };
    });
  }

  function revokePublicTokenRecord(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const recordId = publicTokenRecordId.trim();
    const reason = publicTokenRevocationReason.trim();

    if (!recordId) {
      setStatus("Informe o ID do registro do link publico.");
      return;
    }

    if (reason.length < 3) {
      setStatus("Informe um motivo para a revogacao.");
      return;
    }

    if (!window.confirm("Confirma revogar este link publico?")) {
      return;
    }

    void run("Revogar link publico", () =>
      icemaxApi.revokeCustomerPortalPublicTokenRecord(recordId, { reason }, token || undefined).then((response) => {
        setPublicTokenRecordId("");
        return response;
      }),
    );
  }

  function loadQuoteApprovalPackage() {
    void run("Aprovacao de orcamento", () => icemaxApi.quoteApprovalPackage("quote-001", token || undefined));
  }

  function loadQuoteApprovalBoard() {
    void run("Board de orcamentos", () => icemaxApi.quoteApprovalBoard(token || undefined));
  }

  function createQuoteApprovalReminders() {
    void run("Lembretes de orcamento", () => icemaxApi.createQuoteApprovalReminders(token || undefined));
  }

  function loadQuoteCommunicationPackage() {
    void run("Comunicacao de orcamento", () => icemaxApi.quoteCommunicationPackage("quote-001", token || undefined));
  }

  function createQuoteCommunicationQueue() {
    void run("Fila de orcamento", () => icemaxApi.createQuoteCommunicationQueue("quote-001", token || undefined));
  }

  function loadQuoteDecisionHandoff() {
    void run("Handoff do orcamento", () => icemaxApi.quoteDecisionHandoff("quote-001", token || undefined));
  }

  function activateApprovedQuote() {
    void run("Ativar orcamento aprovado", () => icemaxApi.activateApprovedQuote("quote-002", token || undefined));
  }

  function loadQuoteExecutionReadiness() {
    void run("Prontidao do orcamento", () => icemaxApi.quoteExecutionReadiness("quote-002", token || undefined));
  }

  function loadQuoteApprovalTimeline() {
    void run("Linha do tempo do orcamento", () => icemaxApi.quoteApprovalTimeline("quote-002", token || undefined));
  }

  function createCustomerTrackingLink() {
    void run("Link acompanhamento", () => icemaxApi.createCustomerTrackingLink("1048"));
  }

  function createCustomerPortalAttachments() {
    void run("Anexos portal", () =>
      icemaxApi.createCustomerPortalAttachments("1048", {
        tenantSlug: "icemax",
        customerEmail: "cliente.portal@local.dev",
        attachments: [
          {
            fileName: "evaporadora-congelada.jpg",
            mimeType: "image/jpeg",
            sizeBytes: 420000,
            caption: "Foto mostra gelo na evaporadora e filtro sujo.",
          },
          {
            fileName: "ordem-compra.pdf",
            mimeType: "application/pdf",
            sizeBytes: 180000,
            caption: "Documento de autorizacao do cliente.",
          },
        ],
      }),
    );
  }

  function runBusinessSuite() {
    void run("Suite operacional", async () => {
      const now = new Date().toISOString();
      const dueDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
      const results = await Promise.all([
        icemaxApi.slaBoard(token || undefined),
        icemaxApi.createWarrantyTerm({
          serviceOrderId: "1048",
          customerId: "customer-001",
          coverageDays: 90,
          coverageText: "Garantia de mao de obra conforme condicoes do atendimento.",
          exclusions: ["mau uso", "intervencao de terceiros"],
        }, token || undefined),
        icemaxApi.createPmocPlan({
          customerId: "customer-001",
          name: "PMOC ClimaSul",
          responsibleTechnician: "Rafael Martins",
          startDate: now,
          equipmentIds: ["equipment-001"],
          inspectionFrequencyMonths: 3,
        }, token || undefined),
        icemaxApi.createInvoiceDraft({
          customerId: "customer-001",
          serviceOrderIds: ["1048"],
          dueDate,
          items: [{ description: "Atendimento corretivo", quantity: 1, unitPrice: 450 }],
        }, token || undefined),
        icemaxApi.onboardTechnician({
          name: "Tecnico Terceiro",
          phone: "+5500000000000",
          kind: "outsourced",
          specialties: ["split", "cassete"],
          documentStatus: "pending",
        }, token || undefined),
        icemaxApi.createMaintenanceWindow({
          contractId: "contract-001",
          customerId: "customer-001",
          preferredWeekday: 2,
          preferredPeriod: "morning",
          recurrenceMonths: 3,
          nextDate: dueDate,
        }, token || undefined),
        icemaxApi.recordSatisfactionSurvey({
          serviceOrderId: "1048",
          customerId: "customer-001",
          score: 9,
          comment: "Atendimento rapido.",
        }, token || undefined),
        icemaxApi.equipmentTimeline("equipment-001", token || undefined),
        icemaxApi.purchaseSuggestions(token || undefined),
        icemaxApi.createPurchaseRequest({
          partId: "part-001",
          quantity: 4,
          reason: "Reposicao de estoque minimo",
        }, token || undefined),
        icemaxApi.createReleaseReadiness({
          version: "0.5.5",
          checkedBy: "RAFAEL DA SILVA BEZEERA",
          includeSecurityReview: true,
        }, token || undefined),
      ]);

      return { modules: results.length, results };
    });
  }

  function loadContractCalendar() {
    void run("Calendario de contratos", () => icemaxApi.contractMaintenanceCalendar(token || undefined));
  }

  function loadContractBillingPlan() {
    void run("Plano financeiro", () => icemaxApi.contractBillingPlan("contract-001", token || undefined));
  }

  function loadServiceOrderCommunicationPackage() {
    void run("Comunicacao da OS", () => icemaxApi.serviceOrderCommunicationPackage("1048", token || undefined));
  }

  function loadContractCommunicationPackage() {
    void run("Comunicacao do contrato", () => icemaxApi.contractCommunicationPackage("contract-001", token || undefined));
  }

  function createServiceOrderCommunicationQueue() {
    void run("Fila comunicacao OS", () => icemaxApi.createServiceOrderCommunicationQueue("1048", token || undefined));
  }

  function createContractCommunicationQueue() {
    void run("Fila comunicacao contrato", () => icemaxApi.createContractCommunicationQueue("contract-001", token || undefined));
  }

  function loadCommunicationPersistentQueueReadiness() {
    void run("Prontidao fila comunicacao", () => icemaxApi.communicationPersistentQueueReadiness(token || undefined));
  }

  function loadCommunicationProviderActivationPlan() {
    void run("Ativacao provedores comunicacao", () => icemaxApi.communicationProviderActivationPlan(token || undefined));
  }

  function loadProviderCredentialVaultPolicy() {
    void run("Cofre credenciais provedores", () => icemaxApi.providerCredentialVaultPolicy(token || undefined));
  }

  function loadProviderObservabilityGate() {
    void run("Observabilidade provedores", () => icemaxApi.providerObservabilityGate(token || undefined));
  }

  function loadProviderGoLiveDecisionBoard() {
    void run("Decisao go-live provedores", () => icemaxApi.providerGoLiveDecisionBoard(token || undefined));
  }

  function loadProviderHomologationEvidencePack() {
    void run("Evidencias homologacao provedores", () => icemaxApi.providerHomologationEvidencePack(token || undefined));
  }

  function loadProviderFinalHomologationRunbook() {
    void run("Runbook final provedores", () => icemaxApi.providerFinalHomologationRunbook(token || undefined));
  }

  function loadProviderHomologationDecisionRecord() {
    void run("Ata homologacao provedores", () => icemaxApi.providerHomologationDecisionRecord(token || undefined));
  }

  function loadProviderReleaseFreezeChecklist() {
    void run("Freeze release provedores", () => icemaxApi.providerReleaseFreezeChecklist(token || undefined));
  }

  function loadProviderControlledReleaseSnapshot() {
    void run("Snapshot release provedores", () => icemaxApi.providerControlledReleaseSnapshot(token || undefined));
  }

  function loadDayCommandCenter() {
    void run("Comando do dia", () => icemaxApi.dayCommandCenter(token || undefined));
  }

  function loadProductAuditSnapshot() {
    void run("Auditoria geral do produto", () => icemaxApi.productAuditSnapshot(token || undefined));
  }

  function runEnterpriseSuite() {
    void run("Suite escala", async () => {
      const results = await Promise.all([
        icemaxApi.createWhitelabelBrand({ name: "ICEMAX Azul", description: "Tema piloto" }, token || undefined),
        icemaxApi.createPermissionPolicy({ name: "Politica Operacional", description: "Permissoes por papel" }, token || undefined),
        icemaxApi.createSecurityIncident({ name: "Tentativa suspeita", description: "Evento simulado" }, token || undefined),
        icemaxApi.createLgpdRequest({ customerId: "customer-001", requestType: "export", requesterEmail: "cliente@local.dev" }, token || undefined),
        icemaxApi.geocodePreview({ name: "Rua Teste, 100", description: "Endereco do cliente" }, token || undefined),
        icemaxApi.communicationPreview({ channel: "email", recipient: "cliente@local.dev", template: "os_concluida", variables: { os: "1048" } }, token || undefined),
        icemaxApi.communicationPersistentQueueReadiness(token || undefined),
        icemaxApi.communicationProviderActivationPlan(token || undefined),
        icemaxApi.providerCredentialVaultPolicy(token || undefined),
        icemaxApi.providerObservabilityGate(token || undefined),
        icemaxApi.providerGoLiveDecisionBoard(token || undefined),
        icemaxApi.providerHomologationEvidencePack(token || undefined),
        icemaxApi.providerFinalHomologationRunbook(token || undefined),
        icemaxApi.providerHomologationDecisionRecord(token || undefined),
        icemaxApi.providerReleaseFreezeChecklist(token || undefined),
        icemaxApi.providerControlledReleaseSnapshot(token || undefined),
        icemaxApi.communicationPreview({ channel: "whatsapp", recipient: "+5500000000000", template: "visita_agendada", variables: { data: "2026-05-10" } }, token || undefined),
        icemaxApi.communicationPreview({ channel: "push", recipient: "tech-001", template: "nova_os", variables: { os: "1048" } }, token || undefined),
        icemaxApi.createServiceCatalogItem({ name: "Higienizacao split", description: "Servico padrao" }, token || undefined),
        icemaxApi.createPriceBook({ name: "Tabela 2026", description: "Precos base" }, token || undefined),
        icemaxApi.executiveKpis(token || undefined),
        icemaxApi.createKmReimbursement({ technicianUserId: "tech-001", serviceOrderId: "1048", kilometers: 36, ratePerKm: 1.35 }, token || undefined),
        icemaxApi.createTechnicianPayable({ technicianUserId: "tech-001", serviceOrderIds: ["1048"], grossAmount: 300, discountAmount: 0 }, token || undefined),
        icemaxApi.createContractRenewal({ contractId: "contract-001", proposedRecurrenceMonths: 3, proposedValue: 1200 }, token || undefined),
        icemaxApi.customerHealth("customer-001", token || undefined),
        icemaxApi.equipmentDepreciation("equipment-001", token || undefined),
        icemaxApi.createTrainingChecklist({ name: "Treinamento tecnico", description: "Checklist de integracao" }, token || undefined),
        icemaxApi.createManualImportJob({ name: "Importacao Carrier", description: "Lote de manuais" }, token || undefined),
        icemaxApi.createBackupPlan({ name: "Backup diario", frequency: "daily", retentionDays: 30 }, token || undefined),
        icemaxApi.createIncidentPlaybook({ name: "Falha API", description: "Resposta a incidente" }, token || undefined),
      ]);

      return { modules: results.length, results };
    });
  }

  function runAccelerationSuite() {
    void run("99 lotes acelerados", () => icemaxApi.runAllAccelerationLots(token || undefined));
  }

  function runPlatformCheck() {
    void run("Diagnostico plataforma", async () => {
      const results = await Promise.all([
        icemaxApi.platformReadiness(token || undefined),
        icemaxApi.platformModules(token || undefined),
        icemaxApi.platformRoles(token || undefined),
        icemaxApi.platformDiagnostics(token || undefined),
        icemaxApi.mobileOfflineEscalations(token || undefined),
        icemaxApi.preReleaseGate(token || undefined),
        icemaxApi.productionReadiness(token || undefined),
        icemaxApi.productAuditSnapshot(token || undefined),
        icemaxApi.endOfDaySnapshot(token || undefined),
      ]);

      return { checks: results.length, results };
    });
  }

  function loadMobileOfflineEscalations() {
    void run("Pendencias offline bloqueadas", () =>
      icemaxApi.mobileOfflineEscalations(token || undefined).then((response) => {
        setMobileOfflineEscalations(response as MobileOfflineEscalationResponse);
        return response;
      }),
    );
  }

  function loadMobileOfflineAssistedRetryPermissions() {
    void run("Permissoes do reenvio offline", () =>
      icemaxApi.mobileOfflineAssistedRetryPermissions(token || undefined),
    );
  }

  function loadMobileOfflineAssistedRetryProductionGate() {
    void run("Gate de producao do reenvio offline", () =>
      icemaxApi.mobileOfflineAssistedRetryProductionGate(token || undefined),
    );
  }

  function loadMobileOfflineAssistedRetryAuditContract() {
    void run("Contrato de auditoria do reenvio offline", () =>
      icemaxApi.mobileOfflineAssistedRetryAuditContract(token || undefined),
    );
  }

  function loadMobileOfflineAssistedRetryExecutiveSummary() {
    void run("Resumo executivo do reenvio offline", () =>
      icemaxApi.mobileOfflineAssistedRetryExecutiveSummary(token || undefined),
    );
  }

  function loadMobileOfflineAssistedRetryActionPlan() {
    void run("Plano de acao do reenvio offline", () =>
      icemaxApi.mobileOfflineAssistedRetryActionPlan(token || undefined),
    );
  }

  function loadMobileOfflineAssistedRetryDailyCommand() {
    void run("Comando diario do reenvio offline", () =>
      icemaxApi.mobileOfflineAssistedRetryDailyCommand(token || undefined),
    );
  }

  function loadMobileOfflineAssistedRetryDryRunBatch() {
    void run("Lote dry-run do reenvio offline", () =>
      icemaxApi.mobileOfflineAssistedRetryDryRunBatch(token || undefined),
    );
  }

  function loadMobileOfflineAssistedRetryEvidencePackage() {
    void run("Evidencias do reenvio offline", () =>
      icemaxApi.mobileOfflineAssistedRetryEvidencePackage(token || undefined),
    );
  }

  function loadMobileOfflineAssistedRetryFinalHomologation() {
    void run("Homologacao final do reenvio offline", () =>
      icemaxApi.mobileOfflineAssistedRetryFinalHomologation(token || undefined),
    );
  }

  function loadMobileOfflineAssistedRetryControlledRelease() {
    void run("Liberacao controlada do reenvio offline", () =>
      icemaxApi.mobileOfflineAssistedRetryControlledRelease(token || undefined),
    );
  }

  function loadMobileOfflineAssistedRetryProductionReadiness() {
    void run("Prontidao de producao do reenvio offline", () =>
      icemaxApi.mobileOfflineAssistedRetryProductionReadiness(token || undefined),
    );
  }

  function loadMobileOfflineAssistedRetryInfrastructureBacklog() {
    void run("Infra pendente do reenvio offline", () =>
      icemaxApi.mobileOfflineAssistedRetryInfrastructureBacklog(token || undefined),
    );
  }

  function loadMobileOfflineAssistedRetryProviderCostPlan() {
    void run("Custos e provedores do reenvio offline", () =>
      icemaxApi.mobileOfflineAssistedRetryProviderCostPlan(token || undefined),
    );
  }

  function loadMobileOfflineAssistedRetryProviderActivationGate() {
    void run("Gate de ativacao de provedores", () =>
      icemaxApi.mobileOfflineAssistedRetryProviderActivationGate(token || undefined),
    );
  }

  function loadMobileOfflineAssistedRetryProviderHomologationRunbook() {
    void run("Runbook de homologacao de provedores", () =>
      icemaxApi.mobileOfflineAssistedRetryProviderHomologationRunbook(token || undefined),
    );
  }

  function loadMobileOfflineAssistedRetryProviderEvidenceBoard() {
    void run("Evidencias de homologacao de provedores", () =>
      icemaxApi.mobileOfflineAssistedRetryProviderEvidenceBoard(token || undefined),
    );
  }

  function loadMobileOfflineAssistedRetryTenantActivationDecision() {
    void run("Decisao de ativacao por tenant", () =>
      icemaxApi.mobileOfflineAssistedRetryTenantActivationDecision(token || undefined),
    );
  }

  function loadMobileOfflineAssistedRetryWhitelabelRolloutPlan() {
    void run("Rollout whitelabel do reenvio offline", () =>
      icemaxApi.mobileOfflineAssistedRetryWhitelabelRolloutPlan(token || undefined),
    );
  }

  function loadMobileOfflineAssistedRetryWhitelabelOnboardingChecklist() {
    void run("Checklist de onboarding whitelabel", () =>
      icemaxApi.mobileOfflineAssistedRetryWhitelabelOnboardingChecklist(token || undefined),
    );
  }

  function loadMobileOfflineAssistedRetryWhitelabelOperationalHandoff() {
    void run("Handoff operacional whitelabel", () =>
      icemaxApi.mobileOfflineAssistedRetryWhitelabelOperationalHandoff(token || undefined),
    );
  }

  function loadMobileOfflineAssistedRetryWhitelabelGoLiveReadiness() {
    void run("Prontidao de go-live whitelabel", () =>
      icemaxApi.mobileOfflineAssistedRetryWhitelabelGoLiveReadiness(token || undefined),
    );
  }

  function loadMobileOfflineAssistedRetryWhitelabelPostGoLivePlan() {
    void run("Plano pos-go-live whitelabel", () =>
      icemaxApi.mobileOfflineAssistedRetryWhitelabelPostGoLivePlan(token || undefined),
    );
  }

  function loadMobileOfflineAssistedRetryWhitelabelTenantHealthScore() {
    void run("Health score do tenant whitelabel", () =>
      icemaxApi.mobileOfflineAssistedRetryWhitelabelTenantHealthScore(token || undefined),
    );
  }

  function loadMobileOfflineAssistedRetryWhitelabelContinuousImprovement() {
    void run("Melhoria continua whitelabel", () =>
      icemaxApi.mobileOfflineAssistedRetryWhitelabelContinuousImprovement(token || undefined),
    );
  }

  function loadMobileOfflineAssistedRetryWhitelabelScaleDecision() {
    void run("Decisao de escala whitelabel", () =>
      icemaxApi.mobileOfflineAssistedRetryWhitelabelScaleDecision(token || undefined),
    );
  }

  function loadMobileOfflineAssistedRetryWhitelabelSecondTenantPreOnboarding() {
    void run("Pre-onboarding segundo tenant", () =>
      icemaxApi.mobileOfflineAssistedRetryWhitelabelSecondTenantPreOnboarding(token || undefined),
    );
  }

  function loadMobileOfflineAssistedRetryWhitelabelTenantCostMatrix() {
    void run("Matriz de custos por tenant", () =>
      icemaxApi.mobileOfflineAssistedRetryWhitelabelTenantCostMatrix(token || undefined),
    );
  }

  function loadMobileOfflineAssistedRetryWhitelabelOperationalContractPack() {
    void run("Pacote contratual whitelabel", () =>
      icemaxApi.mobileOfflineAssistedRetryWhitelabelOperationalContractPack(token || undefined),
    );
  }

  function loadMobileOfflineAssistedRetryWhitelabelSupportSlaGate() {
    void run("Gate de suporte e SLA whitelabel", () =>
      icemaxApi.mobileOfflineAssistedRetryWhitelabelSupportSlaGate(token || undefined),
    );
  }

  function loadMobileOfflineAssistedRetryWhitelabelSecurityPrivacyGate() {
    void run("Gate de seguranca e LGPD whitelabel", () =>
      icemaxApi.mobileOfflineAssistedRetryWhitelabelSecurityPrivacyGate(token || undefined),
    );
  }

  function loadMobileOfflineAssistedRetryWhitelabelPartnerGoLiveAcceptance() {
    void run("Aceite de go-live parceiro", () =>
      icemaxApi.mobileOfflineAssistedRetryWhitelabelPartnerGoLiveAcceptance(token || undefined),
    );
  }

  function loadMobileOfflineAssistedRetryWhitelabelEndOfDayClosure() {
    void run("Encerramento do dia whitelabel", () =>
      icemaxApi.mobileOfflineAssistedRetryWhitelabelEndOfDayClosure(token || undefined),
    );
  }

  function loadMobileOfflineAssistedRetryWhitelabelMorningCommand() {
    void run("Comando da manha whitelabel", () =>
      icemaxApi.mobileOfflineAssistedRetryWhitelabelMorningCommand(token || undefined),
    );
  }

  function loadMobileOfflineAssistedRetryWhitelabelProductionExecutionMatrix() {
    void run("Matriz de producao whitelabel", () =>
      icemaxApi.mobileOfflineAssistedRetryWhitelabelProductionExecutionMatrix(token || undefined),
    );
  }

  function reviewMobileOfflineEscalation(recordId: string, decision: string) {
    void run("Revisar pendencia offline", () =>
      icemaxApi.reviewMobileOfflineEscalation(recordId, {
        decision,
        reviewedBy: "RAFAEL DA SILVA BEZEERA",
        note: decision === "release_assisted_retry"
          ? "Pendencia conferida e liberada para reenvio assistido."
          : "Pendencia mantida para tratamento operacional.",
      }, token || undefined),
    );
  }

  function prepareMobileOfflineAssistedRetry(recordId: string) {
    void run("Preparar reenvio assistido", () =>
      icemaxApi.prepareMobileOfflineAssistedRetry(recordId, {
        approvedBy: "RAFAEL DA SILVA BEZEERA",
        reason: "Pendencia revisada pelo painel antes do reenvio assistido.",
      }, token || undefined),
    );
  }

  function runMobileOfflineAssistedRetryDryRun(recordId: string) {
    void run("Simular reenvio assistido", () =>
      icemaxApi.runMobileOfflineAssistedRetryDryRun(recordId, {
        executedBy: "RAFAEL DA SILVA BEZEERA",
        idempotencyKey: `mobile-offline-retry:${recordId}`,
      }, token || undefined),
    );
  }

  function loadMobileOfflineAssistedRetryReadiness(recordId: string) {
    void run("Prontidao do reenvio offline", () =>
      icemaxApi.mobileOfflineAssistedRetryReadiness(recordId, token || undefined),
    );
  }

  function loadMobileOfflineEscalationTimeline(recordId: string) {
    void run("Timeline pendencia offline", () =>
      icemaxApi.mobileOfflineEscalationTimeline(recordId, token || undefined),
    );
  }

  function runHomologationCheck() {
    void run("Homologacao", async () => {
      const results = await Promise.all([
        icemaxApi.apiContracts(token || undefined),
        icemaxApi.homologationScenarios(token || undefined),
        icemaxApi.runHomologationScenario("os-completa", token || undefined),
        icemaxApi.observabilitySummary(token || undefined),
        icemaxApi.demoDataSnapshot(token || undefined),
        icemaxApi.storageReadiness(token || undefined),
        icemaxApi.customerPortalExternalSharingPolicy("icemax"),
      ]);

      return { checks: results.length, results };
    });
  }

  function runMobileOfflineRetryHomologation() {
    void run("Homologacao reenvio offline", () =>
      icemaxApi.runHomologationScenario("reenvio-offline-real", token || undefined),
    );
  }

  function runDatabaseTransitionCheck() {
    void run("Virada para banco", async () => {
      const results = await Promise.all([
        icemaxApi.databaseCutoverPlan(token || undefined),
        icemaxApi.databaseSchemaSummary(token || undefined),
        icemaxApi.databaseSeedPlan(token || undefined),
        icemaxApi.databaseEnvironmentChecklist(token || undefined),
        icemaxApi.dataReadinessBoard(token || undefined),
        icemaxApi.tenantIsolationGate(token || undefined),
        icemaxApi.databaseRollbackDrill(token || undefined),
        icemaxApi.databaseIncrementalMigrationMatrix(token || undefined),
        icemaxApi.prismaSmokeTest(token || undefined),
      ]);

      return { checks: results.length, results };
    });
  }

  function filterOrders(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    void run("Filtro de OS", () =>
      icemaxApi.serviceOrders(token || undefined, {
        status: String(form.get("status")) || undefined,
        priority: String(form.get("priority")) || undefined,
        customer: String(form.get("customer")) || undefined,
      }),
    );
  }

  const actionGroups = [
    {
      title: "Comando e auditoria",
      detail: "Visao executiva, diagnostico, homologacao e arquivos.",
      actions: [
        { label: "Auditoria produto", onClick: loadProductAuditSnapshot },
        { label: "Comando do dia", onClick: loadDayCommandCenter },
        { label: "Diagnostico", onClick: runPlatformCheck },
        { label: "Homologacao", onClick: runHomologationCheck },
        { label: "Virada banco", onClick: runDatabaseTransitionCheck },
        { label: "Ver auditoria", onClick: loadAudit },
        { label: "Enviar arquivo teste", onClick: uploadSample },
      ],
    },
    {
      title: "OS em campo",
      detail: "Despacho, rota, execucao, evidencias, assinatura e fechamento.",
      actions: [
        { label: "Ver equipe no mapa", onClick: loadLocations },
        { label: "Planta operacional", onClick: loadFloorPlanOperationalView },
        { label: "Otimizar rota", onClick: optimizeRoute },
        { label: "Despacho inteligente", onClick: loadDispatchRecommendations },
        { label: "Aceite tecnico", onClick: createDispatchAssignmentDecision },
        { label: "Prontidao da OS", onClick: loadDispatchReadiness },
        { label: "Aviso deslocamento", onClick: loadDispatchDepartureCommunication },
        { label: "Acompanhar rota", onClick: loadDispatchRouteTracking },
        { label: "Pacote chegada", onClick: loadDispatchArrivalCheckIn },
        { label: "Inicio execucao", onClick: loadFieldExecutionStart },
        { label: "Evidencias campo", onClick: loadFieldExecutionEvidence },
        { label: "Fechamento campo", onClick: loadFieldExecutionCloseout },
        { label: "Assinatura cliente", onClick: loadFieldCustomerSignature },
        { label: "Registrar assinatura", onClick: recordFieldCustomerSignature },
        { label: "Board finalizacao", onClick: loadFieldFinalizationBoard },
      ],
    },
    {
      title: "Cliente, portal e pos-atendimento",
      detail: "Acompanhamento publico, garantia, manuais, anexos e relacionamento.",
      actions: [
        { label: "OS pelo cliente", onClick: createPortalOrder },
        { label: "Acompanhar OS cliente", onClick: loadCustomerTracking },
        { label: "Link acompanhamento", onClick: createCustomerTrackingLink },
        { label: "Anexos portal", onClick: createCustomerPortalAttachments },
        { label: "Inventario links publicos", onClick: loadPublicTokenInventory },
        { label: "Pos-atendimento", onClick: loadPostServicePlan },
        { label: "Garantia OS", onClick: loadServiceOrderWarrantyPackage },
        { label: "Manual OS", onClick: loadServiceOrderManualPackage },
      ],
    },
    {
      title: "IA, preparo e estoque",
      detail: "Revisao profissional, diagnostico assistido, pecas e preparo da visita.",
      actions: [
        { label: "Preparo da visita", onClick: createVisitPreparation },
        { label: "Reservar pecas", onClick: reserveServiceOrderParts },
        { label: "Revisar texto IA", onClick: improveText },
        { label: "Sugerir causas", onClick: suggestCauses },
        { label: "Diagnostico visual IA", onClick: createVisualDiagnosisPackage },
        { label: "Revisar conclusao OS", onClick: reviewServiceOrderCompletion },
      ],
    },
    {
      title: "Orcamentos e contratos",
      detail: "Aprovacao, comunicacao, ativacao e recorrencia contratual.",
      actions: [
        { label: "Board orcamentos", onClick: loadQuoteApprovalBoard },
        { label: "Lembretes orcamento", onClick: createQuoteApprovalReminders },
        { label: "Aprovar orcamento", onClick: loadQuoteApprovalPackage },
        { label: "Comunicar orcamento", onClick: loadQuoteCommunicationPackage },
        { label: "Fila do orcamento", onClick: createQuoteCommunicationQueue },
        { label: "Handoff orcamento", onClick: loadQuoteDecisionHandoff },
        { label: "Ativar orcamento", onClick: activateApprovedQuote },
        { label: "Prontidao orcamento", onClick: loadQuoteExecutionReadiness },
        { label: "Timeline orcamento", onClick: loadQuoteApprovalTimeline },
        { label: "Fila orcamentos aprovados", onClick: loadQuoteExecutionDispatchQueue },
        { label: "Oportunidade contrato", onClick: loadContractOpportunity },
        { label: "Proposta contrato", onClick: loadContractProposal },
        { label: "Ativar contrato", onClick: loadContractActivationPlan },
        { label: "Aceite contrato", onClick: loadContractAcceptancePackage },
        { label: "Contrato aceito", onClick: activateAcceptedContract },
        { label: "Calendario contratos", onClick: loadContractCalendar },
        { label: "Financeiro contrato", onClick: loadContractBillingPlan },
      ],
    },
    {
      title: "Comunicacao e provedores",
      detail: "E-mail, WhatsApp, fila persistente, cofre, observabilidade e freeze.",
      actions: [
        { label: "E-mail conclusao", onClick: loadFieldCompletionEmail },
        { label: "Enfileirar e-mail", onClick: queueFieldCompletionEmail },
        { label: "Comunicacao OS", onClick: loadServiceOrderCommunicationPackage },
        { label: "Comunicacao contrato", onClick: loadContractCommunicationPackage },
        { label: "Fila comunicacao OS", onClick: createServiceOrderCommunicationQueue },
        { label: "Fila comunicacao contrato", onClick: createContractCommunicationQueue },
        { label: "Fila persistente comunicacao", onClick: loadCommunicationPersistentQueueReadiness },
        { label: "Ativar provedores", onClick: loadCommunicationProviderActivationPlan },
        { label: "Cofre credenciais", onClick: loadProviderCredentialVaultPolicy },
        { label: "Observabilidade provedores", onClick: loadProviderObservabilityGate },
        { label: "Go-live provedores", onClick: loadProviderGoLiveDecisionBoard },
        { label: "Evidencias provedores", onClick: loadProviderHomologationEvidencePack },
        { label: "Runbook provedores", onClick: loadProviderFinalHomologationRunbook },
        { label: "Ata provedores", onClick: loadProviderHomologationDecisionRecord },
        { label: "Freeze provedores", onClick: loadProviderReleaseFreezeChecklist },
        { label: "Snapshot provedores", onClick: loadProviderControlledReleaseSnapshot },
      ],
    },
    {
      title: "Offline tecnico",
      detail: "Fila bloqueada, permissao, dry-run, evidencias e homologacao offline.",
      actions: [
        { label: "Pendencias offline", onClick: loadMobileOfflineEscalations },
        { label: "Permissoes reenvio offline", onClick: loadMobileOfflineAssistedRetryPermissions },
        { label: "Gate reenvio offline", onClick: loadMobileOfflineAssistedRetryProductionGate },
        { label: "Auditoria reenvio offline", onClick: loadMobileOfflineAssistedRetryAuditContract },
        { label: "Resumo reenvio offline", onClick: loadMobileOfflineAssistedRetryExecutiveSummary },
        { label: "Plano reenvio offline", onClick: loadMobileOfflineAssistedRetryActionPlan },
        { label: "Comando reenvio offline", onClick: loadMobileOfflineAssistedRetryDailyCommand },
        { label: "Lote dry-run offline", onClick: loadMobileOfflineAssistedRetryDryRunBatch },
        { label: "Evidencias reenvio offline", onClick: loadMobileOfflineAssistedRetryEvidencePackage },
        { label: "Homologacao final offline", onClick: loadMobileOfflineAssistedRetryFinalHomologation },
        { label: "Liberacao offline", onClick: loadMobileOfflineAssistedRetryControlledRelease },
        { label: "Prontidao producao offline", onClick: loadMobileOfflineAssistedRetryProductionReadiness },
        { label: "Infra reenvio offline", onClick: loadMobileOfflineAssistedRetryInfrastructureBacklog },
        { label: "Homologar reenvio offline", onClick: runMobileOfflineRetryHomologation },
      ],
    },
    {
      title: "Whitelabel e escala",
      detail: "Segundo tenant, custo, SLA, LGPD, contrato e go-live parceiro.",
      actions: [
        { label: "Rodar suite operacional", onClick: runBusinessSuite },
        { label: "Rodar suite escala", onClick: runEnterpriseSuite },
        { label: "Rodar 99 lotes", onClick: runAccelerationSuite },
        { label: "Custos provedores offline", onClick: loadMobileOfflineAssistedRetryProviderCostPlan },
        { label: "Gate provedores offline", onClick: loadMobileOfflineAssistedRetryProviderActivationGate },
        { label: "Homologar provedores offline", onClick: loadMobileOfflineAssistedRetryProviderHomologationRunbook },
        { label: "Evidencias provedores offline", onClick: loadMobileOfflineAssistedRetryProviderEvidenceBoard },
        { label: "Decisao tenant offline", onClick: loadMobileOfflineAssistedRetryTenantActivationDecision },
        { label: "Rollout whitelabel offline", onClick: loadMobileOfflineAssistedRetryWhitelabelRolloutPlan },
        { label: "Onboarding whitelabel offline", onClick: loadMobileOfflineAssistedRetryWhitelabelOnboardingChecklist },
        { label: "Handoff whitelabel offline", onClick: loadMobileOfflineAssistedRetryWhitelabelOperationalHandoff },
        { label: "Go-live whitelabel offline", onClick: loadMobileOfflineAssistedRetryWhitelabelGoLiveReadiness },
        { label: "Pos-go-live whitelabel", onClick: loadMobileOfflineAssistedRetryWhitelabelPostGoLivePlan },
        { label: "Health tenant whitelabel", onClick: loadMobileOfflineAssistedRetryWhitelabelTenantHealthScore },
        { label: "Melhoria whitelabel", onClick: loadMobileOfflineAssistedRetryWhitelabelContinuousImprovement },
        { label: "Escala whitelabel", onClick: loadMobileOfflineAssistedRetryWhitelabelScaleDecision },
        { label: "Pre-onboarding tenant", onClick: loadMobileOfflineAssistedRetryWhitelabelSecondTenantPreOnboarding },
        { label: "Custos tenant", onClick: loadMobileOfflineAssistedRetryWhitelabelTenantCostMatrix },
        { label: "Contrato whitelabel", onClick: loadMobileOfflineAssistedRetryWhitelabelOperationalContractPack },
        { label: "SLA whitelabel", onClick: loadMobileOfflineAssistedRetryWhitelabelSupportSlaGate },
        { label: "LGPD whitelabel", onClick: loadMobileOfflineAssistedRetryWhitelabelSecurityPrivacyGate },
        { label: "Aceite parceiro", onClick: loadMobileOfflineAssistedRetryWhitelabelPartnerGoLiveAcceptance },
        { label: "Encerrar dia whitelabel", onClick: loadMobileOfflineAssistedRetryWhitelabelEndOfDayClosure },
        { label: "Comando manha whitelabel", onClick: loadMobileOfflineAssistedRetryWhitelabelMorningCommand },
        { label: "Matriz producao whitelabel", onClick: loadMobileOfflineAssistedRetryWhitelabelProductionExecutionMatrix },
      ],
    },
  ];

  return (
    <div className="opsConsole">
      <div className="opsHeader">
        <div>
          <p className="eyebrow">Console operacional</p>
          <h2>Cadastros, filtros, arquivos e auditoria</h2>
          <span>{status}</span>
        </div>
        <input value={token} onChange={(event) => setToken(event.target.value)} placeholder="Token JWT opcional" aria-label="Token JWT opcional" />
      </div>

      <div className="formGrid">
        <form onSubmit={submitCustomer}>
          <strong>Novo cliente</strong>
          <input name="name" placeholder="Nome" defaultValue="Condominio Central" />
          <input name="email" placeholder="E-mail" defaultValue="cliente@local.dev" />
          <input name="phone" placeholder="Telefone" defaultValue="+5500000000000" />
          <button type="submit">Criar cliente</button>
        </form>

        <form onSubmit={submitOrder}>
          <strong>Nova OS</strong>
          <input name="customerId" placeholder="Cliente ID" defaultValue="customer-001" />
          <input name="equipmentId" placeholder="Equipamento ID" defaultValue="equipment-001" />
          <input name="title" placeholder="Titulo" defaultValue="Atendimento corretivo" />
          <input name="description" placeholder="Descricao" defaultValue="Cliente relata baixa refrigeracao." />
          <select name="priority" defaultValue="high">
            <option value="normal">Normal</option>
            <option value="high">Alta</option>
            <option value="emergency">Emergencia</option>
          </select>
          <button type="submit">Criar OS</button>
        </form>

        <form onSubmit={submitQr}>
          <strong>Etiqueta QR</strong>
          <input name="equipmentCode" placeholder="Codigo" defaultValue="ICM-AC-0100" />
          <input name="equipment" placeholder="Equipamento" defaultValue="Split Hi Wall 18.000 BTUs" />
          <input name="customer" placeholder="Cliente" defaultValue="ClimaSul Hotel" />
          <input name="installLocation" placeholder="Local" defaultValue="Apartamento 204" />
          <button type="submit">Gerar etiqueta</button>
        </form>

        <form onSubmit={filterOrders}>
          <strong>Filtro de OS</strong>
          <input name="customer" placeholder="Cliente contem" />
          <select name="status" defaultValue="">
            <option value="">Todos os status</option>
            <option value="scheduled">Agendada</option>
            <option value="en_route">Em rota</option>
            <option value="in_progress">Em atendimento</option>
            <option value="completed">Concluida</option>
          </select>
          <select name="priority" defaultValue="">
            <option value="">Todas prioridades</option>
            <option value="normal">Normal</option>
            <option value="high">Alta</option>
            <option value="emergency">Emergencia</option>
          </select>
          <button type="submit">Buscar OS</button>
        </form>

        <form onSubmit={revokePublicTokenRecord}>
          <strong>Revogar link publico</strong>
          <input
            name="publicTokenRecordId"
            placeholder="ID do registro no inventario"
            value={publicTokenRecordId}
            onChange={(event) => setPublicTokenRecordId(event.target.value)}
          />
          <input
            name="publicTokenRevocationReason"
            placeholder="Motivo da revogacao"
            value={publicTokenRevocationReason}
            onChange={(event) => setPublicTokenRevocationReason(event.target.value)}
          />
          <button type="submit">Revogar link</button>
        </form>
      </div>

      <div className="opsJourneyGrid">
        {actionGroups.map((group) => (
          <section className="opsJourney" key={group.title}>
            <div className="opsJourneyHeader">
              <div>
                <strong>{group.title}</strong>
                <span>{group.detail}</span>
              </div>
              <small>{group.actions.length} comandos</small>
            </div>
            <div className="opsActions">
              {group.actions.map((action) => (
                <button type="button" className="secondary" onClick={action.onClick} key={action.label}>
                  {action.label}
                </button>
              ))}
            </div>
          </section>
        ))}
      </div>

      <div className="opsActions legacyActions" aria-hidden="true">
        <button type="button" className="secondary" onClick={uploadSample}>Enviar arquivo teste</button>
        <button type="button" className="secondary" onClick={loadAudit}>Ver auditoria</button>
        <button type="button" className="secondary" onClick={loadLocations}>Ver equipe no mapa</button>
        <button type="button" className="secondary" onClick={loadFloorPlanOperationalView}>Planta operacional</button>
        <button type="button" className="secondary" onClick={optimizeRoute}>Otimizar rota</button>
        <button type="button" className="secondary" onClick={loadDispatchRecommendations}>Despacho inteligente</button>
        <button type="button" className="secondary" onClick={loadQuoteExecutionDispatchQueue}>Fila orcamentos aprovados</button>
        <button type="button" className="secondary" onClick={loadFieldFinalizationBoard}>Board finalizacao</button>
        <button type="button" className="secondary" onClick={createDispatchAssignmentDecision}>Aceite tecnico</button>
        <button type="button" className="secondary" onClick={loadDispatchReadiness}>Prontidao da OS</button>
        <button type="button" className="secondary" onClick={loadDispatchDepartureCommunication}>Aviso deslocamento</button>
        <button type="button" className="secondary" onClick={loadDispatchRouteTracking}>Acompanhar rota</button>
        <button type="button" className="secondary" onClick={loadDispatchArrivalCheckIn}>Pacote chegada</button>
        <button type="button" className="secondary" onClick={loadFieldExecutionStart}>Inicio execucao</button>
        <button type="button" className="secondary" onClick={loadFieldExecutionEvidence}>Evidencias campo</button>
        <button type="button" className="secondary" onClick={loadFieldExecutionCloseout}>Fechamento campo</button>
        <button type="button" className="secondary" onClick={loadFieldCustomerSignature}>Assinatura cliente</button>
        <button type="button" className="secondary" onClick={recordFieldCustomerSignature}>Registrar assinatura</button>
        <button type="button" className="secondary" onClick={loadFieldCompletionEmail}>E-mail conclusao</button>
        <button type="button" className="secondary" onClick={queueFieldCompletionEmail}>Enfileirar e-mail</button>
        <button type="button" className="secondary" onClick={createVisitPreparation}>Preparo da visita</button>
        <button type="button" className="secondary" onClick={reserveServiceOrderParts}>Reservar pecas</button>
        <button type="button" className="secondary" onClick={improveText}>Revisar texto IA</button>
        <button type="button" className="secondary" onClick={suggestCauses}>Sugerir causas</button>
        <button type="button" className="secondary" onClick={createVisualDiagnosisPackage}>Diagnostico visual IA</button>
        <button type="button" className="secondary" onClick={reviewServiceOrderCompletion}>Revisar conclusao OS</button>
        <button type="button" className="secondary" onClick={loadPostServicePlan}>Pos-atendimento</button>
        <button type="button" className="secondary" onClick={loadServiceOrderWarrantyPackage}>Garantia OS</button>
        <button type="button" className="secondary" onClick={loadServiceOrderManualPackage}>Manual OS</button>
        <button type="button" className="secondary" onClick={loadContractOpportunity}>Oportunidade contrato</button>
        <button type="button" className="secondary" onClick={loadContractProposal}>Proposta contrato</button>
        <button type="button" className="secondary" onClick={loadContractActivationPlan}>Ativar contrato</button>
        <button type="button" className="secondary" onClick={loadContractAcceptancePackage}>Aceite contrato</button>
        <button type="button" className="secondary" onClick={activateAcceptedContract}>Contrato aceito</button>
        <button type="button" className="secondary" onClick={createPortalOrder}>OS pelo cliente</button>
        <button type="button" className="secondary" onClick={loadCustomerTracking}>Acompanhar OS cliente</button>
        <button type="button" className="secondary" onClick={loadPublicTokenInventory}>Inventario links publicos</button>
        <button type="button" className="secondary" onClick={loadQuoteApprovalBoard}>Board orcamentos</button>
        <button type="button" className="secondary" onClick={createQuoteApprovalReminders}>Lembretes orcamento</button>
        <button type="button" className="secondary" onClick={loadQuoteApprovalPackage}>Aprovar orcamento</button>
        <button type="button" className="secondary" onClick={loadQuoteCommunicationPackage}>Comunicar orcamento</button>
        <button type="button" className="secondary" onClick={createQuoteCommunicationQueue}>Fila do orcamento</button>
        <button type="button" className="secondary" onClick={loadQuoteDecisionHandoff}>Handoff orcamento</button>
        <button type="button" className="secondary" onClick={activateApprovedQuote}>Ativar orcamento</button>
        <button type="button" className="secondary" onClick={loadQuoteExecutionReadiness}>Prontidao orcamento</button>
        <button type="button" className="secondary" onClick={loadQuoteApprovalTimeline}>Timeline orcamento</button>
        <button type="button" className="secondary" onClick={createCustomerTrackingLink}>Link acompanhamento</button>
        <button type="button" className="secondary" onClick={createCustomerPortalAttachments}>Anexos portal</button>
        <button type="button" className="secondary" onClick={loadContractCalendar}>Calendario contratos</button>
        <button type="button" className="secondary" onClick={loadContractBillingPlan}>Financeiro contrato</button>
        <button type="button" className="secondary" onClick={loadServiceOrderCommunicationPackage}>Comunicacao OS</button>
        <button type="button" className="secondary" onClick={loadContractCommunicationPackage}>Comunicacao contrato</button>
        <button type="button" className="secondary" onClick={createServiceOrderCommunicationQueue}>Fila comunicacao OS</button>
        <button type="button" className="secondary" onClick={createContractCommunicationQueue}>Fila comunicacao contrato</button>
        <button type="button" className="secondary" onClick={loadCommunicationPersistentQueueReadiness}>Fila persistente comunicacao</button>
        <button type="button" className="secondary" onClick={loadCommunicationProviderActivationPlan}>Ativar provedores</button>
        <button type="button" className="secondary" onClick={loadProviderCredentialVaultPolicy}>Cofre credenciais</button>
        <button type="button" className="secondary" onClick={loadProviderObservabilityGate}>Observabilidade provedores</button>
        <button type="button" className="secondary" onClick={loadProviderGoLiveDecisionBoard}>Go-live provedores</button>
        <button type="button" className="secondary" onClick={loadProviderHomologationEvidencePack}>Evidencias provedores</button>
        <button type="button" className="secondary" onClick={loadProviderFinalHomologationRunbook}>Runbook provedores</button>
        <button type="button" className="secondary" onClick={loadProviderHomologationDecisionRecord}>Ata provedores</button>
        <button type="button" className="secondary" onClick={loadProviderReleaseFreezeChecklist}>Freeze provedores</button>
        <button type="button" className="secondary" onClick={loadProviderControlledReleaseSnapshot}>Snapshot provedores</button>
        <button type="button" className="secondary" onClick={loadProductAuditSnapshot}>Auditoria produto</button>
        <button type="button" className="secondary" onClick={loadDayCommandCenter}>Comando do dia</button>
        <button type="button" className="secondary" onClick={runBusinessSuite}>Rodar suite operacional</button>
        <button type="button" className="secondary" onClick={runEnterpriseSuite}>Rodar suite escala</button>
        <button type="button" className="secondary" onClick={runAccelerationSuite}>Rodar 99 lotes</button>
        <button type="button" className="secondary" onClick={loadMobileOfflineEscalations}>Pendencias offline</button>
        <button type="button" className="secondary" onClick={loadMobileOfflineAssistedRetryPermissions}>Permissoes reenvio offline</button>
        <button type="button" className="secondary" onClick={loadMobileOfflineAssistedRetryProductionGate}>Gate reenvio offline</button>
        <button type="button" className="secondary" onClick={loadMobileOfflineAssistedRetryAuditContract}>Auditoria reenvio offline</button>
        <button type="button" className="secondary" onClick={loadMobileOfflineAssistedRetryExecutiveSummary}>Resumo reenvio offline</button>
        <button type="button" className="secondary" onClick={loadMobileOfflineAssistedRetryActionPlan}>Plano reenvio offline</button>
        <button type="button" className="secondary" onClick={loadMobileOfflineAssistedRetryDailyCommand}>Comando reenvio offline</button>
        <button type="button" className="secondary" onClick={loadMobileOfflineAssistedRetryDryRunBatch}>Lote dry-run offline</button>
        <button type="button" className="secondary" onClick={loadMobileOfflineAssistedRetryEvidencePackage}>Evidencias reenvio offline</button>
        <button type="button" className="secondary" onClick={loadMobileOfflineAssistedRetryFinalHomologation}>Homologacao final offline</button>
        <button type="button" className="secondary" onClick={loadMobileOfflineAssistedRetryControlledRelease}>Liberacao offline</button>
        <button type="button" className="secondary" onClick={loadMobileOfflineAssistedRetryProductionReadiness}>Prontidao producao offline</button>
        <button type="button" className="secondary" onClick={loadMobileOfflineAssistedRetryInfrastructureBacklog}>Infra reenvio offline</button>
        <button type="button" className="secondary" onClick={loadMobileOfflineAssistedRetryProviderCostPlan}>Custos provedores offline</button>
        <button type="button" className="secondary" onClick={loadMobileOfflineAssistedRetryProviderActivationGate}>Gate provedores offline</button>
        <button type="button" className="secondary" onClick={loadMobileOfflineAssistedRetryProviderHomologationRunbook}>Homologar provedores offline</button>
        <button type="button" className="secondary" onClick={loadMobileOfflineAssistedRetryProviderEvidenceBoard}>Evidencias provedores offline</button>
        <button type="button" className="secondary" onClick={loadMobileOfflineAssistedRetryTenantActivationDecision}>Decisao tenant offline</button>
        <button type="button" className="secondary" onClick={loadMobileOfflineAssistedRetryWhitelabelRolloutPlan}>Rollout whitelabel offline</button>
        <button type="button" className="secondary" onClick={loadMobileOfflineAssistedRetryWhitelabelOnboardingChecklist}>Onboarding whitelabel offline</button>
        <button type="button" className="secondary" onClick={loadMobileOfflineAssistedRetryWhitelabelOperationalHandoff}>Handoff whitelabel offline</button>
        <button type="button" className="secondary" onClick={loadMobileOfflineAssistedRetryWhitelabelGoLiveReadiness}>Go-live whitelabel offline</button>
        <button type="button" className="secondary" onClick={loadMobileOfflineAssistedRetryWhitelabelPostGoLivePlan}>Pos-go-live whitelabel</button>
        <button type="button" className="secondary" onClick={loadMobileOfflineAssistedRetryWhitelabelTenantHealthScore}>Health tenant whitelabel</button>
        <button type="button" className="secondary" onClick={loadMobileOfflineAssistedRetryWhitelabelContinuousImprovement}>Melhoria whitelabel</button>
        <button type="button" className="secondary" onClick={loadMobileOfflineAssistedRetryWhitelabelScaleDecision}>Escala whitelabel</button>
        <button type="button" className="secondary" onClick={loadMobileOfflineAssistedRetryWhitelabelSecondTenantPreOnboarding}>Pre-onboarding tenant</button>
        <button type="button" className="secondary" onClick={loadMobileOfflineAssistedRetryWhitelabelTenantCostMatrix}>Custos tenant</button>
        <button type="button" className="secondary" onClick={loadMobileOfflineAssistedRetryWhitelabelOperationalContractPack}>Contrato whitelabel</button>
        <button type="button" className="secondary" onClick={loadMobileOfflineAssistedRetryWhitelabelSupportSlaGate}>SLA whitelabel</button>
        <button type="button" className="secondary" onClick={loadMobileOfflineAssistedRetryWhitelabelSecurityPrivacyGate}>LGPD whitelabel</button>
        <button type="button" className="secondary" onClick={loadMobileOfflineAssistedRetryWhitelabelPartnerGoLiveAcceptance}>Aceite parceiro</button>
        <button type="button" className="secondary" onClick={loadMobileOfflineAssistedRetryWhitelabelEndOfDayClosure}>Encerrar dia whitelabel</button>
        <button type="button" className="secondary" onClick={loadMobileOfflineAssistedRetryWhitelabelMorningCommand}>Comando manha whitelabel</button>
        <button type="button" className="secondary" onClick={loadMobileOfflineAssistedRetryWhitelabelProductionExecutionMatrix}>Matriz producao whitelabel</button>
        <button type="button" className="secondary" onClick={runPlatformCheck}>Diagnostico</button>
        <button type="button" className="secondary" onClick={runHomologationCheck}>Homologacao</button>
        <button type="button" className="secondary" onClick={runMobileOfflineRetryHomologation}>Homologar reenvio offline</button>
        <button type="button" className="secondary" onClick={runDatabaseTransitionCheck}>Virada banco</button>
      </div>

      {publicTokenInventory?.data?.length ? (
        <div className="opsPanel">
          <div className="opsPanelHeader">
            <strong>Links publicos</strong>
            <div className="opsPanelFilters">
              <select value={publicTokenStatusFilter} onChange={(event) => setPublicTokenStatusFilter(event.target.value)}>
                <option value="all">Todos</option>
                <option value="active">Ativos</option>
                <option value="revoked">Revogados</option>
                <option value="expired">Expirados</option>
              </select>
              <select value={publicTokenScopeFilter} onChange={(event) => setPublicTokenScopeFilter(event.target.value)}>
                <option value="">Todos escopos</option>
                <option value="service_order_tracking">Acompanhamento OS</option>
                <option value="billing_summary">Financeiro portal</option>
              </select>
              <button type="button" className="secondary" onClick={loadPublicTokenInventory}>Aplicar filtros</button>
            </div>
          </div>
          {publicTokenInventory.summary ? (
            <div className="summaryPills">
              <span>Ativos: {publicTokenInventory.summary.active ?? 0}</span>
              <span>Revogados: {publicTokenInventory.summary.revoked ?? 0}</span>
              <span>Expirados: {publicTokenInventory.summary.expired ?? 0}</span>
              <span>Total: {publicTokenInventory.total ?? publicTokenInventory.data.length}</span>
            </div>
          ) : null}
          <div className="tableWrap">
            <table>
              <thead>
                <tr>
                  <th>Escopo</th>
                  <th>Entidade</th>
                  <th>Status</th>
                  <th>Hash</th>
                  <th>Acao</th>
                </tr>
              </thead>
              <tbody>
                {publicTokenInventory.data.map((item) => (
                  <tr key={item.id}>
                    <td>{item.scope}</td>
                    <td>{item.entityType}:{item.entityId}</td>
                    <td>{item.status}</td>
                    <td>{item.tokenHashPreview ?? "protegido"}</td>
                    <td>
                      <button
                        type="button"
                        className="secondary"
                        disabled={item.status === "revoked"}
                        onClick={() => revokePublicTokenRecordById(item.id, `Revogacao pelo inventario visual: ${item.scope} ${item.entityId}.`)}
                      >
                        Revogar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}

      {mobileOfflineEscalations?.data?.length ? (
        <div className="opsPanel">
          <div className="opsPanelHeader">
            <strong>Pendencias offline bloqueadas</strong>
            <div className="opsPanelFilters">
              <select value={mobileOfflineSourceFilter} onChange={(event) => setMobileOfflineSourceFilter(event.target.value)}>
                <option value="all">Todas origens</option>
                <option value="mobile">App tecnico</option>
                <option value="sync_guard">Guarda sync</option>
              </select>
              <select value={mobileOfflinePriorityFilter} onChange={(event) => setMobileOfflinePriorityFilter(event.target.value)}>
                <option value="all">Todas prioridades</option>
                <option value="critical">Criticas</option>
                <option value="high">Altas</option>
              </select>
              <select value={mobileOfflineOwnerFilter} onChange={(event) => setMobileOfflineOwnerFilter(event.target.value)}>
                <option value="all">Todos responsaveis</option>
                {mobileOfflineOwners.map((owner) => (
                  <option key={owner} value={owner}>{owner}</option>
                ))}
              </select>
              <select value={mobileOfflineTechnicianFilter} onChange={(event) => setMobileOfflineTechnicianFilter(event.target.value)}>
                <option value="all">Todos tecnicos</option>
                {mobileOfflineTechnicians.map((technician) => (
                  <option key={technician} value={technician}>{technician}</option>
                ))}
              </select>
              <select value={mobileOfflineSort} onChange={(event) => setMobileOfflineSort(event.target.value)}>
                <option value="severity_desc">Maior risco</option>
                <option value="priority_desc">Prioridade</option>
                <option value="mobile_first">Pedidos app primeiro</option>
                <option value="age_desc">Mais tentativas</option>
              </select>
            </div>
          </div>
          {mobileOfflineEscalations.summary ? (
            <div className="summaryPills">
              <span>Total: {mobileOfflineEscalations.summary.total}</span>
              <span>Filtradas: {sortedMobileOfflineItems.length}</span>
              <span>Ordem: {mobileOfflineSort}</span>
              <span>Criticas: {mobileOfflineEscalations.summary.critical}</span>
              <span>Altas: {mobileOfflineEscalations.summary.high}</span>
              <span>Pedidos app: {mobileOfflineEscalations.summary.managerReviewRequests ?? 0}</span>
              <span>Mais antiga: {mobileOfflineEscalations.summary.oldestAgeHours}h</span>
              <span>Maior risco: {mobileOfflineEscalations.summary.highestSeverityScore}</span>
            </div>
          ) : null}
          {hasCompactMobileOfflineSourceItems ? (
            <div className="compactQueue">
              <div className="compactQueueHeader">
                <strong>Fila diaria compacta</strong>
                <div className="compactQueueHeaderActions">
                  <label>
                    <input
                      type="checkbox"
                      checked={compactMobileOnly}
                      onChange={(event) => setCompactMobileOnly(event.target.checked)}
                    />
                    Apenas app tecnico
                  </label>
                  <span>App tecnico: {compactMobileRequestCount}</span>
                  <span>{compactMobileOfflineItems.length} prioridades visiveis</span>
                  <span className={hiddenCompactMobileOfflineCount ? "compactQueueHiddenWarning" : undefined}>
                    Ocultas: {hiddenCompactMobileOfflineCount}
                  </span>
                  <button
                    type="button"
                    className="secondary compactQueueReset"
                    onClick={resetMobileOfflineFilters}
                    disabled={!hasActiveMobileOfflineFilters}
                  >
                    Limpar filtros
                  </button>
                </div>
              </div>
              <div className="compactQueueGrid">
                {compactMobileOfflineItems.map((item) => (
                  <article key={`compact-${item.id}`}>
                    <div className="compactQueueTop">
                      <strong>{item.serviceOrderId}</strong>
                      <span className={getEscalationSeverityClass(item.severityScore)}>{item.severityScore}</span>
                    </div>
                    <p>{item.customer}</p>
                    <div className="compactQueueMeta">
                      <span>{item.technicianName}</span>
                      <span className={item.requestedFromMobile ? "badge badgeInfo" : "badge badgeNeutral"}>
                        {item.requestedFromMobile ? "App tecnico" : "Guarda sync"}
                      </span>
                    </div>
                    <div className="compactQueueAction">
                      <span>{item.actionLabel}</span>
                      <span className={getEscalationPriorityClass(item.priority)}>{item.priority}</span>
                    </div>
                    <div className="compactQueueActions">
                      <button
                        type="button"
                        className="secondary"
                        onClick={() => void runCompactMobileOfflineAction(item.id, "Preparar reenvio", () =>
                          icemaxApi.prepareMobileOfflineAssistedRetry(item.id, {
                            approvedBy: "RAFAEL DA SILVA BEZEERA",
                            reason: "Pendencia revisada pela fila compacta antes do reenvio assistido.",
                          }, token || undefined),
                        )}
                      >
                        Preparar
                      </button>
                      <button
                        type="button"
                        className="secondary"
                        onClick={() => void runCompactMobileOfflineAction(item.id, "Simular reenvio", () =>
                          icemaxApi.runMobileOfflineAssistedRetryDryRun(item.id, {
                            executedBy: "RAFAEL DA SILVA BEZEERA",
                            idempotencyKey: `mobile-offline-retry:${item.id}`,
                          }, token || undefined),
                        )}
                      >
                        Simular
                      </button>
                      <button
                        type="button"
                        className="secondary"
                        onClick={() => void runCompactMobileOfflineAction(item.id, "Abrir timeline", () =>
                          icemaxApi.mobileOfflineEscalationTimeline(item.id, token || undefined),
                        )}
                      >
                        Timeline
                      </button>
                    </div>
                    <button
                      type="button"
                      className="secondary compactQueueToggle"
                      onClick={() => toggleCompactOfflineCard(item.id)}
                    >
                      {expandedCompactOfflineCards[item.id] ? "Ocultar detalhes" : "Ver detalhes"}
                    </button>
                    {expandedCompactOfflineCards[item.id] ? (
                      <div className="compactQueueDetails">
                        <span>Motivo: {item.blockedReason}</span>
                        <span>Impacto: {item.impact ?? "Nao informado"}</span>
                        <span>Recomendacao: {item.recommendedAction}</span>
                        {item.mobileNote ? <span>Nota app: {item.mobileNote}</span> : null}
                      </div>
                    ) : null}
                    {compactActionStatus[item.id] ? (
                      <span className="compactQueueFeedback">{compactActionStatus[item.id]}</span>
                    ) : null}
                  </article>
                ))}
              </div>
              {!compactMobileOfflineItems.length ? (
                <div className="compactQueueEmpty">
                  Nenhuma solicitacao do app tecnico encontrada nas prioridades visiveis. Desative o filtro para ver a fila compacta completa.
                </div>
              ) : null}
            </div>
          ) : null}
          <div className="tableWrap">
            <table>
              <thead>
                <tr>
                  <th>OS</th>
                  <th>Tecnico</th>
                  <th>Risco</th>
                  <th>Origem</th>
                  <th>Acao</th>
                  <th>Motivo</th>
                  <th>Recomendacao</th>
                  <th>Decisao</th>
                </tr>
              </thead>
              <tbody>
                {sortedMobileOfflineItems.map((item) => (
                  <tr key={item.id}>
                    <td>{item.serviceOrderId}<br />{item.customer}</td>
                    <td>{item.technicianName}<br /><span className="badge badgeNeutral">{item.owner}</span></td>
                    <td>
                      <span className={getEscalationSeverityClass(item.severityScore)}>{item.severityScore}</span>
                      <br />
                      {item.slaStatus}
                      <br />
                      {item.ageHours ?? 0}h
                    </td>
                    <td>
                      <span className={item.requestedFromMobile ? "badge badgeInfo" : "badge badgeNeutral"}>
                        {item.requestedFromMobile ? "App tecnico" : "Guarda sync"}
                      </span>
                      <br />
                      {item.requestedAt ? new Date(item.requestedAt).toLocaleString("pt-BR") : item.source ?? "sync_guard"}
                    </td>
                    <td>{item.actionLabel}<br /><span className={getEscalationPriorityClass(item.priority)}>{item.priority}</span> tentativa {item.retryCount}</td>
                    <td>{item.blockedReason}<br />{item.likelyCause}</td>
                    <td>{item.recommendedAction}<br />{item.impact}<br />{item.mobileNote}</td>
                    <td>
                      <button type="button" className="secondary" onClick={() => reviewMobileOfflineEscalation(item.id, "release_assisted_retry")}>
                        Liberar
                      </button>
                      <button type="button" className="secondary" onClick={() => reviewMobileOfflineEscalation(item.id, "keep_blocked")}>
                        Manter
                      </button>
                      <button type="button" className="secondary" onClick={() => prepareMobileOfflineAssistedRetry(item.id)}>
                        Preparar
                      </button>
                      <button type="button" className="secondary" onClick={() => runMobileOfflineAssistedRetryDryRun(item.id)}>
                        Simular
                      </button>
                      <button type="button" className="secondary" onClick={() => loadMobileOfflineAssistedRetryReadiness(item.id)}>
                        Prontidao
                      </button>
                      <button type="button" className="secondary" onClick={() => loadMobileOfflineEscalationTimeline(item.id)}>
                        Timeline
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!sortedMobileOfflineItems.length ? (
              <div className="emptyState">Nenhuma pendencia offline encontrada com os filtros atuais.</div>
            ) : null}
          </div>
        </div>
      ) : null}

      {result ? <pre className="apiResult">{result}</pre> : null}
    </div>
  );
}
