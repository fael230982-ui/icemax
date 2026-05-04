import { improveTechnicalText } from "./ai-assistant-service";

type CompletionOrder = {
  id: string;
  title?: string;
  description?: string | null;
  status: string;
  priority?: string;
  customerSignedName?: string | null;
  customer?: {
    name?: string | null;
    email?: string | null;
    phone?: string | null;
  } | null;
  equipment?: {
    brand?: string | null;
    model?: string | null;
    serialNumber?: string | null;
    installationLocation?: string | null;
  } | null;
  notes?: Array<{
    rawText?: string | null;
    improvedText?: string | null;
  }>;
  photos?: Array<{
    type?: string | null;
    fileUrl?: string | null;
  }>;
  partsUsed?: Array<unknown>;
};

function checkStatus(condition: boolean, attention: boolean = false) {
  if (condition) {
    return "ok" as const;
  }

  return attention ? "attention" as const : "blocked" as const;
}

function buildChecks(order: CompletionOrder) {
  const hasNotes = Boolean(order.notes?.length);
  const hasPhotos = Boolean(order.photos?.length);
  const hasSignature = Boolean(order.customerSignedName);
  const hasEquipment = Boolean(order.equipment?.model || order.equipment?.serialNumber);
  const hasCustomerContact = Boolean(order.customer?.email || order.customer?.phone);

  return [
    {
      key: "technical_notes",
      label: "Texto tecnico",
      status: checkStatus(hasNotes),
      detail: hasNotes ? "Ha registro tecnico para compor o relatorio." : "Inclua uma descricao tecnica antes de concluir.",
    },
    {
      key: "photos",
      label: "Evidencias fotograficas",
      status: checkStatus(hasPhotos, true),
      detail: hasPhotos ? "Ha evidencias fotograficas vinculadas." : "Recomendado registrar fotos antes/depois.",
    },
    {
      key: "signature",
      label: "Assinatura do cliente",
      status: checkStatus(hasSignature),
      detail: hasSignature ? `Assinado por ${order.customerSignedName}.` : "Assinatura obrigatoria antes do envio final.",
    },
    {
      key: "equipment",
      label: "Identificacao do equipamento",
      status: checkStatus(hasEquipment, true),
      detail: hasEquipment ? "Equipamento identificado no relatorio." : "Completar modelo, serie ou local de instalacao.",
    },
    {
      key: "customer_contact",
      label: "Contato do cliente",
      status: checkStatus(hasCustomerContact),
      detail: hasCustomerContact ? "Cliente possui canal de envio cadastrado." : "Informe e-mail ou telefone do cliente.",
    },
  ];
}

function summarizeStatus(checks: ReturnType<typeof buildChecks>) {
  const blocked = checks.filter((check) => check.status === "blocked").length;
  const attention = checks.filter((check) => check.status === "attention").length;

  if (blocked > 0) {
    return "blocked" as const;
  }

  if (attention > 0) {
    return "attention" as const;
  }

  return "ready" as const;
}

export function buildOrderCompletionReview(order: CompletionOrder) {
  const notes = order.notes?.map((note) => note.improvedText || note.rawText).filter(Boolean) ?? [];
  const baseText = notes.join(" ") || order.description || order.title || "Atendimento tecnico registrado.";
  const improved = improveTechnicalText({ text: baseText, tone: "customer_friendly" });
  const checks = buildChecks(order);
  const status = summarizeStatus(checks);

  return {
    serviceOrderId: order.id,
    status,
    checks,
    reportDraft: {
      title: order.title ?? "Relatorio de atendimento tecnico",
      customer: order.customer?.name ?? "Cliente nao informado",
      equipment: order.equipment?.model ?? "Equipamento nao informado",
      professionalSummary: improved.outputText,
      warrantyText: "Garantia aplicavel conforme termo emitido, condicoes de uso e itens efetivamente executados.",
      nextSteps: [
        "Enviar relatorio ao e-mail configurado pela empresa.",
        "Manter copia no historico do cliente e do equipamento.",
        "Agendar retorno se houver pendencia tecnica ou peca indisponivel.",
      ],
    },
    recommendation: status === "ready"
      ? "OS pronta para envio do relatorio e fechamento administrativo."
      : status === "attention"
        ? "OS pode ser concluida com ressalvas registradas pelo gestor."
        : "Corrigir bloqueios antes de enviar relatorio ao cliente.",
  };
}

export function buildOrderEvidenceManifest(order: CompletionOrder) {
  const photos = order.photos?.map((photo, index) => ({
    key: `photo_${index + 1}`,
    type: "photo",
    label: photo.type ?? "Foto tecnica",
    source: photo.fileUrl ?? "sem arquivo vinculado",
    sensitivity: "restricted",
    requiredForCloseout: index === 0,
    status: photo.fileUrl ? "ready" : "blocked",
  })) ?? [];

  const documents = [
    {
      key: "technical_report",
      type: "document",
      label: "Relatorio tecnico final",
      source: `/files/reports/os-${order.id}.pdf`,
      sensitivity: "confidential",
      requiredForCloseout: true,
      status: order.status === "completed" ? "ready" : "pending",
    },
    {
      key: "customer_signature",
      type: "signature",
      label: "Assinatura do cliente",
      source: order.customerSignedName ?? "assinatura nao capturada",
      sensitivity: "restricted",
      requiredForCloseout: true,
      status: order.customerSignedName ? "ready" : "blocked",
    },
    {
      key: "equipment_identity",
      type: "metadata",
      label: "Identificacao do equipamento",
      source: order.equipment?.serialNumber ?? order.equipment?.model ?? "equipamento incompleto",
      sensitivity: "internal",
      requiredForCloseout: true,
      status: order.equipment?.serialNumber || order.equipment?.model ? "ready" : "attention",
    },
    {
      key: "customer_contact",
      type: "metadata",
      label: "Contato do cliente",
      source: order.customer?.email ?? order.customer?.phone ?? "contato nao informado",
      sensitivity: "confidential",
      requiredForCloseout: true,
      status: order.customer?.email || order.customer?.phone ? "ready" : "blocked",
    },
  ];

  const items = [...photos, ...documents];
  const blocked = items.filter((item) => item.status === "blocked");
  const attention = items.filter((item) => item.status === "attention" || item.status === "pending");

  return {
    serviceOrderId: order.id,
    generatedAt: new Date().toISOString(),
    status: blocked.length > 0 ? "blocked" : attention.length > 0 ? "attention" : "ready",
    summary: {
      total: items.length,
      photos: photos.length,
      documents: documents.length,
      blocked: blocked.length,
      attention: attention.length,
    },
    retentionPolicy: {
      default: "manter pelo prazo de garantia, contrato e obrigacoes fiscais aplicaveis",
      signatures: "armazenar em storage privado com hash e auditoria",
      customerSharing: "somente liberar via e-mail auditado, portal autenticado ou link expiravel",
    },
    governance: {
      auditEvent: "service_order.evidence_manifest_viewed",
      requiresPrivateStorage: true,
      requiresTenantScope: true,
      requiresVirusScanBeforeExternalShare: true,
    },
    items,
    nextActions: blocked.length > 0
      ? blocked.map((item) => `Resolver evidencia obrigatoria: ${item.label}.`)
      : ["Manifesto pronto para arquivo da OS e envio controlado ao cliente."],
  };
}
