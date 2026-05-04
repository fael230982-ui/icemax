"use client";

import { useEffect, useMemo, useState } from "react";
import { icemaxApi } from "../lib/api";

type PipelineRow = {
  serviceOrderId: string;
  customer: string;
  equipment: string;
  issue: string;
  priority: string;
  stage: string;
  opportunityScore: number;
  recommendedPlan: {
    name: string;
    recurrenceMonths: number;
    visitsPerYear: number;
    estimatedMonthlyValue: number;
    estimatedAnnualValue: number;
  };
  recurringRevenue: {
    monthly: number;
    annual: number;
  };
  nextContactDate: string;
  risks: string[];
  nextAction: string;
};

type PipelineResponse = {
  generatedAt: string;
  summary: {
    opportunities: number;
    priority: number;
    recommended: number;
    nurture: number;
    existingContracts: number;
    estimatedMonthlyRevenue: number;
  };
  rows: PipelineRow[];
};

const fallbackPipeline: PipelineResponse = {
  generatedAt: "offline",
  summary: {
    opportunities: 3,
    priority: 1,
    recommended: 1,
    nurture: 1,
    existingContracts: 0,
    estimatedMonthlyRevenue: 950,
  },
  rows: [
    {
      serviceOrderId: "1048",
      customer: "ClimaSul Hotel",
      equipment: "Carrier Piso Teto 60.000 BTUs",
      issue: "Sem refrigeracao",
      priority: "emergency",
      stage: "proposal_priority",
      opportunityScore: 92,
      recommendedPlan: {
        name: "Contrato Essencial Trimestral",
        recurrenceMonths: 3,
        visitsPerYear: 4,
        estimatedMonthlyValue: 390,
        estimatedAnnualValue: 4680,
      },
      recurringRevenue: {
        monthly: 390,
        annual: 4680,
      },
      nextContactDate: "2026-05-06",
      risks: ["Cliente teve urgencia; abordar preventiva sem parecer oportunismo."],
      nextAction: "Preparar proposta recorrente e abordar decisor no follow-up.",
    },
  ],
};

function stageLabel(stage: string) {
  const labels: Record<string, string> = {
    proposal_priority: "Proposta prioritaria",
    proposal_recommended: "Proposta recomendada",
    nurture: "Nutrir",
    existing_contract: "Contrato ativo",
  };

  return labels[stage] ?? stage.replaceAll("_", " ");
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  }).format(value);
}

export function ContractOpportunityPipelinePanel() {
  const [pipeline, setPipeline] = useState<PipelineResponse>(fallbackPipeline);
  const [source, setSource] = useState("fallback local");
  const [stageFilter, setStageFilter] = useState("all");

  useEffect(() => {
    let active = true;

    void icemaxApi.contractOpportunityPipeline()
      .then((response) => {
        if (active) {
          setPipeline(response as PipelineResponse);
          setSource("API local");
        }
      })
      .catch(() => {
        if (active) {
          setPipeline(fallbackPipeline);
          setSource("fallback local");
        }
      });

    return () => {
      active = false;
    };
  }, []);

  const rows = useMemo(
    () => pipeline.rows.filter((row) => stageFilter === "all" || row.stage === stageFilter),
    [pipeline.rows, stageFilter],
  );

  return (
    <div className="pipelinePanel">
      <div className="pipelineSummary">
        <article>
          <span>Oportunidades</span>
          <strong>{pipeline.summary.opportunities}</strong>
        </article>
        <article className="attention">
          <span>Prioritarias</span>
          <strong>{pipeline.summary.priority}</strong>
        </article>
        <article>
          <span>Receita mensal</span>
          <strong>{formatCurrency(pipeline.summary.estimatedMonthlyRevenue)}</strong>
        </article>
        <article>
          <span>Contratos ativos</span>
          <strong>{pipeline.summary.existingContracts}</strong>
        </article>
      </div>

      <div className="pipelineControls">
        <div>
          <span>Origem</span>
          <strong>{source}</strong>
        </div>
        <label>
          Etapa
          <select value={stageFilter} onChange={(event) => setStageFilter(event.target.value)}>
            <option value="all">Todas</option>
            <option value="proposal_priority">Proposta prioritaria</option>
            <option value="proposal_recommended">Proposta recomendada</option>
            <option value="nurture">Nutrir</option>
            <option value="existing_contract">Contrato ativo</option>
          </select>
        </label>
        <div>
          <span>Resultado</span>
          <strong>{rows.length} oportunidades</strong>
        </div>
      </div>

      <div className="pipelineRows">
        {rows.map((row) => (
          <article key={row.serviceOrderId}>
            <div>
              <span>OS {row.serviceOrderId}</span>
              <strong>{row.customer}</strong>
              <small>{row.equipment}</small>
            </div>
            <div>
              <span>{stageLabel(row.stage)}</span>
              <strong>{row.opportunityScore}</strong>
              <small>{row.priority} - {row.issue}</small>
            </div>
            <div>
              <span>Plano</span>
              <strong>{row.recommendedPlan.name}</strong>
              <small>{row.recommendedPlan.visitsPerYear} visitas/ano</small>
            </div>
            <div>
              <span>Receita</span>
              <strong>{formatCurrency(row.recurringRevenue.monthly)}/mes</strong>
              <small>{formatCurrency(row.recurringRevenue.annual)}/ano</small>
            </div>
            <div>
              <span>Proxima acao</span>
              <strong>{row.nextAction}</strong>
              <small>{row.nextContactDate}</small>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
