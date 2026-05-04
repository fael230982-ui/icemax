"use client";

import { useEffect, useMemo, useState } from "react";
import { icemaxApi } from "../lib/api";

type QueueItem = {
  channel: string;
  status: string;
  template: string;
};

type AutomationRow = {
  receivableId: string;
  customer: string;
  plan: string;
  amount: number;
  daysOverdue: number;
  severity: string;
  readyToSend: number;
  blocked: number;
  nextAction: string;
  items: QueueItem[];
};

type AutomationResponse = {
  summary: {
    receivables: number;
    readyToSend: number;
    blocked: number;
    managerHolds: number;
    emailItems: number;
    whatsappItems: number;
  };
  rows: AutomationRow[];
};

const fallbackAutomation: AutomationResponse = {
  summary: {
    receivables: 3,
    readyToSend: 7,
    blocked: 2,
    managerHolds: 1,
    emailItems: 3,
    whatsappItems: 3,
  },
  rows: [
    {
      receivableId: "recv-contract-003",
      customer: "Mercado Avante",
      plan: "Higienizacao programada",
      amount: 240,
      daysOverdue: 55,
      severity: "manager_hold",
      readyToSend: 1,
      blocked: 2,
      nextAction: "Pausar automacao do contrato e acionar gestor antes de nova visita.",
      items: [
        { channel: "email", status: "blocked_manager_review", template: "collection_manager_hold_email" },
        { channel: "whatsapp", status: "blocked_manager_review", template: "collection_manager_hold_whatsapp" },
        { channel: "internal", status: "queued_mock", template: "collection_manager_hold_internal" },
      ],
    },
  ],
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  }).format(value);
}

function severityLabel(severity: string) {
  const labels: Record<string, string> = {
    manager_hold: "Gestor",
    overdue_reminder: "Vencido",
    pre_due_reminder: "Preventivo",
  };

  return labels[severity] ?? severity.replaceAll("_", " ");
}

export function CollectionAutomationPanel() {
  const [board, setBoard] = useState<AutomationResponse>(fallbackAutomation);
  const [source, setSource] = useState("fallback local");
  const [onlyBlocked, setOnlyBlocked] = useState(false);

  useEffect(() => {
    let active = true;

    void icemaxApi.collectionAutomationBoard()
      .then((response) => {
        if (active) {
          setBoard(response as AutomationResponse);
          setSource("API local");
        }
      })
      .catch(() => {
        if (active) {
          setBoard(fallbackAutomation);
          setSource("fallback local");
        }
      });

    return () => {
      active = false;
    };
  }, []);

  const rows = useMemo(
    () => board.rows.filter((row) => !onlyBlocked || row.blocked > 0),
    [board.rows, onlyBlocked],
  );

  return (
    <div className="billingPanel">
      <div className="billingSummary">
        <article>
          <span>Recebiveis</span>
          <strong>{board.summary.receivables}</strong>
        </article>
        <article>
          <span>Prontos</span>
          <strong>{board.summary.readyToSend}</strong>
        </article>
        <article className="attention">
          <span>Bloqueados</span>
          <strong>{board.summary.blocked}</strong>
        </article>
        <article className="attention">
          <span>Gestor</span>
          <strong>{board.summary.managerHolds}</strong>
        </article>
      </div>

      <div className="billingControls">
        <div>
          <span>Origem</span>
          <strong>{source}</strong>
        </div>
        <div>
          <span>Canais</span>
          <strong>{board.summary.emailItems} e-mails / {board.summary.whatsappItems} WhatsApp</strong>
        </div>
        <label>
          <input type="checkbox" checked={onlyBlocked} onChange={(event) => setOnlyBlocked(event.target.checked)} />
          Mostrar bloqueados
        </label>
      </div>

      <div className="billingRows">
        {rows.map((row) => (
          <article key={row.receivableId}>
            <div>
              <span>{severityLabel(row.severity)}</span>
              <strong>{row.customer}</strong>
              <small>{row.plan}</small>
            </div>
            <div>
              <span>Valor</span>
              <strong>{formatCurrency(row.amount)}</strong>
              <small>{row.daysOverdue} dias</small>
            </div>
            <div>
              <span>Fila</span>
              <strong>{row.readyToSend} prontos</strong>
              <small>{row.blocked} bloqueados</small>
            </div>
            <div>
              <span>Templates</span>
              <strong>{row.items.map((item) => item.channel).join(", ")}</strong>
              <small>{row.items[0]?.status ?? "sem fila"}</small>
            </div>
            <div>
              <span>Acao</span>
              <strong>{row.nextAction}</strong>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
