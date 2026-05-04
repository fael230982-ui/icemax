"use client";

import { FormEvent, useState } from "react";
import { icemaxApi } from "../../../lib/api";

type PortalOrderFormProps = {
  tenantSlug: string;
};

type SubmitState = {
  status: "idle" | "sending" | "success" | "error";
  message: string;
  protocol?: string;
  triage?: {
    suggestedPriority?: string;
    serviceType?: string;
    dispatchGuidance?: { recommendedSlaMinutes?: number };
  };
};

export function PortalOrderForm({ tenantSlug }: PortalOrderFormProps) {
  const [state, setState] = useState<SubmitState>({
    status: "idle",
    message: "Preencha os dados principais para registrar a solicitacao.",
  });

  async function submitOrder(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);

    setState({
      status: "sending",
      message: "Enviando solicitacao para a central ICEMAX...",
    });

    try {
      const response = await icemaxApi.createPortalOrder({
        tenantSlug,
        customerName: String(form.get("customerName")),
        customerEmail: String(form.get("customerEmail")),
        customerPhone: String(form.get("customerPhone")),
        address: String(form.get("address")),
        equipmentType: String(form.get("equipmentType")),
        equipmentLabel: String(form.get("equipmentLabel")),
        problemDescription: String(form.get("problemDescription")),
        urgency: String(form.get("urgency")),
        allowWhatsapp: form.get("allowWhatsapp") === "on",
      }) as { id?: string; triage?: SubmitState["triage"] };

      event.currentTarget.reset();
      setState({
        status: "success",
        message: "Solicitacao registrada. A empresa recebeu os dados e fara a triagem operacional.",
        protocol: response.id,
        triage: response.triage,
      });
    } catch {
      setState({
        status: "error",
        message: "Nao foi possivel enviar agora. Revise os dados ou acione a empresa pelo canal oficial.",
      });
    }
  }

  return (
    <form className="portalForm" onSubmit={submitOrder}>
      <div className="portalFormGrid">
        <label>
          Nome do cliente
          <input name="customerName" required minLength={3} placeholder="Nome completo ou razao social" />
        </label>
        <label>
          E-mail
          <input name="customerEmail" required type="email" placeholder="cliente@empresa.com.br" />
        </label>
        <label>
          Telefone
          <input name="customerPhone" required placeholder="+55 00 00000-0000" />
        </label>
        <label>
          Urgencia
          <select name="urgency" defaultValue="normal">
            <option value="normal">Normal</option>
            <option value="high">Alta</option>
            <option value="emergency">Emergencia</option>
          </select>
        </label>
      </div>

      <label>
        Endereco do atendimento
        <input name="address" required placeholder="Rua, numero, bairro, cidade e ponto de referencia" />
      </label>

      <div className="portalFormGrid">
        <label>
          Tipo de equipamento
          <input name="equipmentType" required placeholder="Split, cassete, VRF, self, chiller..." />
        </label>
        <label>
          Local ou identificacao
          <input name="equipmentLabel" placeholder="Sala, apartamento, tag ou patrimonio" />
        </label>
      </div>

      <label>
        Descricao do problema
        <textarea
          name="problemDescription"
          required
          minLength={12}
          rows={5}
          placeholder="Descreva sintomas, ruidos, vazamentos, alarmes, quando comecou e se o local esta liberado."
        />
      </label>

      <label className="portalCheck">
        <input name="allowWhatsapp" type="checkbox" defaultChecked />
        <span>Autorizo contato operacional por WhatsApp para agenda, chegada do tecnico e atualizacoes da OS.</span>
      </label>

      <div className={`portalSubmit ${state.status}`}>
        <div>
          <strong>{state.protocol ? `Protocolo ${state.protocol}` : "Status da solicitacao"}</strong>
          <span>{state.message}</span>
          {state.triage ? (
            <small>
              Prioridade sugerida: {state.triage.suggestedPriority} | Tipo: {state.triage.serviceType} | SLA: {state.triage.dispatchGuidance?.recommendedSlaMinutes} min
            </small>
          ) : null}
        </div>
        <button type="submit" disabled={state.status === "sending"}>
          {state.status === "sending" ? "Enviando" : "Abrir OS"}
        </button>
      </div>
    </form>
  );
}
