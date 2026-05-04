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

  const storage = await app.inject({ method: "GET", url: "/files/storage-readiness" });
  assert.equal(storage.statusCode, 200);
  assert.equal(storage.json().publicAccessPolicy.default, "deny");
  assert.ok(storage.json().summary.privateRequired >= 3);
  assert.ok(storage.json().blockers[0].includes("STORAGE_DRIVER"));

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

  const capacityBoard = await app.inject({
    method: "GET",
    url: "/contracts/capacity-board?occurrences=4&fromDate=2026-05-03",
  });
  assert.equal(capacityBoard.statusCode, 200);
  assert.equal(capacityBoard.json().governance.auditEvent, "contracts.capacity_board_viewed");
  assert.ok(capacityBoard.json().summary.totalVisits >= 6);
  assert.ok(capacityBoard.json().weeks.length >= 1);
  assert.ok(capacityBoard.json().summary.weeklyCapacity > 0);

  const billingPlan = await app.inject({
    method: "GET",
    url: "/contracts/contract-001/billing-plan",
  });
  assert.equal(billingPlan.statusCode, 200);
  assert.equal(billingPlan.json().contractId, "contract-001");
  assert.equal(billingPlan.json().installments.length, 12);
  assert.equal(billingPlan.json().billingRules.dueDay, 10);

  const recurringBilling = await app.inject({
    method: "GET",
    url: "/billing/recurring-board",
  });
  assert.equal(recurringBilling.statusCode, 200);
  assert.equal(recurringBilling.json().governance.auditEvent, "billing.recurring_board_viewed");
  assert.ok(recurringBilling.json().summary.monthlyRecurringRevenue > 0);
  assert.ok(recurringBilling.json().rows.length >= 3);

  const receivablesBoard = await app.inject({
    method: "GET",
    url: "/billing/receivables-board",
  });
  assert.equal(receivablesBoard.statusCode, 200);
  assert.equal(receivablesBoard.json().governance.auditEvent, "billing.receivables_collection_board_viewed");
  assert.ok(receivablesBoard.json().summary.overdueTotal > 0);
  assert.ok(receivablesBoard.json().rows.some((row: { blocksAutomation: boolean }) => row.blocksAutomation));

  const collectionAutomation = await app.inject({
    method: "GET",
    url: "/billing/collection-automation-board",
  });
  assert.equal(collectionAutomation.statusCode, 200);
  assert.equal(collectionAutomation.json().governance.auditEvent, "billing.collection_automation_board_viewed");
  assert.ok(collectionAutomation.json().summary.readyToSend > 0);
  assert.ok(collectionAutomation.json().summary.blocked > 0);

  const serviceOrderCommunication = await app.inject({
    method: "GET",
    url: "/service-orders/1048/communication-package",
  });
  assert.equal(serviceOrderCommunication.statusCode, 200);
  assert.equal(serviceOrderCommunication.json().serviceOrderId, "1048");
  assert.ok(serviceOrderCommunication.json().messages.some((item: { channel: string }) => item.channel === "whatsapp"));
  assert.equal(serviceOrderCommunication.json().governance.auditEvent, "communication.service_order_package_prepared");

  const contractCommunication = await app.inject({
    method: "GET",
    url: "/contracts/contract-001/communication-package",
  });
  assert.equal(contractCommunication.statusCode, 200);
  assert.equal(contractCommunication.json().contractId, "contract-001");
  assert.ok(contractCommunication.json().automationRules.channels.includes("email"));
  assert.ok(contractCommunication.json().messages.some((item: { template: string }) => item.template === "contrato_mensalidade"));

  const serviceOrderQueue = await app.inject({
    method: "POST",
    url: "/service-orders/1048/communication-queue",
  });
  assert.equal(serviceOrderQueue.statusCode, 201);
  assert.equal(serviceOrderQueue.json().sourceType, "service_order");
  assert.equal(serviceOrderQueue.json().total, 3);
  assert.ok(serviceOrderQueue.json().items[0].idempotencyKey.includes("service_order:1048"));

  const contractQueue = await app.inject({
    method: "POST",
    url: "/contracts/contract-001/communication-queue",
  });
  assert.equal(contractQueue.statusCode, 201);
  assert.equal(contractQueue.json().sourceType, "contract");
  assert.equal(contractQueue.json().readyToSend, 3);
  assert.equal(contractQueue.json().preflight[3].status, "pending_external_key");

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

  const approvalPackage = await app.inject({
    method: "GET",
    url: "/quotes/quote-001/approval-package",
  });
  assert.equal(approvalPackage.statusCode, 200);
  assert.equal(approvalPackage.json().quoteId, "quote-001");
  assert.equal(approvalPackage.json().status, "approval_package_ready");
  assert.match(approvalPackage.json().publicUrl, /\/orcamentos\/quote_quote-001_/);
  assert.equal(approvalPackage.json().governance.decisionEndpoint, "/quotes/quote-001/decision");
  assert.match(approvalPackage.json().governance.publicDecisionEndpoint, /^\/public\/quotes\/quote_quote-001_/);
  assert.ok(approvalPackage.json().approvalOptions.length >= 2);

  const quoteCommunication = await app.inject({
    method: "GET",
    url: "/quotes/quote-001/communication-package",
  });
  assert.equal(quoteCommunication.statusCode, 200);
  assert.equal(quoteCommunication.json().quoteId, "quote-001");
  assert.equal(quoteCommunication.json().status, "quote_communication_ready");
  assert.ok(quoteCommunication.json().messages.some((item: { channel: string }) => item.channel === "whatsapp"));
  assert.equal(quoteCommunication.json().governance.auditEvent, "communication.quote_package_prepared");

  const quoteQueue = await app.inject({
    method: "POST",
    url: "/quotes/quote-001/communication-queue",
  });
  assert.equal(quoteQueue.statusCode, 201);
  assert.equal(quoteQueue.json().sourceType, "quote");
  assert.equal(quoteQueue.json().readyToSend, 3);
  assert.match(quoteQueue.json().approvalLink.publicUrl, /\/orcamentos\/quote_quote-001_/);

  const quoteHandoff = await app.inject({
    method: "GET",
    url: "/quotes/quote-001/decision-handoff",
  });
  assert.equal(quoteHandoff.statusCode, 200);
  assert.equal(quoteHandoff.json().quoteId, "quote-001");
  assert.equal(quoteHandoff.json().status, "waiting_customer_decision");
  assert.equal(quoteHandoff.json().governance.auditEvent, "quote.decision_handoff_prepared");

  const blockedActivation = await app.inject({
    method: "POST",
    url: "/quotes/quote-001/approval-activation",
  });
  assert.equal(blockedActivation.statusCode, 201);
  assert.equal(blockedActivation.json().status, "activation_blocked");
  assert.equal(blockedActivation.json().activationAllowed, false);

  const approvedActivation = await app.inject({
    method: "POST",
    url: "/quotes/quote-002/approval-activation",
  });
  assert.equal(approvedActivation.statusCode, 201);
  assert.equal(approvedActivation.json().status, "activation_ready");
  assert.equal(approvedActivation.json().activationAllowed, true);
  assert.equal(approvedActivation.json().audit.event, "quote.approval_activation_prepared");

  const executionReadiness = await app.inject({
    method: "GET",
    url: "/quotes/quote-002/execution-readiness",
  });
  assert.equal(executionReadiness.statusCode, 200);
  assert.equal(executionReadiness.json().quoteId, "quote-002");
  assert.equal(executionReadiness.json().canExecute, true);
  assert.equal(executionReadiness.json().governance.auditEvent, "quote.execution_readiness_checked");
  assert.ok(executionReadiness.json().checks.length >= 5);

  const quoteTimeline = await app.inject({
    method: "GET",
    url: "/quotes/quote-002/approval-timeline",
  });
  assert.equal(quoteTimeline.statusCode, 200);
  assert.equal(quoteTimeline.json().quoteId, "quote-002");
  assert.equal(quoteTimeline.json().status, "quote_timeline_ready");
  assert.equal(quoteTimeline.json().summary.activated, true);
  assert.ok(quoteTimeline.json().events.length >= 5);
  assert.equal(quoteTimeline.json().governance.auditEvent, "quote.approval_timeline_viewed");

  const quoteBoard = await app.inject({
    method: "GET",
    url: "/quotes/approval-board",
  });
  assert.equal(quoteBoard.statusCode, 200);
  assert.equal(quoteBoard.json().status, "quote_approval_board_ready");
  assert.equal(quoteBoard.json().summary.total, 2);
  assert.equal(quoteBoard.json().summary.approvedReadyToExecute, 1);
  assert.ok(quoteBoard.json().lanes.some((lane: { key: string }) => lane.key === "waiting_customer_decision"));
  assert.equal(quoteBoard.json().governance.auditEvent, "quote.approval_board_viewed");

  const quoteReminders = await app.inject({
    method: "POST",
    url: "/quotes/approval-reminders",
  });
  assert.equal(quoteReminders.statusCode, 201);
  assert.equal(quoteReminders.json().status, "quote_approval_reminders_ready");
  assert.ok(quoteReminders.json().total >= 2);
  assert.ok(quoteReminders.json().reminders.some((item: { channel: string }) => item.channel === "whatsapp_email"));
  assert.equal(quoteReminders.json().governance.auditEvent, "quote.approval_reminders_prepared");

  const publicQuote = await app.inject({
    method: "GET",
    url: `/public/quotes/${approvalPackage.json().token}`,
  });
  assert.equal(publicQuote.statusCode, 200);
  assert.equal(publicQuote.json().quoteId, "quote-001");
  assert.equal(publicQuote.json().token, approvalPackage.json().token);

  const missingTermsDecision = await app.inject({
    method: "PATCH",
    url: `/public/quotes/${approvalPackage.json().token}/decision`,
    payload: { decision: "approved", customerName: "Cliente Teste", acceptedTerms: false },
  });
  assert.equal(missingTermsDecision.statusCode, 400);

  const publicDecision = await app.inject({
    method: "PATCH",
    url: `/public/quotes/${approvalPackage.json().token}/decision`,
    payload: { decision: "approved", customerName: "Cliente Teste", acceptedTerms: true },
  });
  assert.equal(publicDecision.statusCode, 200);
  assert.equal(publicDecision.json().quoteId, "quote-001");
  assert.equal(publicDecision.json().status, "approved");

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

  const quoteQueue = await app.inject({
    method: "GET",
    url: "/dispatch/quote-execution-queue",
  });
  assert.equal(quoteQueue.statusCode, 200);
  assert.equal(quoteQueue.json().summary.approvedQuotes, 1);
  assert.equal(quoteQueue.json().data[0].quoteId, "quote-002");
  assert.equal(quoteQueue.json().governance.auditEvent, "dispatch.quote_execution_queue_viewed");
  assert.ok(["ready_for_dispatch", "needs_preparation"].includes(quoteQueue.json().data[0].status));

  const assignmentDecision = await app.inject({
    method: "POST",
    url: "/dispatch/assignment-decision",
    payload: {
      quoteId: "quote-002",
      serviceOrderId: "1049",
      technicianUserId: quoteQueue.json().data[0].recommendedTechnician.technicianUserId,
      decision: "accepted",
      reason: "Tecnico confirmou janela e rota.",
    },
  });
  assert.equal(assignmentDecision.statusCode, 201);
  assert.equal(assignmentDecision.json().status, "assignment_confirmed");
  assert.equal(assignmentDecision.json().audit.event, "dispatch.assignment_decision_recorded");

  const departureCommunication = await app.inject({
    method: "GET",
    url: "/dispatch/service-orders/1049/departure-communication?technicianUserId=tech-002&quoteId=quote-002",
  });
  assert.equal(departureCommunication.statusCode, 200);
  assert.equal(departureCommunication.json().serviceOrderId, "1049");
  assert.equal(departureCommunication.json().audit.event, "dispatch.departure_communication_prepared");
  assert.ok(departureCommunication.json().channels.length >= 3);

  const routeTracking = await app.inject({
    method: "GET",
    url: "/dispatch/service-orders/1049/route-tracking?technicianUserId=tech-002&quoteId=quote-002",
  });
  assert.equal(routeTracking.statusCode, 200);
  assert.equal(routeTracking.json().serviceOrderId, "1049");
  assert.equal(routeTracking.json().governance.auditEvent, "dispatch.route_tracking_viewed");
  assert.ok(routeTracking.json().timeline.length >= 4);

  const arrivalCheckIn = await app.inject({
    method: "GET",
    url: "/dispatch/service-orders/1049/arrival-checkin?technicianUserId=tech-002&quoteId=quote-002",
  });
  assert.equal(arrivalCheckIn.statusCode, 200);
  assert.equal(arrivalCheckIn.json().serviceOrderId, "1049");
  assert.equal(arrivalCheckIn.json().audit.event, "dispatch.arrival_checkin_package_prepared");
  assert.ok(arrivalCheckIn.json().checklistGate.length >= 5);

  const executionStart = await app.inject({
    method: "GET",
    url: "/dispatch/service-orders/1049/execution-start?technicianUserId=tech-002&quoteId=quote-002",
  });
  assert.equal(executionStart.statusCode, 200);
  assert.equal(executionStart.json().serviceOrderId, "1049");
  assert.equal(executionStart.json().audit.event, "field.execution_start_package_prepared");
  assert.ok(executionStart.json().requiredEvidence.length >= 5);

  const executionEvidence = await app.inject({
    method: "GET",
    url: "/dispatch/service-orders/1049/execution-evidence?technicianUserId=tech-002&quoteId=quote-002",
  });
  assert.equal(executionEvidence.statusCode, 200);
  assert.equal(executionEvidence.json().serviceOrderId, "1049");
  assert.equal(executionEvidence.json().audit.event, "field.execution_evidence_package_prepared");
  assert.ok(executionEvidence.json().evidenceItems.length >= 5);

  const executionCloseout = await app.inject({
    method: "GET",
    url: "/dispatch/service-orders/1049/execution-closeout?technicianUserId=tech-002&quoteId=quote-002",
  });
  assert.equal(executionCloseout.statusCode, 200);
  assert.equal(executionCloseout.json().serviceOrderId, "1049");
  assert.equal(executionCloseout.json().audit.event, "field.execution_closeout_package_prepared");
  assert.ok(executionCloseout.json().completionChecklist.length >= 5);
  assert.equal(executionCloseout.json().reportDraft.requiresAiReview, true);

  const customerSignature = await app.inject({
    method: "GET",
    url: "/dispatch/service-orders/1049/customer-signature?technicianUserId=tech-002&quoteId=quote-002",
  });
  assert.equal(customerSignature.statusCode, 200);
  assert.equal(customerSignature.json().serviceOrderId, "1049");
  assert.equal(customerSignature.json().audit.event, "field.customer_signature_package_prepared");
  assert.ok(customerSignature.json().captureFields.length >= 5);
  assert.equal(customerSignature.json().emailDecision.customerCopyOptional, true);

  const recordedCustomerSignature = await app.inject({
    method: "POST",
    url: "/dispatch/service-orders/1049/customer-signature",
    payload: {
      quoteId: "quote-002",
      technicianUserId: "tech-002",
      responsibleName: "Cliente Decisor",
      responsibleRole: "Gerente da unidade",
      emailCopyToCustomer: false,
      acceptedTerms: true,
      mobileOfflineId: "offline-signature-1049",
    },
  });
  assert.equal(recordedCustomerSignature.statusCode, 201);
  assert.equal(recordedCustomerSignature.json().serviceOrderId, "1049");
  assert.equal(recordedCustomerSignature.json().audit.event, "field.customer_signature_recorded");
  assert.equal(recordedCustomerSignature.json().emailCopyToCustomer, false);

  const completionEmail = await app.inject({
    method: "GET",
    url: "/dispatch/service-orders/1049/completion-email?technicianUserId=tech-002&quoteId=quote-002&emailCopyToCustomer=false",
  });
  assert.equal(completionEmail.statusCode, 200);
  assert.equal(completionEmail.json().serviceOrderId, "1049");
  assert.equal(completionEmail.json().audit.event, "field.completion_email_package_prepared");
  assert.equal(completionEmail.json().recipients.company, "adm.rcsolutions@gmail.com");
  assert.equal(completionEmail.json().deliveryPolicy.customerCopyOptional, true);

  const queuedCompletionEmail = await app.inject({
    method: "POST",
    url: "/dispatch/service-orders/1049/completion-email",
    payload: {
      quoteId: "quote-002",
      technicianUserId: "tech-002",
      emailCopyToCustomer: false,
      includeWarrantyTerms: true,
      mobileOfflineId: "offline-email-1049",
    },
  });
  assert.equal(queuedCompletionEmail.statusCode, 201);
  assert.equal(queuedCompletionEmail.json().serviceOrderId, "1049");
  assert.equal(queuedCompletionEmail.json().audit.event, "field.completion_email_queued");
  assert.equal(queuedCompletionEmail.json().recipients.copyToCustomer, false);

  const finalizationBoard = await app.inject({
    method: "GET",
    url: "/dispatch/finalization-board",
  });
  assert.equal(finalizationBoard.statusCode, 200);
  assert.equal(finalizationBoard.json().governance.auditEvent, "field.finalization_board_viewed");
  assert.ok(finalizationBoard.json().summary.serviceOrders >= 3);
  assert.ok(finalizationBoard.json().rows[0].serviceOrderId);
  assert.ok(finalizationBoard.json().rows[0].technicianUserId);

  const completionEmailQueue = await app.inject({
    method: "GET",
    url: "/dispatch/completion-email-queue",
  });
  assert.equal(completionEmailQueue.statusCode, 200);
  assert.equal(completionEmailQueue.json().governance.auditEvent, "field.completion_email_queue_viewed");
  assert.ok(completionEmailQueue.json().summary.total >= 3);
  assert.ok(completionEmailQueue.json().rows[0].recipients.company);

  const closeoutArchive = await app.inject({
    method: "GET",
    url: "/dispatch/service-orders/1048/closeout-archive",
  });
  assert.equal(closeoutArchive.statusCode, 200);
  assert.equal(closeoutArchive.json().governance.auditEvent, "field.closeout_archive_viewed");
  assert.equal(closeoutArchive.json().serviceOrderId, "1048");
  assert.ok(closeoutArchive.json().documents.length >= 5);
  assert.ok(closeoutArchive.json().timeline.length >= 5);

  const postServiceCommand = await app.inject({
    method: "GET",
    url: "/service-orders/1048/post-service-command-center",
  });
  assert.equal(postServiceCommand.statusCode, 200);
  assert.equal(postServiceCommand.json().governance.auditEvent, "post_service.command_center_viewed");
  assert.equal(postServiceCommand.json().serviceOrderId, "1048");
  assert.ok(postServiceCommand.json().tasks.length >= 5);
  assert.ok(postServiceCommand.json().summary.warrantyDays >= 60);

  const readiness = await app.inject({
    method: "GET",
    url: "/dispatch/service-orders/1048/readiness?technicianUserId=tech-001",
  });
  assert.equal(readiness.statusCode, 200);
  assert.equal(readiness.json().serviceOrderId, "1048");
  assert.ok(["ready", "attention", "blocked"].includes(readiness.json().status));
  assert.ok(readiness.json().checks.length >= 5);

  const preparation = await app.inject({
    method: "POST",
    url: "/dispatch/visit-preparation",
    payload: {
      serviceOrderId: "1048",
      technicianUserId: "tech-001",
      includeVisualDiagnosis: true,
      includeCustomerPortalEvidence: true,
    },
  });
  assert.equal(preparation.statusCode, 201);
  assert.equal(preparation.json().serviceOrderId, "1048");
  assert.ok(["ready_for_dispatch", "needs_preparation"].includes(preparation.json().status));
  assert.ok(preparation.json().preparationChecklist.length >= 5);
  assert.equal(preparation.json().diagnosis.status, "diagnosis_package_ready");
  assert.ok(preparation.json().nextActions.includes("Enviar pacote para o app mobile do tecnico."));

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

  const visualDiagnosis = await app.inject({
    method: "POST",
    url: "/ai/visual-diagnosis-package",
    payload: {
      serviceOrderId: "1048",
      equipmentType: "split piso teto",
      description: "Nao gela e foto mostra serpentina congelada",
      photoHints: ["gelo na evaporadora", "filtro sujo"],
      symptoms: ["vento fraco"],
    },
  });
  assert.equal(visualDiagnosis.statusCode, 201);
  assert.equal(visualDiagnosis.json().status, "diagnosis_package_ready");
  assert.ok(visualDiagnosis.json().likelyCauses.length >= 1);
  assert.ok(visualDiagnosis.json().riskFlags.includes("serpentina_congelada"));
  assert.ok(visualDiagnosis.json().fieldTests.length >= 5);

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

  const billingSummary = await app.inject({
    method: "GET",
    url: "/customer-portal/icemax/billing-summary",
  });
  assert.equal(billingSummary.statusCode, 200);
  assert.equal(billingSummary.json().privacy.hidesInternalMargin, true);
  assert.ok(billingSummary.json().summary.monthlyTotal > 0);
  assert.ok(billingSummary.json().contracts.length >= 3);

  const accessPolicy = await app.inject({
    method: "GET",
    url: "/customer-portal/icemax/access-policy",
  });
  assert.equal(accessPolicy.statusCode, 200);
  assert.equal(accessPolicy.json().enforcement.denyByDefaultInProduction, true);
  assert.ok(accessPolicy.json().zones.some((zone: { key: string }) => zone.key === "billing_summary"));
  assert.ok(accessPolicy.json().releaseChecks.length >= 4);

  const billingAccess = await app.inject({
    method: "POST",
    url: "/customer-portal/icemax/billing-access-link",
  });
  assert.equal(billingAccess.statusCode, 201);
  assert.match(billingAccess.json().token, /^billing_icemax_/);
  assert.equal(billingAccess.json().expiresInDays, 3);
  assert.equal(billingAccess.json().security.requiresCustomerIdentityInProduction, true);
  assert.ok(billingAccess.json().restrictions.some((item: string) => item.includes("margem interna")));

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
  assert.equal(order.json().triage.status, "triage_ready");
  assert.equal(order.json().triage.suggestedPriority, "high");

  const triage = await app.inject({
    method: "POST",
    url: "/customer-portal/triage",
    payload: {
      tenantSlug: "icemax",
      equipmentType: "Split",
      problemDescription: "Saiu fumaca e disjuntor caiu em sala de servidor",
      urgency: "normal",
      hasElectricalRisk: true,
      hasCriticalEnvironment: true,
      hasPhoto: true,
    },
  });
  assert.equal(triage.statusCode, 201);
  assert.equal(triage.json().suggestedPriority, "emergency");
  assert.equal(triage.json().dispatchGuidance.requiresSupervisorReview, true);
  assert.ok(triage.json().requiredChecklist.length >= 5);

  const tracking = await app.inject({
    method: "GET",
    url: "/customer-portal/service-orders/1048/tracking",
  });
  assert.equal(tracking.statusCode, 200);
  assert.equal(tracking.json().serviceOrderId, "1048");
  assert.equal(tracking.json().privacy.hidesFinancialData, true);
  assert.ok(tracking.json().timeline.length >= 5);
  assert.equal(tracking.json().refreshSeconds, 45);

  const trackingLink = await app.inject({
    method: "POST",
    url: "/customer-portal/service-orders/1048/tracking-link",
  });
  assert.equal(trackingLink.statusCode, 201);
  assert.equal(trackingLink.json().serviceOrderId, "1048");
  assert.match(trackingLink.json().token, /^track_1048_/);
  assert.equal(trackingLink.json().expiresInDays, 7);
  assert.ok(trackingLink.json().channels.some((item: { channel: string }) => item.channel === "whatsapp"));
  assert.equal(trackingLink.json().security.hidesFinancialData, true);

  const attachments = await app.inject({
    method: "POST",
    url: "/customer-portal/service-orders/1048/attachments",
    payload: {
      tenantSlug: "icemax",
      customerEmail: "cliente.portal@local.dev",
      attachments: [
        {
          fileName: "evaporadora-congelada.jpg",
          mimeType: "image/jpeg",
          sizeBytes: 420000,
          caption: "Foto mostra gelo na evaporadora.",
        },
        {
          fileName: "autorizacao.pdf",
          mimeType: "application/pdf",
          sizeBytes: 180000,
        },
      ],
    },
  });
  assert.equal(attachments.statusCode, 201);
  assert.equal(attachments.json().summary.photos, 1);
  assert.equal(attachments.json().summary.documents, 1);
  assert.equal(attachments.json().aiPreparation.readyForVisionAnalysis, true);
  assert.equal(attachments.json().privacy.requiresVirusScanBeforeStorage, true);

  await app.close();
});

test("business operations suite connects ten management flows", async () => {
  const app = await buildApp();
  const now = new Date().toISOString();
  const dueDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

  const sla = await app.inject({ method: "GET", url: "/sla/board" });
  assert.equal(sla.statusCode, 200);
  assert.ok(sla.json().total >= 1);

  const commandCenter = await app.inject({ method: "GET", url: "/operations/day-command-center" });
  assert.equal(commandCenter.statusCode, 200);
  assert.equal(commandCenter.json().tenant, "ICEMAX Ar Condicionado");
  assert.ok(commandCenter.json().summary.urgentOrders >= 1);
  assert.ok(commandCenter.json().dispatch.immediateDispatch.length >= 1);
  assert.ok(commandCenter.json().communications.contracts.length >= 1);

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

  const warrantyPackage = await app.inject({ method: "GET", url: "/service-orders/1048/warranty-package" });
  assert.equal(warrantyPackage.statusCode, 200);
  assert.equal(warrantyPackage.json().serviceOrderId, "1048");
  assert.equal(warrantyPackage.json().status, "warranty_ready");
  assert.ok(warrantyPackage.json().termDraft.coverageDays >= 60);
  assert.ok(warrantyPackage.json().operationalChecks.length >= 5);
  assert.match(warrantyPackage.json().customerMessages.emailSubject, /garantia/i);

  const manualPackage = await app.inject({ method: "GET", url: "/service-orders/1048/manual-package" });
  assert.equal(manualPackage.statusCode, 200);
  assert.equal(manualPackage.json().serviceOrderId, "1048");
  assert.equal(manualPackage.json().status, "manual_package_ready");
  assert.equal(manualPackage.json().selectedManual.brand, "Carrier");
  assert.ok(manualPackage.json().fieldChecklist.length >= 5);
  assert.equal(manualPackage.json().offlinePack.shouldCacheBeforeDispatch, true);

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

  const opportunityPipeline = await app.inject({ method: "GET", url: "/contracts/opportunity-pipeline" });
  assert.equal(opportunityPipeline.statusCode, 200);
  assert.equal(opportunityPipeline.json().governance.auditEvent, "commercial.contract_opportunity_pipeline_viewed");
  assert.ok(opportunityPipeline.json().summary.opportunities >= 3);
  assert.ok(opportunityPipeline.json().summary.estimatedMonthlyRevenue >= 0);
  assert.ok(opportunityPipeline.json().rows[0].opportunityScore >= opportunityPipeline.json().rows.at(-1).opportunityScore);

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

  const reservation = await app.inject({
    method: "POST",
    url: "/service-orders/1048/parts-reservation",
    payload: {
      technicianUserId: "tech-001",
      sourceLocation: "Almoxarifado",
      targetLocation: "Veiculo Rafael",
      requestedSkus: ["R410A", "CAP-45"],
    },
  });
  assert.equal(reservation.statusCode, 201);
  assert.equal(reservation.json().serviceOrderId, "1048");
  assert.ok(reservation.json().items.length >= 2);
  assert.equal(reservation.json().dispatchImpact.canDispatch, true);
  assert.ok(reservation.json().stockMovements.length >= 1);

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

  const readiness = await app.inject({ method: "GET", url: "/database/data-readiness-board" });
  assert.equal(readiness.statusCode, 200);
  assert.equal(readiness.json().governance.auditEvent, "database.data_readiness_board_viewed");
  assert.ok(readiness.json().summary.averageReadiness > 50);
  assert.ok(readiness.json().recommendedSequence.includes("clientes"));

  const isolation = await app.inject({ method: "GET", url: "/database/tenant-isolation-gate" });
  assert.equal(isolation.statusCode, 200);
  assert.equal(isolation.json().productionCutoverAllowed, false);
  assert.ok(isolation.json().summary.blocked >= 1);
  assert.ok(isolation.json().minimumRules[0].includes("tenantId"));

  const rollback = await app.inject({ method: "GET", url: "/database/rollback-drill" });
  assert.equal(rollback.statusCode, 200);
  assert.equal(rollback.json().dryRunOnly, true);
  assert.ok(rollback.json().blockedDestructiveCommands[0].includes("pg_restore"));
  assert.ok(rollback.json().goNoGoCriteria[0].includes("Backup"));

  await app.close();
});
