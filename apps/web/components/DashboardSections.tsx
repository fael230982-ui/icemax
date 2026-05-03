import {
  checklists,
  contracts,
  equipmentList,
  executionFlow,
  floorPlan,
  integrations,
  manuals,
  notifications,
  orders,
  qrLabels,
  quality,
  quotes,
  serviceFlow,
  stockAlerts,
  technicians,
  customers,
} from "../app/data";
import { Panel } from "./Panel";
import { OperationsConsole } from "./forms/OperationsConsole";
import { QuickCreatePanel } from "./forms/QuickCreatePanel";

export function DashboardSections() {
  return (
    <section className="content">
      <Panel eyebrow="Operacao" title="Acoes rapidas" wide>
        <QuickCreatePanel />
      </Panel>

      <Panel eyebrow="Operacao" title="Console conectado" wide>
        <OperationsConsole />
      </Panel>

      <Panel id="ordens" eyebrow="Fila priorizada" title="Ordens em andamento" action={<span className="pill danger">Urgencias primeiro</span>} wide>
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
      </Panel>

      <Panel eyebrow="Execucao de campo" title="Fluxo da OS" action={<span className="pill">App tecnico</span>} wide>
        <div className="contractGrid">
          {executionFlow.map((step) => (
            <div className="contract" key={step.label}>
              <strong>{step.label}</strong>
              <span>{step.status}</span>
            </div>
          ))}
        </div>
      </Panel>

      <Panel id="clientes" eyebrow="CRM tecnico" title="Clientes">
        <div className="stack">
          {customers.map((customer) => (
            <div className="simpleItem" key={customer.name}>
              <strong>{customer.name}</strong>
              <span>{customer.email}</span>
              <small>{customer.contracts} contratos / {customer.equipment} equipamentos</small>
            </div>
          ))}
        </div>
      </Panel>

      <Panel id="equipamentos" eyebrow="Ativos" title="Equipamentos">
        <div className="stack">
          {equipmentList.map((item) => (
            <div className="simpleItem" key={item.serial}>
              <strong>{item.serial}</strong>
              <span>{item.model}</span>
              <small>{item.customer} - {item.location}</small>
            </div>
          ))}
        </div>
      </Panel>

      <Panel id="agenda" eyebrow="Roteirizacao" title="Agenda inteligente" action={<span className="pill">Mapa</span>}>
        <div className="map">
          <span className="pin p1" />
          <span className="pin p2" />
          <span className="pin p3" />
          <span className="route" />
        </div>
        <p className="muted">No MVP, agenda manual com tempo de deslocamento. Depois, sugestao automatica por localizacao, urgencia e especialidade.</p>
      </Panel>

      <Panel id="contratos" eyebrow="Receita recorrente" title="Contratos de manutencao" action={<span className="pill">3, 4 ou 6 meses</span>} wide>
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
      </Panel>

      <Panel id="pmoc" eyebrow="Qualidade" title="PMOC, KM e satisfacao" action={<span className="pill">PCM</span>}>
        <div className="miniGrid">
          {quality.map((item) => (
            <div className="miniMetric" key={item.label}>
              <span>{item.label}</span>
              <strong>{item.value}</strong>
            </div>
          ))}
        </div>
      </Panel>

      <Panel id="orcamentos" eyebrow="Aprovacao" title="Orcamentos" action={<span className="pill">Link cliente</span>}>
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
      </Panel>

      <Panel id="checklists" eyebrow="Qualidade" title="Checklists tecnicos">
        <div className="stack">
          {checklists.map((checklist) => (
            <div className="simpleItem" key={checklist.name}>
              <strong>{checklist.name}</strong>
              <span>{checklist.items} itens</span>
              <small>{checklist.requiredPhotos ? "Fotos obrigatorias" : "Fotos opcionais"}</small>
            </div>
          ))}
        </div>
      </Panel>

      <Panel id="mapas" eyebrow="Plantas" title="Mapa de equipamentos" action={<span className="pill">{floorPlan.equipmentCount} aparelhos</span>}>
        <div className="floorPlan">
          {floorPlan.points.map((point) => (
            <span className="equipmentPoint" style={{ left: point.left, top: point.top }} title={`${point.label} - ${point.code}`} key={point.code}>
              {point.code.slice(-2)}
            </span>
          ))}
        </div>
        <p className="muted">{floorPlan.customer} - {floorPlan.name}</p>
      </Panel>

      <Panel id="qr" eyebrow="Etiquetas" title="QR Code por equipamento" action={<span className="pill">Impressao</span>}>
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
      </Panel>

      <Panel id="campo" eyebrow="Equipe" title="Campo e terceirizados">
        <div className="stack">
          {technicians.map((tech) => (
            <div className="tech" key={tech.name}>
              <strong>{tech.name}</strong>
              <span>{tech.kind} - {tech.status}</span>
              <small>{tech.location}</small>
            </div>
          ))}
        </div>
      </Panel>

      <Panel id="estoque" eyebrow="Mini ERP" title="Estoque critico">
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
      </Panel>

      <Panel id="manuais" eyebrow="Biblioteca" title="Manuais no app">
        <div className="stack">
          {manuals.map((manual) => (
            <div className="simpleItem" key={manual.title}>
              <strong>{manual.title}</strong>
              <span>{manual.detail}</span>
            </div>
          ))}
        </div>
      </Panel>

      <Panel id="ia" eyebrow="Assistente IA" title="Revisao tecnica e sugestao de causa" action={<span className="pill">Assistivo</span>} wide>
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
      </Panel>

      <Panel id="whitelabel" eyebrow="Multiempresa" title="Whitelabel">
        <dl className="settings">
          <dt>Empresa piloto</dt>
          <dd>ICEMAX Ar Condicionado</dd>
          <dt>E-mail</dt>
          <dd>adm.rcsolutions@gmail.com</dd>
          <dt>Regra</dt>
          <dd>ICEMAX e tenant, nao codigo fixo.</dd>
        </dl>
      </Panel>

      <Panel id="notificacoes" eyebrow="Comunicacao" title="Notificacoes">
        <div className="stack">
          {notifications.map((notification) => (
            <div className="simpleItem" key={`${notification.channel}-${notification.subject}`}>
              <strong>{notification.subject}</strong>
              <span>{notification.channel}</span>
              <small>{notification.status}</small>
            </div>
          ))}
        </div>
      </Panel>

      <Panel id="integracoes" eyebrow="Setup" title="Integracoes externas">
        <div className="stack">
          {integrations.map((integration) => (
            <div className="simpleItem" key={integration.name}>
              <strong>{integration.name}</strong>
              <span>{integration.purpose}</span>
              <small>{integration.status}</small>
            </div>
          ))}
        </div>
      </Panel>

      <Panel eyebrow="Fluxo padrao" title="Ciclo da OS" wide>
        <div className="flow">
          {serviceFlow.map((step, index) => (
            <span key={step} className={index < 3 ? "done" : ""}>{step}</span>
          ))}
        </div>
      </Panel>
    </section>
  );
}
