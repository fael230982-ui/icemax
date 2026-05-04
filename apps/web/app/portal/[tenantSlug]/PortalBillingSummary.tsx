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

type AccessLinkState = {
  status: "idle" | "creating" | "ready" | "error";
  message: string;
  publicUrl?: string;
  expiresInDays?: number;
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
  const [accessLink, setAccessLink] = useState<AccessLinkState>({
    status: "idle",
    message: "Prepare um link seguro para consultar este resumo depois.",
  });

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

  async function createAccessLink() {
    setAccessLink({
      status: "creating",
      message: "Preparando link seguro...",
    });

    try {
      const response = await icemaxApi.createCustomerPortalBillingAccessLink(tenantSlug) as {
        publicUrl?: string;
        expiresInDays?: number;
      };

      setAccessLink({
        status: "ready",
        message: "Link preparado para envio pelos canais oficiais.",
        publicUrl: response.publicUrl,
        expiresInDays: response.expiresInDays,
      });
    } catch {
      setAccessLink({
        status: "error",
        message: "Nao foi possivel preparar o link agora.",
      });
    }
  }

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

      <div className={`portalBillingAccess ${accessLink.status}`}>
        <div>
          <strong>Acesso seguro</strong>
          <span>{accessLink.message}</span>
          {accessLink.publicUrl ? <small>Expira em {accessLink.expiresInDays} dias</small> : null}
        </div>
        <button type="button" onClick={createAccessLink} disabled={accessLink.status === "creating"}>
          {accessLink.status === "creating" ? "Preparando" : "Gerar link"}
        </button>
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
