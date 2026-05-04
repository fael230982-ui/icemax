"use client";

import { useEffect, useMemo, useState } from "react";
import { icemaxApi } from "../lib/api";

type FinalizationRow = {
  serviceOrderId: string;
  customer: string;
  equipment: string;
  priority: string;
  technician: string;
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
  const generatedAt = useMemo(() => {
    if (board.generatedAt === "offline") {
      return "Dados locais";
    }

    return new Intl.DateTimeFormat("pt-BR", {
      dateStyle: "short",
      timeStyle: "short",
    }).format(new Date(board.generatedAt));
  }, [board.generatedAt]);

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

      <div className="finalizationRows">
        {board.rows.map((row) => (
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
          </article>
        ))}
      </div>
    </div>
  );
}
