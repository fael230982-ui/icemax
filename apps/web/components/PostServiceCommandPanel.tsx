"use client";

import { useEffect, useState } from "react";
import { icemaxApi } from "../lib/api";

type PostServiceTask = {
  key: string;
  label: string;
  owner: string;
  due: string;
  status: string;
};

type PostServiceCommandResponse = {
  serviceOrderId: string;
  customer: string;
  equipment: string;
  status: string;
  summary: {
    warrantyDays: number;
    followUpDate: string;
    satisfactionAfterHours: number;
    commercialScore: number;
    priority: string;
  };
  tasks: PostServiceTask[];
  commercial: {
    opportunityStatus: string;
    score: number;
    nextActions: string[];
  };
  governance: {
    auditEvent: string;
    requiresCloseoutArchive: boolean;
    requiresCustomerConsentForSurvey: boolean;
  };
};

const fallbackPostService: PostServiceCommandResponse = {
  serviceOrderId: "1048",
  customer: "ClimaSul Hotel",
  equipment: "Carrier Piso Teto 60.000 BTUs",
  status: "post_service_active",
  summary: {
    warrantyDays: 90,
    followUpDate: "2026-05-06",
    satisfactionAfterHours: 2,
    commercialScore: 78,
    priority: "emergency",
  },
  tasks: [
    { key: "send_final_report", label: "Enviar relatorio final", owner: "operacao", due: "2026-05-04", status: "pending_provider" },
    { key: "issue_warranty", label: "Emitir termo de garantia", owner: "qualidade", due: "2026-05-04", status: "ready" },
    { key: "satisfaction_survey", label: "Enviar pesquisa de satisfacao", owner: "sucesso_cliente", due: "2026-05-06", status: "scheduled" },
  ],
  commercial: {
    opportunityStatus: "recommended",
    score: 78,
    nextActions: ["Verificar oportunidade de contrato recorrente."],
  },
  governance: {
    auditEvent: "post_service.command_center_viewed",
    requiresCloseoutArchive: true,
    requiresCustomerConsentForSurvey: true,
  },
};

function taskStatusLabel(status: string) {
  const labels: Record<string, string> = {
    pending_provider: "Aguardando provedor",
    ready: "Pronto",
    scheduled: "Agendado",
    priority: "Prioritario",
    recommended: "Recomendado",
    monitor: "Monitorar",
  };

  return labels[status] ?? status.replaceAll("_", " ");
}

export function PostServiceCommandPanel() {
  const [serviceOrderId, setServiceOrderId] = useState("1048");
  const [command, setCommand] = useState<PostServiceCommandResponse>(fallbackPostService);
  const [source, setSource] = useState("fallback local");

  useEffect(() => {
    let active = true;

    void icemaxApi.postServiceCommandCenter(serviceOrderId)
      .then((response) => {
        if (active) {
          setCommand(response as PostServiceCommandResponse);
          setSource("API local");
        }
      })
      .catch(() => {
        if (active) {
          setCommand(fallbackPostService);
          setSource("fallback local");
        }
      });

    return () => {
      active = false;
    };
  }, [serviceOrderId]);

  return (
    <div className="postServicePanel">
      <div className="postServiceControls">
        <label>
          OS
          <select value={serviceOrderId} onChange={(event) => setServiceOrderId(event.target.value)}>
            <option value="1048">1048</option>
            <option value="1049">1049</option>
            <option value="1050">1050</option>
          </select>
        </label>
        <div>
          <span>Origem</span>
          <strong>{source}</strong>
        </div>
        <div>
          <span>Garantia</span>
          <strong>{command.summary.warrantyDays} dias</strong>
        </div>
        <div>
          <span>Follow-up</span>
          <strong>{command.summary.followUpDate}</strong>
        </div>
        <div>
          <span>Score comercial</span>
          <strong>{command.summary.commercialScore}</strong>
        </div>
      </div>

      <div className="postServiceHeader">
        <div>
          <span>OS {command.serviceOrderId}</span>
          <strong>{command.customer}</strong>
          <small>{command.equipment}</small>
        </div>
        <div>
          <span>Pesquisa</span>
          <strong>{command.summary.satisfactionAfterHours}h apos atendimento</strong>
          <small>{command.governance.requiresCustomerConsentForSurvey ? "Exige consentimento do cliente" : "Sem consentimento adicional"}</small>
        </div>
        <div>
          <span>Comercial</span>
          <strong>{taskStatusLabel(command.commercial.opportunityStatus)}</strong>
          <small>{command.commercial.nextActions[0]}</small>
        </div>
      </div>

      <div className="postServiceTasks">
        {command.tasks.map((task) => (
          <article key={task.key}>
            <span>{taskStatusLabel(task.status)}</span>
            <strong>{task.label}</strong>
            <small>{task.owner} - {task.due}</small>
          </article>
        ))}
      </div>
    </div>
  );
}
