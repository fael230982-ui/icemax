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

  const audit = await app.inject({
    method: "GET",
    url: "/audit-log",
  });
  assert.equal(audit.statusCode, 200);
  assert.ok(audit.json().total >= 1);

  await app.close();
});
