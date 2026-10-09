import AxeBuilder from "@axe-core/playwright";
import type { Page } from "@playwright/test";
import { randomUUID } from "node:crypto";
import { mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

export interface AccessibilityAuditArtifacts {
  violationCount: number;
  jsonPath: string;
  htmlPath: string;
  logPath: string;
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => {
    const entities: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };
    return entities[character];
  });
}

export async function auditAccessibility(
  page: Page,
  browserName: string,
): Promise<AccessibilityAuditArtifacts> {
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    .analyze();
  const url = page.url();
  const browser = browserName.toLowerCase().replace(/[^a-z0-9-]/g, "-");
  const pageName = new URL(url).pathname.replace(/[^a-z0-9]+/gi, "-") || "page";
  const outputDirectory = resolve(process.cwd(), "reports", "accessibility", browser);
  const fileBase = `${pageName}-${Date.now()}-${randomUUID()}`;
  const jsonPath = resolve(outputDirectory, `${fileBase}.json`);
  const htmlPath = resolve(outputDirectory, `${fileBase}.html`);
  const logPath = resolve(outputDirectory, `${fileBase}.log`);

  mkdirSync(outputDirectory, { recursive: true });
  writeFileSync(jsonPath, JSON.stringify(results, null, 2));

  const violationSections = results.violations
    .map((violation) => {
      const nodes = violation.nodes
        .map(
          (node) => `<li>
            <p><strong>Target:</strong> ${escapeHtml(node.target.join(", "))}</p>
            <pre>${escapeHtml(node.failureSummary ?? node.html)}</pre>
          </li>`,
        )
        .join("");
      return `<section>
        <h2>${escapeHtml(violation.id)} (${escapeHtml(violation.impact ?? "unknown")})</h2>
        <p>${escapeHtml(violation.help)}</p>
        <p>${escapeHtml(violation.description)}</p>
        <p><a href="${escapeHtml(violation.helpUrl)}">More information</a></p>
        <ul>${nodes}</ul>
      </section>`;
    })
    .join("");
  const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Accessibility audit: ${escapeHtml(url)}</title>
  <style>
    body { font: 16px/1.5 system-ui, sans-serif; margin: 2rem auto; max-width: 72rem; padding: 0 1rem; color: #202124; }
    section { border-top: 1px solid #bbb; padding: 1rem 0; }
    pre { overflow-wrap: anywhere; white-space: pre-wrap; background: #f2f3f4; padding: .75rem; }
  </style>
</head>
<body>
  <h1>Accessibility audit</h1>
  <p><strong>URL:</strong> ${escapeHtml(url)}</p>
  <p><strong>Browser:</strong> ${escapeHtml(browserName)}</p>
  <p><strong>Violations:</strong> ${results.violations.length}</p>
  ${violationSections || "<p>No WCAG A/AA violations found.</p>"}
</body>
</html>`;
  writeFileSync(htmlPath, html);

  const logLines = [
    `Accessibility audit for ${url}`,
    `Browser: ${browserName}`,
    `Violations: ${results.violations.length}`,
    ...results.violations.flatMap((violation) => [
      `- [${violation.impact ?? "unknown"}] ${violation.id}: ${violation.help}`,
      ...violation.nodes.map(
        (node) => `  Target: ${node.target.join(", ")}\n  ${node.failureSummary ?? node.html}`,
      ),
    ]),
    "",
    `JSON report: ${jsonPath}`,
    `HTML report: ${htmlPath}`,
  ];
  writeFileSync(logPath, logLines.join("\n"));
  console.log(logLines.join("\n"));

  return {
    violationCount: results.violations.length,
    jsonPath,
    htmlPath,
    logPath,
  };
}