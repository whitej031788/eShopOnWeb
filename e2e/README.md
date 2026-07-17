# eShopOnWeb — Playwright E2E tests

UI tests for the storefront (`http://localhost:5106`) plus API smoke tests for
the PublicApi (`http://localhost:5200`). Paired with `../openapi.yaml` to feed
**Postman Application Inventory** — the Playwright specs are the UI half, the
OpenAPI spec / Postman collection is the API half.

## Prerequisites

1. **The app must be running.** From the repo root:
   ```bash
   docker compose up -d
   ```
   Confirm the storefront responds at http://localhost:5106 and the API at
   http://localhost:5200/api/catalog-items.
2. **Node.js** (v18+). Check with `node --version`.

## Install (first time only)

```bash
cd e2e
npm install                 # installs @playwright/test
npx playwright install      # downloads the browser binaries (Chromium)
```

## Run the tests

All commands are npm scripts defined in `package.json`, run from the `e2e/` folder:

| Command | What it does |
|---|---|
| `npm test` | Run the whole suite headless (default) |
| `npm run test:headed` | Run in a visible browser window |
| `npm run test:ui` | Open the Playwright UI mode (watch / debug) |
| `npm run report` | Open the HTML report from the last run |
| `npm run codegen` | Launch the recorder against the storefront |

Examples:

```bash
cd e2e
npm test                                  # everything
npm test -- tests/checkout.spec.ts        # a single file
npm test -- -g "log in"                   # tests matching a title
npm test -- --project=chromium --headed   # headed Chromium only
```

> Anything after `--` is passed straight through to `playwright test`, so you can
> use any Playwright CLI flag with the npm script.

## Point at different URLs

The base URLs default to the Docker ports but can be overridden:

```bash
BASE_URL=http://localhost:5106 API_BASE_URL=http://localhost:5200 npm test
```

## What's covered

| Spec | Area |
|---|---|
| `tests/home.spec.ts` | Home/catalog renders, products, filters present |
| `tests/catalog-filter.spec.ts` | Filtering the catalog by brand |
| `tests/basket.spec.ts` | Guest add-to-basket, edit quantity |
| `tests/login.spec.ts` | Seeded-user login + invalid credentials |
| `tests/checkout.spec.ts` | Full logged-in checkout → order success |
| `tests/api.spec.ts` | PublicApi catalog list, brands/types, JWT auth |

Seeded demo accounts (see `src/Web/Areas/Identity/Pages/Account/Login.cshtml`):
`demouser@microsoft.com` and `admin@microsoft.com`, password `Pass@word1`.
