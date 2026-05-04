"use client";

import { useEffect, useState } from "react";
import { icemaxApi } from "../lib/api";

type ArchiveDocument = {
  key: string;
  label: string;
  status: string;
  source: string;
};

type ArchiveTimelineItem = {
  key: string;
  label: string;
  at: string;
  actor: string;
};

type CloseoutArchiveResponse = {
  serviceOrderId: string;
  customer: string;
  equipment: string;
  status: string;
  generatedAt: string;
  summary: {
    issue: string;
    priority: string;
    closeoutStatus: string;
    signatureStatus: string;
    emailStatus: string;
    blockers: string[];
  };
  documents: ArchiveDocument[];
  timeline: ArchiveTimelineItem[];
  governance: {
    auditEvent: string;
    canShareWithCustomer: boolean;
    requiresProviderReceiptForFinalSend: boolean;
  };
  nextActions: string[];
};

const fallbackArchive: CloseoutArchiveResponse = {
  serviceOrderId: "1048",
  customer: "ClimaSul Hotel",
  equipment: "Carrier Piso Teto 60.000 BTUs",
  status: "archive_incomplete",
  generatedAt: "offline",
  summary: {
    issue: "Equipamento com baixa refrigeracao",
    priority: "emergency",
    closeoutStatus: "field_closeout_blocked",
    signatureStatus: "customer_signature_locked",
    emailStatus: "completion_email_blocked",
    blockers: ["assinatura digital ainda nao capturada"],
  },
  documents: [
    { key: "technical_report", label: "Relatorio tecnico revisado", status: "prepared", source: "fallback" },
    { key: "customer_signature", label: "Assinatura digital do cliente", status: "locked", source: "fallback" },
    { key: "completion_email", label: "Comprovante de e-mail final", status: "blocked", source: "fallback" },
  ],
  timeline: [
    { key: "os_created", label: "OS aberta", at: "2026-05-04T08:00:00.000Z", actor: "operacao" },
    { key: "closeout_review", label: "Fechamento tecnico preparado", at: "2026-05-04T11:10:00.000Z", actor: "sistema" },
  ],
  governance: {
    auditEvent: "field.closeout_archive_viewed",
    canShareWithCustomer: false,
    requiresProviderReceiptForFinalSend: true,
  },
  nextActions: ["Resolver bloqueios antes de considerar OS totalmente arquivada."],
};

function archiveStatusLabel(status: string) {
  const labels: Record<string, string> = {
    archive_ready: "Arquivo completo",
    archive_incomplete: "Arquivo incompleto",
    prepared: "Preparado",
    missing: "Ausente",
    needs_review: "Revisar",
    pending_capture: "Pendente",
    locked: "Travado",
    ready_to_queue: "Pronto",
    blocked: "Bloqueado",
    recommended: "Recomendado",
  };

  return labels[status] ?? status.replaceAll("_", " ");
}

function formatArchiveDate(value: string) {
  if (value === "offline") {
    return "Dados locais";
  }

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
}

export function CloseoutArchivePanel() {
  const [serviceOrderId, setServiceOrderId] = useState("1048");
  const [archive, setArchive] = useState<CloseoutArchiveResponse>(fallbackArchive);
  const [source, setSource] = useState("fallback local");

  useEffect(() => {
    let active = true;

    void icemaxApi.closeoutArchive(serviceOrderId)
      .then((response) => {
        if (active) {
          setArchive(response as CloseoutArchiveResponse);
          setSource("API local");
        }
      })
      .catch(() => {
        if (active) {
          setArchive(fallbackArchive);
          setSource("fallback local");
        }
      });

    return () => {
      active = false;
    };
  }, [serviceOrderId]);

  return (
    <div className="archivePanel">
      <div className="archiveControls">
        <label>
          OS
          <select value={serviceOrderId} onChange={(event) => setServiceOrderId(event.target.value)}>
            <option value="1048">1048</option>
            <option value="1049">1049</option>
            <option value="1050">1050</option>
          </select>
        </label>
        <div>
          <span>Origem</span>
          <strong>{source}</strong>
        </div>
        <div>
          <span>Status</span>
          <strong>{archiveStatusLabel(archive.status)}</strong>
        </div>
        <div>
          <span>Atualizado</span>
          <strong>{formatArchiveDate(archive.generatedAt)}</strong>
        </div>
      </div>

      <div className="archiveHeader">
        <div>
          <span>OS {archive.serviceOrderId}</span>
          <strong>{archive.customer}</strong>
          <small>{archive.equipment}</small>
        </div>
        <div>
          <span>Problema</span>
          <strong>{archive.summary.issue}</strong>
          <small>{archive.summary.priority}</small>
        </div>
        <div>
          <span>Compartilhamento</span>
          <strong>{archive.governance.canShareWithCustomer ? "Liberado" : "Bloqueado"}</strong>
          <small>{archive.governance.requiresProviderReceiptForFinalSend ? "Exige comprovante do provedor" : "Sem pendencia de provedor"}</small>
        </div>
      </div>

      <div className="archiveDocuments">
        {archive.documents.map((document) => (
          <article key={document.key}>
            <span>{archiveStatusLabel(document.status)}</span>
            <strong>{document.label}</strong>
            <small>{document.source}</small>
          </article>
        ))}
      </div>

      <div className="archiveTimeline">
        {archive.timeline.map((item) => (
          <article key={item.key}>
            <span>{formatArchiveDate(item.at)}</span>
            <strong>{item.label}</strong>
            <small>{item.actor}</small>
          </article>
        ))}
      </div>

      <div className="archiveActions">
        <div>
          <span>Bloqueios</span>
          <strong>{archive.summary.blockers.length || "0"}</strong>
          <small>{archive.summary.blockers.slice(0, 3).join(", ") || "Sem bloqueios criticos"}</small>
        </div>
        <div>
          <span>Proximas acoes</span>
          <strong>{archive.nextActions[0]}</strong>
        </div>
      </div>
    </div>
  );
}
