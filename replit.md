# حاسبها

موقع عربي متجاوب لحاسبات يومية، يبدأ بحاسبات النسبة المئوية والعمر والخصم.

## Run & Operate

- The managed workflow `artifacts/hasabha: web` runs the website and supplies the preview.
- `pnpm --filter @workspace/hasabha run typecheck` — check the app's TypeScript.
- `pnpm --filter @workspace/hasabha run test` — run calculation and numeric-input tests.
- `pnpm --filter @workspace/hasabha run build` — build the site; Vite requires `PORT` and `BASE_PATH`.
- Set `VITE_PUBLIC_SITE_URL` to the site's production origin at build time to generate the sitemap, robots sitemap entry, canonical links, and page social URLs. The sitemap script also accepts `PUBLIC_SITE_URL`; use the VITE-prefixed variable for all metadata. Do not use a development preview URL.

## Stack

- pnpm workspace, React, TypeScript, Vite, Tailwind CSS, Wouter, Vitest.
- Arabic-first interface with RTL layout; calculation modules are independent of the page UI.

## Where things live

- `artifacts/hasabha/src/App.tsx` — shared site shell, route definitions, page metadata, and calculator forms.
- `artifacts/hasabha/src/lib/calculations.ts` — pure percentage, age, and discount functions.
- `artifacts/hasabha/src/lib/input.ts` — localized Arabic/Persian digit parsing and numeric validation.
- `artifacts/hasabha/src/lib/*.test.ts` — unit tests for calculations and input validation.
- `artifacts/hasabha/scripts/generate-seo.mjs` — sitemap and robots generation using the configured public origin.

## Architecture decisions

- Calculations run in the browser; this phase has no database, accounts, persistent user input, analytics, or enabled advertising.
- The available web artifact template is React + Vite, so Next.js App Router is not used in this project.
- The sitemap is generated only when a real public origin is configured; no production domain is guessed.

## Product

- Home page lists the three implemented calculators: percentage, age, and discount.
- Separate routes provide each calculator, privacy information, and contact-page copy.

## User preferences

- Keep the site Arabic-first and RTL, with responsive mobile support.
- Do not start the other seven planned calculators until the user reviews this phase and approves continuing.

## Gotchas

- Vite test runs use `vitest.config.ts`; using the Vite app config directly requires workflow variables `PORT` and `BASE_PATH`.
- A production sitemap is omitted until `PUBLIC_SITE_URL` or `VITE_PUBLIC_SITE_URL` is provided.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
