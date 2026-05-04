"use client";

import { useEffect, useMemo, useState } from "react";
import { icemaxApi } from "../lib/api";

type CapacityWeek = {
  weekStart: string;
  visits: number;
  coveredEquipment: number;
  loadPercent: number;
  status: string;
  contracts: number;
  recommendedAction: string;
};

type CriticalVisit = {
  contractId: string;
  customer: string;
  plan: string;
  expectedDate: string;
  status: string;
  coveredEquipment: number;
  recommendedAction: string;
};

type CapacityBoardResponse = {
  generatedAt: string;
  summary: {
    totalVisits: number;
    dueSoon: number;
    overdue: number;
    healthyWeeks: number;
    attentionWeeks: number;
    overCapacityWeeks: number;
    weeklyCapacity: number;
    weeklyEquipmentCapacity: number;
  };
  weeks: CapacityWeek[];
  criticalVisits: CriticalVisit[];
};

const fallbackCapacity: CapacityBoardResponse = {
  generatedAt: "offline",
  summary: {
    totalVisits: 12,
    dueSoon: 2,
    overdue: 0,
    healthyWeeks: 3,
    attentionWeeks: 1,
    overCapacityWeeks: 0,
    weeklyCapacity: 8,
    weeklyEquipmentCapacity: 45,
  },
  weeks: [
    {
      weekStart: "2026-05-11",
      visits: 2,
      coveredEquipment: 26,
      loadPercent: 58,
      status: "healthy",
      contracts: 2,
      recommendedAction: "Capacidade saudavel para manter agenda preventiva.",
    },
  ],
  criticalVisits: [],
};

function capacityStatusLabel(status: string) {
  const labels: Record<string, string> = {
    healthy: "Saudavel",
    attention: "Atencao",
    over_capacity: "Acima da capacidade",
    due_soon: "Proxima",
    overdue: "Atrasada",
    planned: "Planejada",
  };

  return labels[status] ?? status.replaceAll("_", " ");
}

export function ContractCapacityBoardPanel() {
  const [board, setBoard] = useState<CapacityBoardResponse>(fallbackCapacity);
  const [source, setSource] = useState("fallback local");
  const [onlyAttention, setOnlyAttention] = useState(false);

  useEffect(() => {
    let active = true;

    void icemaxApi.contractCapacityBoard()
      .then((response) => {
        if (active) {
          setBoard(response as CapacityBoardResponse);
          setSource("API local");
        }
      })
      .catch(() => {
        if (active) {
          setBoard(fallbackCapacity);
          setSource("fallback local");
        }
      });

    return () => {
      active = false;
    };
  }, []);

  const weeks = useMemo(
    () => board.weeks.filter((week) => !onlyAttention || week.status !== "healthy"),
    [board.weeks, onlyAttention],
  );

  return (
    <div className="capacityPanel">
      <div className="capacitySummary">
        <article>
          <span>Visitas</span>
          <strong>{board.summary.totalVisits}</strong>
        </article>
        <article className="attention">
          <span>Proximas</span>
          <strong>{board.summary.dueSoon}</strong>
        </article>
        <article>
          <span>Semanas em atencao</span>
          <strong>{board.summary.attentionWeeks + board.summary.overCapacityWeeks}</strong>
        </article>
        <article>
          <span>Capacidade</span>
          <strong>{board.summary.weeklyCapacity}/semana</strong>
        </article>
      </div>

      <div className="capacityControls">
        <div>
          <span>Origem</span>
          <strong>{source}</strong>
        </div>
        <div>
          <span>Capacidade equipamento</span>
          <strong>{board.summary.weeklyEquipmentCapacity}/semana</strong>
        </div>
        <label>
          <input type="checkbox" checked={onlyAttention} onChange={(event) => setOnlyAttention(event.target.checked)} />
          Mostrar apenas semanas criticas
        </label>
      </div>

      <div className="capacityWeeks">
        {weeks.map((week) => (
          <article key={week.weekStart}>
            <div>
              <span>{capacityStatusLabel(week.status)}</span>
              <strong>{week.weekStart}</strong>
              <small>{week.contracts} contratos</small>
            </div>
            <div>
              <span>Carga</span>
              <strong>{week.loadPercent}%</strong>
              <small>{week.visits} visitas / {week.coveredEquipment} equipamentos</small>
            </div>
            <div>
              <span>Acao</span>
              <strong>{week.recommendedAction}</strong>
            </div>
          </article>
        ))}
      </div>

      <div className="capacityCritical">
        {board.criticalVisits.slice(0, 4).map((visit) => (
          <article key={`${visit.contractId}-${visit.expectedDate}`}>
            <span>{capacityStatusLabel(visit.status)}</span>
            <strong>{visit.customer}</strong>
            <small>{visit.expectedDate} - {visit.coveredEquipment} equipamentos</small>
          </article>
        ))}
      </div>
    </div>
  );
}
