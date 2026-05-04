import assert from "node:assert/strict";
import { test } from "node:test";
import { buildApp } from "../src/app";

test("health and dashboard respond in mock mode", async () => {
  const app = await buildApp();

  const health = await app.inject({ method: "GET", url: "/health" });
  assert.equal(health.statusCode, 200);
  assert.equal(health.json().ok, true);

  const dashboard = await app.inject({ method: "GET", url: "/dashboard" });
  assert.equal(dashboard.statusCode, 200);
  assert.ok(Array.isArray(dashboard.json().metrics));

  await app.close();
});

test("core create endpoints validate and accept mock payloads", async () => {
  const app = await buildApp();

  const customer = await app.inject({
    method: "POST",
    url: "/customers",
    payload: { name: "Cliente Teste", email: "cliente@teste.local", phone: "+5500000000000" },
  });
  assert.equal(customer.statusCode, 201);

  const invalidCustomer = await app.inject({
    method: "POST",
    url: "/customers",
    payload: { name: "A" },
  });
  assert.equal(invalidCustomer.statusCode, 400);

  const order = await app.inject({
    method: "POST",
    url: "/service-orders",
    payload: { customerId: "customer-001", title: "Atendimento teste", priority: "normal" },
  });
  assert.equal(order.statusCode, 201);

  const filteredOrders = await app.inject({
    method: "GET",
    url: "/service-orders?priority=emergency",
  });
  assert.equal(filteredOrders.statusCode, 200);
  assert.equal(filteredOrders.json().data[0].priority, "emergency");

  await app.close();
});

test("service order execution flow accepts mock records", async () => {
  const app = await buildApp();

  const note = await app.inject({
    method: "POST",
    url: "/service-orders/1048/notes",
    payload: { rawText: "limpeza realizada" },
  });
  assert.equal(note.statusCode, 201);

  const status = await app.inject({
    method: "PATCH",
    url: "/service-orders/1048/status",
    payload: { status: "completed", customerSignedName: "Cliente Teste" },
  });
  assert.equal(status.statusCode, 200);

  const report = await app.inject({
    method: "POST",
    url: "/service-orders/1048/report",
  });
  assert.equal(report.statusCode, 201);
  assert.match(report.json().url, /^\/files\/reports\/os-1048\.(pdf|html)$/);

  const completionReview = await app.inject({
    method: "GET",
    url: "/service-orders/1048/completion-review",
  });
  assert.equal(completionReview.statusCode, 200);
  assert.equal(completionReview.json().serviceOrderId, "1048");
  assert.ok(completionReview.json().checks.length >= 5);
  assert.match(completionReview.json().reportDraft.professionalSummary, /Foi identificado/);

  const upload = await app.inject({
    method: "POST",
    url: "/files",
    payload: {
      folder: "uploads",
      fileName: "teste-os.txt",
      mimeType: "text/plain",
      base64: Buffer.from("arquivo teste").toString("base64"),
    },
  });
  assert.equal(upload.statusCode, 201);
  assert.match(upload.json().url, /^\/files\/uploads\/teste-os.txt$/);

  await app.close();
});

test("contracts stock integrations quote endpoints accept mock flow", async () => {
  const app = await buildApp();

  const visits = await app.inject({
    method: "POST",
    url: "/contracts/contract-001/visits/generate",
    payload: { occurrences: 3 },
  });
  assert.equal(visits.statusCode, 201);
  assert.equal(visits.json().data.length, 3);

  const calendar = await app.inject({
    method: "GET",
    url: "/contracts/maintenance-calendar?occurrences=2&fromDate=2026-05-03",
  });
  assert.equal(calendar.statusCode, 200);
  assert.equal(calendar.json().summary.contractsCovered, 3);
  assert.equal(calendar.json().summary.totalVisits, 6);
  assert.equal(calendar.json().data[0].status, "due_soon");

  const billingPlan = await app.inject({
    method: "GET",
    url: "/contracts/contract-001/billing-plan",
  });
  assert.equal(billingPlan.statusCode, 200);
  assert.equal(billingPlan.json().contractId, "contract-001");
  assert.equal(billingPlan.json().installments.length, 12);
  assert.equal(billingPlan.json().billingRules.dueDay, 10);

  const movement = await app.inject({
    method: "POST",
    url: "/stock-movements",
    payload: { partId: "part-001", toLocationId: "loc-001", quantity: 1, reason: "entrada teste" },
  });
  assert.equal(movement.statusCode, 201);

  const notification = await app.inject({
    method: "POST",
    url: "/notifications/send",
    payload: { channel: "whatsapp", recipient: "+5500000000000", body: "Mensagem teste" },
  });
  assert.equal(notification.statusCode, 202);

  const decision = await app.inject({
    method: "PATCH",
    url: "/quotes/quote-001/decision",
    payload: { decision: "approved", customerName: "Cliente Teste" },
  });
  assert.equal(decision.statusCode, 200);

  const qr = await app.inject({
    method: "POST",
    url: "/qr-labels",
    payload: {
      equipmentCode: "ICM-AC-9000",
      equipment: "Split teste",
      customer: "Cliente Teste",
      installLocation: "Sala tecnica",
    },
  });
  assert.equal(qr.statusCode, 201);
  assert.match(qr.json().fileUrl, /^\/files\/qr-labels\/ICM-AC-9000.svg$/);

  const floorPlan = await app.inject({
    method: "GET",
    url: "/floor-plans/floor-001/operational-view",
  });
  assert.equal(floorPlan.statusCode, 200);
  assert.equal(floorPlan.json().floorPlan.id, "floor-001");
  assert.ok(floorPlan.json().summary.totalPoints >= 3);
  assert.ok(floorPlan.json().points[0].qrPayload);

  const audit = await app.inject({
    method: "GET",
    url: "/audit-log",
  });
  assert.equal(audit.statusCode, 200);
  assert.ok(audit.json().total >= 1);

  await app.close();
});

test("dispatch location and route optimization endpoints respond", async () => {
  const app = await buildApp();

  const locations = await app.inject({
    method: "GET",
    url: "/technicians/locations",
  });
  assert.equal(locations.statusCode, 200);
  assert.ok(locations.json().total >= 1);

  const location = await app.inject({
    method: "POST",
    url: "/technicians/tech-001/location",
    payload: {
      latitude: -23.55,
      longitude: -46.63,
      accuracy: 20,
      serviceOrderId: "1048",
    },
  });
  assert.equal(location.statusCode, 201);

  const route = await app.inject({
    method: "POST",
    url: "/dispatch/routes/optimize",
    payload: {
      technicianUserId: "tech-001",
      serviceOrderIds: ["1048", "1049", "1050"],
    },
  });
  assert.equal(route.statusCode, 201);
  assert.equal(route.json().stops[0].serviceOrderId, "1048");
  assert.ok(route.json().totalTravelMinutes > 0);

  const recommendations = await app.inject({
    method: "GET",
    url: "/dispatch/recommendations?serviceOrderIds=1048,1049,1050",
  });
  assert.equal(recommendations.statusCode, 200);
  assert.equal(recommendations.json().summary.serviceOrders, 3);
  assert.equal(recommendations.json().data[0].serviceOrderId, "1048");
  assert.ok(recommendations.json().data[0].recommendedTechnician.score > 0);

  const readiness = await app.inject({
    method: "GET",
    url: "/dispatch/service-orders/1048/readiness?technicianUserId=tech-001",
  });
  assert.equal(readiness.statusCode, 200);
  assert.equal(readiness.json().serviceOrderId, "1048");
  assert.ok(["ready", "attention", "blocked"].includes(readiness.json().status));
  assert.ok(readiness.json().checks.length >= 5);

  await app.close();
});

test("local ai assistant improves text and suggests causes", async () => {
  const app = await buildApp();

  const improved = await app.inject({
    method: "POST",
    url: "/ai/text-improve",
    payload: {
      text: "limpei filtro e tava com pouco gas",
      tone: "professional",
    },
  });
  assert.equal(improved.statusCode, 201);
  assert.match(improved.json().outputText, /avaliacao tecnica/);

  const causes = await app.inject({
    method: "POST",
    url: "/ai/issue-cause-suggestions",
    payload: {
      description: "serpentina congelada e nao gela",
      photoHints: ["gelo na evaporadora"],
      equipmentType: "split",
    },
  });
  assert.equal(causes.statusCode, 201);
  assert.ok(causes.json().suggestions.length >= 1);

  await app.close();
});

test("customer portal can request optional service order", async () => {
  const app = await buildApp();

  const config = await app.inject({
    method: "GET",
    url: "/customer-portal/icemax/config",
  });
  assert.equal(config.statusCode, 200);
  assert.equal(config.json().serviceOrderOpeningEnabled, true);

  const order = await app.inject({
    method: "POST",
    url: "/customer-portal/service-orders",
    payload: {
      tenantSlug: "icemax",
      customerName: "Cliente Portal",
      customerEmail: "cliente.portal@local.dev",
      customerPhone: "+5500000000000",
      address: "Rua Teste, 100",
      equipmentType: "Split",
      problemDescription: "Nao esta refrigerando",
      urgency: "high",
      allowWhatsapp: true,
    },
  });
  assert.equal(order.statusCode, 201);
  assert.equal(order.json().openedBy, "customer_portal");

  await app.close();
});

test("business operations suite connects ten management flows", async () => {
  const app = await buildApp();
  const now = new Date().toISOString();
  const dueDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

  const sla = await app.inject({ method: "GET", url: "/sla/board" });
  assert.equal(sla.statusCode, 200);
  assert.ok(sla.json().total >= 1);

  const warranty = await app.inject({
    method: "POST",
    url: "/warranty-terms",
    payload: {
      serviceOrderId: "1048",
      customerId: "customer-001",
      coverageDays: 90,
      coverageText: "Garantia de mao de obra conforme condicoes do atendimento.",
    },
  });
  assert.equal(warranty.statusCode, 201);

  const pmoc = await app.inject({
    method: "POST",
    url: "/pmoc/plans",
    payload: {
      customerId: "customer-001",
      name: "PMOC ClimaSul",
      responsibleTechnician: "Rafael Martins",
      startDate: now,
      equipmentIds: ["equipment-001"],
      inspectionFrequencyMonths: 3,
    },
  });
  assert.equal(pmoc.statusCode, 201);

  const invoice = await app.inject({
    method: "POST",
    url: "/billing/invoices/draft",
    payload: {
      customerId: "customer-001",
      serviceOrderIds: ["1048"],
      dueDate,
      items: [{ description: "Atendimento corretivo", quantity: 1, unitPrice: 450 }],
    },
  });
  assert.equal(invoice.statusCode, 201);
  assert.equal(invoice.json().total, 450);

  const onboarding = await app.inject({
    method: "POST",
    url: "/technicians/onboarding",
    payload: {
      name: "Tecnico Terceiro",
      phone: "+5500000000000",
      kind: "outsourced",
      specialties: ["split"],
      documentStatus: "pending",
    },
  });
  assert.equal(onboarding.statusCode, 201);

  const maintenanceWindow = await app.inject({
    method: "POST",
    url: "/maintenance-windows",
    payload: {
      contractId: "contract-001",
      customerId: "customer-001",
      preferredWeekday: 2,
      preferredPeriod: "morning",
      recurrenceMonths: 3,
      nextDate: dueDate,
    },
  });
  assert.equal(maintenanceWindow.statusCode, 201);

  const survey = await app.inject({
    method: "POST",
    url: "/satisfaction-surveys",
    payload: {
      serviceOrderId: "1048",
      customerId: "customer-001",
      score: 9,
      comment: "Atendimento rapido.",
    },
  });
  assert.equal(survey.statusCode, 201);
  assert.equal(survey.json().npsGroup, "promoter");

  const postServicePlan = await app.inject({ method: "GET", url: "/service-orders/1048/post-service-plan" });
  assert.equal(postServicePlan.statusCode, 200);
  assert.equal(postServicePlan.json().serviceOrderId, "1048");
  assert.ok(postServicePlan.json().communication.channels.includes("email"));

  const contractOpportunity = await app.inject({ method: "GET", url: "/service-orders/1048/contract-opportunity" });
  assert.equal(contractOpportunity.statusCode, 200);
  assert.equal(contractOpportunity.json().serviceOrderId, "1048");
  assert.equal(contractOpportunity.json().recommendedPlan.recurrenceMonths, 3);
  assert.ok(contractOpportunity.json().opportunityScore >= 80);

  const contractProposal = await app.inject({ method: "GET", url: "/service-orders/1048/contract-proposal" });
  assert.equal(contractProposal.statusCode, 200);
  assert.equal(contractProposal.json().serviceOrderId, "1048");
  assert.equal(contractProposal.json().commercialTerms.minimumTermMonths, 12);
  assert.match(contractProposal.json().customerMessages.whatsappBody, /plano/i);

  const activationPlan = await app.inject({ method: "GET", url: "/service-orders/1048/contract-activation-plan" });
  assert.equal(activationPlan.statusCode, 200);
  assert.equal(activationPlan.json().serviceOrderId, "1048");
  assert.equal(activationPlan.json().firstYearCalendar.length, 4);
  assert.match(activationPlan.json().firstServiceOrderDraft.title, /Preventiva contratual/);

  const acceptancePackage = await app.inject({ method: "GET", url: "/service-orders/1048/contract-acceptance-package" });
  assert.equal(acceptancePackage.statusCode, 200);
  assert.equal(acceptancePackage.json().serviceOrderId, "1048");
  assert.equal(acceptancePackage.json().requiredChecks.length, 6);
  assert.match(acceptancePackage.json().acceptanceDocument.acceptanceText, /aceite/i);

  const acceptedContract = await app.inject({
    method: "POST",
    url: "/service-orders/1048/contract-acceptance/activate",
    payload: {
      acceptedByName: "Cliente Decisor",
      acceptedByDocument: "000.000.000-00",
      customerId: "customer-001",
      equipmentIds: ["equipment-001"],
      generateVisits: 4,
    },
  });
  assert.equal(acceptedContract.statusCode, 201);
  assert.equal(acceptedContract.json().status, "activated_mock");
  assert.equal(acceptedContract.json().createdEntities.visits, 4);
  assert.equal(acceptedContract.json().createdEntities.serviceOrders, 1);

  const timeline = await app.inject({ method: "GET", url: "/equipment/equipment-001/timeline" });
  assert.equal(timeline.statusCode, 200);
  assert.ok(timeline.json().total >= 1);

  const suggestions = await app.inject({ method: "GET", url: "/purchase-requests/suggestions" });
  assert.equal(suggestions.statusCode, 200);
  assert.ok(suggestions.json().total >= 1);

  const purchase = await app.inject({
    method: "POST",
    url: "/purchase-requests",
    payload: {
      partId: "part-001",
      quantity: 4,
      reason: "Reposicao de estoque minimo",
    },
  });
  assert.equal(purchase.statusCode, 201);

  const release = await app.inject({
    method: "POST",
    url: "/release-readiness",
    payload: {
      version: "0.5.5",
      checkedBy: "RAFAEL DA SILVA BEZEERA",
      includeSecurityReview: true,
    },
  });
  assert.equal(release.statusCode, 201);
  assert.equal(release.json().checks.length, 5);

  await app.close();
});

test("enterprise scale suite connects twenty expansion flows", async () => {
  const app = await buildApp();

  const requests = [
    app.inject({ method: "POST", url: "/whitelabel/brands", payload: { name: "ICEMAX Azul", description: "Tema piloto" } }),
    app.inject({ method: "POST", url: "/permissions/policies", payload: { name: "Politica Operacional", description: "Permissoes por papel" } }),
    app.inject({ method: "POST", url: "/security/incidents", payload: { name: "Tentativa suspeita", description: "Evento simulado" } }),
    app.inject({ method: "POST", url: "/lgpd/requests", payload: { customerId: "customer-001", requestType: "export", requesterEmail: "cliente@local.dev" } }),
    app.inject({ method: "POST", url: "/maps/geocode-preview", payload: { name: "Rua Teste, 100", description: "Endereco do cliente" } }),
    app.inject({ method: "POST", url: "/communications/preview", payload: { channel: "email", recipient: "cliente@local.dev", template: "os_concluida", variables: { os: "1048" } } }),
    app.inject({ method: "POST", url: "/communications/preview", payload: { channel: "whatsapp", recipient: "+5500000000000", template: "visita_agendada", variables: { data: "2026-05-10" } } }),
    app.inject({ method: "POST", url: "/communications/preview", payload: { channel: "push", recipient: "tech-001", template: "nova_os", variables: { os: "1048" } } }),
    app.inject({ method: "POST", url: "/service-catalog/items", payload: { name: "Higienizacao split", description: "Servico padrao" } }),
    app.inject({ method: "POST", url: "/price-books", payload: { name: "Tabela 2026", description: "Precos base" } }),
    app.inject({ method: "GET", url: "/kpis/executive" }),
    app.inject({ method: "POST", url: "/km-reimbursements", payload: { technicianUserId: "tech-001", serviceOrderId: "1048", kilometers: 36, ratePerKm: 1.35 } }),
    app.inject({ method: "POST", url: "/technician-payables", payload: { technicianUserId: "tech-001", serviceOrderIds: ["1048"], grossAmount: 300, discountAmount: 0 } }),
    app.inject({ method: "POST", url: "/contract-renewals", payload: { contractId: "contract-001", proposedRecurrenceMonths: 3, proposedValue: 1200 } }),
    app.inject({ method: "GET", url: "/customers/customer-001/health" }),
    app.inject({ method: "GET", url: "/equipment/equipment-001/depreciation" }),
    app.inject({ method: "POST", url: "/training/checklists", payload: { name: "Treinamento tecnico", description: "Checklist de integracao" } }),
    app.inject({ method: "POST", url: "/manuals/import-jobs", payload: { name: "Importacao Carrier", description: "Lote de manuais" } }),
    app.inject({ method: "POST", url: "/backup-plans", payload: { name: "Backup diario", frequency: "daily", retentionDays: 30 } }),
    app.inject({ method: "POST", url: "/incident-playbooks", payload: { name: "Falha API", description: "Resposta a incidente" } }),
  ];

  const responses = await Promise.all(requests);
  responses.forEach((response) => {
    assert.ok([200, 201].includes(response.statusCode));
  });
  assert.equal(responses.length, 20);
  assert.equal(responses[10].json().tenant, "ICEMAX Ar Condicionado");
  assert.equal(responses[19].json().steps.length, 5);

  await app.close();
});

test("acceleration suite connects and runs ninety nine giant lots", async () => {
  const app = await buildApp();

  const lots = await app.inject({
    method: "GET",
    url: "/acceleration/lots",
  });
  assert.equal(lots.statusCode, 200);
  assert.equal(lots.json().total, 99);
  assert.equal(lots.json().data[0].lot, 55);
  assert.equal(lots.json().data[98].lot, 153);

  const single = await app.inject({
    method: "POST",
    url: "/acceleration/lots/agenda-auto-confirmation/run",
  });
  assert.equal(single.statusCode, 201);
  assert.equal(single.json().status, "executed");

  const all = await app.inject({
    method: "POST",
    url: "/acceleration/lots/run-all",
  });
  assert.equal(all.statusCode, 201);
  assert.equal(all.json().connectedLots, 99);
  assert.equal(all.json().data.length, 99);

  await app.close();
});

test("platform diagnostics expose readiness catalog and role matrix", async () => {
  const app = await buildApp();

  const readiness = await app.inject({ method: "GET", url: "/platform/readiness" });
  assert.equal(readiness.statusCode, 200);
  assert.equal(readiness.json().tenant, "ICEMAX Ar Condicionado");
  assert.equal(readiness.json().mode, "mock");

  const modules = await app.inject({ method: "GET", url: "/platform/modules" });
  assert.equal(modules.statusCode, 200);
  assert.ok(modules.json().total >= 10);

  const roles = await app.inject({ method: "GET", url: "/platform/roles" });
  assert.equal(roles.statusCode, 200);
  assert.ok(roles.json().data.some((item: { role: string }) => item.role === "owner"));

  const diagnostics = await app.inject({ method: "GET", url: "/platform/diagnostics" });
  assert.equal(diagnostics.statusCode, 200);
  assert.equal(diagnostics.json().validation.zod, true);

  const gate = await app.inject({ method: "GET", url: "/platform/pre-release-gate" });
  assert.equal(gate.statusCode, 200);
  assert.equal(gate.json().status, "blocked");
  assert.ok(gate.json().checks.length >= 5);

  const endOfDay = await app.inject({ method: "GET", url: "/platform/end-of-day-snapshot" });
  assert.equal(endOfDay.statusCode, 200);
  assert.equal(endOfDay.json().project, "ICEMAX");
  assert.equal(endOfDay.json().github.pushAuthorizedByRafael, true);
  assert.ok(endOfDay.json().nextRecommendedBlocks.length >= 3);

  await app.close();
});

test("homologation contracts observability and demo snapshot are available", async () => {
  const app = await buildApp();

  const contracts = await app.inject({ method: "GET", url: "/api-contract/routes" });
  assert.equal(contracts.statusCode, 200);
  assert.ok(contracts.json().total >= 10);

  const scenarios = await app.inject({ method: "GET", url: "/homologation/scenarios" });
  assert.equal(scenarios.statusCode, 200);
  assert.equal(scenarios.json().total, 4);

  const run = await app.inject({ method: "POST", url: "/homologation/scenarios/os-completa/run" });
  assert.equal(run.statusCode, 201);
  assert.equal(run.json().status, "passed_mock");

  const observability = await app.inject({ method: "GET", url: "/observability/summary" });
  assert.equal(observability.statusCode, 200);
  assert.equal(observability.json().signals[0].status, "healthy");

  const snapshot = await app.inject({ method: "GET", url: "/demo-data/snapshot" });
  assert.equal(snapshot.statusCode, 200);
  assert.equal(snapshot.json().tenant.name, "ICEMAX Ar Condicionado");

  await app.close();
});

test("database transition exposes cutover schema seed and environment plans", async () => {
  const app = await buildApp();

  const cutover = await app.inject({ method: "GET", url: "/database/cutover-plan" });
  assert.equal(cutover.statusCode, 200);
  assert.equal(cutover.json().targetMode, "prisma");

  const schema = await app.inject({ method: "GET", url: "/database/schema-summary" });
  assert.equal(schema.statusCode, 200);
  assert.ok(schema.json().totalModelsReferenced >= 20);

  const seed = await app.inject({ method: "GET", url: "/database/seed-plan" });
  assert.equal(seed.statusCode, 200);
  assert.equal(seed.json().devLogin.email, "adm.rcsolutions@gmail.com");

  const env = await app.inject({ method: "GET", url: "/database/environment-checklist" });
  assert.equal(env.statusCode, 200);
  assert.ok(env.json().requiredForPrisma.includes("DATABASE_URL"));

  await app.close();
});
