"use client";

import { useEffect, useMemo, useState } from "react";
import { icemaxApi } from "../lib/api";

type EmailQueueRow = {
  serviceOrderId: string;
  customer: string;
  equipment: string;
  technician: string;
  subject: string;
  status: string;
  recipients: {
    company: string;
    customerCopy: string | null;
    copyToCustomer: boolean;
  };
  blockers: string[];
  retry: {
    attempts: number;
    nextAttemptAt: string | null;
    strategy: string;
  };
  nextAction: string;
};

type CompletionEmailQueueResponse = {
  generatedAt: string;
  provider: {
    configured: boolean;
    mode: string;
    companyRecipient: string;
  };
  summary: {
    total: number;
    blocked: number;
    waitingProvider: number;
    customerCopies: number;
  };
  rows: EmailQueueRow[];
};

const fallbackQueue: CompletionEmailQueueResponse = {
  generatedAt: "offline",
  provider: {
    configured: false,
    mode: "fallback_local",
    companyRecipient: "adm.rcsolutions@gmail.com",
  },
  summary: {
    total: 3,
    blocked: 3,
    waitingProvider: 0,
    customerCopies: 3,
  },
  rows: [
    {
      serviceOrderId: "1048",
      customer: "ClimaSul Hotel",
      equipment: "Carrier Piso Teto 60.000 BTUs",
      technician: "Rafael Martins",
      subject: "OS 1048 concluida - ClimaSul Hotel",
      status: "blocked",
      recipients: {
        company: "adm.rcsolutions@gmail.com",
        customerCopy: "compras@climasul.example",
        copyToCustomer: true,
      },
      blockers: ["assinatura digital ainda nao capturada"],
      retry: {
        attempts: 0,
        nextAttemptAt: null,
        strategy: "manual_until_email_provider_configured",
      },
      nextAction: "Capturar assinatura e revisar anexos antes do envio.",
    },
  ],
};

function queueStatusLabel(status: string) {
  const labels: Record<string, string> = {
    blocked: "Bloqueado",
    waiting_provider: "Aguardando provedor",
  };

  return labels[status] ?? status.replaceAll("_", " ");
}

export function CompletionEmailQueuePanel() {
  const [queue, setQueue] = useState<CompletionEmailQueueResponse>(fallbackQueue);
  const [source, setSource] = useState("fallback local");
  const [onlyBlocked, setOnlyBlocked] = useState(false);

  useEffect(() => {
    let active = true;

    void icemaxApi.completionEmailQueue()
      .then((response) => {
        if (active) {
          setQueue(response as CompletionEmailQueueResponse);
          setSource("API local");
        }
      })
      .catch(() => {
        if (active) {
          setQueue(fallbackQueue);
          setSource("fallback local");
        }
      });

    return () => {
      active = false;
    };
  }, []);

  const rows = useMemo(
    () => queue.rows.filter((row) => !onlyBlocked || row.status === "blocked"),
    [onlyBlocked, queue.rows],
  );
  const providerStatus = queue.provider.configured ? "Configurado" : "Pendente";

  return (
    <div className="emailQueue">
      <div className="emailQueueSummary">
        <article>
          <span>Total</span>
          <strong>{queue.summary.total}</strong>
        </article>
        <article className="attention">
          <span>Bloqueados</span>
          <strong>{queue.summary.blocked}</strong>
        </article>
        <article>
          <span>Aguardando provedor</span>
          <strong>{queue.summary.waitingProvider}</strong>
        </article>
        <article>
          <span>Copias cliente</span>
          <strong>{queue.summary.customerCopies}</strong>
        </article>
      </div>

      <div className="emailQueueControls">
        <div>
          <span>Origem</span>
          <strong>{source}</strong>
        </div>
        <div>
          <span>Provedor</span>
          <strong>{providerStatus}</strong>
        </div>
        <label>
          <input type="checkbox" checked={onlyBlocked} onChange={(event) => setOnlyBlocked(event.target.checked)} />
          Mostrar apenas bloqueados
        </label>
      </div>

      <div className="emailQueueRows">
        {rows.map((row) => (
          <article className="emailQueueRow" key={row.serviceOrderId}>
            <div>
              <span>OS {row.serviceOrderId}</span>
              <strong>{row.customer}</strong>
              <small>{row.equipment}</small>
            </div>
            <div>
              <span>Assunto</span>
              <strong>{row.subject}</strong>
              <small>{row.technician}</small>
            </div>
            <div>
              <span>Destinos</span>
              <strong>{row.recipients.company}</strong>
              <small>{row.recipients.customerCopy ?? "Sem copia ao cliente"}</small>
            </div>
            <div>
              <span className={row.status === "blocked" ? "statusPill attention" : "statusPill ready"}>{queueStatusLabel(row.status)}</span>
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
