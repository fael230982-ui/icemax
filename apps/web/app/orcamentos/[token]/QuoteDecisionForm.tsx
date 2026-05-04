"use client";

import { useState } from "react";
import { icemaxApi } from "../../../lib/api";

type Decision = "approved" | "revision_requested" | "rejected";

type QuoteDecisionFormProps = {
  token: string;
};

const decisions: Array<{ value: Decision; label: string }> = [
  { value: "approved", label: "Aprovar" },
  { value: "revision_requested", label: "Revisar" },
  { value: "rejected", label: "Recusar" },
];

export function QuoteDecisionForm({ token }: QuoteDecisionFormProps) {
  const [decision, setDecision] = useState<Decision>("approved");
  const [customerName, setCustomerName] = useState("");
  const [customerDocument, setCustomerDocument] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [reason, setReason] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("Informe o responsavel para registrar a decisao.");

  async function submitDecision() {
    if (!customerName.trim()) {
      setStatus("error");
      setMessage("Informe o nome do responsavel pela decisao.");
      return;
    }

    if (decision === "approved" && !acceptedTerms) {
      setStatus("error");
      setMessage("Para aprovar, confirme o aceite dos termos comerciais.");
      return;
    }

    setStatus("loading");
    setMessage("Registrando decisao...");

    try {
      await icemaxApi.publicQuoteDecision(token, {
        decision,
        customerName,
        customerDocument: customerDocument || undefined,
        customerEmail: customerEmail || undefined,
        acceptedTerms,
        reason: reason || undefined,
      });
      setStatus("success");
      setMessage("Decisao registrada. A equipe sera notificada para seguir o fluxo operacional.");
    } catch {
      setStatus("error");
      setMessage("Nao foi possivel registrar agora. Confira os dados ou tente novamente quando a API estiver disponivel.");
    }
  }

  return (
    <div className="quoteDecisionForm">
      <div className="decisionTabs" role="tablist" aria-label="Decisao do orcamento">
        {decisions.map((item) => (
          <button
            key={item.value}
            className={decision === item.value ? "active" : "secondary"}
            type="button"
            onClick={() => setDecision(item.value)}
          >
            {item.label}
          </button>
        ))}
      </div>

      <label>
        Nome do responsavel
        <input value={customerName} onChange={(event) => setCustomerName(event.target.value)} placeholder="Nome completo" />
      </label>

      <label>
        Documento
        <input value={customerDocument} onChange={(event) => setCustomerDocument(event.target.value)} placeholder="CPF ou CNPJ" />
      </label>

      <label>
        E-mail
        <input value={customerEmail} onChange={(event) => setCustomerEmail(event.target.value)} placeholder="email@empresa.com" />
      </label>

      <label>
        Observacao
        <textarea value={reason} onChange={(event) => setReason(event.target.value)} rows={3} placeholder="Motivo da revisao ou recusa" />
      </label>

      <label className="quoteCheck">
        <input checked={acceptedTerms} onChange={(event) => setAcceptedTerms(event.target.checked)} type="checkbox" />
        Confirmo que li e aceito os termos comerciais deste orcamento.
      </label>

      <button type="button" onClick={submitDecision} disabled={status === "loading"}>
        {status === "loading" ? "Registrando..." : "Registrar decisao"}
      </button>

      <p className={status === "error" ? "quoteFeedback error" : status === "success" ? "quoteFeedback success" : "quoteFeedback"}>
        {message}
      </p>
    </div>
  );
}
