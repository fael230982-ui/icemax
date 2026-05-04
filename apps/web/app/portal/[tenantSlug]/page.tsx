import { PortalBillingSummary } from "./PortalBillingSummary";
import { PortalOrderForm } from "./PortalOrderForm";

type PortalPageProps = {
  params: Promise<{ tenantSlug: string }>;
};

function companyNameFromSlug(slug: string) {
  if (slug.toLowerCase() === "icemax") {
    return "ICEMAX Ar Condicionado";
  }

  return slug
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export default async function PortalPage({ params }: PortalPageProps) {
  const { tenantSlug } = await params;
  const companyName = companyNameFromSlug(tenantSlug);

  return (
    <main className="portalPage">
      <section className="portalHero">
        <div>
          <p className="eyebrow">Portal do cliente</p>
          <h1>{companyName}</h1>
          <p>Solicite atendimento tecnico com dados suficientes para triagem, agenda e preparo da equipe.</p>
        </div>
        <div className="portalHeroStatus">
          <span>Canal publico</span>
          <strong>OS opcional pelo cliente</strong>
          <small>O atendimento segue validacao da empresa antes do despacho.</small>
        </div>
      </section>

      <section className="portalLayout">
        <article className="portalPanel mainPortalPanel">
          <div className="portalPanelHeader">
            <div>
              <p className="eyebrow">Nova solicitacao</p>
              <h2>Dados para abertura da OS</h2>
            </div>
            <span>Whitelabel</span>
          </div>
          <PortalOrderForm tenantSlug={tenantSlug} />
        </article>

        <aside className="portalPanel portalSide">
          <div>
            <p className="eyebrow">Antes de enviar</p>
            <h2>Informacoes uteis</h2>
          </div>
          <ul className="portalList">
            <li>Informe acesso ao equipamento, local exato e sintomas percebidos.</li>
            <li>Use emergencia apenas quando houver impacto critico, risco operacional ou perda importante.</li>
            <li>Dados financeiros, contratos e observacoes internas nao aparecem neste canal publico.</li>
            <li>A empresa podera transformar a solicitacao em OS, agendar tecnico e enviar link de acompanhamento.</li>
          </ul>
          <div className="portalPrivacy">
            <strong>Privacidade</strong>
            <span>Este portal coleta somente dados necessarios para triagem e atendimento tecnico.</span>
          </div>
        </aside>

        <article className="portalPanel mainPortalPanel">
          <PortalBillingSummary tenantSlug={tenantSlug} />
        </article>
      </section>
    </main>
  );
}
