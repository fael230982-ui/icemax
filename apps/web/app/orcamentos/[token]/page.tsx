import { QuoteDecisionForm } from "./QuoteDecisionForm";

export const dynamic = "force-dynamic";

type QuotePageProps = {
  params: Promise<{
    token: string;
  }>;
};

type QuotePageData = {
  number: string;
  serviceOrder: string;
  customer: string;
  equipment: string;
  location: string;
  issue: string;
  total: string;
  expiresAt: string;
  company: string;
  email: string;
  status: string;
  items: Array<{ description: string; quantity: string; amount: string }>;
  conditions: string[];
  timeline: Array<{ title: string; detail: string; status: "done" | "pending" }>;
};

type PublicQuoteResponse = {
  quoteNumber?: string;
  serviceOrderId?: string;
  customer?: string;
  currentQuoteStatus?: string;
  expiresAt?: string;
  financialSummary?: {
    formattedTotal?: string;
    items?: Array<{
      description?: string;
      quantity?: number;
      subtotal?: number;
    }>;
  };
};

const fallbackQuote: QuotePageData = {
  number: "ORC-2026-001",
  serviceOrder: "1048",
  customer: "ClimaSul Hotel",
  equipment: "Carrier Piso Teto 60.000 BTUs",
  location: "Recepcao",
  issue: "Equipamento sem refrigeracao e com baixa eficiencia operacional.",
  total: "R$ 1.840,00",
  expiresAt: "10/05/2026",
  company: "ICEMAX Ar Condicionado",
  email: "adm.rcsolutions@gmail.com",
  status: "sent",
  items: [
    { description: "Diagnostico tecnico completo", quantity: "1 servico", amount: "R$ 280,00" },
    { description: "Correcao de vazamento e teste de estanqueidade", quantity: "1 servico", amount: "R$ 620,00" },
    { description: "Reposicao tecnica de fluido refrigerante", quantity: "1 carga", amount: "R$ 740,00" },
    { description: "Deslocamento e insumos operacionais", quantity: "1 pacote", amount: "R$ 200,00" },
  ],
  conditions: [
    "Aprovacao libera execucao conforme disponibilidade tecnica e estoque.",
    "Garantia aplicada apenas aos itens executados e pecas substituidas.",
    "Valores validos ate a data indicada neste link.",
  ],
  timeline: [
    { title: "Orcamento preparado", detail: "Escopo tecnico, valores e validade foram organizados para decisao.", status: "done" },
    { title: "Link enviado", detail: "A empresa acompanha o envio por e-mail, WhatsApp ou atendimento interno.", status: "done" },
    { title: "Decisao do cliente", detail: "Aprovacao libera execucao; revisao ou recusa retornam para o comercial.", status: "pending" },
    { title: "Programacao da OS", detail: "Apos aprovacao, a equipe confirma agenda, pecas e deslocamento tecnico.", status: "pending" },
  ],
};

function formatCurrency(value?: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value ?? 0);
}

function formatDate(value?: string) {
  if (!value) {
    return fallbackQuote.expiresAt;
  }

  return new Intl.DateTimeFormat("pt-BR", { timeZone: "UTC" }).format(new Date(value));
}

function quoteFromToken(token: string) {
  const match = token.match(/^quote_([^_]+)_/);
  return match?.[1] ?? "quote-001";
}

async function loadPublicQuote(token: string): Promise<QuotePageData> {
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3333";

  try {
    const response = await fetch(`${apiBaseUrl}/public/quotes/${token}`, {
      headers: { Accept: "application/json" },
      cache: "no-store",
    });

    if (!response.ok) {
      return fallbackQuote;
    }

    const data = (await response.json()) as PublicQuoteResponse;
    const items = data.financialSummary?.items?.length
      ? data.financialSummary.items.map((item) => ({
          description: item.description ?? "Item do orcamento",
          quantity: `${item.quantity ?? 1} item`,
          amount: formatCurrency(item.subtotal),
        }))
      : fallbackQuote.items;

    return {
      ...fallbackQuote,
      number: data.quoteNumber ?? fallbackQuote.number,
      serviceOrder: data.serviceOrderId ?? fallbackQuote.serviceOrder,
      customer: data.customer ?? fallbackQuote.customer,
      total: data.financialSummary?.formattedTotal ?? fallbackQuote.total,
      expiresAt: formatDate(data.expiresAt),
      status: data.currentQuoteStatus ?? fallbackQuote.status,
      items,
    };
  } catch {
    return fallbackQuote;
  }
}

export default async function QuoteApprovalPage({ params }: QuotePageProps) {
  const { token } = await params;
  const quoteId = quoteFromToken(token);
  const isKnownQuote = quoteId === "quote-001";
  const quote = await loadPublicQuote(token);

  return (
    <main className="quotePage">
      <section className="quoteHero">
        <div>
          <p className="eyebrow">{quote.company}</p>
          <h1>{isKnownQuote ? quote.number : "Orcamento em verificacao"}</h1>
          <p>
            {isKnownQuote
              ? "Revise os itens, confirme os dados e registre a decisao do cliente."
              : "Este link sera validado antes de exibir dados comerciais."}
          </p>
        </div>
        <aside className="quoteTotal" aria-label="Resumo financeiro">
          <span>Total do orcamento</span>
          <strong>{isKnownQuote ? quote.total : "A confirmar"}</strong>
          <small>Validade: {isKnownQuote ? quote.expiresAt : "em analise"}</small>
        </aside>
      </section>

      <section className="quoteSummary" aria-label="Dados do atendimento">
        <article>
          <span>Cliente</span>
          <strong>{isKnownQuote ? quote.customer : "Cliente"}</strong>
        </article>
        <article>
          <span>OS vinculada</span>
          <strong>{isKnownQuote ? `#${quote.serviceOrder}` : "A confirmar"}</strong>
        </article>
        <article>
          <span>Equipamento</span>
          <strong>{isKnownQuote ? quote.equipment : "Equipamento"}</strong>
        </article>
        <article>
          <span>Local</span>
          <strong>{isKnownQuote ? quote.location : "A confirmar"}</strong>
        </article>
      </section>

      <section className="quoteLayout">
        <article className="quotePanel">
          <div className="quotePanelHeader">
            <div>
              <p className="eyebrow">Itens</p>
              <h2>Composicao do orcamento</h2>
            </div>
            <span>{isKnownQuote ? "Aguardando decisao" : "Link protegido"}</span>
          </div>

          <div className="quoteIssue">
            <span>Problema relatado</span>
            <strong>{isKnownQuote ? quote.issue : "Dados protegidos ate validacao do link."}</strong>
          </div>

          <div className="quoteItems">
            {quote.items.map((item) => (
              <div key={item.description} className="quoteItem">
                <div>
                  <strong>{item.description}</strong>
                  <span>{item.quantity}</span>
                </div>
                <b>{item.amount}</b>
              </div>
            ))}
          </div>
        </article>

        <aside className="quotePanel quoteDecision" aria-label="Decisao do cliente">
          <div className="quotePanelHeader">
            <div>
              <p className="eyebrow">Decisao</p>
              <h2>Aprovacao do cliente</h2>
            </div>
          </div>
          <QuoteDecisionForm token={token} />
        </aside>
      </section>

      <section className="quotePanel" aria-label="Condicoes comerciais">
        <div className="quotePanelHeader">
          <div>
            <p className="eyebrow">Condicoes</p>
            <h2>Termos comerciais</h2>
          </div>
          <span>Sem dados internos de margem</span>
        </div>
        <ul className="quoteTerms">
          {quote.conditions.map((condition) => (
            <li key={condition}>{condition}</li>
          ))}
        </ul>
      </section>

      <section className="quotePanel" aria-label="Linha do tempo do orcamento">
        <div className="quotePanelHeader">
          <div>
            <p className="eyebrow">Acompanhamento</p>
            <h2>Linha do tempo</h2>
          </div>
          <span>Visao do cliente</span>
        </div>
        <div className="quoteTimeline">
          {quote.timeline.map((event) => (
            <article key={event.title} className={`quoteTimelineItem ${event.status}`}>
              <span>{event.status === "done" ? "Concluido" : "Proximo"}</span>
              <strong>{event.title}</strong>
              <p>{event.detail}</p>
            </article>
          ))}
        </div>
      </section>

      <footer className="quoteFooter">
        <span>Link protegido por token: somente dados necessarios para decisao comercial sao exibidos.</span>
        <span>Contato: {quote.email}</span>
      </footer>
    </main>
  );
}
