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
```

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

The API scenarios cover login, MFA, token lifecycle, customer authorization, RBAC, accounts and balances, transactions, payees, immediate and scheduled payments, statements, idempotency, validation limits, audit records, rate limiting, data seeding/cleanup, schema validation, and sensitive-value redaction.

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

Web login and Accounts Overview scenarios seed their customer through `WebDataFactory`, which submits the public ParaBank registration HTTP endpoint directly before opening the UI. The registration scenario is intentionally the exception because registration itself is the UI behavior under test; it does not perform hidden manual setup.