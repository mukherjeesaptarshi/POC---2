import {
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  statSync,
  writeFileSync,
} from "node:fs";
import path from "node:path";

type SuiteSummary = {
  key: string;
  runId: string;
  suite: string;
  executedAt: string;
  total: number;
  passed: number;
  failed: number;
  skipped: number;
  flaky: number;
  durationMs: number;
  source: string;
};

type CucumberStep = { result?: { status?: string; duration?: number } };
type CucumberScenario = {
  type?: string;
  keyword?: string;
  steps?: CucumberStep[];
};
type CucumberFeature = { elements?: CucumberScenario[] };

const reportsDirectory = path.resolve(process.cwd(), "reports");
const historyPath = path.join(reportsDirectory, "consolidated-history.json");
const htmlPath = path.join(reportsDirectory, "consolidated-report.html");
const historyDays = 10;
const currentRunId = process.env.REPORT_RUN_ID;
const browserNames = ["chrome", "chromium", "firefox", "edge"];
const runIdSuffix = (process.env.REPORT_RUN_ID || "").replace(
  /[^a-zA-Z0-9_-]/g,
  "-",
);

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

function findJsonFiles(directory: string): string[] {
  if (!existsSync(directory)) return [];
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = path.join(directory, entry.name);
    return entry.isDirectory()
      ? findJsonFiles(entryPath)
      : entry.isFile() && entry.name.endsWith(".json")
        ? [entryPath]
        : [];
  });
}

function identifyReport(filePath: string): { suite: string; runId: string } | undefined {
  const fileName = path.basename(filePath);
  const apiMatch = fileName.match(/^api-cucumber-(.+)\.json$/);
  if (apiMatch) return { suite: "API Cucumber", runId: apiMatch[1] };

  const playwrightMatch = fileName.match(/^playwright-(.+)\.json$/);
  if (playwrightMatch)
    return { suite: "Playwright", runId: playwrightMatch[1] };

  for (const browser of browserNames) {
    const webMatch = fileName.match(
      new RegExp(`^web-cucumber-${browser}-(.+)\\.json$`),
    );
    if (webMatch)
      return { suite: `Web Cucumber (${browser})`, runId: webMatch[1] };
  }

  const legacyWebMatch = fileName.match(
    /^web-cucumber-report(?:-(chrome|chromium|firefox|edge))?\.json$/,
  );
  if (legacyWebMatch) {
    const browser = legacyWebMatch[1] ?? "chromium";
    return {
      suite: `Web Cucumber (${browser})`,
      runId: `legacy-${Math.trunc(statSync(filePath).mtimeMs)}`,
    };
  }
  return undefined;
}

function parseCucumber(filePath: string, suite: string, runId: string): SuiteSummary {
  const features = JSON.parse(readFileSync(filePath, "utf8")) as CucumberFeature[];
  const scenarios = features.flatMap((feature) =>
    (feature.elements ?? []).filter(
      (element) =>
        element.type === "scenario" || /scenario/i.test(element.keyword ?? ""),
    ),
  );
  let passed = 0;
  let failed = 0;
  let skipped = 0;
  let durationNs = 0;

  for (const scenario of scenarios) {
    const results = (scenario.steps ?? []).map((step) => step.result);
    const statuses = results.map((result) => result?.status ?? "unknown");
    durationNs += results.reduce(
      (total, result) => total + (result?.duration ?? 0),
      0,
    );
    if (statuses.some((status) => !["passed", "skipped"].includes(status))) {
      failed += 1;
    } else if (statuses.length > 0 && statuses.every((status) => status === "skipped")) {
      skipped += 1;
    } else {
      passed += 1;
    }
  }

  return {
    key: `${suite}:${runId}`,
    runId,
    suite,
    executedAt: statSync(filePath).mtime.toISOString(),
    total: scenarios.length,
    passed,
    failed,
    skipped,
    flaky: 0,
    durationMs: durationNs / 1_000_000,
    source: path.relative(reportsDirectory, filePath),
  };
}

function parsePlaywright(filePath: string, suite: string, runId: string): SuiteSummary {
  const report = JSON.parse(readFileSync(filePath, "utf8")) as {
    stats?: {
      startTime?: string;
      duration?: number;
      expected?: number;
      unexpected?: number;
      skipped?: number;
      flaky?: number;
    };
  };
  const stats = report.stats ?? {};
  const passed = stats.expected ?? 0;
  const failed = stats.unexpected ?? 0;
  const skipped = stats.skipped ?? 0;
  const flaky = stats.flaky ?? 0;

  return {
    key: `${suite}:${runId}`,
    runId,
    suite,
    executedAt: stats.startTime ?? statSync(filePath).mtime.toISOString(),
    total: passed + failed + skipped + flaky,
    passed,
    failed,
    skipped,
    flaky,
    durationMs: stats.duration ?? 0,
    source: path.relative(reportsDirectory, filePath),
  };
}

function loadCurrentRuns(): SuiteSummary[] {
  const jsonFiles = findJsonFiles(reportsDirectory);
  const identifiedReports = jsonFiles.flatMap((filePath) => {
    const report = identifyReport(filePath);
    return report ? [{ filePath, report }] : [];
  });
  const runScopedSuites = new Set(
    identifiedReports
      .filter(({ report }) => !report.runId.startsWith("legacy-"))
      .map(({ report }) => report.suite),
  );

  return identifiedReports.flatMap(({ filePath, report }) => {
    if (currentRunId && report.runId !== runIdSuffix) return [];
    if (
      report.runId.startsWith("legacy-") &&
      runScopedSuites.has(report.suite)
    )
      return [];
    if (statSync(filePath).size === 0) return [];
    try {
      return [
        report.suite === "Playwright"
          ? parsePlaywright(filePath, report.suite, report.runId)
          : parseCucumber(filePath, report.suite, report.runId),
      ];
    } catch (error) {
      console.warn(`Skipping invalid report ${filePath}:`, error);
      return [];
    }
  });
}

function loadHistory(): SuiteSummary[] {
  if (!existsSync(historyPath)) return [];
  try {
    const history = JSON.parse(readFileSync(historyPath, "utf8")) as {
      summaries?: SuiteSummary[];
    };
    return history.summaries ?? [];
  } catch {
    return [];
  }
}

function formatDuration(durationMs: number): string {
  if (durationMs < 1000) return `${Math.round(durationMs)} ms`;
  const seconds = durationMs / 1000;
  if (seconds < 60) return `${seconds.toFixed(1)} s`;
  return `${Math.floor(seconds / 60)} m ${(seconds % 60).toFixed(0)} s`;
}

function buildHtml(summaries: SuiteSummary[], generatedAt: string): string {
  const daily = new Map<
    string,
    { total: number; passed: number; failed: number; skipped: number; flaky: number }
  >();
  for (const summary of summaries) {
    const day = summary.executedAt.slice(0, 10);
    const totals = daily.get(day) ?? {
      total: 0,
      passed: 0,
      failed: 0,
      skipped: 0,
      flaky: 0,
    };
    totals.total += summary.total;
    totals.passed += summary.passed;
    totals.failed += summary.failed;
    totals.skipped += summary.skipped;
    totals.flaky += summary.flaky;
    daily.set(day, totals);
  }

  const overall = summaries.reduce(
    (totals, summary) => ({
      total: totals.total + summary.total,
      passed: totals.passed + summary.passed,
      failed: totals.failed + summary.failed,
      skipped: totals.skipped + summary.skipped,
      flaky: totals.flaky + summary.flaky,
      durationMs: totals.durationMs + summary.durationMs,
    }),
    { total: 0, passed: 0, failed: 0, skipped: 0, flaky: 0, durationMs: 0 },
  );
  const maxTotal = Math.max(1, ...[...daily.values()].map((day) => day.total));
  const trendRows = [...daily.entries()]
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([day, totals]) => {
      const passedWidth = (totals.passed / maxTotal) * 100;
      const failedWidth = (totals.failed / maxTotal) * 100;
      const flakyWidth = (totals.flaky / maxTotal) * 100;
      return `<tr>
        <th scope="row">${escapeHtml(day)}</th>
        <td>${totals.passed}</td><td>${totals.failed}</td><td>${totals.flaky}</td><td>${totals.skipped}</td>
        <td><div class="bar" aria-label="${totals.passed} passed, ${totals.failed} failed, ${totals.flaky} flaky">
          <span class="passed" style="width:${passedWidth}%"></span><span class="failed" style="width:${failedWidth}%"></span><span class="flaky" style="width:${flakyWidth}%"></span>
        </div></td>
      </tr>`;
    })
    .join("");
  const suiteRows = [...summaries]
    .sort((left, right) => right.executedAt.localeCompare(left.executedAt))
    .map(
      (summary) => `<tr>
        <td>${escapeHtml(summary.executedAt.replace("T", " ").slice(0, 19))}</td>
        <td>${escapeHtml(summary.suite)}</td><td>${escapeHtml(summary.runId)}</td>
        <td>${summary.passed}</td><td>${summary.failed}</td><td>${summary.flaky}</td><td>${summary.skipped}</td>
        <td>${formatDuration(summary.durationMs)}</td><td>${escapeHtml(summary.source)}</td>
      </tr>`,
    )
    .join("");

  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Consolidated automation report</title>
<style>
  :root { color-scheme: light; font-family: Segoe UI, Arial, sans-serif; color: #20252b; background: #f4f6f8; }
  body { margin: 0; padding: 28px; }
  main { max-width: 1440px; margin: 0 auto; }
  h1 { margin: 0 0 6px; font-size: 28px; }
  h2 { margin-top: 30px; font-size: 19px; }
  .muted { color: #59636e; }
  .summary { display: grid; grid-template-columns: repeat(6, minmax(120px, 1fr)); gap: 12px; margin-top: 24px; }
  .metric { background: #fff; border: 1px solid #d7dce1; border-radius: 6px; padding: 14px; }
  .metric span { display: block; color: #59636e; font-size: 13px; }
  .metric strong { display: block; margin-top: 6px; font-size: 22px; }
  .panel { overflow-x: auto; background: #fff; border: 1px solid #d7dce1; border-radius: 6px; }
  table { width: 100%; border-collapse: collapse; font-size: 13px; }
  th, td { padding: 10px 12px; border-bottom: 1px solid #e5e8eb; text-align: left; white-space: nowrap; }
  thead { background: #eaf0f3; }
  .bar { display: flex; min-width: 140px; height: 12px; overflow: hidden; border-radius: 3px; background: #e6e9ec; }
  .passed { background: #20825b; }.failed { background: #c64343; }.flaky { background: #d78b17; }
  @media (max-width: 850px) { body { padding: 16px; }.summary { grid-template-columns: repeat(2, minmax(120px, 1fr)); } }
</style></head><body><main>
  <h1>Consolidated automation report</h1>
  <p class="muted">Rolling ${historyDays}-day suite history. Generated ${escapeHtml(generatedAt)}.</p>
  <section class="summary" aria-label="Ten day totals">
    <div class="metric"><span>Test cases</span><strong>${overall.total}</strong></div>
    <div class="metric"><span>Passed</span><strong>${overall.passed}</strong></div>
    <div class="metric"><span>Failed</span><strong>${overall.failed}</strong></div>
    <div class="metric"><span>Flaky</span><strong>${overall.flaky}</strong></div>
    <div class="metric"><span>Skipped</span><strong>${overall.skipped}</strong></div>
    <div class="metric"><span>Suite runtime</span><strong>${formatDuration(overall.durationMs)}</strong></div>
  </section>
  <h2>Daily pass/fail trend</h2>
  <div class="panel"><table><thead><tr><th>Date</th><th>Passed</th><th>Failed</th><th>Flaky</th><th>Skipped</th><th>Trend</th></tr></thead>
    <tbody>${trendRows || '<tr><td colspan="6">No suite reports found for this period.</td></tr>'}</tbody></table></div>
  <h2>Suite executions</h2>
  <div class="panel"><table><thead><tr><th>Executed</th><th>Suite</th><th>Run</th><th>Passed</th><th>Failed</th><th>Flaky</th><th>Skipped</th><th>Duration</th><th>Source</th></tr></thead>
    <tbody>${suiteRows || '<tr><td colspan="9">No suite reports found for this period.</td></tr>'}</tbody></table></div>
</main></body></html>`;
}

mkdirSync(reportsDirectory, { recursive: true });
const cutoff = Date.now() - historyDays * 24 * 60 * 60 * 1000;
const history = loadHistory();
const summariesByKey = new Map(history.map((summary) => [summary.key, summary]));
for (const summary of loadCurrentRuns()) {
  const executedAt = new Date(summary.executedAt).getTime();
  if (executedAt >= cutoff) summariesByKey.set(summary.key, summary);
}

const summaries = [...summariesByKey.values()]
  .filter((summary) => new Date(summary.executedAt).getTime() >= cutoff)
  .sort((left, right) => left.executedAt.localeCompare(right.executedAt));
const generatedAt = new Date().toISOString();
writeFileSync(
  historyPath,
  `${JSON.stringify({ generatedAt, historyDays, summaries }, null, 2)}\n`,
);
writeFileSync(htmlPath, buildHtml(summaries, generatedAt));
console.log(`Consolidated ${summaries.length} suite execution(s) from the last ${historyDays} days.`);
console.log(`HTML report: ${htmlPath}`);