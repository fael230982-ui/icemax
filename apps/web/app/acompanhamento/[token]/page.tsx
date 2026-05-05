import { icemaxApi } from "../../../lib/api";

export const dynamic = "force-dynamic";

type TrackingPageProps = {
  params: Promise<{
    token: string;
  }>;
};

type PublicTokenValidation = {
  valid?: boolean;
  entityId?: string;
};

type CustomerTracking = {
  serviceOrderId?: string;
  statusLabel?: string;
  customer?: string;
  equipment?: string;
  eta?: string;
  technician?: {
    name?: string;
  };
  timeline?: Array<{
    key?: string;
    label?: string;
    status?: string;
  }>;
  customerActions?: string[];
  tenant?: {
    name?: string;
    supportEmail?: string;
  };
};

function serviceOrderFromToken(token: string) {
  const match = token.match(/^track_([^_]+)_/);
  return match?.[1] ?? "1048";
}

async function loadTracking(token: string) {
  try {
    const validation = (await icemaxApi.validateCustomerPortalPublicToken(token, "service_order_tracking")) as PublicTokenValidation;
    const serviceOrderId = validation.entityId ?? serviceOrderFromToken(token);
    const tracking = (await icemaxApi.customerOrderTracking(serviceOrderId)) as CustomerTracking;

    return {
      valid: Boolean(validation.valid),
      serviceOrderId,
      tracking,
    };
  } catch {
    return {
      valid: false,
      serviceOrderId: serviceOrderFromToken(token),
      tracking: null,
    };
  }
}

export default async function TrackingPage({ params }: TrackingPageProps) {
  const { token } = await params;
  const state = await loadTracking(token);
  const tracking = state.tracking;
  const isAvailable = state.valid && Boolean(tracking);
  const serviceOrderId = tracking?.serviceOrderId ?? state.serviceOrderId;
  const status = isAvailable ? tracking?.statusLabel ?? "Atendimento em acompanhamento" : "Acompanhamento indisponivel";
  const steps = tracking?.timeline?.length
    ? tracking.timeline.map((step) => ({ label: step.label ?? "Etapa do atendimento", state: step.status === "done" ? "done" : "pending" }))
    : [
        { label: "Solicitacao recebida", state: "pending" },
        { label: "Agenda definida", state: "pending" },
        { label: "Tecnico a caminho", state: "pending" },
        { label: "Relatorio tecnico", state: "pending" },
        { label: "Conclusao", state: "pending" },
      ];

  return (
    <main className="trackingPage">
      <section className="trackingHero">
        <div>
          <p className="eyebrow">{tracking?.tenant?.name ?? "ICEMAX Ar Condicionado"}</p>
          <h1>OS {serviceOrderId}</h1>
          <p>{status}</p>
        </div>
        <div className="trackingStatus" aria-label="Status da ordem de servico">
          <span>{isAvailable ? "Link validado" : "Link em verificacao"}</span>
          <strong>{isAvailable ? tracking?.eta ?? "A confirmar" : "A confirmar"}</strong>
        </div>
      </section>

      <section className="trackingGrid" aria-label="Resumo do atendimento">
        <article>
          <span>Cliente</span>
          <strong>{isAvailable ? tracking?.customer ?? "Cliente" : "Cliente"}</strong>
        </article>
        <article>
          <span>Equipamento</span>
          <strong>{isAvailable ? tracking?.equipment ?? "Equipamento em atendimento" : "Dados protegidos"}</strong>
        </article>
        <article>
          <span>Tecnico</span>
          <strong>{isAvailable ? tracking?.technician?.name ?? "Equipe tecnica" : "Equipe tecnica"}</strong>
        </article>
        <article>
          <span>Previsao</span>
          <strong>{isAvailable ? tracking?.eta ?? "A confirmar" : "A confirmar"}</strong>
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
          {(tracking?.customerActions?.length
            ? tracking.customerActions
            : [
                "Mantenha o acesso ao equipamento liberado.",
                "Aguarde o relatorio tecnico apos a conclusao.",
                "Em caso de duvida, responda pelo canal informado pela empresa.",
              ]).map((action) => (
            <li key={action}>{action}</li>
          ))}
        </ul>
      </section>

      <footer className="trackingFooter">
        <span>Link protegido: valores, notas internas e telefone pessoal do tecnico nao sao exibidos.</span>
        <span>Suporte: {tracking?.tenant?.supportEmail ?? "adm.rcsolutions@gmail.com"}</span>
      </footer>
    </main>
  );
}
