"use client";

import { useState } from "react";
import { AuthPanel } from "./AuthPanel";

export function Topbar() {
  const [feedback, setFeedback] = useState("Ambiente demonstrativo pronto para operacao.");

  return (
    <>
      <header className="topbar">
        <div>
          <p className="eyebrow">Cockpit operacional</p>
          <h1>ICEMAX Service Command</h1>
          <span className="topbarSubtitle">Ordens, equipes, contratos e estoque em uma tela executiva.</span>
        </div>
        <div className="actions">
          <button className="secondary" onClick={() => setFeedback("Exportacao mockada preparada para auditoria e reuniao gerencial.")}>Exportar</button>
          <button onClick={() => setFeedback("Nova OS mockada criada e enviada para a fila priorizada.")}>Nova OS</button>
        </div>
      </header>
      <p className="topbarFeedback">{feedback}</p>
      <details className="topbarAuth">
        <summary>Credenciais e conexao da API</summary>
        <AuthPanel />
      </details>
    </>
  );
}
