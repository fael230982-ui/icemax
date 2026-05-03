import { spawnSync } from "node:child_process";
import { mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { basename, dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const docsDir = join(root, "docs");
const pdfDir = join(root, "docs-pdf");
const tempDir = join(root, ".tmp-doc-pdf");

const chromeCandidates = [
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
  "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
];

const chrome = chromeCandidates.find((candidate) => {
  try {
    readFileSync(candidate);
    return true;
  } catch {
    return false;
  }
});

if (!chrome) {
  throw new Error("Chrome ou Edge nao encontrado para gerar PDFs.");
}

mkdirSync(pdfDir, { recursive: true });
mkdirSync(tempDir, { recursive: true });

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function inlineMarkdown(text) {
  return escapeHtml(text)
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
}

function markdownToHtml(markdown) {
  const lines = markdown.split(/\r?\n/);
  const output = [];
  let inList = false;
  let inCode = false;
  let codeLines = [];

  function closeList() {
    if (inList) {
      output.push("</ul>");
      inList = false;
    }
  }

  for (const line of lines) {
    if (line.startsWith("```")) {
      if (inCode) {
        output.push(`<pre><code>${escapeHtml(codeLines.join("\n"))}</code></pre>`);
        codeLines = [];
        inCode = false;
      } else {
        closeList();
        inCode = true;
      }
      continue;
    }

    if (inCode) {
      codeLines.push(line);
      continue;
    }

    if (line.startsWith("# ")) {
      closeList();
      output.push(`<h1>${inlineMarkdown(line.slice(2))}</h1>`);
      continue;
    }

    if (line.startsWith("## ")) {
      closeList();
      output.push(`<h2>${inlineMarkdown(line.slice(3))}</h2>`);
      continue;
    }

    if (line.startsWith("### ")) {
      closeList();
      output.push(`<h3>${inlineMarkdown(line.slice(4))}</h3>`);
      continue;
    }

    if (line.startsWith("- ")) {
      if (!inList) {
        output.push("<ul>");
        inList = true;
      }
      output.push(`<li>${inlineMarkdown(line.slice(2))}</li>`);
      continue;
    }

    if (!line.trim()) {
      closeList();
      continue;
    }

    closeList();
    output.push(`<p>${inlineMarkdown(line)}</p>`);
  }

  closeList();
  return output.join("\n");
}

function wrapHtml(title, body) {
  return `<!doctype html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8">
  <title>${escapeHtml(title)}</title>
  <style>
    @page { margin: 18mm; }
    body { color: #102033; font-family: Arial, sans-serif; line-height: 1.45; }
    h1 { color: #06243A; font-size: 26px; margin: 0 0 18px; }
    h2 { color: #0B7CEB; font-size: 19px; margin: 22px 0 8px; }
    h3 { color: #102033; font-size: 15px; margin: 16px 0 6px; }
    p { margin: 7px 0; }
    ul { margin: 7px 0 12px 20px; padding: 0; }
    li { margin: 4px 0; }
    code { background: #eef5fa; border-radius: 4px; padding: 1px 4px; }
    pre { background: #eef5fa; border-radius: 8px; padding: 12px; white-space: pre-wrap; }
  </style>
</head>
<body>${body}</body>
</html>`;
}

const docs = readdirSync(docsDir).filter((file) => file.endsWith(".md")).sort();

for (const doc of docs) {
  const source = join(docsDir, doc);
  const name = basename(doc, ".md");
  const htmlPath = join(tempDir, `${name}.html`);
  const pdfPath = join(pdfDir, `${name}.pdf`);
  const markdown = readFileSync(source, "utf8");
  const html = wrapHtml(name, markdownToHtml(markdown));

  writeFileSync(htmlPath, html, "utf8");

  const result = spawnSync(chrome, [
    "--headless=new",
    "--disable-gpu",
    `--print-to-pdf=${pdfPath}`,
    pathToFileURL(htmlPath).href,
  ], {
    stdio: "pipe",
  });

  if (result.status !== 0) {
    throw new Error(`Falha ao gerar PDF ${pdfPath}: ${result.stderr.toString()}`);
  }
}

rmSync(tempDir, { recursive: true, force: true });
console.log(`PDFs gerados em ${pdfDir}`);
