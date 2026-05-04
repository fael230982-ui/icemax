"use client";

import { useEffect, useMemo, useState } from "react";
import { icemaxApi } from "../lib/api";

type ReceivableRow = {
  receivableId: string;
  customer: string;
  plan: string;
  amount: number;
  dueDate: string;
  daysOverdue: number;
  status: string;
  collectionStage: string;
  nextAction: string;
  blocksAutomation: boolean;
};

type ReceivablesResponse = {
  asOf: string;
  summary: {
    totalOpen: number;
    overdueTotal: number;
    criticalAccounts: number;
    current: number;
    oneToThirty: number;
    thirtyOneToSixty: number;
    aboveSixty: number;
  };
  rows: ReceivableRow[];
};

const fallbackReceivables: ReceivablesResponse = {
  asOf: "2026-05-04",
  summary: {
    totalOpen: 950,
    overdueTotal: 630,
    criticalAccounts: 1,
    current: 320,
    oneToThirty: 390,
    thirtyOneToSixty: 240,
    aboveSixty: 0,
  },
  rows: [
    {
      receivableId: "recv-contract-003",
      customer: "Mercado Avante",
      plan: "Higienizacao programada",
      amount: 240,
      dueDate: "2026-03-10",
      daysOverdue: 55,
      status: "critical_overdue",
      collectionStage: "gestor",
      nextAction: "Pausar automacao do contrato e acionar gestor antes de nova visita.",
      blocksAutomation: true,
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

function stageLabel(stage: string) {
  const labels: Record<string, string> = {
    gestor: "Gestor",
    cobranca_amistosa: "Cobranca amigavel",
    lembrete_pre_vencimento: "Lembrete",
  };

  return labels[stage] ?? stage.replaceAll("_", " ");
}

export function ReceivablesCollectionPanel() {
  const [board, setBoard] = useState<ReceivablesResponse>(fallbackReceivables);
  const [source, setSource] = useState("fallback local");
  const [onlyBlocked, setOnlyBlocked] = useState(false);

  useEffect(() => {
    let active = true;

    void icemaxApi.receivablesBoard()
      .then((response) => {
        if (active) {
          setBoard(response as ReceivablesResponse);
          setSource("API local");
        }
      })
      .catch(() => {
        if (active) {
          setBoard(fallbackReceivables);
          setSource("fallback local");
        }
      });

    return () => {
      active = false;
    };
  }, []);

  const rows = useMemo(
    () => board.rows.filter((row) => !onlyBlocked || row.blocksAutomation),
    [board.rows, onlyBlocked],
  );

  return (
    <div className="billingPanel">
      <div className="billingSummary">
        <article>
          <span>Aberto</span>
          <strong>{formatCurrency(board.summary.totalOpen)}</strong>
        </article>
        <article className="attention">
          <span>Vencido</span>
          <strong>{formatCurrency(board.summary.overdueTotal)}</strong>
        </article>
        <article>
          <span>Em dia</span>
          <strong>{formatCurrency(board.summary.current)}</strong>
        </article>
        <article className="attention">
          <span>Criticos</span>
          <strong>{board.summary.criticalAccounts}</strong>
        </article>
      </div>

      <div className="billingControls">
        <div>
          <span>Origem</span>
          <strong>{source}</strong>
        </div>
        <div>
          <span>Referencia</span>
          <strong>{board.asOf}</strong>
        </div>
        <label>
          <input type="checkbox" checked={onlyBlocked} onChange={(event) => setOnlyBlocked(event.target.checked)} />
          Mostrar bloqueios
        </label>
      </div>

      <div className="billingRows">
        {rows.map((row) => (
          <article key={row.receivableId}>
            <div>
              <span>{stageLabel(row.collectionStage)}</span>
              <strong>{row.customer}</strong>
              <small>{row.plan}</small>
            </div>
            <div>
              <span>Valor</span>
              <strong>{formatCurrency(row.amount)}</strong>
              <small>{row.status.replaceAll("_", " ")}</small>
            </div>
            <div>
              <span>Vencimento</span>
              <strong>{row.dueDate}</strong>
              <small>{row.daysOverdue} dias</small>
            </div>
            <div>
              <span>Automacao</span>
              <strong>{row.blocksAutomation ? "Bloqueada" : "Liberada"}</strong>
              <small>{row.blocksAutomation ? "exige gestor" : "fluxo normal"}</small>
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
