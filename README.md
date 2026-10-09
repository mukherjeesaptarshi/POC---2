# api-automation-anz-poc
# API Automation Guide

The API suite uses Cucumber, TypeScript, Playwright `APIRequestContext`, and the local Express mock server.

`TEST_ENV` selects the typed API environment profile. The supported values are `local`, `sit`, and `uat`; each can provide `API_<ENV>_BASE_URL`, `API_<ENV>_USER`, and `API_<ENV>_PASSWORD` variables.

## Structure

- `features/` contains business contracts grouped by capability.
- `steps/` contains thin Gherkin bindings.
- `services/` contains endpoint clients built on the shared `core/ApiClient`.
- `models/` contains strict Zod response contracts.
- `support/world.ts` owns one request context and scenario state.
- `mock-server/server.js` provides deterministic local contracts for authentication, accounts, payments, scheduled payments, statements, payees, and authorization.

## Run locally

```powershell
npm run test
```

Useful focused tags:

```powershell
npm run test:api -- --tags @smoke
npm run test:api -- --tags @rbac
npm run test:api -- --tags @scheduled-payments
npm run test:api -- --tags @statements
npm run test:api -- --tags @quality
npm test -- --tags "@npp"
```

The NPP/PayID mock endpoint accepts `X-Mock-NPP-Outcome: SETTLED`, `FAILED`, or `TIMEOUT` for deterministic response simulation. Settled payments debit the source account; failed and timed-out payments do not.

## Consolidated reports

Build or refresh the local report with:

```powershell
npm run report:consolidate
```

The report is written to `reports/consolidated-report.html`. It combines API Cucumber, web Cucumber, and Playwright JSON results, including pass/fail/flaky counts and execution duration. The rolling history is limited to the latest 10 days and stored in `reports/consolidated-history.json`; CI publishes the HTML and history as a 10-day artifact. CI also fails tests that only pass after a retry, keeping flaky results visible.

## Test reliability

UI assertions use Playwright's locator auto-waits; token-expiry coverage polls a protected endpoint until the expected `401`. Browser navigation and customer seeding use bounded retries for transient failures, and API retries honor `Retry-After`. The suites contain no fixed test sleeps. Cucumber teardown closes request contexts, browser contexts, and browsers through `finally` cleanup; the API runner waits for mock-server shutdown.

The default `npm run test` Cucumber profile is restricted to `@api` scenarios; browser scenarios run through the separate Playwright and web-Cucumber commands.

For a four-way local split:

```powershell
$env:API_BASE_URL = "http://localhost:4010"
$env:API_SHARD_COUNT = "4"
1..4 | ForEach-Object { $env:API_SHARD_INDEX = "$_"; npm run test:api:shard }
```

Run the API mock and tests in Docker:

```powershell
docker compose -f docker-compose.api.yml up --build --abort-on-container-exit --exit-code-from api-tests
```

Copy `.env.example` to `.env` for local settings. Never commit real environment credentials. CI uses repository or organisation secrets for deployed environment values and runs Gitleaks as a separate job.

## Coverage contract

The API scenarios cover login, MFA, token lifecycle, customer authorization, RBAC, accounts and balances, transactions, payees, immediate, real-time NPP/PayID, and scheduled payments, statements, idempotency, validation limits, audit records, rate limiting, data seeding/cleanup, schema validation, and sensitive-value redaction.

Each Cucumber scenario receives a new request context and World. Tests that create seeded data register cleanup through the data-factory steps so failures do not leave test customers behind.

The local mock server is a contract test double. It validates the automation framework and API expectations; it is not a substitute for contract tests against a deployed banking service.

## Web smoke pack

The Playwright web layer uses page objects for Login, Registration, and Accounts Overview. It covers registration with automatic login, valid login, invalid login, and blank credentials.

Set `WEB_BASE_URL` or `PARABANK_BASE_URL` in `.env` to select the target. The default is the public ParaBank demo application.

Install the browser once, then run the smoke pack:

```powershell
npx playwright install chromium
npm run test:web:smoke
```

The CI job runs the same Chromium smoke pack on every push and pull request and uploads the HTML report and failure artifacts.

The equivalent Cucumber BDD suite can be run with:

```powershell
npm run test:web:bdd
```

For Cucumber web runs, install the browser channels and run all three browsers concurrently:

```powershell
npx playwright install chrome msedge firefox
npm run bdd:web:all
```

Pass Cucumber options through to all browser runs, for example `npm run bdd:web:all -- --tags "@loans"`. Run one browser with `npm run bdd:web:chrome`, `npm run bdd:web:firefox`, or `npm run bdd:web:edge`. Each browser writes its own HTML and JSON report under `reports/`.

## Accessibility audits

Run the login, registration, and customer lookup WCAG A/AA scans with:

```powershell
npm run bdd:web:accessibility
```

To scan in all three browser channels, use `npm run bdd:web:all -- --tags "@accessibility"`. Each page audit writes HTML, JSON, and text violation reports under `reports/accessibility/<browser>/`. Findings are recorded without failing the run by default; set `$env:ACCESSIBILITY_FAIL_ON_VIOLATIONS = "true"` in PowerShell to fail scenarios that find violations.

Web login and Accounts Overview scenarios seed their customer through `WebDataFactory`, which submits the public ParaBank registration HTTP endpoint directly before opening the UI. The registration scenario is intentionally the exception because registration itself is the UI behavior under test; it does not perform hidden manual setup.