"use client";

import { FormEvent, useState } from "react";
import { icemaxApi } from "../../lib/api";

function encodeTextFile(content: string) {
  return btoa(unescape(encodeURIComponent(content)));
}

export function OperationsConsole() {
  const [token, setToken] = useState("");
  const [status, setStatus] = useState("Pronto para operar com a API local.");
  const [result, setResult] = useState("");

  async function run(label: string, action: () => Promise<unknown>) {
    try {
      setStatus(`${label}: enviando...`);
      const response = await action();
      setResult(JSON.stringify(response, null, 2));
      setStatus(`${label}: concluido.`);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Falha inesperada.");
    }
  }

  function submitCustomer(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    void run("Cliente", () =>
      icemaxApi.createCustomer({
        name: String(form.get("name")),
        email: String(form.get("email")),
        phone: String(form.get("phone")),
      }, token || undefined),
    );
  }

  function submitOrder(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    void run("OS", () =>
      icemaxApi.createServiceOrder({
        customerId: String(form.get("customerId")),
        equipmentId: String(form.get("equipmentId")) || undefined,
        title: String(form.get("title")),
        description: String(form.get("description")),
        priority: String(form.get("priority")),
      }, token || undefined),
    );
  }

  function submitQr(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    void run("Etiqueta QR", () =>
      icemaxApi.createQrLabel({
        equipmentCode: String(form.get("equipmentCode")),
        equipment: String(form.get("equipment")),
        customer: String(form.get("customer")),
        installLocation: String(form.get("installLocation")),
      }, token || undefined),
    );
  }

  function uploadSample() {
    void run("Upload", () =>
      icemaxApi.uploadFile({
        folder: "uploads",
        fileName: `relatorio-campo-${Date.now()}.txt`,
        mimeType: "text/plain",
        base64: encodeTextFile("Arquivo tecnico gerado pelo painel ICEMAX."),
      }, token || undefined),
    );
  }

  function loadAudit() {
    void run("Auditoria", () => icemaxApi.auditLog(token || undefined));
  }

  function optimizeRoute() {
    void run("Rota otimizada", () =>
      icemaxApi.optimizeRoute({
        technicianUserId: "tech-001",
        serviceOrderIds: ["1048", "1049", "1050"],
      }, token || undefined),
    );
  }

  function loadLocations() {
    void run("Localizacao da equipe", () => icemaxApi.technicianLocations(token || undefined));
  }

  function improveText() {
    void run("Revisao IA", () =>
      icemaxApi.improveText({
        text: "limpei filtro e tava com pouco gas, precisa olhar vazamento",
        tone: "professional",
      }, token || undefined),
    );
  }

  function suggestCauses() {
    void run("Causas provaveis", () =>
      icemaxApi.suggestCauses({
        description: "serpentina congelada e cliente relata que nao gela",
        photoHints: ["gelo na evaporadora", "filtro sujo"],
        equipmentType: "split",
      }, token || undefined),
    );
  }

  function createPortalOrder() {
    void run("Portal do cliente", () =>
      icemaxApi.createPortalOrder({
        tenantSlug: "icemax",
        customerName: "Cliente Portal",
        customerEmail: "cliente.portal@local.dev",
        customerPhone: "+5500000000000",
        address: "Rua Teste, 100",
        equipmentType: "Split Hi Wall",
        equipmentLabel: "Sala principal",
        problemDescription: "Equipamento nao esta refrigerando adequadamente.",
        urgency: "high",
        allowWhatsapp: true,
      }),
    );
  }

  function runBusinessSuite() {
    void run("Suite operacional", async () => {
      const now = new Date().toISOString();
      const dueDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
      const results = await Promise.all([
        icemaxApi.slaBoard(token || undefined),
        icemaxApi.createWarrantyTerm({
          serviceOrderId: "1048",
          customerId: "customer-001",
          coverageDays: 90,
          coverageText: "Garantia de mao de obra conforme condicoes do atendimento.",
          exclusions: ["mau uso", "intervencao de terceiros"],
        }, token || undefined),
        icemaxApi.createPmocPlan({
          customerId: "customer-001",
          name: "PMOC ClimaSul",
          responsibleTechnician: "Rafael Martins",
          startDate: now,
          equipmentIds: ["equipment-001"],
          inspectionFrequencyMonths: 3,
        }, token || undefined),
        icemaxApi.createInvoiceDraft({
          customerId: "customer-001",
          serviceOrderIds: ["1048"],
          dueDate,
          items: [{ description: "Atendimento corretivo", quantity: 1, unitPrice: 450 }],
        }, token || undefined),
        icemaxApi.onboardTechnician({
          name: "Tecnico Terceiro",
          phone: "+5500000000000",
          kind: "outsourced",
          specialties: ["split", "cassete"],
          documentStatus: "pending",
        }, token || undefined),
        icemaxApi.createMaintenanceWindow({
          contractId: "contract-001",
          customerId: "customer-001",
          preferredWeekday: 2,
          preferredPeriod: "morning",
          recurrenceMonths: 3,
          nextDate: dueDate,
        }, token || undefined),
        icemaxApi.recordSatisfactionSurvey({
          serviceOrderId: "1048",
          customerId: "customer-001",
          score: 9,
          comment: "Atendimento rapido.",
        }, token || undefined),
        icemaxApi.equipmentTimeline("equipment-001", token || undefined),
        icemaxApi.purchaseSuggestions(token || undefined),
        icemaxApi.createPurchaseRequest({
          partId: "part-001",
          quantity: 4,
          reason: "Reposicao de estoque minimo",
        }, token || undefined),
        icemaxApi.createReleaseReadiness({
          version: "0.5.5",
          checkedBy: "RAFAEL DA SILVA BEZEERA",
          includeSecurityReview: true,
        }, token || undefined),
      ]);

      return { modules: results.length, results };
    });
  }

  function filterOrders(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    void run("Filtro de OS", () =>
      icemaxApi.serviceOrders(token || undefined, {
        status: String(form.get("status")) || undefined,
        priority: String(form.get("priority")) || undefined,
        customer: String(form.get("customer")) || undefined,
      }),
    );
  }

  return (
    <div className="opsConsole">
      <div className="opsHeader">
        <div>
          <p className="eyebrow">Console operacional</p>
          <h2>Cadastros, filtros, arquivos e auditoria</h2>
          <span>{status}</span>
        </div>
        <input value={token} onChange={(event) => setToken(event.target.value)} placeholder="Token JWT opcional" aria-label="Token JWT opcional" />
      </div>

      <div className="formGrid">
        <form onSubmit={submitCustomer}>
          <strong>Novo cliente</strong>
          <input name="name" placeholder="Nome" defaultValue="Condominio Central" />
          <input name="email" placeholder="E-mail" defaultValue="cliente@local.dev" />
          <input name="phone" placeholder="Telefone" defaultValue="+5500000000000" />
          <button type="submit">Criar cliente</button>
        </form>

        <form onSubmit={submitOrder}>
          <strong>Nova OS</strong>
          <input name="customerId" placeholder="Cliente ID" defaultValue="customer-001" />
          <input name="equipmentId" placeholder="Equipamento ID" defaultValue="equipment-001" />
          <input name="title" placeholder="Titulo" defaultValue="Atendimento corretivo" />
          <input name="description" placeholder="Descricao" defaultValue="Cliente relata baixa refrigeracao." />
          <select name="priority" defaultValue="high">
            <option value="normal">Normal</option>
            <option value="high">Alta</option>
            <option value="emergency">Emergencia</option>
          </select>
          <button type="submit">Criar OS</button>
        </form>

        <form onSubmit={submitQr}>
          <strong>Etiqueta QR</strong>
          <input name="equipmentCode" placeholder="Codigo" defaultValue="ICM-AC-0100" />
          <input name="equipment" placeholder="Equipamento" defaultValue="Split Hi Wall 18.000 BTUs" />
          <input name="customer" placeholder="Cliente" defaultValue="ClimaSul Hotel" />
          <input name="installLocation" placeholder="Local" defaultValue="Apartamento 204" />
          <button type="submit">Gerar etiqueta</button>
        </form>

        <form onSubmit={filterOrders}>
          <strong>Filtro de OS</strong>
          <input name="customer" placeholder="Cliente contem" />
          <select name="status" defaultValue="">
            <option value="">Todos os status</option>
            <option value="scheduled">Agendada</option>
            <option value="en_route">Em rota</option>
            <option value="in_progress">Em atendimento</option>
            <option value="completed">Concluida</option>
          </select>
          <select name="priority" defaultValue="">
            <option value="">Todas prioridades</option>
            <option value="normal">Normal</option>
            <option value="high">Alta</option>
            <option value="emergency">Emergencia</option>
          </select>
          <button type="submit">Buscar OS</button>
        </form>
      </div>

      <div className="opsActions">
        <button type="button" className="secondary" onClick={uploadSample}>Enviar arquivo teste</button>
        <button type="button" className="secondary" onClick={loadAudit}>Ver auditoria</button>
        <button type="button" className="secondary" onClick={loadLocations}>Ver equipe no mapa</button>
        <button type="button" className="secondary" onClick={optimizeRoute}>Otimizar rota</button>
        <button type="button" className="secondary" onClick={improveText}>Revisar texto IA</button>
        <button type="button" className="secondary" onClick={suggestCauses}>Sugerir causas</button>
        <button type="button" className="secondary" onClick={createPortalOrder}>OS pelo cliente</button>
        <button type="button" className="secondary" onClick={runBusinessSuite}>Rodar suite operacional</button>
      </div>

      {result ? <pre className="apiResult">{result}</pre> : null}
    </div>
  );
}
