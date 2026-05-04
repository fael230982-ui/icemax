import { QuoteDecisionForm } from "./QuoteDecisionForm";

type QuotePageProps = {
  params: Promise<{
    token: string;
  }>;
};

const quote = {
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
};

function quoteFromToken(token: string) {
  const match = token.match(/^quote_([^_]+)_/);
  return match?.[1] ?? "quote-001";
}

export default async function QuoteApprovalPage({ params }: QuotePageProps) {
  const { token } = await params;
  const quoteId = quoteFromToken(token);
  const isKnownQuote = quoteId === "quote-001";

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

      <footer className="quoteFooter">
        <span>Link protegido por token: somente dados necessarios para decisao comercial sao exibidos.</span>
        <span>Contato: {quote.email}</span>
      </footer>
    </main>
  );
}
