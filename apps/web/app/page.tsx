import {
  checklists,
  contracts,
  floorPlan,
  manuals,
  metrics,
  notifications,
  orders,
  qrLabels,
  quotes,
  serviceFlow,
  stockAlerts,
  technicians,
  tenant,
} from "./data";

export default function Home() {
  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="brandMark">IM</div>
        <div className="tenant">
          <strong>{tenant.name}</strong>
          <span>{tenant.label}</span>
        </div>

        <nav aria-label="Menu principal">
          {["Dashboard", "Ordens", "Contratos", "Orcamentos", "Checklists", "Mapas", "QR", "Agenda", "Campo", "Estoque", "Manuais", "IA", "Notificacoes", "Whitelabel"].map((item) => (
            <a className={item === "Dashboard" ? "active" : ""} href={`#${item.toLowerCase()}`} key={item}>
              {item}
            </a>
          ))}
        </nav>
      </aside>

      <main className="main">
        <header className="topbar">
          <div>
            <p className="eyebrow">Painel operacional</p>
            <h1>Controle de ordens de servico</h1>
          </div>
          <div className="actions">
            <button className="secondary">Exportar</button>
            <button>Nova OS</button>
          </div>
        </header>

        <section className="metrics" aria-label="Indicadores principais">
          {metrics.map((metric) => (
            <article className={`metric ${metric.tone}`} key={metric.label}>
              <span>{metric.label}</span>
              <strong>{metric.value}</strong>
              <small>{metric.detail}</small>
            </article>
          ))}
        </section>

        <section className="content">
          <article className="panel xl" id="ordens">
            <div className="panelHeader">
              <div>
                <p className="eyebrow">Fila priorizada</p>
                <h2>Ordens em andamento</h2>
              </div>
              <span className="pill danger">Urgencias primeiro</span>
            </div>

            <div className="ordersTable">
              <div className="tableHead">
                <span>OS</span>
                <span>Cliente</span>
                <span>Equipamento</span>
                <span>Status</span>
                <span>ETA</span>
              </div>
              {orders.map((order) => (
                <div className="tableRow" key={order.id}>
                  <strong>{order.id}</strong>
                  <span>
                    {order.customer}
                    <small>{order.issue}</small>
                  </span>
                  <span>{order.equipment}</span>
                  <span>
                    {order.status}
                    <small>{order.technician}</small>
                  </span>
                  <b>{order.eta}</b>
                </div>
              ))}
            </div>
          </article>

          <article className="panel" id="agenda">
            <div className="panelHeader">
              <div>
                <p className="eyebrow">Roteirizacao</p>
                <h2>Agenda inteligente</h2>
              </div>
              <span className="pill">Mapa</span>
            </div>
            <div className="map">
              <span className="pin p1" />
              <span className="pin p2" />
              <span className="pin p3" />
              <span className="route" />
            </div>
            <p className="muted">No MVP, agenda manual com tempo de deslocamento. Depois, sugestao automatica por localizacao, urgencia e especialidade.</p>
          </article>

          <article className="panel" id="orcamentos">
            <div className="panelHeader">
              <div>
                <p className="eyebrow">Aprovacao</p>
                <h2>Orcamentos</h2>
              </div>
              <span className="pill">Link cliente</span>
            </div>
            <div className="stack">
              {quotes.map((quote) => (
                <div className="quote" key={quote.number}>
                  <strong>{quote.number}</strong>
                  <span>{quote.customer}</span>
                  <b>{quote.total}</b>
                  <small>{quote.status}</small>
                </div>
              ))}
            </div>
          </article>

          <article className="panel" id="checklists">
            <div className="panelHeader">
              <div>
                <p className="eyebrow">Qualidade</p>
                <h2>Checklists tecnicos</h2>
              </div>
            </div>
            <div className="stack">
              {checklists.map((checklist) => (
                <div className="simpleItem" key={checklist.name}>
                  <strong>{checklist.name}</strong>
                  <span>{checklist.items} itens</span>
                  <small>{checklist.requiredPhotos ? "Fotos obrigatorias" : "Fotos opcionais"}</small>
                </div>
              ))}
            </div>
          </article>

          <article className="panel xl" id="contratos">
            <div className="panelHeader">
              <div>
                <p className="eyebrow">Receita recorrente</p>
                <h2>Contratos de manutencao</h2>
              </div>
              <span className="pill">3, 4 ou 6 meses</span>
            </div>
            <div className="contractGrid">
              {contracts.map((contract) => (
                <div className="contract" key={contract.customer}>
                  <strong>{contract.customer}</strong>
                  <span>{contract.plan}</span>
                  <small>{contract.recurrence}</small>
                  <b>{contract.nextVisit}</b>
                  <em>{contract.status}</em>
                </div>
              ))}
            </div>
          </article>

          <article className="panel" id="mapas">
            <div className="panelHeader">
              <div>
                <p className="eyebrow">Plantas</p>
                <h2>Mapa de equipamentos</h2>
              </div>
              <span className="pill">{floorPlan.equipmentCount} aparelhos</span>
            </div>
            <div className="floorPlan">
              {floorPlan.points.map((point) => (
                <span className="equipmentPoint" style={{ left: point.left, top: point.top }} title={`${point.label} - ${point.code}`} key={point.code}>
                  {point.code.slice(-2)}
                </span>
              ))}
            </div>
            <p className="muted">{floorPlan.customer} - {floorPlan.name}</p>
          </article>

          <article className="panel" id="qr">
            <div className="panelHeader">
              <div>
                <p className="eyebrow">Etiquetas</p>
                <h2>QR Code por equipamento</h2>
              </div>
              <span className="pill">Impressao</span>
            </div>
            <div className="stack">
              {qrLabels.map((label) => (
                <div className="qrLabel" key={label.code}>
                  <div className="qrBox">{label.code.slice(-2)}</div>
                  <div>
                    <strong>{label.code}</strong>
                    <span>{label.customer}</span>
                    <small>{label.location}</small>
                  </div>
                </div>
              ))}
            </div>
          </article>

          <article className="panel" id="campo">
            <div className="panelHeader">
              <div>
                <p className="eyebrow">Equipe</p>
                <h2>Campo e terceirizados</h2>
              </div>
            </div>
            <div className="stack">
              {technicians.map((tech) => (
                <div className="tech" key={tech.name}>
                  <strong>{tech.name}</strong>
                  <span>{tech.kind} - {tech.status}</span>
                  <small>{tech.location}</small>
                </div>
              ))}
            </div>
          </article>

          <article className="panel" id="estoque">
            <div className="panelHeader">
              <div>
                <p className="eyebrow">Mini ERP</p>
                <h2>Estoque critico</h2>
              </div>
            </div>
            <div className="stack">
              {stockAlerts.map((part) => (
                <div className="stock" key={part.item}>
                  <strong>{part.item}</strong>
                  <span>{part.location}</span>
                  <b>{part.balance}</b>
                  <small>{part.status}</small>
                </div>
              ))}
            </div>
          </article>

          <article className="panel" id="manuais">
            <div className="panelHeader">
              <div>
                <p className="eyebrow">Biblioteca</p>
                <h2>Manuais no app</h2>
              </div>
            </div>
            <div className="stack">
              {manuals.map((manual) => (
                <div className="simpleItem" key={manual.title}>
                  <strong>{manual.title}</strong>
                  <span>{manual.detail}</span>
                </div>
              ))}
            </div>
          </article>

          <article className="panel xl" id="ia">
            <div className="panelHeader">
              <div>
                <p className="eyebrow">Assistente IA</p>
                <h2>Revisao tecnica e sugestao de causa</h2>
              </div>
              <span className="pill">Assistivo</span>
            </div>
            <div className="aiGrid">
              <div>
                <span className="label">Texto do tecnico</span>
                <p className="note">limpei filtro e tava com pouco gas, precisa olhar vazamento</p>
              </div>
              <div>
                <span className="label">Versao profissional</span>
                <p className="note improved">Foi realizada a limpeza dos filtros e identificada baixa carga de fluido refrigerante. Recomenda-se teste de estanqueidade para verificar possivel vazamento.</p>
              </div>
            </div>
          </article>

          <article className="panel" id="whitelabel">
            <div className="panelHeader">
              <div>
                <p className="eyebrow">Multiempresa</p>
                <h2>Whitelabel</h2>
              </div>
            </div>
            <dl className="settings">
              <dt>Empresa piloto</dt>
              <dd>{tenant.name}</dd>
              <dt>E-mail</dt>
              <dd>{tenant.email}</dd>
              <dt>Regra</dt>
              <dd>ICEMAX e tenant, nao codigo fixo.</dd>
            </dl>
          </article>

          <article className="panel" id="notificacoes">
            <div className="panelHeader">
              <div>
                <p className="eyebrow">Comunicacao</p>
                <h2>Notificacoes</h2>
              </div>
            </div>
            <div className="stack">
              {notifications.map((notification) => (
                <div className="simpleItem" key={`${notification.channel}-${notification.subject}`}>
                  <strong>{notification.subject}</strong>
                  <span>{notification.channel}</span>
                  <small>{notification.status}</small>
                </div>
              ))}
            </div>
          </article>

          <article className="panel xl">
            <div className="panelHeader">
              <div>
                <p className="eyebrow">Fluxo padrao</p>
                <h2>Ciclo da OS</h2>
              </div>
            </div>
            <div className="flow">
              {serviceFlow.map((step, index) => (
                <span key={step} className={index < 3 ? "done" : ""}>{step}</span>
              ))}
            </div>
          </article>
        </section>
      </main>
    </div>
  );
}
