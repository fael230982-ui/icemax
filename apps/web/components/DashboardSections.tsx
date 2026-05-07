"use client";

import { useState } from "react";
import {
  contracts,
  equipmentList,
  floorPlan,
  integrations,
  metrics,
  orders,
  quality,
  quotes,
  stockAlerts,
  technicians,
} from "../app/data";
import { OperationsConsole } from "./forms/OperationsConsole";

const actionButtons = [
  {
    label: "Despachar tecnico",
    result: "Rafael Martins mantido na emergencia #1048. Joao Pereira recebeu rota otimizada para #1049.",
  },
  {
    label: "Enviar relatorio",
    result: "Relatorio final mockado enviado para o e-mail da empresa, com copia opcional para o cliente.",
  },
  {
    label: "Gerar QR",
    result: "Etiqueta QR criada para ICM-AC-0004 e vinculada ao historico do equipamento.",
  },
  {
    label: "Criar contrato",
    result: "Proposta de contrato trimestral preparada para Clinica Vida, com agenda preventiva sugerida.",
  },
];

const tabCards = {
  Operacao: [
    { title: "OS critica", value: orders[0].id, detail: `${orders[0].customer} - ${orders[0].issue}` },
    { title: "Equipe em campo", value: "3", detail: "2 internos e 1 terceirizado com acesso limitado" },
    { title: "SLA em risco", value: "1", detail: "Emergencia sem refrigeracao em atendimento" },
  ],
  Agenda: [
    { title: "Proxima chegada", value: orders[2].eta, detail: `${orders[2].technician} para ${orders[2].customer}` },
    { title: "Preventivas", value: "6", detail: "Visitas proximas por contratos recorrentes" },
    { title: "Mapa ativo", value: floorPlan.equipmentCount.toString(), detail: `${floorPlan.name} - ${floorPlan.customer}` },
  ],
  Financeiro: [
    { title: "Orcamentos", value: quotes.length.toString(), detail: "Aprovacao e aceite digital no portal" },
    { title: "Contratos", value: contracts.length.toString(), detail: "Recorrencias de 3, 4 e 6 meses" },
    { title: "Estoque critico", value: stockAlerts.filter((item) => item.status === "Critico").length.toString(), detail: "Reposicao sugerida antes do despacho" },
  ],
  Configuracao: [
    { title: "Whitelabel", value: "Ativo", detail: "ICEMAX como tenant piloto sem codigo fixo" },
    { title: "Integracoes", value: integrations.length.toString(), detail: "Maps, OpenAI, WhatsApp e e-mail preparados" },
    { title: "Qualidade", value: quality[3].value, detail: "Satisfacao usada no painel gerencial" },
  ],
};

const tabs = Object.keys(tabCards) as Array<keyof typeof tabCards>;

export function DashboardSections() {
  const [activeTab, setActiveTab] = useState<keyof typeof tabCards>("Operacao");
  const [lastAction, setLastAction] = useState("Nenhuma acao executada nesta sessao.");
  const [activity, setActivity] = useState([
    "Fila priorizada recalculada com urgencias primeiro.",
    "Contrato da Clinica Vida pronto para proxima visita.",
    "Estoque de R410A marcado como critico.",
  ]);

  function runMockAction(result: string) {
    setLastAction(result);
    setActivity((items) => [result, ...items].slice(0, 5));
  }

  return (
    <section className="commandCenter" id="dashboard">
      <div className="commandHero">
        <div>
          <p className="eyebrow">Visao do dia</p>
          <h2>Operacao pronta para decidir, despachar e fechar OS sem ruído.</h2>
          <p>
            Primeira tela compacta para diretoria, atendimento e coordenacao tecnica. Os modulos continuam existindo,
            mas o cockpit mostra apenas o que precisa de decisao agora.
          </p>
        </div>
        <div className="heroStats">
          {metrics.map((metric) => (
            <article className={`heroMetric ${metric.tone}`} key={metric.label}>
              <span>{metric.label}</span>
              <strong>{metric.value}</strong>
              <small>{metric.detail}</small>
            </article>
          ))}
        </div>
      </div>

      <div className="commandGrid">
        <article className="commandPanel priorityPanel" id="ordens">
          <div className="panelHeader">
            <div>
              <p className="eyebrow">Fila priorizada</p>
              <h2>Ordens que exigem atencao</h2>
            </div>
            <span className="pill danger">Urgencias primeiro</span>
          </div>

          <div className="priorityList">
            {orders.map((order) => (
              <button className="priorityRow" key={order.id} onClick={() => runMockAction(`${order.id} selecionada: ${order.customer} - ${order.status}.`)}>
                <span>
                  <strong>{order.id}</strong>
                  <small>{order.priority}</small>
                </span>
                <span>
                  <b>{order.customer}</b>
                  <small>{order.equipment}</small>
                </span>
                <span>
                  <b>{order.status}</b>
                  <small>{order.technician}</small>
                </span>
                <em>{order.eta}</em>
              </button>
            ))}
          </div>
        </article>

        <aside className="commandPanel actionDock">
          <div className="panelHeader">
            <div>
              <p className="eyebrow">Comando rapido</p>
              <h2>Acoes mockadas funcionais</h2>
            </div>
          </div>
          <div className="actionButtons">
            {actionButtons.map((action) => (
              <button key={action.label} onClick={() => runMockAction(action.result)}>
                {action.label}
              </button>
            ))}
          </div>
          <div className="actionResult">
            <span>Ultima acao</span>
            <p>{lastAction}</p>
          </div>
        </aside>
      </div>

      <div className="insightGrid">
        <article className="commandPanel" id="agenda">
          <div className="panelHeader">
            <div>
              <p className="eyebrow">Mapa e agenda</p>
              <h2>Equipe em movimento</h2>
            </div>
          </div>
          <div className="routePreview">
            <span className="routeLine" />
            {technicians.map((tech, index) => (
              <button
                className={`techMarker marker${index + 1}`}
                key={tech.name}
                onClick={() => runMockAction(`${tech.name}: ${tech.status}. ${tech.location}.`)}
              >
                {index + 1}
              </button>
            ))}
          </div>
          <div className="compactList">
            {technicians.map((tech) => (
              <div key={tech.name}>
                <strong>{tech.name}</strong>
                <span>{tech.kind} - {tech.status}</span>
              </div>
            ))}
          </div>
        </article>

        <article className="commandPanel" id="contratos">
          <div className="panelHeader">
            <div>
              <p className="eyebrow">Receita recorrente</p>
              <h2>Contratos ativos</h2>
            </div>
          </div>
          <div className="compactList">
            {contracts.map((contract) => (
              <button className="contractRow" key={contract.customer} onClick={() => runMockAction(`Contrato ${contract.customer}: ${contract.status} em ${contract.nextVisit}.`)}>
                <strong>{contract.customer}</strong>
                <span>{contract.recurrence}</span>
                <small>{contract.nextVisit}</small>
              </button>
            ))}
          </div>
        </article>

        <article className="commandPanel" id="estoque">
          <div className="panelHeader">
            <div>
              <p className="eyebrow">Mini ERP</p>
              <h2>Pecas que travam OS</h2>
            </div>
          </div>
          <div className="compactList">
            {stockAlerts.map((part) => (
              <button className="stockRow" key={part.item} onClick={() => runMockAction(`${part.item}: ${part.balance} em ${part.location}.`)}>
                <strong>{part.item}</strong>
                <span>{part.location}</span>
                <small>{part.status}</small>
              </button>
            ))}
          </div>
        </article>
      </div>

      <article className="commandPanel moduleSurface" id="campo">
        <div className="panelHeader">
          <div>
            <p className="eyebrow">Modulos executivos</p>
            <h2>Resumo por area</h2>
          </div>
          <div className="segmentTabs" role="tablist" aria-label="Modulos do cockpit">
            {tabs.map((tab) => (
              <button className={tab === activeTab ? "active" : ""} key={tab} onClick={() => setActiveTab(tab)} type="button">
                {tab}
              </button>
            ))}
          </div>
        </div>
        <div className="moduleGrid">
          {tabCards[activeTab].map((card) => (
            <div className="moduleCard" key={card.title}>
              <span>{card.title}</span>
              <strong>{card.value}</strong>
              <p>{card.detail}</p>
            </div>
          ))}
        </div>
        <div className="activityFeed">
          <strong>Atividade recente</strong>
          {activity.map((item) => (
            <span key={item}>{item}</span>
          ))}
        </div>
      </article>

      <article className="commandPanel assetSurface">
        <div className="panelHeader">
          <div>
            <p className="eyebrow">Ativos e QR</p>
            <h2>Mapa interativo enxuto</h2>
          </div>
          <span className="pill">{floorPlan.equipmentCount} aparelhos</span>
        </div>
        <div className="floorPlan premiumPlan">
          {floorPlan.points.map((point) => (
            <button
              className="equipmentPoint premiumPoint"
              style={{ left: point.left, top: point.top }}
              key={point.code}
              onClick={() => runMockAction(`${point.code}: ${point.label} selecionado para historico, manual e QR.`)}
            >
              {point.code.slice(-2)}
            </button>
          ))}
        </div>
        <div className="equipmentStrip">
          {equipmentList.map((item) => (
            <span key={item.serial}>{item.serial} - {item.location}</span>
          ))}
        </div>
      </article>

      <details className="advancedConsole" id="console">
        <summary>
          <span>Console tecnico avancado</span>
          <strong>API, testes de fluxo e rotinas completas</strong>
        </summary>
        <OperationsConsole />
      </details>
    </section>
  );
}
