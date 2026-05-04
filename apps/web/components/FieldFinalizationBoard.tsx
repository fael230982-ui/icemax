"use client";

import { useEffect, useMemo, useState } from "react";
import { icemaxApi } from "../lib/api";

type FinalizationRow = {
  serviceOrderId: string;
  customer: string;
  equipment: string;
  priority: string;
  technician: string;
  technicianUserId?: string | null;
  quoteId?: string | null;
  status: string;
  closeoutStatus: string;
  signatureStatus: string;
  emailStatus: string;
  blockers: string[];
  nextAction: string;
};

type FinalizationBoardResponse = {
  generatedAt: string;
  status: string;
  summary: {
    serviceOrders: number;
    needsAttention: number;
    readyToSend: number;
    emailProviderConfigured: boolean;
  };
  rows: FinalizationRow[];
};

const fallbackBoard: FinalizationBoardResponse = {
  generatedAt: "offline",
  status: "attention",
  summary: {
    serviceOrders: 3,
    needsAttention: 3,
    readyToSend: 0,
    emailProviderConfigured: false,
  },
  rows: [
    {
      serviceOrderId: "1048",
      customer: "ClimaSul Hotel",
      equipment: "Carrier Piso Teto 60.000 BTUs",
      priority: "emergency",
      technician: "Rafael Martins",
      technicianUserId: "tech-001",
      quoteId: "quote-001",
      status: "needs_attention",
      closeoutStatus: "field_closeout_blocked",
      signatureStatus: "customer_signature_locked",
      emailStatus: "completion_email_blocked",
      blockers: ["Fotos obrigatorias", "Medicoes tecnicas", "Assinatura digital"],
      nextAction: "Resolver evidencias e liberar assinatura.",
    },
    {
      serviceOrderId: "1049",
      customer: "Mercado Avante",
      equipment: "Split Hi Wall 24.000 BTUs",
      priority: "high",
      technician: "Joao Pereira",
      technicianUserId: "tech-002",
      quoteId: "quote-002",
      status: "needs_attention",
      closeoutStatus: "field_closeout_blocked",
      signatureStatus: "customer_signature_locked",
      emailStatus: "completion_email_blocked",
      blockers: ["Confirmacao de pecas", "Assinatura digital"],
      nextAction: "Conferir baixa de estoque e registrar assinatura.",
    },
    {
      serviceOrderId: "1050",
      customer: "Clinica Vida",
      equipment: "Cassete 36.000 BTUs",
      priority: "normal",
      technician: "Equipe Norte",
      technicianUserId: "tech-003",
      quoteId: "quote-003",
      status: "needs_attention",
      closeoutStatus: "field_closeout_blocked",
      signatureStatus: "customer_signature_locked",
      emailStatus: "completion_email_blocked",
      blockers: ["Relatorio tecnico", "Assinatura digital"],
      nextAction: "Revisar relatorio e preparar envio final.",
    },
  ],
};

function statusLabel(status: string) {
  const labels: Record<string, string> = {
    needs_attention: "Atencao",
    ready_to_send: "Pronto",
    field_closeout_blocked: "Fechamento travado",
    field_closeout_ready: "Fechamento pronto",
    customer_signature_locked: "Assinatura travada",
    customer_signature_ready: "Assinatura pronta",
    completion_email_blocked: "E-mail travado",
    completion_email_ready: "E-mail pronto",
  };

  return labels[status] ?? status.replaceAll("_", " ");
}

export function FieldFinalizationBoard() {
  const [board, setBoard] = useState<FinalizationBoardResponse>(fallbackBoard);
  const [source, setSource] = useState("fallback local");
  const [statusFilter, setStatusFilter] = useState("all");
  const [query, setQuery] = useState("");
  const [actionState, setActionState] = useState<Record<string, string>>({});

  useEffect(() => {
    let active = true;

    void icemaxApi.fieldFinalizationBoard()
      .then((response) => {
        if (active) {
          setBoard(response as FinalizationBoardResponse);
          setSource("API local");
        }
      })
      .catch(() => {
        if (active) {
          setBoard(fallbackBoard);
          setSource("fallback local");
        }
      });

    return () => {
      active = false;
    };
  }, []);

  const providerStatus = board.summary.emailProviderConfigured ? "Configurado" : "Pendente";
  const filteredRows = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return board.rows.filter((row) => {
      const matchesStatus = statusFilter === "all" || row.status === statusFilter;
      const matchesQuery = !normalizedQuery || [
        row.serviceOrderId,
        row.customer,
        row.equipment,
        row.technician,
        row.priority,
      ].some((value) => value.toLowerCase().includes(normalizedQuery));

      return matchesStatus && matchesQuery;
    });
  }, [board.rows, query, statusFilter]);
  const generatedAt = useMemo(() => {
    if (board.generatedAt === "offline") {
      return "Dados locais";
    }

    return new Intl.DateTimeFormat("pt-BR", {
      dateStyle: "short",
      timeStyle: "short",
    }).format(new Date(board.generatedAt));
  }, [board.generatedAt]);

  function updateActionState(serviceOrderId: string, message: string) {
    setActionState((current) => ({
      ...current,
      [serviceOrderId]: message,
    }));
  }

  async function recordSignature(row: FinalizationRow) {
    updateActionState(row.serviceOrderId, "Registrando assinatura...");

    try {
      await icemaxApi.recordFieldCustomerSignature(row.serviceOrderId, {
        quoteId: row.quoteId ?? undefined,
        technicianUserId: row.technicianUserId ?? "tech-001",
        responsibleName: "Cliente demonstracao",
        responsibleRole: "Responsavel no local",
        emailCopyToCustomer: true,
        acceptedTerms: true,
        signedAt: new Date().toISOString(),
        mobileOfflineId: `web-finalization-${row.serviceOrderId}-signature`,
      });
      updateActionState(row.serviceOrderId, "Assinatura enviada para API local.");
    } catch {
      updateActionState(row.serviceOrderId, "API local indisponivel; acao ficou em modo demonstracao.");
    }
  }

  async function queueEmail(row: FinalizationRow) {
    updateActionState(row.serviceOrderId, "Enfileirando e-mail...");

    try {
      await icemaxApi.queueFieldCompletionEmail(row.serviceOrderId, {
        quoteId: row.quoteId ?? undefined,
        technicianUserId: row.technicianUserId ?? "tech-001",
        emailCopyToCustomer: true,
        companyEmail: "adm.rcsolutions@gmail.com",
        includeWarrantyTerms: true,
        requestedAt: new Date().toISOString(),
        mobileOfflineId: `web-finalization-${row.serviceOrderId}-email`,
      });
      updateActionState(row.serviceOrderId, "E-mail final enfileirado na API local.");
    } catch {
      updateActionState(row.serviceOrderId, "API local indisponivel; envio ficou em modo demonstracao.");
    }
  }

  return (
    <div className="finalizationBoard">
      <div className="finalizationSummary">
        <article>
          <span>OS avaliadas</span>
          <strong>{board.summary.serviceOrders}</strong>
        </article>
        <article className="attention">
          <span>Com atencao</span>
          <strong>{board.summary.needsAttention}</strong>
        </article>
        <article className="ready">
          <span>Prontas</span>
          <strong>{board.summary.readyToSend}</strong>
        </article>
        <article>
          <span>E-mail</span>
          <strong>{providerStatus}</strong>
        </article>
      </div>

      <div className="finalizationMeta">
        <span>Origem: {source}</span>
        <span>Atualizado: {generatedAt}</span>
      </div>

      <div className="finalizationControls">
        <label>
          Status
          <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
            <option value="all">Todos</option>
            <option value="needs_attention">Com atencao</option>
            <option value="ready_to_send">Prontas para envio</option>
          </select>
        </label>
        <label>
          Busca
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="OS, cliente, equipamento ou tecnico" />
        </label>
        <div>
          <span>Resultado</span>
          <strong>{filteredRows.length} OS</strong>
        </div>
      </div>

      <div className="finalizationRows">
        {filteredRows.map((row) => (
          <article className="finalizationRow" key={row.serviceOrderId}>
            <div>
              <span className="rowId">OS {row.serviceOrderId}</span>
              <strong>{row.customer}</strong>
              <small>{row.equipment}</small>
            </div>
            <div>
              <span>Tecnico</span>
              <strong>{row.technician}</strong>
              <small>{row.priority}</small>
            </div>
            <div className="statusStack">
              <span className={row.status === "ready_to_send" ? "statusPill ready" : "statusPill attention"}>{statusLabel(row.status)}</span>
              <small>{statusLabel(row.closeoutStatus)}</small>
              <small>{statusLabel(row.signatureStatus)}</small>
              <small>{statusLabel(row.emailStatus)}</small>
            </div>
            <div>
              <span>Bloqueios</span>
              <strong>{row.blockers.length || "0"}</strong>
              <small>{row.blockers.slice(0, 2).join(", ") || "Sem bloqueios criticos"}</small>
            </div>
            <div>
              <span>Proxima acao</span>
              <strong>{row.nextAction}</strong>
            </div>
            <div className="finalizationActions">
              <button type="button" className="secondary" onClick={() => recordSignature(row)}>Assinatura</button>
              <button type="button" onClick={() => queueEmail(row)} disabled={row.emailStatus !== "completion_email_ready"}>
                E-mail final
              </button>
              <small>{actionState[row.serviceOrderId] ?? "Aguardando acao do operador."}</small>
            </div>
          </article>
        ))}
        {!filteredRows.length ? (
          <article className="finalizationEmpty">
            <strong>Nenhuma OS encontrada</strong>
            <span>Ajuste o filtro ou limpe a busca para retornar ao board completo.</span>
          </article>
        ) : null}
      </div>
    </div>
  );
}
