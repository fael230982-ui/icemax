"use client";

import { useEffect, useMemo, useState } from "react";
import { icemaxApi } from "../lib/api";

type BillingRow = {
  contractId: string;
  customer: string;
  plan: string;
  status: string;
  recurrenceMonths: number;
  coveredEquipment: number;
  monthlyValue: number;
  annualValue: number;
  nextDueDate: string | null;
  nextAmount: number;
  overdueRisk: string;
  riskReasons: string[];
  nextAction: string;
};

type BillingBoardResponse = {
  generatedAt: string;
  summary: {
    contracts: number;
    monthlyRecurringRevenue: number;
    annualRecurringRevenue: number;
    attention: number;
    nextDueTotal: number;
  };
  rows: BillingRow[];
};

const fallbackBilling: BillingBoardResponse = {
  generatedAt: "offline",
  summary: {
    contracts: 3,
    monthlyRecurringRevenue: 950,
    annualRecurringRevenue: 11400,
    attention: 1,
    nextDueTotal: 950,
  },
  rows: [
    {
      contractId: "contract-001",
      customer: "Clinica Vida",
      plan: "Preventiva + higienizacao",
      status: "upcoming",
      recurrenceMonths: 3,
      coveredEquipment: 8,
      monthlyValue: 390,
      annualValue: 4680,
      nextDueDate: "2026-05-10",
      nextAmount: 390,
      overdueRisk: "low",
      riskReasons: [],
      nextAction: "Conferir dados fiscais e programar envio da proxima cobranca.",
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

function riskLabel(risk: string) {
  const labels: Record<string, string> = {
    low: "Baixo",
    monitor: "Monitorar",
    attention: "Atencao",
  };

  return labels[risk] ?? risk.replaceAll("_", " ");
}

export function RecurringBillingBoardPanel() {
  const [board, setBoard] = useState<BillingBoardResponse>(fallbackBilling);
  const [source, setSource] = useState("fallback local");
  const [onlyAttention, setOnlyAttention] = useState(false);

  useEffect(() => {
    let active = true;

    void icemaxApi.recurringBillingBoard()
      .then((response) => {
        if (active) {
          setBoard(response as BillingBoardResponse);
          setSource("API local");
        }
      })
      .catch(() => {
        if (active) {
          setBoard(fallbackBilling);
          setSource("fallback local");
        }
      });

    return () => {
      active = false;
    };
  }, []);

  const rows = useMemo(
    () => board.rows.filter((row) => !onlyAttention || row.overdueRisk === "attention"),
    [board.rows, onlyAttention],
  );

  return (
    <div className="billingPanel">
      <div className="billingSummary">
        <article>
          <span>Contratos</span>
          <strong>{board.summary.contracts}</strong>
        </article>
        <article>
          <span>MRR</span>
          <strong>{formatCurrency(board.summary.monthlyRecurringRevenue)}</strong>
        </article>
        <article>
          <span>ARR</span>
          <strong>{formatCurrency(board.summary.annualRecurringRevenue)}</strong>
        </article>
        <article className="attention">
          <span>Atencao</span>
          <strong>{board.summary.attention}</strong>
        </article>
      </div>

      <div className="billingControls">
        <div>
          <span>Origem</span>
          <strong>{source}</strong>
        </div>
        <div>
          <span>Proximos vencimentos</span>
          <strong>{formatCurrency(board.summary.nextDueTotal)}</strong>
        </div>
        <label>
          <input type="checkbox" checked={onlyAttention} onChange={(event) => setOnlyAttention(event.target.checked)} />
          Mostrar apenas atencao
        </label>
      </div>

      <div className="billingRows">
        {rows.map((row) => (
          <article key={row.contractId}>
            <div>
              <span>{riskLabel(row.overdueRisk)}</span>
              <strong>{row.customer}</strong>
              <small>{row.plan}</small>
            </div>
            <div>
              <span>Mensalidade</span>
              <strong>{formatCurrency(row.monthlyValue)}</strong>
              <small>{formatCurrency(row.annualValue)}/ano</small>
            </div>
            <div>
              <span>Proximo vencimento</span>
              <strong>{row.nextDueDate ?? "Nao definido"}</strong>
              <small>{formatCurrency(row.nextAmount)}</small>
            </div>
            <div>
              <span>Escopo</span>
              <strong>{row.coveredEquipment} equipamentos</strong>
              <small>{row.recurrenceMonths} meses</small>
            </div>
            <div>
              <span>Acao</span>
              <strong>{row.nextAction}</strong>
              <small>{row.riskReasons[0] ?? "Sem alerta financeiro critico"}</small>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
