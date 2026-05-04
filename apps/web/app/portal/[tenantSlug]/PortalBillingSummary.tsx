"use client";

import { useEffect, useState } from "react";
import { icemaxApi } from "../../../lib/api";

type BillingContract = {
  contractId: string;
  customer: string;
  plan: string;
  recurrenceMonths: number;
  coveredEquipment: number;
  nextVisit: string;
  nextDueDate?: string;
  nextAmount?: number;
  status: string;
  customerAction: string;
};

type BillingSummary = {
  summary: {
    contracts: number;
    monthlyTotal: number;
    coveredEquipment: number;
    upcomingVisits: number;
  };
  contracts: BillingContract[];
};

const fallbackBilling: BillingSummary = {
  summary: {
    contracts: 0,
    monthlyTotal: 0,
    coveredEquipment: 0,
    upcomingVisits: 0,
  },
  contracts: [],
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  }).format(value);
}

function statusLabel(status: string) {
  const labels: Record<string, string> = {
    visita_pendente: "Visita pendente",
    em_dia: "Em dia",
    proximo_vencimento: "Proximo vencimento",
  };

  return labels[status] ?? status.replaceAll("_", " ");
}

export function PortalBillingSummary({ tenantSlug }: { tenantSlug: string }) {
  const [billing, setBilling] = useState<BillingSummary>(fallbackBilling);
  const [source, setSource] = useState("carregando");

  useEffect(() => {
    let active = true;

    void icemaxApi.customerPortalBillingSummary(tenantSlug)
      .then((response) => {
        if (active) {
          setBilling(response as BillingSummary);
          setSource("online");
        }
      })
      .catch(() => {
        if (active) {
          setBilling(fallbackBilling);
          setSource("indisponivel");
        }
      });

    return () => {
      active = false;
    };
  }, [tenantSlug]);

  return (
    <div className="portalBilling">
      <div className="portalPanelHeader">
        <div>
          <p className="eyebrow">Contratos</p>
          <h2>Resumo financeiro</h2>
        </div>
        <span>{source}</span>
      </div>

      <div className="portalBillingGrid">
        <article>
          <span>Contratos</span>
          <strong>{billing.summary.contracts}</strong>
        </article>
        <article>
          <span>Mensalidade</span>
          <strong>{formatCurrency(billing.summary.monthlyTotal)}</strong>
        </article>
        <article>
          <span>Equipamentos</span>
          <strong>{billing.summary.coveredEquipment}</strong>
        </article>
      </div>

      <div className="portalBillingList">
        {billing.contracts.map((contract) => (
          <article key={contract.contractId}>
            <div>
              <span>{statusLabel(contract.status)}</span>
              <strong>{contract.customer}</strong>
              <small>{contract.plan}</small>
            </div>
            <div>
              <span>Proximo vencimento</span>
              <strong>{contract.nextDueDate ?? "A confirmar"}</strong>
              <small>{formatCurrency(contract.nextAmount ?? 0)}</small>
            </div>
            <div>
              <span>Proxima visita</span>
              <strong>{contract.nextVisit}</strong>
              <small>{contract.coveredEquipment} equipamentos</small>
            </div>
            <p>{contract.customerAction}</p>
          </article>
        ))}
      </div>
    </div>
  );
}
