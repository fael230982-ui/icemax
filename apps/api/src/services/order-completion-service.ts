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

