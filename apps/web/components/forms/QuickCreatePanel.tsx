"use client";

import { useState } from "react";
import { icemaxApi } from "../../lib/api";

const actions = [
  {
    label: "Cliente",
    run: () => icemaxApi.createCustomer({ name: "Cliente teste", email: "cliente.teste@local.dev", phone: "+5500000000000" }),
  },
  {
    label: "OS",
    run: () => icemaxApi.createServiceOrder({ customerId: "customer-001", title: "Atendimento teste", priority: "normal" }),
  },
  {
    label: "Contrato",
    run: () => icemaxApi.createContract({
      customerId: "customer-001",
      name: "Contrato teste",
      recurrenceMonths: 3,
      startDate: new Date().toISOString(),
      equipmentIds: [],
    }),
  },
];

export function QuickCreatePanel() {
  const [message, setMessage] = useState("Acoes usam API local quando ela estiver rodando.");

  async function runAction(action: (typeof actions)[number]) {
    try {
      await action.run();
      setMessage(`${action.label} enviado para API.`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Falha ao enviar.");
    }
  }

  return (
    <div className="quickCreate">
      <div>
        <p className="eyebrow">Criacao rapida</p>
        <h2>Testes de API</h2>
        <span>{message}</span>
      </div>
      <div className="quickActions">
        {actions.map((action) => (
          <button type="button" className="secondary" key={action.label} onClick={() => runAction(action)}>
            {action.label}
          </button>
        ))}
      </div>
    </div>
  );
}
