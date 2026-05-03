import { saveLocalFile } from "./storage-service";

type QrLabel = {
  id: string;
  equipmentCode: string;
  equipment: string;
  customer: string;
  installLocation: string;
  qrPayload: string;
};

function hashPayload(payload: string) {
  return Array.from(payload).reduce((hash, char) => (hash * 31 + char.charCodeAt(0)) >>> 0, 2166136261);
}

function buildPseudoQrCells(payload: string) {
  const size = 21;
  let hash = hashPayload(payload);
  const cells: Array<{ x: number; y: number }> = [];

  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const finder =
        (x < 7 && y < 7) ||
        (x > 13 && y < 7) ||
        (x < 7 && y > 13);
      hash = (hash * 1664525 + 1013904223) >>> 0;
      if (finder || hash % 3 === 0) {
        cells.push({ x, y });
      }
    }
  }

  return cells;
}

function escapeXml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

export function renderQrLabelSvg(label: QrLabel) {
  const cells = buildPseudoQrCells(label.qrPayload);
  const cellMarkup = cells
    .map((cell) => `<rect x="${cell.x * 8}" y="${cell.y * 8}" width="8" height="8" />`)
    .join("");
  const equipmentCode = escapeXml(label.equipmentCode);
  const equipment = escapeXml(label.equipment);
  const customer = escapeXml(label.customer);
  const installLocation = escapeXml(label.installLocation);
  const qrPayload = escapeXml(label.qrPayload);

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="420" height="260" viewBox="0 0 420 260" role="img" aria-label="Etiqueta ${equipmentCode}">
  <rect width="420" height="260" rx="14" fill="#ffffff" stroke="#0b7ceb" stroke-width="3" />
  <text x="24" y="36" fill="#06243a" font-family="Arial, sans-serif" font-size="22" font-weight="700">ICEMAX</text>
  <text x="24" y="62" fill="#5d6b7a" font-family="Arial, sans-serif" font-size="12">Ordem de servico e manutencao</text>
  <g transform="translate(24 78)" fill="#102033">${cellMarkup}</g>
  <text x="210" y="94" fill="#06243a" font-family="Arial, sans-serif" font-size="20" font-weight="700">${equipmentCode}</text>
  <text x="210" y="126" fill="#102033" font-family="Arial, sans-serif" font-size="15">${equipment}</text>
  <text x="210" y="154" fill="#102033" font-family="Arial, sans-serif" font-size="15">${customer}</text>
  <text x="210" y="182" fill="#5d6b7a" font-family="Arial, sans-serif" font-size="14">${installLocation}</text>
  <text x="24" y="232" fill="#5d6b7a" font-family="Arial, sans-serif" font-size="11">${qrPayload}</text>
</svg>`;
}

export async function saveQrLabelSvg(label: QrLabel) {
  return saveLocalFile({
    folder: "qr-labels",
    fileName: `${label.equipmentCode.replace(/[^\w.-]/g, "-")}.svg`,
    content: renderQrLabelSvg(label),
  });
}
