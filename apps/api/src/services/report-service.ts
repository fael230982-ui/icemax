import { saveLocalFile } from "./storage-service";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { spawnSync } from "node:child_process";

export type ServiceOrderReportInput = {
  order: {
    id: string;
    title: string;
    description?: string | null;
    status?: string | null;
    customerSignedName?: string | null;
  };
  customer?: {
    name?: string | null;
    email?: string | null;
    phone?: string | null;
  } | null;
  equipment?: {
    brand?: string | null;
    model?: string | null;
    serialNumber?: string | null;
    installationLocation?: string | null;
  } | null;
  notes?: Array<{ rawText?: string | null; improvedText?: string | null }>;
  photos?: Array<{ type: string; fileUrl: string; caption?: string | null }>;
  parts?: Array<{ quantity: unknown; part?: { name?: string | null; unit?: string | null } | null }>;
};

function escapeHtml(value: unknown) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

export function renderServiceOrderReportHtml(input: ServiceOrderReportInput) {
  const notes = input.notes?.map((note) => `<li>${escapeHtml(note.improvedText || note.rawText)}</li>`).join("") || "<li>Nenhuma nota registrada.</li>";
  const photos = input.photos?.map((photo) => `<li>${escapeHtml(photo.type)} - ${escapeHtml(photo.caption || photo.fileUrl)}</li>`).join("") || "<li>Nenhuma foto registrada.</li>";
  const parts = input.parts?.map((part) => `<li>${escapeHtml(part.part?.name || "Peca")} - ${escapeHtml(part.quantity)} ${escapeHtml(part.part?.unit || "un")}</li>`).join("") || "<li>Nenhuma peca registrada.</li>";

  return `<!doctype html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8">
  <title>Relatorio OS ${escapeHtml(input.order.id)}</title>
  <style>
    body { color: #102033; font-family: Arial, sans-serif; line-height: 1.45; margin: 32px; }
    header { border-bottom: 3px solid #0B7CEB; margin-bottom: 22px; padding-bottom: 14px; }
    h1 { color: #06243A; margin: 0 0 4px; }
    h2 { color: #0B7CEB; font-size: 18px; margin-top: 22px; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
    .box { border: 1px solid #DCE7F0; border-radius: 8px; padding: 12px; }
    small { color: #5D6B7A; display: block; }
  </style>
</head>
<body>
  <header>
    <h1>Relatorio de Ordem de Servico</h1>
    <strong>OS ${escapeHtml(input.order.id)} - ${escapeHtml(input.order.title)}</strong>
    <small>Status: ${escapeHtml(input.order.status)}</small>
  </header>
  <section class="grid">
    <div class="box">
      <h2>Cliente</h2>
      <p><strong>${escapeHtml(input.customer?.name)}</strong></p>
      <p>${escapeHtml(input.customer?.email)}<br>${escapeHtml(input.customer?.phone)}</p>
    </div>
    <div class="box">
      <h2>Equipamento</h2>
      <p>${escapeHtml(input.equipment?.brand)} ${escapeHtml(input.equipment?.model)}</p>
      <p>Serie: ${escapeHtml(input.equipment?.serialNumber)}<br>Local: ${escapeHtml(input.equipment?.installationLocation)}</p>
    </div>
  </section>
  <h2>Descricao</h2>
  <p>${escapeHtml(input.order.description)}</p>
  <h2>Notas Tecnicas</h2>
  <ul>${notes}</ul>
  <h2>Pecas Utilizadas</h2>
  <ul>${parts}</ul>
  <h2>Fotos</h2>
  <ul>${photos}</ul>
  <h2>Assinatura</h2>
  <p>Cliente: ${escapeHtml(input.order.customerSignedName || "Pendente")}</p>
</body>
</html>`;
}

export async function saveServiceOrderReportHtml(orderId: string, input: ServiceOrderReportInput) {
  return saveLocalFile({
    folder: "reports",
    fileName: `os-${orderId}.html`,
    content: renderServiceOrderReportHtml(input),
  });
}

function findChrome() {
  const candidates = [
    "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
    "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
    "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
  ];

  return candidates.find((candidate) => existsSync(candidate));
}

export async function saveServiceOrderReportPdf(orderId: string, input: ServiceOrderReportInput) {
  const chrome = findChrome();

  if (!chrome) {
    return saveServiceOrderReportHtml(orderId, input);
  }

  const html = renderServiceOrderReportHtml(input);
  const tempDir = await mkdtemp(join(tmpdir(), "icemax-report-"));
  const htmlPath = join(tempDir, `os-${orderId}.html`);
  const pdfFileName = `os-${orderId}.pdf`;
  const pdf = await saveLocalFile({
    folder: "reports",
    fileName: pdfFileName,
    content: "",
  });

  await writeFile(htmlPath, html, "utf8");

  const result = spawnSync(chrome, [
    "--headless=new",
    "--disable-gpu",
    `--print-to-pdf=${pdf.path}`,
    pathToFileURL(htmlPath).href,
  ]);

  await rm(tempDir, { recursive: true, force: true });

  if (result.status !== 0) {
    return saveServiceOrderReportHtml(orderId, input);
  }

  return pdf;
}
