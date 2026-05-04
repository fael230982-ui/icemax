type TrackingPageProps = {
  params: Promise<{
    token: string;
  }>;
};

function serviceOrderFromToken(token: string) {
  const match = token.match(/^track_([^_]+)_/);
  return match?.[1] ?? "1048";
}

export default async function TrackingPage({ params }: TrackingPageProps) {
  const { token } = await params;
  const serviceOrderId = serviceOrderFromToken(token);
  const isKnownOrder = serviceOrderId === "1048";
  const status = isKnownOrder ? "Atendimento em andamento" : "Acompanhamento indisponivel";
  const steps = [
    { label: "Solicitacao recebida", state: "done" },
    { label: "Agenda definida", state: "done" },
    { label: "Tecnico no local", state: isKnownOrder ? "done" : "pending" },
    { label: "Relatorio tecnico", state: "pending" },
    { label: "Conclusao", state: "pending" },
  ];

  return (
    <main className="trackingPage">
      <section className="trackingHero">
        <div>
          <p className="eyebrow">ICEMAX Ar Condicionado</p>
          <h1>OS {serviceOrderId}</h1>
          <p>{status}</p>
        </div>
        <div className="trackingStatus" aria-label="Status da ordem de servico">
          <span>{isKnownOrder ? "Tecnico no local" : "Link em verificacao"}</span>
          <strong>{isKnownOrder ? "Agora" : "A confirmar"}</strong>
        </div>
      </section>

      <section className="trackingGrid" aria-label="Resumo do atendimento">
        <article>
          <span>Cliente</span>
          <strong>{isKnownOrder ? "ClimaSul Hotel" : "Cliente"}</strong>
        </article>
        <article>
          <span>Equipamento</span>
          <strong>{isKnownOrder ? "Carrier Piso Teto 60.000 BTUs" : "Equipamento em atendimento"}</strong>
        </article>
        <article>
          <span>Tecnico</span>
          <strong>{isKnownOrder ? "Rafael Martins" : "Equipe tecnica"}</strong>
        </article>
        <article>
          <span>Previsao</span>
          <strong>{isKnownOrder ? "No local" : "A confirmar"}</strong>
        </article>
      </section>

      <section className="trackingPanel" aria-label="Linha do tempo do atendimento">
        <div className="trackingPanelHeader">
          <div>
            <p className="eyebrow">Andamento</p>
            <h2>Linha do tempo</h2>
          </div>
          <span>Atualiza a cada 45s</span>
        </div>
        <div className="trackingSteps">
          {steps.map((step) => (
            <div key={step.label} className={step.state === "done" ? "step done" : "step"}>
              <span />
              <strong>{step.label}</strong>
            </div>
          ))}
        </div>
      </section>

      <section className="trackingPanel" aria-label="Orientacoes ao cliente">
        <div className="trackingPanelHeader">
          <div>
            <p className="eyebrow">Orientacoes</p>
            <h2>Proximas acoes</h2>
          </div>
        </div>
        <ul className="trackingList">
          <li>Mantenha o acesso ao equipamento liberado.</li>
          <li>Aguarde o relatorio tecnico apos a conclusao.</li>
          <li>Em caso de duvida, responda pelo canal informado pela empresa.</li>
        </ul>
      </section>

      <footer className="trackingFooter">
        <span>Link protegido: valores, notas internas e telefone pessoal do tecnico nao sao exibidos.</span>
        <span>Suporte: adm.rcsolutions@gmail.com</span>
      </footer>
    </main>
  );
}
